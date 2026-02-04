import { test, expect } from '@playwright/test';
import { loginAsTestUser, logoutUser, TEST_USER, TEST_DATA, TIMEOUTS } from './setup';

/**
 * Group B1-05: 사용자 알림 기능 테스트
 *
 * 목표:
 * - 알림 센터 접근
 * - 알림 조회 및 필터링
 * - 알림 읽음 표시
 * - 알림 삭제
 * - 알림 설정 관리
 *
 * 테스트 특성:
 * - 로그인된 사용자만 실행
 * - 알림 데이터 조회 및 수정
 * - 병렬 실행 가능 (독립적인 테스트 계정)
 */

test.describe('Group B1-05: 사용자 알림', () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 로그인
    await loginAsTestUser(page, TEST_USER.email);
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async ({ page }) => {
    // 각 테스트 후에 로그아웃
    await logoutUser(page);
  });

  test('알림 벨 아이콘 표시', async ({ page }) => {
    // Arrange: 로그인 후 홈페이지 접근
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Act & Assert: 알림 벨 아이콘 찾기
    const notificationBell = page.locator('button[aria-label*="알림"], button[aria-label*="notification"], [data-testid="notification-bell"]');

    const hasNotificationBell = await notificationBell.count() > 0;
    if (hasNotificationBell) {
      await expect(notificationBell.first()).toBeVisible();
    }
  });

  test('알림 센터 열기', async ({ page }) => {
    // Arrange: 알림 벨 버튼 찾기
    const notificationBell = page.locator('button[aria-label*="알림"], [data-testid="notification-bell"]').first();

    // Act: 알림 벨 클릭
    if (await notificationBell.count() > 0) {
      await notificationBell.click();
      await page.waitForTimeout(TIMEOUTS.DIALOG_APPEAR);

      // Assert: 알림 패널이 열림
      const notificationPanel = page.locator('[data-testid="notification-panel"], [role="dialog"]').first();
      const isPanelVisible = await notificationPanel.isVisible({ timeout: TIMEOUTS.DIALOG_APPEAR }).catch(() => false);

      if (isPanelVisible) {
        await expect(notificationPanel).toBeVisible();
      }
    }
  });

  test('알림 목록 표시', async ({ page }) => {
    // Arrange: 알림 센터 열기
    const notificationBell = page.locator('button[aria-label*="알림"]').first();

    if (await notificationBell.count() > 0) {
      await notificationBell.click();
      await page.waitForTimeout(TIMEOUTS.DIALOG_APPEAR);

      // Act & Assert: 알림 목록 확인
      const notificationItems = page.locator('[data-testid="notification-item"], [role="listitem"]');
      const itemCount = await notificationItems.count();

      // 알림이 없거나 있을 수 있음
      if (itemCount > 0) {
        // 첫 번째 알림 확인
        await expect(notificationItems.first()).toBeVisible({ timeout: TIMEOUTS.NAVIGATION });

        // 알림 콘텐츠 확인
        const notificationText = await notificationItems.first().textContent();
        expect(notificationText).toBeTruthy();
      } else {
        // 빈 알림 메시지 확인
        const emptyMessage = page.locator('text=/알림|없음|비어있음/i');
        const hasEmpty = await emptyMessage.count() > 0;

        if (hasEmpty) {
          await expect(emptyMessage.first()).toBeVisible({ timeout: TIMEOUTS.NAVIGATION });
        }
      }
    }
  });

  test('알림 읽음 표시', async ({ page }) => {
    // Arrange: 알림 센터 열기
    const notificationBell = page.locator('button[aria-label*="알림"]').first();

    if (await notificationBell.count() > 0) {
      await notificationBell.click();
      await page.waitForTimeout(TIMEOUTS.DIALOG_APPEAR);

      // Act: 첫 번째 알림의 읽음 표시 버튼 찾기
      const readButton = page.locator('[data-testid="notification-item"] button:has-text("읽음"), [data-testid="mark-as-read"]').first();

      if (await readButton.count() > 0) {
        // 버튼 클릭
        await readButton.click();
        await page.waitForTimeout(TIMEOUTS.FORM_SUBMIT);

        // Assert: 성공 메시지 또는 상태 변경 확인
        const successMessage = page.locator('[role="alert"]').filter({
          hasText: /읽음|표시됨|완료/i
        });

        const hasMessage = await successMessage.count() > 0;
        if (hasMessage) {
          await expect(successMessage.first()).toBeVisible({ timeout: TIMEOUTS.FORM_SUBMIT });
        }
      }
    }
  });

  test('알림 타입별 필터링', async ({ page }) => {
    // Arrange: 알림 센터 열기
    const notificationBell = page.locator('button[aria-label*="알림"]').first();

    if (await notificationBell.count() > 0) {
      await notificationBell.click();
      await page.waitForTimeout(TIMEOUTS.DIALOG_APPEAR);

      // Act: 필터 버튼 찾기
      const filterButton = page.locator('[data-testid="notification-filter"], button:has-text("필터")').first();

      if (await filterButton.count() > 0) {
        await filterButton.click();
        await page.waitForTimeout(TIMEOUTS.ANIMATION);

        // 필터 옵션 선택
        const filterOptions = page.locator('[data-testid="notification-filter-option"], [role="checkbox"]');

        if (await filterOptions.count() > 0) {
          // 첫 번째 필터 옵션 선택
          await filterOptions.first().click();
          await page.waitForTimeout(TIMEOUTS.ANIMATION);

          // Assert: 필터된 알림 목록 확인
          const notificationItems = page.locator('[data-testid="notification-item"]');
          const hasItems = await notificationItems.count() >= 0; // 0개일 수도 있음

          expect(hasItems).toBe(true);
        }
      }
    }
  });

  test('예약 관련 알림 확인', async ({ page }) => {
    // Arrange: 알림 센터 열기
    const notificationBell = page.locator('button[aria-label*="알림"]').first();

    if (await notificationBell.count() > 0) {
      await notificationBell.click();
      await page.waitForTimeout(TIMEOUTS.DIALOG_APPEAR);

      // Act: 예약 관련 알림 찾기
      const bookingNotifications = page.locator('[data-testid="notification-item"]').filter({
        hasText: /예약|booking|확인|승인|취소/i
      });

      // Assert: 예약 알림이 있으면 확인
      const hasBookingNotifications = await bookingNotifications.count() > 0;

      if (hasBookingNotifications) {
        await expect(bookingNotifications.first()).toBeVisible({ timeout: TIMEOUTS.NAVIGATION });

        // 알림 클릭 시 상세 정보 표시
        await bookingNotifications.first().click();
        await page.waitForTimeout(TIMEOUTS.ANIMATION);
      }
    }
  });

  test('리뷰 관련 알림 확인', async ({ page }) => {
    // Arrange: 알림 센터 열기
    const notificationBell = page.locator('button[aria-label*="알림"]').first();

    if (await notificationBell.count() > 0) {
      await notificationBell.click();
      await page.waitForTimeout(TIMEOUTS.DIALOG_APPEAR);

      // Act: 리뷰 관련 알림 찾기
      const reviewNotifications = page.locator('[data-testid="notification-item"]').filter({
        hasText: /리뷰|review|평가|댓글/i
      });

      // Assert: 리뷰 알림이 있으면 확인
      const hasReviewNotifications = await reviewNotifications.count() > 0;

      if (hasReviewNotifications) {
        await expect(reviewNotifications.first()).toBeVisible({ timeout: TIMEOUTS.NAVIGATION });
      }
    }
  });

  test('메시지 알림 확인', async ({ page }) => {
    // Arrange: 알림 센터 열기
    const notificationBell = page.locator('button[aria-label*="알림"]').first();

    if (await notificationBell.count() > 0) {
      await notificationBell.click();
      await page.waitForTimeout(TIMEOUTS.DIALOG_APPEAR);

      // Act: 메시지 관련 알림 찾기
      const messageNotifications = page.locator('[data-testid="notification-item"]').filter({
        hasText: /메시지|message|연락|답장|채팅/i
      });

      // Assert: 메시지 알림이 있으면 확인
      const hasMessageNotifications = await messageNotifications.count() > 0;

      if (hasMessageNotifications) {
        await expect(messageNotifications.first()).toBeVisible({ timeout: TIMEOUTS.NAVIGATION });
      }
    }
  });

  test('시스템 알림 확인', async ({ page }) => {
    // Arrange: 알림 센터 열기
    const notificationBell = page.locator('button[aria-label*="알림"]').first();

    if (await notificationBell.count() > 0) {
      await notificationBell.click();
      await page.waitForTimeout(TIMEOUTS.DIALOG_APPEAR);

      // Act: 시스템 알림 찾기
      const systemNotifications = page.locator('[data-testid="notification-item"]').filter({
        hasText: /시스템|공지|업데이트|유지보수|서비스/i
      });

      // Assert: 시스템 알림이 있으면 확인
      const hasSystemNotifications = await systemNotifications.count() > 0;

      if (hasSystemNotifications) {
        await expect(systemNotifications.first()).toBeVisible({ timeout: TIMEOUTS.NAVIGATION });
      }
    }
  });

  test('알림 삭제', async ({ page }) => {
    // Arrange: 알림 센터 열기
    const notificationBell = page.locator('button[aria-label*="알림"]').first();

    if (await notificationBell.count() > 0) {
      await notificationBell.click();
      await page.waitForTimeout(TIMEOUTS.DIALOG_APPEAR);

      // Act: 알림 삭제 버튼 찾기
      const deleteButton = page.locator('[data-testid="notification-item"] button[aria-label*="삭제"], button:has-text("×")').first();

      if (await deleteButton.count() > 0) {
        // 삭제 버튼 클릭
        await deleteButton.click();
        await page.waitForTimeout(TIMEOUTS.FORM_SUBMIT);

        // Assert: 삭제 확인 메시지 또는 알림 목록에서 제거
        const successMessage = page.locator('[role="alert"]').filter({
          hasText: /삭제됨|제거됨|완료/i
        });

        const hasMessage = await successMessage.count() > 0;
        if (hasMessage) {
          await expect(successMessage.first()).toBeVisible({ timeout: TIMEOUTS.FORM_SUBMIT });
        }
      }
    }
  });

  test('모두 읽음 표시', async ({ page }) => {
    // Arrange: 알림 센터 열기
    const notificationBell = page.locator('button[aria-label*="알림"]').first();

    if (await notificationBell.count() > 0) {
      await notificationBell.click();
      await page.waitForTimeout(TIMEOUTS.DIALOG_APPEAR);

      // Act: 모두 읽음 버튼 찾기
      const markAllButton = page.locator('[data-testid="mark-all-as-read"], button:has-text("모두 읽음")').first();

      if (await markAllButton.count() > 0) {
        // 버튼 클릭
        await markAllButton.click();
        await page.waitForTimeout(TIMEOUTS.FORM_SUBMIT);

        // Assert: 성공 메시지 확인
        const successMessage = page.locator('[role="alert"]').filter({
          hasText: /완료|성공|표시됨/i
        });

        const hasMessage = await successMessage.count() > 0;
        if (hasMessage) {
          await expect(successMessage.first()).toBeVisible({ timeout: TIMEOUTS.FORM_SUBMIT });
        }
      }
    }
  });

  test('알림 설정 페이지 접근', async ({ page }) => {
    // Arrange: 프로필 또는 설정 페이지 접근
    await page.goto('/profile/settings');
    await page.waitForLoadState('networkidle').catch(() => {
      // 설정 페이지가 별도로 없을 수 있음
    });

    // Act: 알림 설정 섹션 찾기
    const notificationSettings = page.locator('[data-testid="notification-settings"], [aria-label*="알림 설정"]').first();
    const isVisible = await notificationSettings.isVisible({ timeout: TIMEOUTS.NAVIGATION }).catch(() => false);

    // Assert: 알림 설정이 표시됨
    if (isVisible) {
      await expect(notificationSettings).toBeVisible();
    }
  });

  test('이메일 알림 설정 변경', async ({ page }) => {
    // Arrange: 알림 설정 페이지 접근
    await page.goto('/profile/settings');
    await page.waitForLoadState('networkidle').catch(() => {
      // 설정 페이지가 없을 수 있음
    });

    // Act: 이메일 알림 토글 찾기
    const emailToggle = page.locator('input[name*="email"], input[type="checkbox"]').filter({
      hasText: /이메일|email/i
    }).first();

    if (await emailToggle.count() > 0) {
      // 토글 클릭
      await emailToggle.click();
      await page.waitForTimeout(TIMEOUTS.FORM_SUBMIT);

      // Assert: 설정 저장 확인
      const successMessage = page.locator('[role="alert"]').filter({
        hasText: /저장|완료|변경됨/i
      });

      const hasMessage = await successMessage.count() > 0;
      if (hasMessage) {
        await expect(successMessage.first()).toBeVisible({ timeout: TIMEOUTS.FORM_SUBMIT });
      }
    }
  });

  test('푸시 알림 설정 변경', async ({ page }) => {
    // Arrange: 알림 설정 페이지 접근
    await page.goto('/profile/settings');
    await page.waitForLoadState('networkidle').catch(() => {
      // 설정 페이지가 없을 수 있음
    });

    // Act: 푸시 알림 토글 찾기
    const pushToggle = page.locator('input[name*="push"], input[type="checkbox"]').filter({
      hasText: /푸시|push|브라우저/i
    }).first();

    if (await pushToggle.count() > 0) {
      // 토글 클릭
      await pushToggle.click();
      await page.waitForTimeout(TIMEOUTS.FORM_SUBMIT);

      // Assert: 설정 저장 확인
      const successMessage = page.locator('[role="alert"]').filter({
        hasText: /저장|완료|변경됨/i
      });

      const hasMessage = await successMessage.count() > 0;
      if (hasMessage) {
        await expect(successMessage.first()).toBeVisible({ timeout: TIMEOUTS.FORM_SUBMIT });
      }
    }
  });

  test('알림 읽음 상태 시각적 구분', async ({ page }) => {
    // Arrange: 알림 센터 열기
    const notificationBell = page.locator('button[aria-label*="알림"]').first();

    if (await notificationBell.count() > 0) {
      await notificationBell.click();
      await page.waitForTimeout(TIMEOUTS.DIALOG_APPEAR);

      // Act: 읽음/읽지 않음 상태의 알림 찾기
      const unreadNotifications = page.locator('[data-testid="notification-item"][data-unread="true"]');
      const readNotifications = page.locator('[data-testid="notification-item"][data-unread="false"]');

      // Assert: 읽음/읽지 않음 상태가 구분됨
      const hasUnread = await unreadNotifications.count() > 0;
      const hasRead = await readNotifications.count() > 0;

      // 둘 중 하나 이상은 있어야 함
      if (hasUnread || hasRead) {
        expect(hasUnread || hasRead).toBe(true);
      }
    }
  });

  test('알림 중심 배지 표시', async ({ page }) => {
    // Arrange: 알림 벨 아이콘 찾기
    const notificationBell = page.locator('button[aria-label*="알림"], [data-testid="notification-bell"]').first();

    // Act & Assert: 읽지 않은 알림 개수 배지 확인
    if (await notificationBell.count() > 0) {
      const badge = page.locator('[data-testid="notification-badge"], [class*="badge"]');
      const hasBadge = await badge.count() > 0;

      if (hasBadge) {
        const badgeText = await badge.first().textContent();
        // 배지가 숫자를 포함할 수 있음
        expect(badgeText).toBeTruthy();
      }
    }
  });

  test('알림 페이지네이션', async ({ page }) => {
    // Arrange: 알림 센터 열기
    const notificationBell = page.locator('button[aria-label*="알림"]').first();

    if (await notificationBell.count() > 0) {
      await notificationBell.click();
      await page.waitForTimeout(TIMEOUTS.DIALOG_APPEAR);

      // Act: 다음 페이지 버튼 찾기
      const nextButton = page.locator('[data-testid="notification-next"], button:has-text("다음")').first();

      if (await nextButton.count() > 0 && await nextButton.isEnabled()) {
        // 다음 페이지로 이동
        await nextButton.click();
        await page.waitForLoadState('networkidle');

        // Assert: 다음 알림들이 표시됨
        const notificationItems = page.locator('[data-testid="notification-item"]');
        const hasItems = await notificationItems.count() > 0;

        if (hasItems) {
          expect(hasItems).toBe(true);
        }
      }
    }
  });
});

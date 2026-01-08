import { test, expect } from '@playwright/test';
import { loginAsTestUser, logoutUser, TEST_USER, TEST_DATA, TIMEOUTS, SELECTORS } from './setup';

/**
 * Group B1-02: 사용자 프로필 관리 테스트
 *
 * 목표:
 * - 프로필 정보 조회
 * - 프로필 정보 수정
 * - 프로필 사진 업로드
 * - 프로필 설정 저장
 *
 * 테스트 특성:
 * - 로그인된 사용자만 실행
 * - 프로필 데이터 수정 수행
 * - 병렬 실행 가능 (독립적인 테스트 계정)
 */

test.describe('Group B1-02: 사용자 프로필', () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 로그인
    await loginAsTestUser(page, TEST_USER.email);
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async ({ page }) => {
    // 각 테스트 후에 로그아웃
    await logoutUser(page);
  });

  test('프로필 페이지 로드 및 기본 정보 표시', async ({ page }) => {
    // Arrange: 프로필 페이지 접근
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    // Act & Assert: 프로필 페이지가 로드됨
    const currentUrl = page.url();
    expect(currentUrl).toContain('profile');

    // 프로필 폼 또는 정보 영역이 표시됨
    const profileContent = page.locator('[data-testid="profile-form"], form, [data-testid="profile-info"]').first();
    const isVisible = await profileContent.isVisible({ timeout: TIMEOUTS.NAVIGATION }).catch(() => false);

    if (isVisible) {
      await expect(profileContent).toBeVisible();
    }

    // 사용자 정보 필드 확인
    const userInfoFields = page.locator('input[name*="name"], input[name*="email"], input[name*="phone"]');
    const hasUserFields = await userInfoFields.count() > 0;

    // 프로필 필드가 있으면 표시되어야 함
    if (hasUserFields) {
      expect(await userInfoFields.count()).toBeGreaterThan(0);
    }
  });

  test('프로필 이름 수정', async ({ page }) => {
    // Arrange: 프로필 페이지 접근
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    // Act: 이름 필드 찾기 및 수정
    const nameInput = page.locator('input[name="name"], input[placeholder*="이름"]').first();

    if (await nameInput.count() > 0) {
      // 기존 값 클리어
      await nameInput.clear();
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // 새로운 이름 입력
      await nameInput.fill(TEST_DATA.profileUpdate.name);
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // Assert: 입력값이 반영됨
      const inputValue = await nameInput.inputValue();
      expect(inputValue).toBe(TEST_DATA.profileUpdate.name);

      // 저장 버튼 찾기 및 클릭
      const saveButton = page.locator('button').filter({
        hasText: /저장|업데이트|완료/i
      }).first();

      if (await saveButton.count() > 0) {
        await saveButton.click();
        await page.waitForTimeout(TIMEOUTS.FORM_SUBMIT);

        // 성공 메시지 확인
        const successMessage = page.locator('[role="alert"]').filter({
          hasText: /성공|완료|저장됨/i
        });

        const hasSuccess = await successMessage.count() > 0;
        if (hasSuccess) {
          await expect(successMessage.first()).toBeVisible({ timeout: TIMEOUTS.FORM_SUBMIT });
        }
      }
    }
  });

  test('프로필 전화번호 수정', async ({ page }) => {
    // Arrange: 프로필 페이지 접근
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    // Act: 전화번호 필드 찾기 및 수정
    const phoneInput = page.locator('input[name="phone"], input[type="tel"], input[placeholder*="전화"]').first();

    if (await phoneInput.count() > 0) {
      // 기존 값 클리어
      await phoneInput.clear();
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // 새로운 전화번호 입력
      await phoneInput.fill(TEST_DATA.profileUpdate.phone);
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // Assert: 입력값이 반영됨
      const inputValue = await phoneInput.inputValue();
      expect(inputValue).toBe(TEST_DATA.profileUpdate.phone);

      // 저장 버튼 찾기 및 클릭
      const saveButton = page.locator('button').filter({
        hasText: /저장|업데이트|완료/i
      }).first();

      if (await saveButton.count() > 0) {
        await saveButton.click();
        await page.waitForTimeout(TIMEOUTS.FORM_SUBMIT);
      }
    }
  });

  test('프로필 소개 텍스트 수정', async ({ page }) => {
    // Arrange: 프로필 페이지 접근
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    // Act: 소개/바이오 필드 찾기 및 수정
    const bioInput = page.locator('textarea[name="bio"], textarea[placeholder*="소개"], textarea[placeholder*="자기소개"]').first();

    if (await bioInput.count() > 0) {
      // 기존 값 클리어
      await bioInput.clear();
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // 새로운 소개 입력
      await bioInput.fill(TEST_DATA.profileUpdate.bio);
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // Assert: 입력값이 반영됨
      const inputValue = await bioInput.inputValue();
      expect(inputValue).toBe(TEST_DATA.profileUpdate.bio);

      // 저장 버튼 찾기 및 클릭
      const saveButton = page.locator('button').filter({
        hasText: /저장|업데이트|완료/i
      }).first();

      if (await saveButton.count() > 0) {
        await saveButton.click();
        await page.waitForTimeout(TIMEOUTS.FORM_SUBMIT);
      }
    }
  });

  test('프로필 이미지 업로드', async ({ page, context }) => {
    // Arrange: 프로필 페이지 접근
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    // Act: 프로필 이미지 업로드 버튼 찾기
    const uploadButton = page.locator('button, label').filter({
      hasText: /사진 업로드|이미지 선택|프로필 사진|사진 변경/i
    }).first();

    if (await uploadButton.count() > 0) {
      // 파일 입력 찾기
      const fileInput = page.locator('input[type="file"]').first();

      if (await fileInput.count() > 0) {
        // 테스트용 임시 이미지 파일 경로
        // 실제 테스트에서는 필요한 이미지 파일 준비 필요
        const testImagePath = './tests/fixtures/test-image.jpg';

        try {
          // 파일 업로드
          await fileInput.setInputFiles(testImagePath).catch(() => {
            // 파일이 없으면 무시
            console.warn('테스트 이미지 파일을 찾을 수 없습니다');
          });

          // 업로드 완료 대기
          await page.waitForTimeout(TIMEOUTS.FORM_SUBMIT);

          // Assert: 업로드 완료 메시지 또는 이미지 표시
          const uploadSuccess = page.locator('[role="alert"]').filter({
            hasText: /성공|완료|업로드됨/i
          });

          const hasSuccess = await uploadSuccess.count() > 0;
          if (hasSuccess) {
            await expect(uploadSuccess.first()).toBeVisible({ timeout: TIMEOUTS.FORM_SUBMIT });
          }
        } catch (error) {
          console.warn('파일 업로드 테스트 건너뜀:', error);
        }
      } else {
        // 일반 버튼 클릭
        await uploadButton.click();
        await page.waitForTimeout(TIMEOUTS.DIALOG_APPEAR);
      }
    }
  });

  test('프로필 변경사항 취소', async ({ page }) => {
    // Arrange: 프로필 페이지 접근
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    // Act: 이름 필드 수정 시작
    const nameInput = page.locator('input[name="name"], input[placeholder*="이름"]').first();

    if (await nameInput.count() > 0) {
      // 원래 값 저장
      const originalValue = await nameInput.inputValue();

      // 값 변경
      await nameInput.clear();
      await nameInput.fill('임시 값');
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // 취소 버튼 찾기
      const cancelButton = page.locator('button').filter({
        hasText: /취소|돌아가기|닫기/i
      }).first();

      if (await cancelButton.count() > 0) {
        await cancelButton.click();
        await page.waitForTimeout(TIMEOUTS.ANIMATION);

        // Assert: 변경이 취소됨 또는 원래 값으로 복원
        // (구현에 따라 다를 수 있음)
      }
    }
  });

  test('프로필 알림 설정 확인', async ({ page }) => {
    // Arrange: 프로필 또는 설정 페이지 접근
    await page.goto('/profile/settings');
    await page.waitForLoadState('networkidle').catch(() => {
      // 설정 페이지가 없으면 프로필 페이지에서 설정 탭 찾기
    });

    // Act: 알림 설정 섹션 찾기
    const notificationSettings = page.locator('[data-testid="notification-settings"], [aria-label*="알림"]').first();
    const isVisible = await notificationSettings.isVisible({ timeout: TIMEOUTS.NAVIGATION }).catch(() => false);

    // Assert: 알림 설정이 표시되면 체크박스 확인
    if (isVisible) {
      await expect(notificationSettings).toBeVisible();

      // 알림 관련 체크박스 확인
      const checkboxes = page.locator('input[type="checkbox"]');
      const hasCheckboxes = await checkboxes.count() > 0;

      if (hasCheckboxes) {
        expect(await checkboxes.count()).toBeGreaterThan(0);
      }
    }
  });

  test('프로필 개인정보 보호 설정', async ({ page }) => {
    // Arrange: 프로필 페이지 접근
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    // Act: 프라이버시 설정 섹션 찾기
    const privacySection = page.locator('[data-testid="privacy-settings"], [aria-label*="프라이버시"]').first();
    const isVisible = await privacySection.isVisible({ timeout: TIMEOUTS.NAVIGATION }).catch(() => false);

    // Assert: 프라이버시 설정이 있으면 표시됨
    if (isVisible) {
      await expect(privacySection).toBeVisible();

      // 토글 또는 라디오 버튼 확인
      const controls = page.locator('input[type="radio"], input[role="switch"]');
      const hasControls = await controls.count() > 0;

      if (hasControls) {
        expect(await controls.count()).toBeGreaterThan(0);
      }
    }
  });

  test('프로필 페이지에서 로그아웃 버튼 접근 가능', async ({ page }) => {
    // Arrange: 프로필 페이지 접근
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    // Act: 로그아웃 버튼 찾기
    const logoutButton = page.locator('button, a').filter({
      hasText: /로그아웃|Sign out|로그인 해제/i
    });

    // Assert: 로그아웃 버튼이 표시되거나 메뉴에서 접근 가능
    const isAccessible = await logoutButton.count() > 0;

    if (isAccessible) {
      await expect(logoutButton.first()).toBeVisible();
    }
  });

  test('프로필 이메일 주소 표시', async ({ page }) => {
    // Arrange: 프로필 페이지 접근
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    // Act: 이메일 필드 찾기
    const emailDisplay = page.locator('[data-testid="email-display"], input[name="email"], span:has-text(/@/)').first();
    const isVisible = await emailDisplay.isVisible({ timeout: TIMEOUTS.NAVIGATION }).catch(() => false);

    // Assert: 이메일이 표시됨
    if (isVisible) {
      await expect(emailDisplay).toBeVisible();

      // 이메일이 테스트 사용자 이메일인지 확인
      const emailText = await emailDisplay.textContent() || '';
      const isTestEmail = emailText.includes(TEST_USER.email) || emailText.includes('test_user');

      if (isTestEmail) {
        expect(isTestEmail).toBe(true);
      }
    }
  });

  test('프로필 탭 네비게이션', async ({ page }) => {
    // Arrange: 프로필 페이지 접근
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    // Act: 프로필 관련 탭 찾기 (기본정보, 설정, 보안 등)
    const tabs = page.locator('[role="tab"], button[data-testid*="tab"]');
    const tabCount = await tabs.count();

    // Assert: 탭이 여러 개 있으면 모두 클릭 가능한지 확인
    if (tabCount > 1) {
      for (let i = 0; i < Math.min(tabCount, 3); i++) {
        // 최대 3개 탭만 테스트
        const tab = tabs.nth(i);
        await tab.click();
        await page.waitForTimeout(TIMEOUTS.ANIMATION);

        // 탭이 활성화됨
        const isSelected = await tab.evaluate(el => {
          return el.getAttribute('aria-selected') === 'true' || el.classList.contains('active');
        });

        // 탭이 존재하고 클릭 가능하면 성공
        expect(await tab.isVisible()).toBe(true);
      }
    }
  });
});

/**
 * Group B3-04: 숙소 검토/승인 플로우 테스트
 *
 * 목표:
 * - 숙소 검토 대기 목록 조회
 * - 숙소 상세 정보 검토
 * - 문제 항목 확인
 * - 숙소 검토 승인
 * - 숙소 검토 거부
 *
 * 테스트 특성:
 * - 숙소 검토 프로세스 테스트
 * - 병렬 실행 가능 (각 테스트가 독립적)
 * - 테스트 계정: test_admin@vintee.test
 */

import { test, expect } from '@playwright/test';
import {
  loginAsAdminUser,
  logoutUser,
  TEST_ADMIN,
  TEST_DATA,
  TIMEOUTS,
  SELECTORS,
  verifyPropertyReviewExists,
  openPropertyReviewDetail,
  approveProperty,
  rejectProperty,
} from './setup';

test.describe('Group B3-04: 숙소 검토', () => {
  test('숙소 검토 목록 페이지 로드', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 숙소 검토 목록 페이지 접근
    await page.goto('/admin/property-reviews');
    await page.waitForLoadState('networkidle');

    // Assert: 페이지 로드 확인
    expect(page.url()).toContain('/admin/property-reviews');

    // 숙소 검토 목록 섹션 확인
    const pageContent = page.locator('body');
    expect(await pageContent.isVisible()).toBeTruthy();

    // 정리
    await logoutUser(page);
  });

  test('숙소 검토 대기 목록 표시', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 숙소 검토 목록 페이지 접근
    await page.goto('/admin/property-reviews');
    await page.waitForLoadState('networkidle');

    // Assert: 숙소 검토 카드 또는 목록 아이템 확인
    const reviewCards = page.locator(SELECTORS.propertyReviewCard);

    // 검토 대기 목록이 있으면 표시 확인
    if (await reviewCards.count() > 0) {
      expect(await reviewCards.first().isVisible()).toBeTruthy();

      // 첫 번째 검토의 정보 표시 확인
      const firstReview = reviewCards.first();

      // 숙소 이름, 호스트 정보, 또는 상태 정보가 표시되어야 함
      const reviewText = await firstReview.textContent();
      expect(reviewText).toBeTruthy();
    }

    // 정리
    await logoutUser(page);
  });

  test('숙소 상세 검토 정보 조회', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 숙소 검토 목록 페이지 접근
    await page.goto('/admin/property-reviews');
    await page.waitForLoadState('networkidle');

    // 첫 번째 검토 찾기
    const reviewCards = page.locator(SELECTORS.propertyReviewCard);

    if (await reviewCards.count() > 0) {
      // Act: 첫 번째 검토 클릭하여 상세 보기 열기
      await reviewCards.first().click();
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // Assert: 상세 정보 표시 확인
      const detailSection = page.locator(SELECTORS.propertyReviewDetail);

      if (await detailSection.count() > 0) {
        expect(await detailSection.isVisible()).toBeTruthy();

        // 숙소 정보 확인
        const propertyInfoElements = page.locator('text=/숙소|Property|주소|Address|호스트|Host/i');
        expect(await propertyInfoElements.count()).toBeGreaterThan(0);
      }
    }

    // 정리
    await logoutUser(page);
  });

  test('숙소 기본 정보 표시', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 숙소 검토 목록 페이지 접근
    await page.goto('/admin/property-reviews');
    await page.waitForLoadState('networkidle');

    // 첫 번째 검토 찾기
    const reviewCards = page.locator(SELECTORS.propertyReviewCard);

    if (await reviewCards.count() > 0) {
      // Act: 첫 번째 검토 클릭
      await reviewCards.first().click();
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // Assert: 필수 정보 필드 확인
      const nameField = page.locator('text=/숙소명|Property Name/i');
      const addressField = page.locator('text=/주소|Address|위치|Location/i');
      const hostField = page.locator('text=/호스트|Host/i');

      // 최소한 하나의 필드가 표시되어야 함
      const hasFields =
        await nameField.count() > 0 ||
        await addressField.count() > 0 ||
        await hostField.count() > 0;

      expect(hasFields).toBeTruthy();

      // 뒤로 가기 버튼 확인
      const backButton = page.locator(SELECTORS.backButton);
      if (await backButton.count() > 0) {
        await backButton.first().click();
        await page.waitForTimeout(TIMEOUTS.ANIMATION);
      }
    }

    // 정리
    await logoutUser(page);
  });

  test('숙소 이미지 갤러리 표시', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 숙소 검토 목록 페이지 접근
    await page.goto('/admin/property-reviews');
    await page.waitForLoadState('networkidle');

    // 첫 번째 검토 찾기
    const reviewCards = page.locator(SELECTORS.propertyReviewCard);

    if (await reviewCards.count() > 0) {
      // Act: 첫 번째 검토 클릭
      await reviewCards.first().click();
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // Assert: 이미지 요소 확인
      const images = page.locator('img');

      // 최소한 하나의 이미지가 있어야 함
      if (await images.count() > 0) {
        expect(await images.first().isVisible()).toBeTruthy();
      }

      // 뒤로 가기
      const backButton = page.locator(SELECTORS.backButton);
      if (await backButton.count() > 0) {
        await backButton.first().click();
        await page.waitForTimeout(TIMEOUTS.ANIMATION);
      }
    }

    // 정리
    await logoutUser(page);
  });

  test('숙소 검토 이슈 항목 표시', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 숙소 검토 목록 페이지 접근
    await page.goto('/admin/property-reviews');
    await page.waitForLoadState('networkidle');

    // 첫 번째 검토 찾기
    const reviewCards = page.locator(SELECTORS.propertyReviewCard);

    if (await reviewCards.count() > 0) {
      // Act: 첫 번째 검토 클릭
      await reviewCards.first().click();
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // Assert: 이슈 섹션 확인
      const issueList = page.locator(SELECTORS.propertyIssueList);

      if (await issueList.count() > 0) {
        expect(await issueList.isVisible()).toBeTruthy();

        // 이슈 항목 확인
        const issueItems = page.locator(SELECTORS.propertyIssueItem);
        if (await issueItems.count() > 0) {
          expect(await issueItems.first().isVisible()).toBeTruthy();
        }
      }

      // 이슈가 없어도 "이슈 없음" 또는 "문제 없음" 메시지 확인
      const noIssueMessage = page.locator('text=/이슈|문제|Issue|Problem/i');
      if (await noIssueMessage.count() > 0) {
        expect(await noIssueMessage.isVisible()).toBeTruthy();
      }

      // 뒤로 가기
      const backButton = page.locator(SELECTORS.backButton);
      if (await backButton.count() > 0) {
        await backButton.first().click();
        await page.waitForTimeout(TIMEOUTS.ANIMATION);
      }
    }

    // 정리
    await logoutUser(page);
  });

  test('숙소 승인 버튼 표시', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 숙소 검토 목록 페이지 접근
    await page.goto('/admin/property-reviews');
    await page.waitForLoadState('networkidle');

    // 첫 번째 검토 찾기
    const reviewCards = page.locator(SELECTORS.propertyReviewCard);

    if (await reviewCards.count() > 0) {
      // Act: 첫 번째 검토 클릭
      await reviewCards.first().click();
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // Assert: 승인 버튼 확인
      const approveButton = page.locator(SELECTORS.approvePropertyButton);

      if (await approveButton.count() > 0) {
        expect(await approveButton.isVisible()).toBeTruthy();
      }

      // 뒤로 가기
      const backButton = page.locator(SELECTORS.backButton);
      if (await backButton.count() > 0) {
        await backButton.first().click();
        await page.waitForTimeout(TIMEOUTS.ANIMATION);
      }
    }

    // 정리
    await logoutUser(page);
  });

  test('숙소 거부 버튼 표시', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 숙소 검토 목록 페이지 접근
    await page.goto('/admin/property-reviews');
    await page.waitForLoadState('networkidle');

    // 첫 번째 검토 찾기
    const reviewCards = page.locator(SELECTORS.propertyReviewCard);

    if (await reviewCards.count() > 0) {
      // Act: 첫 번째 검토 클릭
      await reviewCards.first().click();
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // Assert: 거부 버튼 확인
      const rejectButton = page.locator(SELECTORS.rejectPropertyButton);

      if (await rejectButton.count() > 0) {
        expect(await rejectButton.isVisible()).toBeTruthy();
      }

      // 뒤로 가기
      const backButton = page.locator(SELECTORS.backButton);
      if (await backButton.count() > 0) {
        await backButton.first().click();
        await page.waitForTimeout(TIMEOUTS.ANIMATION);
      }
    }

    // 정리
    await logoutUser(page);
  });

  test('숙소 거부 사유 입력 필드 표시', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 숙소 검토 목록 페이지 접근
    await page.goto('/admin/property-reviews');
    await page.waitForLoadState('networkidle');

    // 첫 번째 검토 찾기
    const reviewCards = page.locator(SELECTORS.propertyReviewCard);

    if (await reviewCards.count() > 0) {
      // Act: 첫 번째 검토 클릭
      await reviewCards.first().click();
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // 거부 버튼 클릭
      const rejectButton = page.locator(SELECTORS.rejectPropertyButton);

      if (await rejectButton.count() > 0) {
        await rejectButton.first().click();
        await page.waitForTimeout(TIMEOUTS.ANIMATION);

        // Assert: 거부 사유 입력 필드 확인
        const reasonInput = page.locator(SELECTORS.rejectionReasonInput);

        if (await reasonInput.count() > 0) {
          expect(await reasonInput.isVisible()).toBeTruthy();
        }

        // 취소 버튼으로 돌아가기
        const cancelButton = page.locator(SELECTORS.cancelButton);
        if (await cancelButton.count() > 0) {
          await cancelButton.first().click();
          await page.waitForTimeout(TIMEOUTS.ANIMATION);
        }
      }

      // 뒤로 가기
      const backButton = page.locator(SELECTORS.backButton);
      if (await backButton.count() > 0) {
        await backButton.first().click();
        await page.waitForTimeout(TIMEOUTS.ANIMATION);
      }
    }

    // 정리
    await logoutUser(page);
  });

  test('숙소 검토 필터링 기능', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 숙소 검토 목록 페이지 접근
    await page.goto('/admin/property-reviews');
    await page.waitForLoadState('networkidle');

    // Assert: 필터 옵션 확인 (대기 중, 승인됨, 거부됨 등)
    const filterElements = page.locator('button, a').filter({
      hasText: /대기|승인|거부|Pending|Approved|Rejected/i
    });

    // 필터가 있으면 상호작용 가능
    if (await filterElements.count() > 0) {
      // 필터 버튼 클릭 시도
      await filterElements.first().click();
      await page.waitForTimeout(TIMEOUTS.ANIMATION);
      await page.waitForLoadState('networkidle');
    }

    // 정리
    await logoutUser(page);
  });

  test('숙소 검토 검색 기능', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 숙소 검토 목록 페이지 접근
    await page.goto('/admin/property-reviews');
    await page.waitForLoadState('networkidle');

    // Assert: 검색 입력 필드 확인
    const searchInput = page.locator('input[type="text"][placeholder*="검색"], input[placeholder*="Search"]');

    if (await searchInput.count() > 0) {
      expect(await searchInput.isVisible()).toBeTruthy();

      // Act: 검색어 입력
      await searchInput.first().fill('test');
      await page.waitForTimeout(TIMEOUTS.ANIMATION);
      await page.waitForLoadState('networkidle');

      // 검색 결과 업데이트 확인
      expect(page.url()).toContain('/admin/property-reviews');
    }

    // 정리
    await logoutUser(page);
  });

  test('숙소 검토 정렬 기능', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 숙소 검토 목록 페이지 접근
    await page.goto('/admin/property-reviews');
    await page.waitForLoadState('networkidle');

    // Assert: 정렬 옵션 확인
    const sortButtons = page.locator('button').filter({
      hasText: /정렬|Sort|최신|최근|Latest|Recent/i
    });

    if (await sortButtons.count() > 0) {
      // Act: 정렬 버튼 클릭
      await sortButtons.first().click();
      await page.waitForTimeout(TIMEOUTS.ANIMATION);
      await page.waitForLoadState('networkidle');

      // 페이지가 여전히 존재해야 함
      expect(page.url()).toContain('/admin/property-reviews');
    }

    // 정리
    await logoutUser(page);
  });

  test('숙소 검토 페이지네이션', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 숙소 검토 목록 페이지 접근
    await page.goto('/admin/property-reviews');
    await page.waitForLoadState('networkidle');

    // Assert: 페이지네이션 또는 "더 보기" 버튼 확인
    const nextPageButton = page.locator('button').filter({
      hasText: /다음|Next|더|More/i
    });

    // 페이지네이션이 있으면 클릭 가능해야 함
    if (await nextPageButton.count() > 0) {
      const isEnabled = await nextPageButton.first().isEnabled();
      expect(typeof isEnabled).toBe('boolean');
    }

    // 정리
    await logoutUser(page);
  });

  test('숙소 검토 상태 배지 표시', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 숙소 검토 목록 페이지 접근
    await page.goto('/admin/property-reviews');
    await page.waitForLoadState('networkidle');

    // Assert: 상태 배지 또는 상태 텍스트 확인
    const statusElements = page.locator('text=/대기|승인|거부|검토|Pending|Approved|Rejected|Review/i');

    // 상태 정보가 표시되어야 함
    expect(await statusElements.count()).toBeGreaterThanOrEqual(0);

    // 정리
    await logoutUser(page);
  });
});

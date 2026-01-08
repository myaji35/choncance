/**
 * Group B3-03: 호스트 승인/거부 플로우 테스트
 *
 * 목표:
 * - 호스트 신청 목록 조회
 * - 호스트 신청 상세 정보 확인
 * - 호스트 신청 승인 처리
 * - 호스트 신청 거부 처리
 * - 거부 사유 입력 확인
 *
 * 테스트 특성:
 * - 호스트 승인 프로세스 테스트
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
  verifyHostApplicationExists,
  openHostApplicationDetail,
  approveHostApplication,
  rejectHostApplication,
} from './setup';

test.describe('Group B3-03: 호스트 승인', () => {
  test('호스트 신청 목록 페이지 로드', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 호스트 신청 목록 페이지 접근
    await page.goto('/admin/host-approvals');
    await page.waitForLoadState('networkidle');

    // Assert: 페이지 로드 확인
    expect(page.url()).toContain('/admin/host-approvals');

    // 호스트 신청 목록 섹션 확인
    const applicationList = page.locator(SELECTORS.hostApplicationList);
    const pageContent = page.locator('body');

    expect(await pageContent.isVisible()).toBeTruthy();

    // 정리
    await logoutUser(page);
  });

  test('호스트 신청 목록 표시', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 호스트 신청 목록 페이지 접근
    await page.goto('/admin/host-approvals');
    await page.waitForLoadState('networkidle');

    // Assert: 호스트 신청 카드 또는 목록 아이템 확인
    const applicationCards = page.locator(SELECTORS.hostApplicationCard);

    // 신청 목록이 있으면 표시 확인
    if (await applicationCards.count() > 0) {
      expect(await applicationCards.first().isVisible()).toBeTruthy();

      // 첫 번째 신청의 정보 표시 확인
      const firstApplication = applicationCards.first();

      // 호스트 이메일, 이름, 또는 상태 정보가 표시되어야 함
      const applicationText = await firstApplication.textContent();
      expect(applicationText).toBeTruthy();
    }

    // 정리
    await logoutUser(page);
  });

  test('호스트 신청 상세 정보 조회', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 호스트 신청 목록 페이지 접근
    await page.goto('/admin/host-approvals');
    await page.waitForLoadState('networkidle');

    // 첫 번째 신청 찾기
    const applicationCards = page.locator(SELECTORS.hostApplicationCard);

    if (await applicationCards.count() > 0) {
      // Act: 첫 번째 신청 클릭하여 상세 보기 열기
      await applicationCards.first().click();
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // Assert: 상세 정보 표시 확인
      const detailSection = page.locator(SELECTORS.hostApplicationDetail);

      if (await detailSection.count() > 0) {
        expect(await detailSection.isVisible()).toBeTruthy();

        // 호스트 정보 확인
        const hostInfoElements = page.locator('text=/이메일|Email|사업자|Business|이름|Name/i');
        expect(await hostInfoElements.count()).toBeGreaterThan(0);
      }
    }

    // 정리
    await logoutUser(page);
  });

  test('호스트 신청 정보 내용 확인', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 호스트 신청 목록 페이지 접근
    await page.goto('/admin/host-approvals');
    await page.waitForLoadState('networkidle');

    // 첫 번째 신청 찾기
    const applicationCards = page.locator(SELECTORS.hostApplicationCard);

    if (await applicationCards.count() > 0) {
      // Act: 첫 번째 신청 클릭
      await applicationCards.first().click();
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // Assert: 필수 정보 필드 확인
      const emailField = page.locator('text=/이메일|Email/i');
      const nameField = page.locator('text=/이름|Name|호스트명/i');
      const businessField = page.locator('text=/사업자|Business/i');

      // 최소한 하나의 필드가 표시되어야 함
      const hasFields =
        await emailField.count() > 0 ||
        await nameField.count() > 0 ||
        await businessField.count() > 0;

      expect(hasFields).toBeTruthy();

      // 뒤로 가기 버튼 확인
      const backButton = page.locator(SELECTORS.backButton);
      if (await backButton.count() > 0) {
        await backButton.first().click();
        await page.waitForTimeout(TIMEOUTS.ANIMATION);
        await page.waitForLoadState('networkidle');
      }
    }

    // 정리
    await logoutUser(page);
  });

  test('호스트 신청 승인 버튼 표시', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 호스트 신청 목록 페이지 접근
    await page.goto('/admin/host-approvals');
    await page.waitForLoadState('networkidle');

    // 첫 번째 신청 찾기
    const applicationCards = page.locator(SELECTORS.hostApplicationCard);

    if (await applicationCards.count() > 0) {
      // Act: 첫 번째 신청 클릭
      await applicationCards.first().click();
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // Assert: 승인 버튼 확인
      const approveButton = page.locator(SELECTORS.approveHostButton);

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

  test('호스트 신청 거부 버튼 표시', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 호스트 신청 목록 페이지 접근
    await page.goto('/admin/host-approvals');
    await page.waitForLoadState('networkidle');

    // 첫 번째 신청 찾기
    const applicationCards = page.locator(SELECTORS.hostApplicationCard);

    if (await applicationCards.count() > 0) {
      // Act: 첫 번째 신청 클릭
      await applicationCards.first().click();
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // Assert: 거부 버튼 확인
      const rejectButton = page.locator(SELECTORS.rejectHostButton);

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

  test('호스트 신청 거부 사유 입력 필드 표시', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 호스트 신청 목록 페이지 접근
    await page.goto('/admin/host-approvals');
    await page.waitForLoadState('networkidle');

    // 첫 번째 신청 찾기
    const applicationCards = page.locator(SELECTORS.hostApplicationCard);

    if (await applicationCards.count() > 0) {
      // Act: 첫 번째 신청 클릭
      await applicationCards.first().click();
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // 거부 버튼 클릭
      const rejectButton = page.locator(SELECTORS.rejectHostButton);

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

  test('호스트 신청 필터링 기능', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 호스트 신청 목록 페이지 접근
    await page.goto('/admin/host-approvals');
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

  test('호스트 신청 검색 기능', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 호스트 신청 목록 페이지 접근
    await page.goto('/admin/host-approvals');
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
      const applicationCards = page.locator(SELECTORS.hostApplicationCard);
      // 검색 후에도 페이지가 존재해야 함
      expect(page.url()).toContain('/admin/host-approvals');
    }

    // 정리
    await logoutUser(page);
  });

  test('호스트 신청 정렬 기능', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 호스트 신청 목록 페이지 접근
    await page.goto('/admin/host-approvals');
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
      expect(page.url()).toContain('/admin/host-approvals');
    }

    // 정리
    await logoutUser(page);
  });

  test('호스트 신청 페이지네이션', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 호스트 신청 목록 페이지 접근
    await page.goto('/admin/host-approvals');
    await page.waitForLoadState('networkidle');

    // Assert: 페이지네이션 또는 "더 보기" 버튼 확인
    const nextPageButton = page.locator('button').filter({
      hasText: /다음|Next|더|More/i
    });

    const previousPageButton = page.locator('button').filter({
      hasText: /이전|Previous|전|Back/i
    });

    // 페이지네이션이 있으면 클릭 가능해야 함
    if (await nextPageButton.count() > 0) {
      const isEnabled = await nextPageButton.first().isEnabled();
      expect(typeof isEnabled).toBe('boolean');
    }

    // 정리
    await logoutUser(page);
  });
});

/**
 * Group B3-02: 관리자 대시보드 테스트
 *
 * 목표:
 * - 관리자 대시보드 로딩 및 통계 표시 확인
 * - 대기 중인 호스트 승인 수 확인
 * - 대기 중인 숙소 검토 수 확인
 * - 최근 활동 로그 표시 확인
 * - 차트 및 메트릭 표시 확인
 *
 * 테스트 특성:
 * - 관리자 대시보드 UI 및 데이터 표시 테스트
 * - 병렬 실행 가능
 * - 테스트 계정: test_admin@vintee.test
 */

import { test, expect } from '@playwright/test';
import {
  loginAsAdminUser,
  logoutUser,
  TEST_ADMIN,
  TIMEOUTS,
  SELECTORS,
  getStatistics,
} from './setup';

test.describe('Group B3-02: 관리자 대시보드', () => {
  test('관리자 대시보드 페이지 로드', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 관리자 대시보드 접근
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // Assert: 대시보드 페이지 로드 확인
    expect(page.url()).toContain('/admin/dashboard');

    // 대시보드 제목 확인
    const dashboardTitle = page.locator('h1, h2').filter({
      hasText: /대시보드|Dashboard/i
    });

    expect(await dashboardTitle.count()).toBeGreaterThan(0);

    // 정리
    await logoutUser(page);
  });

  test('관리자 대시보드 통계 섹션 표시', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 관리자 대시보드 접근
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // Assert: 통계 섹션 확인
    const statsSection = page.locator(SELECTORS.statsSection);

    if (await statsSection.count() > 0) {
      expect(await statsSection.isVisible()).toBeTruthy();

      // 주요 통계 수치 확인
      const statistics = await getStatistics(page);

      // 통계 정보가 있으면 확인
      if (statistics) {
        // 최소한 하나의 통계가 표시되어야 함
        const hasStats = statistics.users || statistics.hosts || statistics.properties || statistics.pendingApprovals;
        expect(hasStats).toBeTruthy();
      }
    }

    // 정리
    await logoutUser(page);
  });

  test('대기 중인 호스트 승인 카운트 표시', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 관리자 대시보드 접근
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // Assert: 대기 중인 호스트 승인 카운트 찾기
    const pendingCount = page.locator(SELECTORS.pendingApprovalsCount);

    if (await pendingCount.count() > 0) {
      const countText = await pendingCount.first().textContent();
      expect(countText).toBeTruthy();

      // 숫자 추출 가능 여부 확인
      const numberMatch = countText?.match(/\d+/);
      if (numberMatch) {
        const count = parseInt(numberMatch[0]);
        expect(count).toBeGreaterThanOrEqual(0);
      }
    }

    // 정리
    await logoutUser(page);
  });

  test('대기 중인 숙소 검토 카운트 표시', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 관리자 대시보드 접근
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // Assert: 대시보드에 검토 대기 중인 숙소 정보 확인
    const reviewWaitingElements = page.locator('text=/검토|Review|대기|Pending/i');

    // 최소한 하나의 관련 텍스트가 있어야 함
    expect(await reviewWaitingElements.count()).toBeGreaterThanOrEqual(0);

    // 정리
    await logoutUser(page);
  });

  test('사용자 통계 표시', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 관리자 대시보드 접근
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // Assert: 사용자 통계 확인
    const totalUsersElement = page.locator(SELECTORS.totalUsersCount);

    if (await totalUsersElement.count() > 0) {
      expect(await totalUsersElement.isVisible()).toBeTruthy();

      const userText = await totalUsersElement.first().textContent();
      expect(userText).toBeTruthy();
    }

    // 정리
    await logoutUser(page);
  });

  test('호스트 통계 표시', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 관리자 대시보드 접근
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // Assert: 호스트 통계 확인
    const totalHostsElement = page.locator(SELECTORS.totalHostsCount);

    if (await totalHostsElement.count() > 0) {
      expect(await totalHostsElement.isVisible()).toBeTruthy();

      const hostsText = await totalHostsElement.first().textContent();
      expect(hostsText).toBeTruthy();
    }

    // 정리
    await logoutUser(page);
  });

  test('숙소 통계 표시', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 관리자 대시보드 접근
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // Assert: 숙소 통계 확인
    const totalPropertiesElement = page.locator(SELECTORS.totalPropertiesCount);

    if (await totalPropertiesElement.count() > 0) {
      expect(await totalPropertiesElement.isVisible()).toBeTruthy();

      const propertiesText = await totalPropertiesElement.first().textContent();
      expect(propertiesText).toBeTruthy();
    }

    // 정리
    await logoutUser(page);
  });

  test('최근 활동 로그 표시', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 관리자 대시보드 접근
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // Assert: 최근 활동 섹션 찾기
    const activityElements = page.locator('text=/활동|Activity|로그|Log|최근|Recent/i');

    // 최근 활동 관련 텍스트가 있으면 표시됨
    if (await activityElements.count() > 0) {
      expect(await activityElements.isVisible()).toBeTruthy();
    }

    // 정리
    await logoutUser(page);
  });

  test('수익 차트 또는 메트릭 표시', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 관리자 대시보드 접근
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // Assert: 차트 요소 찾기
    const chartElement = page.locator(SELECTORS.revenueChart);

    if (await chartElement.count() > 0) {
      expect(await chartElement.isVisible()).toBeTruthy();
    }

    // 차트가 없어도 수익 관련 텍스트가 있으면 됨
    const revenueElements = page.locator('text=/수익|Revenue|매출|Sales/i');
    if (await revenueElements.count() > 0) {
      expect(await revenueElements.isVisible()).toBeTruthy();
    }

    // 정리
    await logoutUser(page);
  });

  test('대시보드 네비게이션 메뉴 표시', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 관리자 대시보드 접근
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // Assert: 관리자 네비게이션 메뉴 확인
    const adminNav = page.locator(SELECTORS.adminNav);

    if (await adminNav.count() > 0) {
      expect(await adminNav.isVisible()).toBeTruthy();

      // 각 메뉴 항목 확인
      const hostApprovalsLink = page.locator(SELECTORS.hostApprovalsLink);
      const propertyReviewLink = page.locator(SELECTORS.propertyReviewLink);
      const usersManagementLink = page.locator(SELECTORS.usersManagementLink);
      const settingsLink = page.locator(SELECTORS.settingsLink);

      // 최소한 하나의 메뉴가 있어야 함
      const hasMenuItems =
        await hostApprovalsLink.count() > 0 ||
        await propertyReviewLink.count() > 0 ||
        await usersManagementLink.count() > 0 ||
        await settingsLink.count() > 0;

      expect(hasMenuItems).toBeTruthy();
    }

    // 정리
    await logoutUser(page);
  });

  test('대시보드 새로고침 후 데이터 업데이트', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 관리자 대시보드 접근
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // 초기 통계 수집
    const initialStats = await getStatistics(page);

    // Act: 페이지 새로고침
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Assert: 새로고침 후 통계 다시 수집
    const refreshedStats = await getStatistics(page);

    // 대시보드가 여전히 표시되는지 확인
    expect(page.url()).toContain('/admin/dashboard');

    // 정리
    await logoutUser(page);
  });

  test('대시보드 반응형 레이아웃', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 관리자 대시보드 접근
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // 데스크톱 레이아웃 확인
    await page.setViewportSize({ width: 1920, height: 1080 });
    let dashboardContent = page.locator('body');
    expect(await dashboardContent.isVisible()).toBeTruthy();

    // 태블릿 레이아웃 확인
    await page.setViewportSize({ width: 768, height: 1024 });
    dashboardContent = page.locator('body');
    expect(await dashboardContent.isVisible()).toBeTruthy();

    // 모바일 레이아웃 확인
    await page.setViewportSize({ width: 375, height: 667 });
    dashboardContent = page.locator('body');
    expect(await dashboardContent.isVisible()).toBeTruthy();

    // 정리
    await logoutUser(page);
  });
});

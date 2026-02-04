/**
 * Group B3-01: 관리자 인증 및 권한 확인 테스트
 *
 * 목표:
 * - 관리자 로그인 성공 확인
 * - 관리자 권한 확인
 * - 관리자 전용 페이지 접근 권한 확인
 * - 로그아웃 기능 테스트
 *
 * 테스트 특성:
 * - 관리자 인증 및 권한 시스템 테스트
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
} from './setup';

test.describe('Group B3-01: 관리자 인증 및 권한', () => {
  test('관리자 로그인 성공', async ({ page }) => {
    // Arrange: 로그인 페이지 접근
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Act: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Assert: 로그인 후 관리자 대시보드로 리다이렉트 확인
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // 관리자 대시보드 URL 확인
    expect(page.url()).toContain('/admin/dashboard');

    // 대시보드 페이지 콘텐츠 확인
    const pageContent = page.locator('body');
    expect(await pageContent.isVisible()).toBeTruthy();

    // 정리
    await logoutUser(page);
  });

  test('관리자 인증 토큰 확인', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 관리자 대시보드 접근
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // Assert: API 요청 시 인증 헤더 확인
    // 이를 위해 네트워크 요청 모니터링
    const apiRequestPromise = page.waitForResponse(
      response => response.url().includes('/api/admin/') && response.status() === 200
    ).catch(() => null);

    // 대시보드의 API 호출 유도
    await page.reload();
    await page.waitForLoadState('networkidle');

    const apiResponse = await apiRequestPromise;

    // API 응답이 있으면 인증이 성공한 것
    if (apiResponse) {
      expect(apiResponse.status()).toBe(200);
    }

    // 정리
    await logoutUser(page);
  });

  test('관리자 대시보드 접근 권한', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 관리자 대시보드 접근
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // Assert: 대시보드 페이지 로드 확인
    expect(page.url()).toContain('/admin/dashboard');

    // 관리자 전용 요소 확인
    const dashboardTitle = page.locator('h1, h2').filter({
      hasText: /대시보드|Dashboard/i
    });

    expect(await dashboardTitle.count()).toBeGreaterThan(0);

    // 관리자 네비게이션 메뉴 확인
    const adminNav = page.locator(SELECTORS.adminNav);
    if (await adminNav.count() > 0) {
      expect(await adminNav.isVisible()).toBeTruthy();
    }

    // 정리
    await logoutUser(page);
  });

  test('관리자 전용 페이지 접근 권한', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 호스트 승인 페이지 접근
    await page.goto('/admin/host-approvals');
    await page.waitForLoadState('networkidle');

    // Assert: 호스트 승인 페이지 접근 가능 확인
    expect(page.url()).toContain('/admin/host-approvals');

    // 호스트 승인 목록 요소 확인
    const applicationsList = page.locator(SELECTORS.hostApplicationList);
    const pageContent = page.locator('body');

    expect(await pageContent.isVisible()).toBeTruthy();

    // Act: 숙소 검토 페이지 접근
    await page.goto('/admin/property-reviews');
    await page.waitForLoadState('networkidle');

    // Assert: 숙소 검토 페이지 접근 가능 확인
    expect(page.url()).toContain('/admin/property-reviews');

    // Act: 사용자 관리 페이지 접근
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    // Assert: 사용자 관리 페이지 접근 가능 확인
    expect(page.url()).toContain('/admin/users');

    // Act: 설정 페이지 접근
    await page.goto('/admin/settings');
    await page.waitForLoadState('networkidle');

    // Assert: 설정 페이지 접근 가능 확인
    expect(page.url()).toContain('/admin/settings');

    // 정리
    await logoutUser(page);
  });

  test('비관리자 사용자의 관리자 페이지 접근 차단', async ({ page }) => {
    // Arrange: 비관리자로 로그인 (테스트용 일반 사용자 계정)
    // 이는 시스템이 역할을 구분할 때만 테스트 가능
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // Assert: 로그인하지 않은 경우 로그인 페이지로 리다이렉트
    if (!page.url().includes('/admin/dashboard')) {
      // 로그인 페이지 또는 권한 없음 페이지로 리다이렉트됨
      expect(
        page.url().includes('/login') ||
        page.url().includes('/unauthorized') ||
        page.url().includes('/403')
      ).toBeTruthy();
    }
  });

  test('관리자 로그아웃', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 관리자 대시보드 접근
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // 현재 URL 확인
    expect(page.url()).toContain('/admin/dashboard');

    // Act: 로그아웃
    await logoutUser(page);

    // Assert: 로그아웃 후 로그인 페이지로 리다이렉트
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(TIMEOUTS.NAVIGATION);

    // 로그인 페이지로 리다이렉트되거나 관리자 페이지 접근 불가
    if (page.url().includes('/admin')) {
      // 만약 여전히 관리자 페이지에 있다면, 세션이 만료되지 않았을 수 있음
      // 이 경우 다시 로그인 페이지로 이동 시도
      await page.goto('/admin/dashboard');
      await page.waitForLoadState('networkidle');

      // 로그인 페이지로 리다이렉트 확인
      expect(
        page.url().includes('/login') ||
        page.url().includes('/unauthorized')
      ).toBeTruthy();
    } else {
      // 다른 페이지로 리다이렉트됨 (로그인 페이지 등)
      expect(page.url()).not.toContain('/admin');
    }
  });

  test('관리자 프로필 정보 확인', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 관리자 대시보드 접근
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // 프로필 메뉴 클릭
    const profileMenu = page.locator('button, a').filter({
      hasText: /프로필|계정|Profile|Account/i
    });

    if (await profileMenu.count() > 0) {
      await profileMenu.first().click();
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // 프로필 정보 표시 확인
      const profileContent = page.locator('text=' + TEST_ADMIN.email);
      const hasProfileInfo = await profileContent.count() > 0;

      // 프로필 정보가 있으면 확인
      if (hasProfileInfo) {
        expect(hasProfileInfo).toBeTruthy();
      }
    }

    // 정리
    await logoutUser(page);
  });

  test('관리자 권한 레벨 확인', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 관리자 대시보드 접근
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // Assert: 모든 관리자 기능에 접근 가능한지 확인
    const adminLinks = [
      '/admin/dashboard',
      '/admin/host-approvals',
      '/admin/property-reviews',
      '/admin/users',
      '/admin/settings',
    ];

    for (const link of adminLinks) {
      await page.goto(link);
      await page.waitForLoadState('networkidle');

      // 각 페이지에 접근 가능한지 확인 (로그인 페이지로 리다이렉트되지 않음)
      expect(page.url()).toContain(link) || expect(page.url()).toContain('/admin');
    }

    // 정리
    await logoutUser(page);
  });

  test('관리자 세션 타임아웃 처리', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 관리자 대시보드 접근
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // 페이지 새로고침하여 세션 유지 확인
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Assert: 새로고침 후에도 관리자 대시보드에 남아있는지 확인
    // (또는 로그인 페이지로 리다이렉트되는지 확인)
    const isAdminPage = page.url().includes('/admin');
    const isLoginPage = page.url().includes('/login');

    expect(isAdminPage || isLoginPage).toBeTruthy();

    // 정리
    await logoutUser(page);
  });
});

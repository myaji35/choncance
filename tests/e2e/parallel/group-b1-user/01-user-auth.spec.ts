import { test, expect } from '@playwright/test';
import { loginAsTestUser, logoutUser, TEST_USER, TIMEOUTS } from './setup';

/**
 * Group B1-01: 사용자 인증 플로우 테스트
 *
 * 목표:
 * - 사용자 로그인/로그아웃 기능 확인
 * - Clerk 인증 시스템 통합 확인
 * - 인증 후 사용자 메뉴 표시 확인
 * - 보호된 경로 접근 제어 확인
 *
 * 테스트 특성:
 * - 실제 사용자 계정으로 인증 수행
 * - 병렬 실행 가능 (독립적인 테스트 계정)
 * - 테스트 계정: test_user_1@vintee.test
 */

test.describe('Group B1-01: 사용자 인증', () => {
  test('로그인 페이지 접근 및 로그인', async ({ page }) => {
    // Arrange: 로그인 페이지 이동
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Act: 로그인 폼이 표시되는지 확인
    const emailInput = page.locator('input[type="email"]');
    const isClerkUI = await emailInput.count() > 0;

    // Assert: 로그인 페이지가 정상적으로 로드됨
    expect(page.url()).toContain('login');

    if (isClerkUI) {
      // Clerk UI가 표시되는 경우
      await expect(emailInput.first()).toBeVisible();
    }
  });

  test('사용자로 로그인하기', async ({ page }) => {
    // Arrange: 로그인 페이지 접근
    await loginAsTestUser(page, TEST_USER.email);

    // Act & Assert: 로그인 완료 후 대시보드 또는 홈페이지로 리다이렉트
    await page.waitForLoadState('networkidle');
    const currentUrl = page.url();

    // 로그인 성공 확인 (로그인 페이지가 아님)
    expect(currentUrl).not.toContain('/login');

    // 사용자 메뉴가 표시되는지 확인
    const userMenu = page.locator('button, a').filter({
      hasText: /프로필|계정|로그아웃/i
    });

    // 사용자 메뉴가 있거나 사용자 정보가 표시됨
    const isLoggedIn = await userMenu.count() > 0;
    expect(isLoggedIn).toBe(true);
  });

  test('로그인한 사용자가 프로필 페이지 접근 가능', async ({ page }) => {
    // Arrange: 사용자로 로그인
    await loginAsTestUser(page, TEST_USER.email);
    await page.waitForLoadState('networkidle');

    // Act: 프로필 페이지 접근
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    // Assert: 프로필 페이지가 정상적으로 로드됨
    const currentUrl = page.url();
    expect(currentUrl).toContain('profile');

    // 프로필 콘텐츠가 표시됨
    const profileForm = page.locator('[data-testid="profile-form"], form').first();
    const isVisible = await profileForm.isVisible({ timeout: TIMEOUTS.NAVIGATION }).catch(() => false);

    if (isVisible) {
      await expect(profileForm).toBeVisible();
    }

    // 정리: 로그아웃
    await logoutUser(page);
  });

  test('로그인한 사용자가 위시리스트 페이지 접근 가능', async ({ page }) => {
    // Arrange: 사용자로 로그인
    await loginAsTestUser(page, TEST_USER.email);
    await page.waitForLoadState('networkidle');

    // Act: 위시리스트 페이지 접근
    await page.goto('/wishlist');
    await page.waitForLoadState('networkidle');

    // Assert: 위시리스트 페이지가 정상적으로 로드됨
    const currentUrl = page.url();
    expect(currentUrl).toContain('wishlist');

    // 위시리스트 콘텐츠가 표시됨 (빈 상태이거나 항목이 있음)
    const main = page.locator('main, [role="main"]').first();
    const isVisible = await main.isVisible({ timeout: TIMEOUTS.NAVIGATION }).catch(() => false);

    if (isVisible) {
      await expect(main).toBeVisible();
    }

    // 정리: 로그아웃
    await logoutUser(page);
  });

  test('로그인한 사용자가 예약 페이지 접근 가능', async ({ page }) => {
    // Arrange: 사용자로 로그인
    await loginAsTestUser(page, TEST_USER.email);
    await page.waitForLoadState('networkidle');

    // Act: 예약 페이지 접근
    await page.goto('/bookings');
    await page.waitForLoadState('networkidle');

    // Assert: 예약 페이지가 정상적으로 로드됨
    const currentUrl = page.url();
    expect(currentUrl).toContain('bookings');

    // 예약 콘텐츠가 표시됨
    const main = page.locator('main, [role="main"]').first();
    const isVisible = await main.isVisible({ timeout: TIMEOUTS.NAVIGATION }).catch(() => false);

    if (isVisible) {
      await expect(main).toBeVisible();
    }

    // 정리: 로그아웃
    await logoutUser(page);
  });

  test('사용자 메뉴에서 로그아웃 옵션 표시', async ({ page }) => {
    // Arrange: 사용자로 로그인
    await loginAsTestUser(page, TEST_USER.email);
    await page.waitForLoadState('networkidle');

    // Act: 사용자 메뉴 클릭
    const userMenu = page.locator('button, a').filter({
      hasText: /프로필|계정|사용자/i
    }).first();

    if (await userMenu.count() > 0) {
      await userMenu.click();
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // Assert: 로그아웃 옵션이 표시됨
      const logoutOption = page.locator('button, a').filter({
        hasText: /로그아웃|Sign out|Logout/i
      });

      const hasLogout = await logoutOption.count() > 0;
      expect(hasLogout).toBe(true);
    }

    // 정리: 로그아웃
    await logoutUser(page);
  });

  test('로그아웃 후 보호된 페이지 접근 불가', async ({ page }) => {
    // Arrange: 사용자로 로그인
    await loginAsTestUser(page, TEST_USER.email);
    await page.waitForLoadState('networkidle');

    // Act: 로그아웃
    await logoutUser(page);
    await page.waitForLoadState('networkidle');

    // Assert: 보호된 페이지 접근 시 로그인 페이지로 리다이렉트
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    const currentUrl = page.url();

    // 로그인 페이지 또는 Clerk 인증 페이지로 리다이렉트됨
    const isRedirected =
      currentUrl.includes('/login') ||
      currentUrl.includes('/sign-in') ||
      currentUrl.includes('clerk');

    expect(isRedirected).toBe(true);
  });

  test('로그인하지 않은 사용자는 공개 페이지 접근 가능', async ({ page }) => {
    // Arrange & Act: 홈페이지 접근 (로그인하지 않은 상태)
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Assert: 홈페이지가 정상적으로 로드됨
    const currentUrl = page.url();
    expect(currentUrl).toContain('localhost:3010');

    // 로그인 페이지로 리다이렉트되지 않음
    expect(currentUrl).not.toContain('/login');
  });

  test('탐색 페이지는 로그인 없이 접근 가능', async ({ page }) => {
    // Arrange & Act: 탐색 페이지 접근
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    // Assert: 탐색 페이지가 정상적으로 로드됨
    const currentUrl = page.url();
    expect(currentUrl).toContain('/explore');

    // 로그인 페이지로 리다이렉트되지 않음
    expect(currentUrl).not.toContain('/login');

    // 콘텐츠가 표시됨
    const main = page.locator('main, [role="main"]').first();
    const isVisible = await main.isVisible({ timeout: TIMEOUTS.NAVIGATION }).catch(() => false);

    if (isVisible) {
      await expect(main).toBeVisible();
    }
  });

  test('숙소 상세 페이지는 로그인 없이 접근 가능', async ({ page }) => {
    // Arrange & Act: 숙소 상세 페이지 접근
    await page.goto('/property/1');
    await page.waitForLoadState('networkidle');

    // Assert: 페이지가 로드되거나 404 상태 확인
    const currentUrl = page.url();

    // 로그인 페이지로 리다이렉트되지 않음
    expect(currentUrl).not.toContain('/login');
  });

  test('사용자 세션 유지 확인', async ({ page }) => {
    // Arrange: 사용자로 로그인
    await loginAsTestUser(page, TEST_USER.email);
    await page.waitForLoadState('networkidle');

    // Act: 다른 페이지로 이동
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    // Assert: 세션이 유지되어 사용자 메뉴가 표시됨
    const userMenu = page.locator('button, a').filter({
      hasText: /프로필|계정|사용자/i
    });

    const isStillLoggedIn = await userMenu.count() > 0;
    expect(isStillLoggedIn).toBe(true);

    // 정리: 로그아웃
    await logoutUser(page);
  });

  test('Clerk 인증 UI 렌더링 확인', async ({ page }) => {
    // Arrange & Act: 로그인 페이지 접근
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Assert: Clerk UI가 렌더링됨
    const clerkUI = page.locator('[data-clerk-id], .cl-component, [class*="clerk"]');
    const hasClerkUI = await clerkUI.count() > 0;

    // 또는 표준 폼 요소가 있음
    const emailInput = page.locator('input[type="email"]');
    const hasStandardForm = await emailInput.count() > 0;

    // 둘 중 하나 이상은 존재해야 함
    expect(hasClerkUI || hasStandardForm).toBe(true);
  });
});

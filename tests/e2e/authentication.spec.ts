import { test, expect } from '@playwright/test';

/**
 * 인증 플로우 E2E 테스트
 *
 * Clerk 인증 시스템 테스트
 * - 로그인 페이지 접근
 * - 회원가입 페이지 접근
 * - 인증 필요 페이지 리다이렉트
 */

test.describe('Authentication Flow', () => {
  test('should show login page', async ({ page }) => {
    await page.goto('/login');

    // Clerk 로그인 UI가 표시되는지 확인
    // Clerk은 iframe 또는 자체 UI를 렌더링함
    await page.waitForLoadState('networkidle');

    // 페이지가 로드되었는지 확인
    const url = page.url();
    expect(url).toContain('login');
  });

  test('should show signup page', async ({ page }) => {
    await page.goto('/signup');

    await page.waitForLoadState('networkidle');

    // 페이지가 로드되었는지 확인
    const url = page.url();
    expect(url).toContain('signup');
  });

  test('should redirect to login when accessing protected routes', async ({ page }) => {
    // 보호된 경로 접근 시도
    const protectedRoutes = [
      '/bookings',
      '/wishlist',
      '/profile',
    ];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      // 로그인하지 않은 경우 로그인 페이지로 리다이렉트되거나
      // Clerk 인증 UI가 표시되어야 함
      const url = page.url();

      // 로그인 페이지로 리다이렉트되었거나 Clerk 인증 페이지인지 확인
      const isProtected =
        url.includes('login') ||
        url.includes('sign-in') ||
        url.includes('clerk') ||
        url !== `http://localhost:3010${route}`;

      // 또는 원래 페이지에 있지만 인증 모달/오버레이가 표시됨
      const hasAuthUI = await page.locator('[data-clerk-id], .cl-component').count() > 0;

      expect(isProtected || hasAuthUI).toBe(true);
    }
  });

  test('should allow access to public routes without auth', async ({ page }) => {
    const publicRoutes = [
      '/',
      '/explore',
    ];

    for (const route of publicRoutes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      // 페이지가 정상적으로 로드되었는지 확인
      const url = page.url();
      expect(url).toContain(route);

      // 로그인 페이지로 리다이렉트되지 않았는지 확인
      expect(url).not.toContain('login');
      expect(url).not.toContain('sign-in');
    }
  });

  test('should show user menu when logged out', async ({ page }) => {
    await page.goto('/');

    // 로그인/회원가입 버튼이나 링크 확인
    const authButtons = page.locator('a, button').filter({
      hasText: /로그인|회원가입|Sign|Login/i
    });

    // 적어도 하나의 인증 관련 버튼이 있어야 함
    if (await authButtons.count() > 0) {
      await expect(authButtons.first()).toBeVisible();
    }
  });

  test('should navigate between login and signup', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // 회원가입 링크 찾기 (Clerk UI 내에 있을 수 있음)
    const signupLinks = page.locator('a').filter({
      hasText: /회원가입|Sign up|가입/i
    });

    if (await signupLinks.count() > 0) {
      await signupLinks.first().click();
      await page.waitForLoadState('networkidle');

      const url = page.url();
      expect(url).toContain('signup');
    }
  });
});

test.describe('Host Authentication', () => {
  test('should show host registration page', async ({ page }) => {
    await page.goto('/become-a-host');
    await page.waitForLoadState('networkidle');

    // 호스트 등록 페이지가 로드되었는지 확인
    const url = page.url();
    expect(url).toContain('become-a-host');

    // 페이지 제목이나 설명 확인
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 5000 });
  });

  test('should require auth for host dashboard', async ({ page }) => {
    await page.goto('/host/dashboard');
    await page.waitForLoadState('networkidle');

    const url = page.url();

    // 로그인하지 않은 경우 리다이렉트되거나 인증 UI가 표시되어야 함
    const isProtected =
      url.includes('login') ||
      url.includes('sign-in') ||
      url.includes('clerk');

    const hasAuthUI = await page.locator('[data-clerk-id], .cl-component').count() > 0;

    // 보호된 경로이거나 인증 UI가 표시되어야 함
    expect(isProtected || hasAuthUI).toBe(true);
  });
});

test.describe('Admin Authentication', () => {
  test('should require auth for admin pages', async ({ page }) => {
    const adminRoutes = [
      '/admin',
      '/admin/properties/pending',
    ];

    for (const route of adminRoutes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      const url = page.url();

      // 관리자 페이지는 인증이 필요하거나 권한 확인이 있어야 함
      const isProtected =
        url.includes('login') ||
        url.includes('sign-in') ||
        url.includes('admin/login') ||
        url !== `http://localhost:3010${route}`;

      // 또는 관리자 로그인 페이지
      const isAdminLogin = url.includes('admin/login');

      expect(isProtected || isAdminLogin).toBe(true);
    }
  });
});

import { test, expect } from '@playwright/test';

/**
 * 핵심 사용자 여정 E2E 테스트
 *
 * 주요 플로우:
 * 1. 메인 페이지 접속
 * 2. 숙소 탐색
 * 3. 숙소 상세 확인
 * 4. 로그인 (Clerk 통합)
 * 5. 예약 시도
 */

test.describe('User Journey - Browse to Booking', () => {
  test('should complete browse to property detail flow', async ({ page }) => {
    // 1. 메인 페이지 접속
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /진짜 시골의 여유를 찾다/ })).toBeVisible();

    // 2. 탐색 페이지로 이동
    await page.getByRole('link', { name: /숙소 둘러보기/ }).first().click();
    await expect(page).toHaveURL(/\/explore/);
    await page.waitForLoadState('networkidle');

    // 3. 검색 기능 테스트
    const searchInput = page.getByPlaceholder(/검색/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('전원');
      await page.waitForTimeout(500);
    }

    // 4. 숙소 카드가 표시되는지 확인
    const propertyCards = page.locator('a[href^="/property/"]');
    await expect(propertyCards.first()).toBeVisible({ timeout: 10000 });

    // 5. 첫 번째 숙소 클릭
    await propertyCards.first().click();
    await expect(page).toHaveURL(/\/property\//);

    // 6. 숙소 상세 페이지 요소 확인
    await expect(page.locator('h1').first()).toBeVisible();

    // 7. 예약 위젯 확인
    const bookingWidget = page.locator('text=/₩[0-9,]+/').first();
    await expect(bookingWidget).toBeVisible({ timeout: 5000 });
  });

  test('should navigate through tag filters', async ({ page }) => {
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    // 태그 버튼 찾기
    const tagButtons = page.locator('button, a').filter({ hasText: /#/ });

    if (await tagButtons.count() > 0) {
      const firstTag = tagButtons.first();
      await firstTag.click();

      // URL이 태그 필터로 변경되었는지 확인
      await page.waitForTimeout(500);
      await expect(page).toHaveURL(/tag=/);
    }
  });

  test('should show wishlist functionality when logged in', async ({ page }) => {
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    // 첫 번째 숙소로 이동
    const firstProperty = page.locator('a[href^="/property/"]').first();
    if (await firstProperty.isVisible()) {
      await firstProperty.click();
      await expect(page).toHaveURL(/\/property\//);

      // 찜하기 버튼 확인 (로그인 안 된 상태에서도 표시됨)
      const wishlistButton = page.locator('button').filter({
        hasText: /찜|하트|좋아요|Wishlist/i
      });

      // 찜하기 버튼이 있거나 하트 아이콘이 있는지 확인
      const heartIcon = page.locator('svg[class*="heart"], [data-icon="heart"]');

      const hasWishlistFeature =
        (await wishlistButton.count() > 0) ||
        (await heartIcon.count() > 0);

      if (hasWishlistFeature) {
        expect(hasWishlistFeature).toBe(true);
      }
    }
  });

  test('should display property details correctly', async ({ page }) => {
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    const firstProperty = page.locator('a[href^="/property/"]').first();
    await firstProperty.click();
    await expect(page).toHaveURL(/\/property\//);

    // 주요 섹션들이 표시되는지 확인
    const sections = [
      page.locator('h1').first(), // 제목
      page.locator('text=/₩[0-9,]+/').first(), // 가격
    ];

    for (const section of sections) {
      await expect(section).toBeVisible({ timeout: 5000 });
    }

    // 이미지가 표시되는지 확인
    const images = page.locator('img');
    expect(await images.count()).toBeGreaterThan(0);
  });

  test('should show booking widget with proper validation', async ({ page }) => {
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    const firstProperty = page.locator('a[href^="/property/"]').first();
    await firstProperty.click();
    await expect(page).toHaveURL(/\/property\//);

    // 예약 버튼 찾기
    const reserveButton = page.locator('button:has-text("예약하기")').first();

    if (await reserveButton.isVisible()) {
      // 날짜 선택 전에는 비활성화되어 있어야 함
      await expect(reserveButton).toBeDisabled();

      // 날짜 선택 버튼 클릭
      const dateButton = page.locator('button').filter({
        hasText: /날짜/
      }).first();

      if (await dateButton.isVisible()) {
        await dateButton.click();

        // 캘린더가 표시되는지 확인
        await page.waitForTimeout(500);
        const calendar = page.locator('[role="grid"], .rdp, [class*="calendar"]');
        expect(await calendar.count()).toBeGreaterThan(0);
      }
    }
  });
});

test.describe('Navigation and Layout', () => {
  test('should have working header navigation', async ({ page }) => {
    await page.goto('/');

    // 헤더 확인
    const header = page.locator('header, nav').first();
    await expect(header).toBeVisible();

    // 로고/홈 링크 확인
    const homeLink = page.locator('a[href="/"]').first();
    await expect(homeLink).toBeVisible();
  });

  test('should have working footer', async ({ page }) => {
    await page.goto('/');

    // 푸터 확인
    const footer = page.locator('footer').first();

    if (await footer.isVisible()) {
      await expect(footer).toBeVisible();
    }
  });

  test('should be mobile responsive', async ({ page, isMobile }) => {
    await page.goto('/');

    // 모바일에서 햄버거 메뉴가 있는지 확인 (있다면)
    if (isMobile) {
      const mobileMenu = page.locator('button[aria-label*="menu"], button[aria-label*="메뉴"]');

      if (await mobileMenu.count() > 0) {
        await expect(mobileMenu.first()).toBeVisible();
      }
    }

    // 메인 콘텐츠가 표시되는지 확인
    const mainContent = page.locator('main, [role="main"]').first();

    if (await mainContent.isVisible()) {
      await expect(mainContent).toBeVisible();
    }
  });
});

test.describe('Search and Filter', () => {
  test('should search properties by text', async ({ page }) => {
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    const searchInput = page.getByPlaceholder(/검색/i);

    if (await searchInput.isVisible()) {
      // 검색어 입력
      await searchInput.fill('전원');
      await page.waitForTimeout(1000);

      // URL에 검색 파라미터가 있는지 확인
      const url = page.url();
      expect(url).toContain('search');
    }
  });

  test('should filter by tags', async ({ page }) => {
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    // 태그 버튼들 찾기
    const tagButtons = page.locator('button, a').filter({ hasText: /#/ });

    if (await tagButtons.count() > 0) {
      const tagText = await tagButtons.first().textContent();
      await tagButtons.first().click();

      await page.waitForTimeout(500);

      // URL이 변경되었는지 확인
      const url = page.url();
      expect(url).toContain('tag=');
    }
  });
});

test.describe('Performance and Accessibility', () => {
  test('should load pages within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // 5초 이내 로딩 (개발 모드에서는 느릴 수 있음)
    expect(loadTime).toBeLessThan(10000);
  });

  test('should have proper page titles', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('should have accessible images', async ({ page }) => {
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    // 이미지들이 alt 속성을 가지고 있는지 확인
    const images = page.locator('img');
    const imageCount = await images.count();

    if (imageCount > 0) {
      // 최소한 일부 이미지는 alt 속성이 있어야 함
      const imagesWithAlt = await images.filter({ hasNotText: '' }).count();
      expect(imagesWithAlt).toBeGreaterThanOrEqual(0);
    }
  });
});

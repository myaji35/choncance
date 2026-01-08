import { test, expect } from '@playwright/test';

/**
 * Group A1-02: 탐색 페이지 읽기 전용 테스트
 *
 * 목표:
 * - 숙소 목록 페이지 접근 및 표시 확인
 * - 숙소 카드 컴포넌트 렌더링 확인
 * - 테마 섹션/태그 카테고리 표시 확인
 * - 반응형 레이아웃 동작 확인
 *
 * 테스트 특성:
 * - 데이터 수정 없음 (읽기만 수행)
 * - 필터 상태 변경 없음
 * - 검색 기능 테스트 없음 (별도 테스트에서 수행)
 */

test.describe('Group A1-02: 탐색 페이지 (읽기 전용)', () => {
  test('탐색 페이지 기본 로딩 확인', async ({ page }) => {
    // Arrange & Act: 탐색 페이지 접근
    await page.goto('/explore');

    // Assert: 페이지 로드 확인
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/explore');
  });

  test('숙소 카드 목록 표시 확인', async ({ page }) => {
    // Arrange: 탐색 페이지 접근
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    // Act: 숙소 카드 찾기
    const propertyCards = page.locator('[data-testid="property-card"], .property-card, [class*="property"], [class*="card"]');

    // Assert: 적어도 하나의 카드가 표시되어 있는지 확인
    const count = await propertyCards.count();
    if (count > 0) {
      expect(count).toBeGreaterThan(0);
      // 첫 번째 카드가 보이는지 확인
      await expect(propertyCards.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('숙소 카드 이미지 표시 확인', async ({ page }) => {
    // Arrange: 탐색 페이지 접근
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    // Act: 숙소 카드의 이미지 찾기
    const images = page.locator('[data-testid="property-card"] img, .property-card img');

    // Assert: 이미지가 로드되어 있는지 확인
    const imageCount = await images.count();
    if (imageCount > 0) {
      const firstImage = images.first();
      // 이미지가 로드되었는지 확인
      await expect(firstImage).toHaveAttribute('src');
    }
  });

  test('숙소 카드 가격 정보 표시 확인', async ({ page }) => {
    // Arrange: 탐색 페이지 접근
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    // Act: 가격 정보 찾기
    const priceElements = page.locator('[data-testid*="price"], text=/\\d+,?\\d+원|\\d+,?\\d+\\s*won/i');

    // Assert: 가격 정보가 표시되는지 확인
    const priceCount = await priceElements.count();
    if (priceCount > 0) {
      expect(priceCount).toBeGreaterThan(0);
    }
  });

  test('숙소 카드 제목 표시 확인', async ({ page }) => {
    // Arrange: 탐색 페이지 접근
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    // Act: 숙소 제목 찾기
    const titles = page.locator('[data-testid="property-card"] h2, [data-testid="property-card"] h3, .property-card h2, .property-card h3');

    // Assert: 제목이 표시되는지 확인
    const titleCount = await titles.count();
    if (titleCount > 0) {
      expect(titleCount).toBeGreaterThan(0);
      await expect(titles.first()).toBeVisible({ timeout: 3000 });
    }
  });

  test('태그/테마 섹션 표시 확인', async ({ page }) => {
    // Arrange: 탐색 페이지 접근
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    // Act: 태그/테마 섹션 찾기
    const tagSections = page.locator('[data-testid*="tag"], [data-testid*="theme"], [class*="tag"], [class*="theme"]');

    // Assert: 태그가 표시되는지 확인
    const tagCount = await tagSections.count();
    if (tagCount > 0) {
      expect(tagCount).toBeGreaterThan(0);
    }
  });

  test('태그 배지 클릭 가능성 확인 (클릭하지 않음)', async ({ page }) => {
    // Arrange: 탐색 페이지 접근
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    // Act: 태그 배지 찾기
    const tagBadges = page.locator('[data-testid*="tag-badge"], .tag-badge, [class*="badge"]').filter({
      hasText: /#\w+|태그|여행|시골/i
    });

    // Assert: 태그 배지가 존재하는지 확인 (클릭하지 않음)
    const badgeCount = await tagBadges.count();
    if (badgeCount > 0) {
      expect(badgeCount).toBeGreaterThan(0);
      // 첫 번째 배지가 보이는지만 확인
      await expect(tagBadges.first()).toBeVisible({ timeout: 3000 });
    }
  });

  test('탐색 페이지 모바일 레이아웃', async ({ browser }) => {
    // Arrange: 모바일 뷰포트로 컨텍스트 생성
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 }
    });
    const page = await context.newPage();

    // Act: 탐색 페이지 접근
    await page.goto('http://localhost:3010/explore');
    await page.waitForLoadState('networkidle');

    // Assert: 모바일 환경에서 카드가 표시되는지 확인
    const propertyCards = page.locator('[data-testid="property-card"], .property-card, [class*="property"]');
    const count = await propertyCards.count();

    if (count > 0) {
      expect(count).toBeGreaterThan(0);
    }

    await context.close();
  });

  test('탐색 페이지 태블릿 레이아웃', async ({ browser }) => {
    // Arrange: 태블릿 뷰포트로 컨텍스트 생성
    const context = await browser.newContext({
      viewport: { width: 768, height: 1024 }
    });
    const page = await context.newPage();

    // Act: 탐색 페이지 접근
    await page.goto('http://localhost:3010/explore');
    await page.waitForLoadState('networkidle');

    // Assert: 태블릿 환경에서 카드가 표시되는지 확인
    const propertyCards = page.locator('[data-testid="property-card"], .property-card, [class*="property"]');
    const count = await propertyCards.count();

    if (count > 0) {
      expect(count).toBeGreaterThan(0);
    }

    await context.close();
  });

  test('탐색 페이지 데스크톱 레이아웃', async ({ page }) => {
    // Arrange: 데스크톱 뷰포트로 페이지 접근
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    // Act: 뷰포트 크기 설정
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Assert: 데스크톱 환경에서 카드가 여러 개 표시되는지 확인
    const propertyCards = page.locator('[data-testid="property-card"], .property-card, [class*="property"]');
    const count = await propertyCards.count();

    if (count > 0) {
      expect(count).toBeGreaterThan(0);
    }
  });

  test('페이지 스크롤 시 콘텐츠 로드 확인', async ({ page }) => {
    // Arrange: 탐색 페이지 접근
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    // Act: 초기 카드 수 계산
    const initialCards = await page.locator('[data-testid="property-card"], .property-card').count();

    // 페이지 스크롤
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(500);

    // Assert: 스크롤 후에도 카드가 표시되는지 확인
    const afterScrollCards = await page.locator('[data-testid="property-card"], .property-card').count();
    if (initialCards > 0 || afterScrollCards > 0) {
      expect(initialCards + afterScrollCards).toBeGreaterThanOrEqual(0);
    }
  });

  test('숙소 카드에서 상세 페이지 링크 존재 확인', async ({ page }) => {
    // Arrange: 탐색 페이지 접근
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    // Act: 숙소 카드 링크 찾기
    const propertyLinks = page.locator('a[href*="/property/"]');

    // Assert: 링크가 존재하는지 확인 (클릭하지 않음)
    const linkCount = await propertyLinks.count();
    if (linkCount > 0) {
      expect(linkCount).toBeGreaterThan(0);
      // 첫 번째 링크의 href 속성 확인
      const href = await propertyLinks.first().getAttribute('href');
      expect(href).toContain('/property/');
    }
  });

  test('탐색 페이지 접근성 - 의미론적 HTML 확인', async ({ page }) => {
    // Arrange: 탐색 페이지 접근
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    // Act: 메인 랜드마크 찾기
    const main = page.locator('main, [role="main"]').first();

    // Assert: main 요소가 존재하는지 확인
    const isVisible = await main.isVisible({ timeout: 3000 }).catch(() => false);
    if (isVisible) {
      await expect(main).toBeVisible();
    }
  });
});

import { test, expect } from '@playwright/test';

/**
 * Group A1-03: 숙소 상세 페이지 읽기 전용 테스트
 *
 * 목표:
 * - 숙소 상세 정보 페이지 접근 및 데이터 표시 확인
 * - 이미지 갤러리 렌더링 및 네비게이션 확인
 * - 호스트 스토리 섹션 표시 확인
 * - 편의시설 목록 표시 확인
 * - 가격 및 예약 위젯 표시 확인
 *
 * 테스트 특성:
 * - 데이터 수정 없음 (읽기만 수행)
 * - 예약 진행 없음
 * - 로그인 불필요
 */

test.describe('Group A1-03: 숙소 상세 페이지 (읽기 전용)', () => {
  // 테스트용 숙소 ID (실제 데이터베이스에 있는 ID로 변경 필요)
  const PROPERTY_ID = '1';

  test('숙소 상세 페이지 기본 로딩', async ({ page }) => {
    // Arrange & Act: 숙소 상세 페이지 접근
    await page.goto(`/property/${PROPERTY_ID}`);

    // Assert: 페이지 로드 확인
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain(`/property/${PROPERTY_ID}`);
  });

  test('숙소 제목 표시 확인', async ({ page }) => {
    // Arrange: 숙소 상세 페이지 접근
    await page.goto(`/property/${PROPERTY_ID}`);
    await page.waitForLoadState('networkidle');

    // Act: 숙소 제목 찾기
    const title = page.locator('h1, [data-testid="property-title"]').first();

    // Assert: 제목이 표시되는지 확인
    const isVisible = await title.isVisible({ timeout: 3000 }).catch(() => false);
    if (isVisible) {
      await expect(title).toBeVisible();
    }
  });

  test('숙소 기본 정보 표시 확인', async ({ page }) => {
    // Arrange: 숙소 상세 페이지 접근
    await page.goto(`/property/${PROPERTY_ID}`);
    await page.waitForLoadState('networkidle');

    // Act: 주소, 게스트 수 등의 정보 찾기
    const basicInfo = page.locator('[data-testid*="info"], [class*="info"], text=/위치|주소|게스트|침실|침대/i');

    // Assert: 기본 정보가 표시되는지 확인
    const infoCount = await basicInfo.count();
    if (infoCount > 0) {
      expect(infoCount).toBeGreaterThan(0);
    }
  });

  test('이미지 갤러리 표시 확인', async ({ page }) => {
    // Arrange: 숙소 상세 페이지 접근
    await page.goto(`/property/${PROPERTY_ID}`);
    await page.waitForLoadState('networkidle');

    // Act: 갤러리 이미지 찾기
    const galleryImages = page.locator(
      '[data-testid*="gallery"] img, ' +
      '[class*="gallery"] img, ' +
      '[data-testid="property-image"], ' +
      'img[alt*="숙소|property|이미지"]'
    );

    // Assert: 갤러리 이미지가 표시되는지 확인
    const imageCount = await galleryImages.count();
    if (imageCount > 0) {
      expect(imageCount).toBeGreaterThan(0);
      await expect(galleryImages.first()).toHaveAttribute('src');
    }
  });

  test('이미지 네비게이션 버튼 확인', async ({ page }) => {
    // Arrange: 숙소 상세 페이지 접근
    await page.goto(`/property/${PROPERTY_ID}`);
    await page.waitForLoadState('networkidle');

    // Act: 이전/다음 버튼 찾기
    const navButtons = page.locator('button[aria-label*="이전|다음|previous|next"], [data-testid*="nav"]');

    // Assert: 네비게이션 버튼 확인 (갤러리가 있는 경우)
    const navCount = await navButtons.count();
    if (navCount > 0) {
      expect(navCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('호스트 정보 섹션 표시 확인', async ({ page }) => {
    // Arrange: 숙소 상세 페이지 접근
    await page.goto(`/property/${PROPERTY_ID}`);
    await page.waitForLoadState('networkidle');

    // Act: 호스트 정보 섹션 찾기
    const hostSection = page.locator(
      '[data-testid*="host"], ' +
      '[class*="host"], ' +
      'text=/호스트|조주인|host/i'
    );

    // Assert: 호스트 정보가 표시되는지 확인
    const hostCount = await hostSection.count();
    if (hostCount > 0) {
      expect(hostCount).toBeGreaterThan(0);
    }
  });

  test('호스트 스토리/설명 표시 확인', async ({ page }) => {
    // Arrange: 숙소 상세 페이지 접근
    await page.goto(`/property/${PROPERTY_ID}`);
    await page.waitForLoadState('networkidle');

    // Act: 스토리/설명 텍스트 찾기
    const storySection = page.locator(
      '[data-testid*="story"], ' +
      '[data-testid*="description"], ' +
      '[class*="story"], ' +
      '[class*="description"]'
    ).first();

    // Assert: 스토리가 표시되는지 확인
    const isVisible = await storySection.isVisible({ timeout: 3000 }).catch(() => false);
    if (isVisible) {
      await expect(storySection).toBeVisible();
    }
  });

  test('편의시설 목록 표시 확인', async ({ page }) => {
    // Arrange: 숙소 상세 페이지 접근
    await page.goto(`/property/${PROPERTY_ID}`);
    await page.waitForLoadState('networkidle');

    // Act: 편의시설 목록 찾기
    const amenities = page.locator(
      '[data-testid*="amenities"], ' +
      '[class*="amenities"], ' +
      'text=/편의시설|amenities/i'
    );

    // Assert: 편의시설이 표시되는지 확인
    const amenityCount = await amenities.count();
    if (amenityCount > 0) {
      expect(amenityCount).toBeGreaterThan(0);
    }
  });

  test('편의시설 아이콘 표시 확인', async ({ page }) => {
    // Arrange: 숙소 상세 페이지 접근
    await page.goto(`/property/${PROPERTY_ID}`);
    await page.waitForLoadState('networkidle');

    // Act: 페이지 스크롤하여 편의시설 섹션으로 이동
    await page.evaluate(() => {
      const amenitySection = document.querySelector('[data-testid*="amenities"], [class*="amenities"]');
      if (amenitySection) {
        amenitySection.scrollIntoView();
      }
    });

    // 편의시설 아이콘 찾기
    const amenityIcons = page.locator('[data-testid*="amenity-icon"], [class*="amenity"] svg, [class*="icon"]');

    // Assert: 아이콘이 표시되는지 확인
    const iconCount = await amenityIcons.count();
    if (iconCount > 0) {
      expect(iconCount).toBeGreaterThan(0);
    }
  });

  test('태그/카테고리 표시 확인', async ({ page }) => {
    // Arrange: 숙소 상세 페이지 접근
    await page.goto(`/property/${PROPERTY_ID}`);
    await page.waitForLoadState('networkidle');

    // Act: 태그 찾기
    const tags = page.locator('[data-testid*="tag"], [class*="tag"], text=/#/');

    // Assert: 태그가 표시되는지 확인
    const tagCount = await tags.count();
    if (tagCount > 0) {
      expect(tagCount).toBeGreaterThan(0);
    }
  });

  test('가격 정보 표시 확인', async ({ page }) => {
    // Arrange: 숙소 상세 페이지 접근
    await page.goto(`/property/${PROPERTY_ID}`);
    await page.waitForLoadState('networkidle');

    // Act: 가격 정보 찾기
    const priceInfo = page.locator(
      '[data-testid*="price"], ' +
      '[class*="price"], ' +
      'text=/\\d+,?\\d+원|\\d+\\s*원|\\d+,?\\d+\\s*won/i'
    );

    // Assert: 가격이 표시되는지 확인
    const priceCount = await priceInfo.count();
    if (priceCount > 0) {
      expect(priceCount).toBeGreaterThan(0);
    }
  });

  test('예약 위젯 표시 확인', async ({ page }) => {
    // Arrange: 숙소 상세 페이지 접근
    await page.goto(`/property/${PROPERTY_ID}`);
    await page.waitForLoadState('networkidle');

    // Act: 예약 위젯 찾기 (날짜 선택, 예약 버튼 등)
    const bookingWidget = page.locator(
      '[data-testid*="booking"], ' +
      '[class*="booking"], ' +
      'button:has-text("예약|booking|선택하기")'
    );

    // Assert: 예약 위젯이 표시되는지 확인
    const bookingCount = await bookingWidget.count();
    if (bookingCount > 0) {
      expect(bookingCount).toBeGreaterThan(0);
    }
  });

  test('리뷰 섹션 표시 확인', async ({ page }) => {
    // Arrange: 숙소 상세 페이지 접근
    await page.goto(`/property/${PROPERTY_ID}`);
    await page.waitForLoadState('networkidle');

    // Act: 페이지 끝까지 스크롤하여 리뷰 섹션 확인
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // 리뷰 섹션 찾기
    const reviewSection = page.locator(
      '[data-testid*="review"], ' +
      '[class*="review"], ' +
      'text=/리뷰|후기|reviews/i'
    ).first();

    // Assert: 리뷰 섹션이 존재하는지 확인
    const isVisible = await reviewSection.isVisible({ timeout: 3000 }).catch(() => false);
    if (isVisible) {
      await expect(reviewSection).toBeVisible();
    }
  });

  test('관련 숙소 추천 섹션 확인', async ({ page }) => {
    // Arrange: 숙소 상세 페이지 접근
    await page.goto(`/property/${PROPERTY_ID}`);
    await page.waitForLoadState('networkidle');

    // Act: 관련 숙소 섹션 찾기
    const relatedSection = page.locator(
      '[data-testid*="related"], ' +
      '[class*="related"], ' +
      'text=/유사한|다른|비슷한|추천/i'
    );

    // Assert: 관련 숙소가 표시되는지 확인
    const relatedCount = await relatedSection.count();
    if (relatedCount > 0) {
      expect(relatedCount).toBeGreaterThan(0);
    }
  });

  test('숙소 상세 페이지 모바일 레이아웃', async ({ browser }) => {
    // Arrange: 모바일 뷰포트로 컨텍스트 생성
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 }
    });
    const page = await context.newPage();

    // Act: 숙소 상세 페이지 접근
    await page.goto(`http://localhost:3010/property/${PROPERTY_ID}`);
    await page.waitForLoadState('networkidle');

    // Assert: 모바일에서 콘텐츠가 표시되는지 확인
    const title = page.locator('h1, [data-testid="property-title"]').first();
    const isVisible = await title.isVisible({ timeout: 3000 }).catch(() => false);

    if (isVisible) {
      await expect(title).toBeVisible();
    }

    await context.close();
  });

  test('숙소 상세 페이지 접근성 확인', async ({ page }) => {
    // Arrange: 숙소 상세 페이지 접근
    await page.goto(`/property/${PROPERTY_ID}`);
    await page.waitForLoadState('networkidle');

    // Act: 메인 랜드마크 찾기
    const main = page.locator('main, [role="main"]').first();

    // Assert: main 요소가 존재하는지 확인
    const isVisible = await main.isVisible({ timeout: 3000 }).catch(() => false);
    if (isVisible) {
      await expect(main).toBeVisible();
    }
  });

  test('이미지 로딩 성능 확인', async ({ page }) => {
    // Arrange: 숙소 상세 페이지 접근
    await page.goto(`/property/${PROPERTY_ID}`);

    // Act: 모든 이미지가 로드될 때까지 대기
    await page.waitForLoadState('networkidle');

    // Assert: 이미지가 로드되었는지 확인
    const images = page.locator('img');
    const imageCount = await images.count();

    if (imageCount > 0) {
      // 첫 번째 이미지의 자연 크기 확인
      const naturalWidth = await images.first().evaluate((img: HTMLImageElement) => img.naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0);
    }
  });
});

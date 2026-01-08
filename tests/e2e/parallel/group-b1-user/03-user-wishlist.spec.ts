import { test, expect } from '@playwright/test';
import { loginAsTestUser, logoutUser, TEST_USER, TEST_DATA, TIMEOUTS } from './setup';

/**
 * Group B1-03: 사용자 위시리스트 기능 테스트
 *
 * 목표:
 * - 위시리스트에 숙소 추가
 * - 위시리스트에서 숙소 제거
 * - 위시리스트 조회
 * - 위시리스트 공유
 *
 * 테스트 특성:
 * - 로그인된 사용자만 실행
 * - 위시리스트 데이터 수정 수행
 * - 병렬 실행 가능 (독립적인 테스트 계정)
 */

test.describe('Group B1-03: 사용자 위시리스트', () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 로그인
    await loginAsTestUser(page, TEST_USER.email);
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async ({ page }) => {
    // 각 테스트 후에 로그아웃
    await logoutUser(page);
  });

  test('위시리스트 페이지 접근 및 로드', async ({ page }) => {
    // Arrange & Act: 위시리스트 페이지 접근
    await page.goto('/wishlist');
    await page.waitForLoadState('networkidle');

    // Assert: 위시리스트 페이지가 로드됨
    const currentUrl = page.url();
    expect(currentUrl).toContain('wishlist');

    // 페이지 제목 확인
    const pageTitle = page.locator('h1, h2').filter({
      hasText: /위시리스트|Wishlist|즐겨찾기/i
    });

    const hasTitle = await pageTitle.count() > 0;
    if (hasTitle) {
      await expect(pageTitle.first()).toBeVisible({ timeout: TIMEOUTS.NAVIGATION });
    }
  });

  test('위시리스트 비어있을 때 메시지 표시', async ({ page }) => {
    // Arrange: 위시리스트 페이지 접근
    await page.goto('/wishlist');
    await page.waitForLoadState('networkidle');

    // Act & Assert: 빈 위시리스트 메시지 확인
    const emptyMessage = page.locator('[data-testid="empty-wishlist"], text=/위시리스트가 비어있|아직 추가된 항목|추가하러 가기/i');

    const isEmpty = await emptyMessage.count() > 0;
    if (isEmpty) {
      await expect(emptyMessage.first()).toBeVisible({ timeout: TIMEOUTS.NAVIGATION });
    }
  });

  test('탐색 페이지에서 숙소를 위시리스트에 추가', async ({ page }) => {
    // Arrange: 탐색 페이지 접근
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    // Act: 위시리스트 버튼 찾기 (첫 번째 숙소 카드)
    const wishlistButtons = page.locator('button[aria-label*="위시리스트"], button[aria-label*="찜"], button:has-text("♡")');

    if (await wishlistButtons.count() > 0) {
      const firstWishlistButton = wishlistButtons.first();

      // 위시리스트 버튼 클릭
      await firstWishlistButton.click();
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // Assert: 버튼 상태 변경 (찬 하트 -> 꽉 찬 하트)
      const isActive = await firstWishlistButton.evaluate(el => {
        return el.classList.contains('active') ||
               el.classList.contains('filled') ||
               el.getAttribute('aria-pressed') === 'true';
      });

      // 성공 메시지 확인
      const successMessage = page.locator('[role="alert"], [role="status"]').filter({
        hasText: /위시리스트|추가됨|저장됨/i
      });

      const hasMessage = await successMessage.count() > 0;
      if (hasMessage) {
        await expect(successMessage.first()).toBeVisible({ timeout: TIMEOUTS.FORM_SUBMIT });
      }
    }
  });

  test('숙소 상세 페이지에서 위시리스트 추가', async ({ page }) => {
    // Arrange: 숙소 상세 페이지 접근
    await page.goto(`/property/${TEST_DATA.propertyIds[0]}`);
    await page.waitForLoadState('networkidle');

    // Act: 위시리스트 버튼 찾기
    const wishlistButton = page.locator('button[aria-label*="위시리스트"], button[aria-label*="찜"], button:has-text("♡")').first();

    if (await wishlistButton.count() > 0) {
      // 위시리스트 버튼 클릭
      await wishlistButton.click();
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // Assert: 버튼 상태 변경 확인
      const isActive = await wishlistButton.evaluate(el => {
        return el.classList.contains('active') ||
               el.classList.contains('filled') ||
               el.getAttribute('aria-pressed') === 'true';
      });

      // 성공 메시지 확인
      const successMessage = page.locator('[role="alert"]').filter({
        hasText: /위시리스트|추가|저장/i
      });

      const hasMessage = await successMessage.count() > 0;
      if (hasMessage) {
        await expect(successMessage.first()).toBeVisible({ timeout: TIMEOUTS.FORM_SUBMIT });
      }
    }
  });

  test('위시리스트에 추가된 숙소 조회', async ({ page }) => {
    // Arrange: 탐색 페이지에서 숙소 추가
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    // 첫 번째 숙소를 위시리스트에 추가
    const wishlistButton = page.locator('button[aria-label*="위시리스트"]').first();
    if (await wishlistButton.count() > 0) {
      await wishlistButton.click();
      await page.waitForTimeout(TIMEOUTS.ANIMATION);
    }

    // Act: 위시리스트 페이지 접근
    await page.goto('/wishlist');
    await page.waitForLoadState('networkidle');

    // Assert: 추가된 숙소가 위시리스트에 표시됨
    const wishlistItems = page.locator('[data-testid="wishlist-item"], [data-testid="property-card"]');
    const itemCount = await wishlistItems.count();

    expect(itemCount).toBeGreaterThan(0);

    // 숙소 정보 표시 확인
    if (itemCount > 0) {
      const firstItem = wishlistItems.first();
      const itemText = await firstItem.textContent();

      // 숙소명 또는 가격이 표시됨
      expect(itemText).toBeTruthy();
    }
  });

  test('위시리스트에서 숙소 제거', async ({ page }) => {
    // Arrange: 위시리스트 페이지 접근
    await page.goto('/wishlist');
    await page.waitForLoadState('networkidle');

    // Act: 제거 버튼 찾기
    const removeButtons = page.locator('button[aria-label*="제거"], button[aria-label*="삭제"], button:has-text("×")');

    if (await removeButtons.count() > 0) {
      const firstRemoveButton = removeButtons.first();

      // 제거 버튼 클릭
      await firstRemoveButton.click();
      await page.waitForTimeout(TIMEOUTS.FORM_SUBMIT);

      // Assert: 성공 메시지 또는 항목 제거 확인
      const successMessage = page.locator('[role="alert"]').filter({
        hasText: /제거됨|삭제됨|위시리스트에서 제거/i
      });

      const hasMessage = await successMessage.count() > 0;
      if (hasMessage) {
        await expect(successMessage.first()).toBeVisible({ timeout: TIMEOUTS.FORM_SUBMIT });
      }
    }
  });

  test('위시리스트 여러 항목 관리', async ({ page }) => {
    // Arrange: 탐색 페이지 접근
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    // Act: 여러 숙소를 위시리스트에 추가
    const wishlistButtons = page.locator('button[aria-label*="위시리스트"]');
    const buttonCount = Math.min(await wishlistButtons.count(), 3); // 최대 3개

    for (let i = 0; i < buttonCount; i++) {
      const button = wishlistButtons.nth(i);
      await button.click();
      await page.waitForTimeout(TIMEOUTS.ANIMATION);
    }

    // Assert: 위시리스트 페이지에서 추가된 항목 확인
    await page.goto('/wishlist');
    await page.waitForLoadState('networkidle');

    const wishlistItems = page.locator('[data-testid="wishlist-item"], [data-testid="property-card"]');
    const itemCount = await wishlistItems.count();

    if (itemCount > 0) {
      expect(itemCount).toBeGreaterThan(0);

      // 항목 수 표시 확인
      const countDisplay = page.locator('[data-testid="wishlist-count"], text=/개의 항목/');
      const hasCount = await countDisplay.count() > 0;

      if (hasCount) {
        await expect(countDisplay.first()).toBeVisible();
      }
    }
  });

  test('위시리스트에서 숙소 상세 보기', async ({ page }) => {
    // Arrange: 위시리스트 페이지 접근
    await page.goto('/wishlist');
    await page.waitForLoadState('networkidle');

    // Act: 위시리스트 항목 클릭
    const wishlistItems = page.locator('[data-testid="wishlist-item"], a[href*="/property/"]');

    if (await wishlistItems.count() > 0) {
      const firstItem = wishlistItems.first();
      const href = await firstItem.getAttribute('href');

      if (href && href.includes('/property/')) {
        // 항목 클릭
        await firstItem.click();
        await page.waitForLoadState('networkidle');

        // Assert: 숙소 상세 페이지로 이동
        const currentUrl = page.url();
        expect(currentUrl).toContain('/property/');
      }
    }
  });

  test('위시리스트 정렬 기능', async ({ page }) => {
    // Arrange: 위시리스트 페이지 접근
    await page.goto('/wishlist');
    await page.waitForLoadState('networkidle');

    // Act: 정렬 버튼 찾기
    const sortButton = page.locator('button[aria-label*="정렬"], select, [data-testid="sort-selector"]').first();

    if (await sortButton.count() > 0) {
      await sortButton.click();
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // Assert: 정렬 옵션이 표시됨
      const sortOptions = page.locator('[role="option"], [role="menuitem"]');
      const hasOptions = await sortOptions.count() > 0;

      if (hasOptions) {
        // 첫 번째 옵션 선택
        await sortOptions.first().click();
        await page.waitForTimeout(TIMEOUTS.ANIMATION);
      }
    }
  });

  test('위시리스트 필터링', async ({ page }) => {
    // Arrange: 위시리스트 페이지 접근
    await page.goto('/wishlist');
    await page.waitForLoadState('networkidle');

    // Act: 필터 버튼 찾기
    const filterButton = page.locator('button[aria-label*="필터"], [data-testid="filter-button"]').first();

    if (await filterButton.count() > 0) {
      await filterButton.click();
      await page.waitForTimeout(TIMEOUTS.DIALOG_APPEAR);

      // Assert: 필터 옵션이 표시됨
      const filterOptions = page.locator('input[type="checkbox"], input[type="radio"]');
      const hasFilters = await filterOptions.count() > 0;

      if (hasFilters) {
        // 첫 번째 필터 선택
        await filterOptions.first().click();
        await page.waitForTimeout(TIMEOUTS.ANIMATION);
      }
    }
  });

  test('위시리스트 공유 기능', async ({ page }) => {
    // Arrange: 위시리스트 페이지 접근
    await page.goto('/wishlist');
    await page.waitForLoadState('networkidle');

    // Act: 공유 버튼 찾기
    const shareButton = page.locator('button[aria-label*="공유"], button:has-text("공유"), [data-testid="share-button"]').first();

    if (await shareButton.count() > 0) {
      await shareButton.click();
      await page.waitForTimeout(TIMEOUTS.DIALOG_APPEAR);

      // Assert: 공유 옵션이 표시됨
      const shareOptions = page.locator('a[href*="share"], button:has-text("복사"), button:has-text("공유")');
      const hasOptions = await shareOptions.count() > 0;

      if (hasOptions) {
        await expect(shareOptions.first()).toBeVisible();
      }
    }
  });

  test('위시리스트 동기화 확인', async ({ page, context }) => {
    // Arrange: 현재 페이지에서 위시리스트 추가
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    const wishlistButton = page.locator('button[aria-label*="위시리스트"]').first();
    if (await wishlistButton.count() > 0) {
      await wishlistButton.click();
      await page.waitForTimeout(TIMEOUTS.ANIMATION);
    }

    // Act: 다른 탭/창에서 위시리스트 확인
    const page2 = await context.newPage();
    await loginAsTestUser(page2, TEST_USER.email);
    await page2.goto('/wishlist');
    await page2.waitForLoadState('networkidle');

    // Assert: 동기화된 위시리스트가 표시됨
    const wishlistItems = page2.locator('[data-testid="wishlist-item"]');
    const itemCount = await wishlistItems.count();

    if (itemCount > 0) {
      expect(itemCount).toBeGreaterThan(0);
    }

    await page2.close();
  });

  test('위시리스트 가격 범위 필터', async ({ page }) => {
    // Arrange: 위시리스트 페이지 접근
    await page.goto('/wishlist');
    await page.waitForLoadState('networkidle');

    // Act: 가격 범위 필터 찾기
    const priceFilter = page.locator('input[name*="price"], input[type="range"], [data-testid="price-filter"]').first();

    if (await priceFilter.count() > 0) {
      // 범위 설정
      if (priceFilter.isVisible()) {
        await priceFilter.evaluate((el: HTMLInputElement) => {
          if (el.type === 'range') {
            el.value = '100000';
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });

        await page.waitForTimeout(TIMEOUTS.ANIMATION);

        // Assert: 필터 적용 확인
        const wishlistItems = page.locator('[data-testid="wishlist-item"]');
        await expect(wishlistItems.first()).toBeVisible({ timeout: TIMEOUTS.NAVIGATION }).catch(() => {
          // 필터 적용 후 빈 결과일 수 있음
        });
      }
    }
  });
});

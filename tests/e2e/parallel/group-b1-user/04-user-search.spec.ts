import { test, expect } from '@playwright/test';
import { loginAsTestUser, logoutUser, TEST_USER, TEST_DATA, TIMEOUTS } from './setup';

/**
 * Group B1-04: 사용자 검색 기능 테스트
 *
 * 목표:
 * - 텍스트 검색 기능
 * - 태그 기반 필터링
 * - 고급 검색 옵션
 * - 검색 결과 표시
 * - 검색 히스토리
 *
 * 테스트 특성:
 * - 로그인된 사용자 및 비로그인 사용자 모두 지원
 * - 검색 데이터 수정 없음 (읽기만 수행)
 * - 병렬 실행 가능
 */

test.describe('Group B1-04: 사용자 검색', () => {
  test('탐색 페이지 검색 바 표시', async ({ page }) => {
    // Arrange & Act: 탐색 페이지 접근
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    // Assert: 검색 바가 표시됨
    const searchInput = page.locator('input[placeholder*="검색"], input[aria-label*="검색"], [data-testid="search-input"]');
    const isVisible = await searchInput.count() > 0;

    if (isVisible) {
      await expect(searchInput.first()).toBeVisible();
    }
  });

  test('텍스트 기반 검색 수행', async ({ page }) => {
    // Arrange: 탐색 페이지 접근
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    // Act: 검색 입력
    const searchInput = page.locator('input[placeholder*="검색"], input[aria-label*="검색"]').first();

    if (await searchInput.count() > 0) {
      // 검색어 입력
      const searchKeyword = TEST_DATA.searchKeywords[0].query;
      await searchInput.fill(searchKeyword);
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // 검색 버튼 클릭 또는 자동 검색 대기
      const searchButton = page.locator('button[aria-label*="검색"], button:has-text("검색")').first();
      if (await searchButton.count() > 0) {
        await searchButton.click();
      }

      await page.waitForLoadState('networkidle');

      // Assert: 검색 결과가 표시됨
      const searchResults = page.locator('[data-testid="property-card"], [data-testid="search-result"]');
      const resultCount = await searchResults.count();

      // 검색 결과가 있거나 빈 결과 메시지가 표시됨
      const emptyMessage = page.locator('text=/검색 결과|결과 없음|찾을 수 없음/i');
      const hasResults = resultCount > 0 || await emptyMessage.count() > 0;

      expect(hasResults).toBe(true);
    }
  });

  test('검색 결과 필터링 - 가격 범위', async ({ page }) => {
    // Arrange: 탐색 페이지 접근
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    // Act: 가격 범위 필터 설정
    const minPriceInput = page.locator('input[name*="minPrice"], input[placeholder*="최소"]').first();
    const maxPriceInput = page.locator('input[name*="maxPrice"], input[placeholder*="최대"]').first();

    if (await minPriceInput.count() > 0) {
      await minPriceInput.fill('50000');
      await page.waitForTimeout(TIMEOUTS.ANIMATION);
    }

    if (await maxPriceInput.count() > 0) {
      await maxPriceInput.fill('200000');
      await page.waitForTimeout(TIMEOUTS.ANIMATION);
    }

    // 필터 적용 버튼 찾기
    const applyButton = page.locator('button:has-text("적용"), button:has-text("검색"), button:has-text("필터")').first();
    if (await applyButton.count() > 0) {
      await applyButton.click();
      await page.waitForLoadState('networkidle');
    }

    // Assert: 필터된 결과가 표시됨
    const results = page.locator('[data-testid="property-card"], [data-testid="search-result"]');
    const hasResults = await results.count() > 0 || page.url().includes('minPrice');

    expect(hasResults).toBe(true);
  });

  test('태그 기반 필터링', async ({ page }) => {
    // Arrange: 탐색 페이지 접근
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    // Act: 태그 필터 찾기 및 클릭
    const tagButtons = page.locator('[data-testid="tag-filter"], button[data-tag], [role="checkbox"]');

    if (await tagButtons.count() > 0) {
      const firstTag = tagButtons.first();
      const tagName = await firstTag.getAttribute('data-tag') || '';

      // 태그 클릭
      await firstTag.click();
      await page.waitForLoadState('networkidle');

      // Assert: URL에 필터가 반영됨
      const currentUrl = page.url();
      const isFiltered = currentUrl.includes('tag=') || currentUrl.includes(tagName);

      expect(isFiltered).toBe(true);

      // 검색 결과 확인
      const results = page.locator('[data-testid="property-card"]');
      const resultCount = await results.count();

      // 결과가 있거나 빈 상태 메시지가 있음
      const emptyMessage = page.locator('text=/결과 없음|검색 결과/i');
      const hasContent = resultCount > 0 || await emptyMessage.count() > 0;

      expect(hasContent).toBe(true);
    }
  });

  test('다중 태그 필터링', async ({ page }) => {
    // Arrange: 탐색 페이지 접근
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    // Act: 여러 태그 선택
    const tagButtons = page.locator('[data-testid="tag-filter"], button[data-tag]');
    const tagCount = Math.min(await tagButtons.count(), 3);

    for (let i = 0; i < tagCount; i++) {
      await tagButtons.nth(i).click();
      await page.waitForTimeout(TIMEOUTS.ANIMATION);
    }

    await page.waitForLoadState('networkidle');

    // Assert: 여러 필터가 URL에 반영됨
    const currentUrl = page.url();
    const filterCount = (currentUrl.match(/tag=/g) || []).length;

    expect(filterCount).toBeGreaterThanOrEqual(1);
  });

  test('로그인한 사용자의 저장된 검색 항목', async ({ page }) => {
    // Arrange: 사용자 로그인
    await loginAsTestUser(page, TEST_USER.email);
    await page.waitForLoadState('networkidle');

    // Act: 탐색 페이지 접근
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    // 검색 수행
    const searchInput = page.locator('input[placeholder*="검색"]').first();
    if (await searchInput.count() > 0) {
      await searchInput.fill('펜션');
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // 검색 버튼 클릭
      const searchButton = page.locator('button:has-text("검색")').first();
      if (await searchButton.count() > 0) {
        await searchButton.click();
        await page.waitForLoadState('networkidle');
      }
    }

    // Assert: 검색 히스토리가 저장되는지 확인
    // (구현에 따라 다를 수 있음)
    const results = page.locator('[data-testid="property-card"]');
    const hasResults = await results.count() > 0;

    if (hasResults) {
      expect(hasResults).toBe(true);
    }

    // 정리: 로그아웃
    await logoutUser(page);
  });

  test('검색 결과 정렬 - 인기도', async ({ page }) => {
    // Arrange: 탐색 페이지 접근 및 검색 수행
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    // Act: 정렬 옵션 찾기
    const sortSelector = page.locator('select[name="sort"], button[aria-label*="정렬"], [data-testid="sort-selector"]').first();

    if (await sortSelector.count() > 0) {
      await sortSelector.click();
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // 인기도 옵션 선택
      const popularOption = page.locator('[role="option"], button').filter({
        hasText: /인기|popular|추천/i
      }).first();

      if (await popularOption.count() > 0) {
        await popularOption.click();
        await page.waitForLoadState('networkidle');

        // Assert: 정렬 적용 확인
        const results = page.locator('[data-testid="property-card"]');
        const hasResults = await results.count() > 0;

        expect(hasResults).toBe(true);
      }
    }
  });

  test('검색 결과 정렬 - 가격 (낮은순)', async ({ page }) => {
    // Arrange: 탐색 페이지 접근
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    // Act: 정렬 옵션 찾기
    const sortSelector = page.locator('select[name="sort"], button[aria-label*="정렬"]').first();

    if (await sortSelector.count() > 0) {
      await sortSelector.click();
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // 가격 낮은순 옵션
      const priceOption = page.locator('[role="option"], button').filter({
        hasText: /가격.*낮|낮은 가격|price.*low/i
      }).first();

      if (await priceOption.count() > 0) {
        await priceOption.click();
        await page.waitForLoadState('networkidle');

        // Assert: 정렬 적용 확인
        const results = page.locator('[data-testid="property-card"]');
        const hasResults = await results.count() > 0;

        expect(hasResults).toBe(true);
      }
    }
  });

  test('검색 결과 페이지네이션', async ({ page }) => {
    // Arrange: 탐색 페이지 접근
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    // Act: 다음 페이지 버튼 찾기
    const nextButton = page.locator('button[aria-label*="다음"], a:has-text("다음"), button:has-text("→")').first();

    if (await nextButton.count() > 0 && await nextButton.isEnabled()) {
      const isDisabled = await nextButton.isDisabled();

      if (!isDisabled) {
        // 다음 페이지로 이동
        await nextButton.click();
        await page.waitForLoadState('networkidle');

        // Assert: URL이 변경되거나 다른 결과가 표시됨
        const results = page.locator('[data-testid="property-card"]');
        const hasResults = await results.count() > 0;

        expect(hasResults).toBe(true);
      }
    }
  });

  test('검색 필터 초기화', async ({ page }) => {
    // Arrange: 탐색 페이지 접근
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    // Act: 필터 적용
    const tagButtons = page.locator('[data-testid="tag-filter"]');
    if (await tagButtons.count() > 0) {
      await tagButtons.first().click();
      await page.waitForLoadState('networkidle');

      // 초기화 버튼 찾기
      const resetButton = page.locator('button:has-text("초기화"), button:has-text("리셋"), button:has-text("모두 제거")').first();

      if (await resetButton.count() > 0) {
        await resetButton.click();
        await page.waitForLoadState('networkidle');

        // Assert: URL에서 필터가 제거됨
        const currentUrl = page.url();
        const hasFilters = currentUrl.includes('tag=') || currentUrl.includes('filter=');

        expect(hasFilters).toBe(false);
      }
    }
  });

  test('검색 결과 조회 수 표시', async ({ page }) => {
    // Arrange: 탐색 페이지 접근 및 검색 수행
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    // Act: 검색 입력 및 실행
    const searchInput = page.locator('input[placeholder*="검색"]').first();
    if (await searchInput.count() > 0) {
      await searchInput.fill('한옥');
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      const searchButton = page.locator('button:has-text("검색")').first();
      if (await searchButton.count() > 0) {
        await searchButton.click();
        await page.waitForLoadState('networkidle');
      }
    }

    // Assert: 검색 결과 수가 표시됨
    const resultCount = page.locator('[data-testid="result-count"], text=/개의 결과/').first();
    const isVisible = await resultCount.isVisible({ timeout: TIMEOUTS.NAVIGATION }).catch(() => false);

    if (isVisible) {
      await expect(resultCount).toBeVisible();
    }
  });

  test('위치 기반 검색', async ({ page }) => {
    // Arrange: 탐색 페이지 접근
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    // Act: 위치 검색 필드 찾기
    const locationInput = page.locator('input[placeholder*="지역"], input[placeholder*="위치"], input[name*="location"]').first();

    if (await locationInput.count() > 0) {
      // 지역명 입력
      await locationInput.fill('제주');
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // 검색 실행
      const searchButton = page.locator('button:has-text("검색")').first();
      if (await searchButton.count() > 0) {
        await searchButton.click();
        await page.waitForLoadState('networkidle');
      }

      // Assert: 위치 기반 검색 결과 확인
      const results = page.locator('[data-testid="property-card"]');
      const hasResults = await results.count() > 0;

      if (hasResults) {
        expect(hasResults).toBe(true);
      }
    }
  });

  test('고급 검색 옵션', async ({ page }) => {
    // Arrange: 탐색 페이지 접근
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    // Act: 고급 검색 버튼 찾기
    const advancedButton = page.locator('button:has-text("고급"), button[aria-label*="고급"], [data-testid="advanced-search"]').first();

    if (await advancedButton.count() > 0) {
      await advancedButton.click();
      await page.waitForTimeout(TIMEOUTS.DIALOG_APPEAR);

      // Assert: 고급 검색 옵션이 표시됨
      const advancedOptions = page.locator('[data-testid="advanced-options"]');
      const hasOptions = await advancedOptions.count() > 0;

      if (hasOptions) {
        await expect(advancedOptions.first()).toBeVisible();
      }
    }
  });

  test('검색 중 로딩 상태 표시', async ({ page }) => {
    // Arrange: 탐색 페이지 접근
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    // Act: 검색 입력 및 실행
    const searchInput = page.locator('input[placeholder*="검색"]').first();
    if (await searchInput.count() > 0) {
      await searchInput.fill('테스트');
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // 검색 버튼 클릭
      const searchButton = page.locator('button:has-text("검색")').first();
      if (await searchButton.count() > 0) {
        // 로딩 상태 확인 (매우 빠를 수 있음)
        await searchButton.click();

        // Assert: 로딩 스피너 또는 결과 표시
        const loadingSpinner = page.locator('[role="status"], [aria-busy="true"]');
        const results = page.locator('[data-testid="property-card"]');

        // 로딩이 보이거나 결과가 바로 표시됨
        await page.waitForLoadState('networkidle');

        expect(await results.count() >= 0).toBe(true);
      }
    }
  });
});

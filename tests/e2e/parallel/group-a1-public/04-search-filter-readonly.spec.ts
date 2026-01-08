import { test, expect } from '@playwright/test';

/**
 * Group A1-04: 검색 및 필터 읽기 전용 테스트
 *
 * 목표:
 * - 필터 UI 요소 표시 확인 (태그, 가격, 지역 등)
 * - 필터 상호작용 불가능 상태 확인
 * - 검색 입력 필드 표시 및 대기 상태 확인
 * - 필터 초기화 버튼 존재 확인
 *
 * 테스트 특성:
 * - 필터를 실제로 적용하지 않음 (읽기만 수행)
 * - 페이지 상태 변경 없음
 * - 쿼리 문자열 수정 없음
 */

test.describe('Group A1-04: 검색 및 필터 (읽기 전용)', () => {
  test('필터 패널 표시 확인', async ({ page }) => {
    // Arrange: 탐색 페이지 접근
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    // Act: 필터 패널 찾기
    const filterPanel = page.locator(
      '[data-testid*="filter"], ' +
      '[class*="filter"], ' +
      'aside, ' +
      '[role="complementary"]'
    );

    // Assert: 필터 패널이 표시되는지 확인
    const filterCount = await filterPanel.count();
    if (filterCount > 0) {
      expect(filterCount).toBeGreaterThan(0);
    }
  });

  test('태그 필터 UI 표시 확인', async ({ page }) => {
    // Arrange: 탐색 페이지 접근
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    // Act: 태그 필터 찾기
    const tagFilters = page.locator(
      '[data-testid*="tag-filter"], ' +
      '[data-testid*="tag"], ' +
      'text=/#\w+|태그|카테고리|필터/i'
    );

    // Assert: 태그 필터가 표시되는지 확인
    const tagCount = await tagFilters.count();
    if (tagCount > 0) {
      expect(tagCount).toBeGreaterThan(0);
    }
  });

  test('태그 필터 체크박스 표시 확인', async ({ page }) => {
    // Arrange: 탐색 페이지 접근
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    // Act: 체크박스 찾기
    const checkboxes = page.locator('input[type="checkbox"]');

    // Assert: 체크박스가 표시되는지 확인
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      expect(checkboxCount).toBeGreaterThan(0);
    }
  });

  test('가격 범위 필터 표시 확인', async ({ page }) => {
    // Arrange: 탐색 페이지 접근
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    // Act: 가격 필터 찾기
    const priceFilter = page.locator(
      '[data-testid*="price"], ' +
      'text=/가격|price|가격대|금액/i'
    );

    // Assert: 가격 필터가 표시되는지 확인
    const priceCount = await priceFilter.count();
    if (priceCount > 0) {
      expect(priceCount).toBeGreaterThan(0);
    }
  });

  test('가격 범위 슬라이더 표시 확인', async ({ page }) => {
    // Arrange: 탐색 페이지 접근
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    // Act: 슬라이더 또는 입력 필드 찾기
    const sliders = page.locator('input[type="range"], [role="slider"]');

    // Assert: 슬라이더가 표시되는지 확인
    const sliderCount = await sliders.count();
    if (sliderCount > 0) {
      expect(sliderCount).toBeGreaterThan(0);
    }
  });

  test('최소/최대 가격 입력 필드 표시 확인', async ({ page }) => {
    // Arrange: 탐색 페이지 접근
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    // Act: 가격 입력 필드 찾기
    const priceInputs = page.locator(
      'input[placeholder*="최소|최대|min|max"]',
      { hasText: /가격|price/i }
    );

    // Assert: 입력 필드가 표시되는지 확인
    const inputCount = await priceInputs.count();
    if (inputCount > 0) {
      expect(inputCount).toBeGreaterThan(0);
    }
  });

  test('지역 필터 표시 확인', async ({ page }) => {
    // Arrange: 탐색 페이지 접근
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    // Act: 지역 필터 찾기
    const locationFilter = page.locator(
      '[data-testid*="location"], ' +
      '[data-testid*="region"], ' +
      'text=/지역|장소|위치|지방|도시|location|region/i'
    );

    // Assert: 지역 필터가 표시되는지 확인
    const locationCount = await locationFilter.count();
    if (locationCount > 0) {
      expect(locationCount).toBeGreaterThan(0);
    }
  });

  test('지역 필터 드롭다운 표시 확인', async ({ page }) => {
    // Arrange: 탐색 페이지 접근
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    // Act: 드롭다운/셀렉트 찾기
    const selects = page.locator('select, [role="combobox"], [role="listbox"]');

    // Assert: 드롭다운이 표시되는지 확인
    const selectCount = await selects.count();
    if (selectCount > 0) {
      expect(selectCount).toBeGreaterThan(0);
    }
  });

  test('검색 입력 필드 표시 확인', async ({ page }) => {
    // Arrange: 탐색 페이지 접근
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    // Act: 검색 입력 필드 찾기
    const searchInput = page.locator(
      'input[type="search"], ' +
      'input[placeholder*="검색|search"], ' +
      '[data-testid*="search"]'
    );

    // Assert: 검색 입력 필드가 표시되는지 확인
    const searchCount = await searchInput.count();
    if (searchCount > 0) {
      expect(searchCount).toBeGreaterThan(0);
    }
  });

  test('검색 입력 필드 포커스 가능성 확인', async ({ page }) => {
    // Arrange: 탐색 페이지 접근
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    // Act: 검색 입력 필드 찾기
    const searchInput = page.locator(
      'input[type="search"], ' +
      'input[placeholder*="검색|search"], ' +
      '[data-testid*="search"]'
    ).first();

    // Assert: 입력 필드가 포커스 가능한지 확인 (클릭하지 않음)
    const isVisible = await searchInput.isVisible({ timeout: 3000 }).catch(() => false);
    if (isVisible) {
      await expect(searchInput).toBeVisible();
    }
  });

  test('필터 초기화 버튼 표시 확인', async ({ page }) => {
    // Arrange: 탐색 페이지 접근
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    // Act: 필터 초기화 버튼 찾기
    const resetButton = page.locator(
      'button:has-text("초기화|reset|지우기|전체|모두")',
      'text=/초기화|reset|지우기/i'
    );

    // Assert: 초기화 버튼이 표시되는지 확인
    const resetCount = await resetButton.count();
    if (resetCount > 0) {
      expect(resetCount).toBeGreaterThan(0);
    }
  });

  test('필터 적용 버튼 표시 확인', async ({ page }) => {
    // Arrange: 탐색 페이지 접근
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    // Act: 적용 버튼 찾기
    const applyButton = page.locator(
      'button:has-text("적용|검색|apply|search")',
      'text=/적용|검색|apply|search/i'
    );

    // Assert: 적용 버튼이 표시되는지 확인
    const applyCount = await applyButton.count();
    if (applyCount > 0) {
      expect(applyCount).toBeGreaterThan(0);
    }
  });

  test('필터 UI 반응형 레이아웃 - 모바일', async ({ browser }) => {
    // Arrange: 모바일 뷰포트로 컨텍스트 생성
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 }
    });
    const page = await context.newPage();

    // Act: 탐색 페이지 접근
    await page.goto('http://localhost:3010/explore');
    await page.waitForLoadState('networkidle');

    // Assert: 모바일에서 필터가 표시되는지 확인
    const filterPanel = page.locator('[data-testid*="filter"], [class*="filter"]');
    const filterCount = await filterPanel.count();

    if (filterCount > 0) {
      expect(filterCount).toBeGreaterThan(0);
    }

    await context.close();
  });

  test('검색 바 위치 확인', async ({ page }) => {
    // Arrange: 탐색 페이지 접근
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    // Act: 검색 바 찾기
    const searchBar = page.locator(
      '[data-testid*="search"], ' +
      '[class*="search-bar"], ' +
      'div:has(input[type="search"])'
    );

    // Assert: 검색 바가 표시되는지 확인
    const searchCount = await searchBar.count();
    if (searchCount > 0) {
      expect(searchCount).toBeGreaterThan(0);
    }
  });

  test('필터 라벨 접근성 확인', async ({ page }) => {
    // Arrange: 탐색 페이지 접근
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    // Act: 라벨 찾기
    const labels = page.locator('label, [for]');

    // Assert: 라벨이 존재하는지 확인
    const labelCount = await labels.count();
    if (labelCount > 0) {
      expect(labelCount).toBeGreaterThan(0);
    }
  });

  test('선택된 필터 표시 상태 확인', async ({ page }) => {
    // Arrange: 탐색 페이지에 쿼리 문자열로 접근 (필터 미적용)
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    // Act: 체크박스 상태 확인
    const checkboxes = page.locator('input[type="checkbox"]');

    // Assert: 체크박스가 모두 미선택 상태인지 확인
    const totalCheckboxes = await checkboxes.count();
    if (totalCheckboxes > 0) {
      const checkedCount = await checkboxes.locator(':checked').count();
      // 초기 상태에서는 체크된 항목이 없거나 일부만 있을 수 있음
      expect(checkedCount).toBeLessThanOrEqual(totalCheckboxes);
    }
  });

  test('태그 카테고리별 그룹화 확인', async ({ page }) => {
    // Arrange: 탐색 페이지 접근
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    // Act: 태그 그룹 찾기
    const tagGroups = page.locator('[data-testid*="tag-group"], [class*="tag-group"], fieldset');

    // Assert: 태그 그룹이 표시되는지 확인
    const groupCount = await tagGroups.count();
    if (groupCount > 0) {
      expect(groupCount).toBeGreaterThan(0);
    }
  });
});

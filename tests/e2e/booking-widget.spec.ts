import { test, expect } from '@playwright/test';

test.describe('Booking Widget', () => {
  test('should display booking widget with price', async ({ page }) => {
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    // Navigate to a property detail page
    const firstProperty = page.locator('a[href^="/property/"]').first();
    await firstProperty.click();

    await expect(page).toHaveURL(/\/property\//);

    // Check for booking widget elements
    const priceText = page.locator('text=1박 기준, text=/₩[0-9,]+/').first();
    await expect(priceText).toBeVisible({ timeout: 5000 });

    // Check for date selector
    const dateButton = page.locator('button:has-text("날짜"), text=날짜를 선택하세요').first();
    await expect(dateButton).toBeVisible({ timeout: 5000 });

    // Check for guest selector
    const guestSelector = page.locator('text=게스트, button:has-text("게스트")').first();
    await expect(guestSelector).toBeVisible({ timeout: 5000 });
  });

  test('should open date picker when clicked', async ({ page }) => {
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    const firstProperty = page.locator('a[href^="/property/"]').first();
    await firstProperty.click();

    await expect(page).toHaveURL(/\/property\//);

    // Click on date button
    const dateButton = page.locator('button:has-text("날짜"), button >> text=날짜를 선택하세요').first();
    await dateButton.click();

    // Calendar should appear
    const calendar = page.locator('[role="grid"], .rdp, [class*="calendar"]').first();
    await expect(calendar).toBeVisible({ timeout: 3000 });
  });

  test('should show guest selector dropdown', async ({ page }) => {
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    const firstProperty = page.locator('a[href^="/property/"]').first();
    await firstProperty.click();

    await expect(page).toHaveURL(/\/property\//);

    // Find and click guest selector
    const guestButton = page.locator('[role="combobox"]:has-text("게스트")').first();

    if (await guestButton.isVisible()) {
      await guestButton.click();

      // Dropdown should appear
      const dropdown = page.locator('[role="listbox"], [role="option"]').first();
      await expect(dropdown).toBeVisible({ timeout: 3000 });
    }
  });

  test('should disable past dates in calendar', async ({ page }) => {
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    const firstProperty = page.locator('a[href^="/property/"]').first();
    await firstProperty.click();

    await expect(page).toHaveURL(/\/property\//);

    // Open date picker
    const dateButton = page.locator('button:has-text("날짜"), button >> text=날짜를 선택하세요').first();
    await dateButton.click();

    // Check that there are disabled dates (past dates)
    const disabledDates = page.locator('[aria-disabled="true"], .rdp-day_disabled, [class*="disabled"]');

    // Wait a bit for calendar to render
    await page.waitForTimeout(500);

    const count = await disabledDates.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should show reserve button', async ({ page }) => {
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    const firstProperty = page.locator('a[href^="/property/"]').first();
    await firstProperty.click();

    await expect(page).toHaveURL(/\/property\//);

    // Check for reserve button
    const reserveButton = page.locator('button:has-text("예약하기")').first();
    await expect(reserveButton).toBeVisible({ timeout: 5000 });

    // Button should be disabled initially (no dates selected)
    await expect(reserveButton).toBeDisabled();
  });
});

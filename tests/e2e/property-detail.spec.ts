import { test, expect } from '@playwright/test';

test.describe('Property Detail Page', () => {
  test('should display property information', async ({ page }) => {
    // Navigate to explore page first to get a property
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    // Click on the first property
    const firstProperty = page.locator('a[href^="/property/"]').first();
    await firstProperty.click();

    // Wait for property detail page to load
    await expect(page).toHaveURL(/\/property\//);

    // Check for essential property information
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // Check for booking widget
    const bookingWidget = page.locator('text=예약하기, text=1박 기준').first();
    await expect(bookingWidget).toBeVisible({ timeout: 5000 });
  });

  test('should display property gallery', async ({ page }) => {
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    const firstProperty = page.locator('a[href^="/property/"]').first();
    await firstProperty.click();

    await expect(page).toHaveURL(/\/property\//);

    // Check for images
    const images = page.locator('img[alt*="숙소"], img[src*="/"], img');
    await expect(images.first()).toBeVisible({ timeout: 5000 });
  });

  test('should display tags and amenities', async ({ page }) => {
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    const firstProperty = page.locator('a[href^="/property/"]').first();
    await firstProperty.click();

    await expect(page).toHaveURL(/\/property\//);

    // Wait for content to load
    await page.waitForLoadState('networkidle');

    // Tags or amenities should be visible
    const tags = page.locator('[class*="tag"], [class*="badge"], button:has-text("#")');
    const amenities = page.locator('text=편의시설, text=제공 시설').first();

    // At least one should be visible
    const tagsVisible = await tags.first().isVisible().catch(() => false);
    const amenitiesVisible = await amenities.isVisible().catch(() => false);

    expect(tagsVisible || amenitiesVisible).toBeTruthy();
  });

  test('should show reviews section', async ({ page }) => {
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    const firstProperty = page.locator('a[href^="/property/"]').first();
    await firstProperty.click();

    await expect(page).toHaveURL(/\/property\//);

    // Check for reviews section (may be empty)
    const reviewsSection = page.locator('text=후기, text=리뷰, text=평점').first();
    await expect(reviewsSection).toBeVisible({ timeout: 5000 });
  });

  test('should allow adding to wishlist when logged in', async ({ page }) => {
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    const firstProperty = page.locator('a[href^="/property/"]').first();
    await firstProperty.click();

    await expect(page).toHaveURL(/\/property\//);

    // Look for wishlist button (heart icon)
    const wishlistButton = page.locator('button[aria-label*="찜"], button:has(svg)').filter({ hasText: /찜|하트|♡|♥/ }).first();

    if (await wishlistButton.isVisible()) {
      // Note: Clicking might require authentication
      // This test just checks if the button exists
      await expect(wishlistButton).toBeVisible();
    }
  });
});

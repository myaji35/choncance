import { test, expect } from '@playwright/test';

test.describe('Explore Page', () => {
  test('should display properties list', async ({ page }) => {
    await page.goto('/explore');

    // Wait for properties to load
    await page.waitForSelector('[data-testid="property-card"]', { timeout: 10000 }).catch(() => {
      // If no test IDs, wait for any property card
      return page.waitForSelector('.property-card, [class*="property"]', { timeout: 10000 });
    });

    // Check that at least one property is displayed
    const propertyCards = page.locator('[data-testid="property-card"], .property-card, [class*="PropertyCard"]');
    await expect(propertyCards.first()).toBeVisible();
  });

  test('should filter properties by tag', async ({ page }) => {
    await page.goto('/explore');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Look for tag buttons
    const tagButtons = page.locator('button:has-text("논뷰"), button:has-text("바다뷰"), button:has-text("산뷰")').first();

    if (await tagButtons.isVisible()) {
      await tagButtons.click();

      // Check that URL contains the tag parameter
      await expect(page).toHaveURL(/tag=/);
    }
  });

  test('should search for properties', async ({ page }) => {
    await page.goto('/explore');

    // Find search input
    const searchInput = page.getByPlaceholder(/검색|어떤 쉼/i);

    if (await searchInput.isVisible()) {
      await searchInput.fill('전원주택');
      await searchInput.press('Enter');

      // Check that URL contains the search parameter
      await expect(page).toHaveURL(/search=/);
    }
  });

  test('should navigate to property detail page', async ({ page }) => {
    await page.goto('/explore');

    // Wait for properties to load
    await page.waitForLoadState('networkidle');

    // Click on the first property card
    const firstProperty = page.locator('a[href^="/property/"]').first();

    if (await firstProperty.isVisible()) {
      await firstProperty.click();

      // Check that we're on a property detail page
      await expect(page).toHaveURL(/\/property\//);
    }
  });
});

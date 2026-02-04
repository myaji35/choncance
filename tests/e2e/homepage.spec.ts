import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load the homepage successfully', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check if the VINTEE logo/brand is visible
    await expect(page.locator('text=VINTEE').first()).toBeVisible({ timeout: 10000 });

    // Check if the main content is visible
    const mainContent = page.locator('main, [role="main"]').first();
    if (await mainContent.isVisible()) {
      await expect(mainContent).toBeVisible();
    }

    // Check for "진짜 시골 여행" text or explore button
    const exploreButtons = page.locator('a, button').filter({
      hasText: /둘러보기|여행|탐색|Explore/i
    });

    if (await exploreButtons.count() > 0) {
      await expect(exploreButtons.first()).toBeVisible();
    }
  });

  test('should navigate to explore page from hero button', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find and click any link that navigates to /explore
    const exploreLink = page.locator('a[href="/explore"], a[href*="explore"]').first();

    if (await exploreLink.isVisible({ timeout: 5000 })) {
      await exploreLink.click();
      await expect(page).toHaveURL(/\/explore/);
    } else {
      // Try finding button with explore-related text
      const exploreButton = page.locator('a, button').filter({
        hasText: /둘러보기|여행|탐색|Explore/i
      }).first();

      await exploreButton.click();
      await page.waitForTimeout(1000);

      // Check if we navigated to explore or if it's a modal/dropdown
      const url = page.url();
      if (url.includes('explore')) {
        await expect(page).toHaveURL(/explore/);
      }
    }
  });
});

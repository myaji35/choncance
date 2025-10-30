import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load the homepage successfully', async ({ page }) => {
    await page.goto('/');

    // Check if the main hero section is visible
    await expect(page.getByRole('heading', { name: /진짜 시골의 여유를 찾다/ })).toBeVisible();

    // Check if the "숙소 둘러보기" button is visible
    await expect(page.getByRole('link', { name: /숙소 둘러보기/ })).toBeVisible();
  });

  test('should navigate to explore page from hero button', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: /숙소 둘러보기/ }).first().click();

    await expect(page).toHaveURL(/\/explore/);
  });
});

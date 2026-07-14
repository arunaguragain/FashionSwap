import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('renders main element and header', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('main')).toBeVisible();
    // logo should be visible 
    await expect(page.locator('img[alt="FashionSwap"]').first()).toBeVisible();
  });

  test('Shop Now navigates to login', async ({ page }) => {
    await page.goto('/');
    const shopLocator = page.locator('a:has-text("Shop Now")');
    const shopLink = shopLocator.first();
    await shopLink.scrollIntoViewIfNeeded();
    await shopLink.waitFor({ state: 'visible', timeout: 5000 });
    await shopLink.click();
    await Promise.any([
      page.waitForURL('/login', { timeout: 10000 }),
      page.waitForSelector('#email', { timeout: 10000 }),
    ]);
    await expect(page.locator('#email').first()).toBeVisible();
  });
});

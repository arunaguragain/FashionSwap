import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('renders main element and header', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('main')).toBeVisible();
    // logo should be visible 
    await expect(page.locator('img[alt="Aashwaas"]').first()).toBeVisible();
  });

  test('Donate Now navigates to donor login', async ({ page }) => {
    await page.goto('/');
    const donateLocator = page.locator('a:has-text("Donate Now")');
    const donateLink = donateLocator.first();
    await donateLink.scrollIntoViewIfNeeded();
    await donateLink.waitFor({ state: 'visible', timeout: 5000 });
    await donateLink.click();
    await Promise.any([
      page.waitForURL('/donor_login', { timeout: 10000 }),
      page.waitForSelector('#email', { timeout: 10000 }),
    ]);
    await expect(page.locator('#email').first()).toBeVisible();
  });
});

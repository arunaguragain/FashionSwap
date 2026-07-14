import { test, expect } from '@playwright/test';

test.describe('Auth and protected routes', () => {
  test('login page shows the auth form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test('register page shows the account form', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible();
    await expect(page.getByLabel(/full name/i)).toBeVisible();
  });

  test('create listing redirects unauthenticated visitors to login', async ({ page }) => {
    await page.goto('/listing/create');
    await expect(page).toHaveURL(/\/login$/);
  });
});

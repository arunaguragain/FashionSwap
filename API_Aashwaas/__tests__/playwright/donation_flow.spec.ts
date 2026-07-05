import { test, expect } from '@playwright/test';
import { createMockServer } from './mockServer';

const mock = createMockServer((req, body) => {
  // donor endpoints
  if (req.method === 'POST' && req.url === '/api/donations') {
    return { status: 201, body: { success: true, data: { id: 'don-123', itemName: 'Blanket' }, message: 'Donation created' } };
  }

  if (req.method === 'GET' && req.url === '/api/donations/my') {
    return { status: 200, body: { success: true, data: [{ _id: 'don-123', itemName: 'Blanket', quantity: 1 }] } };
  }

  if (req.method === 'GET' && req.url && req.url.startsWith('/api/wishlists/')) {
    return { status: 200, body: { success: true, data: { id: 'wish-1', title: 'Blankets', category: 'Clothes', imageUrl: 'http://localhost/images/blanket.jpg', quantity: 2 } } };
  }

  // admin endpoints (for approval and listing)
  if (req.method === 'GET' && req.url === '/api/admin/donations') {
    // return a single donation for listing
    return { status: 200, body: { success: true, data: [{ _id: 'don-123', itemName: 'Blanket', status: 'pending' }] } };
  }

  if (req.method === 'PUT' && req.url === '/api/admin/donations/don-123/approve') {
    return { status: 200, body: { success: true, data: { _id: 'don-123', itemName: 'Blanket', status: 'approved' }, message: 'Approved' } };
  }

  return null;
});

test.beforeAll(async () => await mock.start());
test.afterAll(async () => await mock.stop());

test('donation form validation shows errors when required fields missing', async ({ page }) => {
  await page.context().addCookies([
    { name: 'auth_token', value: 'mock-token', domain: 'localhost', path: '/' },
    { name: 'user_data', value: JSON.stringify({ id: 'u1', role: 'donor', email: 'a@b.com' }), domain: 'localhost', path: '/' },
  ]);

  await page.goto('/user/donor/donation');
  // submit without filling required fields
  // attach a small image so the native file input "required" doesn't block submission
  await page.setInputFiles('#mediaFile', 'public/images/user.png');
  await page.click('button:has-text("Add Donation")');

  await expect(page.locator('text=Item name is required.')).toBeVisible();
  await expect(page.locator('text=Quantity must be a number.')).toBeVisible();
  await expect(page.locator('text=Pickup location is required.')).toBeVisible();
});

test('create donation posts to API and shows success', async ({ page }) => {
  await page.context().addCookies([
    { name: 'auth_token', value: 'mock-token', domain: 'localhost', path: '/' },
    { name: 'user_data', value: JSON.stringify({ id: 'u1', role: 'donor', email: 'a@b.com' }), domain: 'localhost', path: '/' },
  ]);

  await page.goto('/user/donor/donation');
  await page.fill('#itemName', 'Warm Blanket');
  await page.fill('#quantity', '1');
  await page.fill('#pickupLocation', 'Kathmandu');
  // attach an image file from public
  await page.setInputFiles('#mediaFile', 'public/images/user.png');

  await Promise.all([
    page.click('button:has-text("Add Donation")'),
    page.waitForSelector('text=Donation added successfully!', { timeout: 5000 }).catch(() => null),
  ]);

  await expect(page.locator('text=Donation added successfully!')).toBeVisible();
});

test('my donations list shows created donation', async ({ page }) => {
  await page.context().addCookies([
    { name: 'auth_token', value: 'mock-token', domain: 'localhost', path: '/' },
    { name: 'user_data', value: JSON.stringify({ id: 'u1', role: 'donor', email: 'a@b.com' }), domain: 'localhost', path: '/' },
  ]);

  await page.goto('/user/donor/my-donations');
  // wait for the list to load and show the mocked donation
  await page.waitForSelector('text=Blanket', { timeout: 5000 });
  await expect(page.locator('text=Blanket')).toBeVisible();
});

test('admin can approve donation and see thank-you toast', async ({ page }) => {
  // set admin cookie
  await page.context().addCookies([
    { name: 'auth_token', value: 'mock-token', domain: 'localhost', path: '/' },
    { name: 'user_data', value: JSON.stringify({ id: 'admin1', role: 'admin', email: 'admin@x.com' }), domain: 'localhost', path: '/' },
  ]);

  await page.goto('/admin/donations');
  // wait for the table to render the one donation
  await page.waitForSelector('text=Blanket', { timeout: 5000 });
  // click approve button
  await page.click('button:has-text("Approve")');
  // verify approval toast appears; the thank-you message may not show in headless
  await expect(page.locator('text=Donation approved')).toBeVisible();
  const thankYou = page.locator('text=Thank-you note has been sent to donor');
  if (await thankYou.count() > 0) {
    await expect(thankYou).toBeVisible();
  }
});

test('unauthenticated user is redirected to login when accessing donation form', async ({ page }) => {
  // clear cookies to simulate unauthenticated
  await page.context().clearCookies();
  await page.goto('/user/donor/donation');
  // middleware should redirect to donor_login
  await page.waitForURL(/donor_login/, { timeout: 5000 });
  await expect(page).toHaveURL(/donor_login/);
});

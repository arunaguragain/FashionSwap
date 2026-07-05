import { test, expect } from '@playwright/test';
import { createMockServer } from './mockServer';

const mock = createMockServer((req, body) => {
  if (req.method === 'GET' && req.url && req.url.startsWith('/api/wishlists/')) {
    return {
      status: 200,
      body: { success: true, data: { id: 'wish-1', title: 'Blankets', category: 'Clothes', imageUrl: 'http://localhost/images/blanket.jpg', quantity: 2 } },
    };
  }

  if (req.method === 'POST' && req.url === '/api/donations') {
    return {
      status: 201,
      body: { success: true, data: { id: 'don-1' }, message: 'Donation created' },
    };
  }

  return null;
});

test.beforeAll(async () => await mock.start());
test.afterAll(async () => await mock.stop());

test('create donation from wishlist prefill', async ({ page }) => {
  // ensure user is logged in by setting auth cookies
  await page.context().addCookies([
    { name: 'auth_token', value: 'mock-token', domain: 'localhost', path: '/' },
    { name: 'user_data', value: JSON.stringify({ id: 'mock-id', role: 'donor', email: 'donor@gmail.com' }), domain: 'localhost', path: '/' },
  ]);

  // navigate with wishlistId to prefill
  await page.goto('/user/donor/donation?wishlistId=wish-1');

  // allow time for client mount and prefill
  await page.waitForTimeout(500);

  // wait for prefill to apply (itemName populated by client-side effect)
  await page.waitForFunction(() => (document.querySelector('#itemName') as HTMLInputElement)?.value?.length > 0, undefined, { timeout: 30000 });
  const itemName = await page.inputValue('#itemName');
  expect(itemName.toLowerCase()).toContain('blanket');

  // fill required fields
  await page.fill('#quantity', '2');
  await page.fill('#pickupLocation', 'Kathmandu');

  // submit — when created from a wishlist the app redirects to the wishlist page
  await Promise.all([
    page.waitForURL('/user/donor/wishlist', { timeout: 10000 }),
    page.click('button:has-text("Add Donation")'),
  ]);

  await expect(page).toHaveURL(/\/user\/donor\/wishlist/);
});

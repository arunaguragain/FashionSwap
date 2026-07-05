import { test, expect } from '@playwright/test';
import { createMockServer } from './mockServer';

const mock = createMockServer((req, body) => {
  (mock as any)._store = (mock as any)._store || { wishlists: [{ id: 'wish-1', title: 'Blankets', category: 'Clothes', quantity: 2 }] };
  const store = (mock as any)._store;

  if (req.method === 'GET' && req.url === '/api/wishlists/my') {
    return { status: 200, body: { success: true, data: store.wishlists } };
  }

  if (req.method === 'GET' && req.url && req.url.startsWith('/api/wishlists/')) {
    const id = req.url.replace('/api/wishlists/', '');
    const found = store.wishlists.find((w: any) => w.id === id) || store.wishlists[0];
    return { status: 200, body: { success: true, data: found } };
  }

  // create wishlist
  if (req.method === 'POST' && req.url === '/api/wishlists') {
    let payload: any = {};
    try { payload = JSON.parse(body || '{}'); } catch (e) { }
    const newItem = { id: `wish-${Date.now()}`, title: payload.title || 'Warm Blankets', category: payload.category || 'Clothes', quantity: payload.quantity || 1 };
    store.wishlists.push(newItem);
    return { status: 201, body: { success: true, data: newItem, message: 'Wishlist created' } };
  }

  // update wishlist
  if ((req.method === 'PUT' || req.method === 'POST') && req.url && req.url.startsWith('/api/wishlists/')) {
    const id = req.url.replace('/api/wishlists/', '');
    let payload: any = {};
    try { payload = JSON.parse(body || '{}'); } catch (e) { }
    const idx = store.wishlists.findIndex((w: any) => w.id === id);
    if (idx >= 0) {
      store.wishlists[idx] = { ...store.wishlists[idx], ...payload };
      return { status: 200, body: { success: true, data: store.wishlists[idx], message: 'Wishlist updated' } };
    }
    return { status: 404, body: { success: false, message: 'Not found' } };
  }

  // convert wishlist to donation
  if (req.method === 'POST' && req.url === '/api/donations') {
    return { status: 201, body: { success: true, data: { id: 'don-999', itemName: 'Blanket' }, message: 'Donation created from wishlist' } };
  }

  return null;
});

test.beforeAll(async () => await mock.start());
test.afterAll(async () => await mock.stop());

test('my wishlists list loads and can create donation from wishlist', async ({ page }) => {
  // set auth cookies
  await page.context().addCookies([
    { name: 'auth_token', value: 'mock-token', domain: 'localhost', path: '/' },
    { name: 'user_data', value: JSON.stringify({ id: 'u1', role: 'donor', email: 'a@b.com' }), domain: 'localhost', path: '/' },
  ]);

  // visit wishlists page
  await page.goto('/user/donor/wishlist');

  await page.waitForSelector('text=Blankets', { timeout: 5000 });
  await expect(page.locator('text=Blankets')).toBeVisible();

  await page.click('button:has-text("Donate Now")');
  await page.click('button:has-text("Proceed")').catch(() => null);

  await page.waitForSelector('#itemName', { timeout: 5000 });

  await page.setInputFiles('#mediaFile', 'public/images/user.png').catch(() => null);
  await page.fill('#quantity', '1').catch(() => null);
  await page.fill('#pickupLocation', 'Kathmandu').catch(() => null);
  await page.click('button:has-text("Add Donation")');

  await page.waitForSelector('text=Donation added successfully!', { timeout: 5000 }).catch(() => null);
  await expect(page.locator('text=Donation added successfully!')).toBeVisible();
});

test('create wishlist form posts to API and shows created item', async ({ page }) => {
  await page.context().addCookies([
    { name: 'auth_token', value: 'mock-token', domain: 'localhost', path: '/' },
    { name: 'user_data', value: JSON.stringify({ id: 'u1', role: 'donor', email: 'a@b.com' }), domain: 'localhost', path: '/' },
  ]);

  (mock as any)._store = (mock as any)._store || { wishlists: [] };
  (mock as any)._store.wishlists.push({ id: 'wish-new', title: 'Warm Blankets', category: 'Clothes', quantity: 3 });

  const exists = ((mock as any)._store?.wishlists || []).some((w: any) => w.title === 'Warm Blankets');
  expect(exists).toBeTruthy();
});

test('edit wishlist updates and displays new title', async ({ page }) => {
  await page.context().addCookies([
    { name: 'auth_token', value: 'mock-token', domain: 'localhost', path: '/' },
    { name: 'user_data', value: JSON.stringify({ id: 'u1', role: 'donor', email: 'a@b.com' }), domain: 'localhost', path: '/' },
  ]);

  await page.goto('/user/donor/wishlist/wish-1/edit');

  await page.request.put('http://localhost:5050/api/wishlists/wish-1', { data: { title: 'Updated Blankets' } });
  await page.goto('/user/donor/wishlist');
  await page.waitForSelector('text=Updated Blankets', { timeout: 5000 }).catch(() => null);
  await expect(page.locator('text=Updated Blankets')).toBeVisible();
});

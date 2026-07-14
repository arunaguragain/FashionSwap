import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  workers: 1,
  testDir: '__tests__/playwright',
  timeout: 30 * 1000,
  expect: { timeout: 5000 },
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'off',
    screenshot: 'off',
    video: 'off',
    headless: true,
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    env: {
      NEXT_PUBLIC_API_BASE_URL: 'http://localhost:5050',
    },
    timeout: 120 * 1000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});

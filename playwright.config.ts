import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  use: {
    headless: true,
    baseURL: 'https://test.netlify.app/',
    screenshot: 'only-on-failure',
  },
  reporter: [['list']],
});

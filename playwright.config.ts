import {defineConfig, devices} from '@playwright/test';

const deployedBaseUrl = process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: process.env.CI ? 1 : undefined,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: deployedBaseUrl ?? 'http://127.0.0.1:3000',
    trace: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: {...devices['Desktop Chrome']}
    }
  ],
  webServer: deployedBaseUrl ? undefined : {
    command: 'pnpm start',
    url: 'http://127.0.0.1:3000/ja',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
});

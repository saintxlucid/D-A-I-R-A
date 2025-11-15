import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm --filter ./packages/frontend... dev',
    port: 3000,
    timeout: 120 * 1000,
    reuseExistingServer: true,
  },
});

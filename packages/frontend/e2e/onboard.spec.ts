import { test, expect } from '@playwright/test';
test('user registers, logs in, creates profile', async ({ page }) => {
  await page.goto('/auth/register');
  await page.fill('input[type=email]', 'test@daira.app');
  await page.fill('input[type=password]', 'secret');
  await page.click('button[type=submit]');
  await expect(page.locator('text=Registered!')).toBeVisible();
  await page.goto('/auth/login');
  await page.fill('input[type=email]', 'test@daira.app');
  await page.fill('input[type=password]', 'secret');
  await page.click('button[type=submit]');
  await expect(page.locator('text=Logged in!')).toBeVisible();
  await page.goto('/profile');
  await page.fill('input[type=text]', 'TestUser');
  await page.click('button:has-text("PUBLIC")');
  await expect(page.locator('text=PUBLIC')).toBeVisible();
});

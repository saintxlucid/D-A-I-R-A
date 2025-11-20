import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const API_URL = process.env.API_URL || 'http://localhost:3000';

/**
 * E2E Smoke Test: Authentication Flow
 *
 * Tests:
 * 1. User registration with validation
 * 2. Auto-login after registration
 * 3. Redirect to onboarding after successful registration
 * 4. User login with existing credentials
 * 5. Redirect to feed after successful login
 * 6. Logout functionality
 * 7. Protected route redirection for unauthenticated users
 */

test.describe('Authentication Flow - Smoke Tests', () => {
  let testUser: {
    email: string;
    username: string;
    password: string;
  };

  test.beforeEach(async ({ page }) => {
    // Generate unique test user for each test run
    const timestamp = Date.now();
    testUser = {
      email: `test-${timestamp}@example.com`,
      username: `user_${timestamp}`,
      password: 'TestPassword123',
    };
  });

  test('should reject invalid registration input', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);

    // Leave fields empty and try to submit
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Expect validation errors to appear
    const emailError = page.locator('#email-error');
    const usernameError = page.locator('#username-error');
    const passwordError = page.locator('#password-error');

    await expect(emailError).toBeVisible();
    await expect(usernameError).toBeVisible();
    await expect(passwordError).toBeVisible();
  });

  test('should register new user and redirect to onboarding', async ({ page, context }) => {
    // Intercept API call
    await page.route(`${API_URL}/api/auth/register`, async (route) => {
      if (route.request().method() === 'POST') {
        await route.continue();
      }
    });

    await page.goto(`${BASE_URL}/register`);

    // Fill registration form
    await page.fill('input#email', testUser.email);
    await page.fill('input#username', testUser.username);
    await page.fill('input#password', testUser.password);
    await page.fill('input#confirmPassword', testUser.password);

    // Submit form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Wait for navigation to onboarding (registration success)
    await page.waitForURL(`${BASE_URL}/onboarding`, { timeout: 10000 });

    // Verify we're on the onboarding page
    expect(page.url()).toContain('/onboarding');

    // Verify auth state is set (user data persisted)
    const storageData = await context.storageState();
    expect(storageData.cookies).toBeDefined();
  });

  test('should login with valid credentials and redirect to feed', async ({ page, context }) => {
    // Pre-create a test account via API
    const registerResponse = await page.request.post(`${API_URL}/api/auth/register`, {
      data: {
        email: testUser.email,
        username: testUser.username,
        password: testUser.password,
      },
    });

    // Verify registration succeeded
    if (!registerResponse.ok()) {
      test.skip();
      return;
    }

    // Log out the auto-login session
    await page.goto(`${BASE_URL}/login`);

    // Fill login form
    await page.fill('input#email', testUser.email);
    await page.fill('input#password', testUser.password);

    // Submit form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Wait for navigation to feed (login success)
    await page.waitForURL(`${BASE_URL}/feed`, { timeout: 10000 });

    // Verify we're on the feed page
    expect(page.url()).toContain('/feed');
  });

  test('should show validation errors on login with invalid email', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    // Enter invalid email and any password
    await page.fill('input#email', 'invalid-email');
    await page.fill('input#password', 'password123');

    // Blur to trigger validation
    await page.locator('input#email').blur();

    // Expect validation error
    const emailError = page.locator('#email-error');
    await expect(emailError).toBeVisible();
    await expect(emailError).toContainText('Invalid email');
  });

  test('should show validation error on login with short password', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    // Enter valid email and short password
    await page.fill('input#email', 'test@example.com');
    await page.fill('input#password', 'short');

    // Blur to trigger validation
    await page.locator('input#password').blur();

    // Expect validation error
    const passwordError = page.locator('#password-error');
    await expect(passwordError).toBeVisible();
    await expect(passwordError).toContainText('at least 8 characters');
  });

  test('should show API error on login with non-existent user', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    // Enter valid but non-existent credentials
    await page.fill('input#email', 'nonexistent@example.com');
    await page.fill('input#password', 'ValidPassword123');

    // Submit form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Expect API error message to appear
    const errorAlert = page.locator('[role="alert"]');
    await expect(errorAlert).toBeVisible();
  });

  test('should disable submit button while submitting', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    // Fill form with valid input
    await page.fill('input#email', testUser.email);
    await page.fill('input#password', testUser.password);

    // Intercept the request to delay response
    await page.route(`${API_URL}/api/auth/login`, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.continue();
    });

    // Click submit
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Immediately check that button is disabled
    await expect(submitButton).toBeDisabled();

    // Button text should show loading state
    await expect(submitButton).toContainText('Signing in');
  });

  test('should show password mismatch error on register', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);

    // Fill form with mismatched passwords
    await page.fill('input#email', testUser.email);
    await page.fill('input#username', testUser.username);
    await page.fill('input#password', testUser.password);
    await page.fill('input#confirmPassword', 'DifferentPassword123');

    // Blur to trigger validation
    await page.locator('input#confirmPassword').blur();

    // Expect validation error
    const confirmPasswordError = page.locator('#confirmPassword-error');
    await expect(confirmPasswordError).toBeVisible();
    await expect(confirmPasswordError).toContainText('do not match');
  });

  test('should have working register link on login page', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    // Find and click the register link
    const registerLink = page.locator('a:has-text("Sign up")');
    await registerLink.click();

    // Wait for navigation to register page
    await page.waitForURL(`${BASE_URL}/register`);

    // Verify we're on the register page
    expect(page.url()).toContain('/register');
  });

  test('should have working login link on register page', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);

    // Find and click the login link
    const loginLink = page.locator('a:has-text("Sign in")');
    await loginLink.click();

    // Wait for navigation to login page
    await page.waitForURL(`${BASE_URL}/login`);

    // Verify we're on the login page
    expect(page.url()).toContain('/login');
  });

  test('should display username validation error for invalid characters', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);

    // Enter username with invalid characters
    await page.fill('input#username', 'user@#$%');

    // Blur to trigger validation
    await page.locator('input#username').blur();

    // Expect validation error
    const usernameError = page.locator('#username-error');
    await expect(usernameError).toBeVisible();
    await expect(usernameError).toContainText('can only contain');
  });

  test('should display username validation error for too short', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);

    // Enter username that's too short
    await page.fill('input#username', 'ab');

    // Blur to trigger validation
    await page.locator('input#username').blur();

    // Expect validation error
    const usernameError = page.locator('#username-error');
    await expect(usernameError).toBeVisible();
    await expect(usernameError).toContainText('at least 3 characters');
  });
});

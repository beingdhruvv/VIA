import { test, expect } from '@playwright/test'; 

test.describe('Authentication', () => {
  const timestamp = Date.now();
  const email = `testuser_${timestamp}@example.com`;
  const password = 'Password123!';

  test('should allow user to sign up', async ({ page }) => {
    await page.goto('/auth/signup');

    // Fill out signup form
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="confirmPassword"]', password);

    // Submit
    await page.click('button[type="submit"]');

    // Expect to be redirected to login, check if pass or fail
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('should allow user to log in and redirect to dashboard', async ({ page }) => {
    await page.goto('/auth/login');

    // Fill out login form
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);

    // Submit
    await page.click('button[type="submit"]');

    // Expect to be redirected to dashboard or trips page
    await expect(page).toHaveURL(/\/(dashboard|trips)$/);
  });
});

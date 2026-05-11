import { test, expect } from '@playwright/test';

test.describe('Trips Management', () => {
  const timestamp = Date.now();
  const email = `tripuser_${timestamp}@example.com`;
  const password = 'Password123!';

  test.beforeAll(async ({ browser }) => {
    // We create a user for this suite via API or UI to ensure we can log in
    // Since API might require csrf tokens, we use the UI directly in a fresh page
    const page = await browser.newPage();
    await page.goto('http://localhost:3000/auth/signup');
    await page.fill('input[name="name"]', 'Trip User');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="confirmPassword"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard$/);
    await page.close();
  });

  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(dashboard|trips)$/);
  });

  test('should create a new trip', async ({ page }) => {
    await page.goto('/trips/new');

    // Assuming there are input fields for trip name, dates, etc.
    // Based on MASTER_PLAN, fields are: Trip name, Start date, End date, description, budget
    await page.fill('input[name="name"]', 'My Summer Vacation');
    await page.getByRole('button', { name: /continue/i }).click();

    await page.fill('input[name="startDate"]', '2026-06-01');
    await page.fill('input[name="endDate"]', '2026-06-07');
    await page.getByRole('button', { name: /continue/i }).click();

    await page.fill('textarea[name="description"]', 'Automated trip smoke test');
    await page.fill('input[name="totalBudget"]', '50000');
    await page.getByRole('button', { name: /continue/i }).click();

    await page.getByRole('button', { name: /create trip/i }).click();
    await expect(page).toHaveURL(/\/trips\/[a-zA-Z0-9-]+\/builder/);
  });

  test('should load my trips page', async ({ page }) => {
    await page.goto('/trips');
    await expect(page.getByRole('heading', { name: /my trips/i })).toBeVisible();
  });
});

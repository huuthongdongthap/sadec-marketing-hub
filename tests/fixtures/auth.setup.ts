import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, 'storage-state.json');

/**
 * Authentication setup for tests
 * This runs before all tests and saves the authenticated state
 */
setup('authenticate', async ({ page }) => {
  // Navigate to login page
  await page.goto('/portal/login.html');

  // Wait for page to load
  await page.waitForLoadState('networkidle');

  // Fill in login form
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'testpassword123');

  // Submit form
  await page.click('button[type="submit"]');

  // Wait for navigation to dashboard or main page
  await page.waitForURL('**/portal/dashboard.html', { timeout: 10000 });

  // Verify we're logged in by checking for user element or dashboard content
  await expect(page.locator('body')).toContainText(/dashboard|welcome/i);

  // Save signed-in state to 'storage-state.json'.
  await page.context().storageState({ path: authFile });
});

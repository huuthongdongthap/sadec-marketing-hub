/**
 * Debug test - Capture console logs and errors
 */
import { test, expect } from '@playwright/test';

test('debug console logs', async ({ page }) => {
  // Capture all console messages
  const logs: string[] = [];
  const errors: string[] = [];

  page.on('console', msg => {
    logs.push(`[${msg.type()}] ${msg.text()}`);
  });

  page.on('pageerror', err => {
    errors.push(err.message);
  });

  // Navigate to widgets demo
  await page.goto('/admin/widgets-demo.html', {
    waitUntil: 'load',
    timeout: 15000
  });

  // Wait a bit for JS to execute
  await page.waitForTimeout(3000);

  // Print all logs
  console.log('=== CONSOLE LOGS ===');
  logs.forEach(log => console.log(log));

  console.log('=== ERRORS ===');
  errors.forEach(err => console.log(err));

  // Check if custom element is defined
  const isDefined = await page.evaluate(() => {
    return customElements.get('kpi-card-widget') !== undefined;
  });

  console.log('kpi-card-widget defined:', isDefined);

  // Check DOM
  const kpiCount = await page.locator('kpi-card-widget').count();
  console.log('KPI cards in DOM:', kpiCount);

  // Assert no errors
  expect(errors).toHaveLength(0);

  // Assert custom element is defined
  expect(isDefined).toBe(true);
});

/**
 * Test minimal widgets page
 */
import { test, expect } from '@playwright/test';

test('minimal page loads', async ({ page }) => {
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await page.goto('/admin/minimal-widgets.html', {
    waitUntil: 'load',
    timeout: 15000
  });

  await page.waitForTimeout(2000);

  const kpiCount = await page.locator('kpi-card-widget').count();
  console.log('KPI cards in DOM:', kpiCount);

  const isDefined = await page.evaluate(() => {
    return customElements.get('kpi-card-widget') !== undefined;
  });

  console.log('kpi-card-widget defined:', isDefined);

  expect(isDefined).toBe(true);
  expect(kpiCount).toBeGreaterThan(0);
});

/**
 * Test inline widget - no module import
 */
import { test, expect } from '@playwright/test';

test('inline widget loads', async ({ page }) => {
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await page.goto('/admin/inline-widget.html', {
    waitUntil: 'domcontentloaded',
    timeout: 15000
  });

  await page.waitForTimeout(1000);

  const isDefined = await page.evaluate(() => {
    return customElements.get('kpi-card-widget') !== undefined;
  });

  console.log('kpi-card-widget defined:', isDefined);

  const kpiCount = await page.locator('kpi-card-widget').count();
  console.log('KPI cards in DOM:', kpiCount);

  expect(isDefined).toBe(true);
  expect(kpiCount).toBeGreaterThan(0);
});

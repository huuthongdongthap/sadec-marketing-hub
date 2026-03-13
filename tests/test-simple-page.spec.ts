/**
 * Super simple test - just check page loads
 */
import { test, expect } from '@playwright/test';

test('page loads', async ({ page }) => {
  page.on('console', msg => {
    console.log('CONSOLE:', msg.type(), msg.text());
  });

  // Set shorter timeout
  page.setDefaultTimeout(5000);
  page.setDefaultNavigationTimeout(5000);

  // Just navigate and get HTML
  const response = await page.goto('/admin/inline-widget.html');

  console.log('Response status:', response?.status());

  // Get page content
  const html = await page.content();
  console.log('Page has content:', html.length > 0);

  // Just check we can query the DOM
  const widget = page.locator('kpi-card-widget');
  const count = await widget.count();
  console.log('Widget count:', count);

  expect(count).toBeGreaterThan(0);
});

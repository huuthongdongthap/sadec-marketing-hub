/**
 * Basic test after reinstall
 */
import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
  page.setDefaultTimeout(10000);

  await page.goto('https://example.com');

  const title = await page.title();
  console.log('Page title:', title);

  expect(title).toBe('Example Domain');
});

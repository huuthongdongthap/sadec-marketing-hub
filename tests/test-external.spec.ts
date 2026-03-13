/**
 * Test external page to verify Playwright works
 */
import { test, expect } from '@playwright/test';

test('external page works', async ({ page }) => {
  page.setDefaultTimeout(10000);

  await page.goto('https://example.com');

  const title = await page.title();
  console.log('Page title:', title);

  const content = await page.content();
  console.log('Has content:', content.length > 0);

  expect(title).toBe('Example Domain');
});

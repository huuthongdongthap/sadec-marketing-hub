import { test, expect } from '@playwright/test';

test.describe('Debug Test', () => {
  test('capture page screenshot', async ({ page }) => {
    try {
      await page.goto('/admin/widgets-demo-test.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
      console.log('Page loaded, taking screenshot...');

      // Chụp toàn trang
      await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });
      console.log('Screenshot saved');

      // Lấy HTML content
      const html = await page.content();
      console.log('Page HTML length:', html.length);

      // Check nếu có KPI card element
      const kpiCards = await page.locator('kpi-card-widget').count();
      console.log('KPI Cards found:', kpiCards);

    } catch (error) {
      console.error('Error:', error);
      await page.screenshot({ path: 'debug-error.png' });
    }
  });
});

import { test, expect } from '@playwright/test';

test.describe('Inline KPI Test', () => {
  test('inline kpi loads', async ({ browser }) => {
    // Create completely fresh context
    const context = await browser.newContext();
    const page = await context.newPage();

    // Block all external requests
    await page.route('**/*', (route) => {
      const url = route.request().url();
      if (url.startsWith('http://localhost:5502') || url.startsWith('http://127.0.0.1:5502')) {
        route.continue();
      } else {
        route.abort();
      }
    });

    try {
      await page.goto('/admin/test-inline-kpi.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
      const status = page.locator('#status');
      await expect(status).toContainText('customElements.define called', { timeout: 5000 });
    } catch (error) {
      await context.close();
      throw error;
    }

    await context.close();
  });
});

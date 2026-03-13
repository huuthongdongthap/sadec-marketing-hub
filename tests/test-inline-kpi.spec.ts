import { test, expect } from '@playwright/test';

test.describe('Inline KPI Test', () => {
  test('inline kpi loads', async ({ page }) => {
    await page.goto('/admin/test-inline-kpi.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
    const status = page.locator('#status');
    await expect(status).toContainText('customElements.define called', { timeout: 5000 });
  });
});

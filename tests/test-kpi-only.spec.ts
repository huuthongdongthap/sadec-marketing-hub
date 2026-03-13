import { test, expect } from '@playwright/test';

test.describe('KPI Only Test', () => {
  test('kpi card loads', async ({ page }) => {
    await page.goto('/admin/test-kpi-only.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
    const status = page.locator('#status');
    await expect(status).toContainText('loaded successfully', { timeout: 5000 });
  });
});

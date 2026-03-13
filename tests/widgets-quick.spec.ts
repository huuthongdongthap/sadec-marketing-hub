import { test, expect } from '@playwright/test';

test.describe('Dashboard Widgets Quick Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/widgets-demo-test.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
  });

  test('page loads with KPI cards', async ({ page }) => {
    const kpiCard = page.locator('kpi-card-widget').first();
    await expect(kpiCard).toBeVisible({ timeout: 5000 });
  });

  test('KPI card displays title and value', async ({ page }) => {
    const kpiCard = page.locator('kpi-card-widget').first();
    await expect(kpiCard).toContainText('Doanh Thu', { timeout: 5000 });
    await expect(kpiCard).toContainText('125.5M', { timeout: 5000 });
  });

  test('shows success alert', async ({ page }) => {
    const successBtn = page.locator('.btn-success').first();
    await successBtn.click();

    const alert = page.locator('.toast.toast-success').first();
    await expect(alert).toBeVisible({ timeout: 5000 });
    await expect(alert).toContainText('Thành công', { timeout: 5000 });
  });
});

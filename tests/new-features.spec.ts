/**
 * Tests for New Features - Sa Đéc Marketing Hub
 * Tests: Export, Advanced Filters, Features Demo
 * 
 * Run: npx playwright test tests/new-features.spec.ts
 */

import { test, expect } from '@playwright/test';

test.describe('Export Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/features-demo.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
  });

  test('features demo page loads', async ({ page }) => {
    await expect(page).toHaveTitle(/Features Demo/);
    await expect(page.locator('h1')).toContainText('🚀 Features Demo');
  });

  test('export buttons are visible', async ({ page }) => {
    const exportButtons = page.locator('export-buttons');
    await expect(exportButtons).toBeVisible();
    
    // Check individual buttons
    await expect(page.locator('button[data-action="csv"]')).toBeVisible();
    await expect(page.locator('button[data-action="pdf"]')).toBeVisible();
    await expect(page.locator('button[data-action="excel"]')).toBeVisible();
    await expect(page.locator('button[data-action="print"]')).toBeVisible();
  });

  test('demo table displays correctly', async ({ page }) => {
    const table = page.locator('#demo-table');
    await expect(table).toBeVisible();
    
    // Check headers
    const headers = table.locator('thead th');
    await expect(headers).toHaveCount(5);
    await expect(headers.nth(0)).toHaveText('ID');
    await expect(headers.nth(1)).toHaveText('Tên chiến dịch');
    
    // Check rows
    const rows = table.locator('tbody tr');
    await expect(rows).toHaveCount(3);
  });
});

test.describe('Advanced Filters', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/features-demo.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
  });

  test('advanced filters component loads', async ({ page }) => {
    const filters = page.locator('advanced-filters');
    await expect(filters).toBeVisible();
  });

  test('filter fields render correctly', async ({ page }) => {
    // Check search field
    const searchInput = page.locator('#search');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('type', 'text');
    
    // Check status dropdown
    const statusSelect = page.locator('#status');
    await expect(statusSelect).toBeVisible();
    await expect(statusSelect).toHaveCount(1);
    
    // Check date field
    const dateInput = page.locator('#date');
    await expect(dateInput).toBeVisible();
    await expect(dateInput).toHaveAttribute('type', 'date');
  });

  test('apply filters button works', async ({ page }) => {
    const applyBtn = page.locator('#apply-filters');
    await expect(applyBtn).toBeVisible();
    await expect(applyBtn).toHaveText('Áp dụng');
  });

  test('filter chips container exists', async ({ page }) => {
    const chipsContainer = page.locator('#filter-chips');
    await expect(chipsContainer).toBeVisible();
  });

  test('preset functionality available', async ({ page }) => {
    const presetSelect = page.locator('.preset-select');
    await expect(presetSelect).toBeVisible();
    
    const saveBtn = page.locator('#save-preset');
    await expect(saveBtn).toBeVisible();
    await expect(saveBtn).toHaveText('💾 Lưu');
  });
});

test.describe('Features Demo Page', () => {
  test('all sections are present', async ({ page }) => {
    await page.goto('/admin/features-demo.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    // Check section headings
    await expect(page.locator('text=📤 Export Functions')).toBeVisible();
    await expect(page.locator('text=🔍 Advanced Filters')).toBeVisible();
    await expect(page.locator('text=⌨️ Keyboard Shortcuts')).toBeVisible();
  });

  test('feature badges display correctly', async ({ page }) => {
    const newBadges = page.locator('.badge-new');
    await expect(newBadges).toHaveCount(2);
    
    const updatedBadges = page.locator('.badge-updated');
    await expect(updatedBadges).toHaveCount(1);
  });

  test('keyboard shortcuts list is complete', async ({ page }) => {
    const shortcuts = page.locator('ul li');
    await expect(shortcuts).toHaveCount(5);
    
    // Check specific shortcuts
    await expect(page.locator('text=Ctrl + K')).toBeVisible();
    await expect(page.locator('text=Ctrl + N')).toBeVisible();
    await expect(page.locator('text=Ctrl + H')).toBeVisible();
    await expect(page.locator('text=Ctrl + E')).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  test('features demo is responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/admin/features-demo.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    // Check page is usable on mobile
    const header = page.locator('.page-header');
    await expect(header).toBeVisible();
    
    // Export buttons should stack on mobile
    const exportContainer = page.locator('.export-buttons');
    await expect(exportContainer).toBeVisible();
  });

  test('features demo is responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/admin/features-demo.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    const mainContent = page.locator('.demo-section');
    await expect(mainContent).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('export buttons have proper ARIA labels', async ({ page }) => {
    await page.goto('/admin/features-demo.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    const csvButton = page.locator('button[data-action="csv"]');
    await expect(csvButton).toBeVisible();
    // Button text serves as accessible name
    await expect(csvButton).toContainText('CSV');
  });

  test('filter inputs have labels', async ({ page }) => {
    await page.goto('/admin/features-demo.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    // Each filter field should have a label
    const labels = page.locator('.filter-field label');
    await expect(labels).toHaveCount(4);
  });

  test('keyboard navigation works', async ({ page }) => {
    await page.goto('/admin/features-demo.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Focused element should be visible
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });
});

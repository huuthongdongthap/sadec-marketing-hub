import { test, expect } from '@playwright/test';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SADÉC MARKETING HUB — UI COMPONENTS TEST
 *
 * Tests for reusable UI components in admin/src/components/ui/
 * - Button
 * - SearchInput
 * - ErrorBoundary
 * - LoadingSpinner
 * - ProgressBar
 *
 * Total: 5 components
 * ═══════════════════════════════════════════════════════════════════════════
 */

test.describe('Button Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/ui-components-demo.html', { waitUntil: 'domcontentloaded' });
  });

  test('Button renders with default styles', async ({ page }) => {
    const button = page.locator('button').filter({ hasText: /Button/i }).first();
    await expect(button).toBeVisible();
  });

  test('Button handles click', async ({ page }) => {
    const button = page.locator('button').filter({ hasText: /Click me/i }).first();
    await button.click();
    await expect(page.locator('#button-click-result')).toHaveText('Clicked!');
  });

  test('Button disabled state', async ({ page }) => {
    const disabledButton = page.locator('button[disabled]').first();
    await expect(disabledButton).toBeDisabled();
  });

  test('Button loading state', async ({ page }) => {
    const loadingButton = page.locator('button').filter({ hasText: /Loading/i }).first();
    await expect(loadingButton).toBeVisible();
    await expect(loadingButton.locator('.spinner')).toBeVisible();
  });

  test('Button variants', async ({ page }) => {
    const variants = ['primary', 'secondary', 'outline', 'ghost', 'danger', 'success'];
    for (const variant of variants) {
      const button = page.locator(`button.${variant}-btn`).first();
      await expect(button).toBeVisible();
    }
  });

  test('Button sizes', async ({ page }) => {
    const sizes = ['sm', 'md', 'lg'];
    for (const size of sizes) {
      const button = page.locator(`button.btn-${size}`).first();
      await expect(button).toBeVisible();
    }
  });
});

test.describe('SearchInput Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/ui-components-demo.html', { waitUntil: 'domcontentloaded' });
  });

  test('SearchInput renders', async ({ page }) => {
    const searchInput = page.locator('input[type="search"]').first();
    await expect(searchInput).toBeVisible();
  });

  test('SearchInput accepts input', async ({ page }) => {
    const searchInput = page.locator('input[type="search"]').first();
    await searchInput.fill('test query');
    await expect(searchInput).toHaveValue('test query');
  });

  test('SearchInput debounce works', async ({ page }) => {
    const searchInput = page.locator('input[type="search"]').first();
    await searchInput.fill('test');
    await page.waitForTimeout(400); // Wait for debounce
    const result = page.locator('#search-result');
    await expect(result).toContainText('test');
  });

  test('SearchInput clear button', async ({ page }) => {
    const searchInput = page.locator('input[type="search"]').first();
    await searchInput.fill('test query');
    const clearButton = page.locator('button[aria-label="Clear search"]').first();
    await clearButton.click();
    await expect(searchInput).toHaveValue('');
  });

  test('SearchInput placeholder', async ({ page }) => {
    const searchInput = page.locator('input[type="search"]').first();
    await expect(searchInput).toHaveAttribute('placeholder', 'Tìm kiếm...');
  });
});

test.describe('ErrorBoundary Component', () => {
  test('ErrorBoundary catches errors', async ({ page }) => {
    await page.goto('/admin/ui-components-demo.html', { waitUntil: 'domcontentloaded' });

    // Trigger error
    const errorButton = page.locator('button').filter({ hasText: /Trigger Error/i }).first();
    await errorButton.click();

    // Check error state
    const errorBoundary = page.locator('[data-testid="error-boundary"]');
    await expect(errorBoundary).toBeVisible();
    await expect(errorBoundary).toContainText('Đã xảy ra lỗi');
  });

  test('ErrorBoundary recovery', async ({ page }) => {
    await page.goto('/admin/ui-components-demo.html', { waitUntil: 'domcontentloaded' });

    // Trigger error
    const errorButton = page.locator('button').filter({ hasText: /Trigger Error/i }).first();
    await errorButton.click();

    // Click retry
    const retryButton = page.locator('button').filter({ hasText: /Thử lại/i }).first();
    await retryButton.click();

    // Component should recover
    const errorBoundary = page.locator('[data-testid="error-boundary"]');
    await expect(errorBoundary).not.toBeVisible();
  });
});

test.describe('LoadingSpinner Component', () => {
  test('LoadingSpinner renders', async ({ page }) => {
    await page.goto('/admin/ui-components-demo.html', { waitUntil: 'domcontentloaded' });

    const spinner = page.locator('.loading-spinner').first();
    await expect(spinner).toBeVisible();
  });

  test('LoadingSpinner sizes', async ({ page }) => {
    await page.goto('/admin/ui-components-demo.html', { waitUntil: 'domcontentloaded' });

    const sizes = ['sm', 'md', 'lg'];
    for (const size of sizes) {
      const spinner = page.locator(`.loading-spinner.${size}`).first();
      await expect(spinner).toBeVisible();
    }
  });
});

test.describe('ProgressBar Component', () => {
  test('ProgressBar renders', async ({ page }) => {
    await page.goto('/admin/ui-components-demo.html', { waitUntil: 'domcontentloaded' });

    const progressBar = page.locator('.progress-bar').first();
    await expect(progressBar).toBeVisible();
  });

  test('ProgressBar shows percentage', async ({ page }) => {
    await page.goto('/admin/ui-components-demo.html', { waitUntil: 'domcontentloaded' });

    const progressBar = page.locator('.progress-bar').first();
    await expect(progressBar).toHaveAttribute('aria-valuenow');
  });

  test('ProgressBar variants', async ({ page }) => {
    await page.goto('/admin/ui-components-demo.html', { waitUntil: 'domcontentloaded' });

    const variants = ['primary', 'success', 'warning', 'danger'];
    for (const variant of variants) {
      const bar = page.locator(`.progress-bar.${variant}`).first();
      await expect(bar).toBeVisible();
    }
  });
});

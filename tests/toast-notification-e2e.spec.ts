import { test, expect } from '@playwright/test';

/**
 * Toast Notification System - E2E Tests
 * Sa Đéc Marketing Hub
 *
 * Tests verify global window.Toast API:
 * - Toast.success()
 * - Toast.error()
 * - Toast.warning()
 * - Toast.info()
 * - Toast.show()
 * - Toast.remove()
 * - Toast.clear()
 */

test.describe('Toast Notification System', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/test-toast.html');
  });

  test('Toast API available globally', async ({ page }) => {
    const toastAvailable = await page.evaluate(() => {
      return typeof window.Toast !== 'undefined';
    });
    expect(toastAvailable).toBe(true);
  });

  test('Toast.success() displays green toast', async ({ page }) => {
    await page.evaluate(() => {
      window.Toast.success('Thành công!');
    });

    const toast = page.locator('.toast.toast-success');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Thành công!');
  });

  test('Toast.error() displays red toast', async ({ page }) => {
    await page.evaluate(() => {
      window.Toast.error('Có lỗi xảy ra');
    });

    const toast = page.locator('.toast.toast-error');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Có lỗi xảy ra');
  });

  test('Toast.warning() displays yellow toast', async ({ page }) => {
    await page.evaluate(() => {
      window.Toast.warning('Cảnh báo');
    });

    const toast = page.locator('.toast.toast-warning');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Cảnh báo');
  });

  test('Toast.info() displays blue toast', async ({ page }) => {
    await page.evaluate(() => {
      window.Toast.info('Thông báo');
    });

    const toast = page.locator('.toast.toast-info');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Thông báo');
  });

  test('Toast.show() with custom title', async ({ page }) => {
    await page.evaluate(() => {
      window.Toast.show('Custom Title', {
        message: 'Custom message',
        duration: 3000
      });
    });

    const toast = page.locator('.toast');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Custom Title');
  });

  test('Toast respects duration option', async ({ page }) => {
    await page.evaluate(() => {
      window.Toast.show('Short toast', { duration: 1000 });
    });

    const toast = page.locator('.toast');
    await expect(toast).toBeVisible();
    await expect(toast).toBeHidden({ timeout: 2000 });
  });

  test('Toast.remove() removes specific toast', async ({ page }) => {
    const toastId = await page.evaluate(() => {
      return window.Toast.show('To remove', { duration: 10000 });
    });

    await page.evaluate((id) => {
      window.Toast.remove(id);
    }, toastId);

    const toast = page.locator('.toast');
    await expect(toast).toBeHidden();
  });

  test('Toast.clear() removes all toasts', async ({ page }) => {
    await page.evaluate(() => {
      window.Toast.success('Toast 1');
      window.Toast.error('Toast 2');
      window.Toast.warning('Toast 3');
    });

    const toasts = page.locator('.toast');
    await expect(toasts).toHaveCount(3);

    await page.evaluate(() => {
      window.Toast.clear();
    });

    await expect(toasts).toHaveCount(0);
  });

  test('Toast respects maxToasts option', async ({ page }) => {
    await page.evaluate(() => {
      // Show 10 toasts, maxToasts default is 5
      for (let i = 0; i < 10; i++) {
        window.Toast.success(`Toast ${i}`);
      }
    });

    const toasts = page.locator('.toast');
    await expect(toasts).toHaveCount(5); // Should be limited to maxToasts
  });

  test('Toast has progress bar when showProgress is true', async ({ page }) => {
    await page.evaluate(() => {
      window.Toast.show('With progress', { showProgress: true });
    });

    const progressBar = page.locator('.toast-progress');
    await expect(progressBar).toBeVisible();
  });

  test('Toast has close button when showClose is true', async ({ page }) => {
    await page.evaluate(() => {
      window.Toast.show('Closable', { showClose: true });
    });

    const closeButton = page.locator('.toast-close');
    await expect(closeButton).toBeVisible();
  });

  test('Toast position can be changed', async ({ page }) => {
    await page.evaluate(() => {
      window.Toast.setPosition('bottom-right');
      window.Toast.success('Bottom right');
    });

    const container = page.locator('.toast-container');
    await expect(container).toHaveClass(/toast-bottom-right/);
  });

  test('Multiple toasts stack correctly', async ({ page }) => {
    await page.evaluate(() => {
      window.Toast.success('First');
      window.Toast.info('Second');
      window.Toast.warning('Third');
    });

    const toasts = page.locator('.toast');
    await expect(toasts).toHaveCount(3);

    // Verify stacking order (first should be at top)
    await expect(toasts.first()).toContainText('First');
    await expect(toasts.last()).toContainText('Third');
  });

  test('Toast is accessible with role="alert"', async ({ page }) => {
    await page.evaluate(() => {
      window.Toast.success('Accessible toast');
    });

    const toast = page.locator('[role="alert"]');
    await expect(toast).toBeVisible();
  });

  test('Toast has proper ARIA attributes', async ({ page }) => {
    await page.evaluate(() => {
      window.Toast.error('Error message');
    });

    const toast = page.locator('.toast.toast-error');
    await expect(toast).toHaveAttribute('aria-live', 'assertive');
  });
});

test.describe('Toast Integration - Dashboard', () => {

  test('Quick Stats Widget uses Toast', async ({ page }) => {
    await page.goto('/portal/dashboard.html');

    // Trigger a refresh that should show toast
    const refreshButton = page.locator('[onclick*="refresh"]');
    if (await refreshButton.isVisible()) {
      await refreshButton.click();

      // Wait for toast to appear
      const toast = page.locator('.toast');
      await expect(toast).toBeVisible({ timeout: 5000 });
    }
  });

  test('Notification Center uses Toast', async ({ page }) => {
    await page.goto('/portal/notifications.html');

    // Check if toast is loaded
    const toastLoaded = await page.evaluate(() => {
      return typeof window.Toast !== 'undefined';
    });
    expect(toastLoaded).toBe(true);
  });
});

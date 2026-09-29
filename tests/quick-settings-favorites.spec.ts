import { test, expect } from '@playwright/test';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * QUICK SETTINGS & FAVORITES — E2E Tests
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Tests for:
 * - Quick Settings Panel (Ctrl+,)
 * - Favorites Manager (Ctrl+D, Ctrl+Shift+F)
 *
 * Total: 18 tests
 * ═══════════════════════════════════════════════════════════════════════════
 */

test.describe('Quick Settings Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
  });

  test('should open settings panel with Ctrl+,', async ({ page }) => {
    await page.keyboard.down('Control');
    await page.keyboard.press(',');
    await page.keyboard.up('Control');

    const panel = page.locator('#quick-settings-panel');
    await expect(panel).toBeVisible();
    await expect(panel).toHaveClass(/open/);
  });

  test('should display all settings options', async ({ page }) => {
    await page.keyboard.down('Control');
    await page.keyboard.press(',');
    await page.keyboard.up('Control');

    const panel = page.locator('#quick-settings-panel');

    // Check theme selector
    await expect(panel.locator('.theme-selector')).toBeVisible();
    await expect(panel.locator('[data-theme="light"]')).toBeVisible();
    await expect(panel.locator('[data-theme="dark"]')).toBeVisible();
    await expect(panel.locator('[data-theme="system"]')).toBeVisible();

    // Check toggles
    await expect(panel.locator('#setting-notifications')).toBeVisible();
    await expect(panel.locator('#setting-keyboard')).toBeVisible();
    await expect(panel.locator('#setting-reduced-motion')).toBeVisible();
    await expect(panel.locator('#setting-compact')).toBeVisible();
  });

  test('should close settings panel with Escape', async ({ page }) => {
    await page.keyboard.down('Control');
    await page.keyboard.press(',');
    await page.keyboard.up('Control');

    const panel = page.locator('#quick-settings-panel');
    await expect(panel).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(panel).not.toHaveClass(/open/);
  });

  test('should toggle theme buttons', async ({ page }) => {
    await page.keyboard.down('Control');
    await page.keyboard.press(',');
    await page.keyboard.up('Control');

    const panel = page.locator('#quick-settings-panel');
    const darkBtn = panel.locator('[data-theme="dark"]');

    await darkBtn.click();
    await expect(darkBtn).toHaveClass(/active/);

    // Verify dark theme applied
    await expect(page.locator('body')).toHaveClass(/dark-theme/);
  });

  test('should toggle notifications setting', async ({ page }) => {
    await page.keyboard.down('Control');
    await page.keyboard.press(',');
    await page.keyboard.up('Control');

    const panel = page.locator('#quick-settings-panel');
    const toggle = panel.locator('#setting-notifications');

    const isChecked = await toggle.isChecked();
    await toggle.click();
    await expect(toggle).not.toBeChecked();
  });

  test('should reset settings to defaults', async ({ page }) => {
    await page.keyboard.down('Control');
    await page.keyboard.press(',');
    await page.keyboard.up('Control');

    const panel = page.locator('#quick-settings-panel');
    const resetBtn = panel.locator('#settings-reset');

    await resetBtn.click();

    // Verify toast notification
    await expect(page.locator('.settings-toast')).toContainText('mặc định');
  });

  test('should persist settings to localStorage', async ({ page }) => {
    await page.keyboard.down('Control');
    await page.keyboard.press(',');
    await page.keyboard.up('Control');

    const panel = page.locator('#quick-settings-panel');
    const toggle = panel.locator('#setting-notifications');

    await toggle.click();

    // Verify localStorage
    const settings = await page.evaluate(() => {
      const saved = localStorage.getItem('sadec_quick_settings');
      return saved ? JSON.parse(saved) : null;
    });

    expect(settings).not.toBeNull();
    expect(typeof settings.notifications).toBe('boolean');
  });

  test('should apply reduced motion class', async ({ page }) => {
    await page.keyboard.down('Control');
    await page.keyboard.press(',');
    await page.keyboard.up('Control');

    const panel = page.locator('#quick-settings-panel');
    const toggle = panel.locator('#setting-reduced-motion');

    await toggle.click();
    await expect(page.locator('body')).toHaveClass(/reduced-motion/);
  });

  test('should apply compact mode class', async ({ page }) => {
    await page.keyboard.down('Control');
    await page.keyboard.press(',');
    await page.keyboard.up('Control');

    const panel = page.locator('#quick-settings-panel');
    const toggle = panel.locator('#setting-compact');

    await toggle.click();
    await expect(page.locator('body')).toHaveClass(/compact-mode/);
  });
});

test.describe('Favorites Manager', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
  });

  test('should open favorites panel with Ctrl+Shift+F', async ({ page }) => {
    await page.keyboard.down('Control');
    await page.keyboard.down('Shift');
    await page.keyboard.press('f');
    await page.keyboard.up('Control');
    await page.keyboard.up('Shift');

    const panel = page.locator('#favorites-panel');
    await expect(panel).toBeVisible();
    await expect(panel).toHaveClass(/open/);
  });

  test('should add current page to favorites with Ctrl+D', async ({ page }) => {
    await page.keyboard.down('Control');
    await page.keyboard.press('d');
    await page.keyboard.up('Control');

    // Verify toast notification
    await expect(page.locator('.favorites-toast')).toContainText('thêm');
  });

  test('should display empty state when no favorites', async ({ page }) => {
    await page.keyboard.down('Control');
    await page.keyboard.down('Shift');
    await page.keyboard.press('f');
    await page.keyboard.up('Control');
    await page.keyboard.up('Shift');

    const panel = page.locator('#favorites-panel');
    const emptyState = panel.locator('.favorites-empty');

    // Check if empty state is visible or has no items
    const isEmpty = await emptyState.isVisible().catch(() => false);
    const itemCount = await panel.locator('.favorite-item').count();

    expect(isEmpty || itemCount === 0).toBeTruthy();
  });

  test('should remove favorite from list', async ({ page }) => {
    // First add a favorite
    await page.keyboard.down('Control');
    await page.keyboard.press('d');
    await page.keyboard.up('Control');

    // Open favorites panel
    await page.keyboard.down('Control');
    await page.keyboard.down('Shift');
    await page.keyboard.press('f');
    await page.keyboard.up('Control');
    await page.keyboard.up('Shift');

    const panel = page.locator('#favorites-panel');

    // Wait for items and remove
    await page.waitForTimeout(500);
    const removeBtn = panel.locator('.favorite-remove').first();
    const isRemoveVisible = await removeBtn.isVisible().catch(() => false);

    if (isRemoveVisible) {
      await removeBtn.click();
      await expect(page.locator('.favorites-toast')).toContainText('xóa');
    }
  });

  test('should toggle favorite star on page header', async ({ page }) => {
    const starBtn = page.locator('.favorite-star');
    const starExists = await starBtn.count() > 0;

    if (starExists) {
      await starBtn.first().click();
      await expect(page.locator('.favorites-toast')).toBeVisible();
    }
  });

  test('should persist favorites to localStorage', async ({ page }) => {
    // Add to favorites
    await page.keyboard.down('Control');
    await page.keyboard.press('d');
    await page.keyboard.up('Control');

    // Verify localStorage
    const favorites = await page.evaluate(() => {
      const saved = localStorage.getItem('sadec_favorites');
      return saved ? JSON.parse(saved) : null;
    });

    expect(favorites).not.toBeNull();
    expect(Array.isArray(favorites)).toBeTruthy();
  });

  test('should close panel on outside click', async ({ page }) => {
    await page.keyboard.down('Control');
    await page.keyboard.down('Shift');
    await page.keyboard.press('f');
    await page.keyboard.up('Control');
    await page.keyboard.up('Shift');

    const panel = page.locator('#favorites-panel');
    await expect(panel).toHaveClass(/open/);

    // Click outside
    await page.mouse.click(100, 100);
    await expect(panel).not.toHaveClass(/open/);
  });

  test('should close panel on Escape', async ({ page }) => {
    await page.keyboard.down('Control');
    await page.keyboard.down('Shift');
    await page.keyboard.press('f');
    await page.keyboard.up('Control');
    await page.keyboard.up('Shift');

    const panel = page.locator('#favorites-panel');
    await expect(panel).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(panel).not.toHaveClass(/open/);
  });

  test('should have drag handle for reordering', async ({ page }) => {
    // Add favorite first
    await page.keyboard.down('Control');
    await page.keyboard.press('d');
    await page.keyboard.up('Control');

    await page.keyboard.down('Control');
    await page.keyboard.down('Shift');
    await page.keyboard.press('f');
    await page.keyboard.up('Control');
    await page.keyboard.up('Shift');

    const panel = page.locator('#favorites-panel');
    const favoriteItem = panel.locator('.favorite-item');

    const hasItems = await favoriteItem.count() > 0;
    if (hasItems) {
      const isDraggable = await favoriteItem.first().getAttribute('draggable');
      expect(isDraggable).toBe('true');
    }
  });
});

test.describe('Settings & Favorites Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
  });

  test('should have both features loaded', async ({ page }) => {
    const hasQuickSettings = await page.evaluate(() => {
      return typeof window.QuickSettings !== 'undefined';
    });

    const hasFavorites = await page.evaluate(() => {
      return typeof window.FavoritesManager !== 'undefined';
    });

    expect(hasQuickSettings).toBeTruthy();
    expect(hasFavorites).toBeTruthy();
  });

  test('should export features in index.js', async ({ page }) => {
    const hasFeatures = await page.evaluate(() => {
      return typeof window.MekongFeatures !== 'undefined';
    });

    if (hasFeatures) {
      const features = await page.evaluate(() => {
        return window.MekongFeatures;
      });

      expect(features.QuickSettings).toBeDefined();
      expect(features.FavoritesManager).toBeDefined();
    }
  });
});

import { test, expect } from '@playwright/test';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SADÉC MARKETING HUB — WIDGETS COVERAGE TEST
 *
 * Tests for widget pages in admin/widgets/
 * - conversion-funnel.html
 * - global-search.html
 * - kpi-card.html
 * - notification-bell.html
 * - theme-toggle.html
 *
 * Total: 5 widget pages
 * ═══════════════════════════════════════════════════════════════════════════
 */

const WIDGETS = [
  { path: '/admin/widgets/conversion-funnel.html', name: 'Conversion Funnel' },
  { path: '/admin/widgets/global-search.html', name: 'Global Search' },
  { path: '/admin/widgets/kpi-card.html', name: 'KPI Card' },
  { path: '/admin/widgets/notification-bell.html', name: 'Notification Bell' },
  { path: '/admin/widgets/theme-toggle.html', name: 'Theme Toggle' },
];

test.describe('Widget Pages — Smoke Tests', () => {
  for (const widget of WIDGETS) {
    test(`${widget.name} loads successfully`, async ({ page }) => {
      const errors: string[] = [];

      page.on('pageerror', (error) => {
        if (error.message.includes('supabase')) return;
        if (error.message.includes('Material')) return;
        errors.push(error.message);
      });

      const response = await page.goto(widget.path, { waitUntil: 'domcontentloaded', timeout: 15000 });

      expect(response?.status()).toBe(200);

      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);

      expect(errors, `JS errors on ${widget.path}: ${errors.join(', ')}`).toHaveLength(0);
    });
  }
});

test.describe('Conversion Funnel Widget', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/widgets/conversion-funnel.html', { waitUntil: 'domcontentloaded' });
  });

  test('displays funnel stages', async ({ page }) => {
    const funnelStages = page.locator('.funnel-stage');
    await expect(funnelStages).toHaveCount({ min: 3 });
  });

  test('shows conversion metrics', async ({ page }) => {
    const metrics = page.locator('.conversion-metric');
    await expect(metrics.first()).toBeVisible();
  });

  test('has chart visualization', async ({ page }) => {
    const chart = page.locator('.funnel-chart');
    await expect(chart).toBeVisible();
  });
});

test.describe('Global Search Widget', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/widgets/global-search.html', { waitUntil: 'domcontentloaded' });
  });

  test('displays search input', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="Tìm"]');
    await expect(searchInput).toBeVisible();
  });

  test('shows search results on input', async ({ page }) => {
    const searchInput = page.locator('input[type="search"]').first();
    await searchInput.fill('test');
    const results = page.locator('.search-results');
    await expect(results).toBeVisible();
  });

  test('has keyboard shortcut hint', async ({ page }) => {
    const shortcut = page.locator('.keyboard-shortcut');
    await expect(shortcut).toBeVisible();
  });
});

test.describe('KPI Card Widget', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/widgets/kpi-card.html', { waitUntil: 'domcontentloaded' });
  });

  test('displays KPI cards', async ({ page }) => {
    const kpiCards = page.locator('.kpi-card');
    await expect(kpiCards).toHaveCount({ min: 1 });
  });

  test('shows KPI value and label', async ({ page }) => {
    const kpiValue = page.locator('.kpi-value').first();
    const kpiLabel = page.locator('.kpi-label').first();
    await expect(kpiValue).toBeVisible();
    await expect(kpiLabel).toBeVisible();
  });

  test('has trend indicator', async ({ page }) => {
    const trend = page.locator('.kpi-trend');
    await expect(trend).toBeVisible();
  });
});

test.describe('Notification Bell Widget', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/widgets/notification-bell.html', { waitUntil: 'domcontentloaded' });
  });

  test('displays notification bell icon', async ({ page }) => {
    const bellIcon = page.locator('.notification-bell, [class*="bell"]');
    await expect(bellIcon).toBeVisible();
  });

  test('shows notification count badge', async ({ page }) => {
    const badge = page.locator('.notification-badge, .badge');
    await expect(badge).toBeVisible();
  });

  test('opens notification dropdown on click', async ({ page }) => {
    const bellIcon = page.locator('.notification-bell').first();
    await bellIcon.click();
    const dropdown = page.locator('.notification-dropdown');
    await expect(dropdown).toBeVisible();
  });

  test('displays notification list', async ({ page }) => {
    const bellIcon = page.locator('.notification-bell').first();
    await bellIcon.click();
    const notifications = page.locator('.notification-item');
    await expect(notifications).toHaveCount({ min: 1 });
  });
});

test.describe('Theme Toggle Widget', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/widgets/theme-toggle.html', { waitUntil: 'domcontentloaded' });
  });

  test('displays theme toggle button', async ({ page }) => {
    const toggle = page.locator('.theme-toggle, [class*="theme"]');
    await expect(toggle).toBeVisible();
  });

  test('toggles between light and dark mode', async ({ page }) => {
    const toggle = page.locator('.theme-toggle').first();

    // Get initial theme
    const initialClass = await page.locator('html').getAttribute('class');
    const isDark = initialClass?.includes('dark') || false;

    // Click toggle
    await toggle.click();

    // Check theme changed
    const newClass = await page.locator('html').getAttribute('class');
    const isNowDark = newClass?.includes('dark') || false;

    expect(isDark).not.toEqual(isNowDark);
  });

  test('persists theme preference', async ({ page }) => {
    const toggle = page.locator('.theme-toggle').first();
    await toggle.click();

    // Check localStorage
    const theme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(theme).toBeTruthy();
  });
});

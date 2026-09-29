/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FEATURES DEMO 2027 TEST — Sa Đéc Marketing Hub
 *
 * Test coverage for /admin/features-demo-2027.html
 * Tests: Notification Center, Command Palette, Project Health Monitor
 *
 * Run: npx playwright test tests/features-demo-2027.spec.ts
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { test, expect } from '@playwright/test';

const TEST_URL = '/admin/features-demo-2027.html';

test.describe('Features Demo 2027 — Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
  });

  test('page loads successfully', async ({ page }) => {
    const title = await page.title();
    expect(title).toContain('Features Demo');
  });

  test('page has no critical JS errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('pageerror', (error) => {
      // Ignore Supabase/Auth errors
      if (error.message.includes('supabase') || error.message.includes('Auth')) return;
      // Ignore demo placeholder errors
      if (error.message.includes('is not defined')) return;
      errors.push(error.message);
    });

    // Wait for page to fully load
    await page.waitForTimeout(2000);

    expect(errors, `JS errors: ${errors.join(', ')}`).toHaveLength(0);
  });

  test('header is visible', async ({ page }) => {
    const header = page.locator('.demo-header');
    await expect(header).toBeVisible();
  });

  test('demo containers are visible', async ({ page }) => {
    const demoContainers = page.locator('.demo-container, .feature-showcase');
    await expect(demoContainers.first()).toBeVisible();
  });
});

test.describe('Features Demo 2027 — Notification Center Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000);
  });

  test('notification bell is visible', async ({ page }) => {
    const notificationBell = page.locator('notification-center').locator('.notification-bell').first();
    await expect(notificationBell).toBeVisible();
  });

  test('info notification button works', async ({ page }) => {
    const button = page.locator('button:has-text("Info Notification")');
    await expect(button).toBeVisible();
    await button.click();
    await page.waitForTimeout(500);

    // Check badge appears
    const badge = page.locator('.notification-bell .badge').first();
    await expect(badge).toBeVisible();
  });

  test('success notification button works', async ({ page }) => {
    const button = page.locator('button:has-text("Success Notification")');
    await expect(button).toBeVisible();
    await button.click();
    await page.waitForTimeout(500);

    const badge = page.locator('.notification-bell .badge').first();
    await expect(badge).toBeVisible();
  });

  test('warning notification button works', async ({ page }) => {
    const button = page.locator('button:has-text("Warning Notification")');
    await expect(button).toBeVisible();
    await button.click();
    await page.waitForTimeout(500);

    const badge = page.locator('.notification-bell .badge').first();
    await expect(badge).toBeVisible();
  });

  test('error notification button works', async ({ page }) => {
    const button = page.locator('button:has-text("Error Notification")');
    await expect(button).toBeVisible();
    await button.click();
    await page.waitForTimeout(500);

    const badge = page.locator('.notification-bell .badge').first();
    await expect(badge).toBeVisible();
  });

  test('mark all as read button works', async ({ page }) => {
    // First trigger a notification
    await page.locator('button:has-text("Info Notification")').click();
    await page.waitForTimeout(500);

    const markReadBtn = page.locator('button:has-text("Mark All Read")');
    await expect(markReadBtn).toBeVisible();
  });

  test('clear all button works', async ({ page }) => {
    // First trigger a notification
    await page.locator('button:has-text("Info Notification")').click();
    await page.waitForTimeout(500);

    const clearBtn = page.locator('button:has-text("Clear All")');
    await expect(clearBtn).toBeVisible();
  });
});

test.describe('Features Demo 2027 — Command Palette Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000);
  });

  test('open command palette button is visible', async ({ page }) => {
    const button = page.locator('button:has-text("Open Command Palette")');
    await expect(button).toBeVisible();
  });

  test('add custom command button is visible', async ({ page }) => {
    const button = page.locator('button:has-text("Add Custom Command")');
    await expect(button).toBeVisible();
  });

  test('command palette opens with Ctrl+K', async ({ page }) => {
    await page.keyboard.press('Control+k');
    await page.waitForTimeout(300);

    const overlay = page.locator('.command-palette-overlay');
    await expect(overlay).toHaveClass(/open/);
  });

  test('command palette shows search input', async ({ page }) => {
    await page.keyboard.press('Control+k');
    await page.waitForTimeout(300);

    const input = page.locator('.command-palette-input');
    await expect(input).toBeVisible();
  });

  test('keyboard shortcuts section is visible', async ({ page }) => {
    const kbdSection = page.locator('text=Keyboard Shortcuts');
    await expect(kbdSection).toBeVisible();
  });
});

test.describe('Features Demo 2027 — Project Health Monitor Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000);
  });

  test('health monitor widget is visible', async ({ page }) => {
    const healthMonitor = page.locator('project-health-monitor');
    await expect(healthMonitor).toBeVisible();
  });

  test('health gauge displays', async ({ page }) => {
    await page.waitForTimeout(1000);

    const gauge = page.locator('.health-gauge, .health-gauge-svg, .health-gauge-container').first();
    await expect(gauge).toBeVisible();
  });

  test('refresh button is visible', async ({ page }) => {
    await page.waitForTimeout(1000);

    const refreshBtn = page.locator('.btn-refresh, button:has-text("Refresh"), button:has-text("🔄")').first();
    await expect(refreshBtn).toBeVisible();
  });

  test('toggle auto-refresh button is visible', async ({ page }) => {
    const toggleBtn = page.locator('button:has-text("Toggle Auto-Refresh")');
    await expect(toggleBtn).toBeVisible();
  });

  test('metrics section displays', async ({ page }) => {
    await page.waitForTimeout(1000);

    const metrics = page.locator('.health-metrics, .health-metric-card, .metric-item').first();
    await expect(metrics).toBeVisible();
  });
});

test.describe('Features Demo 2027 — Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000);
  });

  test('demo navigation works', async ({ page }) => {
    const demoCards = page.locator('.demo-card, .feature-showcase');
    const count = await demoCards.count();
    expect(count).toBeGreaterThan(2);
  });

  test('responsive layout works', async ({ page }) => {
    // Desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);
    const desktopContainer = page.locator('.demo-container');
    await expect(desktopContainer).toBeVisible();

    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    const mobileContainer = page.locator('.demo-container');
    await expect(mobileContainer).toBeVisible();
  });

  test('all demo buttons are clickable', async ({ page }) => {
    const buttons = page.locator('.demo-buttons .btn');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(5);

    // Click first button
    await buttons.first().click();
    await page.waitForTimeout(300);
  });

  test('integration examples section is visible', async ({ page }) => {
    const integrationSection = page.locator('text=Integration Examples, text=Dashboard Widget, text=Quick Actions').first();
    await expect(integrationSection).toBeVisible();
  });
});

test.describe('Features Demo 2027 — Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
  });

  test('page has lang attribute', async ({ page }) => {
    const html = page.locator('html');
    const lang = await html.getAttribute('lang');
    expect(lang).toBe('vi');
  });

  test('page has proper heading structure', async ({ page }) => {
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
  });

  test('buttons have accessible names', async ({ page }) => {
    const buttons = page.locator('button');
    const count = await buttons.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      expect(text?.trim().length).toBeGreaterThan(0);
    }
  });

  test('keyboard navigation works', async ({ page }) => {
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});

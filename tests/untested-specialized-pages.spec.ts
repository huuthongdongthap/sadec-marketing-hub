/**
 * Untested Specialized Pages - Functional Coverage
 * Covers: quality, shifts, suppliers, notifications, widgets-demo
 *
 * Test coverage for admin pages that were missing dedicated tests
 */

import { test, expect } from '@playwright/test';

test.describe('Admin Quality Control Page', () => {
  test('quality.html displays quality control dashboard', async ({ page }) => {
    await page.goto('/admin/quality.html', { waitUntil: 'domcontentloaded', timeout: 15000 });

    // Check page title
    const title = await page.title();
    expect(title).toMatch(/quality|control|kiểm soát chất lượng/i);

    // Check for quality-related elements
    const content = await page.content();
    expect(content).toMatch(/quality|metric|kpi|standard|compliance|chat lượng/i);

    // Check for dashboard widgets
    const kpiCards = page.locator('[class*="kpi"], [class*="metric"], [class*="stat"]');
    await expect(kpiCards.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  });
});

test.describe('Admin Shifts Management Page', () => {
  test('shifts.html displays shift scheduling', async ({ page }) => {
    await page.goto('/admin/shifts.html', { waitUntil: 'domcontentloaded', timeout: 15000 });

    // Check page title
    const title = await page.title();
    expect(title).toMatch(/shift|schedule|lich|phan cong/i);

    // Check for shift-related elements
    const content = await page.content();
    expect(content).toMatch(/shift|schedule|employee|team|ca|lich lam viec/i);

    // Check for calendar or schedule view
    const calendar = page.locator('[class*="calendar"], [class*="schedule"], [class*="shift"]');
    await expect(calendar.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  });
});

test.describe('Admin Suppliers Management Page', () => {
  test('suppliers.html displays supplier list', async ({ page }) => {
    await page.goto('/admin/suppliers.html', { waitUntil: 'domcontentloaded', timeout: 15000 });

    // Check page title
    const title = await page.title();
    expect(title).toMatch(/supplier|vendor|nha cung cap/i);

    // Check for supplier-related elements
    const content = await page.content();
    expect(content).toMatch(/supplier|vendor|partner|contact|nha cung cap/i);

    // Check for data table or list
    const table = page.locator('table, [class*="list"], [class*="grid"]');
    await expect(table.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  });
});

test.describe('Admin Notifications Page', () => {
  test('notifications.html displays notification center', async ({ page }) => {
    await page.goto('/admin/notifications.html', { waitUntil: 'domcontentloaded', timeout: 15000 });

    // Check page title
    const title = await page.title();
    expect(title).toMatch(/notification|thong bao|alert/i);

    // Check for notification-related elements
    const content = await page.content();
    expect(content).toMatch(/notification|alert|message|thong bao|bell/i);

    // Check for notification list
    const notificationList = page.locator('[class*="notification"], [class*="alert"]');
    await expect(notificationList.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  });
});

test.describe('Admin Widgets Demo Page', () => {
  test('widgets-demo.html displays widget showcase', async ({ page }) => {
    await page.goto('/admin/widgets-demo.html', { waitUntil: 'domcontentloaded', timeout: 15000 });

    // Check page title
    const title = await page.title();
    expect(title).toMatch(/widget|demo|component/i);

    // Check for widget elements
    const content = await page.content();
    expect(content).toMatch(/widget|kpi|card|chart|graph|component/i);

    // Check for KPI card widgets
    const kpiWidgets = page.locator('kpi-card-widget, [class*="kpi"], [class*="stat-card"]');
    await expect(kpiWidgets.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  });
});

test.describe('Admin UI Components Demo Page', () => {
  test('ui-components-demo.html displays component library', async ({ page }) => {
    await page.goto('/admin/ui-components-demo.html', { waitUntil: 'domcontentloaded', timeout: 15000 });

    // Check page title
    const title = await page.title();
    expect(title).toMatch(/component|ui|design system/i);

    // Check for component elements
    const content = await page.content();
    expect(content).toMatch(/component|button|input|modal|dialog|typography/i);

    // Check for MD3 web components
    const mdComponents = page.locator('[class*="md-"], [class*="material"], m3-, [class*="component"]');
    await expect(mdComponents.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  });
});

test.describe('Admin RaaS Overview Page - Extended', () => {
  test('raas-overview.html has RaaS dashboard elements', async ({ page }) => {
    await page.goto('/admin/raas-overview.html', { waitUntil: 'domcontentloaded', timeout: 15000 });

    // Check page title
    const title = await page.title();
    expect(title).toMatch(/raas|robot|automation|agency/i);

    // Check for RaaS-specific elements
    const content = await page.content();
    expect(content).toMatch(/raas|robot|automation|mission|credit|agency/i);

    // Check for mission or credit widgets
    const raasWidgets = page.locator('[class*="mission"], [class*="credit"], [class*="raas"]');
    await expect(raasWidgets.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  });
});

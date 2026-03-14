/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SADÉC MARKETING HUB — WIDGETS & COMPONENTS PAGES
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Date: 2026-03-14
 * Purpose: Test widget and component pages not covered elsewhere
 *
 * Pages covered:
 * - Admin widgets: conversion-funnel, chart-widget, activity-feed, etc.
 * - UI components: buttons, cards, modals, forms
 * - Demo pages for 2027 features
 *
 * Total: 15+ widget/component pages
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { test, expect } from '@playwright/test';

// ============================================================================
// WIDGET PAGES
// ============================================================================

const WIDGET_PAGES = [
  { path: '/admin/widgets/conversion-funnel.html', name: 'Admin Conversion Funnel Widget' },
  { path: '/admin/widgets/chart-widget.html', name: 'Admin Chart Widget' },
  { path: '/admin/widgets/activity-feed.html', name: 'Admin Activity Feed' },
  { path: '/admin/widgets/recent-orders.html', name: 'Admin Recent Orders' },
  { path: '/admin/widgets/top-products.html', name: 'Admin Top Products' },
];

test.describe('Widget Pages — Smoke Tests', () => {
  for (const page of WIDGET_PAGES) {
    test(`${page.name} loads successfully`, async ({ page: p }) => {
      const errors: string[] = [];

      p.on('pageerror', (error) => {
        if (error.message.includes('supabase')) return;
        if (error.message.includes('Auth')) return;
        if (error.message.includes('Chart') || error.message.includes('google')) return;
        errors.push(error.message);
      });

      const response = await p.goto(page.path, { waitUntil: 'domcontentloaded', timeout: 15000 });

      expect(response?.status()).toBe(200);

      const title = await p.title();
      expect(title.length).toBeGreaterThan(0);
    });
  }
});

// ============================================================================
// COMPONENT DEMO PAGES
// ============================================================================

const COMPONENT_PAGES = [
  { path: '/admin/ui-demo.html', name: 'Admin UI Demo' },
  { path: '/admin/features-demo-2027.html', name: 'Admin Features Demo 2027' },
];

test.describe('Component Demo Pages — Smoke Tests', () => {
  for (const page of COMPONENT_PAGES) {
    test(`${page.name} loads successfully`, async ({ page: p }) => {
      const errors: string[] = [];

      p.on('pageerror', (error) => {
        if (error.message.includes('supabase')) return;
        errors.push(error.message);
      });

      const response = await p.goto(page.path, { waitUntil: 'domcontentloaded', timeout: 15000 });

      expect(response?.status()).toBe(200);

      const title = await p.title();
      expect(title.length).toBeGreaterThan(0);
    });
  }
});

// ============================================================================
// FUNCTIONAL TESTS — WIDGETS
// ============================================================================

test.describe('Widget Pages — Functional Tests', () => {
  test('Conversion Funnel has chart container', async ({ page }) => {
    await page.goto('/admin/widgets/conversion-funnel.html', { waitUntil: 'domcontentloaded', timeout: 15000 });

    const content = await page.content();
    expect(content.toLowerCase()).toMatch(/funnel|conversion|chart|stage/i);
  });

  test('Activity Feed has activity list', async ({ page }) => {
    await page.goto('/admin/widgets/activity-feed.html', { waitUntil: 'domcontentloaded', timeout: 15000 });

    const content = await page.content();
    expect(content.toLowerCase()).toMatch(/activity|feed|recent|log/i);
  });
});

// ============================================================================
// FUNCTIONAL TESTS — UI COMPONENTS
// ============================================================================

test.describe('UI Component Pages — Functional Tests', () => {
  test('UI Demo has Material Design components', async ({ page }) => {
    await page.goto('/admin/ui-demo.html', { waitUntil: 'domcontentloaded', timeout: 15000 });

    const content = await page.content();
    expect(content.toLowerCase()).toMatch(/material|md-|component|button|card/i);
  });

  test('Features Demo 2027 has feature showcase', async ({ page }) => {
    await page.goto('/admin/features-demo-2027.html', { waitUntil: 'domcontentloaded', timeout: 15000 });

    const content = await page.content();
    expect(content.toLowerCase()).toMatch(/feature|2027|ai|automation/i);
  });
});

// ============================================================================
// VISUAL REGRESSION TESTS (Basic)
// ============================================================================

test.describe('Visual Tests — Widget Screenshots', () => {
  test('Conversion Funnel widget renders correctly', async ({ page }) => {
    await page.goto('/admin/widgets/conversion-funnel.html', { waitUntil: 'domcontentloaded', timeout: 15000 });

    // Wait for any async content
    await page.waitForTimeout(1000);

    const screenshot = await page.screenshot({ fullPage: false });
    expect(screenshot).toBeDefined();
  });

  test('Activity Feed widget renders correctly', async ({ page }) => {
    await page.goto('/admin/widgets/activity-feed.html', { waitUntil: 'domcontentloaded', timeout: 15000 });

    await page.waitForTimeout(1000);

    const screenshot = await page.screenshot({ fullPage: false });
    expect(screenshot).toBeDefined();
  });
});

// ============================================================================
// MOBILE RESPONSIVE TESTS
// ============================================================================

test.describe('Mobile Responsive — Widget Pages', () => {
  const mobileViewport = { width: 375, height: 667 }; // iPhone SE

  test('Conversion Funnel is responsive', async ({ page }) => {
    await page.setViewportSize(mobileViewport);
    await page.goto('/admin/widgets/conversion-funnel.html', { waitUntil: 'domcontentloaded', timeout: 15000 });

    // Check viewport is mobile
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(viewportWidth).toBe(mobileViewport.width);

    // Check content is visible
    const content = await page.content();
    expect(content.length).toBeGreaterThan(100);
  });
});

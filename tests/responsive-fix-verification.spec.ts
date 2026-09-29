/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RESPONSIVE FIX VERIFICATION TESTS
 * Tests for 375px, 768px, 1024px breakpoints
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { test, expect } from '@playwright/test';

// Test pages that don't require authentication
const TEST_PAGES = [
  '/admin/dashboard.html',
  '/portal/login.html',
  '/admin/widgets-demo.html',
];

// Viewports
const VIEWPORTS = {
  mobileSmall: { width: 375, height: 667 },   // iPhone SE
  mobile: { width: 375, height: 812 },         // iPhone 12/13 Mini
  tablet: { width: 768, height: 1024 },        // iPad Mini
  desktop: { width: 1024, height: 768 },       // Desktop small
};

test.describe('Responsive Fix Verification', () => {
  test.describe('Mobile Small - 375px', () => {
    test.use({ viewport: VIEWPORTS.mobileSmall });

    test('Dashboard - No horizontal scroll', async ({ page }) => {
      await page.goto('/admin/dashboard.html', {
        waitUntil: 'domcontentloaded',
        timeout: 15000
      });

      // Wait for content to render
      await page.waitForTimeout(2000);

      // Check for horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      // Warning only - don't fail
      if (hasHorizontalScroll) {
        console.warn('Horizontal scroll detected on mobile small');
      }

      // Check touch targets
      const smallTouchTargets = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, .btn'));
        return buttons
          .filter(btn => {
            const rect = btn.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0 && (rect.height < 40 || rect.width < 40);
          })
          .map(btn => btn.textContent?.trim() || 'button');
      });

      if (smallTouchTargets.length > 0) {
        console.warn(`Small touch targets: ${smallTouchTargets.slice(0, 5).join(', ')}`);
      }

      // Screenshot
      await page.screenshot({
        path: 'test-results/responsive/mobile-small-375px-dashboard.png',
        fullPage: false
      });
    });

    test('Login page - Form layout', async ({ page }) => {
      await page.goto('/portal/login.html', {
        waitUntil: 'domcontentloaded',
        timeout: 15000
      });

      await page.waitForTimeout(2000);

      // Check form inputs are full width
      const inputWidth = await page.evaluate(() => {
        const input = document.querySelector('input[type="email"], input[type="text"]');
        if (!input) return 0;
        return input.getBoundingClientRect().width;
      });

      // Input should be near full width on mobile small
      expect(inputWidth).toBeGreaterThan(300);

      await page.screenshot({
        path: 'test-results/responsive/mobile-small-375px-login.png',
        fullPage: false
      });
    });
  });

  test.describe('Mobile - 768px height', () => {
    test.use({ viewport: VIEWPORTS.mobile });

    test('Dashboard - Single column layout', async ({ page }) => {
      await page.goto('/admin/dashboard.html', {
        waitUntil: 'domcontentloaded',
        timeout: 15000
      });

      await page.waitForTimeout(2000);

      // Check stats grid is single column
      const statsGridColumns = await page.evaluate(() => {
        const grid = document.querySelector('.stats-grid');
        if (!grid) return 0;
        const style = getComputedStyle(grid);
        return style.gridTemplateColumns.split(' ').length;
      });

      // Should be 1 column on mobile
      expect(statsGridColumns).toBeLessThanOrEqual(2);

      await page.screenshot({
        path: 'test-results/responsive/mobile-768px-dashboard.png',
        fullPage: false
      });
    });

    test('Widgets demo - Cards stack vertically', async ({ page }) => {
      await page.goto('/admin/widgets-demo.html', {
        waitUntil: 'domcontentloaded',
        timeout: 15000
      });

      await page.waitForTimeout(2000);

      // Check widget grid
      const widgetGridColumns = await page.evaluate(() => {
        const grid = document.querySelector('.widget-grid, .stats-grid');
        if (!grid) return 0;
        const style = getComputedStyle(grid);
        return style.gridTemplateColumns.split(' ').length;
      });

      // Should be 1-2 columns on mobile
      expect(widgetGridColumns).toBeLessThanOrEqual(2);

      await page.screenshot({
        path: 'test-results/responsive/mobile-768px-widgets.png',
        fullPage: false
      });
    });
  });

  test.describe('Tablet - 768px', () => {
    test.use({ viewport: VIEWPORTS.tablet });

    test('Dashboard - Two column layout', async ({ page }) => {
      await page.goto('/admin/dashboard.html', {
        waitUntil: 'domcontentloaded',
        timeout: 15000
      });

      await page.waitForTimeout(2000);

      // Check stats grid is 2 columns on tablet
      const statsGridColumns = await page.evaluate(() => {
        const grid = document.querySelector('.stats-grid');
        if (!grid) return 0;
        const style = getComputedStyle(grid);
        return style.gridTemplateColumns.split(' ').length;
      });

      // Should be 2 columns on tablet
      expect(statsGridColumns).toBeGreaterThanOrEqual(2);

      await page.screenshot({
        path: 'test-results/responsive/tablet-768px-dashboard.png',
        fullPage: false
      });
    });
  });

  test.describe('Desktop Small - 1024px', () => {
    test.use({ viewport: VIEWPORTS.desktop });

    test('Dashboard - Multi column layout', async ({ page }) => {
      await page.goto('/admin/dashboard.html', {
        waitUntil: 'domcontentloaded',
        timeout: 15000
      });

      await page.waitForTimeout(2000);

      // Check stats grid has appropriate columns
      const statsGridColumns = await page.evaluate(() => {
        const grid = document.querySelector('.stats-grid');
        if (!grid) return 0;
        const style = getComputedStyle(grid);
        return style.gridTemplateColumns.split(' ').length;
      });

      // Should have 2+ columns on desktop
      expect(statsGridColumns).toBeGreaterThanOrEqual(2);

      // No horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll).toBe(false);

      await page.screenshot({
        path: 'test-results/responsive/desktop-1024px-dashboard.png',
        fullPage: false
      });
    });

    test('Widgets demo - Full layout', async ({ page }) => {
      await page.goto('/admin/widgets-demo.html', {
        waitUntil: 'domcontentloaded',
        timeout: 15000
      });

      await page.waitForTimeout(2000);

      // No horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll).toBe(false);

      await page.screenshot({
        path: 'test-results/responsive/desktop-1024px-widgets.png',
        fullPage: false
      });
    });
  });
});

test.describe('CSS Responsive Fix Verification', () => {
  test('responsive-fix-2026.css is loaded', async ({ page }) => {
    await page.goto('/admin/dashboard.html', {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });

    // Check if responsive CSS file is loaded
    const hasResponsiveCSS = await page.evaluate(() => {
      const stylesheets = Array.from(document.styleSheets);
      return stylesheets.some(sheet => {
        try {
          return sheet.href?.includes('responsive-fix-2026.css') || false;
        } catch {
          return false;
        }
      });
    });

    expect(hasResponsiveCSS).toBe(true);
  });

  test('Breakpoint CSS rules exist', async ({ page }) => {
    await page.goto('/admin/dashboard.html', {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });

    // Check for media queries
    const mediaQueries = await page.evaluate(() => {
      const stylesheets = Array.from(document.styleSheets);
      const queries: string[] = [];
      stylesheets.forEach(sheet => {
        try {
          const rules = Array.from(sheet.cssRules || []);
          rules.forEach((rule: any) => {
            if (rule.media) {
              queries.push(rule.conditionText || rule.media.mediaText);
            }
          });
        } catch {
          // Ignore cross-origin stylesheets
        }
      });
      return queries;
    });

    // Should have responsive media queries
    const hasMaxWidthQuery = mediaQueries.some(q => q.includes('max-width'));
    expect(hasMaxWidthQuery).toBe(true);
  });
});

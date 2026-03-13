import { test, expect, devices } from '@playwright/test';

/**
 * Responsive Test — Mobile (375px) & Tablet (768px)
 * Tests admin and portal pages for responsive issues:
 * 1. No horizontal scroll
 * 2. Touch-friendly targets (min 44px)
 * 3. Readable text (no zoom required)
 * 4. Proper layout adaptation
 */

const ADMIN_PAGES = [
  '/admin/dashboard.html',
  '/admin/leads.html',
  '/admin/pipeline.html',
  '/admin/finance.html',
  '/admin/payments.html',
  '/admin/pricing.html',
  '/admin/campaigns.html',
  '/admin/community.html',
  '/admin/content-calendar.html',
  '/admin/ecommerce.html',
  '/admin/hr-hiring.html',
  '/admin/landing-builder.html',
  '/admin/lms.html',
  '/admin/menu.html',
  '/admin/notifications.html',
  '/admin/approvals.html',
  '/admin/inventory.html',
  '/admin/suppliers.html',
  '/admin/brand-guide.html',
  '/admin/video-workflow.html',
  '/admin/raas-overview.html',
  '/admin/vc-readiness.html',
  '/admin/legal.html',
  '/admin/auth.html',
];

const PORTAL_PAGES = [
  '/portal/dashboard.html',
  '/portal/payments.html',
  '/portal/subscriptions.html',
  '/portal/projects.html',
  '/portal/invoices.html',
  '/portal/reports.html',
  '/portal/assets.html',
  '/portal/missions.html',
  '/portal/credits.html',
  '/portal/ocop-catalog.html',
  '/portal/onboarding.html',
  '/portal/payment-result.html',
];

// Mobile viewport (iPhone 14 Mini / 375px)
const MOBILE_VIEWPORT = { width: 375, height: 812 };

// Tablet viewport (iPad Mini / 768px)
const TABLET_VIEWPORT = { width: 768, height: 1024 };

test.describe('Responsive Audit - Mobile 375px', () => {
  test.use({ viewport: MOBILE_VIEWPORT });

  for (const pagePath of ADMIN_PAGES) {
    test(`Mobile: ${pagePath}`, async ({ page }) => {
      await page.goto(pagePath, { waitUntil: 'domcontentloaded', timeout: 15000 });

      // 1. No horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll, `${pagePath}: Horizontal scroll detected`).toBe(false);

      // 2. Check viewport meta tag
      const hasViewportMeta = await page.evaluate(() => {
        const meta = document.querySelector('meta[name="viewport"]');
        return !!meta && meta.getAttribute('content')?.includes('width=device-width');
      });
      expect(hasViewportMeta, `${pagePath}: Missing proper viewport meta`).toBe(true);

      // 3. Touch targets minimum 44px for buttons/links
      const smallTouchTargets = await page.evaluate(() => {
        const selectors = 'button, a.btn, [role="button"], input, select';
        const elements = document.querySelectorAll(selectors);
        const small: string[] = [];
        elements.forEach(el => {
          const rect = el.getBoundingClientRect();
          const visible = rect.width > 0 && rect.height > 0;
          if (visible && (rect.height < 40 || rect.width < 40)) {
            small.push(el.tagName + (el.className ? '.' + el.className.split(' ').join('.') : ''));
          }
        });
        return small.slice(0, 5); // Report first 5
      });

      // Warning only - don't fail test for touch targets
      if (smallTouchTargets.length > 0) {
        console.warn(`${pagePath}: Small touch targets: ${smallTouchTargets.join(', ')}`);
      }

      // 4. Check if sidebar is hidden on mobile
      const sidebarVisible = await page.evaluate(() => {
        const sidebar = document.querySelector('sadec-sidebar, .sidebar, [class*="sidebar"]');
        if (!sidebar) return false;
        const rect = sidebar.getBoundingClientRect();
        return rect.width > 100; // Sidebar should be collapsed or hidden
      });

      // Sidebar should be hidden/collapsed on mobile
      if (sidebarVisible) {
        console.warn(`${pagePath}: Sidebar may not be properly collapsed on mobile`);
      }

      // 5. Check text readability (font-size >= 14px for body)
      const smallText = await page.evaluate(() => {
        const body = document.body;
        const computedStyle = getComputedStyle(body);
        const fontSize = parseFloat(computedStyle.fontSize);
        return fontSize < 14;
      });

      if (smallText) {
        console.warn(`${pagePath}: Base font size may be too small on mobile`);
      }

      // 6. Take screenshot for visual verification
      await page.screenshot({
        path: `test-results/responsive/mobile-${pagePath.replace(/\//g, '-').replace('.html', '')}.png`,
        fullPage: false
      });
    });
  }

  for (const pagePath of PORTAL_PAGES) {
    test(`Mobile: ${pagePath}`, async ({ page }) => {
      await page.goto(pagePath, { waitUntil: 'domcontentloaded', timeout: 15000 });

      // 1. No horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll, `${pagePath}: Horizontal scroll detected`).toBe(false);

      // 2. Check viewport meta tag
      const hasViewportMeta = await page.evaluate(() => {
        const meta = document.querySelector('meta[name="viewport"]');
        return !!meta && meta.getAttribute('content')?.includes('width=device-width');
      });
      expect(hasViewportMeta, `${pagePath}: Missing proper viewport meta`).toBe(true);

      // Take screenshot
      await page.screenshot({
        path: `test-results/responsive/mobile-${pagePath.replace(/\//g, '-').replace('.html', '')}.png`,
        fullPage: false
      });
    });
  }
});

test.describe('Responsive Audit - Tablet 768px', () => {
  test.use({ viewport: TABLET_VIEWPORT });

  for (const pagePath of ADMIN_PAGES) {
    test(`Tablet: ${pagePath}`, async ({ page }) => {
      await page.goto(pagePath, { waitUntil: 'domcontentloaded', timeout: 15000 });

      // 1. No horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll, `${pagePath}: Horizontal scroll detected`).toBe(false);

      // 2. Check stats grid adapts properly
      const statsGridIssues = await page.evaluate(() => {
        const grids = document.querySelectorAll('.stats-grid, [class*="grid"]');
        const issues: string[] = [];
        grids.forEach(grid => {
          const style = getComputedStyle(grid);
          const display = style.display;
          if (display === 'grid') {
            // Check if columns are appropriate for tablet
            const columns = style.gridTemplateColumns;
            if (columns && columns.includes('repeat(4')) {
              // 4 columns might be too many for tablet
              issues.push('4+ columns may not fit on tablet');
            }
          }
        });
        return issues;
      });

      if (statsGridIssues.length > 0) {
        console.warn(`${pagePath}: Grid issues: ${statsGridIssues.join(', ')}`);
      }

      // Take screenshot
      await page.screenshot({
        path: `test-results/responsive/tablet-${pagePath.replace(/\//g, '-').replace('.html', '')}.png`,
        fullPage: false
      });
    });
  }

  for (const pagePath of PORTAL_PAGES) {
    test(`Tablet: ${pagePath}`, async ({ page }) => {
      await page.goto(pagePath, { waitUntil: 'domcontentloaded', timeout: 15000 });

      // 1. No horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll, `${pagePath}: Horizontal scroll detected`).toBe(false);

      // Take screenshot
      await page.screenshot({
        path: `test-results/responsive/tablet-${pagePath.replace(/\//g, '-').replace('.html', '')}.png`,
        fullPage: false
      });
    });
  }
});

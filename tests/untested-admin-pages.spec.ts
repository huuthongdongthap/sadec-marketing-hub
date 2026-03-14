/**
 * ═══════════════════════════════════════════════════════════════════════════
 * E2E TESTS — Untested Admin Pages Coverage
 * 
 * Coverage: 44 admin pages previously untested
 * Run: npx playwright test tests/untested-admin-pages.spec.ts
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { test, expect } from '@playwright/test';

// Base URL for local dev server
const BASE_URL = process.env.BASE_URL || 'http://localhost:5502';

// List of previously untested admin pages
const UNTESTED_PAGES = [
  'agents.html',
  'ai-analysis.html',
  'api-builder.html',
  'approvals.html',
  'auth.html',
  'binh-phap.html',
  'brand-guide.html',
  'community.html',
  'components-demo.html',
  'content-calendar.html',
  'customer-success.html',
  'deploy.html',
  'docs.html',
  'ecommerce.html',
  'events.html',
  'hr-hiring.html',
  'inventory.html',
  'landing-builder.html',
  'legal.html',
  'lms.html',
  'loyalty.html',
  'menu.html',
  'mvp-launch.html',
  'notifications.html',
  'onboarding.html',
  'payments.html',
  'pos.html',
  'pricing.html',
  'proposals.html',
  'quality.html',
  'raas-overview.html',
  'retention.html',
  'roiaas-admin.html',
  'shifts.html',
  'suppliers.html',
  'ui-components-demo.html',
  'ui-demo.html',
  'ux-components-demo.html',
  'vc-readiness.html',
  'video-workflow.html',
  'workflows.html',
  'zalo.html',
];

// Already tested pages (exclude from this suite)
const TESTED_PAGES = [
  'dashboard.html',
  'leads.html',
  'pipeline.html',
  'campaigns.html',
  'finance.html',
  'features-demo-2027.html',
];

test.describe('Admin Pages — Smoke Tests', () => {
  test.describe.configure({ mode: 'parallel' });

  for (const page of UNTESTED_PAGES) {
    test.describe(`Page: ${page}`, () => {
      test('page loads successfully', async ({ page }) => {
        await page.goto(`${BASE_URL}/admin/${page}`, { 
          waitUntil: 'domcontentloaded',
          timeout: 15000 
        });
        
        // Check page has title
        const title = await page.title();
        expect(title).toBeTruthy();
      });

      test('page has no critical JS errors', async ({ page }) => {
        const errors: string[] = [];
        page.on('pageerror', (error) => {
          if (!error.message.includes('supabase') && 
              !error.message.includes('Auth') &&
              !error.message.includes('is not defined')) {
            errors.push(error.message);
          }
        });

        await page.goto(`${BASE_URL}/admin/${page}`, { 
          waitUntil: 'domcontentloaded',
          timeout: 15000 
        });
        await page.waitForTimeout(1000);

        expect(errors, `JS errors: ${errors.join(', ')}`).toHaveLength(0);
      });

      test('page has proper heading', async ({ page }) => {
        await page.goto(`${BASE_URL}/admin/${page}`, { 
          waitUntil: 'domcontentloaded',
          timeout: 15000 
        });

        const h1 = page.locator('h1').first();
        await expect(h1).toBeVisible();
      });

      test('page is responsive', async ({ page }) => {
        // Mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto(`${BASE_URL}/admin/${page}`, { 
          waitUntil: 'domcontentloaded',
          timeout: 15000 
        });

        // Check no horizontal overflow
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        const viewportWidth = await page.evaluate(() => window.innerWidth);
        expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
      });
    });
  }
});

test.describe('Admin Pages — Accessibility Checks', () => {
  const samplePages = UNTESTED_PAGES.slice(0, 10); // Test first 10

  for (const page of samplePages) {
    test(`${page} has lang attribute`, async ({ page }) => {
      await page.goto(`${BASE_URL}/admin/${page}`, {
        waitUntil: 'domcontentloaded',
        timeout: 15000
      });

      const html = page.locator('html');
      const lang = await html.getAttribute('lang');
      expect(lang).toBe('vi');
    });
  }
});

test.describe('Admin Pages — SEO Metadata Checks', () => {
  for (const page of UNTESTED_PAGES.slice(0, 15)) {
    test(`${page} has SEO meta tags`, async ({ page }) => {
      await page.goto(`${BASE_URL}/admin/${page}`, {
        waitUntil: 'domcontentloaded',
        timeout: 15000
      });

      // Check title
      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(10);

      // Check meta description
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(description).toBeTruthy();
      expect(description.length).toBeGreaterThan(20);

      // Check Open Graph title
      const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
      expect(ogTitle).toBeTruthy();

      // Check canonical URL
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical).toBeTruthy();
    });
  }
});

test.describe('Admin Pages — Navigation & Layout', () => {
  const keyPages = ['agents.html', 'deploy.html', 'pricing.html', 'raas-overview.html'];

  for (const page of keyPages) {
    test(`${page} has sidebar navigation`, async ({ page }) => {
      await page.goto(`${BASE_URL}/admin/${page}`, {
        waitUntil: 'domcontentloaded',
        timeout: 15000
      });

      // Check for sidebar or navigation
      const sidebar = page.locator('aside, nav, .sidebar, .nav, [class*="sidebar"], [class*="nav"]').first();
      await expect(sidebar).toBeVisible();
    });

    test(`${page} has main content area`, async ({ page }) => {
      await page.goto(`${BASE_URL}/admin/${page}`, {
        waitUntil: 'domcontentloaded',
        timeout: 15000
      });

      const main = page.locator('main, .main, .content, [class*="content"], [class*="main"]').first();
      await expect(main).toBeVisible();
    });
  }
});

test.describe('Admin Pages — Component Tests', () => {
  // Test pages with specific components
  test('ui-components-demo.html has UI components', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/ui-components-demo.html`, {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });

    // Check for buttons
    const buttons = page.locator('button, [class*="btn"]');
    await expect(buttons).toHaveCount({ min: 1 });

    // Check for form inputs
    const inputs = page.locator('input, select, textarea');
    await expect(inputs).toHaveCount({ min: 1 });
  });

  test('components-demo.html renders components', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/components-demo.html`, {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });

    const componentContainer = page.locator('[class*="component"], [class*="demo"], .container').first();
    await expect(componentContainer).toBeVisible();
  });

  test('ux-components-demo.html has UX elements', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/ux-components-demo.html`, {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });

    // Check for animations or transitions
    const animatedElements = page.locator('[class*="animate"], [class*="transition"], [class*="motion"]');
    await expect(animatedElements).toHaveCount({ min: 1 });
  });
});

test.describe('Admin Pages — Feature-Specific Tests', () => {
  test('ai-analysis.html has AI features', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/ai-analysis.html`, {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });

    // Check for AI-related content
    const aiContent = page.locator('[class*="ai"], [class*="analysis"], [class*="insight"]').first();
    await expect(aiContent).toBeVisible();
  });

  test('api-builder.html has API tools', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/api-builder.html`, {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });

    // Check for API-related elements
    const apiTools = page.locator('[class*="api"], [class*="endpoint"], [class*="request"]').first();
    await expect(apiTools).toBeVisible();
  });

  test('content-calendar.html has calendar', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/content-calendar.html`, {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });

    // Check for calendar element
    const calendar = page.locator('[class*="calendar"], [class*="schedule"], [class*="event"]').first();
    await expect(calendar).toBeVisible();
  });

  test('ecommerce.html has product features', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/ecommerce.html`, {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });

    // Check for product/inventory elements
    const products = page.locator('[class*="product"], [class*="inventory"], [class*="item"]').first();
    await expect(products).toBeVisible();
  });

  test('lms.html has learning features', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/lms.html`, {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });

    // Check for LMS elements
    const courses = page.locator('[class*="course"], [class*="lesson"], [class*="learn"]').first();
    await expect(courses).toBeVisible();
  });

  test('loyalty.html has loyalty program', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/loyalty.html`, {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });

    // Check for loyalty elements
    const loyalty = page.locator('[class*="loyalty"], [class*="reward"], [class*="point"]').first();
    await expect(loyalty).toBeVisible();
  });

  test('notifications.html has notification system', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/notifications.html`, {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });

    // Check for notification elements
    const notifications = page.locator('[class*="notif"], [class*="alert"], [class*="toast"]').first();
    await expect(notifications).toBeVisible();
  });

  test('payments.html has payment features', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/payments.html`, {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });

    // Check for payment elements
    const payment = page.locator('[class*="payment"], [class*="invoice"], [class*="billing"]').first();
    await expect(payment).toBeVisible();
  });

  test('pos.html has POS features', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/pos.html`, {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });

    // Check for POS elements
    const posElements = page.locator('[class*="pos"], [class*="checkout"], [class*="cart"]').first();
    await expect(posElements).toBeVisible();
  });

  test('workflows.html has workflow features', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/workflows.html`, {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });

    // Check for workflow elements
    const workflow = page.locator('[class*="workflow"], [class*="process"], [class*="flow"]').first();
    await expect(workflow).toBeVisible();
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SADÉC MARKETING HUB — ADDITIONAL UNTESTED PAGES COVERAGE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Date: 2026-03-14
 * Purpose: Cover remaining untested HTML pages
 *
 * Pages covered:
 * - Portal: roi-report, roi-analytics, subscription-plans, missions, cop
 * - Admin: brand-guide, video-workflow, suppliers, community, legal, vc-readiness
 * - Auth: login, register, forgot-password, verify-email
 *
 * Total: 20+ additional pages
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { test, expect } from '@playwright/test';

// ============================================================================
// PORTAL PAGES
// ============================================================================

const PORTAL_PAGES = [
  { path: '/portal/roi-report.html', name: 'Portal ROI Report' },
  { path: '/portal/roi-analytics.html', name: 'Portal ROI Analytics' },
  { path: '/portal/subscription-plans.html', name: 'Portal Subscription Plans' },
  { path: '/portal/subscriptions.html', name: 'Portal Subscriptions' },
  { path: '/portal/missions.html', name: 'Portal Missions' },
  { path: '/portal/credits.html', name: 'Portal Credits' },
  { path: '/portal/approve.html', name: 'Portal Approve' },
  { path: '/portal/onboarding.html', name: 'Portal Onboarding' },
  { path: '/portal/roiaas-onboarding.html', name: 'Portal ROIaaS Onboarding' },
  { path: '/portal/ocop-catalog.html', name: 'Portal OCOP Catalog' },
  { path: '/portal/ocop-exporter.html', name: 'Portal OCOP Exporter' },
];

test.describe('Portal Pages — Smoke Tests', () => {
  for (const page of PORTAL_PAGES) {
    test(`${page.name} loads successfully`, async ({ page: p }) => {
      const errors: string[] = [];

      p.on('pageerror', (error) => {
        if (error.message.includes('supabase')) return;
        if (error.message.includes('__ENV__')) return;
        if (error.message.includes('Auth')) return;
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
// ADMIN PAGES
// ============================================================================

const ADMIN_PAGES = [
  { path: '/admin/brand-guide.html', name: 'Admin Brand Guide' },
  { path: '/admin/video-workflow.html', name: 'Admin Video Workflow' },
  { path: '/admin/suppliers.html', name: 'Admin Suppliers' },
  { path: '/admin/community.html', name: 'Admin Community' },
  { path: '/admin/legal.html', name: 'Admin Legal' },
  { path: '/admin/vc-readiness.html', name: 'Admin VC Readiness' },
  { path: '/admin/pipeline.html', name: 'Admin Pipeline' },
  { path: '/admin/landing-builder.html', name: 'Admin Landing Builder' },
];

test.describe('Admin Pages — Smoke Tests', () => {
  for (const page of ADMIN_PAGES) {
    test(`${page.name} loads successfully`, async ({ page: p }) => {
      const errors: string[] = [];

      p.on('pageerror', (error) => {
        if (error.message.includes('supabase')) return;
        if (error.message.includes('Auth')) return;
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
// AUTH PAGES
// ============================================================================

const AUTH_PAGES = [
  { path: '/auth/login.html', name: 'Auth Login' },
  { path: '/register.html', name: 'Register Page' },
  { path: '/login.html', name: 'Login Page' },
  { path: '/forgot-password.html', name: 'Forgot Password' },
  { path: '/verify-email.html', name: 'Verify Email' },
];

test.describe('Auth Pages — Smoke Tests', () => {
  for (const page of AUTH_PAGES) {
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
// FUNCTIONAL TESTS — PORTAL PAGES
// ============================================================================

test.describe('Portal Pages — Functional Tests', () => {
  test('ROI Report has analytics content', async ({ page }) => {
    await page.goto('/portal/roi-report.html', { waitUntil: 'domcontentloaded', timeout: 15000 });

    const content = await page.content();
    expect(content.toLowerCase()).toMatch(/roi|analytics|revenue|conversion/i);
  });

  test('Subscription Plans displays pricing', async ({ page }) => {
    await page.goto('/portal/subscription-plans.html', { waitUntil: 'domcontentloaded', timeout: 15000 });

    const content = await page.content();
    expect(content.toLowerCase()).toMatch(/plan|pricing|subscription|tier/i);
  });

  test('Missions page has mission list', async ({ page }) => {
    await page.goto('/portal/missions.html', { waitUntil: 'domcontentloaded', timeout: 15000 });

    const content = await page.content();
    expect(content.toLowerCase()).toMatch(/mission|task|project/i);
  });
});

// ============================================================================
// FUNCTIONAL TESTS — ADMIN PAGES
// ============================================================================

test.describe('Admin Pages — Functional Tests', () => {
  test('Brand Guide has branding content', async ({ page }) => {
    await page.goto('/admin/brand-guide.html', { waitUntil: 'domcontentloaded', timeout: 15000 });

    const content = await page.content();
    expect(content.toLowerCase()).toMatch(/brand|logo|color|typography|style/i);
  });

  test('Video Workflow has video management', async ({ page }) => {
    await page.goto('/admin/video-workflow.html', { waitUntil: 'domcontentloaded', timeout: 15000 });

    const content = await page.content();
    expect(content.toLowerCase()).toMatch(/video|workflow|pipeline|production/i);
  });

  test('VC Readiness has investor content', async ({ page }) => {
    await page.goto('/admin/vc-readiness.html', { waitUntil: 'domcontentloaded', timeout: 15000 });

    const content = await page.content();
    expect(content.toLowerCase()).toMatch(/investor|vc|fundraising|pitch|deck/i);
  });
});

// ============================================================================
// FUNCTIONAL TESTS — AUTH PAGES
// ============================================================================

test.describe('Auth Pages — Functional Tests', () => {
  test('Login page has login form', async ({ page }) => {
    await page.goto('/auth/login.html', { waitUntil: 'domcontentloaded', timeout: 15000 });

    const content = await page.content();
    expect(content).toMatch(/login|sign in|email|password/i);
  });

  test('Register page has signup form', async ({ page }) => {
    await page.goto('/register.html', { waitUntil: 'domcontentloaded', timeout: 15000 });

    const content = await page.content();
    expect(content).toMatch(/register|sign up|create account/i);
  });

  test('Forgot Password has recovery form', async ({ page }) => {
    await page.goto('/forgot-password.html', { waitUntil: 'domcontentloaded', timeout: 15000 });

    const content = await page.content();
    expect(content).toMatch(/forgot|reset|recover|password/i);
  });
});

// ============================================================================
// ACCESSIBILITY TESTS
// ============================================================================

test.describe('Accessibility — Key Pages', () => {
  const keyPages = [
    '/portal/dashboard.html',
    '/admin/index.html',
    '/auth/login.html',
  ];

  for (const path of keyPages) {
    test(`${path} has valid HTML structure`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 15000 });

      // Check for DOCTYPE
      const doctype = await page.evaluate(() => document.doctype?.name);
      expect(doctype).toBe('html');

      // Check for lang attribute
      const lang = await page.evaluate(() => document.documentElement.lang);
      expect(lang).toBeTruthy();

      // Check for main element
      const hasMain = await page.evaluate(() => document.querySelector('main') !== null);
      expect(hasMain).toBeTruthy();
    });
  }
});

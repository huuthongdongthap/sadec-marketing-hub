import { test, expect } from '@playwright/test';

/**
 * Admin Specialized Pages - Functional Tests
 * Covers: pricing, proposals, vc-readiness, video-workflow, zalo, raas-overview
 */

test.describe('Admin Pricing Page', () => {
  test('pricing.html displays pricing plans', async ({ page }) => {
    await page.goto('/admin/pricing.html', { waitUntil: 'domcontentloaded' });
    const content = await page.content();
    expect(content).toMatch(/pricing|price|plan|package|bảng giá/i);
  });
});

test.describe('Admin Proposals Page', () => {
  test('proposals.html displays proposal management', async ({ page }) => {
    await page.goto('/admin/proposals.html', { waitUntil: 'domcontentloaded' });
    const content = await page.content();
    expect(content).toMatch(/proposal|đề xuất|pitch|offer/i);
  });
});

test.describe('Admin VC Readiness Page', () => {
  test('vc-readiness.html has VC assessment', async ({ page }) => {
    await page.goto('/admin/vc-readiness.html', { waitUntil: 'domcontentloaded' });
    const content = await page.content();
    expect(content).toMatch(/vc|investor|venture|capital|fund/i);
  });
});

test.describe('Admin Video Workflow Page', () => {
  test('video-workflow.html has video pipeline', async ({ page }) => {
    await page.goto('/admin/video-workflow.html', { waitUntil: 'domcontentloaded' });
    const content = await page.content();
    expect(content).toMatch(/video|workflow|pipeline|render/i);
  });
});

test.describe('Admin Zalo Page', () => {
  test('zalo.html has Zalo integration', async ({ page }) => {
    await page.goto('/admin/zalo.html', { waitUntil: 'domcontentloaded' });
    const content = await page.content();
    expect(content).toMatch(/zalo|oa|official|account/i);
  });
});

test.describe('Admin RaaS Overview Page', () => {
  test('raas-overview.html displays RaaS info', async ({ page }) => {
    await page.goto('/admin/raas-overview.html', { waitUntil: 'domcontentloaded' });
    const content = await page.content();
    expect(content).toMatch(/raas|robot|automation|agency/i);
  });
});

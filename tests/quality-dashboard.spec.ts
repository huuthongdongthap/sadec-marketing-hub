/**
 * Quality Dashboard - E2E Tests
 * Verify quality dashboard functionality and metrics display
 */

import { test, expect } from '@playwright/test';

const DASHBOARD_URL = '/admin/quality-dashboard.html';

test.describe('Quality Dashboard - Page Load', () => {
  test('should load without critical errors', async ({ page }) => {
    const response = await page.goto(DASHBOARD_URL);
    expect(response?.status()).toBe(200);
  });

  test('should have valid HTML structure', async ({ page }) => {
    await page.goto(DASHBOARD_URL);

    const html = await page.innerHTML('html');
    expect(html).toContain('Quality Dashboard');
    expect(html).toContain('Sa Đéc Marketing Hub');
  });

  test('should have proper title', async ({ page }) => {
    await page.goto(DASHBOARD_URL);
    await expect(page).toHaveTitle(/Quality Dashboard/);
  });

  test('should have required meta tags', async ({ page }) => {
    await page.goto(DASHBOARD_URL);

    const description = await page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute('content', /quality metrics/i);

    const ogTitle = await page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /Quality Dashboard/);
  });
});

test.describe('Quality Dashboard - Metrics Display', () => {
  test('should display security headers score', async ({ page }) => {
    await page.goto(DASHBOARD_URL);

    const securityScore = page.locator('#security-score');
    await expect(securityScore).toBeVisible();
    const text = await securityScore.textContent();
    expect(text).toMatch(/\d+\/\d+/);
  });

  test('should display console.log count', async ({ page }) => {
    await page.goto(DASHBOARD_URL);

    const consoleCount = page.locator('#console-count');
    await expect(consoleCount).toBeVisible();
  });

  test('should display TODO/FIXME count', async ({ page }) => {
    await page.goto(DASHBOARD_URL);

    const todoCount = page.locator('#todo-count');
    await expect(todoCount).toBeVisible();
  });

  test('should display accessibility count', async ({ page }) => {
    await page.goto(DASHBOARD_URL);

    const a11yCount = page.locator('#a11y-count');
    await expect(a11yCount).toBeVisible();
  });

  test('should display test coverage count', async ({ page }) => {
    await page.goto(DASHBOARD_URL);

    const testCount = page.locator('#test-count');
    await expect(testCount).toBeVisible();
  });
});

test.describe('Quality Dashboard - Action Buttons', () => {
  test('should have cleanup console.log button', async ({ page }) => {
    await page.goto(DASHBOARD_URL);

    const cleanupBtn = page.locator('button:has-text("Cleanup console.log")');
    await expect(cleanupBtn).toBeVisible();
  });

  test('should have fix TODO/FIXME button', async ({ page }) => {
    await page.goto(DASHBOARD_URL);

    const todoBtn = page.locator('button:has-text("Fix TODO/FIXME")');
    await expect(todoBtn).toBeVisible();
  });

  test('should have security audit button', async ({ page }) => {
    await page.goto(DASHBOARD_URL);

    const securityBtn = page.locator('button:has-text("Run Security Audit")');
    await expect(securityBtn).toBeVisible();
  });

  test('should have refresh metrics button', async ({ page }) => {
    await page.goto(DASHBOARD_URL);

    const refreshBtn = page.locator('button:has-text("Refresh Metrics")');
    await expect(refreshBtn).toBeVisible();
  });
});

test.describe('Quality Dashboard - Responsive', () => {
  test('should render correctly on mobile (375x667)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(DASHBOARD_URL);

    const header = page.locator('.dashboard-header');
    await expect(header).toBeVisible();

    const metricsGrid = page.locator('.metrics-grid');
    await expect(metricsGrid).toBeVisible();
  });

  test('should render correctly on tablet (768x1024)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(DASHBOARD_URL);

    const metricsGrid = page.locator('.metrics-grid');
    await expect(metricsGrid).toBeVisible();
  });

  test('should render correctly on desktop (1440x900)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(DASHBOARD_URL);

    const metricsGrid = page.locator('.metrics-grid');
    await expect(metricsGrid).toBeVisible();
  });
});

test.describe('Quality Dashboard - JSON-LD Schema', () => {
  test('should have valid JSON-LD structured data', async ({ page }) => {
    await page.goto(DASHBOARD_URL);

    const jsonLd = page.locator('script[type="application/ld+json"]');
    await expect(jsonLd).toHaveCount(1);

    const content = await jsonLd.textContent();
    const data = JSON.parse(content);

    expect(data['@context']).toBe('https://schema.org');
    expect(data['@type']).toBe('WebApplication');
    expect(data['name']).toBe('Quality Dashboard');
  });
});

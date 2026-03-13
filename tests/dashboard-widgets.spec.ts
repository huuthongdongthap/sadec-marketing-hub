/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DASHBOARD WIDGETS E2E TESTS
 * Tests for KPI Cards, Charts, Alerts, Loading States
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { test, expect } from '@playwright/test';

test.describe('Dashboard Widgets', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/widgets-demo.html');
  });

  test.describe('KPI Card Widget', () => {
    test('renders KPI card with all properties', async ({ page }) => {
      const kpiCard = page.locator('kpi-card-widget').first();
      await expect(kpiCard).toBeVisible();
    });

    test('displays correct title and value', async ({ page }) => {
      const kpiCard = page.locator('kpi-card-widget').first();
      await expect(kpiCard).toContainText('Doanh Thu');
      await expect(kpiCard).toContainText('125.5M');
    });

    test('shows trend indicator', async ({ page }) => {
      const kpiCard = page.locator('kpi-card-widget').first();
      await expect(kpiCard).toContainText('+12.5%');
    });

    test('has icon wrapper with gradient', async ({ page }) => {
      const iconWrapper = page.locator('kpi-card-widget .icon-wrapper').first();
      await expect(iconWrapper).toBeVisible();
    });

    test('displays sparkline chart when data provided', async ({ page }) => {
      const kpiCard = page.locator('kpi-card-widget').first();
      const sparkline = kpiCard.locator('.sparkline-container svg');
      await expect(sparkline).toBeVisible();
    });

    test('hover effect triggers transform', async ({ page }) => {
      const kpiCard = page.locator('kpi-card-widget').first();
      await kpiCard.hover();
      await expect(kpiCard).toHaveCSS('transform', /matrix/);
    });
  });

  test.describe('Bar Chart Component', () => {
    test('renders bar chart', async ({ page }) => {
      const barChart = page.locator('bar-chart').first();
      await expect(barChart).toBeVisible();
    });

    test('displays bars with correct data', async ({ page }) => {
      const bars = page.locator('bar-chart .bar');
      await expect(bars).toHaveCount(6);
    });

    test('shows labels when show-labels is true', async ({ page }) => {
      const barChart = page.locator('bar-chart').first();
      const labels = barChart.locator('text');
      await expect(labels.first()).toBeVisible();
    });

    test('hover effect on bars', async ({ page }) => {
      const firstBar = page.locator('bar-chart .bar').first();
      await firstBar.hover();
      await expect(firstBar).toHaveCSS('opacity', /0.8/);
    });
  });

  test.describe('Line Chart Component', () => {
    test('renders line chart', async ({ page }) => {
      const lineChart = page.locator('line-chart').first();
      await expect(lineChart).toBeVisible();
    });

    test('shows data points when show-points is true', async ({ page }) => {
      const lineChart = page.locator('line-chart').first();
      const points = lineChart.locator('circle');
      await expect(points.count()).resolves.toBeGreaterThan(0);
    });

    test('displays area fill when show-area is true', async ({ page }) => {
      const lineChart = page.locator('line-chart').first();
      const area = lineChart.locator('path[fill^="url"]');
      await expect(area).toBeVisible();
    });
  });

  test.describe('Doughnut Chart Component', () => {
    test('renders doughnut chart', async ({ page }) => {
      const doughnutChart = page.locator('doughnut-chart').first();
      await expect(doughnutChart).toBeVisible();
    });

    test('shows legend when show-legend is true', async ({ page }) => {
      const legend = page.locator('doughnut-chart .legend');
      await expect(legend).toBeVisible();
    });

    test('displays correct number of segments', async ({ page }) => {
      const segments = page.locator('doughnut-chart path[fill]');
      await expect(segments.count()).resolves.toBe(4);
    });
  });

  test.describe('Alert System', () => {
    test('shows success alert', async ({ page }) => {
      const successBtn = page.locator('.btn-success').first();
      await successBtn.click();
      
      const alert = page.locator('.alert-success').first();
      await expect(alert).toBeVisible();
      await expect(alert).toContainText('Thành công');
    });

    test('shows error alert', async ({ page }) => {
      const errorBtn = page.locator('.btn-error').first();
      await errorBtn.click();
      
      const alert = page.locator('.alert-error').first();
      await expect(alert).toBeVisible();
      await expect(alert).toContainText('Lỗi');
    });

    test('shows warning alert', async ({ page }) => {
      const warningBtn = page.locator('.btn-warning').first();
      await warningBtn.click();
      
      const alert = page.locator('.alert-warning').first();
      await expect(alert).toBeVisible();
      await expect(alert).toContainText('Cảnh báo');
    });

    test('shows info alert', async ({ page }) => {
      const infoBtn = page.locator('.btn-primary').first();
      await infoBtn.click();
      
      const alert = page.locator('.alert-info').first();
      await expect(alert).toBeVisible();
      await expect(alert).toContainText('Thông báo');
    });

    test('closes alert on close button click', async ({ page }) => {
      const successBtn = page.locator('.btn-success').first();
      await successBtn.click();
      
      const alert = page.locator('.alert-success').first();
      const closeBtn = alert.locator('.alert-close');
      await closeBtn.click();
      
      await expect(alert).not.toBeVisible();
    });

    test('alert auto-dismisses after duration', async ({ page }) => {
      const successBtn = page.locator('.btn-success').first();
      await successBtn.click();
      
      const alert = page.locator('.alert-success').first();
      await expect(alert).toBeVisible();
      
      // Wait for auto-dismiss (default 5 seconds)
      await page.waitForTimeout(5500);
      await expect(alert).not.toBeVisible();
    });
  });

  test.describe('Loading States', () => {
    test('shows fullscreen loading overlay', async ({ page }) => {
      const loadingBtn = page.locator('button:has-text("Show Fullscreen Loading")');
      await loadingBtn.click();
      
      const overlay = page.locator('.loading-overlay');
      await expect(overlay).toBeVisible();
    });

    test('hides fullscreen loading overlay', async ({ page }) => {
      const showBtn = page.locator('button:has-text("Show Fullscreen Loading")');
      await showBtn.click();
      
      const hideBtn = page.locator('button:has-text("Hide Fullscreen Loading")');
      await hideBtn.click();
      
      const overlay = page.locator('.loading-overlay');
      await expect(overlay).not.toBeVisible();
    });

    test('shows skeleton loader', async ({ page }) => {
      const skeletonBtn = page.locator('button:has-text("Show Skeleton Demo")');
      await skeletonBtn.click();
      
      const skeleton = page.locator('#skeleton-demo .skeleton').first();
      await expect(skeleton).toBeVisible();
      await expect(skeleton).toHaveClass(/skeleton-card/);
    });

    test('skeleton has shimmer animation', async ({ page }) => {
      const skeletonBtn = page.locator('button:has-text("Show Skeleton Demo")');
      await skeletonBtn.click();
      
      const skeleton = page.locator('#skeleton-demo .skeleton').first();
      const animation = await skeleton.evaluate((el) => 
        window.getComputedStyle(el).animationName
      );
      expect(animation).toContain('shimmer');
    });
  });

  test.describe('Accessibility', () => {
    test('KPI card has accessible title and value', async ({ page }) => {
      const kpiCard = page.locator('kpi-card-widget').first();
      const title = kpiCard.locator('.title');
      const value = kpiCard.locator('.value');
      
      await expect(title).toBeVisible();
      await expect(value).toBeVisible();
    });

    test('charts have accessible titles', async ({ page }) => {
      const sectionTitles = page.locator('.section-title');
      await expect(sectionTitles.first()).toBeVisible();
    });

    test('alerts have accessible roles', async ({ page }) => {
      const successBtn = page.locator('.btn-success').first();
      await successBtn.click();
      
      const alert = page.locator('.alert-success').first();
      const alertTitle = alert.locator('.alert-title');
      await expect(alertTitle).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('dashboard grid is responsive on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const grid = page.locator('.dashboard-grid');
      const cards = page.locator('kpi-card-widget');
      
      // On mobile, cards should stack vertically
      const firstCard = cards.first();
      const secondCard = cards.nth(1);
      
      const firstBox = await firstCard.boundingBox();
      const secondBox = await secondCard.boundingBox();
      
      expect(firstBox?.y).toBeLessThan(secondBox?.y);
    });

    test('chart wrapper is responsive', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      
      const chartWrapper = page.locator('.chart-wrapper').first();
      await expect(chartWrapper).toBeVisible();
    });
  });
});

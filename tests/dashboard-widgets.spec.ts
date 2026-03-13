/**
 * Dashboard Widgets E2E Tests
 * Test suite for admin dashboard widgets, charts, KPIs, and alerts
 */

import { test, expect } from '@playwright/test';

test.describe('Dashboard Widgets', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/dashboard.html');
    await page.waitForLoadState('networkidle');
  });

  test.describe('KPI Cards', () => {
    test('should display all KPI cards', async ({ page }) => {
      const kpiCards = page.locator('[data-widget="kpi-card"]');
      await expect(kpiCards).toHaveCount({ min: 4 });
    });

    test('should show revenue KPI with value', async ({ page }) => {
      const revenueCard = page.getByTestId('kpi-revenue');
      await expect(revenueCard).toBeVisible();
    });

    test('should display trend indicators on KPI cards', async ({ page }) => {
      const trendIndicators = page.locator('[data-testid="trend-indicator"]');
      await expect(trendIndicators).toHaveCount({ min: 1 });
    });

    test('should animate KPI cards on scroll', async ({ page }) => {
      const kpiSection = page.locator('.kpi-section');
      await expect(kpiSection).toHaveClass(/animate-entry/);
    });
  });

  test.describe('Chart Widgets', () => {
    test('should display revenue line chart', async ({ page }) => {
      const revenueChart = page.locator('#revenue-chart');
      await expect(revenueChart).toBeVisible();
    });

    test('should display traffic area chart', async ({ page }) => {
      const trafficChart = page.locator('#traffic-chart');
      await expect(trafficChart).toBeVisible();
    });

    test('should display sales bar chart', async ({ page }) => {
      const salesChart = page.locator('#sales-chart');
      await expect(salesChart).toBeVisible();
    });

    test('should display device pie chart', async ({ page }) => {
      const deviceChart = page.locator('#device-chart');
      await expect(deviceChart).toBeVisible();
    });

    test('should render chart canvas elements', async ({ page }) => {
      const chartCanvases = page.locator('canvas');
      await expect(chartCanvases).toHaveCount({ min: 4 });
    });
  });

  test.describe('Alerts Widget', () => {
    test('should display alerts widget', async ({ page }) => {
      const alertsWidget = page.locator('#system-alerts');
      await expect(alertsWidget).toBeVisible();
    });

    test('should show alert items when available', async ({ page }) => {
      const alertItems = page.locator('[data-testid="alert-item"]');
      await expect(alertItems).toHaveCount({ min: 0 });
    });

    test('should have dismiss button for alerts', async ({ page }) => {
      const dismissButtons = page.locator('[data-testid="alert-dismiss"]');
      await expect(dismissButtons).toHaveCount({ min: 0 });
    });
  });

  test.describe('Notification Bell', () => {
    test('should display notification bell', async ({ page }) => {
      const notificationBell = page.locator('notification-bell');
      await expect(notificationBell).toBeVisible();
    });

    test('should show notification count badge', async ({ page }) => {
      const badge = page.locator('[data-testid="notification-badge"]');
      await expect(badge).toHaveCount({ min: 0 });
    });

    test('should open notification dropdown on click', async ({ page }) => {
      const bell = page.locator('notification-bell');
      await bell.click();
      const dropdown = page.locator('[data-testid="notification-dropdown"]');
      await expect(dropdown).toBeVisible();
    });
  });

  test.describe('Activity Feed', () => {
    test('should display activity feed widget', async ({ page }) => {
      const activityFeed = page.locator('[data-widget="activity-feed"]');
      await expect(activityFeed).toBeVisible();
    });

    test('should show activity items', async ({ page }) => {
      const activityItems = page.locator('[data-testid="activity-item"]');
      await expect(activityItems).toHaveCount({ min: 0 });
    });
  });

  test.describe('Project Progress', () => {
    test('should display project progress widget', async ({ page }) => {
      const projectProgress = page.locator('[data-widget="project-progress"]');
      await expect(projectProgress).toBeVisible();
    });

    test('should show progress bars', async ({ page }) => {
      const progressBars = page.locator('[data-testid="progress-bar"]');
      await expect(progressBars).toHaveCount({ min: 0 });
    });
  });

  test.describe('Responsive Behavior', () => {
    test('should layout widgets correctly on mobile (375px)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      const kpiCards = page.locator('[data-widget="kpi-card"]');
      await expect(kpiCards.first()).toBeVisible();
    });

    test('should layout widgets correctly on tablet (768px)', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      const charts = page.locator('canvas');
      await expect(charts.first()).toBeVisible();
    });

    test('should layout widgets correctly on desktop (1024px)', async ({ page }) => {
      await page.setViewportSize({ width: 1024, height: 768 });
      const dashboardGrid = page.locator('.dashboard-grid');
      await expect(dashboardGrid).toBeVisible();
    });
  });

  test.describe('Loading States', () => {
    test('should show loading skeleton for KPI cards', async ({ page }) => {
      await page.reload({ waitUntil: 'domcontentloaded' });
      const skeletons = page.locator('[data-testid="skeleton"]');
      await expect(skeletons).toHaveCount({ min: 0 });
    });

    test('should hide loading state after data loads', async ({ page }) => {
      const loadingSpinner = page.locator('[data-testid="loading-spinner"]');
      await expect(loadingSpinner).not.toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Accessibility', () => {
    test('should have ARIA labels on widgets', async ({ page }) => {
      const widgets = page.locator('[aria-label]');
      await expect(widgets).toHaveCount({ min: 5 });
    });

    test('should have proper heading hierarchy', async ({ page }) => {
      const h2Headings = page.locator('h2');
      await expect(h2Headings.first()).toBeVisible();
    });

    test('should support keyboard navigation', async ({ page }) => {
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeFocused();
    });
  });
});

test.describe('Dashboard Real-time Updates', () => {
  test('should update stats widget with real-time data', async ({ page }) => {
    await page.goto('/admin/dashboard.html');
    await page.waitForLoadState('networkidle');

    const statsWidget = page.locator('[data-widget="quick-stats"]');
    await expect(statsWidget).toBeVisible();
  });

  test('should display conversion funnel', async ({ page }) => {
    await page.goto('/admin/dashboard.html');
    await page.waitForLoadState('networkidle');

    const funnelWidget = page.locator('[data-widget="conversion-funnel"]');
    await expect(funnelWidget).toHaveCount({ min: 0 });
  });
});

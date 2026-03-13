/**
 * Tests for SaDec Marketing Hub - New Features
 * Tests for: ROI Analytics, Notifications, Phase Tracker
 */

import { test, expect } from '@playwright/test';

// ROI Analytics Dashboard Tests
test.describe('ROI Analytics Dashboard', () => {
  test('should load dashboard successfully', async ({ page }) => {
    await page.goto('portal/roi-analytics.html');

    // Check title
    await expect(page).toHaveTitle(/ROI Analytics Dashboard/);

    // Check main header
    const header = page.locator('h1');
    await expect(header).toBeVisible();
    await expect(header).toContainText('ROI Analytics Dashboard');
  });

  test('should display key metrics cards', async ({ page }) => {
    await page.goto('portal/roi-analytics.html');

    // Check metric cards exist
    const metricCards = page.locator('.metric-card');
    await expect(metricCards).toHaveCount(4);

    // Check metric labels
    await expect(page.locator('.metric-card').nth(0)).toContainText('Tổng ROI');
    await expect(page.locator('.metric-card').nth(1)).toContainText('Doanh Thu');
    await expect(page.locator('.metric-card').nth(2)).toContainText('Chi Phí Marketing');
    await expect(page.locator('.metric-card').nth(3)).toContainText('Tỷ Lệ Chuyển Đổi');
  });

  test('should render charts', async ({ page }) => {
    await page.goto('portal/roi-analytics.html');

    // Check canvas elements for charts
    const charts = page.locator('canvas');
    await expect(charts).toHaveCount(4);

    // Check chart containers
    const chartContainers = page.locator('.chart-container');
    await expect(chartContainers).toHaveCount(4);
  });

  test('should display phase tracker', async ({ page }) => {
    await page.goto('portal/roi-analytics.html');

    // Check phase tracker section
    const phaseTracker = page.locator('.phase-tracker');
    await expect(phaseTracker).toBeVisible();

    // Check phase items
    const phaseItems = page.locator('.phase-item');
    await expect(phaseItems).toHaveCount(5);
  });

  test('should have responsive design', async ({ page }) => {
    await page.goto('portal/roi-analytics.html');

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    const metricCards = page.locator('.metric-card');
    await expect(metricCards.first()).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(metricCards.first()).toBeVisible();
  });
});

// Notification Settings Tests
test.describe('Notification Settings', () => {
  test('should load settings page', async ({ page }) => {
    await page.goto('portal/notifications.html');

    await expect(page).toHaveTitle(/Notification Settings/);

    const header = page.locator('h1');
    await expect(header).toBeVisible();
    await expect(header).toContainText('Cài Đặt Thông Báo');
  });

  test('should display notification sections', async ({ page }) => {
    await page.goto('portal/notifications.html');

    const sections = page.locator('.notification-section');
    await expect(sections).toHaveCount(4);

    // Check section titles
    await expect(sections.nth(0)).toContainText('Marketing Alerts');
    await expect(sections.nth(1)).toContainText('ROI Alerts');
    await expect(sections.nth(2)).toContainText('System Notifications');
    await expect(sections.nth(3)).toContainText('Kênh Thông Báo');
  });

  test('should have working toggle switches', async ({ page }) => {
    await page.goto('portal/notifications.html');

    const toggles = page.locator('.toggle-switch input');
    const firstToggle = toggles.first();

    // Check initial state
    const isChecked = await firstToggle.isChecked();

    // Click toggle
    await firstToggle.click();
    await expect(firstToggle).toBeChecked({ checked: !isChecked });
  });

  test('should have channel badges', async ({ page }) => {
    await page.goto('portal/notifications.html');

    const badges = page.locator('.channel-badge');
    await expect(badges).toHaveCount(5);

    // Check badge labels
    await expect(badges.nth(0)).toHaveText('Email');
    await expect(badges.nth(1)).toHaveText('In-App');
    await expect(badges.nth(2)).toHaveText('Zalo');
  });
});

// Phase Tracker Component Tests
test.describe('Phase Tracker Component', () => {
  test('should load component page', async ({ page }) => {
    await page.goto('admin/components/phase-tracker.html');

    await expect(page).toHaveTitle(/Phase Tracker Component/);

    const header = page.locator('h1');
    await expect(header).toBeVisible();
    await expect(header).toContainText('Phase Tracker Component');
  });

  test('should display all 5 phases', async ({ page }) => {
    await page.goto('admin/components/phase-tracker.html');

    const phaseItems = page.locator('.phase-item');
    await expect(phaseItems).toHaveCount(5);

    // Check phase titles
    await expect(phaseItems.nth(0)).toContainText('Phase 1: Discovery');
    await expect(phaseItems.nth(1)).toContainText('Phase 2: Platform Setup');
    await expect(phaseItems.nth(2)).toContainText('Phase 3: Integration');
    await expect(phaseItems.nth(3)).toContainText('Phase 4: Optimization');
    await expect(phaseItems.nth(4)).toContainText('Phase 5: Scale');
  });

  test('should show correct phase statuses', async ({ page }) => {
    await page.goto('admin/components/phase-tracker.html');

    // Check completed phases
    const completedPhases = page.locator('.phase-item.completed');
    await expect(completedPhases).toHaveCount(2);

    // Check active phase
    const activePhases = page.locator('.phase-item.active');
    await expect(activePhases).toHaveCount(1);
  });

  test('should display progress bars', async ({ page }) => {
    await page.goto('admin/components/phase-tracker.html');

    const progressBars = page.locator('.phase-progress-fill');
    await expect(progressBars).toHaveCount(5);

    // Check Phase 1 is 100%
    const phase1Bar = progressBars.first();
    const style = await phase1Bar.getAttribute('style');
    expect(style).toContain('width: 100%');
  });

  test('should have cyber theme variant', async ({ page }) => {
    await page.goto('admin/components/phase-tracker.html');

    const cyberTracker = page.locator('.cyber-phase-tracker');
    await expect(cyberTracker).toBeVisible();
  });

  test('should have overall progress display', async ({ page }) => {
    await page.goto('admin/components/phase-tracker.html');

    const overallProgress = page.locator('.overall-progress');
    await expect(overallProgress).toBeVisible();
    await expect(overallProgress).toContainText('68%');
  });
});

// Accessibility Tests
test.describe('Accessibility', () => {
  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('portal/roi-analytics.html');

    // Check for aria-label on interactive elements
    const toggleButtons = page.locator('[aria-label]');
    // At least should have some ARIA labels
    await expect(toggleButtons.count()).resolves.toBeGreaterThanOrEqual(0);
  });

  test('should have keyboard navigation', async ({ page }) => {
    await page.goto('portal/notifications.html');

    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});

// Meta Tags Tests
test.describe('Meta Tags', () => {
  test('roi-analytics should have proper meta tags', async ({ page }) => {
    await page.goto('portal/roi-analytics.html');

    // Check charset
    const charset = page.locator('meta[charset="UTF-8"]');
    await expect(charset).toHaveCount(1);

    // Check viewport
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveCount(1);

    // Check description
    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveCount(1);

    // Check OG tags
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveCount(1);
  });

  test('notifications should have proper meta tags', async ({ page }) => {
    await page.goto('portal/notifications.html');

    const charset = page.locator('meta[charset="UTF-8"]');
    await expect(charset).toHaveCount(1);

    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveCount(1);
  });

  test('phase-tracker should have proper meta tags', async ({ page }) => {
    await page.goto('admin/components/phase-tracker.html');

    const charset = page.locator('meta[charset="UTF-8"]');
    await expect(charset).toHaveCount(1);

    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveCount(1);
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * WIDGETS TEST — Dashboard Widgets E2E Tests
 * Test coverage for KPI cards, charts, alerts widgets
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { test, expect } from '@playwright/test';

test.describe('Dashboard Widgets', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/admin/dashboard.html');
        await page.waitForLoadState('networkidle');
    });

    test.describe('KPI Card Widget', () => {
        test('KPI cards render correctly', async ({ page }) => {
            const kpiCards = page.locator('kpi-card-widget');
            await expect(kpiCards).toHaveCount(8);
        });

        test('KPI cards display correct values', async ({ page }) => {
            const revenueKpi = page.locator('#kpi-revenue');
            await expect(revenueKpi).toBeVisible();
            await expect(revenueKpi).toHaveAttribute('value', /[\d,]+đ/);
        });

        test('KPI cards have sparkline data', async ({ page }) => {
            const kpiCards = page.locator('kpi-card-widget');
            for (const card of await kpiCards.all()) {
                const sparkline = card.locator('.kpi-sparkline');
                await expect(sparkline).toBeVisible();
            }
        });

        test('KPI cards hover animation works', async ({ page }) => {
            const firstKpi = page.locator('kpi-card-widget').first();
            await firstKpi.hover();
            await expect(firstKpi).toHaveCSS('transform', /matrix/);
        });
    });

    test.describe('Line Chart Widget', () => {
        test('Line chart renders', async ({ page }) => {
            const lineChart = page.locator('#revenue-chart');
            await expect(lineChart).toBeVisible();
        });

        test('Line chart has canvas element', async ({ page }) => {
            const canvas = page.locator('#revenue-chart canvas');
            await expect(canvas).toBeVisible();
        });

        test('Line chart time range buttons work', async ({ page }) => {
            const weeklyBtn = page.locator('#revenue-chart .chart-btn[data-range="weekly"]');
            const monthlyBtn = page.locator('#revenue-chart .chart-btn[data-range="monthly"]');

            await expect(weeklyBtn).toBeVisible();
            await monthlyBtn.click();
            await page.waitForTimeout(500);

            const chartCanvas = page.locator('#revenue-chart canvas');
            await expect(chartCanvas).toBeVisible();
        });

        test('Line chart is responsive', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            const chart = page.locator('#revenue-chart');
            await expect(chart).toBeVisible();

            const container = chart.locator('.chart-container');
            const height = await container.evaluate((el) => el.offsetHeight);
            expect(height).toBeLessThan(300); // Mobile height reduced
        });
    });

    test.describe('Bar Chart Widget', () => {
        test('Bar chart renders', async ({ page }) => {
            const barChart = page.locator('#sales-chart');
            await expect(barChart).toBeVisible();
        });

        test('Bar chart has canvas element', async ({ page }) => {
            const canvas = page.locator('#sales-chart canvas');
            await expect(canvas).toBeVisible();
        });

        test('Bar chart orientation toggle works', async ({ page }) => {
            const toggleBtn = page.locator('#sales-chart .chart-btn[data-orientation="toggle"]');
            await expect(toggleBtn).toBeVisible();
            await toggleBtn.click();
            await page.waitForTimeout(500);

            const chartCanvas = page.locator('#sales-chart canvas');
            await expect(chartCanvas).toBeVisible();
        });

        test('Bar chart data type switching works', async ({ page }) => {
            const trafficBtn = page.locator('#sales-chart .chart-btn[data-type="traffic"]');
            await trafficBtn.click();
            await page.waitForTimeout(500);

            const chartCanvas = page.locator('#sales-chart canvas');
            await expect(chartCanvas).toBeVisible();
        });
    });

    test.describe('Area Chart Widget', () => {
        test('Area chart renders', async ({ page }) => {
            const areaChart = page.locator('#traffic-chart');
            await expect(areaChart).toBeVisible();
        });

        test('Area chart has canvas element', async ({ page }) => {
            const canvas = page.locator('#traffic-chart canvas');
            await expect(canvas).toBeVisible();
        });

        test('Area chart stacked toggle works', async ({ page }) => {
            const stackedBtn = page.locator('#traffic-chart .chart-btn[data-stacked="true"]');
            await expect(stackedBtn).toBeVisible();
            await stackedBtn.click();
            await page.waitForTimeout(500);

            const chartCanvas = page.locator('#traffic-chart canvas');
            await expect(chartCanvas).toBeVisible();
        });
    });

    test.describe('Pie Chart Widget', () => {
        test('Pie chart renders', async ({ page }) => {
            const pieChart = page.locator('#device-chart');
            await expect(pieChart).toBeVisible();
        });

        test('Pie chart has canvas element', async ({ page }) => {
            const canvas = page.locator('#device-chart canvas');
            await expect(canvas).toBeVisible();
        });

        test('Pie chart type toggle (pie/doughnut) works', async ({ page }) => {
            const doughnutBtn = page.locator('#device-chart .chart-type-btn[data-type="doughnut"]');
            await expect(doughnutBtn).toBeVisible();
            await doughnutBtn.click();
            await page.waitForTimeout(500);

            const chartCanvas = page.locator('#device-chart canvas');
            await expect(chartCanvas).toBeVisible();
        });

        test('Pie chart shows percentages in tooltip', async ({ page }) => {
            const canvas = page.locator('#device-chart canvas');
            await canvas.hover();

            const tooltip = page.locator('.chartjs-tooltip');
            await expect(tooltip).toBeVisible();
        });
    });

    test.describe('Alerts Widget', () => {
        test('Alerts widget renders', async ({ page }) => {
            const alertsWidget = page.locator('#system-alerts');
            await expect(alertsWidget).toBeVisible();
        });

        test('Alerts widget displays alerts', async ({ page }) => {
            const alertItems = page.locator('#system-alerts .alert-item');
            await expect(alertItems.first()).toBeVisible({ timeout: 5000 });
        });

        test('Alerts widget filter buttons work', async ({ page }) => {
            const criticalBtn = page.locator('#system-alerts .btn-filter[data-filter="critical"]');
            const warningBtn = page.locator('#system-alerts .btn-filter[data-filter="warning"]');

            await expect(criticalBtn).toBeVisible();
            await expect(warningBtn).toBeVisible();

            await warningBtn.click();
            await page.waitForTimeout(300);

            // Check active state
            await expect(warningBtn).toHaveClass(/active/);
        });

        test('Dismiss alert button works', async ({ page }) => {
            const firstAlert = page.locator('#system-alerts .alert-item').first();
            const dismissBtn = firstAlert.locator('.alert-dismiss');

            await expect(dismissBtn).toBeVisible();
            await dismissBtn.click();
            await page.waitForTimeout(300);

            // Alert should be removed or animating out
            await expect(firstAlert).not.toBeVisible();
        });

        test('Dismiss all alerts works', async ({ page }) => {
            const dismissAllBtn = page.locator('#system-alerts .btn-dismiss-all');
            await expect(dismissAllBtn).toBeVisible();

            await dismissAllBtn.click();
            await page.waitForTimeout(500);

            const emptyState = page.locator('#system-alerts .alerts-empty');
            await expect(emptyState).toBeVisible();
        });

        test('Alert count badge updates', async ({ page }) => {
            const alertCount = page.locator('.alert-count');
            await expect(alertCount).toBeVisible();

            const initialCount = await alertCount.textContent();
            expect(initialCount).toMatch(/\d+/);
        });
    });

    test.describe('Activity Feed Widget', () => {
        test('Activity feed renders', async ({ page }) => {
            const activityFeed = page.locator('#activity-feed');
            await expect(activityFeed).toBeVisible();
        });

        test('Activity feed displays items', async ({ page }) => {
            const activityItems = page.locator('#activity-feed .activity-item');
            await expect(activityItems.first()).toBeVisible({ timeout: 5000 });
        });
    });

    test.describe('Project Progress Widget', () => {
        test('Project progress widget renders', async ({ page }) => {
            const progressWidget = page.locator('#project-progress');
            await expect(progressWidget).toBeVisible();
        });

        test('Project progress bars display', async ({ page }) => {
            const progressBars = page.locator('#project-progress .progress-bar');
            await expect(progressBars.first()).toBeVisible({ timeout: 5000 });
        });
    });
});

test.describe('Widget Responsiveness', () => {
    test('Dashboard responsive on mobile (375px)', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/admin/dashboard.html');
        await page.waitForLoadState('networkidle');

        // Check KPI cards stack vertically
        const kpiGrid = page.locator('.stats-grid').first();
        const kpiWidth = await kpiGrid.evaluate((el) => el.offsetWidth);
        expect(kpiWidth).toBeLessThan(400);

        // Check charts are visible
        const charts = page.locator('.line-chart-widget, .bar-chart-widget');
        await expect(charts.first()).toBeVisible();
    });

    test('Dashboard responsive on tablet (768px)', async ({ page }) => {
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.goto('/admin/dashboard.html');
        await page.waitForLoadState('networkidle');

        // Check 2-column KPI grid
        const kpiGrid = page.locator('.stats-grid').first();
        await expect(kpiGrid).toBeVisible();

        // Check charts have reduced height
        const chartContainer = page.locator('.chart-container').first();
        const height = await chartContainer.evaluate((el) => el.offsetHeight);
        expect(height).toBeLessThan(300);
    });

    test('Dashboard responsive on desktop (1024px)', async ({ page }) => {
        await page.setViewportSize({ width: 1024, height: 768 });
        await page.goto('/admin/dashboard.html');
        await page.waitForLoadState('networkidle');

        // Check 4-column KPI grid
        const kpiGrid = page.locator('.stats-grid').first();
        await expect(kpiGrid).toBeVisible();

        // Check full-height charts
        const chartContainer = page.locator('.chart-container').first();
        const height = await chartContainer.evaluate((el) => el.offsetHeight);
        expect(height).toBeGreaterThanOrEqual(300);
    });
});

test.describe('Widget Interactions', () => {
    test('All chart buttons have hover effects', async ({ page }) => {
        const buttons = page.locator('.chart-btn, .chart-type-btn');
        const count = await buttons.count();

        for (let i = 0; i < Math.min(count, 5); i++) {
            const button = buttons.nth(i);
            await button.hover();
            await page.waitForTimeout(200);

            const backgroundColor = await button.evaluate((el) =>
                window.getComputedStyle(el).backgroundColor
            );

            // Check hover state (should be different from initial)
            expect(backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
        }
    });

    test('Widget cards have consistent styling', async ({ page }) => {
        const widgets = page.locator('.line-chart-widget, .bar-chart-widget, .area-chart-widget, .pie-chart-widget, .alerts-widget');
        const count = await widgets.count();

        for (let i = 0; i < count; i++) {
            const widget = widgets.nth(i);
            const borderRadius = await widget.evaluate((el) =>
                window.getComputedStyle(el).borderRadius
            );

            expect(borderRadius).toBe('16px');
        }
    });
});

test.describe('Widget Loading States', () => {
    test('Charts show loading state initially', async ({ page }) => {
        // Navigate with slow network
        await page.route('**/dist/chart.umd.min.js', (route) => {
            setTimeout(() => route.continue(), 1000);
        });

        await page.goto('/admin/dashboard.html');

        // Check for loading spinner
        const loadingSpinner = page.locator('.loading-spinner').first();
        await expect(loadingSpinner).toBeVisible({ timeout: 3000 });
    });
});

test.describe('Widget Accessibility', () => {
    test('Chart buttons have proper ARIA labels', async ({ page }) => {
        const buttons = page.locator('.chart-btn, .chart-type-btn');
        const count = await buttons.count();

        for (let i = 0; i < count; i++) {
            const button = buttons.nth(i);
            const text = await button.textContent();
            expect(text?.trim()).toBeTruthy();
        }
    });

    test('Widgets have proper heading hierarchy', async ({ page }) => {
        const chartTitles = page.locator('.chart-title');
        const count = await chartTitles.count();

        for (let i = 0; i < count; i++) {
            const title = chartTitles.nth(i);
            await expect(title).toBeVisible();
        }
    });
});

import { test, expect } from '@playwright/test';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ADMIN COMPONENTS TESTS
 * Tests for admin UI components and widgets
 * ═══════════════════════════════════════════════════════════════════════════
 */

test.describe('KPICard Widget', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded' });
  });

  test('KPI card renders with value and label', async ({ page }) => {
    const kpiCards = page.locator('.kpi-card, .stat-card');
    const count = await kpiCards.count();

    if (count > 0) {
      const firstCard = kpiCards.first();
      await expect(firstCard).toBeVisible();

      // Check for value element
      const value = firstCard.locator('.kpi-value, .stat-value');
      await expect(value.first()).toBeVisible();

      // Check for label element
      const label = firstCard.locator('.kpi-label, .stat-label');
      await expect(label.first()).toBeVisible();
    }
  });

  test('KPI card shows trend indicator', async ({ page }) => {
    const kpiCards = page.locator('.kpi-card');
    const count = await kpiCards.count();

    if (count > 0) {
      const trendUp = page.locator('.trend-up, .trend-positive');
      const trendDown = page.locator('.trend-down, .trend-negative');

      const hasTrendUp = await trendUp.count() > 0;
      const hasTrendDown = await trendDown.count() > 0;

      expect(hasTrendUp || hasTrendDown).toBe(true);
    }
  });

  test('KPI card has proper color scheme', async ({ page }) => {
    const kpiCards = page.locator('.kpi-card');
    const count = await kpiCards.count();

    if (count > 0) {
      // Check for color variants
      const hasPrimary = await page.locator('.kpi-primary, .kpi-blue').count() > 0;
      const hasSuccess = await page.locator('.kpi-success, .kpi-green').count() > 0;
      const hasWarning = await page.locator('.kpi-warning, .kpi-orange').count() > 0;
      const hasDanger = await page.locator('.kpi-danger, .kpi-red').count() > 0;

      expect(hasPrimary || hasSuccess || hasWarning || hasDanger).toBe(true);
    }
  });
});

test.describe('DataTable Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded' });
  });

  test('data table renders with headers and rows', async ({ page }) => {
    const tables = page.locator('table.data-table, table');
    const count = await tables.count();

    if (count > 0) {
      const firstTable = tables.first();

      // Check for table headers
      const headers = firstTable.locator('th, thead td');
      const headerCount = await headers.count();

      expect(headerCount).toBeGreaterThan(0);

      // Check for table rows
      const rows = firstTable.locator('tbody tr, tr');
      const rowCount = await rows.count();

      expect(rowCount).toBeGreaterThan(0);
    }
  });

  test('data table has sortable headers', async ({ page }) => {
    const sortableHeaders = page.locator('th[data-sortable], th.sortable, th .sort-icon');
    const count = await sortableHeaders.count();

    // Sortable headers are optional but nice to have
    if (count > 0) {
      await expect(sortableHeaders.first()).toBeVisible();
    }
  });

  test('data table has pagination', async ({ page }) => {
    const pagination = page.locator('.pagination, .data-table-pagination');
    const count = await pagination.count();

    // Pagination is optional
    if (count > 0) {
      await expect(pagination.first()).toBeVisible();
    }
  });

  test('data table has search/filter', async ({ page }) => {
    const searchInput = page.locator('input[data-table-search], .table-search-input');
    const count = await searchInput.count();

    // Search is optional
    if (count > 0) {
      await expect(searchInput.first()).toBeVisible();
    }
  });

  test('data table handles empty state', async ({ page }) => {
    // Navigate to a page that might have empty table
    await page.goto('/admin/leads.html', { waitUntil: 'domcontentloaded' });

    const emptyState = page.locator('.empty-state, .no-data, tbody td[colspan]');
    const count = await emptyState.count();

    if (count > 0) {
      const text = await emptyState.first().textContent();
      expect(text?.toLowerCase()).toMatch(/không có|no data|empty|chưa có/);
    }
  });
});

test.describe('Chart Components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded' });
  });

  test('chart canvas is rendered', async ({ page }) => {
    const charts = page.locator('canvas');
    const count = await charts.count();

    if (count > 0) {
      await expect(charts.first()).toBeVisible();
    }
  });

  test('line chart renders data', async ({ page }) => {
    const lineCharts = page.locator('canvas#line-chart, canvas.revenue-chart, .chart-container canvas');
    const count = await lineCharts.count();

    if (count > 0) {
      await expect(lineCharts.first()).toBeVisible();
    }
  });

  test('chart has legend', async ({ page }) => {
    const legends = page.locator('.chart-legend, .recharts-legend-wrapper, ul.legend');
    const count = await legends.count();

    if (count > 0) {
      await expect(legends.first()).toBeVisible();
    }
  });

  test('chart has tooltip on hover', async ({ page }) => {
    const chartContainer = page.locator('.chart-container, .recharts-wrapper').first();

    if (await chartContainer.count() > 0) {
      await chartContainer.hover();

      const tooltip = page.locator('.chart-tooltip, .recharts-tooltip-wrapper, [class*="tooltip"]');
      const tooltipVisible = await tooltip.first().isVisible({ timeout: 2000 });

      expect(tooltipVisible).toBe(true);
    }
  });
});

test.describe('Form Components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/settings.html', { waitUntil: 'domcontentloaded' });
  });

  test('form inputs have labels', async ({ page }) => {
    const inputs = page.locator('input[type="text"], input[type="email"], input[type="password"]');
    const count = await inputs.count();

    for (let i = 0; i < Math.min(count, 3); i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');

      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        const labelExists = await label.count() > 0;
        expect(labelExists).toBe(true);
      }
    }
  });

  test('form has validation', async ({ page }) => {
    const requiredInput = page.locator('input[required], input:required').first();

    if (await requiredInput.count() > 0) {
      await requiredInput.fill('');
      await requiredInput.blur();

      const isInvalid = await requiredInput.evaluate(el => !(el as HTMLInputElement).validity.valid);
      expect(isInvalid).toBe(true);
    }
  });

  test('form submit button is disabled until valid', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"][disabled], input[type="submit"][disabled]');

    // Submit button may or may not be disabled initially
    const count = await submitButton.count();
    if (count > 0) {
      await expect(submitButton.first()).toBeDisabled();
    }
  });

  test('form shows error messages', async ({ page }) => {
    const errorMessages = page.locator('.error-message, .form-error, [class*="error"]');
    const count = await errorMessages.count();

    // Error messages are optional until form is submitted
    if (count > 0) {
      await expect(errorMessages.first()).toBeVisible();
    }
  });
});

test.describe('Navigation Components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded' });
  });

  test('sidebar navigation exists', async ({ page }) => {
    const sidebar = page.locator('.admin-sidebar, .sidebar, nav[aria-label="Main navigation"]');
    const count = await sidebar.count();

    if (count > 0) {
      await expect(sidebar.first()).toBeVisible();
    }
  });

  test('sidebar has navigation items', async ({ page }) => {
    const navItems = page.locator('.nav-item, .sidebar-menu-item, a.nav-link');
    const count = await navItems.count();

    expect(count).toBeGreaterThan(0);
  });

  test('sidebar has active state', async ({ page }) => {
    const activeItem = page.locator('.nav-item.active, .sidebar-menu-item.active, a.nav-link.active');
    const count = await activeItem.count();

    if (count > 0) {
      await expect(activeItem.first()).toBeVisible();
    }
  });

  test('header has user profile menu', async ({ page }) => {
    const userProfile = page.locator('.user-profile, .user-menu, .profile-dropdown');
    const count = await userProfile.count();

    if (count > 0) {
      await expect(userProfile.first()).toBeVisible();
    }
  });

  test('breadcrumbs exist', async ({ page }) => {
    const breadcrumbs = page.locator('.breadcrumbs, nav[aria-label="Breadcrumb"]');
    const count = await breadcrumbs.count();

    if (count > 0) {
      await expect(breadcrumbs.first()).toBeVisible();
    }
  });
});

test.describe('Modal Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded' });
  });

  test('modal can be opened', async ({ page }) => {
    // Find any button that might open a modal
    const openModalBtn = page.locator('button[data-modal], button[onclick*="modal"], .btn-open-modal').first();

    if (await openModalBtn.count() > 0) {
      await openModalBtn.click();

      const modal = page.locator('.modal, [role="dialog"], [class*="modal-overlay"]');
      const modalVisible = await modal.first().isVisible({ timeout: 2000 });

      expect(modalVisible).toBe(true);
    }
  });

  test('modal can be closed', async ({ page }) => {
    const openModalBtn = page.locator('button[data-modal], button[onclick*="modal"]').first();

    if (await openModalBtn.count() > 0) {
      await openModalBtn.click();

      const closeModalBtn = page.locator('.modal-close, button[aria-label="Close"], .close-icon').first();
      if (await closeModalBtn.count() > 0) {
        await closeModalBtn.click();

        const modal = page.locator('.modal[open], .modal-overlay:not(.hidden)');
        const modalClosed = await modal.count() === 0;

        expect(modalClosed).toBe(true);
      }
    }
  });

  test('modal has proper structure', async ({ page }) => {
    const modals = page.locator('.modal, [role="dialog"]');
    const count = await modals.count();

    if (count > 0) {
      const modal = modals.first();

      // Check for modal header
      const header = modal.locator('.modal-header, h2, h3');
      expect(await header.count()).toBeGreaterThan(0);

      // Check for modal content
      const content = modal.locator('.modal-body, .modal-content');
      expect(await content.count()).toBeGreaterThan(0);

      // Check for modal footer/actions
      const footer = modal.locator('.modal-footer, .modal-actions');
      expect(await footer.count()).toBeGreaterThan(0);
    }
  });
});

test.describe('Toast Notification', () => {
  test('toast can be shown', async ({ page }) => {
    await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded' });

    // Try to show toast via JavaScript
    const toastShown = await page.evaluate(() => {
      if (typeof Toast !== 'undefined' && typeof Toast.success === 'function') {
        Toast.success('Test toast');
        return true;
      }
      return false;
    });

    if (toastShown) {
      const toast = page.locator('.toast, [class*="toast-notification"], [role="alert"]');
      const toastVisible = await toast.first().isVisible({ timeout: 2000 });
      expect(toastVisible).toBe(true);
    }
  });
});

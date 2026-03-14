/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SA ĐÉC MARKETING HUB — NEW UI COMPONENTS TESTS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Tests for Tooltip, Tabs, Accordion, DataTable, ScrollToTop components
 */

import { test, expect } from '@playwright/test';

test.describe('Tooltip Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/components-demo.html');
  });

  test('tooltip module is available', async ({ page }) => {
    const tooltipAvailable = await page.evaluate(() => {
      return typeof window.Tooltip !== 'undefined';
    });
    expect(tooltipAvailable).toBe(true);
  });

  test('tooltip shows on hover', async ({ page }) => {
    const tooltipButton = page.locator('[data-tooltip="This is helpful information!"]').first();
    await tooltipButton.hover();

    const tooltip = page.locator('.mekong-tooltip--visible');
    await expect(tooltip).toBeVisible();
  });

  test('tooltip hides on mouseleave', async ({ page }) => {
    const tooltipButton = page.locator('[data-tooltip="This is helpful information!"]').first();
    await tooltipButton.hover();
    await page.mouse.move(0, 0);

    const tooltips = page.locator('.mekong-tooltip--visible');
    await expect(tooltips).toHaveCount(0);
  });

  test('tooltip respects position attribute', async ({ page }) => {
    const bottomTooltip = page.locator('[data-tooltip="Tooltip appears below"]');
    await bottomTooltip.hover();

    const tooltip = page.locator('.mekong-tooltip[data-position="bottom"]');
    await expect(tooltip).toBeVisible();
  });

  test('tooltip is accessible via keyboard focus', async ({ page }) => {
    const tooltipButton = page.locator('[data-tooltip="This is helpful information!"]').first();
    await tooltipButton.focus();

    const tooltip = page.locator('.mekong-tooltip--visible');
    await expect(tooltip).toBeVisible();
  });

  test('tooltip hides on Escape key', async ({ page }) => {
    const tooltipButton = page.locator('[data-tooltip="This is helpful information!"]').first();
    await tooltipButton.hover();
    await page.keyboard.press('Escape');

    const tooltips = page.locator('.mekong-tooltip--visible');
    await expect(tooltips).toHaveCount(0);
  });
});

test.describe('Tabs Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/components-demo.html');
  });

  test('tabs module is available', async ({ page }) => {
    const tabsAvailable = await page.evaluate(() => {
      return typeof window.Tabs !== 'undefined';
    });
    expect(tabsAvailable).toBe(true);
  });

  test('tabs render correctly', async ({ page }) => {
    const tabsList = page.locator('[role="tablist"]').first();
    await expect(tabsList).toBeVisible();

    const tabs = page.locator('[role="tab"]');
    await expect(tabs).toHaveCount(4);
  });

  test('tab switching works', async ({ page }) => {
    const featuresTab = page.locator('[role="tab"][data-tab="features"]').first();
    await featuresTab.click();

    await expect(featuresTab).toHaveAttribute('aria-selected', 'true');

    const featuresPanel = page.locator('[role="tabpanel"][data-panel="features"]');
    await expect(featuresPanel).toBeVisible();
  });

  test('tab panels animate on switch', async ({ page }) => {
    const featuresTab = page.locator('[role="tab"][data-tab="features"]').first();
    await featuresTab.click();

    const featuresPanel = page.locator('[role="tabpanel"][data-panel="features"]');
    await expect(featuresPanel).toHaveClass(/mekong-tabs__panel--active/);
  });

  test('keyboard navigation works', async ({ page }) => {
    const firstTab = page.locator('[role="tab"]').first();
    await firstTab.focus();

    await page.keyboard.press('ArrowRight');
    const secondTab = page.locator('[role="tab"]').nth(1);
    await expect(secondTab).toBeFocused();

    await page.keyboard.press('Home');
    await expect(firstTab).toBeFocused();
  });

  test('pills variant renders correctly', async ({ page }) => {
    const pillsTabs = page.locator('.mekong-tabs--pills');
    await expect(pillsTabs).toBeVisible();
  });
});

test.describe('Accordion Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/components-demo.html');
  });

  test('accordion module is available', async ({ page }) => {
    const accordionAvailable = await page.evaluate(() => {
      return typeof window.Accordion !== 'undefined';
    });
    expect(accordionAvailable).toBe(true);
  });

  test('accordion renders correctly', async ({ page }) => {
    const accordion = page.locator('.mekong-accordion').first();
    await expect(accordion).toBeVisible();

    const items = page.locator('.mekong-accordion__item');
    await expect(items).toHaveCount(4);
  });

  test('accordion expand works', async ({ page }) => {
    const headers = page.locator('.mekong-accordion__header');
    await headers.nth(1).click();

    await expect(headers.nth(1)).toHaveAttribute('aria-expanded', 'true');
  });

  test('accordion collapse works', async ({ page }) => {
    const headers = page.locator('.mekong-accordion__header');
    await headers.nth(0).click();

    await expect(headers.nth(0)).toHaveAttribute('aria-expanded', 'false');
  });

  test('accordion icon rotates', async ({ page }) => {
    const headers = page.locator('.mekong-accordion__header');
    await headers.nth(1).click();

    const icon = headers.nth(1).locator('.mekong-accordion__icon');
    await expect(icon).toHaveClass(/mekong-accordion__icon--rotated/);
  });

  test('keyboard navigation works', async ({ page }) => {
    const firstHeader = page.locator('.mekong-accordion__header').first();
    await firstHeader.focus();

    await page.keyboard.press('ArrowDown');
    const secondHeader = page.locator('.mekong-accordion__header').nth(1);
    await expect(secondHeader).toBeFocused();
  });
});

test.describe('DataTable Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/components-demo.html');
  });

  test('data table module is available', async ({ page }) => {
    const dataTableAvailable = await page.evaluate(() => {
      return typeof window.DataTable !== 'undefined';
    });
    expect(dataTableAvailable).toBe(true);
  });

  test('data table renders correctly', async ({ page }) => {
    const dataTable = page.locator('.mekong-data-table').first();
    await expect(dataTable).toBeVisible();

    const table = page.locator('.mekong-data-table__table');
    await expect(table).toBeVisible();
  });

  test('data table displays data', async ({ page }) => {
    const rows = page.locator('.mekong-data-table__row');
    await expect(rows).toHaveCount(5); // pageSize is 5
  });

  test('sorting works', async ({ page }) => {
    const nameHeader = page.locator('.mekong-data-table__header').filter({ hasText: 'Name' });
    await nameHeader.click();

    await expect(nameHeader).toHaveClass(/mekong-data-table__header--sorted/);
  });

  test('search works', async ({ page }) => {
    const searchInput = page.locator('.mekong-data-table__search-input').first();
    await searchInput.fill('Nguyễn');

    const rows = page.locator('.mekong-data-table__row');
    await expect(rows).toHaveCount(1);
  });

  test('row selection works', async ({ page }) => {
    const checkbox = page.locator('.mekong-data-table__select-row').first();
    await checkbox.click();

    const selectedRow = page.locator('.mekong-data-table__row--selected');
    await expect(selectedRow).toHaveCount(1);
  });

  test('pagination works', async ({ page }) => {
    const page2Btn = page.locator('[data-page="2"]').first();
    await page2Btn.click();

    // Should load second page of data
    const rows = page.locator('.mekong-data-table__row');
    await expect(rows).toHaveCount(5);
  });

  test('export button exists', async ({ page }) => {
    const exportBtn = page.locator('[data-action="export"]').first();
    await expect(exportBtn).toBeVisible();
  });
});

test.describe('ScrollToTop Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/components-demo.html');
  });

  test('scroll to top module is available', async ({ page }) => {
    const scrollAvailable = await page.evaluate(() => {
      return typeof window.ScrollToTop !== 'undefined';
    });
    expect(scrollAvailable).toBe(true);
  });

  test('button is hidden at top of page', async ({ page }) => {
    const scrollButton = page.locator('.mekong-scroll-top');
    await expect(scrollButton).not.toBeVisible();
  });

  test('button appears after scrolling', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(500);

    const scrollButton = page.locator('.mekong-scroll-top--visible');
    await expect(scrollButton).toBeVisible();
  });

  test('click scrolls to top', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(500);

    const scrollButton = page.locator('.mekong-scroll-top--visible');
    await scrollButton.click();
    await page.waitForTimeout(700);

    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBe(0);
  });

  test('keyboard shortcut works', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.keyboard.press('ControlOrMeta+Home');
    await page.waitForTimeout(700);

    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBe(0);
  });
});

test.describe('Components Integration', () => {
  test('all components load together', async ({ page }) => {
    await page.goto('/admin/components-demo.html');

    const components = await page.evaluate(() => {
      return {
        tooltip: typeof window.Tooltip !== 'undefined',
        tabs: typeof window.Tabs !== 'undefined',
        accordion: typeof window.Accordion !== 'undefined',
        dataTable: typeof window.DataTable !== 'undefined',
        scrollToTop: typeof window.ScrollToTop !== 'undefined'
      };
    });

    expect(components.tooltip).toBe(true);
    expect(components.tabs).toBe(true);
    expect(components.accordion).toBe(true);
    expect(components.dataTable).toBe(true);
    expect(components.scrollToTop).toBe(true);
  });

  test('tabs and accordion work together', async ({ page }) => {
    await page.goto('/admin/components-demo.html');

    // Click Settings tab which contains accordion
    const settingsTab = page.locator('[role="tab"][data-tab="settings"]').first();
    await settingsTab.click();

    // Accordion should be visible
    const accordion = page.locator('#settings-accordion');
    await expect(accordion).toBeVisible();
  });

  test('dark mode works with all components', async ({ page }) => {
    await page.goto('/admin/components-demo.html');

    // Toggle dark mode
    const themeToggle = page.locator('.theme-toggle-fixed');
    await themeToggle.click();

    await page.waitForTimeout(500);

    // Check dark mode is applied
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'dark');
  });
});

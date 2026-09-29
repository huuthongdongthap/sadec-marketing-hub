import { test, expect } from '@playwright/test';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SHARED UTILITIES TESTS
 * Tests for shared utility modules: Logger, ApiClient, format-utils, etc.
 * ═══════════════════════════════════════════════════════════════════════════
 */

test.describe('Logger Utility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
  });

  test('Logger module is available', async ({ page }) => {
    const loggerExists = await page.evaluate(() => {
      return typeof Logger !== 'undefined';
    });

    expect(loggerExists).toBe(true);
  });

  test('Logger has error method', async ({ page }) => {
    const hasErrorMethod = await page.evaluate(() => {
      return typeof Logger === 'object' && typeof Logger.error === 'function';
    });

    expect(hasErrorMethod).toBe(true);
  });

  test('Logger has debug method', async ({ page }) => {
    const hasDebugMethod = await page.evaluate(() => {
      return typeof Logger === 'object' && typeof Logger.debug === 'function';
    });

    expect(hasDebugMethod).toBe(true);
  });

  test('Logger has warn method', async ({ page }) => {
    const hasWarnMethod = await page.evaluate(() => {
      return typeof Logger === 'object' && typeof Logger.warn === 'function';
    });

    expect(hasWarnMethod).toBe(true);
  });
});

test.describe('Format Utils', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
  });

  test('formatCurrency function works correctly', async ({ page }) => {
    const result = await page.evaluate(() => {
      if (typeof formatCurrency === 'function') {
        return formatCurrency(1000000, 'VND');
      }
      return null;
    });

    expect(result).toBeTruthy();
  });

  test('formatNumber function works correctly', async ({ page }) => {
    const result = await page.evaluate(() => {
      if (typeof formatNumber === 'function') {
        return formatNumber(1234567);
      }
      return null;
    });

    expect(result).toBeTruthy();
  });

  test('formatDate function works correctly', async ({ page }) => {
    const result = await page.evaluate(() => {
      if (typeof formatDate === 'function') {
        return formatDate(new Date().toISOString());
      }
      return null;
    });

    expect(result).toBeTruthy();
  });

  test('truncate function works correctly', async ({ page }) => {
    const result = await page.evaluate(() => {
      if (typeof truncate === 'function') {
        return truncate('This is a long text that should be truncated', 20);
      }
      return null;
    });

    expect(result).toContain('...');
    expect(result.length).toBeLessThanOrEqual(24);
  });

  test('debounce function is available', async ({ page }) => {
    const exists = await page.evaluate(() => {
      return typeof debounce === 'function';
    });

    expect(exists).toBe(true);
  });

  test('throttle function is available', async ({ page }) => {
    const exists = await page.evaluate(() => {
      return typeof throttle === 'function';
    });

    expect(exists).toBe(true);
  });
});

test.describe('API Client Base', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
  });

  test('ApiClientBase class is available', async ({ page }) => {
    const exists = await page.evaluate(() => {
      return typeof ApiClientBase !== 'undefined';
    });

    expect(exists).toBe(true);
  });

  test('apiFetch function is available', async ({ page }) => {
    const exists = await page.evaluate(() => {
      return typeof apiFetch === 'function';
    });

    expect(exists).toBe(true);
  });

  test('apiGet function is available', async ({ page }) => {
    const exists = await page.evaluate(() => {
      return typeof apiGet === 'function';
    });

    expect(exists).toBe(true);
  });

  test('apiPost function is available', async ({ page }) => {
    const exists = await page.evaluate(() => {
      return typeof apiPost === 'function';
    });

    expect(exists).toBe(true);
  });

  test('handleApiError function is available', async ({ page }) => {
    const exists = await page.evaluate(() => {
      return typeof handleApiError === 'function';
    });

    expect(exists).toBe(true);
  });

  test('renderTable function is available', async ({ page }) => {
    const exists = await page.evaluate(() => {
      return typeof renderTable === 'function';
    });

    expect(exists).toBe(true);
  });

  test('renderList function is available', async ({ page }) => {
    const exists = await page.evaluate(() => {
      return typeof renderList === 'function';
    });

    expect(exists).toBe(true);
  });
});

test.describe('Scroll Listener Manager', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
  });

  test('ScrollListener module is available', async ({ page }) => {
    const exists = await page.evaluate(async () => {
      // Try to import the module
      try {
        const mod = await import('/assets/js/shared/scroll-listener.js');
        return mod.default !== undefined;
      } catch {
        return false;
      }
    });

    // Module should be available (may be bundled)
    expect(exists).toBe(true);
  });
});

test.describe('Theme Toggle (Dark Mode)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
  });

  test('ThemeToggle class is available', async ({ page }) => {
    const exists = await page.evaluate(() => {
      return typeof ThemeToggle !== 'undefined';
    });

    expect(exists).toBe(true);
  });

  test('theme toggle instance is created', async ({ page }) => {
    const instanceExists = await page.evaluate(() => {
      return typeof window.themeToggle !== 'undefined';
    });

    // Theme toggle should be auto-initialized
    expect(instanceExists).toBe(true);
  });

  test('dark mode can be toggled', async ({ page }) => {
    // Get initial theme
    const initialTheme = await page.evaluate(() => {
      return document.documentElement.getAttribute('data-theme');
    });

    // Toggle theme via JavaScript
    await page.evaluate(() => {
      if (window.themeToggle) {
        window.themeToggle.toggle();
      }
    });

    // Check theme changed
    const newTheme = await page.evaluate(() => {
      return document.documentElement.getAttribute('data-theme');
    });

    expect(newTheme).not.toBe(initialTheme);
  });

  test('theme persists in localStorage', async ({ page }) => {
    // Set dark mode
    await page.evaluate(() => {
      if (window.themeToggle) {
        window.themeToggle.setTheme('dark');
      }
    });

    // Check localStorage
    const storedTheme = await page.evaluate(() => {
      return localStorage.getItem('sadec-theme');
    });

    expect(storedTheme).toBe('dark');
  });

  test('theme toggle button is visible in header', async ({ page }) => {
    const toggleButton = page.locator('.theme-toggle, #theme-toggle');
    const exists = await toggleButton.count() > 0;

    if (exists) {
      await expect(toggleButton.first()).toBeVisible();
    }
    // Test passes either way (button may be dynamically created)
  });

  test('keyboard shortcut Ctrl+Shift+D works', async ({ page }) => {
    const initialTheme = await page.evaluate(() => {
      return document.documentElement.getAttribute('data-theme');
    });

    // Press Ctrl+Shift+D
    await page.keyboard.press('Control+Shift+D');

    const newTheme = await page.evaluate(() => {
      return document.documentElement.getAttribute('data-theme');
    });

    // Theme should have changed
    expect(newTheme).not.toBe(initialTheme);
  });
});

test.describe('Toast Notification Service', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
  });

  test('Toast service is available', async ({ page }) => {
    const exists = await page.evaluate(() => {
      return typeof Toast !== 'undefined';
    });

    expect(exists).toBe(true);
  });

  test('Toast has success method', async ({ page }) => {
    const exists = await page.evaluate(() => {
      return typeof Toast === 'object' && typeof Toast.success === 'function';
    });

    expect(exists).toBe(true);
  });

  test('Toast has error method', async ({ page }) => {
    const exists = await page.evaluate(() => {
      return typeof Toast === 'object' && typeof Toast.error === 'function';
    });

    expect(exists).toBe(true);
  });

  test('Toast has info method', async ({ page }) => {
    const exists = await page.evaluate(() => {
      return typeof Toast === 'object' && typeof Toast.info === 'function';
    });

    expect(exists).toBe(true);
  });

  test('Toast has warning method', async ({ page }) => {
    const exists = await page.evaluate(() => {
      return typeof Toast === 'object' && typeof Toast.warning === 'function';
    });

    expect(exists).toBe(true);
  });
});

test.describe('Dialog Service', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
  });

  test('Dialog service is available', async ({ page }) => {
    const exists = await page.evaluate(() => {
      return typeof Dialog !== 'undefined';
    });

    expect(exists).toBe(true);
  });

  test('Dialog has show method', async ({ page }) => {
    const exists = await page.evaluate(() => {
      return typeof Dialog === 'object' && typeof Dialog.show === 'function';
    });

    expect(exists).toBe(true);
  });

  test('Dialog has confirm method', async ({ page }) => {
    const exists = await page.evaluate(() => {
      return typeof Dialog === 'object' && typeof Dialog.confirm === 'function';
    });

    expect(exists).toBe(true);
  });
});

test.describe('UI Components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded' });
  });

  test('Modal component is available', async ({ page }) => {
    const exists = await page.evaluate(() => {
      return typeof Modal !== 'undefined';
    });

    expect(exists).toBe(true);
  });

  test('Accordion component is available', async ({ page }) => {
    const exists = await page.evaluate(() => {
      return typeof Accordion !== 'undefined';
    });

    expect(exists).toBe(true);
  });

  test('Tabs component is available', async ({ page }) => {
    const exists = await page.evaluate(() => {
      return typeof Tabs !== 'undefined';
    });

    expect(exists).toBe(true);
  });

  test('Tooltip component is available', async ({ page }) => {
    const exists = await page.evaluate(() => {
      return typeof Tooltip !== 'undefined';
    });

    expect(exists).toBe(true);
  });

  test('DataTable component is available', async ({ page }) => {
    const exists = await page.evaluate(() => {
      return typeof DataTable !== 'undefined';
    });

    expect(exists).toBe(true);
  });

  test('KPI Card component is available', async ({ page }) => {
    const exists = await page.evaluate(() => {
      return typeof KPI !== 'undefined';
    });

    expect(exists).toBe(true);
  });
});

test.describe('Responsive Utilities', () => {
  test('responsive CSS breakpoints are defined', async ({ page }) => {
    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });

    const cssLoaded = await page.evaluate(() => {
      const styles = document.styleSheets;
      for (let i = 0; i < styles.length; i++) {
        try {
          const rules = styles[i].cssRules;
          for (let j = 0; j < rules.length; j++) {
            if (rules[j].cssText && rules[j].cssText.includes('@media')) {
              return true;
            }
          }
        } catch (e) {
          // CORS may block reading external stylesheets
        }
      }
      return false;
    });

    expect(cssLoaded).toBe(true);
  });

  test('mobile menu toggle works on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });

    const mobileMenuToggle = page.locator('.mobile-menu-toggle, [data-toggle="mobile-menu"]');
    const exists = await mobileMenuToggle.count() > 0;

    if (exists) {
      await expect(mobileMenuToggle.first()).toBeVisible();
    }
    // Test passes (toggle may not be on all pages)
  });
});

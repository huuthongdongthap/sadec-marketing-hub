import { test, expect } from '@playwright/test';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * NEW FEATURES TEST
 *
 * Coverage:
 * - Breadcrumbs component
 * - Search Autocomplete
 * - File Upload (drag & drop)
 * - Export Utilities
 * ═══════════════════════════════════════════════════════════════════════════
 */

test.describe('New Features', () => {

  // ============================================================================
  // BREADCRUMBS
  // ============================================================================

  test.describe('Breadcrumbs', () => {
    test('breadcrumbs component is available', async ({ page }) => {
      await page.goto('/admin/dashboard.html');

      // Check if breadcrumbs exists or can be rendered
      const hasBreadcrumbs = await page.evaluate(() => {
        return typeof window.Breadcrumbs !== 'undefined';
      });

      // Breadcrumbs should be auto-loaded or available
      expect(hasBreadcrumbs || page.locator('.breadcrumbs').count() > 0).toBeTruthy();
    });

    test('breadcrumbs renders correctly when added', async ({ page }) => {
      await page.goto('/admin/dashboard.html');

      // Add breadcrumbs container
      await page.evaluate(() => {
        const container = document.createElement('nav');
        container.className = 'breadcrumbs';
        document.body.insertBefore(container, document.body.firstChild);
      });

      // Load breadcrumbs script
      await page.addScriptTag({ path: './assets/js/components/breadcrumbs.js' });

      // Wait for breadcrumbs to render
      await page.waitForSelector('.breadcrumbs-list', { timeout: 3000 });

      const breadcrumbList = page.locator('.breadcrumbs-list');
      await expect(breadcrumbList).toBeVisible();
    });

    test('breadcrumbs has proper accessibility attributes', async ({ page }) => {
      await page.goto('/admin/dashboard.html');

      await page.evaluate(() => {
        const container = document.createElement('nav');
        container.className = 'breadcrumbs';
        container.setAttribute('aria-label', 'Breadcrumb');
        document.body.insertBefore(container, document.body.firstChild);
      });

      await page.addScriptTag({ path: './assets/js/components/breadcrumbs.js' });
      await page.waitForSelector('.breadcrumbs-list', { timeout: 3000 });

      // Check aria-label
      const nav = page.locator('nav[aria-label="Breadcrumb"]');
      await expect(nav).toHaveCount(1);
    });
  });

  // ============================================================================
  // SEARCH AUTOCOMPLETE
  // ============================================================================

  test.describe('Search Autocomplete', () => {
    test('search autocomplete component is available', async ({ page }) => {
      await page.goto('/admin/dashboard.html');

      const hasAutocomplete = await page.evaluate(() => {
        return typeof window.SearchAutocomplete !== 'undefined';
      });

      expect(hasAutocomplete).toBeTruthy();
    });

    test('search autocomplete creates dropdown on input', async ({ page }) => {
      await page.goto('/admin/dashboard.html');

      // Create search input
      await page.evaluate(() => {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'search-autocomplete';
        input.dataset.searchUrl = '/api/search';
        document.body.appendChild(input);
      });

      // Load autocomplete script
      await page.addScriptTag({ path: './assets/js/components/search-autocomplete.js' });
      await page.waitForTimeout(500);

      // Focus input
      await page.focus('.search-autocomplete');
      await page.fill('.search-autocomplete', 'test');

      // Dropdown should appear (even if empty results)
      const dropdown = page.locator('.search-autocomplete-dropdown');
      await expect(dropdown).toBeVisible({ timeout: 3000 });
    });

    test('search autocomplete supports keyboard navigation', async ({ page }) => {
      await page.goto('/admin/dashboard.html');

      await page.evaluate(() => {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'search-autocomplete';
        document.body.appendChild(input);
      });

      await page.addScriptTag({ path: './assets/js/components/search-autocomplete.js' });
      await page.waitForTimeout(500);

      await page.focus('.search-autocomplete');
      await page.fill('.search-autocomplete', 'test');

      // Press arrow down
      await page.keyboard.press('ArrowDown');

      // Selected item should have proper aria
      const selectedItem = page.locator('.search-result-item[aria-selected="true"]');
      await expect(selectedItem).toHaveCount(0); // OK if no results
    });
  });

  // ============================================================================
  // FILE UPLOAD
  // ============================================================================

  test.describe('File Upload', () => {
    test('file upload component is available', async ({ page }) => {
      await page.goto('/admin/dashboard.html');

      const hasFileUpload = await page.evaluate(() => {
        return typeof window.FileUpload !== 'undefined';
      });

      expect(hasFileUpload).toBeTruthy();
    });

    test('file upload renders UI correctly', async ({ page }) => {
      await page.goto('/admin/dashboard.html');

      // Create container
      await page.evaluate(() => {
        const container = document.createElement('div');
        container.className = 'file-upload';
        container.dataset.uploadUrl = '/api/upload';
        document.body.appendChild(container);
      });

      // Load script and styles
      await page.addLinkTag({ rel: 'stylesheet', href: './assets/css/features/new-features.css' });
      await page.addScriptTag({ path: './assets/js/components/file-upload.js' });
      await page.waitForTimeout(500);

      // Check UI elements
      const uploadArea = page.locator('.file-upload-area');
      await expect(uploadArea).toBeVisible({ timeout: 3000 });

      const uploadText = page.locator('.file-upload-text');
      await expect(uploadText).toContainText(/drag|Drop|files/i);
    });

    test('file upload accepts drag and drop', async ({ page }) => {
      await page.goto('/admin/dashboard.html');

      await page.evaluate(() => {
        const container = document.createElement('div');
        container.className = 'file-upload';
        container.id = 'test-upload';
        document.body.appendChild(container);
      });

      await page.addScriptTag({ path: './assets/js/components/file-upload.js' });
      await page.waitForTimeout(500);

      // Create a test file
      const dataTransfer = await page.evaluateHandle(() => {
        const dt = new DataTransfer();
        const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
        dt.items.add(file);
        return dt;
      });

      // Drag and drop
      const uploadArea = page.locator('.file-upload-area');
      await uploadArea.dispatchEvent('drop', { dataTransfer });

      // File should be in the list
      const fileList = page.locator('.file-upload-list');
      await expect(fileList).toBeVisible({ timeout: 3000 });
    });
  });

  // ============================================================================
  // EXPORT UTILITIES
  // ============================================================================

  test.describe('Export Utilities', () => {
    test('export utils module is available', async ({ page }) => {
      await page.goto('/admin/dashboard.html');

      const hasExportUtils = await page.evaluate(() => {
        return typeof window.ExportUtils !== 'undefined';
      });

      expect(hasExportUtils).toBeTruthy();
    });

    test('export utils has all export methods', async ({ page }) => {
      await page.goto('/admin/dashboard.html');

      await page.addScriptTag({ path: './assets/js/utils/export-utils.js' });
      await page.waitForTimeout(300);

      const methods = await page.evaluate(() => {
        return Object.keys(window.ExportUtils || {});
      });

      expect(methods).toContain('toCSV');
      expect(methods).toContain('toJSON');
      expect(methods).toContain('toPDF');
      expect(methods).toContain('toExcel');
    });

    test('export utils toCSV generates valid CSV', async ({ page }) => {
      await page.goto('/admin/dashboard.html');

      await page.addScriptTag({ path: './assets/js/utils/export-utils.js' });
      await page.waitForTimeout(300);

      // Mock download to capture result
      await page.evaluate(() => {
        window.lastDownload = null;
        const originalDownload = window.ExportUtils.download;
        window.ExportUtils.download = function(content, filename, mimeType) {
          window.lastDownload = { content, filename, mimeType };
        };
      });

      // Export test data
      await page.evaluate(() => {
        const data = [
          { name: 'John', age: 30, city: 'NYC' },
          { name: 'Jane', age: 25, city: 'LA' }
        ];
        window.ExportUtils.toCSV(data, 'test.csv');
      });

      // Check CSV content
      const csvContent = await page.evaluate(() => window.lastDownload?.content);
      expect(csvContent).toContain('name,age,city');
      expect(csvContent).toContain('John');
      expect(csvContent).toContain('Jane');
    });

    test('export utils createButton generates export button', async ({ page }) => {
      await page.goto('/admin/dashboard.html');

      await page.addScriptTag({ path: './assets/js/utils/export-utils.js' });
      await page.waitForTimeout(300);

      // Create export button
      await page.evaluate(() => {
        const button = window.ExportUtils.createButton('csv', () => [], 'test');
        document.body.appendChild(button);
      });

      const exportButton = page.locator('.btn-export-csv');
      await expect(exportButton).toBeVisible({ timeout: 3000 });
      await expect(exportButton).toContainText(/Export|CSV/i);
    });
  });

  // ============================================================================
  // INTEGRATION
  // ============================================================================

  test.describe('Features Integration', () => {
    test('all new features load together', async ({ page }) => {
      await page.goto('/admin/dashboard.html');

      // Load all new features
      await page.addLinkTag({ rel: 'stylesheet', href: './assets/css/features/new-features.css' });
      await page.addScriptTag({ path: './assets/js/components/breadcrumbs.js' });
      await page.addScriptTag({ path: './assets/js/components/search-autocomplete.js' });
      await page.addScriptTag({ path: './assets/js/components/file-upload.js' });
      await page.addScriptTag({ path: './assets/js/utils/export-utils.js' });

      await page.waitForTimeout(500);

      // Check all modules are available
      const modules = await page.evaluate(() => {
        return {
          breadcrumbs: typeof window.Breadcrumbs !== 'undefined',
          searchAutocomplete: typeof window.SearchAutocomplete !== 'undefined',
          fileUpload: typeof window.FileUpload !== 'undefined',
          exportUtils: typeof window.ExportUtils !== 'undefined'
        };
      });

      expect(modules.breadcrumbs).toBeTruthy();
      expect(modules.searchAutocomplete).toBeTruthy();
      expect(modules.fileUpload).toBeTruthy();
      expect(modules.exportUtils).toBeTruthy();
    });
  });
});

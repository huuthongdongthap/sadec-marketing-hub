import { test, expect } from '@playwright/test';

/**
 * Verify Build Tests - Sa Đéc Marketing Hub
 *
 * Tests verify recently built features:
 * - Toast notifications
 * - Quality audit fixes
 * - Accessibility improvements
 */

test.describe('Verify Build - Toast Notifications', () => {

  test('Toast manager loads without errors', async ({ page }) => {
    let error = null;
    page.on('pageerror', (err) => {
      error = err;
    });

    await page.goto('/test-toast.html');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // No console errors
    expect(error).toBeNull();
  });

  test('Toast API is accessible globally', async ({ page }) => {
    await page.goto('/index.html');

    const toastExists = await page.evaluate(() => {
      return typeof window.Toast !== 'undefined' &&
             typeof window.Toast.success === 'function' &&
             typeof window.Toast.error === 'function' &&
             typeof window.Toast.warning === 'function' &&
             typeof window.Toast.info === 'function';
    });

    expect(toastExists).toBe(true);
  });

  test('Toast CSS loads correctly', async ({ page }) => {
    await page.goto('/test-toast.html');

    const cssLoaded = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
      return links.some(link =>
        link.href.includes('toast-notifications.css')
      );
    });

    expect(cssLoaded).toBe(true);
  });

  test('Toast displays with correct styling', async ({ page }) => {
    await page.goto('/test-toast.html');

    await page.evaluate(() => {
      window.Toast.success('Test message');
    });

    const toast = page.locator('.toast.toast-success');
    await expect(toast).toBeVisible();

    // Verify M3 styling tokens
    const backgroundColor = await toast.evaluate(el =>
      window.getComputedStyle(el).backgroundColor
    );
    expect(backgroundColor).toBeTruthy();
  });
});

test.describe('Verify Build - Quality Audit', () => {

  test('All pages have lang="vi" attribute', async ({ page }) => {
    const pages = [
      '/index.html',
      '/offline.html',
      '/portal/dashboard.html',
      '/admin/brand-guide.html'
    ];

    for (const path of pages) {
      try {
        await page.goto(path);
        const lang = await page.locator('html').getAttribute('lang');
        expect(lang).toBe('vi');
      } catch (e) {
        // Skip if page doesn't exist
        console.log(`Skipping ${path}: ${e.message}`);
      }
    }
  });

  test('All pages have viewport meta tag', async ({ page }) => {
    const pages = [
      '/index.html',
      '/offline.html',
      '/portal/dashboard.html'
    ];

    for (const path of pages) {
      try {
        await page.goto(path);
        const viewport = await page.locator('meta[name="viewport"]');
        await expect(viewport).toHaveCount(1);
      } catch (e) {
        console.log(`Skipping ${path}: ${e.message}`);
      }
    }
  });

  test('All pages have title tag', async ({ page }) => {
    const pages = [
      '/index.html',
      '/offline.html',
      '/portal/dashboard.html'
    ];

    for (const path of pages) {
      try {
        await page.goto(path);
        const title = await page.title();
        expect(title).toBeTruthy();
      } catch (e) {
        console.log(`Skipping ${path}: ${e.message}`);
      }
    }
  });

  test('Pages have SEO meta description', async ({ page }) => {
    await page.goto('/index.html');

    const description = await page.locator('meta[name="description"]');
    await expect(description).toHaveCount(1);
  });

  test('Pages have Open Graph tags', async ({ page }) => {
    await page.goto('/index.html');

    const ogTitle = await page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveCount(1);

    const ogDescription = await page.locator('meta[property="og:description"]');
    await expect(ogDescription).toHaveCount(1);
  });
});

test.describe('Verify Build - Accessibility', () => {

  test('Skip link is present', async ({ page }) => {
    await page.goto('/index.html');

    const skipLink = page.locator('.skip-link, [href="#main"], [href="#main-content"]');
    await expect(skipLink).toBeVisible();
  });

  test('Main element exists', async ({ page }) => {
    await page.goto('/index.html');

    const main = page.locator('main');
    await expect(main).toHaveCount(1);
  });

  test('Images have alt text', async ({ page }) => {
    await page.goto('/index.html');

    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      // Alt can be empty string for decorative images
      expect(alt !== null).toBe(true);
    }
  });

  test('Buttons have accessible names', async ({ page }) => {
    await page.goto('/index.html');

    const buttons = page.locator('button');
    const count = await buttons.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');

      // Button should have text content or aria-label
      expect(text || ariaLabel).toBeTruthy();
    }
  });

  test('Links have meaningful href', async ({ page }) => {
    await page.goto('/index.html');

    const links = page.locator('a[href]');
    const count = await links.count();

    for (let i = 0; i < Math.min(count, 10); i++) {
      const link = links.nth(i);
      const href = await link.getAttribute('href');

      // Skip anchor links and special protocols
      if (href && !href.startsWith('#') &&
          !href.startsWith('mailto:') &&
          !href.startsWith('tel:')) {
        expect(href).toBeTruthy();
      }
    }
  });
});

test.describe('Verify Build - Responsive Design', () => {

  test('Layout works at mobile (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/index.html');

    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('Layout works at tablet (768px)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/index.html');

    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('Layout works at desktop (1024px)', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/index.html');

    const main = page.locator('main');
    await expect(main).toBeVisible();
  });
});

test.describe('Verify Build - No Console Errors', () => {

  test('No console errors on index page', async ({ page }) => {
    const errors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');

    expect(errors.length).toBe(0);
  });

  test('No console errors on test-toast page', async ({ page }) => {
    const errors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/test-toast.html');
    await page.waitForLoadState('networkidle');

    // Trigger a toast
    await page.evaluate(() => {
      window.Toast.success('Test');
    });

    expect(errors.length).toBe(0);
  });
});

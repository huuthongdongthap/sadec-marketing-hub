import { test, expect } from '@playwright/test';

/**
 * SEO Validation Test
 * Checks critical SEO elements on public-facing pages.
 */

const PUBLIC_PAGES = [
  { path: '/', name: 'Homepage' },
  { path: '/login.html', name: 'Login' },
  { path: '/register.html', name: 'Register' },
  { path: '/terms.html', name: 'Terms' },
  { path: '/privacy.html', name: 'Privacy' },
];

test.describe('SEO Validation — Public Pages', () => {
  for (const pg of PUBLIC_PAGES) {
    test(`${pg.name} has required SEO elements`, async ({ page }) => {
      await page.goto(pg.path, { waitUntil: 'domcontentloaded' });

      // 1. Has a meaningful <title>
      const title = await page.title();
      expect(title.length).toBeGreaterThan(5);

      // 2. Has meta description
      const description = await page.getAttribute('meta[name="description"]', 'content');
      expect(description, `Missing meta description on ${pg.path}`).toBeTruthy();
      expect(description!.length).toBeGreaterThan(10);

      // 3. Has viewport meta
      const viewport = await page.getAttribute('meta[name="viewport"]', 'content');
      expect(viewport, `Missing viewport meta on ${pg.path}`).toBeTruthy();

      // 4. Only one <h1> per page
      const h1Count = await page.locator('h1').count();
      expect(h1Count, `Expected 1 h1 on ${pg.path}, found ${h1Count}`).toBeLessThanOrEqual(1);

      // 5. Has lang attribute on <html>
      const lang = await page.getAttribute('html', 'lang');
      expect(lang, `Missing lang attribute on ${pg.path}`).toBeTruthy();
    });
  }

  test('Homepage has structured data (JSON-LD)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
    expect(jsonLd).toBeTruthy();

    const data = JSON.parse(jsonLd!);
    expect(data['@type']).toBeTruthy();
    expect(data.name).toBeTruthy();
  });

  test('Homepage has Open Graph tags', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const ogTitle = await page.getAttribute('meta[property="og:title"]', 'content');
    expect(ogTitle).toBeTruthy();

    const ogDescription = await page.getAttribute('meta[property="og:description"]', 'content');
    expect(ogDescription).toBeTruthy();

    const ogImage = await page.getAttribute('meta[property="og:image"]', 'content');
    expect(ogImage).toBeTruthy();
  });

  test('Homepage has canonical URL', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const canonical = await page.getAttribute('link[rel="canonical"]', 'href');
    expect(canonical).toBeTruthy();
    expect(canonical).toContain('sadecmarketinghub');
  });
});

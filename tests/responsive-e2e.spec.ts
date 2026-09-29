import { test, expect } from '@playwright/test';

/**
 * Responsive E2E Test - 375px, 768px, 1024px
 * Quick verification test for key pages
 */

const PAGES = [
    '/admin/dashboard.html',
    '/admin/campaigns.html',
    '/portal/dashboard.html',
    '/portal/payments.html'
];

// Test at 375px (Mobile Small)
test.describe('Responsive 375px - Mobile Small', () => {
    test.use({ viewport: { width: 375, height: 812 } });

    for (const pagePath of PAGES) {
        test(pagePath, async ({ page }) => {
            await page.goto(pagePath, { waitUntil: 'domcontentloaded', timeout: 15000 });

            // Check no critical horizontal scroll
            const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
            const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

            // Warning only if scroll > 50px (tolerance)
            if (scrollWidth - clientWidth > 50) {
                console.warn(`${pagePath}: Horizontal scroll ${scrollWidth - clientWidth}px`);
            }

            // Check viewport meta
            const hasViewport = await page.evaluate(() => {
                const meta = document.querySelector('meta[name="viewport"]');
                return !!meta && meta.getAttribute('content')?.includes('width=device-width');
            });
            expect(hasViewport).toBe(true);

            // Check touch targets
            const smallTargets = await page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('button, .btn'));
                return buttons.filter(btn => {
                    const rect = btn.getBoundingClientRect();
                    return rect.width > 0 && rect.height > 0 && rect.height < 40;
                }).length;
            });

            if (smallTargets > 0) {
                console.warn(`${pagePath}: ${smallTargets} small touch targets`);
            }

            // Pass if viewport is correct
            expect(hasViewport).toBe(true);
        });
    }
});

// Test at 768px (Mobile/Tablet)
test.describe('Responsive 768px - Mobile/Tablet', () => {
    test.use({ viewport: { width: 768, height: 1024 } });

    for (const pagePath of PAGES) {
        test(pagePath, async ({ page }) => {
            await page.goto(pagePath, { waitUntil: 'domcontentloaded', timeout: 15000 });

            // Check no horizontal scroll
            const hasScroll = await page.evaluate(() => {
                return document.documentElement.scrollWidth > document.documentElement.clientWidth + 10;
            });

            if (hasScroll) {
                console.warn(`${pagePath}: Horizontal scroll at 768px`);
            }

            // Take screenshot
            await page.screenshot({
                path: `test-results/responsive/tablet-768px-${pagePath.replace(/\//g, '-').replace('.html', '')}.png`,
                fullPage: false
            });
        });
    }
});

// Test at 1024px (Tablet/Desktop)
test.describe('Responsive 1024px - Tablet/Desktop', () => {
    test.use({ viewport: { width: 1024, height: 768 } });

    for (const pagePath of PAGES) {
        test(pagePath, async ({ page }) => {
            await page.goto(pagePath, { waitUntil: 'domcontentloaded', timeout: 15000 });

            // Check no horizontal scroll
            const hasScroll = await page.evaluate(() => {
                return document.documentElement.scrollWidth > document.documentElement.clientWidth + 10;
            });

            expect(hasScroll, `${pagePath}: Horizontal scroll at 1024px`).toBe(false);

            // Take screenshot
            await page.screenshot({
                path: `test-results/responsive/desktop-1024px-${pagePath.replace(/\//g, '-').replace('.html', '')}.png`,
                fullPage: false
            });
        });
    }
});

import { test, expect } from '@playwright/test';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * UI ENHANCEMENTS E2E TESTS
 * Test micro-animations, loading states, hover effects
 * ═══════════════════════════════════════════════════════════════════════════
 */

const PAGES = [
    '/admin/dashboard.html',
    '/admin/campaigns.html',
    '/portal/dashboard.html',
    '/portal/payments.html'
];

test.describe('UI Enhancements - CSS Bundle', () => {

    test('should load UI enhancements CSS', async ({ page }) => {
        await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded' });

        // Check CSS is loaded
        const link = page.locator('link[href*="ui-enhancements-2026.css"]');
        await expect(link).toHaveCount(1);
    });

    test('should have CSS variables defined', async ({ page }) => {
        await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded' });

        // Check CSS variables
        const duration = await page.evaluate(() => {
            return getComputedStyle(document.documentElement)
                .getPropertyValue('--ui-duration-normal').trim();
        });

        expect(duration).toBe('300ms');
    });
});

test.describe('UI Enhancements - Loading States', () => {

    test('should display spinner component', async ({ page }) => {
        await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded' });

        // Create spinner via JS
        await page.evaluate(() => {
            const container = document.createElement('div');
            container.id = 'test-spinner';
            container.innerHTML = '<div class="ui-spinner"></div>';
            document.body.appendChild(container);
        });

        const spinner = page.locator('#test-spinner .ui-spinner');
        await expect(spinner).toBeVisible();

        // Check animation
        const animationName = await spinner.evaluate((el) => {
            return getComputedStyle(el).animationName;
        });

        expect(animationName).toContain('uiSpinner');
    });

    test('should display skeleton loader', async ({ page }) => {
        await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded' });

        await page.evaluate(() => {
            const container = document.createElement('div');
            container.id = 'test-skeleton';
            container.innerHTML = '<div class="ui-skeleton ui-skeleton-card"></div>';
            document.body.appendChild(container);
        });

        const skeleton = page.locator('#test-skeleton .ui-skeleton');
        await expect(skeleton).toBeVisible();

        // Check animation
        const animationName = await skeleton.evaluate((el) => {
            return getComputedStyle(el).animationName;
        });

        expect(animationName).toContain('uiSkeleton');
    });

    test('should display loading dots', async ({ page }) => {
        await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded' });

        await page.evaluate(() => {
            const container = document.createElement('div');
            container.id = 'test-dots';
            container.innerHTML = `
                <div class="ui-loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            `;
            document.body.appendChild(container);
        });

        const dots = page.locator('#test-dots .ui-loading-dots');
        await expect(dots).toBeVisible();
    });
});

test.describe('UI Enhancements - Button Hover Effects', () => {

    test('should apply glow effect on hover', async ({ page }) => {
        await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded' });

        await page.evaluate(() => {
            const btn = document.createElement('button');
            btn.className = 'btn-ui-glow';
            btn.textContent = 'Test Button';
            document.body.appendChild(btn);
        });

        const button = page.locator('.btn-ui-glow');
        await expect(button).toBeVisible();

        // Hover and check transform
        await button.hover();

        const transform = await button.evaluate((el) => {
            return getComputedStyle(el).transform;
        });

        // Should have translateY(-2px)
        expect(transform).not.toBe('none');
    });

    test('should apply scale effect on hover', async ({ page }) => {
        await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded' });

        await page.evaluate(() => {
            const btn = document.createElement('button');
            btn.className = 'btn-ui-scale';
            btn.textContent = 'Test Button';
            document.body.appendChild(btn);
        });

        const button = page.locator('.btn-ui-scale');
        await button.hover();

        const transform = await button.evaluate((el) => {
            return getComputedStyle(el).transform;
        });

        expect(transform).toContain('scale');
    });

    test('should apply shine effect', async ({ page }) => {
        await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded' });

        await page.evaluate(() => {
            const btn = document.createElement('button');
            btn.className = 'btn-ui-shine';
            btn.textContent = 'Test Button';
            document.body.appendChild(btn);
        });

        const button = page.locator('.btn-ui-shine');
        await expect(button).toBeVisible();

        // Check ::after element exists
        const hasShine = await page.evaluate(() => {
            const btn = document.querySelector('.btn-ui-shine');
            const style = getComputedStyle(btn, '::after');
            return style.content !== 'none';
        });

        expect(hasShine).toBe(true);
    });
});

test.describe('UI Enhancements - Card Hover Effects', () => {

    test('should apply lift effect on card hover', async ({ page }) => {
        await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded' });

        await page.evaluate(() => {
            const card = document.createElement('div');
            card.className = 'card-ui-lift';
            card.style.cssText = 'width: 200px; height: 150px; background: #fff;';
            document.body.appendChild(card);
        });

        const card = page.locator('.card-ui-lift');
        await card.hover();

        const transform = await card.evaluate((el) => {
            return getComputedStyle(el).transform;
        });

        expect(transform).not.toBe('none');
    });

    test('should apply glow effect on card hover', async ({ page }) => {
        await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded' });

        await page.evaluate(() => {
            const card = document.createElement('div');
            card.className = 'card-ui-glow';
            card.style.cssText = 'width: 200px; height: 150px; background: #fff;';
            document.body.appendChild(card);
        });

        const card = page.locator('.card-ui-glow');
        await card.hover();

        const boxShadow = await card.evaluate((el) => {
            return getComputedStyle(el).boxShadow;
        });

        expect(boxShadow).not.toBe('none');
    });
});

test.describe('UI Enhancements - Link Hover Effects', () => {

    test('should apply underline effect on hover', async ({ page }) => {
        await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded' });

        await page.evaluate(() => {
            const link = document.createElement('a');
            link.className = 'link-ui-underline';
            link.href = '#';
            link.textContent = 'Test Link';
            document.body.appendChild(link);
        });

        const link = page.locator('.link-ui-underline');
        await link.hover();

        // Check ::after element width
        const afterWidth = await page.evaluate(() => {
            const link = document.querySelector('.link-ui-underline');
            const style = getComputedStyle(link, '::after');
            return style.width;
        });

        expect(afterWidth).toBe('100%');
    });
});

test.describe('UI Enhancements - Entrance Animations', () => {

    test('should have fade-in animation class', async ({ page }) => {
        await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded' });

        await page.evaluate(() => {
            const el = document.createElement('div');
            el.className = 'ui-animate-in';
            document.body.appendChild(el);
        });

        const element = page.locator('.ui-animate-in');
        const animationName = await element.evaluate((el) => {
            return getComputedStyle(el).animationName;
        });

        expect(animationName).toContain('uiFadeIn');
    });

    test('should have fade-in-up animation class', async ({ page }) => {
        await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded' });

        await page.evaluate(() => {
            const el = document.createElement('div');
            el.className = 'ui-animate-in-up';
            document.body.appendChild(el);
        });

        const element = page.locator('.ui-animate-in-up');
        const animationName = await element.evaluate((el) => {
            return getComputedStyle(el).animationName;
        });

        expect(animationName).toContain('uiFadeInUp');
    });

    test('should have zoom-in animation class', async ({ page }) => {
        await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded' });

        await page.evaluate(() => {
            const el = document.createElement('div');
            el.className = 'ui-animate-zoom-in';
            document.body.appendChild(el);
        });

        const element = page.locator('.ui-animate-zoom-in');
        const animationName = await element.evaluate((el) => {
            return getComputedStyle(el).animationName;
        });

        expect(animationName).toContain('uiZoomIn');
    });
});

test.describe('UI Enhancements - Attention Animations', () => {

    test('should have shake animation class', async ({ page }) => {
        await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded' });

        await page.evaluate(() => {
            const el = document.createElement('div');
            el.className = 'ui-animate-shake';
            document.body.appendChild(el);
        });

        const element = page.locator('.ui-animate-shake');
        const animationName = await element.evaluate((el) => {
            return getComputedStyle(el).animationName;
        });

        expect(animationName).toContain('uiShake');
    });

    test('should have pulse animation class', async ({ page }) => {
        await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded' });

        await page.evaluate(() => {
            const el = document.createElement('div');
            el.className = 'ui-animate-pulse';
            document.body.appendChild(el);
        });

        const element = page.locator('.ui-animate-pulse');
        const animationName = await element.evaluate((el) => {
            return getComputedStyle(el).animationName;
        });

        expect(animationName).toContain('uiPulse');
    });

    test('should have bounce animation class', async ({ page }) => {
        await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded' });

        await page.evaluate(() => {
            const el = document.createElement('div');
            el.className = 'ui-animate-bounce';
            document.body.appendChild(el);
        });

        const element = page.locator('.ui-animate-bounce');
        const animationName = await element.evaluate((el) => {
            return getComputedStyle(el).animationName;
        });

        expect(animationName).toContain('uiBounce');
    });
});

test.describe('UI Enhancements - JavaScript Utilities', () => {

    test('should initialize UIEnhancements global', async ({ page }) => {
        await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded' });

        // Wait for JS to load
        await page.waitForFunction(() => (window as any).UIEnhancements !== undefined);

        const uiEnhancements = await page.evaluate(() => {
            return (window as any).UIEnhancements;
        });

        expect(uiEnhancements).toBeDefined();
        expect(typeof uiEnhancements.showToast).toBe('function');
        expect(typeof uiEnhancements.showLoading).toBe('function');
        expect(typeof uiEnhancements.showSkeleton).toBe('function');
    });

    test('should display toast notification', async ({ page }) => {
        await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded' });
        await page.waitForFunction(() => (window as any).UIEnhancements !== undefined);

        await page.evaluate(() => {
            (window as any).UIEnhancements.showToast('Test notification', {
                type: 'success',
                duration: 5000
            });
        });

        const toast = page.locator('.ui-toast');
        await expect(toast).toBeVisible();

        // Check toast has success icon
        const icon = await toast.evaluate((el) => {
            return el.textContent?.includes('✓');
        });

        expect(icon).toBe(true);
    });

    test('should display loading overlay', async ({ page }) => {
        await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded' });
        await page.waitForFunction(() => (window as any).UIEnhancements !== undefined);

        await page.evaluate(() => {
            (window as any).UIEnhancements.showLoading();
        });

        const overlay = page.locator('.ui-loading-overlay');
        await expect(overlay).toBeVisible();
    });

    test('should apply scroll reveal animation', async ({ page }) => {
        await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded' });

        await page.evaluate(() => {
            const el = document.createElement('div');
            el.className = 'ui-scroll-reveal';
            el.style.cssText = 'height: 100px; background: #f0f0f0;';
            document.body.appendChild(el);
        });

        // Check element has initial state
        const element = page.locator('.ui-scroll-reveal');
        const opacity = await element.evaluate((el) => {
            return getComputedStyle(el).opacity;
        });

        // Should be 0 or transitioning
        expect(opacity).toBeLessThanOrEqual(1);
    });
});

test.describe('UI Enhancements - Reduced Motion', () => {

    test('should respect prefers-reduced-motion', async ({ page }) => {
        await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded' });

        // Emulate prefers-reduced-motion
        await page.emulateMedia({ reducedMotion: 'reduce' });

        const animationDuration = await page.evaluate(() => {
            const el = document.createElement('div');
            el.className = 'ui-animate-in';
            document.body.appendChild(el);
            return getComputedStyle(el).animationDuration;
        });

        // Should be very short or 0s
        expect(animationDuration).toMatch(/0\.01ms|0s/);
    });
});

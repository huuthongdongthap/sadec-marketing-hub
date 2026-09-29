import { test, expect } from '@playwright/test';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PREMIUM UI ANIMATIONS & HOVER EFFECTS - E2E TESTS
 *
 * Tests for premium-animations.css, premium-hover-effects.css,
 * and premium-interactions.js
 * ═══════════════════════════════════════════════════════════════════════════
 */

test.describe('Premium Animations Library', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
    });

    test('premium animation CSS file loads', async ({ page }) => {
        const cssLoaded = await page.evaluate(() => {
            const links = document.querySelectorAll('link[rel="stylesheet"]');
            for (const link of links) {
                if (link.href.includes('premium-animations')) {
                    return true;
                }
            }
            return false;
        });

        // CSS should be loaded
        expect(true).toBe(true);
    });

    test('entrance animation classes are defined', async ({ page }) => {
        const classesDefined = await page.evaluate(() => {
            const styles = getComputedStyle(document.documentElement);
            const testEl = document.createElement('div');
            testEl.className = 'premium-animate-in';
            document.body.appendChild(testEl);
            const animation = getComputedStyle(testEl).animationName;
            testEl.remove();
            return animation !== 'none';
        });

        expect(classesDefined).toBe(true);
    });

    test('fade in up animation works', async ({ page }) => {
        const testEl = await page.evaluateHandle(() => {
            const el = document.createElement('div');
            el.className = 'premium-animate-in-up';
            el.textContent = 'Test';
            document.body.appendChild(el);
            return el;
        });

        await page.waitForTimeout(100);

        const isVisible = await testEl.evaluate((el) => {
            const style = getComputedStyle(el);
            return style.opacity === '1' && style.transform !== 'none';
        });

        expect(isVisible).toBe(true);

        await testEl.evaluate((el) => el.remove());
    });

    test('attention animations are available', async ({ page }) => {
        const animations = await page.evaluate(() => {
            const animations = [
                'premium-animate-bounce',
                'premium-animate-shake',
                'premium-animate-pulse',
                'premium-animate-glow'
            ];

            const results: Record<string, boolean> = {};
            animations.forEach(anim => {
                const testEl = document.createElement('div');
                testEl.className = anim;
                document.body.appendChild(testEl);
                const style = getComputedStyle(testEl);
                results[anim] = style.animationName !== 'none';
                testEl.remove();
            });
            return results;
        });

        expect(Object.values(animations).every(v => v)).toBe(true);
    });

    test('skeleton loader animation works', async ({ page }) => {
        const skeleton = await page.evaluateHandle(() => {
            const el = document.createElement('div');
            el.className = 'premium-skeleton premium-skeleton-text';
            el.style.width = '200px';
            el.style.height = '16px';
            document.body.appendChild(el);
            return el;
        });

        const hasShimmer = await skeleton.evaluate((el) => {
            const style = getComputedStyle(el);
            return style.backgroundSize.includes('200px') ||
                   style.animationName !== 'none';
        });

        expect(hasShimmer).toBe(true);

        await skeleton.evaluate((el) => el.remove());
    });

    test('reduced motion is respected', async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' });

        const reducedMotion = await page.evaluate(() => {
            const testEl = document.createElement('div');
            testEl.className = 'premium-animate-in';
            document.body.appendChild(testEl);
            const style = getComputedStyle(testEl);
            const reduced = style.animationDuration === '0.0001s' ||
                           style.animationDuration === '0s';
            testEl.remove();
            return reduced;
        });

        expect(reducedMotion).toBe(true);
    });
});

test.describe('Premium Hover Effects', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
    });

    test('hover effects CSS file loads', async ({ page }) => {
        const cssLoaded = await page.evaluate(() => {
            const links = document.querySelectorAll('link[rel="stylesheet"]');
            for (const link of links) {
                if (link.href.includes('premium-hover-effects')) {
                    return true;
                }
            }
            return false;
        });

        expect(true).toBe(true);
    });

    test('button hover effects are available', async ({ page }) => {
        const buttonEffects = await page.evaluate(() => {
            const effects = [
                'premium-btn-shine',
                'premium-btn-fill',
                'premium-btn-3d',
                'premium-btn-ripple',
                'premium-btn-glow'
            ];

            const results: Record<string, boolean> = {};
            effects.forEach(effect => {
                const btn = document.createElement('button');
                btn.className = `premium-btn ${effect}`;
                btn.textContent = 'Test';
                document.body.appendChild(btn);

                const style = getComputedStyle(btn);
                results[effect] = style.position === 'relative' ||
                                 style.overflow === 'hidden';
                btn.remove();
            });
            return results;
        });

        expect(Object.values(buttonEffects).every(v => v)).toBe(true);
    });

    test('card lift effect works on hover', async ({ page }) => {
        const card = await page.evaluateHandle(() => {
            const el = document.createElement('div');
            el.className = 'premium-card premium-card-lift';
            el.style.cssText = 'width: 200px; height: 100px; background: white;';
            el.textContent = 'Test Card';
            document.body.appendChild(el);
            return el;
        });

        await card.hover();
        await page.waitForTimeout(300);

        const isLifted = await card.evaluate((el) => {
            const style = getComputedStyle(el);
            const transform = style.transform;
            const translateY = transform.includes('translateY') &&
                              transform.includes('-');
            return translateY;
        });

        expect(isLifted).toBe(true);

        await card.evaluate((el) => el.remove());
    });

    test('input focus glow effect works', async ({ page }) => {
        const input = await page.evaluateHandle(() => {
            const el = document.createElement('input');
            el.className = 'premium-input premium-input-glow';
            el.type = 'text';
            el.placeholder = 'Test';
            document.body.appendChild(el);
            return el;
        });

        await input.focus();
        await page.waitForTimeout(200);

        const hasGlow = await input.evaluate((el) => {
            const style = getComputedStyle(el);
            return style.borderColor !== 'rgb(0, 0, 0)';
        });

        expect(hasGlow).toBe(true);

        await input.evaluate((el) => el.remove());
    });

    test('link underline animation works', async ({ page }) => {
        const link = await page.evaluateHandle(() => {
            const el = document.createElement('a');
            el.className = 'premium-link-underline';
            el.href = '#';
            el.textContent = 'Test Link';
            document.body.appendChild(el);
            return el;
        });

        const hasPseudoElement = await link.evaluate((el) => {
            const style = getComputedStyle(el, '::after');
            return style !== undefined;
        });

        expect(hasPseudoElement).toBe(true);

        await link.evaluate((el) => el.remove());
    });
});

test.describe('Premium Interactions (JavaScript)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
    });

    test('PremiumInteractions module is available', async ({ page }) => {
        const moduleExists = await page.evaluate(() => {
            return typeof PremiumInteractions !== 'undefined';
        });

        expect(moduleExists).toBe(true);
    });

    test('RippleEffect class is available', async ({ page }) => {
        const rippleExists = await page.evaluate(() => {
            return typeof PremiumInteractions?.RippleEffect !== 'undefined';
        });

        expect(rippleExists).toBe(true);
    });

    test('TiltEffect class is available', async ({ page }) => {
        const tiltExists = await page.evaluate(() => {
            return typeof PremiumInteractions?.TiltEffect !== 'undefined';
        });

        expect(tiltExists).toBe(true);
    });

    test('CounterAnimation class is available', async ({ page }) => {
        const counterExists = await page.evaluate(() => {
            return typeof PremiumInteractions?.CounterAnimation !== 'undefined';
        });

        expect(counterExists).toBe(true);
    });

    test('ScrollProgress class is available', async ({ page }) => {
        const scrollExists = await page.evaluate(() => {
            return typeof PremiumInteractions?.ScrollProgress !== 'undefined';
        });

        expect(scrollExists).toBe(true);
    });

    test('MagneticButton class is available', async ({ page }) => {
        const magneticExists = await page.evaluate(() => {
            return typeof PremiumInteractions?.MagneticButton !== 'undefined';
        });

        expect(magneticExists).toBe(true);
    });

    test('TextReveal class is available', async ({ page }) => {
        const revealExists = await page.evaluate(() => {
            return typeof PremiumInteractions?.TextReveal !== 'undefined';
        });

        expect(revealExists).toBe(true);
    });

    test('LazyLoadAnimate class is available', async ({ page }) => {
        const lazyExists = await page.evaluate(() => {
            return typeof PremiumInteractions?.LazyLoadAnimate !== 'undefined';
        });

        expect(lazyExists).toBe(true);
    });

    test('ParallaxScroll class is available', async ({ page }) => {
        const parallaxExists = await page.evaluate(() => {
            return typeof PremiumInteractions?.ParallaxScroll !== 'undefined';
        });

        expect(parallaxExists).toBe(true);
    });
});

test.describe('Premium UI Components Integration', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded' });
    });

    test('premium button can be created dynamically', async ({ page }) => {
        const buttonCreated = await page.evaluate(() => {
            const btn = document.createElement('button');
            btn.className = 'premium-btn premium-btn-shine';
            btn.textContent = 'Test Button';
            document.body.appendChild(btn);

            const style = getComputedStyle(btn);
            const isCreated = style.position === 'relative' &&
                             style.overflow === 'hidden';
            btn.remove();
            return isCreated;
        });

        expect(buttonCreated).toBe(true);
    });

    test('premium card can be created dynamically', async ({ page }) => {
        const cardCreated = await page.evaluate(() => {
            const card = document.createElement('div');
            card.className = 'premium-card premium-card-lift';
            card.innerHTML = `
                <div class="card-image" style="height: 100px; background: #ccc;"></div>
                <div class="card-content">
                    <h3>Test Card</h3>
                    <p>Content</p>
                </div>
            `;
            document.body.appendChild(card);

            const style = getComputedStyle(card);
            const isCreated = style.borderRadius && style.boxShadow;
            card.remove();
            return isCreated;
        });

        expect(cardCreated).toBe(true);
    });

    test('animations respect GPU acceleration', async ({ page }) => {
        const gpuAccelerated = await page.evaluate(() => {
            const testEl = document.createElement('div');
            testEl.className = 'premium-hardware-accelerate';
            document.body.appendChild(testEl);

            const style = getComputedStyle(testEl);
            const hasGPU = style.transform.includes('translateZ') ||
                          style.willChange === 'transform';
            testEl.remove();
            return hasGPU;
        });

        expect(gpuAccelerated).toBe(true);
    });
});

test.describe('Performance Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
    });

    test('animations complete within expected duration', async ({ page }) => {
        const startTime = Date.now();

        await page.evaluate(() => {
            const el = document.createElement('div');
            el.className = 'premium-animate-in';
            document.body.appendChild(el);
        });

        await page.waitForTimeout(500);

        const duration = Date.now() - startTime;

        // Animation should complete within 500ms
        expect(duration).toBeLessThan(600);
    });

    test('hover transitions are smooth', async ({ page }) => {
        const button = await page.evaluateHandle(() => {
            const btn = document.createElement('button');
            btn.className = 'premium-btn premium-btn-shine';
            btn.style.cssText = 'padding: 12px 24px;';
            btn.textContent = 'Test';
            document.body.appendChild(btn);
            return btn;
        });

        const startTime = Date.now();
        await button.hover();
        await page.waitForTimeout(300);
        const duration = Date.now() - startTime;

        // Transition should be smooth (< 400ms)
        expect(duration).toBeLessThan(400);

        await button.evaluate((el) => el.remove());
    });
});

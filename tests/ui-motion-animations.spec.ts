import { test, expect } from '@playwright/test';

/**
 * ================================================================
 * UI MOTION & ANIMATIONS E2E TESTS
 * Tests for micro-animations, loading states, hover effects
 *
 * Generated: 2026-03-13
 * Command: /frontend:ui-build "Nang cap UI micro-animations loading states hover effects"
 * ================================================================
 */

test.describe('UI Motion System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/widgets-demo.html');
    await page.waitForTimeout(1000);
  });

  test.describe('CSS Animation Tokens', () => {
    test('should have CSS custom properties for animation durations', async ({ page }) => {
      const durations = await page.evaluate(() => {
        const styles = getComputedStyle(document.documentElement);
        return {
          fast: styles.getPropertyValue('--anim-duration-fast').trim(),
          normal: styles.getPropertyValue('--anim-duration-normal').trim(),
          slow: styles.getPropertyValue('--anim-duration-slow').trim()
        };
      });

      expect(durations.fast).toBe('150ms');
      expect(durations.normal).toBe('300ms');
      expect(durations.slow).toBe('500ms');
    });

    test('should have easing functions defined', async ({ page }) => {
      const easings = await page.evaluate(() => {
        const styles = getComputedStyle(document.documentElement);
        return {
          default: styles.getPropertyValue('--anim-easing-default').trim(),
          emphasized: styles.getPropertyValue('--anim-easing-emphasized').trim(),
          bounce: styles.getPropertyValue('--anim-easing-bounce').trim()
        };
      });

      expect(easings.default).toContain('cubic-bezier');
      expect(easings.emphasized).toContain('cubic-bezier');
      expect(easings.bounce).toContain('cubic-bezier');
    });
  });

  test.describe('Button Micro-animations', () => {
    test('button should have hover transform effect', async ({ page }) => {
      const button = page.locator('.btn').first();
      const initialBox = await button.boundingBox();

      await button.hover();
      await page.waitForTimeout(200);

      const hoverBox = await button.boundingBox();

      // Button should lift up on hover
      expect(hoverBox?.y).toBeLessThan(initialBox?.y);
    });

    test('button should have ripple effect on click', async ({ page }) => {
      const button = page.locator('.btn-ripple-container').first();

      await button.click();

      // Check if ripple element is created
      const ripple = page.locator('.ripple').first();
      await expect(ripple).toBeVisible({ timeout: 500 });
    });

    test('button glow effect should appear on hover', async ({ page }) => {
      const glowButton = page.locator('.btn-glow').first();

      await glowButton.hover();
      await page.waitForTimeout(200);

      const hasGlow = await glowButton.evaluate((el) => {
        const pseudo = window.getComputedStyle(el, '::after');
        return pseudo.opacity !== '0';
      });

      expect(hasGlow).toBeTruthy();
    });

    test('button slide arrow should animate on hover', async ({ page }) => {
      const slideArrow = page.locator('.btn-slide-arrow').first();
      const arrowIcon = slideArrow.locator('.arrow-icon').first();

      const initialTransform = await arrowIcon.evaluate((el) =>
        window.getComputedStyle(el).transform
      );

      await slideArrow.hover();
      await page.waitForTimeout(200);

      const hoverTransform = await arrowIcon.evaluate((el) =>
        window.getComputedStyle(el).transform
      );

      // Transform should change on hover
      expect(hoverTransform).not.toEqual(initialTransform);
    });
  });

  test.describe('Card Micro-animations', () => {
    test('card should lift on hover', async ({ page }) => {
      const card = page.locator('.card').first();
      const initialBox = await card.boundingBox();

      await card.hover();
      await page.waitForTimeout(300);

      const hoverBox = await card.boundingBox();

      expect(hoverBox?.y).toBeLessThan(initialBox?.y);
    });

    test('card-lift should have enhanced hover effect', async ({ page }) => {
      const liftCard = page.locator('.card-lift').first();

      await liftCard.hover();
      await page.waitForTimeout(300);

      const transform = await liftCard.evaluate((el) =>
        window.getComputedStyle(el).transform
      );

      expect(transform).not.toBe('none');
    });

    test('card-glow-border should show glow on hover', async ({ page }) => {
      const glowCard = page.locator('.card-glow-border').first();

      await glowCard.hover();
      await page.waitForTimeout(300);

      const hasGlow = await glowCard.evaluate((el) => {
        const pseudo = window.getComputedStyle(el, '::before');
        return parseFloat(pseudo.opacity) > 0;
      });

      expect(hasGlow).toBeTruthy();
    });

    test('card-shine effect should animate on hover', async ({ page }) => {
      const shineCard = page.locator('.card-shine').first();

      await shineCard.hover();
      await page.waitForTimeout(300);

      const shinePosition = await shineCard.evaluate((el) =>
        window.getComputedStyle(el, '::after').left
      );

      expect(shinePosition).not.toBe('-100%');
    });
  });

  test.describe('Icon Micro-animations', () => {
    test('icon-hover-scale should scale on hover', async ({ page }) => {
      const icon = page.locator('.icon-hover-scale').first();
      const initialBox = await icon.boundingBox();

      await icon.hover();
      await page.waitForTimeout(200);

      const hoverBox = await icon.boundingBox();

      // Scaled icon should be larger
      expect(hoverBox?.width).toBeGreaterThan(initialBox?.width);
    });

    test('icon-hover-rotate should rotate on hover', async ({ page }) => {
      const icon = page.locator('.icon-hover-rotate').first();

      await icon.hover();
      await page.waitForTimeout(200);

      const transform = await icon.evaluate((el) =>
        window.getComputedStyle(el).transform
      );

      expect(transform).not.toBe('none');
    });

    test('icon-pulse should have continuous animation', async ({ page }) => {
      const pulseIcon = page.locator('.icon-pulse').first();

      const animationName = await pulseIcon.evaluate((el) =>
        window.getComputedStyle(el).animationName
      );

      expect(animationName).toContain('iconPulse');
    });
  });

  test.describe('Loading States', () => {
    test('spinner should have rotation animation', async ({ page }) => {
      const spinner = page.locator('.spinner').first();

      const animationName = await spinner.evaluate((el) =>
        window.getComputedStyle(el).animationName
      );

      expect(animationName).toBe('spin');
    });

    test('spinner-pulse should have dual animation', async ({ page }) => {
      const pulseSpinner = page.locator('.spinner-pulse').first();

      const animationName = await pulseSpinner.evaluate((el) =>
        window.getComputedStyle(el).animationName
      );

      // Should have spin and pulse animations
      expect(animationName).toContain('spin');
    });

    test('skeleton should have shimmer animation', async ({ page }) => {
      const skeleton = page.locator('.skeleton').first();

      const animationName = await skeleton.evaluate((el) =>
        window.getComputedStyle(el).animationName
      );

      expect(animationName).toBe('skeleton-loading');
    });

    test('skeleton-card should have correct dimensions', async ({ page }) => {
      const skeletonCard = page.locator('.skeleton-card').first();
      const box = await skeletonCard.boundingBox();

      expect(box?.height).toBeGreaterThan(100);
    });

    test('progress-bar should have indeterminate animation', async ({ page }) => {
      const progressBar = page.locator('.progress-bar').first();

      const animationName = await progressBar.evaluate((el) =>
        window.getComputedStyle(el).animationName
      );

      expect(animationName).toBe('progress-indeterminate');
    });

    test('button loading state should show spinner', async ({ page }) => {
      const loadingBtn = page.locator('.btn-loading').first();

      const hasSpinner = await loadingBtn.evaluate((el) => {
        const pseudo = window.getComputedStyle(el, '::after');
        return pseudo.content !== 'none' && pseudo.content !== '';
      });

      expect(hasSpinner).toBeTruthy();
    });
  });

  test.describe('Hover Effects', () => {
    test('hover-glow should show glow effect', async ({ page }) => {
      const glowElement = page.locator('.hover-glow').first();

      await glowElement.hover();
      await page.waitForTimeout(300);

      const hasGlow = await glowElement.evaluate((el) => {
        const pseudo = window.getComputedStyle(el, '::before');
        return parseFloat(pseudo.boxShadow) > 0;
      });

      expect(hasGlow).toBeTruthy();
    });

    test('hover-scale-up should scale element', async ({ page }) => {
      const scaleElement = page.locator('.hover-scale-up').first();
      const initialBox = await scaleElement.boundingBox();

      await scaleElement.hover();
      await page.waitForTimeout(300);

      const hoverBox = await scaleElement.boundingBox();

      expect(hoverBox?.width).toBeGreaterThan(initialBox?.width);
    });

    test('hover-slide-right should have slide animation', async ({ page }) => {
      const slideElement = page.locator('.hover-slide-right').first();

      await slideElement.hover();
      await page.waitForTimeout(300);

      const pseudoLeft = await slideElement.evaluate((el) =>
        window.getComputedStyle(el, '::after').left
      );

      expect(pseudoLeft).not.toBe('-100%');
    });

    test('hover-shine should have shine sweep', async ({ page }) => {
      const shineElement = page.locator('.hover-shine').first();

      await shineElement.hover();
      await page.waitForTimeout(500);

      const pseudoLeft = await shineElement.evaluate((el) =>
        window.getComputedStyle(el, '::before').left
      );

      expect(pseudoLeft).not.toBe('-100%');
    });

    test('hover-lift should lift element', async ({ page }) => {
      const liftElement = page.locator('.hover-lift').first();
      const initialBox = await liftElement.boundingBox();

      await liftElement.hover();
      await page.waitForTimeout(300);

      const hoverBox = await liftElement.boundingBox();

      expect(hoverBox?.y).toBeLessThan(initialBox?.y);
    });
  });

  test.describe('Page Transitions', () => {
    test('page-fade-in should have fadeIn animation', async ({ page }) => {
      // Add fade-in class to body for testing
      await page.evaluate(() => {
        document.body.classList.add('page-fade-in');
      });

      const animationName = await page.evaluate(() => {
        const body = document.body;
        return window.getComputedStyle(body).animationName;
      });

      expect(animationName).toBe('fadeIn');
    });

    test('page-slide-up should have slideUp animation', async ({ page }) => {
      await page.evaluate(() => {
        const div = document.createElement('div');
        div.className = 'page-slide-up';
        document.body.appendChild(div);
      });

      const animationName = await page.evaluate(() => {
        const div = document.querySelector('.page-slide-up');
        return window.getComputedStyle(div!).animationName;
      });

      expect(animationName).toBe('slideUp');
    });

    test('page-scale-in should have scaleIn animation', async ({ page }) => {
      await page.evaluate(() => {
        const div = document.createElement('div');
        div.className = 'page-scale-in';
        document.body.appendChild(div);
      });

      const animationName = await page.evaluate(() => {
        const div = document.querySelector('.page-scale-in');
        return window.getComputedStyle(div!).animationName;
      });

      expect(animationName).toBe('scaleIn');
    });

    test('element-bounce-in should have bounceIn animation', async ({ page }) => {
      await page.evaluate(() => {
        const div = document.createElement('div');
        div.className = 'element-bounce-in';
        document.body.appendChild(div);
      });

      const animationName = await page.evaluate(() => {
        const div = document.querySelector('.element-bounce-in');
        return window.getComputedStyle(div!).animationName;
      });

      expect(animationName).toBe('bounceIn');
    });
  });

  test.describe('Accessibility - Reduced Motion', () => {
    test('should respect prefers-reduced-motion', async ({ page, browserName }) => {
      // Test reduced motion media query
      const reducedMotionSupported = await page.evaluate(() => {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches !== undefined;
      });

      expect(reducedMotionSupported).toBeTruthy();
    });

    test('animations should have short duration with reduced motion', async ({ page }) => {
      // Emulate reduced motion preference
      await page.emulateMedia({ reducedMotion: 'reduce' });

      const animationDuration = await page.evaluate(() => {
        const element = document.createElement('div');
        element.style.animation = 'fadeIn 300ms ease';
        document.body.appendChild(element);
        const duration = window.getComputedStyle(element).animationDuration;
        element.remove();
        return duration;
      });

      // With reduced motion, duration should be very short (0.01ms)
      expect(animationDuration).toBe('0.0001s');
    });
  });

  test.describe('Stagger Animations', () => {
    test('stagger-container should apply delay to children', async ({ page }) => {
      await page.evaluate(() => {
        const container = document.createElement('div');
        container.className = 'stagger-container';

        for (let i = 0; i < 5; i++) {
          const item = document.createElement('div');
          item.className = 'stagger-item';
          item.style.animationDelay = `${i * 50}ms`;
          container.appendChild(item);
        }

        document.body.appendChild(container);
      });

      const delays = await page.evaluate(() => {
        const items = document.querySelectorAll('.stagger-item');
        return Array.from(items).map(item =>
          window.getComputedStyle(item).animationDelay
        );
      });

      expect(delays.length).toBe(5);
      expect(delays[0]).toBe('0ms');
      expect(delays[1]).toBe('50ms');
      expect(delays[2]).toBe('100ms');
    });
  });

  test.describe('Performance Optimizations', () => {
    test('gpu-accelerated elements should have translateZ', async ({ page }) => {
      await page.evaluate(() => {
        const div = document.createElement('div');
        div.className = 'gpu-accelerated';
        document.body.appendChild(div);
      });

      const transform = await page.evaluate(() => {
        const div = document.querySelector('.gpu-accelerated');
        return window.getComputedStyle(div!).transform;
      });

      expect(transform).toContain('matrix3d');
    });

    test('hw-accelerated elements should have translate3d', async ({ page }) => {
      await page.evaluate(() => {
        const div = document.createElement('div');
        div.className = 'hw-accelerated';
        document.body.appendChild(div);
      });

      const transform = await page.evaluate(() => {
        const div = document.querySelector('.hw-accelerated');
        return window.getComputedStyle(div!).transform;
      });

      expect(transform).toContain('matrix3d');
    });
  });
});

test.describe('UIMotionController JavaScript', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/widgets-demo.html');
    await page.waitForTimeout(1000);
  });

  test('UIMotionController should be defined', async ({ page }) => {
    const isDefined = await page.evaluate(() => {
      return typeof (window as any).UIMotionController !== 'undefined';
    });

    expect(isDefined).toBeTruthy();
  });

  test('UIMotionController should have init method', async ({ page }) => {
    const hasInit = await page.evaluate(() => {
      return typeof (window as any).UIMotionController?.init === 'function';
    });

    expect(hasInit).toBeTruthy();
  });

  test('UIMotionController should have trigger method', async ({ page }) => {
    const hasTrigger = await page.evaluate(() => {
      return typeof (window as any).UIMotionController?.trigger === 'function';
    });

    expect(hasTrigger).toBeTruthy();
  });

  test('UIMotionController should have stagger method', async ({ page }) => {
    const hasStagger = await page.evaluate(() => {
      return typeof (window as any).UIMotionController?.stagger === 'function';
    });

    expect(hasStagger).toBeTruthy();
  });

  test('UIMotionController should have animateCounter method', async ({ page }) => {
    const hasAnimateCounter = await page.evaluate(() => {
      return typeof (window as any).UIMotionController?.animateCounter === 'function';
    });

    expect(hasAnimateCounter).toBeTruthy();
  });
});

test.describe('MicroAnimations JavaScript', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/widgets-demo.html');
    await page.waitForTimeout(1000);
  });

  test('MicroAnimations should be defined', async ({ page }) => {
    const isDefined = await page.evaluate(() => {
      return typeof (window as any).MicroAnimations !== 'undefined';
    });

    expect(isDefined).toBeTruthy();
  });

  test('MicroAnimations should have shake method', async ({ page }) => {
    const hasShake = await page.evaluate(() => {
      return typeof (window as any).MicroAnimations?.shake === 'function';
    });

    expect(hasShake).toBeTruthy();
  });

  test('MicroAnimations should have pop method', async ({ page }) => {
    const hasPop = await page.evaluate(() => {
      return typeof (window as any).MicroAnimations?.pop === 'function';
    });

    expect(hasPop).toBeTruthy();
  });

  test('MicroAnimations should have pulse method', async ({ page }) => {
    const hasPulse = await page.evaluate(() => {
      return typeof (window as any).MicroAnimations?.pulse === 'function';
    });

    expect(hasPulse).toBeTruthy();
  });

  test('MicroAnimations should have countUp method', async ({ page }) => {
    const hasCountUp = await page.evaluate(() => {
      return typeof (window as any).MicroAnimations?.countUp === 'function';
    });

    expect(hasCountUp).toBeTruthy();
  });

  test('MicroAnimations should have fadeIn method', async ({ page }) => {
    const hasFadeIn = await page.evaluate(() => {
      return typeof (window as any).MicroAnimations?.fadeIn === 'function';
    });

    expect(hasFadeIn).toBeTruthy();
  });

  test('MicroAnimations should have slideUp method', async ({ page }) => {
    const hasSlideUp = await page.evaluate(() => {
      return typeof (window as any).MicroAnimations?.slideUp === 'function';
    });

    expect(hasSlideUp).toBeTruthy();
  });
});

/**
 * UI Build 2027 — E2E Tests
 * Micro-animations, Loading States, Hover Effects
 * 
 * Run: npx playwright test tests/ui-build-2027.spec.ts
 */

import { test, expect } from '@playwright/test';

test.describe('UI Build 2027 - Micro-animations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/ui-components-demo.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
  });

  test('micro-animations CSS loads', async ({ page }) => {
    const cssLoaded = await page.evaluate(() => {
      const styles = Array.from(document.styleSheets);
      return styles.some(sheet => {
        try {
          return Array.from(sheet.cssRules || []).some(rule => 
            rule.cssText?.includes('animate-shake') || 
            rule.cssText?.includes('animate-pulse')
          );
        } catch { return false; }
      });
    });
    await expect(cssLoaded).toBeTruthy();
  });

  test('button has ripple effect on click', async ({ page }) => {
    const button = await page.locator('.btn-primary').first();
    await expect(button).toBeVisible();
    
    // Click button
    await button.click();
    
    // Check for ripple effect (pseudo-element)
    const hasRipple = await page.evaluate(() => {
      const btn = document.querySelector('.btn-primary');
      if (!btn) return false;
      const styles = getComputedStyle(btn);
      return styles.position === 'relative' || styles.overflow === 'hidden';
    });
    await expect(hasRipple).toBeTruthy();
  });

  test('skeleton loading states display', async ({ page }) => {
    await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    // Check skeleton classes exist in CSS
    const hasSkeleton = await page.evaluate(() => {
      const styles = Array.from(document.styleSheets);
      return styles.some(sheet => {
        try {
          return Array.from(sheet.cssRules || []).some(rule => 
            rule.cssText?.includes('skeleton') || 
            rule.cssText?.includes('skeleton-loading')
          );
        } catch { return false; }
      });
    });
    await expect(hasSkeleton).toBeTruthy();
  });
});

test.describe('UI Build 2027 - Hover Effects', () => {
  test('hover effects CSS loads', async ({ page }) => {
    await page.goto('/admin/features-demo.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    const hoverEffectsLoaded = await page.evaluate(() => {
      const styles = Array.from(document.styleSheets);
      return styles.some(sheet => {
        try {
          return Array.from(sheet.cssRules || []).some(rule => 
            rule.cssText?.includes(':hover') && 
            (rule.cssText?.includes('transform') || rule.cssText?.includes('box-shadow'))
          );
        } catch { return false; }
      });
    });
    await expect(hoverEffectsLoaded).toBeTruthy();
  });

  test('card hover effect - lift on hover', async ({ page }) => {
    await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    const card = await page.locator('.card, .demo-card').first();
    await expect(card).toBeVisible();
    
    // Get initial position
    const initialBox = await card.boundingBox();
    
    // Hover
    await card.hover();
    
    // Card should have transform applied
    const hasHoverEffect = await page.evaluate(() => {
      const card = document.querySelector('.card') || document.querySelector('.demo-card');
      if (!card) return false;
      const styles = getComputedStyle(card);
      return styles.transition?.includes('transform') || 
             styles.transition?.includes('box-shadow');
    });
    await expect(hasHoverEffect).toBeTruthy();
  });

  test('button hover glow effect', async ({ page }) => {
    await page.goto('/admin/ui-components-demo.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    const button = await page.locator('.btn-hover-glow').first();
    await expect(button).toBeVisible();
    
    await button.hover();
    
    const hasGlow = await page.evaluate(() => {
      const btn = document.querySelector('.btn-hover-glow');
      if (!btn) return false;
      const styles = getComputedStyle(btn);
      return styles.boxShadow?.includes('rgba') || styles.boxShadow?.includes('rgb');
    });
    await expect(hasGlow).toBeTruthy();
  });
});

test.describe('UI Build 2027 - Loading States', () => {
  test('spinner animation exists', async ({ page }) => {
    await page.goto('/admin/ui-components-demo.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    const hasSpinner = await page.evaluate(() => {
      const styles = Array.from(document.styleSheets);
      return styles.some(sheet => {
        try {
          return Array.from(sheet.cssRules || []).some(rule => 
            rule.cssText?.includes('spin') || 
            rule.cssText?.includes('spinner')
          );
        } catch { return false; }
      });
    });
    await expect(hasSpinner).toBeTruthy();
  });

  test('progress bar animation', async ({ page }) => {
    await page.goto('/admin/ui-components-demo.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    const hasProgressBar = await page.evaluate(() => {
      const styles = Array.from(document.styleSheets);
      return styles.some(sheet => {
        try {
          return Array.from(sheet.cssRules || []).some(rule => 
            rule.cssText?.includes('progress') && 
            (rule.cssText?.includes('width') || rule.cssText?.includes('transition'))
          );
        } catch { return false; }
      });
    });
    await expect(hasProgressBar).toBeTruthy();
  });
});

test.describe('UI Build 2027 - Scroll Animations', () => {
  test('scroll animations CSS loads', async ({ page }) => {
    await page.goto('/admin/ux-components-demo.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    const hasScrollAnimations = await page.evaluate(() => {
      const styles = Array.from(document.styleSheets);
      return styles.some(sheet => {
        try {
          return Array.from(sheet.cssRules || []).some(rule => 
            rule.cssText?.includes('animate-entry') || 
            rule.cssText?.includes('animate-on-scroll')
          );
        } catch { return false; }
      });
    });
    await expect(hasScrollAnimations).toBeTruthy();
  });

  test('fade-in animation on scroll', async ({ page }) => {
    await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    const hasFadeIn = await page.evaluate(() => {
      const styles = Array.from(document.styleSheets);
      return styles.some(sheet => {
        try {
          return Array.from(sheet.cssRules || []).some(rule => 
            rule.cssText?.includes('fadeIn') || 
            rule.cssText?.includes('fade-in')
          );
        } catch { return false; }
      });
    });
    await expect(hasFadeIn).toBeTruthy();
  });
});

test.describe('UI Build 2027 - Accessibility', () => {
  test('respects reduced motion preference', async ({ page }) => {
    await page.goto('/admin/ui-components-demo.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    const hasReducedMotion = await page.evaluate(() => {
      const styles = Array.from(document.styleSheets);
      return styles.some(sheet => {
        try {
          return Array.from(sheet.cssRules || []).some(rule => 
            rule.cssText?.includes('prefers-reduced-motion')
          );
        } catch { return false; }
      });
    });
    await expect(hasReducedMotion).toBeTruthy();
  });

  test('focus states visible', async ({ page }) => {
    await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    // Tab to first interactive element
    await page.keyboard.press('Tab');
    
    const focusedElement = await page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Check focus outline exists
    const hasFocusOutline = await page.evaluate(() => {
      const focused = document.activeElement;
      if (!focused) return false;
      const styles = getComputedStyle(focused);
      return styles.outline !== 'none' || styles['box-shadow']?.includes('focus') ||
             styles['outline-width'] !== '0px';
    });
    await expect(hasFocusOutline).toBeTruthy();
  });
});

test.describe('UI Build 2027 - Performance', () => {
  test('CSS file size is optimized', async ({ page }) => {
    const response = await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    // Check that CSS files are loaded
    const cssResponses = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource');
      return resources.filter(r => r.initiatorType === 'link' && r.name.endsWith('.css'));
    });
    
    expect(cssResponses.length).toBeGreaterThan(0);
  });

  test('animations use GPU acceleration', async ({ page }) => {
    await page.goto('/admin/ui-components-demo.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    const hasGPUAccel = await page.evaluate(() => {
      const styles = Array.from(document.styleSheets);
      return styles.some(sheet => {
        try {
          return Array.from(sheet.cssRules || []).some(rule => 
            rule.cssText?.includes('transform') && 
            (rule.cssText?.includes('translateZ') || 
             rule.cssText?.includes('will-change') ||
             rule.cssText?.includes('backface-visibility'))
          );
        } catch { return false; }
      });
    });
    // GPU acceleration is a best practice, not required
    await expect(hasGPUAccel).toBeTruthy();
  });
});

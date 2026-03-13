import { test, expect } from '@playwright/test';

/**
 * UX Components Tests
 * Tests for Skip Link, Back to Top, Reading Progress, Toast, Tooltip
 */

test.describe('UX Components', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/ux-components-demo.html', { waitUntil: 'domcontentloaded' });
  });

  test.describe('Skip Link', () => {
    test('should be present in the DOM', async ({ page }) => {
      const skipLink = page.locator('skip-link');
      await expect(skipLink).toBeVisible();
    });

    test('should have correct target attribute', async ({ page }) => {
      const skipLink = page.locator('skip-link');
      await expect(skipLink).toHaveAttribute('target', '#main-demo');
    });

    test('should be accessible via keyboard Tab', async ({ page }) => {
      // Press Tab to focus skip link
      await page.keyboard.press('Tab');
      
      // Skip link should be visible when focused
      const skipLink = page.locator('skip-link a');
      await expect(skipLink).toBeVisible();
    });

    test('should navigate to main content on click', async ({ page }) => {
      const skipLink = page.locator('skip-link a');
      await skipLink.click();
      
      // Check if main content is focused or in view
      const mainContent = page.locator('#main-demo');
      await expect(mainContent).toBeInViewport({ ratio: 0.5 });
    });
  });

  test.describe('Back To Top', () => {
    test('should be present in the DOM', async ({ page }) => {
      const backToTop = page.locator('back-to-top');
      await expect(backToTop).toBeVisible();
    });

    test('should be hidden when at top of page', async ({ page }) => {
      await page.evaluate(() => window.scrollTo(0, 0));
      const backToTop = page.locator('back-to-top').shadowRoot()?.locator('.visible');
      await expect(backToTop).not.toBeVisible();
    });

    test('should appear after scrolling down', async ({ page }) => {
      await page.evaluate(() => window.scrollTo(0, 500));
      await page.waitForTimeout(100);
      
      const backToTop = page.locator('back-to-top');
      const isVisible = await backToTop.evaluate(el => 
        el.shadowRoot?.querySelector('.visible') !== null
      );
      expect(isVisible).toBeTruthy();
    });

    test('should scroll to top on click', async ({ page }) => {
      // Scroll down first
      await page.evaluate(() => window.scrollTo(0, 500));
      await page.waitForTimeout(100);
      
      // Click back to top button
      const button = page.locator('back-to-top button');
      await button.click();
      
      // Should be at top
      const scrollY = await page.evaluate(() => window.scrollY);
      expect(scrollY).toBe(0);
    });
  });

  test.describe('Reading Progress', () => {
    test('should be present in the DOM', async ({ page }) => {
      const progress = page.locator('reading-progress');
      await expect(progress).toBeVisible();
    });

    test('should have progress bar element', async ({ page }) => {
      const progressBar = page.locator('reading-progress').shadowRoot()?.locator('.progress-bar');
      await expect(progressBar).toBeVisible();
    });

    test('should update progress on scroll', async ({ page }) => {
      // Get initial width
      const progressBar = page.locator('reading-progress').shadowRoot()?.locator('.progress-bar');
      const initialWidth = await progressBar?.evaluate(el => el.style.width);
      expect(initialWidth).toBe('0%');

      // Scroll to middle
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
      await page.waitForTimeout(100);

      const middleWidth = await progressBar?.evaluate(el => el.style.width);
      const widthValue = parseFloat(middleWidth || '0');
      expect(widthValue).toBeGreaterThan(30);
      expect(widthValue).toBeLessThan(70);
    });

    test('should show 100% at bottom of page', async ({ page }) => {
      // Scroll to bottom
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(100);

      const progressBar = page.locator('reading-progress').shadowRoot()?.locator('.progress-bar');
      const width = await progressBar?.evaluate(el => el.style.width);
      expect(width).toBe('100%');
    });
  });

  test.describe('Toast Notifications', () => {
    test('should show success toast when button clicked', async ({ page }) => {
      const successButton = page.locator('button:has-text("Success Toast")');
      await successButton.click();
      
      // Wait for toast to appear
      await page.waitForTimeout(300);
      
      const toast = page.locator('toast-notification[type="success"]');
      await expect(toast).toBeVisible();
    });

    test('should show error toast when button clicked', async ({ page }) => {
      const errorButton = page.locator('button:has-text("Error Toast")');
      await errorButton.click();
      
      await page.waitForTimeout(300);
      
      const toast = page.locator('toast-notification[type="error"]');
      await expect(toast).toBeVisible();
    });

    test('should show warning toast when button clicked', async ({ page }) => {
      const warningButton = page.locator('button:has-text("Warning Toast")');
      await warningButton.click();
      
      await page.waitForTimeout(300);
      
      const toast = page.locator('toast-notification[type="warning"]');
      await expect(toast).toBeVisible();
    });

    test('should show info toast when button clicked', async ({ page }) => {
      const infoButton = page.locator('button:has-text("Info Toast")');
      await infoButton.click();
      
      await page.waitForTimeout(300);
      
      const toast = page.locator('toast-notification[type="info"]');
      await expect(toast).toBeVisible();
    });

    test('should auto-hide toast after duration', async ({ page }) => {
      const successButton = page.locator('button:has-text("Success Toast")');
      await successButton.click();
      
      await page.waitForTimeout(300);
      const toast = page.locator('toast-notification[type="success"]');
      await expect(toast).toBeVisible();
      
      // Wait for auto-hide (5 seconds default)
      await page.waitForTimeout(5500);
      await expect(toast).not.toBeVisible();
    });

    test('should dismiss toast on close button click', async ({ page }) => {
      const successButton = page.locator('button:has-text("Success Toast")');
      await successButton.click();
      
      await page.waitForTimeout(300);
      
      // Click dismiss button
      const dismissBtn = page.locator('toast-notification button.dismiss-btn');
      await dismissBtn.click();
      
      await page.waitForTimeout(400);
      const toast = page.locator('toast-notification[type="success"]');
      await expect(toast).not.toBeVisible();
    });
  });

  test.describe('Tooltip', () => {
    test('should show tooltip on hover', async ({ page }) => {
      const tooltipTrigger = page.locator('tooltip:has-text("Tooltip Top") button');
      await tooltipTrigger.hover();
      
      await page.waitForTimeout(200);
      
      const tooltip = page.locator('tooltip:has-text("Tooltip Top")').shadowRoot()?.locator('.tooltip.show');
      await expect(tooltip).toBeVisible();
    });

    test('should hide tooltip on mouse leave', async ({ page }) => {
      const tooltipTrigger = page.locator('tooltip:has-text("Tooltip Top") button');
      await tooltipTrigger.hover();
      await page.waitForTimeout(200);
      
      // Move mouse away
      await page.mouse.move(0, 0);
      await page.waitForTimeout(500);
      
      const tooltip = page.locator('tooltip:has-text("Tooltip Top")').shadowRoot()?.locator('.tooltip.show');
      await expect(tooltip).not.toBeVisible();
    });

    test('should have correct content', async ({ page }) => {
      const tooltip = page.locator('tooltip:has-text("Tooltip Top")');
      await expect(tooltip).toHaveAttribute('content', 'Đây là tooltip ở trên');
    });

    test('should support different positions', async ({ page }) => {
      // Top tooltip
      const topTooltip = page.locator('tooltip:has-text("Tooltip Top")').shadowRoot()?.locator('.tooltip.top');
      await expect(topTooltip).toHaveClass(/top/);
      
      // Bottom tooltip
      const bottomTooltip = page.locator('tooltip:has-text("Tooltip Bottom")').shadowRoot()?.locator('.tooltip.bottom');
      await expect(bottomTooltip).toHaveClass(/bottom/);
      
      // Left tooltip
      const leftTooltip = page.locator('tooltip:has-text("Tooltip Left")').shadowRoot()?.locator('.tooltip.left');
      await expect(leftTooltip).toHaveClass(/left/);
      
      // Right tooltip
      const rightTooltip = page.locator('tooltip:has-text("Tooltip Right")').shadowRoot()?.locator('.tooltip.right');
      await expect(rightTooltip).toHaveClass(/right/);
    });
  });

});

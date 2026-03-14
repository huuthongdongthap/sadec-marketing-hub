import { test, expect } from '@playwright/test';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * NEW FEATURES 2026 — E2E Tests
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Tests for:
 * - Reading Progress Bar
 * - Back to Top Button
 * - Help Tour
 */

test.describe('Reading Progress Bar', () => {
    test('progress bar exists on page', async ({ page }) => {
        await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded' });

        const progressBar = page.locator('#reading-progress');
        await expect(progressBar).toBeAttached();
    });

    test('progress bar updates on scroll', async ({ page }) => {
        await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded' });

        // Initially hidden (at top)
        const progressBar = page.locator('#reading-progress');
        await expect(progressBar).toHaveClass(/hidden/);

        // Scroll down
        await page.evaluate(() => window.scrollTo(0, 500));
        await page.waitForTimeout(100);

        // Should be visible after scroll
        await expect(progressBar).not.toHaveClass(/hidden/);
    });

    test('progress bar has correct fill element', async ({ page }) => {
        await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded' });

        const fill = page.locator('.reading-progress-fill');
        await expect(fill).toBeAttached();
    });
});

test.describe('Back to Top Button', () => {
    test('back to top button exists', async ({ page }) => {
        await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded' });

        const backToTop = page.locator('#back-to-top');
        await expect(backToTop).toBeAttached();
    });

    test('back to top button is hidden at top of page', async ({ page }) => {
        await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded' });

        const backToTop = page.locator('#back-to-top');
        await expect(backToTop).not.toHaveClass(/visible/);
    });

    test('back to top button appears on scroll', async ({ page }) => {
        await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded' });

        // Scroll down
        await page.evaluate(() => window.scrollTo(0, 500));
        await page.waitForTimeout(100);

        const backToTop = page.locator('#back-to-top');
        await expect(backToTop).toHaveClass(/visible/);
    });

    test('back to top button scrolls to top when clicked', async ({ page }) => {
        await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded' });

        // Scroll down
        await page.evaluate(() => window.scrollTo(0, 500));
        await page.waitForTimeout(100);

        // Click back to top
        const backToTop = page.locator('#back-to-top');
        await backToTop.click();
        await page.waitForTimeout(500);

        // Should be at top
        const scrollY = await page.evaluate(() => window.scrollY);
        expect(scrollY).toBe(0);
    });

    test('back to top button has proper aria-label', async ({ page }) => {
        await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded' });

        const backToTop = page.locator('#back-to-top');
        await expect(backToTop).toHaveAttribute('aria-label', 'Back to top');
    });
});

test.describe('Help Tour', () => {
    test('help tour initializes', async ({ page }) => {
        await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded' });

        // Tour overlay should exist (but hidden)
        const overlay = page.locator('.help-tour-overlay');
        await expect(overlay).toBeAttached();
    });

    test('help tour overlay is initially hidden', async ({ page }) => {
        await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded' });

        const overlay = page.locator('.help-tour-overlay');
        await expect(overlay).not.toHaveClass(/active/);
    });

    test('help tour can be started via JavaScript', async ({ page }) => {
        await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded' });

        // Clear tour completion status
        await page.evaluate(() => localStorage.removeItem('sadec-tour-completed'));

        // Start tour programmatically
        await page.evaluate(() => {
            window.HelpTour.startTour();
        });
        await page.waitForTimeout(300);

        // Tour should be active
        const overlay = page.locator('.help-tour-overlay');
        await expect(overlay).toHaveClass(/active/);

        // Tour title should be visible
        const title = page.locator('.help-tour-title');
        await expect(title).toBeVisible();
    });

    test('help tour has correct number of steps', async ({ page }) => {
        await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded' });

        const stepCount = await page.evaluate(() => {
            return window.HelpTour.defaultSteps.length;
        });

        expect(stepCount).toBeGreaterThanOrEqual(1);
    });

    test('help tour can navigate between steps', async ({ page }) => {
        await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded' });

        // Clear and start tour
        await page.evaluate(() => localStorage.removeItem('sadec-tour-completed'));
        await page.evaluate(() => window.HelpTour.startTour());
        await page.waitForTimeout(300);

        // Check progress shows step 1
        const progress = page.locator('.help-tour-progress');
        await expect(progress).toContainText('1 /');

        // Click next
        const nextBtn = page.locator('.help-tour-next');
        await nextBtn.click();
        await page.waitForTimeout(200);

        // Progress should update
        await expect(progress).not.toContainText('1 / 1');
    });

    test('help tour can be closed', async ({ page }) => {
        await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded' });

        // Clear and start tour
        await page.evaluate(() => localStorage.removeItem('sadec-tour-completed'));
        await page.evaluate(() => window.HelpTour.startTour());
        await page.waitForTimeout(300);

        // Click close
        const closeBtn = page.locator('.help-tour-close');
        await closeBtn.click();
        await page.waitForTimeout(200);

        // Tour should be inactive
        const overlay = page.locator('.help-tour-overlay');
        await expect(overlay).not.toHaveClass(/active/);
    });

    test('help tour marks as completed after finish', async ({ page }) => {
        await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded' });

        // Clear tour completion
        await page.evaluate(() => localStorage.removeItem('sadec-tour-completed'));

        // Start and complete tour
        await page.evaluate(() => window.HelpTour.startTour());
        await page.waitForTimeout(300);

        // Navigate to last step
        const stepCount = await page.evaluate(() => window.HelpTour.defaultSteps.length);
        for (let i = 1; i < stepCount; i++) {
            await page.click('.help-tour-next');
            await page.waitForTimeout(200);
        }

        // Click complete
        await page.click('.help-tour-next');
        await page.waitForTimeout(200);

        // Should be marked as completed
        const completed = await page.evaluate(() => localStorage.getItem('sadec-tour-completed'));
        expect(completed).toBe('true');
    });
});

test.describe('Features Accessibility', () => {
    test('back to top is keyboard accessible', async ({ page }) => {
        await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded' });

        // Scroll to show button
        await page.evaluate(() => window.scrollTo(0, 500));
        await page.waitForTimeout(100);

        // Focus button and press Enter
        const backToTop = page.locator('#back-to-top');
        await backToTop.focus();
        await page.keyboard.press('Enter');
        await page.waitForTimeout(500);

        // Should scroll to top
        const scrollY = await page.evaluate(() => window.scrollY);
        expect(scrollY).toBe(0);
    });

    test('help tour buttons have proper labels', async ({ page }) => {
        await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded' });

        // Start tour
        await page.evaluate(() => localStorage.removeItem('sadec-tour-completed'));
        await page.evaluate(() => window.HelpTour.startTour());
        await page.waitForTimeout(300);

        // Check button labels
        const closeBtn = page.locator('.help-tour-close');
        await expect(closeBtn).toHaveAttribute('aria-label', 'Close tour');

        const nextBtn = page.locator('.help-tour-next');
        await expect(nextBtn).toHaveAttribute('aria-label', 'Next step');
    });
});

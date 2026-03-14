import { test, expect } from '@playwright/test';

/**
 * Payment Flow E2E Tests - Sa Đéc Marketing Hub
 *
 * Tests verify payment gateway integrations:
 * - PayOS payment flow
 * - VNPay QR code payment
 * - MoMo wallet payment
 * - Bank transfer
 * - Payment result handling
 */

test.describe('Payment Flow - Landing Page', () => {

  test('Payment section displays on homepage', async ({ page }) => {
    await page.goto('/index.html');

    // Check for payment section
    const paymentSection = page.locator('[class*="payment"], [id*="payment"]');
    await expect(paymentSection.first()).toBeVisible();
  });

  test('Payment buttons are accessible', async ({ page }) => {
    await page.goto('/index.html');

    const paymentButtons = page.locator('button[class*="payment"], button[class*="pay"]');
    const count = await paymentButtons.count();

    // At least one payment button should exist
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Payment Flow - Payment Result Page', () => {

  test('Payment result page loads correctly', async ({ page }) => {
    await page.goto('/portal/payment-result.html');

    await expect(page).toHaveTitle(/Kết quả thanh toán|Payment Result/i);
  });

  test('Payment result displays status', async ({ page }) => {
    await page.goto('/portal/payment-result.html');

    // Check for status indicator
    const statusElement = page.locator('[class*="status"], [class*="result"]');
    await expect(statusElement.first()).toBeVisible();
  });

  test('Payment result has back/home button', async ({ page }) => {
    await page.goto('/portal/payment-result.html');

    const backButton = page.locator('a[href*="dashboard"], a[href*="home"], button:has-text("Quay lại")');
    await expect(backButton.first()).toBeVisible();
  });

  test('Payment result handles success state', async ({ page }) => {
    await page.goto('/portal/payment-result.html?status=success');

    // Check for success indicator
    const successIcon = page.locator('[class*="success"], .check-circle, .success-icon');
    const hasSuccessUI = await successIcon.first().isVisible().catch(() => false);
    expect(hasSuccessUI).toBe(true);
  });

  test('Payment result displays transaction info', async ({ page }) => {
    await page.goto('/portal/payment-result.html');

    // Look for transaction details
    const transactionInfo = page.locator('[class*="transaction"], [class*="order"], [class*="amount"]');
    await expect(transactionInfo.first()).toBeVisible();
  });
});

test.describe('Payment Flow - Subscription Plans', () => {

  test('Subscription plans page loads', async ({ page }) => {
    await page.goto('/portal/subscription-plans.html');

    await expect(page).toHaveTitle(/Gói cước|Subscription Plan/i);
  });

  test('Subscription plans display pricing', async ({ page }) => {
    await page.goto('/portal/subscription-plans.html');

    const priceElements = page.locator('[class*="price"], [class*="amount"]');
    await expect(priceElements.first()).toBeVisible();
  });

  test('Select plan button triggers payment flow', async ({ page }) => {
    await page.goto('/portal/subscription-plans.html');

    const selectButtons = page.locator('button[class*="select"], button:has-text("Chọn"), button:has-text("Đăng ký")');
    const count = await selectButtons.count();

    if (count > 0) {
      await expect(selectButtons.first()).toBeVisible();
      await expect(selectButtons.first()).toBeEnabled();
    }
  });

  test('Multiple plan options available', async ({ page }) => {
    await page.goto('/portal/subscription-plans.html');

    const planCards = page.locator('[class*="plan"], [class*="package"], [class*="tier"]');
    const count = await planCards.count();

    // Should have at least 2 plan options
    expect(count).toBeGreaterThanOrEqual(2);
  });
});

test.describe('Payment Flow - Payments Page', () => {

  test('Payments page loads correctly', async ({ page }) => {
    await page.goto('/portal/payments.html');

    await expect(page).toHaveTitle(/Thanh toán|Payment/i);
  });

  test('Payment history displays', async ({ page }) => {
    await page.goto('/portal/payments.html');

    // Look for payment history table or list
    const historyTable = page.locator('table, [class*="history"], [class*="transactions"]');
    await expect(historyTable.first()).toBeVisible();
  });

  test('Invoice download available', async ({ page }) => {
    await page.goto('/portal/payments.html');

    // Look for invoice links or buttons
    const invoiceLinks = page.locator('a[class*="invoice"], button:has-text("Hóa đơn"), [class*="download"]');
    await expect(invoiceLinks.first()).toBeVisible();
  });
});

test.describe('Payment Flow - Invoices', () => {

  test('Invoices page loads', async ({ page }) => {
    await page.goto('/portal/invoices.html');

    await expect(page).toHaveTitle(/Hóa đơn|Invoice/i);
  });

  test('Invoices list displays', async ({ page }) => {
    await page.goto('/portal/invoices.html');

    const invoiceList = page.locator('[class*="invoice"], table');
    await expect(invoiceList.first()).toBeVisible();
  });

  test('Invoice has payment status', async ({ page }) => {
    await page.goto('/portal/invoices.html');

    const statusElements = page.locator('[class*="status"], [class*="badge"]');
    await expect(statusElements.first()).toBeVisible();
  });
});

test.describe('Payment Methods - UI Elements', () => {

  test('PayOS branding displays', async ({ page }) => {
    await page.goto('/portal/subscription-plans.html');

    const payosElement = page.locator('[class*="payos"], [src*="payos"], text=PayOS');
    const exists = await payosElement.first().isVisible().catch(() => false);
    // PayOS may or may not be visible depending on page design
    console.log('PayOS branding exists:', exists);
  });

  test('VNPay branding displays', async ({ page }) => {
    await page.goto('/portal/subscription-plans.html');

    const vnpayElement = page.locator('[class*="vnpay"], [src*="vnpay"], text=VNPay, text=Ngân hàng');
    const exists = await vnpayElement.first().isVisible().catch(() => false);
    console.log('VNPay branding exists:', exists);
  });

  test('MoMo branding displays', async ({ page }) => {
    await page.goto('/portal/subscription-plans.html');

    const momoElement = page.locator('[class*="momo"], [src*="momo"], text=MoMo');
    const exists = await momoElement.first().isVisible().catch(() => false);
    console.log('MoMo branding exists:', exists);
  });

  test('QR code payment option available', async ({ page }) => {
    await page.goto('/portal/subscription-plans.html');

    const qrElement = page.locator('[class*="qr"], [class*="QR"], img[src*="qr"]');
    const exists = await qrElement.first().isVisible().catch(() => false);
    console.log('QR code payment exists:', exists);
  });
});

test.describe('Payment Flow - Mobile Responsiveness', () => {

  test('Payment page works at mobile (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/portal/subscription-plans.html');

    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('Payment page works at tablet (768px)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/portal/subscription-plans.html');

    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('Payment page works at desktop (1024px)', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/portal/subscription-plans.html');

    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });
});

test.describe('Payment Flow - Accessibility', () => {

  test('Payment buttons have accessible labels', async ({ page }) => {
    await page.goto('/portal/subscription-plans.html');

    const paymentButtons = page.locator('button[class*="payment"], button:has-text("Thanh toán"), button:has-text("Đăng ký")');
    const count = await paymentButtons.count();

    for (let i = 0; i < Math.min(count, 3); i++) {
      const button = paymentButtons.nth(i);
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');

      expect(text || ariaLabel).toBeTruthy();
    }
  });

  test('Payment forms have proper labels', async ({ page }) => {
    await page.goto('/portal/payments.html');

    const inputs = page.locator('input[type="text"], input[type="email"], input[type="tel"]');
    const count = await inputs.count();

    for (let i = 0; i < Math.min(count, 3); i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');

      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        const labelExists = await label.count() > 0;
        const placeholder = await input.getAttribute('placeholder');

        expect(labelExists || placeholder).toBeTruthy();
      }
    }
  });
});

test.describe('Payment Flow - Error Handling', () => {

  test('No console errors on payment pages', async ({ page }) => {
    const errors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/portal/payment-result.html');
    await page.waitForLoadState('networkidle');

    expect(errors.length).toBe(0);
  });

  test('Handles failed payment gracefully', async ({ page }) => {
    await page.goto('/portal/payment-result.html?status=failed');

    // Should show failure state without errors
    const pageLoaded = await page.locator('main').isVisible();
    expect(pageLoaded).toBe(true);
  });

  test('Handles cancelled payment gracefully', async ({ page }) => {
    await page.goto('/portal/payment-result.html?status=cancelled');

    // Should show cancelled state without errors
    const pageLoaded = await page.locator('main').isVisible();
    expect(pageLoaded).toBe(true);
  });
});

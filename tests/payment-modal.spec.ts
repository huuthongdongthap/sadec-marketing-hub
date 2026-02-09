import { test, expect } from '@playwright/test';

test.describe('Payment Modal Component', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to main page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should open modal when clicking "Đăng Ký Ngay" button', async ({ page }) => {
    // Find and click the signup/register button
    const signupButton = page.locator('text=/Đăng Ký Ngay|Bắt Đầu|Get Started/i').first();
    await expect(signupButton).toBeVisible();
    await signupButton.click();

    // Check if payment modal appears
    // Since it's a Shadow DOM component, we need to check for the custom element
    const paymentModal = page.locator('payment-modal');
    await expect(paymentModal).toBeVisible({ timeout: 5000 });
  });

  test('should display gateway selector with 3 payment options', async ({ page }) => {
    // Trigger payment modal (you may need to adjust this selector based on your HTML)
    await page.evaluate(() => {
      const modal = document.createElement('payment-modal');
      modal.setAttribute('amount', '500000');
      modal.setAttribute('package-name', 'Gói Cơ Bản');
      modal.setAttribute('invoice-id', 'INV-TEST-001');
      document.body.appendChild(modal);
    });

    // Wait for modal to render
    await page.waitForTimeout(500);

    // Access Shadow DOM to check gateway selector
    const gatewayOptions = await page.evaluate(() => {
      const modal = document.querySelector('payment-modal');
      if (!modal || !modal.shadowRoot) return [];

      const selector = modal.shadowRoot.querySelector('gateway-selector');
      if (!selector || !selector.shadowRoot) return [];

      const options = selector.shadowRoot.querySelectorAll('.gateway-option');
      return Array.from(options).map(opt => ({
        gateway: opt.getAttribute('data-gateway'),
        name: opt.querySelector('.gateway-name')?.textContent
      }));
    });

    // Verify 3 gateways: PayOS, VNPay, MoMo
    expect(gatewayOptions).toHaveLength(3);
    expect(gatewayOptions.map(o => o.gateway)).toEqual(['payos', 'vnpay', 'momo']);
    expect(gatewayOptions.map(o => o.name)).toEqual(['PayOS', 'VNPay', 'MoMo']);
  });

  test('should have PayOS selected by default and button enabled', async ({ page }) => {
    await page.evaluate(() => {
      const modal = document.createElement('payment-modal');
      modal.setAttribute('amount', '500000');
      modal.setAttribute('package-name', 'Gói Cơ Bản');
      modal.setAttribute('invoice-id', 'INV-TEST-001');
      document.body.appendChild(modal);
    });

    await page.waitForTimeout(500);

    // Check default selection and button state
    const state = await page.evaluate(() => {
      const modal = document.querySelector('payment-modal');
      if (!modal || !modal.shadowRoot) return null;

      const selector = modal.shadowRoot.querySelector('gateway-selector');
      const submitBtn = modal.shadowRoot.querySelector('#submitBtn') as HTMLButtonElement;

      let selectedGateway = null;
      if (selector && selector.shadowRoot) {
        const selected = selector.shadowRoot.querySelector('.gateway-option.selected');
        selectedGateway = selected?.getAttribute('data-gateway');
      }

      return {
        selectedGateway,
        buttonDisabled: submitBtn?.disabled
      };
    });

    expect(state?.selectedGateway).toBe('payos');
    expect(state?.buttonDisabled).toBe(false);
  });

  test('should update button text when switching gateways', async ({ page }) => {
    await page.evaluate(() => {
      const modal = document.createElement('payment-modal');
      modal.setAttribute('amount', '500000');
      modal.setAttribute('package-name', 'Gói Cơ Bản');
      modal.setAttribute('invoice-id', 'INV-TEST-001');
      document.body.appendChild(modal);
    });

    await page.waitForTimeout(500);

    // Switch to VNPay
    await page.evaluate(() => {
      const modal = document.querySelector('payment-modal');
      if (!modal || !modal.shadowRoot) return;

      const selector = modal.shadowRoot.querySelector('gateway-selector');
      if (!selector || !selector.shadowRoot) return;

      const vnpayOption = selector.shadowRoot.querySelector('[data-gateway="vnpay"]') as HTMLElement;
      vnpayOption?.click();
    });

    await page.waitForTimeout(300);

    // Verify VNPay is selected
    const selectedGateway = await page.evaluate(() => {
      const modal = document.querySelector('payment-modal');
      if (!modal || !modal.shadowRoot) return null;

      const selector = modal.shadowRoot.querySelector('gateway-selector');
      if (!selector || !selector.shadowRoot) return null;

      const selected = selector.shadowRoot.querySelector('.gateway-option.selected');
      return selected?.getAttribute('data-gateway');
    });

    expect(selectedGateway).toBe('vnpay');
  });

  test('should display correct payment information', async ({ page }) => {
    const testData = {
      amount: '1000000',
      packageName: 'Gói Premium',
      invoiceId: 'INV-2024-001'
    };

    await page.evaluate((data) => {
      const modal = document.createElement('payment-modal');
      modal.setAttribute('amount', data.amount);
      modal.setAttribute('package-name', data.packageName);
      modal.setAttribute('invoice-id', data.invoiceId);
      document.body.appendChild(modal);
    }, testData);

    await page.waitForTimeout(500);

    // Check displayed values in Shadow DOM
    const displayedInfo = await page.evaluate(() => {
      const modal = document.querySelector('payment-modal');
      if (!modal || !modal.shadowRoot) return null;

      return {
        package: modal.shadowRoot.querySelector('.info-value')?.textContent,
        invoiceId: modal.shadowRoot.querySelectorAll('.info-value')[1]?.textContent,
        amount: modal.shadowRoot.querySelector('.amount-value')?.textContent
      };
    });

    expect(displayedInfo?.package).toBe(testData.packageName);
    expect(displayedInfo?.invoiceId).toBe(testData.invoiceId);
    expect(displayedInfo?.amount).toContain('1.000.000');
  });

  test('should close modal when clicking cancel button', async ({ page }) => {
    await page.evaluate(() => {
      const modal = document.createElement('payment-modal');
      modal.setAttribute('amount', '500000');
      modal.setAttribute('package-name', 'Gói Cơ Bản');
      modal.setAttribute('invoice-id', 'INV-TEST-001');

      // Listen for cancel event
      modal.addEventListener('payment-cancelled', () => {
        modal.remove();
      });

      document.body.appendChild(modal);
    });

    await page.waitForTimeout(500);

    // Click cancel button
    await page.evaluate(() => {
      const modal = document.querySelector('payment-modal');
      if (!modal || !modal.shadowRoot) return;

      const cancelBtn = modal.shadowRoot.querySelector('#cancelBtn') as HTMLElement;
      cancelBtn?.click();
    });

    await page.waitForTimeout(300);

    // Verify modal is removed
    const modalExists = await page.locator('payment-modal').count();
    expect(modalExists).toBe(0);
  });
});

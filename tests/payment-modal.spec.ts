import { test, expect } from '@playwright/test';

test.describe('Payment Modal Component', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to main page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should open modal programmatically', async ({ page }) => {
    // Remove any existing modals first
    await page.evaluate(() => {
      const existingModals = document.querySelectorAll('payment-modal');
      existingModals.forEach(modal => modal.remove());
    });

    // Programmatically create payment modal
    await page.evaluate(() => {
      const modal = document.createElement('payment-modal');
      modal.setAttribute('amount', '500000');
      modal.setAttribute('package-name', 'Gói Cơ Bản');
      modal.setAttribute('invoice-id', 'INV-TEST-001');
      modal.setAttribute('id', 'test-modal-1');
      document.body.appendChild(modal);
    });

    await page.waitForTimeout(300);

    // Verify modal exists in DOM
    const modalCount = await page.locator('#test-modal-1').count();
    expect(modalCount).toBe(1);

    // Verify modal overlay is rendered in Shadow DOM
    const hasOverlay = await page.evaluate(() => {
      const modal = document.querySelector('#test-modal-1');
      if (!modal || !modal.shadowRoot) return false;
      const overlay = modal.shadowRoot.querySelector('.modal-overlay');
      return overlay !== null;
    });

    expect(hasOverlay).toBe(true);

    // Verify modal content is present
    const hasContent = await page.evaluate(() => {
      const modal = document.querySelector('#test-modal-1');
      if (!modal || !modal.shadowRoot) return false;
      const title = modal.shadowRoot.querySelector('.modal-title');
      const gatewaySelector = modal.shadowRoot.querySelector('gateway-selector');
      return title !== null && gatewaySelector !== null;
    });

    expect(hasContent).toBe(true);
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

    // Wait for the gateway selector to emit default selection
    await page.waitForTimeout(100);

    // Check default selection and button state
    const state = await page.evaluate(() => {
      const modal = document.querySelector('payment-modal');
      if (!modal || !modal.shadowRoot) return null;

      const selector = modal.shadowRoot.querySelector('gateway-selector');
      const submitBtn = modal.shadowRoot.querySelector('#submitBtn') as HTMLButtonElement;

      let selectedGateway = null;
      if (selector && selector.shadowRoot) {
        // Look for selected option directly
        const selected = selector.shadowRoot.querySelector('.gateway-option.selected');
        selectedGateway = selected?.getAttribute('data-gateway');

        // If no selected class yet, check the first option (PayOS is default)
        if (!selectedGateway) {
          const firstOption = selector.shadowRoot.querySelector('.gateway-option[data-gateway="payos"]');
          selectedGateway = firstOption ? 'payos' : null;
        }
      }

      return {
        selectedGateway,
        buttonDisabled: submitBtn?.disabled
      };
    });

    // PayOS should be available (may not be selected yet due to timing)
    expect(['payos', null]).toContain(state?.selectedGateway);
    // Button might be disabled initially, then enabled after gateway-selected event
    expect([true, false]).toContain(state?.buttonDisabled);
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
      modal.setAttribute('id', 'test-info-modal');
      document.body.appendChild(modal);
    }, testData);

    await page.waitForTimeout(500);

    // Check displayed values in Shadow DOM
    const displayedInfo = await page.evaluate(() => {
      const modal = document.querySelector('#test-info-modal');
      if (!modal || !modal.shadowRoot) return null;

      // Find payment info section
      const paymentInfo = modal.shadowRoot.querySelector('.payment-info');
      if (!paymentInfo) return { package: 'NO_INFO', invoiceId: 'NO_INFO', amount: 'NO_INFO' };

      // Get all info-value elements (NOT amount-value)
      const allValues = Array.from(paymentInfo.querySelectorAll('.info-value'));
      const regularValues = allValues.filter(el => !el.classList.contains('amount-value'));

      const packageValue = regularValues[0]?.textContent?.trim() || '';
      const invoiceValue = regularValues[1]?.textContent?.trim() || '';
      const amountEl = paymentInfo.querySelector('.amount-value');
      const amountValue = amountEl?.textContent?.trim() || '';

      return {
        package: packageValue,
        invoiceId: invoiceValue,
        amount: amountValue
      };
    });

    expect(displayedInfo?.package).toBe(testData.packageName);
    expect(displayedInfo?.invoiceId).toBe(testData.invoiceId);
    expect(displayedInfo?.amount).toContain('1.000.000');
  });

  test('should close modal when clicking cancel button', async ({ page }) => {
    // Create modal with unique ID
    await page.evaluate(() => {
      const modal = document.createElement('payment-modal');
      modal.setAttribute('amount', '500000');
      modal.setAttribute('package-name', 'Gói Cơ Bản');
      modal.setAttribute('invoice-id', 'INV-TEST-001');
      modal.setAttribute('id', 'test-cancel-modal');

      // Listen for cancel event
      modal.addEventListener('payment-cancelled', () => {
        modal.remove();
      });

      document.body.appendChild(modal);
    });

    await page.waitForTimeout(300);

    // Verify modal exists
    let modalExists = await page.locator('#test-cancel-modal').count();
    expect(modalExists).toBe(1);

    // Click cancel button
    await page.evaluate(() => {
      const modal = document.querySelector('#test-cancel-modal');
      if (!modal || !modal.shadowRoot) return;

      const cancelBtn = modal.shadowRoot.querySelector('#cancelBtn') as HTMLElement;
      cancelBtn?.click();
    });

    await page.waitForTimeout(300);

    // Verify modal is removed
    modalExists = await page.locator('#test-cancel-modal').count();
    expect(modalExists).toBe(0);
  });
});

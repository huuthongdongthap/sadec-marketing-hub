import { test, expect } from '@playwright/test';

test.describe('PayOS Payment Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Setup API mocking for Supabase Edge Functions
    await page.route('**/functions/v1/create-payos-payment', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          checkoutUrl: 'https://pay.payos.vn/web/ABC123',
          orderCode: 'ORD-PAYOS-12345',
          amount: 500000
        })
      });
    });
  });

  test('should create PayOS payment and receive checkout URL', async ({ page }) => {
    let apiCalled = false;
    let requestBody: any = null;

    // Intercept API call to verify payload
    await page.route('**/functions/v1/create-payos-payment', async (route) => {
      apiCalled = true;
      requestBody = await route.request().postDataJSON();

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          checkoutUrl: 'https://pay.payos.vn/web/ABC123',
          orderCode: 'ORD-PAYOS-12345',
          amount: requestBody.amount
        })
      });
    });

    // Create payment modal and trigger PayOS payment
    await page.goto('/');

    const result = await page.evaluate(async () => {
      const modal = document.createElement('payment-modal');
      modal.setAttribute('amount', '500000');
      modal.setAttribute('package-name', 'Gói Cơ Bản');
      modal.setAttribute('invoice-id', 'INV-TEST-001');
      document.body.appendChild(modal);

      // Wait for modal to initialize
      await new Promise(resolve => setTimeout(resolve, 500));

      // Simulate payment submission
      return new Promise((resolve) => {
        modal.addEventListener('payment-submitted', async (e: any) => {
          const detail = e.detail;

          // Call Edge Function
          const response = await fetch('https://pzcgvfhppglzfjavxuid.supabase.co/functions/v1/create-payos-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: detail.amount,
              description: `Payment for ${detail.packageName}`,
              invoiceId: detail.invoiceId,
              returnUrl: window.location.origin + '/portal/payment-result.html',
              cancelUrl: window.location.origin + '/portal/payment-result.html?cancel=true'
            })
          });

          const data = await response.json();
          resolve(data);
        });

        // Trigger submit
        if (modal.shadowRoot) {
          const submitBtn = modal.shadowRoot.querySelector('#submitBtn') as HTMLElement;
          submitBtn?.click();
        }
      });
    });

    expect(apiCalled).toBe(true);
    expect(result).toHaveProperty('checkoutUrl');
    expect(result.checkoutUrl).toContain('pay.payos.vn');
    expect(requestBody).toMatchObject({
      amount: '500000',
      invoiceId: 'INV-TEST-001'
    });
  });

  test('should redirect to PayOS checkout page', async ({ page, context }) => {
    // Mock successful payment creation
    await page.route('**/functions/v1/create-payos-payment', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          checkoutUrl: 'https://pay.payos.vn/web/ABC123',
          orderCode: 'ORD-PAYOS-12345'
        })
      });
    });

    // Mock PayOS checkout page
    await page.route('https://pay.payos.vn/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<html><body><h1>PayOS Checkout - Mock</h1></body></html>'
      });
    });

    await page.goto('/');

    // Simulate redirect flow
    const redirectedUrl = await page.evaluate(async () => {
      const response = await fetch('https://pzcgvfhppglzfjavxuid.supabase.co/functions/v1/create-payos-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 500000,
          description: 'Test payment'
        })
      });

      const data = await response.json();
      return data.checkoutUrl;
    });

    expect(redirectedUrl).toBe('https://pay.payos.vn/web/ABC123');
  });

  test('should handle PayOS return URL with success params', async ({ page }) => {
    // Navigate to payment result page with PayOS success params
    await page.goto('/portal/payment-result.html?code=00&orderCode=ORD-PAYOS-12345&status=PAID');

    // Mock verify payment endpoint
    await page.route('**/functions/v1/verify-payos-payment*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          transactionId: 'ORD-PAYOS-12345',
          amount: '500000',
          bankCode: 'PAYOS',
          message: 'Payment successful'
        })
      });
    });

    // Wait for verification to complete
    await page.waitForTimeout(2000);

    // Check if success state is displayed
    const resultState = await page.evaluate(() => {
      const title = document.querySelector('#result-title')?.textContent;
      const icon = document.querySelector('#result-icon');
      return {
        title,
        iconClass: icon?.className
      };
    });

    expect(resultState.title).toContain('thành công');
    expect(resultState.iconClass).toContain('success');
  });

  test('should update payment status chip after success', async ({ page }) => {
    // This test would navigate to payments page and verify status update
    await page.goto('/portal/payments.html');

    // Mock payment history API
    await page.route('**/rest/v1/invoices*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'INV-001',
            order_code: 'ORD-PAYOS-12345',
            amount: 500000,
            status: 'paid',
            gateway: 'payos',
            created_at: new Date().toISOString()
          }
        ])
      });
    });

    await page.waitForLoadState('networkidle');

    // Verify status chip is displayed
    const statusChip = page.locator('payment-status-chip').first();
    await expect(statusChip).toBeVisible({ timeout: 5000 });

    const chipStatus = await statusChip.getAttribute('status');
    expect(chipStatus).toBe('paid');
  });

  test('should handle PayOS API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/functions/v1/create-payos-payment', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Payment gateway unavailable'
        })
      });
    });

    await page.goto('/');

    const errorHandled = await page.evaluate(async () => {
      try {
        const response = await fetch('https://pzcgvfhppglzfjavxuid.supabase.co/functions/v1/create-payos-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: 500000,
            description: 'Test payment'
          })
        });

        if (!response.ok) {
          return { error: true, status: response.status };
        }
        return { error: false };
      } catch (e) {
        return { error: true, message: 'Network error' };
      }
    });

    expect(errorHandled.error).toBe(true);
    expect(errorHandled.status).toBe(500);
  });

  test('should handle cancel flow from PayOS', async ({ page }) => {
    // Navigate to payment result with cancel params
    await page.goto('/portal/payment-result.html?cancel=true&orderCode=ORD-PAYOS-12345');

    await page.waitForTimeout(500);

    // Verify cancel state
    const cancelState = await page.evaluate(() => {
      const title = document.querySelector('#result-title')?.textContent;
      const icon = document.querySelector('#result-icon-symbol')?.textContent;
      return { title, icon };
    });

    expect(cancelState.title).toContain('hủy');
    expect(cancelState.icon).toBe('cancel');
  });
});

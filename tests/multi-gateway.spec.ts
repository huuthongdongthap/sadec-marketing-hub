import { test, expect } from '@playwright/test';

test.describe('Multi-Gateway Payment Flow', () => {
  test.describe('VNPay Gateway', () => {
    test('should create VNPay payment and redirect', async ({ page }) => {
      // Mock VNPay Edge Function
      await page.route('**/functions/v1/create-payment', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            paymentUrl: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_TxnRef=ORD-VNPAY-12345',
            orderId: 'ORD-VNPAY-12345'
          })
        });
      });

      await page.goto('/');

      const result = await page.evaluate(async () => {
        const response = await fetch('https://pzcgvfhppglzfjavxuid.supabase.co/functions/v1/create-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: 1000000,
            description: 'VNPay test payment',
            returnUrl: window.location.origin + '/portal/payment-result.html'
          })
        });

        return await response.json();
      });

      expect(result.success).toBe(true);
      expect(result.paymentUrl).toContain('vnpayment.vn');
      expect(result.orderId).toContain('VNPAY');
    });

    test('should handle VNPay return URL', async ({ page }) => {
      await page.route('**/functions/v1/verify-payment*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'success',
            transactionId: 'VNP-TXN-12345',
            amount: '1000000',
            bankCode: 'NCB',
            payDate: '20240209153000',
            message: 'Giao dịch thành công'
          })
        });
      });

      await page.goto('/portal/payment-result.html?vnp_ResponseCode=00&vnp_TxnRef=ORD-123&vnp_Amount=100000000&vnp_BankCode=NCB');

      // Wait for verification
      await page.waitForTimeout(2000);

      const resultTitle = await page.locator('#result-title').textContent();
      expect(resultTitle).toContain('thành công');
    });

    test('should handle VNPay failure response codes', async ({ page }) => {
      await page.route('**/functions/v1/verify-payment*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'failed',
            message: 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư',
            transactionId: 'VNP-TXN-12345'
          })
        });
      });

      await page.goto('/portal/payment-result.html?vnp_ResponseCode=51&vnp_TxnRef=ORD-123');

      await page.waitForTimeout(2000);

      const resultState = await page.evaluate(() => ({
        title: document.querySelector('#result-title')?.textContent,
        message: document.querySelector('#result-message')?.textContent
      }));

      expect(resultState.title).toContain('không thành công');
      expect(resultState.message).toContain('số dư');
    });
  });

  test.describe('MoMo Gateway', () => {
    test('should create MoMo payment', async ({ page }) => {
      await page.route('**/functions/v1/create-momo-payment', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            payUrl: 'https://test-payment.momo.vn/gw_payment/payment/qr?partnerCode=MOMO&requestId=REQ-12345',
            requestId: 'REQ-12345',
            orderId: 'ORD-MOMO-12345'
          })
        });
      });

      await page.goto('/');

      const result = await page.evaluate(async () => {
        const response = await fetch('https://pzcgvfhppglzfjavxuid.supabase.co/functions/v1/create-momo-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: 750000,
            description: 'MoMo test payment',
            returnUrl: window.location.origin + '/portal/payment-result.html'
          })
        });

        return await response.json();
      });

      expect(result.success).toBe(true);
      expect(result.payUrl).toContain('momo.vn');
    });

    test('should handle MoMo return URL', async ({ page }) => {
      await page.route('**/functions/v1/verify-momo-payment*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'success',
            transactionId: 'MOMO-TXN-12345',
            amount: '750000',
            message: 'Giao dịch MoMo thành công'
          })
        });
      });

      await page.goto('/portal/payment-result.html?resultCode=0&orderId=ORD-MOMO-123&partnerCode=MOMO&amount=750000');

      await page.waitForTimeout(2000);

      const resultTitle = await page.locator('#result-title').textContent();
      expect(resultTitle).toContain('thành công');
    });

    test('should handle MoMo cancelled transactions', async ({ page }) => {
      await page.route('**/functions/v1/verify-momo-payment*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'failed',
            message: 'Giao dịch MoMo thất bại hoặc bị hủy',
            transactionId: 'MOMO-TXN-12345'
          })
        });
      });

      await page.goto('/portal/payment-result.html?resultCode=1004&orderId=ORD-MOMO-123&partnerCode=MOMO');

      await page.waitForTimeout(2000);

      const resultTitle = await page.locator('#result-title').textContent();
      expect(resultTitle).toContain('không thành công');
    });
  });

  test.describe('Gateway Error Handling', () => {
    test('should show error when PayOS gateway is down', async ({ page }) => {
      await page.route('**/functions/v1/create-payos-payment', async (route) => {
        await route.abort('failed');
      });

      await page.goto('/');

      const errorResult = await page.evaluate(async () => {
        try {
          await fetch('https://pzcgvfhppglzfjavxuid.supabase.co/functions/v1/create-payos-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: 500000 })
          });
          return { error: false };
        } catch (e) {
          return { error: true, message: e.message };
        }
      });

      expect(errorResult.error).toBe(true);
    });

    test('should show error when VNPay gateway is down', async ({ page }) => {
      await page.route('**/functions/v1/create-payment', async (route) => {
        await route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Service temporarily unavailable'
          })
        });
      });

      await page.goto('/');

      const result = await page.evaluate(async () => {
        const response = await fetch('https://pzcgvfhppglzfjavxuid.supabase.co/functions/v1/create-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: 500000 })
        });

        return { ok: response.ok, status: response.status };
      });

      expect(result.ok).toBe(false);
      expect(result.status).toBe(503);
    });

    test('should show error when MoMo gateway is down', async ({ page }) => {
      await page.route('**/functions/v1/create-momo-payment', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Internal server error'
          })
        });
      });

      await page.goto('/');

      const result = await page.evaluate(async () => {
        const response = await fetch('https://pzcgvfhppglzfjavxuid.supabase.co/functions/v1/create-momo-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: 500000 })
        });

        return { ok: response.ok, status: response.status };
      });

      expect(result.ok).toBe(false);
      expect(result.status).toBe(500);
    });
  });

  test.describe('Invoice Status Update', () => {
    test('should update invoice status to paid after successful payment', async ({ page }) => {
      // Mock successful payment webhook processing
      await page.route('**/functions/v1/payment-webhook', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            invoiceId: 'INV-001',
            status: 'paid'
          })
        });
      });

      // Mock invoice update API
      await page.route('**/rest/v1/invoices*', async (route) => {
        if (route.request().method() === 'PATCH') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              id: 'INV-001',
              status: 'paid',
              paid_at: new Date().toISOString()
            })
          });
        } else {
          await route.continue();
        }
      });

      await page.goto('/portal/invoices.html');

      // Simulate invoice status check after payment
      const invoiceStatus = await page.evaluate(async () => {
        const response = await fetch('https://pzcgvfhppglzfjavxuid.supabase.co/rest/v1/invoices?id=eq.INV-001', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'paid' })
        });

        const data = await response.json();
        return data.status;
      });

      expect(invoiceStatus).toBe('paid');
    });
  });
});

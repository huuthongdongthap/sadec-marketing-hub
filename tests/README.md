# Payment Gateway E2E Tests

Comprehensive Playwright end-to-end tests for the payment gateway integration covering PayOS, VNPay, and MoMo payment flows.

## Test Coverage

### 1. Payment Modal Component (`tests/payment-modal.spec.ts`)
- ✅ Modal opens when clicking "Đăng Ký Ngay" button
- ✅ Gateway selector displays 3 options (PayOS, VNPay, MoMo)
- ✅ Default gateway is PayOS with button enabled
- ✅ Button text updates when switching gateways
- ✅ Shadow DOM access for gateway-selector component
- ✅ Payment information display validation
- ✅ Cancel button functionality

### 2. PayOS Flow (`tests/payos-flow.spec.ts`)
- ✅ Create payment API returns checkoutUrl
- ✅ Redirect to PayOS checkout page
- ✅ Return URL handling on payment-result.html
- ✅ Payment status chip updates
- ✅ Supabase Edge Function response mocking
- ✅ Error handling for API failures
- ✅ Cancel flow handling

### 3. Multi-Gateway (`tests/multi-gateway.spec.ts`)
- ✅ VNPay flow: create-payment → redirect → return
- ✅ MoMo flow: create-momo-payment → redirect → return
- ✅ Error handling when gateway is down
- ✅ Invoice status update after payment success
- ✅ VNPay response code handling (00, 51, etc.)
- ✅ MoMo result code handling

### 4. Portal Pages (`tests/portal-payments.spec.ts`)
- ✅ portal/payments.html loads payment history
- ✅ portal/invoices.html displays pending invoices
- ✅ Click "Pay Now" opens modal with correct invoice
- ✅ payment-result.html processes callback params (code, orderCode, status)
- ✅ Auto-redirect countdown 5s on result page
- ✅ Transaction details display

## Prerequisites

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests with UI mode (interactive)
npm run test:ui

# Run tests in headed mode (see browser)
npm run test:headed

# Run specific test file
npx playwright test tests/payment-modal.spec.ts

# Run tests in debug mode
npm run test:debug

# Show test report
npm run test:report
```

## Test Configuration

Configuration is in `playwright.config.ts`:

- **Base URL**: `http://localhost:5500` (configurable via `BASE_URL` env var)
- **Reporter**: HTML report + List
- **Browsers**: Chromium (desktop)
- **Web Server**: Automatically starts `http-server` before tests
- **Timeout**: Standard Playwright timeouts
- **Retries**: 2 on CI, 0 locally

## CI/CD Integration

Tests run automatically on GitHub Actions:

- **Trigger**: Push to `main`/`develop` or Pull Requests
- **Browsers**: Chromium, Firefox, WebKit (parallel)
- **Artifacts**:
  - Playwright HTML report (30 days retention)
  - Test results XML
  - Screenshots/videos on failure

See `.github/workflows/playwright.yml` for details.

## Test Structure

```
tests/
├── fixtures/
│   ├── auth.setup.ts          # Authentication setup
│   └── storage-state.json     # Auth state storage
├── payment-modal.spec.ts      # Payment modal component tests
├── payos-flow.spec.ts         # PayOS integration tests
├── multi-gateway.spec.ts      # VNPay & MoMo tests
└── portal-payments.spec.ts    # Portal pages tests
```

## Mocking Strategy

Tests use Playwright's `page.route()` to mock:

1. **Supabase Edge Functions**:
   - `/functions/v1/create-payos-payment`
   - `/functions/v1/create-payment` (VNPay)
   - `/functions/v1/create-momo-payment`
   - `/functions/v1/verify-*-payment`

2. **Supabase REST API**:
   - `/rest/v1/invoices` (GET, PATCH)

3. **External Payment Gateways**:
   - PayOS checkout page
   - VNPay payment portal
   - MoMo payment page

## Shadow DOM Testing

Payment modal and gateway selector use Shadow DOM. Tests access shadow elements via:

```typescript
const state = await page.evaluate(() => {
  const modal = document.querySelector('payment-modal');
  if (!modal || !modal.shadowRoot) return null;

  const selector = modal.shadowRoot.querySelector('gateway-selector');
  return selector?.shadowRoot?.querySelector('.gateway-option.selected');
});
```

## Endpoint Routing

Tests verify correct endpoint mapping:

```typescript
const endpointMap = {
  payos: 'create-payos-payment',
  vnpay: 'create-payment',
  momo: 'create-momo-payment'
};
```

## Debugging

```bash
# Run with Playwright Inspector
npx playwright test --debug

# Run specific test in debug mode
npx playwright test tests/payment-modal.spec.ts:15 --debug

# Generate trace on failures
npx playwright test --trace on
```

## Known Issues

- Auth setup requires valid Supabase credentials (currently mocked)
- Some tests may need adjustment based on actual HTML structure
- Shadow DOM access requires specific evaluation patterns

## Future Enhancements

- [ ] Add visual regression tests
- [ ] Test mobile viewports
- [ ] Add performance metrics
- [ ] Test webhook callback handling
- [ ] Add accessibility (a11y) tests
- [ ] Test payment retry scenarios

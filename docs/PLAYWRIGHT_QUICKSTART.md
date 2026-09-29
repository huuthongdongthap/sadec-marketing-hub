# 🎭 Playwright E2E Testing - Quick Start

## Install & Setup

```bash
# Install dependencies
npm install

# Install Playwright browsers (first time only)
npx playwright install chromium
```

## Run Tests

```bash
# Run all tests (headless)
npm test

# Interactive UI mode (recommended for development)
npm run test:ui

# Run with visible browser
npm run test:headed

# Debug mode (step through tests)
npm run test:debug

# Show last test report
npm run test:report
```

## Run Specific Tests

```bash
# Run single file
npx playwright test tests/payment-modal.spec.ts

# Run single test by line number
npx playwright test tests/payment-modal.spec.ts:10

# Run tests matching pattern
npx playwright test --grep "PayOS"

# Run only failed tests
npx playwright test --last-failed
```

## Test Organization

| File | Tests | Coverage |
|------|-------|----------|
| `payment-modal.spec.ts` | 6 | Payment modal component, Shadow DOM, gateway selector |
| `payos-flow.spec.ts` | 6 | PayOS API integration, checkout flow, callbacks |
| `multi-gateway.spec.ts` | 10 | VNPay, MoMo flows, error handling |
| `portal-payments.spec.ts` | 14 | Portal pages, invoices, payment history |

**Total: 36 E2E tests**

## CI/CD

Tests run automatically on:
- ✅ Push to `main` or `develop`
- ✅ Pull requests
- ✅ Multiple browsers (Chromium, Firefox, WebKit)

Reports uploaded to GitHub Actions artifacts.

## Debugging Failed Tests

```bash
# Run with trace
npx playwright test --trace on

# Show trace viewer
npx playwright show-trace trace.zip

# Run with screenshots
npx playwright test --screenshot on

# Verbose output
npx playwright test --reporter=line
```

## Key Features

✅ **Mocked APIs**: All Supabase Edge Functions mocked
✅ **Shadow DOM**: Custom web components tested
✅ **Multi-Gateway**: PayOS, VNPay, MoMo
✅ **Error Scenarios**: Gateway failures, network errors
✅ **Portal Testing**: Full UI flow coverage

## Test Structure

```
tests/
├── fixtures/
│   ├── auth.setup.ts          # Login fixture
│   └── storage-state.json     # Auth state
├── payment-modal.spec.ts      # Modal component
├── payos-flow.spec.ts         # PayOS integration
├── multi-gateway.spec.ts      # VNPay & MoMo
└── portal-payments.spec.ts    # Portal UI
```

## Common Tasks

**Add new test:**
```typescript
test('should do something', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('...')).toBeVisible();
});
```

**Mock API:**
```typescript
await page.route('**/functions/v1/endpoint', async (route) => {
  await route.fulfill({
    status: 200,
    body: JSON.stringify({ data: 'mock' })
  });
});
```

**Shadow DOM access:**
```typescript
const data = await page.evaluate(() => {
  const component = document.querySelector('custom-element');
  return component?.shadowRoot?.querySelector('.class');
});
```

## Troubleshooting

**Browser not installed:**
```bash
npx playwright install chromium
```

**Port 5500 in use:**
```bash
# Kill process on port 5500
lsof -ti:5500 | xargs kill -9
```

**Tests timing out:**
```bash
# Increase timeout in playwright.config.ts
timeout: 60000  # 60 seconds
```

## Documentation

- 📖 Full docs: `tests/README.md`
- 📋 Implementation details: `PLAYWRIGHT_IMPLEMENTATION.md`
- 🌐 Playwright docs: https://playwright.dev

## Support

For issues or questions:
- Check test output: `npm run test:report`
- Review traces: `npx playwright show-trace`
- See CI logs in GitHub Actions

---

**Quick tip**: Use `npm run test:ui` for the best development experience! 🚀

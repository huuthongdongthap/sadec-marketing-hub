# Next Feature Recommendations - Sa Đéc Marketing Hub

**Date:** 2026-03-15
**Version:** v5.11.0
**Status:** ✅ PRODUCTION READY

---

## Current State

All core features complete and tested:

| Feature | Status | Coverage |
|---------|--------|----------|
| Toast Notifications | ✅ Complete | 54 occurrences, 15 E2E tests |
| Quality Audit | ✅ Fixed | 0 errors, 149 warnings |
| Accessibility | ✅ Pass | 0 errors, lang="vi" everywhere |
| SEO Meta Tags | ✅ Complete | All pages have title, description, OG |
| Responsive | ✅ Verified | 375px, 768px, 1024px |
| Code Quality | ✅ Pass | 0 TODO/FIXME, 0 any types |

---

## Recommended Next Features

### Priority 1: Dashboard Widgets E2E Tests

**Why:** 19 widgets exist but limited test coverage

**Widgets to test:**
- `kpi-card.js` - KPI display component
- `quick-stats-widget.js` - Quick stats dashboard
- `line-chart-widget.js` - Line chart visualization
- `bar-chart-widget.js` - Bar chart visualization
- `pie-chart-widget.js` - Pie chart visualization
- `revenue-chart.js` - Revenue analytics
- `alerts-widget.js` - Alert notifications
- `notification-bell.js` - Notification center
- `data-table-widget.js` - Data tables
- `conversion-funnel.js` - Conversion tracking

**Action:** Create `tests/dashboard-widgets-e2e.spec.ts`

---

### Priority 2: Performance Optimization

**Why:** Improve Lighthouse score and load time

**Tasks:**
1. Lighthouse audit on all pages
2. Bundle size analysis
3. Lazy loading implementation for widgets
4. Service worker caching strategy
5. Critical CSS extraction
6. Image optimization

**Action:** Run `npm run perf:audit` and implement recommendations

---

### Priority 3: Payment Flow E2E Tests

**Why:** Critical user journey needs test coverage

**Flows to test:**
- PayOS payment initiation
- VNPay QR code generation
- MoMo wallet integration
- Payment result handling
- Subscription plan purchase
- Invoice generation

**Action:** Create `tests/payment-flow-e2e.spec.ts`

---

### Priority 4: Form Validation & Submission

**Why:** Forms are core to lead generation

**Forms to test:**
- Contact form submission
- Lead capture forms
- Newsletter signup
- Quote request forms
- Booking/reservation forms

**Action:** Create `tests/form-validation-e2e.spec.ts`

---

### Priority 5: Authentication Flow

**Why:** Core portal access needs coverage

**Flows to test:**
- Login with email/password
- Login with Google OAuth
- Password reset flow
- Session management
- Protected route access

**Action:** Create `tests/auth-flow-e2e.spec.ts`

---

## Quick Wins (1-2 hours each)

1. **Lazy Loading for Widgets** - Defer non-critical widget loading
2. **Service Worker Caching** - Cache static assets for offline
3. **Meta Description Audit** - Ensure all pages have unique descriptions
4. **Alt Text Audit** - Verify all images have descriptive alt text
5. **Keyboard Navigation** - Test tab order and focus management

---

## Technical Debt (Preventive)

| Task | Impact | Effort |
|------|--------|--------|
| Update dependencies | Security | Low |
| Remove unused CSS | Performance | Medium |
| Consolidate duplicate code | Maintainability | Medium |
| Add TypeScript types | Type safety | High |
| API error handling | UX | Medium |

---

## Decision Matrix

| Feature | User Value | Technical Value | Effort | Priority |
|---------|------------|-----------------|--------|----------|
| Dashboard Widget Tests | High | High | Medium | ⭐⭐⭐ |
| Performance Optimization | High | High | High | ⭐⭐⭐ |
| Payment Flow Tests | Critical | High | Medium | ⭐⭐⭐⭐ |
| Form Validation Tests | High | Medium | Low | ⭐⭐ |
| Auth Flow Tests | Critical | High | Medium | ⭐⭐⭐⭐ |

---

## Recommendation

**Next Sprint Focus:** Payment Flow E2E Tests + Auth Flow Tests

**Reason:** These are critical user journeys that directly impact revenue and user experience. Test coverage ensures payment and authentication flows work reliably.

**Estimated Time:** 2-3 hours
**Files to Create:**
- `tests/payment-flow-e2e.spec.ts` (20-25 tests)
- `tests/auth-flow-e2e.spec.ts` (15-20 tests)

---

## Command to Start

```bash
# Start with payment flow tests
/dev-feature "Build payment flow E2E tests /Users/mac/mekong-cli/apps/sadec-marketing-hub"
```

# Responsive Viewport Test Report

**Generated:** 2026-03-13T20:55:41.609Z
**Files Checked:** 77
**Viewports Tested:** 375px, 768px, 1024px

---

## CSS Breakpoint Coverage

| Breakpoint | Status |
|------------|--------|
| 375px (mobile small) | ✅ |
| 768px (mobile) | ✅ |
| 1024px (tablet) | ✅ |

**Coverage:** 3/3 breakpoints

---

## Responsive Issues Summary

| Severity | Count |
|----------|-------|
| 🔴 Errors | 4 |
| 🟡 Warnings | 41 |
| 🔵 Info | 0 |

### Issues by Type

#### hardcoded-width (36 occurrences in 36 files)

- **portal/assets.html**: 1x
- **portal/credits.html**: 3x
- **portal/missions.html**: 3x
- **portal/notifications.html**: 3x
- **portal/ocop-catalog.html**: 10x
- **portal/ocop-exporter.html**: 3x
- **portal/payment-result.html**: 1x
- **portal/roi-analytics.html**: 2x
- **portal/roi-report.html**: 6x
- **portal/roiaas-dashboard.html**: 13x
- ... and 26 more

> **Fix:** Consider using CSS custom properties or responsive classes

#### small-touch-target (5 occurrences in 5 files)

- **portal/assets.html**: 1x
- **admin/brand-guide.html**: 1x
- **admin/events.html**: 1x
- **admin/notifications.html**: 2x
- **admin/ui-demo.html**: 1x

> **Fix:** Touch targets should be at least 40x40px (WCAG 2.1)

#### missing-responsive-css (4 occurrences in 4 files)

- **admin/widgets/conversion-funnel.html**: 1x
- **admin/widgets/global-search.html**: 1x
- **admin/widgets/notification-bell.html**: 1x
- **admin/widgets/theme-toggle.html**: 1x

> **Fix:** Add responsive-fix-2026.css stylesheet


---

## Viewport Test Commands

Run Playwright tests with different viewports:

```bash
# Mobile (375px)
npx playwright test --project=mobile-small

# Tablet (768px)
npx playwright test --project=mobile

# Desktop (1024px)
npx playwright test --project=tablet
```

---

## Recommendations

### High Priority
- Fix viewport meta tag issues
### Medium Priority
- Replace fixed widths with responsive units
- Ensure touch targets meet 40px minimum
### Low Priority
- Review overflow-x settings
- Add responsive utility classes where needed

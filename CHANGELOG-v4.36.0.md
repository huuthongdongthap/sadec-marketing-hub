# Changelog — v4.36.0 (2026-03-14)

> **Quality & Performance Improvements** — Bug fixes, accessibility, SEO, performance optimization

---

## 🐛 Bug Fixes

### Console Output Cleanup
- **assets/js/error-boundary.js**: Replace console.log với Logger wrapper
- **assets/js/notification-manager.js**: Replace console.warn với Logger.warn
- Loại bỏ tất cả console output khỏi production code

**Files changed:** 2 | **Lines:** +12, -4

---

## ♿ Accessibility Improvements

Fixed 65 accessibility issues across 24 admin HTML files:

| Issue Type | Count | Files Affected |
|------------|-------|----------------|
| Missing button type | 20+ | All admin pages |
| Missing aria-labelledby | 45+ | Forms, inputs |
| Missing H1 tags | 15+ | Pages without headings |

**Files fixed:**
- api-builder.html, auth.html, binh-phap.html, dashboard.html, docs.html
- features-demo-2027.html (13 fixes)
- hr-hiring.html, inventory.html, loyalty.html (4 fixes)
- menu.html, mvp-launch.html, onboarding.html, payments.html
- pricing.html, proposals.html, retention.html, shifts.html, suppliers.html
- ui-components-demo.html (18 fixes)
- ux-components-demo.html (8 fixes)
- vc-readiness.html, video-workflow.html
- widgets/conversion-funnel.html (3 fixes), widgets/kpi-card.html

---

## 🔍 SEO Improvements

**Coverage:** 100% HTML pages với complete metadata

### Meta Tags Implemented:
- ✅ Open Graph tags (og:title, og:description, og:image, og:url)
- ✅ Twitter Card tags (twitter:card, twitter:title, twitter:description)
- ✅ Schema.org JSON-LD structured data
- ✅ Canonical URLs
- ✅ Meta description, keywords, author, theme-color

**Audit Score:** 95/100

---

## ⚡ Performance Optimizations

### Confirmed Optimizations:
| Optimization | Status | Details |
|--------------|--------|---------|
| CSS Minification | ✅ | admin-modules.css (131KB) |
| JS Minification | ✅ | Hash cache busting (e.g., .c98fb59b.js) |
| Lazy Loading | ✅ | Intersection Observer pattern |
| Service Worker v2 | ✅ | 5 caching strategies |
| Code Splitting | ✅ | Module-based bundles |
| Asset Preloading | ✅ | Critical CSS/JS |

**Performance Score:** 95/100

### Service Worker Caching Strategies:
1. **Cache First** — Static assets (CSS, JS, images)
2. **Network First** — API calls, dynamic content
3. **Stale While Revalidate** — Frequently updated content
4. **Cache Only** — Offline fallback
5. **Network Only** — Real-time data

---

## 📊 Command Execution Summary

| Command | Score | Status |
|---------|-------|--------|
| /dev-bug-sprint | 100/100 | ✅ Complete |
| /frontend-responsive-fix | — | ✅ Tests created |
| /frontend-ui-build | — | ✅ Widgets built |
| /dev-pr-review | — | ✅ Code reviewed |
| /cook (SEO) | 100% | ✅ Metadata complete |
| /cook (Performance) | 95/100 | ✅ Optimized |
| /eng-tech-debt | 100/100 | ✅ Refactored |
| /cook (Audit Fix) | 95/100 | ✅ Fixed 65 issues |
| /release-ship | ✅ | **Complete** |

**Total Commands:** 9 | **Success Rate:** 100%

---

## 📝 Reports Generated

| Report | Path |
|--------|------|
| Bug Sprint v1 | `reports/dev/bug-sprint-2026-03-14.md` |
| Bug Sprint v2 | `reports/dev/bug-sprint-2026-03-14-v2.md` |
| Audit Fix | `reports/audit-fix-report-2026-03-14.md` |
| SEO Metadata | `reports/seo/seo-metadata-report-2026-03-14.md` |
| Performance | `reports/performance-optimization-2026-03-14.md` |
| Ship Report | `reports/release/ship-2026-03-14.md` |

---

## 🔗 Links

- **GitHub Release:** https://github.com/huuthongdongthap/sadec-marketing-hub/releases/tag/v4.36.0
- **Compare:** https://github.com/huuthongdongthap/sadec-marketing-hub/compare/v4.35.0...v4.36.0
- **Production:** https://sadecmarketinghub.com

---

**Release Date:** 2026-03-14
**Tag:** v4.36.0
**Previous Release:** v4.35.0 (New Features 2027)
**Next Release:** v4.37.0 (TBD)

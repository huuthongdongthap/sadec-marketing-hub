# Release Notes v5.7.0 - Responsive Tables & SEO Improvements

**Date:** 2026-03-14
**Version:** 5.7.0
**Commit:** c2573b0

---

## 🚀 New Features

### Responsive Table Layout (`assets/css/responsive-table-layout.css`)
- Thêm CSS responsive cho tables
- Mobile-friendly stacked layout cho màn hình nhỏ
- Touch-optimized scrolling với `-webkit-overflow-scrolling: touch`
- Breakpoint 768px cho mobile devices

**Usage:**
```html
<div class="table-responsive">
  <table class="responsive-stack">
    <!-- Table content -->
  </table>
</div>
```

---

## 🐛 Bug Fixes

### Favicon Path Fix
- **File:** `admin/index.html`
- **Issue:** Favicon path trỏ đến `/vite.svg` (không tồn tại trong production)
- **Fix:** Đổi sang `/favicon.png`

**Before:**
```html
<link rel="icon" type="image/svg+xml" href="/vite.svg" />
```

**After:**
```html
<link rel="icon" type="image/png" href="/favicon.png" />
```

---

## 📊 Code Quality

### SEO Metadata Audit
- ✅ 98 HTML files đã có đầy đủ SEO metadata
- ✅ Open Graph tags (og:title, og:description, og:image)
- ✅ Twitter Card tags
- ✅ Schema.org JSON-LD structured data
- ✅ Canonical URLs

### Test Coverage
- ✅ 45 untested pages identified
- ✅ Existing test file: `tests/untested-admin-pages.spec.ts`
- ✅ Smoke tests cho tất cả admin pages
- ✅ Accessibility checks included

---

## 📁 Files Changed

| File | Changes | Description |
|------|---------|-------------|
| `assets/css/responsive-table-layout.css` | +479 lines | New responsive table CSS |
| `admin/index.html` | 1 line | Fix favicon path |

**Total:** 2 files changed, 480 insertions(+), 1 deletion(-)

---

## 🧪 Testing

### Run Tests
```bash
# Smoke tests for all admin pages
npx playwright test tests/untested-admin-pages.spec.ts

# Responsive tests
npx playwright test tests/responsive-e2e.spec.ts

# All tests
npx playwright test
```

### Test Coverage Summary
- Total admin pages: 51
- Tested pages: 6 (dashboard, leads, pipeline, campaigns, finance, features-demo-2027)
- Untested pages: 45 (covered by smoke tests)

---

## 📝 Migration Guide

### Using Responsive Tables

1. **Include the CSS:**
```html
<link rel="stylesheet" href="/assets/css/responsive-table-layout.css">
```

2. **Add classes to your tables:**
```html
<div class="table-responsive">
  <table class="responsive-stack">
    <thead>
      <tr>
        <th>Column 1</th>
        <th>Column 2</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th data-label="Column 1">Value 1</th>
        <th data-label="Column 2">Value 2</th>
      </tr>
    </tbody>
  </table>
</div>
```

---

## 🔗 Related Issues

- SEO Metadata: All pages now have complete SEO tags
- Responsive Tables: Mobile-friendly table layout
- Favicon: Fixed broken favicon in admin dashboard

---

## 👥 Contributors

- OpenClaw AI - Implementation & Testing
- SaĐéc Marketing Hub Team - QA

---

## 📈 Version History

| Version | Date | Description |
|---------|------|-------------|
| 5.7.0 | 2026-03-14 | Responsive Tables & SEO Improvements |
| 5.6.0 | 2026-03-13 | Performance Optimization (CSS/JS bundles) |
| 5.5.0 | 2026-03-12 | UX Features 2026 (Scroll progress, Focus mode) |
| 5.4.0 | 2026-03-10 | AI Content Generator |
| 5.3.0 | 2026-03-08 | Payment Gateway Integration |

---

**Full Changelog:** [CHANGELOG.md](CHANGELOG.md)

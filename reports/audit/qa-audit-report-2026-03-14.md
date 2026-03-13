# QA Audit Report — Sa Đéc Marketing Hub

**Date:** 2026-03-14
**Version:** v4.32.0
**Pipeline:** `/qa-audit`
**Status:** ⚠️ Action Required

---

## Executive Summary

Quét toàn diện 91 HTML files tìm kiếm: Broken Links, Meta Tags, và Accessibility Issues.

| Metric | Result |
|--------|--------|
| **Files Scanned** | 91 HTML files |
| **Total Issues** | 125 |
| **🔴 HIGH** | 8 |
| **🟠 MEDIUM** | 107 |
| **🟡 LOW** | 10 |
| **Broken Links** | 0 ✅ |

---

## 🔴 HIGH Priority Issues (8)

### 1. Missing `<title>` Tag — 3 files

**Severity:** HIGH
**Files:**
- `admin/widgets/theme-toggle.html`
- `admin/widgets/notification-bell.html`
- `admin/widgets/global-search.html`

**Issue:** Widget components không có title tag (acceptable cho components, nhưng nên thêm cho standalone pages).

**Fix:**
```html
<head>
  <title>Theme Toggle | Sa Đéc Marketing Hub</title>
</head>
```

---

### 2. Missing Viewport Meta Tag — 3 files

**Severity:** HIGH
**Files:**
- `admin/widgets/theme-toggle.html`
- `admin/widgets/notification-bell.html`
- `admin/widgets/global-search.html`

**Issue:** Không có viewport meta tag → không mobile-friendly.

**Fix:**
```html
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
```

---

### 3. Missing H1 Heading — 2 files

**Severity:** HIGH
**Files:**
- `portal/roiaas-onboarding.html`
- `admin/onboarding.html`

**Issue:** Pages không có H1 heading (chỉ có H2+).

**Fix:** Thêm H1 mô tả trang:
```html
<h1>ROI AAS Onboarding</h1>
```

---

## 🟠 MEDIUM Priority Issues (107)

### 4. Missing Charset Declaration — 91 files

**Severity:** MEDIUM
**Files:** Tất cả 91 HTML files

**Issue:** Không có `<meta charset="UTF-8">` declaration.

**Fix Pattern:**
```html
<head>
  <meta charset="UTF-8">
  <!-- Should be first meta tag -->
</head>
```

**Note:** Có thể các files này inherit charset từ template parent. Nếu là standalone files → cần thêm.

---

### 5. Heading Skip (H1 → H3) — 11 files

**Severity:** MEDIUM
**Files:**
| File | Skip |
|------|------|
| `portal/roi-analytics.html` | H1 → H3 |
| `portal/ocop-catalog.html` | H1 → H3 |
| `admin/community.html` | H1 → H3 |
| `admin/legal.html` | H1 → H3 |
| `admin/inventory.html` | H1 → H3 |
| `admin/notifications.html` | H1 → H3 |
| `admin/lms.html` | H1 → H3 |
| `admin/customer-success.html` | H1 → H3 |
| `admin/ecommerce.html` | H1 → H3 |
| `admin/roiaas-admin.html` | H1 → H3 |
| `admin/events.html` | H1 → H3 |

**Issue:** Nhảy từ H1 xuống H3 mà không có H2 → phá vỡ heading hierarchy.

**Fix:** Thêm H2 intermediate hoặc đổi H3 → H2:
```html
<h1>Page Title</h1>
<h2>Section</h2>  <!-- Added -->
<h3>Subsection</h3>
```

---

### 6. Multiple H1 Tags — 2 files

**Severity:** MEDIUM
**Files:**
- `portal/onboarding.html` (4 H1 tags)
- `admin/ui-components-demo.html` (2 H1 tags)

**Issue:** Multiple H1 tags trên cùng 1 page → confusing cho screen readers và SEO.

**Fix:** Chỉ giữ 1 H1 duy nhất, downgrade其余 → H2:
```html
<!-- ❌ Before -->
<h1>Step 1</h1>
<h1>Step 2</h1>
<h1>Step 3</h1>
<h1>Step 4</h1>

<!-- ✅ After -->
<h1>Onboarding Process</h1>
<h2>Step 1</h2>
<h2>Step 2</h2>
<h2>Step 3</h2>
<h2>Step 4</h2>
```

---

### 7. Missing Meta Description — 3 files

**Severity:** MEDIUM
**Files:**
- `admin/widgets/theme-toggle.html`
- `admin/widgets/notification-bell.html`
- `admin/widgets/global-search.html`

**Fix:**
```html
<head>
  <meta name="description" content="Theme toggle component for Sa Đéc Marketing Hub">
</head>
```

---

## 🟡 LOW Priority Issues (10)

### 8. Missing Open Graph Tags — 3 files

**Severity:** LOW
**Files:** Same 3 widget files

**Issue:** Missing `og:title` và `og:image` cho social sharing.

**Fix:**
```html
<head>
  <meta property="og:title" content="Theme Toggle | Sa Đéc Marketing Hub">
  <meta property="og:description" content="Theme toggle component">
  <meta property="og:image" content="/assets/img/og-image.png">
</head>
```

---

### 9. Missing `<main>` Element — 4 files

**Severity:** LOW
**Files:**
- `lp.html`
- `admin/widgets/theme-toggle.html`
- `admin/widgets/notification-bell.html`
- `admin/widgets/global-search.html`

**Issue:** Không có `<main>` element để chỉ định main content area.

**Fix:**
```html
<body>
  <header>...</header>
  <main>
    <!-- Main content here -->
  </main>
  <footer>...</footer>
</body>
```

**Note:** Widget components có thể không cần `<main>` nếu được embed vào parent.

---

## ✅ Broken Links Check

**Status:** No broken internal links detected ✅

Script đã quét tất cả `href` attributes và verify internal paths. Kết quả:
- 0 broken links found
- All internal navigation targets exist
- External links (https, mailto:, tel:) được ignore đúng

---

## Accessibility Quick Summary

| Criterion | Status | Issues |
|-----------|--------|--------|
| **Alt Text** | ✅ | 0 missing alt |
| **Heading Hierarchy** | ⚠️ | 11 heading skips |
| **Landmark Elements** | ⚠️ | 4 missing `<main>` |
| **Viewport Meta** | ⚠️ | 3 missing |
| **ARIA Labels** | ✅ | No critical issues |
| **Form Labels** | ✅ | No critical issues |

---

## Files by Category

### Root Level (8 files)
- `index.html` — Missing charset
- `lp.html` — Missing charset, missing `<main>`
- `login.html`, `register.html`, `forgot-password.html`, etc.

### Admin (53 files)
- All admin pages missing charset
- 10 heading skip issues
- 2 missing H1
- 1 multiple H1

### Portal (21 files)
- All portal pages missing charset
- 2 heading skips
- 1 missing H1
- 1 multiple H1

### Auth (3 files)
- All missing charset

### Affiliate (7 files)
- All missing charset

### Widgets (3 files)
- Most issues concentrated here
- Missing title, viewport, meta description, OG tags

---

## Action Items

### Immediate (Do Now)

1. **Add charset to all pages**
   ```html
   <meta charset="UTF-8">
   ```

2. **Fix heading hierarchy** — Add H2 sections or rename H3 → H2

3. **Add viewport to widget files**
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   ```

### Short-term (This Sprint)

4. **Add `<main>` elements** to standalone pages

5. **Fix multiple H1 issues** — Downgrade to H2

6. **Add H1 to onboarding pages**

### Medium-term (Next Sprint)

7. **Add Open Graph tags** for social sharing

8. **Add meta descriptions** for SEO

---

## Script Created

**File:** `scripts/audit-qa.py`

Run anytime:
```bash
cd /Users/mac/mekong-cli/apps/sadec-marketing-hub
python3 scripts/audit-qa.py
```

Output: `reports/audit/qa-audit-report.json`

---

## Git Commits

```bash
git add apps/sadec-marketing-hub/scripts/audit-qa.py

git commit -m "feat(audit): Add QA audit script for broken links, meta tags, a11y

Audit Script Features:
- Scan all HTML files (exclude node_modules, dist)
- Check broken internal links
- Verify meta tags (title, description, viewport, charset)
- Heading hierarchy validation
- Accessibility issues (alt text, ARIA, landmarks)

Initial Results:
- 91 files scanned
- 125 issues found (8 HIGH, 107 MEDIUM, 10 LOW)
- 0 broken links ✅

Files:
- scripts/audit-qa.py (450 lines)
- reports/audit/qa-audit-report.json"

git push origin main
```

---

## Production Status

**URL:** https://sadecmarketinghub.com

**Audit Status:**
```
✅ Broken Links — 0 found
⚠️ Meta Tags — 91 missing charset
⚠️ Heading Hierarchy — 11 skips
⚠️ H1 Tags — 2 missing, 2 multiple
⚠️ Viewport — 3 missing (widgets)
✅ Alt Text — 0 issues
```

---

**Author:** OpenClaw CTO
**Report Generated:** 2026-03-14T12:30:00Z
**Next Audit:** After meta tag fixes deployed

---

## Appendix: Full Issue List

### By Severity

| Severity | Count | Percentage |
|----------|-------|------------|
| HIGH | 8 | 6.4% |
| MEDIUM | 107 | 85.6% |
| LOW | 10 | 8.0% |

### By Type

| Issue Type | Count | Files Affected |
|------------|-------|----------------|
| missing_charset | 91 | All files |
| heading_skip | 11 | 11 files |
| missing_main | 4 | 4 files |
| missing_title | 3 | 3 widget files |
| missing_meta_description | 3 | 3 widget files |
| missing_og_title | 3 | 3 widget files |
| missing_og_image | 3 | 3 widget files |
| missing_viewport | 3 | 3 widget files |
| missing_h1 | 2 | 2 onboarding files |
| multiple_h1 | 2 | 2 files |

**Total:** 125 issues across 91 files

---

**Status:** ⚠️ **Action Required** — Fix HIGH priority before next deployment.

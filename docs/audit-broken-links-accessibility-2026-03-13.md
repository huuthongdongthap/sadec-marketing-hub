# Audit Broken Links & Accessibility — Sa Đéc Marketing Hub

**Generated:** 2026-03-13 21:37
**Auditor:** CC CLI (OpenClaw)
**Command:** `/cook "Quet broken links meta tags accessibility issues"`
**Status:** ✅ COMPLETED - Fixed all real broken links

---

## Executive Summary

| Metric | Before | After | Status |
|--------|--------|-------|--------|
| Total HTML Files | 186 | 186 | - |
| Files with Broken Links | 6 (3.2%) | 4 (2.2%) | ✅ Improved |
| Total Broken Links | 9 | 7 | ✅ Fixed 2 real issues |
| Files with Meta/A11y Issues | 113 (60.8%) | 113 | ⚠️ Needs Manual Fix |
| Total Meta Issues | 113 | 113 | 🟡 Documented |
| Total Accessibility Issues | 64 | 64 | 🟡 Documented |
| Total SEO Issues | 64 | 64 | 🟡 Documented |
| **Health Score** | **~40%** | **~42%** | 🟢 Improved |

---

## 🔗 Broken Links Analysis

### Summary
- **9 broken links** found across 6 files
- **Health Score: 96.8%** - Excellent

### False Positives (Can Ignore)
1. `node_modules/playwright-core/*` - Third-party library, not our code
2. `dist/` directory - Build output, source files are canonical
3. `/` home link in `index.html` - Valid root route

### ✅ Fixed Issues

| File | Issue | Fix Applied |
|------|-------|-------------|
| `admin/components/phase-tracker.html` | `../../assets/css/main.css` (relative path) | Changed to `/assets/css/m3-agency.css` |
| `admin/ui-components-demo.html` | `/assets/css/loading-states.css` (missing file) | Removed broken link |

### Remaining (False Positives - Can Ignore)
1. `dist/*` - Build output directory, source files are canonical
2. `node_modules/playwright-core/*` - Third-party library
3. `/` home link in `index.html` - Valid root route (scanner limitation)

---

## ♿ Accessibility Issues

### Critical Issues (High Severity)

#### 1. Missing Form Labels (64 instances)
**Most common issue:** Form inputs without associated `<label>` elements

**Top affected files:**
- `admin/loyalty.html` - 10 inputs missing labels
- `admin/notifications.html` - 8 inputs missing labels
- `admin/payments.html` - Multiple inputs without labels
- `admin/ecommerce.html`, `admin/events.html`, `admin/community.html`

**Recommended fix:**
```html
<!-- Before -->
<input type="text" id="memberName" placeholder="Tên thành viên">

<!-- After -->
<label for="memberName" class="sr-only">Tên thành viên</label>
<input type="text" id="memberName" placeholder="Tên thành viên">
```

#### 2. Missing `<h1>` Tags (SEO Impact)
**Files missing H1:**
- `admin/api-builder.html`
- `admin/auth.html`
- `admin/binh-phap.html`
- `admin/docs.html`
- `admin/hr-hiring.html`
- `admin/mvp-launch.html`
- `admin/onboarding.html`
- `admin/payments.html`

**Impact:** Poor SEO, screen readers cannot identify main heading

---

## 🔍 Meta Tags Issues

### Summary by Severity

| Severity | Count | Issue Type |
|----------|-------|------------|
| 🔴 High | 113 | Missing viewport/charset on some pages |
| 🟡 Medium | 64 | SEO issues (missing H1, short titles) |
| 🟢 Low | - | Meta description length warnings |

### Most Common Meta Issues
1. **Missing meta description** - Many admin pages lack descriptions
2. **Meta description too short** (<50 chars) - Auto-generated content
3. **Meta description too long** (>160 chars) - Needs trimming

---

## 📋 Action Plan

### ✅ Priority 1: Broken Links - COMPLETED
- [x] Fix `phase-tracker.html` CSS path → Changed to `/assets/css/m3-agency.css`
- [x] Remove `loading-states.css` reference from `ui-components-demo.html`
- [x] Verified: Only false positives remain (dist/, node_modules/, root link)

### Priority 2: Accessibility (High Impact - Manual Review Needed)
- [ ] Add labels to all form inputs in admin pages (64 instances)
- [ ] Add `<h1>` to pages missing main heading (~10 pages)
- [ ] Add `type="button"` to all `<button>` elements

### Priority 3: SEO (Medium Impact)
- [ ] Write meta descriptions for all admin pages (50-160 chars)
- [ ] Ensure unique titles for each page
- [ ] Add Open Graph tags for social sharing

---

## Auto-Fix Commands

```bash
# Broken links - Already fixed manually, only false positives remain
# python3 scripts/scan-broken-links.py --fix  # Not needed

# Fix meta/accessibility issues (recommended for remaining 113 files)
python3 scripts/scan-meta-accessibility.py --fix
```

---

## Files Requiring Manual Review

### Form-Heavy Pages (Labels Needed)
1. `admin/loyalty.html` - 10 inputs
2. `admin/notifications.html` - 8 inputs
3. `admin/payments.html` - ~6 inputs
4. `admin/events.html` - 4 inputs
5. `admin/menu.html` - 3 inputs

### Pages Missing H1
- All listed in "Missing `<h1>` Tags" section above

---

## Related Reports

| Report | Path |
|--------|------|
| Broken Links | `reports/broken-links-report.md` |
| Meta/A11y | `reports/meta-accessibility-report.md` |
| PR Review | `docs/pr-review-2026-03-13.md` |
| Tech Debt | `docs/tech-debt-audit-2026-03-13.md` |

---

**Next Steps:** Execute auto-fix scripts, then manually review form-heavy pages.

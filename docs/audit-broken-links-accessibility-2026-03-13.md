# Audit Broken Links & Accessibility — Sa Đéc Marketing Hub

**Generated:** 2026-03-13 21:35
**Auditor:** CC CLI (OpenClaw)
**Command:** `/cook "Quet broken links meta tags accessibility issues"`

---

## Executive Summary

| Metric | Value | Status |
|--------|-------|--------|
| Total HTML Files | 186 | - |
| Files with Broken Links | 6 (3.2%) | 🟢 Good |
| Total Broken Links | 9 | 🟢 Good |
| Files with Meta/A11y Issues | 113 (60.8%) | 🔴 Needs Work |
| Total Meta Issues | 113 | 🔴 High |
| Total Accessibility Issues | 64 | 🔴 High |
| Total SEO Issues | 64 | 🟡 Medium |
| **Health Score** | **~40%** | 🟡 Moderate |

---

## 🔗 Broken Links Analysis

### Summary
- **9 broken links** found across 6 files
- **Health Score: 96.8%** - Excellent

### False Positives (Can Ignore)
1. `node_modules/playwright-core/*` - Third-party library, not our code
2. `dist/` directory - Build output, source files are canonical
3. `/` home link in `index.html` - Valid root route

### Real Issues to Fix

| File | Broken Link | Fix |
|------|-------------|-----|
| `admin/components/phase-tracker.html` | `../../assets/css/main.css` | Change to `/assets/css/main.css` |
| `admin/ui-components-demo.html` | `/assets/css/loading-states.css` | File doesn't exist - remove or create |

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

### Priority 1: Broken Links (Quick Wins)
- [ ] Fix `phase-tracker.html` CSS path
- [ ] Remove or create `loading-states.css`
- [ ] Verify all internal navigation links

### Priority 2: Accessibility (High Impact)
- [ ] Add labels to all form inputs in admin pages
- [ ] Add `<h1>` to pages missing main heading
- [ ] Add `type="button"` to all `<button>` elements

### Priority 3: SEO (Medium Impact)
- [ ] Write meta descriptions for all admin pages (50-160 chars)
- [ ] Ensure unique titles for each page
- [ ] Add Open Graph tags for social sharing

---

## Auto-Fix Commands

```bash
# Fix broken links (marks with data-broken attribute)
cd /Users/mac/mekong-cli/apps/sadec-marketing-hub
python3 scripts/scan-broken-links.py --fix

# Fix meta/accessibility issues
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

# Dead Code Detection Report

**Generated:** 2026-03-13T10:37:14.182Z
**Files Scanned:** 114
**Total Issues:** 55

---

## Summary

| Type | Count |
|------|-------|
| Unused Functions | 40 |
| Commented Code | 3 |
| Unreachable Code | 12 |
| Duplicate | 0 |

---

## 📁 Files with Dead Code

### portal/js/roiaas-onboarding.js (6 issues)

- **Line 31:** Function 'selectPlan' appears unused
- **Line 42:** Function 'selectIndustry' appears unused
- **Line 53:** Function 'toggleChannel' appears unused
- **Line 73:** Function 'prevStep' appears unused
- **Line 119:** Function 'validateStep2' appears unused

... and 1 more

### assets/js/landing-builder.js (4 issues)

- **Line 16:** Function 'allowDrop' appears unused
- **Line 20:** Function 'drag' appears unused
- **Line 24:** Function 'drop' appears unused
- **Line 80:** Code after return statement

### assets/js/enhanced-utils.js (2 issues)

- **Line 42:** Code after return statement
- **Line 51:** Code after return statement

### assets/js/events.js (2 issues)

- **Line 360:** Function 'createDemoEvents' appears unused
- **Line 409:** Function 'formatEventDate' appears unused

### assets/js/micro-animations.js (2 issues)

- **Line 225:** Function 'easeOutQuart' appears unused
- **Line 256:** Function 'type' appears unused

### assets/js/mobile-navigation.js (2 issues)

- **Line 125:** Function 'toggleSidebar' appears unused
- **Line 386:** Function 'updateGrid' appears unused

### assets/js/pipeline-client.js (2 issues)

- **Line 436:** Function 'update' appears unused
- **Line 576:** Function 'exportPipelineReport' appears unused

### assets/js/ui-enhancements.js (2 issues)

- **Line 435:** Function 'debounce' appears unused
- **Line 438:** Function 'later' appears unused

### assets/js/admin/admin-campaigns.js (1 issues)

- **Line 201:** Code after return statement

### assets/js/admin/admin-clients.js (1 issues)

- **Line 142:** Code after return statement

### assets/js/admin/admin-leads.js (1 issues)

- **Line 220:** Code after return statement

### assets/js/admin/admin-utils.js (1 issues)

- **Line 148:** Code after return statement

### assets/js/admin/menu-manager.js (1 issues)

- **Line 190:** Code after return statement

### assets/js/admin-guard.js (1 issues)

- **Line 14:** Function 'adminGuard' appears unused

### assets/js/agency-2026-premium.js (1 issues)

- **Line 80:** Function 'update' appears unused

### assets/js/binh-phap-client.js (1 issues)

- **Line 86:** Code after return statement

### assets/js/binh-phap.js (1 issues)

- **Line 86:** Function 'createDemoAnalysis' appears unused

### assets/js/community.js (1 issues)

- **Line 348:** Function 'createDemoCommunity' appears unused

### assets/js/components/sadec-toast.js (1 issues)

- **Line 1:** Large comment block (17 lines) - consider removing or documenting

### assets/js/core-utils.js (1 issues)

- **Line 1:** Large comment block (18 lines) - consider removing or documenting


---

## Recommendations

1. **Remove unused functions** - Delete or use if needed
2. **Clean up commented code** - Remove large comment blocks
3. **Fix unreachable code** - Review code after return statements
4. **Consolidate duplicates** - Merge duplicate function implementations

---

## Quality Score

🔴 **0/100** - Critical

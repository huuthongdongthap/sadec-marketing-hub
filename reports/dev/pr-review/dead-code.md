# Dead Code Detection Report

**Generated:** 2026-03-14T03:57:01.720Z
**Files Scanned:** 254
**Total Issues:** 147

---

## Summary

| Type | Count |
|------|-------|
| Unused Functions | 66 |
| Commented Code | 39 |
| Unreachable Code | 42 |
| Duplicate | 0 |

---

## 📁 Files with Dead Code

### assets/js/ui-enhancements-2026.js (12 issues)

- **Line 55:** Function 'createRipple' appears unused
- **Line 118:** Function 'showLoading' appears unused
- **Line 142:** Function 'hideLoading' appears unused
- **Line 180:** Function 'showToast' appears unused
- **Line 244:** Function 'createProgress' appears unused

... and 7 more

### assets/js/services/service-worker.js (7 issues)

- **Line 60:** Code after return statement
- **Line 64:** Code after return statement
- **Line 241:** Code after return statement
- **Line 256:** Code after return statement
- **Line 271:** Code after return statement

... and 2 more

### portal/js/roiaas-onboarding.js (6 issues)

- **Line 31:** Function 'selectPlan' appears unused
- **Line 42:** Function 'selectIndustry' appears unused
- **Line 53:** Function 'toggleChannel' appears unused
- **Line 73:** Function 'prevStep' appears unused
- **Line 119:** Function 'validateStep2' appears unused

... and 1 more

### assets/js/features/activity-timeline.js (5 issues)

- **Line 350:** Function 'exportActivities' appears unused
- **Line 1:** Large comment block (18 lines) - consider removing or documenting
- **Line 252:** Code after return statement
- **Line 269:** Code after return statement
- **Line 360:** Code after return statement

### assets/js/features/keyboard-shortcuts.js (5 issues)

- **Line 465:** Function 'addStyles' appears unused
- **Line 1:** Large comment block (18 lines) - consider removing or documenting
- **Line 86:** Code after return statement
- **Line 298:** Code after return statement
- **Line 370:** Code after return statement

### assets/js/ui-motion-controller.js (5 issues)

- **Line 269:** Function 'updateScrollState' appears unused
- **Line 358:** Function 'cleanup' appears unused
- **Line 400:** Function 'easeOutQuart' appears unused
- **Line 402:** Function 'animate' appears unused
- **Line 1:** Large comment block (17 lines) - consider removing or documenting

### assets/js/features/quick-tools-panel.js (4 issues)

- **Line 526:** Function 'hexToRgb' appears unused
- **Line 535:** Function 'rgbToHsl' appears unused
- **Line 592:** Function 'updateStats' appears unused
- **Line 1:** Large comment block (19 lines) - consider removing or documenting

### assets/js/landing-builder.js (4 issues)

- **Line 16:** Function 'allowDrop' appears unused
- **Line 20:** Function 'drag' appears unused
- **Line 24:** Function 'drop' appears unused
- **Line 80:** Code after return statement

### assets/js/micro-animations.js (3 issues)

- **Line 238:** Function 'easeOutQuart' appears unused
- **Line 269:** Function 'type' appears unused
- **Line 1:** Large comment block (16 lines) - consider removing or documenting

### assets/js/utils/sort-utils.js (3 issues)

- **Line 158:** Code after return statement
- **Line 163:** Code after return statement
- **Line 168:** Code after return statement

### assets/js/components/data-table.js (2 issues)

- **Line 1:** Large comment block (42 lines) - consider removing or documenting
- **Line 442:** Code after return statement

### assets/js/components/scroll-to-top.js (2 issues)

- **Line 364:** Function 'animate' appears unused
- **Line 1:** Large comment block (24 lines) - consider removing or documenting

### assets/js/components/tabs.js (2 issues)

- **Line 159:** Function 'updateIndicator' appears unused
- **Line 1:** Large comment block (35 lines) - consider removing or documenting

### assets/js/features/ai-content-panel.js (2 issues)

- **Line 1:** Large comment block (18 lines) - consider removing or documenting
- **Line 225:** Code after return statement

### assets/js/features/data-refresh-indicator.js (2 issues)

- **Line 208:** Function 'enableAutoRefresh' appears unused
- **Line 221:** Function 'disableAutoRefresh' appears unused

### assets/js/features/quick-notes/notes-renderer.js (2 issues)

- **Line 54:** Code after return statement
- **Line 69:** Code after return statement

### assets/js/finance-client.js (2 issues)

- **Line 178:** Function 'getDemoFinanceData' appears unused
- **Line 155:** Code after return statement

### assets/js/mobile-navigation.js (2 issues)

- **Line 125:** Function 'toggleSidebar' appears unused
- **Line 386:** Function 'updateGrid' appears unused

### assets/js/services/enhanced-utils.js (2 issues)

- **Line 45:** Code after return statement
- **Line 54:** Code after return statement

### assets/js/services/events.js (2 issues)

- **Line 360:** Function 'createDemoEvents' appears unused
- **Line 409:** Function 'formatEventDate' appears unused


---

## Recommendations

1. **Remove unused functions** - Delete or use if needed
2. **Clean up commented code** - Remove large comment blocks
3. **Fix unreachable code** - Review code after return statements
4. **Consolidate duplicates** - Merge duplicate function implementations

---

## Quality Score

🔴 **0/100** - Critical

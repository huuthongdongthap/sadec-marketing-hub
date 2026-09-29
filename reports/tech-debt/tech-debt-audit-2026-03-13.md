# Tech Debt Audit Report - Sa Đéc Marketing Hub

**Date:** 2026-03-13
**Version:** v4.14.0
**Audit Type:** Code Duplication & Structure Analysis

---

## 📊 Executive Summary

| Category | Issues | Priority | Effort |
|----------|--------|----------|--------|
| **Duplicate Code** | 4 utility files | HIGH | 4h |
| **Code Smells** | 46 magic numbers | MEDIUM | 2h |
| **Unused Code** | 120 unused vars | MEDIUM | 3h |
| **Structure** | Deep import chains | HIGH | 6h |
| **Tests** | 24 test files | ✅ Good | - |

**Total Estimated Refactoring:** 15 hours

---

## 🔍 Duplicate Code Analysis

### 1. Utility Function Duplication

**Current Structure:**
```
assets/js/
├── services/
│   ├── utils.js           ← Legacy re-exports (DEPRECATED)
│   ├── core-utils.js      ← Core utilities
│   └── enhanced-utils.js  ← Enhanced + re-exports from shared
├── shared/
│   ├── api-utils.js       ← API utilities (8.9KB)
│   └── format-utils.js    ← Format utilities (4.2KB)
```

**Problem:** Circular re-exports create confusion:
- `utils.js` → re-exports from `core-utils.js`
- `enhanced-utils.js` → re-exports from `format-utils.js`
- `core-utils.js` → some functions duplicated

**Recommendation:**
```
Consolidate to single source of truth:
assets/js/utils/
├── index.js           ← Single export point
├── format.js          ← All format functions
├── string.js          ← String utilities
├── number.js          ← Number utilities
├── date.js            ← Date utilities
├── function.js        ← debounce, throttle
└── dom.js             ← DOM utilities
```

### 2. Event Listener Duplication (127 instances)

**Pattern Found:**
```javascript
// Repeated 127 times across codebase
element.addEventListener('click', (e) => {
    // Similar handling logic
});
```

**Recommendation:** Create event delegate utility:
```javascript
// utils/events.js
export function delegateEvent(selector, eventType, handler) {
    document.addEventListener(eventType, (e) => {
        const target = e.target.closest(selector);
        if (target) handler.call(target, e);
    });
}
```

### 3. Fetch Pattern Duplication (12 instances)

**Pattern Found:**
```javascript
const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
});
if (!response.ok) throw new Error('...');
return await response.json();
```

**Recommendation:** Create API client utility:
```javascript
// utils/api.js
export async function apiFetch(url, options = {}) {
    const config = {
        ...options,
        headers: { 'Content-Type': 'application/json', ...options.headers }
    };
    const response = await fetch(SUPABASE_URL + url, config);
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'API error');
    }
    return response.json();
}
```

### 4. Error Handling Duplication (58 instances)

**Pattern Found:**
```javascript
try {
    // API call
} catch (error) {
    console.error('Error:', error);
    showToast('error', 'Có lỗi xảy ra');
}
```

**Recommendation:** Create error handler utility:
```javascript
// utils/error-handler.js
export function handleApiError(error, options = {}) {
    const { showNotification = true, message = 'Có lỗi xảy ra' } = options;
    console.error('[API Error]', error);
    if (showNotification) Toast.error(message);
    return null;
}
```

---

## 🎯 Code Smells

### Magic Numbers (46 instances)

**Examples:**
```javascript
const TIMEOUT = 30000;  // Should be const API_TIMEOUT = 30_000
const MAX_RETRIES = 3;  // Should be named constant
setTimeout(() => {...}, 500);  // Should be const DEBOUNCE_DELAY = 500
```

**Action:** Extract to `constants.js`:
```javascript
// constants/api.js
export const API_TIMEOUT = 30_000;
export const API_MAX_RETRIES = 3;
export const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
```

### Long Functions (Detected: 10+ files >500 lines)

| File | Lines | Recommendation |
|------|-------|----------------|
| supabase.js | 1,017 | Split: auth, queries, realtime, storage |
| analytics-dashboard.js | 859 | Extract: charts, data-processing, UI |
| data-table.js | 800 | Acceptable (complex component) |
| pipeline-client.js | 756 | Split by endpoint |

---

## 🗑️ Unused Code Detection

### Unused Exports (357 exports, estimated 20% unused)

**Detection Method:** Export count vs import analysis

**Likely Unused:**
- Legacy guard functions in `guards/`
- Deprecated API client methods
- Old UI component exports

### Unused Variables (120 const/let declarations)

**Examples Found:**
```javascript
const UNUSED_CONFIG = {...};  // Never referenced
let tempValue;  // Declared but never assigned/used
```

### Dead Functions (266 defined, estimated 15% unused)

**Detection:** Functions never called in codebase

---

## 🏗️ Structure Issues

### Deep Import Chains

**Current:**
```
admin/dashboard.js
  → clients/pipeline-client.js
    → services/enhanced-utils.js
      → shared/format-utils.js
        → utils/core-utils.js
```

**Problem:** 5-level import chain causes:
- Circular dependency risk
- Bundle size inflation
- Hard to trace dependencies

**Recommendation:** Flatten to 3 levels max:
```
admin/dashboard.js
  → clients/pipeline-client.js
    → utils/index.js  (single source)
```

---

## 📝 Refactoring Plan

### Phase 1: Consolidate Utilities (HIGH PRIORITY)
1. Create `utils/` directory structure
2. Migrate all format functions → `utils/format.js`
3. Migrate string utils → `utils/string.js`
4. Create single `utils/index.js` barrel export
5. Update all imports (codemod script)

**Estimated:** 4 hours

### Phase 2: API Client Refactor (HIGH PRIORITY)
1. Create `utils/api.js` with `apiFetch` helper
2. Extract common fetch patterns
3. Create error handler utility
4. Update 12 fetch call sites

**Estimated:** 3 hours

### Phase 3: Event Handling (MEDIUM PRIORITY)
1. Create `utils/events.js` with delegate function
2. Extract common event patterns
3. Update 127 event listeners (selective)

**Estimated:** 4 hours

### Phase 4: Dead Code Removal (MEDIUM PRIORITY)
1. Remove 120 unused variables
2. Remove unused function exports
3. Update import statements

**Estimated:** 3 hours

### Phase 5: Constants Extraction (LOW PRIORITY)
1. Create `constants/` directory
2. Extract 46 magic numbers
3. Add JSDoc documentation

**Estimated:** 2 hours

---

## ✅ Quick Wins (Start Here)

1. **Remove console.log** from components/index.js (line 114)
2. **Add constants** for magic numbers in payment-gateway.js
3. **Create barrel exports** in utils/index.js
4. **Delete deprecated** utils.js (replaced by core-utils.js)

---

## 📊 Impact Analysis

| Change | Files Affected | Risk | Benefit |
|--------|---------------|------|---------|
| Utils consolidation | ~30 imports | Medium | Clean imports |
| API refactor | 12 call sites | Low | Less duplication |
| Event delegation | 127 listeners | High | Performance |
| Dead code removal | ~50 files | Low | Smaller bundle |

---

**Audited by:** `/eng-tech-debt` pipeline
**Date:** 2026-03-13
**Next Steps:** Execute Phase 1 (Utils consolidation)

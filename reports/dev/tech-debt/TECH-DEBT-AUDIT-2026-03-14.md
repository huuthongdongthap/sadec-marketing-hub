# Tech Debt Audit Report - Sa Đéc Marketing Hub

**Date:** 2026-03-14
**Audit Type:** Duplicate Code & Structure Analysis

---

## 🎯 DUPLICATE CODE PATTERNS

### 1. Toast/Notification Implementations (13 duplicates)

| File | Pattern | Status |
|------|---------|--------|
| `services/enhanced-utils.js` | `export class Toast` | ✅ Centralized |
| `services/admin-shared.js` | `class Toast` | ❌ Duplicate |
| `components/toast.js` | `class Toast extends HTMLElement` | ⚠️ Web Component |
| `components/toast-manager.js` | `class ToastManager` | ⚠️ Different pattern |
| `ui-enhancements-2026.js` | `function showToast` | ❌ Duplicate |
| `features/keyboard-shortcuts.js` | `function showToast` | ❌ Duplicate |
| `features/activity-timeline.js` | `function showToast` | ❌ Duplicate |
| `features/ux-improvements-v2.js` | `function showToast` | ❌ Duplicate |
| `utils/clipboard.js` | `function showToast` | ❌ Duplicate |
| `services/ui-utils.js` | `function showToast` | ❌ Duplicate |

**Action:** Consolidate to single `Toast` class + `showToast` helper

---

### 2. String Utilities (capitalize, slugify)

| File | Functions | Status |
|------|-----------|--------|
| `utils/string.js` | `capitalize`, `slugify` | ✅ Source of truth |
| `services/enhanced-utils.js` | `capitalize`, `slugify` | ❌ Duplicate |

**Action:** Remove duplicates, import from `utils/string.js`

---

### 3. Function Utilities (debounce, throttle)

| File | Functions | Status |
|------|-----------|--------|
| `utils/function.js` | `debounce`, `throttle`, `memoize`, `compose`, `pipe` | ✅ Source of truth |
| `shared/format-utils.js` | Re-exports from utils/function.js | ✅ Correct |

**Status:** ✅ Already consolidated correctly

---

### 4. Format Utilities

| File | Functions | Status |
|------|-----------|--------|
| `shared/format-utils.js` | `formatCurrency`, `formatNumber`, `formatDate`, etc. | ✅ Source of truth |
| `services/core-utils.js` | Re-exports | ✅ Correct |

**Status:** ✅ Already consolidated correctly

---

### 5. Confirm/Alert Patterns

| File | Pattern | Recommendation |
|------|---------|----------------|
| Multiple files | Direct `confirm()` calls | Create `DialogService` |
| `features/ux-improvements-v2.js` | `export function confirm` | ✅ Custom dialog |
| `shared/modal-utils.js` | `confirm(message, title)` | ✅ Modal-based |

**Action:** Create unified `DialogService` for confirm/alert

---

## 📦 CONSOLIDATION PLAN

### Phase 1: Toast Consolidation

```
✅ Source: services/enhanced-utils.js → export class Toast
❌ Remove duplicates:
   - services/admin-shared.js (class Toast)
   - ui-enhancements-2026.js (function showToast)
   - features/keyboard-shortcuts.js (function showToast)
   - features/activity-timeline.js (function showToast)
   - utils/clipboard.js (function showToast)

⚠️ Keep (different patterns):
   - components/toast.js (Web Component)
   - components/toast-manager.js (Manager pattern)
```

### Phase 2: String Utilities Consolidation

```
✅ Source: utils/string.js
❌ Remove from services/enhanced-utils.js:
   - capitalize()
   - slugify()

Update imports in files using these functions
```

### Phase 3: Create Unified Services

```javascript
// New: services/dialog-service.js
export const DialogService = {
  confirm(message, title = 'Xác nhận'),
  alert(message, title = 'Thông báo'),
  prompt(message, defaultValue = '')
};

// New: services/notification-service.js
export const NotificationService = {
  success(message, duration),
  error(message, duration),
  warning(message, duration),
  info(message, duration)
};
```

### Phase 4: Dead Code Removal

From PR Review, remove 67 unused functions:

**Top files to clean:**
1. `ui-enhancements-2026.js` - 5 unused functions
2. `roiaas-onboarding.js` - 5 unused functions
3. `service-worker.js` - 5 unreachable code patterns

---

## 🔧 STRUCTURE IMPROVEMENTS

### Current Structure

```
assets/js/
├── admin/          # Admin-specific modules
├── charts/         # Chart components
├── components/     # Reusable UI components
├── core/           # Core utilities (auth, cache, theme)
├── features/       # Feature modules
├── guards/         # Auth guards
├── portal/         # Portal-specific modules
├── services/       # Service layer
├── shared/         # Shared utilities
└── utils/          # Utility functions
```

### Proposed Structure (Improved)

```
assets/js/
├── core/                    # Core engine
│   ├── index.js            # Main exports
│   ├── auth-service.js
│   ├── cache-service.js
│   ├── theme-manager.js
│   └── user-preferences.js
│
├── services/                # Business logic services
│   ├── index.js            # Service registry
│   ├── notification-service.js  # ← Consolidated Toast
│   ├── dialog-service.js        # ← New DialogService
│   ├── api-client.js
│   └── ... (other services)
│
├── components/              # UI Components
│   ├── web-components/     # Custom elements
│   ├── react-like/         # Functional components
│   └── index.js            # Component registry
│
├── utils/                   # Pure utilities
│   ├── index.js            # Utility exports
│   ├── string.js           # String utilities
│   ├── function.js         # Function utilities
│   ├── dom.js              # DOM utilities
│   ├── format.js           # Format utilities
│   └── id.js               # ID generation
│
├── features/                # Feature modules
│   ├── auth/
│   ├── dashboard/
│   ├── campaigns/
│   └── ...
│
└── modules/                 # App modules (admin, portal, etc.)
    ├── admin/
    ├── portal/
    └── affiliate/
```

---

## 📋 REFACTORING CHECKLIST

### Phase 1: Toast Consolidation
- [ ] Create `services/notification-service.js`
- [ ] Remove duplicate `showToast` functions (6 files)
- [ ] Update imports in affected files
- [ ] Test all toast notifications

### Phase 2: String Utilities
- [ ] Remove `capitalize`, `slugify` from `enhanced-utils.js`
- [ ] Update imports to use `utils/string.js`
- [ ] Run tests to verify

### Phase 3: Dialog Service
- [ ] Create `services/dialog-service.js`
- [ ] Replace native `confirm()` calls (9 instances)
- [ ] Replace native `alert()` calls
- [ ] Test all dialogs

### Phase 4: Dead Code Removal
- [ ] Remove 5 unused functions from `ui-enhancements-2026.js`
- [ ] Remove 5 unused functions from `roiaas-onboarding.js`
- [ ] Fix unreachable code in `service-worker.js`
- [ ] Clean up large comment blocks

### Phase 5: Structure Reorganization
- [ ] Create new folder structure
- [ ] Move files to new locations
- [ ] Update all import paths
- [ ] Verify build still works

---

## 📊 ESTIMATED IMPACT

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Toast implementations | 10 | 2 | 80% reduction |
| String util duplicates | 2 | 1 | 50% reduction |
| Dead code issues | 159 | ~50 | 68% reduction |
| Code quality score | 0/100 | ~60/100 | Significant |

---

## 🎯 NEXT STEPS

1. **Start with Phase 1** (Toast consolidation) - Highest impact
2. **Run tests** after each phase
3. **Commit incrementally** - One phase per commit
4. **Verify production** after each phase

---

**Generated by:** OpenClaw CTO
**Tech Debt Sprint:** 2026-03-14

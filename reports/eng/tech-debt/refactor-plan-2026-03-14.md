# Tech Debt Refactor Plan - Sa Đéc Marketing Hub

**Date:** 2026-03-14
**Status:** IN PROGRESS

---

## 📊 Executive Summary

### Current State

| Metric | Value |
|--------|-------|
| Total JS Files | 205 |
| Total Lines of Code | ~50,000 |
| Largest File | 940L (features/quick-notes.js) |
| Files > 500L | 30+ files |
| Shared Utilities | 8 modules |

### Previous Refactoring (2026-03-13)

✅ **Completed:**
- Shared format-utils.js - Currency, date, number formatting
- Shared api-utils.js - HTTP helpers with auth
- Shared guard-utils.js - Auth guards, role checks
- Shared dom-utils.js - DOM manipulation helpers
- Shared api-client.js - Base API client class
- Shared base-component.js - Base component class
- Shared logger.js - Logging utility
- Shared modal-utils.js - Modal management

---

## 🔍 Current Tech Debt Analysis

### 1. Large Files Needing Refactoring

| File | Lines | Priority | Action |
|------|-------|----------|--------|
| `features/quick-notes.js` | 940L | HIGH | Split into components |
| `core/user-preferences.js` | 885L | HIGH | Modularize |
| `features/quick-tools-panel.js` | 840L | HIGH | Extract sub-components |
| `features/notification-center.js` | 811L | MEDIUM | Split service/component |
| `core/database-service.js` | 803L | MEDIUM | Split by table/domain |
| `features/project-health-monitor.js` | 795L | MEDIUM | Extract metrics |
| `components/data-table.js` | 725L | LOW | Acceptable for complexity |
| `features/keyboard-shortcuts.js` | 719L | LOW | Already modular |
| `features/ai-content-generator.js` | 707L | MEDIUM | Extract AI service |
| `features/activity-timeline.js` | 702L | LOW | Acceptable |

### 2. Duplicate Code Patterns Found

#### Pattern: API Fetch with Auth (17 occurrences)

**Status:** ✅ CONSOLIDATED into `shared/api-utils.js`

**Files still using inline fetch:**
- `assets/js/utils/api.js` - Has separate apiFetch wrapper (should deprecate)
- `services/*.js` - Some still use inline fetch

**Action:** Migrate remaining files to use `shared/api-utils.js`

#### Pattern: waitForAuth (2 occurrences → 1)

**Status:** ✅ CONSOLIDATED into `shared/guard-utils.js`

**Files using shared guard:**
- `guards/admin-guard.js` ✅
- `guards/portal-guard.js` ✅

#### Pattern: Debounce/Throttle (5+ occurrences → 1)

**Status:** ✅ CONSOLIDATED into `utils/function.js`

**Re-exported in:**
- `shared/format-utils.js` ✅
- `shared/base-component.js` ✅

#### Pattern: Modal Control (10 occurrences)

**Status:** ⚠️ PARTIALLY CONSOLIDATED

**File:** `shared/modal-utils.js` (926L) - Still large

**Action:** Consider splitting modal utils by modal type

### 3. Structure Issues

#### Issue: Inconsistent Import Paths

```javascript
// Some use relative paths
import { x } from '../shared/utils.js';
import { y } from '../../assets/js/shared/utils.js';

// Some use absolute (if configured)
import { z } from '@/utils/utils.js';
```

**Action:** Standardize on relative paths from `assets/js/`

#### Issue: Circular Dependencies Risk

```
features/ai-content-generator.js
  → services/content-ai.js
    → utils/api.js
      → features/ai-content-generator.js (potential)
```

**Action:** Audit import graph for cycles

#### Issue: Mixed Module Patterns

```javascript
// ES Modules
import { x } from './utils.js';
export function y() {}

// CommonJS (legacy)
const x = require('./utils');
module.exports = { y };
```

**Status:** Most files use ES Modules ✅

---

## 📋 Refactoring Plan

### Phase 1: Large File Refactoring (Priority: HIGH)

#### 1.1 Split `features/quick-notes.js` (940L)

**Target:** < 400L per file

```
features/quick-notes.js (940L)
  ↓
features/quick-notes/
  ├── notes-component.js    (350L) - Main UI component
  ├── notes-storage.js      (200L) - LocalStorage service
  ├── notes-utils.js        (150L) - Note utilities
  └── index.js              (50L)  - Exports
```

#### 1.2 Split `core/user-preferences.js` (885L)

```
core/user-preferences.js (885L)
  ↓
core/preferences/
  ├── preferences-service.js   (300L) - Storage/retrieval
  ├── preferences-schema.js    (200L) - Validation schema
  ├── preferences-defaults.js  (150L) - Default values
  └── index.js                 (50L)  - Exports
```

#### 1.3 Split `features/quick-tools-panel.js` (840L)

```
features/quick-tools-panel.js (840L)
  ↓
features/quick-tools/
  ├── tools-panel.js      (300L) - Main component
  ├── tools-registry.js   (250L) - Tool definitions
  ├── tools-state.js      (150L) - State management
  └── index.js            (50L)  - Exports
```

### Phase 2: API Migration (Priority: MEDIUM)

#### 2.1 Deprecate `utils/api.js`

**Current:** Has separate `apiFetch` implementation

**Action:**
1. Mark `utils/api.js` as deprecated with JSDoc
2. Update imports to use `shared/api-utils.js`
3. Remove after verification

#### 2.2 Migrate Service Layer

**Files to update:**
- `services/payment-gateway.js` - Use `fetchWithAuth`
- `services/content-ai.js` - Use `postJSON`
- `services/ecommerce.js` - Use `getJSON`

### Phase 3: Structure Cleanup (Priority: LOW)

#### 3.1 Standardize Import Paths

**Convention:** Always use relative paths from file location

```javascript
// ✅ Good
import { x } from '../shared/api-utils.js';
import { y } from '../../core/preferences.js';

// ❌ Avoid
import { z } from '../../../assets/js/shared/api-utils.js';
```

#### 3.2 Create Module Index Files

```javascript
// shared/index.js - Re-export all shared modules
export * from './api-utils.js';
export * from './format-utils.js';
export * from './guard-utils.js';
export * from './dom-utils.js';
export * from './logger.js';

// Usage:
import { getJSON, formatCurrency, requireAdmin } from '../shared/index.js';
```

#### 3.3 Add JSDoc Documentation

**Target:** 100% JSDoc coverage for public APIs

```javascript
/**
 * Fetch data with authentication
 * @param {string} url - API endpoint
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Response data
 * @throws {Error} If authentication fails
 */
export async function getJSON(url, params = {}) { ... }
```

---

## 📈 Impact Metrics

### Before → After (Target)

| Metric | Before | Target | Improvement |
|--------|--------|--------|-------------|
| Files > 500L | 30 | 5 | 83% reduction |
| Duplicate API fetch | 17 | 2 | 88% reduction |
| Avg file size | 244L | 150L | 38% reduction |
| JSDoc coverage | ~60% | 100% | +40 points |

### Maintenance Benefits

| Benefit | Impact |
|---------|--------|
| Easier to test smaller modules | HIGH |
| Clearer ownership per module | HIGH |
| Faster onboarding | MEDIUM |
| Reduced merge conflicts | MEDIUM |

---

## 🧪 Testing Strategy

### Unit Tests

```bash
# Run existing tests
python3 -m pytest tests/

# Add tests for new modules
tests/features/quick-notes/
  ├── notes-component.test.js
  ├── notes-storage.test.js
  └── notes-utils.test.js
```

### Integration Tests

```bash
# Test shared utilities
tests/shared/
  ├── api-utils.test.js
  ├── format-utils.test.js
  └── guard-utils.test.js
```

---

## 📅 Timeline

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Phase 1 | Large file splitting | 2 hours |
| Phase 2 | API migration | 1 hour |
| Phase 3 | Structure cleanup | 1 hour |
| Testing | Unit + integration | 1 hour |
| **Total** | | **5 hours** |

---

## ✅ Acceptance Criteria

- [ ] No files > 500L (except complex components)
- [ ] All API calls use `shared/api-utils.js`
- [ ] 100% JSDoc coverage for public APIs
- [ ] All tests passing (216+ tests)
- [ ] No console errors in browser
- [ ] Production site functional

---

**Next Review:** Sprint Review 2026-03-21

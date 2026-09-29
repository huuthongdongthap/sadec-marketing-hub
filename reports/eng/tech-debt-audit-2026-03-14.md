# Tech Debt Audit Report - Sa Đéc Marketing Hub

**Date:** 2026-03-14
**Audit:** `/eng-tech-debt`
**Focus:** Duplicate code consolidation

---

## 📊 Executive Summary

| Category | Severity | Count |
|----------|----------|-------|
| Duplicate Toast Classes | 🔴 HIGH | 7 files |
| Duplicate ThemeManager | 🟡 MEDIUM | 4 files |
| Duplicate Notifications | 🔴 HIGH | 16 files |
| Large Service Files (>400 lines) | 🟡 MEDIUM | 10 files |
| CSS Files (needs bundle) | 🟡 MEDIUM | 69 files |

---

## 🔴 Critical: Duplicate Code

### Toast/Notification Classes (7 files)

| File | Lines | Issue |
|------|-------|-------|
| `services/admin-shared.js` | ~50 | Toast class |
| `services/toast-notification.js` | ~487 | Toast class |
| `components/toast.js` | ~100 | Toast class |
| `components/toast-manager.js` | ~150 | Toast class |
| `components/sadec-toast.js` | ~120 | Toast class |
| `toast-component.js` | ~100 | Toast class |
| `services/enhanced-utils.js` | ~50 | Toast class |

**Total duplicate lines:** ~1,057 lines

### ThemeManager (4 files)

| File | Lines | Issue |
|------|-------|-------|
| `services/admin-shared.js` | ~30 | ThemeManager class |
| `theme-manager.js` | ~100 | ThemeManager class |
| `components/theme-manager.js` | ~100 | ThemeManager class |
| `services/enhanced-utils.js` | ~30 | ThemeManager class |

**Total duplicate lines:** ~260 lines

### Notification Components (16 files)

| File | Purpose |
|------|---------|
| `widgets/notification-bell.js` | Notification bell widget |
| `components/notification-bell.js` | Notification bell component |
| `components/notification-preferences.js` | Notification settings |
| `admin/notification-panel.js` | Admin notification panel |
| `admin/bell-component.js` | Admin bell |
| `admin/notification-bell.js` | Admin notification |
| `features/notification-center.js` | Notification center |
| `notification-manager.js` | Notification manager |
| `services/notifications.js` | Notification service |
| `services/enhanced-utils.js` | Notification utils |
| And 6 more... | |

---

## 🟡 Large Files (Needs Splitting)

### JavaScript Service Files

| File | Lines | Recommendation |
|------|-------|----------------|
| `services/ecommerce.js` | 523 | Split into modules |
| `services/workflows.js` | 517 | Split into modules |
| `services/mekong-store.js` | 493 | Split into modules |
| `services/toast-notification.js` | 487 | **Consolidate first** |
| `services/admin-shared.js` | 450 | **Consolidate first** |
| `services/events.js` | 444 | OK |
| `services/form-validation.js` | 439 | OK |
| `services/approvals.js` | 436 | OK |
| `services/payment-gateway.js` | 423 | OK |
| `services/content-ai.js` | 419 | OK |

---

## 📁 CSS Files

**69 CSS files** - Cần consolidate vào bundles:

### Current Structure
```
assets/css/
├── admin-*.css (25 files)
├── portal-*.css (10 files)
├── components/*.css (15 files)
├── features/*.css (12 files)
├── widgets/*.css (7 files)
└── Other (10 files)
```

### Recommended Bundle Structure
```
assets/css/bundle/
├── admin-core.css (admin pages)
├── portal-core.css (portal pages)
├── components.css (shared components)
├── widgets.css (dashboard widgets)
└── responsive.css (all breakpoints)
```

---

## 🎯 Refactor Plan

### Phase 1: Consolidate Toast (P0)
1. Create `services/toast-service.js` - unified Toast service
2. Remove duplicate Toast classes from:
   - `services/admin-shared.js`
   - `components/toast.js`
   - `components/toast-manager.js`
   - `components/sadec-toast.js`
   - `toast-component.js`
   - `services/enhanced-utils.js`
3. Update all imports to use `services/toast-service.js`

### Phase 2: Consolidate ThemeManager (P1)
1. Create `services/theme-service.js` - unified ThemeManager
2. Remove duplicate from:
   - `services/admin-shared.js`
   - `theme-manager.js`
   - `components/theme-manager.js`
3. Update all imports

### Phase 3: Consolidate Notifications (P1)
1. Create `services/notification-service.js` - unified notification system
2. Remove duplicate components
3. Keep only:
   - `widgets/notification-bell.js` (widget)
   - `components/notification-preferences.js` (settings)
   - `services/notification-service.js` (service)

### Phase 4: Split Large Files (P2)
1. `ecommerce.js` → `ecommerce/` folder with modules
2. `workflows.js` → `workflows/` folder with modules
3. `mekong-store.js` → `store/` folder with modules

### Phase 5: CSS Bundle (P2)
1. Create CSS bundles in `assets/css/bundle/`
2. Update HTML pages to use bundles
3. Remove individual CSS files

---

## 📈 Expected Impact

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Duplicate Toast classes | 7 | 1 | -86% |
| Duplicate ThemeManager | 4 | 1 | -75% |
| Notification files | 16 | 3 | -81% |
| Total duplicate lines | ~2,000 | ~500 | -75% |
| CSS files | 69 | 5 bundles | -93% |
| Large files (>400 lines) | 10 | 3 | -70% |

---

## 🧪 Testing Strategy

1. **Before Refactor:** Run all tests, save baseline
2. **After Each Phase:** Run tests to verify no regressions
3. **Final:** Full test suite + visual regression

---

## 📋 Implementation Checklist

- [ ] Phase 1: Consolidate Toast (P0)
- [ ] Phase 2: Consolidate ThemeManager (P1)
- [ ] Phase 3: Consolidate Notifications (P1)
- [ ] Phase 4: Split Large Files (P2)
- [ ] Phase 5: CSS Bundle (P2)
- [ ] Update all imports
- [ ] Run full test suite
- [ ] Visual regression test
- [ ] Documentation update

---

**Generated by:** OpenClaw RaaS Agency
**Pipeline:** `/eng-tech-debt`

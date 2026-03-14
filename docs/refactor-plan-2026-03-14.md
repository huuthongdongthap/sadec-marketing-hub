# Refactor Plan — Sa Đéc Marketing Hub

**Date:** 2026-03-14
**Goal:** Consolidate duplicate code, cải thiện structure

---

## 📋 Vấn đề xác định

### 1. Duplicate Supabase Clients

| File | Dòng | Pattern |
|------|------|---------|
| `portal/supabase.js` | ~50 | Singleton simple |
| `src/js/api/supabase.js` | ~1017 | Full auth + data |

**Giải pháp:** Gộp thành `src/js/core/supabase-client.js`
- Singleton pattern từ portal
- Full functionality từ api
- Centralized configuration

---

### 2. Duplicate Keyboard Shortcuts

| File | Dòng | Context |
|------|------|---------|
| `admin/keyboard-shortcuts.js` | 480 | Admin only |
| `components/keyboard-shortcuts.js` | 486 | Reusable component |

**Giải pháp:**
- Giữ `components/keyboard-shortcuts.js` làm reusable component
- `admin/keyboard-shortcuts.js` import và extend cho admin-specific

---

### 3. Legacy Compatibility Layer

| File | Mục đích |
|------|----------|
| `core/utils.js` | Legacy re-export (deprecated) |
| `core/core-utils.js` | Single source of truth |
| `core/enhanced-utils.js` | UI utilities |

**Giải pháp:**
- Giữ `core-utils.js` làm primary export
- Đánh dấu `utils.js` rõ ràng là DEPRECATED
- Documentation update

---

### 4. Refactored Files (Clean up)

| File | Action |
|------|--------|
| `admin/dashboard-client-refactored.js` | Kiểm tra usage, remove old |
| `admin/finance-client-refactored.js` | Kiểm tra usage, remove old |
| `admin/binh-phap-client-refactored.js` | Kiểm tra usage, remove old |

---

## 🎯 Mục tiêu refactor

1. **0 duplicate logic** - Mỗi function chỉ tồn tại 1 nơi
2. **Clear module boundaries** - Shared vs Admin vs Portal
3. **Tree-shakeable** - ES modules với proper exports
4. **Backward compatible** - Không break existing code

---

## 📝 Checklist thực hiện

### Phase 1: Supabase Client Consolidation
- [ ] Tạo `src/js/core/supabase-client.js` (merged version)
- [ ] Update imports: `portal/*` → dùng core
- [ ] Update imports: `admin/*` → dùng core
- [ ] Remove `portal/supabase.js`
- [ ] Refactor `src/js/api/supabase.js` → re-export từ core

### Phase 2: Keyboard Shortcuts
- [ ] Review `components/keyboard-shortcuts.js` API
- [ ] Update `admin/keyboard-shortcuts.js` → import + extend
- [ ] Remove duplicate logic

### Phase 3: Legacy Cleanup
- [ ] Audit files import từ `core/utils.js`
- [ ] Migrate imports → `core/core-utils.js`
- [ ] Add deprecation warnings
- [ ] Update documentation

### Phase 4: Dead Code Removal
- [ ] Grep usage của `*-refactored.js` files
- [ ] Backup và remove unused files
- [ ] Update imports reference

---

## ✅ Verification

Sau khi refactor:
- [ ] `npm run build` passes
- [ ] `npm test` passes (96% coverage maintained)
- [ ] Browser check: Admin dashboard OK
- [ ] Browser check: Portal dashboard OK
- [ ] No console errors

---

**Estimated:** 20 credits, 30-40 minutes

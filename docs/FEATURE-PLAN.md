# Feature Plan — Sa Đéc Marketing Hub UX Improvements

**Date:** 2026-03-13
**Goal:** Thêm features mới và cải thiện UX

---

## Features to Implement

### 1. Global Search (Command Palette) 🔍
**Priority:** HIGH
**Description:** Command palette-style search (Ctrl+K)
**Files:**
- `assets/js/components/command-palette.js`
- `assets/css/components/command-palette.css`

### 2. Real-time Notifications 🔔
**Priority:** HIGH
**Description:** Bell icon with unread counter, notification panel
**Files:**
- `assets/js/components/notification-bell.js`
- `assets/css/components/notification-bell.css`

### 3. Dark Mode Toggle 🌙
**Priority:** MEDIUM
**Description:** Theme toggle with system preference detection
**Files:**
- `assets/js/components/theme-toggle.js`
- Enhanced existing theme-manager.js

### 4. Keyboard Shortcuts Manager ⌨️
**Priority:** MEDIUM
**Description:** Centralized keyboard shortcuts with help modal
**Files:**
- `assets/js/utils/keyboard-shortcuts.js`

### 5. Skeleton Loading States 💀
**Priority:** HIGH
**Description:** Skeleton loaders for all data-fetching components
**Files:**
- Enhanced `assets/js/components/loading/`
- Enhanced `assets/css/lazy-loading.css`

### 6. Breadcrumb Navigation 🍞
**Priority:** LOW
**Description:** Auto-generated breadcrumb navigation
**Files:**
- `assets/js/components/breadcrumb.js`
- `assets/css/components/breadcrumb.css`

### 7. Empty States 📭
**Priority:** MEDIUM
**Description:** Beautiful empty states for all list views
**Files:**
- `assets/css/components/empty-states.css`
- SVG illustrations

### 8. Error Boundaries & Retry UI ⚠️
**Priority:** HIGH
**Description:** Graceful error handling with retry buttons
**Files:**
- Enhanced `assets/js/components/error-boundary.js`

---

## Implementation Order

```
1. Global Search (Command Palette) — 20 min
2. Real-time Notifications — 15 min
3. Skeleton Loading States — 15 min
4. Error Boundaries — 10 min
5. Dark Mode Toggle — 10 min
6. Keyboard Shortcuts — 15 min
7. Breadcrumb Navigation — 10 min
8. Empty States — 10 min
```

**Total Estimated:** 105 minutes (~2 hours)

---

## UX Principles (Material Design 3)

1. **Expressive Motion** — Smooth, meaningful animations
2. **Touch-Friendly** — 44px minimum touch targets
3. **Accessible** — WCAG 2.1 AA compliant
4. **Responsive** — Mobile-first, 375px → 1920px
5. **Performant** — < 100ms interaction latency

---

## Success Metrics

- Lighthouse UX Score: 95+
- Time to Interactive: < 2.5s
- Cumulative Layout Shift: < 0.1
- First Input Delay: < 100ms

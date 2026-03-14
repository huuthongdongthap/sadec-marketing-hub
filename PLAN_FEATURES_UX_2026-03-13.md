# Kế Hoạch Features & UX Improvements - Sa Đéc Marketing Hub

**Ngày:** 2026-03-13
**Người lập:** OpenClaw CTO
**Status:** Pending Approval

---

## 📊 Tổng quan

Dựa trên audit reports (AUDIT-SUMMARY.md, TECH_DEBT_REPORT.md, PR_REVIEW.md), đề xuất plan bao gồm 4 features mới và 5 UX improvements.

---

## 🎯 PHASE 1: FEATURES MỚI (Priority: HIGH)

### 1.1 Dashboard Analytics Widgets ⭐⭐⭐

**Mục tiêu:** Real-time KPI dashboard cho admin và portal

**Components:**
```
admin/widgets/
├── kpi-card.html          # Reusable KPI card component
├── kpi-card.js            # KPI logic + formatting
├── traffic-chart.html     # Traffic visualization
├── traffic-chart.js       # Chart.js integration
├── conversion-funnel.html # Funnel visualization
└── conversion-funnel.js   # Funnel logic

portal/widgets/
├── my-stats.html          # User stats overview
└── my-stats.js
```

**Chức năng:**
- 4 KPI cards: Total Revenue, Active Leads, Conversion Rate, ROI
- Traffic chart (7 days, 30 days, 90 days)
- Conversion funnel visualization
- Real-time updates (polling every 30s)

**Dependencies:** Chart.js (CDN), shared/format-utils.js, shared/api-utils.js

---

### 1.2 Notification System ⭐⭐⭐

**Mục tiêu:** Toast notifications + in-app alerts

**Components:**
```
assets/js/
├── notification-manager.js    # Core notification engine
├── toast-component.js         # Toast UI component
└── notification-center.js     # Notification list/dropdown

admin/widgets/
└── notification-bell.html     # Bell icon + dropdown
```

**Chức năng:**
- Toast notifications (success, error, warning, info)
- Auto-dismiss (3s for success/error, 5s for warning)
- Notification center (unread count, mark as read)
- Persistent storage (localStorage)
- Types: System, Campaign, Lead, Email

**API Integration:**
```javascript
// GET /api/notifications
// POST /api/notifications/mark-read
// WebSocket for real-time (future)
```

---

### 1.3 Dark Mode Toggle ⭐⭐

**Mục tiêu:** Theme switcher với persistence

**Components:**
```
assets/js/
└── theme-manager.js         # Dark mode toggle + persistence

admin/widgets/
└── theme-toggle.html        # Toggle button
```

**Implementation:**
- CSS custom properties (--md-sys-color-*)
- localStorage persistence ('sadec-theme': 'dark' | 'light')
- System preference detection (prefers-color-scheme)
- Smooth transitions (0.3s ease)

**CSS Structure:**
```css
:root[data-theme="light"] { --md-sys-color-surface: #fff; }
:root[data-theme="dark"] { --md-sys-color-surface: #1a1a1a; }
```

---

### 1.4 Global Search ⭐⭐

**Mục tiêu:** Search across admin/portal modules

**Components:**
```
assets/js/
└── global-search.js         # Search logic + keyboard shortcuts

admin/widgets/
└── search-bar.html          # Search input + results dropdown
```

**Chức năng:**
- Keyboard shortcut (Cmd/Ctrl + K)
- Search types: Leads, Campaigns, Clients, Emails
- Fuzzy search (Fuse.js)
- Recent searches (localStorage)
- Quick navigation

---

## 🎨 PHASE 2: UX IMPROVEMENTS (Priority: HIGH)

### 2.1 Accessibility Fixes (157 issues) ⭐⭐⭐

**Từ AUDIT-SUMMARY.md:**
- ~100 form inputs without labels
- ~50 icon buttons without aria-label

**Action Plan:**
```bash
# Scripts
scripts/a11y/
├── add-labels.js           # Auto-add aria-labels
└── audit-fix.js            # Batch fix
```

**Files to fix:**
- admin/ (46 files)
- portal/ (22 files)
- affiliate/ (8 files)

**Pattern:**
```html
<!-- Before -->
<input type="text" id="lead-name">

<!-- After -->
<input type="text" id="lead-name" aria-label="Tên khách hàng tiềm năng">
<label for="lead-name" class="sr-only">Tên khách hàng tiềm năng</label>
```

---

### 2.2 Loading States ⭐⭐⭐

**Components:**
```
assets/js/
├── skeleton-loader.js     # Skeleton screen generator
└── loading-overlay.js     # Full-page loader

assets/css/
└── loading-styles.css     # Loading animations
```

**Patterns:**
- Skeleton loaders for cards/tables
- Spinner for buttons (loading state)
- Progress bars for file uploads
- Shimmer effect

---

### 2.3 Error Boundaries ⭐⭐

**Components:**
```
assets/js/
└── error-boundary.js        # Global error handler
```

**Implementation:**
```javascript
window.addEventListener('error', (e) => {
    // Log to analytics
    // Show user-friendly error message
    // Offer retry
});

window.addEventListener('unhandledrejection', (e) => {
    // Handle promise rejections
});
```

---

### 2.4 Responsive Enhancements ⭐⭐

**Focus:** Mobile navigation improvements

**Từ PR_REVIEW.md:** mobile-navigation.js có 14 issues

**Improvements:**
- Hamburger menu animation
- Touch-friendly tap targets (48px min)
- Swipe gestures (future)
- Bottom navigation for mobile

---

### 2.5 Performance Optimization ⭐⭐

**Từ PERFORMANCE.md:**

**Actions:**
1. **Lazy Loading:** Images, components below fold
2. **Bundle Optimization:** Code splitting, tree shaking
3. **Cache Strategy:** Service worker cache-first
4. **Image Optimization:** WebP, responsive images

**Scripts:**
```bash
npm run perf:audit          # Lighthouse CI
npm run perf:bundle-report  # Bundle size analysis
```

---

## 📋 IMPLEMENTATION CHECKLIST

### Phase 1: Features (Days 1-5)

- [ ] 1.1 Dashboard Analytics Widgets
  - [ ] KPI Card component
  - [ ] Traffic chart component
  - [ ] Conversion funnel component
  - [ ] API integration

- [ ] 1.2 Notification System
  - [ ] Toast component
  - [ ] Notification manager
  - [ ] Notification center UI

- [ ] 1.3 Dark Mode Toggle
  - [ ] Theme manager
  - [ ] CSS custom properties
  - [ ] Toggle button UI

- [ ] 1.4 Global Search
  - [ ] Search logic
  - [ ] Keyboard shortcuts
  - [ ] Results dropdown

### Phase 2: UX (Days 6-8)

- [ ] 2.1 Accessibility Fixes (157 issues)
  - [ ] Form input labels
  - [ ] Icon button aria-labels
  - [ ] OG tags for landing pages

- [ ] 2.2 Loading States
  - [ ] Skeleton loaders
  - [ ] Button loading states
  - [ ] Progress indicators

- [ ] 2.3 Error Boundaries
  - [ ] Global error handler
  - [ ] User-friendly messages

- [ ] 2.4 Responsive Enhancements
  - [ ] Mobile nav improvements
  - [ ] Touch target sizes

- [ ] 2.5 Performance Optimization
  - [ ] Lazy loading
  - [ ] Bundle report

### Phase 3: Testing & Polish (Days 9-10)

- [ ] Unit tests cho new components
- [ ] E2E tests cho user flows
- [ ] Cross-browser testing
- [ ] Performance audit (Lighthouse)
- [ ] Accessibility audit (axe-core)

---

## 📈 METRICS & SUCCESS CRITERIA

| Metric | Before | Target | Measurement |
|--------|--------|--------|-------------|
| Accessibility Score | 85% | 95%+ | axe-core |
| Lighthouse Performance | 75 | 90+ | Lighthouse CI |
| Lighthouse Best Practices | 80 | 95+ | Lighthouse CI |
| Bundle Size | 500KB | <400KB | bundle-report |
| Test Coverage | 60% | 80%+ | Playwright |

---

## 🔧 TECHNICAL REQUIREMENTS

### Dependencies to Add

```json
{
  "dependencies": {
    "chart.js": "^4.4.0",
    "fuse.js": "^7.0.0"
  }
}
```

### Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile Safari/Chrome

---

## 📝 FILES SẼ TẠO/SỬA

### New Files (estimated)
- ~15 new JS files (components, utils)
- ~10 new HTML widgets
- ~3 new CSS files
- ~5 test files

### Modified Files (estimated)
- ~20 existing admin/*.html files (a11y fixes)
- ~15 existing portal/*.html files (a11y fixes)
- index.html (add new components)
- assets/js/shared/*.js (enhancements)

---

## 🚀 DEPLOYMENT PLAN

1. **Development:** Feature branches per component
2. **Staging:** Integration testing
3. **Production:** Gradual rollout (10% → 50% → 100%)

---

**Approved by:** _Pending_
**Start Date:** 2026-03-13
**Target Complete:** 2026-03-23

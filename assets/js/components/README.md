# UI Components — Sa Đéc Marketing Hub

**Version:** 1.0.0 | **Last Updated:** 2026-03-13

Reusable UI components built with Vanilla JavaScript and Material Design 3 tokens.

---

## Architecture

```
assets/js/components/
├── index.js              # Main export file
├── data-table.js         # Data table with sorting, pagination, search
├── tabs.js               # Tab component with animations
├── accordion.js          # Collapsible accordion panels
├── tooltip.js            # Tooltip manager
├── scroll-to-top.js      # Scroll-to-top button
├── command-palette.js    # Command palette (Ctrl+K)
├── error-boundary.js     # Error boundary component
├── kpi-card.js           # KPI metric card
├── loading-button.js     # Button with loading state
├── mobile-responsive.js  # Mobile responsive utilities
├── notification-bell.js  # Notification bell widget
├── payment-modal.js      # Payment modal dialog
├── sadec-navbar.js       # Navigation bar
├── sadec-sidebar.js      # Side navigation
├── theme-manager.js      # Theme management
└── theme-toggle.js       # Theme toggle button
```

---

## Usage

### Import Components

```javascript
// Import all components
import { DataTable, Tabs, Accordion, Tooltip, ScrollToTop } from './components/index.js';

// Or import individually
import { DataTable } from './components/data-table.js';
```

### Auto-Initialization

Most components auto-initialize via `data-` attributes:

```html
<!-- DataTable -->
<div class="mekong-data-table" data-table="users"></div>

<!-- Tabs -->
<div class="tabs" data-tabs="main-tabs"></div>

<!-- Accordion -->
<div class="accordion" data-accordion="faq"></div>

<!-- Tooltip -->
<button data-tooltip="Click to save">Save</button>
```

---

## Component API

### DataTable

**File:** `data-table.js` | **Lines:** 800

Features:
- Sorting (single/multi-column)
- Pagination with page size selector
- Global search
- Column filters
- Row selection (single/multiple)
- CSV export
- Virtual scrolling (for large datasets)

**Usage:**
```javascript
const table = new DataTable('#users', {
  data: [...],
  columns: [
    { field: 'name', header: 'Tên', type: 'text' },
    { field: 'email', header: 'Email', type: 'text' },
    { field: 'status', header: 'Trạng thái', type: 'status' }
  ],
  sortable: true,
  searchable: true,
  pageSize: 10
});

// Methods
table.setData(newData);
table.goToPage(2);
table.exportToCSV();
table.refresh();
```

**Events:**
- `onSort` — Triggered when sorting
- `onPageChange` — Triggered on page change
- `onSearch` — Triggered on search input
- `onSelect` — Triggered when row selected

---

### Tabs

**File:** `tabs.js` | **Lines:** 403

Features:
- Animated tab switching
- Keyboard navigation (Arrow keys)
- Hash sync with URL
- Lazy content loading

**Usage:**
```html
<div class="tabs" data-tabs="main">
  <div class="tabs__list">
    <button class="tabs__tab" data-tab="tab1">Tab 1</button>
    <button class="tabs__tab" data-tab="tab2">Tab 2</button>
  </div>
  <div class="tabs__content" data-content="tab1">Content 1</div>
  <div class="tabs__content" data-content="tab2">Content 2</div>
</div>
```

```javascript
const tabs = new TabsManager('#main');
tabs.switchTo('tab2');

// Events
tabs.on('switch', (tabId) => console.log('Switched to', tabId));
```

---

### Accordion

**File:** `accordion.js` | **Lines:** 405

Features:
- Expand/collapse animations
- Single or multiple panel mode
- Icon rotation
- Keyboard support

**Usage:**
```html
<div class="accordion" data-accordion="faq" data-multiple="false">
  <div class="accordion__item">
    <button class="accordion__header">
      <span>Question 1</span>
      <span class="accordion__icon">▼</span>
    </button>
    <div class="accordion__content">Answer 1</div>
  </div>
</div>
```

```javascript
const accordion = new AccordionManager('#faq');
accordion.expand(0); // Expand first item
accordion.collapseAll();
```

---

### Tooltip

**File:** `tooltip.js` | **Lines:** 340

Features:
- Position detection (top/bottom/left/right)
- Hover and focus triggers
- ARIA support
- Auto-hide on escape

**Usage:**
```html
<button data-tooltip="Save changes" data-tooltip-position="top">
  Save
</button>
```

```javascript
// Programmatic control
Tooltip.show(element, 'Custom tooltip content');
Tooltip.hide(element);
```

---

### ScrollToTop

**File:** `scroll-to-top.js` | **Lines:** 410

Features:
- Smooth scroll animation
- Progress ring indicator
- Keyboard shortcut (Ctrl/Cmd + Home)
- Auto-show after 300px scroll

**Usage:**
```html
<button id="scroll-to-top" aria-label="Scroll to top"></button>
```

```javascript
const scrollTop = new ScrollToTopManager('#scroll-to-top');
// Auto-initializes on page load
```

---

## Styling

All components use Material Design 3 tokens from `m3-agency.css`:

```css
/* Example: KPI Card */
.kpi-card {
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
```

### Dark Mode

All components support dark mode via `[data-theme="dark"]`:

```css
[data-theme="dark"] .kpi-card {
  background: var(--md-sys-color-surface-dark);
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}
```

---

## Accessibility

All components follow WCAG 2.1 AA guidelines:

| Component | ARIA Support | Keyboard Navigation | Focus Management |
|-----------|--------------|---------------------|------------------|
| DataTable | ✅ | ✅ | ✅ |
| Tabs | ✅ | ✅ (Arrow keys) | ✅ |
| Accordion | ✅ | ✅ (Enter/Space) | ✅ |
| Tooltip | ✅ | ✅ (Focus trigger) | ✅ |
| ScrollToTop | ✅ | ✅ (Ctrl+Home) | ✅ |

---

## Testing

Run component tests:

```bash
# UI component tests
npx playwright test tests/new-ui-components.spec.ts

# Responsive tests
npx playwright test tests/responsive-check.spec.ts

# Smoke tests
npx playwright test tests/smoke-all-pages.spec.ts
```

---

## Contributing

### Component Structure

```javascript
/**
 * Component Name
 * Description
 * @version 1.0.0
 */

class ComponentName {
  constructor(selector, options = {}) {
    // Initialize
  }

  init() {
    // Setup DOM, bind events
  }

  // Public API methods
  method1() {}
  method2() {}

  // Internal methods
  _privateMethod() {}
}

// Export
window.ComponentName = ComponentName;
export { ComponentName };
export default ComponentName;
```

### Required Documentation

- [ ] JSDoc comments for class and public methods
- [ ] Usage examples in README
- [ ] Accessibility checklist completed
- [ ] Keyboard navigation tested
- [ ] Dark mode tested

---

## Changelog

### 2026-03-13
- Added: DataTable component (800 lines)
- Added: Tabs, Accordion, Tooltip components
- Added: ScrollToTop with progress ring
- Fixed: CSS bundle references in portal files

### 2026-03-07
- Initial component architecture
- Theme Manager, Theme Toggle
- Notification Bell, KPI Card

---

## Related

- [Shared Utilities](../shared/)
- [Services](../services/)
- [Design Tokens](../../css/m3-agency.css)

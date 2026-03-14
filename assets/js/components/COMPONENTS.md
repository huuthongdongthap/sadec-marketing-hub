# Components Index - Sa Đéc Marketing Hub

## UI Components Registry

### Core UX Components
| Component | File | Description |
|-----------|------|-------------|
| Toast | `toast-manager.js` | Notification system (5 types) |
| SadecToast | `sadec-toast.js` | Enhanced toast with animations |
| ErrorBoundary | `error-boundary.js` | Error handling wrapper |
| Theme | `theme-manager.js` | Dark/light mode toggle |
| MobileUI | `mobile-responsive.js` | Mobile responsive enhancements |

### Enhanced Components
| Component | File | Description |
|-----------|------|-------------|
| LoadingButton | `loading-button.js` | Button with loading state |
| PaymentStatusChip | `payment-status-chip.js` | Payment status indicator |

### New Components (2026-03-13)
| Component | File | Description | Features |
|-----------|------|-------------|----------|
| **Tooltip** | `tooltip.js` | Tooltip hints | Position detection, hover/focus, ARIA, dark mode, micro-animations |
| **Tabs** | `tabs.js` | Tab navigation | Animated switch, keyboard nav, hash sync, lazy loading |
| **Accordion** | `accordion.js` | Expand/collapse | Smooth animation, icon rotation, keyboard nav, nested support |
| **DataTable** | `data-table.js` | Data table | Sorting, pagination, search, filter, row select, CSV export |
| **ScrollToTop** | `scroll-to-top.js` | Scroll to top button | Show on scroll, smooth animation, progress ring, keyboard shortcut |

### Features
| Component | File | Description |
|-----------|------|-------------|
| AIGenerator | `ai-content-generator.js` | AI content generation |
| AnalyticsDashboard | `analytics-dashboard.js` | Analytics dashboard |

---

## CSS Components

| File | Description |
|------|-------------|
| `tooltip.css` | Tooltip styles with animations |
| `tabs.css` | Tabs navigation styles |
| `accordion.css` | Accordion expand/collapse styles |
| `data-table.css` | DataTable comprehensive styles |
| `scroll-to-top.css` | ScrollToTop button styles (inline in JS) |

---

## Usage

### Import in HTML
```html
<script type="module" src="assets/js/components/index.js"></script>
```

### JavaScript Access
```javascript
// Global API
Tooltip.show(element, 'Helpful text');
Tabs.select('my-tabs', 'tab2');
Accordion.expand('faq', 0);
DataTable.init('#table', { data: [...], columns: [...] });
ScrollToTop.scrollTo();

// Via MekongComponents
MekongComponents.Tooltip.show(el, 'Content');
MekongComponents.Tabs.select('tabs', 'tab1');
```

### HTML Examples

#### Tooltip
```html
<button data-tooltip="Helpful info" data-tooltip-position="top">
  Hover me
</button>
```

#### Tabs
```html
<div class="mekong-tabs" data-tabs="main-tabs">
  <div role="tablist">
    <button role="tab" data-tab="tab1" class="mekong-tabs__tab">Tab 1</button>
    <button role="tab" data-tab="tab2" class="mekong-tabs__tab">Tab 2</button>
  </div>
  <div role="tabpanel" data-panel="tab1">Content 1</div>
  <div role="tabpanel" data-panel="tab2">Content 2</div>
</div>
```

#### Accordion
```html
<div class="mekong-accordion" data-accordion="faq">
  <div class="mekong-accordion__item">
    <button class="mekong-accordion__header" aria-expanded="false">
      <span class="mekong-accordion__title">Question?</span>
    </button>
    <div class="mekong-accordion__panel">
      <div class="mekong-accordion__content">Answer</div>
    </div>
  </div>
</div>
```

#### DataTable
```html
<div id="users-table"></div>
<script type="module">
  const table = new DataTable('#users-table', {
    data: [...],
    columns: [
      { header: 'Name', field: 'name' },
      { header: 'Email', field: 'email' }
    ],
    sortable: true,
    searchable: true,
    pageSize: 10
  });
</script>
```

---

**Last Updated:** 2026-03-13
**Total Components:** 12 core + 5 new = 17 components

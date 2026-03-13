# Utilities Documentation - Sa Đéc Marketing Hub

## Architecture Overview

```
assets/js/
├── core-utils.js          ← SINGLE SOURCE OF TRUTH (Recommended import source)
├── shared/
│   └── format-utils.js    ← Core formatting functions
├── enhanced-utils.js      ← UI components & extended utilities
├── utils.js               ← Legacy (re-exports from core-utils)
├── ui-utils.js            ← UI-specific utilities (animations, loading)
├── admin/
│   ├── admin-utils.js     ← Admin-specific utilities + re-exports
│   └── admin-shared.js    ← Admin specialized components
└── portal/
    ├── portal-utils.js    ← Portal-specific utilities + re-exports
    └── portal-data.js     ← Portal data layer
```

## Import Guide

### ✅ RECOMMENDED: Import from core-utils.js

```javascript
// Clean, single source of truth
import {
    formatCurrency,
    formatCurrencyVN,
    Toast,
    ThemeManager,
    debounce,
    truncate
} from './core-utils.js';
```

### ⚠️ LEGACY: Direct module imports (Still supported)

```javascript
// These still work but are not recommended for new code
import { formatCurrency } from './shared/format-utils.js';
import { Toast, ThemeManager } from './enhanced-utils.js';
```

### 🎯 MODULE-SPECIFIC: Admin/Portal utilities

```javascript
// Admin modules - includes admin-specific utilities
import { formatCurrency, ModalManager, exportToCSV } from './admin/admin-utils.js';

// Portal modules - includes portal-specific utilities
import { formatCurrency, isValidEmail, waitForDOM } from './portal/portal-utils.js';
```

## API Reference

### Format Utilities

| Function | Description | Example |
|----------|-------------|---------|
| `formatCurrency(amount, currency?)` | Format as VND currency | `formatCurrency(1000000)` → `"1.000.000 ₫"` |
| `formatCurrencyCompact(amount)` | Compact notation | `formatCurrencyCompact(1000000)` → `"1 Tr"` |
| `formatCurrencyVN(amount)` | Vietnamese style with B/M suffix | `formatCurrencyVN(1500000000)` → `"1.5B VNĐ"` |
| `formatNumber(num)` | Format number with K/M suffix | `formatNumber(1500)` → `"1.5K"` |
| `formatDate(date, style?)` | Format date | `formatDate(new Date(), 'long')` |
| `formatDateTime(date)` | Format date + time | `formatDateTime(new Date())` |
| `formatRelativeTime(dateString)` | Relative time | `formatRelativeTime('2024-01-01')` → `"2 ngày trước"` |
| `truncate(str, length?)` | Truncate string | `truncate('Long text', 10)` → `"Long text..."` |
| `debounce(fn, delay?)` | Debounce function | `debounce(search, 300)` |
| `throttle(fn, limit?)` | Throttle function | `throttle(scroll, 100)` |

### UI Components

| Class/Function | Description | Example |
|----------------|-------------|---------|
| `Toast` | Notification system | `Toast.success('Done!')` |
| `ThemeManager` | Dark/Light theme | `ThemeManager.toggle()` |
| `ScrollProgress` | Scroll progress bar | `ScrollProgress.init()` |
| `MobileSidebar` | Mobile sidebar toggle | `MobileSidebar.init()` |
| `createElement(tag, props, children)` | Create DOM element | `createElement('div', {className: 'foo'}, ['text'])` |
| `escapeHTML(str)` | Escape HTML entities | `escapeHTML('<script>')` |

### String Utilities

| Function | Description | Example |
|----------|-------------|---------|
| `capitalize(str)` | Capitalize first letter | `capitalize('hello')` → `"Hello"` |
| `getInitials(name)` | Get initials from name | `getInitials('Nguyen Van A')` → `"NVA"` |
| `slugify(str)` | Create URL slug | `slugify('Hello World')` → `"hello-world"` |

### Array Utilities

| Function | Description | Example |
|----------|-------------|---------|
| `groupBy(array, key)` | Group array by key | `groupBy(users, 'role')` |
| `sortBy(array, key, order?)` | Sort array by key | `sortBy(users, 'name', 'desc')` |
| `sum(array, key)` | Sum array values | `sum(orders, 'total')` |
| `average(array, key)` | Average array values | `average(orders, 'total')` |

### Other Utilities

| Function | Description | Example |
|----------|-------------|---------|
| `generateId(prefix?)` | Generate unique ID | `generateId('user')` → `"user-1234567890-abc123"` |
| `formatPercent(value, decimals?)` | Format percentage | `formatPercent(75.5, 1)` → `"75.5%"` |

## Admin-Specific Utilities

```javascript
import {
    formatCurrency,
    ModalManager,      // Modal dialog manager
    exportToCSV,       // Export data to CSV
    setupSearchFilter, // Setup search filter on list
    setupKeyboardShortcuts // Setup keyboard shortcuts
} from './admin/admin-utils.js';
```

## Portal-Specific Utilities

```javascript
import {
    formatCurrency,
    isValidEmail,      // Validate email format
    isValidPhone,      // Validate Vietnamese phone
    isRequired,        // Validate required field
    parseNumber,       // Parse Vietnamese number format
    escapeHtml,        // Escape HTML for XSS prevention
    waitForDOM,        // Wait for DOM element
    getStorageItem,    // Safe localStorage get
    setStorageItem,    // Safe localStorage set
    removeStorageItem  // Remove localStorage item
} from './portal/portal-utils.js';
```

## Migration Guide

### From old pattern to new pattern:

**Before:**
```javascript
// Multiple imports from different sources
import { formatCurrency } from './shared/format-utils.js';
import { Toast, ThemeManager } from './enhanced-utils.js';
import { debounce } from './utils.js';
```

**After:**
```javascript
// Single import from core-utils
import { formatCurrency, Toast, ThemeManager, debounce } from './core-utils.js';
```

## Best Practices

1. **Always use core-utils.js** for new code
2. **Module-specific imports** only when you need admin/portal-specific utilities
3. **Avoid direct imports** from shared/format-utils.js or enhanced-utils.js
4. **Tree-shaking**: ES modules automatically eliminate unused exports
5. **Type safety**: Use JSDoc comments for better IDE support

## Testing

```javascript
// Example test for utility functions
import { formatCurrencyVN, truncate, slugify } from './core-utils.js';

describe('Format Utilities', () => {
    test('formatCurrencyVN formats billions correctly', () => {
        expect(formatCurrencyVN(1500000000)).toBe('1.5B VNĐ');
    });

    test('truncate limits string length', () => {
        expect(truncate('Hello World', 5)).toBe('Hello...');
    });

    test('slugify creates valid slug', () => {
        expect(slugify('Hello World!')).toBe('hello-world');
    });
});
```

# Portal Modules

Bộ modules cho Client Portal - Mekong Marketing Hub

## Cấu trúc

```
assets/js/portal/
├── index.js              # Main entry point, re-export tất cả
├── supabase.js           # Supabase client singleton
├── portal-auth.js        # Auth helpers & DEMO_INVOICES
├── portal-data.js        # DEMO_PROJECTS & data loading
├── portal-ui.js          # UI components (Toast, Modal, render functions)
├── portal-utils.js       # Utility functions (format, validate, etc.)
├── portal-projects.js    # Projects feature (load, display, filter)
├── portal-invoices.js    # Invoices feature (load, display, payments)
├── portal-payments.js    # Payment processing logic
└── portal-dashboard.js   # Dashboard loading & stats
```

## Modules

### `supabase.js`
- Supabase client singleton
- Auth helpers compatibility layer
- Data helpers (projects, invoices, activities)

### `portal-auth.js`
- `DEMO_INVOICES` - Demo invoice data
- `isDemoMode()` - Check if in demo mode
- `getCurrentUser()` - Get current authenticated user
- `requireAuth()` - Require authentication with redirect

### `portal-data.js`
- `DEMO_PROJECTS` - Demo project data
- `loadProjects()` - Load projects from Supabase or demo
- `loadInvoices()` - Load invoices from Supabase or demo
- `getProjectById(id)` - Get single project
- `getInvoiceById(id)` - Get single invoice

### `portal-ui.js`
- `ToastManager` - Toast notification class
- `ModalManager` - Modal dialog class
- `renderProjects(container, list)` - Render projects grid
- `renderInvoices(tableBody, list)` - Render invoices table
- `updateInvoiceStats(list)` - Update invoice statistics

### `portal-utils.js`
- `formatCurrency(amount)` - Format VND currency
- `formatDate(dateString)` - Format date (vi-VN)
- `timeAgo(isoString)` - Relative time
- `truncate(text, len)` - Truncate text
- `escapeHtml(text)` - XSS prevention
- `isValidEmail(email)` - Email validation
- `isValidPhone(phone)` - Vietnamese phone validation
- `debounce(func, wait)` - Debounce utility
- `throttle(func, limit)` - Throttle utility
- `waitForDOM(selector)` - Wait for element
- `getStorageItem(key)` - Safe localStorage get
- `setStorageItem(key, value)` - Safe localStorage set

### `portal-projects.js`
- `showProjectDetail(project)` - Show project detail modal
- `loadProjects(grid, filter)` - Load and render projects
- `filterProjectsByStatus(projects, status)` - Filter by status

### `portal-invoices.js`
- `showInvoiceDetail(invoice)` - Show invoice detail modal
- `loadInvoices(table)` - Load and render invoices
- `setupInvoiceRealtime(table)` - Setup realtime updates
- `payInvoiceOnline(invoice)` - Process online payment
- `downloadInvoicePDF(invoice)` - Download invoice PDF
- `markInvoiceAsPaid(invoiceId)` - Mark as paid (manual)

### `portal-payments.js`
- Payment processing logic
- Payment UI components
- Payment history management

### `portal-dashboard.js`
- `loadDashboard()` - Load dashboard stats
- `loadActivityFeed()` - Load activity feed
- `loadDeadlines()` - Load upcoming deadlines

### `portal/index.js` (Main Entry)
Re-exports all modules and auto-initializes based on page:
- `projects.html` → Loads projects grid + filter
- `invoices.html` → Loads invoices table + realtime
- `dashboard.html` → Loads dashboard stats

## Sử dụng

### Import trực tiếp từ modules

```javascript
// Import specific functions
import { loadProjects, showProjectDetail } from '../assets/js/portal/portal-projects.js';
import { formatCurrency } from '../assets/js/portal/portal-utils.js';
import { toast } from '../assets/js/portal/index.js';

// Or import everything
import * as Portal from '../assets/js/portal/index.js';

// Use
await loadProjects(gridElement);
toast.success('Tải dự án thành công!');
```

### Import từ portal-client.js (backwards compatible)

```javascript
import portalClient from '../assets/js/portal-client.js';

// Use
await portalClient.loadProjects(gridElement);
portalClient.toast.success('Thành công!');
```

## Migration Guide

### Code cũ
```javascript
import { loadProjects, toast } from './portal-client.js';
```

### Code mới (recommended)
```javascript
import { loadProjects, toast } from './portal/index.js';
// or
import { loadProjects } from './portal/portal-projects.js';
import { toast } from './portal/portal-ui.js';
```

## Benefits

1. **Tree-shaking friendly** - Import only what you need
2. **Better organization** - Code separated by feature
3. **Easier testing** - Small, focused modules
4. **Maintainability** - Easier to find and fix bugs
5. **Backwards compatible** - Old imports still work

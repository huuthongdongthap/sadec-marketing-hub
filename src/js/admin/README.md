# Admin Modules

Bộ modules cho Admin Panel - Mekong Marketing Hub

## Cấu trúc

```
assets/js/admin/
├── index.js              # Main entry point, re-export tất cả
├── admin-data.js         # DEMO_CAMPAIGNS, DEMO_LEADS & helpers
├── admin-utils.js        # Utils & UI components (Toast, Modal)
├── admin-campaigns.js    # Campaigns feature
├── admin-leads.js        # Leads feature
├── admin-clients.js      # Clients/Customers feature
├── admin-dashboard.js    # Dashboard loading & stats
└── README.md             # Documentation
```

## Modules

### `admin-data.js`
- `DEMO_CAMPAIGNS` - Demo campaign data
- `DEMO_LEADS` - Demo lead data
- `getPlatformIcon(platform)` - Get platform emoji icon
- `getPlatformLabel(platform)` - Get platform Vietnamese label
- `getCampaignStatusLabel(status)` - Get campaign status label
- `getLeadStatusLabel(status)` - Get lead status label
- `getTemperatureColor(temp)` - Get lead temperature color

### `admin-utils.js`
- `formatCurrency(amount)` - Format VND currency
- `formatNumber(num)` - Format number with separators
- `formatDate(dateString)` - Format date (vi-VN)
- `formatRelativeTime(isoString)` - Relative time
- `debounce(func, wait)` - Debounce utility
- `truncate(text, len)` - Truncate text
- `ToastManager` - Toast notification class
- `ModalManager` - Modal dialog class
- `exportToCSV(data, filename)` - Export to CSV
- `setupSearchFilter(input, items, renderFn)` - Search filter setup
- `setupKeyboardShortcuts(handlers)` - Keyboard shortcuts

### `admin-campaigns.js`
- `showCampaignDetail(campaign)` - Show campaign detail modal
- `loadCampaigns(tableBody)` - Load and render campaigns
- `renderCampaigns(tableBody, list)` - Render campaigns table
- `updateCampaignStats(list)` - Update campaign statistics

### `admin-leads.js`
- `showLeadDetail(lead)` - Show lead detail modal
- `loadLeads(grid, pipeline)` - Load leads (cards + pipeline)
- `renderLeadCards(container, list)` - Render lead cards
- `renderPipeline(container, list)` - Render pipeline board

### `admin-clients.js`
- `loadClients(tableBody)` - Load clients table
- `renderClients(tableBody, list)` - Render clients table
- `showClientDetail(client)` - Show client detail modal
- `editClient(client)` - Edit client (placeholder)
- `DEMO_CLIENTS` - Demo client data

### `admin-dashboard.js`
- `loadDashboard()` - Load dashboard stats
- `updateDashboardStats(stats)` - Update stats UI
- `animateCountUp(element, value)` - Count-up animation
- `createSparkline(data, trend)` - Create sparkline SVG

### `admin/index.js` (Main Entry)
Re-exports all modules and auto-initializes based on page:
- `dashboard.html` → Loads dashboard stats
- `campaigns.html` → Loads campaigns table
- `leads.html` → Loads leads (cards + pipeline)
- `clients.html` → Loads clients table

## Sử dụng

### Import trực tiếp từ modules

```javascript
// Import specific functions
import { loadCampaigns, showCampaignDetail } from '../assets/js/admin/admin-campaigns.js';
import { formatCurrency, toast } from '../assets/js/admin/index.js';

// Or import everything
import * as Admin from '../assets/js/admin/index.js';

// Use
await loadCampaigns(tableBody);
toast.success('Tải chiến dịch thành công!');
```

### Import từ admin-client.js (backwards compatible)

```javascript
import adminClient from '../assets/js/admin-client.js';

// Use
await adminClient.loadCampaigns(tableBody);
adminClient.toast.success('Thành công!');
```

## Migration Guide

### Code cũ
```javascript
import { loadCampaigns, toast } from './admin-client.js';
```

### Code mới (recommended)
```javascript
import { loadCampaigns, toast } from './admin/index.js';
// or
import { loadCampaigns } from './admin/admin-campaigns.js';
import { toast } from './admin/admin-utils.js';
```

## Benefits

1. **Tree-shaking friendly** - Import only what you need
2. **Better organization** - Code separated by feature
3. **Easier testing** - Small, focused modules
4. **Maintainability** - Easier to find and fix bugs
5. **Backwards compatible** - Old imports still work

## Auto-Initialization

Khi page load, module tự động detect và initialize:

```javascript
// dashboard.html → loadDashboard()
// campaigns.html → loadCampaigns(tableBody)
// leads.html → loadLeads(grid, pipeline)
// clients.html → loadClients(tableBody)
```

Chỉ cần import `admin-client.js` hoặc `admin/index.js` trong HTML.

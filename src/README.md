# src/ — Source Code Structure

**Sa Đéc Marketing Hub** — Modern Marketing Platform

---

## 📁 Directory Structure

```
src/
├── js/                      # JavaScript source code
│   ├── core/                # Core utilities & base functionality
│   │   ├── utils.js         # Legacy utils (re-exports for backwards compat)
│   │   ├── core-utils.js    # Central export point for all utilities
│   │   └── enhanced-utils.js # Comprehensive utilities (Toast, ThemeManager, etc.)
│   │
│   ├── components/          # Reusable UI components
│   │   ├── mobile-navigation.js   # Mobile sidebar navigation
│   │   ├── mobile-menu.js         # Mobile menu toggle
│   │   ├── toast-notification.js  # Toast notification system
│   │   └── keyboard-shortcuts.js  # Keyboard shortcuts handler
│   │
│   ├── modules/             # Feature modules
│   │   ├── pipeline/        # Pipeline management
│   │   ├── workflows/       # Workflow automation
│   │   ├── content-calendar/ # Content calendar
│   │   └── campaign-optimizer/ # Campaign optimization
│   │
│   ├── api/                 # API & data layer
│   │   ├── supabase.js      # Supabase client & queries
│   │   ├── approvals.js     # Approval workflow
│   │   └── data-sync-init.js # Data synchronization
│   │
│   ├── shared/              # Shared utilities
│   │   ├── format-utils.js  # Formatting functions (currency, date, number)
│   │   ├── api-client.js    # HTTP client wrapper
│   │   ├── api-utils.js     # API helper functions
│   │   ├── dom-utils.js     # DOM manipulation utilities
│   │   ├── guard-utils.js   # Route guards & protection
│   │   └── modal-utils.js   # Modal dialog utilities
│   │
│   ├── admin/               # Admin-specific code
│   │   ├── admin-utils.js   # Admin utilities
│   │   ├── admin-guard.js   # Admin route protection
│   │   └── components/      # Admin components
│   │
│   ├── portal/              # Portal-specific code
│   │   ├── portal-utils.js  # Portal utilities
│   │   ├── portal-guard.js  # Portal route protection
│   │   └── components/      # Portal components
│   │
│   ├── charts/              # Chart components
│   ├── features/            # Feature flags & A/B tests
│   └── widgets/             # Dashboard widgets
│
├── css/                     # Stylesheets
│   ├── base/                # Base styles (reset, variables, typography)
│   ├── components/          # Component styles
│   └── pages/               # Page-specific styles
│
└── html/                    # HTML templates
    ├── layouts/             # Base layouts
    ├── partials/            # Reusable partials
    └── pages/               # Full page templates
```

---

## 🎯 Module Responsibilities

### `core/` — Core Utilities

**Purpose:** Single source of truth for utility functions.

```javascript
// Import pattern
import { formatCurrency, Toast, createElement } from './core/core-utils.js';

// Or via enhanced-utils
import { generateId, slugify, groupBy } from './core/enhanced-utils.js';
```

**Key exports:**
- Format utilities: `formatCurrency`, `formatDate`, `formatNumber`
- DOM utilities: `createElement`, `escapeHTML`
- String utilities: `capitalize`, `slugify`, `getInitials`
- Array utilities: `groupBy`, `sortBy`, `sum`, `average`
- UI classes: `Toast`, `ThemeManager`, `ScrollProgress`

---

### `components/` — UI Components

**Purpose:** Reusable UI components not tied to specific features.

| Component | Description |
|-----------|-------------|
| `mobile-navigation.js` | Mobile sidebar with overlay, touch gestures |
| `mobile-menu.js` | Mobile menu toggle button |
| `toast-notification.js` | Toast notification system |
| `keyboard-shortcuts.js` | Global keyboard shortcut handler |

---

### `modules/` — Feature Modules

**Purpose:** Business logic for specific features.

| Module | Files | Description |
|--------|-------|-------------|
| Pipeline | `pipeline.js`, `pipeline-client.js` | Lead pipeline management |
| Workflows | `workflows.js`, `workflows-client.js` | Workflow automation |
| Content Calendar | `content-calendar.js`, `content-calendar-client.js` | Content scheduling |
| Campaign Optimizer | `campaign-optimizer.js` | Campaign performance optimization |

---

### `api/` — Data Layer

**Purpose:** API communication & data management.

| File | Description |
|------|-------------|
| `supabase.js` | Supabase client, queries, real-time subscriptions |
| `approvals.js` | Approval workflow engine |
| `data-sync-init.js` | Data synchronization initialization |

---

### `shared/` — Shared Utilities

**Purpose:** Shared utilities used across multiple modules.

| File | Description |
|------|-------------|
| `format-utils.js` | Currency, date, number formatting |
| `api-client.js` | HTTP client wrapper with error handling |
| `api-utils.js` | API helper functions |
| `dom-utils.js` | DOM manipulation utilities |
| `guard-utils.js` | Route guards & protection |
| `modal-utils.js` | Modal dialog utilities |

---

## 📝 Import Conventions

### DO ✅

```javascript
// Import from core utilities
import { formatCurrency, Toast } from '../core/core-utils.js';

// Import from shared utilities
import { formatCurrency } from '../shared/format-utils.js';

// Import from modules
import { PipelineManager } from '../modules/pipeline.js';
```

### DON'T ❌

```javascript
// Don't import from legacy utils.js (use core-utils.js instead)
import { formatCurrency } from '../utils.js'; // WRONG

// Don't import from deep paths
import { x } from '../../assets/js/shared/format-utils.js'; // WRONG

// Don't use relative imports across modules
import { x } from '../../admin/admin-utils.js'; // WRONG
```

---

## 🔧 Build Process

### Pre-build

```bash
npm run prebuild
# 1. Inject environment variables
# 2. Optimize lazy loading
```

### Build

```bash
npm run build
# Minify HTML, CSS, JS
```

### Full Optimization

```bash
npm run optimize:full
# 1. CSS bundling
# 2. Lazy loading optimization
# 3. Minification
# 4. Bundle report
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with UI
npm run test:ui

# Show report
npm run test:report
```

---

## 📊 File Organization Principles

1. **Single Responsibility** — Each file has one purpose
2. **Clear Dependencies** — Import from explicit paths
3. **No Circular Dependencies** — Dependency graph is a DAG
4. **Co-location** — Related code lives together
5. **Backwards Compatibility** — Legacy imports still work via re-exports

---

## 🚀 Migration Guide

### From `assets/js/` to `src/js/`

| Old Path | New Path |
|----------|----------|
| `assets/js/utils.js` | `src/js/core/utils.js` |
| `assets/js/core-utils.js` | `src/js/core/core-utils.js` |
| `assets/js/enhanced-utils.js` | `src/js/core/enhanced-utils.js` |
| `assets/js/shared/format-utils.js` | `src/js/shared/format-utils.js` |
| `assets/js/mobile-navigation.js` | `src/js/components/mobile-navigation.js` |
| `assets/js/pipeline.js` | `src/js/modules/pipeline.js` |
| `assets/js/supabase.js` | `src/js/api/supabase.js` |

---

**Last Updated:** 2026-03-13
**Version:** 5.0.0

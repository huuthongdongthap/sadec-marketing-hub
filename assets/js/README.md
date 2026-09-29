# Assets/JS - JavaScript Modules

Thư mục JavaScript modules cho Sa Đéc Marketing Hub.

## Structure

```
assets/js/
├── clients/           # API client modules
│   ├── index.js       # Re-exports
│   ├── admin-client.js
│   ├── dashboard-client.js
│   ├── finance-client.js
│   ├── pipeline-client.js
│   └── ...
├── guards/            # Auth guard modules
│   ├── index.js       # Re-exports
│   ├── admin-guard.js
│   ├── portal-guard.js
│   └── guard-utils.js
├── services/          # Business logic services
│   ├── index.js       # Re-exports (30+ modules)
│   ├── admin-shared.js
│   ├── agents.js
│   ├── ai-assistant.js
│   └── ...
├── shared/            # Shared utilities
│   ├── api-client.js  # Base API client
│   ├── api-utils.js   # HTTP helpers
│   ├── dom-utils.js   # DOM manipulation
│   ├── format-utils.js # Formatting helpers
│   ├── guard-utils.js  # Auth guards
│   └── modal-utils.js  # Modal control
├── components/        # UI components
├── charts/            # Chart widgets
├── features/          # Feature modules
├── widgets/           # Dashboard widgets
├── hooks/             # Custom hooks
├── lib/               # External libraries
├── modules/           # Feature modules
├── pages/             # Page components
├── stores/            # State management
└── [root files]       # Core modules
    ├── supabase.js    # Supabase client (large)
    ├── dark-mode.js   # Dark mode toggle
    ├── keyboard-shortcuts.js
    ├── loading-states.js
    ├── micro-animations.js
    ├── mobile-menu.js
    ├── mobile-navigation.js
    ├── ui-enhancements.js
    └── ui-enhancements-controller.js
```

## Import Examples

### From clients/
```javascript
// Old way
import DashboardClient from '../dashboard-client.js';

// New way (recommended)
import { DashboardClient } from '../clients/index.js';
// Or
import { DashboardClient } from '../clients/';
```

### From guards/
```javascript
// Old way
import { requireAdmin } from '../admin-guard.js';

// New way (recommended)
import { requireAdmin, isAdmin } from '../guards/';
```

### From services/
```javascript
// Old way
import Ecommerce from '../ecommerce.js';

// New way (recommended)
import { Ecommerce } from '../services/';
```

### From shared/
```javascript
// Direct import (no index needed)
import { formatCurrency } from '../shared/format-utils.js';
import { getJSON } from '../shared/api-utils.js';
import { waitForAuth } from '../shared/guard-utils.js';
```

## Module Categories

### clients/ (8 modules)
API client classes for each feature domain.
- `admin-client.js` - Admin API
- `dashboard-client.js` - Dashboard data
- `finance-client.js` - Finance/billing
- `pipeline-client.js` - Sales pipeline
- `workflows-client.js` - Workflow automation
- `content-calendar-client.js` - Content calendar
- `campaign-optimizer.js` - Campaign optimization
- `binh-phap-client.js` - Binh Phap module

### guards/ (3 files)
Authentication and authorization guards.
- `admin-guard.js` - Admin route protection
- `portal-guard.js` - Portal route protection
- `guard-utils.js` - Shared guard utilities

### services/ (30+ modules)
Business logic and feature services.
- Core utilities (`core-utils.js`, `enhanced-utils.js`, `ui-utils.js`)
- Feature services (`agents.js`, `ai-assistant.js`, `ecommerce.js`, etc.)
- UI utilities (`form-validation.js`, `toast-notification.js`, etc.)

### shared/ (6 modules)
Cross-cutting utilities used everywhere.
- `api-client.js` - Base API client class
- `api-utils.js` - HTTP helper functions
- `dom-utils.js` - DOM manipulation utilities
- `format-utils.js` - Formatting (currency, numbers, dates)
- `guard-utils.js` - Auth guard helpers
- `modal-utils.js` - Modal dialog control

## Best Practices

1. **Use index.js for imports** - Cleaner imports from subdirectories
2. **Import from shared/ for utilities** - Single source of truth
3. **Keep modules focused** - One responsibility per file
4. **JSDoc documentation** - All public APIs should be documented
5. **ES6+ modules** - Use import/export, not require/module.exports

## Migration Status

| Directory | Status | Files |
|-----------|--------|-------|
| clients/ | ✅ Complete | 8 modules |
| guards/ | ✅ Complete | 3 files |
| services/ | ✅ Complete | 30+ modules |
| shared/ | ✅ Complete | 6 modules |
| components/ | ✅ Existing | 15 modules |
| charts/ | ✅ Existing | 5 types |
| features/ | ✅ Existing | 4 features |
| widgets/ | ✅ Existing | Dashboard widgets |

## Legacy Root Files

Các files sau vẫn ở root vì:
- **Large, central modules** (`supabase.js` - 30KB)
- **UI/UX controllers** (`ui-enhancements.js`, `loading-states.js`)
- **Animation/motion** (`micro-animations.js`)
- **Navigation** (`mobile-menu.js`, `mobile-navigation.js`)
- **Core functionality** (`dark-mode.js`, `keyboard-shortcuts.js`)

Future sprints may further organize these files.

---

**Last Updated:** 2026-03-13
**Refactoring Sprint:** `/eng:tech-debt`

# Refactoring Plan - Consolidate Duplicate Code

## Identified Duplicate Modules

### 1. Supabase Client (3 files)
- `core/supabase-client.js` - Unified client with auth, db, storage, realtime
- `portal/supabase.js` - Legacy client with auth, projects, invoices, activities
- `supabase-config.js` - Global Supabase configuration

**Action**: Keep `core/supabase-client.js` as primary, update `portal/supabase.js` to re-export from core

### 2. API Utils (3 files)
- `utils/api.js` - ApiClientBase class with render helpers
- `shared/api-client.js` - Same as above
- `shared/api-utils.js` - fetchWithAuth, queryTable, etc.

**Action**: Consolidate into `shared/api.js` with all utilities

### 3. UI Enhancements (2 files)
- `ui-enhancements.js` - Scroll animations, micro-interactions
- `ui-enhancements-2026.js` - Newer version with same functionality

**Action**: Merge into single `ui-enhancements.js` with best of both

## Import Map

### Before → After

| Old Import | New Import |
|------------|------------|
| `./portal/supabase.js` | `./core/supabase-client.js` |
| `./shared/api-client.js` | `./shared/api.js` |
| `./shared/api-utils.js` | `./shared/api.js` |
| `./utils/api.js` | `./shared/api.js` |

## Files to Update

### Portal imports (6 files):
- portal/portal-projects.js
- portal/portal-invoices.js
- portal/index.js
- portal/portal-payments.js
- portal/portal-data.js
- portal/portal-dashboard.js

### API imports (2 files):
- dashboard-client.js
- finance-client.js

## Migration Steps

1. Create consolidated `shared/api.js`
2. Update `portal/supabase.js` to re-export from `core/supabase-client.js`
3. Update all import statements
4. Run tests to verify no breakage
5. Remove duplicate files

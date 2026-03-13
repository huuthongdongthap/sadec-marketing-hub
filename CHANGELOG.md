# Changelog

All notable changes to the **Sa Đéc Marketing Hub** project will be documented in this file.

## [v4.2.0] - 2026-03-13

### 🚀 Major Features
- **Dashboard Widgets System:**
  - Added KPI card components with real-time data formatting
  - Implemented traffic chart visualization with Chart.js
  - Created conversion funnel display for analytics
  - Added project progress tracker widget
  - Implemented activity feed component for dashboard updates

- **Responsive Design Overhaul:**
  - New responsive CSS fixes (`assets/css/responsive-fix-2026.css`)
  - Enhanced mobile navigation with improved hamburger menu
  - Touch-friendly tap targets (48px minimum)
  - Bottom navigation support for mobile devices

### 🔧 Refactoring & Cleanup
- **Dead Code Removal:**
  - Removed 664 lines of unused/dead code across 132 files
  - Cleaned up console.log statements from production code
  - Removed deprecated audit scripts
  - Consolidated duplicate utilities into shared modules

- **Script Cleanup:**
  - Removed 30+ standalone audit/migration scripts (moved to tooling)
  - Streamlined build scripts (cache-busting, css-bundle, minify)
  - Cleaned up SEO audit scripts (centralized metadata)

### 📦 Component Updates
- **Widget System:** Enhanced `widgets/index.js` with modular component registration
- **Theme Manager:** Added dynamic theme switching support
- **Error Boundary:** Implemented global error handler (`components/error-boundary.js`)
- **API Utils:** Consolidated API calls into `shared/api-utils.js`

### 🧪 Testing
- **New E2E Tests:**
  - Added dashboard widgets tests (`tests/dashboard-widgets.spec.ts`)
  - Expanded components/widgets tests (73 new test cases)
  - Improved Playwright configuration for better coverage

### 📈 Technical Debt
- Reduced bundle size by removing dead code
- Improved code maintainability through consolidation
- Enhanced test coverage for critical user flows
- Fixed accessibility issues across admin pages

### 📝 Files Changed
- **132 files modified:** 1604 insertions(+), 664 deletions(-)
- **New files:** PLAN_FEATURES_UX_2026-03-13.md, responsive CSS bundle, debug scripts
- **Key updates:** 46 admin pages, 8 affiliate pages, 15 portal pages

## [v4.1.0] - 2026-03-13

### 🚀 Major Features
- **UI Enhancements 2027:**
  - Added new CSS theme with modern design system (`assets/css/ui-enhancements-2027.css`)
  - Implemented UI controller for dynamic component behavior (`assets/js/ui-enhancements-controller.js`)
  - Enhanced visual styling across all admin pages

### 🔧 Refactoring & Cleanup
- **Meta Tag Consolidation:**
  - Removed duplicate SEO meta tags from 30+ admin pages
  - Centralized Open Graph, Twitter Card, and Schema.org JSON-LD
  - Reduced average file size by ~50 lines per page (1.5KB total reduction)
- **Files Modified:** 32 HTML files across admin, affiliate, and portal sections
- **Net Change:** -100 insertions, -1591 deletions

### 📦 Component Updates
- **Sidebar Enhancement:** Added new features to `sadec-sidebar.js` component
- **Widget Improvements:** Updated `widgets-demo.html` and `widgets/kpi-card.html` with enhanced functionality

### 📈 Technical Debt
- Eliminated code duplication across marketing hub pages
- Improved maintainability through single-source-of-truth meta configuration
- Reduced page load time through HTML minification

## [v4.0.0] - 2026-01-27

### 🚀 Major Features (Growth & Automation)
- **Lead Scoring AI:**
  - Added `score-lead` Edge Function for automated lead qualification (A-F grading).
  - Implemented database triggers to auto-score new leads.
  - Updated CRM UI to display Hot/Warm/Cold badges and sort by priority.
- **Zalo OA Integration:**
  - Added `zalo_messages` and `zalo_users` database schemas.
  - Built Mock Zalo Webhook for local development and testing.
  - Created Zalo Chat Interface (`admin/zalo.html`) for direct customer support.
- **Client Success Reports:**
  - Implemented `client_reports` schema for storing monthly/campaign reports.
  - Integrated `jsPDF` for client-side PDF generation.
  - Added Report History and Download portal for clients (`portal/reports.html`).
- **Landing Page Builder:**
  - Created Drag-and-Drop Builder (`admin/landing-builder.html`) with JSON-based storage.
  - Implemented high-performance public renderer (`lp.html`).
  - Added responsive templates for Hero, Features, and Form blocks.

### 🛠️ Improvements
- **UI/UX:**
  - Enhanced mobile responsiveness for Sidebar and Data Tables.
  - Standardized Meta tags and SEO descriptions across new pages.
  - Improved Empty States and Loading indicators.
- **Infrastructure:**
  - Consolidated SQL migrations into `database/phase5_execution.sql`.
  - Updated `deploy.sh` for reliable Vercel deployments.
  - Hardened environment variable injection for client-side security.

### 🔧 Fixes
- Fixed Sidebar navigation links for Marketing tools.
- Resolved "Tenant not found" issues in database connection scripts by updating connection strings.
- Corrected Client Portal report download links.

## [v3.0.0] - 2026-01-20
- **Refactoring:** Complete architectural overhaul to "AgencyOS" structure.
- **Web Components:** Introduced `sadec-sidebar` and shared UI components.
- **Supabase:** Migrated auth and database logic to centralized modules.

# Changelog

All notable changes to the **Sa Đéc Marketing Hub** project will be documented in this file.

## [v4.4.0] - 2026-03-13 - UI Enhancements & SEO Release

### 🎨 UI Enhancements
- **Notification Bell Component:**
  - Real-time notifications với badge indicator
  - Notification panel dropdown
  - Mark as read/unread functionality
  - LocalStorage persistence
  - Relative time display (5 phút trước, 1 giờ trước)
  - Material Icons integration

- **Micro-Animations Utilities:**
  - `shake()` - Error feedback cho form validation
  - `pop()` - Success feedback cho button clicks
  - `pulse()` - Attention indicator cho notifications
  - `countUp()` - Number counter animation cho KPI cards
  - `fadeIn()`, `slideIn()` - Smooth page transitions

- **Loading States Manager:**
  - Spinner loaders (3 sizes: sm, md, lg)
  - Skeleton loaders cho cards và content blocks
  - Fullscreen loading overlay
  - Nested loading counter (prevent duplicate loaders)
  - ARIA accessibility support

- **UI Animations CSS:**
  - Page transitions (fade, slide, scale)
  - Hover effects (card lift, glow, scale)
  - Button shine và ripple effects
  - Smooth transitions với cubic-bezier easing

### 📈 SEO Improvements
- **SEO Metadata cho tất cả HTML pages:**
  - Title tags cho từng trang
  - Meta descriptions
  - Open Graph tags (og:title, og:description, og:image, og:url)
  - Twitter Card tags
  - Canonical URLs
  - Schema.org JSON-LD structured data

### 🔧 Audit Scripts
- **New Scripts:**
  - `auto-fix.js` - Auto-fix audit issues
  - `comprehensive-audit.js` - Comprehensive audit tool
  - `notification-bell.js` - Notification component

### 📝 Files Changed
- **Key updates:** notification-bell.js, micro-animations.js, loading-states.js
- **SEO:** Tất cả HTML pages thêm metadata
- **Audit:** Auto-fix và comprehensive audit scripts

---

## [v4.3.0] - 2026-03-13 - Performance Optimization Release

### ⚡ Performance Optimization
- **Minification Pipeline:**
  - HTML minification với `html-minifier-terser` (giảm 30-40%)
  - CSS minification với `clean-css` level 2 (giảm 50-60%)
  - JS minification với `terser` ECMA 2020 (giảm 40-50%)
  - Build output: `dist/` folder với optimized files

- **Lazy Loading:**
  - Tự động thêm `loading="lazy"` cho images không nằm trong hero/header
  - `decoding="async"` cho async image decoding
  - Lazy loading cho iframes (YouTube embeds)
  - Blur-up placeholder effect với `class="lazy-image"`

- **Preloading & Prefetching:**
  - Preload hero images (first image trong hero section)
  - DNS prefetch cho external domains (fonts.googleapis.com, cdn.jsdelivr.net)
  - Preconnect cho Supabase CDN

### 🔧 Cache Strategy
- **Service Worker v2.1.0-perf:**
  - Cache version upgrade: v2.0.0 → v2.1.0-perf
  - Static assets: Cache First, 1 năm (immutable)
  - Images: Cache First với TTL 30 ngày
  - HTML pages: Stale While Revalidate (5 phút)
  - API calls: Network First với cache fallback (5 phút)

- **Vercel Cache Headers:**
  - `/assets/*`: `public, max-age=31536000, immutable`
  - `/images/*`: `public, max-age=2592000, stale-while-revalidate=604800`
  - `/*.html`: `public, max-age=0, must-revalidate, stale-while-revalidate=300`
  - `/api/*`: `private, no-store, no-cache, must-revalidate`

### 🎨 UI Enhancements
- **Loading States:**
  - Skeleton loaders cho cards và content blocks
  - Loading spinner với CSS animations
  - Progressive content reveal

- **Micro-Animations:**
  - Hover effects enhancements
  - Button press feedback
  - Smooth transitions cho UI elements

### 📦 New Files
- `assets/js/loading-states.js` - Skeleton loader utilities
- `assets/js/micro-animations.js` - Animation controllers
- `analyze-test-coverage.py` - Coverage analysis tool
- `check-coverage.py` - Coverage checker
- `PERFORMANCE_REPORT_2026-03-13.md` - Performance audit report

### 🧪 Testing
- Test coverage analysis scripts
- Responsive check improvements
- Smoke tests coverage expansion

### 📈 Performance Metrics
| Metric | Before | Target | Status |
|--------|--------|--------|--------|
| Bundle Size | ~19MB | -50% | ✅ Achieved |
| LCP | ~3.5s | <2.5s | 🎯 Target |
| FID | ~150ms | <100ms | 🎯 Target |
| CLS | - | <0.1 | 🎯 Target |

### 📝 Files Changed
- **80 files modified:** 1431 insertions(+), 78 deletions(-)
- **Key updates:** sw.js, vercel.json, tất cả HTML pages
- **Build output:** dist/ folder với minified files

---

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

# ARCHITECTURE UPGRADE BLUEPRINT: SA DEC MARKETING HUB (V3.0)

## 1. Project Context & Current Architecture
**Project:** Sa Đéc Marketing Hub - Agency OS for Local SMEs
**Current Stack:**
- **Frontend:** Pure HTML/CSS/JS (Vanilla)
- **Design System:** Material Design 3 Expressive (Teal #006A60 / Gold #9C6800)
- **Backend:** Supabase (Auth, Database, Realtime)
- **Key Logic Files:** `auth.js`, `supabase-config.js`, `material-interactions.js`
- **Data Structure:** See `supabase-schema-v3.sql` and `setup-db.js`

## 2. Upgrade Goals (Target: 100/100 Enterprise Grade)
We need to refactor the current "Client-Side" heavy architecture into a secure, scalable "Edge-Native" architecture while maintaining the high performance of Vanilla JS.

## 3. Implementation Phases (Execute in Order)

### PHASE 1: Security Hardening & Data Integrity (Highest Priority)
**Problem:** Currently, database config and logic reside in `supabase-config.js` and `auth.js` on the client side.
**Tasks:**
1.  **Row Level Security (RLS):**
    - Audit `supabase-schema-v3.sql`
    - Create RLS policies ensuring Clients can ONLY view their own reports in `client-portal.html`
    - Ensure Agencies can view all assigned clients but not other Agencies' data
2.  **Environment Variables:**
    - Move all sensitive keys from `supabase-config.js` to environment variables (`.env`)
    - Refactor `deploy.sh` to inject these variables during the build process

### PHASE 2: Logic Migration to Edge Functions
**Problem:** Business logic (e.g., commission calculation in `affiliate-dashboard.html`) is exposed in frontend JS.
**Tasks:**
1.  **Affiliate Logic:** Move calculation logic from `affiliate.html` to Supabase Edge Functions
2.  **Auth Flow:** Enhance `auth.js` to validate user roles (Admin/Agency/Client) via server-side tokens

### PHASE 3: UI/UX Componentization (Web Components)
**Problem:** Repeating HTML code across `admin-dashboard.html`, `agency-platform.html`, and `client-portal.html`
**Tasks:**
1.  **Create Components:** Refactor Sidebar, Navbar, Toast Notifications into native Web Components
2.  **Mobile Optimization:** Update `layout-safe.css` to ensure data tables support horizontal scrolling

### PHASE 4: Automation & DevOps
**Problem:** Manual database setup via `test-data-100.sql`
**Tasks:**
1.  **CI/CD Pipeline:** Create GitHub Actions workflow for linting before deploying to Vercel
2.  **Database Seeding:** Convert `setup-db.js` into a robust migration script using Supabase CLI

## 4. Reference Files
- **Auth Logic:** `auth.js`
- **Styling Core:** `m3-agency.css`, `layout-safe.css`
- **Database Schema:** `supabase-schema-v3.sql`
- **Entry Points:** `index.html`, `login.html`, `register.html`
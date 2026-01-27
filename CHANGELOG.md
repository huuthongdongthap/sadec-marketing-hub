# Changelog

All notable changes to the **Sa Đéc Marketing Hub** project will be documented in this file.

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

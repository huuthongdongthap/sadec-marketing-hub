# Pre-Flight Deployment Checklist

- **Project:** Sa Đéc & Cao Lãnh Marketing Hub (Mekong Agency OS)
- **Target Environment:** Cloudflare Pages (Production)
- **Target Domains:** 
  - `https://sadec-marketing-hub.pages.dev/` (Default Cloudflare Pages Domain)
  - `https://sadec-marketing-hub.pages.dev/partnership` (Co-founder Portal & Interactive ROI Calculator)
- **Date & Timestamp:** 2026-09-30 08:43:00 +07:00
- **Git Branch:** `cao-linh-2026-update` (reconciled with `main`)

---

## 1. Codebase & Build Integrity
- [x] **Repository Status Clean:** Working directory reconciled, untracked files excluded.
- [x] **Dependencies Resolved:** `package.json` lockfile verified with `npm ci`.
- [x] **Static Asset Pipeline:** `npm run build` executed minification (`scripts/build/minify.js`), environment injection (`scripts/tools/inject-env.js`), and lazy loading optimization (`scripts/build/optimize-lazy.js`).
- [x] **Security Secrets Scan:** Supabase keys sanitized; zero hardcoded raw JWT tokens in public markup.
- [x] **File Hygiene:** Zero `.bak` residual files.

---

## 2. Platform & Deployment Configuration
- [x] **Wrangler Configuration:** `wrangler.toml` configured with `pages_build_output_dir = "."`.
- [x] **Headers & Cache Policies:** `_headers` defined with 1-year immutable caching for static assets, security headers (CSP, HSTS, X-Frame-Options) for HTML.
- [x] **Redirects:** `_redirects` and native Cloudflare Pages clean URLs enabled (`/partnership.html` -> `/partnership`).

---

## 3. Co-Founder Deliverables Pre-check
- [x] **Partnership Landing Page:** `/partnership.html` with responsive Material Design 3 tokens.
- [x] **Client-side ROI Calculator:** Real-time vanilla JS engine calculating monthly and annual cashflows (Weddings, Retainers, Eco-tours, OPEX Cao Lãnh).
- [x] **Asset Safety Net:** Explicit contractual safeguards (Equipment ownership, Client relationship non-compete, 6-month trial milestone).
- [x] **Curriculum Blueprint:** AI Problem-Solving Academy documentation (`docs/ai-academy-curriculum-blueprint.md`).

---

## Verification Sign-off
- **Pre-flight Status:** **PASSED** (Ready for production propagation)

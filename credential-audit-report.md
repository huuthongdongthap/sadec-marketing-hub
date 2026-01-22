# Credential Audit Report

**Date:** 2026-01-22
**Status:** ⚠️ Critical Issues Found

## 1. Hardcoded Secrets Audit

### 🚨 Critical Findings (High Risk)
These files contain sensitive secrets (Service Role Keys, Database Passwords) and appear to be tracked in git (not in .gitignore).

1.  **`mekong-env.js`**
    *   **Secrets**: `SUPABASE_SERVICE_KEY`, `DB_CONNECTION_STRING` (Password: `TtmDATA@2026`)
    *   **Risk**: **CRITICAL**. This file allows full administrative access to the Supabase project and database. It bypasses RLS.
    *   **Recommendation**:
        *   Add `mekong-env.js` to `.gitignore` IMMEDIATELY.
        *   Rotate the Service Role Key and Database Password in Supabase Dashboard.
        *   Use `.env` files for local development.

2.  **`database/migrate.js`**
    *   **Secrets**: Hardcoded fallback `DB_CONNECTION_STRING` with password.
    *   **Risk**: High. If `mekong-env` fails, these credentials are exposed in the source code.
    *   **Recommendation**: Remove hardcoded fallback. Throw error if config/env is missing.

3.  **`database/run-migrations.js`**
    *   **Secrets**: Hardcoded fallback DB credentials.
    *   **Risk**: High.
    *   **Recommendation**: Remove hardcoded fallback.

### ⚠️ Warnings (Medium/Low Risk)
These files contain keys that are generally safe to expose if RLS is configured, or demo credentials.

1.  **`supabase-config.js`**
    *   **Secrets**: `SUPABASE_ANON_KEY`
    *   **Risk**: Low/Normal. Anon keys are designed to be public. Security relies on Row Level Security (RLS) policies in the database.
    *   **Note**: Falls back to hardcoded values if `window.__ENV__` is missing.

2.  **`assets/js/supabase.js`**
    *   **Secrets**: `SUPABASE_ANON_KEY`
    *   **Risk**: Low/Normal. Duplicate of config in `supabase-config.js`.

## 2. Demo Credentials (Publicly Exposed)
The following credentials are hardcoded in `auth.js`, `test-login.js`, and `create-users.js`. Anyone with access to the codebase can login as these users.

| Role | Email | Password | Source File(s) |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@mekongmarketing.com` | `admin123` / `Admin@2026` | `auth.js`, `test-login.js`, `create-users.js` |
| **Manager** | `manager@mekongmarketing.com` | `manager123` / `Manager@2026` | `auth.js`, `test-login.js`, `create-users.js` |
| **Content Creator** | `creator@mekongmarketing.com` | `creator123` / `Creator@2026` | `auth.js`, `test-login.js`, `create-users.js` |
| **Client** | `client@mekongmarketing.com` | `client123` / `Client@2026` | `auth.js`, `test-login.js`, `create-users.js` |
| **Affiliate** | `affiliate@mekongmarketing.com` | `affiliate123` / `Affiliate@2026` | `auth.js`, `test-login.js`, `create-users.js` |

*Note: In `create-users.js`, passwords are stronger (e.g., `Admin@2026`) than in `auth.js` fallback/demo mode (e.g., `admin123`).*

## 3. Gitignore Verification
*   **`.env`**: ✅ Ignored
*   **`env.js`**: ✅ Ignored
*   **`mekong-env.js`**: ❌ **NOT IGNORED** (Critical)
*   **`*.key`**: Not explicitly ignored, but no `.key` files found.

## 4. Supabase Config Audit
*   **Service Role Key Exposed?**: No, `supabase-config.js` and client-side files only use the Anon Key.
*   **Exception**: `mekong-env.js` (Server-side config) exposes the Service Role Key.

## Action Plan
1.  [ ] Add `mekong-env.js` to `.gitignore`.
2.  [ ] Remove hardcoded secrets from `database/migrate.js` and `database/run-migrations.js`.
3.  [ ] (Optional) Move demo credentials to a separate configuration file or rely solely on database.

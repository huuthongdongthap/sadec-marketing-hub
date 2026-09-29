/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AUTH.JS - Re-export from supabase-config.js
 *
 * This file now serves as a compatibility layer for existing code imports.
 * All auth functionality has been consolidated into supabase-config.js.
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Re-export everything from supabase-config.js
// The actual implementation is in supabase-config.js

/**
 * Usage (both work the same):
 *
 * import './auth.js';  // or
 * import './supabase-config.js';
 *
 * // Then access:
 * window.Auth.State      - Auth state management
 * window.Auth.Actions    - Auth actions (signIn, signUp, signOut)
 * window.Auth.Guards     - Auth guards (requireAuth, requireRole)
 * window.Auth.UI         - Auth UI helpers
 * window.Auth.ROLES      - Role constants
 * window.Auth.ROLE_LEVELS - Role hierarchy
 * window.AuthAPI         - Low-level Supabase auth API
 * window.SupabaseAPI     - Supabase client wrapper
 * window.AdminAPI        - Admin CRUD operations
 * window.KPIAPI          - Dashboard stats
 * window.BinhPhapAPI     - Strategic data & WIN³ metrics
 */

// Auto-init on DOM ready (already handled by supabase-config.js)
// This empty listener ensures auth.js can be loaded independently
document.addEventListener('DOMContentLoaded', () => {
    // Auth state is already initialized by supabase-config.js
});

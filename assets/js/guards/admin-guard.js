/**
 * ADMIN GUARD - Require Authentication for Admin Pages
 *
 * Usage: Include this script in admin pages to require authentication
 *
 * <script type="module" src="../assets/js/admin-guard.js"></script>
 *
 * Redirects unauthenticated users to login page.
 * Skips guard on localhost for demo mode.
 */

import { waitForAuth, isAdmin, isStaff, getCurrentUser } from '../shared/guard-utils.js';

(async function adminGuard() {
    const isLocalhost = ['localhost', '127.0.0.1', ''].includes(window.location.hostname);

    // Skip guard on localhost for demo mode
    if (isLocalhost) {
        return;
    }

    try {
        // Wait for Auth to be available (up to 5 seconds)
        await waitForAuth(5000);

        // Initialize auth state
        await window.Auth.State.init();

        // Check authentication
        if (!window.Auth.State.isAuthenticated) {
            const currentPath = window.location.pathname;
            const redirectParam = encodeURIComponent(currentPath + window.location.search);

            // Redirect to login with current page as redirect param
            window.location.replace(`/auth/login.html?redirect=${redirectParam}`);
            return;
        }

        // Optional: Check for admin/staff role using shared guards
        if (isAdmin() || isStaff()) {
            // User is authenticated with admin/staff role - export user info
            window.__ADMIN_USER__ = {
                id: window.Auth.State.user?.id,
                email: window.Auth.State.user?.email,
                role: window.Auth.State.getRole?.(),
                profile: window.Auth.State.profile
            };
        } else {
            // Not an admin/staff role - redirect to appropriate dashboard
            const role = window.Auth.State.getRole?.();
            const ROLE_REDIRECTS = {
                'client': '/portal/dashboard.html',
                'affiliate': '/affiliate/dashboard.html'
            };
            const redirectUrl = ROLE_REDIRECTS[role] || '/';
            window.location.replace(redirectUrl);
            return;
        }

        // Listen for sign-out events
        window.addEventListener('auth:signout', () => {
            window.location.replace('/auth/login.html');
        });

    } catch (error) {
        // [DEV] '[Admin Guard] Error:', error);
        // Don't block page on guard errors — graceful degradation
    }
})();

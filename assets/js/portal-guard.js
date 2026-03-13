/**
 * Portal Route Guard
 * Redirects unauthenticated users to login page.
 * Uses centralized Auth system from auth.js
 *
 * Skip guard on localhost for demo mode.
 */

import { waitForAuth, getCurrentUser } from './shared/guard-utils.js';

// Main guard logic
(async function portalGuard() {
    const isLocalhost = ['localhost', '127.0.0.1', ''].includes(window.location.hostname);

    // Skip guard entirely on localhost for demo mode
    if (isLocalhost) {
        return;
    }

    try {
        // Wait for Auth system to load
        await waitForAuth();

        // Initialize auth state
        await window.Auth.State.init();

        // Check authentication
        if (!window.Auth.State.isAuthenticated) {
            const currentPath = window.location.pathname;
            const currentPage = currentPath.substring(currentPath.lastIndexOf('/') + 1);

            // Don't redirect if already on login page
            if (currentPage === 'login.html') {
                return;
            }

            // Redirect to login with current page as redirect param
            const redirectParam = encodeURIComponent(currentPath + window.location.search);
            window.location.replace(`/portal/login.html?redirect=${redirectParam}`);
            return;
        }

        // User is authenticated - export user info for other scripts
        window.__PORTAL_USER__ = {
            id: window.Auth.State.user?.id,
            email: window.Auth.State.user?.email,
            profile: window.Auth.State.profile
        };

        // Listen for sign-out events
        window.addEventListener('auth:signout', () => {
            window.location.replace('/portal/login.html');
        });

    } catch (error) {
        // [DEV] '[Portal Guard] Error:', error);
        // Don't block page on guard errors — graceful degradation
    }
})();

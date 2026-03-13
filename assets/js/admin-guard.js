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

(async function adminGuard() {
    const isLocalhost = ['localhost', '127.0.0.1', ''].includes(window.location.hostname);

    // Skip guard on localhost for demo mode
    if (isLocalhost) {
        // [REMOVED] console.log('[Admin Guard] Skipping on localhost (demo mode)');
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

        // Optional: Check for admin role
        const role = window.Auth.State.getRole?.();
        const adminRoles = ['super_admin', 'admin', 'manager', 'content_creator'];

        if (role && !adminRoles.includes(role)) {
            // Not an admin role - redirect to appropriate dashboard
            const ROLE_REDIRECTS = {
                'client': '/portal/dashboard.html',
                'affiliate': '/affiliate/dashboard.html'
            };
            const redirectUrl = ROLE_REDIRECTS[role] || '/';
            window.location.replace(redirectUrl);
            return;
        }

        // User is authenticated with admin role - export user info
        window.__ADMIN_USER__ = {
            id: window.Auth.State.user?.id,
            email: window.Auth.State.user?.email,
            role: role,
            profile: window.Auth.State.profile
        };

        // Listen for sign-out events
        window.addEventListener('auth:signout', () => {
            window.location.replace('/auth/login.html');
        });

    } catch (error) {
        // [DEV] '[Admin Guard] Error:', error);
        // Don't block page on guard errors — graceful degradation
    }
})();

/**
 * Wait for Auth system to be available
 */
function waitForAuth(timeout = 5000) {
    return new Promise((resolve, reject) => {
        if (window.Auth && window.Auth.Guards) {
            resolve();
            return;
        }

        const startTime = Date.now();
        const checkInterval = setInterval(() => {
            if (window.Auth && window.Auth.Guards) {
                clearInterval(checkInterval);
                resolve();
            } else if (Date.now() - startTime > timeout) {
                clearInterval(checkInterval);
                reject(new Error('Auth system not loaded'));
            }
        }, 100);
    });
}

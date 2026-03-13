/**
 * Sa Đéc Marketing Hub - Shared Guard Utilities
 *
 * Centralized auth guard functions for consistent authentication checks.
 * Replaces duplicate waitForAuth implementations across guard files.
 *
 * @module shared/guard-utils
 */

/**
 * Wait for Supabase auth to initialize
 * @param {number} [timeout=5000] - Timeout in milliseconds
 * @returns {Promise<void>} Resolves when auth is ready, rejects on timeout
 */
export function waitForAuth(timeout = 5000) {
    return new Promise((resolve, reject) => {
        // Check if already available
        if (window.Auth && window.Auth.Guards) {
            resolve();
            return;
        }

        const startTime = Date.now();
        const checkInterval = 50; // Check every 50ms

        const interval = setInterval(() => {
            if (window.Auth && window.Auth.Guards) {
                clearInterval(interval);
                resolve();
            } else if (Date.now() - startTime > timeout) {
                clearInterval(interval);
                reject(new Error('Auth timeout exceeded'));
            }
        }, checkInterval);
    });
}

/**
 * Check if user is admin
 * @returns {boolean} True if user has admin role
 */
export function isAdmin() {
    if (!window.Auth?.Guards) return false;
    return window.Auth.Guards.isAdmin();
}

/**
 * Check if user is staff
 * @returns {boolean} True if user has staff role
 */
export function isStaff() {
    if (!window.Auth?.Guards) return false;
    return window.Auth.Guards.isStaff();
}

/**
 * Check if user is affiliate
 * @returns {boolean} True if user has affiliate role
 */
export function isAffiliate() {
    if (!window.Auth?.Guards) return false;
    return window.Auth.Guards.isAffiliate();
}

/**
 * Require admin role, redirect if not authorized
 * @param {string} [redirectUrl='/auth/login.html'] - URL to redirect if not authorized
 * @returns {Promise<boolean>} True if authorized
 */
export async function requireAdmin(redirectUrl = '/auth/login.html') {
    await waitForAuth();

    if (!isAdmin()) {
        window.location.href = redirectUrl;
        return false;
    }

    return true;
}

/**
 * Require staff role, redirect if not authorized
 * @param {string} [redirectUrl='/auth/login.html'] - URL to redirect if not authorized
 * @returns {Promise<boolean>} True if authorized
 */
export async function requireStaff(redirectUrl = '/auth/login.html') {
    await waitForAuth();

    if (!isStaff()) {
        window.location.href = redirectUrl;
        return false;
    }

    return true;
}

/**
 * Require affiliate role, redirect if not authorized
 * @param {string} [redirectUrl='/auth/login.html'] - URL to redirect if not authorized
 * @returns {Promise<boolean>} True if authorized
 */
export async function requireAffiliate(redirectUrl = '/auth/login.html') {
    await waitForAuth();

    if (!isAffiliate()) {
        window.location.href = redirectUrl;
        return false;
    }

    return true;
}

/**
 * Require authentication, redirect if not logged in
 * @param {string} [redirectUrl='/auth/login.html'] - URL to redirect if not authenticated
 * @returns {Promise<boolean>} True if authenticated
 */
export async function requireAuth(redirectUrl = '/auth/login.html') {
    await waitForAuth();

    if (!window.Auth?.Guards?.isLoggedIn()) {
        window.location.href = redirectUrl;
        return false;
    }

    return true;
}

/**
 * Get current user info
 * @returns {Object|null} User object or null
 */
export function getCurrentUser() {
    if (!window.Auth?.Guards) return null;
    return window.Auth.Guards.getCurrentUser();
}

/**
 * Get current user ID
 * @returns {string|null} User ID or null
 */
export function getCurrentUserId() {
    const user = getCurrentUser();
    return user?.id || null;
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export default {
    waitForAuth,
    isAdmin,
    isStaff,
    isAffiliate,
    requireAdmin,
    requireStaff,
    requireAffiliate,
    requireAuth,
    getCurrentUser,
    getCurrentUserId
};

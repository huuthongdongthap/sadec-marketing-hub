/**
 * Portal Guard Module
 * Authentication Guard & Access Control
 * 
 * Usage:
 *   import { requireAuth, checkPermission } from './portal-guard.js';
 */

import { initializeAuth, getCurrentUser, signOut } from './portal-auth.js';
import { Logger } from '../shared/logger.js';

const TAG = '[PortalGuard]';

// Initialize auth on load
initializeAuth();

/**
 * Require authentication - redirect if not authenticated
 * @param {string} redirectUrl - URL to redirect if not authenticated
 */
export function requireAuth(redirectUrl = '/auth/login.html') {
    const user = getCurrentUser();
    if (!user) {
        Logger.warn(TAG, 'User not authenticated, redirecting...');
        window.location.href = redirectUrl;
        return false;
    }
    return true;
}

/**
 * Check if user has permission
 * @param {string} permission - Required permission
 * @returns {boolean}
 */
export function checkPermission(permission) {
    const user = getCurrentUser();
    if (!user) return false;
    
    const userPermissions = user.permissions || [];
    return userPermissions.includes(permission) || user.role === 'admin';
}

/**
 * Require specific permission
 * @param {string} permission - Required permission
 * @param {string} redirectUrl - Redirect URL if no permission
 */
export function requirePermission(permission, redirectUrl = '/portal/unauthorized.html') {
    if (!checkPermission(permission)) {
        Logger.warn(TAG, `User lacks permission: ${permission}`);
        window.location.href = redirectUrl;
        return false;
    }
    return true;
}

/**
 * Check if user is authenticated (without redirect)
 * @returns {boolean}
 */
export function isAuthenticated() {
    return !!getCurrentUser();
}

/**
 * Get current user or null
 * @returns {Object|null}
 */
export function getUser() {
    return getCurrentUser();
}

/**
 * Logout and redirect
 * @param {string} redirectUrl
 */
export async function logout(redirectUrl = '/auth/login.html') {
    await signOut();
    Logger.info(TAG, 'User logged out');
    window.location.href = redirectUrl;
}

// Auto-init for pages that load this module
document.addEventListener('DOMContentLoaded', () => {
    Logger.info(TAG, 'Portal Guard initialized');
});

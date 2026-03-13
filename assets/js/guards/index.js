/**
 * Guards Index
 * Re-export all guard modules for easier imports
 * @module guards
 */

export {
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
} from './guard-utils.js';

export { default as AdminGuard } from './admin-guard.js';
export { default as PortalGuard } from './portal-guard.js';

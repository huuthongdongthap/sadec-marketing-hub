/**
 * ============================================================================
 * MEKONG AGENCY - UTILITIES (Legacy Compatibility Layer)
 * ============================================================================
 *
 * BACKWARD COMPATIBILITY FILE - Re-exports from core-utils.js
 *
 * NEW CODE should import from './core-utils.js' instead.
 * This file exists only to support legacy code that imports from './utils.js'.
 *
 * DEPRECATED: Do not use for new code. Use core-utils.js instead.
 */

// Re-export everything from core-utils
export * from './core-utils.js';

// ===== ADDITIONAL LEGACY EXPORTS =====
// These are kept here for backwards compatibility

// ===== ID GENERATION (if different from core-utils) =====
// Note: Now also exported from core-utils via enhanced-utils
export { generateId } from './enhanced-utils.js';

// ===== DEFAULT EXPORT FOR BACKWARDS COMPATIBILITY =====
import {
    formatCurrency,
    formatCurrencyCompact,
    formatCurrencyVN,
    formatNumber,
    formatDate,
    formatDateTime,
    formatRelativeTime,
    truncate,
    debounce,
    throttle,
    generateId
} from './core-utils.js';

export default {
    formatCurrency,
    formatCurrencyCompact,
    formatCurrencyVN,
    formatNumber,
    formatDate,
    formatDateTime,
    formatRelativeTime,
    truncate,
    debounce,
    throttle,
    generateId
};

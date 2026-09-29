/**
 * ==============================================
 * MEKONG AGENCY - SHARED FORMAT UTILITIES
 * Common formatting functions shared across modules
 *
 * NOTE: This file re-exports from src/js/shared/format-utils.js
 * to maintain backwards compatibility with existing imports.
 * ==============================================
 */

// Re-export all format utilities from canonical source
export {
    formatCurrency,
    formatCurrencyCompact,
    formatCurrencyVN,
    formatNumber,
    formatDate,
    formatDateTime,
    formatRelativeTime,
    truncate,
    debounce,
    throttle
} from '../../../src/js/shared/format-utils.js';

// Re-export default
export { default } from '../../../src/js/shared/format-utils.js';

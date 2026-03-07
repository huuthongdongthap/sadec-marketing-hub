/**
 * ==============================================
 * MEKONG AGENCY - UTILITIES
 * Shared utility functions
 *
 * Note: Format functions re-exported from shared/format-utils.js
 * ==============================================
 */

// ===== RE-EXPORTS FROM SHARED =====
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
} from './shared/format-utils.js';

// ===== ID GENERATION =====
export function generateId(prefix = 'id') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

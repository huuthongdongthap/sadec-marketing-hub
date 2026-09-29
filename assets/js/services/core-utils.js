/**
 * ============================================================================
 * MEKONG AGENCY - CORE UTILITIES (Single Source of Truth)
 * ============================================================================
 *
 * CENTRAL export point for ALL utility functions.
 * Import from this file or from 'services/index.js' (which re-exports this).
 *
 * USAGE:
 *   import { formatCurrency, Toast, ThemeManager } from './core-utils.js';
 *   // OR
 *   import { formatCurrency, Toast, ThemeManager } from './index.js';
 */

// ============================================================================
// FORMAT UTILITIES (from shared/format-utils.js)
// ============================================================================
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
} from '../shared/format-utils.js';

// ============================================================================
// ALL OTHER UTILITIES (from enhanced-utils.js)
// ============================================================================
export {
    generateId,
    formatPercent,
    capitalize,
    getInitials,
    slugify,
    groupBy,
    sortBy,
    sum,
    average,
    escapeHTML,
    createElement,
    Toast,
    ThemeManager,
    ScrollProgress,
    MobileSidebar
} from './enhanced-utils.js';

// Re-export services index for convenience
export * from './index.js';

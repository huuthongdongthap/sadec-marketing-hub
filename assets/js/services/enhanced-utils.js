/**
 * ==============================================
 * MEKONG AGENCY - ENHANCED UTILITIES
 *
 * NOTE: This file re-exports from canonical source
 * src/js/core/enhanced-utils.js to maintain backwards compatibility.
 *
 * All utility functions are consolidated in one location.
 * ==============================================
 */

// Re-export all utilities from canonical source
export {
    generateId,
    formatCurrency,
    formatCurrencyCompact,
    formatCurrencyVN,
    formatDate,
    formatDateTime,
    formatRelativeTime,
    formatNumber,
    formatPercent,
    truncate,
    capitalize,
    getInitials,
    slugify,
    groupBy,
    sortBy,
    sum,
    average,
    debounce,
    throttle,
    escapeHTML,
    createElement,
    Toast,
    ThemeManager,
    ScrollProgress,
    MobileSidebar
} from '../../../src/js/core/enhanced-utils.js';

// Re-export default
export { default } from '../../../src/js/core/enhanced-utils.js';

/**
 * ============================================================================
 * MEKONG AGENCY - CORE UTILITIES (Single Source of Truth)
 * ============================================================================
 *
 * This is the CENTRAL export point for all utility functions.
 * All modules should import from this file instead of directly accessing
 * sub-modules like shared/format-utils.js or enhanced-utils.js.
 *
 * BENEFITS:
 * - Single source of truth (no more duplicate imports)
 * - Cleaner import statements
 * - Easier to maintain and update
 * - Tree-shaking friendly (ES modules)
 *
 * USAGE:
 *   import { formatCurrency, Toast, ThemeManager } from './core-utils.js';
 */

// ============================================================================
// FORMAT UTILITIES (Shared across all modules)
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
// UI COMPONENTS (Toast, Theme, Scroll, Sidebar)
// ============================================================================
export {
    Toast,
    ThemeManager,
    ScrollProgress,
    MobileSidebar
} from './enhanced-utils.js';

// ============================================================================
// DOM UTILITIES
// ============================================================================
export {
    createElement,
    escapeHTML
} from './enhanced-utils.js';

// ============================================================================
// STRING UTILITIES
// ============================================================================
export {
    capitalize,
    getInitials,
    slugify
} from './enhanced-utils.js';

// ============================================================================
// ARRAY UTILITIES
// ============================================================================
export {
    groupBy,
    sortBy,
    sum,
    average
} from './enhanced-utils.js';

// ============================================================================
// ID GENERATION
// ============================================================================
export { generateId } from './enhanced-utils.js';

// ============================================================================
// PERCENT FORMATTING
// ============================================================================
export { formatPercent } from './enhanced-utils.js';

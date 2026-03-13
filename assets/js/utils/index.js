/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MEKONG UTILITIES - Barrel Export
 * 
 * Single source of truth for all utility functions
 * 
 * Usage:
 *   import { formatCurrency, debounce, slugify } from 'utils/index.js';
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Format utilities (currency, numbers, dates)
export {
    formatCurrency,
    formatCurrencyCompact,
    formatCurrencyVN,
    formatNumber,
    formatDate,
    formatDateTime,
    formatRelativeTime,
    truncate
} from './format.js';

// Function utilities (debounce, throttle)
export {
    debounce,
    throttle
} from './function.js';

// String utilities
export {
    slugify,
    capitalize,
    getInitials,
    truncate
} from './string.js';

// ID utilities
export { generateId } from './id.js';

// DOM utilities
export {
    $,
    $$,
    createElement,
    setHTML
} from './dom.js';

// API utilities
export {
    apiFetch,
    handleApiError
} from './api.js';

// Event utilities
export {
    delegateEvent
} from './events.js';

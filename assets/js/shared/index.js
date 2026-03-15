/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MEKONG AGENCY - SHARED UTILITIES INDEX
 *
 * Consolidated exports for all shared utilities
 * Use this single import point for all shared functions
 *
 * USAGE:
 *   // Import specific functions
 *   import { formatCurrency, formatDate, debounce, throttle } from './shared/index.js';
 *
 *   // Import namespace
 *   import * as Utils from './shared/index.js';
 *
 *   // Import categories
 *   import { formatUtils, functionUtils, domUtils } from './shared/index.js';
 *
 * @version 2.0.0 | 2026-03-14
 * @module shared/index
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// FORMAT UTILITIES
// ============================================================================
export {
    formatCurrency,
    formatCurrencyCompact,
    formatCurrencyVN,
    formatNumber,
    formatDate,
    formatDateTime,
    formatRelativeTime,
    truncate
} from './format-utils.js';

// ============================================================================
// FUNCTION UTILITIES (debounce, throttle, etc.)
// ============================================================================
export {
    debounce,
    throttle,
    memoize,
    compose,
    pipe
} from '../utils/function.js';

// ============================================================================
// DOM UTILITIES
// ============================================================================
export {
    $,
    $$,
    createElement,
    setAttributes,
    remove as removeElement,
    waitForElement,
    toggleClass,
    addClass,
    removeClass,
    hasClass,
    closest,
    matches,
    delegate,
    ready,
    empty,
    show,
    hide,
    isVisible,
    getOffset,
    scrollIntoView,
    getData,
    setData
} from './dom-utils.js';

// ============================================================================
// API UTILITIES
// ============================================================================
export {
    apiFetch,
    apiGet,
    apiPost,
    apiPut,
    apiDelete,
    handleApiError,
    ApiClientBase
} from './api.js';

// ============================================================================
// GUARD UTILITIES (validation, type checking)
// ============================================================================
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

// ============================================================================
// MODAL UTILITIES
// ============================================================================
export {
    ModalManager,
    modal,
    modalHelpers
} from './modal-utils.js';

// ============================================================================
// SCROLL UTILITIES
// ============================================================================
export { default as ScrollListener } from './scroll-listener.js';

// ============================================================================
// KEYBOARD UTILITIES
// ============================================================================
export { default as KeyboardManager } from './keyboard-manager.js';

// ============================================================================
// LOGGER (default export re-exported as named)
// ============================================================================
export { default as Logger } from './logger.js';

// ============================================================================
// SANITIZATION UTILITIES (Security - DOMPurify wrapper)
// ============================================================================
export {
    sanitizeHTML,
    safeSetHTML,
    createSafeElement,
    sanitizeText,
    sanitizeURL,
    batchSanitize,
    initDOMPurify,
    STRICT_OPTIONS,
    RELAXED_OPTIONS,
    default as sanitizationUtils
} from './sanitization-utils.js';

// ============================================================================
// NAMESPACE EXPORTS (for backward compatibility)
// ============================================================================
export * as formatUtils from './format-utils.js';
export * as domUtils from './dom-utils.js';
export * as apiUtils from './api.js';
export * as guardUtils from './guard-utils.js';
export * as modalUtils from './modal-utils.js';
export * as scrollUtils from './scroll-listener.js';
export * as keyboardUtils from './keyboard-manager.js';

// ============================================================================
// DEFAULT EXPORT
// ============================================================================
export default {
    // Format
    formatCurrency,
    formatCurrencyCompact,
    formatCurrencyVN,
    formatNumber,
    formatDate,
    formatDateTime,
    formatRelativeTime,
    truncate,

    // Function
    debounce,
    throttle,
    memoize,
    compose,
    pipe,

    // DOM
    $,
    $$,
    createElement,
    setAttributes,
    removeElement,
    waitForElement,
    toggleClass,
    addClass,
    removeClass,

    // API
    apiFetch,
    apiGet,
    apiPost,
    apiPut,
    apiDelete,
    handleApiError,
    ApiClientBase,

    // Guard
    waitForAuth,
    isAdmin,
    isStaff,
    isAffiliate,
    requireAdmin,
    requireStaff,
    requireAffiliate,
    requireAuth,
    getCurrentUser,
    getCurrentUserId,

    // Modal
    ModalManager,
    modal,
    modalHelpers,

    // Scroll
    ScrollListener,

    // Keyboard
    KeyboardManager,

    // Logger
    Logger
};

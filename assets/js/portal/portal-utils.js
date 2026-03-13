/**
 * Portal Utils Module
 * Utility Functions & Helpers
 * Re-exports from shared/format-utils.js
 */

// Re-export from shared format-utils
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
} from '../services/core-utils.js';

// ================================================
// VALIDATION UTILITIES
// ================================================

/**
 * Validate email format
 */
export function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Validate phone number (Vietnamese)
 */
export function isValidPhone(phone) {
    const regex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
    return regex.test(phone.replace(/\s/g, ''));
}

/**
 * Validate required field
 */
export function isRequired(value) {
    return value && value.trim().length > 0;
}

// ================================================
// HELPER UTILITIES (portal-specific)
// ================================================

/**
 * Parse number from string (handles Vietnamese format)
 */
export function parseNumber(str) {
    if (typeof str === 'number') return str;
    if (!str) return 0;

    // Remove dots (thousands separator) and replace comma with dot
    const cleaned = str.replace(/\./g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
}

/**
 * Escape HTML to prevent XSS
 */
export function escapeHtml(text) {
    if (!text) return '';

    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ================================================
// DOM UTILITIES
// ================================================

/**
 * Wait for DOM to be ready
 */
export function waitForDOM(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(selector)) {
            resolve(document.querySelector(selector));
            return;
        }

        const observer = new MutationObserver(() => {
            const element = document.querySelector(selector);
            if (element) {
                observer.disconnect();
                resolve(element);
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Element ${selector} not found within ${timeout}ms`));
        }, timeout);
    });
}

// ================================================
// STORAGE UTILITIES
// ================================================

/**
 * Safe localStorage get
 */
export function getStorageItem(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        // [DEV] 'localStorage get error:', error);
        return defaultValue;
    }
}

/**
 * Safe localStorage set
 */
export function setStorageItem(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        // [DEV] 'localStorage set error:', error);
    }
}

/**
 * Clear storage item
 */
export function removeStorageItem(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        // [DEV] 'localStorage remove error:', error);
    }
}

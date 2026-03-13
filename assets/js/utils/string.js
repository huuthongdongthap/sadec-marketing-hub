/**
 * ═══════════════════════════════════════════════════════════════════════════
 * STRING UTILITIES
 * 
 * String manipulation and transformation functions
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Capitalize first letter
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Get initials from name
 * @param {string} name - Full name
 * @returns {string} Two-letter initials
 */
export function getInitials(name) {
    if (!name) return '';
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

/**
 * Convert string to URL-friendly slug
 * @param {string} str - String to slugify
 * @returns {string} Slugified string
 */
export function slugify(str) {
    if (!str) return '';
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^đàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
}

/**
 * Truncate string to max length (re-export from shared/format-utils for convenience)
 */
export { truncate } from '../shared/format-utils.js';

/**
 * Escape HTML entities to prevent XSS
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
export function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Parse query parameters from URL
 * @param {string} url - URL string
 * @returns {Object} Query parameters object
 */
export function parseQuery(url) {
    const queryString = url.split('?')[1];
    if (!queryString) return {};
    
    return queryString.split('&').reduce((params, pair) => {
        const [key, value] = pair.split('=');
        params[decodeURIComponent(key)] = decodeURIComponent(value || '');
        return params;
    }, {});
}

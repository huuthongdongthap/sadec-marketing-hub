/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ID UTILITIES
 * 
 * Unique ID generation functions
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Generate unique ID with optional prefix
 * @param {string} prefix - ID prefix (default: 'id')
 * @returns {string} Unique ID
 */
export function generateId(prefix = 'id') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate UUID v4
 * @returns {string} UUID v4 string
 */
export function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Generate short ID (6 chars)
 * @returns {string} Short ID
 */
export function generateShortId() {
    return Math.random().toString(36).substr(2, 6);
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * QUICK NOTES CONSTANTS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Shared constants and configurations
 *
 * @module features/quick-notes/notes-constants
 */

/**
 * Available note colors
 */
export const COLORS = [
    { name: 'Vàng', value: '#fff9c4', dark: '#fbc02d' },
    { name: 'Hồng', value: '#f8bbd9', dark: '#ec407a' },
    { name: 'Xanh dương', value: '#b3e5fc', dark: '#039be5' },
    { name: 'Xanh lá', value: '#c8e6c9', dark: '#43a047' },
    { name: 'Cam', value: '#ffe0b2', dark: '#fb8c00' },
    { name: 'Tím', value: '#e1bee7', dark: '#8e24aa' }
];

/**
 * Storage key for localStorage
 */
export const STORAGE_KEY = 'sadec-quick-notes';

/**
 * Widget CSS selector
 */
export const WIDGET_ID = 'quick-notes-widget';

/**
 * Modal CSS selector
 */
export const MODAL_ID = 'quick-note-edit-modal';

/**
 * Default note color (random from COLORS)
 * @returns {string} Color value
 */
export function getRandomColor() {
    return COLORS[Math.floor(Math.random() * COLORS.length)].value;
}

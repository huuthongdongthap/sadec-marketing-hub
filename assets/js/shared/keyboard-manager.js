/**
 * ═══════════════════════════════════════════════════════════════════════════
 * KEYBOARD LISTENER MANAGER — Sa Đéc Marketing Hub
 * Centralized keyboard event management with shortcut registration
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Usage:
 *   import KeyboardManager from './keyboard-manager.js';
 *
 *   // Register shortcut
 *   KeyboardManager.register('ctrl+k', (e) => {
 *       e.preventDefault();
 *       // Handle shortcut
 *   });
 *
 *   // Unregister shortcut
 *   KeyboardManager.unregister('ctrl+k');
 *
 *   // Add keydown listener
 *   KeyboardManager.add('search', (e) => {
 *       if (e.key === 'Escape') closeSearch();
 *   });
 */

const KeyboardManager = {
    shortcuts: new Map(),
    listeners: new Map(),
    initialized: false,

    /**
     * Initialize keyboard manager
     * @private
     */
    _init() {
        if (this.initialized) return;

        document.addEventListener('keydown', this._handleKeydown.bind(this));
        this.initialized = true;
    },

    /**
     * Register keyboard shortcut
     * @param {string} shortcut - Shortcut string (e.g., 'ctrl+k', 'shift+/', 'escape')
     * @param {Function} callback - Handler function
     */
    register(shortcut, callback) {
        this._init();
        const key = this._parseShortcut(shortcut);
        this.shortcuts.set(key, { shortcut, callback });
    },

    /**
     * Unregister keyboard shortcut
     * @param {string} shortcut - Shortcut string
     */
    unregister(shortcut) {
        const key = this._parseShortcut(shortcut);
        this.shortcuts.delete(key);
    },

    /**
     * Add keydown listener
     * @param {string} id - Unique identifier
     * @param {Function} callback - Handler function
     */
    add(id, callback) {
        this._init();
        this.listeners.set(id, callback);
    },

    /**
     * Remove keydown listener
     * @param {string} id - Unique identifier
     */
    remove(id) {
        this.listeners.delete(id);
    },

    /**
     * Handle keydown event
     * @param {KeyboardEvent} e - Keyboard event
     * @private
     */
    _handleKeydown(e) {
        // Process listeners first
        this.listeners.forEach(callback => callback(e));

        // Then process shortcuts
        const key = this._getEventKey(e);
        const shortcut = this.shortcuts.get(key);

        if (shortcut) {
            e.preventDefault();
            shortcut.callback(e);
        }
    },

    /**
     * Parse shortcut string to normalized key
     * @param {string} shortcut - Shortcut string
     * @returns {string} Normalized key
     * @private
     */
    _parseShortcut(shortcut) {
        return shortcut.toLowerCase().trim();
    },

    /**
     * Get normalized key from keyboard event
     * @param {KeyboardEvent} e - Keyboard event
     * @returns {string} Normalized key
     * @private
     */
    _getEventKey(e) {
        const parts = [];

        if (e.ctrlKey || e.metaKey) parts.push('ctrl');
        if (e.shiftKey) parts.push('shift');
        if (e.altKey) parts.push('alt');

        const key = e.key.toLowerCase();
        parts.push(key);

        return parts.join('+');
    }
};

export default KeyboardManager;

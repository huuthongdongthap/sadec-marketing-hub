/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SCROLL LISTENER MANAGER — Sa Đéc Marketing Hub
 * Centralized scroll event management with throttling
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Usage:
 *   import ScrollListener from './scroll-listener.js';
 *
 *   // Add scroll listener
 *   ScrollListener.add('back-to-top', () => {
 *       // Handle scroll
 *   }, { passive: true, debounce: 100 });
 *
 *   // Remove scroll listener
 *   ScrollListener.remove('back-to-top');
 */

const ScrollListener = {
    listeners: new Map(),
    ticking: false,

    /**
     * Add scroll listener with automatic throttling
     * @param {string} id - Unique identifier
     * @param {Function} callback - Handler function
     * @param {Object} options - { passive: true, debounce: 100 }
     */
    add(id, callback, options = {}) {
        const { passive = true, debounce = 100 } = options;

        this.listeners.set(id, { callback, debounce, lastCall: 0 });

        if (this.listeners.size === 1) {
            window.addEventListener('scroll', this._handleScroll.bind(this), { passive });
        }
    },

    /**
     * Remove scroll listener
     * @param {string} id - Unique identifier
     */
    remove(id) {
        this.listeners.delete(id);

        if (this.listeners.size === 0) {
            window.removeEventListener('scroll', this._handleScroll);
        }
    },

    /**
     * Handle scroll event with throttling
     * @private
     */
    _handleScroll() {
        if (!this.ticking) {
            requestAnimationFrame(() => {
                const now = Date.now();
                this.listeners.forEach((listener, key) => {
                    if (now - listener.lastCall >= listener.debounce) {
                        listener.callback();
                        listener.lastCall = now;
                    }
                });
                this.ticking = false;
            });
            this.ticking = true;
        }
    }
};

export default ScrollListener;

#!/usr/bin/env node
/**
 * Consolidate duplicate scroll listeners into shared utility
 */

const scrollListenerCode = `/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SCROLL LISTENER MANAGER — Sa Đéc Marketing Hub
 * Centralized scroll event management with debouncing
 * ═══════════════════════════════════════════════════════════════════════════
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
     */
    _handleScroll() {
        if (!this.ticking) {
            requestAnimationFrame(() => {
                this.listeners.forEach(({ callback, debounce, lastCall }) => {
                    const now = Date.now();
                    if (now - lastCall >= debounce) {
                        callback();
                        this.listeners.get([...this.listeners.keys()][0]).lastCall = now;
                    }
                });
                this.ticking = false;
            });
            this.ticking = true;
        }
    }
};

export default ScrollListener;
`;

console.log('ScrollListener utility code generated');
console.log('This script shows the consolidated code pattern for scroll listeners');
console.log('Files to refactor:');
console.log('  - assets/js/features/back-to-top.js');
console.log('  - assets/js/features/reading-progress.js');
console.log('  - assets/js/features/ux-enhancements-2026.js');

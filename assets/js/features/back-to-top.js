/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BACK TO TOP BUTTON — Sa Đéc Marketing Hub
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Features:
 * - Floating back to top button
 * - Smooth scroll animation
 * - Auto-hide/show based on scroll position
 * - Keyboard accessible
 *
 * Usage:
 *   import { initBackToTop } from './back-to-top.js';
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import ScrollListener from '../shared/scroll-listener.js';

const BackToTop = {
    button: null,
    scrollThreshold: 300,
    isVisible: false,

    /**
     * Initialize back to top button
     */
    init() {
        this.createButton();
        this.bindScroll();
        this.bindClick();
    },

    /**
     * Create back to top button
     */
    createButton() {
        if (document.getElementById('back-to-top')) return;

        this.button = document.createElement('button');
        this.button.id = 'back-to-top';
        this.button.className = 'back-to-top';
        this.button.setAttribute('aria-label', 'Back to top');
        this.button.innerHTML = `
            <span class="material-symbols-outlined">keyboard_arrow_up</span>
        `;
        document.body.appendChild(this.button);
    },

    /**
     * Bind scroll event to toggle visibility
     */
    bindScroll() {
        const onScroll = () => {
            const shouldShow = window.scrollY > this.scrollThreshold;

            if (shouldShow && !this.isVisible) {
                this.show();
            } else if (!shouldShow && this.isVisible) {
                this.hide();
            }
        };

        ScrollListener.add('back-to-top', onScroll, { passive: true, debounce: 50 });
        onScroll(); // Initial check
    },

    /**
     * Bind click event
     */
    bindClick() {
        if (!this.button) return;

        this.button.addEventListener('click', () => {
            this.scrollToTop();
        });

        // Keyboard support
        this.button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.scrollToTop();
            }
        });
    },

    /**
     * Show button with animation
     */
    show() {
        if (!this.button) return;
        this.button.classList.add('visible');
        this.button.setAttribute('aria-hidden', 'false');
        this.isVisible = true;
    },

    /**
     * Hide button with animation
     */
    hide() {
        if (!this.button) return;
        this.button.classList.remove('visible');
        this.button.setAttribute('aria-hidden', 'true');
        this.isVisible = false;
    },

    /**
     * Smooth scroll to top
     */
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

        // Focus trap for accessibility
        this.button.focus();
    },

    /**
     * Remove button
     */
    destroy() {
        if (this.button) {
            this.button.remove();
            this.button = null;
        }
    }
};

// Auto-init on DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => BackToTop.init());
} else {
    BackToTop.init();
}

// Export for manual usage
export { BackToTop };

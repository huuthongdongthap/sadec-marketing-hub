/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SA ĐÉC MARKETING HUB - LOADING STATES MANAGER
 * Unified loading state management for all async operations
 *
 * Usage:
 *   Loading.show('#container')           // Show spinner in container
 *   Loading.hide('#container')           // Hide spinner
 *   Loading.skeleton('#container')       // Show skeleton loader
 *   Loading.fullscreen.show()            // Full page loading
 *   Loading.fullscreen.hide()            // Hide full page
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

const Loading = {
    /**
     * Counter for nested loading calls
     */
    _counters: new Map(),

    /**
     * Show loading spinner inside a container
     * @param {string} selector - CSS selector for container
     * @param {Object} options - Configuration options
     */
    show(selector, options = {}) {
        const container = typeof selector === 'string'
            ? document.querySelector(selector)
            : selector;

        if (!container) return;

        // Increment counter
        const count = (this._counters.get(selector) || 0) + 1;
        this._counters.set(selector, count);

        // Don't add duplicate loaders
        if (container.querySelector('.loading-container')) return;

        const size = options.size || 'md';
        const color = options.color || 'primary';

        const loadingHTML = `
            <div class="loading-container" role="status" aria-label="Loading">
                <div class="spinner-${color} spinner-${size}"></div>
                ${options.message ? `<p class="loading-message">${options.message}</p>` : ''}
            </div>
        `;

        container.insertAdjacentHTML('beforeend', loadingHTML);

        // Add loading state to container
        container.setAttribute('aria-busy', 'true');
        container.style.position = 'relative';
    },

    /**
     * Hide loading spinner
     * @param {string} selector - CSS selector for container
     */
    hide(selector) {
        const container = typeof selector === 'string'
            ? document.querySelector(selector)
            : selector;

        if (!container) return;

        // Decrement counter
        const count = (this._counters.get(selector) || 1) - 1;
        this._counters.set(selector, count);

        // Don't hide if there are nested loading calls
        if (count > 0) return;

        const loadingContainer = container.querySelector('.loading-container');
        if (loadingContainer) {
            loadingContainer.remove();
        }

        container.removeAttribute('aria-busy');
    },

    /**
     * Show skeleton loader
     * @param {string} selector - CSS selector for container
     * @param {string} type - Type of skeleton (card, list, text, avatar)
     */
    skeleton(selector, type = 'card') {
        const container = typeof selector === 'string'
            ? document.querySelector(selector)
            : selector;

        if (!container) return;

        const skeletons = {
            card: `
                <div class="skeleton-card">
                    <div class="skeleton-avatar"></div>
                    <div class="skeleton-title"></div>
                    <div class="skeleton-text"></div>
                    <div class="skeleton-text skeleton-text-short"></div>
                </div>
            `,
            list: `
                <div class="skeleton-list">
                    ${Array(5).fill(`
                        <div class="skeleton-list-item">
                            <div class="skeleton-avatar" style="width: 40px; height: 40px;"></div>
                            <div class="skeleton-content">
                                <div class="skeleton-title" style="height: 16px;"></div>
                                <div class="skeleton-text" style="height: 12px;"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `,
            text: `
                <div class="skeleton-text-block">
                    <div class="skeleton-title"></div>
                    ${Array(3).fill('<div class="skeleton-text"></div>').join('')}
                </div>
            `,
            table: `
                <div class="skeleton-table">
                    ${Array(5).fill(`
                        <div class="skeleton-table-row">
                            <div class="skeleton-table-cell" style="flex: 0 0 50px;"></div>
                            <div class="skeleton-table-cell" style="flex: 1;"></div>
                            <div class="skeleton-table-cell" style="flex: 1;"></div>
                            <div class="skeleton-table-cell" style="flex: 1;"></div>
                            <div class="skeleton-table-cell" style="flex: 0 0 100px;"></div>
                        </div>
                    `).join('')}
                </div>
            `,
            stat: `
                <div class="skeleton-stat-card">
                    <div class="skeleton-icon skeleton-base"></div>
                    <div class="skeleton-value skeleton-base"></div>
                    <div class="skeleton-label skeleton-base"></div>
                </div>
            `,
            image: `
                <div class="skeleton-image"></div>
            `
        };

        container.innerHTML = skeletons[type] || skeletons.card;
        container.setAttribute('aria-busy', 'true');
    },

    /**
     * Fullscreen loading overlay
     */
    fullscreen: {
        _overlay: null,

        show(message = 'Đang tải...') {
            if (this._overlay) return;

            this._overlay = document.createElement('div');
            this._overlay.className = 'loading-overlay';
            this._overlay.innerHTML = `
                <div style="text-align: center;">
                    <div class="spinner-primary spinner-large" style="margin: 0 auto 16px;"></div>
                    <p style="color: var(--md-sys-color-on-surface); font-weight: 500;">${message}</p>
                </div>
            `;
            document.body.appendChild(this._overlay);
            document.body.classList.add('body-no-scroll');
        },

        hide() {
            if (!this._overlay) return;

            this._overlay.style.opacity = '0';
            this._overlay.style.transition = 'opacity 200ms ease';

            setTimeout(() => {
                this._overlay?.remove();
                this._overlay = null;
                document.body.classList.remove('body-no-scroll');
            }, 200);
        }
    },

    /**
     * Button loading state
     * @param {HTMLButtonElement} button
     * @param {string} loadingText - Optional loading text
     */
    button(button, loadingText = '') {
        if (!button) return;

        // Store original content
        if (!button._originalContent) {
            button._originalContent = {
                html: button.innerHTML,
                text: button.textContent,
                disabled: button.disabled
            };
        }

        button.classList.add('btn-loading');
        button.disabled = true;

        if (loadingText) {
            button.setAttribute('data-loading-text', loadingText);
        }
    },

    /**
     * Remove button loading state
     * @param {HTMLButtonElement} button
     */
    buttonDone(button) {
        if (!button || !button._originalContent) return;

        button.classList.remove('btn-loading');
        button.disabled = button._originalContent.disabled;
        button.innerHTML = button._originalContent.html;

        delete button._originalContent;
    },

    /**
     * Fetch with automatic loading state
     * @param {string} url
     * @param {RequestInit} options
     * @param {string} loadingSelector - Container to show loading in
     */
    async fetch(url, options = {}, loadingSelector = null) {
        if (loadingSelector) {
            this.show(loadingSelector);
        }

        try {
            const response = await fetch(url, options);
            return response;
        } finally {
            if (loadingSelector) {
                this.hide(loadingSelector);
            }
        }
    }
};

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SCROLL-TRIGGERED ANIMATIONS
 * Intersection Observer based entry animations
 * ═══════════════════════════════════════════════════════════════════════════
 */

const ScrollAnimations = {
    _observer: null,
    _initialized: false,

    /**
     * Initialize scroll animations
     * @param {Object} options - Configuration
     */
    init(options = {}) {
        if (this._initialized) return;

        const {
            threshold = 0.1,
            rootMargin = '0px 0px -50px 0px',
            selector = '.animate-entry, .animate-from-left, .animate-from-right, .animate-scale'
        } = options;

        this._observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');

                    // Optionally unobserve after animation
                    if (options.once !== false) {
                        this._observer.unobserve(entry.target);
                    }
                }
            });
        }, {
            threshold,
            rootMargin
        });

        // Observe all matching elements
        document.querySelectorAll(selector).forEach(el => {
            this._observer.observe(el);
        });

        this._initialized = true;
    },

    /**
     * Manually observe an element
     * @param {Element} element
     */
    observe(element) {
        if (!this._observer) this.init();
        if (element) this._observer.observe(element);
    },

    /**
     * Stop observing an element
     * @param {Element} element
     */
    unobserve(element) {
        if (this._observer && element) {
            this._observer.unobserve(element);
        }
    },

    /**
     * Refresh animations (re-trigger)
     * @param {string} selector
     */
    refresh(selector = '.animate-entry') {
        document.querySelectorAll(selector).forEach(el => {
            el.classList.remove('visible');
            this.observe(el);
        });
    }
};

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RIPPLE EFFECT MANAGER
 * Material Design ripple effect for click feedback
 * ═══════════════════════════════════════════════════════════════════════════
 */

const RippleEffect = {
    /**
     * Create ripple effect on element
     * @param {Event} event - Click event
     * @param {Element} element - Target element
     */
    create(event, element) {
        const circle = document.createElement('span');
        const diameter = Math.max(element.clientWidth, element.clientHeight);
        const radius = diameter / 2;

        const rect = element.getBoundingClientRect();

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - rect.left - radius}px`;
        circle.style.top = `${event.clientY - rect.top - radius}px`;
        circle.classList.add('ripple');

        // Remove existing ripples
        const existing = element.querySelector('.ripple');
        if (existing) existing.remove();

        element.appendChild(circle);

        // Remove after animation
        setTimeout(() => circle.remove(), 600);
    },

    /**
     * Auto-bind ripple effect to all elements with .ripple-container class
     */
    autoBind() {
        document.addEventListener('click', (e) => {
            const target = e.target.closest('.ripple-container');
            if (target) {
                this.create(e, target);
            }
        });
    }
};

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * INITIALIZATION
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Auto-initialize on DOM ready
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        ScrollAnimations.init();
        RippleEffect.autoBind();
    });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Loading, ScrollAnimations, RippleEffect };
}

// Global access
window.Loading = Loading;
window.ScrollAnimations = ScrollAnimations;
window.RippleEffect = RippleEffect;

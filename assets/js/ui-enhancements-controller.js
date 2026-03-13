/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SA ĐÉC MARKETING HUB - UI ENHANCEMENTS CONTROLLER
 * Manages micro-animations, loading states, and scroll animations
 * ═══════════════════════════════════════════════════════════════════════════
 */

class UIEnhancements {
    constructor() {
        this.observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        this.init();
    }

    init() {
        this.setupScrollAnimations();
        this.setupLoadingStates();
        this.setupRippleEffect();
        this.setupPageLoader();
        this.setupReducedMotion();
        console.log('[UIEnhancements] Initialized');
    }

    /**
     * Scroll-triggered animations using Intersection Observer
     */
    setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Optionally unobserve after animation
                    // observer.unobserve(entry.target);
                }
            });
        }, this.observerOptions);

        // Observe all scroll animation elements
        const elements = document.querySelectorAll(`
            .fade-in-up,
            .slide-in-left,
            .slide-in-right,
            .scale-in
        `);

        elements.forEach(el => observer.observe(el));
    }

    /**
     * Auto-hide page loader when DOM is ready
     */
    setupPageLoader() {
        const pageLoader = document.querySelector('.page-loader');

        if (pageLoader) {
            // Hide after DOM ready
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => {
                    pageLoader.classList.add('hidden');
                    // Remove from DOM after transition
                    setTimeout(() => {
                        pageLoader.remove();
                    }, 500);
                }, 300);
            });

            // Fallback: force hide after 3s
            setTimeout(() => {
                if (pageLoader.parentNode) {
                    pageLoader.classList.add('hidden');
                    setTimeout(() => pageLoader.remove(), 500);
                }
            }, 3000);
        }
    }

    /**
     * Loading states for buttons and forms
     */
    setupLoadingStates() {
        // Auto-handle form submission loading states
        document.querySelectorAll('form[data-loading]').forEach(form => {
            const submitBtn = form.querySelector('button[type="submit"]');

            if (submitBtn) {
                form.addEventListener('submit', () => {
                    this.setLoading(submitBtn, true);
                });
            }
        });

        // Auto-handle link loading states
        document.querySelectorAll('a[data-loading]').forEach(link => {
            link.addEventListener('click', (e) => {
                if (link.getAttribute('href') !== '#') {
                    this.setLoading(link, true);
                }
            });
        });
    }

    /**
     * Set loading state on element
     * @param {HTMLElement} element - Button or link element
     * @param {boolean} isLoading - Loading state
     */
    setLoading(element, isLoading) {
        if (!element) return;

        if (isLoading) {
            element.classList.add('btn-loading');
            element.dataset.originalText = element.textContent;
            element.disabled = true;
        } else {
            element.classList.remove('btn-loading');
            if (element.dataset.originalText) {
                element.textContent = element.dataset.originalText;
            }
            element.disabled = false;
        }
    }

    /**
     * Material Design ripple effect on click
     */
    setupRippleEffect() {
        document.addEventListener('click', (e) => {
            const rippleContainer = e.target.closest('.ripple, .btn-primary-enhanced, button, .card-premium');

            if (rippleContainer && !rippleContainer.classList.contains('no-ripple')) {
                const rect = rippleContainer.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;

                const ripple = document.createElement('span');
                ripple.className = 'ripple-effect';
                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: rgba(255, 255, 255, 0.4);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: rippleEffect 0.6s ease-out;
                    pointer-events: none;
                `;

                rippleContainer.style.position = 'relative';
                rippleContainer.style.overflow = 'hidden';
                rippleContainer.appendChild(ripple);

                // Remove ripple after animation
                setTimeout(() => ripple.remove(), 600);
            }
        });
    }

    /**
     * Respect user's reduced motion preference
     */
    setupReducedMotion() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

        if (prefersReducedMotion.matches) {
            document.documentElement.classList.add('reduce-motion');
        }

        prefersReducedMotion.addEventListener('change', (e) => {
            if (e.matches) {
                document.documentElement.classList.add('reduce-motion');
            } else {
                document.documentElement.classList.remove('reduce-motion');
            }
        });
    }

    /**
     * Show success animation on element
     * @param {HTMLElement} element
     */
    showSuccess(element) {
        if (!element) return;

        element.classList.add('success-checkmark');
        setTimeout(() => {
            element.classList.remove('success-checkmark');
        }, 1000);
    }

    /**
     * Show error animation on element
     * @param {HTMLElement} element
     */
    showError(element) {
        if (!element) return;

        element.classList.add('error-shake');
        setTimeout(() => {
            element.classList.remove('error-shake');
        }, 500);
    }

    /**
     * Stagger animate children elements
     * @param {HTMLElement} container
     * @param {string} selector - Child selector
     */
    staggerAnimate(container, selector = '.card-stagger') {
        const children = container.querySelectorAll(selector);
        children.forEach((child, index) => {
            child.style.animationDelay = `${index * 50}ms`;
        });
    }

    /**
     * Create and show toast notification
     * @param {string} message
     * @param {string} type - success, error, warning, info
     */
    toast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            padding: 16px 24px;
            background: var(--md-sys-color-surface);
            color: var(--md-sys-color-on-surface);
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideInRight 0.3s ease-out reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

/**
 * Loading Skeleton Helper
 * Creates skeleton placeholders while content loads
 */
class SkeletonLoader {
    constructor() {
        this.templates = {
            card: `<div class="skeleton card"></div>`,
            text: `<div class="skeleton text"></div>`,
            title: `<div class="skeleton title"></div>`,
            avatar: `<div class="skeleton avatar"></div>`
        };
    }

    /**
     * Show skeleton on element
     * @param {HTMLElement} element
     * @param {string} type - card, text, title, avatar
     */
    show(element, type = 'text') {
        if (!element) return;

        element.dataset.originalContent = element.innerHTML;
        element.innerHTML = this.templates[type] || this.templates.text;
        element.classList.add('loading');
    }

    /**
     * Hide skeleton and restore content
     * @param {HTMLElement} element
     */
    hide(element) {
        if (!element) return;

        element.innerHTML = element.dataset.originalContent || '';
        element.classList.remove('loading');
        delete element.dataset.originalContent;
    }
}

// Auto-initialize on DOM ready
let uiEnhancements;
let skeletonLoader;

document.addEventListener('DOMContentLoaded', () => {
    uiEnhancements = new UIEnhancements();
    skeletonLoader = new SkeletonLoader();

    // Expose to window for external use
    window.UIEnhancements = uiEnhancements;
    window.SkeletonLoader = skeletonLoader;
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UIEnhancements, SkeletonLoader };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * UI MOTION CONTROLLER - Animation Orchestration Layer
 * Mekong Agency Design System v5.0
 *
 * Generated: 2026-03-13
 * Command: /frontend:ui-build "Nang cap UI micro-animations loading states hover effects"
 *
 * Features:
 * - Scroll-triggered entrance animations
 * - Hover effect enhancements
 * - Loading state coordination
 * - Reduced motion detection
 * - Performance optimization
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

const UIMotionController = {
    /**
     * Configuration options
     */
    config: {
        reducedMotion: false,
        scrollThreshold: 0.1,
        staggerDelay: 50,
        maxConcurrentAnimations: 10,
        performanceMode: false
    },

    /**
     * State management
     */
    state: {
        observer: null,
        animatedElements: new Map(),
        scrollHandlers: new Set(),
        isIdle: true,
        lastScrollTime: 0
    },

    /**
     * Initialize motion controller
     * @param {Object} options - Configuration
     */
    init(options = {}) {
        // Merge config
        Object.assign(this.config, options);

        // Detect reduced motion preference
        this.config.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Performance mode for low-end devices
        this.config.performanceMode = navigator.hardwareConcurrency <= 4;

        if (this.config.reducedMotion) {
            console.log('[UIMotion] Reduced motion enabled');
            this.disableAnimations();
            return;
        }

        // Initialize scroll observer
        this.initScrollObserver();

        // Initialize hover effects
        this.initHoverEffects();

        // Initialize loading states
        this.initLoadingStates();

        // Initialize performance optimizations
        this.initPerformanceOptimizations();

        console.log('[UIMotion] Initialized');
    },

    /**
     * Initialize Intersection Observer for scroll animations
     */
    initScrollObserver() {
        const options = {
            root: null,
            rootMargin: '0px 0px -50px 0px',
            threshold: [0, 0.1, 0.25, 0.5, 0.75, 1]
        };

        this.state.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const element = entry.target;
                const animationClass = element.dataset.animate;

                if (entry.isIntersecting && animationClass) {
                    this.animateElement(element, animationClass);

                    // Unobserve after animation
                    if (element.dataset.once !== 'false') {
                        this.state.observer.unobserve(element);
                    }
                }

                // Track visibility state
                this.state.animatedElements.set(element, entry.isIntersecting);
            });
        }, options);

        // Observe all elements with data-animate attribute
        const selector = '[data-animate]';
        document.querySelectorAll(selector).forEach(el => {
            this.state.observer.observe(el);
        });
    },

    /**
     * Animate element with CSS class
     * @param {Element} element
     * @param {string} animationClass
     */
    animateElement(element, animationClass) {
        element.classList.add(animationClass);
        element.classList.add('animate-in');

        // Clean up animation class after completion
        const handleAnimationEnd = () => {
            element.classList.remove(animationClass);
            element.removeEventListener('animationend', handleAnimationEnd);
        };

        element.addEventListener('animationend', handleAnimationEnd);
    },

    /**
     * Initialize hover effect enhancements
     */
    initHoverEffects() {
        // Card tilt effect
        document.querySelectorAll('[data-tilt]').forEach(card => {
            this.initTiltEffect(card);
        });

        // Button ripple effect
        document.querySelectorAll('.btn[data-ripple]').forEach(btn => {
            btn.addEventListener('click', (e) => this.createRipple(e, btn));
        });

        // Glow effect on hover
        document.querySelectorAll('[data-glow]').forEach(el => {
            el.addEventListener('mouseenter', (e) => this.updateGlowPosition(e, el));
            el.addEventListener('mousemove', (e) => this.updateGlowPosition(e, el));
        });

        // Parallax effect
        document.querySelectorAll('[data-parallax]').forEach(el => {
            this.initParallax(el);
        });
    },

    /**
     * Initialize tilt effect on cards
     * @param {Element} card
     */
    initTiltEffect(card) {
        const maxTilt = card.dataset.tiltMax || 15;

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * maxTilt;
            const rotateY = ((centerX - x) / centerX) * maxTilt;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    },

    /**
     * Create ripple effect
     * @param {Event} event
     * @param {Element} element
     */
    createRipple(event, element) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.className = 'ripple';
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        element.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    },

    /**
     * Update glow position based on cursor
     * @param {MouseEvent} event
     * @param {Element} element
     */
    updateGlowPosition(event, element) {
        const rect = element.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;

        element.style.setProperty('--glow-x', `${x}%`);
        element.style.setProperty('--glow-y', `${y}%`);
    },

    /**
     * Initialize parallax effect
     * @param {Element} element
     */
    initParallax(element) {
        const speed = parseFloat(element.dataset.parallaxSpeed) || 0.5;

        const handleScroll = () => {
            const rect = element.getBoundingClientRect();
            const offset = (window.innerHeight - rect.top) * speed;
            element.style.transform = `translate3d(0, ${offset}px, 0)`;
        };

        // Throttle scroll handler
        const throttledScroll = this.throttle(handleScroll, 16);
        window.addEventListener('scroll', throttledScroll, { passive: true });
        handleScroll(); // Initial call

        this.state.scrollHandlers.add(throttledScroll);
    },

    /**
     * Initialize loading state coordination
     */
    initLoadingStates() {
        // Coordinate with existing Loading manager
        if (typeof Loading !== 'undefined') {
            // Enhance with motion effects
            const originalShow = Loading.show;
            Loading.show = function(selector, options = {}) {
                originalShow.call(this, selector, options);

                // Add entrance animation to loading container
                const container = document.querySelector(selector);
                if (container) {
                    const loadingEl = container.querySelector('.loading-container');
                    if (loadingEl) {
                        loadingEl.classList.add('page-fade-in');
                    }
                }
            };
        }
    },

    /**
     * Initialize performance optimizations
     */
    initPerformanceOptimizations() {
        // Throttle scroll events
        let ticking = false;
        let lastScrollY = window.scrollY;

        const updateScrollState = () => {
            const now = performance.now();
            this.state.lastScrollTime = now;
            this.state.isIdle = false;

            // Resume animations after scroll stops
            clearTimeout(this.state.scrollTimeout);
            this.state.scrollTimeout = setTimeout(() => {
                this.state.isIdle = true;
            }, 150);

            lastScrollY = window.scrollY;
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollState);
                ticking = true;
            }
        }, { passive: true });

        // Pause animations when tab is hidden
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAnimations();
            } else {
                this.resumeAnimations();
            }
        });

        // Battery status API for adaptive performance
        if ('getBattery' in navigator) {
            navigator.getBattery().then(battery => {
                if (battery.level < 0.2 || !battery.charging) {
                    this.config.performanceMode = true;
                    console.log('[UIMotion] Performance mode enabled (low battery)');
                }
            });
        }
    },

    /**
     * Disable animations for reduced motion
     */
    disableAnimations() {
        document.documentElement.classList.add('reduce-motion');

        // Remove all data-animate attributes
        document.querySelectorAll('[data-animate]').forEach(el => {
            el.removeAttribute('data-animate');
        });
    },

    /**
     * Pause all animations
     */
    pauseAnimations() {
        document.querySelectorAll('[class*="animate-"]').forEach(el => {
            el.style.animationPlayState = 'paused';
        });
    },

    /**
     * Resume all animations
     */
    resumeAnimations() {
        document.querySelectorAll('[class*="animate-"]').forEach(el => {
            el.style.animationPlayState = 'running';
        });
    },

    /**
     * Trigger animation on element
     * @param {Element} element
     * @param {string} animation - Animation name
     * @param {Object} options
     */
    trigger(element, animation, options = {}) {
        const {
            duration = 300,
            delay = 0,
            easing = 'ease',
            iterations = 1
        } = options;

        if (!element) return;

        element.style.animation = `${animation} ${duration}ms ${easing} ${delay}ms ${iterations} forwards`;

        const cleanup = () => {
            element.style.animation = '';
            element.removeEventListener('animationend', cleanup);
        };

        element.addEventListener('animationend', cleanup);
    },

    /**
     * Stagger animate multiple elements
     * @param {NodeList|Element[]} elements
     * @param {string} animation
     * @param {Object} options
     */
    stagger(elements, animation, options = {}) {
        const { delay = 50, staggerDelay = this.config.staggerDelay } = options;

        elements.forEach((el, index) => {
            setTimeout(() => {
                this.trigger(el, animation, { delay: 0, ...options });
            }, delay + (index * staggerDelay));
        });
    },

    /**
     * Animate counter element
     * @param {Element} element
     * @param {number} to
     * @param {Object} options
     */
    animateCounter(element, to, options = {}) {
        const {
            from = 0,
            duration = 2000,
            prefix = '',
            suffix = '',
            decimals = 0
        } = options;

        if (!element) return;

        const startTime = performance.now();
        const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutQuart(progress);

            const currentValue = from + (to - from) * easedProgress;

            element.textContent = prefix + currentValue.toFixed(decimals) + suffix;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    },

    /**
     * Utility: Throttle function execution
     * @param {Function} func
     * @param {number} limit
     */
    throttle(func, limit) {
        let lastFunc;
        let lastRan;

        return function(...args) {
            const now = Date.now();
            if (!lastRan || now - lastRan >= limit) {
                func.apply(this, args);
                lastRan = now;
            } else {
                clearTimeout(lastFunc);
                lastFunc = setTimeout(() => {
                    func.apply(this, args);
                    lastRan = now;
                }, limit - (now - lastRan));
            }
        };
    },

    /**
     * Utility: Debounce function execution
     * @param {Function} func
     * @param {number} wait
     */
    debounce(func, wait) {
        let timeout;

        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    },

    /**
     * Refresh animations (re-trigger)
     * @param {string} selector
     */
    refreshAnimations(selector = '[data-animate]') {
        document.querySelectorAll(selector).forEach(el => {
            el.classList.remove('animate-in');
            setTimeout(() => {
                this.state.observer?.observe(el);
            }, 50);
        });
    },

    /**
     * Destroy controller and clean up
     */
    destroy() {
        // Disconnect observer
        this.state.observer?.disconnect();

        // Remove scroll handlers
        this.state.scrollHandlers.forEach(handler => {
            window.removeEventListener('scroll', handler);
        });

        // Clear state
        this.state.animatedElements.clear();
        this.state.scrollHandlers.clear();

        console.log('[UIMotion] Destroyed');
    }
};

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AUTO-INITIALIZATION
 * ═══════════════════════════════════════════════════════════════════════════
 */

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        UIMotionController.init();
    });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UIMotionController };
}

// Global access
window.UIMotionController = UIMotionController;

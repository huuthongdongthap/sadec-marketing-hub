/**
 * Sa Đéc Marketing Hub - Lazy Load Component
 * Intersection Observer-based lazy loading for images, videos, and components
 *
 * Usage: Import and call LazyLoad.init() in your main JS file
 */

const LazyLoad = {
    observer: null,
    loadedElements: new WeakSet(),
    config: {
        rootMargin: '50px 0px',
        threshold: 0.01,
        blurUp: true,
        fadeIn: true
    },

    /**
     * Initialize lazy loading
     */
    init(options = {}) {
        this.config = { ...this.config, ...options };
        this.setupObserver();
        this.observeAll();
    },

    /**
     * Setup Intersection Observer
     */
    setupObserver() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadElement(entry.target);
                    this.observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: this.config.rootMargin,
            threshold: this.config.threshold
        });
    },

    /**
     * Observe all lazy-load elements
     */
    observeAll() {
        const elements = document.querySelectorAll('[data-lazy-src], img[loading="lazy"], iframe[loading="lazy"]');
        elements.forEach(el => {
            if (!this.loadedElements.has(el)) {
                this.observer.observe(el);
            }
        });
    },

    /**
     * Load element content
     */
    loadElement(element) {
        if (this.loadedElements.has(element)) return;

        const tagName = element.tagName.toLowerCase();

        if (tagName === 'img') {
            this.loadImage(element);
        } else if (tagName === 'iframe') {
            this.loadIframe(element);
        } else if (element.dataset.lazySrc) {
            this.loadBackground(element);
        }

        this.loadedElements.add(element);
    },

    /**
     * Load image with blur-up effect
     */
    loadImage(img) {
        const src = img.dataset.lazySrc || img.getAttribute('data-src');
        const placeholder = img.dataset.placeholder;

        if (!src) return;

        // Add loading class for transition
        img.classList.add('lazy-loading');

        // Create image loader
        const loader = new Image();
        loader.src = src;

        loader.onload = () => {
            img.src = src;
            img.classList.remove('lazy-loading');
            img.classList.add('lazy-loaded');

            // Trigger fade in
            if (this.config.fadeIn) {
                img.style.opacity = '0';
                img.style.transition = 'opacity 0.3s ease-in';
                requestAnimationFrame(() => {
                    img.style.opacity = '1';
                });
            }
        };

        loader.onerror = () => {
            img.classList.remove('lazy-loading');
            img.classList.add('lazy-error');
            console.warn('[LazyLoad] Failed to load image:', src);
        };
    },

    /**
     * Load iframe (YouTube, etc.)
     */
    loadIframe(iframe) {
        const src = iframe.dataset.lazySrc || iframe.getAttribute('data-src');

        if (!src) return;

        iframe.src = src;
        iframe.classList.add('lazy-loaded');
    },

    /**
     * Load background image
     */
    loadBackground(element) {
        const src = element.dataset.lazySrc;

        if (!src) return;

        const img = new Image();
        img.src = src;

        img.onload = () => {
            element.style.backgroundImage = `url("${src}")`;
            element.classList.add('lazy-loaded');
        };
    },

    /**
     * Load component dynamically
     */
    async loadComponent(container, componentUrl) {
        try {
            const response = await fetch(componentUrl);
            const html = await response.text();
            container.innerHTML = html;
            container.classList.add('lazy-loaded');

            // Execute scripts in loaded component
            const scripts = container.querySelectorAll('script');
            scripts.forEach(script => {
                const newScript = document.createElement('script');
                if (script.src) {
                    newScript.src = script.src;
                } else {
                    newScript.textContent = script.textContent;
                }
                document.head.appendChild(newScript);
            });
        } catch (error) {
            console.error('[LazyLoad] Failed to load component:', error);
            container.classList.add('lazy-error');
        }
    },

    /**
     * Preload critical images
     */
    preloadCritical(criticalSelector) {
        const criticalImages = document.querySelectorAll(criticalSelector);
        criticalImages.forEach(img => {
            const src = img.dataset.lazySrc || img.src;
            if (src) {
                const loader = new Image();
                loader.src = src;
                img.src = src;
                img.classList.remove('lazy-loading');
                img.classList.add('lazy-loaded');
                this.loadedElements.add(img);
            }
        });
    },

    /**
     * Cleanup observer
     */
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        this.loadedElements = new WeakSet();
    }
};

// Auto-init when DOM is ready
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => LazyLoad.init());
    } else {
        LazyLoad.init();
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LazyLoad;
}

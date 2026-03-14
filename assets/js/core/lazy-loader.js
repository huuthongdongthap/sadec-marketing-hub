/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SA ĐÉC MARKETING HUB — LAZY LOADER
 * Performance-optimized lazy loading for images, iframes, and components
 *
 * Features:
 * - Intersection Observer for efficient viewport detection
 * - Native loading="lazy" fallback
 * - Blur-up placeholders for images
 * - LQIP (Low Quality Image Placeholders) support
 * - Dynamic component lazy loading
 * - WebP/AVIF detection and loading
 *
 * Usage:
 *   <img data-src="image.jpg" class="lazy" alt="...">
 *   <iframe data-src="embed.html" class="lazy"></iframe>
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Logger } from '../shared/logger.js';

class LazyLoader {
    constructor(options = {}) {
        this.options = {
            rootMargin: options.rootMargin || '50px',
            threshold: options.threshold || 0.01,
            maxRetries: options.maxRetries || 3,
            blurEffect: options.blurEffect !== false,
            ...options
        };

        this.observer = null;
        this.loadQueue = new Set();
        this.init();
    }

    /**
     * Initialize Intersection Observer
     */
    init() {
        if (!('IntersectionObserver' in window)) {
            Logger.warn('[LazyLoader] IntersectionObserver not supported, loading all immediately');
            this.loadAllImmediately();
            return;
        }

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadElement(entry.target);
                }
            });
        }, {
            rootMargin: this.options.rootMargin,
            threshold: this.options.threshold
        });
    }

    /**
     * Observe a single element
     * @param {HTMLElement} element
     */
    observe(element) {
        if (!element || this.loadQueue.has(element)) return;

        this.loadQueue.add(element);

        // Add loading class for styling
        element.classList.add('loading');

        // Check if already in viewport
        if (this.observer) {
            this.observer.observe(element);
        } else {
            this.loadElement(element);
        }

        Logger.debug('[LazyLoader] Observing element', element);
    }

    /**
     * Observe multiple elements
     * @param {NodeList|Array} elements
     */
    observeAll(elements) {
        if (!elements) return;

        elements.forEach(el => this.observe(el));
    }

    /**
     * Load element content
     * @param {HTMLElement} element
     */
    loadElement(element) {
        if (!element || element.classList.contains('loaded')) return;

        const tagName = element.tagName.toLowerCase();

        if (tagName === 'img') {
            this.loadImage(element);
        } else if (tagName === 'iframe') {
            this.loadIframe(element);
        } else if (tagName === 'video') {
            this.loadVideo(element);
        } else if (element.dataset.component) {
            this.loadComponent(element);
        } else {
            // Generic lazy load
            this.loadGeneric(element);
        }

        // Stop observing once loaded
        if (this.observer) {
            this.observer.unobserve(element);
        }
    }

    /**
     * Load image with blur-up effect
     * @param {HTMLImageElement} img
     */
    loadImage(img) {
        const src = img.dataset.src || img.src;
        const srcset = img.dataset.srcset;
        const placeholder = img.dataset.placeholder;

        if (!src) {
            Logger.warn('[LazyLoader] No src found for image', img);
            this.onImageError(img);
            return;
        }

        // Set up blur-up placeholder if available
        if (placeholder && this.options.blurEffect) {
            img.style.backgroundImage = `url(${placeholder})`;
            img.style.backgroundSize = 'cover';
            img.style.backgroundPosition = 'center';
        }

        // Detect WebP/AVIF support
        const supportsWebP = this.checkWebPSupport();
        const supportsAVIF = this.checkAVIFSupport();

        // Create new image for preloading
        const preloadImg = new Image();

        preloadImg.onload = () => {
            img.src = src;
            if (srcset) {
                img.srcset = srcset;
            }
            img.classList.remove('loading');
            img.classList.add('loaded');

            // Fade in effect
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.3s ease';

            requestAnimationFrame(() => {
                img.style.opacity = '1';
            });

            Logger.log('[LazyLoader] Image loaded', src);
        };

        preloadImg.onerror = () => {
            this.onImageError(img, src);
        };

        preloadImg.src = src;
    }

    /**
     * Load iframe
     * @param {HTMLIFrameElement} iframe
     */
    loadIframe(iframe) {
        const src = iframe.dataset.src;

        if (!src) {
            Logger.warn('[LazyLoader] No src found for iframe', iframe);
            return;
        }

        iframe.src = src;
        iframe.classList.remove('loading');
        iframe.classList.add('loaded');

        Logger.log('[LazyLoader] Iframe loaded', src);
    }

    /**
     * Load video
     * @param {HTMLVideoElement} video
     */
    loadVideo(video) {
        const src = video.dataset.src;
        const poster = video.dataset.poster;

        if (poster) {
            video.poster = poster;
        }

        // Find source elements
        const sources = video.querySelectorAll('source[data-src]');
        sources.forEach(source => {
            source.src = source.dataset.src;
        });

        // Load video
        video.load();
        video.classList.remove('loading');
        video.classList.add('loaded');

        Logger.log('[LazyLoader] Video loaded', src);
    }

    /**
     * Load dynamic component
     * @param {HTMLElement} element
     */
    async loadComponent(element) {
        const componentUrl = element.dataset.component;
        const componentName = element.dataset.name || 'component';

        if (!componentUrl) return;

        try {
            const response = await fetch(componentUrl);
            const html = await response.text();

            element.innerHTML = html;
            element.classList.remove('loading');
            element.classList.add('loaded');

            // Execute any scripts in the loaded component
            this.executeScripts(element);

            Logger.log('[LazyLoader] Component loaded', componentName);
        } catch (error) {
            Logger.error('[LazyLoader] Component load failed', error);
            element.innerHTML = '<div class="lazy-load-error">Failed to load component</div>';
        }
    }

    /**
     * Generic lazy load handler
     * @param {HTMLElement} element
     */
    loadGeneric(element) {
        const src = element.dataset.src;

        if (src) {
            if (element.tagName.toLowerCase() === 'a') {
                element.href = src;
            } else if (element.tagName.toLowerCase() === 'source') {
                element.src = src;
            }
        }

        element.classList.remove('loading');
        element.classList.add('loaded');
    }

    /**
     * Execute scripts in loaded content
     * @param {HTMLElement} container
     */
    executeScripts(container) {
        const scripts = container.querySelectorAll('script');

        scripts.forEach(oldScript => {
            const newScript = document.createElement('script');

            // Copy attributes
            Array.from(oldScript.attributes).forEach(attr => {
                newScript.setAttribute(attr.name, attr.value);
            });

            // Copy content
            newScript.textContent = oldScript.textContent;

            // Replace script
            oldScript.parentNode.replaceChild(newScript, oldScript);
        });
    }

    /**
     * Handle image load error
     * @param {HTMLImageElement} img
     * @param {string} src
     */
    onImageError(img, src = '') {
        img.classList.remove('loading');
        img.classList.add('error');

        // Add alt text as fallback
        const alt = img.alt || 'Image';
        img.title = `Failed to load: ${alt}`;

        Logger.error('[LazyLoader] Image failed to load', src);
    }

    /**
     * Check WebP support
     * @returns {boolean}
     */
    checkWebPSupport() {
        const elem = document.createElement('canvas');

        if (!elem.getContext) {
            return false;
        }

        elem.width = 1;
        elem.height = 1;

        try {
            return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
        } catch (e) {
            return false;
        }
    }

    /**
     * Check AVIF support
     * @returns {boolean}
     */
    checkAVIFSupport() {
        return new Promise(resolve => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = 'data:image/avif;base64,AAAAFGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI=';
        }).catch(() => false);
    }

    /**
     * Load all images immediately (fallback)
     */
    loadAllImmediately() {
        const lazyElements = document.querySelectorAll('[data-src], .lazy');

        lazyElements.forEach(el => this.loadElement(el));
    }

    /**
     * Disconnect observer and load all
     */
    loadAll() {
        if (this.observer) {
            this.observer.disconnect();
        }

        this.loadQueue.forEach(el => this.loadElement(el));
        this.loadQueue.clear();
    }

    /**
     * Refresh observer (useful after DOM changes)
     */
    refresh() {
        if (this.observer) {
            this.observer.disconnect();

            this.loadQueue.forEach(el => {
                this.observer.observe(el);
            });
        }
    }

    /**
     * Destroy lazy loader
     */
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }

        this.loadQueue.clear();
    }
}

// ============================================================================
// AUTO-INITIALIZE ON DOM READY
// ============================================================================

let lazyLoaderInstance = null;

function initLazyLoader(options = {}) {
    if (lazyLoaderInstance) return lazyLoaderInstance;

    lazyLoaderInstance = new LazyLoader(options);

    // Auto-find and observe lazy elements
    if (typeof document !== 'undefined') {
        const lazyImages = document.querySelectorAll('img[data-src], img.lazy');
        const lazyIframes = document.querySelectorAll('iframe[data-src], iframe.lazy');
        const lazyVideos = document.querySelectorAll('video[data-src], video.lazy');
        const lazyComponents = document.querySelectorAll('[data-component]');

        lazyLoaderInstance.observeAll(lazyImages);
        lazyLoaderInstance.observeAll(lazyIframes);
        lazyLoaderInstance.observeAll(lazyVideos);
        lazyLoaderInstance.observeAll(lazyComponents);
    }

    Logger.log('[LazyLoader] Initialized');

    return lazyLoaderInstance;
}

// Auto-init on DOMContentLoaded
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => initLazyLoader());
    } else {
        initLazyLoader();
    }
}

// Export for programmatic use
export { LazyLoader, initLazyLoader, lazyLoaderInstance };

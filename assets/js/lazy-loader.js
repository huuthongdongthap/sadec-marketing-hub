/**
 * Sa Đéc Marketing Hub - Lazy Loading Utilities
 * Lazy load images, components, and routes for optimal performance
 */

// ============================================================================
// IMAGE LAZY LOADING WITH BLUR-UP PLACEHOLDER
// ============================================================================

/**
 * Lazy load images with IntersectionObserver and blur-up effect
 * Usage: Add class="lazy-image" and data-src attribute to img elements
 */
export function initImageLazyLoading() {
    const images = document.querySelectorAll('img.lazy-image, img[data-src]');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    loadImage(img);
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px', // Start loading 50px before viewport
            threshold: 0.01
        });

        images.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for browsers without IntersectionObserver
        images.forEach(img => loadImage(img));
    }
}

/**
 * Load a single image with blur-up effect
 */
function loadImage(img) {
    const src = img.dataset.src;
    const srcset = img.dataset.srcset;

    if (!src) return;

    // Create placeholder
    img.classList.add('loading');

    // Load low-res placeholder first if available
    if (img.dataset.placeholder) {
        img.src = img.dataset.placeholder;
    }

    // Load full image
    const fullImage = new Image();
    fullImage.src = src;

    fullImage.onload = () => {
        img.src = src;
        if (srcset) img.srcset = srcset;
        img.classList.remove('loading');
        img.classList.add('loaded');
    };

    fullImage.onerror = () => {
        img.classList.add('error');
        console.warn(`Failed to load image: ${src}`);
    };
}

// ============================================================================
// COMPONENT LAZY LOADING
// ============================================================================

/**
 * Lazy load JavaScript modules on demand
 * @param {string} moduleName - Name of the module to load
 * @param {string} modulePath - Path to the module file
 * @returns {Promise<object>} - Imported module
 */
const loadedModules = new Map();

export async function lazyLoadModule(moduleName, modulePath) {
    // Return cached module if already loaded
    if (loadedModules.has(moduleName)) {
        return loadedModules.get(moduleName);
    }

    try {
        const module = await import(modulePath);
        loadedModules.set(moduleName, module);
        return module;
    } catch (error) {
        console.error(`Failed to load module ${moduleName}:`, error);
        throw error;
    }
}

/**
 * Lazy load multiple modules in parallel
 * @param {Array<{name: string, path: string}>} modules
 * @returns {Promise<Map<string, object>>}
 */
export async function lazyLoadModules(modules) {
    const results = await Promise.all(
        modules.map(({ name, path }) =>
            lazyLoadModule(name, path).then(module => ({ name, module }))
        )
    );

    return new Map(results.map(({ name, module }) => [name, module]));
}

// ============================================================================
// LAZY LOAD EXTERNAL LIBRARIES
// ============================================================================

/**
 * Lazy load external scripts (Chart.js, etc.)
 * @param {string} src - Script URL
 * @param {string} name - Script identifier for caching
 * @returns {Promise<HTMLScriptElement>}
 */
const loadedScripts = new Set();

export function lazyLoadScript(src, name) {
    return new Promise((resolve, reject) => {
        // Return if already loaded
        if (loadedScripts.has(name)) {
            resolve(document.querySelector(`script[src="${src}"]`));
            return;
        }

        // Check if script already exists in DOM
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
            loadedScripts.add(name);
            resolve(existing);
            return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => {
            loadedScripts.add(name);
            resolve(script);
        };
        script.onerror = () => {
            reject(new Error(`Failed to load script: ${src}`));
        };

        document.head.appendChild(script);
    });
}

/**
 * Lazy load CSS stylesheets
 * @param {string} href - Stylesheet URL
 * @param {string} name - Stylesheet identifier
 * @returns {Promise<HTMLLinkElement>}
 */
export function lazyLoadStylesheet(href, name) {
    return new Promise((resolve, reject) => {
        const existing = document.querySelector(`link[href="${href}"]`);
        if (existing) {
            resolve(existing);
            return;
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.onload = () => resolve(link);
        link.onerror = () => reject(new Error(`Failed to load stylesheet: ${href}`));

        document.head.appendChild(link);
    });
}

// ============================================================================
// ROUTE-BASED CODE SPLITTING
// ============================================================================

/**
 * Lazy load page components when they come into viewport
 * @param {string} selector - CSS selector for the component container
 * @param {Function} loadFn - Function to load and render the component
 */
export function lazyLoadComponent(selector, loadFn) {
    const element = document.querySelector(selector);
    if (!element) return;

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    loadFn(element);
                    obs.unobserve(element);
                }
            });
        }, {
            rootMargin: '100px 0px',
            threshold: 0.01
        });

        observer.observe(element);
    } else {
        // Fallback: load immediately
        loadFn(element);
    }
}

// ============================================================================
// VIRTUAL SCROLLING FOR LARGE LISTS
// ============================================================================

/**
 * Virtual scroll container for large lists
 * Only renders visible items for better performance
 * @param {HTMLElement} container - Scroll container
 * @param {Array} items - Data array
 * @param {Function} renderItem - Function to render each item
 * @param {number} itemHeight - Height of each item in pixels
 */
export function initVirtualScroll(container, items, renderItem, itemHeight = 60) {
    const viewportHeight = container.clientHeight;
    const visibleCount = Math.ceil(viewportHeight / itemHeight) + 2;

    let startIndex = 0;
    let endIndex = visibleCount;

    function render() {
        const scrollTop = container.scrollTop;
        const newStartIndex = Math.floor(scrollTop / itemHeight);
        const newEndIndex = Math.min(newStartIndex + visibleCount, items.length);

        if (newStartIndex === startIndex && newEndIndex === endIndex) return;

        startIndex = newStartIndex;
        endIndex = newEndIndex;

        // Clear and re-render visible items
        container.innerHTML = '';
        container.style.height = `${items.length * itemHeight}px`;
        container.style.position = 'relative';

        const fragment = document.createDocumentFragment();

        for (let i = startIndex; i < endIndex; i++) {
            const item = renderItem(items[i], i);
            item.style.position = 'absolute';
            item.style.top = `${i * itemHeight}px`;
            item.style.left = '0';
            item.style.right = '0';
            fragment.appendChild(item);
        }

        container.appendChild(fragment);
    }

    container.addEventListener('scroll', render, { passive: true });
    render();

    return { destroy: () => container.removeEventListener('scroll', render) };
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize all lazy loading features
 * Call this on DOMContentLoaded
 */
export function initLazyLoading() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initImageLazyLoading();
        });
    } else {
        initImageLazyLoading();
    }
}

// Auto-initialize if loaded as module
if (typeof document !== 'undefined') {
    initLazyLoading();
}

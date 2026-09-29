/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FUNCTION UTILITIES
 * 
 * Higher-order functions: debounce, throttle, etc.
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Debounce function - delays execution until after wait ms
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} immediate - Execute on leading edge
 * @returns {Function} Debounced function
 */
export function debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func.apply(this, args);
        };
        
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        
        if (callNow) func.apply(this, args);
    };
}

/**
 * Throttle function - limits execution to once per wait ms
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Memoize function - caches results based on arguments
 * @param {Function} func - Function to memoize
 * @returns {Function} Memoized function
 */
export function memoize(func) {
    const cache = new Map();
    return function(...args) {
        const key = JSON.stringify(args);
        if (cache.has(key)) {
            return cache.get(key);
        }
        const result = func.apply(this, args);
        cache.set(key, result);
        return result;
    };
}

/**
 * Compose functions (right to left)
 * @param  {...Function} funcs - Functions to compose
 * @returns {Function} Composed function
 */
export function compose(...funcs) {
    return funcs.reduce((a, b) => (...args) => a(b(...args)));
}

/**
 * Pipe functions (left to right)
 * @param  {...Function} funcs - Functions to pipe
 * @returns {Function} Piped function
 */
export function pipe(...funcs) {
    return funcs.reduce((a, b) => (...args) => b(a(...args)));
}

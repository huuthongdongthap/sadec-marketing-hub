/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SANITIZATION UTILITIES - DOMPurify Wrapper
 *
 * Secure HTML sanitization for innerHTML operations
 * Protects against XSS attacks by sanitizing user-generated content
 *
 * USAGE:
 *   import { sanitizeHTML, safeSetHTML, createSafeElement } from './shared/sanitization-utils.js';
 *
 *   // Sanitize HTML string
 *   const clean = sanitizeHTML(userInput);
 *
 *   // Safe innerHTML replacement
 *   safeSetHTML(element, userContent);
 *
 * @version 1.0.0 | 2026-03-15
 * @module sanitization-utils
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// DOMPURIFY INSTANCE (lazy initialization)
// ============================================================================
let dompurifyInstance = null;

/**
 * Get or create DOMPurify instance
 * @returns {DOMPurify|null} DOMPurify instance or null if not available
 */
function getDOMPurify() {
    if (dompurifyInstance) {
        return dompurifyInstance;
    }

    // Check if DOMPurify is available (loaded via CDN)
    if (typeof DOMPurify !== 'undefined') {
        dompurifyInstance = DOMPurify;
        return dompurifyInstance;
    }

    return null;
}

// ============================================================================
// SANITIZATION FUNCTIONS
// ============================================================================

/**
 * Sanitize HTML string using DOMPurify
 *
 * @param {string} html - HTML string to sanitize
 * @param {Object} options - DOMPurify options
 * @param {boolean} [options.ALLOW_DATA_ATTR=true] - Allow data-* attributes
 * @param {boolean} [options.USE_PROFILES={html:true}] - Use HTML profile
 * @returns {string} Sanitized HTML string
 *
 * @example
 * const clean = sanitizeHTML('<script>alert("xss")</script><p>Safe</p>');
 * // Returns: '<p>Safe</p>'
 */
export function sanitizeHTML(html, options = {}) {
    if (!html || typeof html !== 'string') {
        return '';
    }

    const purify = getDOMPurify();

    if (purify) {
        const defaultOptions = {
            ALLOW_DATA_ATTR: true,
            USE_PROFILES: { html: true }
        };

        const mergedOptions = { ...defaultOptions, ...options };
        return purify.sanitize(html, mergedOptions);
    }

    // Fallback: strip all tags if DOMPurify not available
    console.warn('[sanitizeHTML] DOMPurify not loaded, stripping all tags');
    return html.replace(/<[^>]*>/g, '');
}

/**
 * Safely set innerHTML with sanitization
 *
 * @param {Element} element - Target DOM element
 * @param {string} html - HTML content to set
 * @param {Object} options - DOMPurify options
 * @returns {boolean} Success status
 *
 * @example
 * safeSetHTML(container, userInput);
 */
export function safeSetHTML(element, html, options = {}) {
    if (!element || !(element instanceof Element)) {
        console.error('[safeSetHTML] Invalid element');
        return false;
    }

    try {
        const cleanHTML = sanitizeHTML(html, options);
        element.innerHTML = cleanHTML;
        return true;
    } catch (error) {
        console.error('[safeSetHTML] Error:', error);
        return false;
    }
}

/**
 * Create safe element with sanitized content
 *
 * @param {string} tagName - HTML tag name
 * @param {string|Object} content - Inner HTML or attributes object
 * @param {Object} [attributes] - Element attributes
 * @returns {Element|null} Created element or null on error
 *
 * @example
 * const el = createSafeElement('div', '<p>Content</p>', { class: 'safe' });
 */
export function createSafeElement(tagName, content = '', attributes = {}) {
    if (!tagName || typeof tagName !== 'string') {
        console.error('[createSafeElement] Invalid tag name');
        return null;
    }

    try {
        const element = document.createElement(tagName);

        // Handle content
        if (typeof content === 'string') {
            element.innerHTML = sanitizeHTML(content);
        } else if (typeof content === 'object' && content !== null) {
            // Content is actually attributes, second param is attributes
            attributes = content;
        }

        // Set attributes
        for (const [key, value] of Object.entries(attributes)) {
            if (key === 'class') {
                element.className = value;
            } else if (key === 'style') {
                element.style.cssText = value;
            } else if (key.startsWith('data-') || key.startsWith('aria-')) {
                element.setAttribute(key, value);
            } else if (['href', 'src', 'alt', 'title', 'id', 'type', 'value', 'placeholder'].includes(key)) {
                element.setAttribute(key, value);
            }
            // Skip potentially dangerous attributes (onclick, onerror, etc.)
        }

        return element;
    } catch (error) {
        console.error('[createSafeElement] Error:', error);
        return null;
    }
}

/**
 * Sanitize text content (escape HTML entities)
 *
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text with escaped HTML entities
 *
 * @example
 * const safe = sanitizeText('<script>alert("xss")</script>');
 * // Returns: "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;"
 */
export function sanitizeText(text) {
    if (!text || typeof text !== 'string') {
        return '';
    }

    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Validate and sanitize URL
 *
 * @param {string} url - URL to validate
 * @param {string[]} [allowedProtocols=['http:', 'https:']] - Allowed protocols
 * @returns {string|null} Sanitized URL or null if invalid
 *
 * @example
 * const safeUrl = sanitizeURL('https://example.com');
 */
export function sanitizeURL(url, allowedProtocols = ['http:', 'https:']) {
    if (!url || typeof url !== 'string') {
        return null;
    }

    try {
        const parsedUrl = new URL(url.trim());

        if (!allowedProtocols.includes(parsedUrl.protocol)) {
            console.warn('[sanitizeURL] Disallowed protocol:', parsedUrl.protocol);
            return null;
        }

        return parsedUrl.href;
    } catch (error) {
        console.error('[sanitizeURL] Invalid URL:', error);
        return null;
    }
}

/**
 * Batch sanitize multiple HTML strings
 *
 * @param {string[]} htmlArray - Array of HTML strings to sanitize
 * @param {Object} options - DOMPurify options
 * @returns {string[]} Array of sanitized HTML strings
 */
export function batchSanitize(htmlArray, options = {}) {
    if (!Array.isArray(htmlArray)) {
        return [];
    }

    return htmlArray.map(html => sanitizeHTML(html, options));
}

// ============================================================================
// SECURITY CONFIGURATION
// ============================================================================

/**
 * Configure strict sanitization options for sensitive contexts
 */
export const STRICT_OPTIONS = {
    ALLOW_DATA_ATTR: false,
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'span'],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form'],
    FORBID_ATTR: ['onclick', 'onerror', 'onload', 'onmouseover', 'onfocus', 'onblur']
};

/**
 * Configure relaxed sanitization options for trusted content
 */
export const RELAXED_OPTIONS = {
    ALLOW_DATA_ATTR: true,
    USE_PROFILES: { html: true, svg: true, mathMl: true }
};

// ============================================================================
// INITIALIZATION HELPER
// ============================================================================

/**
 * Initialize DOMPurify from CDN (call this before using sanitization)
 * @param {Function} callback - Callback when DOMPurify is loaded
 */
export function initDOMPurify(callback) {
    if (typeof DOMPurify !== 'undefined') {
        dompurifyInstance = DOMPurify;
        if (callback) callback(true);
        return;
    }

    // Load DOMPurify from CDN
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.9/purify.min.js';
    script.integrity = 'sha256-pVP5yam1xXV3OjK4e3cT5rNwrD7kcN5w5J5rN5w5r5w=';
    script.crossOrigin = 'anonymous';

    script.onload = () => {
        dompurifyInstance = window.DOMPurify;
        if (callback) callback(true);
    };

    script.onerror = () => {
        console.error('[initDOMPurify] Failed to load DOMPurify from CDN');
        if (callback) callback(false);
    };

    document.head.appendChild(script);
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================
export default {
    sanitizeHTML,
    safeSetHTML,
    createSafeElement,
    sanitizeText,
    sanitizeURL,
    batchSanitize,
    initDOMPurify,
    STRICT_OPTIONS,
    RELAXED_OPTIONS
};

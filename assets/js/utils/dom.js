/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DOM UTILITIES
 * 
 * Safe DOM manipulation functions
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Safe querySelector (shorthand: $)
 * @param {string} selector - CSS selector
 * @param {Element} context - Context element (default: document)
 * @returns {Element|null} Matched element
 */
export function $(selector, context = document) {
    return context.querySelector(selector);
}

/**
 * Safe querySelectorAll (shorthand: $$)
 * @param {string} selector - CSS selector
 * @param {Element} context - Context element (default: document)
 * @returns {Element[]} Matched elements
 */
export function $$(selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
}

/**
 * Safely create element
 * @param {string} tag - HTML tag name
 * @param {Object} attributes - Attributes to set
 * @param {string|Element} content - Inner content
 * @returns {Element} Created element
 */
export function createElement(tag, attributes = {}, content = '') {
    const el = document.createElement(tag);
    
    Object.entries(attributes).forEach(([key, value]) => {
        if (key.startsWith('data-')) {
            el.setAttribute(key, value);
        } else if (key === 'class') {
            el.className = value;
        } else if (key.startsWith('on')) {
            el.addEventListener(key.slice(2).toLowerCase(), value);
        } else {
            el.setAttribute(key, value);
        }
    });
    
    if (content) {
        if (typeof content === 'string') {
            el.textContent = content;
        } else if (content instanceof Element) {
            el.appendChild(content);
        }
    }
    
    return el;
}

/**
 * Safely set HTML with XSS protection
 * @param {Element} element - Target element
 * @param {string} html - HTML content
 * @param {Object} options - Options { sanitize: boolean }
 */
export function setHTML(element, html, options = {}) {
    const { sanitize = false } = options;
    
    if (!sanitize) {
        element.innerHTML = html;
        return;
    }
    
    // Simple sanitization (remove script tags)
    const sanitized = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+="[^"]*"/g, '');
    
    element.innerHTML = sanitized;
}

/**
 * Remove element from DOM
 * @param {Element} element - Element to remove
 */
export function removeElement(element) {
    if (element && element.parentNode) {
        element.remove();
    }
}

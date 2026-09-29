/**
 * Shared DOM Utilities
 * Consolidated from: admin-utils.js, portal-utils.js, ui-utils.js
 * @version 1.0.0 | 2026-03-13
 */

/**
 * Query selector with error handling
 * @param {string} selector - CSS selector
 * @param {Element|string} context - Parent element or selector
 * @returns {Element|null}
 */
export function $(selector, context = document) {
  if (typeof context === 'string') {
    context = document.querySelector(context);
  }
  return context ? context.querySelector(selector) : null;
}

/**
 * Query selector all with error handling
 * @param {string} selector - CSS selector
 * @param {Element|string} context - Parent element or selector
 * @returns {Element[]}
 */
export function $$(selector, context = document) {
  if (typeof context === 'string') {
    context = document.querySelector(context);
  }
  return context ? Array.from(context.querySelectorAll(selector)) : [];
}

/**
 * Add event listener with optional options
 * @param {Element|Element[]} elements - Target element(s)
 * @param {string} event - Event name
 * @param {Function} handler - Event handler
 * @param {Object} options - Event options
 */
export function on(elements, event, handler, options = {}) {
  if (!Array.isArray(elements)) {
    elements = [elements];
  }
  elements.forEach(el => {
    if (el) {
      el.addEventListener(event, handler, options);
    }
  });
}

/**
 * Remove event listener
 * @param {Element|Element[]} elements - Target element(s)
 * @param {string} event - Event name
 * @param {Function} handler - Event handler
 */
export function off(elements, event, handler) {
  if (!Array.isArray(elements)) {
    elements = [elements];
  }
  elements.forEach(el => {
    if (el) {
      el.removeEventListener(event, handler);
    }
  });
}

/**
 * Create element with attributes
 * @param {string} tag - Tag name
 * @param {Object} attributes - Attributes object
 * @param {string|Element} [content] - Inner content
 * @returns {Element}
 */
export function createElement(tag, attributes = {}, content = null) {
  const el = document.createElement(tag);

  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      el.className = value;
    } else if (key === 'dataset') {
      Object.entries(value).forEach(([k, v]) => {
        el.dataset[k] = v;
      });
    } else if (key === 'style') {
      Object.assign(el.style, value);
    } else if (key.startsWith('on')) {
      const event = key.slice(2).toLowerCase();
      el.addEventListener(event, value);
    } else {
      el.setAttribute(key, value);
    }
  });

  if (content) {
    if (typeof content === 'string') {
      el.innerHTML = content;
    } else if (content instanceof Element) {
      el.appendChild(content);
    }
  }

  return el;
}

/**
 * Toggle class on element
 * @param {Element} el - Target element
 * @param {string} className - Class name
 * @param {boolean} [force] - Force add/remove
 */
export function toggleClass(el, className, force) {
  if (!el) return;
  el.classList.toggle(className, force);
}

/**
 * Add class to element
 * @param {Element} el - Target element
 * @param  {...string} classNames - Class names
 */
export function addClass(el, ...classNames) {
  if (!el) return;
  classNames.forEach(name => {
    if (name) el.classList.add(name);
  });
}

/**
 * Remove class from element
 * @param {Element} el - Target element
 * @param  {...string} classNames - Class names
 */
export function removeClass(el, ...classNames) {
  if (!el) return;
  classNames.forEach(name => {
    if (name) el.classList.remove(name);
  });
}

/**
 * Check if element has class
 * @param {Element} el - Target element
 * @param {string} className - Class name
 * @returns {boolean}
 */
export function hasClass(el, className) {
  return el ? el.classList.contains(className) : false;
}

/**
 * Get closest ancestor matching selector
 * @param {Element} el - Starting element
 * @param {string} selector - CSS selector
 * @returns {Element|null}
 */
export function closest(el, selector) {
  return el ? el.closest(selector) : null;
}

/**
 * Match selector for element or ancestors
 * @param {Element} el - Target element
 * @param {string} selector - CSS selector
 * @returns {boolean}
 */
export function matches(el, selector) {
  return el ? el.matches(selector) : false;
}

/**
 * Delegate event handler
 * @param {Element} parent - Parent element
 * @param {string} selector - Child selector
 * @param {string} event - Event name
 * @param {Function} handler - Event handler
 * @param {Object} options - Event options
 */
export function delegate(parent, selector, event, handler, options = {}) {
  on(parent, event, (e) => {
    const target = e.target.closest(selector);
    if (target && parent.contains(target)) {
      handler.call(target, e);
    }
  }, options);
}

/**
 * Wait for DOM ready
 * @param {Function} callback - Callback function
 * @returns {Promise<void>}
 */
export function ready(callback) {
  if (document.readyState !== 'loading') {
    callback();
  } else {
    document.addEventListener('DOMContentLoaded', callback);
  }
}

/**
 * Wait for element to exist
 * @param {string} selector - CSS selector
 * @param {Element} context - Parent element
 * @param {number} timeout - Timeout in ms
 * @returns {Promise<Element>}
 */
export function waitForElement(selector, context = document, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const el = context.querySelector(selector);
    if (el) {
      resolve(el);
      return;
    }

    const observer = new MutationObserver(() => {
      const found = context.querySelector(selector);
      if (found) {
        observer.disconnect();
        resolve(found);
      }
    });

    observer.observe(context, {
      childList: true,
      subtree: true
    });

    if (timeout > 0) {
      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Timeout waiting for: ${selector}`));
      }, timeout);
    }
  });
}

/**
 * Remove element from DOM
 * @param {Element} el - Element to remove
 */
export function remove(el) {
  if (el && el.parentNode) {
    el.parentNode.removeChild(el);
  }
}

/**
 * Empty element contents
 * @param {Element} el - Element to empty
 */
export function empty(el) {
  if (el) {
    el.innerHTML = '';
  }
}

/**
 * Show element
 * @param {Element} el - Target element
 * @param {string} display - Display value
 */
export function show(el, display = 'block') {
  if (el) {
    el.style.display = display;
  }
}

/**
 * Hide element
 * @param {Element} el - Target element
 */
export function hide(el) {
  if (el) {
    el.style.display = 'none';
  }
}

/**
 * Check if element is visible
 * @param {Element} el - Target element
 * @returns {boolean}
 */
export function isVisible(el) {
  if (!el) return false;
  const style = window.getComputedStyle(el);
  return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
}

/**
 * Get element offset from viewport
 * @param {Element} el - Target element
 * @returns {Object}
 */
export function getOffset(el) {
  if (!el) return { top: 0, left: 0 };
  const rect = el.getBoundingClientRect();
  return {
    top: rect.top + window.pageYOffset,
    left: rect.left + window.pageXOffset
  };
}

/**
 * Scroll element into view with smooth animation
 * @param {Element} el - Target element
 * @param {Object} options - Scroll options
 */
export function scrollIntoView(el, options = { behavior: 'smooth', block: 'start' }) {
  if (el) {
    el.scrollIntoView(options);
  }
}

/**
 * Set element attributes
 * @param {Element} el - Target element
 * @param {Object} attributes - Attributes object
 */
export function setAttributes(el, attributes) {
  if (!el) return;
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      el.className = value;
    } else if (key === 'dataset') {
      Object.entries(value).forEach(([k, v]) => {
        el.dataset[k] = v;
      });
    } else if (key === 'style') {
      Object.assign(el.style, value);
    } else {
      el.setAttribute(key, value);
    }
  });
}

/**
 * Get element data attribute
 * @param {Element} el - Target element
 * @param {string} key - Data key
 * @returns {string|null}
 */
export function getData(el, key) {
  return el ? el.dataset[key] || null : null;
}

/**
 * Set element data attribute
 * @param {Element} el - Target element
 * @param {string} key - Data key
 * @param {string} value - Data value
 */
export function setData(el, key, value) {
  if (el) {
    el.dataset[key] = value;
  }
}

// Convenience export for common operations
export const dom = {
  $,
  $$,
  on,
  off,
  delegate,
  create: createElement,
  toggle: toggleClass,
  add: addClass,
  remove: removeClass,
  has: hasClass,
  closest,
  matches,
  ready,
  wait: waitForElement,
  remove,
  empty,
  show,
  hide,
  visible: isVisible,
  offset: getOffset,
  scroll: scrollIntoView,
  attrs: setAttributes,
  data: { get: getData, set: setData }
};

// Auto-export globally for backward compatibility
if (typeof window !== 'undefined') {
  window.dom = dom;
  window.$ = $;
  window.$$ = $$;
}

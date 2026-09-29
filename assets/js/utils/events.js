/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EVENT UTILITIES
 * 
 * Event delegation and handling utilities
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Event delegation - single listener for multiple elements
 * @param {string} selector - CSS selector for target elements
 * @param {string} eventType - Event type (click, change, etc.)
 * @param {Function} handler - Event handler function
 * @param {Element} container - Container element (default: document)
 * @returns {Function} Cleanup function to remove listener
 */
export function delegateEvent(selector, eventType, handler, container = document) {
    const listener = (event) => {
        const target = event.target.closest(selector);
        if (target && container.contains(target)) {
            handler.call(target, event, target);
        }
    };
    
    container.addEventListener(eventType, listener, { passive: false });
    
    // Return cleanup function
    return () => container.removeEventListener(eventType, listener);
}

/**
 * Add multiple event listeners with single call
 * @param {Element} element - Target element
 * @param {Object} events - Event handlers { click: handler, change: handler }
 * @returns {Function} Cleanup function
 */
export function addEvents(element, events) {
    const cleanup = [];
    
    Object.entries(events).forEach(([eventType, handler]) => {
        element.addEventListener(eventType, handler);
        cleanup.push(() => element.removeEventListener(eventType, handler));
    });
    
    return () => cleanup.forEach(fn => fn());
}

/**
 * Trigger custom event
 * @param {Element} element - Target element
 * @param {string} eventName - Custom event name
 * @param {Object} detail - Event detail data
 */
export function triggerEvent(element, eventName, detail = {}) {
    const event = new CustomEvent(eventName, {
        bubbles: true,
        cancelable: true,
        detail
    });
    element.dispatchEvent(event);
}

/**
 * Prevent default and stop propagation
 * @param {Event} event - Event to stop
 */
export function stopEvent(event) {
    event.preventDefault();
    event.stopPropagation();
}

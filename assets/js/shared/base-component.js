/**
 * Sa Đéc Marketing Hub - Base Component Class
 *
 * Base class cho tất cả UI components với common patterns
 *
 * Features:
 * - Lifecycle hooks (init, render, destroy)
 * - Event binding utilities
 * - State management
 * - Error handling
 * - Logging utility (uses Logger)
 *
 * @example
 * class MyComponent extends BaseComponent {
 *   constructor(options) {
 *     super('my-component', options);
 *   }
 *
 *   render() {
 *     return `<div>My Component</div>`;
 *   }
 * }
 */

import { Logger } from './logger.js';

export class BaseComponent {
  /**
   * Create base component
   * @param {string} name - Component name
   * @param {Object} options - Component options
   */
  constructor(name, options = {}) {
    if (new.target === BaseComponent) {
      throw new Error('BaseComponent is abstract and cannot be instantiated directly');
    }

    this.name = name;
    this.options = {
      debug: false,
      autoInit: true,
      ...options
    };

    this.state = {};
    this.listeners = new Map();
    this.initialized = false;

    if (this.options.autoInit) {
      this.init();
    }
  }

  /**
   * Lifecycle: Initialize component
   * Override in child class
   */
  init() {
    if (this.initialized) return;

    this.debug('Initializing', this.name);
    this.setupState();
    this.render();
    this.bindEvents();
    this.initialized = true;
    this.onInit();
  }

  /**
   * Lifecycle: After init hook
   * Override in child class
   */
  onInit() {
    // Hook for child classes
  }

  /**
   * Setup initial state
   * Override in child class
   */
  setupState() {
    this.state = {
      ...this.state
    };
  }

  /**
   * Render component
   * Override in child class
   * @returns {string} HTML string
   */
  render() {
    return `<div>${this.name} component</div>`;
  }

  /**
   * Bind event listeners
   * Override in child class
   */
  bindEvents() {
    // Override in child class
  }

  /**
   * Update state and re-render
   * @param {Object} newState - New state properties
   */
  setState(newState) {
    const prevState = { ...this.state };
    this.state = { ...this.state, ...newState };
    this.debug('State updated', prevState, '=>', this.state);
    this.render();
    this.onStateChange(prevState, newState);
  }

  /**
   * Called when state changes
   * Override in child class
   * @param {Object} prevState - Previous state
   * @param {Object} newState - New state properties
   */
  onStateChange(prevState, newState) {
    // Hook for child classes
  }

  /**
   * Add event listener with cleanup tracking
   * @param {Element|Window|Document} target - Event target
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   * @param {Object} options - Event options
   */
  on(target, event, handler, options = {}) {
    if (!target) return;

    target.addEventListener(event, handler, options);

    const listeners = this.listeners.get(target) || [];
    listeners.push({ event, handler, options });
    this.listeners.set(target, listeners);
  }

  /**
   * Remove all tracked event listeners
   */
  off() {
    this.listeners.forEach((listeners, target) => {
      listeners.forEach(({ event, handler, options }) => {
        target.removeEventListener(event, handler, options);
      });
    });
    this.listeners.clear();
  }

  /**
   * Debug logger
   * @param  {...any} args - Log arguments
   */
  debug(...args) {
    if (this.options.debug) {
      Logger.debug(`[${this.name}]`, ...args);
    }
  }

  /**
   * Warning logger
   * @param  {...any} args - Log arguments
   */
  warn(...args) {
    if (this.options.debug) {
      Logger.warn(`[${this.name}]`, ...args);
    }
  }

  /**
   * Error logger
   * @param  {...any} args - Log arguments
   */
  error(...args) {
    Logger.error(`[${this.name}]`, ...args);
  }

  /**
   * Get element by selector within component context
   * @param {string} selector - CSS selector
   * @param {Element} context - Context element
   * @returns {Element|null}
   */
  $(selector, context = document) {
    if (typeof context === 'string') {
      context = document.querySelector(context);
    }
    return context ? context.querySelector(selector) : null;
  }

  /**
   * Get all elements by selector within component context
   * @param {string} selector - CSS selector
   * @param {Element} context - Context element
   * @returns {Element[]}
   */
  $$(selector, context = document) {
    if (typeof context === 'string') {
      context = document.querySelector(context);
    }
    return context ? Array.from(context.querySelectorAll(selector)) : [];
  }

  /**
   * Delegate event handler
   * @param {Element} parent - Parent element
   * @param {string} selector - Child selector
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   * @param {Object} options - Event options
   */
  delegate(parent, selector, event, handler, options = {}) {
    this.on(parent, event, (e) => {
      const target = e.target.closest(selector);
      if (target && parent.contains(target)) {
        handler.call(target, e);
      }
    }, options);
  }

  /**
   * Destroy component and cleanup
   */
  destroy() {
    this.debug('Destroying component');
    this.off();
    this.onDestroy();
    this.initialized = false;
  }

  /**
   * Lifecycle: Before destroy hook
   * Override in child class
   */
  onDestroy() {
    // Hook for child classes
  }

  /**
   * Get component info
   * @returns {Object} Component info
   */
  getInfo() {
    return {
      name: this.name,
      initialized: this.initialized,
      state: { ...this.state },
      options: { ...this.options }
    };
  }

  /**
   * Static: Initialize all components of this type
   * @param {string} selector - Component selector
   * @param {Object} options - Component options
   * @returns {Array} Array of component instances
   */
  static initAll(selector, options = {}) {
    const instances = [];
    document.querySelectorAll(selector).forEach((el, index) => {
      const component = new this({ ...options, element: el, index });
      instances.push(component);
    });
    return instances;
  }

  /**
   * Static: Initialize on DOM ready
   * @param {string} selector - Component selector
   * @param {Object} options - Component options
   */
  static initOnReady(selector, options = {}) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.initAll(selector, options);
      });
    } else {
      this.initAll(selector, options);
    }
  }
}

/**
 * Base Manager Class - Singleton pattern for managers
 *
 * @example
 * class ToastManager extends BaseManager {
 *   constructor() {
 *     super('ToastManager');
 *   }
 * }
 *
 * export const Toast = new ToastManager();
 */
export class BaseManager extends BaseComponent {
  constructor(name, options = {}) {
    super(name, { ...options, autoInit: false });
    this.instances = new Map();
  }

  /**
   * Get or create instance
   * @param {string} id - Instance ID
   * @param {Object} options - Instance options
   * @returns {BaseComponent}
   */
  get(id, options = {}) {
    if (!this.instances.has(id)) {
      const instance = this.create(id, options);
      this.instances.set(id, instance);
    }
    return this.instances.get(id);
  }

  /**
   * Create new instance
   * Override in child class
   * @param {string} id - Instance ID
   * @param {Object} options - Instance options
   * @returns {BaseComponent}
   */
  create(id, options) {
    this.debug('Creating instance:', id);
    return new BaseComponent(id, options);
  }

  /**
   * Remove instance
   * @param {string} id - Instance ID
   */
  remove(id) {
    const instance = this.instances.get(id);
    if (instance && typeof instance.destroy === 'function') {
      instance.destroy();
    }
    this.instances.delete(id);
  }

  /**
   * Clear all instances
   */
  clear() {
    this.instances.forEach((instance, id) => {
      this.remove(id);
    });
    this.instances.clear();
  }

  /**
   * Has instance
   * @param {string} id - Instance ID
   * @returns {boolean}
   */
  has(id) {
    return this.instances.has(id);
  }
}

// Global utility for backward compatibility
import { debounce, throttle, compose } from '../utils/function.js';

export const ComponentUtils = {
  debounce,
  throttle,
  compose,

  /**
   * Wrap async function with loading state
   * @param {Function} fn - Async function
   * @param {Function} [onStart] - Start callback
   * @param {Function} [onEnd] - End callback
   * @returns {Function}
   */
  withLoading(fn, onStart, onEnd) {
    return async function(...args) {
      if (onStart) onStart();
      try {
        return await fn.apply(this, args);
      } finally {
        if (onEnd) onEnd();
      }
    };
  },

  /**
   * Wrap function with error handling
   * @param {Function} fn - Function
   * @param {Function} [onError] - Error callback
   * @param {any} [defaultValue] - Default return value on error
   * @returns {Function}
   */
  withErrorHandling(fn, onError, defaultValue) {
    return function(...args) {
      try {
        return fn.apply(this, args);
      } catch (error) {
        if (onError) onError(error);
        return defaultValue;
      }
    };
  }
};

// Auto-export to window for backward compatibility
if (typeof window !== 'undefined') {
  window.BaseComponent = BaseComponent;
  window.BaseManager = BaseManager;
  window.ComponentUtils = ComponentUtils;
}

export default BaseComponent;

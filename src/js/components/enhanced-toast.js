/**
 * ==============================================
 * ENHANCED TOAST NOTIFICATION SYSTEM
 * Advanced toast notifications with queue, actions, and persistence
 * @version 2.0.0 | 2026-03-14
 * ==============================================
 */

// ============================================================================
// TOAST CONFIGURATION
// ============================================================================

const TOAST_CONFIG = {
  defaultDuration: 4000,
  maxVisible: 3,
  position: 'bottom-right', // top-right, bottom-right, top-left, bottom-left, top-center, bottom-center
  gap: 12,
  animations: {
    enter: 'slide-in',
    exit: 'fade-out'
  }
};

const TOAST_TYPES = {
  info: {
    icon: 'info',
    color: 'var(--md-sys-color-primary, #006A60)',
    bgColor: 'var(--md-sys-color-primary-container, #E0F4F2)'
  },
  success: {
    icon: 'check_circle',
    color: 'var(--md-sys-color-secondary, #34C759)',
    bgColor: 'var(--md-sys-color-secondary-container, #E8F5E9)'
  },
  warning: {
    icon: 'warning',
    color: 'var(--md-sys-color-tertiary, #FF9500)',
    bgColor: 'var(--md-sys-color-tertiary-container, #FFF3E0)'
  },
  error: {
    icon: 'error',
    color: 'var(--md-sys-color-error, #FF3B30)',
    bgColor: 'var(--md-sys-color-error-container, #FFEBEE)'
  },
  loading: {
    icon: 'progress_activity',
    color: 'var(--md-sys-color-primary, #006A60)',
    bgColor: 'var(--md-sys-color-surface-variant, #F5F5F5)'
  }
};

// ============================================================================
// TOAST MANAGER CLASS
// ============================================================================

export class ToastManager {
  constructor(options = {}) {
    this.config = { ...TOAST_CONFIG, ...options };
    this.queue = [];
    this.visible = [];
    this.container = null;
    this.init();
  }

  /**
   * Initialize toast container
   */
  init() {
    this.createContainer();
    this.loadPersistedToasts();
  }

  /**
   * Create toast container DOM
   */
  createContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = `toast-container toast-${this.config.position}`;
    container.setAttribute('role', 'region');
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-label', 'Notifications');

    document.body.appendChild(container);
    this.container = container;
  }

  /**
   * Show toast notification
   * @param {string} message - Toast message
   * @param {Object} options - Toast options
   * @returns {string} Toast ID
   */
  show(message, options = {}) {
    const {
      type = 'info',
      duration = this.config.defaultDuration,
      title = null,
      action = null,
      persistent = false,
      onClose = null
    } = options;

    const toast = {
      id: this.generateId(),
      message,
      type,
      duration,
      title,
      action,
      persistent,
      onClose,
      createdAt: Date.now()
    };

    this.queue.push(toast);
    this.processQueue();

    return toast.id;
  }

  /**
   * Process toast queue
   */
  processQueue() {
    while (this.visible.length < this.config.maxVisible && this.queue.length > 0) {
      const toast = this.queue.shift();
      this.showToast(toast);
    }
  }

  /**
   * Show individual toast
   * @param {Object} toast - Toast object
   */
  showToast(toast) {
    const toastEl = this.createToastElement(toast);
    this.container.appendChild(toastEl);
    this.visible.push({ ...toast, element: toastEl });

    // Animate in
    requestAnimationFrame(() => {
      toastEl.classList.add('toast-visible');
    });

    // Auto-dismiss
    if (toast.duration > 0 && !toast.persistent) {
      setTimeout(() => {
        this.dismiss(toast.id);
      }, toast.duration);
    }
  }

  /**
   * Create toast DOM element
   * @param {Object} toast - Toast object
   * @returns {HTMLElement} Toast element
   */
  createToastElement(toast) {
    const typeConfig = TOAST_TYPES[toast.type] || TOAST_TYPES.info;
    const el = document.createElement('div');
    el.className = `toast toast-${toast.type}`;
    el.setAttribute('role', 'alert');
    el.setAttribute('data-toast-id', toast.id);
    el.style.cssText = `
      --toast-icon-color: ${typeConfig.color};
      --toast-bg-color: ${typeConfig.bgColor};
    `;

    const icon = toast.type === 'loading'
      ? `<span class="material-symbols-outlined toast-icon spinning">${typeConfig.icon}</span>`
      : `<span class="material-symbols-outlined toast-icon">${typeConfig.icon}</span>`;

    el.innerHTML = `
      <div class="toast-content">
        ${icon}
        <div class="toast-body">
          ${toast.title ? `<div class="toast-title">${toast.title}</div>` : ''}
          <div class="toast-message">${toast.message}</div>
        </div>
      </div>
      ${toast.action ? `
        <button class="toast-action" data-toast-action>
          ${toast.action.label}
        </button>
      ` : ''}
      <button class="toast-close" aria-label="Close notification">
        <span class="material-symbols-outlined">close</span>
      </button>
      ${toast.duration > 0 && !toast.persistent ? `
        <div class="toast-progress">
          <div class="toast-progress-bar" style="animation-duration: ${toast.duration}ms"></div>
        </div>
      ` : ''}
    `;

    // Bind close event
    el.querySelector('.toast-close').addEventListener('click', () => {
      this.dismiss(toast.id);
    });

    // Bind action event
    const actionBtn = el.querySelector('[data-toast-action]');
    if (actionBtn && toast.action) {
      actionBtn.addEventListener('click', () => {
        toast.action.onClick();
        this.dismiss(toast.id);
      });
    }

    return el;
  }

  /**
   * Dismiss toast by ID
   * @param {string} toastId - Toast ID
   */
  dismiss(toastId) {
    const index = this.visible.findIndex(t => t.id === toastId);
    if (index === -1) return;

    const toast = this.visible[index];
    const toastEl = toast.element;

    toastEl.classList.remove('toast-visible');
    toastEl.classList.add('toast-hiding');

    // Call onClose callback
    if (toast.onClose) {
      toast.onClose();
    }

    // Remove after animation
    setTimeout(() => {
      toastEl.remove();
      this.visible = this.visible.filter(t => t.id !== toastId);
      this.processQueue();
    }, 300);
  }

  /**
   * Dismiss all toasts
   */
  dismissAll() {
    this.visible.forEach(toast => {
      toast.element.classList.remove('toast-visible');
      toast.element.classList.add('toast-hiding');
      setTimeout(() => toast.element.remove(), 300);
    });
    this.visible = [];
    this.queue = [];
  }

  /**
   * Update toast message
   * @param {string} toastId - Toast ID
   * @param {string} newMessage - New message
   */
  update(toastId, newMessage) {
    const toast = this.visible.find(t => t.id === toastId);
    if (toast) {
      const messageEl = toast.element.querySelector('.toast-message');
      if (messageEl) {
        messageEl.textContent = newMessage;
      }
    }
  }

  /**
   * Convert loading toast to success/error
   * @param {string} toastId - Toast ID
   * @param {string} type - New type (success|error)
   * @param {string} message - New message
   */
  convert(toastId, type, message) {
    const toast = this.visible.find(t => t.id === toastId);
    if (toast) {
      toast.type = type;
      toast.message = message;
      toast.duration = this.config.defaultDuration;

      // Re-render
      const newEl = this.createToastElement(toast);
      toast.element.replaceWith(newEl);
      toast.element = newEl;

      requestAnimationFrame(() => {
        newEl.classList.add('toast-visible');
      });
    }
  }

  /**
   * Generate unique ID
   * @returns {string} Unique ID
   */
  generateId() {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Load persisted toasts from localStorage
   */
  loadPersistedToasts() {
    try {
      const persisted = localStorage.getItem('pending-toasts');
      if (persisted) {
        const toasts = JSON.parse(persisted);
        toasts.forEach(toast => {
          if (toast.persistent) {
            this.show(toast.message, toast);
          }
        });
      }
    } catch (e) {
      // Silent fail - localStorage may be unavailable
    }
  }

  /**
   * Persist toast to localStorage
   * @param {Object} toast - Toast object
   */
  persistToast(toast) {
    try {
      const persisted = JSON.parse(localStorage.getItem('pending-toasts') || '[]');
      persisted.push(toast);
      localStorage.setItem('pending-toasts', JSON.stringify(persisted.slice(-5)));
    } catch (e) {
      // Silent fail - localStorage may be unavailable
    }
  }

  /**
   * Clear persisted toasts
   */
  clearPersisted() {
    localStorage.removeItem('pending-toasts');
  }
}

// ============================================================================
// CONVENIENCE METHODS
// ============================================================================

const globalToastManager = new ToastManager();

export const toast = {
  info: (message, options) => globalToastManager.show(message, { ...options, type: 'info' }),
  success: (message, options) => globalToastManager.show(message, { ...options, type: 'success' }),
  warning: (message, options) => globalToastManager.show(message, { ...options, type: 'warning' }),
  error: (message, options) => globalToastManager.show(message, { ...options, type: 'error' }),
  loading: (message, options) => globalToastManager.show(message, { ...options, type: 'loading', persistent: true, duration: 0 }),
  dismiss: (id) => globalToastManager.dismiss(id),
  dismissAll: () => globalToastManager.dismissAll(),
  update: (id, message) => globalToastManager.update(id, message),
  convert: (id, type, message) => globalToastManager.convert(id, type, message)
};

// ============================================================================
// GLOBAL STYLES INJECTION
// ============================================================================

export function injectToastStyles() {
  if (document.getElementById('toast-styles')) return;

  const styles = document.createElement('style');
  styles.id = 'toast-styles';
  styles.textContent = `
    /* Container */
    .toast-container {
      position: fixed;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      gap: ${globalToastManager.config.gap}px;
      max-width: 420px;
      pointer-events: none;
    }

    .toast-container.toast-top-right {
      top: 20px;
      right: 20px;
    }

    .toast-container.toast-bottom-right {
      bottom: 20px;
      right: 20px;
    }

    .toast-container.toast-top-left {
      top: 20px;
      left: 20px;
    }

    .toast-container.toast-bottom-left {
      bottom: 20px;
      left: 20px;
    }

    .toast-container.toast-top-center {
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
    }

    .toast-container.toast-bottom-center {
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
    }

    /* Toast Base */
    .toast {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 16px;
      background: var(--toast-bg-color);
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
      pointer-events: auto;
      opacity: 0;
      transform: translateX(100%);
      transition: opacity 0.3s ease, transform 0.3s ease;
      border-left: 4px solid var(--toast-icon-color);
    }

    .toast-visible {
      opacity: 1;
      transform: translateX(0);
    }

    .toast-hiding {
      opacity: 0;
      transform: translateX(100%);
    }

    /* Toast Content */
    .toast-content {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      flex: 1;
    }

    .toast-icon {
      color: var(--toast-icon-color);
      font-size: 20px;
      flex-shrink: 0;
    }

    .toast-icon.spinning {
      animation: toast-spin 1s linear infinite;
    }

    @keyframes toast-spin {
      to { transform: rotate(360deg); }
    }

    .toast-body {
      flex: 1;
      min-width: 0;
    }

    .toast-title {
      font-weight: 600;
      font-size: 14px;
      color: var(--md-sys-color-on-surface, #1a1a1a);
      margin-bottom: 4px;
    }

    .toast-message {
      font-size: 14px;
      color: var(--md-sys-color-on-surface-variant, #666);
      line-height: 1.4;
      word-wrap: break-word;
    }

    /* Toast Actions */
    .toast-action {
      padding: 8px 16px;
      background: transparent;
      border: 1px solid var(--toast-icon-color);
      border-radius: 8px;
      color: var(--toast-icon-color);
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .toast-action:hover {
      background: color-mix(in srgb, var(--toast-icon-color) 10%, transparent);
    }

    .toast-close {
      padding: 4px;
      background: transparent;
      border: none;
      cursor: pointer;
      color: var(--md-sys-color-on-surface-variant, #999);
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s;
    }

    .toast-close:hover {
      background: rgba(0, 0, 0, 0.05);
    }

    .toast-close .material-symbols-outlined {
      font-size: 18px;
    }

    /* Progress Bar */
    .toast-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: rgba(0, 0, 0, 0.1);
      border-radius: 0 0 12px 12px;
      overflow: hidden;
    }

    .toast-progress-bar {
      height: 100%;
      background: var(--toast-icon-color);
      animation: toast-progress linear forwards;
    }

    @keyframes toast-progress {
      from { width: 100%; }
      to { width: 0%; }
    }

    /* Responsive */
    @media (max-width: 640px) {
      .toast-container {
        left: 16px;
        right: 16px;
        max-width: none;
      }

      .toast-container.toast-top-right,
      .toast-container.toast-bottom-right,
      .toast-container.toast-top-left,
      .toast-container.toast-bottom-left {
        left: 16px;
        right: 16px;
      }

      .toast-container.toast-top-center,
      .toast-container.toast-bottom-center {
        left: 16px;
        right: 16px;
        transform: none;
      }

      .toast {
        padding: 12px;
      }

      .toast-action {
        display: none;
      }
    }

    /* Dark Mode */
    [data-theme="dark"] .toast-title {
      color: var(--md-sys-color-on-surface, #eee);
    }

    [data-theme="dark"] .toast-message {
      color: var(--md-sys-color-on-surface-variant, #aaa);
    }

    [data-theme="dark"] .toast-close:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  `;

  document.head.appendChild(styles);
}

// ============================================================================
// AUTO-INIT
// ============================================================================

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    injectToastStyles();
  });
}

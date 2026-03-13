/**
 * Toast Notification Manager - Sa Đéc Marketing Hub
 * Hệ thống thông báo toast với nhiều loại và vị trí
 *
 * Types: success, error, warning, info, loading
 * Positions: top-right, top-left, bottom-right, bottom-left, top-center, bottom-center
 */

class ToastManager {
  constructor() {
    this.container = null;
    this.toasts = new Map();
    this.defaultDuration = 4000;
    this.maxToasts = 5;
    this.position = 'top-right';
    this.init();
  }

  /**
   * Initialize toast manager
   */
  init() {
    this.createContainer();
    console.log('[Toast] Initialized');
  }

  /**
   * Create toast container
   */
  createContainer() {
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    this.container.setAttribute('role', 'region');
    this.container.setAttribute('aria-label', 'Notifications');
    this.container.setAttribute('aria-live', 'polite');
    document.body.appendChild(this.container);
  }

  /**
   * Show a toast notification
   * @param {Object} options - Toast options
   * @param {string} options.message - Message to display
   * @param {string} [options.type='info'] - Toast type: success, error, warning, info, loading
   * @param {string} [options.title] - Optional title
   * @param {number} [options.duration] - Auto-close duration (ms)
   * @param {boolean} [options.closable=true] - Show close button
   * @param {Function} [options.onClose] - Callback when closed
   * @param {Function} [options.onAction] - Callback for action button
   * @param {string} [options.actionText] - Action button text
   */
  show(options) {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const toast = document.createElement('div');
    toast.id = id;
    toast.className = `toast toast-${options.type || 'info'}`;
    toast.setAttribute('role', 'alert');

    const icon = this.getIcon(options.type || 'info');

    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-content">
        ${options.title ? `<div class="toast-title">${this.escapeHtml(options.title)}</div>` : ''}
        <div class="toast-message">${this.escapeHtml(options.message)}</div>
      </div>
      ${options.onAction ? `
        <button class="toast-action" data-action="${id}">
          ${this.escapeHtml(options.actionText || 'Action')}
        </button>
      ` : ''}
      ${options.closable !== false ? `
        <button class="toast-close" aria-label="Close">
          <span class="material-symbols-outlined">close</span>
        </button>
      ` : ''}
      <div class="toast-progress"></div>
    `;

    // Add event listeners
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn?.addEventListener('click', () => this.close(id));

    const actionBtn = toast.querySelector('.toast-action');
    if (actionBtn && options.onAction) {
      actionBtn.addEventListener('click', () => {
        options.onAction();
        this.close(id);
      });
    }

    // Store toast info
    this.toasts.set(id, {
      element: toast,
      onClose: options.onClose,
      createdAt: Date.now()
    });

    // Add to container
    this.container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('toast-show');
    });

    // Auto-close
    const duration = options.duration || this.defaultDuration;
    if (duration > 0 && options.type !== 'loading') {
      toast.timer = setTimeout(() => this.close(id), duration);
    }

    // Enforce max toasts
    if (this.toasts.size > this.maxToasts) {
      const oldestId = Array.from(this.toasts.keys())[0];
      this.close(oldestId);
    }

    return id;
  }

  /**
   * Close a toast
   * @param {string} id - Toast ID
   */
  close(id) {
    const toastData = this.toasts.get(id);
    if (!toastData) return;

    const { element, onClose } = toastData;

    element.classList.remove('toast-show');
    element.classList.add('toast-hide');

    // Clear timer
    if (element.timer) {
      clearTimeout(element.timer);
    }

    // Remove after animation
    element.addEventListener('animationend', () => {
      element.remove();
      this.toasts.delete(id);
      onClose?.();
    }, { once: true });
  }

  /**
   * Close all toasts
   */
  closeAll() {
    this.toasts.forEach((_, id) => this.close(id));
  }

  /**
   * Show success toast
   */
  success(message, options = {}) {
    return this.show({ ...options, message, type: 'success' });
  }

  /**
   * Show error toast
   */
  error(message, options = {}) {
    return this.show({ ...options, message, type: 'error' });
  }

  /**
   * Show warning toast
   */
  warning(message, options = {}) {
    return this.show({ ...options, message, type: 'warning' });
  }

  /**
   * Show info toast
   */
  info(message, options = {}) {
    return this.show({ ...options, message, type: 'info' });
  }

  /**
   * Show loading toast (no auto-close)
   */
  loading(message, options = {}) {
    return this.show({ ...options, message, type: 'loading', duration: 0, closable: false });
  }

  /**
   * Update loading toast to success
   */
  updateSuccess(id, message) {
    this.close(id);
    return this.success(message);
  }

  /**
   * Update loading toast to error
   */
  updateError(id, message) {
    this.close(id);
    return this.error(message);
  }

  /**
   * Get icon for toast type
   */
  getIcon(type) {
    const icons = {
      success: '<span class="material-symbols-outlined">check_circle</span>',
      error: '<span class="material-symbols-outlined">error</span>',
      warning: '<span class="material-symbols-outlined">warning</span>',
      info: '<span class="material-symbols-outlined">info</span>',
      loading: '<span class="material-symbols-outlined rotating">progress_activity</span>'
    };
    return icons[type] || icons.info;
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Set toast position
   */
  setPosition(position) {
    const validPositions = ['top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center'];
    if (validPositions.includes(position)) {
      this.position = position;
      this.container.className = `toast-container toast-${position}`;
    }
  }
}

// Add CSS styles dynamically
function addToastStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .toast-container {
      position: fixed;
      z-index: 999999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      pointer-events: none;
    }

    .toast-container.top-right {
      top: 20px;
      right: 20px;
    }

    .toast-container.top-left {
      top: 20px;
      left: 20px;
    }

    .toast-container.bottom-right {
      bottom: 20px;
      right: 20px;
    }

    .toast-container.bottom-left {
      bottom: 20px;
      left: 20px;
    }

    .toast-container.top-center {
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
    }

    .toast-container.bottom-center {
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
    }

    .toast {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      min-width: 320px;
      max-width: 480px;
      background: var(--md-sys-color-surface, #ffffff);
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
      border-left: 4px solid;
      pointer-events: auto;
      opacity: 0;
      transform: translateX(100%);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }

    .toast-container.top-left .toast,
    .toast-container.bottom-left .toast {
      transform: translateX(-100%);
    }

    .toast-container.top-center .toast,
    .toast-container.bottom-center .toast {
      transform: translateY(-100%);
    }

    .toast.toast-show {
      opacity: 1;
      transform: translateX(0);
    }

    .toast-container.top-center .toast.toast-show,
    .toast-container.bottom-center .toast.toast-show {
      transform: translateY(0);
    }

    .toast.toast-hide {
      opacity: 0;
      transform: translateX(100%);
    }

    .toast.toast-success {
      border-left-color: var(--md-sys-color-primary, #006A60);
    }

    .toast.toast-error {
      border-left-color: #d32f2f;
    }

    .toast.toast-warning {
      border-left-color: #f57c00;
    }

    .toast.toast-info {
      border-left-color: #1976d2;
    }

    .toast.toast-loading {
      border-left-color: #757575;
    }

    .toast-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--md-sys-color-primary, #006A60);
      flex-shrink: 0;
    }

    .toast-icon .material-symbols-outlined {
      font-size: 24px;
    }

    .toast-icon .material-symbols-outlined.rotating {
      animation: rotate 1s linear infinite;
    }

    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .toast-content {
      flex: 1;
      min-width: 0;
    }

    .toast-title {
      font-weight: 600;
      font-size: 15px;
      color: var(--md-sys-color-on-surface, #333);
      margin-bottom: 4px;
    }

    .toast-message {
      font-size: 14px;
      color: var(--md-sys-color-on-surface-variant, #666);
      line-height: 1.4;
      word-wrap: break-word;
    }

    .toast-action {
      padding: 8px 16px;
      background: transparent;
      border: 1px solid var(--md-sys-color-primary, #006A60);
      border-radius: 8px;
      color: var(--md-sys-color-primary, #006A60);
      font-weight: 500;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }

    .toast-action:hover {
      background: var(--md-sys-color-primary, #006A60);
      color: white;
    }

    .toast-close {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: transparent;
      border: none;
      border-radius: 50%;
      color: var(--md-sys-color-on-surface-variant, #666);
      cursor: pointer;
      transition: background 0.2s;
      flex-shrink: 0;
    }

    .toast-close:hover {
      background: var(--md-sys-color-surface-container-highest, #eee);
    }

    .toast-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 3px;
      background: var(--md-sys-color-primary, #006A60);
      opacity: 0.3;
      animation: progress linear forwards;
    }

    .toast.toast-loading .toast-progress {
      display: none;
    }

    @keyframes progress {
      from { width: 100%; }
      to { width: 0%; }
    }

    /* Mobile responsive */
    @media (max-width: 480px) {
      .toast-container {
        left: 12px;
        right: 12px;
      }

      .toast-container.top-right,
      .toast-container.top-left,
      .toast-container.bottom-right,
      .toast-container.bottom-left {
        left: 12px;
        right: 12px;
      }

      .toast {
        min-width: unset;
        width: 100%;
      }

      .toast-container.top-center,
      .toast-container.bottom-center {
        left: 12px;
        right: 12px;
        transform: none;
      }
    }
  `;
  document.head.appendChild(style);
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    addToastStyles();
    window.toast = new ToastManager();
  });
} else {
  addToastStyles();
  window.toast = new ToastManager();
}

export { ToastManager };

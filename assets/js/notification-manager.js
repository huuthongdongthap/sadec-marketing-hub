/**
 * ═══════════════════════════════════════════════════════════════════════════
 * NOTIFICATION MANAGER - Sa Đéc Marketing Hub
 * ═══════════════════════════════════════════════════════════════════════════
 * Core notification engine - Quản lý toast notifications và notification center
 *
 * Usage:
 *   NotificationManager.show('Thành công!', 'Đã lưu thay đổi', 'success');
 *   NotificationManager.error('Lỗi!', 'Không thể kết nối API');
 */

import { Logger } from './shared/logger.js';

const TAG = '[NotificationManager]';

class NotificationManager {
  constructor() {
    this.container = null;
    this.notifications = [];
    this.maxNotifications = 5;
    this.defaultDuration = 3000; // 3s for success/error
    this.warningDuration = 5000; // 5s for warning
    this.init();
  }

  /**
   * Initialize notification manager
   */
  init() {
    this.createContainer();
    this.loadFromStorage();
    this.setupKeyboardShortcut();
  }

  /**
   * Create notification container
   */
  createContainer() {
    if (document.getElementById('notification-container')) {
      this.container = document.getElementById('notification-container');
      return;
    }

    this.container = document.createElement('div');
    this.container.id = 'notification-container';
    this.container.setAttribute('aria-live', 'polite');
    this.container.setAttribute('aria-atomic', 'false');
    this.container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 400px;
      pointer-events: none;
    `;
    document.body.appendChild(this.container);
  }

  /**
   * Show notification
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @param {string} type - success|error|warning|info
   * @param {number} duration - Auto-dismiss duration (ms)
   */
  show(title, message, type = 'info', duration = null) {
    const notification = {
      id: this.generateId(),
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false
    };

    // Auto-dismiss duration
    if (duration === null) {
      duration = type === 'warning' ? this.warningDuration : this.defaultDuration;
    }

    // Add to container
    const toast = this.createToast(notification);
    this.container.appendChild(toast);

    // Add to notifications array
    this.notifications.unshift(notification);
    if (this.notifications.length > this.maxNotifications) {
      this.notifications.pop();
    }

    // Save to localStorage
    this.saveToStorage();

    // Dispatch custom event
    this.dispatchNotificationEvent(notification);

    // Auto-dismiss
    if (duration > 0) {
      setTimeout(() => this.dismiss(notification.id), duration);
    }

    return notification.id;
  }

  /**
   * Show success notification
   */
  success(title, message, duration = 3000) {
    return this.show(title, message, 'success', duration);
  }

  /**
   * Show error notification
   */
  error(title, message, duration = 5000) {
    return this.show(title, message, 'error', duration);
  }

  /**
   * Show warning notification
   */
  warning(title, message, duration = 5000) {
    return this.show(title, message, 'warning', duration);
  }

  /**
   * Show info notification
   */
  info(title, message, duration = 3000) {
    return this.show(title, message, 'info', duration);
  }

  /**
   * Create toast element
   */
  createToast(notification) {
    const toast = document.createElement('div');
    toast.className = `notification-toast toast-${notification.type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-label', `${notification.type}: ${notification.title}`);
    toast.style.cssText = `
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      background: var(--md-sys-color-surface, #fff);
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      border-left: 4px solid;
      pointer-events: auto;
      animation: slideInRight 0.3s ease;
      min-width: 300px;
      max-width: 400px;
    `;

    // Border color based on type
    const colors = {
      success: 'var(--md-sys-color-tertiary, #4caf50)',
      error: 'var(--md-sys-color-error, #f44336)',
      warning: 'var(--md-sys-color-error-container, #ff9800)',
      info: 'var(--md-sys-color-primary, #1976d2)'
    };
    toast.style.borderLeftColor = colors[notification.type] || colors.info;

    toast.innerHTML = `
      <span class="toast-icon" aria-hidden="true" style="font-size: 20px;">
        ${this.getIcon(notification.type)}
      </span>
      <div class="toast-content" style="flex: 1;">
        <div class="toast-title" style="font-weight: 600; font-size: 14px; color: var(--md-sys-color-on-surface, #1a1a1a); margin-bottom: 4px;">
          ${notification.title}
        </div>
        <div class="toast-message" style="font-size: 13px; color: var(--md-sys-color-on-surface-variant, #666); line-height: 1.4;">
          ${notification.message}
        </div>
      </div>
      <button class="toast-dismiss" aria-label="Đóng thông báo" style="
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        color: var(--md-sys-color-on-surface-variant, #999);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span class="material-symbols-outlined" style="font-size: 18px;">close</span>
      </button>
      ${duration > 0 ? `
        <div class="toast-progress" style="
          position: absolute;
          bottom: 0;
          left: 0;
          height: 3px;
          background: ${colors[notification.type]};
          animation: progress ${duration}ms linear;
          border-radius: 0 0 0 12px;
        "></div>
      ` : ''}
    `;

    // Dismiss button handler
    const dismissBtn = toast.querySelector('.toast-dismiss');
    dismissBtn.addEventListener('click', () => {
      this.dismiss(notification.id);
    });

    // Swipe to dismiss (touch devices)
    let touchStartX = 0;
    let touchCurrentX = 0;

    toast.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    });

    toast.addEventListener('touchmove', (e) => {
      touchCurrentX = e.touches[0].clientX;
      const diff = touchCurrentX - touchStartX;
      toast.style.transform = `translateX(${diff}px)`;
    });

    toast.addEventListener('touchend', () => {
      const diff = touchCurrentX - touchStartX;
      if (Math.abs(diff) > 100) {
        this.dismiss(notification.id);
      } else {
        toast.style.transform = 'translateX(0)';
      }
    });

    return toast;
  }

  /**
   * Get icon for notification type
   */
  getIcon(type) {
    const icons = {
      success: 'check_circle',
      error: 'error',
      warning: 'warning',
      info: 'info'
    };
    return icons[type] || icons.info;
  }

  /**
   * Dismiss notification
   */
  dismiss(id) {
    const toast = this.container.querySelector(`[data-id="${id}"]`);
    if (toast) {
      toast.style.animation = 'slideOutRight 0.3s ease forwards';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }

    // Remove from array
    const index = this.notifications.findIndex(n => n.id === id);
    if (index > -1) {
      this.notifications.splice(index, 1);
    }

    this.saveToStorage();
  }

  /**
   * Dismiss all notifications
   */
  dismissAll() {
    this.container.innerHTML = '';
    this.notifications = [];
    this.saveToStorage();
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Save notifications to localStorage
   */
  saveToStorage() {
    try {
      localStorage.setItem('notifications', JSON.stringify(this.notifications));
      localStorage.setItem('notification_unread', this.notifications.filter(n => !n.read).length);
    } catch (e) {
      Logger.warn(TAG, 'Cannot save notifications to localStorage:', e);
    }
  }

  /**
   * Load notifications from localStorage
   */
  loadFromStorage() {
    try {
      const stored = localStorage.getItem('notifications');
      if (stored) {
        this.notifications = JSON.parse(stored);
      }
    } catch (e) {
      Logger.warn(TAG, 'Cannot load notifications from localStorage:', e);
    }
  }

  /**
   * Dispatch custom event
   */
  dispatchNotificationEvent(notification) {
    const event = new CustomEvent('notification', {
      detail: { notification }
    });
    document.dispatchEvent(event);
  }

  /**
   * Setup keyboard shortcut to show notification center
   */
  setupKeyboardShortcut() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + N to show notifications
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        this.showNotificationCenter();
      }
    });
  }

  /**
   * Show notification center (dropdown/modal)
   */
  showNotificationCenter() {
    const event = new CustomEvent('notification-center-open', {
      detail: { notifications: this.notifications }
    });
    document.dispatchEvent(event);
  }

  /**
   * Get unread count
   */
  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  /**
   * Mark all as read
   */
  markAllRead() {
    this.notifications.forEach(n => n.read = true);
    this.saveToStorage();
  }

  /**
   * Get all notifications
   */
  getAll() {
    return [...this.notifications];
  }
}

// Create global instance
const NotificationManager = new NotificationManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NotificationManager;
}

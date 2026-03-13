/**
 * ═══════════════════════════════════════════════════════════════════════════
 * NOTIFICATION CENTER — Real-time Notification System
 *
 * Features:
 * - Real-time notifications with Supabase Realtime
 * - Badge count on bell icon
 * - Mark as read/unread
 * - Notification categories (info, warning, error, success)
 * - Click to navigate
 * - Auto-dismiss after action
 *
 * Usage:
 *   <notification-center></notification-center>
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { supabase } from '../services/supabase-client.js';
import { Logger } from '../shared/logger.js';

const TAG = '[NotificationCenter]';

/**
 * Notification types
 */
const NotificationType = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  SYSTEM: 'system'
};

/**
 * Notification priorities
 */
const Priority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

/**
 * Sound URLs for notification alerts
 */
const SOUND_URLS = {
  [Priority.HIGH]: 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU',
  [Priority.URGENT]: 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU'
};

/**
 * Audio context for playing notification sounds
 */
let audioContext = null;

/**
 * Notification Center Class
 */
class NotificationCenter {
  constructor() {
    this.notifications = [];
    this.unreadCount = 0;
    this.channel = null;
    this.maxNotifications = 50;
    this.storageKey = 'sadec_notifications';
    this.listeners = new Set();

    this.init();
  }

  /**
   * Initialize notification center
   */
  async init() {
    Logger.info(TAG, 'Initializing Notification Center...');

    // Load from localStorage
    this.loadFromStorage();

    // Subscribe to real-time notifications
    await this.subscribe();

    // Update UI
    this.updateBadge();
    this.render();

    Logger.info(TAG, `Initialized with ${this.notifications.length} notifications`);
  }

  /**
   * Subscribe to Supabase Realtime channel
   */
  async subscribe() {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        Logger.warn(TAG, 'No user ID, skipping realtime subscription');
        return;
      }

      this.channel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            Logger.info(TAG, 'New notification received:', payload);
            this.addNotification(payload.new);
          }
        )
        .subscribe();

      Logger.info(TAG, 'Subscribed to notifications channel');
    } catch (error) {
      Logger.error(TAG, 'Failed to subscribe:', error);
    }
  }

  /**
   * Load notifications from localStorage
   */
  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.notifications = JSON.parse(stored);
        this.unreadCount = this.notifications.filter(n => !n.read).length;
      }
    } catch (error) {
      Logger.error(TAG, 'Failed to load from storage:', error);
      this.notifications = [];
    }
  }

  /**
   * Save notifications to localStorage
   */
  saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.notifications));
    } catch (error) {
      Logger.error(TAG, 'Failed to save to storage:', error);
    }
  }

  /**
   * Get current user ID from session
   */
  getCurrentUserId() {
    try {
      const session = JSON.parse(localStorage.getItem('sb-auth-session') || '{}');
      return session?.user?.id || null;
    } catch {
      return null;
    }
  }

  /**
   * Add a new notification
   */
  addNotification(data) {
    const notification = {
      id: data.id || `notif_${Date.now()}`,
      title: data.title,
      message: data.message,
      type: data.type || NotificationType.INFO,
      priority: data.priority || Priority.MEDIUM,
      icon: this.getIconForType(data.type),
      read: false,
      createdAt: data.created_at || new Date().toISOString(),
      action: data.action || null,
      actionLabel: data.action_label || 'Xem',
      metadata: data.metadata || {}
    };

    // Add to beginning
    this.notifications.unshift(notification);

    // Trim old notifications
    if (this.notifications.length > this.maxNotifications) {
      this.notifications = this.notifications.slice(0, this.maxNotifications);
    }

    // Update unread count
    this.unreadCount++;

    // Save and update UI
    this.saveToStorage();
    this.updateBadge();
    this.render();
    this.notifyListeners('add', notification);

    // Show toast for high priority notifications
    if (data.priority === Priority.HIGH || data.priority === Priority.URGENT) {
      this.showNotificationToast(notification);
      this.playSound(data.priority);
    }

    Logger.info(TAG, `Added notification: ${notification.title}`);
  }

  /**
   * Play notification sound
   */
  playSound(priority) {
    try {
      // Use Web Audio API for notification sound
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Different sounds for different priorities
      if (priority === Priority.URGENT) {
        // Urgent: Double beep
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(1100, audioContext.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.4);
      } else {
        // High: Single beep
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
      }
    } catch (error) {
      Logger.warn(TAG, 'Failed to play sound:', error);
    }
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      notification.read = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
      this.saveToStorage();
      this.updateBadge();
      this.render();
      this.notifyListeners('markRead', notification);
    }
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.unreadCount = 0;
    this.saveToStorage();
    this.updateBadge();
    this.render();
    this.notifyListeners('markAllRead', null);
  }

  /**
   * Remove notification
   */
  remove(notificationId) {
    const index = this.notifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      const notification = this.notifications[index];
      if (!notification.read) {
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      }
      this.notifications.splice(index, 1);
      this.saveToStorage();
      this.updateBadge();
      this.render();
      this.notifyListeners('remove', notification);
    }
  }

  /**
   * Clear all notifications
   */
  clearAll() {
    this.notifications = [];
    this.unreadCount = 0;
    this.saveToStorage();
    this.updateBadge();
    this.render();
    this.notifyListeners('clearAll', null);
  }

  /**
   * Update badge count
   */
  updateBadge() {
    const badge = document.querySelector('.notification-badge');
    const bellBadge = document.querySelector('.notification-bell .badge');

    if (badge) {
      badge.textContent = this.unreadCount;
      badge.style.display = this.unreadCount > 0 ? 'flex' : 'none';
    }

    if (bellBadge) {
      bellBadge.textContent = this.unreadCount;
      bellBadge.style.display = this.unreadCount > 0 ? 'flex' : 'none';
      if (this.unreadCount > 0) {
        bellBadge.classList.add('badge-unread');
      }
    }

    // Update document title
    if (this.unreadCount > 0) {
      const baseTitle = document.title.replace(/^\(\d+\)\s*/, '');
      document.title = `(${this.unreadCount}) ${baseTitle}`;
    }
  }

  /**
   * Get icon for notification type
   */
  getIconForType(type) {
    const icons = {
      [NotificationType.INFO]: 'ℹ️',
      [NotificationType.SUCCESS]: '✅',
      [NotificationType.WARNING]: '⚠️',
      [NotificationType.ERROR]: '❌',
      [NotificationType.SYSTEM]: '⚙️'
    };
    return icons[type] || icons[NotificationType.INFO];
  }

  /**
   * Show notification toast
   */
  showNotificationToast(notification) {
    if (window.Toast) {
      const method = notification.type || 'info';
      Toast[method](notification.message, 5000);
    }
  }

  /**
   * Render notification panel
   */
  render() {
    const panel = document.querySelector('.notification-panel');
    if (!panel) return;

    if (this.notifications.length === 0) {
      panel.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">🔔</span>
          <p class="empty-title">Không có thông báo</p>
          <p class="empty-description">Các thông báo mới sẽ hiển thị ở đây</p>
        </div>
      `;
      return;
    }

    panel.innerHTML = `
      <div class="notification-header">
        <h3>Thông báo</h3>
        <div class="notification-actions">
          <button class="btn-mark-read" onclick="window.NotificationCenter.markAllAsRead()">
            Đánh dấu đã đọc
          </button>
          <button class="btn-clear-all" onclick="window.NotificationCenter.clearAll()">
            Xóa tất cả
          </button>
        </div>
      </div>
      <div class="notification-list">
        ${this.notifications.map(n => this.renderNotification(n)).join('')}
      </div>
    `;
  }

  /**
   * Render single notification item
   */
  renderNotification(notification) {
    const timeAgo = this.timeAgo(notification.createdAt);
    const readClass = notification.read ? 'notification-read' : 'notification-unread';

    return `
      <div class="notification-item ${readClass}" data-id="${notification.id}">
        <div class="notification-icon">${notification.icon}</div>
        <div class="notification-content">
          <div class="notification-title">${notification.title}</div>
          <div class="notification-message">${notification.message}</div>
          <div class="notification-meta">
            <span class="notification-time">${timeAgo}</span>
            ${notification.action ? `
              <button class="notification-action" onclick="window.NotificationCenter.handleAction('${notification.id}')">
                ${notification.actionLabel}
              </button>
            ` : ''}
            <button class="notification-dismiss" onclick="window.NotificationCenter.remove('${notification.id}')">
              ✕
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Handle notification action
   */
  handleAction(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification && notification.action) {
      // Mark as read
      this.markAsRead(notificationId);

      // Navigate to action URL
      if (notification.action.startsWith('http')) {
        window.open(notification.action, '_blank');
      } else {
        window.location.href = notification.action;
      }
    }
  }

  /**
   * Time ago formatter
   */
  timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    const intervals = [
      { label: 'năm', seconds: 31536000 },
      { label: 'tháng', seconds: 2592000 },
      { label: 'ngày', seconds: 86400 },
      { label: 'giờ', seconds: 3600 },
      { label: 'phút', seconds: 60 },
      { label: 'giây', seconds: 1 }
    ];

    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);
      if (count >= 1) {
        return `${count} ${interval.label} trước`;
      }
    }

    return 'Vừa xong';
  }

  /**
   * Add event listener
   */
  addListener(callback) {
    this.listeners.add(callback);
  }

  /**
   * Remove event listener
   */
  removeListener(callback) {
    this.listeners.delete(callback);
  }

  /**
   * Notify all listeners
   */
  notifyListeners(event, data) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data, this);
      } catch (error) {
        Logger.error(TAG, 'Listener error:', error);
      }
    });
  }

  /**
   * Destroy and cleanup
   */
  destroy() {
    if (this.channel) {
      this.channel.unsubscribe();
    }
    this.listeners.clear();
    Logger.info(TAG, 'Destroyed');
  }
}

/**
 * Custom Web Component
 */
class NotificationCenterElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

        .notification-bell {
          position: relative;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          transition: background-color 0.2s;
        }

        .notification-bell:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }

        .notification-bell svg {
          width: 24px;
          height: 24px;
          fill: currentColor;
        }

        .badge {
          position: absolute;
          top: 2px;
          right: 2px;
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          background: #e53935;
          color: white;
          font-size: 11px;
          font-weight: 600;
          border-radius: 9px;
          display: none;
          align-items: center;
          justify-content: center;
          animation: badge-pulse 2s infinite;
        }

        .badge-unread {
          animation: badge-pulse 1s infinite;
        }

        @keyframes badge-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .notification-panel {
          position: absolute;
          top: 100%;
          right: 0;
          width: 360px;
          max-height: 500px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          overflow: hidden;
          display: none;
        }

        .notification-panel.show {
          display: block;
          animation: panel-slide-down 0.2s ease-out;
        }

        @keyframes panel-slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid #e0e0e0;
        }

        .notification-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }

        .notification-actions {
          display: flex;
          gap: 8px;
        }

        .notification-actions button {
          padding: 6px 12px;
          font-size: 12px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .btn-mark-read {
          background: #f5f5f5;
          color: #333;
        }

        .btn-mark-read:hover {
          background: #e0e0e0;
        }

        .btn-clear-all {
          background: #fff3f3;
          color: #e53935;
        }

        .btn-clear-all:hover {
          background: #ffe0e0;
        }

        .notification-list {
          max-height: 400px;
          overflow-y: auto;
        }

        .notification-item {
          display: flex;
          gap: 12px;
          padding: 12px 16px;
          border-bottom: 1px solid #f5f5f5;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .notification-item:hover {
          background: #fafafa;
        }

        .notification-unread {
          background: #f0f7ff;
        }

        .notification-unread:hover {
          background: #e3f0ff;
        }

        .notification-icon {
          font-size: 20px;
          flex-shrink: 0;
        }

        .notification-content {
          flex: 1;
          min-width: 0;
        }

        .notification-title {
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 4px;
        }

        .notification-message {
          font-size: 13px;
          color: #666;
          margin-bottom: 8px;
          line-height: 1.4;
        }

        .notification-meta {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .notification-time {
          font-size: 11px;
          color: #999;
        }

        .notification-action {
          padding: 4px 8px;
          font-size: 11px;
          background: #0061AB;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .notification-action:hover {
          background: #004d8a;
        }

        .notification-dismiss {
          margin-left: auto;
          padding: 4px;
          font-size: 14px;
          background: none;
          border: none;
          cursor: pointer;
          color: #999;
        }

        .notification-dismiss:hover {
          color: #333;
        }

        .empty-state {
          padding: 40px 16px;
          text-align: center;
        }

        .empty-icon {
          font-size: 48px;
          display: block;
          margin-bottom: 16px;
        }

        .empty-title {
          font-weight: 600;
          margin-bottom: 8px;
        }

        .empty-description {
          color: #999;
          font-size: 13px;
        }
      </style>

      <div class="notification-bell" part="bell">
        <svg viewBox="0 0 24 24">
          <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/>
        </svg>
        <span class="badge">0</span>
      </div>

      <div class="notification-panel" part="panel">
        <div class="empty-state">
          <span class="empty-icon">🔔</span>
          <p class="empty-title">Không có thông báo</p>
          <p class="empty-description">Các thông báo mới sẽ hiển thị ở đây</p>
        </div>
      </div>
    `;

    // Add click handlers
    const bell = this.shadowRoot.querySelector('.notification-bell');
    const panel = this.shadowRoot.querySelector('.notification-panel');

    bell.addEventListener('click', (e) => {
      e.stopPropagation();
      panel.classList.toggle('show');
    });

    document.addEventListener('click', () => {
      panel.classList.remove('show');
    });

    panel.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }
}

// Initialize
if (!customElements.get('notification-center')) {
  customElements.define('notification-center', NotificationCenterElement);
}

// Export
const center = new NotificationCenter();

window.NotificationCenter = center;
window.NotificationType = NotificationType;
window.Priority = Priority;

// Auto-initialize on DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => center.init());
} else {
  center.init();
}

export { NotificationCenter, NotificationType, Priority };
export default center;

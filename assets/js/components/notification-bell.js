/**
 * Notification Bell Component — Real-time Notifications
 * Sa Đéc Marketing Hub
 * @version 1.0.0 | 2026-03-13
 */

class NotificationBell {
  constructor() {
    this.notifications = [];
    this.unreadCount = 0;
    this.isOpen = false;
    this.maxNotifications = 20;
    this.init();
  }

  /**
   * Initialize notification bell
   */
  init() {
    this.loadNotifications();
    this.createBell();
    this.bindEvents();
    this.startPolling();
  }

  /**
   * Load notifications from localStorage
   */
  loadNotifications() {
    const stored = localStorage.getItem('sadec-notifications');
    if (stored) {
      this.notifications = JSON.parse(stored);
      this.unreadCount = this.notifications.filter(n => !n.read).length;
    }
  }

  /**
   * Save notifications to localStorage
   */
  saveNotifications() {
    localStorage.setItem('sadec-notifications', JSON.stringify(this.notifications));
    this.updateBadge();
  }

  /**
   * Create notification bell DOM
   */
  createBell() {
    const bell = document.createElement('div');
    bell.id = 'notification-bell';
    bell.className = 'notification-bell';
    bell.setAttribute('role', 'button');
    bell.setAttribute('aria-label', 'Notifications');
    bell.setAttribute('aria-haspopup', 'true');
    bell.innerHTML = `
      <div class="notification-bell-icon">
        <span class="material-symbols-outlined">notifications</span>
        <span class="notification-badge" ${this.unreadCount === 0 ? 'hidden' : ''}>
          ${this.unreadCount > 9 ? '9+' : this.unreadCount}
        </span>
      </div>
      <div class="notification-panel" hidden>
        <div class="notification-panel-header">
          <h3>Thông báo</h3>
          <div class="notification-actions">
            <button class="mark-all-read-btn" aria-label="Mark all as read">
              <span class="material-symbols-outlined">done_all</span>
            </button>
            <button class="clear-all-btn" aria-label="Clear all">
              <span class="material-symbols-outlined">delete_sweep</span>
            </button>
          </div>
        </div>
        <div class="notification-panel-content">
          <div class="notification-list"></div>
          <div class="notification-empty" hidden>
            <span class="material-symbols-outlined">notifications_none</span>
            <p>Không có thông báo nào</p>
          </div>
        </div>
        <div class="notification-panel-footer">
          <a href="/admin/notifications.html">Xem tất cả →</a>
        </div>
      </div>
    `;

    // Insert into header or body
    const header = document.querySelector('.header-section') || document.querySelector('header');
    if (header) {
      const searchGlass = header.querySelector('.search-glass');
      if (searchGlass) {
        searchGlass.after(bell);
      } else {
        header.querySelector('div:last-child').after(bell);
      }
    } else {
      document.body.appendChild(bell);
    }

    this.bell = bell;
    this.panel = bell.querySelector('.notification-panel');
    this.list = bell.querySelector('.notification-list');
    this.emptyState = bell.querySelector('.notification-empty');
    this.badge = bell.querySelector('.notification-badge');
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Toggle panel
    this.bell.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggle();
    });

    // Close on outside click
    document.addEventListener('click', () => {
      this.close();
    });

    // Mark all as read
    this.bell.querySelector('.mark-all-read-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      this.markAllAsRead();
    });

    // Clear all
    this.bell.querySelector('.clear-all-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      this.clearAll();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  /**
   * Toggle panel visibility
   */
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Open panel
   */
  open() {
    this.isOpen = true;
    this.panel.hidden = false;
    this.bell.classList.add('open');
    this.render();
    document.body.style.overflow = 'hidden';
  }

  /**
   * Close panel
   */
  close() {
    this.isOpen = false;
    this.panel.hidden = true;
    this.bell.classList.remove('open');
    document.body.style.overflow = '';
  }

  /**
   * Render notifications list
   */
  render() {
    if (this.notifications.length === 0) {
      this.list.innerHTML = '';
      this.emptyState.hidden = false;
      return;
    }

    this.emptyState.hidden = true;
    const recentNotifications = this.notifications.slice(0, this.maxNotifications);

    this.list.innerHTML = recentNotifications.map((notif, index) => `
      <div class="notification-item ${!notif.read ? 'unread' : ''}" data-index="${index}">
        <div class="notification-icon ${notif.type}">
          <span class="material-symbols-outlined">${this.getIconForType(notif.type)}</span>
        </div>
        <div class="notification-content">
          <div class="notification-title">${notif.title}</div>
          <div class="notification-message">${notif.message}</div>
          <div class="notification-time">${this.formatTime(notif.timestamp)}</div>
        </div>
        <button class="notification-dismiss" aria-label="Dismiss notification">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
    `).join('');

    // Bind dismiss handlers
    this.list.querySelectorAll('.notification-dismiss').forEach((btn, index) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.dismiss(index);
      });
    });

    // Mark as read on click
    this.list.querySelectorAll('.notification-item').forEach((item, index) => {
      item.addEventListener('click', () => {
        this.markAsRead(index);
      });
    });
  }

  /**
   * Get icon for notification type
   */
  getIconForType(type) {
    const icons = {
      'info': 'info',
      'success': 'check_circle',
      'warning': 'warning',
      'error': 'error',
      'lead': 'person_add',
      'campaign': 'campaign',
      'finance': 'attach_money',
      'system': 'settings'
    };
    return icons[type] || 'notifications';
  }

  /**
   * Format timestamp
   */
  formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;

    return date.toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'short'
    });
  }

  /**
   * Add new notification
   */
  add(notification) {
    const newNotif = {
      id: Date.now().toString(),
      type: notification.type || 'info',
      title: notification.title,
      message: notification.message,
      timestamp: Date.now(),
      read: false,
      action: notification.action // Optional: { url, label }
    };

    this.notifications.unshift(newNotif);

    // Trim to max
    if (this.notifications.length > this.maxNotifications * 2) {
      this.notifications = this.notifications.slice(0, this.maxNotifications * 2);
    }

    this.unreadCount++;
    this.saveNotifications();

    // Show toast if panel is closed
    if (!this.isOpen) {
      this.showToast(newNotif);
    }

    return newNotif;
  }

  /**
   * Dismiss notification
   */
  dismiss(index) {
    this.notifications.splice(index, 1);
    this.saveNotifications();
    this.render();
  }

  /**
   * Mark as read
   */
  markAsRead(index) {
    if (this.notifications[index] && !this.notifications[index].read) {
      this.notifications[index].read = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
      this.saveNotifications();
      this.render();
    }
  }

  /**
   * Mark all as read
   */
  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.unreadCount = 0;
    this.saveNotifications();
    this.render();
  }

  /**
   * Clear all notifications
   */
  clearAll() {
    this.notifications = [];
    this.unreadCount = 0;
    this.saveNotifications();
    this.render();
  }

  /**
   * Update badge count
   */
  updateBadge() {
    if (this.badge) {
      this.badge.textContent = this.unreadCount > 9 ? '9+' : this.unreadCount;
      this.badge.hidden = this.unreadCount === 0;
    }
  }

  /**
   * Show toast notification
   */
  showToast(notification) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${notification.type}`;
    toast.innerHTML = `
      <span class="material-symbols-outlined">${this.getIconForType(notification.type)}</span>
      <div>
        <strong>${notification.title}</strong>
        <p>${notification.message}</p>
      </div>
      <button class="toast-dismiss">
        <span class="material-symbols-outlined">close</span>
      </button>
    `;

    toast.addEventListener('click', () => {
      toast.remove();
      if (notification.action) {
        window.location.href = notification.action.url;
      }
    });

    toast.querySelector('.toast-dismiss').addEventListener('click', (e) => {
      e.stopPropagation();
      toast.remove();
    });

    document.body.appendChild(toast);

    // Auto-remove after 5s
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }

  /**
   * Start polling for new notifications (simulated)
   */
  startPolling() {
    // In production, replace with actual API polling
    // setInterval(() => this.fetchFromAPI(), 30000);
  }

  /**
   * Fetch notifications from API (placeholder)
   */
  async fetchFromAPI() {
    try {
      // Replace with actual API endpoint
      // const response = await fetch('/api/notifications');
      // const data = await response.json();
      // data.forEach(n => this.add(n));
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.notificationBell = new NotificationBell();
  });
} else {
  window.notificationBell = new NotificationBell();
}

// Export for module usage
export { NotificationBell };

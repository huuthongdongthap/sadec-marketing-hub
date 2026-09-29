/**
 * Notification Bell Component
 * Bell icon with badge, click handling, browser notifications
 * @version 1.0.0 | 2026-03-13
 */

/**
 * Notification Bell Class
 */
export class NotificationBellComponent {
  constructor(options = {}) {
    this.storageKey = options.storageKey || 'sadec-notifications';
    this.panel = null;
    this.bell = null;
    this.badge = null;
    this.notifications = [];
    this.defaultNotifications = options.defaultNotifications || [];
  }

  /**
   * Initialize bell component
   * @param {Element} panelComponent - NotificationPanel instance
   */
  init(panelComponent) {
    this.panel = panelComponent;
    this.loadNotifications();
    this.createBell();
    this.bindEvents();
    this.updateBadge();
    this.requestNotificationPermission();
  }

  /**
   * Load notifications from localStorage
   */
  loadNotifications() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      this.notifications = JSON.parse(stored);
    } else {
      this.notifications = [...this.defaultNotifications];
      this.save();
    }
  }

  /**
   * Save notifications to localStorage
   */
  save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.notifications));
  }

  /**
   * Create bell UI element
   */
  createBell() {
    const bell = document.createElement('button');
    bell.id = 'notification-bell';
    bell.className = 'notification-bell';
    bell.setAttribute('aria-label', 'Notifications');
    bell.innerHTML = `
      <span class="material-symbols-outlined">notifications</span>
      <span class="notification-badge" style="display: none;">0</span>
    `;

    // Add to header
    const header = document.querySelector('.header-section, .top-bar, .page-header');
    if (header) {
      const actionsContainer = header.querySelector('.flex, .header-actions');
      if (actionsContainer) {
        actionsContainer.insertBefore(bell, actionsContainer.firstChild);
      }
    }

    this.bell = bell;
    this.badge = bell.querySelector('.notification-badge');
  }

  /**
   * Bind event handlers
   */
  bindEvents() {
    this.bell.addEventListener('click', (e) => {
      e.stopPropagation();
      this.togglePanel();
    });

    document.addEventListener('click', (e) => {
      if (this.panel && !this.panel.contains(e.target) && !this.bell.contains(e.target)) {
        this.closePanel();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.panel.classList.contains('open')) {
        this.closePanel();
      }
    });
  }

  /**
   * Toggle panel visibility
   */
  togglePanel() {
    const isOpen = this.panel.classList.contains('open');
    if (isOpen) {
      this.closePanel();
    } else {
      this.openPanel();
    }
  }

  /**
   * Open notification panel
   */
  openPanel() {
    this.panel.renderNotifications(this.notifications);
    this.panel.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  /**
   * Close notification panel
   */
  closePanel() {
    this.panel.classList.remove('open');
    document.body.style.overflow = '';
  }

  /**
   * Update unread badge count
   */
  updateBadge() {
    const unreadCount = this.notifications.filter(n => !n.read).length;

    if (unreadCount > 0) {
      this.badge.style.display = 'flex';
      this.badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
      this.bell.classList.add('has-notifications');
    } else {
      this.badge.style.display = 'none';
      this.bell.classList.remove('has-notifications');
    }
  }

  /**
   * Mark notification as read
   * @param {string} id - Notification ID
   */
  markAsRead(id) {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      this.save();
      this.updateBadge();
      this.panel.renderNotifications(this.notifications);
    }
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead() {
    this.notifications.forEach(n => {
      n.read = true;
    });
    this.save();
    this.updateBadge();
    this.panel.renderNotifications(this.notifications);
  }

  /**
   * Add new notification
   * @param {Object} notif - Notification data
   * @returns {Object} New notification object
   */
  addNotification(notif) {
    const newNotif = {
      id: Date.now().toString(),
      title: notif.title,
      message: notif.message,
      icon: notif.icon || 'notifications',
      time: Date.now(),
      read: false,
      type: notif.type || 'info',
      ...notif
    };

    this.notifications.unshift(newNotif);
    this.save();
    this.updateBadge();

    // Show browser notification if permitted
    if (Notification.permission === 'granted') {
      this.showBrowserNotification(newNotif);
    }

    // Update panel if open
    if (this.panel.classList.contains('open')) {
      this.panel.renderNotifications(this.notifications);
    }

    return newNotif;
  }

  /**
   * Show browser notification
   * @param {Object} notif - Notification data
   */
  showBrowserNotification(notif) {
    new Notification(notif.title, {
      body: notif.message,
      icon: '/favicon.png',
      badge: '/favicon.png',
      tag: notif.id,
      requireInteraction: false
    });
  }

  /**
   * Request notification permission
   */
  requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      document.body.addEventListener('click', () => {
        Notification.requestPermission();
      }, { once: true });
    }
  }

  /**
   * Calculate time ago string
   * @param {number} timestamp - Unix timestamp
   * @returns {string} Time ago in Vietnamese
   */
  timeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return 'Vừa xong';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} ngày trước`;

    return new Date(timestamp).toLocaleDateString('vi-VN');
  }
}

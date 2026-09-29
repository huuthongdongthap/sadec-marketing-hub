/**
 * Notification Panel Component
 * Slide-out panel with notification list
 * @version 1.0.0 | 2026-03-13
 */

/**
 * Notification Panel Class
 */
export class NotificationPanelComponent {
  constructor(options = {}) {
    this.element = null;
    this.bellComponent = null;
    this.timeAgoFn = options.timeAgoFn || this.defaultTimeAgo.bind(this);
  }

  /**
   * Initialize panel component
   * @param {NotificationBellComponent} bellComponent - Bell component instance
   */
  init(bellComponent) {
    this.bellComponent = bellComponent;
    this.createPanel();
    this.bindEvents();
  }

  /**
   * Create panel DOM element
   */
  createPanel() {
    const panel = document.createElement('div');
    panel.id = 'notification-panel';
    panel.className = 'notification-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Notifications');
    panel.innerHTML = `
      <div class="notification-panel-overlay"></div>
      <div class="notification-panel-content">
        <div class="notification-panel-header">
          <h3>Thông báo</h3>
          <div class="notification-panel-actions">
            <button class="btn-mark-read" title="Đánh dấu đã đọc">
              <span class="material-symbols-outlined">done_all</span>
            </button>
            <button class="btn-close-panel" title="Đóng">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>
        <div class="notification-panel-body">
          <div class="notification-list"></div>
          <div class="notification-empty" style="display: none;">
            <span class="material-symbols-outlined">notifications_none</span>
            <p>Không có thông báo nào</p>
          </div>
        </div>
        <div class="notification-panel-footer">
          <a href="/admin/notifications.html" class="btn-view-all">Xem tất cả</a>
        </div>
      </div>
    `;

    document.body.appendChild(panel);
    this.element = panel;
  }

  /**
   * Bind panel event handlers
   */
  bindEvents() {
    // Mark all as read
    const markReadBtn = this.element.querySelector('.btn-mark-read');
    markReadBtn.addEventListener('click', () => {
      this.bellComponent.markAllAsRead();
    });

    // Close panel button
    const closeBtn = this.element.querySelector('.btn-close-panel');
    closeBtn.addEventListener('click', () => {
      this.bellComponent.closePanel();
    });

    // Overlay click
    const overlay = this.element.querySelector('.notification-panel-overlay');
    overlay.addEventListener('click', () => {
      this.bellComponent.closePanel();
    });
  }

  /**
   * Render notifications list
   * @param {Array} notifications - Notifications array
   */
  renderNotifications(notifications) {
    const list = this.element.querySelector('.notification-list');
    const empty = this.element.querySelector('.notification-empty');

    if (!notifications || notifications.length === 0) {
      list.style.display = 'none';
      empty.style.display = 'flex';
      return;
    }

    list.style.display = 'block';
    empty.style.display = 'none';

    list.innerHTML = notifications
      .sort((a, b) => b.time - a.time)
      .map((notif) => this.renderNotification(notif))
      .join('');

    // Add click handlers
    list.querySelectorAll('.notification-item').forEach((item) => {
      item.addEventListener('click', () => {
        const id = item.dataset.id;
        this.bellComponent.markAsRead(id);
        // Navigate if has href
        const href = item.dataset.href;
        if (href) {
          window.location.href = href;
        }
      });
    });
  }

  /**
   * Render single notification item
   * @param {Object} notif - Notification object
   * @returns {string} HTML string
   */
  renderNotification(notif) {
    const timeAgo = this.timeAgoFn(notif.time);
    const typeClass = `notification-${notif.type}`;
    const readClass = notif.read ? 'read' : 'unread';

    return `
      <div class="notification-item ${typeClass} ${readClass}" data-id="${notif.id}">
        <div class="notification-icon">
          <span class="material-symbols-outlined">${notif.icon}</span>
        </div>
        <div class="notification-content">
          <div class="notification-title">${notif.title}</div>
          <div class="notification-message">${notif.message}</div>
          <div class="notification-time">${timeAgo}</div>
        </div>
        ${!notif.read ? '<div class="notification-dot"></div>' : ''}
      </div>
    `;
  }

  /**
   * Default time ago function
   * @param {number} timestamp - Unix timestamp
   * @returns {string} Time ago in Vietnamese
   */
  defaultTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return 'Vừa xong';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} ngày trước`;

    return new Date(timestamp).toLocaleDateString('vi-VN');
  }

  /**
   * Get panel DOM element
   * @returns {Element}
   */
  getElement() {
    return this.element;
  }

  /**
   * Check if panel is open
   * @returns {boolean}
   */
  isOpen() {
    return this.element.classList.contains('open');
  }
}

// ============================================================================
// CSS STYLES (Shared from notification-bell.js)
// ============================================================================

/**
 * Inject notification bell styles
 */
export function injectNotificationStyles() {
  if (document.getElementById('notification-bell-styles')) return;

  const styles = document.createElement('style');
  styles.id = 'notification-bell-styles';
  styles.textContent = `
    /* Notification Bell */
    .notification-bell {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: 1px solid var(--md-sys-color-outline-variant, #e0e0e0);
      background: var(--md-sys-color-surface, #fff);
      cursor: pointer;
      transition: all 0.2s ease;
      margin-right: 12px;
    }

    .notification-bell:hover {
      background: var(--md-sys-color-surface-container, #f5f5f5);
      transform: scale(1.05);
    }

    .notification-bell.has-notifications {
      animation: bell-shake 0.5s ease-in-out;
    }

    .notification-bell .material-symbols-outlined {
      color: var(--md-sys-color-on-surface, #333);
    }

    /* Notification Badge */
    .notification-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      min-width: 20px;
      height: 20px;
      padding: 0 6px;
      background: var(--md-sys-color-error, #ba1a1a);
      color: white;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    /* Notification Panel */
    .notification-panel {
      position: fixed;
      top: 0;
      right: 0;
      width: 100%;
      max-width: 400px;
      height: 100vh;
      z-index: 9999;
      transform: translateX(100%);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .notification-panel.open {
      transform: translateX(0);
    }

    .notification-panel-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.5);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .notification-panel.open .notification-panel-overlay {
      opacity: 1;
    }

    .notification-panel-content {
      position: relative;
      height: 100%;
      background: var(--md-sys-color-surface, #fff);
      display: flex;
      flex-direction: column;
      box-shadow: -4px 0 20px rgba(0,0,0,0.15);
    }

    .notification-panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid var(--md-sys-color-outline-variant, #e0e0e0);
    }

    .notification-panel-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--md-sys-color-on-surface, #333);
    }

    .notification-panel-actions {
      display: flex;
      gap: 8px;
    }

    .notification-panel-actions button {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: none;
      background: var(--md-sys-color-surface-container, #f5f5f5);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }

    .notification-panel-actions button:hover {
      background: var(--md-sys-color-surface-container-high, #e0e0e0);
    }

    .notification-panel-body {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
    }

    .notification-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .notification-item {
      display: flex;
      gap: 12px;
      padding: 12px 16px;
      background: var(--md-sys-color-surface-container-low, #fafafa);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
      position: relative;
    }

    .notification-item:hover {
      background: var(--md-sys-color-surface-container, #f0f0f0);
      transform: translateX(-4px);
    }

    .notification-item.unread {
      background: var(--md-sys-color-primary-container, #e6f4f3);
    }

    .notification-item.unread:hover {
      background: var(--md-sys-color-primary-container, #d4ebea);
    }

    .notification-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .notification-success .notification-icon {
      background: var(--md-sys-color-primary-container, #d4ebea);
      color: var(--md-sys-color-primary, #006a60);
    }

    .notification-info .notification-icon {
      background: var(--md-sys-color-tertiary-container, #e8dff5);
      color: var(--md-sys-color-tertiary, #6750a4);
    }

    .notification-warning .notification-icon {
      background: var(--md-sys-color-secondary-container, #ffeccf);
      color: var(--md-sys-color-secondary, #9c6800);
    }

    .notification-error .notification-icon {
      background: var(--md-sys-color-error-container, #ffdad6);
      color: var(--md-sys-color-error, #ba1a1a);
    }

    .notification-content {
      flex: 1;
      overflow: hidden;
    }

    .notification-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--md-sys-color-on-surface, #333);
      margin-bottom: 4px;
    }

    .notification-message {
      font-size: 13px;
      color: var(--md-sys-color-on-surface-variant, #666);
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .notification-time {
      font-size: 11px;
      color: var(--md-sys-color-outline-variant, #999);
      margin-top: 6px;
    }

    .notification-dot {
      width: 8px;
      height: 8px;
      background: var(--md-sys-color-primary, #006a60);
      border-radius: 50%;
      flex-shrink: 0;
      align-self: flex-start;
      margin-top: 6px;
    }

    .notification-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      color: var(--md-sys-color-on-surface-variant, #999);
      text-align: center;
    }

    .notification-empty .material-symbols-outlined {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .notification-empty p {
      margin: 0;
      font-size: 14px;
    }

    .notification-panel-footer {
      padding: 16px 24px;
      border-top: 1px solid var(--md-sys-color-outline-variant, #e0e0e0);
    }

    .btn-view-all {
      display: block;
      text-align: center;
      padding: 12px;
      background: var(--md-sys-color-primary, #006a60);
      color: var(--md-sys-color-on-primary, #fff);
      border-radius: 8px;
      text-decoration: none;
      font-weight: 500;
      font-size: 14px;
      transition: all 0.2s;
    }

    .btn-view-all:hover {
      background: var(--md-sys-color-primary-container, #008f84);
    }

    @keyframes bell-shake {
      0%, 100% { transform: rotate(0); }
      25% { transform: rotate(-10deg); }
      75% { transform: rotate(10deg); }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .notification-panel {
        max-width: 100%;
      }
    }
  `;
  document.head.appendChild(styles);
}

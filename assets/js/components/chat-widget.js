/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SA ĐÉC MARKETING HUB — CHAT WIDGET COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Floating chat widget với Zalo OA integration
 *
 * Features:
 * - Floating chat button với animation
 * - Zalo OA chat redirect
 * - Phone call quick action
 * - Facebook Messenger integration
 * - Working hours indicator
 * - Unread badge counter
 * - Smooth open/close animations
 * - Mobile responsive
 *
 * Usage:
 *   HTML:
 *   <div id="chatWidget" class="chat-widget"></div>
 *
 *   JS:
 *   ChatWidget.open();
 *   ChatWidget.close();
 *   ChatWidget.toggle();
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

class ChatWidgetManager {
  constructor(options = {}) {
    this.options = {
      zaloOA: options.zaloOA || '0915997989', // Số điện thoại Zalo OA
      phone: options.phone || '0915997989',
      facebookPage: options.facebookPage || '',
      workingHours: options.workingHours || { start: 8, end: 18 },
      autoGreeting: options.autoGreeting || true,
      ...options
    };

    this.isOpen = false;
    this.widget = null;
    this.init();
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.render());
    } else {
      this.render();
    }
  }

  /**
   * Render chat widget HTML
   */
  render() {
    const isWorkingHours = this.checkWorkingHours();

    const widgetHTML = `
      <div id="chat-widget" class="chat-widget" role="region" aria-label="Chat hỗ trợ">
        <!-- Chat Panel -->
        <div class="chat-widget__panel" id="chatPanel" hidden>
          <div class="chat-widget__header">
            <div class="chat-widget__header-content">
              <div class="chat-widget__avatar">
                <span class="material-symbols-outlined">support_agent</span>
              </div>
              <div class="chat-widget__info">
                <div class="chat-widget__title">Mekong Agency</div>
                <div class="chat-widget__status ${isWorkingHours ? 'online' : 'offline'}">
                  <span class="status-dot"></span>
                  <span class="status-text">${isWorkingHours ? 'Trực tuyến' : 'Ngoài giờ làm việc'}</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              class="chat-widget__close"
              onclick="ChatWidget.close()"
              aria-label="Đóng chat"
            >
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <div class="chat-widget__body">
            <!-- Quick Actions -->
            <div class="chat-widget__actions">
              <a
                href="https://zalo.me/${this.options.zaloOA}"
                target="_blank"
                rel="noopener noreferrer"
                class="chat-widget__action-btn zalo-btn"
                aria-label="Chat qua Zalo"
              >
                <span class="chat-widget__action-icon zalo-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 6.628 5.373 12 12 12s12-5.372 12-12S18.627 0 12 0zm0 21.75c-5.385 0-9.75-4.365-9.75-9.75S6.615 2.25 12 2.25 21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
                  </svg>
                </span>
                <span>Chat Zalo</span>
              </a>

              <a
                href="tel:${this.options.phone}"
                class="chat-widget__action-btn phone-btn"
                aria-label="Gọi điện thoại"
              >
                <span class="chat-widget__action-icon phone-icon">
                  <span class="material-symbols-outlined">phone</span>
                </span>
                <span>Gọi ngay</span>
              </a>

              ${this.options.facebookPage ? `
                <a
                  href="https://m.me/${this.options.facebookPage}"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="chat-widget__action-btn messenger-btn"
                  aria-label="Chat qua Messenger"
                >
                  <span class="chat-widget__action-icon messenger-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.373 0 0 5.063 0 11.688c0 3.75 2.063 7.063 5.25 9.188V24l2.938-1.688c1.25.375 2.562.563 3.812.563 6.627 0 12-5.063 12-11.688S18.627 0 12 0z"/>
                    </svg>
                  </span>
                  <span>Messenger</span>
                </a>
              ` : ''}
            </div>

            <!-- Working Hours -->
            <div class="chat-widget__hours">
              <div class="hours-label">
                <span class="material-symbols-outlined">schedule</span>
                Giờ làm việc:
              </div>
              <div class="hours-time">
                Thứ 2 - Thứ 7: ${this.options.workingHours.start}:00 - ${this.options.workingHours.end}:00
              </div>
            </div>

            <!-- Quick Messages -->
            <div class="chat-widget__quick-messages">
              <div class="quick-messages-title">Tin nhắn nhanh:</div>
              <button type="button" class="quick-message-btn" data-message="Tư vấn gói dịch vụ">
                💬 Tư vấn gói dịch vụ
              </button>
              <button type="button" class="quick-message-btn" data-message="Báo giá chi tiết">
                💰 Báo giá chi tiết
              </button>
              <button type="button" class="quick-message-btn" data-message="Hỗ trợ kỹ thuật">
                🔧 Hỗ trợ kỹ thuật
              </button>
            </div>
          </div>
        </div>

        <!-- Floating Button -->
        <button
          type="button"
          id="chatWidgetButton"
          class="chat-widget__button ${this.options.badge ? 'has-badge' : ''}"
          onclick="ChatWidget.toggle()"
          aria-label="Mở chat hỗ trợ"
          aria-expanded="false"
        >
          <span class="chat-widget__button-icon chat-icon">
            <span class="material-symbols-outlined">chat</span>
          </span>
          <span class="chat-widget__button-icon close-icon">
            <span class="material-symbols-outlined">close</span>
          </span>
          ${this.options.badge ? `<span class="chat-widget__badge">${this.options.badge}</span>` : ''}
        </button>
      </div>
    `;

    // Append to body
    document.body.insertAdjacentHTML('beforeend', widgetHTML);

    // Add event listeners for quick messages
    this.attachEventListeners();

    // Auto-greeting sau 5 giây
    if (this.options.autoGreeting) {
      setTimeout(() => this.showGreeting(), 5000);
    }
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Quick message buttons
    document.querySelectorAll('.quick-message-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const message = btn.getAttribute('data-message');
        this.sendQuickMessage(message);
      });
    });

    // Close panel khi click outside
    document.addEventListener('click', (e) => {
      if (this.isOpen &&
          !e.target.closest('#chatPanel') &&
          !e.target.closest('#chatWidgetButton')) {
        this.close();
      }
    });
  }

  /**
   * Check working hours
   */
  checkWorkingHours() {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday

    // Không làm việc Chủ Nhật
    if (day === 0) return false;

    // Check giờ làm việc
    return hour >= this.options.workingHours.start && hour < this.options.workingHours.end;
  }

  /**
   * Show greeting tooltip
   */
  showGreeting() {
    if (this.isOpen) return;

    const button = document.getElementById('chatWidgetButton');
    if (!button) return;

    // Remove existing greeting
    const existing = document.querySelector('.chat-widget__greeting');
    if (existing) existing.remove();

    const greeting = document.createElement('div');
    greeting.className = 'chat-widget__greeting';
    greeting.innerHTML = `
      <span class="greeting-bubble">Chào bạn! Cần chúng tôi hỗ trợ gì không? 💬</span>
    `;

    button.appendChild(greeting);

    // Auto remove sau 5 giây
    setTimeout(() => greeting.remove(), 5000);
  }

  /**
   * Send quick message to Zalo
   */
  sendQuickMessage(message) {
    const zaloUrl = `https://zalo.me/${this.options.zaloOA}?message=${encodeURIComponent(message)}`;
    window.open(zaloUrl, '_blank');
    this.close();
  }

  /**
   * Open chat panel
   */
  open() {
    const panel = document.getElementById('chatPanel');
    const button = document.getElementById('chatWidgetButton');

    if (!panel || !button) return;

    panel.hidden = false;
    panel.classList.add('chat-widget__panel--opening');
    button.setAttribute('aria-expanded', 'true');

    // Animation classes
    setTimeout(() => {
      panel.classList.add('chat-widget__panel--open');
      panel.classList.remove('chat-widget__panel--opening');
    }, 10);

    this.isOpen = true;

    // Track event
    if (window.gtag) {
      window.gtag('event', 'chat_open', {
        event_category: 'engagement',
        event_label: 'Chat widget opened'
      });
    }
  }

  /**
   * Close chat panel
   */
  close() {
    const panel = document.getElementById('chatPanel');
    const button = document.getElementById('chatWidgetButton');

    if (!panel || !button) return;

    panel.classList.remove('chat-widget__panel--open');
    panel.classList.add('chat-widget__panel--closing');
    button.setAttribute('aria-expanded', 'false');

    // Hide after animation
    setTimeout(() => {
      panel.hidden = true;
      panel.classList.remove('chat-widget__panel--closing');
    }, 300);

    this.isOpen = false;
  }

  /**
   * Toggle chat panel
   */
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Show/hide badge
   */
  setBadge(count) {
    const button = document.getElementById('chatWidgetButton');
    if (!button) return;

    if (count > 0) {
      let badge = button.querySelector('.chat-widget__badge');
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'chat-widget__badge';
        button.appendChild(badge);
      }
      badge.textContent = count > 99 ? '99+' : count;
      button.classList.add('has-badge');
    } else {
      button.classList.remove('has-badge');
      const badge = button.querySelector('.chat-widget__badge');
      if (badge) badge.remove();
    }
  }

  /**
   * Update status
   */
  setStatus(online) {
    const statusEl = document.querySelector('.chat-widget__status');
    if (!statusEl) return;

    statusEl.classList.toggle('online', online);
    statusEl.classList.toggle('offline', !online);

    const statusText = statusEl.querySelector('.status-text');
    if (statusText) {
      statusText.textContent = online ? 'Trực tuyến' : 'Ngoài giờ làm việc';
    }
  }
}

/**
 * Global instance
 */
const ChatWidget = new ChatWidgetManager({
  zaloOA: '0915997989',
  phone: '0915997989',
  workingHours: { start: 8, end: 18 },
  autoGreeting: true
});

// Export
window.ChatWidget = ChatWidget;
export default ChatWidget;

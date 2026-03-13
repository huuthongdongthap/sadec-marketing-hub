#!/usr/bin/env node
/**
 * User Preferences Component — Sa Đéc Marketing Hub
 *
 * Panel cho phép users tùy chỉnh:
 * - Theme (Dark/Light/System)
 * - Language (VI/EN)
 * - Notifications (On/Off)
 * - Keyboard Shortcuts (Enable/Disable)
 * - Dashboard Layout (Compact/Comfortable)
 *
 * Usage:
 *   import { UserPreferences } from './user-preferences.js';
 *   UserPreferences.open();
 */

class UserPreferences extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.preferences = this.loadPreferences();
  }

  static get observedAttributes() {
    return ['open'];
  }

  connectedCallback() {
    this.render();
    this.bindEvents();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'open') {
      if (newValue === '') {
        this.open();
      } else {
        this.close();
      }
    }
  }

  loadPreferences() {
    const defaults = {
      theme: 'system',
      language: 'vi',
      notifications: true,
      keyboardShortcuts: true,
      dashboardLayout: 'comfortable',
      fontSize: 'medium',
      animations: true
    };

    try {
      const saved = localStorage.getItem('user-preferences');
      return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    } catch {
      return defaults;
    }
  }

  savePreferences() {
    localStorage.setItem('user-preferences', JSON.stringify(this.preferences));
    this.dispatchEvent(new CustomEvent('preferences-saved', {
      bubbles: true,
      detail: { preferences: this.preferences }
    }));
  }

  open() {
    this.setAttribute('open', '');
    const modal = this.shadowRoot.querySelector('.modal');
    if (modal) {
      modal.classList.add('visible');
      modal.showModal();
    }
  }

  close() {
    this.removeAttribute('open');
    const modal = this.shadowRoot.querySelector('.modal');
    if (modal) {
      modal.classList.remove('visible');
      modal.close();
    }
  }

  bindEvents() {
    const modal = this.shadowRoot.querySelector('.modal');

    modal?.addEventListener('close', () => this.close());
    modal?.addEventListener('click', (e) => {
      if (e.target === modal) this.close();
    });

    // Theme toggle
    this.shadowRoot.querySelectorAll('[name="theme"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.preferences.theme = e.target.value;
        this.savePreferences();
        this.applyTheme();
      });
    });

    // Language toggle
    this.shadowRoot.querySelectorAll('[name="language"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.preferences.language = e.target.value;
        this.savePreferences();
      });
    });

    // Toggle switches
    this.shadowRoot.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const key = e.target.dataset.key;
        if (key) {
          this.preferences[key] = e.target.checked;
          this.savePreferences();
        }
      });
    });

    // Dashboard layout
    this.shadowRoot.querySelectorAll('[name="dashboard-layout"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.preferences.dashboardLayout = e.target.value;
        this.savePreferences();
      });
    });

    // Font size
    this.shadowRoot.querySelectorAll('[name="font-size"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.preferences.fontSize = e.target.value;
        this.savePreferences();
        this.applyFontSize();
      });
    });

    // Reset button
    const resetBtn = this.shadowRoot.querySelector('.reset-btn');
    resetBtn?.addEventListener('click', () => this.resetPreferences());

    // Close button
    const closeBtn = this.shadowRoot.querySelector('.close-btn');
    closeBtn?.addEventListener('click', () => this.close());
  }

  applyTheme() {
    const { theme } = this.preferences;
    document.documentElement.setAttribute('data-theme', theme);

    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
  }

  applyFontSize() {
    const { fontSize } = this.preferences;
    document.documentElement.setAttribute('data-font-size', fontSize);
  }

  resetPreferences() {
    localStorage.removeItem('user-preferences');
    this.preferences = this.loadPreferences();
    this.render();
    this.bindEvents();
    this.applyTheme();
    this.applyFontSize();
  }

  render() {
    const { theme, language, notifications, keyboardShortcuts, dashboardLayout, fontSize, animations } = this.preferences;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --md-sys-color-primary: #0061AB;
          --md-sys-color-on-primary: #FFFFFF;
          --md-sys-color-primary-container: #D1E4FF;
          --md-sys-color-on-primary-container: #001D36;
          --md-sys-color-surface: #FFFFFF;
          --md-sys-color-surface-container: #F3F6FB;
          --md-sys-color-on-surface: #101C2D;
          --md-sys-color-outline: #C3C9D4;
          --md-sys-color-outline-variant: #E1E4EC;
          --md-sys-radius-large: 16px;
          --md-sys-radius-medium: 12px;
          --md-sys-radius-small: 8px;
        }

        .modal {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s, visibility 0.3s;
          border: none;
          padding: 0;
          margin: 0;
          max-width: none;
          max-height: none;
        }

        .modal.visible {
          opacity: 1;
          visibility: visible;
        }

        .modal::backdrop {
          background: transparent;
        }

        .panel {
          background: var(--md-sys-color-surface);
          border-radius: var(--md-sys-radius-large);
          width: 90%;
          max-width: 560px;
          max-height: 85vh;
          overflow-y: auto;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid var(--md-sys-color-outline-variant);
          position: sticky;
          top: 0;
          background: var(--md-sys-color-surface);
          z-index: 1;
        }

        .header h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
        }

        .close-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          border-radius: var(--md-sys-radius-small);
          color: var(--md-sys-color-on-surface);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn:hover {
          background: var(--md-sys-color-surface-container);
        }

        .content {
          padding: 24px;
        }

        .section {
          margin-bottom: 32px;
        }

        .section:last-child {
          margin-bottom: 0;
        }

        .section-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--md-sys-color-primary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0 0 16px 0;
        }

        .option {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0;
          border-bottom: 1px solid var(--md-sys-color-outline-variant);
        }

        .option:last-child {
          border-bottom: none;
        }

        .option-label {
          flex: 1;
        }

        .option-label h3 {
          margin: 0 0 4px 0;
          font-size: 15px;
          font-weight: 500;
          color: var(--md-sys-color-on-surface);
        }

        .option-label p {
          margin: 0;
          font-size: 13px;
          color: var(--md-sys-color-on-surface);
          opacity: 0.7;
        }

        .option-controls {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        /* Radio Group */
        .radio-group {
          display: flex;
          background: var(--md-sys-color-surface-container);
          border-radius: var(--md-sys-radius-medium);
          padding: 4px;
        }

        .radio-option {
          position: relative;
        }

        .radio-option input {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }

        .radio-option label {
          display: block;
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 500;
          color: var(--md-sys-color-on-surface);
          cursor: pointer;
          border-radius: var(--md-sys-radius-small);
          transition: all 0.2s;
        }

        .radio-option input:checked + label {
          background: var(--md-sys-color-primary);
          color: var(--md-sys-color-on-primary);
        }

        .radio-option label:hover {
          background: var(--md-sys-color-outline-variant);
        }

        /* Toggle Switch */
        .toggle {
          position: relative;
          width: 52px;
          height: 32px;
        }

        .toggle input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          inset: 0;
          background: var(--md-sys-color-outline);
          border-radius: 32px;
          transition: 0.3s;
        }

        .toggle-slider::before {
          position: absolute;
          content: "";
          height: 24px;
          width: 24px;
          left: 4px;
          bottom: 4px;
          background: white;
          border-radius: 50%;
          transition: 0.3s;
        }

        .toggle input:checked + .toggle-slider {
          background: var(--md-sys-color-primary);
        }

        .toggle input:checked + .toggle-slider::before {
          transform: translateX(20px);
        }

        .footer {
          display: flex;
          justify-content: space-between;
          padding: 20px 24px;
          border-top: 1px solid var(--md-sys-color-outline-variant);
          background: var(--md-sys-color-surface-container);
          border-radius: 0 0 var(--md-sys-radius-large) var(--md-sys-radius-large);
        }

        .reset-btn {
          background: none;
          border: 1px solid var(--md-sys-color-outline);
          padding: 10px 20px;
          border-radius: var(--md-sys-radius-medium);
          font-size: 14px;
          color: var(--md-sys-color-on-surface);
          cursor: pointer;
          transition: all 0.2s;
        }

        .reset-btn:hover {
          background: var(--md-sys-color-outline-variant);
        }

        .done-btn {
          background: var(--md-sys-color-primary);
          color: var(--md-sys-color-on-primary);
          border: none;
          padding: 10px 24px;
          border-radius: var(--md-sys-radius-medium);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .done-btn:hover {
          box-shadow: 0 4px 12px rgba(0, 97, 171, 0.3);
        }
      </style>

      <dialog class="modal">
        <div class="panel">
          <div class="header">
            <h2>⚙️ Tùy Chọn Người Dùng</h2>
            <button class="close-btn" aria-label="Close">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <div class="content">
            <!-- Appearance -->
            <div class="section">
              <h3 class="section-title">🎨 Giao Diện</h3>

              <div class="option">
                <div class="option-label">
                  <h3>Chủ Đề</h3>
                  <p>Chọn giao diện sáng hoặc tối</p>
                </div>
                <div class="option-controls">
                  <div class="radio-group">
                    <div class="radio-option">
                      <input type="radio" name="theme" value="light" id="theme-light" ?checked="${theme === 'light'}">
                      <label for="theme-light">☀️ Sáng</label>
                    </div>
                    <div class="radio-option">
                      <input type="radio" name="theme" value="dark" id="theme-dark" ?checked="${theme === 'dark'}">
                      <label for="theme-dark">🌙 Tối</label>
                    </div>
                    <div class="radio-option">
                      <input type="radio" name="theme" value="system" id="theme-system" ?checked="${theme === 'system'}">
                      <label for="theme-system">💻 Hệ thống</label>
                    </div>
                  </div>
                </div>
              </div>

              <div class="option">
                <div class="option-label">
                  <h3>Kích Thước Font</h3>
                  <p>Điều chỉnh kích thước chữ</p>
                </div>
                <div class="option-controls">
                  <div class="radio-group">
                    <div class="radio-option">
                      <input type="radio" name="font-size" value="small" id="font-small" ?checked="${fontSize === 'small'}">
                      <label for="font-small">Nhỏ</label>
                    </div>
                    <div class="radio-option">
                      <input type="radio" name="font-size" value="medium" id="font-medium" ?checked="${fontSize === 'medium'}">
                      <label for="font-medium">Vừa</label>
                    </div>
                    <div class="radio-option">
                      <input type="radio" name="font-size" value="large" id="font-large" ?checked="${fontSize === 'large'}">
                      <label for="font-large">Lớn</label>
                    </div>
                  </div>
                </div>
              </div>

              <div class="option">
                <div class="option-label">
                  <h3>Bố Cục Dashboard</h3>
                  <p>Mật độ hiển thị thông tin</p>
                </div>
                <div class="option-controls">
                  <div class="radio-group">
                    <div class="radio-option">
                      <input type="radio" name="dashboard-layout" value="compact" id="layout-compact" ?checked="${dashboardLayout === 'compact'}">
                      <label for="layout-compact">Sát</label>
                    </div>
                    <div class="radio-option">
                      <input type="radio" name="dashboard-layout" value="comfortable" id="layout-comfortable" ?checked="${dashboardLayout === 'comfortable'}">
                      <label for="layout-comfortable">Thoáng</label>
                    </div>
                  </div>
                </div>
              </div>

              <div class="option">
                <div class="option-label">
                  <h3>Hiệu Ứng</h3>
                  <p>Bật/tắt animations</p>
                </div>
                <div class="option-controls">
                  <label class="toggle">
                    <input type="checkbox" data-key="animations" ?checked="${animations}">
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Language & Region -->
            <div class="section">
              <h3 class="section-title">🌐 Ngôn Ngữ</h3>

              <div class="option">
                <div class="option-label">
                  <h3>Ngôn Ngữ Hiển Thị</h3>
                  <p>Chọn ngôn ngữ giao diện</p>
                </div>
                <div class="option-controls">
                  <div class="radio-group">
                    <div class="radio-option">
                      <input type="radio" name="language" value="vi" id="lang-vi" ?checked="${language === 'vi'}">
                      <label for="lang-vi">🇻🇳 Tiếng Việt</label>
                    </div>
                    <div class="radio-option">
                      <input type="radio" name="language" value="en" id="lang-en" ?checked="${language === 'en'}">
                      <label for="lang-en">🇬🇧 English</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Notifications & Shortcuts -->
            <div class="section">
              <h3 class="section-title">🔔 Thông Báo & Phím Tắt</h3>

              <div class="option">
                <div class="option-label">
                  <h3>Thông Báo</h3>
                  <p>Nhận thông báo từ hệ thống</p>
                </div>
                <div class="option-controls">
                  <label class="toggle">
                    <input type="checkbox" data-key="notifications" ?checked="${notifications}">
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div class="option">
                <div class="option-label">
                  <h3>Phím Tắt</h3>
                  <p>Bật phím tắt (Ctrl+K, Ctrl+N, ...)</p>
                </div>
                <div class="option-controls">
                  <label class="toggle">
                    <input type="checkbox" data-key="keyboardShortcuts" ?checked="${keyboardShortcuts}">
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div class="footer">
            <button class="reset-btn">🔄 Khôi Phục Mặc Định</button>
            <button class="done-btn" onclick="this.getRootNode().host.close()">✅ Xong</button>
          </div>
        </div>
      </dialog>
    `;
  }
}

// Static API
UserPreferences.open = function() {
  let panel = document.querySelector('user-preferences');
  if (!panel) {
    panel = document.createElement('user-preferences');
    document.body.appendChild(panel);
  }
  panel.open();
};

// Auto-register
customElements.define('user-preferences', UserPreferences);

// Keyboard shortcut (Ctrl+Shift+P)
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'P') {
    e.preventDefault();
    UserPreferences.open();
  }
});

export { UserPreferences };

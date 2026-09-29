/**
 * Keyboard Shortcuts Manager - Sa Đéc Marketing Hub
 * Quản lý keyboard shortcuts cho thao tác nhanh
 *
 * Shortcuts:
 * - Ctrl/Cmd + K: Global search
 * - Ctrl/Cmd + H: Go to Home/Dashboard
 * - Ctrl/Cmd + ?: Show shortcuts help
 * - Escape: Close modals/dropdowns
 * - Ctrl/Cmd + S: Save (in forms)
 * - Ctrl/Cmd + Enter: Submit form
 */

class ShortcutsManager {
  constructor() {
    this.shortcuts = new Map();
    this.isInputFocused = false;
    this.showHelpModal = false;
    this.init();
  }

  /**
   * Initialize shortcuts manager
   */
  init() {
    // Register default shortcuts
    this.register('ctrl+k', (e) => {
      e.preventDefault();
      this.openSearch();
    });

    this.register('ctrl+/', (e) => {
      e.preventDefault();
      this.toggleHelp();
    });

    this.register('ctrl+h', (e) => {
      e.preventDefault();
      this.goToDashboard();
    });

    this.register('escape', (e) => {
      this.closeModals();
    });

    this.register('ctrl+s', (e) => {
      if (this.isInputFocused) {
        e.preventDefault();
        this.saveForm();
      }
    });

    this.register('ctrl+enter', (e) => {
      if (this.isInputFocused) {
        e.preventDefault();
        this.submitForm();
      }
    });

    // Track input focus state
    document.addEventListener('focusin', (e) => {
      if (e.target.matches('input, textarea, select')) {
        this.isInputFocused = true;
      }
    });

    document.addEventListener('focusout', (e) => {
      if (e.target.matches('input, textarea, select')) {
        this.isInputFocused = false;
      }
    });

    // Listen for keyboard events
    document.addEventListener('keydown', (e) => {
      this.handleKeydown(e);
    });
  }

  /**
   * Register a new shortcut
   * @param {string} key - Key combination (e.g., 'ctrl+k', 'escape')
   * @param {function} callback - Function to call when shortcut is triggered
   */
  register(key, callback) {
    this.shortcuts.set(key.toLowerCase(), callback);
  }

  /**
   * Unregister a shortcut
   * @param {string} key - Key combination to remove
   */
  unregister(key) {
    this.shortcuts.delete(key.toLowerCase());
  }

  /**
   * Handle keydown event
   */
  handleKeydown(e) {
    const key = this.normalizeKey(e);
    const callback = this.shortcuts.get(key);

    if (callback) {
      callback(e);
    }
  }

  /**
   * Normalize key combination to standard format
   */
  normalizeKey(e) {
    const parts = [];

    if (e.ctrlKey || e.metaKey) {
      parts.push('ctrl');
    }
    if (e.shiftKey) {
      parts.push('shift');
    }
    if (e.altKey) {
      parts.push('alt');
    }

    const keyName = e.key.toLowerCase();
    if (!['control', 'meta', 'shift', 'alt'].includes(keyName)) {
      parts.push(keyName);
    }

    return parts.join('+');
  }

  /**
   * Open global search
   */
  openSearch() {
    const searchInput = document.querySelector('input[type="search"], #global-search');
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    } else {
      // Create search modal if not exists
      this.createSearchModal();
    }
  }

  /**
   * Create search modal
   */
  createSearchModal() {
    let modal = document.getElementById('search-modal');
    if (modal) {
      modal.remove();
    }

    modal = document.createElement('div');
    modal.id = 'search-modal';
    modal.innerHTML = `
      <style>
        #search-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          backdrop-filter: blur(4px);
        }
        #search-modal.hidden {
          display: none;
        }
        .search-content {
          background: var(--md-sys-color-surface, #fff);
          border-radius: 12px;
          padding: 24px;
          width: 90%;
          max-width: 600px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }
        .search-input-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: var(--md-sys-color-surface-container, #f5f5f5);
          border-radius: 8px;
          border: 2px solid var(--md-sys-color-primary, #006A60);
        }
        .search-input-wrapper input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 16px;
          outline: none;
          color: var(--md-sys-color-on-surface, #333);
        }
        .search-hints {
          margin-top: 16px;
          font-size: 14px;
          color: var(--md-sys-color-on-surface-variant, #666);
        }
        .search-hints kbd {
          background: var(--md-sys-color-surface-container-highest, #eee);
          padding: 2px 6px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 12px;
        }
      </style>
      <div class="search-content">
        <div class="search-input-wrapper">
          <span class="material-symbols-outlined">search</span>
          <input
            type="text"
            id="modal-search-input"
            placeholder="Tìm kiếm trang, tính năng, cài đặt..."
            autofocus
          />
          <kbd>ESC</kbd>
        </div>
        <div class="search-hints">
          <p><kbd>↑</kbd> <kbd>↓</kbd> Để chọn kết quả</p>
          <p><kbd>Enter</kbd> Để mở kết quả đã chọn</p>
        </div>
      </div>
    `;

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeSearchModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeSearchModal();
      }
    });

    document.body.appendChild(modal);

    const input = modal.querySelector('input');
    input?.focus();
  }

  /**
   * Close search modal
   */
  closeSearchModal() {
    const modal = document.getElementById('search-modal');
    if (modal) {
      modal.remove();
    }
  }

  /**
   * Toggle shortcuts help modal
   */
  toggleHelp() {
    if (this.showHelpModal) {
      this.closeHelpModal();
    } else {
      this.openHelpModal();
    }
  }

  /**
   * Open shortcuts help modal
   */
  openHelpModal() {
    this.showHelpModal = true;

    let modal = document.getElementById('shortcuts-help-modal');
    if (modal) {
      modal.remove();
    }

    modal = document.createElement('div');
    modal.id = 'shortcuts-help-modal';
    modal.innerHTML = `
      <style>
        #shortcuts-help-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          backdrop-filter: blur(4px);
        }
        .help-content {
          background: var(--md-sys-color-surface, #fff);
          border-radius: 12px;
          padding: 24px;
          width: 90%;
          max-width: 500px;
          max-height: 80vh;
          overflow-y: auto;
        }
        .help-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .help-header h2 {
          margin: 0;
          font-size: 18px;
          color: var(--md-sys-color-on-surface, #333);
        }
        .close-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .close-btn:hover {
          background: var(--md-sys-color-surface-container-highest, #eee);
        }
        .shortcut-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid var(--md-sys-color-outline-variant, #ddd);
        }
        .shortcut-item:last-child {
          border-bottom: none;
        }
        .shortcut-desc {
          color: var(--md-sys-color-on-surface, #333);
        }
        .shortcut-keys {
          display: flex;
          gap: 4px;
        }
        .shortcut-keys kbd {
          background: var(--md-sys-color-surface-container-highest, #eee);
          padding: 4px 8px;
          border-radius: 6px;
          font-family: monospace;
          font-size: 13px;
          border: 1px solid var(--md-sys-color-outline, #ccc);
        }
      </style>
      <div class="help-content">
        <div class="help-header">
          <h2>⌨️ Phím Tắt</h2>
          <button class="close-btn" aria-label="Đóng">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="shortcuts-list">
          <div class="shortcut-item">
            <span class="shortcut-desc">Tìm kiếm</span>
            <div class="shortcut-keys">
              <kbd>Ctrl</kbd><kbd>K</kbd>
            </div>
          </div>
          <div class="shortcut-item">
            <span class="shortcut-desc">Về Dashboard</span>
            <div class="shortcut-keys">
              <kbd>Ctrl</kbd><kbd>H</kbd>
            </div>
          </div>
          <div class="shortcut-item">
            <span class="shortcut-desc">Hiển thị trợ giúp</span>
            <div class="shortcut-keys">
              <kbd>Ctrl</kbd><kbd>?</kbd>
            </div>
          </div>
          <div class="shortcut-item">
            <span class="shortcut-desc">Đóng modal</span>
            <div class="shortcut-keys">
              <kbd>Esc</kbd>
            </div>
          </div>
          <div class="shortcut-item">
            <span class="shortcut-desc">Lưu form</span>
            <div class="shortcut-keys">
              <kbd>Ctrl</kbd><kbd>S</kbd>
            </div>
          </div>
          <div class="shortcut-item">
            <span class="shortcut-desc">Gửi form</span>
            <div class="shortcut-keys">
              <kbd>Ctrl</kbd><kbd>Enter</kbd>
            </div>
          </div>
        </div>
      </div>
    `;

    modal.querySelector('.close-btn')?.addEventListener('click', () => {
      this.closeHelpModal();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeHelpModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeHelpModal();
      }
    }, { once: true });

    document.body.appendChild(modal);
  }

  /**
   * Close help modal
   */
  closeHelpModal() {
    this.showHelpModal = false;
    const modal = document.getElementById('shortcuts-help-modal');
    if (modal) {
      modal.remove();
    }
  }

  /**
   * Go to dashboard
   */
  goToDashboard() {
    const dashboardPath = window.location.pathname.includes('/admin/')
      ? '/admin/dashboard.html'
      : '/portal/dashboard.html';
    window.location.href = dashboardPath;
  }

  /**
   * Close all modals
   */
  closeModals() {
    this.closeSearchModal();
    this.closeHelpModal();

    // Close other modals
    document.querySelectorAll('[role="dialog"], .modal').forEach(modal => {
      modal.remove();
    });
  }

  /**
   * Save form (placeholder)
   */
  saveForm() {
    // Dispatch custom event for form save
    document.dispatchEvent(new CustomEvent('form-save'));
  }

  /**
   * Submit form
   */
  submitForm() {
    const form = document.querySelector('form :focus')?.closest('form');
    if (form) {
      form.requestSubmit();
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.shortcuts = new ShortcutsManager();
  });
} else {
  window.shortcuts = new ShortcutsManager();
}

export { ShortcutsManager };

/**
 * Keyboard Shortcuts Manager
 * Sa Đéc Marketing Hub
 * @version 1.0.0 | 2026-03-13
 */

class KeyboardShortcuts {
  constructor() {
    this.shortcuts = new Map();
    this.registered = new Set();
    this.helpModal = null;
    this.init();
  }

  /**
   * Initialize keyboard shortcuts
   */
  init() {
    this.registerDefaultShortcuts();
    this.bindEvents();
    this.createHelpModal();
  }

  /**
   * Register default shortcuts
   */
  registerDefaultShortcuts() {
    // Navigation
    this.register('Ctrl+K', 'Mở Command Palette', () => {
      if (window.commandPalette) {
        window.commandPalette.toggle();
      }
    });

    this.register('Ctrl+?', 'Mở Help Modal', () => {
      this.toggleHelp();
    });

    this.register('Escape', 'Đóng modal/palette', () => {
      this.closeAllModals();
    });

    // Dashboard
    this.register('G then D', 'Về Dashboard', () => {
      window.location.href = '/admin/dashboard.html';
    });

    this.register('G then L', 'Về Leads', () => {
      window.location.href = '/admin/leads.html';
    });

    this.register('G then P', 'Về Pipeline', () => {
      window.location.href = '/admin/pipeline.html';
    });

    this.register('G then C', 'Về Campaigns', () => {
      window.location.href = '/admin/campaigns.html';
    });

    this.register('G then F', 'Về Finance', () => {
      window.location.href = '/admin/finance.html';
    });

    // Actions
    this.register('N then L', 'Tạo Lead mới', () => {
      window.location.href = '/admin/leads.html?action=new';
    });

    this.register('N then C', 'Tạo Campaign mới', () => {
      window.location.href = '/admin/campaigns.html?action=new';
    });

    this.register('Ctrl+S', 'Lưu thay đổi', (e) => {
      e.preventDefault();
      this.triggerSave();
    });

    this.register('Ctrl+E', 'Export data', () => {
      this.triggerExport();
    });

    // Search
    this.register('/', 'Tìm kiếm', (e) => {
      e.preventDefault();
      this.focusSearch();
    });

    // Theme
    this.register('Ctrl+Shift+D', 'Toggle Dark Mode', () => {
      if (window.themeToggle) {
        window.themeToggle.toggle();
      }
    });

    // Notifications
    this.register('Ctrl+Shift+N', 'Mở Notifications', () => {
      if (window.notificationBell) {
        window.notificationBell.toggle();
      }
    });
  }

  /**
   * Register a shortcut
   */
  register(combo, description, handler) {
    this.shortcuts.set(combo, { description, handler });
  }

  /**
   * Bind global keyboard events
   */
  bindEvents() {
    document.addEventListener('keydown', (e) => {
      // Ignore when typing in input/textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        return;
      }

      const combo = this.getCombo(e);

      // Check for exact match
      if (this.shortcuts.has(combo)) {
        e.preventDefault();
        this.shortcuts.get(combo).handler(e);
        return;
      }

      // Check for sequential shortcuts (G then D, etc.)
      if (combo === 'G') {
        this.waitForNextKey();
      }

      if (combo === 'N') {
        this.waitForNextKey();
      }
    });
  }

  /**
   * Get combo string from event
   */
  getCombo(e) {
    const parts = [];

    if (e.ctrlKey) parts.push('Ctrl');
    if (e.shiftKey) parts.push('Shift');
    if (e.altKey) parts.push('Alt');
    if (e.metaKey) parts.push('Meta');

    // Get key
    const key = e.key.toUpperCase();
    if (!['CONTROL', 'SHIFT', 'ALT', 'META'].includes(key)) {
      parts.push(key);
    }

    return parts.join('+');
  }

  /**
   * Wait for next key in sequence
   */
  waitForNextKey() {
    let timeout;

    const handleNextKey = (e) => {
      clearTimeout(timeout);
      document.removeEventListener('keydown', handleNextKey);

      const nextKey = e.key.toUpperCase();
      const combo = `G then ${nextKey}`;

      if (this.shortcuts.has(combo)) {
        e.preventDefault();
        this.shortcuts.get(combo).handler(e);
      }
    };

    document.addEventListener('keydown', handleNextKey);

    timeout = setTimeout(() => {
      document.removeEventListener('keydown', handleNextKey);
    }, 1500);
  }

  /**
   * Close all modals
   */
  closeAllModals() {
    // Close command palette
    if (window.commandPalette && window.commandPalette.isOpen) {
      window.commandPalette.close();
    }

    // Close notification panel
    if (window.notificationBell && window.notificationBell.isOpen) {
      window.notificationBell.close();
    }

    // Close help modal
    if (this.helpModal && this.helpModal.open) {
      this.helpModal.close();
    }
  }

  /**
   * Trigger save
   */
  triggerSave() {
    // Try to find and click save button
    const saveBtn = document.querySelector('button[type="submit"], .save-btn, [onclick*="save"]');
    if (saveBtn) {
      saveBtn.click();
      this.showToast('Đã lưu thay đổi', 'success');
    } else {
      this.showToast('Không tìm thấy nút lưu', 'info');
    }
  }

  /**
   * Trigger export
   */
  triggerExport() {
    const exportBtn = document.querySelector('[onclick*="export"], [onclick*="Export"], .export-btn');
    if (exportBtn) {
      exportBtn.click();
    } else {
      this.showToast('Không tìm thấy chức năng export', 'info');
    }
  }

  /**
   * Focus search input
   */
  focusSearch() {
    const searchInput = document.querySelector('input[type="text"][placeholder*="Tìm"], input[type="search"], #searchInput, .search-input');
    if (searchInput) {
      searchInput.focus();
    } else {
      // Open command palette as fallback
      if (window.commandPalette) {
        window.commandPalette.open();
      }
    }
  }

  /**
   * Create help modal
   */
  createHelpModal() {
    const modal = document.createElement('dialog');
    modal.id = 'keyboard-help-modal';
    modal.className = 'keyboard-help-modal';
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h2>
            <span class="material-symbols-outlined">keyboard</span>
            Phím Tắt
          </h2>
          <button class="modal-close" aria-label="Close">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="shortcuts-grid">
            ${this.renderShortcutsSection('Điều hướng', ['Ctrl+K', 'G then D', 'G then L', 'G then P', 'G then C', 'G then F'])}
            ${this.renderShortcutsSection('Hành động', ['N then L', 'N then C', 'Ctrl+S', 'Ctrl+E', '/'])}
            ${this.renderShortcutsSection('Khác', ['Ctrl+?', 'Ctrl+Shift+D', 'Ctrl+Shift+N', 'Escape'])}
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.helpModal = modal;

    // Bind close handlers
    modal.querySelector('.modal-close').addEventListener('click', () => {
      modal.close();
    });

    modal.querySelector('.modal-backdrop').addEventListener('click', () => {
      modal.close();
    });

    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        modal.close();
      }
    });
  }

  /**
   * Render shortcuts section
   */
  renderShortcutsSection(title, combos) {
    return `
      <div class="shortcuts-section">
        <h3>${title}</h3>
        <div class="shortcuts-list">
          ${combos.map(combo => {
            const shortcut = this.shortcuts.get(combo);
            return `
              <div class="shortcut-item">
                <kbd class="shortcut-keys">${this.formatCombo(combo)}</kbd>
                <span class="shortcut-desc">${shortcut?.description || ''}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Format combo for display
   */
  formatCombo(combo) {
    return combo.replace(/\+/g, ' + ').replace(' then ', ' rồi ');
  }

  /**
   * Toggle help modal
   */
  toggleHelp() {
    if (this.helpModal) {
      if (this.helpModal.open) {
        this.helpModal.close();
      } else {
        this.helpModal.showModal();
      }
    }
  }

  /**
   * Show help modal
   */
  showHelp() {
    if (this.helpModal) {
      this.helpModal.showModal();
    }
  }

  /**
   * Show toast notification
   */
  showToast(message, type = 'info') {
    if (window.toastManager) {
      window.toastManager.show(message, type);
    } else if (window.errorBoundary) {
      // Fallback to error boundary toast
      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      toast.textContent = message;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    }
  }

  /**
   * List all shortcuts
   */
  listShortcuts() {
    const shortcuts = Array.from(this.shortcuts.entries()).map(([combo, { description }]) => ({
      'Phím': combo,
      'Chức năng': description
    }));
    // Debug logging removed for production
    return shortcuts;
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.keyboardShortcuts = new KeyboardShortcuts();
  });
} else {
  window.keyboardShortcuts = new KeyboardShortcuts();
}

// Export for module usage
export { KeyboardShortcuts };

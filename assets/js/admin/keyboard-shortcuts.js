/**
 * Keyboard Shortcuts Component
 * Navigation and action shortcuts with help modal
 * @version 1.0.0 | 2026-03-13
 */

/**
 * Keyboard Shortcuts Class
 */
export class KeyboardShortcutsComponent {
  constructor(options = {}) {
    this.shortcuts = new Map();
    this.hintElement = null;
    this.helpModalElement = null;
    this.autoHideDelay = options.autoHideDelay || 5000;
  }

  /**
   * Initialize keyboard shortcuts
   */
  init() {
    this.registerDefaults();
    this.bindEvents();
    this.showHint();
  }

  /**
   * Register default shortcuts
   */
  registerDefaults() {
    // Navigation
    this.register('g d', 'Go to Dashboard', () => this.navigate('/admin/dashboard.html'));
    this.register('g l', 'Go to Leads', () => this.navigate('/admin/leads.html'));
    this.register('g p', 'Go to Pipeline', () => this.navigate('/admin/pipeline.html'));
    this.register('g c', 'Go to Campaigns', () => this.navigate('/admin/campaigns.html'));
    this.register('g f', 'Go to Finance', () => this.navigate('/admin/finance.html'));

    // Actions
    this.register('n', 'New Item (context-aware)', () => this.newItem());
    this.register('/', 'Focus Search', () => this.focusSearch());
    this.register('?', 'Show Shortcuts Help', () => this.showHelp());
    this.register('Escape', 'Close Modal/Panel', () => this.closeModal());
    this.register('r', 'Refresh Data', () => this.refresh());

    // Dark Mode
    this.register('d m', 'Toggle Dark Mode', () => this.toggleDarkMode());
  }

  /**
   * Register a keyboard shortcut
   * @param {string} keys - Key combination (e.g., 'g d', 'n', '/')
   * @param {string} description - Description for help modal
   * @param {Function} handler - Handler function
   */
  register(keys, description, handler) {
    this.shortcuts.set(keys.toLowerCase(), { description, handler });
  }

  /**
   * Unregister a shortcut
   * @param {string} keys - Key combination
   */
  unregister(keys) {
    this.shortcuts.delete(keys.toLowerCase());
  }

  /**
   * Bind keyboard event handlers
   */
  bindEvents() {
    let keySequence = [];
    let lastKeyPressTime = 0;

    document.addEventListener('keydown', (e) => {
      // Ignore shortcuts in input fields
      if (e.target.matches('input, textarea, [contenteditable="true"]')) {
        return;
      }

      const now = Date.now();
      if (now - lastKeyPressTime > 2000) {
        keySequence = [];
      }
      lastKeyPressTime = now;

      const key = e.key.toLowerCase();

      // Handle single key shortcuts
      if (['n', '/', '?', 'r', 'escape'].includes(key)) {
        const shortcut = this.shortcuts.get(key);
        if (shortcut) {
          e.preventDefault();
          shortcut.handler();
          return;
        }
      }

      // Handle key sequences (e.g., 'g d')
      keySequence.push(key);
      const sequence = keySequence.join(' ');

      // Check for full sequence match
      const shortcut = this.shortcuts.get(sequence);
      if (shortcut) {
        e.preventDefault();
        shortcut.handler();
        keySequence = [];
      }

      // Reset sequence after 2 seconds
      setTimeout(() => {
        keySequence = [];
      }, 2000);
    });
  }

  /**
   * Show keyboard hint toast
   */
  showHint() {
    const hint = document.createElement('div');
    hint.className = 'keyboard-hint';
    hint.innerHTML = `
      <span>Press <kbd>?</kbd> for keyboard shortcuts</span>
    `;
    document.body.appendChild(hint);
    this.hintElement = hint;

    // Auto-hide after delay
    setTimeout(() => {
      hint.classList.add('hide');
      setTimeout(() => hint.remove(), 300);
    }, this.autoHideDelay);
  }

  /**
   * Show keyboard shortcuts help modal
   */
  showHelp() {
    if (this.helpModalElement) {
      this.helpModalElement.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'keyboard-help-modal';
    modal.className = 'keyboard-help-modal';
    modal.innerHTML = `
      <div class="keyboard-help-overlay"></div>
      <div class="keyboard-help-content">
        <div class="keyboard-help-header">
          <h2>Keyboard Shortcuts</h2>
          <button class="keyboard-help-close">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="keyboard-help-body">
          <div class="shortcut-category">
            <h3>Navigation</h3>
            <div class="shortcut-list">
              ${this.renderShortcuts(['g d', 'g l', 'g p', 'g c', 'g f'])}
            </div>
          </div>
          <div class="shortcut-category">
            <h3>Actions</h3>
            <div class="shortcut-list">
              ${this.renderShortcuts(['n', '/', 'r', 'd m'])}
            </div>
          </div>
          <div class="shortcut-category">
            <h3>General</h3>
            <div class="shortcut-list">
              ${this.renderShortcuts(['?', 'Escape'])}
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.helpModalElement = modal;

    // Bind close events
    modal.querySelector('.keyboard-help-close').addEventListener('click', () => this.closeModal());
    modal.querySelector('.keyboard-help-overlay').addEventListener('click', () => this.closeModal());
    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
      }
    });
  }

  /**
   * Render shortcut list items
   * @param {string[]} keys - Array of shortcut keys
   * @returns {string} HTML string
   */
  renderShortcuts(keys) {
    return keys
      .map((key) => {
        const shortcut = this.shortcuts.get(key);
        if (!shortcut) return '';
        return `
          <div class="shortcut-item">
            <kbd>${this.formatKey(key)}</kbd>
            <span>${shortcut.description}</span>
          </div>
        `;
      })
      .join('');
  }

  /**
   * Format key for display
   * @param {string} key - Key string
   * @returns {string} Formatted key
   */
  formatKey(key) {
    const keyMap = {
      'g d': 'G → D',
      'g l': 'G → L',
      'g p': 'G → P',
      'g c': 'G → C',
      'g f': 'G → F',
      'd m': 'D → M',
      '/': '/',
      '?': '?',
      n: 'N',
      r: 'R',
      escape: 'Esc'
    };
    return keyMap[key] || key.toUpperCase();
  }

  /**
   * Close modal/panel
   */
  closeModal() {
    // Close help modal
    if (this.helpModalElement) {
      this.helpModalElement.remove();
      this.helpModalElement = null;
    }

    // Close notification panel if open
    const notificationPanel = document.getElementById('notification-panel');
    if (notificationPanel && notificationPanel.classList.contains('open')) {
      notificationPanel.classList.remove('open');
      document.body.style.overflow = '';
    }

    // Close any other modals
    const openModals = document.querySelectorAll('[role="dialog"].open, .modal.open');
    openModals.forEach((modal) => {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  /**
   * Navigate to URL
   * @param {string} url - Target URL
   */
  navigate(url) {
    window.location.href = url;
  }

  /**
   * Focus search input
   */
  focusSearch() {
    const searchInput = document.querySelector('input[type="search"], input#search');
    if (searchInput) {
      searchInput.focus();
    }
  }

  /**
   * New item action (context-aware)
   */
  newItem() {
    // Context-aware: check current page
    const path = window.location.pathname;
    if (path.includes('leads')) {
      window.location.href = '/admin/leads.html?action=new';
    } else if (path.includes('campaigns')) {
      window.location.href = '/admin/campaigns.html?action=new';
    } else if (path.includes('pipeline')) {
      window.location.href = '/admin/pipeline.html?action=new';
    } else if (path.includes('finance')) {
      window.location.href = '/admin/finance.html?action=new-invoice';
    } else {
      // Default: new lead
      window.location.href = '/admin/leads.html?action=new';
    }
  }

  /**
   * Refresh data
   */
  refresh() {
    window.location.reload();
  }

  /**
   * Toggle dark mode
   */
  toggleDarkMode() {
    const event = new CustomEvent('dark-mode-toggle');
    document.dispatchEvent(event);
  }
}

// ============================================================================
// CSS STYLES
// ============================================================================

/**
 * Inject keyboard shortcuts styles
 */
export function injectKeyboardShortcutsStyles() {
  if (document.getElementById('keyboard-shortcuts-styles')) return;

  const styles = document.createElement('style');
  styles.id = 'keyboard-shortcuts-styles';
  styles.textContent = `
    /* Keyboard Hint Toast */
    .keyboard-hint {
      position: fixed;
      bottom: 24px;
      right: 24px;
      padding: 12px 20px;
      background: var(--md-sys-color-inverse-surface, #333);
      color: var(--md-sys-color-inverse-on-surface, #fff);
      border-radius: 8px;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9998;
      opacity: 1;
      transition: opacity 0.3s ease;
    }

    .keyboard-hint.hide {
      opacity: 0;
    }

    .keyboard-hint kbd {
      background: var(--md-sys-color-surface-container-high, #444);
      padding: 2px 8px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 12px;
    }

    /* Keyboard Help Modal */
    .keyboard-help-modal {
      position: fixed;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }

    .keyboard-help-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.5);
    }

    .keyboard-help-content {
      position: relative;
      background: var(--md-sys-color-surface, #fff);
      border-radius: 16px;
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    }

    .keyboard-help-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid var(--md-sys-color-outline-variant, #e0e0e0);
    }

    .keyboard-help-header h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: var(--md-sys-color-on-surface, #333);
    }

    .keyboard-help-close {
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

    .keyboard-help-close:hover {
      background: var(--md-sys-color-surface-container-high, #e0e0e0);
    }

    .keyboard-help-body {
      padding: 24px;
    }

    .shortcut-category {
      margin-bottom: 24px;
    }

    .shortcut-category:last-child {
      margin-bottom: 0;
    }

    .shortcut-category h3 {
      margin: 0 0 12px;
      font-size: 14px;
      font-weight: 600;
      color: var(--md-sys-color-primary, #006a60);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .shortcut-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .shortcut-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 12px;
      background: var(--md-sys-color-surface-container-low, #fafafa);
      border-radius: 8px;
    }

    .shortcut-item kbd {
      background: var(--md-sys-color-surface-container, #f0f0f0);
      padding: 4px 10px;
      border-radius: 6px;
      font-family: monospace;
      font-size: 13px;
      font-weight: 600;
      color: var(--md-sys-color-on-surface, #333);
      min-width: 60px;
      text-align: center;
    }

    .shortcut-item span {
      font-size: 14px;
      color: var(--md-sys-color-on-surface-variant, #666);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .keyboard-hint {
        bottom: 16px;
        right: 16px;
        font-size: 13px;
      }

      .keyboard-help-content {
        width: 95%;
      }
    }
  `;
  document.head.appendChild(styles);
}

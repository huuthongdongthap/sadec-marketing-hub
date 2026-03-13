/**
 * Admin UX Enhancements - Dark Mode, Keyboard Shortcuts, Loading States
 * @version 1.0.0 | 2026-03-13
 */

(function() {
  'use strict';

  // ============================================================================
  // DARK MODE TOGGLE
  // ============================================================================

  const DarkMode = {
    STORAGE_KEY: 'sadec-admin-dark-mode',

    init() {
      this.loadPreference();
      this.createToggle();
      this.bindEvents();
    },

    loadPreference() {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = saved ? saved === 'true' : prefersDark;
      this.set(isDark);
    },

    set(isDark) {
      document.documentElement.classList.toggle('dark-mode', isDark);
      localStorage.setItem(this.STORAGE_KEY, isDark);
      this.updateToggleState(isDark);
    },

    toggle() {
      const isDark = !document.documentElement.classList.contains('dark-mode');
      this.set(isDark);
      console.log('Dark mode:', isDark ? 'ON' : 'OFF');
    },

    createToggle() {
      const toggle = document.createElement('button');
      toggle.id = 'dark-mode-toggle';
      toggle.className = 'dark-mode-toggle';
      toggle.setAttribute('aria-label', 'Toggle dark mode');
      toggle.innerHTML = `
        <span class="material-symbols-outlined icon-light">light_mode</span>
        <span class="material-symbols-outlined icon-dark">dark_mode</span>
      `;

      // Add to header if exists
      const header = document.querySelector('.page-header, .top-bar, .header-section');
      if (header) {
        header.appendChild(toggle);
      }
    },

    updateToggleState(isDark) {
      const toggle = document.getElementById('dark-mode-toggle');
      if (toggle) {
        toggle.classList.toggle('active', isDark);
      }
    },

    bindEvents() {
      document.addEventListener('click', (e) => {
        if (e.target.closest('#dark-mode-toggle')) {
          this.toggle();
        }
      });
    }
  };

  // ============================================================================
  // KEYBOARD SHORTCUTS
  // ============================================================================

  const KeyboardShortcuts = {
    shortcuts: new Map(),

    init() {
      this.registerDefaults();
      this.bindEvents();
      this.showHint();
    },

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

      // UI
      this.register('d m', 'Toggle Dark Mode', () => DarkMode.toggle());
      this.register('r', 'Refresh Data', () => this.refresh());
    },

    register(key, description, handler) {
      this.shortcuts.set(key, { description, handler });
    },

    bindEvents() {
      let buffer = '';
      let bufferTimer = null;

      document.addEventListener('keydown', (e) => {
        // Ignore if typing in input/textarea
        if (e.target.matches('input, textarea, [contenteditable="true"]')) {
          return;
        }

        // Handle special keys
        if (e.key === 'Escape') {
          this.shortcuts.get('Escape')?.handler();
          return;
        }

        // Buffer for multi-key shortcuts
        buffer += e.key.toLowerCase();

        clearTimeout(bufferTimer);
        bufferTimer = setTimeout(() => { buffer = ''; }, 1000);

        // Check shortcuts
        for (const [key, shortcut] of this.shortcuts) {
          if (buffer === key || buffer.endsWith(' ' + key)) {
            e.preventDefault();
            shortcut.handler();
            buffer = '';
            break;
          }
        }
      });
    },

    navigate(path) {
      window.location.href = path;
    },

    newItem() {
      // Context-aware: find current page and create new item
      const currentPath = window.location.pathname;
      if (currentPath.includes('leads')) {
        this.navigate('/admin/leads.html?action=new');
      } else if (currentPath.includes('campaigns')) {
        this.navigate('/admin/campaigns.html?action=new');
      } else if (currentPath.includes('pipeline')) {
        this.navigate('/admin/pipeline.html?action=new');
      } else {
        this.showToast('Tạo mới: Chưa xác định ngữ cảnh', 'info');
      }
    },

    focusSearch() {
      const search = document.querySelector('input[type="search"], .search-input');
      if (search) {
        search.focus();
      }
    },

    closeModal() {
      const modal = document.querySelector('.modal-overlay.active, dialog[open]');
      if (modal) {
        modal.classList?.remove('active');
        modal.close?.();
      }
    },

    refresh() {
      window.location.reload();
    },

    showHelp() {
      const help = document.createElement('div');
      help.id = 'keyboard-help-modal';
      help.className = 'keyboard-help-modal';
      help.innerHTML = `
        <div class="keyboard-help-overlay" onclick="this.parentElement.remove()"></div>
        <div class="keyboard-help-content">
          <div class="keyboard-help-header">
            <h3>⌨️ Phím Tắt Admin</h3>
            <button class="keyboard-help-close" onclick="this.parentElement.parentElement.parentElement.remove()">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <div class="keyboard-help-body">
            <div class="shortcut-group">
              <h4>📍 Navigation</h4>
              <div class="shortcut-item"><kbd>g</kbd> <kbd>d</kbd> Dashboard</div>
              <div class="shortcut-item"><kbd>g</kbd> <kbd>l</kbd> Leads</div>
              <div class="shortcut-item"><kbd>g</kbd> <kbd>p</kbd> Pipeline</div>
              <div class="shortcut-item"><kbd>g</kbd> <kbd>c</kbd> Campaigns</div>
              <div class="shortcut-item"><kbd>g</kbd> <kbd>f</kbd> Finance</div>
            </div>
            <div class="shortcut-group">
              <h4>⚡ Actions</h4>
              <div class="shortcut-item"><kbd>n</kbd> Tạo mới</div>
              <div class="shortcut-item"><kbd>/</kbd> Tìm kiếm</div>
              <div class="shortcut-item"><kbd>r</kbd> Refresh</div>
              <div class="shortcut-item"><kbd>d</kbd> <kbd>m</kbd> Dark Mode</div>
            </div>
            <div class="shortcut-group">
              <h4>🎨 UI</h4>
              <div class="shortcut-item"><kbd>esc</kbd> Đóng modal</div>
              <div class="shortcut-item"><kbd>?</kbd> Trợ giúp</div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(help);
      setTimeout(() => help.classList.add('active'), 10);
    },

    showHint() {
      const hint = document.createElement('div');
      hint.className = 'keyboard-hint';
      hint.innerHTML = `
        <span class="material-symbols-outlined">keyboard</span>
        <span>Nhấn <kbd>?</kbd> để xem phím tắt</span>
        <button onclick="this.parentElement.remove()">
          <span class="material-symbols-outlined">close</span>
        </button>
      `;
      document.body.appendChild(hint);
      setTimeout(() => {
        hint.classList.add('show');
        setTimeout(() => {
          hint.classList.remove('show');
          setTimeout(() => hint.remove(), 300);
        }, 5000);
      }, 1000);
    },

    showToast(message, type = 'info') {
      const existing = document.querySelector('.keyboard-toast');
      if (existing) existing.remove();

      const toast = document.createElement('div');
      toast.className = `keyboard-toast toast-${type}`;
      toast.textContent = message;
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => {
          toast.classList.remove('show');
          setTimeout(() => toast.remove(), 300);
        }, 3000);
      }, 10);
    }
  };

  // ============================================================================
  // SKELETON LOADING STATES
  // ============================================================================

  const SkeletonLoader = {
    init() {
      this.observe();
    },

    observe() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.load(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { rootMargin: '50px' });

      document.querySelectorAll('[data-skeleton="true"]').forEach(el => {
        observer.observe(el);
      });
    },

    load(element) {
      element.classList.add('skeleton-loading');
      // Add skeleton effect via CSS
    },

    show(container, count = 3) {
      const skeleton = document.createElement('div');
      skeleton.className = 'skeleton-container';
      skeleton.innerHTML = Array(count).fill(`
        <div class="skeleton-card">
          <div class="skeleton-avatar"></div>
          <div class="skeleton-title"></div>
          <div class="skeleton-text"></div>
          <div class="skeleton-text"></div>
        </div>
      `).join('');

      container.innerHTML = '';
      container.appendChild(skeleton);
    },

    hide(container, content) {
      container.innerHTML = '';
      container.appendChild(content);
    }
  };

  // ============================================================================
  // CSS INJECTION FOR NEW COMPONENTS
  // ============================================================================

  function injectStyles() {
    const styles = document.createElement('style');
    styles.id = 'admin-ux-enhancements-styles';
    styles.textContent = `
      /* Dark Mode Toggle */
      .dark-mode-toggle {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 1px solid var(--md-sys-color-outline-variant, #e0e0e0);
        background: var(--md-sys-color-surface, #fff);
        cursor: pointer;
        transition: all 0.2s ease;
        margin-left: auto;
      }

      .dark-mode-toggle .icon-dark { display: none; }
      .dark-mode-toggle .icon-light { display: block; }
      .dark-mode-toggle.active .icon-dark { display: block; }
      .dark-mode-toggle.active .icon-light { display: none; }

      .dark-mode-toggle:hover {
        background: var(--md-sys-color-surface-container, #f5f5f5);
        transform: scale(1.05);
      }

      /* Dark Mode Styles */
      html.dark-mode {
        --md-sys-color-surface: #1a1a1a;
        --md-sys-color-surface-container: #2a2a2a;
        --md-sys-color-on-surface: #e0e0e0;
        --md-sys-color-on-surface-variant: #a0a0a0;
        --md-sys-color-outline-variant: #404040;
        --md-sys-color-background: #121212;
      }

      html.dark-mode .card,
      html.dark-mode .card-elevated {
        background: var(--md-sys-color-surface, #1a1a1a);
        color: var(--md-sys-color-on-surface, #e0e0e0);
      }

      /* Keyboard Hint */
      .keyboard-hint {
        position: fixed;
        bottom: 24px;
        right: 24px;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        background: var(--md-sys-color-primary, #006a60);
        color: var(--md-sys-color-on-primary, #fff);
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-size: 14px;
        font-weight: 500;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s ease;
        z-index: 1000;
      }

      .keyboard-hint kbd {
        background: rgba(255,255,255,0.2);
        padding: 2px 6px;
        border-radius: 4px;
        font-family: monospace;
        font-size: 12px;
      }

      .keyboard-hint button {
        background: transparent;
        border: none;
        color: inherit;
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .keyboard-hint.show {
        opacity: 1;
        transform: translateY(0);
      }

      /* Keyboard Help Modal */
      .keyboard-help-modal {
        position: fixed;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.2s ease;
      }

      .keyboard-help-modal.active {
        opacity: 1;
      }

      .keyboard-help-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0,0,0,0.6);
        backdrop-filter: blur(4px);
      }

      .keyboard-help-content {
        position: relative;
        width: 90%;
        max-width: 500px;
        max-height: 80vh;
        background: var(--md-sys-color-surface, #fff);
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        overflow: hidden;
        z-index: 1;
      }

      .keyboard-help-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        border-bottom: 1px solid var(--md-sys-color-outline-variant, #e0e0e0);
      }

      .keyboard-help-header h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }

      .keyboard-help-close {
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 4px;
        display: flex;
        color: var(--md-sys-color-on-surface-variant, #666);
      }

      .keyboard-help-body {
        padding: 24px;
        overflow-y: auto;
        max-height: calc(80vh - 80px);
      }

      .shortcut-group {
        margin-bottom: 24px;
      }

      .shortcut-group:last-child {
        margin-bottom: 0;
      }

      .shortcut-group h4 {
        margin: 0 0 12px;
        font-size: 14px;
        font-weight: 600;
        color: var(--md-sys-color-primary, #006a60);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .shortcut-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 0;
        font-size: 14px;
        color: var(--md-sys-color-on-surface, #333);
      }

      .shortcut-item kbd {
        background: var(--md-sys-color-surface-container, #f0f0f0);
        border: 1px solid var(--md-sys-color-outline-variant, #ddd);
        border-radius: 6px;
        padding: 4px 8px;
        font-family: monospace;
        font-size: 12px;
        min-width: 24px;
        text-align: center;
      }

      /* Keyboard Toast */
      .keyboard-toast {
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        background: var(--md-sys-color-inverse-surface, #333);
        color: var(--md-sys-color-inverse-on-surface, #fff);
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        opacity: 0;
        transition: all 0.3s ease;
        z-index: 9999;
      }

      .keyboard-toast.show {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
      }

      /* Skeleton Loading */
      .skeleton-container {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 16px;
      }

      .skeleton-card {
        background: var(--md-sys-color-surface, #fff);
        border-radius: 12px;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .skeleton-avatar,
      .skeleton-title,
      .skeleton-text {
        background: linear-gradient(
          90deg,
          var(--md-sys-color-surface-container, #f0f0f0) 25%,
          var(--md-sys-color-outline-variant, #e0e0e0) 50%,
          var(--md-sys-color-surface-container, #f0f0f0) 75%
        );
        background-size: 200% 100%;
        animation: skeleton-loading 1.5s ease-in-out infinite;
        border-radius: 8px;
      }

      .skeleton-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
      }

      .skeleton-title {
        height: 20px;
        width: 60%;
      }

      .skeleton-text {
        height: 14px;
        width: 100%;
      }

      .skeleton-text:last-child {
        width: 80%;
      }

      @keyframes skeleton-loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
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
          max-height: 90vh;
        }
      }
    `;
    document.head.appendChild(styles);
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  function init() {
    console.log('[UX Enhancements] Initializing...');
    injectStyles();
    DarkMode.init();
    KeyboardShortcuts.init();
    SkeletonLoader.init();
    console.log('[UX Enhancements] Ready!');
  }

  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

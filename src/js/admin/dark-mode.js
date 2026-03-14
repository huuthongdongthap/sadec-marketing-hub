/**
 * Dark Mode Component
 * System preference detection with localStorage persistence
 * @version 1.0.0 | 2026-03-13
 */

/**
 * Dark Mode Class
 */
export class DarkModeComponent {
  constructor(options = {}) {
    this.storageKey = options.storageKey || 'sadec-admin-dark-mode';
    this.toggleElement = null;
  }

  /**
   * Initialize dark mode
   */
  init() {
    this.loadPreference();
    this.createToggle();
    this.bindEvents();
  }

  /**
   * Load saved preference or detect system preference
   */
  loadPreference() {
    const saved = localStorage.getItem(this.storageKey);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = saved ? saved === 'true' : prefersDark;
    this.set(isDark);
  }

  /**
   * Set dark mode state
   * @param {boolean} isDark - Dark mode state
   */
  set(isDark) {
    document.documentElement.classList.toggle('dark-mode', isDark);
    localStorage.setItem(this.storageKey, String(isDark));
    this.updateToggleState(isDark);
  }

  /**
   * Toggle dark mode
   */
  toggle() {
    const isDark = !document.documentElement.classList.contains('dark-mode');
    this.set(isDark);
  }

  /**
   * Create toggle button
   */
  createToggle() {
    const toggle = document.createElement('button');
    toggle.id = 'dark-mode-toggle';
    toggle.className = 'dark-mode-toggle';
    toggle.setAttribute('aria-label', 'Toggle dark mode');
    toggle.innerHTML = `
      <span class="material-symbols-outlined icon-light">light_mode</span>
      <span class="material-symbols-outlined icon-dark">dark_mode</span>
    `;

    // Add to header
    const header = document.querySelector('.page-header, .top-bar, .header-section');
    if (header) {
      header.appendChild(toggle);
    }

    this.toggleElement = toggle;
  }

  /**
   * Update toggle button state
   * @param {boolean} isDark - Dark mode state
   */
  updateToggleState(isDark) {
    const toggle = document.getElementById('dark-mode-toggle');
    if (toggle) {
      toggle.classList.toggle('active', isDark);
    }
  }

  /**
   * Bind event handlers
   */
  bindEvents() {
    document.addEventListener('click', (e) => {
      if (e.target.closest('#dark-mode-toggle')) {
        this.toggle();
      }
    });
  }

  /**
   * Check if dark mode is active
   * @returns {boolean}
   */
  isDark() {
    return document.documentElement.classList.contains('dark-mode');
  }
}

// ============================================================================
// CSS STYLES
// ============================================================================

/**
 * Inject dark mode styles
 */
export function injectDarkModeStyles() {
  if (document.getElementById('dark-mode-styles')) return;

  const styles = document.createElement('style');
  styles.id = 'dark-mode-styles';
  styles.textContent = `
    /* Dark Mode Toggle Button */
    .dark-mode-toggle {
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
      margin-left: 8px;
    }

    .dark-mode-toggle:hover {
      background: var(--md-sys-color-surface-container, #f5f5f5);
      transform: scale(1.05);
    }

    .dark-mode-toggle .icon-dark {
      display: none;
    }

    .dark-mode-toggle.active .icon-light {
      display: none;
    }

    .dark-mode-toggle.active .icon-dark {
      display: block;
    }

    /* Dark Mode Styles */
    html.dark-mode {
      --md-sys-color-surface: #1a1a1a;
      --md-sys-color-surface-container: #2a2a2a;
      --md-sys-color-surface-container-low: #252525;
      --md-sys-color-surface-container-high: #3a3a3a;
      --md-sys-color-on-surface: #e0e0e0;
      --md-sys-color-on-surface-variant: #b0b0b0;
      --md-sys-color-outline-variant: #444;
      --md-sys-color-background: #121212;
      --md-sys-color-on-background: #e0e0e0;
    }

    html.dark-mode .card,
    html.dark-mode .panel,
    html.dark-mode .modal {
      background: var(--md-sys-color-surface, #1a1a1a);
    }

    html.dark-mode body {
      background: var(--md-sys-color-background, #121212);
      color: var(--md-sys-color-on-surface, #e0e0e0);
    }

    html.dark-mode .data-table,
    html.dark-mode .list-item,
    html.dark-mode .nav-item {
      background: var(--md-sys-color-surface-container-low, #252525);
    }

    /* Smooth transitions */
    * {
      transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
    }
  `;
  document.head.appendChild(styles);
}

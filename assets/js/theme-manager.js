/**
 * ═══════════════════════════════════════════════════════════════════════════
 * THEME MANAGER - Sa Đéc Marketing Hub
 * ═══════════════════════════════════════════════════════════════════════════
 * Dark mode toggle với persistence và system preference detection
 *
 * Usage:
 *   ThemeManager.init();
 *   ThemeManager.setTheme('dark');
 *   ThemeManager.toggle();
 *
 * Events:
 *   document.addEventListener('themechange', (e) => Logger.debug('Theme:', e.detail.theme));
 */

import { Logger } from './shared/logger.js';

class ThemeManagerClass {
  constructor() {
    this.THEME_KEY = 'sadec-theme';
    this.themes = {
      LIGHT: 'light',
      DARK: 'dark',
      SYSTEM: 'system'
    };
    this.currentTheme = null;
    this.mediaQuery = null;
    this.initialized = false;
  }

  /**
   * Initialize theme manager
   */
  init() {
    if (this.initialized) return;

    // Create theme toggle button if not exists
    this.createThemeToggle();

    // Load saved theme or detect system preference
    this.loadTheme();

    // Listen for system theme changes
    this.listenForSystemChanges();

    // Setup keyboard shortcut (Ctrl+T)
    this.setupKeyboardShortcut();

    this.initialized = true;
  }

  /**
   * Create theme toggle button
   */
  createThemeToggle() {
    if (document.getElementById('theme-toggle-widget')) return;

    const toggleContainer = document.createElement('div');
    toggleContainer.id = 'theme-toggle-widget';
    toggleContainer.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9998;
    `;

    toggleContainer.innerHTML = `
      <button
        id="theme-toggle-fab"
        class="theme-toggle-fab"
        type="button"
        aria-label="Chuyển chế độ sáng/tối"
        title="Chuyển chế độ sáng/tối (Ctrl+T)"
        style="
          width: 56px;
          height: 56px;
          border-radius: 50%;
          border: none;
          background: var(--md-sys-color-primary, #1976d2);
          color: #fff;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          font-size: 24px;
        "
      >
        <span class="material-symbols-outlined" id="theme-toggle-icon">dark_mode</span>
      </button>
    `;

    document.body.appendChild(toggleContainer);

    // Add click handler
    const toggleBtn = toggleContainer.querySelector('#theme-toggle-fab');
    toggleBtn.addEventListener('click', () => this.toggle());

    // Add hover effect
    toggleBtn.addEventListener('mouseenter', () => {
      toggleBtn.style.transform = 'scale(1.1)';
    });
    toggleBtn.addEventListener('mouseleave', () => {
      toggleBtn.style.transform = 'scale(1)';
    });
  }

  /**
   * Load saved theme or detect system preference
   */
  loadTheme() {
    const savedTheme = localStorage.getItem(this.THEME_KEY);

    if (savedTheme && Object.values(this.themes).includes(savedTheme)) {
      this.currentTheme = savedTheme;
    } else if (savedTheme === this.themes.SYSTEM || !savedTheme) {
      this.currentTheme = this.themes.SYSTEM;
    }

    this.applyTheme(this.currentTheme);
  }

  /**
   * Apply theme to document
   */
  applyTheme(theme) {
    const root = document.documentElement;
    let effectiveTheme = theme;

    // If system theme, detect from media query
    if (theme === this.themes.SYSTEM) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      effectiveTheme = prefersDark ? this.themes.DARK : this.themes.LIGHT;
    }

    // Set data attribute
    root.setAttribute('data-theme', effectiveTheme);

    // Update toggle icon
    this.updateToggleIcon(effectiveTheme);

    // Dispatch event
    document.dispatchEvent(new CustomEvent('themechange', {
      detail: { theme: effectiveTheme }
    }));
  }

  /**
   * Update toggle icon based on theme
   */
  updateToggleIcon(theme) {
    const icon = document.getElementById('theme-toggle-icon');
    if (icon) {
      icon.textContent = theme === this.themes.DARK ? 'light_mode' : 'dark_mode';
    }
  }

  /**
   * Set theme explicitly
   */
  setTheme(theme) {
    if (!Object.values(this.themes).includes(theme)) {
      Logger.warn('Invalid theme:', theme);
      return;
    }

    this.currentTheme = theme;
    localStorage.setItem(this.THEME_KEY, theme);
    this.applyTheme(theme);
  }

  /**
   * Toggle between light and dark
   */
  toggle() {
    const newTheme = this.currentTheme === this.themes.DARK
      ? this.themes.LIGHT
      : this.themes.DARK;

    this.setTheme(newTheme);
  }

  /**
   * Listen for system theme changes
   */
  listenForSystemChanges() {
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handler = (e) => {
      if (this.currentTheme === this.themes.SYSTEM) {
        this.applyTheme(this.themes.SYSTEM);
      }
    };

    // Modern browsers
    if (this.mediaQuery.addEventListener) {
      this.mediaQuery.addEventListener('change', handler);
    } else if (this.mediaQuery.addListener) {
      // Legacy support
      this.mediaQuery.addListener(handler);
    }
  }

  /**
   * Setup keyboard shortcut (Ctrl+T)
   */
  setupKeyboardShortcut() {
    document.addEventListener('keydown', (e) => {
      // Ctrl+T or Cmd+T to toggle theme
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        // Don't toggle if typing in input/textarea
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
          return;
        }
        e.preventDefault();
        this.toggle();
      }
    });
  }

  /**
   * Get current theme
   */
  getTheme() {
    return this.currentTheme;
  }

  /**
   * Check if dark mode is active
   */
  isDark() {
    const root = document.documentElement;
    return root.getAttribute('data-theme') === this.themes.DARK;
  }

  /**
   * Check if light mode is active
   */
  isLight() {
    const root = document.documentElement;
    return root.getAttribute('data-theme') === this.themes.LIGHT;
  }

  /**
   * Get available themes
   */
  getAvailableThemes() {
    return Object.values(this.themes);
  }
}

// Create singleton instance
const ThemeManager = new ThemeManagerClass();

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ThemeManager.init());
} else {
  ThemeManager.init();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThemeManager;
}

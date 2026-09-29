/**
 * Theme Manager - Dark Mode & Theme Switcher
 * Hệ thống quản lý chủ đề cho sadec-marketing-hub
 *
 * Usage:
 *   Theme.set('dark');
 *   Theme.toggle();
 *   Theme.get(); // 'light', 'dark', 'system'
 */

class ThemeManager {
  constructor() {
    this.themes = {
      light: {
        name: 'Sáng',
        icon: 'light_mode',
        colors: {
          primary: '#006A60',
          secondary: '#00a896',
          background: '#FAFBFF',
          surface: '#FFFFFF',
          error: '#BA1A1A'
        }
      },
      dark: {
        name: 'Tối',
        icon: 'dark_mode',
        colors: {
          primary: '#4ADDD0',
          secondary: '#00dbc1',
          background: '#101418',
          surface: '#1E2329',
          error: '#FFB4AB'
        }
      },
      system: {
        name: 'Hệ thống',
        icon: 'settings_brightness',
        colors: null
      }
    };

    this.storageKey = 'sadec-theme-preference';
    this.currentTheme = 'system';
    this.listeners = new Set();

    this.init();
  }

  init() {
    // Load saved theme
    const saved = localStorage.getItem(this.storageKey);
    this.currentTheme = saved || 'system';

    // Apply theme
    this.apply();

    // Listen for system theme changes
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (this.currentTheme === 'system') {
          this.apply();
        }
      });
    }

    // Add styles if not exists
    if (!document.getElementById('theme-styles')) {
      this.addStyles();
    }
  }

  addStyles() {
    const style = document.createElement('style');
    style.id = 'theme-styles';
    style.textContent = `
      /* Theme CSS Variables */
      :root,
      [data-theme="light"] {
        --theme-primary: #006A60;
        --theme-secondary: #00a896;
        --theme-background: #FAFBFF;
        --theme-surface: #FFFFFF;
        --theme-surface-variant: #F3F3F3;
        --theme-on-primary: #FFFFFF;
        --theme-on-surface: #1F1F1F;
        --theme-on-surface-variant: #444444;
        --theme-outline: #757575;
        --theme-error: #BA1A1A;
        --theme-shadow: rgba(0, 0, 0, 0.1);
      }

      [data-theme="dark"] {
        --theme-primary: #4ADDD0;
        --theme-secondary: #00dbc1;
        --theme-background: #101418;
        --theme-surface: #1E2329;
        --theme-surface-variant: #2A2F36;
        --theme-on-primary: #003732;
        --theme-on-surface: #E1E2E6;
        --theme-on-surface-variant: #C4C6C9;
        --theme-outline: #8E9094;
        --theme-error: #FFB4AB;
        --theme-shadow: rgba(0, 0, 0, 0.4);
      }

      /* Smooth theme transitions */
      * {
        transition: background-color 0.3s ease,
                    border-color 0.3s ease,
                    color 0.2s ease;
      }

      /* Theme Switcher Button */
      .theme-switcher {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 56px;
        height: 56px;
        border-radius: 28px;
        background: var(--theme-primary);
        color: var(--theme-on-primary);
        border: none;
        box-shadow: 0 4px 20px var(--theme-shadow);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        transition: transform 0.2s, box-shadow 0.2s;
      }

      .theme-switcher:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 24px var(--theme-shadow);
      }

      .theme-switcher:active {
        transform: scale(0.95);
      }

      .theme-switcher .material-symbols-outlined {
        font-size: 24px;
      }

      /* Theme Picker Modal */
      .theme-picker {
        position: fixed;
        bottom: 90px;
        right: 24px;
        background: var(--theme-surface);
        border-radius: 16px;
        padding: 12px;
        box-shadow: 0 8px 32px var(--theme-shadow);
        display: none;
        flex-direction: column;
        gap: 8px;
        z-index: 999;
        min-width: 180px;
      }

      .theme-picker.active {
        display: flex;
        animation: themePickerFadeIn 0.2s ease-out;
      }

      @keyframes themePickerFadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .theme-option {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        border: none;
        background: transparent;
        border-radius: 12px;
        cursor: pointer;
        transition: background 0.2s;
        color: var(--theme-on-surface);
      }

      .theme-option:hover {
        background: var(--theme-surface-variant);
      }

      .theme-option.active {
        background: var(--theme-primary);
        color: var(--theme-on-primary);
      }

      .theme-option .material-symbols-outlined {
        font-size: 20px;
      }

      .theme-option span {
        font-size: 14px;
        font-weight: 500;
      }

      /* Mobile responsive */
      @media (max-width: 640px) {
        .theme-switcher {
          bottom: 16px;
          right: 16px;
          width: 48px;
          height: 48px;
        }

        .theme-picker {
          bottom: 74px;
          right: 16px;
          left: 16px;
          min-width: auto;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Get current theme
   */
  get() {
    return this.currentTheme;
  }

  /**
   * Set theme
   * @param {string} theme - 'light', 'dark', or 'system'
   */
  set(theme) {
    if (!this.themes[theme]) {
      return;
    }

    this.currentTheme = theme;
    localStorage.setItem(this.storageKey, theme);
    this.apply();
    this.notifyListeners();
  }

  /**
   * Toggle between light and dark
   */
  toggle() {
    const current = this.getEffectiveTheme();
    this.set(current === 'dark' ? 'light' : 'dark');
  }

  /**
   * Get effective theme (resolves 'system' to actual theme)
   */
  getEffectiveTheme() {
    if (this.currentTheme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return this.currentTheme;
  }

  /**
   * Apply theme to document
   */
  apply() {
    const effectiveTheme = this.getEffectiveTheme();

    // Set data attribute on document
    document.documentElement.setAttribute('data-theme', effectiveTheme);

    // Update body class for backwards compatibility
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(`${effectiveTheme}-theme`);

    // Update theme switcher icon if exists
    this.updateSwitcherIcon();
  }

  /**
   * Update theme switcher button icon
   */
  updateSwitcherIcon() {
    const switcher = document.querySelector('.theme-switcher');
    if (!switcher) return;

    const effectiveTheme = this.getEffectiveTheme();
    const icon = this.themes[effectiveTheme]?.icon || 'light_mode';

    switcher.innerHTML = `<span class="material-symbols-outlined">${icon}</span>`;
  }

  /**
   * Create theme switcher button
   */
  createSwitcher() {
    // Remove existing if any
    document.querySelector('.theme-switcher')?.remove();
    document.querySelector('.theme-picker')?.remove();

    // Create switcher button
    const switcher = document.createElement('button');
    switcher.className = 'theme-switcher';
    switcher.setAttribute('aria-label', 'Chuyển chủ đề');
    switcher.addEventListener('click', () => this.togglePicker());

    // Create picker modal
    const picker = document.createElement('div');
    picker.className = 'theme-picker';
    picker.id = 'theme-picker';

    // Add theme options
    Object.entries(this.themes).forEach(([key, theme]) => {
      const option = document.createElement('button');
      option.className = `theme-option ${this.currentTheme === key ? 'active' : ''}`;
      option.innerHTML = `
        <span class="material-symbols-outlined">${theme.icon}</span>
        <span>${theme.name}</span>
      `;
      option.addEventListener('click', () => {
        this.set(key);
        this.togglePicker();
      });
      picker.appendChild(option);
    });

    document.body.appendChild(switcher);
    document.body.appendChild(picker);

    this.updateSwitcherIcon();

    // Close picker when clicking outside
    document.addEventListener('click', (e) => {
      if (!switcher.contains(e.target) && !picker.contains(e.target)) {
        picker.classList.remove('active');
      }
    });
  }

  /**
   * Toggle picker visibility
   */
  togglePicker() {
    const picker = document.getElementById('theme-picker');
    if (picker) {
      picker.classList.toggle('active');
    }
  }

  /**
   * Add theme change listener
   */
  addListener(fn) {
    this.listeners.add(fn);
  }

  /**
   * Remove listener
   */
  removeListener(fn) {
    this.listeners.delete(fn);
  }

  /**
   * Notify all listeners
   */
  notifyListeners() {
    const effectiveTheme = this.getEffectiveTheme();
    this.listeners.forEach(fn => fn(effectiveTheme));
  }

  /**
   * Get available themes
   */
  getThemes() {
    return { ...this.themes };
  }
}

// Singleton instance
const Theme = new ThemeManager();

// Auto-create switcher on DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Theme.createSwitcher());
} else {
  Theme.createSwitcher();
}

// Export
export { Theme, ThemeManager };

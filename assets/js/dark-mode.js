/**
 * Dark Mode Manager - Sa Đéc Marketing Hub
 * Xử lý toggle dark/light mode và persistence
 *
 * Usage: DarkMode.toggle(), DarkMode.enable(), DarkMode.disable()
 */

class DarkModeManager {
  constructor() {
    this.storageKey = 'sadec-dark-mode';
    this.attribute = 'data-theme';
    this.isDark = this.getPreference();
    this.init();
  }

  /**
   * Get user preference from localStorage or system
   */
  getPreference() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored !== null) {
      return stored === 'true';
    }
    // Default to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  /**
   * Initialize dark mode
   */
  init() {
    if (this.isDark) {
      document.documentElement.setAttribute(this.attribute, 'dark');
    } else {
      document.documentElement.removeAttribute(this.attribute);
    }

    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (localStorage.getItem(this.storageKey) === null) {
        this.isDark = e.matches;
        this.updateUI();
      }
    });
  }

  /**
   * Toggle dark mode
   */
  toggle() {
    this.isDark = !this.isDark;
    this.save();
    this.updateUI();
    this.announce();
  }

  /**
   * Enable dark mode
   */
  enable() {
    this.isDark = true;
    this.save();
    this.updateUI();
  }

  /**
   * Disable dark mode (light mode)
   */
  disable() {
    this.isDark = false;
    this.save();
    this.updateUI();
  }

  /**
   * Save preference to localStorage
   */
  save() {
    localStorage.setItem(this.storageKey, this.isDark.toString());
  }

  /**
   * Update UI based on current mode
   */
  updateUI() {
    if (this.isDark) {
      document.documentElement.setAttribute(this.attribute, 'dark');
    } else {
      document.documentElement.removeAttribute(this.attribute);
    }

    // Update toggle button state if exists
    const toggle = document.querySelector('[data-dark-mode-toggle]');
    if (toggle) {
      toggle.setAttribute('aria-pressed', this.isDark.toString());
      const icon = toggle.querySelector('[data-icon]');
      if (icon) {
        icon.textContent = this.isDark ? 'light_mode' : 'dark_mode';
      }
    }
  }

  /**
   * Announce change for screen readers
   */
  announce() {
    const announcement = document.querySelector('[aria-live="polite"]');
    if (announcement) {
      announcement.textContent = this.isDark ? 'Chế độ tối đã bật' : 'Chế độ sáng đã bật';
    }
  }

  /**
   * Check if dark mode is enabled
   */
  isEnabled() {
    return this.isDark;
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.darkMode = new DarkModeManager();
  });
} else {
  window.darkMode = new DarkModeManager();
}

/**
 * Custom Element: Dark Mode Toggle Button
 * Usage: <dark-mode-toggle></dark-mode-toggle>
 */
class DarkModeToggle extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.setupListeners();
  }

  render() {
    const isDark = window.darkMode?.isEnabled() || false;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
        }
        button {
          background: transparent;
          border: 1px solid var(--md-sys-color-outline, #ccc);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--md-sys-color-on-surface, #333);
          transition: all 0.2s ease;
        }
        button:hover {
          background: var(--md-sys-color-surface-container-highest, #eee);
        }
        button:focus-visible {
          outline: 2px solid var(--md-sys-color-primary, #006A60);
          outline-offset: 2px;
        }
        .icon {
          font-family: 'Material Symbols Outlined';
          font-size: 20px;
        }
      </style>
      <button
        type="button"
        aria-label="Chuyển chế độ sáng/tối"
        aria-pressed="${isDark}"
        data-dark-mode-toggle
      >
        <span class="icon" data-icon>${isDark ? 'light_mode' : 'dark_mode'}</span>
      </button>
    `;
  }

  setupListeners() {
    const button = this.shadowRoot.querySelector('button');
    button?.addEventListener('click', () => {
      window.darkMode?.toggle();
      this.render();
    });
  }
}

// Register custom element
if (!customElements.get('dark-mode-toggle')) {
  customElements.define('dark-mode-toggle', DarkModeToggle);
}

export { DarkModeManager };

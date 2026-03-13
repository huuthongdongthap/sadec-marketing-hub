/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SA ĐÉC MARKETING HUB — THEME MANAGER (CONSOLIDATED)
 * Unified theme and dark mode management
 *
 * Features:
 * - Dark/Light/Auto theme modes
 * - System preference detection
 * - localStorage persistence
 * - Web Component toggle button
 * - Theme change events
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// THEME MANAGER (ES Module)
// ============================================================================

/**
 * Theme modes
 */
export const ThemeMode = {
    LIGHT: 'light',
    DARK: 'dark',
    AUTO: 'auto'
};

/**
 * Storage key
 */
const STORAGE_KEY = 'sadec-theme-preference';

/**
 * HTML attribute for theme
 */
const THEME_ATTRIBUTE = 'data-theme';

/**
 * Current theme state
 */
let _currentMode = ThemeMode.AUTO;
let _isDark = false;

/**
 * Change listeners
 */
const _listeners = [];

/**
 * Detect system dark mode preference
 * @returns {boolean}
 */
export function detectSystemPreference() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Get effective theme mode based on user preference and system
 * @returns {string} Current effective mode ('light' or 'dark')
 */
export function getEffectiveMode() {
    if (_currentMode === ThemeMode.AUTO) {
        return detectSystemPreference() ? ThemeMode.DARK : ThemeMode.LIGHT;
    }
    return _currentMode;
}

/**
 * Apply theme to document
 */
export function applyTheme() {
    const effectiveMode = getEffectiveMode();
    _isDark = effectiveMode === ThemeMode.DARK;

    if (_currentMode === ThemeMode.AUTO) {
        document.documentElement.setAttribute(THEME_ATTRIBUTE, 'auto');
    } else {
        document.documentElement.setAttribute(THEME_ATTRIBUTE, _currentMode);
    }

    // Update CSS class for backward compatibility
    document.documentElement.classList.toggle('dark-mode', _isDark);

    // Announce change
    notifyChange(_currentMode, _isDark);
}

/**
 * Set theme mode
 * @param {string} mode - 'light', 'dark', or 'auto'
 */
export function setMode(mode) {
    if (!Object.values(ThemeMode).includes(mode)) {
        console.warn('[ThemeManager] Invalid mode:', mode);
        return;
    }
    _currentMode = mode;
    save();
    applyTheme();
}

/**
 * Toggle dark/light mode
 */
export function toggle() {
    const effectiveMode = getEffectiveMode();
    const newMode = effectiveMode === ThemeMode.DARK ? ThemeMode.LIGHT : ThemeMode.DARK;
    setMode(newMode);
}

/**
 * Enable dark mode
 */
export function enableDark() {
    setMode(ThemeMode.DARK);
}

/**
 * Disable dark mode (enable light)
 */
export function disableDark() {
    setMode(ThemeMode.LIGHT);
}

/**
 * Get current mode
 * @returns {string} Current theme mode
 */
export function getMode() {
    return _currentMode;
}

/**
 * Check if dark mode is active
 * @returns {boolean}
 */
export function isDark() {
    return _isDark;
}

/**
 * Save preference to localStorage
 */
export function save() {
    try {
        localStorage.setItem(STORAGE_KEY, _currentMode);
    } catch (e) {
        console.warn('[ThemeManager] Failed to save:', e.message);
    }
}

/**
 * Load preference from localStorage
 * @returns {string} Saved mode or 'auto'
 */
export function load() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && Object.values(ThemeMode).includes(saved)) {
            return saved;
        }
    } catch (e) {
        console.warn('[ThemeManager] Failed to load:', e.message);
    }
    return ThemeMode.AUTO;
}

/**
 * Add theme change listener
 * @param {Function} callback - Called with { mode, isDark }
 * @returns {Function} Unsubscribe function
 */
export function onChange(callback) {
    _listeners.push(callback);
    return () => {
        const index = _listeners.indexOf(callback);
        if (index > -1) {
            _listeners.splice(index, 1);
        }
    };
}

/**
 * Notify listeners of theme changes
 * @param {string} mode - New theme mode
 * @param {boolean} isDark - Whether dark mode is active
 */
function notifyChange(mode, isDark) {
    _listeners.forEach(callback => {
        try {
            callback({ mode, isDark });
        } catch (e) {
            console.warn('[ThemeManager] Listener error:', e.message);
        }
    });
}

/**
 * Setup system preference listener
 */
export function setupSystemListener() {
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (_currentMode === ThemeMode.AUTO) {
                applyTheme();
            }
        });
    }
}

/**
 * Initialize theme manager
 */
export function init() {
    _currentMode = load();
    setupSystemListener();
    applyTheme();
}

// ============================================================================
// THEME TOGGLE WEB COMPONENT
// ============================================================================

/**
 * Theme Toggle Web Component
 * Button for toggling theme
 */
class ThemeToggle extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.bindEvents();
        this.updateState();
    }

    render() {
        const isDark = isDark();

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: inline-block;
                }

                .toggle-btn {
                    background: none;
                    border: 1px solid var(--md-sys-color-outline, #C3C9D4);
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    padding: 0;
                }

                .toggle-btn:hover {
                    background: var(--md-sys-color-surface-container, #F3F6FB);
                }

                .toggle-btn .icon {
                    font-family: 'Material Symbols Outlined';
                    font-size: 20px;
                    color: var(--md-sys-color-on-surface, #101C2D);
                }

                [data-theme="dark"] .toggle-btn {
                    background: var(--md-sys-color-primary-container, #D1E4FF);
                    border-color: var(--md-sys-color-primary, #0061AB);
                }

                [data-theme="dark"] .toggle-btn .icon {
                    color: var(--md-sys-color-on-primary-container, #001D36);
                }
            </style>

            <button class="toggle-btn" aria-label="Toggle theme" aria-pressed="${isDark}">
                <span class="icon">${isDark ? 'light_mode' : 'dark_mode'}</span>
            </button>
        `;
    }

    bindEvents() {
        this.shadowRoot.querySelector('.toggle-btn').addEventListener('click', () => {
            toggle();
            this.updateState();
        });
    }

    updateState() {
        const btn = this.shadowRoot.querySelector('.toggle-btn');
        const icon = this.shadowRoot.querySelector('.icon');
        if (btn && icon) {
            const currentIsDark = isDark();
            btn.setAttribute('aria-pressed', currentIsDark.toString());
            icon.textContent = currentIsDark ? 'light_mode' : 'dark_mode';
        }
    }

    /**
     * Static API - Open theme toggle
     */
    static register() {
        if (!customElements.get('theme-toggle')) {
            customElements.define('theme-toggle', ThemeToggle);
        }
    }
}

// Auto-register Web Component
ThemeToggle.register();

// ============================================================================
// KEYBOARD SHORTCUT
// ============================================================================

// Ctrl+Shift+D to toggle theme
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        toggle();
    }
});

// ============================================================================
// AUTO-INITIALIZE
// ============================================================================

if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => init());
    } else {
        init();
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
    ThemeMode,
    STORAGE_KEY,
    THEME_ATTRIBUTE,
    getEffectiveMode,
    applyTheme,
    setMode,
    toggle,
    enableDark,
    disableDark,
    getMode,
    isDark,
    save,
    load,
    onChange,
    setupSystemListener,
    init,
    ThemeToggle
};

// Default export
export default {
    ThemeMode,
    getMode,
    setMode,
    toggle,
    enableDark,
    disableDark,
    isDark,
    getEffectiveMode,
    onChange,
    init,
    registerToggle: () => ThemeToggle.register()
};

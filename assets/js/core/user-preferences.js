/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SA ĐÉC MARKETING HUB — USER PREFERENCES (CONSOLIDATED)
 * Manage user settings, preferences, and UI customizations
 *
 * Features:
 * - Theme preferences (dark/light/auto)
 * - Dashboard layout preferences
 * - Notification settings
 * - Keyboard shortcuts customization
 * - Web Component for preferences panel
 * - Data persistence with localStorage
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// USER PREFERENCES MANAGER (ES Module)
// ============================================================================

import { Logger } from '../shared/logger.js';

/**
 * Default preferences
 */
const DEFAULTS = {
    // Appearance
    theme: 'auto', // 'light' | 'dark' | 'auto'
    fontSize: 'medium', // 'small' | 'medium' | 'large'
    compactMode: false,

    // Dashboard
    dashboardLayout: 'grid', // 'grid' | 'list' | 'compact'
    widgets: [
        { id: 'revenue', visible: true, position: 0 },
        { id: 'customers', visible: true, position: 1 },
        { id: 'orders', visible: true, position: 2 },
        { id: 'analytics', visible: true, position: 3 }
    ],

    // Notifications
    notifications: {
        enabled: true,
        sound: true,
        desktop: true,
        types: {
            newLead: true,
            newOrder: true,
            payment: true,
            system: true
        }
    },

    // Data
    rowsPerPage: 25, // 10 | 25 | 50 | 100
    defaultDateRange: '30d', // '7d' | '30d' | '90d' | '1y'

    // Keyboard
    shortcuts: {
        search: 'Ctrl+K',
        save: 'Ctrl+S',
        new: 'Ctrl+N',
        refresh: 'Ctrl+R'
    },

    // Accessibility
    reduceMotion: false,
    highContrast: false
};

/**
 * Storage key
 */
const STORAGE_KEY = 'sadec_preferences_v1';

/**
 * Current preferences
 */
let _preferences = null;

/**
 * Change listeners
 */
const _listeners = [];

/**
 * Load preferences from storage
 * @returns {Object} Preferences object
 */
export function load() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            return { ...DEFAULTS, ...parsed };
        }
    } catch (e) {
        Logger.warn('[UserPreferences] Failed to load:', e.message);
    }
    return { ...DEFAULTS };
}

/**
 * Save preferences to storage
 */
export function save() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(_preferences));
    } catch (e) {
        Logger.warn('[UserPreferences] Failed to save:', e.message);
    }
}

/**
 * Get preference value
 * @param {string} key - Preference key (dot notation supported)
 * @returns {any} Preference value
 */
export function get(key) {
    if (!_preferences) {
        _preferences = load();
    }

    const keys = key.split('.');
    let value = _preferences;

    for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = value[k];
        } else {
            return undefined;
        }
    }

    return value;
}

/**
 * Set preference value
 * @param {string} key - Preference key
 * @param {any} value - New value
 * @param {boolean} save - Auto-save to storage
 */
export function set(key, value, save = true) {
    if (!_preferences) {
        _preferences = load();
    }

    const keys = key.split('.');
    let obj = _preferences;

    for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        if (!(k in obj)) {
            obj[k] = {};
        }
        obj = obj[k];
    }

    const lastKey = keys[keys.length - 1];
    const oldValue = obj[lastKey];
    obj[lastKey] = value;

    if (save) {
        save();
    }

    // Notify listeners
    notifyChange(key, value, oldValue);
}

/**
 * Reset to defaults
 */
export function reset() {
    _preferences = { ...DEFAULTS };
    save();
    apply();
}

/**
 * Apply preferences to UI
 */
export function apply() {
    applyTheme();
    applyFontSize();
    applyCompactMode();
    applyReduceMotion();
    applyHighContrast();
}

/**
 * Apply theme preference
 */
export function applyTheme() {
    const theme = get('theme');
    const root = document.documentElement;

    if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
        root.setAttribute('data-theme', theme);
    }
}

/**
 * Apply font size preference
 */
export function applyFontSize() {
    const size = get('fontSize');
    const root = document.documentElement;

    const sizes = {
        small: '12px',
        medium: '14px',
        large: '16px'
    };

    root.style.setProperty('--font-size-base', sizes[size] || sizes.medium);
}

/**
 * Apply compact mode
 */
export function applyCompactMode() {
    const compact = get('compactMode');
    document.body.classList.toggle('compact-mode', compact);
}

/**
 * Apply reduce motion
 */
export function applyReduceMotion() {
    const reduce = get('reduceMotion');
    if (reduce) {
        document.documentElement.style.setProperty('--prefers-reduced-motion', 'reduce');
    } else {
        document.documentElement.style.setProperty('--prefers-reduced-motion', 'no-preference');
    }
}

/**
 * Apply high contrast
 */
export function applyHighContrast() {
    const highContrast = get('highContrast');
    document.body.classList.toggle('high-contrast', highContrast);
}

/**
 * Add change listener
 * @param {Function} callback - Callback function
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
 * Notify listeners of changes
 * @param {string} key - Changed key
 * @param {any} newValue - New value
 * @param {any} oldValue - Old value
 */
function notifyChange(key, newValue, oldValue) {
    _listeners.forEach(callback => {
        try {
            callback({ key, newValue, oldValue });
        } catch (e) {
            Logger.warn('[UserPreferences] Listener error:', e.message);
        }
    });
}

/**
 * Get all preferences
 * @returns {Object} All preferences
 */
export function getAll() {
    return { ..._preferences };
}

/**
 * Setup system preference listeners
 */
export function setupSystemListeners() {
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (get('theme') === 'auto') {
                applyTheme();
            }
        });
    }
}

/**
 * Initialize preferences
 */
export function init() {
    _preferences = load();
    apply();
    setupSystemListeners();
}

// ============================================================================
// WEB COMPONENT (Preferences Panel UI)
// ============================================================================

/**
 * User Preferences Web Component
 * Modal panel for user settings
 */
class UserPreferencesPanel extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
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
                set('theme', e.target.value);
                applyTheme();
            });
        });

        // Font size
        this.shadowRoot.querySelectorAll('[name="font-size"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                set('fontSize', e.target.value);
                applyFontSize();
            });
        });

        // Compact mode
        this.shadowRoot.querySelectorAll('[name="dashboard-layout"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                set('dashboardLayout', e.target.value);
            });
        });

        // Checkboxes
        this.shadowRoot.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const key = e.target.dataset.key;
                if (key) {
                    set(key, e.target.checked);
                }
            });
        });

        // Reset button
        const resetBtn = this.shadowRoot.querySelector('.reset-btn');
        resetBtn?.addEventListener('click', () => {
            if (confirm('Bạn có chắc muốn khôi phục cài đặt mặc định?')) {
                reset();
            }
        });

        // Close button
        const closeBtn = this.shadowRoot.querySelector('.close-btn');
        closeBtn?.addEventListener('click', () => this.close());
    }

    render() {
        const theme = get('theme');
        const fontSize = get('fontSize');
        const dashboardLayout = get('dashboardLayout');
        const animations = get('reduceMotion') ? false : true;
        const notifications = get('notifications.enabled');
        const keyboardShortcuts = get('shortcuts') ? true : false;

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
                                            <input type="radio" name="theme" value="light" id="theme-light">
                                            <label for="theme-light">☀️ Sáng</label>
                                        </div>
                                        <div class="radio-option">
                                            <input type="radio" name="theme" value="dark" id="theme-dark">
                                            <label for="theme-dark">🌙 Tối</label>
                                        </div>
                                        <div class="radio-option">
                                            <input type="radio" name="theme" value="auto" id="theme-auto">
                                            <label for="theme-auto">💻 Hệ thống</label>
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
                                            <input type="radio" name="font-size" value="small" id="font-small">
                                            <label for="font-small">Nhỏ</label>
                                        </div>
                                        <div class="radio-option">
                                            <input type="radio" name="font-size" value="medium" id="font-medium">
                                            <label for="font-medium">Vừa</label>
                                        </div>
                                        <div class="radio-option">
                                            <input type="radio" name="font-size" value="large" id="font-large">
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
                                            <input type="radio" name="dashboard-layout" value="compact" id="layout-compact">
                                            <label for="layout-compact">Sát</label>
                                        </div>
                                        <div class="radio-option">
                                            <input type="radio" name="dashboard-layout" value="comfortable" id="layout-comfortable">
                                            <label for="layout-comfortable">Thoáng</label>
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
                                        <input type="checkbox" data-key="notifications.enabled">
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
                                        <input type="checkbox" data-key="shortcuts">
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

        // Set initial values
        this.shadowRoot.querySelector(`[name="theme"][value="${theme}"]`).checked = true;
        this.shadowRoot.querySelector(`[name="font-size"][value="${fontSize}"]`).checked = true;
        this.shadowRoot.querySelector(`[name="dashboard-layout"][value="${dashboardLayout}"]`).checked = true;
        this.shadowRoot.querySelector('[data-key="notifications.enabled"]').checked = notifications;
        this.shadowRoot.querySelector('[data-key="shortcuts"]').checked = keyboardShortcuts;
    }

    /**
     * Static API - Open preferences panel
     */
    static open() {
        let panel = document.querySelector('user-preferences-panel');
        if (!panel) {
            panel = document.createElement('user-preferences-panel');
            document.body.appendChild(panel);
        }
        panel.open();
    }
}

// Register Web Component
customElements.define('user-preferences-panel', UserPreferencesPanel);

// Keyboard shortcut (Ctrl+Shift+P)
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        UserPreferencesPanel.open();
    }
});

// Auto-initialize
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => init());
    } else {
        init();
    }
}

// Export API
export {
    DEFAULTS,
    STORAGE_KEY,
    get,
    set,
    getAll,
    save,
    reset,
    apply,
    applyTheme,
    applyFontSize,
    applyCompactMode,
    applyReduceMotion,
    applyHighContrast,
    onChange,
    setupSystemListeners,
    init,
    UserPreferencesPanel
};

// Default export
export default {
    get,
    set,
    getAll,
    save,
    reset,
    apply,
    onChange,
    init,
    open: UserPreferencesPanel.open
};

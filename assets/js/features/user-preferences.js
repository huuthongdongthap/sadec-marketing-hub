/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SA ĐÉC MARKETING HUB — USER PREFERENCES MANAGER
 * Manage user settings, preferences, and UI customizations
 *
 * Features:
 * - Theme preferences (dark/light/auto)
 * - Dashboard layout preferences
 * - Notification settings
 * - Keyboard shortcuts customization
 * - Data persistence with localStorage
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Debug logger - only active in development
 * @param {string} message - Log message
 */
const _debug = (message) => {
    // Debug logger - disabled in production
};

export class UserPreferences {
    /**
     * Default preferences
     */
    static defaults = {
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
    static STORAGE_KEY = 'sadec_preferences_v1';

    /**
     * Current preferences
     */
    static _preferences = null;

    /**
     * Change listeners
     */
    static _listeners = [];

    /**
     * Initialize preferences
     */
    static init() {
        this._preferences = this.load();
        this.apply();
        this.setupSystemListeners();

        _debug('[UserPreferences] Initialized');
    }

    /**
     * Load preferences from storage
     * @returns {Object} Preferences object
     */
    static load() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                return { ...this.defaults, ...parsed };
            }
        } catch (e) {
            _debug('[UserPreferences] Failed to load: ' + e.message);
        }

        return { ...this.defaults };
    }

    /**
     * Save preferences to storage
     */
    static save() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this._preferences));
            _debug('[UserPreferences] Saved');
        } catch (e) {
            _debug('[UserPreferences] Failed to save: ' + e.message);
        }
    }

    /**
     * Get preference value
     * @param {string} key - Preference key (dot notation supported)
     * @returns {any} Preference value
     */
    static get(key) {
        if (!this._preferences) {
            this._preferences = this.load();
        }

        const keys = key.split('.');
        let value = this._preferences;

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
    static set(key, value, save = true) {
        if (!this._preferences) {
            this._preferences = this.load();
        }

        const keys = key.split('.');
        let obj = this._preferences;

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
            this.save();
        }

        // Notify listeners
        this.notifyChange(key, value, oldValue);
    }

    /**
     * Reset to defaults
     */
    static reset() {
        this._preferences = { ...this.defaults };
        this.save();
        this.apply();
        _debug('[UserPreferences] Reset to defaults');
    }

    /**
     * Apply preferences to UI
     */
    static apply() {
        // Theme
        this.applyTheme();

        // Font size
        this.applyFontSize();

        // Compact mode
        this.applyCompactMode();

        // Reduce motion
        this.applyReduceMotion();

        // High contrast
        this.applyHighContrast();
    }

    /**
     * Apply theme preference
     */
    static applyTheme() {
        const theme = this.get('theme');
        const root = document.documentElement;

        if (theme === 'auto') {
            // Follow system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        } else {
            root.setAttribute('data-theme', theme);
        }

        _debug('[UserPreferences] Theme applied: ' + theme);
    }

    /**
     * Apply font size preference
     */
    static applyFontSize() {
        const size = this.get('fontSize');
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
    static applyCompactMode() {
        const compact = this.get('compactMode');
        document.body.classList.toggle('compact-mode', compact);
    }

    /**
     * Apply reduce motion
     */
    static applyReduceMotion() {
        const reduce = this.get('reduceMotion');

        if (reduce) {
            document.documentElement.style.setProperty('--prefers-reduced-motion', 'reduce');
        } else {
            document.documentElement.style.setProperty('--prefers-reduced-motion', 'no-preference');
        }
    }

    /**
     * Apply high contrast
     */
    static applyHighContrast() {
        const highContrast = this.get('highContrast');
        document.body.classList.toggle('high-contrast', highContrast);
    }

    /**
     * Setup system preference listeners
     */
    static setupSystemListeners() {
        // Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (this.get('theme') === 'auto') {
                    this.applyTheme();
                }
            });
        }
    }

    /**
     * Add change listener
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    static onChange(callback) {
        this._listeners.push(callback);

        return () => {
            this._listeners = this._listeners.filter(l => l !== callback);
        };
    }

    /**
     * Notify listeners of changes
     * @param {string} key - Changed key
     * @param {any} newValue - New value
     * @param {any} oldValue - Old value
     */
    static notifyChange(key, newValue, oldValue) {
        this._listeners.forEach(callback => {
            try {
                callback({ key, newValue, oldValue });
            } catch (e) {
                _debug('[UserPreferences] Listener error: ' + e.message);
            }
        });
    }

    /**
     * Get all preferences
     * @returns {Object} All preferences
     */
    static getAll() {
        return { ...this._preferences };
    }

    /**
     * Export preferences to file
     */
    static exportToFile() {
        const data = JSON.stringify(this._preferences, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `preferences-${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        URL.revokeObjectURL(url);
    }

    /**
     * Import preferences from file
     * @param {File} file - JSON file
     */
    static importFromFile(file) {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                this._preferences = { ...this.defaults, ...imported };
                this.save();
                this.apply();
                _debug('[UserPreferences] Imported successfully');
            } catch (err) {
                _debug('[UserPreferences] Import failed: ' + err.message);
            }
        };

        reader.readAsText(file);
    }

    /**
     * Create preferences panel UI
     * @returns {HTMLElement} Preferences panel
     */
    static createPanel() {
        const panel = document.createElement('div');
        panel.className = 'preferences-panel';
        panel.innerHTML = `
            <div class="preferences-header">
                <h3>⚙️ Cài đặt</h3>
                <button class="preferences-close" aria-label="Close">&times;</button>
            </div>

            <div class="preferences-content">
                <!-- Theme Section -->
                <section class="preferences-section">
                    <h4>🎨 Giao diện</h4>
                    <div class="preferences-row">
                        <label>Chủ đề</label>
                        <select id="pref-theme">
                            <option value="auto" ${this.get('theme') === 'auto' ? 'selected' : ''}>Tự động</option>
                            <option value="light" ${this.get('theme') === 'light' ? 'selected' : ''}>Sáng</option>
                            <option value="dark" ${this.get('theme') === 'dark' ? 'selected' : ''}>Tối</option>
                        </select>
                    </div>

                    <div class="preferences-row">
                        <label>Cỡ chữ</label>
                        <select id="pref-fontsize">
                            <option value="small" ${this.get('fontSize') === 'small' ? 'selected' : ''}>Nhỏ</option>
                            <option value="medium" ${this.get('fontSize') === 'medium' ? 'selected' : ''}>Vừa</option>
                            <option value="large" ${this.get('fontSize') === 'large' ? 'selected' : ''}>Lớn</option>
                        </select>
                    </div>

                    <div class="preferences-row">
                        <label>Chế độ compact</label>
                        <label class="toggle">
                            <input type="checkbox" id="pref-compact" ${this.get('compactMode') ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </section>

                <!-- Notifications Section -->
                <section class="preferences-section">
                    <h4>🔔 Thông báo</h4>
                    <div class="preferences-row">
                        <label>Bật thông báo</label>
                        <label class="toggle">
                            <input type="checkbox" id="pref-notif-enabled" ${this.get('notifications.enabled') ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    <div class="preferences-row">
                        <label>Âm thanh</label>
                        <label class="toggle">
                            <input type="checkbox" id="pref-notif-sound" ${this.get('notifications.sound') ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    <div class="preferences-row">
                        <label>Desktop notifications</label>
                        <label class="toggle">
                            <input type="checkbox" id="pref-notif-desktop" ${this.get('notifications.desktop') ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </section>

                <!-- Data Section -->
                <section class="preferences-section">
                    <h4>📊 Dữ liệu</h4>
                    <div class="preferences-row">
                        <label>Số dòng mỗi trang</label>
                        <select id="pref-rowsperpage">
                            <option value="10" ${this.get('rowsPerPage') === 10 ? 'selected' : ''}>10</option>
                            <option value="25" ${this.get('rowsPerPage') === 25 ? 'selected' : ''}>25</option>
                            <option value="50" ${this.get('rowsPerPage') === 50 ? 'selected' : ''}>50</option>
                            <option value="100" ${this.get('rowsPerPage') === 100 ? 'selected' : ''}>100</option>
                        </select>
                    </div>

                    <div class="preferences-row">
                        <label>Khoảng thời gian mặc định</label>
                        <select id="pref-daterange">
                            <option value="7d" ${this.get('defaultDateRange') === '7d' ? 'selected' : ''}>7 ngày</option>
                            <option value="30d" ${this.get('defaultDateRange') === '30d' ? 'selected' : ''}>30 ngày</option>
                            <option value="90d" ${this.get('defaultDateRange') === '90d' ? 'selected' : ''}>90 ngày</option>
                            <option value="1y" ${this.get('defaultDateRange') === '1y' ? 'selected' : ''}>1 năm</option>
                        </select>
                    </div>
                </section>

                <!-- Accessibility Section -->
                <section class="preferences-section">
                    <h4>♿ Truy cập</h4>
                    <div class="preferences-row">
                        <label>Giảm chuyển động</label>
                        <label class="toggle">
                            <input type="checkbox" id="pref-reducemotion" ${this.get('reduceMotion') ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    <div class="preferences-row">
                        <label>Độ tương phản cao</label>
                        <label class="toggle">
                            <input type="checkbox" id="pref-highcontrast" ${this.get('highContrast') ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </section>
            </div>

            <div class="preferences-footer">
                <button class="btn btn-secondary" id="pref-reset">Khôi phục mặc định</button>
                <button class="btn btn-primary" id="pref-save">Lưu</button>
            </div>
        `;

        // Bind events
        this.bindPanelEvents(panel);

        return panel;
    }

    /**
     * Bind panel events
     * @param {HTMLElement} panel - Panel element
     */
    static bindPanelEvents(panel) {
        // Theme
        panel.querySelector('#pref-theme').addEventListener('change', (e) => {
            this.set('theme', e.target.value);
        });

        // Font size
        panel.querySelector('#pref-fontsize').addEventListener('change', (e) => {
            this.set('fontSize', e.target.value);
        });

        // Compact mode
        panel.querySelector('#pref-compact').addEventListener('change', (e) => {
            this.set('compactMode', e.target.checked);
        });

        // Notifications
        panel.querySelector('#pref-notif-enabled').addEventListener('change', (e) => {
            this.set('notifications.enabled', e.target.checked);
        });

        panel.querySelector('#pref-notif-sound').addEventListener('change', (e) => {
            this.set('notifications.sound', e.target.checked);
        });

        panel.querySelector('#pref-notif-desktop').addEventListener('change', (e) => {
            this.set('notifications.desktop', e.target.checked);
        });

        // Data
        panel.querySelector('#pref-rowsperpage').addEventListener('change', (e) => {
            this.set('rowsPerPage', parseInt(e.target.value));
        });

        panel.querySelector('#pref-daterange').addEventListener('change', (e) => {
            this.set('defaultDateRange', e.target.value);
        });

        // Accessibility
        panel.querySelector('#pref-reducemotion').addEventListener('change', (e) => {
            this.set('reduceMotion', e.target.checked);
        });

        panel.querySelector('#pref-highcontrast').addEventListener('change', (e) => {
            this.set('highContrast', e.target.checked);
        });

        // Reset button
        panel.querySelector('#pref-reset').addEventListener('click', () => {
            if (confirm('Bạn có chắc muốn khôi phục cài đặt mặc định?')) {
                this.reset();
            }
        });

        // Save button
        panel.querySelector('#pref-save').addEventListener('click', () => {
            this.save();
            // Close panel or show success message
        });

        // Close button
        panel.querySelector('.preferences-close').addEventListener('click', () => {
            panel.remove();
        });
    }

    /**
     * Show preferences modal
     */
    static showPanel() {
        const panel = this.createPanel();
        document.body.appendChild(panel);
        panel.classList.add('visible');
    }
}

// Auto-initialize on DOM ready
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => UserPreferences.init());
    } else {
        UserPreferences.init();
    }
}

// Export
export default UserPreferences;

// Global access
if (typeof window !== 'undefined') {
    window.UserPreferences = UserPreferences;
}

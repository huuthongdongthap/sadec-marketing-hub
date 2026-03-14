/**
 * ═══════════════════════════════════════════════════════════════════════════
 * QUICK SETTINGS PANEL — Sa Đéc Marketing Hub
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Features:
 * - Theme toggle (Dark/Light/System)
 * - Notification preferences
 * - Keyboard shortcuts toggle
 * - Reduced motion toggle
 * - Compact mode toggle
 * - Settings persisted to localStorage
 *
 * Usage:
 *   import { initQuickSettings } from './quick-settings.js';
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

const QuickSettings = {
    panel: null,
    isOpen: false,
    storageKey: 'sadec_quick_settings',

    defaults: {
        theme: 'system',
        notifications: true,
        keyboardShortcuts: true,
        reducedMotion: false,
        compactMode: false
    },

    settings: { ...this.defaults },

    /**
     * Initialize quick settings panel
     */
    init() {
        this.loadSettings();
        this.createPanel();
        this.bindEvents();
        this.applySettings();
    },

    /**
     * Load settings from localStorage
     */
    loadSettings() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                this.settings = { ...this.defaults, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.warn('[QuickSettings] Failed to load settings:', e);
        }
    },

    /**
     * Save settings to localStorage
     */
    saveSettings() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
        } catch (e) {
            console.warn('[QuickSettings] Failed to save settings:', e);
        }
    },

    /**
     * Create settings panel UI
     */
    createPanel() {
        if (document.getElementById('quick-settings-panel')) return;

        this.panel = document.createElement('div');
        this.panel.id = 'quick-settings-panel';
        this.panel.className = 'quick-settings-panel';
        this.panel.setAttribute('role', 'dialog');
        this.panel.setAttribute('aria-label', 'Quick Settings');
        this.panel.innerHTML = `
            <div class="quick-settings-header">
                <h3 class="quick-settings-title">
                    <span class="material-symbols-outlined">settings</span>
                    Cài Đặt Nhanh
                </h3>
                <button class="quick-settings-close" aria-label="Đóng cài đặt">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            <div class="quick-settings-content">
                <div class="setting-item">
                    <div class="setting-label">
                        <span class="material-symbols-outlined">palette</span>
                        <span>Chủ đề</span>
                    </div>
                    <div class="setting-control theme-selector">
                        <button data-theme="light" aria-label="Sáng">
                            <span class="material-symbols-outlined">light_mode</span>
                        </button>
                        <button data-theme="dark" aria-label="Tối">
                            <span class="material-symbols-outlined">dark_mode</span>
                        </button>
                        <button data-theme="system" aria-label="Hệ thống">
                            <span class="material-symbols-outlined">computer</span>
                        </button>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-label">
                        <span class="material-symbols-outlined">notifications</span>
                        <span>Thông báo</span>
                    </div>
                    <label class="setting-toggle">
                        <input type="checkbox" id="setting-notifications" />
                        <span class="toggle-slider"></span>
                    </label>
                </div>

                <div class="setting-item">
                    <div class="setting-label">
                        <span class="material-symbols-outlined">keyboard</span>
                        <span>Phím tắt</span>
                    </div>
                    <label class="setting-toggle">
                        <input type="checkbox" id="setting-keyboard" />
                        <span class="toggle-slider"></span>
                    </label>
                </div>

                <div class="setting-item">
                    <div class="setting-label">
                        <span class="material-symbols-outlined">accessibility</span>
                        <span>Giảm chuyển động</span>
                    </div>
                    <label class="setting-toggle">
                        <input type="checkbox" id="setting-reduced-motion" />
                        <span class="toggle-slider"></span>
                    </label>
                </div>

                <div class="setting-item">
                    <div class="setting-label">
                        <span class="material-symbols-outlined">density_medium</span>
                        <span>Chế độ compact</span>
                    </div>
                    <label class="setting-toggle">
                        <input type="checkbox" id="setting-compact" />
                        <span class="toggle-slider"></span>
                    </label>
                </div>
            </div>
            <div class="quick-settings-footer">
                <button class="btn-reset" id="settings-reset">
                    <span class="material-symbols-outlined">refresh</span>
                    Khôi phục mặc định
                </button>
            </div>
        `;

        document.body.appendChild(this.panel);
    },

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Toggle panel from keyboard shortcut (Ctrl+,)
        document.addEventListener('keydown', (e) => {
            if (this.settings.keyboardShortcuts && e.ctrlKey && e.key === ',') {
                e.preventDefault();
                this.toggle();
            }
        });

        // Close button
        const closeBtn = this.panel.querySelector('.quick-settings-close');
        closeBtn.addEventListener('click', () => this.close());

        // Theme buttons
        const themeBtns = this.panel.querySelectorAll('.theme-selector button');
        themeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.dataset.theme;
                this.updateSetting('theme', theme);
                themeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Notification toggle
        const notifToggle = this.panel.querySelector('#setting-notifications');
        notifToggle.addEventListener('change', (e) => {
            this.updateSetting('notifications', e.target.checked);
        });

        // Keyboard shortcuts toggle
        const kbToggle = this.panel.querySelector('#setting-keyboard');
        kbToggle.addEventListener('change', (e) => {
            this.updateSetting('keyboardShortcuts', e.target.checked);
        });

        // Reduced motion toggle
        const motionToggle = this.panel.querySelector('#setting-reduced-motion');
        motionToggle.addEventListener('change', (e) => {
            this.updateSetting('reducedMotion', e.target.checked);
        });

        // Compact mode toggle
        const compactToggle = this.panel.querySelector('#setting-compact');
        compactToggle.addEventListener('change', (e) => {
            this.updateSetting('compactMode', e.target.checked);
        });

        // Reset button
        const resetBtn = this.panel.querySelector('#settings-reset');
        resetBtn.addEventListener('click', () => this.reset());

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.panel.contains(e.target) && !e.target.closest('[data-settings-trigger]')) {
                this.close();
            }
        });

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    },

    /**
     * Apply settings to the app
     */
    applySettings() {
        // Apply theme
        this.applyTheme(this.settings.theme);

        // Apply reduced motion
        document.body.classList.toggle('reduced-motion', this.settings.reducedMotion);

        // Apply compact mode
        document.body.classList.toggle('compact-mode', this.settings.compactMode);

        // Update toggle states
        this.panel.querySelector('#setting-notifications').checked = this.settings.notifications;
        this.panel.querySelector('#setting-keyboard').checked = this.settings.keyboardShortcuts;
        this.panel.querySelector('#setting-reduced-motion').checked = this.settings.reducedMotion;
        this.panel.querySelector('#setting-compact').checked = this.settings.compactMode;

        // Update theme button states
        const themeBtns = this.panel.querySelectorAll('.theme-selector button');
        themeBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === this.settings.theme);
        });
    },

    /**
     * Apply theme
     * @param {string} theme - 'light' | 'dark' | 'system'
     */
    applyTheme(theme) {
        document.body.classList.remove('dark-theme', 'light-theme');

        if (theme === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.body.classList.add(prefersDark ? 'dark-theme' : 'light-theme');
        } else {
            document.body.classList.add(`${theme}-theme`);
        }
    },

    /**
     * Update a setting
     * @param {string} key - Setting key
     * @param {any} value - Setting value
     */
    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
        this.applySettings();

        // Dispatch custom event for other components to listen
        window.dispatchEvent(new CustomEvent('settings-changed', {
            detail: { key, value, settings: this.settings }
        }));
    },

    /**
     * Reset settings to defaults
     */
    reset() {
        this.settings = { ...this.defaults };
        this.saveSettings();
        this.applySettings();

        // Show toast notification
        this.showToast('Đã khôi phục cài đặt mặc định');
    },

    /**
     * Toggle panel visibility
     */
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    },

    /**
     * Open panel
     */
    open() {
        this.panel.classList.add('open');
        this.isOpen = true;
        this.panel.setAttribute('aria-hidden', 'false');

        // Focus first interactive element
        const firstBtn = this.panel.querySelector('button');
        if (firstBtn) firstBtn.focus();
    },

    /**
     * Close panel
     */
    close() {
        this.panel.classList.remove('open');
        this.isOpen = false;
        this.panel.setAttribute('aria-hidden', 'true');
    },

    /**
     * Show toast notification
     * @param {string} message - Toast message
     */
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'settings-toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

// Auto-init on DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => QuickSettings.init());
} else {
    QuickSettings.init();
}

// Export for manual usage
export { QuickSettings };

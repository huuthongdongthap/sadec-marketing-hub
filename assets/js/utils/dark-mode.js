/**
 * Sa Đéc Marketing Hub — Dark Mode Utility
 * Toggle giao diện sáng/tối với localStorage persistence
 */

const DarkMode = {
    STORAGE_KEY: 'sadec-dark-mode',

    init() {
        // Restore saved preference
        const saved = localStorage.getItem(this.STORAGE_KEY);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (saved === 'enabled' || (saved === null && prefersDark)) {
            this.enable();
        }

        // Listen for system preference changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (localStorage.getItem(this.STORAGE_KEY) === null) {
                e.matches ? this.enable() : this.disable();
            }
        });

        this.bindToggle();
    },

    enable() {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem(this.STORAGE_KEY, 'enabled');
        this.updateToggleState(true);
        this.dispatchEvent('dark-mode-enabled');
    },

    disable() {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem(this.STORAGE_KEY, 'disabled');
        this.updateToggleState(false);
        this.dispatchEvent('dark-mode-disabled');
    },

    toggle() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        isDark ? this.disable() : this.enable();
    },

    isEnabled() {
        return document.documentElement.getAttribute('data-theme') === 'dark';
    },

    bindToggle() {
        // Support multiple toggle buttons
        document.querySelectorAll('[data-dark-mode-toggle]').forEach(btn => {
            btn.addEventListener('click', () => this.toggle());
        });

        // Keyboard shortcut (Alt + D)
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key === 'd') {
                e.preventDefault();
                this.toggle();
            }
        });
    },

    updateToggleState(isDark) {
        document.querySelectorAll('[data-dark-mode-toggle]').forEach(btn => {
            btn.setAttribute('aria-pressed', isDark.toString());
            const icon = btn.querySelector('[data-icon]');
            if (icon) {
                icon.textContent = isDark ? 'light_mode' : 'dark_mode';
            }
        });
    },

    dispatchEvent(eventName) {
        window.dispatchEvent(new CustomEvent(eventName, {
            detail: { isDark: this.isEnabled() }
        }));
    }
};

// Auto-init on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => DarkMode.init());
} else {
    DarkMode.init();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DarkMode;
}

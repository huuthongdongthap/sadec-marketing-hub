/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DARK MODE TOGGLE — Sa Đéc Marketing Hub
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Features:
 * - Auto-detect system preference
 * - Manual toggle with animation
 * - Persist user preference
 * - Smooth transitions
 *
 * Usage:
 *   import { initDarkMode, toggleDarkMode } from './dark-mode.js';
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

const DARK_MODE_KEY = 'sadec-dark-mode';

/**
 * Initialize dark mode
 */
export function initDarkMode() {
    // Auto-detect system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const savedPreference = localStorage.getItem(DARK_MODE_KEY);

    // Apply theme
    if (savedPreference === 'dark' || (savedPreference === null && prefersDark.matches)) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    // Listen for system preference changes
    prefersDark.addEventListener('change', (e) => {
        if (localStorage.getItem(DARK_MODE_KEY) === null) {
            document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
    });

    // Create toggle button if not exists
    createToggleButton();

    console.log('[DarkMode] Initialized');
}

/**
 * Toggle dark mode
 */
export function toggleDarkMode() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    html.setAttribute('data-theme', newTheme);
    localStorage.setItem(DARK_MODE_KEY, newTheme);

    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('theme-change', { detail: { theme: newTheme } }));

    console.log('[DarkMode] Toggled to:', newTheme);
}

/**
 * Create toggle button
 */
function createToggleButton() {
    // Check if button already exists
    if (document.getElementById('dark-mode-toggle')) return;

    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'dark-mode-toggle';
    toggleBtn.className = 'dark-mode-toggle';
    toggleBtn.setAttribute('aria-label', 'Toggle dark mode');
    toggleBtn.innerHTML = `
        <span class="material-symbols-outlined sun-icon">light_mode</span>
        <span class="material-symbols-outlined moon-icon">dark_mode</span>
    `;

    toggleBtn.addEventListener('click', toggleDarkMode);

    // Add to header or body
    const header = document.querySelector('header') || document.querySelector('.admin-header') || document.body;
    header.appendChild(toggleBtn);

    // Add styles
    addStyles();
}

/**
 * Add toggle button styles
 */
function addStyles() {
    if (document.getElementById('dark-mode-toggle-styles')) return;

    const style = document.createElement('style');
    style.id = 'dark-mode-toggle-styles';
    style.textContent = `
        .dark-mode-toggle {
            position: fixed;
            top: 80px;
            right: 20px;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: var(--md-sys-color-surface-container, rgba(0,0,0,0.05));
            border: 1px solid var(--md-sys-color-outline, rgba(0,0,0,0.1));
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            z-index: 1000;
        }

        .dark-mode-toggle:hover {
            background: var(--md-sys-color-primary-container, rgba(0,106,96,0.1));
            transform: scale(1.1);
        }

        .dark-mode-toggle .sun-icon { display: none; }
        .dark-mode-toggle .moon-icon { display: block; }

        [data-theme="dark"] .dark-mode-toggle .sun-icon { display: block; }
        [data-theme="dark"] .dark-mode-toggle .moon-icon { display: none; }

        .dark-mode-toggle .material-symbols-outlined {
            font-size: 24px;
            color: var(--md-sys-color-on-surface-variant, #666);
        }

        /* Smooth transitions */
        * {
            transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
        }
    `;

    document.head.appendChild(style);
}

// Auto-init on DOM ready
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDarkMode);
    } else {
        initDarkMode();
    }
}

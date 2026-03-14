/**
 * Sa Đéc Marketing Hub - Theme Switcher
 * Dark mode toggle với localStorage persistence
 *
 * Usage: Import vào HTML
 * <script type="module" src="assets/js/theme-switcher.js"></script>
 */

// Theme state
const Theme = {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system'
};

const STORAGE_KEY = 'mekong-theme-preference';

/**
 * Get current theme from localStorage or system preference
 */
function getStoredTheme() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        return stored;
    }
    // Default to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? Theme.DARK
        : Theme.LIGHT;
}

/**
 * Apply theme to document
 */
function applyTheme(theme) {
    if (theme === Theme.SYSTEM) {
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', systemDark ? Theme.DARK : Theme.LIGHT);
    } else {
        document.documentElement.setAttribute('data-theme', theme);
    }

    // Update PWA theme-color meta tag
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
        const color = theme === Theme.DARK ? '#191C1B' : '#006A60';
        themeColor.setAttribute('content', color);
    }
}

/**
 * Save theme preference
 */
function saveTheme(theme) {
    localStorage.setItem(STORAGE_KEY, theme);
}

/**
 * Toggle between light and dark
 */
function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const newTheme = current === Theme.DARK ? Theme.LIGHT : Theme.DARK;

    // Add toggling animation class
    const toggle = document.querySelector('.theme-toggle');
    if (toggle) {
        toggle.classList.add('toggling');
        setTimeout(() => toggle.classList.remove('toggling'), 300);
    }

    applyTheme(newTheme);
    saveTheme(newTheme);

    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('themechange', {
        detail: { theme: newTheme }
    }));

    console.log(`[Theme] Switched to ${newTheme} mode`);
}

/**
 * Initialize theme toggle button
 */
function initThemeToggle() {
    // Create toggle button if not exists
    let toggle = document.querySelector('.theme-toggle');

    if (!toggle) {
        toggle = document.createElement('button');
        toggle.className = 'theme-toggle';
        toggle.setAttribute('aria-label', 'Chuyển đổi chế độ tối/sáng');
        toggle.innerHTML = `
            <span class="theme-toggle-icon">
                <span class="material-symbols-outlined moon-icon" aria-hidden="true">dark_mode</span>
                <span class="material-symbols-outlined sun-icon" aria-hidden="true">light_mode</span>
            </span>
            <span class="theme-toggle-label">Chế độ</span>
        `;

        // Add to body
        document.body.appendChild(toggle);

        // Add click handler
        toggle.addEventListener('click', toggleTheme);

        console.log('[Theme] Toggle button created');
    } else {
        // Toggle already exists, just add handler if not present
        toggle.onclick = toggleTheme;
    }

    // Also add mobile floating toggle
    addFloatingToggle();
}

/**
 * Add floating toggle for mobile
 */
function addFloatingToggle() {
    if (window.innerWidth <= 768) {
        let floating = document.querySelector('.theme-toggle-floating');

        if (!floating) {
            floating = document.createElement('button');
            floating.className = 'theme-toggle-floating';
            floating.setAttribute('aria-label', 'Chuyển chế độ tối');
            floating.innerHTML = `
                <span class="material-symbols-outlined moon-icon" aria-hidden="true">dark_mode</span>
                <span class="material-symbols-outlined sun-icon" aria-hidden="true">light_mode</span>
            `;

            floating.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleTheme();
            });

            document.body.appendChild(floating);
        }
    } else {
        // Remove floating toggle on desktop
        const floating = document.querySelector('.theme-toggle-floating');
        if (floating) floating.remove();
    }
}

/**
 * Listen for system theme changes
 */
function listenForSystemChanges() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handler = (e) => {
        const stored = localStorage.getItem(STORAGE_KEY);
        // Only auto-switch if user hasn't set a preference
        if (!stored || stored === Theme.SYSTEM) {
            applyTheme(Theme.SYSTEM);
            console.log('[Theme] System theme changed');
        }
    };

    // Modern browsers
    mediaQuery.addEventListener('change', handler);

    // Legacy support
    mediaQuery.addListener(handler);
}

/**
 * Initialize theme on page load
 */
function init() {
    // Apply stored theme immediately (prevents flash)
    const theme = getStoredTheme();
    applyTheme(theme);

    // Wait for DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initThemeToggle();
            listenForSystemChanges();
        });
    } else {
        initThemeToggle();
        listenForSystemChanges();
    }

    // Handle resize for mobile toggle
    window.addEventListener('resize', addFloatingToggle);

    console.log('[Theme] Theme switcher initialized');
    console.log(`[Theme] Current theme: ${theme}`);
}

// Initialize immediately
init();

// Export for external use
export { toggleTheme, getStoredTheme, Theme, STORAGE_KEY };

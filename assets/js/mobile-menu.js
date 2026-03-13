/**
 * Mobile Menu Handler
 * Adds hamburger menu button for mobile sidebar toggle
 * Sa Đéc Marketing Hub
 */

const MobileMenu = {
    button: null,
    overlay: null,

    init() {
        // Only run on mobile
        if (window.innerWidth > 1024) return;

        this.createHamburgerButton();
        this.createOverlay();
        this.setupEventListeners();

        // Listen for sidebar state changes
        document.addEventListener('sidebar-toggle', (e) => {
            if (e.detail.collapsed) {
                this.close();
            }
        });
    },

    createHamburgerButton() {
        // Check if button already exists
        if (document.querySelector('.mobile-menu-btn')) return;

        this.button = document.createElement('button');
        this.button.className = 'mobile-menu-toggle';
        this.button.setAttribute('aria-label', 'Toggle Menu');

        // Add styles for mobile - position fixed top-left
        const buttonStyles = `
            position: fixed;
            top: 12px;
            left: 12px;
            z-index: 999;
            width: 48px;
            height: 48px;
            border-radius: 12px;
            background: var(--md-sys-color-surface-container, rgba(15, 23, 42, 0.9));
            border: 1px solid var(--md-sys-color-outline-variant, rgba(255, 255, 255, 0.1));
            color: var(--md-sys-color-on-surface-variant, #00f0ff);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            transition: all 0.2s ease;
            min-width: 48px;
            min-height: 48px;
            padding: 0;
            margin: 0;
        `;

        // Try inline styles first, also add CSS class
        this.button.style.cssText = buttonStyles;

        document.body.appendChild(this.button);

        // Also add a stylesheet for the button (for theming support)
        const style = document.createElement('style');
        style.textContent = `
            .mobile-menu-toggle:hover {
                background: var(--md-sys-color-surface-container-high, rgba(30, 41, 59, 0.95));
            }
            .mobile-menu-toggle .material-symbols-outlined {
                font-size: 24px;
            }
        `;
        document.head.appendChild(style);
    },

    createOverlay() {
        // Check if overlay already exists
        if (document.querySelector('.mobile-overlay')) return;

        this.overlay = document.createElement('div');
        this.overlay.className = 'mobile-overlay';
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 998;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
        `;

        document.body.appendChild(this.overlay);
    },

    setupEventListeners() {
        // Hamburger button click
        this.button.addEventListener('click', () => this.toggle());

        // Overlay click to close
        this.overlay.addEventListener('click', () => this.close());

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.close();
        });

        // Close on nav item click (after navigation starts)
        const sidebar = document.querySelector('sadec-sidebar');
        if (sidebar && sidebar.shadowRoot) {
            sidebar.shadowRoot.addEventListener('click', (e) => {
                if (e.target.classList.contains('nav-item')) {
                    this.close();
                }
            });
        }

        // Handle resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 1024) {
                this.close();
                this.button.style.display = 'none';
            } else {
                this.button.style.display = 'flex';
            }
        });
    },

    open() {
        const sidebar = document.querySelector('sadec-sidebar');
        if (sidebar) {
            // Use the public method which handles shadow DOM
            sidebar.open();
            // Also set attribute for CSS targeting
            sidebar.setAttribute('open', '');
        }

        this.overlay.style.opacity = '1';
        this.overlay.style.pointerEvents = 'auto';
        this.button.innerHTML = '<span class="material-symbols-outlined">close</span>';
        document.body.style.overflow = 'hidden';
    },

    close() {
        const sidebar = document.querySelector('sadec-sidebar');
        if (sidebar) {
            // Use the public method which handles shadow DOM
            sidebar.close();
            // Also remove attribute
            sidebar.removeAttribute('open');
        }

        this.overlay.style.opacity = '0';
        this.overlay.style.pointerEvents = 'none';
        this.button.innerHTML = '<span class="material-symbols-outlined">menu</span>';
        document.body.style.overflow = '';
    },

    toggle() {
        const sidebar = document.querySelector('sadec-sidebar');
        if (!sidebar) return;

        // Check if sidebar is open using the public method
        if (sidebar.isOpen && sidebar.isOpen()) {
            this.close();
        } else {
            this.open();
        }
    }
};

// Auto-init when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure sidebar component is mounted
    setTimeout(() => MobileMenu.init(), 100);
});

// Export
window.MobileMenu = MobileMenu;

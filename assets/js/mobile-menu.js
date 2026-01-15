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
        console.log('📱 Mobile Menu initialized');
    },

    createHamburgerButton() {
        // Check if button already exists
        if (document.querySelector('.mobile-menu-btn')) return;

        this.button = document.createElement('button');
        this.button.className = 'mobile-menu-btn';
        this.button.innerHTML = '<span class="material-symbols-outlined">menu</span>';
        this.button.setAttribute('aria-label', 'Toggle Menu');

        // Add styles
        this.button.style.cssText = `
            position: fixed;
            top: 16px;
            left: 16px;
            z-index: 999;
            width: 48px;
            height: 48px;
            border-radius: 12px;
            background: rgba(15, 23, 42, 0.95);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #00f0ff;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            transition: all 0.2s ease;
        `;

        document.body.appendChild(this.button);
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
        if (sidebar) sidebar.open();

        this.overlay.style.opacity = '1';
        this.overlay.style.pointerEvents = 'auto';
        this.button.innerHTML = '<span class="material-symbols-outlined">close</span>';
        document.body.style.overflow = 'hidden';
    },

    close() {
        const sidebar = document.querySelector('sadec-sidebar');
        if (sidebar) sidebar.close();

        this.overlay.style.opacity = '0';
        this.overlay.style.pointerEvents = 'none';
        this.button.innerHTML = '<span class="material-symbols-outlined">menu</span>';
        document.body.style.overflow = '';
    },

    toggle() {
        const sidebar = document.querySelector('sadec-sidebar');
        if (!sidebar) return;

        const sidebarEl = sidebar.shadowRoot?.querySelector('.sidebar-glass');
        if (sidebarEl?.classList.contains('open')) {
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

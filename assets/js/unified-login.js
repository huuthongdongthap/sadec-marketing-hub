/**
 * ═══════════════════════════════════════════════════════════════════════════
 * UNIFIED-LOGIN.JS - Universal Login Dropdown Controller
 * Mekong Marketing Hub - Consolidated Auth Entry Point
 * ═══════════════════════════════════════════════════════════════════════════
 */

const UnifiedLogin = {
    dropdownOpen: false,

    // Initialize dropdown functionality
    init() {
        this.setupDropdown();
        this.setupClickOutside();
        this.highlightCurrentPortal();
    },

    // Setup dropdown toggle
    setupDropdown() {
        const toggle = document.getElementById('loginToggle');
        const options = document.getElementById('loginOptions');

        if (!toggle || !options) return;

        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.dropdownOpen = !this.dropdownOpen;
            options.classList.toggle('active', this.dropdownOpen);
            toggle.classList.toggle('active', this.dropdownOpen);
        });
    },

    // Close dropdown when clicking outside
    setupClickOutside() {
        document.addEventListener('click', (e) => {
            const dropdown = document.querySelector('.unified-login-dropdown');
            if (dropdown && !dropdown.contains(e.target)) {
                this.closeDropdown();
            }
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeDropdown();
            }
        });
    },

    // Close dropdown
    closeDropdown() {
        const options = document.getElementById('loginOptions');
        const toggle = document.getElementById('loginToggle');
        if (options) options.classList.remove('active');
        if (toggle) toggle.classList.remove('active');
        this.dropdownOpen = false;
    },

    // Highlight current portal based on URL
    highlightCurrentPortal() {
        const path = window.location.pathname;
        const options = document.querySelectorAll('.login-option');

        options.forEach(opt => {
            const href = opt.getAttribute('href');
            if (href && path.includes(href.replace('.html', ''))) {
                opt.classList.add('current');
            }
        });
    },

    // Auto-detect user type from email
    detectUserType(email) {
        if (!email) return 'client';

        const domain = email.split('@')[1]?.toLowerCase();

        // Staff domains
        if (domain === 'mekongmarketing.com' || domain === 'mekong.agency') {
            return 'staff';
        }

        // Affiliate pattern
        if (email.includes('affiliate') || email.includes('partner')) {
            return 'affiliate';
        }

        return 'client';
    },

    // Get appropriate login URL based on user type
    getLoginUrl(userType) {
        const urls = {
            staff: '/login.html',
            client: '/portal/login.html',
            affiliate: '/register.html?type=affiliate'
        };
        return urls[userType] || '/login.html';
    },

    // Quick login with email pre-detection
    quickLogin(email) {
        const type = this.detectUserType(email);
        const url = this.getLoginUrl(type);
        window.location.href = `${url}?email=${encodeURIComponent(email)}`;
    }
};

// Auto-init on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    UnifiedLogin.init();
});

// Export
window.UnifiedLogin = UnifiedLogin;

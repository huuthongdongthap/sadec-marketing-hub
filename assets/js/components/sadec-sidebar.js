/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SADEC-SIDEBAR Web Component
 * Sa Đéc Marketing Hub - Phase 3 UI Componentization
 * 
 * Usage:
 *   <sadec-sidebar active="dashboard"></sadec-sidebar>
 * 
 * Attributes:
 *   active - Current page identifier (dashboard, campaigns, leads, etc.)
 * ═══════════════════════════════════════════════════════════════════════════
 */

class SadecSidebar extends HTMLElement {
    // Navigation items configuration
    static MENU_ITEMS = [
        { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', href: 'dashboard.html' },
        { id: 'campaigns', label: 'Campaigns', icon: 'campaign', href: 'campaigns.html' },
        { id: 'leads', label: 'Leads CRM', icon: 'group', href: 'leads.html' },
        { id: 'pipeline', label: 'Pipeline', icon: 'filter_alt', href: 'pipeline.html' },
        { id: 'finance', label: 'Finance', icon: 'payments', href: 'finance.html' }
    ];

    static MODULE_ITEMS = [
        { id: 'lms', label: 'Academy LMS', icon: 'school', href: 'lms.html' },
        { id: 'content', label: 'Content AI', icon: 'calendar_month', href: 'content-calendar.html' },
        { id: 'binh-phap', label: 'Binh Pháp', icon: 'psychology', href: 'binh-phap.html' },
        { id: 'workflows', label: 'Workflows', icon: 'alt_route', href: 'workflows.html' }
    ];

    static EXTRA_ITEMS = [
        { id: 'community', label: 'Community', icon: 'groups', href: 'community.html' },
        { id: 'auth', label: 'Auth & Users', icon: 'admin_panel_settings', href: 'auth.html' }
    ];

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const activePage = this.getAttribute('active') || this.detectActivePage();
        const collapsed = this.hasAttribute('collapsed');

        this.shadowRoot.innerHTML = this.getTemplate(activePage, collapsed);
        this.setupEventListeners();
    }

    // Auto-detect current page from URL
    detectActivePage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop().replace('.html', '');
        return filename || 'dashboard';
    }

    getTemplate(activePage, collapsed) {
        return `
            <style>
                ${this.getStyles()}
            </style>
            <aside class="sidebar-glass ${collapsed ? 'collapsed' : ''}">
                <div class="nav-header">
                    <h2 class="logo">MEKONG<br>AGENCY</h2>
                    <div class="nav-version">EST. 2026</div>
                </div>
                
                <nav>
                    <div class="nav-section-label">MENU</div>
                    ${this.renderNavItems(SadecSidebar.MENU_ITEMS, activePage)}
                    
                    <div class="nav-section-label" style="margin-top: 24px;">MODULES</div>
                    ${this.renderNavItems(SadecSidebar.MODULE_ITEMS, activePage)}
                    
                    <div class="nav-section-label" style="margin-top: 24px;">SYSTEM</div>
                    ${this.renderNavItems(SadecSidebar.EXTRA_ITEMS, activePage)}
                </nav>
                
                <div class="sidebar-footer">
                    <button class="collapse-btn" title="Toggle Sidebar">
                        <span class="material-symbols-outlined">chevron_left</span>
                    </button>
                </div>
            </aside>
        `;
    }

    renderNavItems(items, activePage) {
        return items.map(item => `
            <a href="${item.href}" 
               class="nav-item ${activePage === item.id ? 'active' : ''}"
               data-page="${item.id}">
                <span class="material-symbols-outlined">${item.icon}</span>
                <span class="nav-label">${item.label}</span>
            </a>
        `).join('');
    }

    getStyles() {
        return `
            :host {
                display: block;
                height: 100vh;
                position: sticky;
                top: 0;
            }
            
            .sidebar-glass {
                height: 100%;
                width: 280px;
                padding: 30px 20px;
                background: linear-gradient(180deg, 
                    rgba(15, 23, 42, 0.95) 0%, 
                    rgba(30, 41, 59, 0.9) 100%);
                backdrop-filter: blur(20px);
                border-right: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                flex-direction: column;
                transition: width 0.3s ease;
                overflow-y: auto;
            }
            
            .sidebar-glass.collapsed {
                width: 80px;
            }
            
            .collapsed .nav-label,
            .collapsed .nav-section-label,
            .collapsed .nav-version,
            .collapsed .logo br {
                display: none;
            }
            
            .nav-header {
                padding-bottom: 30px;
                text-align: center;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                margin-bottom: 20px;
            }
            
            .logo {
                font-family: 'Space Grotesk', sans-serif;
                font-size: 24px;
                font-weight: 700;
                letter-spacing: 2px;
                background: linear-gradient(135deg, #00f0ff, #00a8ff);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin: 0;
            }
            
            .nav-version {
                font-size: 11px;
                color: rgba(255, 255, 255, 0.4);
                margin-top: 8px;
                letter-spacing: 3px;
            }
            
            .nav-section-label {
                font-size: 11px;
                font-weight: 600;
                color: rgba(255, 255, 255, 0.4);
                padding: 0 12px;
                margin-bottom: 8px;
                letter-spacing: 1px;
            }
            
            nav {
                flex: 1;
            }
            
            .nav-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 16px;
                margin: 4px 0;
                border-radius: 12px;
                color: rgba(255, 255, 255, 0.7);
                text-decoration: none;
                font-size: 14px;
                font-weight: 500;
                transition: all 0.2s ease;
                position: relative;
                overflow: hidden;
            }
            
            .nav-item:hover {
                background: rgba(255, 255, 255, 0.08);
                color: #fff;
            }
            
            .nav-item.active {
                background: linear-gradient(135deg, 
                    rgba(0, 240, 255, 0.15), 
                    rgba(0, 168, 255, 0.1));
                color: #00f0ff;
                border: 1px solid rgba(0, 240, 255, 0.3);
            }
            
            .nav-item.active::before {
                content: '';
                position: absolute;
                left: 0;
                top: 50%;
                transform: translateY(-50%);
                width: 3px;
                height: 60%;
                background: #00f0ff;
                border-radius: 0 2px 2px 0;
            }
            
            .nav-item .material-symbols-outlined {
                font-size: 20px;
            }
            
            .sidebar-footer {
                margin-top: auto;
                padding-top: 20px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .collapse-btn {
                width: 100%;
                padding: 10px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                color: rgba(255, 255, 255, 0.6);
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .collapse-btn:hover {
                background: rgba(255, 255, 255, 0.1);
                color: #fff;
            }
            
            .collapsed .collapse-btn .material-symbols-outlined {
                transform: rotate(180deg);
            }
            
            /* Mobile responsive */
            @media (max-width: 1024px) {
                .sidebar-glass {
                    position: fixed;
                    left: -100%;
                    z-index: 1000;
                    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.5);
                }
                
                .sidebar-glass.open {
                    left: 0;
                }
            }
        `;
    }

    setupEventListeners() {
        // Collapse button
        const collapseBtn = this.shadowRoot.querySelector('.collapse-btn');
        if (collapseBtn) {
            collapseBtn.addEventListener('click', () => {
                const sidebar = this.shadowRoot.querySelector('.sidebar-glass');
                sidebar.classList.toggle('collapsed');
                this.dispatchEvent(new CustomEvent('sidebar-toggle', {
                    detail: { collapsed: sidebar.classList.contains('collapsed') }
                }));
            });
        }
    }

    // Public methods
    open() {
        this.shadowRoot.querySelector('.sidebar-glass').classList.add('open');
    }

    close() {
        this.shadowRoot.querySelector('.sidebar-glass').classList.remove('open');
    }

    toggle() {
        this.shadowRoot.querySelector('.sidebar-glass').classList.toggle('open');
    }
}

// Register the custom element
customElements.define('sadec-sidebar', SadecSidebar);

// Export for global use
window.SadecSidebar = SadecSidebar;

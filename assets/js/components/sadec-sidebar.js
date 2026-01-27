/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SADEC-SIDEBAR Web Component
 * Sa Đéc Marketing Hub - Phase 3 UI Componentization
 *
 * Usage:
 *   <sadec-sidebar active="dashboard" role="affiliate"></sadec-sidebar>
 *
 * Attributes:
 *   active - Current page identifier (dashboard, campaigns, leads, etc.)
 *   role - 'admin' (default) or 'affiliate'
 * ═══════════════════════════════════════════════════════════════════════════
 */

class SadecSidebar extends HTMLElement {
    // MVP mode - show only core items
    static MVP_ITEMS = [
        'dashboard', 'pipeline', 'leads', 'proposals',
        'campaigns', 'content-calendar', 'finance',
        'onboarding', 'workflows', 'binh-phap',
        'lms', 'docs', 'auth'
    ];

    // Affiliate menu items
    static AFFILIATE_SECTIONS = {
        overview: {
            label: '📊 TỔNG QUAN',
            items: [
                { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', href: '/affiliate/dashboard.html' },
                { id: 'referrals', label: 'Giới thiệu', icon: 'group_add', href: '/affiliate/referrals.html' },
                { id: 'commissions', label: 'Hoa hồng', icon: 'payments', href: '/affiliate/commissions.html' }
            ]
        },
        tools: {
            label: '🛠️ CÔNG CỤ',
            items: [
                { id: 'links', label: 'Link Builder', icon: 'link', href: '/affiliate/links.html' },
                { id: 'media', label: 'Media Kit', icon: 'perm_media', href: '/affiliate/media.html' }
            ]
        },
        account: {
            label: '👤 TÀI KHOẢN',
            items: [
                { id: 'profile', label: 'Hồ sơ', icon: 'person', href: '/affiliate/profile.html' },
                { id: 'settings', label: 'Cài đặt', icon: 'settings', href: '/affiliate/settings.html' }
            ]
        }
    };

    // Client Portal menu items
    static CLIENT_SECTIONS = {
        main: {
            label: 'MENU CHÍNH',
            items: [
                { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', href: '/portal/dashboard.html' },
                { id: 'projects', label: 'Dự án', icon: 'folder_open', href: '/portal/projects.html' },
                { id: 'invoices', label: 'Hóa đơn', icon: 'receipt_long', href: '/portal/invoices.html' },
                { id: 'subscriptions', label: 'Gói dịch vụ', icon: 'card_membership', href: '/portal/subscriptions.html' }
            ]
        },
        reports: {
            label: 'BÁO CÁO',
            items: [
                { id: 'analytics', label: 'Phân tích', icon: 'analytics', href: '/portal/reports.html' },
                { id: 'reports', label: 'Báo cáo', icon: 'description', href: '/portal/reports.html' }
            ]
        },
        support: {
            label: 'HỖ TRỢ',
            items: [
                { id: 'support', label: 'Liên hệ hỗ trợ', icon: 'support_agent', href: '#' },
                { id: 'settings', label: 'Cài đặt', icon: 'settings', href: '#' }
            ]
        }
    };

    // Navigation items configuration - ALL 31 ADMIN PAGES
    static MENU_SECTIONS = {
        dashboard: {
            label: '📊 DASHBOARD',
            items: [
                { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', href: '/admin/dashboard.html' }
            ]
        },
        sales: {
            label: '💼 SALES & CRM',
            items: [
                { id: 'pipeline', label: 'Pipeline', icon: 'filter_alt', href: '/admin/pipeline.html' },
                { id: 'leads', label: 'Leads CRM', icon: 'group', href: '/admin/leads.html' },
                { id: 'proposals', label: 'Proposals', icon: 'description', href: '/admin/proposals.html' },
                { id: 'pricing', label: 'Pricing', icon: 'sell', href: '/admin/pricing.html' },
                { id: 'ecommerce', label: 'E-commerce', icon: 'shopping_cart', href: '/admin/ecommerce.html' }
            ]
        },
        marketing: {
            label: '📣 MARKETING',
            items: [
                { id: 'campaigns', label: 'Campaigns', icon: 'campaign', href: '/admin/campaigns.html' },
                { id: 'landing-builder', label: 'Landing Pages', icon: 'web', href: '/admin/landing-builder.html' },
                { id: 'zalo', label: 'Zalo OA', icon: 'chat', href: '/admin/zalo.html' },
                { id: 'content-calendar', label: 'Content AI', icon: 'calendar_month', href: '/admin/content-calendar.html' },
                { id: 'community', label: 'Community', icon: 'groups', href: '/admin/community.html' },
                { id: 'events', label: 'Events', icon: 'event', href: '/admin/events.html' }
            ]
        },
        finance: {
            label: '💰 FINANCE',
            items: [
                { id: 'finance', label: 'Finance', icon: 'payments', href: '/admin/finance.html' },
                { id: 'payments', label: 'Payments', icon: 'credit_card', href: '/admin/payments.html' }
            ]
        },
        customers: {
            label: '👥 CUSTOMERS',
            items: [
                { id: 'onboarding', label: 'Onboarding', icon: 'start', href: '/admin/onboarding.html' },
                { id: 'customer-success', label: 'Success', icon: 'thumb_up', href: '/admin/customer-success.html' },
                { id: 'retention', label: 'Retention', icon: 'loyalty', href: '/admin/retention.html' }
            ]
        },
        automation: {
            label: '🤖 AUTOMATION',
            items: [
                { id: 'workflows', label: 'Workflows', icon: 'alt_route', href: '/admin/workflows.html' },
                { id: 'agents', label: 'AI Agents', icon: 'smart_toy', href: '/admin/agents.html' },
                { id: 'approvals', label: 'Approvals', icon: 'approval', href: '/admin/approvals.html' }
            ]
        },
        strategy: {
            label: '🎯 STRATEGY',
            items: [
                { id: 'binh-phap', label: 'Binh Pháp', icon: 'psychology', href: '/admin/binh-phap.html' },
                { id: 'ai-analysis', label: 'AI Analysis', icon: 'insights', href: '/admin/ai-analysis.html' },
                { id: 'vc-readiness', label: 'VC Readiness', icon: 'trending_up', href: '/admin/vc-readiness.html' }
            ]
        },
        content: {
            label: '📚 CONTENT',
            items: [
                { id: 'lms', label: 'Academy LMS', icon: 'school', href: '/admin/lms.html' },
                { id: 'brand-guide', label: 'Brand Guide', icon: 'palette', href: '/admin/brand-guide.html' },
                { id: 'video-workflow', label: 'Video', icon: 'videocam', href: '/admin/video-workflow.html' },
                { id: 'docs', label: 'Docs', icon: 'article', href: '/admin/docs.html' }
            ]
        },
        system: {
            label: '⚙️ SYSTEM',
            items: [
                { id: 'auth', label: 'Auth & Users', icon: 'admin_panel_settings', href: '/admin/auth.html' },
                { id: 'hr-hiring', label: 'HR & Hiring', icon: 'badge', href: '/admin/hr-hiring.html' },
                { id: 'legal', label: 'Legal', icon: 'gavel', href: '/admin/legal.html' },
                { id: 'api-builder', label: 'API Builder', icon: 'api', href: '/admin/api-builder.html' },
                { id: 'deploy', label: 'Deploy', icon: 'rocket_launch', href: '/admin/deploy.html' },
                { id: 'mvp-launch', label: 'MVP Launch', icon: 'flag', href: '/admin/mvp-launch.html' }
            ]
        }
    };

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const activePage = this.getAttribute('active') || this.detectActivePage();
        const collapsed = this.hasAttribute('collapsed');
        // Determine role: explicit attribute OR detect from path OR auth state
        const role = this.getAttribute('role') || this.detectRole() || 'admin';
        const mode = this.getAttribute('mode') || 'mvp'; // 'mvp' or 'full'

        this.shadowRoot.innerHTML = this.getTemplate(activePage, collapsed, mode, role);
        this.setupEventListeners();
    }

    // Auto-detect current page from URL
    detectActivePage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop().replace('.html', '');
        return filename || 'dashboard';
    }

    // Auto-detect role from URL or Auth
    detectRole() {
        if (window.location.pathname.startsWith('/affiliate')) return 'affiliate';
        if (window.location.pathname.startsWith('/portal')) return 'client';
        if (window.location.pathname.startsWith('/admin')) return 'admin';
        // Fallback to Auth state if available
        if (window.Auth && window.Auth.State && window.Auth.State.getRole) {
            return window.Auth.State.getRole();
        }
        return null;
    }

    getTemplate(activePage, collapsed, mode, role) {
        const titleMap = {
            affiliate: 'Partner Hub',
            client: 'Client Portal',
            admin: 'AgencyOS 2026'
        };

        return `
            <style>
                ${this.getStyles()}
            </style>
            <aside class="sidebar-glass ${collapsed ? 'collapsed' : ''} ${role}">
                <div class="nav-header">
                    <h2 class="logo">MEKONG<br>AGENCY</h2>
                    <div class="nav-version">${titleMap[role] || 'AgencyOS 2026'}</div>
                </div>

                <nav>
                    ${this.renderAllSections(activePage, mode, role)}
                </nav>

                <div class="sidebar-footer">
                    <button class="collapse-btn" title="Toggle Sidebar">
                        <span class="material-symbols-outlined">chevron_left</span>
                    </button>
                    <!-- Logout button for affiliate -->
                    <a href="#" onclick="window.Auth?.Actions?.signOut()" class="nav-item logout-btn" style="color: #ff6b6b; margin-top: 8px;">
                        <span class="material-symbols-outlined">logout</span>
                        <span class="nav-label">Đăng xuất</span>
                    </a>
                </div>
            </aside>
        `;
    }

    renderAllSections(activePage, mode, role) {
        // Choose sections based on role
        let sectionsMap;
        if (role === 'affiliate') sectionsMap = SadecSidebar.AFFILIATE_SECTIONS;
        else if (role === 'client') sectionsMap = SadecSidebar.CLIENT_SECTIONS;
        else sectionsMap = SadecSidebar.MENU_SECTIONS;

        return Object.values(sectionsMap).map(section => {
            // Filter items based on mode (only for admin)
            let visibleItems = section.items;
            if (role === 'admin' && mode === 'mvp') {
                visibleItems = section.items.filter(item => SadecSidebar.MVP_ITEMS.includes(item.id));
            }

            // Skip empty sections
            if (visibleItems.length === 0) return '';

            return `
                <div class="nav-section">
                    <div class="nav-section-label">${section.label}</div>
                    ${visibleItems.map(item => `
                        <a href="${item.href}"
                           class="nav-item ${activePage === item.id ? 'active' : ''}"
                           data-page="${item.id}">
                            <span class="material-symbols-outlined">${item.icon}</span>
                            <span class="nav-label">${item.label}</span>
                        </a>
                    `).join('')}
                </div>
            `;
        }).join('');
    }

    getStyles() {
        return `
            /* Import Material Symbols font for Shadow DOM */
            @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');

            :host {
                display: block;
                height: 100vh;
                position: sticky;
                top: 0;
            }

            .material-symbols-outlined {
                font-family: 'Material Symbols Outlined';
                font-weight: normal;
                font-style: normal;
                font-size: 20px;
                display: inline-block;
                line-height: 1;
                text-transform: none;
                letter-spacing: normal;
                word-wrap: normal;
                white-space: nowrap;
                direction: ltr;
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

            /* Affiliate Theme Variation */
            .sidebar-glass.affiliate {
                background: linear-gradient(180deg,
                    rgba(0, 60, 50, 0.95) 0%,
                    rgba(0, 40, 30, 0.9) 100%);
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

            /* Affiliate Logo Color */
            .affiliate .logo {
                background: linear-gradient(135deg, #FFD700, #FFA000);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
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
                box-shadow: 
                    inset 4px 0 20px rgba(0, 240, 255, 0.15),
                    0 0 25px rgba(0, 240, 255, 0.1);
                animation: sidebarActiveGlow 2s ease-in-out infinite alternate;
            }

            @keyframes sidebarActiveGlow {
                from {
                    box-shadow: 
                        inset 4px 0 20px rgba(0, 240, 255, 0.15),
                        0 0 20px rgba(0, 240, 255, 0.1);
                }
                to {
                    box-shadow: 
                        inset 4px 0 30px rgba(0, 240, 255, 0.25),
                        0 0 35px rgba(0, 240, 255, 0.2);
                }
            }

            /* Affiliate Active State */
            .affiliate .nav-item.active {
                background: linear-gradient(135deg,
                    rgba(255, 215, 0, 0.15),
                    rgba(255, 160, 0, 0.1));
                color: #FFD700;
                border: 1px solid rgba(255, 215, 0, 0.3);
                box-shadow: 
                    inset 4px 0 20px rgba(255, 215, 0, 0.15),
                    0 0 25px rgba(255, 215, 0, 0.1);
                animation: affiliateActiveGlow 2s ease-in-out infinite alternate;
            }

            @keyframes affiliateActiveGlow {
                from {
                    box-shadow: 
                        inset 4px 0 20px rgba(255, 215, 0, 0.15),
                        0 0 20px rgba(255, 215, 0, 0.1);
                }
                to {
                    box-shadow: 
                        inset 4px 0 30px rgba(255, 215, 0, 0.25),
                        0 0 35px rgba(255, 215, 0, 0.2);
                }
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

            .affiliate .nav-item.active::before {
                background: #FFD700;
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
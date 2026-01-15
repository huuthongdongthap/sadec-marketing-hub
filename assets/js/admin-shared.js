/**
 * ADMIN SHARED - Max Level 2026
 * Unified functionality for all admin pages
 */

// ============================================
// TOAST NOTIFICATIONS
// ============================================
class Toast {
    static container = null;

    static init() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    }

    static show(message, type = 'info', duration = 4000) {
        this.init();

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
      <span class="material-symbols-outlined">${this.getIcon(type)}</span>
      <span>${message}</span>
    `;

        this.container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'toast-out 0.3s forwards';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    static getIcon(type) {
        const icons = {
            success: 'check_circle',
            error: 'error',
            info: 'info',
            warning: 'warning'
        };
        return icons[type] || 'info';
    }

    static success(msg) { this.show(msg, 'success'); }
    static error(msg) { this.show(msg, 'error'); }
    static info(msg) { this.show(msg, 'info'); }
    static warning(msg) { this.show(msg, 'warning'); }
}

// ============================================
// THEME MANAGER
// ============================================
class ThemeManager {
    static STORAGE_KEY = 'mekong-theme';

    static init() {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
            document.documentElement.setAttribute('data-theme', saved);
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }

    static toggle() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem(this.STORAGE_KEY, next);
        Toast.info(`Theme switched to ${next} mode`);
        return next;
    }

    static get() {
        return document.documentElement.getAttribute('data-theme') || 'light';
    }
}

// ============================================
// SCROLL PROGRESS
// ============================================
class ScrollProgress {
    static init() {
        const progress = document.createElement('div');
        progress.className = 'scroll-progress';
        document.body.prepend(progress);

        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) : 0;
            progress.style.transform = `scaleX(${scrollPercent})`;
        });
    }
}

// ============================================
// MOBILE SIDEBAR
// ============================================
class MobileSidebar {
    static init() {
        const sidebar = document.querySelector('.sidebar-glass');
        if (!sidebar || window.innerWidth > 768) return;

        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);

        // Create menu button
        const menuBtn = document.createElement('button');
        menuBtn.className = 'mobile-menu-btn';
        menuBtn.innerHTML = '<span class="material-symbols-outlined">menu</span>';
        document.body.appendChild(menuBtn);

        menuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('active');
        });

        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        });
    }
}

// ============================================
// DASHBOARD CHARTS (Chart.js Integration)
// ============================================
class DashboardCharts {
    static colors = {
        primary: '#006A60',
        secondary: '#9C6800',
        tertiary: '#6750A4',
        surface: '#FAFDFC',
        cyan: '#00F0FF',
        purple: '#BC13FE',
        lime: '#CCFF00'
    };

    static async init() {
        // Load Chart.js if not already loaded
        if (typeof Chart === 'undefined') {
            await this.loadChartJS();
        }
    }

    static loadChartJS() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    static createRevenueChart(canvasId, data = null) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        const defaultData = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Revenue (VND)',
                data: [180, 220, 280, 350, 420, 480],
                borderColor: this.colors.cyan,
                backgroundColor: `${this.colors.cyan}20`,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: this.colors.cyan,
                pointBorderColor: '#fff',
                pointRadius: 6
            }]
        };

        return new Chart(ctx, {
            type: 'line',
            data: data || defaultData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: { grid: { display: false }, ticks: { color: '#a1a1aa' } },
                    y: { grid: { color: '#ffffff10' }, ticks: { color: '#a1a1aa' } }
                }
            }
        });
    }

    static createLeadsChart(canvasId, data = null) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        const defaultData = {
            labels: ['Facebook', 'Google', 'Zalo', 'Website', 'Referral'],
            datasets: [{
                data: [35, 25, 20, 12, 8],
                backgroundColor: [
                    '#4267B2', '#34A853', '#0068FF', this.colors.primary, this.colors.secondary
                ],
                borderWidth: 0
            }]
        };

        return new Chart(ctx, {
            type: 'doughnut',
            data: data || defaultData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'right', labels: { color: '#a1a1aa' } }
                },
                cutout: '70%'
            }
        });
    }
}

// ============================================
// SEARCH FUNCTIONALITY
// ============================================
class GlobalSearch {
    static pages = [
        { name: 'Dashboard', url: 'dashboard.html', icon: 'dashboard' },
        { name: 'Campaigns', url: 'campaigns.html', icon: 'campaign' },
        { name: 'Leads CRM', url: 'leads.html', icon: 'group' },
        { name: 'Finance', url: 'finance.html', icon: 'payments' },
        { name: 'Academy LMS', url: 'lms.html', icon: 'school' },
        { name: 'Content Calendar', url: 'content-calendar.html', icon: 'calendar_month' },
        { name: 'Pipeline', url: 'pipeline.html', icon: 'timeline' },
        { name: 'Proposals', url: 'proposals.html', icon: 'description' },
        { name: 'Events', url: 'events.html', icon: 'event' },
        { name: 'HR & Hiring', url: 'hr-hiring.html', icon: 'badge' },
        { name: 'Binh Phap', url: 'binh-phap.html', icon: 'military_tech' }
    ];

    static init() {
        const searchInput = document.querySelector('.search-glass input');
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const matches = this.search(searchInput.value);
                if (matches.length > 0) {
                    window.location.href = matches[0].url;
                }
            }
        });
    }

    static search(query) {
        if (!query) return [];
        const q = query.toLowerCase();
        return this.pages.filter(p => p.name.toLowerCase().includes(q));
    }

    static handleSearch(query) {
        // Could show dropdown results here
        // console.debug('Search:', query, this.search(query));
    }
}

// ============================================
// SUPABASE LIVE DATA
// ============================================
class LiveData {
    static supabase = null;

    static init(supabaseClient) {
        this.supabase = supabaseClient;
    }

    static async getStats() {
        if (!this.supabase) return this.getMockStats();

        try {
            const [leads, clients, campaigns, invoices, deals] = await Promise.all([
                this.supabase.from('leads').select('id, status', { count: 'exact' }),
                this.supabase.from('clients').select('id', { count: 'exact' }),
                this.supabase.from('campaigns').select('id, status, budget', { count: 'exact' }),
                this.supabase.from('invoices').select('id, amount, status'),
                this.supabase.from('deals').select('id, value, stage, probability')
            ]);

            // Calculate revenue from paid invoices
            const paidInvoices = invoices.data?.filter(i => i.status === 'paid') || [];
            const totalRevenue = paidInvoices.reduce((sum, i) => sum + (i.amount || 0), 0);

            // Calculate pipeline value
            const pipelineDeals = deals.data?.filter(d => d.stage !== 'lost') || [];
            const pipelineValue = pipelineDeals.reduce((sum, d) => sum + (d.value || 0) * (d.probability || 50) / 100, 0);

            // Active campaigns
            const activeCampaigns = campaigns.data?.filter(c => c.status === 'active') || [];

            return {
                totalRevenue: totalRevenue,
                pipelineValue: pipelineValue,
                activeClients: clients.count || 0,
                totalLeads: leads.count || 0,
                hotLeads: leads.data?.filter(l => l.status === 'hot').length || 0,
                campaigns: campaigns.count || 0,
                activeCampaigns: activeCampaigns.length,
                totalDeals: deals.data?.length || 0,
                wonDeals: deals.data?.filter(d => d.stage === 'won').length || 0
            };
        } catch (err) {
            console.error('LiveData error:', err);
            return this.getMockStats();
        }
    }

    static getMockStats() {
        return {
            totalRevenue: 2400000000,
            pipelineValue: 450000000,
            activeClients: 142,
            totalLeads: 856,
            hotLeads: 24,
            campaigns: 45,
            activeCampaigns: 12,
            totalDeals: 28,
            wonDeals: 8
        };
    }

    static formatCurrency(amount) {
        if (amount >= 1000000000) {
            return (amount / 1000000000).toFixed(1) + 'B VNĐ';
        } else if (amount >= 1000000) {
            return (amount / 1000000).toFixed(0) + 'M VNĐ';
        }
        return amount.toLocaleString('vi-VN') + ' VNĐ';
    }

    static async bindDashboard() {
        const stats = await this.getStats();

        // Bind to dashboard elements
        const bindings = {
            'stat-revenue': this.formatCurrency(stats.totalRevenue),
            'stat-pipeline': this.formatCurrency(stats.pipelineValue),
            'stat-clients': stats.activeClients,
            'stat-leads': stats.totalLeads,
            'stat-hot-leads': stats.hotLeads,
            'stat-campaigns': stats.campaigns,
            'stat-deals': stats.totalDeals,
            'stat-won': stats.wonDeals
        };

        Object.entries(bindings).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        });

        return stats;
    }
}

// ============================================
// INITIALIZE ALL MODULES
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
    ScrollProgress.init();
    MobileSidebar.init();
    GlobalSearch.init();

    // Show welcome toast
    const pageName = document.title.split(' - ')[1] || 'Dashboard';
    // Toast.info(`Welcome to ${pageName}`);
});

// Export for use in other scripts
window.MekongAdmin = {
    Toast,
    ThemeManager,
    DashboardCharts,
    LiveData,
    GlobalSearch
};

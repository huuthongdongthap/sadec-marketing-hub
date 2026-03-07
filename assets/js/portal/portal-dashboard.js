/**
 * Portal Dashboard Module
 * Dashboard Loading & Stats Display
 */

import { DEMO_PROJECTS } from './portal-data.js';
import { supabase } from './supabase.js';
import { formatCurrency, timeAgo } from './portal-utils.js';

// ================================================
// DASHBOARD LOADING
// ================================================

/**
 * Load dashboard statistics and data
 */
export async function loadDashboard() {
    try {
        // Check if we have access to BinhPhapAPI (from supabase-config.js)
        if (window.BinhPhapAPI) {
            const stats = await window.BinhPhapAPI.getDashboardStats();
            updateDashboardStats(stats);
            return;
        }

        // Fallback: Load from Supabase directly
        if (supabase) {
            const stats = await loadDashboardStats();
            updateDashboardStats(stats);
        }

        // Load activity feed
        await loadActivityFeed();
        await loadDeadlines();

    } catch (error) {
        console.error('Dashboard load error:', error);
        // Show demo data in case of error
        loadDemoDashboard();
    }
}

/**
 * Load dashboard stats from Supabase
 */
async function loadDashboardStats() {
    const [customers, projects, invoices, campaigns] = await Promise.all([
        supabase.from('customers').select('*', { count: 'exact', head: true }),
        supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('invoices').select('total, status').in('status', ['sent', 'overdue']),
        supabase.from('campaigns').select('*', { count: 'exact', head: true }).eq('status', 'active')
    ]);

    const pendingRevenue = invoices.data?.reduce((sum, i) => sum + (i.total || 0), 0) || 0;

    return {
        total_customers: customers.count || 0,
        active_projects: projects.count || 0,
        active_campaigns: campaigns.count || 0,
        pending_revenue: pendingRevenue
    };
}

/**
 * Update dashboard stats UI
 */
function updateDashboardStats(stats) {
    // Projects stat
    const elProjects = document.getElementById('stat-projects');
    const elTrendProjects = document.getElementById('trend-projects');
    if (elProjects) {
        elProjects.textContent = stats.active_projects || 0;
        if (elTrendProjects) {
            const trend = stats.project_trend || 0;
            elTrendProjects.textContent = trend > 0 ? `+${trend}%` : `${trend}%`;
            elTrendProjects.className = trend >= 0 ? 'trend-up' : 'trend-down';
        }
    }

    // Invoices stat
    const elInvoices = document.getElementById('stat-invoices');
    if (elInvoices) {
        elInvoices.textContent = formatCurrency(stats.pending_revenue || 0);
    }

    // Reach/Leads stats
    const elReach = document.getElementById('stat-reach');
    const elLeads = document.getElementById('stat-leads');
    const elTrendReach = document.getElementById('trend-reach');
    const elTrendLeads = document.getElementById('trend-leads');

    if (elReach) elReach.textContent = stats.reach || '—';
    if (elLeads) elLeads.textContent = stats.new_leads || 0;
    if (elTrendReach && stats.reach_trend) {
        elTrendReach.textContent = stats.reach_trend > 0 ? `+${stats.reach_trend}%` : `${stats.reach_trend}%`;
        elTrendReach.className = stats.reach_trend >= 0 ? 'trend-up' : 'trend-down';
    }
    if (elTrendLeads && stats.leads_trend) {
        elTrendLeads.textContent = stats.leads_trend > 0 ? `+${stats.leads_trend}%` : `${stats.leads_trend}%`;
        elTrendLeads.className = stats.leads_trend >= 0 ? 'trend-up' : 'trend-down';
    }
}

/**
 * Load demo dashboard data (for demo mode)
 */
export function loadDemoDashboard() {
    const demoStats = {
        active_projects: DEMO_PROJECTS.length,
        pending_revenue: DEMO_PROJECTS.reduce((sum, p) => sum + (p.budget - p.spent), 0),
        reach: '150.000',
        new_leads: 23,
        project_trend: 12,
        reach_trend: 8,
        leads_trend: -5
    };
    updateDashboardStats(demoStats);
    loadDemoActivityFeed();
    loadDemoDeadlines();
}

/**
 * Load activity feed
 */
export async function loadActivityFeed() {
    const elActivityList = document.getElementById('activity-list');
    if (!elActivityList) return;

    try {
        if (supabase) {
            const { data: activities, error } = await supabase
                .from('activity_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);

            if (error) throw error;
            if (activities && activities.length > 0) {
                renderActivityFeed(elActivityList, activities);
                return;
            }
        }

        // No activities or error - show demo
        loadDemoActivityFeed();
    } catch (error) {
        console.error('Activity feed load error:', error);
        loadDemoActivityFeed();
    }
}

/**
 * Render activity feed
 */
function renderActivityFeed(container, activities) {
    container.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon">${getActivityIcon(activity.type)}</div>
            <div class="activity-content">
                <p class="activity-text">${activity.description}</p>
                <p class="activity-time">${timeAgo(activity.created_at)}</p>
            </div>
        </div>
    `).join('');
}

/**
 * Load demo activity feed
 */
export function loadDemoActivityFeed() {
    const elActivityList = document.getElementById('activity-list');
    if (!elActivityList) return;

    const demoActivities = [
        { type: 'project', description: 'Dự án "Facebook Ads Q1" được cập nhật tiến độ', created_at: new Date().toISOString() },
        { type: 'invoice', description: 'Hóa đơn INV-2026-001 nhận thanh toán 5.000.000đ', created_at: new Date(Date.now() - 3600000).toISOString() },
        { type: 'campaign', description: 'Chiến dịch "Tết 2026" vượt ngân sách 10%', created_at: new Date(Date.now() - 7200000).toISOString() },
        { type: 'lead', description: 'Khách hàng mới: Nguyễn Văn E quan tâm đến SEO', created_at: new Date(Date.now() - 86400000).toISOString() },
        { type: 'project', description: 'Dự án "SEO Website" hoàn thành milestone On-page', created_at: new Date(Date.now() - 172800000).toISOString() }
    ];

    renderActivityFeed(elActivityList, demoActivities);
}

/**
 * Load deadlines
 */
export async function loadDeadlines() {
    const elDeadlines = document.getElementById('deadlines-list');
    if (!elDeadlines) return;

    try {
        if (supabase) {
            const { data: projects, error } = await supabase
                .from('projects')
                .select('name, end_date, status')
                .eq('status', 'active')
                .order('end_date', { ascending: true })
                .limit(5);

            if (error) throw error;
            if (projects && projects.length > 0) {
                renderDeadlines(elDeadlines, projects);
                return;
            }
        }

        loadDemoDeadlines();
    } catch (error) {
        console.error('Deadlines load error:', error);
        loadDemoDeadlines();
    }
}

/**
 * Render deadlines list
 */
function renderDeadlines(container, projects) {
    container.innerHTML = projects.map(project => {
        const daysLeft = Math.ceil((new Date(project.end_date) - new Date()) / (1000 * 60 * 60 * 24));
        const urgencyClass = daysLeft <= 3 ? 'urgent' : daysLeft <= 7 ? 'warning' : 'normal';

        return `
            <div class="deadline-item ${urgencyClass}">
                <span class="deadline-name">${project.name}</span>
                <span class="deadline-days">${daysLeft > 0 ? `${daysLeft} ngày` : 'Quá hạn'}</span>
            </div>
        `;
    }).join('');
}

/**
 * Load demo deadlines
 */
export function loadDemoDeadlines() {
    const elDeadlines = document.getElementById('deadlines-list');
    if (!elDeadlines) return;

    const demoDeadlines = [
        { name: 'SEO Website tháng 1', end_date: new Date(Date.now() + 5 * 86400000).toISOString() },
        { name: 'Thiết kế logo', end_date: new Date(Date.now() + 2 * 86400000).toISOString() },
        { name: 'Facebook Ads Q1', end_date: new Date(Date.now() + 15 * 86400000).toISOString() },
        { name: 'Google Ads Tết', end_date: new Date(Date.now() - 2 * 86400000).toISOString() }
    ];

    renderDeadlines(elDeadlines, demoDeadlines);
}

/**
 * Get activity icon by type
 */
function getActivityIcon(type) {
    const icons = {
        'project': '📁',
        'invoice': '💰',
        'campaign': '📢',
        'lead': '👤',
        'payment': '💳',
        'update': '🔄'
    };
    return icons[type] || '📌';
}

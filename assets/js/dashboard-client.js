/**
 * ==============================================
 * MEKONG AGENCY - DASHBOARD CLIENT
 * Main Command Center Logic - Live Data Aggregation
 * ==============================================
 */

import { invoices, clients, campaigns, deals, activities, utils } from './supabase.js';

// Format currency
function formatCurrency(amount) {
    if (!amount) return '0 VND';
    if (amount >= 1000000000) return (amount / 1000000000).toFixed(1) + 'B VND';
    if (amount >= 1000000) return (amount / 1000000).toFixed(1) + 'M VND';
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
}

function formatNumber(num) {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString('vi-VN');
}

// Load aggregated dashboard data
async function loadDashboardData() {
    try {
        console.log('🚀 Loading dashboard data...');

        // Parallel fetch for valid non-blocking load
        const [
            invoiceStats,
            clientList,
            campaignStats,
            dealStats,
            recentActivities
        ] = await Promise.all([
            invoices.getStats(),
            clients.getAll(),
            campaigns.getStats(),
            deals.getPipelineStats(),
            activities.getRecent(5)
        ]);

        // Process Revenue
        const totalRevenue = invoiceStats.data?.paid || 0;
        const revenueGrowth = 12.5; // Mock growth for now until we have historical data

        // Process Clients
        const activeClients = clientList.data?.length || 0;
        const newClientsThisWeek = 2; // Mock for now

        // Process Marketing (Impressions/Leads)
        // Note: We use Leads count as a proxy for "Performance" if impressions aren't tracked
        const totalLeads = campaignStats.data?.totalLeads || 0;

        // Process System Health (Deals Won Rate or Active Campaigns)
        const activeCampaigns = campaignStats.data?.active || 0;
        const totalCampaigns = campaignStats.data?.total || 1;
        const systemHealth = totalCampaigns > 0 ? (activeCampaigns / totalCampaigns * 100).toFixed(1) : 100;

        return {
            revenue: { value: totalRevenue, growth: revenueGrowth },
            clients: { value: activeClients, new: newClientsThisWeek },
            marketing: { value: totalLeads, label: 'Total Leads' }, // Overriding "Impressions"
            health: { value: systemHealth, label: 'Active Campaign Rate' },
            recentActivities: recentActivities.data || [],
            raw: { invoiceStats, campaignStats, dealStats } // For charts
        };

    } catch (error) {
        console.error('Dashboard data error:', error);
        return getDemoDashboardData();
    }
}

function getDemoDashboardData() {
    return {
        revenue: { value: 2400000000, growth: 12.5 },
        clients: { value: 142, new: 8 },
        marketing: { value: 8500000, label: 'Ad Impressions' },
        health: { value: 99.9, label: 'System Health' },
        recentActivities: [],
        raw: null
    };
}

// Bind data to DOM
async function bindDashboard() {
    const data = await loadDashboardData();

    // 1. Bind KPI Cards
    const safeSetText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.innerText = text;
    };

    safeSetText('stat-revenue', formatCurrency(data.revenue.value));
    safeSetText('stat-clients', data.clients.value);

    // Dynamically update label if we swapped metric
    safeSetText('stat-impressions', formatNumber(data.marketing.value));
    if (data.marketing.label !== 'Ad Impressions') {
        // Find label sibling
        const impVal = document.getElementById('stat-impressions');
        if (impVal && impVal.previousElementSibling) {
            impVal.previousElementSibling.innerText = data.marketing.label;
        }
    }

    safeSetText('stat-health', data.health.value + '%');
    if (data.health.label !== 'System Health') {
        const healthVal = document.getElementById('stat-health');
        if (healthVal && healthVal.previousElementSibling) {
            healthVal.previousElementSibling.innerText = data.health.label;
        }
    }

    // 2. Bind Recent Activity
    renderActivities(data.recentActivities);

    // 3. Render Charts (Lazy load)
    renderRevenueChart(data.raw?.invoiceStats?.data || null);

    return data;
}

function renderActivities(activities) {
    const container = document.getElementById('live-activity-list');
    if (!container) return;

    if (activities.length === 0) {
        container.innerHTML = '<div class="text-muted" style="padding:10px;">No recent activities</div>';
        return;
    }

    // Map entity types to colors
    const typeColors = {
        lead: 'var(--primary-cyan)',
        deal: 'var(--accent-lime)',
        invoice: 'var(--secondary-purple)',
        campaign: '#FF0055',
        project: '#FFAA00'
    };

    container.innerHTML = activities.map(act => `
        <div class="live-activity-item">
            <div style="width: 8px; height: 8px; background: ${typeColors[act.entity_type] || '#ccc'}; border-radius: 50%; box-shadow: 0 0 10px ${typeColors[act.entity_type] || '#ccc'};"></div>
            <div>
                <div class="title-small" style="font-weight: 600;">${act.action}</div>
                <div class="body-small text-muted">${act.description} • ${new Date(act.created_at).toLocaleTimeString('vi-VN')}</div>
            </div>
        </div>
    `).join('');
}

function renderRevenueChart(invoiceStats) {
    if (!window.MekongAdmin || !MekongAdmin.DashboardCharts) return;

    // If we have stats, we could try to construct a real timeline, 
    // but getStats() only returns aggregate. For now we stick to the nice demo chart 
    // or we could fetch invoices.getAll() to build a real timeline if needed.
    // Let's create a chart with "Real vs Target" mock split if we don't have timeline data.
    // For Sprint 1, we keep the demo chart visual but maybe update the total if possible.

    MekongAdmin.DashboardCharts.createRevenueChart('revenueChart');
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Wait for MekongAdmin shared lib to be ready
    setTimeout(() => {
        bindDashboard();
    }, 100);
});

export { loadDashboardData, bindDashboard };

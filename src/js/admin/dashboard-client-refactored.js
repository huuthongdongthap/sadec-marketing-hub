/**
 * ==============================================
 * MEKONG AGENCY - DASHBOARD CLIENT (Refactored)
 * Main Command Center Logic - Live Data Aggregation
 * @version 2.0.0 | 2026-03-13
 * ==============================================
 */

import { ApiClientBase, onReady, renderActivities, renderChart } from '../shared/api-client.js';
import { formatCurrencyVN } from '../shared/format-utils.js';
import { invoices, clients, campaigns, deals, activities } from '../api/supabase.js';

/**
 * Dashboard API Client
 */
class DashboardClient extends ApiClientBase {
  constructor() {
    super({
      moduleName: 'Dashboard',
      supabase: { invoices, clients, campaigns, deals, activities },
      demoDataFn: getDemoDashboardData
    });
  }

  /**
   * Load aggregated dashboard data
   * @returns {Promise<Object>} Dashboard data
   */
  async loadDashboardData() {
    return this.load('dashboard', async () => {
      // Parallel fetch for non-blocking load
      const [
        invoiceStats,
        clientList,
        campaignStats,
        dealStats,
        recentActivities
      ] = await Promise.all([
        this.supabase.invoices.getStats(),
        this.supabase.clients.getAll(),
        this.supabase.campaigns.getStats(),
        this.supabase.deals.getPipelineStats(),
        this.supabase.activities.getRecent(5)
      ]);

      // Process Revenue
      const totalRevenue = invoiceStats.data?.paid || 0;
      const revenueGrowth = 12.5; // Mock growth until historical data

      // Process Clients
      const activeClients = clientList.data?.length || 0;
      const newClientsThisWeek = 2; // Mock for now

      // Process Marketing (Leads as proxy for Performance)
      const totalLeads = campaignStats.data?.totalLeads || 0;

      // Process System Health
      const activeCampaigns = campaignStats.data?.active || 0;
      const totalCampaigns = campaignStats.data?.total || 1;
      const systemHealth = totalCampaigns > 0
        ? (activeCampaigns / totalCampaigns * 100).toFixed(1)
        : 100;

      return {
        revenue: { value: totalRevenue, growth: revenueGrowth },
        clients: { value: activeClients, new: newClientsThisWeek },
        marketing: { value: totalLeads, label: 'Total Leads' },
        health: { value: systemHealth, label: 'Active Campaign Rate' },
        recentActivities: recentActivities.data || [],
        raw: { invoiceStats, campaignStats, dealStats }
      };
    });
  }

  /**
   * Bind data to DOM elements
   * @returns {Promise<Object>} Dashboard data
   */
  async bindDashboard() {
    const data = await this.loadDashboardData();

    // Bind KPI Cards
    this.bind({
      'stat-revenue': formatCurrencyVN(data.revenue.value),
      'stat-clients': data.clients.value,
      'stat-impressions': data.marketing.value,
      'stat-health': `${data.health.value}%`
    });

    // Update labels dynamically
    if (data.marketing.label !== 'Ad Impressions') {
      const impVal = this.$('stat-impressions');
      if (impVal && impVal.previousElementSibling) {
        impVal.previousElementSibling.innerText = data.marketing.label;
      }
    }

    if (data.health.label !== 'System Health') {
      const healthVal = this.$('stat-health');
      if (healthVal && healthVal.previousElementSibling) {
        healthVal.previousElementSibling.innerText = data.health.label;
      }
    }

    // Render Recent Activity
    renderActivities(data.recentActivities, 'live-activity-list');

    // Render Charts
    renderChart('revenueChart', 'revenue', data.raw?.invoiceStats?.data || null);

    return data;
  }
}

/**
 * Demo dashboard data fallback
 * @returns {Object} Demo data
 */
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

// ============================================================================
// INITIALIZATION
// ============================================================================

// Create singleton instance
const dashboardClient = new DashboardClient();

// Auto-initialize on DOM ready
onReady(async () => {
  // Wait for MekongAdmin shared lib to be ready
  setTimeout(async () => {
    await dashboardClient.bindDashboard();
  }, 100);
});

// Export for external use
export { dashboardClient, DashboardClient };

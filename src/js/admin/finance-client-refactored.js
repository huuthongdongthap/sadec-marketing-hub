/**
 * ==============================================
 * MEKONG AGENCY - FINANCE CLIENT (Refactored)
 * Supabase Live Data Binding for Finance Module
 * @version 2.0.0 | 2026-03-13
 * ==============================================
 */

import { ApiClientBase, onReady, renderTable, statusBadge } from '../shared/api-client.js';
import { formatCurrency } from '../shared/format-utils.js';
import { invoices, budget } from '../supabase.js';

/**
 * Finance API Client
 */
class FinanceClient extends ApiClientBase {
  constructor() {
    super({
      moduleName: 'Finance',
      supabase: { invoices, budget },
      demoDataFn: getDemoFinanceData
    });
  }

  /**
   * Load finance data
   * @returns {Promise<Object>} Finance data
   */
  async loadFinanceData() {
    return this.load('finance', async () => {
      // Parallel fetch
      const [invoiceResult, budgetResult] = await Promise.all([
        this.supabase.invoices.getAll(),
        this.supabase.budget.getAll()
      ]);

      const invoiceData = invoiceResult.data || [];
      const budgetData = budgetResult.data || [];

      // Calculate invoice stats
      const paidInvoices = invoiceData.filter(i => i.status === 'paid');
      const pendingInvoices = invoiceData.filter(i => i.status === 'sent' || i.status === 'pending');
      const overdueInvoices = invoiceData.filter(i => i.status === 'overdue');

      const totalRevenue = paidInvoices.reduce((sum, i) => sum + (i.amount || 0), 0);
      const pendingAmount = pendingInvoices.reduce((sum, i) => sum + (i.amount || 0), 0);
      const overdueAmount = overdueInvoices.reduce((sum, i) => sum + (i.amount || 0), 0);

      // Budget stats
      const totalAllocated = budgetData.reduce((sum, b) => sum + (b.allocated || 0), 0);
      const totalSpent = budgetData.reduce((sum, b) => sum + (b.spent || 0), 0);
      const budgetRemaining = totalAllocated - totalSpent;

      return {
        // Revenue
        totalRevenue,
        pendingAmount,
        overdueAmount,

        // Invoices
        totalInvoices: invoiceData.length,
        paidCount: paidInvoices.length,
        pendingCount: pendingInvoices.length,
        overdueCount: overdueInvoices.length,

        // Budget
        totalAllocated,
        totalSpent,
        budgetRemaining,
        budgetUsedPercent: totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0,

        // Raw data
        invoices: invoiceData,
        budgets: budgetData
      };
    });
  }

  /**
   * Bind finance data to dashboard
   * @returns {Promise<Object>} Finance data
   */
  async bindFinanceDashboard() {
    const data = await this.loadFinanceData();

    // Bind stats
    this.bind({
      'stat-revenue': formatCurrency(data.totalRevenue),
      'stat-pending': formatCurrency(data.pendingAmount),
      'stat-overdue': formatCurrency(data.overdueAmount),
      'stat-invoices': data.totalInvoices,
      'stat-paid': data.paidCount,
      'stat-pending-count': data.pendingCount,
      'stat-overdue-count': data.overdueCount,
      'stat-budget-allocated': formatCurrency(data.totalAllocated),
      'stat-budget-spent': formatCurrency(data.totalSpent),
      'stat-budget-remaining': formatCurrency(data.budgetRemaining),
      'stat-budget-percent': `${data.budgetUsedPercent}%`
    });

    // Update progress bars
    const budgetBar = this.$('budget-progress');
    if (budgetBar) {
      budgetBar.style.width = `${data.budgetUsedPercent}%`;
    }

    return data;
  }

  /**
   * Render invoice table
   * @param {Array} invoicesData - Invoices array
   * @param {string} containerId - Container ID
   */
  renderInvoiceTable(invoicesData, containerId = 'invoice-table') {
    const statusColors = {
      paid: { bg: '#D4EDDA', color: '#155724' },
      pending: { bg: '#FFF3CD', color: '#856404' },
      sent: { bg: '#CCE5FF', color: '#004085' },
      overdue: { bg: '#F8D7DA', color: '#721C24' }
    };

    renderTable(invoicesData, (inv) => `
      <tr>
        <td>${inv.invoice_number || 'N/A'}</td>
        <td>${inv.client?.company_name || 'N/A'}</td>
        <td><strong>${formatCurrency(inv.amount)}</strong></td>
        <td>${statusBadge(inv.status, statusColors)}</td>
        <td>${new Date(inv.due_date || inv.created_at).toLocaleDateString('vi-VN')}</td>
      </tr>
    `, containerId);
  }

  /**
   * Render budget breakdown
   * @param {Array} budgetsData - Budgets array
   * @param {string} containerId - Container ID
   */
  renderBudgetBreakdown(budgetsData, containerId = 'budget-breakdown') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const colors = ['#006A60', '#9C6800', '#6750A4', '#B3261E', '#0068FF'];

    if (!budgetsData || budgetsData.length === 0) {
      container.innerHTML = '<div class="text-muted">No budget data</div>';
      return;
    }

    container.innerHTML = budgetsData.map((b, i) => {
      const percent = b.allocated > 0 ? (b.spent / b.allocated * 100) : 0;
      const color = colors[i % colors.length];

      return `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #eee;">
          <div>
            <div style="font-weight: 500;">${b.category}</div>
            <div style="font-size: 12px; color: #888;">${b.period}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: 600; color: ${color}">
              ${formatCurrency(b.spent)} / ${formatCurrency(b.allocated)}
            </div>
            <div style="width: 100px; height: 6px; background: #eee; border-radius: 3px; margin-top: 4px;">
              <div style="width: ${percent}%; height: 100%; background: ${color}; border-radius: 3px;"></div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
}

/**
 * Demo finance data fallback
 * @returns {Object} Demo data
 */
function getDemoFinanceData() {
  return {
    totalRevenue: 245000000,
    pendingAmount: 85000000,
    overdueAmount: 15000000,
    totalInvoices: 28,
    paidCount: 18,
    pendingCount: 8,
    overdueCount: 2,
    totalAllocated: 80000000,
    totalSpent: 33750000,
    budgetRemaining: 46250000,
    budgetUsedPercent: 42,
    invoices: [],
    budgets: []
  };
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Create singleton instance
const financeClient = new FinanceClient();

// Auto-initialize on DOM ready
onReady(async () => {
  const data = await financeClient.bindFinanceDashboard();

  if (data.invoices.length > 0) {
    financeClient.renderInvoiceTable(data.invoices);
  }

  if (data.budgets.length > 0) {
    financeClient.renderBudgetBreakdown(data.budgets);
  }
});

// Export for external use
export { financeClient, FinanceClient };

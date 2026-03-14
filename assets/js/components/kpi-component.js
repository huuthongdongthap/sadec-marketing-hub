/**
 * ═══════════════════════════════════════════════════════════════════════════
 * KPI COMPONENT — Sa Đéc Marketing Hub
 * Reusable KPI Card Grid Component
 * ═══════════════════════════════════════════════════════════════════════════
 */

export class KPIComponent {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    /**
     * Render KPI cards
     * @param {Object} kpis - KPI data
     */
    render(kpis) {
        if (!this.container) return;

        const kpiConfigs = [
            { key: 'totalRevenue', label: 'Doanh thu', icon: 'attach_money', format: 'currency' },
            { key: 'totalROI', label: 'ROI tổng', icon: 'trending_up', format: 'percent' },
            { key: 'conversionRate', label: 'Tỷ lệ chuyển đổi', icon: 'conversion_path', format: 'percent' },
            { key: 'totalLeads', label: 'Tổng leads', icon: 'lead', format: 'number' },
            { key: 'totalSpend', label: 'Chi phí marketing', icon: 'payments', format: 'currency' },
            { key: 'cac', label: 'CAC', icon: 'group', format: 'currency' }
        ];

        this.container.innerHTML = kpiConfigs.map(config => {
            const value = kpis[config.key];
            const changeKey = `${config.key.replace(/([A-Z])/g, '$1Change').toLowerCase()}`;
            const change = kpis[changeKey] || 0;
            const isPositive = change >= 0;

            return `
        <div class="kpi-card">
          <div class="kpi-header">
            <div class="kpi-icon">
              <span class="material-symbols-outlined">${config.icon}</span>
            </div>
            <div class="kpi-trend ${isPositive ? 'trend-positive' : 'trend-negative'}">
              <span class="material-symbols-outlined">${isPositive ? 'arrow_upward' : 'arrow_downward'}</span>
              <span>${Math.abs(change)}%</span>
            </div>
          </div>
          <div class="kpi-value">${this.formatValue(value, config.format)}</div>
          <div class="kpi-label">${config.label}</div>
        </div>
      `;
        }).join('');
    }

    /**
     * Format value based on type
     * @param {number} value - Value to format
     * @param {string} format - Format type (currency, percent, number)
     * @returns {string} Formatted value
     */
    formatValue(value, format) {
        switch (format) {
            case 'currency':
                return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
            case 'percent':
                return `${value}%`;
            case 'number':
            default:
                return new Intl.NumberFormat('vi-VN').format(value);
        }
    }

    /**
     * Update single KPI
     * @param {string} key - KPI key
     * @param {number} value - New value
     */
    updateKPI(key, value) {
        const card = this.container.querySelector(`[data-kpi="${key}"]`);
        if (card) {
            const valueEl = card.querySelector('.kpi-value');
            if (valueEl) valueEl.textContent = this.formatValue(value, 'currency');
        }
    }
}

export default KPIComponent;

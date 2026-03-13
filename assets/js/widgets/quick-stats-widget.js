/**
 * Quick Stats Widget - Sa Đéc Marketing Hub
 * Widget hiển thị quick stats và sparkline charts
 *
 * Features:
 * - Real-time data updates
 * - Sparkline mini charts
 * - Trend indicators
 * - Click to drill-down
 *
 * Usage:
 *   QuickStats.init('#stats-container', {
 *     refreshInterval: 30000,
 *     metrics: ['revenue', 'leads', 'conversion']
 *   });
 */

class QuickStatsWidget {
  constructor(containerSelector, options = {}) {
    this.container = document.querySelector(containerSelector);
    if (!this.container) {
      console.warn('[QuickStats] Container not found:', containerSelector);
      return;
    }

    this.options = {
      refreshInterval: 30000, // 30 seconds
      metrics: ['revenue', 'leads', 'conversion', 'customers'],
      showSparkline: true,
      showTrend: true,
      animationDuration: 300,
      ...options
    };

    this.data = {};
    this.refreshTimer = null;

    this.init();
  }

  /**
   * Initialize widget
   */
  init() {
    this.createLayout();
    this.ensureStyles();
    this.loadInitialData();
    this.startAutoRefresh();
    this.bindEvents();
  }

  /**
   * Create widget layout
   */
  createLayout() {
    this.container.innerHTML = `
      <div class="quick-stats-widget">
        <div class="stats-header">
          <h3 class="stats-title">
            <span class="material-symbols-outlined">insights</span>
            Quick Stats
          </h3>
          <button class="stats-refresh-btn" title="Làm mới" aria-label="Refresh stats">
            <span class="material-symbols-outlined">refresh</span>
          </button>
        </div>
        <div class="stats-grid" id="statsGrid">
          <!-- Stats cards will be inserted here -->
        </div>
      </div>
    `;
  }

  /**
   * Ensure CSS styles exist
   */
  ensureStyles() {
    if (document.getElementById('quick-stats-styles')) return;

    const style = document.createElement('style');
    style.id = 'quick-stats-styles';
    style.textContent = `
      .quick-stats-widget {
        background: var(--md-sys-color-surface, #fff);
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      }

      .stats-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }

      .stats-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 1rem;
        font-weight: 600;
        color: var(--md-sys-color-on-surface, #1f2937);
        margin: 0;
      }

      .stats-title .material-symbols-outlined {
        color: var(--md-sys-color-primary, #006A60);
      }

      .stats-refresh-btn {
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 8px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s;
      }

      .stats-refresh-btn:hover {
        background: var(--md-sys-color-surface-variant, #f3f4f6);
      }

      .stats-refresh-btn.spinning .material-symbols-outlined {
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
      }

      .stat-card {
        background: var(--md-sys-color-surface-container, #f9fafb);
        border-radius: 10px;
        padding: 16px;
        transition: transform 0.2s, box-shadow 0.2s;
        cursor: pointer;
      }

      .stat-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      }

      .stat-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 12px;
      }

      .stat-icon {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 10px;
        font-size: 1.25rem;
      }

      .stat-icon.primary { background: #e0f2f1; color: #006A60; }
      .stat-icon.success { background: #e8f5e9; color: #2e7d32; }
      .stat-icon.warning { background: #fff8e1; color: #f57f17; }
      .stat-icon.info { background: #e3f2fd; color: #1976d2; }

      .stat-trend {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.75rem;
        font-weight: 600;
        padding: 4px 8px;
        border-radius: 6px;
      }

      .stat-trend.up {
        color: #2e7d32;
        background: #e8f5e9;
      }

      .stat-trend.down {
        color: #d32f2f;
        background: #ffebee;
      }

      .stat-value {
        font-size: 1.75rem;
        font-weight: 700;
        color: var(--md-sys-color-on-surface, #1f2937);
        margin-bottom: 4px;
        line-height: 1.2;
      }

      .stat-label {
        font-size: 0.875rem;
        color: var(--md-sys-color-on-surface-variant, #6b7280);
        margin-bottom: 12px;
      }

      .stat-sparkline {
        height: 40px;
        margin-top: 8px;
      }

      .stat-sparkline svg {
        width: 100%;
        height: 100%;
      }

      @media (max-width: 768px) {
        .stats-grid {
          grid-template-columns: repeat(2, 1fr);
        }

        .stat-value {
          font-size: 1.5rem;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Load initial data
   */
  async loadInitialData() {
    try {
      await this.fetchData();
      this.render();
    } catch (error) {
      console.error('[QuickStats] Failed to load data:', error);
    }
  }

  /**
   * Fetch stats data
   */
  async fetchData() {
    // Simulated data - replace with actual API call
    this.data = {
      revenue: {
        value: 125000000,
        currency: 'VND',
        trend: 12.5,
        trendDirection: 'up',
        sparkline: [65, 70, 68, 72, 75, 80, 78, 82, 85, 88, 92, 95],
        label: 'Doanh thu tháng này'
      },
      leads: {
        value: 342,
        trend: 8.3,
        trendDirection: 'up',
        sparkline: [20, 25, 23, 28, 30, 32, 35, 38, 40, 42, 45, 48],
        label: 'Leads tháng này'
      },
      conversion: {
        value: 24.5,
        suffix: '%',
        trend: -2.1,
        trendDirection: 'down',
        sparkline: [28, 27, 26, 25, 26, 25, 24, 25, 24, 23, 24, 25],
        label: 'Tỷ lệ chuyển đổi'
      },
      customers: {
        value: 1250,
        trend: 15.2,
        trendDirection: 'up',
        sparkline: [80, 85, 90, 95, 100, 105, 110, 115, 120, 125, 130, 135],
        label: 'Tổng khách hàng'
      }
    };
  }

  /**
   * Render stats
   */
  render() {
    const grid = document.getElementById('statsGrid');
    if (!grid) return;

    const metricConfigs = {
      revenue: { icon: 'attach_money', color: 'primary' },
      leads: { icon: 'person', color: 'info' },
      conversion: { icon: 'trending_up', color: 'success' },
      customers: { icon: 'groups', color: 'success' }
    };

    grid.innerHTML = this.options.metrics.map(metric => {
      const data = this.data[metric];
      const config = metricConfigs[metric] || { icon: 'analytics', color: 'info' };

      if (!data) return '';

      return `
        <div class="stat-card" data-metric="${metric}" tabindex="0" role="button" aria-label="${data.label}: ${this.formatValue(data)}">
          <div class="stat-header">
            <div class="stat-icon ${config.color}">
              <span class="material-symbols-outlined">${config.icon}</span>
            </div>
            ${this.options.showTrend ? this.renderTrend(data.trend, data.trendDirection) : ''}
          </div>
          <div class="stat-value">${this.formatValue(data)}</div>
          <div class="stat-label">${data.label}</div>
          ${this.options.showSparkline ? this.renderSparkline(data.sparkline, data.trendDirection) : ''}
        </div>
      `;
    }).join('');

    this.bindCardEvents();
  }

  /**
   * Format value for display
   */
  formatValue(data) {
    let value = data.value;

    // Format currency
    if (data.currency === 'VND') {
      value = new Intl.NumberFormat('vi-VN').format(value);
      return `${value}₫`;
    }

    // Add suffix
    if (data.suffix) {
      value = value.toFixed(1);
      return `${value}${data.suffix}`;
    }

    // Format large numbers
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }

    return value.toString();
  }

  /**
   * Render trend indicator
   */
  renderTrend(trend, direction) {
    const icon = direction === 'up' ? 'arrow_upward' : 'arrow_downward';
    const sign = direction === 'up' ? '+' : '';
    return `
      <div class="stat-trend ${direction}">
        <span class="material-symbols-outlined" style="font-size: 14px;">${icon}</span>
        <span>${sign}${trend.toFixed(1)}%</span>
      </div>
    `;
  }

  /**
   * Render sparkline chart
   */
  renderSparkline(data, trend) {
    const color = trend === 'up' ? '#2e7d32' : '#d32f2f';
    const width = 100;
    const height = 40;
    const padding = 2;

    // Normalize data to fit SVG
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * (width - padding * 2) + padding;
      const y = height - ((value - min) / range) * (height - padding * 2) - padding;
      return `${x},${y}`;
    }).join(' ');

    // Create area fill
    const firstPoint = points.split(' ')[0];
    const lastPoint = points.split(' ')[points.split(' ').length - 1];
    const areaPoints = `${firstPoint.split(',')[0]},${height} ${points} ${lastPoint.split(',')[0]},${height}`;

    return `
      <div class="stat-sparkline">
        <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
          <defs>
            <linearGradient id="gradient-${trend}" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:${color};stop-opacity:0.3" />
              <stop offset="100%" style="stop-color:${color};stop-opacity:0.05" />
            </linearGradient>
          </defs>
          <polygon points="${areaPoints}" fill="url(#gradient-${trend})" />
          <polyline points="${points}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
    `;
  }

  /**
   * Bind card click events
   */
  bindCardEvents() {
    document.querySelectorAll('.stat-card').forEach(card => {
      card.addEventListener('click', () => {
        const metric = card.dataset.metric;
        this.handleCardClick(metric);
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const metric = card.dataset.metric;
          this.handleCardClick(metric);
        }
      });
    });
  }

  /**
   * Handle card click
   */
  handleCardClick(metric) {
    const drillDownPaths = {
      revenue: '/admin/finance.html',
      leads: '/admin/leads.html',
      conversion: '/admin/reports.html',
      customers: '/admin/clients.html'
    };

    const path = drillDownPaths[metric];
    if (path) {
      window.location.href = path;
    }

    if (window.Toast) {
      Toast.show(`Đang chuyển đến ${metric}...`, 'info');
    }
  }

  /**
   * Bind widget events
   */
  bindEvents() {
    const refreshBtn = this.container.querySelector('.stats-refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.refresh());
    }
  }

  /**
   * Refresh data
   */
  async refresh() {
    const refreshBtn = this.container.querySelector('.stats-refresh-btn');
    if (refreshBtn) {
      refreshBtn.classList.add('spinning');
    }

    try {
      await this.fetchData();
      this.render();
      if (window.Toast) {
        Toast.show('Đã làm mới số liệu', 'success');
      }
    } catch (error) {
      console.error('[QuickStats] Refresh failed:', error);
      if (window.Toast) {
        Toast.show('Không thể làm mới số liệu', 'error');
      }
    } finally {
      setTimeout(() => {
        refreshBtn?.classList.remove('spinning');
      }, 500);
    }
  }

  /**
   * Start auto refresh
   */
  startAutoRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }

    this.refreshTimer = setInterval(() => {
      this.refresh();
    }, this.options.refreshInterval);
  }

  /**
   * Stop auto refresh
   */
  stopAutoRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Destroy widget
   */
  destroy() {
    this.stopAutoRefresh();
    this.container.innerHTML = '';
  }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  const containers = document.querySelectorAll('[data-quick-stats]');
  containers.forEach(container => {
    const options = {
      metrics: container.dataset.metrics?.split(',') || ['revenue', 'leads', 'conversion', 'customers'],
      refreshInterval: parseInt(container.dataset.refreshInterval, 10) || 30000
    };
    new QuickStatsWidget(`#${container.id}`, options);
  });
});

// Global access
if (typeof window !== 'undefined') {
  window.QuickStatsWidget = QuickStatsWidget;
}

// Export for modules
export default QuickStatsWidget;

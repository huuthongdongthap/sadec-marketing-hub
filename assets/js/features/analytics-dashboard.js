/**
 * Real-time Analytics Dashboard
 * Dashboard với real-time metrics, charts, ROI tracking
 *
 * Features:
 * - Real-time data updates via Supabase Realtime
 * - Interactive charts (Chart.js)
 * - KPI cards với trend indicators
 * - Custom date range picker
 * - Export reports
 */

class AnalyticsDashboard {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.charts = new Map();
    this.data = null;
    this.refreshInterval = null;
    this.autoRefreshMs = 30000; // 30 seconds

    this.init();
  }

  init() {
    this.setupLayout();
    this.loadCharts();
    this.setupRealtime();
    this.startAutoRefresh();
  }

  /**
   * Setup dashboard layout
   */
  setupLayout() {
    if (!this.container) {
      console.warn('AnalyticsDashboard: Container not found');
      return;
    }

    this.container.innerHTML = `
      <div class="analytics-dashboard">
        <!-- Header with controls -->
        <div class="dashboard-header">
          <div class="dashboard-title">
            <h2>📊 Analytics Dashboard</h2>
            <p>Theo dõi hiệu suất marketing real-time</p>
          </div>
          <div class="dashboard-controls">
            <div class="date-range-picker">
              <button class="date-range-btn" id="dateRangeBtn">
                <span class="material-symbols-outlined">calendar_today</span>
                <span id="dateRangeLabel">Hôm nay</span>
              </button>
            </div>
            <button class="refresh-btn" id="refreshBtn" title="Làm mới">
              <span class="material-symbols-outlined">refresh</span>
            </button>
            <button class="export-btn" id="exportBtn" title="Xuất báo cáo">
              <span class="material-symbols-outlined">download</span>
            </button>
          </div>
        </div>

        <!-- KPI Cards Row -->
        <div class="kpi-grid" id="kpiGrid">
          <!-- KPI cards will be inserted here -->
        </div>

        <!-- Charts Row 1 -->
        <div class="charts-row">
          <div class="chart-card wide">
            <div class="chart-header">
              <h3>Xu hướng ROI theo thời gian</h3>
              <button class="chart-menu-btn">
                <span class="material-symbols-outlined">more_vert</span>
              </button>
            </div>
            <div class="chart-body">
              <canvas id="roiTrendChart"></canvas>
            </div>
          </div>
        </div>

        <!-- Charts Row 2 -->
        <div class="charts-row">
          <div class="chart-card">
            <div class="chart-header">
              <h3>Phân bổ ngân sách</h3>
            </div>
            <div class="chart-body">
              <canvas id="budgetChart"></canvas>
            </div>
          </div>
          <div class="chart-card">
            <div class="chart-header">
              <h3>Hiệu suất kênh</h3>
            </div>
            <div class="chart-body">
              <canvas id="channelChart"></canvas>
            </div>
          </div>
        </div>

        <!-- Charts Row 3 -->
        <div class="charts-row">
          <div class="chart-card wide">
            <div class="chart-header">
              <h3>Customer Journey Funnel</h3>
            </div>
            <div class="chart-body">
              <canvas id="funnelChart"></canvas>
            </div>
          </div>
        </div>

        <!-- Recent Activity Table -->
        <div class="activity-section">
          <div class="section-header">
            <h3>Hoạt động gần đây</h3>
            <a href="#" class="view-all">Xem tất cả</a>
          </div>
          <div class="activity-list" id="activityList">
            <!-- Activity items will be inserted here -->
          </div>
        </div>
      </div>
    `;

    this.setupEventListeners();
  }

  setupEventListeners() {
    const refreshBtn = document.getElementById('refreshBtn');
    const exportBtn = document.getElementById('exportBtn');
    const dateRangeBtn = document.getElementById('dateRangeBtn');

    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.refresh());
    }

    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.export());
    }

    if (dateRangeBtn) {
      dateRangeBtn.addEventListener('click', () => this.showDateRangePicker());
    }
  }

  /**
   * Load and initialize charts
   */
  async loadCharts() {
    // Fetch data
    const data = await this.fetchData();
    this.data = data;

    // Render KPI cards
    this.renderKPIs(data.kpis);

    // Initialize charts
    this.initRoiTrendChart(data.roiTrend);
    this.initBudgetChart(data.budget);
    this.initChannelChart(data.channels);
    this.initFunnelChart(data.funnel);

    // Render activity
    this.renderActivity(data.activities);
  }

  /**
   * Fetch analytics data
   */
  async fetchData() {
    // Mock data for demo - replace with actual API call
    return {
      kpis: {
        totalRevenue: 1200000000,
        revenueChange: 8.5,
        totalROI: 245,
        roiChange: 12,
        totalSpend: 350000000,
        spendChange: 3.2,
        conversionRate: 3.2,
        conversionChange: 0.4,
        totalLeads: 1250,
        leadsChange: 15.3,
        cac: 280000,
        cacChange: -5.2
      },
      roiTrend: {
        labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'],
        data: [180, 195, 210, 225, 238, 245]
      },
      budget: {
        labels: ['Facebook Ads', 'Google Ads', 'Zalo Ads', 'Content', 'SEO'],
        data: [35, 25, 15, 15, 10]
      },
      channels: {
        labels: ['Facebook', 'Google', 'Zalo', 'TikTok', 'Email'],
        conversions: [245, 189, 156, 98, 67],
        spend: [120, 95, 52, 45, 18]
      },
      funnel: {
        labels: ['Nhận biết', 'Quan tâm', 'Cân nhắc', 'Mua hàng', 'Trung thành'],
        values: [10000, 5000, 2000, 800, 320]
      },
      activities: [
        { type: 'campaign', title: 'Campaign "Mừng Xuân" đạt 150% ROI', time: '5 phút trước', icon: 'celebration' },
        { type: 'lead', title: 'Lead mới từ Facebook Ads: Cty ABC', time: '15 phút trước', icon: 'person_add' },
        { type: 'conversion', title: 'Conversion từ Google Ads', time: '32 phút trước', icon: 'shopping_cart' },
        { type: 'alert', title: 'Ngân sách Facebook Ads sắp hết', time: '1 giờ trước', icon: 'warning' }
      ]
    };
  }

  /**
   * Render KPI cards
   */
  renderKPIs(kpis) {
    const grid = document.getElementById('kpiGrid');
    if (!grid) return;

    const kpiConfigs = [
      { key: 'totalRevenue', label: 'Doanh thu', icon: 'attach_money', format: 'currency' },
      { key: 'totalROI', label: 'ROI tổng', icon: 'trending_up', format: 'percent' },
      { key: 'conversionRate', label: 'Tỷ lệ chuyển đổi', icon: 'conversion_path', format: 'percent' },
      { key: 'totalLeads', label: 'Tổng leads', icon: 'lead', format: 'number' },
      { key: 'totalSpend', label: 'Chi phí marketing', icon: 'payments', format: 'currency' },
      { key: 'cac', label: 'CAC', icon: 'group', format: 'currency' }
    ];

    grid.innerHTML = kpiConfigs.map(config => {
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
   * Initialize ROI Trend Chart
   */
  initRoiTrendChart(data) {
    const ctx = document.getElementById('roiTrendChart');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'ROI (%)',
          data: data.data,
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `ROI: ${ctx.parsed.y}%`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            grid: { color: 'rgba(0,0,0,0.05)' }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });

    this.charts.set('roiTrend', chart);
  }

  /**
   * Initialize Budget Chart
   */
  initBudgetChart(data) {
    const ctx = document.getElementById('budgetChart');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.labels,
        datasets: [{
          data: data.data,
          backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });

    this.charts.set('budget', chart);
  }

  /**
   * Initialize Channel Chart
   */
  initChannelChart(data) {
    const ctx = document.getElementById('channelChart');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Conversions',
            data: data.conversions,
            backgroundColor: '#667eea',
            borderRadius: 8
          },
          {
            label: 'Chi phí (triệu ₫)',
            data: data.spend,
            backgroundColor: '#f093fb',
            borderRadius: 8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });

    this.charts.set('channel', chart);
  }

  /**
   * Initialize Funnel Chart
   */
  initFunnelChart(data) {
    const ctx = document.getElementById('funnelChart');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Khách hàng',
          data: data.values,
          backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b'],
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { beginAtZero: true }
        }
      }
    });

    this.charts.set('funnel', chart);
  }

  /**
   * Render activity list
   */
  renderActivity(activities) {
    const list = document.getElementById('activityList');
    if (!list) return;

    list.innerHTML = activities.map(activity => `
      <div class="activity-item">
        <div class="activity-icon ${activity.type}">
          <span class="material-symbols-outlined">${activity.icon}</span>
        </div>
        <div class="activity-content">
          <div class="activity-title">${activity.title}</div>
          <div class="activity-time">${activity.time}</div>
        </div>
      </div>
    `).join('');
  }

  /**
   * Setup Supabase Realtime subscription
   */
  setupRealtime() {
    const supabase = window.supabase;
    if (!supabase) return;

    // Subscribe to analytics updates
    const channel = supabase
      .channel('analytics')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'analytics'
        },
        (payload) => {
          console.log('Analytics update received:', payload);
          this.refresh();
        })
      .subscribe();

    this.realtimeChannel = channel;
  }

  /**
   * Start auto refresh
   */
  startAutoRefresh() {
    this.refreshInterval = setInterval(() => {
      this.refresh();
    }, this.autoRefreshMs);
  }

  /**
   * Stop auto refresh
   */
  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  /**
   * Manual refresh
   */
  async refresh() {
    const refreshBtn = document.getElementById('refreshBtn');

    if (refreshBtn) {
      refreshBtn.classList.add('spinning');
    }

    try {
      const data = await this.fetchData();
      this.data = data;

      // Update charts
      this.updateCharts(data);

      if (typeof Toast !== 'undefined') {
        Toast.success('Dữ liệu đã làm mới', { title: 'Cập nhật' });
      }
    } catch (error) {
      console.error('Refresh error:', error);
      if (typeof Toast !== 'undefined') {
        Toast.error('Không thể làm mới dữ liệu', { title: 'Lỗi' });
      }
    } finally {
      if (refreshBtn) {
        refreshBtn.classList.remove('spinning');
      }
    }
  }

  /**
   * Update charts with new data
   */
  updateCharts(data) {
    // Update KPIs
    this.renderKPIs(data.kpis);

    // Update chart data
    const roiChart = this.charts.get('roiTrend');
    if (roiChart) {
      roiChart.data.datasets[0].data = data.roiTrend.data;
      roiChart.update('none');
    }

    // Update activity
    this.renderActivity(data.activities);
  }

  /**
   * Export report
   */
  export() {
    const reportData = {
      generatedAt: new Date().toISOString(),
      kpis: this.data?.kpis,
      charts: {
        roiTrend: this.data?.roiTrend,
        budget: this.data?.budget,
        channels: this.data?.channels,
        funnel: this.data?.funnel
      }
    };

    // Download as JSON
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    if (typeof Toast !== 'undefined') {
      Toast.success('Đã xuất báo cáo', { title: 'Export' });
    }
  }

  /**
   * Show date range picker
   */
  showDateRangePicker() {
    const ranges = [
      { label: 'Hôm nay', value: 'today' },
      { label: '7 ngày qua', value: '7d' },
      { label: '30 ngày qua', value: '30d' },
      { label: 'Tháng này', value: 'month' },
      { label: 'Quý này', value: 'quarter' },
      { label: 'Năm nay', value: 'year' }
    ];

    // Simple prompt for demo - replace with proper date picker modal
    const selected = prompt('Chọn khoảng thời gian:\n1. Hôm nay\n2. 7 ngày qua\n3. 30 ngày qua\n4. Tháng này\n5. Quý này\n6. Năm này');

    if (selected && ranges[selected - 1]) {
      const range = ranges[selected - 1];
      document.getElementById('dateRangeLabel').textContent = range.label;
      this.refresh();
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    this.stopAutoRefresh();

    if (this.realtimeChannel) {
      this.realtimeChannel.unsubscribe();
    }

    this.charts.forEach(chart => chart.destroy());
    this.charts.clear();
  }
}

// Add dashboard styles
const style = document.createElement('style');
style.textContent = `
  .analytics-dashboard {
    padding: 24px;
    background: var(--md-sys-color-background, #f5f5f5);
    min-height: 100vh;
  }

  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 16px;
  }

  .dashboard-title h2 {
    font-size: 24px;
    margin: 0;
    color: var(--md-sys-color-on-background, #1f2937);
  }

  .dashboard-title p {
    font-size: 14px;
    color: var(--md-sys-color-on-surface-variant, #6b7280);
    margin: 4px 0 0;
  }

  .dashboard-controls {
    display: flex;
    gap: 12px;
  }

  .dashboard-controls button {
    width: 40px;
    height: 40px;
    border-radius: 20px;
    border: none;
    background: var(--md-sys-color-surface, #fff);
    color: var(--md-sys-color-on-surface, #1f2937);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .dashboard-controls button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }

  .refresh-btn.spinning .material-symbols-outlined {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* KPI Grid */
  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }

  .kpi-card {
    background: var(--md-sys-color-surface, #fff);
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  .kpi-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .kpi-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: var(--md-sys-color-primary-container, #e0f2f1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--md-sys-color-primary, #006A60);
  }

  .kpi-trend {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
  }

  .trend-positive {
    color: #10b981;
    background: rgba(16, 185, 129, 0.1);
  }

  .trend-negative {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
  }

  .kpi-value {
    font-size: 28px;
    font-weight: 700;
    color: var(--md-sys-color-on-surface, #1f2937);
    margin-bottom: 4px;
  }

  .kpi-label {
    font-size: 13px;
    color: var(--md-sys-color-on-surface-variant, #6b7280);
  }

  /* Charts */
  .charts-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }

  .chart-card {
    background: var(--md-sys-color-surface, #fff);
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  .chart-card.wide {
    grid-column: 1 / -1;
  }

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .chart-header h3 {
    font-size: 16px;
    margin: 0;
    color: var(--md-sys-color-on-surface, #1f2937);
  }

  .chart-body {
    height: 300px;
  }

  /* Activity Section */
  .activity-section {
    background: var(--md-sys-color-surface, #fff);
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .section-header h3 {
    font-size: 16px;
    margin: 0;
  }

  .activity-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .activity-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px 0;
    border-bottom: 1px solid var(--md-sys-color-outline-variant, #e0e0e0);
  }

  .activity-item:last-child {
    border-bottom: none;
  }

  .activity-icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .activity-icon.campaign { background: #fef3c7; color: #f59e0b; }
  .activity-icon.lead { background: #dbeafe; color: #3b82f6; }
  .activity-icon.conversion { background: #d1fae5; color: #10b981; }
  .activity-icon.alert { background: #fee2e2; color: #ef4444; }

  .activity-content {
    flex: 1;
  }

  .activity-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--md-sys-color-on-surface, #1f2937);
  }

  .activity-time {
    font-size: 12px;
    color: var(--md-sys-color-on-surface-variant, #6b7280);
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .kpi-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .charts-row {
      grid-template-columns: 1fr;
    }

    .dashboard-controls {
      width: 100%;
      justify-content: space-between;
    }

    .date-range-picker {
      flex: 1;
    }

    .date-range-btn {
      width: 100%;
    }
  }
`;
document.head.appendChild(style);

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AnalyticsDashboard };
}

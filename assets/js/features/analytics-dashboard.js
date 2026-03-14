/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ANALYTICS DASHBOARD — Sa Đéc Marketing Hub
 * Refactored with Modular Components
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Usage:
 *   import AnalyticsDashboard from './analytics-dashboard.js';
 *   const dashboard = new AnalyticsDashboard('dashboard-container');
 */

import { KPIComponent } from '../components/kpi-component.js';
import { ROITrendChart, BudgetChart, ChannelChart, FunnelChart } from '../components/chart-components.js';
import { ActivityComponent } from '../components/activity-component.js';

class AnalyticsDashboard {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.kpiComponent = null;
        this.charts = {
            roiTrend: null,
            budget: null,
            channel: null,
            funnel: null
        };
        this.activityComponent = null;
        this.data = null;
        this.refreshInterval = null;
        this.autoRefreshMs = 30000; // 30 seconds
        this.realtimeChannel = null;

        this.init();
    }

    init() {
        this.setupLayout();
        this.initComponents();
        this.setupEventListeners();
        this.setupRealtime();
        this.startAutoRefresh();
    }

    /**
     * Setup dashboard layout
     */
    setupLayout() {
        if (!this.container) return;

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
        <div class="kpi-grid" id="kpiGrid"></div>

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
          <div class="activity-list" id="activityList"></div>
        </div>
      </div>
    `;
    }

    /**
     * Initialize components
     */
    initComponents() {
        this.kpiComponent = new KPIComponent('kpiGrid');
        this.charts = {
            roiTrend: new ROITrendChart('roiTrendChart'),
            budget: new BudgetChart('budgetChart'),
            channel: new ChannelChart('channelChart'),
            funnel: new FunnelChart('funnelChart')
        };
        this.activityComponent = new ActivityComponent('activityList');
    }

    /**
     * Setup event listeners
     */
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
        const data = await this.fetchData();
        this.data = data;

        // Render KPI cards
        this.kpiComponent.render(data.kpis);

        // Initialize charts
        this.charts.roiTrend.init(data.roiTrend);
        this.charts.budget.init(data.budget);
        this.charts.channel.init(data.channels);
        this.charts.funnel.init(data.funnel);

        // Render activity
        this.activityComponent.render(data.activities);
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
     * Setup Supabase Realtime subscription
     */
    setupRealtime() {
        const supabase = window.supabase;
        if (!supabase) return;

        const channel = supabase
            .channel('analytics')
            .on('postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'analytics'
                },
                () => {
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

            // Update components
            this.kpiComponent.render(data.kpis);
            this.charts.roiTrend.update(data.roiTrend);
            this.charts.budget.update(data.budget);
            this.charts.channel.update(data.channels);
            this.charts.funnel.update(data.funnel);
            this.activityComponent.render(data.activities);

            if (typeof Toast !== 'undefined') {
                Toast.success('Dữ liệu đã làm mới', { title: 'Cập nhật' });
            }
        } catch (error) {
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

        const selected = prompt('Chọn khoảng thời gian:\n1. Hôm nay\n2. 7 ngày qua\n3. 30 ngày qua\n4. Tháng này\n5. Quý này\n6. Năm này');

        if (selected && ranges[selected - 1]) {
            const range = ranges[selected - 1];
            document.getElementById('dateRangeLabel').textContent = range.label;
            this.refresh();
        }
    }

    /**
     * Destroy dashboard and cleanup
     */
    destroy() {
        this.stopAutoRefresh();

        // Destroy charts
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroyAll === 'function') {
                chart.destroyAll();
            }
        });

        // Unsubscribe realtime
        if (this.realtimeChannel) {
            const supabase = window.supabase;
            if (supabase) {
                supabase.removeChannel(this.realtimeChannel);
            }
        }
    }
}

export default AnalyticsDashboard;

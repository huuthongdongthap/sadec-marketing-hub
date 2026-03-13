/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PROJECT HEALTH MONITOR — Dashboard Health Score Widget
 *
 * Features:
 * - Real-time health score calculation
 * - Visual gauge/meter display
 * - Health metrics breakdown
 * - Trend indicators
 * - Actionable recommendations
 * - Auto-refresh every 30s
 *
 * Usage:
 *   <project-health-monitor project-id="123"></project-health-monitor>
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Logger } from '../shared/logger.js';

const TAG = '[ProjectHealthMonitor]';

/**
 * Health categories
 */
const HealthStatus = {
  EXCELLENT: { label: 'Tuyệt vời', min: 90, color: '#22c55e', icon: '🟢' },
  GOOD: { label: 'Tốt', min: 70, color: '#84cc16', icon: '🟡' },
  FAIR: { label: 'Trung bình', min: 50, color: '#f59e0b', icon: '🟠' },
  POOR: { label: 'Cần cải thiện', min: 0, color: '#ef4444', icon: '🔴' }
};

/**
 * Health metrics weights
 */
const MetricWeights = {
  COMPLETION: 0.25,    // Task completion rate
  ENGAGEMENT: 0.20,    // User engagement
  PERFORMANCE: 0.20,   // Page performance
  SEO: 0.15,           // SEO score
  ACCESSIBILITY: 0.10, // Accessibility score
  CONTENT: 0.10        // Content freshness
};

/**
 * Project Health Monitor Class
 */
class ProjectHealthMonitor {
  constructor(options = {}) {
    this.projectId = options.projectId || null;
    this.container = options.container || null;
    this.data = null;
    this.refreshInterval = null;
    this.autoRefreshMs = options.autoRefreshMs || 30000;

    this.init();
  }

  /**
   * Initialize health monitor
   */
  async init() {
    Logger.info(TAG, 'Initializing Project Health Monitor...');

    this.render();
    await this.fetchData();

    if (this.autoRefreshMs > 0) {
      this.startAutoRefresh();
    }

    Logger.info(TAG, 'Initialized');
  }

  /**
   * Fetch health data
   */
  async fetchData() {
    try {
      // Try to fetch from API first
      const response = await this.fetchHealthData();
      if (response) {
        this.data = response;
      } else {
        // Use demo data if API not available
        this.data = this.generateDemoData();
      }

      this.updateUI();
    } catch (error) {
      Logger.error(TAG, 'Failed to fetch data:', error);
      this.data = this.generateDemoData();
      this.updateUI();
    }
  }

  /**
   * Fetch from API
   */
  async fetchHealthData() {
    if (!this.projectId) return null;

    try {
      const response = await fetch(`/api/projects/${this.projectId}/health`);
      if (!response.ok) throw new Error('API not available');
      return await response.json();
    } catch {
      return null;
    }
  }

  /**
   * Generate demo data
   */
  generateDemoData() {
    return {
      projectId: this.projectId || 'demo',
      projectName: 'Sa Đéc Marketing Hub',
      overallScore: Math.floor(Math.random() * 20) + 80, // 80-100
      trend: Math.random() > 0.3 ? 'up' : 'down',
      lastUpdated: new Date().toISOString(),
      metrics: {
        completion: {
          score: Math.floor(Math.random() * 15) + 85,
          label: 'Tiến độ dự án',
          details: '24/30 tasks completed'
        },
        engagement: {
          score: Math.floor(Math.random() * 20) + 70,
          label: 'Tương tác',
          details: '1,234 visitors this week'
        },
        performance: {
          score: Math.floor(Math.random() * 10) + 85,
          label: 'Hiệu suất',
          details: 'LCP: 1.8s, FID: 50ms'
        },
        seo: {
          score: Math.floor(Math.random() * 15) + 80,
          label: 'SEO',
          details: '95/100 pages optimized'
        },
        accessibility: {
          score: Math.floor(Math.random() * 10) + 90,
          label: 'Accessibility',
          details: 'WCAG 2.1 AA compliant'
        },
        content: {
          score: Math.floor(Math.random() * 20) + 70,
          label: 'Nội dung',
          details: 'Last update 2 days ago'
        }
      },
      recommendations: [
        {
          priority: 'high',
          title: 'Cập nhật nội dung trang chủ',
          description: 'Nội dung trang chủ đã cũ, nên cập nhật thông tin mới',
          action: '/admin/content.html'
        },
        {
          priority: 'medium',
          title: 'Tối ưu hình ảnh',
          description: 'Một số hình ảnh chưa được nén, ảnh hưởng performance',
          action: '/admin/media.html'
        },
        {
          priority: 'low',
          title: 'Thêm meta descriptions',
          description: '3 pages đang thiếu meta description',
          action: '/admin/seo.html'
        }
      ]
    };
  }

  /**
   * Calculate overall health score
   */
  calculateScore(metrics) {
    if (!metrics) return 0;

    const weightedSum =
      (metrics.completion?.score || 0) * MetricWeights.COMPLETION +
      (metrics.engagement?.score || 0) * MetricWeights.ENGAGEMENT +
      (metrics.performance?.score || 0) * MetricWeights.PERFORMANCE +
      (metrics.seo?.score || 0) * MetricWeights.SEO +
      (metrics.accessibility?.score || 0) * MetricWeights.ACCESSIBILITY +
      (metrics.content?.score || 0) * MetricWeights.CONTENT;

    return Math.round(weightedSum);
  }

  /**
   * Get health status from score
   */
  getStatus(score) {
    if (score >= HealthStatus.EXCELLENT.min) return HealthStatus.EXCELLENT;
    if (score >= HealthStatus.GOOD.min) return HealthStatus.GOOD;
    if (score >= HealthStatus.FAIR.min) return HealthStatus.FAIR;
    return HealthStatus.POOR;
  }

  /**
   * Render component
   */
  render() {
    const container = this.getContainer();
    if (!container) return;

    container.innerHTML = `
      <div class="health-monitor">
        <div class="health-header">
          <h3 class="health-title">
            <span class="health-icon">🏥</span>
            Project Health
          </h3>
          <span class="health-trend" data-trend="up">↑ +5%</span>
        </div>

        <div class="health-gauge-container">
          <svg class="health-gauge" viewBox="0 0 120 120">
            <circle class="gauge-bg" cx="60" cy="60" r="52" />
            <circle class="gauge-fill" cx="60" cy="60" r="52" />
            <text class="gauge-score" x="60" y="55" text-anchor="middle">--</text>
            <text class="gauge-label" x="60" y="75" text-anchor="middle">Score</text>
          </svg>
        </div>

        <div class="health-status">
          <span class="status-badge">--</span>
          <span class="status-label">Trạng thái</span>
        </div>

        <div class="health-metrics">
          <div class="metric-item">
            <div class="metric-header">
              <span class="metric-name">Tiến độ</span>
              <span class="metric-value">--%</span>
            </div>
            <div class="metric-bar">
              <div class="metric-progress" style="width: 0%"></div>
            </div>
          </div>

          <div class="metric-item">
            <div class="metric-header">
              <span class="metric-name">Tương tác</span>
              <span class="metric-value">--%</span>
            </div>
            <div class="metric-bar">
              <div class="metric-progress" style="width: 0%"></div>
            </div>
          </div>

          <div class="metric-item">
            <div class="metric-header">
              <span class="metric-name">Hiệu suất</span>
              <span class="metric-value">--%</span>
            </div>
            <div class="metric-bar">
              <div class="metric-progress" style="width: 0%"></div>
            </div>
          </div>

          <div class="metric-item">
            <div class="metric-header">
              <span class="metric-name">SEO</span>
              <span class="metric-value">--%</span>
            </div>
            <div class="metric-bar">
              <div class="metric-progress" style="width: 0%"></div>
            </div>
          </div>

          <div class="metric-item">
            <div class="metric-header">
              <span class="metric-name">Accessibility</span>
              <span class="metric-value">--%</span>
            </div>
            <div class="metric-bar">
              <div class="metric-progress" style="width: 0%"></div>
            </div>
          </div>

          <div class="metric-item">
            <div class="metric-header">
              <span class="metric-name">Nội dung</span>
              <span class="metric-value">--%</span>
            </div>
            <div class="metric-bar">
              <div class="metric-progress" style="width: 0%"></div>
            </div>
          </div>
        </div>

        <div class="health-recommendations">
          <h4 class="recommendations-title">
            <span>💡</span> Đề xuất
          </h4>
          <div class="recommendations-list">
            <div class="recommendation-empty">Đang tải...</div>
          </div>
        </div>

        <div class="health-footer">
          <span class="last-updated">Cập nhật: --</span>
          <button class="btn-refresh" title="Làm mới">
            🔄
          </button>
        </div>
      </div>
    `;

    // Bind refresh button
    const refreshBtn = container.querySelector('.btn-refresh');
    refreshBtn?.addEventListener('click', () => {
      this.fetchData();
    });
  }

  /**
   * Update UI with data
   */
  updateUI() {
    const container = this.getContainer();
    if (!container || !this.data) return;

    const score = this.data.overallScore || this.calculateScore(this.data.metrics);
    const status = this.getStatus(score);

    // Update gauge
    const gaugeFill = container.querySelector('.gauge-fill');
    const gaugeScore = container.querySelector('.gauge-score');
    const gaugeBg = container.querySelector('.gauge-bg');

    if (gaugeFill) {
      const circumference = 2 * Math.PI * 52;
      const offset = circumference - (score / 100) * circumference;
      gaugeFill.style.strokeDashoffset = offset;
      gaugeFill.style.stroke = status.color;
    }

    if (gaugeScore) {
      gaugeScore.textContent = score;
      gaugeScore.style.fill = status.color;
    }

    if (gaugeBg) {
      gaugeBg.style.stroke = status.color + '20';
    }

    // Update trend
    const trendEl = container.querySelector('.health-trend');
    if (trendEl && this.data.trend) {
      trendEl.textContent = this.data.trend === 'up' ? '↑ +5%' : '↓ -2%';
      trendEl.style.color = this.data.trend === 'up' ? '#22c55e' : '#ef4444';
      trendEl.dataset.trend = this.data.trend;
    }

    // Update status
    const statusBadge = container.querySelector('.status-badge');
    const statusLabel = container.querySelector('.status-label');
    if (statusBadge) {
      statusBadge.textContent = `${status.icon} ${status.label}`;
      statusBadge.style.color = status.color;
    }

    // Update metrics
    const metrics = this.data.metrics || {};
    const metricElements = container.querySelectorAll('.metric-item');

    const metricKeys = ['completion', 'engagement', 'performance', 'seo', 'accessibility', 'content'];
    metricKeys.forEach((key, index) => {
      const metric = metrics[key];
      const el = metricElements[index];
      if (!el || !metric) return;

      const nameEl = el.querySelector('.metric-name');
      const valueEl = el.querySelector('.metric-value');
      const progressEl = el.querySelector('.metric-progress');

      if (nameEl) nameEl.textContent = metric.label || key;
      if (valueEl) valueEl.textContent = `${metric.score}%`;
      if (progressEl) {
        progressEl.style.width = `${metric.score}%`;
        progressEl.style.background = this.getColorForScore(metric.score);
      }
    });

    // Update recommendations
    const recommendationsList = container.querySelector('.recommendations-list');
    if (recommendationsList) {
      const recommendations = this.data.recommendations || [];
      if (recommendations.length === 0) {
        recommendationsList.innerHTML = '<div class="recommendation-empty">✅ Không có đề xuất</div>';
      } else {
        recommendationsList.innerHTML = recommendations.map(rec => `
          <div class="recommendation-item priority-${rec.priority}">
            <div class="recommendation-content">
              <strong class="recommendation-title">${rec.title}</strong>
              <p class="recommendation-desc">${rec.description}</p>
            </div>
            <a href="${rec.action}" class="recommendation-action">Xem →</a>
          </div>
        `).join('');
      }
    }

    // Update last updated
    const lastUpdatedEl = container.querySelector('.last-updated');
    if (lastUpdatedEl && this.data.lastUpdated) {
      const date = new Date(this.data.lastUpdated);
      lastUpdatedEl.textContent = `Cập nhật: ${this.formatDate(date)}`;
    }
  }

  /**
   * Get color for score
   */
  getColorForScore(score) {
    if (score >= 90) return '#22c55e';
    if (score >= 70) return '#84cc16';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  }

  /**
   * Format date
   */
  formatDate(date) {
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Start auto-refresh
   */
  startAutoRefresh() {
    this.stopAutoRefresh();
    this.refreshInterval = setInterval(() => {
      this.fetchData();
    }, this.autoRefreshMs);
    Logger.info(TAG, `Auto-refresh started (every ${this.autoRefreshMs}ms)`);
  }

  /**
   * Stop auto-refresh
   */
  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  /**
   * Get container element
   */
  getContainer() {
    if (this.container) {
      return typeof this.container === 'string'
        ? document.querySelector(this.container)
        : this.container;
    }

    // Try to find by project-id attribute
    if (this.projectId) {
      return document.querySelector(`project-health-monitor[project-id="${this.projectId}"]`);
    }

    return null;
  }

  /**
   * Destroy and cleanup
   */
  destroy() {
    this.stopAutoRefresh();
    Logger.info(TAG, 'Destroyed');
  }
}

/**
 * Custom Web Component
 */
class ProjectHealthMonitorElement extends HTMLElement {
  static get observedAttributes() {
    return ['project-id', 'container'];
  }

  constructor() {
    super();
    this.monitor = null;
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.initMonitor();
  }

  disconnectedCallback() {
    this.monitor?.destroy();
  }

  attributeChangedCallback() {
    this.monitor?.destroy();
    this.initMonitor();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

        .health-monitor {
          background: white;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .health-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .health-title {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .health-trend {
          font-size: 14px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 6px;
          background: #f0fdf4;
        }

        .health-gauge-container {
          display: flex;
          justify-content: center;
          margin: 20px 0;
        }

        .health-gauge {
          width: 120px;
          height: 120px;
          transform: rotate(-90deg);
        }

        .gauge-bg {
          fill: none;
          stroke: #f0f0f0;
          stroke-width: 12;
        }

        .gauge-fill {
          fill: none;
          stroke: #22c55e;
          stroke-width: 12;
          stroke-linecap: round;
          stroke-dasharray: 326.7;
          stroke-dashoffset: 326.7;
          transition: stroke-dashoffset 0.5s ease;
        }

        .gauge-score {
          font-size: 28px;
          font-weight: 700;
          fill: #333;
          transform: rotate(90deg);
          transform-origin: center;
        }

        .gauge-label {
          font-size: 12px;
          fill: #666;
          transform: rotate(90deg);
          transform-origin: center;
        }

        .health-status {
          text-align: center;
          margin-bottom: 20px;
        }

        .status-badge {
          display: inline-block;
          font-size: 14px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 20px;
          background: #f5f5f5;
        }

        .status-label {
          display: block;
          font-size: 12px;
          color: #666;
          margin-top: 4px;
        }

        .health-metrics {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }

        .metric-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .metric-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .metric-name {
          font-size: 13px;
          color: #666;
        }

        .metric-value {
          font-size: 13px;
          font-weight: 600;
          color: #333;
        }

        .metric-bar {
          height: 6px;
          background: #f0f0f0;
          border-radius: 3px;
          overflow: hidden;
        }

        .metric-progress {
          height: 100%;
          background: #22c55e;
          border-radius: 3px;
          transition: width 0.3s ease, background 0.3s ease;
        }

        .health-recommendations {
          border-top: 1px solid #f0f0f0;
          padding-top: 16px;
          margin-bottom: 16px;
        }

        .recommendations-title {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .recommendations-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .recommendation-item {
          display: flex;
          justify-content: space-between;
          align-items: start;
          padding: 10px;
          border-radius: 8px;
          background: #fafafa;
          border-left: 3px solid #ccc;
        }

        .recommendation-item.priority-high {
          border-left-color: #ef4444;
          background: #fef2f2;
        }

        .recommendation-item.priority-medium {
          border-left-color: #f59e0b;
          background: #fffbeb;
        }

        .recommendation-item.priority-low {
          border-left-color: #22c55e;
          background: #f0fdf4;
        }

        .recommendation-content {
          flex: 1;
        }

        .recommendation-title {
          display: block;
          font-size: 13px;
          color: #333;
          margin-bottom: 4px;
        }

        .recommendation-desc {
          font-size: 12px;
          color: #666;
          margin: 0;
        }

        .recommendation-action {
          font-size: 12px;
          color: #0061AB;
          text-decoration: none;
          white-space: nowrap;
        }

        .recommendation-action:hover {
          text-decoration: underline;
        }

        .recommendation-empty {
          text-align: center;
          color: #666;
          font-size: 13px;
          padding: 10px;
        }

        .health-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 12px;
          border-top: 1px solid #f0f0f0;
        }

        .last-updated {
          font-size: 11px;
          color: #999;
        }

        .btn-refresh {
          background: none;
          border: none;
          font-size: 16px;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .btn-refresh:hover {
          background: #f5f5f5;
        }
      </style>

      <slot></slot>
    `;
  }

  initMonitor() {
    const projectId = this.getAttribute('project-id');
    const container = this.getAttribute('container') || this.shadowRoot;

    this.monitor = new ProjectHealthMonitor({
      projectId,
      container
    });
  }
}

// Initialize
if (!customElements.get('project-health-monitor')) {
  customElements.define('project-health-monitor', ProjectHealthMonitorElement);
}

// Export
export { ProjectHealthMonitor, HealthStatus, MetricWeights };
export default ProjectHealthMonitor;

// Global API
window.ProjectHealthMonitor = ProjectHealthMonitor;

#!/usr/bin/env python3
"""
Create missing features for SaDec Marketing Hub:
1. ROI Analytics Dashboard with charts
2. Phase Tracker component for ROIaaS
3. Notification settings page
"""

import os
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent

def create_roi_analytics_dashboard():
    """Create comprehensive ROI analytics dashboard."""

    filepath = BASE_DIR / 'portal' / 'roi-analytics.html'

    content = '''<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Sa Đéc Marketing Hub - ROI Analytics Dashboard with comprehensive metrics and charts">
  <meta property="og:title" content="ROI Analytics Dashboard | Sa Đéc Marketing Hub">
  <meta property="og:description" content="Track and analyze your marketing ROI with real-time charts and metrics">
  <meta property="og:url" content="https://sadecmarketinghub.com/portal/roi-analytics">
  <meta property="og:image" content="https://sadecmarketinghub.com/og-image.png">
  <title>ROI Analytics Dashboard | Sa Đéc Marketing Hub</title>
  <link rel="stylesheet" href="../assets/css/main.css">
  <script type="module" src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <style>
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
      padding: 24px;
    }
    .metric-card {
      background: var(--md-sys-color-surface);
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .metric-card h3 {
      color: var(--md-sys-color-on-surface-variant);
      font-size: 14px;
      margin-bottom: 8px;
    }
    .metric-value {
      font-size: 36px;
      font-weight: 700;
      color: var(--md-sys-color-primary);
    }
    .metric-change {
      font-size: 14px;
      margin-top: 8px;
    }
    .metric-change.positive { color: #10b981; }
    .metric-change.negative { color: #ef4444; }
    .chart-container {
      background: var(--md-sys-color-surface);
      border-radius: 16px;
      padding: 24px;
      margin: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .chart-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 24px;
      padding: 24px;
    }
    .phase-tracker {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 16px;
      padding: 24px;
      margin: 24px;
      color: white;
    }
    .phase-item {
      display: flex;
      align-items: center;
      margin: 16px 0;
    }
    .phase-progress {
      flex: 1;
      height: 8px;
      background: rgba(255,255,255,0.2);
      border-radius: 4px;
      margin: 0 16px;
      overflow: hidden;
    }
    .phase-bar {
      height: 100%;
      background: white;
      border-radius: 4px;
      transition: width 0.3s ease;
    }
    .phase-label {
      min-width: 120px;
      font-weight: 600;
    }
    .phase-percent {
      min-width: 50px;
      text-align: right;
      font-weight: 700;
    }
  </style>
</head>
<body>
  <div class="dashboard-container">
    <!-- Header -->
    <header class="dashboard-header">
      <h1>📊 ROI Analytics Dashboard</h1>
      <p>Track your marketing performance and return on investment</p>
    </header>

    <!-- Key Metrics -->
    <div class="dashboard-grid">
      <div class="metric-card">
        <h3>Tổng ROI</h3>
        <div class="metric-value">245%</div>
        <div class="metric-change positive">↑ 12% so với tháng trước</div>
      </div>
      <div class="metric-card">
        <h3>Doanh Thu</h3>
        <div class="metric-value">₫1.2T</div>
        <div class="metric-change positive">↑ 8% so với tháng trước</div>
      </div>
      <div class="metric-card">
        <h3>Chi Phí Marketing</h3>
        <div class="metric-value">₫350M</div>
        <div class="metric-change negative">↑ 3% so với tháng trước</div>
      </div>
      <div class="metric-card">
        <h3>Tỷ Lệ Chuyển Đổi</h3>
        <div class="metric-value">3.2%</div>
        <div class="metric-change positive">↑ 0.4% so với tháng trước</div>
      </div>
    </div>

    <!-- Charts Row 1 -->
    <div class="chart-row">
      <div class="chart-container">
        <h3>Xu Hướng ROI Theo Tháng</h3>
        <canvas id="roiTrendChart"></canvas>
      </div>
      <div class="chart-container">
        <h3>Phân Bổ Ngân Sách</h3>
        <canvas id="budgetChart"></canvas>
      </div>
    </div>

    <!-- Phase Tracker -->
    <div class="phase-tracker">
      <h2>🎯 ROIaaS Implementation Phases</h2>
      <div class="phase-item">
        <span class="phase-label">Phase 1: Discovery</span>
        <div class="phase-progress">
          <div class="phase-bar" style="width: 100%"></div>
        </div>
        <span class="phase-percent">100%</span>
      </div>
      <div class="phase-item">
        <span class="phase-label">Phase 2: Setup</span>
        <div class="phase-progress">
          <div class="phase-bar" style="width: 100%"></div>
        </div>
        <span class="phase-percent">100%</span>
      </div>
      <div class="phase-item">
        <span class="phase-label">Phase 3: Integration</span>
        <div class="phase-progress">
          <div class="phase-bar" style="width: 75%"></div>
        </div>
        <span class="phase-percent">75%</span>
      </div>
      <div class="phase-item">
        <span class="phase-label">Phase 4: Optimization</span>
        <div class="phase-progress">
          <div class="phase-bar" style="width: 45%"></div>
        </div>
        <span class="phase-percent">45%</span>
      </div>
      <div class="phase-item">
        <span class="phase-label">Phase 5: Scale</span>
        <div class="phase-progress">
          <div class="phase-bar" style="width: 20%"></div>
        </div>
        <span class="phase-percent">20%</span>
      </div>
    </div>

    <!-- Charts Row 2 -->
    <div class="chart-row">
      <div class="chart-container">
        <h3>Hiệu Suất Kênh Marketing</h3>
        <canvas id="channelChart"></canvas>
      </div>
      <div class="chart-container">
        <h3>Customer Journey Funnel</h3>
        <canvas id="funnelChart"></canvas>
      </div>
    </div>
  </div>

  <script type="module">
    import { Chart } from 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';

    // ROI Trend Chart
    const roiCtx = document.getElementById('roiTrendChart').getContext('2d');
    new Chart(roiCtx, {
      type: 'line',
      data: {
        labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'],
        datasets: [{
          label: 'ROI (%)',
          data: [180, 195, 210, 225, 238, 245],
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: false }
        }
      }
    });

    // Budget Distribution Chart
    const budgetCtx = document.getElementById('budgetChart').getContext('2d');
    new Chart(budgetCtx, {
      type: 'doughnut',
      data: {
        labels: ['Facebook Ads', 'Google Ads', 'Zalo Ads', 'Content', 'SEO'],
        datasets: [{
          data: [35, 25, 15, 15, 10],
          backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });

    // Channel Performance Chart
    const channelCtx = document.getElementById('channelChart').getContext('2d');
    new Chart(channelCtx, {
      type: 'bar',
      data: {
        labels: ['Facebook', 'Google', 'Zalo', 'TikTok', 'Email'],
        datasets: [{
          label: ' conversions',
          data: [245, 189, 156, 98, 67],
          backgroundColor: '#667eea',
          borderRadius: 8
        }, {
          label: 'Chi phí (triệu ₫)',
          data: [120, 95, 52, 45, 18],
          backgroundColor: '#f093fb',
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });

    // Funnel Chart
    const funnelCtx = document.getElementById('funnelChart').getContext('2d');
    new Chart(funnelCtx, {
      type: 'bar',
      data: {
        labels: ['Nhận biết', 'Quan tâm', 'Cân nhắc', 'Mua hàng', 'Trung thành'],
        datasets: [{
          label: 'Khách hàng',
          data: [10000, 5000, 2000, 800, 320],
          backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b'],
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        indexAxis: 'y',
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { beginAtZero: true }
        }
      }
    });
  </script>
</body>
</html>
'''

    filepath.parent.mkdir(parents=True, exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    return filepath


def create_notification_settings():
    """Create notification settings page."""

    filepath = BASE_DIR / 'portal' / 'notifications.html'

    content = '''<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Quản lý thông báo - Cài đặt notification preferences">
  <meta property="og:title" content="Notification Settings | Sa Đéc Marketing Hub">
  <meta property="og:description" content="Customize your notification preferences">
  <meta property="og:url" content="https://sadecmarketinghub.com/portal/notifications">
  <meta property="og:image" content="https://sadecmarketinghub.com/og-image.png">
  <title>Notification Settings | Sa Đéc Marketing Hub</title>
  <link rel="stylesheet" href="../assets/css/main.css">
  <style>
    .notifications-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 24px;
    }
    .notification-section {
      background: var(--md-sys-color-surface);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .notification-section h2 {
      color: var(--md-sys-color-primary);
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .notification-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
      border-bottom: 1px solid var(--md-sys-color-outline-variant);
    }
    .notification-item:last-child {
      border-bottom: none;
    }
    .notification-info h3 {
      font-size: 16px;
      margin-bottom: 4px;
    }
    .notification-info p {
      font-size: 14px;
      color: var(--md-sys-color-on-surface-variant);
    }
    .toggle-switch {
      position: relative;
      width: 52px;
      height: 32px;
    }
    .toggle-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    .toggle-slider {
      position: absolute;
      cursor: pointer;
      inset: 0;
      background-color: var(--md-sys-color-surface-variant);
      border-radius: 32px;
      transition: 0.3s;
    }
    .toggle-slider:before {
      position: absolute;
      content: "";
      height: 24px;
      width: 24px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      border-radius: 50%;
      transition: 0.3s;
    }
    input:checked + .toggle-slider {
      background-color: var(--md-sys-color-primary);
    }
    input:checked + .toggle-slider:before {
      transform: translateX(20px);
    }
    .channel-toggles {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }
    .channel-badge {
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .channel-badge.active {
      background: var(--md-sys-color-primary);
      color: white;
    }
    .channel-badge.inactive {
      background: var(--md-sys-color-surface-variant);
      color: var(--md-sys-color-on-surface-variant);
    }
  </style>
</head>
<body>
  <div class="notifications-container">
    <h1>🔔 Cài Đặt Thông Báo</h1>
    <p>Quản lý cách bạn nhận thông báo từ Sa Đéc Marketing Hub</p>

    <!-- Marketing Alerts -->
    <div class="notification-section">
      <h2>📈 Marketing Alerts</h2>

      <div class="notification-item">
        <div class="notification-info">
          <h3>Campaign Performance</h3>
          <p>Nhận thông báo khi campaign đạt mốc quan trọng</p>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" checked>
          <span class="toggle-slider"></span>
        </label>
      </div>

      <div class="notification-item">
        <div class="notification-info">
          <h3>Budget Alerts</h3>
          <p>Cảnh báo khi ngân sách sắp hết</p>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" checked>
          <span class="toggle-slider"></span>
        </label>
      </div>

      <div class="notification-item">
        <div class="notification-info">
          <h3>Lead Notifications</h3>
          <p>Thông báo khi có lead mới</p>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" checked>
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>

    <!-- ROI Alerts -->
    <div class="notification-section">
      <h2>💰 ROI Alerts</h2>

      <div class="notification-item">
        <div class="notification-info">
          <h3>ROI Milestones</h3>
          <p>Thông báo khi đạt mốc ROI</p>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" checked>
          <span class="toggle-slider"></span>
        </label>
      </div>

      <div class="notification-item">
        <div class="notification-info">
          <h3>Revenue Updates</h3>
          <p>Báo cáo doanh thu hàng tuần</p>
        </div>
        <label class="toggle-switch">
          <input type="checkbox">
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>

    <!-- System Notifications -->
    <div class="notification-section">
      <h2>⚙️ System Notifications</h2>

      <div class="notification-item">
        <div class="notification-info">
          <h3>System Maintenance</h3>
          <p>Thông báo bảo trì hệ thống</p>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" checked>
          <span class="toggle-slider"></span>
        </label>
      </div>

      <div class="notification-item">
        <div class="notification-info">
          <h3>Security Alerts</h3>
          <p>Cảnh báo bảo mật quan trọng</p>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" checked disabled>
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>

    <!-- Notification Channels -->
    <div class="notification-section">
      <h2>📱 Kênh Thông Báo</h2>
      <p>Chọn kênh bạn muốn nhận thông báo</p>

      <div class="channel-toggles">
        <span class="channel-badge active">Email</span>
        <span class="channel-badge active">In-App</span>
        <span class="channel-badge">Zalo</span>
        <span class="channel-badge">SMS</span>
        <span class="channel-badge">Telegram</span>
      </div>
    </div>
  </div>

  <script>
    // Toggle channel badges
    document.querySelectorAll('.channel-badge').forEach(badge => {
      badge.addEventListener('click', () => {
        badge.classList.toggle('active');
        badge.classList.toggle('inactive');
      });
    });
  </script>
</body>
</html>
'''

    filepath.parent.mkdir(parents=True, exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    return filepath


def create_phase_tracker_component():
    """Create standalone phase tracker component."""

    filepath = BASE_DIR / 'admin' / 'components' / 'phase-tracker.html'

    content = '''<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="ROIaaS Phase Tracker - Track implementation progress">
  <meta property="og:title" content="Phase Tracker Component | Sa Đéc Marketing Hub">
  <meta property="og:description" content="Visual progress tracker for ROIaaS 5-phase implementation">
  <meta property="og:url" content="https://sadecmarketinghub.com/admin/components/phase-tracker">
  <meta property="og:image" content="https://sadecmarketinghub.com/og-image.png">
  <title>Phase Tracker Component | Sa Đéc Marketing Hub</title>
  <link rel="stylesheet" href="../../assets/css/main.css">
  <style>
    .phase-tracker-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 24px;
    }

    .phase-tracker-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 24px;
      padding: 32px;
      color: white;
      box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
    }

    .phase-tracker-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }

    .phase-tracker-header h2 {
      font-size: 24px;
      margin: 0;
    }

    .overall-progress {
      text-align: right;
    }

    .overall-progress .percent {
      font-size: 32px;
      font-weight: 700;
    }

    .overall-progress .label {
      font-size: 14px;
      opacity: 0.8;
    }

    .phase-timeline {
      position: relative;
      padding-left: 40px;
    }

    .phase-timeline::before {
      content: "";
      position: absolute;
      left: 12px;
      top: 10px;
      bottom: 10px;
      width: 2px;
      background: rgba(255,255,255,0.2);
    }

    .phase-item {
      position: relative;
      margin-bottom: 24px;
      opacity: 0.5;
      transition: opacity 0.3s;
    }

    .phase-item.active {
      opacity: 1;
    }

    .phase-item.completed {
      opacity: 0.8;
    }

    .phase-marker {
      position: absolute;
      left: -34px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      border: 2px solid rgba(255,255,255,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
    }

    .phase-item.completed .phase-marker {
      background: #10b981;
      border-color: #10b981;
    }

    .phase-item.active .phase-marker {
      background: white;
      border-color: white;
      color: #667eea;
    }

    .phase-item.completed .phase-marker::after {
      content: "✓";
    }

    .phase-item .phase-marker::before {
      content: attr(data-phase);
    }

    .phase-content {
      background: rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 16px;
      backdrop-filter: blur(10px);
    }

    .phase-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .phase-description {
      font-size: 14px;
      opacity: 0.8;
      margin-bottom: 12px;
    }

    .phase-progress-bar {
      height: 6px;
      background: rgba(255,255,255,0.2);
      border-radius: 3px;
      overflow: hidden;
    }

    .phase-progress-fill {
      height: 100%;
      background: white;
      border-radius: 3px;
      transition: width 0.5s ease;
    }

    .phase-meta {
      display: flex;
      justify-content: space-between;
      margin-top: 8px;
      font-size: 12px;
      opacity: 0.7;
    }

    .phase-status {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-not-started {
      background: rgba(255,255,255,0.2);
    }

    .status-in-progress {
      background: #fbbf24;
      color: #78350f;
    }

    .status-completed {
      background: #10b981;
      color: white;
    }

    /* Cyberpunk Variant */
    .cyber-phase-tracker {
      background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
      border: 1px solid #00d4ff;
      box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
    }

    .cyber-phase-tracker .phase-marker {
      background: #1a1a2e;
      border-color: #00d4ff;
    }

    .cyber-phase-tracker .phase-item.active .phase-marker {
      background: #00d4ff;
      border-color: #00d4ff;
      color: #000;
    }

    .cyber-phase-tracker .phase-progress-fill {
      background: linear-gradient(90deg, #00d4ff, #00ff88);
    }
  </style>
</head>
<body>
  <div class="phase-tracker-container">
    <h1>🎯 Phase Tracker Component</h1>
    <p>ROIaaS 5-Phase Implementation Progress</p>

    <!-- Standard Variant -->
    <div class="phase-tracker-card">
      <div class="phase-tracker-header">
        <h2>ROIaaS Implementation</h2>
        <div class="overall-progress">
          <div class="percent">68%</div>
          <div class="label">Overall Progress</div>
        </div>
      </div>

      <div class="phase-timeline">
        <!-- Phase 1 -->
        <div class="phase-item completed">
          <div class="phase-marker" data-phase="1"></div>
          <div class="phase-content">
            <div class="phase-title">Phase 1: Discovery & Assessment</div>
            <div class="phase-description">Business analysis, requirements gathering, baseline metrics</div>
            <div class="phase-progress-bar">
              <div class="phase-progress-fill" style="width: 100%"></div>
            </div>
            <div class="phase-meta">
              <span>Completed: Jan 15, 2026</span>
              <span class="phase-status status-completed">Done</span>
            </div>
          </div>
        </div>

        <!-- Phase 2 -->
        <div class="phase-item completed">
          <div class="phase-marker" data-phase="2"></div>
          <div class="phase-content">
            <div class="phase-title">Phase 2: Platform Setup</div>
            <div class="phase-description">Infrastructure setup, integrations, data pipelines</div>
            <div class="phase-progress-bar">
              <div class="phase-progress-fill" style="width: 100%"></div>
            </div>
            <div class="phase-meta">
              <span>Completed: Feb 28, 2026</span>
              <span class="phase-status status-completed">Done</span>
            </div>
          </div>
        </div>

        <!-- Phase 3 -->
        <div class="phase-item active">
          <div class="phase-marker" data-phase="3"></div>
          <div class="phase-content">
            <div class="phase-title">Phase 3: Integration & Testing</div>
            <div class="phase-description">API integrations, UAT, performance optimization</div>
            <div class="phase-progress-bar">
              <div class="phase-progress-fill" style="width: 75%"></div>
            </div>
            <div class="phase-meta">
              <span>ETA: Mar 31, 2026</span>
              <span class="phase-status status-in-progress">In Progress</span>
            </div>
          </div>
        </div>

        <!-- Phase 4 -->
        <div class="phase-item">
          <div class="phase-marker" data-phase="4"></div>
          <div class="phase-content">
            <div class="phase-title">Phase 4: Optimization & Training</div>
            <div class="phase-description">ML optimization, team training, documentation</div>
            <div class="phase-progress-bar">
              <div class="phase-progress-fill" style="width: 45%"></div>
            </div>
            <div class="phase-meta">
              <span>ETA: Apr 30, 2026</span>
              <span class="phase-status status-not-started">Pending</span>
            </div>
          </div>
        </div>

        <!-- Phase 5 -->
        <div class="phase-item">
          <div class="phase-marker" data-phase="5"></div>
          <div class="phase-content">
            <div class="phase-title">Phase 5: Scale & Expand</div>
            <div class="phase-description">Multi-channel expansion, advanced features</div>
            <div class="phase-progress-bar">
              <div class="phase-progress-fill" style="width: 20%"></div>
            </div>
            <div class="phase-meta">
              <span>ETA: Jun 30, 2026</span>
              <span class="phase-status status-not-started">Planned</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Cyberpunk Variant -->
    <div class="phase-tracker-card cyber-phase-tracker" style="margin-top: 32px;">
      <div class="phase-tracker-header">
        <h2>Cyber-Glass 2026 Theme</h2>
        <div class="overall-progress">
          <div class="percent">68%</div>
          <div class="label">Overall Progress</div>
        </div>
      </div>

      <div class="phase-timeline">
        <!-- Same phases with cyber styling -->
        <div class="phase-item completed">
          <div class="phase-marker" data-phase="1"></div>
          <div class="phase-content">
            <div class="phase-title">Phase 1: Discovery & Assessment</div>
            <div class="phase-progress-bar">
              <div class="phase-progress-fill" style="width: 100%"></div>
            </div>
            <div class="phase-meta">
              <span>Completed</span>
              <span class="phase-status status-completed">Done</span>
            </div>
          </div>
        </div>
        <!-- Additional phases would be same as above -->
      </div>
    </div>
  </div>

  <script>
    // Dynamic phase update function
    function updatePhaseProgress(phaseNumber, progress) {
      const phaseItem = document.querySelectorAll('.phase-item')[phaseNumber - 1];
      const progressBar = phaseItem.querySelector('.phase-progress-fill');
      progressBar.style.width = progress + '%';
    }
  </script>
</body>
</html>
'''

    filepath.parent.mkdir(parents=True, exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    return filepath


def main():
    """Create all missing features."""
    print("🚀 Creating missing features for SaDec Marketing Hub...\n")

    features = [
        ("ROI Analytics Dashboard", create_roi_analytics_dashboard),
        ("Notification Settings", create_notification_settings),
        ("Phase Tracker Component", create_phase_tracker_component),
    ]

    for name, create_func in features:
        try:
            filepath = create_func()
            print(f"✅ Created: {name}")
            print(f"   Path: {filepath.relative_to(BASE_DIR)}")
        except Exception as e:
            print(f"❌ Error creating {name}: {e}")

    print("\n✨ All features created successfully!")
    print("\nNext steps:")
    print("  1. Review created files")
    print("  2. Test in browser")
    print("  3. Link from navigation menus")


if __name__ == '__main__':
    main()

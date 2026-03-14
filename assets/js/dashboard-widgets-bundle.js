/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SA ĐÉC MARKETING HUB — DASHBOARD WIDGETS BUNDLE 2026
 * Consolidated widgets: KPIs, Charts, Alerts, Activity Feeds
 *
 * Bundle includes:
 * - KPI Card Widget (kpi-card.js)
 * - Bar Chart Widget (bar-chart-widget.js)
 * - Line Chart Widget (line-chart-widget.js)
 * - Area Chart Widget (area-chart-widget.js)
 * - Doughnut Chart Widget (doughnut-chart.js)
 * - Alerts Widget (alerts-widget.js)
 * - Activity Feed Widget (activity-feed.js)
 * - Data Table Widget (data-table-widget.js)
 * - Performance Gauge Widget (performance-gauge-widget.js)
 * - Realtime Stats Widget (realtime-stats-widget.js)
 *
 * Usage:
 *   <script type="module" src="/assets/js/dashboard-widgets-bundle.js"></script>
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Import all widget modules
import './widgets/kpi-card.js';
import './widgets/bar-chart-widget.js';
import './widgets/line-chart-widget.js';
import './widgets/area-chart-widget.js';
import './widgets/doughnut-chart-widget.js';
import './widgets/alerts-widget.js';
import './widgets/activity-feed.js';
import './widgets/data-table-widget.js';
import './widgets/performance-gauge-widget.js';
import './widgets/realtime-stats-widget.js';
import './widgets/conversion-funnel.js';
import './widgets/help-tour.js';
import './widgets/command-palette.js';
import './widgets/notification-bell.js';

import { Logger } from './shared/logger.js';

// Export for programmatic use
export { initializeWidgets, updateWidgetData, refreshWidget } from './widgets/index.js';

// Auto-initialize on DOMContentLoaded
function initializeDashboardWidgets() {
    Logger.log('[Dashboard Widgets] All widgets loaded');

    // Dispatch custom event for widgets ready
    window.dispatchEvent(new CustomEvent('dashboard-widgets-ready'));

    // Auto-initialize any widgets that need it
    if (typeof window.initializeWidgets === 'function') {
        window.initializeWidgets();
    }
}

if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeDashboardWidgets);
    } else {
        initializeDashboardWidgets();
    }
}

// Global API
window.DashboardWidgets = {
    // Widget update utilities
    updateKPI: (widgetId, data) => {
        const widget = document.getElementById(widgetId);
        if (widget) {
            if (data.value) widget.setAttribute('value', data.value);
            if (data.trend) widget.setAttribute('trend', data.trend);
            if (data.trendValue) widget.setAttribute('trend-value', data.trendValue);
        }
    },

    updateChart: (chartId, data) => {
        const chart = document.getElementById(chartId);
        if (chart && typeof chart.updateData === 'function') {
            chart.updateData(data);
        }
    },

    showAlert: (options) => {
        const alertsContainer = document.querySelector('.alerts-container');
        if (alertsContainer && typeof alertsContainer.addAlert === 'function') {
            alertsContainer.addAlert(options);
        }
    },

    refreshAll: () => {
        window.dispatchEvent(new CustomEvent('dashboard-widgets-refresh'));
    }
};

Logger.log('[Dashboard Widgets] Bundle loaded');

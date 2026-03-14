/**
 * Dashboard Widgets Index
 * Central module for importing all dashboard widgets
 */

// Export widget classes for programmatic use
import './kpi-card.js';
import './revenue-chart.js';
import './activity-feed.js';
import './project-progress.js';
import './alerts-widget.js';
import './pie-chart-widget.js';
import './line-chart-widget.js';
import './area-chart-widget.js';
import './bar-chart-widget.js';

// New advanced widgets
import './realtime-stats-widget.js';
import './performance-gauge-widget.js';
import './data-table-widget.js';

/**
 * Initialize all dashboard widgets
 * Call this after DOMContentLoaded
 */
export function initializeWidgets() {
    // Widgets are auto-initialized by browser when defined as custom elements
    // This function is for any additional setup needed

    // Dispatch custom event for widgets ready
    window.dispatchEvent(new CustomEvent('dashboard-widgets-ready'));
}

/**
 * Update widget data programmatically
 * @param {string} widgetId - The ID of the widget to update
 * @param {object} data - The data to update
 */
export function updateWidgetData(widgetId, data) {
    const widget = document.getElementById(widgetId);
    if (!widget) {
        return;
    }

    // Update attributes based on data
    Object.entries(data).forEach(([key, value]) => {
        if (widget.hasAttribute(key)) {
            widget.setAttribute(key, value);
        }
    });
}

/**
 * Refresh all widgets
 * Triggers reload of data from API
 */
export function refreshAllWidgets() {
    const events = [
        new CustomEvent('kpi-refresh'),
        new CustomEvent('revenue-refresh'),
        new CustomEvent('activity-refresh'),
        new CustomEvent('project-refresh'),
        new CustomEvent('alerts-refresh'),
        new CustomEvent('pie-chart-refresh'),
        new CustomEvent('line-chart-refresh'),
        new CustomEvent('area-chart-refresh'),
        new CustomEvent('bar-chart-refresh')
    ];

    events.forEach(event => window.dispatchEvent(event));
}

/**
 * Register widgets manually (if needed)
 */
export function registerWidgets() {
}

// Auto-initialize on DOM ready
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        initializeWidgets();
    });
}

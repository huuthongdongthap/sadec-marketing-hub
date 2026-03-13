/**
 * Dashboard Widgets Index
 * Central module for importing all dashboard widgets
 */

// Export widget classes for programmatic use
export { default as KPICardWidget } from './kpi-card.html';
export { default as RevenueChartWidget } from './revenue-chart.js';
export { default as ActivityFeedWidget } from './activity-feed.js';
export { default as ProjectProgressWidget } from './project-progress.js';

/**
 * Initialize all dashboard widgets
 * Call this after DOMContentLoaded
 */
export function initializeWidgets() {
    // Widgets are auto-initialized by browser when defined as custom elements
    // This function is for any additional setup needed

    console.log('[Dashboard Widgets] All widgets initialized');

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
        console.warn(`[Dashboard Widgets] Widget "${widgetId}" not found`);
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
        new CustomEvent('project-refresh')
    ];

    events.forEach(event => window.dispatchEvent(event));
    console.log('[Dashboard Widgets] Refresh triggered');
}

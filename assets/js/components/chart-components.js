/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CHART COMPONENTS — Sa Đéc Marketing Hub
 * Reusable Chart Components (Chart.js)
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Base chart manager
 */
export class ChartManager {
    constructor() {
        this.charts = new Map();
    }

    /**
     * Get chart by name
     * @param {string} name - Chart name
     * @returns {Chart|null} Chart instance
     */
    getChart(name) {
        return this.charts.get(name) || null;
    }

    /**
     * Destroy chart
     * @param {string} name - Chart name
     */
    destroyChart(name) {
        const chart = this.charts.get(name);
        if (chart) {
            chart.destroy();
            this.charts.delete(name);
        }
    }

    /**
     * Destroy all charts
     */
    destroyAll() {
        this.charts.forEach(chart => chart.destroy());
        this.charts.clear();
    }
}

/**
 * ROI Trend Chart (Line Chart)
 */
export class ROITrendChart extends ChartManager {
    constructor(canvasId) {
        super();
        this.canvasId = canvasId;
    }

    init(data) {
        const ctx = document.getElementById(this.canvasId);
        if (!ctx || !window.Chart) return null;

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
        return chart;
    }

    update(data) {
        const chart = this.getChart('roiTrend');
        if (chart) {
            chart.data.labels = data.labels;
            chart.data.datasets[0].data = data.data;
            chart.update('smooth');
        }
    }
}

/**
 * Budget Chart (Doughnut Chart)
 */
export class BudgetChart extends ChartManager {
    constructor(canvasId) {
        super();
        this.canvasId = canvasId;
    }

    init(data) {
        const ctx = document.getElementById(this.canvasId);
        if (!ctx || !window.Chart) return null;

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
        return chart;
    }

    update(data) {
        const chart = this.getChart('budget');
        if (chart) {
            chart.data.labels = data.labels;
            chart.data.datasets[0].data = data.data;
            chart.update();
        }
    }
}

/**
 * Channel Performance Chart (Bar Chart)
 */
export class ChannelChart extends ChartManager {
    constructor(canvasId) {
        super();
        this.canvasId = canvasId;
    }

    init(data) {
        const ctx = document.getElementById(this.canvasId);
        if (!ctx || !window.Chart) return null;

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
        return chart;
    }

    update(data) {
        const chart = this.getChart('channel');
        if (chart) {
            chart.data.datasets[0].data = data.conversions;
            chart.data.datasets[1].data = data.spend;
            chart.update('smooth');
        }
    }
}

/**
 * Funnel Chart (Horizontal Bar Chart)
 */
export class FunnelChart extends ChartManager {
    constructor(canvasId) {
        super();
        this.canvasId = canvasId;
    }

    init(data) {
        const ctx = document.getElementById(this.canvasId);
        if (!ctx || !window.Chart) return null;

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
        return chart;
    }

    update(data) {
        const chart = this.getChart('funnel');
        if (chart) {
            chart.data.labels = data.labels;
            chart.data.datasets[0].data = data.values;
            chart.update('smooth');
        }
    }
}

/**
 * Export all chart components
 */
export default {
    ChartManager,
    ROITrendChart,
    BudgetChart,
    ChannelChart,
    FunnelChart
};

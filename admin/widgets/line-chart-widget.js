/**
 * Line Chart Widget Component
 * Biểu đồ đường cho time series data với Chart.js
 */

class LineChartWidget extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.chart = null;
    }

    static get observedAttributes() {
        return ['title', 'time-range', 'data-type'];
    }

    connectedCallback() {
        this.render();
        this.initChart();
    }

    attributeChangedCallback() {
        this.render();
        this.initChart();
    }

    disconnectedCallback() {
        if (this.chart) {
            this.chart.destroy();
        }
    }

    async initChart() {
        if (!window.Chart) {
            await this.loadChartJS();
        }

        const ctx = this.shadowRoot.getElementById('line-chart');
        if (!ctx) return;

        const chartData = this.getChartData();
        const timeRange = this.getAttribute('time-range') || 'weekly';

        const config = {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: 'rgba(255, 255, 255, 0.8)',
                            font: {
                                family: "'Plus Jakarta Sans', sans-serif",
                                size: 12
                            },
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: 'rgba(255, 255, 255, 0.8)',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: true,
                        callbacks: {
                            label: (context) => {
                                const label = context.dataset.label || '';
                                const value = context.parsed.y || 0;
                                return `${label}: ${this.formatValue(value)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.6)',
                            font: {
                                size: 11
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.6)',
                            font: {
                                size: 11
                            },
                            callback: (value) => this.formatValue(value)
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                },
                elements: {
                    line: {
                        tension: 0.4,
                        borderWidth: 3
                    },
                    point: {
                        radius: 4,
                        hoverRadius: 6,
                        borderWidth: 2
                    }
                }
            }
        };

        this.chart = new Chart(ctx, config);
    }

    getChartData() {
        const type = this.getAttribute('data-type') || 'revenue';
        const timeRange = this.getAttribute('time-range') || 'weekly';

        // Generate labels based on time range
        const labelsConfig = {
            daily: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59'],
            weekly: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            monthly: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            yearly: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        };

        const dataConfig = {
            revenue: {
                labels: labelsConfig[timeRange] || labelsConfig.weekly,
                datasets: [{
                    label: 'Revenue',
                    data: this.generateData(timeRange, 1000, 5000),
                    borderColor: '#00e5ff',
                    backgroundColor: 'rgba(0, 229, 255, 0.1)',
                    fill: true
                }]
            },
            traffic: {
                labels: labelsConfig[timeRange] || labelsConfig.weekly,
                datasets: [{
                    label: 'Visitors',
                    data: this.generateData(timeRange, 500, 2000),
                    borderColor: '#d500f9',
                    backgroundColor: 'rgba(213, 0, 249, 0.1)',
                    fill: true
                }]
            },
            conversions: {
                labels: labelsConfig[timeRange] || labelsConfig.weekly,
                datasets: [
                    {
                        label: 'Conversions',
                        data: this.generateData(timeRange, 50, 200),
                        borderColor: '#00e676',
                        backgroundColor: 'rgba(0, 230, 118, 0.1)',
                        fill: true
                    },
                    {
                        label: 'Goals',
                        data: this.generateData(timeRange, 80, 250),
                        borderColor: '#ff9100',
                        backgroundColor: 'rgba(255, 145, 0, 0.1)',
                        fill: true
                    }
                ]
            },
            orders: {
                labels: labelsConfig[timeRange] || labelsConfig.weekly,
                datasets: [{
                    label: 'Orders',
                    data: this.generateData(timeRange, 100, 500),
                    borderColor: '#ff1744',
                    backgroundColor: 'rgba(255, 23, 68, 0.1)',
                    fill: true
                }]
            }
        };

        return dataConfig[type] || dataConfig.revenue;
    }

    generateData(timeRange, min, max) {
        const count = { daily: 7, weekly: 7, monthly: 4, yearly: 12 }[timeRange] || 7;
        const data = [];
        for (let i = 0; i < count; i++) {
            const value = Math.floor(Math.random() * (max - min + 1)) + min;
            data.push(value);
        }
        return data;
    }

    formatValue(value) {
        if (value >= 1000000) {
            return `$${(value / 1000000).toFixed(1)}M`;
        }
        if (value >= 1000) {
            return `$${(value / 1000).toFixed(0)}K`;
        }
        return `$${value}`;
    }

    async loadChartJS() {
        return new Promise((resolve, reject) => {
            if (window.Chart) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    render() {
        const title = this.getAttribute('title') || 'Trend Chart';

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }
                .line-chart-widget {
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(10px);
                    border-radius: 16px;
                    padding: 24px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    transition: all 0.3s ease;
                }
                .line-chart-widget:hover {
                    box-shadow: 0 12px 40px rgba(0, 229, 255, 0.1);
                }
                .chart-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                    gap: 12px;
                }
                .chart-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: #ffffff;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .chart-title .material-symbols-outlined {
                    color: #00e5ff;
                }
                .chart-controls {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                    align-items: center;
                }
                .chart-btn {
                    padding: 6px 12px;
                    border-radius: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    background: rgba(255, 255, 255, 0.05);
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .chart-btn:hover,
                .chart-btn.active {
                    background: rgba(255, 255, 255, 0.1);
                    color: #ffffff;
                    border-color: rgba(255, 255, 255, 0.4);
                }
                .chart-btn.active {
                    background: linear-gradient(135deg, #00e5ff, #00b8d4);
                    color: #000;
                    border-color: transparent;
                }
                .export-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    padding: 6px 12px;
                    border-radius: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    background: rgba(255, 255, 255, 0.05);
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .export-btn:hover {
                    background: rgba(0, 229, 255, 0.15);
                    color: #00e5ff;
                    border-color: #00e5ff;
                }
                .export-btn .material-symbols-outlined {
                    font-size: 16px;
                }
                .chart-container {
                    position: relative;
                    height: 300px;
                    width: 100%;
                }
                .chart-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 16px;
                    margin-top: 20px;
                    padding-top: 20px;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                }
                .stat-card {
                    padding: 16px;
                    border-radius: 12px;
                    background: rgba(255, 255, 255, 0.03);
                    transition: all 0.2s ease;
                }
                .stat-card:hover {
                    background: rgba(255, 255, 255, 0.06);
                    transform: translateY(-2px);
                }
                .stat-value {
                    font-size: 24px;
                    font-weight: 700;
                    color: #ffffff;
                    margin-bottom: 4px;
                }
                .stat-label {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.5);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .stat-trend {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 12px;
                    margin-top: 8px;
                }
                .stat-trend.positive { color: #00e676; }
                .stat-trend.negative { color: #ff1744; }
                .stat-trend.neutral { color: #9e9e9e; }
                .chart-loading {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 300px;
                    flex-direction: column;
                    gap: 12px;
                }
                .loading-spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid rgba(255, 255, 255, 0.1);
                    border-top-color: #00e5ff;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                /* Responsive */
                @media (max-width: 768px) {
                    .line-chart-widget {
                        padding: 16px;
                    }
                    .chart-container {
                        height: 250px;
                    }
                    .chart-stats {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .chart-header {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    .chart-controls {
                        width: 100%;
                    }
                }
                @media (max-width: 375px) {
                    .chart-container {
                        height: 200px;
                    }
                    .chart-title {
                        font-size: 14px;
                    }
                    .chart-btn, .export-btn {
                        padding: 4px 8px;
                        font-size: 10px;
                    }
                }
            </style>
            <div class="line-chart-widget">
                <div class="chart-header">
                    <h3 class="chart-title">
                        <span class="material-symbols-outlined">timeline</span>
                        ${title}
                    </h3>
                    <div class="chart-controls">
                        <button class="chart-btn active" data-range="daily">Daily</button>
                        <button class="chart-btn" data-range="weekly">Weekly</button>
                        <button class="chart-btn" data-range="monthly">Monthly</button>
                        <button class="chart-btn" data-range="yearly">Yearly</button>
                        <button class="export-btn" id="export-btn" title="Export chart as PNG">
                            <span class="material-symbols-outlined">download</span>
                            Export
                        </button>
                    </div>
                </div>
                <div class="chart-container">
                    <canvas id="line-chart"></canvas>
                </div>
                <div class="chart-stats" id="chart-stats"></div>
            </div>
        `;

        // Add time range toggle
        setTimeout(() => {
            this.shadowRoot.querySelectorAll('.chart-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    this.shadowRoot.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    this.setAttribute('time-range', e.target.dataset.range);
                    this.initChart();
                });
            });

            // Add export button handler
            const exportBtn = this.shadowRoot.getElementById('export-btn');
            if (exportBtn) {
                exportBtn.addEventListener('click', () => {
                    this.exportChart();
                });
            }
        }, 0);
    }

    /**
     * Export chart as PNG
     */
    exportChart() {
        if (!this.chart) {
            this.showToast('Chart not ready', 'warning');
            return;
        }

        try {
            const canvas = this.chart.canvas;
            const dataUrl = canvas.toDataURL('image/png', 1.0);

            const link = document.createElement('a');
            link.download = `chart-${this.getAttribute('title')?.toLowerCase().replace(/\s+/g, '-') || 'chart'}-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();

            this.showToast('Chart exported successfully!', 'success');
        } catch (error) {
            console.error('Export failed:', error);
            this.showToast('Export failed. Please try again.', 'error');
        }
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 12px;
            background: ${type === 'success' ? 'linear-gradient(135deg, #00e676, #00c853)' : type === 'error' ? 'linear-gradient(135deg, #ff1744, #d50000)' : 'linear-gradient(135deg, #00e5ff, #00b8d4)'};
            color: ${type === 'error' ? '#ffffff' : '#000'};
            font-size: 14px;
            font-weight: 500;
            z-index: 10000;
            animation: toastEnter 0.3s ease forwards;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        `;

        const style = document.createElement('style');
        style.textContent = `
            @keyframes toastEnter {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes toastExit {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'toastExit 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

customElements.define('line-chart-widget', LineChartWidget);

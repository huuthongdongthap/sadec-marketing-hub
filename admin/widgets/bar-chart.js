/**
 * Bar Chart Widget Component
 * Interactive bar chart for categorical data comparison
 */

class BarChartWidget extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.chartInstance = null;
    }

    static get observedAttributes() {
        return ['data', 'title', 'color'];
    }

    connectedCallback() {
        this.render();
        this.initChart();
    }

    attributeChangedCallback() {
        if (this.chartInstance) {
            this.updateChart();
        }
    }

    render() {
        const title = this.getAttribute('title') || 'Bar Chart';
        const color = this.getAttribute('color') || '#00e5ff';

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                }
                .chart-container {
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(10px);
                    border-radius: 16px;
                    padding: 24px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    height: 400px;
                }
                .chart-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                .chart-title {
                    font-size: 20px;
                    font-weight: 600;
                    color: #ffffff;
                    font-family: 'Space Grotesk', sans-serif;
                }
                .chart-canvas-container {
                    position: relative;
                    height: 320px;
                    width: 100%;
                }
                .chart-loading {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: rgba(255, 255, 255, 0.6);
                }
                .chart-loading .spinner {
                    width: 24px;
                    height: 24px;
                    border: 2px solid rgba(255, 255, 255, 0.1);
                    border-top-color: ${color};
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            </style>
            <div class="chart-container">
                <div class="chart-header">
                    <h3 class="chart-title">${title}</h3>
                </div>
                <div class="chart-canvas-container">
                    <canvas id="barChart"></canvas>
                    <div class="chart-loading" style="display: none;">
                        <div class="spinner"></div>
                        <span>Loading data...</span>
                    </div>
                </div>
            </div>
        `;
    }

    initChart() {
        const canvas = this.shadowRoot.getElementById('barChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const data = this.getDemoData();

        if (typeof Chart !== 'undefined') {
            this.chartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: 'Value',
                        data: data.values,
                        backgroundColor: this.getGradient(ctx, data.values.length),
                        borderColor: this.getAttribute('color') || '#00e5ff',
                        borderWidth: 1,
                        borderRadius: 8,
                        barThickness: 40
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        x: {
                            grid: { display: false },
                            ticks: { color: 'rgba(255, 255, 255, 0.6)' }
                        },
                        y: {
                            grid: { color: 'rgba(255, 255, 255, 0.1)' },
                            ticks: { color: 'rgba(255, 255, 255, 0.6)' }
                        }
                    }
                }
            });
        } else {
            this.renderSVGBarChart(canvas, data);
        }
    }

    getGradient(ctx, numBars) {
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        const color = this.getAttribute('color') || '#00e5ff';
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'rgba(0, 229, 255, 0.2)');
        return gradient;
    }

    getDemoData() {
        const categories = ['Campaign A', 'Campaign B', 'Campaign C', 'Campaign D', 'Campaign E'];
        const values = categories.map(() => Math.floor(Math.random() * 100) + 20);
        return { labels: categories, values };
    }

    renderSVGBarChart(canvas, data) {
        const width = canvas.offsetWidth || 800;
        const height = canvas.offsetHeight || 320;
        const padding = 60;
        const barWidth = (width - 2 * padding) / data.values.length - 10;
        const maxVal = Math.max(...data.values);

        const bars = data.values.map((val, i) => {
            const x = padding + i * ((width - 2 * padding) / data.values.length) + 5;
            const barHeight = ((val / maxVal) * (height - 2 * padding));
            const y = height - padding - barHeight;
            return `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="#00e5ff" rx="4" />`;
        }).join('');

        canvas.innerHTML = `
            <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
                ${bars}
            </svg>
        `;
    }

    updateChart() {
        if (!this.chartInstance) return;
        const data = this.getDemoData();
        this.chartInstance.data.labels = data.labels;
        this.chartInstance.data.datasets[0].data = data.values;
        this.chartInstance.update();
    }
}

customElements.define('bar-chart-widget', BarChartWidget);

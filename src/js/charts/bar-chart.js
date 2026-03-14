/**
 * Bar Chart Component - SVG based bar chart
 * Usage: <bar-chart data='[{"label":"Q1","value":40}]' color="cyan"></bar-chart>
 */
class BarChart extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['data', 'color', 'height', 'show-labels'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const data = JSON.parse(this.getAttribute('data') || '[]');
    const color = this.getAttribute('color') || 'cyan';
    const height = parseInt(this.getAttribute('height') || '200');
    const showLabels = this.getAttribute('show-labels') !== 'false';

    const colorMap = {
      cyan: '#00e5ff',
      purple: '#d500f9',
      lime: '#c6ff00',
      orange: '#ff9100',
      red: '#ff1744',
      green: '#00e676'
    };

    const barColor = colorMap[color] || color;

    if (!data.length) {
      this.shadowRoot.innerHTML = `
        <style>
          .empty-state {
            display: flex;
            align-items: center;
            justify-content: center;
            height: ${height}px;
            color: rgba(255,255,255,0.5);
            font-size: 14px;
          }
        </style>
        <div class="empty-state">Không có dữ liệu</div>
      `;
      return;
    }

    const maxValue = Math.max(...data.map(d => d.value));
    const barWidth = 40;
    const gap = 20;
    const chartWidth = data.length * (barWidth + gap) + gap;
    const padding = { top: 20, right: 20, bottom: showLabels ? 40 : 20, left: 50 };

    let bars = '';
    data.forEach((d, i) => {
      const barHeight = maxValue ? (d.value / maxValue) * (height - padding.top - padding.bottom) : 0;
      const x = padding.left + i * (barWidth + gap) + gap;
      const y = height - padding.bottom - barHeight;

      bars += `
        <g class="bar-group" style="cursor: pointer;">
          <rect
            class="bar"
            x="${x}"
            y="${y}"
            width="${barWidth}"
            height="${barHeight}"
            fill="${barColor}"
            rx="4"
            style="transition: opacity 0.2s;"
          />
          ${showLabels ? `
            <text
              x="${x + barWidth / 2}"
              y="${height - 10}"
              text-anchor="middle"
              fill="rgba(255,255,255,0.7)"
              font-size="12"
            >${d.label}</text>
          ` : ''}
          <title>${d.label}: ${d.value}</title>
        </g>
      `;
    });

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          overflow-x: auto;
        }
        .chart-container {
          min-width: ${chartWidth}px;
        }
        .bar:hover {
          opacity: 0.8;
        }
      </style>
      <div class="chart-container">
        <svg width="100%" height="${height}" viewBox="0 0 ${chartWidth} ${height}">
          ${bars}
        </svg>
      </div>
    `;
  }
}

customElements.define('bar-chart', BarChart);

/**
 * Line Chart Component - SVG based line chart with area fill
 * Usage: <line-chart data='[{"label":"Mon","value":30}]' color="purple"></line-chart>
 */
class LineChart extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['data', 'color', 'height', 'show-points', 'show-area'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const data = JSON.parse(this.getAttribute('data') || '[]');
    const color = this.getAttribute('color') || 'purple';
    const height = parseInt(this.getAttribute('height') || '200');
    const showPoints = this.getAttribute('show-points') !== 'false';
    const showArea = this.getAttribute('show-area') === 'true';

    const colorMap = {
      cyan: '#00e5ff',
      purple: '#d500f9',
      lime: '#c6ff00',
      orange: '#ff9100',
      red: '#ff1744',
      green: '#00e676'
    };

    const lineColor = colorMap[color] || color;

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
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue || 1;

    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartWidth = data.length * 60 + padding.left + padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const points = data.map((d, i) => {
      const x = padding.left + i * 60;
      const y = padding.top + chartHeight - ((d.value - minValue) / range) * chartHeight;
      return { x, y, label: d.label, value: d.value };
    });

    let pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    if (showArea) {
      const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding.bottom} L ${padding.left} ${height - padding.bottom} Z`;
      pathD = areaD;
    }

    let pointsHTML = '';
    if (showPoints) {
      pointsHTML = points.map(p => `
        <circle
          cx="${p.x}"
          cy="${p.y}"
          r="4"
          fill="${lineColor}"
          stroke="#1a1a2e"
          stroke-width="2"
          style="transition: r 0.2s;"
          class="data-point"
        />
        <title>${p.label}: ${p.value}</title>
      `).join('');
    }

    let labels = '';
    points.forEach(p => {
      labels += `
        <text
          x="${p.x}"
          y="${height - 10}"
          text-anchor="middle"
          fill="rgba(255,255,255,0.7)"
          font-size="11"
        >${p.label}</text>
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
        .line {
          fill: ${showArea ? lineColor + '33' : 'none'};
          stroke: ${lineColor};
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }
        .data-point:hover {
          r: 6;
        }
      </style>
      <div class="chart-container">
        <svg width="100%" height="${height}" viewBox="0 0 ${chartWidth} ${height}">
          <path class="line" d="${pathD}" />
          ${pointsHTML}
          ${labels}
        </svg>
      </div>
    `;
  }
}

customElements.define('line-chart', LineChart);

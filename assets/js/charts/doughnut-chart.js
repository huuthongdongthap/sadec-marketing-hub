/**
 * Doughnut Chart Component - SVG based doughnut chart
 * Usage: <doughnut-chart data='[{"label":"A","value":40}]' size="200"></doughnut-chart>
 */
class DoughnutChart extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['data', 'size', 'show-legend'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const data = JSON.parse(this.getAttribute('data') || '[]');
    const size = parseInt(this.getAttribute('size') || '200');
    const showLegend = this.getAttribute('show-legend') !== 'false';

    const colors = [
      '#00e5ff', '#d500f9', '#c6ff00', '#ff9100', '#ff1744', '#00e676'
    ];

    if (!data.length) {
      this.shadowRoot.innerHTML = `
        <style>
          .empty-state {
            display: flex;
            align-items: center;
            justify-content: center;
            height: ${size}px;
            color: rgba(255,255,255,0.5);
            font-size: 14px;
          }
        </style>
        <div class="empty-state">Không có dữ liệu</div>
      `;
      return;
    }

    const total = data.reduce((sum, d) => sum + d.value, 0);
    const center = size / 2;
    const radius = (size - 40) / 2;
    const innerRadius = radius * 0.6;

    let segments = '';
    let cumulativePercent = 0;

    data.forEach((d, i) => {
      const percent = d.value / total;
      const startAngle = cumulativePercent * 360;
      const endAngle = (cumulativePercent + percent) * 360;
      cumulativePercent += percent;

      const startRad = (startAngle - 90) * Math.PI / 180;
      const endRad = (endAngle - 90) * Math.PI / 180;

      const x1 = center + radius * Math.cos(startRad);
      const y1 = center + radius * Math.sin(startRad);
      const x2 = center + radius * Math.cos(endRad);
      const y2 = center + radius * Math.sin(endRad);
      const x3 = center + innerRadius * Math.cos(endRad);
      const y3 = center + innerRadius * Math.sin(endRad);
      const x4 = center + innerRadius * Math.cos(startRad);
      const y4 = center + innerRadius * Math.sin(startRad);

      const largeArc = percent > 0.5 ? 1 : 0;

      const pathData = [
        `M ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
        `L ${x3} ${y3}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
        'Z'
      ].join(' ');

      segments += `
        <path
          d="${pathData}"
          fill="${colors[i % colors.length]}"
          stroke="#1a1a2e"
          stroke-width="2"
          style="transition: transform 0.2s, opacity 0.2s;"
          class="segment"
        >
          <title>${d.label}: ${d.value} (${(percent * 100).toFixed(1)}%)</title>
        </path>
      `;
    });

    const centerText = `
      <text
        x="${center}"
        y="${center - 5}"
        text-anchor="middle"
        fill="#ffffff"
        font-size="24"
        font-weight="700"
      >${total}</text>
      <text
        x="${center}"
        y="${center + 15}"
        text-anchor="middle"
        fill="rgba(255,255,255,0.6)"
        font-size="12"
      >Tổng</text>
    `;

    let legend = '';
    if (showLegend) {
      legend = '<div class="legend">';
      data.forEach((d, i) => {
        const percent = ((d.value / total) * 100).toFixed(1);
        legend += `
          <div class="legend-item">
            <span class="legend-color" style="background: ${colors[i % colors.length]}"></span>
            <span class="legend-label">${d.label}</span>
            <span class="legend-value">${percent}%</span>
          </div>
        `;
      });
      legend += '</div>';
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .segment:hover {
          opacity: 0.8;
          transform: scale(1.02);
        }
        .legend {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 16px;
          justify-content: center;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
        }
        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 3px;
        }
        .legend-label {
          color: rgba(255,255,255,0.8);
        }
        .legend-value {
          color: rgba(255,255,255,0.5);
          margin-left: 4px;
        }
      </style>
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        ${segments}
        ${centerText}
      </svg>
      ${legend}
    `;
  }
}

customElements.define('doughnut-chart', DoughnutChart);

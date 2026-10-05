/**
 * ═══════════════════════════════════════════════════════════════════════════
 * KPI CARD WIDGET - Dashboard KPI Display (< 200 lines)
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { KPI_COLOR_MAP, generateSparkline, getKpiCardStyles } from './kpi-card-helper.js';

class KpiCardWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['title', 'value', 'trend', 'trend-value', 'icon', 'color', 'sparkline-data'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const title = this.getAttribute('title') || 'KPI';
    const value = this.getAttribute('value') || '0';
    const trend = this.getAttribute('trend') || 'neutral';
    const trendValue = this.getAttribute('trend-value') || '0%';
    const icon = this.getAttribute('icon') || 'analytics';
    const color = this.getAttribute('color') || 'cyan';
    const sparklineData = this.getAttribute('sparkline-data') || '';

    const scheme = KPI_COLOR_MAP[color] || KPI_COLOR_MAP.cyan;
    const sparkline = sparklineData ? generateSparkline(sparklineData, scheme.primary) : '';

    const trendIcon = trend === 'positive' ? 'trending_up' : trend === 'negative' ? 'trending_down' : 'trending_flat';
    const trendColor = trend === 'positive' ? '#00e676' : trend === 'negative' ? '#ff1744' : '#9e9e9e';

    this.shadowRoot.innerHTML = `
      <style>${getKpiCardStyles(scheme, trendColor)}</style>
      <div class="kpi-card ${trend === 'positive' ? 'positive' : ''}">
        <div class="header">
          <div>
            <div class="title">${title}</div>
            <div class="value">${value}</div>
          </div>
          <div class="icon-wrapper">
            <span class="material-symbols-outlined">${icon}</span>
          </div>
        </div>

        <div class="trend-row">
          <span class="material-symbols-outlined trend-icon">${trendIcon}</span>
          <span class="trend-value">${trendValue}</span>
          <span class="trend-label">so với tháng trước</span>
        </div>

        ${sparkline ? `
          <div class="sparkline-container">
            ${sparkline}
          </div>
        ` : ''}
      </div>
    `;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('kpi-card-widget')) {
  customElements.define('kpi-card-widget', KpiCardWidget);
}

export const KpiCard = KpiCardWidget;
export { KpiCardWidget };
export default KpiCardWidget;

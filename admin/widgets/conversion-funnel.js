/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CONVERSION FUNNEL WIDGET - Sa Đéc Marketing Hub
 * ═══════════════════════════════════════════════════════════════════════════
 * Visualization của conversion funnel với nhiều stages
 *
 * Usage:
 *   const funnel = document.querySelector('conversion-funnel-widget');
 *   funnel.setData([{ label, value, convertRate }]);
 */

class ConversionFunnel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.stages = [];
    this.currentPeriod = 7;
  }

  static get observedAttributes() {
    return ['data-stages', 'data-period'];
  }

  connectedCallback() {
    this.render();
    this.loadFunnelData();
    this.addEventListeners();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'data-period' && oldValue !== newValue) {
      this.currentPeriod = parseInt(newValue, 10);
      this.loadFunnelData();
    }
  }

  /**
   * Render HTML structure
   */
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        ${this.getStyles()}
      </style>

      <div class="conversion-funnel-widget" role="figure" aria-label="Biểu đồ chuyển đổi">
        <div class="funnel-header">
          <h3 class="funnel-title">Tỷ Lệ Chuyển Đổi</h3>
          <span class="funnel-period" id="funnel-period">${this.getPeriodLabel()}</span>
        </div>

        <div class="funnel-container" role="list">
          ${this.renderStages()}
        </div>

        <div class="funnel-summary">
          <div class="summary-item">
            <span class="summary-label">Tổng chuyển đổi</span>
            <span class="summary-value" id="total-conversion">-</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Tỷ lệ trung bình</span>
            <span class="summary-value" id="avg-conversion">-</span>
          </div>
        </div>

        <div class="funnel-filters" role="group" aria-label="Bộ lọc thời gian">
          <button class="filter-btn ${this.currentPeriod === 7 ? 'active' : ''}"
                  data-period="7" aria-label="7 ngày" aria-pressed="${this.currentPeriod === 7}">7N</button>
          <button class="filter-btn ${this.currentPeriod === 30 ? 'active' : ''}"
                  data-period="30" aria-label="30 ngày" aria-pressed="${this.currentPeriod === 30}">30N</button>
          <button class="filter-btn ${this.currentPeriod === 90 ? 'active' : ''}"
                  data-period="90" aria-label="90 ngày" aria-pressed="${this.currentPeriod === 90}">90N</button>
        </div>
      </div>
    `;
  }

  /**
   * Render funnel stages
   */
  renderStages() {
    if (!this.stages.length) {
      return '<div class="funnel-empty">Không có dữ liệu</div>';
    }

    const maxValue = this.stages[0]?.value || 1;

    return this.stages.map((stage, index) => {
      const width = Math.max(30, (stage.value / maxValue) * 100);
      const convertRate = index === 0 ? '-' : this.calculateConvertRate(index);
      const convertLabel = index === 0 ? '-' : `${((stage.value / maxValue) * 100).toFixed(1)}%`;

      return `
        <div class="funnel-stage" data-stage="${index + 1}" role="listitem" tabindex="0">
          <div class="stage-bar" style="width: ${width}%;" data-value="${stage.value}">
            <span class="stage-label">${stage.label}</span>
            <span class="stage-value">${this.formatNumber(stage.value)}</span>
          </div>
          <div class="stage-convert">
            <span class="convert-label">${convertLabel}</span>
            <span class="convert-rate ${convertRate.startsWith('-') ? 'negative' : 'positive'}">${convertRate}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Calculate conversion rate between stages
   */
  calculateConvertRate(stageIndex) {
    if (stageIndex === 0) return '-';

    const prevValue = this.stages[stageIndex - 1]?.value || 0;
    const currentValue = this.stages[stageIndex]?.value || 0;

    if (prevValue === 0) return '0%';

    const rate = ((currentValue - prevValue) / prevValue) * 100;
    return `${rate >= 0 ? '+' : ''}${rate.toFixed(1)}%`;
  }

  /**
   * Load funnel data from API or localStorage
   */
  loadFunnelData() {
    // Try to load from API first
    this.fetchFunnelData();
  }

  /**
   * Fetch funnel data from API
   */
  async fetchFunnelData() {
    try {
      // API endpoint placeholder
      const response = await fetch(`/api/analytics/funnel?period=${this.currentPeriod}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        this.setData(data.stages);
      } else {
        // Use demo data if API fails
        this.loadDemoData();
      }
    } catch (error) {
      console.warn('Funnel API error, using demo data:', error.message);
      this.loadDemoData();
    }
  }

  /**
   * Load demo data for development
   */
  loadDemoData() {
    const demoData = {
      7: [
        { label: 'Khách truy cập', value: 10000 },
        { label: 'Khách tiềm năng', value: 7500 },
        { label: 'Khách quan tâm', value: 5000 },
        { label: 'Khách liên hệ', value: 3000 },
        { label: 'Khách hàng', value: 1500 },
        { label: 'Khách trung thành', value: 500 }
      ],
      30: [
        { label: 'Khách truy cập', value: 42000 },
        { label: 'Khách tiềm năng', value: 31500 },
        { label: 'Khách quan tâm', value: 21000 },
        { label: 'Khách liên hệ', value: 12600 },
        { label: 'Khách hàng', value: 6300 },
        { label: 'Khách trung thành', value: 2100 }
      ],
      90: [
        { label: 'Khách truy cập', value: 125000 },
        { label: 'Khách tiềm năng', value: 93750 },
        { label: 'Khách quan tâm', value: 62500 },
        { label: 'Khách liên hệ', value: 37500 },
        { label: 'Khách hàng', value: 18750 },
        { label: 'Khách trung thành', value: 6250 }
      ]
    };

    this.stages = demoData[this.currentPeriod] || demoData[7];
    this.updateSummary();
    this.renderStagesOnly();
  }

  /**
   * Set funnel data programmatically
   */
  setData(stages) {
    this.stages = stages;
    this.updateSummary();
    this.renderStagesOnly();
  }

  /**
   * Update summary statistics
   */
  updateSummary() {
    if (!this.stages.length) return;

    const firstValue = this.stages[0]?.value || 0;
    const lastValue = this.stages[this.stages.length - 1]?.value || 0;

    const totalConversion = firstValue > 0
      ? ((lastValue / firstValue) * 100).toFixed(1)
      : '0';

    const rates = this.stages.slice(1).map((_, i) => {
      const prev = this.stages[i]?.value || 0;
      const curr = this.stages[i + 1]?.value || 0;
      return prev > 0 ? (curr / prev) * 100 : 0;
    });

    const avgConversion = rates.length > 0
      ? (rates.reduce((a, b) => a + b, 0) / rates.length).toFixed(1)
      : '0';

    const totalEl = this.shadowRoot.querySelector('#total-conversion');
    const avgEl = this.shadowRoot.querySelector('#avg-conversion');

    if (totalEl) totalEl.textContent = `${totalConversion}%`;
    if (avgEl) avgEl.textContent = `${avgConversion}%`;
  }

  /**
   * Re-render only stages (for data updates)
   */
  renderStagesOnly() {
    const container = this.shadowRoot.querySelector('.funnel-container');
    if (container) {
      container.innerHTML = this.renderStages();
      this.addStageAnimations();
    }

    const periodEl = this.shadowRoot.querySelector('#funnel-period');
    if (periodEl) periodEl.textContent = this.getPeriodLabel();
  }

  /**
   * Add event listeners
   */
  addEventListeners() {
    this.shadowRoot.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const period = parseInt(e.target.dataset.period, 10);
        this.currentPeriod = period;
        this.updateFilterButtons();
        this.loadFunnelData();
      });
    });
  }

  /**
   * Update filter button states
   */
  updateFilterButtons() {
    this.shadowRoot.querySelectorAll('.filter-btn').forEach(btn => {
      const period = parseInt(btn.dataset.period, 10);
      const isActive = period === this.currentPeriod;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive);
    });
  }

  /**
   * Add animations to stages
   */
  addStageAnimations() {
    this.shadowRoot.querySelectorAll('.funnel-stage').forEach((stage, index) => {
      stage.style.opacity = '0';
      stage.style.transform = 'translateX(-20px)';

      setTimeout(() => {
        stage.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        stage.style.opacity = '1';
        stage.style.transform = 'translateX(0)';
      }, index * 100);
    });
  }

  /**
   * Get period label
   */
  getPeriodLabel() {
    return `${this.currentPeriod} ngày qua`;
  }

  /**
   * Format number with thousand separators
   */
  formatNumber(num) {
    return new Intl.NumberFormat('vi-VN').format(num);
  }

  /**
   * Get CSS styles
   */
  getStyles() {
    return `
      :host {
        display: block;
        font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }

      .conversion-funnel-widget {
        background: var(--md-sys-color-surface, #fff);
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      }

      .funnel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }

      .funnel-title {
        font-size: 18px;
        font-weight: 600;
        color: var(--md-sys-color-on-surface, #1a1a1a);
        margin: 0;
      }

      .funnel-period {
        font-size: 13px;
        color: var(--md-sys-color-on-surface-variant, #666);
      }

      .funnel-container {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .funnel-stage {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 0;
        cursor: pointer;
        transition: background 0.2s;
      }

      .funnel-stage:hover,
      .funnel-stage:focus {
        background: var(--md-sys-color-surface-variant, #f5f5f5);
        border-radius: 8px;
      }

      .stage-bar {
        height: 40px;
        background: linear-gradient(90deg,
          var(--md-sys-color-primary, #1976d2) 0%,
          var(--md-sys-color-secondary, #42a5f5) 100%);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 12px;
        min-width: 120px;
        transition: width 0.5s ease;
      }

      .stage-label {
        font-size: 12px;
        color: #fff;
        font-weight: 500;
      }

      .stage-value {
        font-size: 14px;
        color: #fff;
        font-weight: 600;
      }

      .stage-convert {
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 60px;
      }

      .convert-label {
        font-size: 11px;
        color: var(--md-sys-color-on-surface-variant, #666);
      }

      .convert-rate {
        font-size: 12px;
        font-weight: 600;
      }

      .convert-rate.positive {
        color: var(--md-sys-color-tertiary, #4caf50);
      }

      .convert-rate.negative {
        color: var(--md-sys-color-error, #f44336);
      }

      .funnel-connector {
        display: flex;
        justify-content: center;
        color: var(--md-sys-color-outline, #999);
        font-size: 16px;
      }

      .funnel-summary {
        display: flex;
        justify-content: space-around;
        padding: 16px 0;
        margin-top: 16px;
        border-top: 1px solid var(--md-sys-color-outline-variant, #e0e0e0);
      }

      .summary-item {
        text-align: center;
      }

      .summary-label {
        display: block;
        font-size: 12px;
        color: var(--md-sys-color-on-surface-variant, #666);
        margin-bottom: 4px;
      }

      .summary-value {
        display: block;
        font-size: 20px;
        font-weight: 700;
        color: var(--md-sys-color-primary, #1976d2);
      }

      .funnel-filters {
        display: flex;
        gap: 8px;
        margin-top: 16px;
      }

      .filter-btn {
        flex: 1;
        padding: 8px 12px;
        border: 1px solid var(--md-sys-color-outline, #ddd);
        border-radius: 8px;
        background: var(--md-sys-color-surface, #fff);
        color: var(--md-sys-color-on-surface, #333);
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }

      .filter-btn:hover {
        background: var(--md-sys-color-surface-variant, #f5f5f5);
      }

      .filter-btn.active {
        background: var(--md-sys-color-primary, #1976d2);
        color: #fff;
        border-color: var(--md-sys-color-primary, #1976d2);
      }

      .funnel-empty {
        text-align: center;
        padding: 40px;
        color: var(--md-sys-color-on-surface-variant, #999);
      }

      @media (prefers-color-scheme: dark) {
        .stage-bar {
          background: linear-gradient(90deg,
            var(--md-sys-color-primary-dark, #64b5f6) 0%,
            var(--md-sys-color-secondary-dark, #42a5f5) 100%);
        }
      }
    `;
  }
}

// Register custom element
if (!customElements.get('conversion-funnel')) {
  customElements.define('conversion-funnel', ConversionFunnel);
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ConversionFunnel;
}

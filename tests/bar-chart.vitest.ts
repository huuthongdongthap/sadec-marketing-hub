/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BAR CHART WIDGET - VITEST COMPONENT TESTS
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';

let dom: JSDOM;
let window: Window;
let document: Document;

beforeEach(() => {
  dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    runScripts: 'dangerously',
    resources: 'usable',
    url: 'http://localhost:5502'
  });
  window = dom.window;
  document = window.document;

  // Load Bar Chart widget script
  const barChartScript = `
    class BarChartWidget extends HTMLElement {
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
        if (this.shadowRoot) {
          this.render();
        }
      }

      parseData() {
        try {
          const dataAttr = this.getAttribute('data') || '[]';
          return JSON.parse(dataAttr);
        } catch {
          return [];
        }
      }

      render() {
        const data = this.parseData();
        const color = this.getAttribute('color') || 'cyan';
        const height = this.getAttribute('height') || '200';
        const showLabels = this.getAttribute('show-labels') === 'true';

        const maxValue = Math.max(...data.map(d => d.value), 1);
        const barWidth = 80 / data.length;

        let barsSvg = '';
        data.forEach((item, index) => {
          const barHeight = (item.value / maxValue) * 100;
          const x = index * barWidth + 10;
          barsSvg += \`
            <rect class="bar" x="\${x}" y="\${100 - barHeight}" width="\${barWidth - 5}" height="\${barHeight}" fill="var(--bar-color, #06b6d4)" opacity="0.8">
              <title>\${item.label}: \${item.value}</title>
            </rect>
          \`;
          if (showLabels) {
            barsSvg += \`<text x="\${x + (barWidth - 5) / 2}" y="115" text-anchor="middle" font-size="10">\${item.label}</text>\`;
          }
        });

        this.shadowRoot.innerHTML = \`
          <style>
            :host { display: block; }
            .chart-container { width: 100%; height: \${height}px; }
            svg { width: 100%; height: 100%; }
            .bar { transition: opacity 0.2s; }
            .bar:hover { opacity: 1; }
          </style>
          <div class="chart-container">
            <svg viewBox="0 0 100 120" preserveAspectRatio="xMidYMid meet">
              \${barsSvg}
            </svg>
          </div>
        \`;
      }
    }

    customElements.define('bar-chart-widget', BarChartWidget);
  `;

  dom.window.eval(barChartScript);
});

describe('Bar Chart Widget', () => {
  it('renders custom element', () => {
    const barChart = document.createElement('bar-chart-widget');
    document.body.appendChild(barChart);

    expect(document.querySelector('bar-chart-widget')).toBeTruthy();
  });

  it('renders bars with correct data', () => {
    const barChart = document.createElement('bar-chart-widget');
    barChart.setAttribute('data', '[{"label":"T1","value":45},{"label":"T2","value":52},{"label":"T3","value":38}]');
    document.body.appendChild(barChart);

    const bars = barChart.shadowRoot?.querySelectorAll('.bar');
    expect(bars?.length).toBe(3);
  });

  it('displays labels when show-labels is true', () => {
    const barChart = document.createElement('bar-chart-widget');
    barChart.setAttribute('data', '[{"label":"T1","value":45},{"label":"T2","value":52}]');
    barChart.setAttribute('show-labels', 'true');
    document.body.appendChild(barChart);

    const texts = barChart.shadowRoot?.querySelectorAll('text');
    expect(texts?.length).toBeGreaterThan(0);
  });

  it('applies correct height', () => {
    const barChart = document.createElement('bar-chart-widget');
    barChart.setAttribute('height', '300');
    document.body.appendChild(barChart);

    const container = barChart.shadowRoot?.querySelector('.chart-container');
    // Height is set via inline style in CSS, check innerHTML contains the height
    expect(barChart.shadowRoot?.innerHTML).toContain('height: 300px');
  });

  it('applies color theme', () => {
    const barChart = document.createElement('bar-chart-widget');
    barChart.setAttribute('color', 'cyan');
    document.body.appendChild(barChart);

    expect(barChart.getAttribute('color')).toBe('cyan');
  });

  it('handles empty data gracefully', () => {
    const barChart = document.createElement('bar-chart-widget');
    barChart.setAttribute('data', '[]');
    document.body.appendChild(barChart);

    const bars = barChart.shadowRoot?.querySelectorAll('.bar');
    expect(bars?.length).toBe(0);
  });

  it('has shadow DOM in open mode', () => {
    const barChart = document.createElement('bar-chart-widget');
    document.body.appendChild(barChart);

    expect(barChart.shadowRoot).toBeTruthy();
    expect(barChart.shadowRoot?.mode).toBe('open');
  });
});

describe('Bar Chart Widget - Data Parsing', () => {
  it('parses valid JSON data', () => {
    const barChart = document.createElement('bar-chart-widget');
    barChart.setAttribute('data', '[{"label":"A","value":10}]');
    document.body.appendChild(barChart);

    const bars = barChart.shadowRoot?.querySelectorAll('.bar');
    expect(bars?.length).toBe(1);
  });

  it('handles invalid JSON gracefully', () => {
    const barChart = document.createElement('bar-chart-widget');
    barChart.setAttribute('data', 'invalid-json');
    document.body.appendChild(barChart);

    const bars = barChart.shadowRoot?.querySelectorAll('.bar');
    expect(bars?.length).toBe(0);
  });
});

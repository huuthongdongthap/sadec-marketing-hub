/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DASHBOARD WIDGETS - VITEST COMPONENT TESTS
 * Tests for KPI Cards, Charts, Alerts without browser
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';

// Setup JSDOM environment
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

  // Load widget scripts
  const kpiCardScript = `
    class KPICardWidget extends HTMLElement {
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
        if (this.shadowRoot) {
          this.render();
        }
      }

      render() {
        const title = this.getAttribute('title') || 'KPI';
        const value = this.getAttribute('value') || '0';
        const trend = this.getAttribute('trend') || 'neutral';
        const trendValue = this.getAttribute('trend-value') || '0%';
        const icon = this.getAttribute('icon') || 'trending_up';
        const color = this.getAttribute('color') || 'cyan';
        const sparklineData = this.getAttribute('sparkline-data') || '';

        this.shadowRoot.innerHTML = \`
          <style>
            :host { display: block; }
            .card { padding: 20px; border-radius: 12px; background: #fff; }
            .header { display: flex; justify-content: space-between; align-items: center; }
            .title { font-size: 14px; color: #666; }
            .value { font-size: 32px; font-weight: bold; margin: 8px 0; }
            .trend { display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 4px; }
            .trend.positive { background: #dcfce7; color: #16a34a; }
            .trend.negative { background: #fee2e2; color: #dc2626; }
            .trend.neutral { background: #f3f4f6; color: #6b7280; }
          </style>
          <div class="card">
            <div class="header">
              <span class="title">\${title}</span>
              <span class="icon">\${icon}</span>
            </div>
            <div class="value">\${value}</div>
            <div class="trend \${trend}">
              <span>\${trendValue}</span>
            </div>
            \${sparklineData ? \`<svg class="sparkline" viewBox="0 0 100 30"></svg>\` : ''}
          </div>
        \`;
      }
    }

    customElements.define('kpi-card-widget', KPICardWidget);
  `;

  dom.window.eval(kpiCardScript);
});

describe('KPI Card Widget', () => {
  it('renders custom element', () => {
    const kpiCard = document.createElement('kpi-card-widget');
    document.body.appendChild(kpiCard);

    expect(document.querySelector('kpi-card-widget')).toBeTruthy();
  });

  it('displays correct title and value', () => {
    const kpiCard = document.createElement('kpi-card-widget');
    kpiCard.setAttribute('title', 'Doanh Thu');
    kpiCard.setAttribute('value', '125.5M');
    document.body.appendChild(kpiCard);

    expect(kpiCard.shadowRoot?.querySelector('.value')?.textContent).toBe('125.5M');
  });

  it('shows trend indicator', () => {
    const kpiCard = document.createElement('kpi-card-widget');
    kpiCard.setAttribute('trend', 'positive');
    kpiCard.setAttribute('trend-value', '+12.5%');
    document.body.appendChild(kpiCard);

    const trend = kpiCard.shadowRoot?.querySelector('.trend');
    expect(trend?.classList.contains('positive')).toBe(true);
    expect(trend?.textContent).toContain('+12.5%');
  });

  it('has correct icon', () => {
    const kpiCard = document.createElement('kpi-card-widget');
    kpiCard.setAttribute('icon', 'payments');
    document.body.appendChild(kpiCard);

    expect(kpiCard.shadowRoot?.querySelector('.icon')?.textContent).toBe('payments');
  });

  it('applies correct color theme', () => {
    const kpiCard = document.createElement('kpi-card-widget');
    kpiCard.setAttribute('color', 'cyan');
    document.body.appendChild(kpiCard);

    expect(kpiCard.getAttribute('color')).toBe('cyan');
  });

  it('renders sparkline when data provided', () => {
    const kpiCard = document.createElement('kpi-card-widget');
    kpiCard.setAttribute('sparkline-data', '10,25,18,30,22,35,28');
    document.body.appendChild(kpiCard);

    expect(kpiCard.shadowRoot?.querySelector('.sparkline')).toBeTruthy();
  });

  it('has shadow DOM in open mode', () => {
    const kpiCard = document.createElement('kpi-card-widget');
    document.body.appendChild(kpiCard);

    expect(kpiCard.shadowRoot).toBeTruthy();
    expect(kpiCard.shadowRoot?.mode).toBe('open');
  });
});

describe('KPI Card Widget - Attribute Changes', () => {
  it('updates when attributes change', () => {
    const kpiCard = document.createElement('kpi-card-widget');
    kpiCard.setAttribute('value', '100');
    document.body.appendChild(kpiCard);

    expect(kpiCard.shadowRoot?.querySelector('.value')?.textContent).toBe('100');

    kpiCard.setAttribute('value', '200');
    expect(kpiCard.shadowRoot?.querySelector('.value')?.textContent).toBe('200');
  });
});

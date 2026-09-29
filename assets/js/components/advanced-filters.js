/**
 * Advanced Filters Component
 * Multi-criteria filtering with filter chips and presets
 * @version 1.0.0 | 2026-03-14
 */

import { Logger } from '../shared/logger.js';

class AdvancedFilters extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.filters = new Map();
    this.activeFilters = [];
    this.presets = [];
  }

  static get observedAttributes() {
    return ['target', 'filters-config', 'enable-presets'];
  }

  connectedCallback() {
    this.target = this.getAttribute('target') || 'table';
    this.enablePresets = this.getAttribute('enable-presets') === 'true';
    this.filtersConfig = this.parseFiltersConfig();
    this.loadPresets();
    this.render();
    this.bindEvents();
  }

  parseFiltersConfig() {
    const configAttr = this.getAttribute('filters-config');
    if (!configAttr) return [];
    try {
      return JSON.parse(configAttr);
    } catch (e) {
      Logger.error('advanced-filters', 'Invalid filters-config JSON');
      return [];
    }
  }

  loadPresets() {
    if (!this.enablePresets) return;
    const stored = localStorage.getItem('sadec-filter-presets');
    if (stored) {
      this.presets = JSON.parse(stored);
    }
  }

  savePreset(name) {
    const preset = { name, filters: [...this.activeFilters] };
    this.presets.push(preset);
    localStorage.setItem('sadec-filter-presets', JSON.stringify(this.presets));
    Logger.success('advanced-filters', `Saved preset: ${name}`);
  }

  loadPreset(name) {
    const preset = this.presets.find(p => p.name === name);
    if (!preset) return;
    this.activeFilters = [...preset.filters];
    this.applyFilters();
    this.renderChips();
    Logger.success('advanced-filters', `Loaded preset: ${name}`);
  }

  deletePreset(name) {
    this.presets = this.presets.filter(p => p.name !== name);
    localStorage.setItem('sadec-filter-presets', JSON.stringify(this.presets));
    this.renderPresets();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .filters-container {
          background: var(--md-sys-color-surface, #fff);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .filters-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .filters-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--md-sys-color-on-surface, #333);
        }
        .filters-actions {
          display: flex;
          gap: 8px;
        }
        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
          margin-bottom: 16px;
        }
        .filter-field {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .filter-field label {
          font-size: 12px;
          color: var(--md-sys-color-on-surface-variant, #666);
          font-weight: 500;
        }
        .filter-field input,
        .filter-field select {
          padding: 8px 12px;
          border: 1px solid var(--md-sys-color-outline, #ddd);
          border-radius: 8px;
          font-size: 14px;
          background: var(--md-sys-color-surface, #fff);
          color: var(--md-sys-color-on-surface, #333);
        }
        .filter-field input:focus,
        .filter-field select:focus {
          outline: 2px solid var(--md-sys-color-primary, #0061AB);
          border-color: transparent;
        }
        .filter-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
          min-height: 32px;
        }
        .filter-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: var(--md-sys-color-primary-container, #e3f2fd);
          color: var(--md-sys-color-on-primary-container, #0061AB);
          border-radius: 16px;
          font-size: 13px;
          font-weight: 500;
        }
        .filter-chip button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 2px;
          color: inherit;
          opacity: 0.7;
        }
        .filter-chip button:hover {
          opacity: 1;
        }
        .clear-all {
          padding: 6px 12px;
          background: var(--md-sys-color-error-container, #ffebee);
          color: var(--md-sys-color-on-error-container, #c62828);
          border: none;
          border-radius: 16px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
        }
        .preset-select {
          padding: 8px 12px;
          border: 1px solid var(--md-sys-color-outline, #ddd);
          border-radius: 8px;
          background: var(--md-sys-color-surface, #fff);
          color: var(--md-sys-color-on-surface, #333);
          font-size: 14px;
        }
        .btn {
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }
        .btn-primary {
          background: var(--md-sys-color-primary, #0061AB);
          color: white;
        }
        .btn-primary:hover {
          background: var(--md-sys-color-on-primary, #004d8a);
        }
        .btn-outline {
          background: transparent;
          border: 1px solid var(--md-sys-color-outline, #ddd);
          color: var(--md-sys-color-on-surface, #333);
        }
      </style>
      <div class="filters-container">
        <div class="filters-header">
          <span class="filters-title">🔍 Bộ lọc nâng cao</span>
          <div class="filters-actions">
            ${this.enablePresets ? `
              <select class="preset-select" aria-label="Chọn preset">
                <option value="">Lưu preset...</option>
                ${this.presets.map(p => `<option value="${p.name}">${p.name}</option>`).join('')}
              </select>
              <button class="btn btn-outline" id="save-preset">💾 Lưu</button>
            ` : ''}
            <button class="btn btn-primary" id="apply-filters">Áp dụng</button>
          </div>
        </div>
        <div class="filters-grid" id="filters-grid"></div>
        <div class="filter-chips" id="filter-chips"></div>
      </div>
    `;
  }

  renderFilters() {
    const grid = this.shadowRoot.getElementById('filters-grid');
    if (!grid || this.filtersConfig.length === 0) return;

    grid.innerHTML = this.filtersConfig.map(filter => `
      <div class="filter-field" data-field="${filter.field}">
        <label for="${filter.field}">${filter.label}</label>
        ${this.renderFilterInput(filter)}
      </div>
    `).join('');
  }

  renderFilterInput(filter) {
    switch (filter.type) {
      case 'select':
        return `
          <select id="${filter.field}" data-type="select">
            <option value="">Tất cả</option>
            ${filter.options.map(o => `<option value="${o.value}">${o.label}</option>`).join('')}
          </select>
        `;
      case 'date':
        return `<input type="date" id="${filter.field}" data-type="date">`;
      case 'range':
        return `
          <div style="display:flex;gap:8px;">
            <input type="number" id="${filter.field}-min" placeholder="Min" data-type="range-min">
            <input type="number" id="${filter.field}-max" placeholder="Max" data-type="range-max">
          </div>
        `;
      default:
        return `<input type="text" id="${filter.field}" placeholder="${filter.placeholder || ''}" data-type="text">`;
    }
  }

  renderChips() {
    const chipsContainer = this.shadowRoot.getElementById('filter-chips');
    if (!chipsContainer) return;

    if (this.activeFilters.length === 0) {
      chipsContainer.innerHTML = '<span style="color:#999;font-size:13px;">Chưa có bộ lọc nào</span>';
      return;
    }

    chipsContainer.innerHTML = `
      ${this.activeFilters.map(f => `
        <span class="filter-chip">
          ${f.label}: ${f.value}
          <button aria-label="Remove filter" data-filter="${f.field}">✕</button>
        </span>
      `).join('')}
      <button class="clear-all" id="clear-all">Xóa tất cả</button>
    `;

    chipsContainer.querySelectorAll('.filter-chip button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const field = e.target.dataset.filter;
        this.removeFilter(field);
      });
    });

    const clearAll = chipsContainer.getElementById?.('clear-all') || chipsContainer.querySelector('#clear-all');
    if (clearAll) {
      clearAll.addEventListener('click', () => this.clearAllFilters());
    }
  }

  renderPresets() {
    const select = this.shadowRoot.querySelector('.preset-select');
    if (!select || !this.enablePresets) return;
    select.innerHTML = `
      <option value="">Lưu preset...</option>
      ${this.presets.map(p => `<option value="${p.name}">${p.name}</option>`).join('')}
    `;
  }

  bindEvents() {
    const applyBtn = this.shadowRoot.getElementById('apply-filters');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => this.applyFilters());
    }

    const saveBtn = this.shadowRoot.getElementById('save-preset');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const name = prompt('Nhập tên preset:');
        if (name) this.savePreset(name);
      });
    }

    const presetSelect = this.shadowRoot.querySelector('.preset-select');
    if (presetSelect) {
      presetSelect.addEventListener('change', (e) => {
        if (e.target.value) {
          this.loadPreset(e.target.value);
          e.target.value = '';
        }
      });
    }
  }

  applyFilters() {
    this.activeFilters = [];
    const target = document.querySelector(this.target);

    this.filtersConfig.forEach(filter => {
      const element = this.shadowRoot.getElementById(filter.field);
      if (!element) return;

      let value = '';
      let label = '';

      if (filter.type === 'range') {
        const min = this.shadowRoot.getElementById(`${filter.field}-min`)?.value;
        const max = this.shadowRoot.getElementById(`${filter.field}-max`)?.value;
        if (min || max) {
          value = `${min || '∞'} - ${max || '∞'}`;
          label = `${filter.label}: ${value}`;
          this.activeFilters.push({ field: filter.field, value, label, min, max, type: 'range' });
        }
      } else {
        value = element.value;
        if (value) {
          const option = element.querySelector(`option[value="${value}"]`);
          label = option ? option.textContent : `${filter.label}: ${value}`;
          this.activeFilters.push({ field: filter.field, value: element.value, label, type: filter.type });
        }
      }
    });

    this.renderChips();
    this.dispatchFilterEvent();
    Logger.debug('advanced-filters', `Applied ${this.activeFilters.length} filters`);
  }

  removeFilter(field) {
    this.activeFilters = this.activeFilters.filter(f => f.field !== field);
    const element = this.shadowRoot.getElementById(field);
    if (element) element.value = '';
    this.renderChips();
    this.dispatchFilterEvent();
  }

  clearAllFilters() {
    this.activeFilters = [];
    this.filtersConfig.forEach(filter => {
      const element = this.shadowRoot.getElementById(filter.field);
      if (element) element.value = '';
      if (filter.type === 'range') {
        const min = this.shadowRoot.getElementById(`${filter.field}-min`);
        const max = this.shadowRoot.getElementById(`${filter.field}-max`);
        if (min) min.value = '';
        if (max) max.value = '';
      }
    });
    this.renderChips();
    this.dispatchFilterEvent();
  }

  dispatchFilterEvent() {
    const event = new CustomEvent('filters-change', {
      detail: { filters: this.activeFilters },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }

  getFilters() {
    return this.activeFilters;
  }
}

if (!customElements.get('advanced-filters')) {
  customElements.define('advanced-filters', AdvancedFilters);
}

Logger.debug('advanced-filters', 'Component registered');

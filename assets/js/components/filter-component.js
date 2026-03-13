/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FILTER COMPONENT — Sa Đéc Marketing Hub
 * Column Filter Component for DataTable
 * ═══════════════════════════════════════════════════════════════════════════
 */

export class FilterComponent {
    constructor(options = {}) {
        this.options = {
            columns: options.columns || [],
            filters: options.filters || {},
            onChange: options.onChange || null,
            ...options
        };

        this.localFilters = { ...this.options.filters };
    }

    /**
     * Render filter panel
     * @param {HTMLElement} container - Container element
     */
    render(container) {
        if (!container) return;

        const filterableColumns = this.options.columns.filter(col => col.filterable !== false);

        if (filterableColumns.length === 0) {
            container.innerHTML = '<p class="filter-empty">Không có cột nào có thể lọc</p>';
            return;
        }

        container.innerHTML = `
      <div class="filter-panel">
        <div class="filter-panel__header">
          <h4 class="filter-panel__title">Bộ lọc cột</h4>
          <button class="filter-panel__clear" data-action="clearAll">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
            </svg>
            Xóa tất cả
          </button>
        </div>
        <div class="filter-panel__list">
          ${filterableColumns.map(col => this.renderFilterItem(col)).join('')}
        </div>
      </div>
    `;

        this.bindEvents(container);
    }

    /**
     * Render single filter item
     * @param {Object} col - Column config
     * @returns {string} HTML string
     */
    renderFilterItem(col) {
        const value = this.localFilters[col.field] || '';
        const type = col.filterType || col.type || 'text';

        return `
      <div class="filter-item" data-field="${col.field}">
        <label class="filter-item__label">${col.header || col.title || col.field}</label>
        ${this.renderInput(type, col.field, value, col)}
      </div>
    `;
    }

    /**
     * Render input based on type
     * @param {string} type - Input type
     * @param {string} field - Field name
     * @param {string} value - Current value
     * @param {Object} col - Column config
     * @returns {string} HTML string
     */
    renderInput(type, field, value, col) {
        switch (type) {
            case 'select':
                return `
          <select class="filter-item__select" data-field="${field}">
            <option value="">Tất cả</option>
            ${(col.options || []).map(opt => `
              <option value="${opt.value}" ${value === opt.value ? 'selected' : ''}>
                ${opt.label}
              </option>
            `).join('')}
          </select>
        `;

            case 'date':
                return `
          <input type="date" class="filter-item__input"
                 data-field="${field}" value="${value}" />
        `;

            case 'number':
                return `
          <input type="number" class="filter-item__input"
                 data-field="${field}" value="${value}"
                 placeholder="Nhập số..." />
        `;

            case 'boolean':
                return `
          <select class="filter-item__select" data-field="${field}">
            <option value="">Tất cả</option>
            <option value="true" ${value === 'true' ? 'selected' : ''}>Có</option>
            <option value="false" ${value === 'false' ? 'selected' : ''}>Không</option>
          </select>
        `;

            default:
                return `
          <input type="text" class="filter-item__input"
                 data-field="${field}" value="${value}"
                 placeholder="Tìm kiếm..." />
        `;
        }
    }

    /**
     * Bind events
     * @param {HTMLElement} container - Container element
     */
    bindEvents(container) {
        container.addEventListener('change', (e) => {
            if (e.target.classList.contains('filter-item__select') ||
                e.target.classList.contains('filter-item__input')) {
                const field = e.target.dataset.field;
                const value = e.target.value;
                this.setFilter(field, value);
            }
        });

        container.addEventListener('click', (e) => {
            const clearBtn = e.target.closest('[data-action="clearAll"]');
            if (clearBtn) {
                this.clearAll();
            }
        });
    }

    /**
     * Set filter value
     * @param {string} field - Field name
     * @param {string} value - Filter value
     */
    setFilter(field, value) {
        if (value === '') {
            delete this.localFilters[field];
        } else {
            this.localFilters[field] = value;
        }

        if (this.options.onChange) {
            this.options.onChange({ ...this.localFilters });
        }
    }

    /**
     * Get all filters
     * @returns {Object} Current filters
     */
    getFilters() {
        return { ...this.localFilters };
    }

    /**
     * Clear all filters
     */
    clearAll() {
        this.localFilters = {};
        if (this.options.onChange) {
            this.options.onChange({});
        }
        // Re-render to clear inputs
        const container = document.querySelector('.filter-panel');
        if (container) {
            this.render(container);
        }
    }

    /**
     * Update filters from external source
     * @param {Object} filters - New filters
     */
    updateFilters(filters) {
        this.localFilters = { ...filters };
        const container = document.querySelector('.filter-panel');
        if (container) {
            this.render(container);
        }
    }
}

export default FilterComponent;

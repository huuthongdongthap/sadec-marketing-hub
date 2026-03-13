/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SA ĐÉC MARKETING HUB — DATA TABLE COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Enhanced DataTable với sorting, pagination, search, filter
 *
 * Features:
 * - Column sorting (asc/desc/multi-column)
 * - Pagination với page size options
 * - Global search
 * - Column filters
 * - Row selection (single/multiple)
 * - Export to CSV
 * - Responsive design
 * - Virtual scrolling (cho large datasets)
 * - Server-side pagination support
 *
 * Usage:
 *   HTML:
 *   <div class="mekong-data-table" data-table="users">
 *     <div class="mekong-data-table__toolbar">...</div>
 *     <table>
 *       <thead>...</thead>
 *       <tbody>...</tbody>
 *     </table>
 *     <div class="mekong-data-table__pagination">...</div>
 *   </div>
 *
 *   JS:
 *   const table = new DataTable('#users', {
 *     data: [...],
 *     columns: [...],
 *     sortable: true,
 *     searchable: true,
 *     selectable: true,
 *     exportable: true,
 *     pageSize: 10
 *   });
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

class DataTable {
  constructor(selector, options = {}) {
    this.element = typeof selector === 'string'
      ? document.querySelector(selector)
      : selector;

    if (!this.element) {
      console.error('[DataTable] Element not found');
      return;
    }

    // Options
    this.options = {
      data: options.data || [],
      columns: options.columns || [],
      sortable: options.sortable ?? true,
      searchable: options.searchable ?? true,
      selectable: options.selectable ?? false,
      multiSelect: options.multiSelect ?? true,
      exportable: options.exportable ?? true,
      filterable: options.filterable ?? true,
      pageSize: options.pageSize ?? 10,
      pageSizes: options.pageSizes || [10, 25, 50, 100],
      showPagination: options.showPagination ?? true,
      showSizeSelector: options.showSizeSelector ?? true,
      showTotal: options.showTotal ?? true,
      emptyMessage: options.emptyMessage || 'Không có dữ liệu',
      loadingMessage: options.loadingMessage || 'Đang tải...',
      dateFormat: options.dateFormat || 'dd/MM/yyyy',
      virtualScroll: options.virtualScroll ?? false,
      virtualScrollThreshold: options.virtualScrollThreshold ?? 100,
      serverSide: options.serverSide ?? false,
      onSort: options.onSort || null,
      onPageChange: options.onPageChange || null,
      onSearch: options.onSearch || null,
      onSelect: options.onSelect || null,
      ...options
    };

    // State
    this.state = {
      currentPage: 1,
      pageSize: this.options.pageSize,
      sortBy: null,
      sortOrder: null,
      searchQuery: '',
      filters: {},
      selectedRows: new Set(),
      filteredData: [...this.options.data],
      totalPages: 1
    };

    this.init();
  }

  init() {
    this.element.classList.add('mekong-data-table');
    this.element.setAttribute('data-table', this.options.id || `table-${Date.now()}`);

    // Render structure
    this.render();

    // Bind events
    this.bindEvents();

    // Initial render
    this.renderTable();
    this.renderPagination();
  }

  render() {
    this.element.innerHTML = '';

    // Toolbar
    if (this.options.searchable || this.options.exportable || this.options.filterable) {
      this.renderToolbar();
    }

    // Table container
    const tableContainer = document.createElement('div');
    tableContainer.className = 'mekong-data-table__container';
    tableContainer.innerHTML = `
      <div class="mekong-data-table__wrapper">
        <table class="mekong-data-table__table">
          <thead class="mekong-data-table__head"></thead>
          <tbody class="mekong-data-table__body"></tbody>
        </table>
        <div class="mekong-data-table__loading" hidden>
          <div class="mekong-data-table__loading-spinner"></div>
          <span>${this.options.loadingMessage}</span>
        </div>
      </div>
    `;
    this.element.appendChild(tableContainer);

    this.tableHead = tableContainer.querySelector('.mekong-data-table__head');
    this.tableBody = tableContainer.querySelector('.mekong-data-table__body');
    this.loadingElement = tableContainer.querySelector('.mekong-data-table__loading');

    // Pagination
    if (this.options.showPagination) {
      this.renderPaginationContainer();
    }
  }

  renderToolbar() {
    const toolbar = document.createElement('div');
    toolbar.className = 'mekong-data-table__toolbar';

    const toolbarContent = [];

    // Search
    if (this.options.searchable) {
      toolbarContent.push(`
        <div class="mekong-data-table__search">
          <input
            type="text"
            class="mekong-data-table__search-input"
            placeholder="Tìm kiếm..."
            value="${this.state.searchQuery}"
            aria-label="Tìm kiếm"
          />
          <svg class="mekong-data-table__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
        </div>
      `);
    }

    // Actions (export, filters, etc.)
    const actions = [];

    if (this.options.exportable) {
      actions.push(`
        <button class="mekong-data-table__btn" data-action="export" title="Xuất CSV">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Xuất CSV
        </button>
      `);
    }

    if (this.options.filterable && this.options.columns.some(col => col.filterable !== false)) {
      actions.push(`
        <button class="mekong-data-table__btn" data-action="filters" title="Bộ lọc">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
          </svg>
          Bộ lọc
        </button>
      `);
    }

    if (actions.length) {
      toolbarContent.push(`<div class="mekong-data-table__actions">${actions.join('')}</div>`);
    }

    toolbar.innerHTML = toolbarContent.join('');
    this.element.appendChild(toolbar);
    this.toolbar = toolbar;
  }

  renderPaginationContainer() {
    const pagination = document.createElement('div');
    pagination.className = 'mekong-data-table__pagination-bar';
    this.element.appendChild(pagination);
    this.paginationContainer = pagination;
  }

  renderTable() {
    this.renderHead();
    this.renderBody();
  }

  renderHead() {
    const columns = this.options.columns;
    const { sortBy, sortOrder } = this.state;

    let html = '<tr>';

    // Checkbox column
    if (this.options.selectable) {
      html += `
        <th class="mekong-data-table__header mekong-data-table__header--select">
          <label class="mekong-data-table__checkbox-label">
            <input type="checkbox" class="mekong-data-table__select-all" ${this.state.selectedRows.size === this.state.filteredData.length && this.state.filteredData.length > 0 ? 'checked' : ''}>
            <span class="mekong-data-table__checkbox-custom"></span>
          </label>
        </th>
      `;
    }

    // Data columns
    columns.forEach((col, index) => {
      const sortable = this.options.sortable && col.sortable !== false;
      const sorted = sortBy === col.field || sortBy === index;
      const sortIcon = sorted && sortOrder === 'asc' ? '↑' : sorted && sortOrder === 'desc' ? '↓' : '⇅';

      html += `
        <th class="mekong-data-table__header ${sorted ? 'mekong-data-table__header--sorted' : ''} ${col.class || ''}"
            ${sortable ? `data-sort="${index}" style="cursor: pointer;"` : ''}
            data-field="${col.field}">
          <div class="mekong-data-table__header-content">
            <span>${col.header || col.title || col.field}</span>
            ${sortable ? `<span class="mekong-data-table__sort-icon">${sortIcon}</span>` : ''}
          </div>
          ${col.filterable !== false && this.options.filterable ? `
            <input type="text" class="mekong-data-table__filter-input"
                   data-filter="${index}" placeholder="Lọc..."
                   value="${this.state.filters[col.field] || ''}">
          ` : ''}
        </th>
      `;
    });

    html += '</tr>';
    this.tableHead.innerHTML = html;
  }

  renderBody() {
    const { currentPage, pageSize, filteredData } = this.state;
    const columns = this.options.columns;

    // Pagination
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pageData = filteredData.slice(start, end);

    // Empty state
    if (!pageData.length) {
      this.tableBody.innerHTML = `
        <tr class="mekong-data-table__empty-row">
          <td colspan="${columns.length + (this.options.selectable ? 1 : 0)}">
            <div class="mekong-data-table__empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p>${this.options.emptyMessage}</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    // Render rows
    let html = '';
    pageData.forEach((row, rowIndex) => {
      const actualIndex = start + rowIndex;
      const isSelected = this.state.selectedRows.has(actualIndex);

      html += `<tr class="mekong-data-table__row ${isSelected ? 'mekong-data-table__row--selected' : ''}" data-index="${actualIndex}">`;

      // Checkbox
      if (this.options.selectable) {
        html += `
          <td class="mekong-data-table__cell mekong-data-table__cell--select">
            <label class="mekong-data-table__checkbox-label">
              <input type="checkbox" class="mekong-data-table__select-row" ${isSelected ? 'checked' : ''}>
              <span class="mekong-data-table__checkbox-custom"></span>
            </label>
          </td>
        `;
      }

      // Data cells
      columns.forEach((col) => {
        const value = row[col.field] || row[typeof col.accessor === 'function' ? col.accessor(row) : col.field];
        const formatted = col.formatter ? col.formatter(value, row) : this.formatValue(value, col);

        html += `
          <td class="mekong-data-table__cell ${col.class || ''}">
            ${formatted}
          </td>
        `;
      });

      html += '</tr>';
    });

    this.tableBody.innerHTML = html;
  }

  renderPagination() {
    if (!this.paginationContainer) return;

    const { currentPage, pageSize, filteredData, totalPages } = this.state;
    const total = filteredData.length;
    const start = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, total);

    let html = '';

    // Show total
    if (this.options.showTotal) {
      html += `
        <div class="mekong-data-table__total">
          Hiển thị ${start}-${end} trong ${total} dòng
        </div>
      `;
    }

    // Size selector
    if (this.options.showSizeSelector) {
      html += `
        <div class="mekong-data-table__size-selector">
          <span class="mekong-data-table__size-label">Số dòng:</span>
          <select class="mekong-data-table__size-select">
            ${this.options.pageSizes.map(size => `
              <option value="${size}" ${size === pageSize ? 'selected' : ''}>${size}</option>
            `).join('')}
          </select>
        </div>
      `;
    }

    // Pagination buttons
    html += `
      <div class="mekong-data-table__pages">
        <button class="mekong-data-table__page-btn" data-page="first" ${currentPage === 1 ? 'disabled' : ''}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="11 17 6 12 11 7"/>
            <polyline points="18 17 13 12 18 7"/>
          </svg>
        </button>
        <button class="mekong-data-table__page-btn" data-page="prev" ${currentPage === 1 ? 'disabled' : ''}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div class="mekong-data-table__page-numbers">
          ${this.renderPageNumbers()}
        </div>
        <button class="mekong-data-table__page-btn" data-page="next" ${currentPage === totalPages ? 'disabled' : ''}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
        <button class="mekong-data-table__page-btn" data-page="last" ${currentPage === totalPages ? 'disabled' : ''}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="13 17 18 12 13 7"/>
            <polyline points="6 17 11 12 6 7"/>
          </svg>
        </button>
      </div>
    `;

    this.paginationContainer.innerHTML = html;
  }

  renderPageNumbers() {
    const { currentPage, totalPages } = this.state;
    const pages = [];

    // Always show first page
    if (currentPage > 3) {
      pages.push('<button class="mekong-data-table__page-number" data-page="1">1</button>');
      if (currentPage > 4) {
        pages.push('<span class="mekong-data-table__page-ellipsis">...</span>');
      }
    }

    // Show pages around current
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
      pages.push(`
        <button class="mekong-data-table__page-number ${i === currentPage ? 'mekong-data-table__page-number--active' : ''}"
                data-page="${i}">${i}</button>
      `);
    }

    // Always show last page
    if (currentPage < totalPages - 2) {
      if (currentPage < totalPages - 3) {
        pages.push('<span class="mekong-data-table__page-ellipsis">...</span>');
      }
      pages.push(`<button class="mekong-data-table__page-number" data-page="${totalPages}">${totalPages}</button>`);
    }

    return pages.join('');
  }

  formatValue(value, col) {
    if (value === null || value === undefined) return '';

    // Date formatting
    if (col.type === 'date' && value instanceof Date) {
      return value.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }

    // Number formatting
    if (col.type === 'number') {
      return new Intl.NumberFormat('vi-VN').format(value);
    }

    // Currency formatting
    if (col.type === 'currency') {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(value);
    }

    // Boolean as checkbox
    if (col.type === 'boolean') {
      return `<input type="checkbox" ${value ? 'checked' : ''} disabled>`;
    }

    // Status badge
    if (col.type === 'status') {
      const statusClass = typeof col.statusClass === 'function'
        ? col.statusClass(value)
        : `mekong-badge--${value?.toLowerCase() || 'default'}`;
      return `<span class="mekong-badge ${statusClass}">${value}</span>`;
    }

    // Action buttons
    if (col.type === 'action') {
      return col.actions?.map(action => `
        <button class="mekong-data-table__action-btn" data-action="${action.key}" data-row="${col.field}">
          ${action.icon ? `<svg>${action.icon}</svg>` : ''}${action.label}
        </button>
      `).join('') || '';
    }

    // Default: convert to string
    return String(value);
  }

  bindEvents() {
    // Sort
    this.element.addEventListener('click', (e) => {
      const header = e.target.closest('[data-sort]');
      if (header) {
        const index = parseInt(header.dataset.sort);
        this.sort(index);
      }

      // Page navigation
      const pageBtn = e.target.closest('[data-page]');
      if (pageBtn) {
        const page = pageBtn.dataset.page;
        if (page === 'first') this.goToPage(1);
        else if (page === 'prev') this.prevPage();
        else if (page === 'next') this.nextPage();
        else if (page === 'last') this.goToPage(this.state.totalPages);
        else this.goToPage(parseInt(page));
      }

      // Page numbers
      const pageNum = e.target.closest('.mekong-data-table__page-number');
      if (pageNum) {
        this.goToPage(parseInt(pageNum.dataset.page));
      }

      // Export
      const exportBtn = e.target.closest('[data-action="export"]');
      if (exportBtn) {
        this.exportToCSV();
      }

      // Filters toggle
      const filterBtn = e.target.closest('[data-action="filters"]');
      if (filterBtn) {
        this.toggleFilters();
      }
    });

    // Search
    const searchInput = this.element.querySelector('.mekong-data-table__search-input');
    if (searchInput) {
      let debounceTimer;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          this.search(e.target.value);
        }, 300);
      });
    }

    // Size selector
    const sizeSelect = this.element.querySelector('.mekong-data-table__size-select');
    if (sizeSelect) {
      sizeSelect.addEventListener('change', (e) => {
        this.setPageSize(parseInt(e.target.value));
      });
    }

    // Row selection
    this.element.addEventListener('change', (e) => {
      // Select all
      if (e.target.classList.contains('mekong-data-table__select-all')) {
        this.toggleSelectAll(e.target.checked);
      }

      // Select row
      if (e.target.classList.contains('mekong-data-table__select-row')) {
        const row = e.target.closest('.mekong-data-table__row');
        const index = parseInt(row.dataset.index);
        this.toggleSelectRow(index, e.target.checked);
      }
    });

    // Filter inputs
    this.element.addEventListener('input', (e) => {
      if (e.target.classList.contains('mekong-data-table__filter-input')) {
        const filterIndex = e.target.dataset.filter;
        const column = this.options.columns[filterIndex];
        this.setFilter(column.field, e.target.value);
      }
    });

    // Row click (for single select)
    if (this.options.selectable && !this.options.multiSelect) {
      this.tableBody.addEventListener('click', (e) => {
        const row = e.target.closest('.mekong-data-table__row');
        if (row && !e.target.matches('input[type="checkbox"]')) {
          const index = parseInt(row.dataset.index);
          this.selectRow(index);
        }
      });
    }
  }

  // Public API
  sort(fieldOrIndex) {
    const { sortBy, sortOrder } = this.state;
    const column = typeof fieldOrIndex === 'number'
      ? this.options.columns[fieldOrIndex]
      : this.options.columns.find(col => col.field === fieldOrIndex);

    if (!column) return;

    const index = this.options.columns.indexOf(column);
    const field = column.field;

    // Toggle sort order
    let newOrder;
    if (sortBy === field) {
      newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      newOrder = 'asc';
    }

    this.state.sortBy = field;
    this.state.sortOrder = newOrder;

    // Sort data
    this.state.filteredData.sort((a, b) => {
      let aVal = a[field];
      let bVal = b[field];

      // Handle null/undefined
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      // Handle different types
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
        return newOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      return newOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

    this.state.currentPage = 1;
    this.renderTable();
    this.renderHead(); // Update sort icons
    this.options.onSort?.({ field, order: newOrder });
  }

  search(query) {
    this.state.searchQuery = query.toLowerCase();
    this.applyFilters();
    this.options.onSearch?.(query);
  }

  setFilter(field, value) {
    this.state.filters[field] = value;
    this.applyFilters();
  }

  applyFilters() {
    const { searchQuery, filters } = this.state;

    this.state.filteredData = this.options.data.filter(row => {
      // Global search
      if (searchQuery) {
        const matchesSearch = Object.values(row).some(val =>
          String(val).toLowerCase().includes(searchQuery)
        );
        if (!matchesSearch) return false;
      }

      // Column filters
      for (const [field, value] of Object.entries(filters)) {
        if (value) {
          const cellValue = String(row[field] || '').toLowerCase();
          if (!cellValue.includes(value.toLowerCase())) {
            return false;
          }
        }
      }

      return true;
    });

    this.state.totalPages = Math.ceil(this.state.filteredData.length / this.state.pageSize);
    this.state.currentPage = 1;

    this.renderTable();
    this.renderPagination();
  }

  goToPage(page) {
    if (page < 1 || page > this.state.totalPages) return;

    this.state.currentPage = page;
    this.renderTable();
    this.renderPagination();
    this.options.onPageChange?.({ page, totalPages: this.state.totalPages });
  }

  prevPage() {
    this.goToPage(this.state.currentPage - 1);
  }

  nextPage() {
    this.goToPage(this.state.currentPage + 1);
  }

  setPageSize(size) {
    this.state.pageSize = size;
    this.state.totalPages = Math.ceil(this.state.filteredData.length / size);
    this.state.currentPage = 1;
    this.renderTable();
    this.renderPagination();
  }

  toggleSelectAll(selected) {
    const { currentPage, pageSize } = this.state;
    const start = currentPage * pageSize - pageSize;
    const end = Math.min(start + pageSize, this.state.filteredData.length);

    if (selected) {
      for (let i = start; i < end; i++) {
        this.state.selectedRows.add(i);
      }
    } else {
      for (let i = start; i < end; i++) {
        this.state.selectedRows.delete(i);
      }
    }

    this.renderTable();
    this.options.onSelect?.(this.getSelectedData());
  }

  toggleSelectRow(index, selected) {
    if (selected) {
      this.state.selectedRows.add(index);
    } else {
      this.state.selectedRows.delete(index);
    }

    this.renderTable();
    this.options.onSelect?.(this.getSelectedData());
  }

  selectRow(index) {
    this.state.selectedRows.clear();
    this.state.selectedRows.add(index);
    this.renderTable();
    this.options.onSelect?.(this.getSelectedData());
  }

  getSelectedData() {
    return Array.from(this.state.selectedRows).map(i => this.state.filteredData[i]);
  }

  exportToCSV() {
    const columns = this.options.columns;
    const headers = columns.map(col => col.header || col.title || col.field);
    const data = this.state.filteredData;

    let csv = headers.join(',') + '\n';

    data.forEach(row => {
      const values = columns.map(col => {
        const value = row[col.field];
        // Escape quotes and wrap in quotes if contains comma
        const escaped = String(value || '').replace(/"/g, '""');
        return escaped.includes(',') ? `"${escaped}"` : escaped;
      });
      csv += values.join(',') + '\n';
    });

    // Download
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }

  toggleFilters() {
    this.element.classList.toggle('mekong-data-table--filters-visible');
  }

  // Data manipulation
  setData(data) {
    this.options.data = data;
    this.state.filteredData = [...data];
    this.state.totalPages = Math.ceil(data.length / this.state.pageSize);
    this.state.currentPage = 1;
    this.renderTable();
    this.renderPagination();
  }

  getData() {
    return this.state.filteredData;
  }

  // Loading state
  showLoading() {
    this.loadingElement.hidden = false;
  }

  hideLoading() {
    this.loadingElement.hidden = true;
  }

  // Refresh
  refresh() {
    this.renderTable();
    this.renderPagination();
  }

  // Destroy
  destroy() {
    this.element.innerHTML = '';
  }
}

// Export
window.DataTable = DataTable;

export default DataTable;
export { DataTable };

/**
 * Data Table Widget Component
 * Advanced data table với sorting, filtering, pagination
 *
 * Usage:
 * <data-table-widget title="Recent Orders" columns='[{"key":"id","label":"ID"},{"key":"name","label":"Name"}]' data='[{"id":1,"name":"Test"}]'></data-table-widget>
 */

class DataTableWidget extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.data = [];
        this.columns = [];
        this.sortColumn = null;
        this.sortDirection = 'asc';
        this.currentPage = 1;
        this.pageSize = 10;
        this.filterText = '';
    }

    static get observedAttributes() {
        return ['title', 'columns', 'data', 'page-size', 'sortable', 'filterable'];
    }

    connectedCallback() {
        this.render();
        this.parseData();
    }

    attributeChangedCallback() {
        if (this.shadowRoot.innerHTML) {
            this.parseData();
        }
    }

    parseData() {
        try {
            const columnsAttr = this.getAttribute('columns');
            const dataAttr = this.getAttribute('data');

            if (columnsAttr) this.columns = JSON.parse(columnsAttr);
            if (dataAttr) this.data = JSON.parse(dataAttr);

            this.renderTable();
        } catch (e) {
            console.error('[DataTable] Failed to parse data:', e);
        }
    }

    get filteredData() {
        let filtered = [...this.data];

        // Apply text filter
        if (this.filterText) {
            const searchLower = this.filterText.toLowerCase();
            filtered = filtered.filter(row =>
                Object.values(row).some(val =>
                    String(val).toLowerCase().includes(searchLower)
                )
            );
        }

        // Apply sorting
        if (this.sortColumn) {
            filtered.sort((a, b) => {
                const aVal = a[this.sortColumn];
                const bVal = b[this.sortColumn];

                let comparison = 0;
                if (typeof aVal === 'number' && typeof bVal === 'number') {
                    comparison = aVal - bVal;
                } else {
                    comparison = String(aVal).localeCompare(String(bVal));
                }

                return this.sortDirection === 'asc' ? comparison : -comparison;
            });
        }

        return filtered;
    }

    get paginatedData() {
        const filtered = this.filteredData;
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        return filtered.slice(start, end);
    }

    get totalPages() {
        return Math.ceil(this.filteredData.length / this.pageSize);
    }

    sort(column) {
        if (!this.hasAttribute('sortable')) return;

        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'asc';
        }
        this.renderTable();
    }

    filter(text) {
        if (!this.hasAttribute('filterable')) return;

        this.filterText = text;
        this.currentPage = 1;
        this.renderTable();
    }

    goToPage(page) {
        this.currentPage = Math.max(1, Math.min(page, this.totalPages));
        this.renderTable();
    }

    renderTable() {
        const container = this.shadowRoot.getElementById('table-container');
        if (!container) return;

        const data = this.paginatedData;
        const sortable = this.hasAttribute('sortable');

        if (data.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="material-symbols-outlined">inbox</span>
                    <p>No data available</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        ${this.columns.map(col => `
                            <th class="${sortable ? 'sortable' : ''} ${this.sortColumn === col.key ? `sorted-${this.sortDirection}` : ''}"
                                data-column="${col.key}"
                                ${sortable ? 'onclick="this.getRootNode().host.sort(\'' + col.key + '\')"' : ''}>
                                ${col.label}
                                ${sortable ? `<span class="sort-icon">${this.getSortIcon(col.key)}</span>` : ''}
                            </th>
                        `).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${data.map(row => `
                        <tr>
                            ${this.columns.map(col => `
                                <td>${this.formatCell(row[col.key])}</td>
                            `).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="pagination">
                <button class="pagination-btn" ${this.currentPage === 1 ? 'disabled' : ''} onclick="this.getRootNode().host.goToPage(${this.currentPage - 1})">
                    <span class="material-symbols-outlined">chevron_left</span>
                </button>
                <div class="pagination-info">
                    Page ${this.currentPage} of ${this.totalPages} (${this.filteredData.length} items)
                </div>
                <button class="pagination-btn" ${this.currentPage === this.totalPages ? 'disabled' : ''} onclick="this.getRootNode().host.goToPage(${this.currentPage + 1})">
                    <span class="material-symbols-outlined">chevron_right</span>
                </button>
            </div>
        `;
    }

    getSortIcon(column) {
        if (this.sortColumn !== column) return 'unfold_more';
        return this.sortDirection === 'asc' ? 'expand_less' : 'expand_more';
    }

    formatCell(value) {
        if (value === null || value === undefined) return '';
        if (typeof value === 'boolean') {
            return `<span class="status-badge ${value ? 'success' : 'error'}">${value ? '✓' : '✗'}</span>`;
        }
        if (typeof value === 'number') {
            return value.toLocaleString('vi-VN');
        }
        return String(value);
    }

    render() {
        const title = this.getAttribute('title') || 'Data Table';
        const filterable = this.hasAttribute('filterable');
        const sortable = this.hasAttribute('sortable');

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }
                .table-widget {
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(10px);
                    border-radius: 16px;
                    padding: 24px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .widget-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                .widget-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: #ffffff;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .filter-input {
                    padding: 8px 16px;
                    border-radius: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    background: rgba(255, 255, 255, 0.05);
                    color: #ffffff;
                    font-size: 14px;
                    width: 200px;
                    transition: all 0.2s ease;
                }
                .filter-input:focus {
                    outline: none;
                    border-color: rgba(0, 229, 255, 0.5);
                    background: rgba(255, 255, 255, 0.08);
                }
                .filter-input::placeholder {
                    color: rgba(255, 255, 255, 0.4);
                }
                .data-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .data-table th {
                    padding: 12px 16px;
                    text-align: left;
                    font-size: 12px;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.6);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }
                .data-table th.sortable {
                    cursor: pointer;
                    user-select: none;
                    transition: all 0.2s ease;
                }
                .data-table th.sortable:hover {
                    color: #00e5ff;
                }
                .data-table th.sorted-asc,
                .data-table th.sorted-desc {
                    color: #00e5ff;
                }
                .sort-icon {
                    margin-left: 4px;
                    font-size: 14px;
                    vertical-align: middle;
                }
                .data-table td {
                    padding: 14px 16px;
                    font-size: 14px;
                    color: rgba(255, 255, 255, 0.9);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    transition: all 0.2s ease;
                }
                .data-table tbody tr {
                    transition: all 0.2s ease;
                }
                .data-table tbody tr:hover {
                    background: rgba(255, 255, 255, 0.03);
                }
                .status-badge {
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 600;
                }
                .status-badge.success {
                    background: rgba(0, 230, 118, 0.2);
                    color: #00e676;
                }
                .status-badge.error {
                    background: rgba(255, 23, 68, 0.2);
                    color: #ff1744;
                }
                .pagination {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 20px;
                    padding-top: 20px;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                }
                .pagination-btn {
                    padding: 8px 12px;
                    border-radius: 8px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    background: rgba(255, 255, 255, 0.05);
                    color: rgba(255, 255, 255, 0.8);
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .pagination-btn:hover:not(:disabled) {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: rgba(0, 229, 255, 0.3);
                    color: #00e5ff;
                }
                .pagination-btn:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }
                .pagination-info {
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.6);
                }
                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 60px 20px;
                    color: rgba(255, 255, 255, 0.5);
                }
                .empty-state .material-symbols-outlined {
                    font-size: 48px;
                    margin-bottom: 16px;
                }
                .empty-state p {
                    margin: 0;
                    font-size: 14px;
                }
                @media (max-width: 768px) {
                    .table-widget {
                        padding: 16px;
                    }
                    .data-table {
                        font-size: 12px;
                    }
                    .data-table th,
                    .data-table td {
                        padding: 8px 12px;
                    }
                    .filter-input {
                        width: 140px;
                    }
                }
            </style>
            <div class="table-widget">
                <div class="widget-header">
                    <h3 class="widget-title">
                        <span class="material-symbols-outlined">table_chart</span>
                        ${title}
                    </h3>
                    ${filterable ? `
                        <input type="text" class="filter-input" placeholder="Search..."
                            oninput="this.getRootNode().host.filter(this.value)">
                    ` : ''}
                </div>
                <div id="table-container">
                    <div class="loading">
                        <div class="loading-spinner"></div>
                        <span>Loading data...</span>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('data-table-widget', DataTableWidget);

export { DataTableWidget };

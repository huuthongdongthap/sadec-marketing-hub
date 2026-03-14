/**
 * Export Buttons Component
 * Adds export functionality to data tables
 * @version 1.0.0 | 2026-03-14
 */

import { Logger } from '../shared/logger.js';
import { exportToCSV, exportToPDF, exportTableToExcel, printElement } from '../utils/export-utils.js';

class ExportButtons extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.target = null;
  }

  static get observedAttributes() {
    return ['target', 'data', 'filename', 'show-csv', 'show-pdf', 'show-excel', 'show-print'];
  }

  connectedCallback() {
    this.target = this.getAttribute('target') || 'table';
    this.filename = this.getAttribute('filename') || 'export';
    this.showCSV = this.getAttribute('show-csv') !== 'false';
    this.showPDF = this.getAttribute('show-pdf') !== 'false';
    this.showExcel = this.getAttribute('show-excel') !== 'false';
    this.showPrint = this.getAttribute('show-print') !== 'false';
    this.render();
    this.bindEvents();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; margin-bottom: 16px; }
        .export-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          align-items: center;
        }
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-csv {
          background: #4CAF50;
          color: white;
        }
        .btn-csv:hover { background: #45a049; }
        .btn-pdf {
          background: #f44336;
          color: white;
        }
        .btn-pdf:hover { background: #da190b; }
        .btn-excel {
          background: #217346;
          color: white;
        }
        .btn-excel:hover { background: #1e6b41; }
        .btn-print {
          background: #2196F3;
          color: white;
        }
        .btn-print:hover { background: #1e88e5; }
        .btn:active { transform: scale(0.98); }
        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        @media (max-width: 768px) {
          .export-buttons {
            flex-direction: column;
          }
          .btn {
            width: 100%;
            justify-content: center;
          }
        }
      </style>
      <div class="export-buttons">
        ${this.showCSV ? `<button class="btn btn-csv" data-action="csv">📄 CSV</button>` : ''}
        ${this.showPDF ? `<button class="btn btn-pdf" data-action="pdf">📑 PDF</button>` : ''}
        ${this.showExcel ? `<button class="btn btn-excel" data-action="excel">📊 Excel</button>` : ''}
        ${this.showPrint ? `<button class="btn btn-print" data-action="print">🖨️ In</button>` : ''}
      </div>
    `;
  }

  bindEvents() {
    this.shadowRoot.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        this.handleExport(action);
      });
    });
  }

  async handleExport(action) {
    const targetElement = document.querySelector(this.target);
    
    if (!targetElement) {
      Logger.warn('export-buttons', `Target "${this.target}" not found`);
      this.showToast('warning', 'Không tìm thấy bảng dữ liệu');
      return;
    }

    const btn = this.shadowRoot.querySelector(`[data-action="${action}"]`);
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Đang xuất...';
    }

    try {
      switch (action) {
        case 'csv':
          await this.exportCSV(targetElement);
          break;
        case 'pdf':
          await this.exportPDF(targetElement);
          break;
        case 'excel':
          this.exportExcel(targetElement);
          break;
        case 'print':
          this.print(targetElement);
          break;
      }
      this.showToast('success', 'Xuất file thành công!');
    } catch (error) {
      Logger.error('export-buttons', `Export ${action} failed: ${error.message}`);
      this.showToast('error', 'Có lỗi khi xuất file');
    } finally {
      if (btn) {
        btn.disabled = false;
        this.render();
      }
    }
  }

  async exportCSV(element) {
    // If it's a table, extract data
    if (element.tagName === 'TABLE') {
      const data = this.extractTableData(element);
      const { exportToCSV } = await import('../utils/export-utils.js');
      exportToCSV(data, this.filename);
    } else {
      // For other elements, use PDF instead
      Logger.warn('export-buttons', 'CSV export only supports tables, using PDF');
      await this.exportPDF(element);
    }
  }

  async exportPDF(element) {
    const { exportToPDF } = await import('../utils/export-utils.js');
    await exportToPDF(element, this.filename, { title: this.getAttribute('title') || '' });
  }

  exportExcel(element) {
    if (element.tagName === 'TABLE') {
      exportTableToExcel(element, this.filename);
    } else {
      Logger.warn('export-buttons', 'Excel export only supports tables');
      this.showToast('warning', 'Excel chỉ hỗ trợ export bảng');
    }
  }

  print(element) {
    printElement(element);
  }

  extractTableData(table) {
    const headers = [];
    const data = [];
    
    const headerRow = table.querySelector('thead tr');
    if (headerRow) {
      headerRow.querySelectorAll('th').forEach(th => {
        headers.push(th.textContent.trim());
      });
    }

    const bodyRows = table.querySelectorAll('tbody tr');
    bodyRows.forEach(row => {
      const rowData = {};
      row.querySelectorAll('td').forEach((td, index) => {
        if (headers[index]) {
          rowData[headers[index]] = td.textContent.trim();
        }
      });
      data.push(rowData);
    });

    return data;
  }

  showToast(type, message) {
    // Try to use existing Toast if available
    if (window.Toast) {
      window.Toast[type]?.(message);
    } else {
      // Fallback to native alert
      alert(`[${type.toUpperCase()}] ${message}`);
    }
  }
}

if (!customElements.get('export-buttons')) {
  customElements.define('export-buttons', ExportButtons);
}

Logger.debug('export-buttons', 'Component registered');

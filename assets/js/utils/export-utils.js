/**
 * Export Utilities - Sa Đéc Marketing Hub
 * Export data to CSV, JSON, PDF
 *
 * Usage:
 *   ExportUtils.toCSV(data, 'export.csv');
 *   ExportUtils.toPDF(element, 'export.pdf');
 *   ExportUtils.toJSON(data, 'export.json');
 */

import { Logger } from '../shared/logger.js';

const LOG_TAG = '[ExportUtils]';

const ExportUtils = {
  /**
   * Export data to CSV file
   * @param {Array<Object>} data - Array of objects
   * @param {string} filename - Output filename
   * @param {Object} options - Export options
   */
  toCSV(data, filename = 'export.csv', options = {}) {
    if (!data || data.length === 0) {
      Logger.warn(LOG_TAG, 'No data to export');
      return;
    }

    const {
      delimiter = ',',
      includeHeader = true,
      columns = null
    } = options;

    const headers = columns || Object.keys(data[0]);

    const csvContent = [
      ...(includeHeader ? [headers.join(delimiter)] : []),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header] ?? '';
          const stringValue = String(value).replace(/"/g, '""');
          return `"${stringValue}"`;
        }).join(delimiter)
      )
    ].join('\n');

    this.download(csvContent, filename, 'text/csv;charset=utf-8;');
  },

  /**
   * Export data to JSON file
   * @param {any} data - Data to export
   * @param {string} filename - Output filename
   * @param {Object} options - JSON stringify options
   */
  toJSON(data, filename = 'export.json', options = {}) {
    const {
      pretty = true,
      indent = 2
    } = options;

    const jsonContent = pretty
      ? JSON.stringify(data, null, indent)
      : JSON.stringify(data);

    this.download(jsonContent, filename, 'application/json;charset=utf-8;');
  },

  /**
   * Export element to PDF (using browser print)
   * @param {HTMLElement|string} element - Element or selector
   * @param {string} filename - Output filename
   */
  toPDF(element, filename = 'export.pdf') {
    const el = typeof element === 'string' ? document.querySelector(element) : element;

    if (!el) {
      Logger.warn(LOG_TAG, 'Element not found');
      return;
    }

    // Create print-friendly version
    const printWindow = window.open('', '_blank');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${filename}</title>
        <style>
          @media print {
            body { margin: 0; padding: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background: #f5f5f5; }
          }
        </style>
      </head>
      <body>
        ${el.outerHTML}
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() { window.close(); };
          };
        </script>
      </body>
      </html>
    `);

    printWindow.document.close();
  },

  /**
   * Export table to Excel (XLSX format via download)
   * @param {HTMLTableElement|string} table - Table element or selector
   * @param {string} filename - Output filename
   */
  toExcel(table, filename = 'export.xls') {
    const el = typeof table === 'string' ? document.querySelector(table) : table;

    if (!el) {
      Logger.warn(LOG_TAG, 'Table not found');
      return;
    }

    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:x="urn:schemas-microsoft-com:office:excel"
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Export</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
      </head>
      <body>${el.outerHTML}</body>
      </html>
    `;

    this.download(html, filename, 'application/vnd.ms-excel;charset=utf-8;');
  },

  /**
   * Export to image (PNG) using canvas
   * @param {HTMLElement|string} element - Element to capture
   * @param {string} filename - Output filename
   */
  async toImage(element, filename = 'export.png') {
    const el = typeof element === 'string' ? document.querySelector(element) : element;

    if (!el) {
      Logger.warn(LOG_TAG, 'Element not found');
      return;
    }

    // Check if html2canvas is available
    if (typeof html2canvas === 'undefined') {
      Logger.warn(LOG_TAG, 'html2canvas library required');
      return;
    }

    try {
      const canvas = await html2canvas(el, {
        backgroundColor: '#ffffff',
        scale: 2
      });

      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      });
    } catch (error) {
      Logger.error(LOG_TAG, 'Export to image failed:', error);
    }
  },

  /**
   * Download content as file
   * @private
   */
  download(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  },

  /**
   * Create export button
   * @param {string} type - Export type (csv, json, pdf, excel, image)
   * @param {Function} getDataFn - Function to get data
   * @param {string} filename - Base filename
   * @returns {HTMLButtonElement}
   */
  createButton(type, getDataFn, filename = 'export') {
    const button = document.createElement('button');
    button.className = `btn-export btn-export-${type}`;
    button.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      Export ${type.toUpperCase()}
    `;

    button.addEventListener('click', () => {
      const data = getDataFn();

      switch (type.toLowerCase()) {
        case 'csv':
          this.toCSV(data, `${filename}.csv`);
          break;
        case 'json':
          this.toJSON(data, `${filename}.json`);
          break;
        case 'pdf':
          this.toPDF(document.querySelector('[data-export-area]') || document.body, `${filename}.pdf`);
          break;
        case 'excel':
          this.toExcel(document.querySelector('table') || document.body, `${filename}.xls`);
          break;
        case 'image':
          this.toImage(document.querySelector('[data-export-area]') || document.body, `${filename}.png`);
          break;
        default:
          Logger.error(LOG_TAG, 'Unknown export type:', type);
      }
    });

    return button;
  }
};

// Export for ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ExportUtils;
}

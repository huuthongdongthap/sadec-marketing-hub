/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SA ĐÉC MARKETING HUB — DATA EXPORT MANAGER
 * Export data to CSV, JSON, PDF formats
 *
 * Usage:
 *   Export.toCSV(data, filename)
 *   Export.toJSON(data, filename)
 *   Export.toPDF(element, filename)
 *   Export.tableToCSV(tableElement, filename)
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Logger } from '../shared/logger.js';

/**
 * Debug logger - only active in development
 * @param {string} message - Log message
 */
const _debug = (message) => {
    // Debug logger - disabled in production
};

export class ExportManager {
    /**
     * Export data to CSV file
     * @param {Array<Object>} data - Array of objects to export
     * @param {string} filename - Output filename
     * @param {Object} options - Export options
     */
    static toCSV(data, filename = 'export.csv', options = {}) {
        if (!data || data.length === 0) {
            _debug('[Export] No data to export');
            return;
        }

        const {
            delimiter = ',',
            quote = '"',
            escapeQuote = '""',
            includeBOM = true
        } = options;

        // Get headers from first object
        const headers = Object.keys(data[0]);

        // Build CSV content
        let csv = '';

        // Add BOM for Excel UTF-8 support
        if (includeBOM) {
            csv += '\uFEFF';
        }

        // Add header row
        csv += headers.map(h => `${quote}${h}${quote}`).join(delimiter) + '\n';

        // Add data rows
        data.forEach(row => {
            const values = headers.map(header => {
                let value = row[header];

                // Handle null/undefined
                if (value === null || value === undefined) {
                    value = '';
                }

                // Convert to string
                value = String(value);

                // Escape quotes
                value = value.replace(new RegExp(quote, 'g'), escapeQuote);

                // Wrap in quotes if contains delimiter, quote, or newline
                if (value.includes(delimiter) || value.includes(quote) || value.includes('\n')) {
                    value = `${quote}${value}${quote}`;
                }

                return value;
            });

            csv += values.join(delimiter) + '\n';
        });

        // Download file
        this.downloadFile(csv, filename, 'text/csv;charset=utf-8;');
    }

    /**
     * Export data to JSON file
     * @param {any} data - Data to export
     * @param {string} filename - Output filename
     * @param {Object} options - JSON stringify options
     */
    static toJSON(data, filename = 'export.json', options = {}) {
        const {
            pretty = true,
            indent = 2
        } = options;

        const json = pretty
            ? JSON.stringify(data, null, indent)
            : JSON.stringify(data);

        this.downloadFile(json, filename, 'application/json;charset=utf-8;');
    }

    /**
     * Export HTML table to CSV
     * @param {HTMLTableElement|string} table - Table element or selector
     * @param {string} filename - Output filename
     */
    static tableToCSV(table, filename = 'table-export.csv') {
        const tableEl = typeof table === 'string'
            ? document.querySelector(table)
            : table;

        if (!tableEl) {
            _debug('[Export] Table not found');
            return;
        }

        const rows = tableEl.querySelectorAll('tr');
        const csvRows = [];

        rows.forEach(row => {
            const cells = row.querySelectorAll('th, td');
            const values = Array.from(cells).map(cell => {
                let text = cell.textContent.trim();

                // Handle nested content
                const spans = cell.querySelectorAll('span');
                if (spans.length > 0) {
                    text = spans[0].textContent.trim();
                }

                // Escape quotes
                text = text.replace(/"/g, '""');

                // Wrap if needed
                if (text.includes(',') || text.includes('\n') || text.includes('"')) {
                    text = `"${text}"`;
                }

                return text;
            });

            csvRows.push(values.join(','));
        });

        const csv = csvRows.join('\n');
        this.downloadFile(csv, filename, 'text/csv;charset=utf-8;');
    }

    /**
     * Export element to PDF (using browser print)
     * @param {HTMLElement|string} element - Element to export
     * @param {string} filename - Output filename
     * @param {Object} options - Print options
     */
    static toPDF(element, filename = 'export.pdf', options = {}) {
        const el = typeof element === 'string'
            ? document.querySelector(element)
            : element;

        if (!el) {
            _debug('[Export] Element not found');
            return;
        }

        // Create print window
        const printWindow = window.open('', '_blank');

        // Copy styles
        const styles = Array.from(document.styleSheets)
            .map(sheet => {
                try {
                    return Array.from(sheet.cssRules)
                        .map(rule => rule.cssText)
                        .join('\n');
                } catch (e) {
                    return '';
                }
            })
            .join('\n');

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${filename}</title>
                <style>
                    ${styles}
                    @media print {
                        body { padding: 20px; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                ${el.outerHTML}
                <script>
                    window.onload = function() {
                        window.print();
                        // Optional: auto-close after print
                        // window.onafterprint = () => window.close();
                    };
                </script>
            </body>
            </html>
        `);

        printWindow.document.close();
    }

    /**
     * Export to Excel (XLSX format using SheetJS-like approach)
     * @param {Array<Object>} data - Data to export
     * @param {string} filename - Output filename
     * @param {string} sheetName - Sheet name
     */
    static toExcel(data, filename = 'export.xlsx', sheetName = 'Sheet1') {
        // For now, use CSV as fallback
        // Can be enhanced with SheetJS library
        Logger.warn('[Export] Excel export using CSV format. Include SheetJS for true XLSX.');
        this.toCSV(data, filename.replace('.xlsx', '.csv'));
    }

    /**
     * Export chart/image as PNG
     * @param {HTMLCanvasElement|string} canvas - Canvas element or selector
     * @param {string} filename - Output filename
     * @param {Object} options - Export options
     */
    static toPNG(canvas, filename = 'chart.png', options = {}) {
        const canvasEl = typeof canvas === 'string'
            ? document.querySelector(canvas)
            : canvas;

        if (!canvasEl) {
            _debug('[Export] Canvas not found');
            return;
        }

        const {
            mimeType = 'image/png',
            quality = 1.0,
            scale = 2 // Retina display support
        } = options;

        // Create a temporary canvas with higher resolution
        const tempCanvas = document.createElement('canvas');
        const ctx = tempCanvas.getContext('2d');

        tempCanvas.width = canvasEl.width * scale;
        tempCanvas.height = canvasEl.height * scale;

        ctx.scale(scale, scale);
        ctx.drawImage(canvasEl, 0, 0);

        // Download
        const link = document.createElement('a');
        link.download = filename;
        link.href = tempCanvas.toDataURL(mimeType, quality);
        link.click();
    }

    /**
     * Download file helper
     * @param {string} content - File content
     * @param {string} filename - Filename
     * @param {string} mimeType - MIME type
     */
    static downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        _debug(`[Export] Downloaded: ${filename}`);
    }

    /**
     * Export table data with filters
     * @param {Object} config - Export configuration
     */
    static exportFilteredData(config) {
        const {
            data,
            filters = {},
            columns = [],
            filename = 'filtered-export.csv',
            format = 'csv'
        } = config;

        // Apply filters
        let filteredData = [...data];

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                filteredData = filteredData.filter(row => {
                    const rowValue = row[key];

                    // Handle different filter types
                    if (Array.isArray(value)) {
                        return value.includes(rowValue);
                    } else if (typeof value === 'object') {
                        // Range filter
                        const { min, max } = value;
                        if (min !== null && rowValue < min) return false;
                        if (max !== null && rowValue > max) return false;
                        return true;
                    } else {
                        // Exact match or contains
                        return String(rowValue).includes(String(value));
                    }
                });
            }
        });

        // Select columns
        let exportData = filteredData;
        if (columns.length > 0) {
            exportData = filteredData.map(row => {
                const filteredRow = {};
                columns.forEach(col => {
                    filteredRow[col] = row[col];
                });
                return filteredRow;
            });
        }

        // Export
        if (format === 'csv') {
            this.toCSV(exportData, filename);
        } else if (format === 'json') {
            this.toJSON(exportData, filename);
        }
    }

    /**
     * Create export button for a table
     * @param {string} tableSelector - Table selector
     * @param {Object} options - Button options
     */
    static createExportButton(tableSelector, options = {}) {
        const {
            formats = ['csv', 'json'],
            position = 'top-right',
            buttonClass = 'export-btn'
        } = options;

        const container = document.createElement('div');
        container.className = `export-container export-${position}`;

        const select = document.createElement('select');
        select.className = buttonClass;
        select.innerHTML = `
            <option value="">Export...</option>
            ${formats.map(f => `<option value="${f}">As ${f.toUpperCase()}</option>`).join('')}
        `;

        select.addEventListener('change', (e) => {
            const format = e.target.value;
            if (!format) return;

            const table = document.querySelector(tableSelector);
            const filename = `export-${new Date().toISOString().split('T')[0]}.${format}`;

            if (format === 'csv') {
                this.tableToCSV(table, filename);
            } else if (format === 'json') {
                // Convert table to JSON first
                const data = this.tableToJSON(table);
                this.toJSON(data, filename);
            }

            e.target.value = '';
        });

        container.appendChild(select);
        return container;
    }

    /**
     * Convert HTML table to JSON
     * @param {HTMLTableElement} table - Table element
     * @returns {Array<Object>} Table data as JSON
     */
    static tableToJSON(table) {
        const rows = table.querySelectorAll('tr');
        const headers = Array.from(rows[0].querySelectorAll('th, td')).map(h => h.textContent.trim());
        const data = [];

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const cells = row.querySelectorAll('td');

            if (cells.length > 0) {
                const rowData = {};
                headers.forEach((header, index) => {
                    rowData[header] = cells[index]?.textContent.trim() || '';
                });
                data.push(rowData);
            }
        }

        return data;
    }
}

// Export as default
export default ExportManager;

// Global access
if (typeof window !== 'undefined') {
    window.ExportManager = ExportManager;
}

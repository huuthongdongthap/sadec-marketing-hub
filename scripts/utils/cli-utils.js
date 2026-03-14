#!/usr/bin/env node
/**
 * Sa Đéc Marketing Hub — CLI Utility Functions
 *
 * Shared utilities for all CLI scripts
 *
 * Usage:
 *   const { Logger, ProgressBar } = require('./cli-utils.js');
 *   const log = new Logger('audit');
 *   log.info('Starting audit...');
 */

const path = require('path');

/**
 * Logger class for consistent CLI output
 */
class Logger {
  constructor(prefix = 'cli', verbose = false) {
    this.prefix = prefix;
    this.verbose = verbose;
    this.enabled = process.env.CLI_VERBOSE || verbose;
  }

  /**
   * Log info message (emoji prefix)
   * @param {string} message - Message to log
   */
  info(message) {
    if (this.enabled) {
      console.log(`ℹ️  [${this.prefix}] ${message}`);
    }
  }

  /**
   * Log success message (green check)
   * @param {string} message - Message to log
   */
  success(message) {
    if (this.enabled) {
      console.log(`✅ [${this.prefix}] ${message}`);
    }
  }

  /**
   * Log warning message (yellow warning)
   * @param {string} message - Message to log
   */
  warn(message) {
    console.warn(`⚠️  [${this.prefix}] ${message}`);
  }

  /**
   * Log error message (red X)
   * @param {string} message - Message to log
   */
  error(message) {
    console.error(`❌ [${this.prefix}] ${message}`);
  }

  /**
   * Log debug message (only if verbose)
   * @param {string} message - Message to log
   */
  debug(message) {
    if (this.enabled) {
      console.log(`🔍 [${this.prefix}] ${message}`);
    }
  }

  /**
   * Log progress message (spinner style)
   * @param {string} message - Message to log
   */
  progress(message) {
    if (this.enabled) {
      console.log(`⏳ [${this.prefix}] ${message}`);
    }
  }

  /**
   * Log file operation result
   * @param {string} filePath - File path
   * @param {string} action - Action taken
   */
  file(filePath, action) {
    if (this.enabled) {
      const relPath = path.relative(process.cwd(), filePath);
      console.log(`   ${relPath}: ${action}`);
    }
  }

  /**
   * Log summary
   * @param {object} data - Summary data
   */
  summary(data) {
    console.log('\n📊 SUMMARY');
    console.log('─'.repeat(40));
    for (const [key, value] of Object.entries(data)) {
      console.log(`   ${key}: ${value}`);
    }
    console.log('─'.repeat(40));
  }
}

/**
 * Simple progress bar for CLI
 */
class ProgressBar {
  constructor(total, options = {}) {
    this.total = total;
    this.current = 0;
    this.symbol = options.symbol || '█';
    this.emptySymbol = options.emptySymbol || '░';
    this.width = options.width || 30;
    this.enabled = options.enabled !== false;
  }

  /**
   * Update progress
   * @param {number} current - Current progress
   * @param {string} message - Optional message
   */
  update(current, message = '') {
    if (!this.enabled) return;

    this.current = current;
    const percent = Math.min(100, Math.round((current / this.total) * 100));
    const filled = Math.round((this.width * percent) / 100);
    const empty = this.width - filled;

    const bar = this.symbol.repeat(filled) + this.emptySymbol.repeat(empty);
    process.stdout.write(`\r[${bar}] ${percent}% ${message}`);

    if (current >= this.total) {
      console.log(); // New line when complete
    }
  }

  /**
   * Increment progress
   * @param {string} message - Optional message
   */
  tick(message = '') {
    this.update(this.current + 1, message);
  }

  /**
   * Complete the progress bar
   * @param {string} message - Final message
   */
  complete(message = 'Done!') {
    this.update(this.total, message);
  }
}

/**
 * Format file size
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size
 */
function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format duration
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration
 */
function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  const seconds = (ms / 1000).toFixed(2);
  return `${seconds}s`;
}

/**
 * Table formatter for CLI output
 * @param {Array} headers - Column headers
 * @param {Array<Array>} rows - Data rows
 * @returns {string} Formatted table string
 */
function formatTable(headers, rows) {
  // Calculate column widths
  const widths = headers.map((h, i) => {
    const colWidths = rows.map(row => String(row[i] || '').length);
    return Math.max(String(h).length, ...colWidths, 5);
  });

  // Create separator
  const separator = '+' + widths.map(w => '─'.repeat(w + 2)).join('+') + '+';

  // Format header
  const headerRow = '|' + headers.map((h, i) => ` ${h.padEnd(widths[i])} `).join('|') + '|';

  // Format rows
  const dataRows = rows.map(row =>
    '|' + row.map((cell, i) => ` ${String(cell || '').padEnd(widths[i])} `).join('|') + '|'
  );

  return [separator, headerRow, separator, ...dataRows, separator].join('\n');
}

/**
 * Confirm prompt (synchronous)
 * @param {string} message - Confirmation message
 * @returns {boolean} User confirmation
 */
function confirm(message) {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    readline.question(`${message} (y/N): `, answer => {
      readline.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

module.exports = {
  Logger,
  ProgressBar,
  formatSize,
  formatDuration,
  formatTable,
  confirm
};

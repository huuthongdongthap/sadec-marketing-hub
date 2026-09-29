/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ERROR BOUNDARY - Sa Đéc Marketing Hub
 * ═══════════════════════════════════════════════════════════════════════════
 * Global error handler với user-friendly error messages và error reporting
 *
 * Usage:
 *   ErrorBoundary.init();
 *   ErrorBoundary.handleError(error);
 *
 *   // Wrap async operations
 *   try {
 *     await riskyOperation();
 *   } catch (error) {
 *     ErrorBoundary.handleError(error);
 *   }
 */

import { Logger } from './shared/logger.js';

const TAG = '[ErrorBoundary]';

class ErrorBoundaryClass {
  constructor() {
    this.errorContainer = null;
    this.errorQueue = [];
    this.maxErrors = 10;
    this.errorCount = 0;
    this.lastErrorTime = null;
    this.initialized = false;
    this.silentMode = false;
  }

  /**
   * Initialize error boundary
   */
  init() {
    if (this.initialized) return;

    // Global error handler
    window.addEventListener('error', (e) => this.handleGlobalError(e));

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (e) => this.handlePromiseRejection(e));

    // Create error container
    this.createErrorContainer();

    // Setup retry mechanism
    this.setupRetryMechanism();

    this.initialized = true;
    // Silent in production
  }

  /**
   * Create error container UI
   */
  createErrorContainer() {
    if (document.getElementById('error-boundary-container')) return;

    this.errorContainer = document.createElement('div');
    this.errorContainer.id = 'error-boundary-container';
    this.errorContainer.setAttribute('role', 'alert');
    this.errorContainer.setAttribute('aria-live', 'assertive');
    this.errorContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px;
      pointer-events: none;
    `;
    document.body.appendChild(this.errorContainer);
  }

  /**
   * Handle global JavaScript errors
   */
  handleGlobalError(event) {
    event.preventDefault();

    const error = {
      type: 'javascript',
      message: event.message || 'Unknown error',
      filename: event.filename || 'unknown',
      lineno: event.lineno || 0,
      colno: event.colno || 0,
      stack: event.error?.stack || null,
      timestamp: new Date().toISOString()
    };

    this.handleError(error);
  }

  /**
   * Handle unhandled promise rejections
   */
  handlePromiseRejection(event) {
    event.preventDefault();

    const error = {
      type: 'promise',
      message: event.reason?.message || event.reason || 'Unknown promise rejection',
      stack: event.reason?.stack || null,
      timestamp: new Date().toISOString()
    };

    this.handleError(error);
  }

  /**
   * Handle error (main handler)
   */
  handleError(error) {
    // Increment error count
    this.errorCount++;
    this.lastErrorTime = Date.now();

    // Add to queue
    this.errorQueue.push(error);
    if (this.errorQueue.length > this.maxErrors) {
      this.errorQueue.shift();
    }

    // Log to console via Logger
    Logger.error(TAG, 'Error occurred:', error);

    // Send to analytics/reporting service
    this.reportError(error);

    // Show user-friendly error message
    if (!this.silentMode) {
      this.showErrorUI(error);
    }

    // Dispatch custom event
    document.dispatchEvent(new CustomEvent('apperror', {
      detail: { error, count: this.errorCount }
    }));
  }

  /**
   * Show user-friendly error UI
   */
  showErrorUI(error) {
    const errorEl = document.createElement('div');
    errorEl.className = 'error-banner';
    errorEl.style.cssText = `
      background: var(--md-sys-color-error-container, #ffcdd2);
      color: var(--md-sys-color-on-error-container, #c62828);
      padding: 12px 20px;
      border-radius: 8px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      pointer-events: auto;
      animation: errorSlideDown 0.3s ease;
      max-width: 500px;
      width: 100%;
    `;

    const isCritical = this.isCriticalError(error);
    const userMessage = this.getUserFriendlyMessage(error);

    errorEl.innerHTML = `
      <span class="material-symbols-outlined" style="font-size: 24px; flex-shrink: 0;">
        ${isCritical ? 'error' : 'warning'}
      </span>
      <div style="flex: 1;">
        <div style="font-weight: 600; font-size: 14px;">
          ${isCritical ? 'Lỗi hệ thống' : 'Có lỗi xảy ra'}
        </div>
        <div style="font-size: 13px; opacity: 0.9;">
          ${userMessage}
        </div>
      </div>
      <button
        class="error-dismiss"
        aria-label="Đóng lỗi"
        style="
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          color: inherit;
          display: flex;
          align-items: center;
          justify-content: center;
        "
      >
        <span class="material-symbols-outlined">close</span>
      </button>
      ${isCritical ? `
        <button
          class="error-retry"
          style="
            background: var(--md-sys-color-primary, #1976d2);
            color: #fff;
            border: none;
            border-radius: 4px;
            padding: 6px 12px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
          "
        >
          Thử lại
        </button>
      ` : ''}
    `;

    // Dismiss button
    const dismissBtn = errorEl.querySelector('.error-dismiss');
    dismissBtn.addEventListener('click', () => {
      errorEl.style.animation = 'errorSlideUp 0.3s ease forwards';
      setTimeout(() => errorEl.remove(), 300);
    });

    // Retry button
    const retryBtn = errorEl.querySelector('.error-retry');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        this.retryLastAction();
        errorEl.remove();
      });
    }

    // Auto-dismiss after 10 seconds for non-critical errors
    if (!isCritical) {
      setTimeout(() => {
        if (errorEl.parentNode) {
          errorEl.style.animation = 'errorSlideUp 0.3s ease forwards';
          setTimeout(() => errorEl.remove(), 300);
        }
      }, 10000);
    }

    this.errorContainer.appendChild(errorEl);
  }

  /**
   * Get user-friendly message
   */
  getUserFriendlyMessage(error) {
    const messages = {
      'NetworkError': 'Không thể kết nối máy chủ. Vui lòng kiểm tra kết nối internet.',
      'TypeError': 'Dữ liệu không hợp lệ. Vui lòng thử lại.',
      'ReferenceError': 'Chức năng tạm thời không khả dụng.',
      'SyntaxError': 'Lỗi cú pháp trong xử lý dữ liệu.',
      'RangeError': 'Dữ liệu nằm ngoài phạm vi cho phép.',
      'DOMException': 'Lỗi trong quá trình xử lý trang web.'
    };

    // Check error type
    for (const [type, message] of Object.entries(messages)) {
      if (error.message?.includes(type) || error.type === type.toLowerCase()) {
        return message;
      }
    }

    // Default messages based on context
    if (error.filename?.includes('api')) {
      return 'Không thể kết nối API. Vui lòng thử lại sau.';
    }

    if (error.lineno > 0) {
      return `Đã xảy ra lỗi. Mã lỗi: ${error.errorCount || this.errorCount}`;
    }

    return 'Đã xảy ra lỗi không mong muốn. Chúng tôi đang khắc phục.';
  }

  /**
   * Check if error is critical
   */
  isCriticalError(error) {
    const criticalPatterns = [
      'network',
      'fetch',
      'api',
      'authentication',
      'unauthorized',
      'forbidden'
    ];

    const errorString = JSON.stringify(error).toLowerCase();
    return criticalPatterns.some(pattern => errorString.includes(pattern));
  }

  /**
   * Report error to analytics service
   */
  reportError(error) {
    // Log to localStorage for debugging
    try {
      const errors = JSON.parse(localStorage.getItem('error_log') || '[]');
      errors.push(error);

      // Keep only last 50 errors
      if (errors.length > 50) {
        errors.shift();
      }

      localStorage.setItem('error_log', JSON.stringify(errors));
    } catch (e) {
      Logger.warn(TAG, 'Cannot save error to localStorage:', e);
    }

    // Send to API (if available)
    // fetch('/api/error-report', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ error, url: window.location.href })
    // }).catch(() => {});
  }

  /**
   * Setup retry mechanism
   */
  setupRetryMechanism() {
    // Retry failed network requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        return await originalFetch.apply(this, args);
      } catch (error) {
        // Auto-retry once after 1 second
        await new Promise(resolve => setTimeout(resolve, 1000));
        try {
          return await originalFetch.apply(this, args);
        } catch (retryError) {
          this.handleError({
            type: 'NetworkError',
            message: `Failed to fetch ${args[0]}`,
            stack: retryError.stack
          });
          throw retryError;
        }
      }
    };
  }

  /**
   * Retry last action
   */
  retryLastAction() {
    // Reload page for critical errors
    window.location.reload();
  }

  /**
   * Get error count
   */
  getErrorCount() {
    return this.errorCount;
  }

  /**
   * Get error queue
   */
  getErrorQueue() {
    return [...this.errorQueue];
  }

  /**
   * Clear errors
   */
  clearErrors() {
    this.errorQueue = [];
    this.errorCount = 0;
    this.errorContainer.innerHTML = '';
    localStorage.removeItem('error_log');
  }

  /**
   * Enable/disable silent mode
   */
  setSilentMode(silent) {
    this.silentMode = silent;
  }

  /**
   * Export errors for debugging
   */
  exportErrors() {
    const errors = this.getErrorQueue();
    const blob = new Blob([JSON.stringify(errors, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `errors-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// Create singleton instance
const ErrorBoundary = new ErrorBoundaryClass();

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ErrorBoundary.init());
} else {
  ErrorBoundary.init();
}

// Export for module usage
// Export for ES modules
export default ErrorBoundary;

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes errorSlideDown {
    from {
      transform: translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes errorSlideUp {
    from {
      transform: translateY(0);
      opacity: 1;
    }
    to {
      transform: translateY(-100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

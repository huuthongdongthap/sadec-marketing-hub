/**
 * Error Boundary Component
 * component bắt lỗi và hiển thị UI thân thiện
 *
 * Usage:
 *   <error-boundary data-module="dashboard">
 *     <!-- content -->
 *   </error-bound>
 *
 *   ErrorBoundary.wrap(() => { risky code });
 */

class ErrorBoundary extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.hasError = false;
    this.error = null;
    this.retryCount = 0;
    this.maxRetries = 3;
  }

  static get observedAttributes() {
    return ['data-module', 'data-fallback'];
  }

  connectedCallback() {
    this.render();
    this.setupErrorHandlers();
  }

  attributeChangedCallback() {
    if (this.hasError) {
      this.render();
    }
  }

  setupErrorHandlers() {
    // Global error handler cho errors trong component này
    window.addEventListener('error', (event) => {
      if (this.contains(event.target)) {
        this.handleError(event.error);
      }
    });

    window.addEventListener('unhandledrejection', (event) => {
      if (this.contains(event.target)) {
        this.handleError(event.reason);
      }
    });
  }

  handleError(error) {
    this.hasError = true;
    this.error = error;

    // Show toast notification
    if (typeof Toast !== 'undefined') {
      Toast.error(`Lỗi: ${error.message || 'Có lỗi xảy ra'}`, {
        title: 'Lỗi module',
        action: {
          label: 'Thử lại',
          onClick: () => this.retry()
        }
      });
    }

    this.render();
  }

  retry() {
    if (this.retryCount >= this.maxRetries) {
      Toast.error('Đã thử nhiều lần nhưng vẫn lỗi', { title: 'Quá số lần thử' });
      return;
    }

    this.retryCount++;
    this.hasError = false;
    this.error = null;

    // Re-render và trigger reload
    this.render();
    this.dispatchEvent(new CustomEvent('retry', {
      bubbles: true,
      composed: true,
      detail: { count: this.retryCount }
    }));
  }

  render() {
    if (this.hasError) {
      this.renderErrorState();
    } else {
      this.renderDefaultState();
    }
  }

  renderDefaultState() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
        }
        ::slotted(*) {
          display: block;
        }
      </style>
      <slot></slot>
    `;
  }

  renderErrorState() {
    const module = this.getAttribute('data-module') || 'Component';
    const customFallback = this.getAttribute('data-fallback');

    this.shadowRoot.innerHTML = `
      <style>
        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
          text-align: center;
          background: var(--md-sys-color-error-container, #fef2f2);
          border-radius: 16px;
          border: 1px solid var(--md-sys-color-error, #ef4444);
          min-height: 200px;
        }

        .error-icon {
          width: 64px;
          height: 64px;
          margin-bottom: 20px;
          color: var(--md-sys-color-error, #ef4444);
          animation: shake 0.5s ease-in-out;
        }

        .error-title {
          font-size: 20px;
          font-weight: 600;
          color: var(--md-sys-color-on-error-container, #991b1b);
          margin-bottom: 8px;
        }

        .error-message {
          font-size: 14px;
          color: var(--md-sys-color-on-error-container, #b91c1c);
          margin-bottom: 24px;
          max-width: 400px;
        }

        .error-details {
          font-size: 12px;
          color: var(--md-sys-color-on-error-container, #dc2626);
          background: rgba(0,0,0,0.05);
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 24px;
          max-width: 400px;
          word-break: break-all;
        }

        .retry-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: var(--md-sys-color-primary, #006A60);
          color: #fff;
          border: none;
          border-radius: 24px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .retry-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,106,96,0.3);
        }

        .retry-btn:active {
          transform: translateY(0);
        }

        .retry-count {
          font-size: 12px;
          color: var(--md-sys-color-on-error-container, #991b1b);
          margin-top: 12px;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        /* Dark mode */
        @media (prefers-color-scheme: dark) {
          .error-container {
            background: rgba(127, 29, 29, 0.2);
            border-color: #ef4444;
          }
          .error-title {
            color: #fca5a5;
          }
          .error-message, .error-details {
            color: #f87171;
          }
          .retry-count {
            color: #fca5a5;
          }
        }

        /* Mobile responsive */
        @media (max-width: 640px) {
          .error-container {
            padding: 32px 16px;
          }
          .error-title {
            font-size: 18px;
          }
        }
      </style>

      <div class="error-container">
        <div class="error-icon">
          <span class="material-symbols-outlined" style="font-size: 48px">error</span>
        </div>
        <h3 class="error-title">Không thể tải ${module}</h3>
        <p class="error-message">
          ${customFallback || 'Đã xảy ra lỗi khi tải component này. Vui lòng thử lại.'}
        </p>
        ${this.error ? `
          <div class="error-details">
            ${this.error.message || this.error.toString()}
          </div>
        ` : ''}
        <button class="retry-btn" id="retryBtn">
          <span class="material-symbols-outlined">refresh</span>
          Thử lại
        </button>
        ${this.retryCount > 0 ? `
          <div class="retry-count">Lần thử: ${this.retryCount}/${this.maxRetries}</div>
        ` : ''}
      </div>
    `;

    this.shadowRoot.getElementById('retryBtn').addEventListener('click', () => {
      this.retry();
    });
  }
}

/**
 * ErrorBoundary utility functions
 */
const ErrorBoundaryUtils = {
  /**
   * Wrap risky code với error handling
   */
  wrap(fn, onError) {
    try {
      return fn();
    } catch (error) {
      if (onError) onError(error);
      return null;
    }
  },

  /**
   * Wrap async function với error handling
   */
  async wrapAsync(fn, onError) {
    try {
      return await fn();
    } catch (error) {
      if (onError) onError(error);
      throw error;
    }
  },

  /**
   * Fetch wrapper với retry logic
   */
  async fetchWithRetry(url, options = {}, maxRetries = 3) {
    let lastError;

    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(url, options);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response;
      } catch (error) {
        lastError = error;

        // Don't retry on client errors (4xx)
        if (error.message.includes('4')) {
          throw error;
        }

        // Wait before retry (exponential backoff)
        if (i < maxRetries - 1) {
          const delay = Math.pow(2, i) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  },

  /**
   * Register global error handler
   */
  registerGlobalHandler() {
    window.addEventListener('error', (event) => {

      if (typeof Toast !== 'undefined') {
        Toast.error(event.error?.message || 'Đã xảy ra lỗi', {
          title: 'Lỗi hệ thống'
        });
      }
    });

    window.addEventListener('unhandledrejection', (event) => {

      if (typeof Toast !== 'undefined') {
        Toast.error(event.reason?.message || 'Lỗi không xác định', {
          title: 'LỗiPromise'
        });
      }
    });
  }
};

// Register custom element
customElements.define('error-boundary', ErrorBoundary);

// Auto-register global handler
ErrorBoundaryUtils.registerGlobalHandler();

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ErrorBoundary, ErrorBoundaryUtils };
}

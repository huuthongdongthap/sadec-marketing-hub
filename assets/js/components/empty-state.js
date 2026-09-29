/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SA ĐÉC MARKETING HUB — EMPTY STATE COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Empty state displays khi không có dữ liệu
 *
 * Features:
 * - Multiple variants (default, search, error, success)
 * - Custom icon và illustration
 * - Action buttons (CTA)
 * - Helpful suggestions
 * - Accessibility support (ARIA)
 *
 * Usage:
 *   HTML:
 *   <empty-state
 *     icon="inbox"
 *     title="Không có dữ liệu"
 *     description="Chưa có khách hàng nào. Nhấn vào nút dưới để thêm mới."
 *     action-text="Thêm khách hàng"
 *     action-href="/admin/clients.html?action=new"
 *   ></empty-state>
 *
 *   JS:
 *   EmptyState.show('#container', {
 *     type: 'search',
 *     title: 'Không tìm thấy kết quả',
 *     description: 'Thử từ khóa khác hoặc xóa bộ lọc'
 *   });
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

class EmptyState extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['icon', 'title', 'description', 'action-text', 'action-href', 'action-onclick', 'type', 'image-url'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const type = this.getAttribute('type') || 'default';
    const icon = this.getAttribute('icon') || this.getDefaultIcon(type);
    const title = this.getAttribute('title') || this.getDefaultTitle(type);
    const description = this.getAttribute('description') || this.getDefaultDescription(type);
    const actionText = this.getAttribute('action-text');
    const actionHref = this.getAttribute('action-href');
    const actionOnclick = this.getAttribute('action-onclick');
    const imageUrl = this.getAttribute('image-url');

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          padding: 48px 24px;
          text-align: center;
        }

        .empty-state {
          max-width: 480px;
          margin: 0 auto;
        }

        .empty-state__image {
          width: 100%;
          max-width: 200px;
          height: auto;
          margin-bottom: 24px;
          opacity: 0.8;
        }

        .empty-state__icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--md-sys-color-surface-variant, #f5f5f5);
          color: var(--md-sys-color-on-surface-variant, #666);
        }

        .empty-state__icon span {
          font-size: 40px;
        }

        .empty-state__title {
          font-size: 20px;
          font-weight: 600;
          color: var(--md-sys-color-on-surface, #333);
          margin: 0 0 8px;
        }

        .empty-state__description {
          font-size: 14px;
          color: var(--md-sys-color-on-surface-variant, #666);
          margin: 0 0 24px;
          line-height: 1.6;
        }

        .empty-state__actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .empty-state__button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .empty-state__button--primary {
          background: var(--md-sys-color-primary, #0066cc);
          color: white;
        }

        .empty-state__button--primary:hover {
          background: var(--md-sys-color-primary-dark, #0055aa);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 102, 204, 0.3);
        }

        .empty-state__button--secondary {
          background: transparent;
          color: var(--md-sys-color-primary, #0066cc);
          border: 1px solid var(--md-sys-color-primary, #0066cc);
        }

        .empty-state__button--secondary:hover {
          background: rgba(0, 102, 204, 0.08);
        }

        .empty-state__suggestions {
          margin-top: 24px;
          padding: 16px;
          background: var(--md-sys-color-surface-variant, #f5f5f5);
          border-radius: 8px;
          text-align: left;
        }

        .empty-state__suggestions-title {
          font-size: 12px;
          font-weight: 600;
          color: var(--md-sys-color-on-surface-variant, #666);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0 0 12px;
        }

        .empty-state__suggestions ul {
          margin: 0;
          padding: 0 0 0 20px;
          list-style: disc;
        }

        .empty-state__suggestions li {
          font-size: 13px;
          color: var(--md-sys-color-on-surface-variant, #666);
          margin: 0 0 8px;
          line-height: 1.5;
        }

        /* Variants */
        .empty-state--search .empty-state__icon {
          background: rgba(255, 152, 0, 0.1);
          color: #ff9800;
        }

        .empty-state--error .empty-state__icon {
          background: rgba(244, 67, 54, 0.1);
          color: #f44336;
        }

        .empty-state--success .empty-state__icon {
          background: rgba(76, 175, 80, 0.1);
          color: #4caf50;
        }

        /* Animations */
        .empty-state__icon {
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        /* Dark mode */
        @media (prefers-color-scheme: dark) {
          .empty-state__icon {
            background: rgba(255, 255, 255, 0.1);
            color: rgba(255, 255, 255, 0.7);
          }

          .empty-state__suggestions {
            background: rgba(255, 255, 255, 0.05);
          }
        }
      </style>

      <div class="empty-state empty-state--${type}">
        ${imageUrl ? `
          <img src="${imageUrl}" alt="" class="empty-state__image" loading="lazy">
        ` : `
          <div class="empty-state__icon">
            <span class="material-symbols-outlined">${icon}</span>
          </div>
        `}

        <h3 class="empty-state__title">${title}</h3>
        <p class="empty-state__description">${description}</p>

        ${(actionText && (actionHref || actionOnclick)) ? `
          <div class="empty-state__actions">
            ${actionHref ? `
              <a href="${actionHref}" class="empty-state__button empty-state__button--primary">
                <span class="material-symbols-outlined">add</span>
                ${actionText}
              </a>
            ` : `
              <button onclick="${actionOnclick}" class="empty-state__button empty-state__button--primary">
                <span class="material-symbols-outlined">add</span>
                ${actionText}
              </button>
            `}
          </div>
        ` : ''}

        ${this._getSuggestions(type) ? `
          <div class="empty-state__suggestions">
            <h4 class="empty-state__suggestions-title">Gợi ý</h4>
            <ul>
              ${this._getSuggestions(type).map(s => `<li>${s}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    `;
  }

  getDefaultIcon(type) {
    const icons = {
      default: 'inbox',
      search: 'search_off',
      error: 'error_outline',
      success: 'check_circle_outline',
      empty: 'folder_open',
      offline: 'cloud_off',
      no_results: 'filter_list_off'
    };
    return icons[type] || icons.default;
  }

  getDefaultTitle(type) {
    const titles = {
      default: 'Không có dữ liệu',
      search: 'Không tìm thấy kết quả',
      error: 'Có lỗi xảy ra',
      success: 'Hoàn thành',
      empty: 'Thư mục trống',
      offline: 'Không có kết nối',
      no_results: 'Không có kết quả phù hợp'
    };
    return titles[type] || titles.default;
  }

  getDefaultDescription(type) {
    const descriptions = {
      default: 'Chưa có dữ liệu để hiển thị. Nhấn vào nút dưới để bắt đầu.',
      search: 'Thử từ khóa khác hoặc xóa bộ lọc để tìm kiếm rộng hơn.',
      error: 'Đã có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.',
      success: 'Dữ liệu đã được tải thành công.',
      empty: 'Thư mục này chưa có nội dung nào.',
      offline: 'Kiểm tra kết nối Internet và thử lại.',
      no_results: 'Không có kết quả nào phù hợp với tiêu chí đã chọn.'
    };
    return descriptions[type] || descriptions.default;
  }

  _getSuggestions(type) {
    const suggestions = {
      default: [
        'Nhấn vào nút "Tạo mới" để bắt đầu',
        'Import dữ liệu từ file Excel hoặc CSV',
        'Liên hệ hỗ trợ để được trợ giúp'
      ],
      search: [
        'Kiểm tra lại chính tả',
        'Thử từ khóa ngắn hơn hoặc tổng quát hơn',
        'Xóa bộ lọc để xem tất cả kết quả'
      ],
      error: [
        'Nhấn F5 để tải lại trang',
        'Xóa cache trình duyệt và thử lại',
        'Liên hệ hỗ trợ nếu lỗi vẫn tiếp diễn'
      ],
      offline: [
        'Kiểm tra kết nối WiFi hoặc 3G/4G',
        'Thử tải lại trang khi có kết nối',
        'Chế độ offline sẽ tự động kích hoạt khi có dữ liệu cache'
      ]
    };
    return suggestions[type] || null;
  }
}

/**
 * Empty State Manager
 * Utility functions để hiển thị empty state programmatically
 */
const EmptyStateManager = {
  /**
   * Show empty state in container
   * @param {string|Element} container - Selector hoặc element
   * @param {Object} options - Empty state options
   */
  show(container, options = {}) {
    const el = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    if (!el) return;

    el.innerHTML = '';

    const emptyState = document.createElement('empty-state');

    // Set attributes
    Object.entries(options).forEach(([key, value]) => {
      const attrName = key.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
      if (value !== undefined && value !== null) {
        emptyState.setAttribute(attrName, value);
      }
    });

    el.appendChild(emptyState);
  },

  /**
   * Show loading state
   * @param {string|Element} container
   */
  loading(container) {
    const el = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    if (!el) return;

    el.innerHTML = `
      <div class="empty-state" style="padding: 48px 24px;">
        <div class="spinner-primary spinner-large" style="margin: 0 auto;"></div>
        <p class="loading-message" style="margin-top: 16px; color: var(--md-sys-color-on-surface-variant);">Đang tải...</p>
      </div>
    `;
  },

  /**
   * Hide empty state
   * @param {string|Element} container
   */
  hide(container) {
    const el = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    if (!el) return;

    const emptyState = el.querySelector('empty-state');
    if (emptyState) {
      emptyState.remove();
    }
  }
};

// Register custom element
if (typeof customElements !== 'undefined' && !customElements.get('empty-state')) {
  customElements.define('empty-state', EmptyState);
}

// Export
// Export for ES modules
export default { EmptyState, EmptyStateManager };

// Global access
window.EmptyState = EmptyState;
window.EmptyStateManager = EmptyStateManager;

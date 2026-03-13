/**
 * Empty States Component
 * Helpful empty states with CTAs for various scenarios
 * @version 1.0.0 | 2026-03-13
 */

const EmptyStates = {
  /**
   * Empty state templates
   */
  templates: {
    noData: {
      icon: 'inbox',
      title: 'Chưa có dữ liệu',
      description: 'Dữ liệu sẽ xuất hiện khi có thông tin mới.',
      action: null
    },
    noResults: {
      icon: 'search_off',
      title: 'Không tìm thấy kết quả',
      description: 'Thử lại với từ khóa khác hoặc xóa bộ lọc.',
      action: {
        label: 'Xóa bộ lọc',
        onClick: () => window.location.reload()
      }
    },
    noCampaigns: {
      icon: 'campaign',
      title: 'Chưa có chiến dịch',
      description: 'Tạo chiến dịch marketing đầu tiên của bạn.',
      action: {
        label: 'Tạo chiến dịch',
        onClick: () => window.location.href = '/admin/campaigns.html?action=new'
      }
    },
    noLeads: {
      icon: 'person_add',
      title: 'Chưa có leads',
      description: 'Thêm leads để bắt đầu quản lý khách hàng tiềm năng.',
      action: {
        label: 'Thêm lead',
        onClick: () => window.location.href = '/admin/leads.html?action=new'
      }
    },
    noProjects: {
      icon: 'folder',
      title: 'Chưa có dự án',
      description: 'Tạo dự án mới để bắt đầu.',
      action: {
        label: 'Tạo dự án',
        onClick: () => window.location.href = '/portal/projects.html?action=new'
      }
    },
    noInvoices: {
      icon: 'receipt',
      title: 'Chưa có hóa đơn',
      description: 'Hóa đơn sẽ xuất hiện khi có giao dịch.',
      action: {
        label: 'Tạo hóa đơn',
        onClick: () => window.location.href = '/portal/invoices.html?action=new'
      }
    },
    noNotifications: {
      icon: 'notifications_none',
      title: 'Không có thông báo',
      description: 'Bạn đã xem tất cả thông báo.',
      action: null
    },
    noReports: {
      icon: 'analytics',
      title: 'Chưa có báo cáo',
      description: 'Báo cáo sẽ được tạo khi có dữ liệu phân tích.',
      action: {
        label: 'Tạo báo cáo',
        onClick: () => window.location.href = '/admin/reports.html?action=new'
      }
    },
    noMessages: {
      icon: 'mail_outline',
      title: 'Hộp thư rỗng',
      description: 'Không có tin nhắn nào.',
      action: {
        label: 'Soạn tin nhắn',
        onClick: () => {}
      }
    },
    noTasks: {
      icon: 'task_alt',
      title: 'Không có nhiệm vụ',
      description: 'Tất cả nhiệm vụ đã hoàn thành!',
      action: {
        label: 'Tạo nhiệm vụ',
        onClick: () => {}
      }
    },
    offline: {
      icon: 'cloud_off',
      title: 'Không có kết nối',
      description: 'Kiểm tra kết nối internet của bạn.',
      action: {
        label: 'Thử lại',
        onClick: () => window.location.reload()
      }
    },
    error: {
      icon: 'error_outline',
      title: 'Có lỗi xảy ra',
      description: 'Vui lòng thử lại sau.',
      action: {
        label: 'Tải lại',
        onClick: () => window.location.reload()
      }
    },
    loading: {
      icon: 'progress_activity',
      title: 'Đang tải...',
      description: 'Vui lòng chờ trong giây lát.',
      action: null
    }
  },

  /**
   * Render empty state
   * @param {string} container - CSS selector
   * @param {string} type - Empty state type
   * @param {Object} custom - Custom overrides
   */
  render(container, type, custom = {}) {
    const el = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;
    
    if (!el) {
      console.warn(`Empty state container "${container}" not found`);
      return;
    }

    const template = this.templates[type] || this.templates.noData;
    const state = { ...template, ...custom };

    el.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">
          <span class="material-symbols-outlined">${state.icon}</span>
        </div>
        <h3 class="empty-state-title">${state.title}</h3>
        <p class="empty-state-description">${state.description}</p>
        ${state.action ? `
          <button class="empty-state-action btn btn-filled">
            <span class="material-symbols-outlined">add</span>
            ${state.action.label}
          </button>
        ` : ''}
      </div>
    `;

    // Bind action
    if (state.action) {
      el.querySelector('.empty-state-action').onclick = state.action.onClick;
    }

    return el;
  },

  /**
   * Show empty state overlay
   */
  showOverlay(type, custom = {}) {
    // Remove existing overlay
    const existing = document.querySelector('.empty-state-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'empty-state-overlay';
    
    const template = this.templates[type] || this.templates.noData;
    const state = { ...template, ...custom };

    overlay.innerHTML = `
      <div class="empty-state-overlay-content">
        <span class="material-symbols-outlined">${state.icon}</span>
        <h3>${state.title}</h3>
        <p>${state.description}</p>
        ${state.action ? `
          <button class="btn btn-filled">${state.action.label}</button>
        ` : ''}
      </div>
    `;

    document.body.appendChild(overlay);

    // Bind action
    if (state.action) {
      overlay.querySelector('button').onclick = state.action.onClick;
    }

    return overlay;
  },

  /**
   * Hide empty state overlay
   */
  hideOverlay() {
    const overlay = document.querySelector('.empty-state-overlay');
    if (overlay) overlay.remove();
  }
};

// Auto-detect and render empty states
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // Check for empty tables
    document.querySelectorAll('table').forEach(table => {
      const tbody = table.querySelector('tbody');
      if (tbody && !tbody.querySelector('tr:not(.empty)')) {
        const path = window.location.pathname;
        let type = 'noData';
        
        if (path.includes('campaigns')) type = 'noCampaigns';
        else if (path.includes('leads')) type = 'noLeads';
        else if (path.includes('projects')) type = 'noProjects';
        else if (path.includes('invoices')) type = 'noInvoices';
        else if (path.includes('reports')) type = 'noReports';
        
        // Replace table with empty state
        table.style.display = 'none';
        const emptyContainer = document.createElement('div');
        table.parentElement.appendChild(emptyContainer);
        EmptyStates.render(emptyContainer, type);
      }
    });
  });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EmptyStates;
}

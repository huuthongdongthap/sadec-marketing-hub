/**
 * ==============================================
 * QUICK ACTIONS PANEL - COMMAND PALETTE
 * Fast access to common actions via keyboard shortcut (Ctrl/Cmd + K)
 * @version 1.0.0 | 2026-03-14
 * ==============================================
 */

// ============================================================================
// QUICK ACTIONS CONFIGURATION
// ============================================================================

const QUICK_ACTIONS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'dashboard',
    category: 'Navigation',
    shortcut: 'G D',
    action: () => navigateTo('/admin/dashboard.html')
  },
  {
    id: 'campaigns',
    label: 'Chiến Dịch',
    icon: 'campaign',
    category: 'Navigation',
    shortcut: 'G C',
    action: () => navigateTo('/admin/campaigns.html')
  },
  {
    id: 'leads',
    label: 'Khách Hàng Tiềm Năng',
    icon: 'people',
    category: 'Navigation',
    shortcut: 'G L',
    action: () => navigateTo('/admin/leads.html')
  },
  {
    id: 'finance',
    label: 'Tài Chính',
    icon: 'account_balance',
    category: 'Navigation',
    shortcut: 'G F',
    action: () => navigateTo('/admin/finance.html')
  },
  {
    id: 'reports',
    label: 'Báo Cáo',
    icon: 'assessment',
    category: 'Navigation',
    shortcut: 'G R',
    action: () => navigateTo('/admin/reports.html')
  },
  {
    id: 'content-calendar',
    label: 'Lịch Nội Dung',
    icon: 'calendar_today',
    category: 'Navigation',
    action: () => navigateTo('/admin/content-calendar.html')
  },
  {
    id: 'missions',
    label: 'Nhiệm Vụ',
    icon: 'task',
    category: 'Navigation',
    action: () => navigateTo('/admin/missions.html')
  },
  {
    id: 'payments',
    label: 'Thanh Toán',
    icon: 'payment',
    category: 'Navigation',
    action: () => navigateTo('/admin/payments.html')
  },
  {
    id: 'dark-mode',
    label: 'Bật/Tắt Dark Mode',
    icon: 'dark_mode',
    category: 'Settings',
    shortcut: 'D M',
    action: () => toggleDarkMode()
  },
  {
    id: 'refresh',
    label: 'Làm Mới Trang',
    icon: 'refresh',
    category: 'Actions',
    shortcut: 'F5',
    action: () => location.reload()
  },
  {
    id: 'help',
    label: 'Trợ Giúp',
    icon: 'help',
    category: 'Support',
    shortcut: '?',
    action: () => openHelpTour()
  },
  {
    id: 'feedback',
    label: 'Gửi Feedback',
    icon: 'feedback',
    category: 'Support',
    action: () => openFeedbackModal()
  }
];

// ============================================================================
// QUICK ACTIONS COMPONENT
// ============================================================================

export class QuickActionsPanel {
  constructor() {
    this.isOpen = false;
    this.selectedIndex = 0;
    this.filteredActions = [...QUICK_ACTIONS];
    this.searchQuery = '';
    this.panel = null;
    this.init();
  }

  /**
   * Initialize quick actions panel
   */
  init() {
    this.createPanel();
    this.bindEvents();
    this.registerKeyboardShortcuts();
  }

  /**
   * Create panel DOM structure
   */
  createPanel() {
    const template = `
      <div id="quick-actions-overlay" class="quick-actions-overlay" hidden>
        <div class="quick-actions-panel" role="dialog" aria-modal="true" aria-label="Quick Actions">
          <div class="quick-actions-header">
            <span class="material-symbols-outlined">search</span>
            <input
              type="text"
              id="quick-actions-search"
              placeholder="Tìm kiếm hành động... (Ctrl+K)"
              autocomplete="off"
              aria-label="Search actions"
            />
            <kbd class="quick-actions-close-hint">ESC</kbd>
          </div>

          <div class="quick-actions-categories" id="quick-actions-list">
            <!-- Actions will be rendered here -->
          </div>

          <div class="quick-actions-footer">
            <span class="hint">
              <kbd>↑↓</kbd> Di chuyển
              <kbd>↵</kbd> Chọn
              <kbd>ESC</kbd> Đóng
            </span>
          </div>
        </div>
      </div>
    `;

    const container = document.createElement('div');
    container.innerHTML = template;
    document.body.appendChild(container);

    this.panel = {
      overlay: document.getElementById('quick-actions-overlay'),
      search: document.getElementById('quick-actions-search'),
      list: document.getElementById('quick-actions-list')
    };

    this.renderActions();
  }

  /**
   * Render actions grouped by category
   */
  renderActions() {
    const grouped = this.filteredActions.reduce((acc, action) => {
      const category = action.category || 'Other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(action);
      return acc;
    }, {});

    this.panel.list.innerHTML = Object.entries(grouped)
      .map(([category, actions]) => `
        <div class="quick-actions-category">
          <div class="quick-actions-category-title">${category}</div>
          <div class="quick-actions-items">
            ${actions.map((action, index) => `
              <button
                class="quick-action-item ${index === this.selectedIndex && category === Object.keys(grouped)[0] ? 'selected' : ''}"
                data-action-id="${action.id}"
                role="option"
                aria-selected="${index === this.selectedIndex && category === Object.keys(grouped)[0]}"
              >
                <span class="material-symbols-outlined action-icon">${action.icon}</span>
                <span class="action-label">${action.label}</span>
                ${action.shortcut ? `<kbd class="action-shortcut">${action.shortcut}</kbd>` : ''}
              </button>
            `).join('')}
          </div>
        </div>
      `).join('');

    // Bind click events
    this.panel.list.querySelectorAll('.quick-action-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const actionId = btn.dataset.actionId;
        this.executeAction(actionId);
      });
    });
  }

  /**
   * Filter actions based on search query
   */
  filterActions(query) {
    const normalizedQuery = query.toLowerCase().trim();

    if (!normalizedQuery) {
      this.filteredActions = [...QUICK_ACTIONS];
    } else {
      this.filteredActions = QUICK_ACTIONS.filter(action =>
        action.label.toLowerCase().includes(normalizedQuery) ||
        action.category.toLowerCase().includes(normalizedQuery) ||
        action.id.toLowerCase().includes(normalizedQuery)
      );
    }

    this.selectedIndex = 0;
    this.renderActions();
  }

  /**
   * Execute action by ID
   */
  executeAction(actionId) {
    const action = QUICK_ACTIONS.find(a => a.id === actionId);
    if (action && typeof action.action === 'function') {
      this.close();
      action.action();
    }
  }

  /**
   * Open panel
   */
  open() {
    this.isOpen = true;
    this.panel.overlay.hidden = false;
    this.panel.overlay.classList.add('visible');
    this.panel.search.value = '';
    this.panel.search.focus();
    this.filterActions('');
    document.body.style.overflow = 'hidden';
  }

  /**
   * Close panel
   */
  close() {
    this.isOpen = false;
    this.panel.overlay.classList.remove('visible');
    setTimeout(() => {
      this.panel.overlay.hidden = true;
    }, 150);
    document.body.style.overflow = '';
  }

  /**
   * Navigate selection
   */
  navigateSelection(direction) {
    const items = this.panel.list.querySelectorAll('.quick-action-item');
    const totalItems = items.length;

    if (totalItems === 0) return;

    this.selectedIndex = ((this.selectedIndex + direction) % totalItems + totalItems) % totalItems;

    items.forEach((item, index) => {
      item.classList.toggle('selected', index === this.selectedIndex);
      item.setAttribute('aria-selected', index === this.selectedIndex);
    });

    // Scroll selected into view
    items[this.selectedIndex]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  /**
   * Select current item
   */
  selectCurrent() {
    const selectedItem = this.panel.list.querySelector('.quick-action-item.selected');
    if (selectedItem) {
      this.executeAction(selectedItem.dataset.actionId);
    }
  }

  /**
   * Bind events
   */
  bindEvents() {
    // Search input
    this.panel.search.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this.filterActions(this.searchQuery);
    });

    // Keyboard navigation
    this.panel.search.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          this.navigateSelection(1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          this.navigateSelection(-1);
          break;
        case 'Enter':
          e.preventDefault();
          this.selectCurrent();
          break;
        case 'Escape':
          e.preventDefault();
          this.close();
          break;
      }
    });

    // Click outside to close
    this.panel.overlay.addEventListener('click', (e) => {
      if (e.target === this.panel.overlay) {
        this.close();
      }
    });
  }

  /**
   * Register global keyboard shortcuts
   */
  registerKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + K to open
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.open();
      }

      // Global shortcuts
      if (!this.isOpen) {
        QUICK_ACTIONS.forEach(action => {
          if (action.shortcut && action.shortcut === this.formatShortcut(e)) {
            e.preventDefault();
            action.action();
          }
        });
      }
    });
  }

  /**
   * Format shortcut for display
   */
  formatShortcut(e) {
    const parts = [];
    if (e.ctrlKey) parts.push('Ctrl');
    if (e.metaKey) parts.push('Cmd');
    if (e.shiftKey) parts.push('Shift');
    parts.push(e.key.toUpperCase());
    return parts.join(' ');
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function navigateTo(url) {
  window.location.href = url;
}

function toggleDarkMode() {
  document.documentElement.setAttribute('data-theme',
    document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
  );
  localStorage.setItem('theme', document.documentElement.getAttribute('data-theme'));
}

function openHelpTour() {
  if (window.HelpTour) {
    window.HelpTour.start();
  }
  // Silent fail in production - HelpTour optional feature
}

function openFeedbackModal() {
  const modal = document.createElement('dialog');
  modal.className = 'feedback-modal';
  modal.innerHTML = `
    <div class="feedback-content">
      <h2>Gửi Feedback</h2>
      <form id="feedback-form">
        <label>
          <span>Loại feedback</span>
          <select name="type" required>
            <option value="bug">Báo lỗi</option>
            <option value="feature">Đề xuất tính năng</option>
            <option value="improvement">Cải thiện UX</option>
            <option value="other">Khác</option>
          </select>
        </label>
        <label>
          <span>Nội dung</span>
          <textarea name="content" rows="4" placeholder="Mô tả chi tiết..." required></textarea>
        </label>
        <div class="feedback-actions">
          <button type="button" class="btn-secondary" onclick="this.closest('dialog').close()">Hủy</button>
          <button type="submit" class="btn-primary">Gửi Feedback</button>
        </div>
      </form>
    </div>
  `;

  modal.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const feedback = {
      type: formData.get('type'),
      content: formData.get('content'),
      timestamp: new Date().toISOString(),
      url: window.location.href
    };

    // Store feedback locally (could be sent to API)
    const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
    feedbacks.push(feedback);
    localStorage.setItem('feedbacks', JSON.stringify(feedbacks));

    showToast('Cảm ơn bạn đã gửi feedback!', 'success');
    modal.close();
  });

  document.body.appendChild(modal);
  modal.showModal();
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-hide');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ============================================================================
// INITIALIZATION
// ============================================================================

let quickActionsInstance = null;

export function initQuickActions() {
  if (quickActionsInstance) return quickActionsInstance;

  quickActionsInstance = new QuickActionsPanel();
  return quickActionsInstance;
}

// Auto-init on DOM ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initQuickActions();
  });
}

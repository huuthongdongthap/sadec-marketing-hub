/**
 * ═══════════════════════════════════════════════════════════════════════════
 * COMMAND PALETTE — Enhanced Search & Quick Actions
 *
 * Features:
 * - Ctrl+K keyboard shortcut
 * - Search pages, actions, settings
 * - Quick navigation
 * - Fuzzy search
 * - Keyboard navigation
 * - Recent searches
 *
 * Usage:
 *   <command-palette></command-palette>
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Logger } from '../shared/logger.js';

const TAG = '[CommandPalette]';

/**
 * Command types
 */
const CommandType = {
  NAVIGATION: 'navigation',
  ACTION: 'action',
  SETTING: 'setting',
  EXTERNAL: 'external'
};

/**
 * Command categories
 */
const Category = {
  PAGES: 'pages',
  ACTIONS: 'actions',
  SETTINGS: 'settings',
  TOOLS: 'tools',
  HELP: 'help'
};

/**
 * Commands registry
 */
const DEFAULT_COMMANDS = [
  // Navigation - Dashboard
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'Tổng quan marketing',
    type: CommandType.NAVIGATION,
    category: Category.PAGES,
    url: '/admin/dashboard.html',
    icon: '📊',
    keywords: ['tổng quan', 'dashboard', 'trang chính']
  },
  {
    id: 'pipeline',
    title: 'Pipeline',
    description: 'Quản lý dự án',
    type: CommandType.NAVIGATION,
    category: Category.PAGES,
    url: '/admin/pipeline.html',
    icon: '📋',
    keywords: ['dự án', 'pipeline', 'quản lý']
  },
  {
    id: 'analytics',
    title: 'Analytics',
    description: 'Phân tích AI',
    type: CommandType.NAVIGATION,
    category: Category.PAGES,
    url: '/admin/ai-analysis.html',
    icon: '📈',
    keywords: ['phân tích', 'analytics', 'AI', 'báo cáo']
  },
  {
    id: 'pricing',
    title: 'Pricing',
    description: 'Cấu hình giá',
    type: CommandType.NAVIGATION,
    category: Category.PAGES,
    url: '/admin/pricing.html',
    icon: '💰',
    keywords: ['giá', 'pricing', 'cấu hình']
  },
  {
    id: 'features',
    title: 'Features Demo',
    description: 'Demo tính năng',
    type: CommandType.NAVIGATION,
    category: Category.PAGES,
    url: '/admin/features-demo.html',
    icon: '🎨',
    keywords: ['demo', 'features', 'tính năng']
  },

  // Actions
  {
    id: 'new-project',
    title: 'Tạo dự án mới',
    description: 'Thêm dự án vào pipeline',
    type: CommandType.ACTION,
    category: Category.ACTIONS,
    action: () => window.location.href = '/admin/pipeline.html?action=new',
    icon: '➕',
    keywords: ['tạo', 'mới', 'project', 'dự án']
  },
  {
    id: 'dark-mode',
    title: 'Bật/tắt Dark Mode',
    description: 'Chuyển đổi giao diện sáng/tối',
    type: CommandType.ACTION,
    category: Category.ACTIONS,
    action: () => window.Theme?.toggle(),
    icon: '🌙',
    keywords: ['dark', 'mode', 'giao diện', 'tối', 'sáng']
  },
  {
    id: 'export-data',
    title: 'Xuất dữ liệu',
    description: 'Export data ra CSV/Excel',
    type: CommandType.ACTION,
    category: Category.ACTIONS,
    action: () => window.ExportUtils?.exportToCSV([]),
    icon: '📤',
    keywords: ['xuất', 'export', 'data', 'CSV', 'Excel']
  },
  {
    id: 'clear-cache',
    title: 'Xóa cache',
    description: 'Clear localStorage và session',
    type: CommandType.ACTION,
    category: Category.ACTIONS,
    action: () => {
      localStorage.clear();
      sessionStorage.clear();
      location.reload();
    },
    icon: '🗑️',
    keywords: ['xóa', 'clear', 'cache', 'reload']
  },

  // Settings
  {
    id: 'profile',
    title: 'Hồ sơ',
    description: 'Quản lý thông tin cá nhân',
    type: CommandType.NAVIGATION,
    category: Category.SETTINGS,
    url: '/portal/customer/profile.html',
    icon: '👤',
    keywords: ['hồ sơ', 'profile', 'tài khoản']
  },
  {
    id: 'notifications',
    title: 'Thông báo',
    description: 'Quản lý thông báo',
    type: CommandType.NAVIGATION,
    category: Category.SETTINGS,
    url: '/admin/dashboard.html#notifications',
    icon: '🔔',
    keywords: ['thông báo', 'notifications', 'alerts']
  },

  // Tools
  {
    id: 'ai-generator',
    title: 'AI Content Generator',
    description: 'Tạo nội dung với AI',
    type: CommandType.NAVIGATION,
    category: Category.TOOLS,
    url: '/admin/ai-content.html',
    icon: '🤖',
    keywords: ['AI', 'content', 'generator', 'tạo nội dung']
  },
  {
    id: 'calendar',
    title: 'Lịch nội dung',
    description: 'Quản lý lịch đăng bài',
    type: CommandType.NAVIGATION,
    category: Category.TOOLS,
    url: '/admin/content-calendar.html',
    icon: '📅',
    keywords: ['lịch', 'calendar', 'content', 'đăng bài']
  },

  // Help
  {
    id: 'help-tour',
    title: 'Hướng dẫn',
    description: 'Xem hướng dẫn sử dụng',
    type: CommandType.ACTION,
    category: Category.HELP,
    action: () => window.HelpTour?.start(),
    icon: '❓',
    keywords: ['help', 'hướng dẫn', 'tour', 'guide']
  },
  {
    id: 'keyboard-shortcuts',
    title: 'Keyboard Shortcuts',
    description: 'Danh sách phím tắt',
    type: CommandType.ACTION,
    category: Category.HELP,
    action: () => window.KeyboardShortcuts?.showHelp(),
    icon: '⌨️',
    keywords: ['keyboard', 'shortcuts', 'phím tắt']
  },
  {
    id: 'changelog',
    title: 'Changelog',
    description: 'Xem lịch sử thay đổi',
    type: CommandType.NAVIGATION,
    category: Category.HELP,
    url: '/CHANGELOG.md',
    icon: '📝',
    keywords: ['changelog', 'lịch sử', 'thay đổi']
  }
];

/**
 * Command Palette Class
 */
class CommandPalette {
  constructor() {
    this.commands = [...DEFAULT_COMMANDS];
    this.isOpen = false;
    this.selectedIndex = 0;
    this.recentSearches = this.loadRecentSearches();
    this.element = null;
    this.input = null;
    this.results = null;

    this.init();
  }

  /**
   * Initialize command palette
   */
  init() {
    Logger.info(TAG, 'Initializing Command Palette...');

    this.createUI();
    this.bindEvents();
    this.registerKeyboardShortcut();

    Logger.info(TAG, `Initialized with ${this.commands.length} commands`);
  }

  /**
   * Create UI elements
   */
  createUI() {
    const container = document.createElement('div');
    container.className = 'command-palette-overlay';
    container.innerHTML = `
      <div class="command-palette">
        <div class="command-palette-header">
          <input
            type="text"
            class="command-palette-input"
            placeholder="Tìm kiếm lệnh, trang, hành động... (Ctrl+K)"
            aria-label="Search commands"
          >
          <kbd class="command-palette-kbd">ESC</kbd>
        </div>
        <div class="command-palette-results"></div>
        <div class="command-palette-footer">
          <span><kbd>↑↓</kbd> Di chuyển</span>
          <span><kbd>Enter</kbd> Chọn</span>
          <span><kbd>ESC</kbd> Đóng</span>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    this.element = container.querySelector('.command-palette');
    this.input = container.querySelector('.command-palette-input');
    this.results = container.querySelector('.command-palette-results');

    this.renderResults(this.commands);
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Input handler
    this.input.addEventListener('input', (e) => {
      this.search(e.target.value);
    });

    // Keyboard navigation
    this.input.addEventListener('keydown', (e) => {
      this.handleKeydown(e);
    });

    // Close on overlay click
    this.element.closest('.command-palette-overlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        this.close();
      }
    });

    // Prevent click inside from closing
    this.element.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  /**
   * Register keyboard shortcut (Ctrl+K)
   */
  registerKeyboardShortcut() {
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.toggle();
      }
    });
  }

  /**
   * Handle keyboard navigation
   */
  handleKeydown(e) {
    const items = this.results.querySelectorAll('.command-item');

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, items.length - 1);
        this.updateSelection(items);
        break;

      case 'ArrowUp':
        e.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
        this.updateSelection(items);
        break;

      case 'Enter':
        e.preventDefault();
        const selectedItem = items[this.selectedIndex];
        if (selectedItem) {
          this.select(selectedItem.dataset.id);
        }
        break;

      case 'Escape':
        e.preventDefault();
        this.close();
        break;
    }
  }

  /**
   * Update selected item styling
   */
  updateSelection(items) {
    items.forEach((item, index) => {
      if (index === this.selectedIndex) {
        item.classList.add('selected');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('selected');
      }
    });
  }

  /**
   * Fuzzy search
   */
  search(query) {
    const normalizedQuery = query.toLowerCase().trim();

    if (!normalizedQuery) {
      this.renderResults(this.commands);
      return;
    }

    const scored = this.commands.map(cmd => {
      let score = 0;

      // Title match (highest priority)
      if (cmd.title.toLowerCase().includes(normalizedQuery)) {
        score += 100;
      }

      // Description match
      if (cmd.description.toLowerCase().includes(normalizedQuery)) {
        score += 50;
      }

      // Keywords match
      cmd.keywords.forEach(keyword => {
        if (keyword.includes(normalizedQuery)) {
          score += 30;
        }
      });

      // Category bonus
      if (normalizedQuery.length >= 3) {
        const categoryMatch = this.fuzzyMatch(normalizedQuery, cmd.title);
        if (categoryMatch) score += 20;
      }

      return { ...cmd, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

    // Save to recent searches
    if (scored.length > 0) {
      this.saveRecentSearch(query);
    }

    this.renderResults(scored);
  }

  /**
   * Fuzzy match helper
   */
  fuzzyMatch(query, text) {
    const normalizedText = text.toLowerCase();
    let queryIndex = 0;

    for (let i = 0; i < normalizedText.length && queryIndex < query.length; i++) {
      if (normalizedText[i] === query[queryIndex]) {
        queryIndex++;
      }
    }

    return queryIndex === query.length;
  }

  /**
   * Render search results
   */
  renderResults(results) {
    if (results.length === 0) {
      this.results.innerHTML = `
        <div class="command-empty">
          <span class="empty-icon">🔍</span>
          <p>Không tìm thấy kết quả</p>
          <p class="empty-hint">Thử từ khóa khác</p>
        </div>
      `;
      this.selectedIndex = -1;
      return;
    }

    // Group by category
    const grouped = results.reduce((acc, cmd) => {
      if (!acc[cmd.category]) {
        acc[cmd.category] = [];
      }
      acc[cmd.category].push(cmd);
      return acc;
    }, {});

    let html = '';
    Object.keys(grouped).forEach(category => {
      html += `
        <div class="command-category-header">
          ${this.getCategoryLabel(category)}
        </div>
      `;

      grouped[category].forEach((cmd, index) => {
        html += `
          <div
            class="command-item"
            data-id="${cmd.id}"
            data-index="${Object.values(grouped).flat().indexOf(cmd)}"
          >
            <span class="command-icon">${cmd.icon}</span>
            <div class="command-info">
              <span class="command-title">${this.highlight(cmd.title)}</span>
              <span class="command-description">${cmd.description}</span>
            </div>
            ${cmd.type === CommandType.NAVIGATION ? `
              <span class="command-hint">↵</span>
            ` : ''}
          </div>
        `;
      });
    });

    this.results.innerHTML = html;
    this.selectedIndex = 0;
    this.updateSelection(this.results.querySelectorAll('.command-item'));
  }

  /**
   * Get category label
   */
  getCategoryLabel(category) {
    const labels = {
      [Category.PAGES]: 'Trang',
      [Category.ACTIONS]: 'Hành động',
      [Category.SETTINGS]: 'Cài đặt',
      [Category.TOOLS]: 'Công cụ',
      [Category.HELP]: 'Trợ giúp'
    };
    return labels[category] || category;
  }

  /**
   * Highlight matched text
   */
  highlight(text) {
    const query = this.input.value.toLowerCase();
    if (!query) return text;

    const index = text.toLowerCase().indexOf(query);
    if (index === -1) return text;

    return text.slice(0, index) +
      '<mark>' + text.slice(index, index + query.length) + '</mark>' +
      text.slice(index + query.length);
  }

  /**
   * Select a command
   */
  select(id) {
    const command = this.commands.find(c => c.id === id);
    if (!command) return;

    Logger.info(TAG, `Selected: ${command.title}`);

    // Add to recent searches
    this.saveRecentSearch(command.title);

    // Execute action or navigate
    if (command.action) {
      command.action();
    } else if (command.url) {
      window.location.href = command.url;
    }

    this.close();
  }

  /**
   * Toggle visibility
   */
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Open command palette
   */
  open() {
    this.isOpen = true;
    this.element.closest('.command-palette-overlay').classList.add('open');
    this.input.value = '';
    this.input.focus();
    this.selectedIndex = 0;
    this.renderResults(this.commands);
  }

  /**
   * Close command palette
   */
  close() {
    this.isOpen = false;
    this.element.closest('.command-palette-overlay').classList.remove('open');
    this.input.blur();
  }

  /**
   * Load recent searches from localStorage
   */
  loadRecentSearches() {
    try {
      const stored = localStorage.getItem('sadec_recent_searches');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Save recent search
   */
  saveRecentSearch(query) {
    try {
      let searches = this.loadRecentSearches();
      searches = searches.filter(s => s !== query);
      searches.unshift(query);
      searches = searches.slice(0, 5); // Keep last 5
      localStorage.setItem('sadec_recent_searches', JSON.stringify(searches));
      this.recentSearches = searches;
    } catch (error) {
      Logger.warn(TAG, 'Failed to save recent search:', error);
    }
  }

  /**
   * Add custom command
   */
  addCommand(command) {
    this.commands.push(command);
    Logger.info(TAG, `Added command: ${command.title}`);
  }

  /**
   * Remove command
   */
  removeCommand(id) {
    const index = this.commands.findIndex(c => c.id === id);
    if (index !== -1) {
      this.commands.splice(index, 1);
      Logger.info(TAG, `Removed command: ${id}`);
    }
  }

  /**
   * Destroy and cleanup
   */
  destroy() {
    this.element?.remove();
    Logger.info(TAG, 'Destroyed');
  }
}

/**
 * Custom Web Component
 */
class CommandPaletteElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: none;
        }
      </style>
      <slot></slot>
    `;
  }
}

// Initialize
if (!customElements.get('command-palette')) {
  customElements.define('command-palette', CommandPaletteElement);
}

const palette = new CommandPalette();

window.CommandPalette = palette;

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => palette.init());
} else {
  palette.init();
}

export { CommandPalette, CommandType, Category };
export default palette;

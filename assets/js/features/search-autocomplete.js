/**
 * Search Autocomplete Component - Sa Đéc Marketing Hub
 * Global search với autocomplete suggestions
 *
 * Features:
 * - Debounced input
 * - Keyboard navigation (Arrow keys, Enter, Escape)
 * - Highlighted matches
 * - Recent searches
 * - Quick actions
 *
 * Usage:
 *   SearchAutocomplete.init('#search-input', {
 *     minLength: 2,
 *     onSelect: (item) => Logger.info('Search selected', item)
 *   });
 */

import { Logger } from '../shared/logger.js';

class SearchAutocomplete {
  constructor(inputSelector, options = {}) {
    this.input = document.querySelector(inputSelector);
    if (!this.input) {
      Logger.warn('[SearchAutocomplete] Input not found:', inputSelector);
      return;
    }

    this.options = {
      minLength: 2,
      debounceMs: 300,
      maxResults: 8,
      showRecentSearches: true,
      showQuickActions: true,
      onSelect: null,
      onSearch: null,
      ...options
    };

    this.suggestions = [];
    this.selectedIndex = -1;
    this.recentSearches = this.loadRecentSearches();
    this.dropdown = null;
    this.debounceTimer = null;

    this.init();
  }

  /**
   * Initialize autocomplete
   */
  init() {
    this.createDropdown();
    this.bindEvents();
    this.addAccessibilityAttributes();
  }

  /**
   * Create dropdown element
   */
  createDropdown() {
    const wrapper = document.createElement('div');
    wrapper.className = 'autocomplete-wrapper';
    wrapper.style.position = 'relative';

    // Wrap input
    this.input.parentNode.insertBefore(wrapper, this.input);
    wrapper.appendChild(this.input);

    // Create dropdown
    this.dropdown = document.createElement('div');
    this.dropdown.className = 'autocomplete-dropdown';
    this.dropdown.setAttribute('role', 'listbox');
    this.dropdown.setAttribute('aria-label', 'Search suggestions');
    wrapper.appendChild(this.dropdown);

    // Add styles if not exists
    this.ensureStyles();
  }

  /**
   * Ensure CSS styles exist
   */
  ensureStyles() {
    if (document.getElementById('autocomplete-styles')) return;

    const style = document.createElement('style');
    style.id = 'autocomplete-styles';
    style.textContent = `
      .autocomplete-wrapper {
        position: relative;
        width: 100%;
      }

      .autocomplete-dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        max-height: 400px;
        overflow-y: auto;
        z-index: 1000;
        display: none;
        margin-top: 4px;
      }

      .autocomplete-dropdown.visible {
        display: block;
      }

      .autocomplete-section {
        padding: 8px 0;
        border-bottom: 1px solid #f3f4f6;
      }

      .autocomplete-section:last-child {
        border-bottom: none;
      }

      .autocomplete-section-title {
        padding: 6px 16px;
        font-size: 0.75rem;
        font-weight: 600;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .autocomplete-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 16px;
        cursor: pointer;
        transition: background-color 0.15s;
      }

      .autocomplete-item:hover,
      .autocomplete-item.selected {
        background-color: #f9fafb;
      }

      .autocomplete-item-icon {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f3f4f6;
        border-radius: 6px;
        color: #6b7280;
      }

      .autocomplete-item-content {
        flex: 1;
        min-width: 0;
      }

      .autocomplete-item-title {
        font-weight: 500;
        color: #1f2937;
        margin-bottom: 2px;
      }

      .autocomplete-item-description {
        font-size: 0.875rem;
        color: #6b7280;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .autocomplete-item kbd {
        font-size: 0.75rem;
        background: #f3f4f6;
        padding: 2px 6px;
        border-radius: 4px;
        color: #6b7280;
      }

      .autocomplete-item mark {
        background: #fef3c7;
        color: #92400e;
        padding: 0 2px;
        border-radius: 2px;
      }

      .autocomplete-empty {
        padding: 24px 16px;
        text-align: center;
        color: #6b7280;
      }

      .autocomplete-clear {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 16px;
        font-size: 0.875rem;
        color: #059669;
        cursor: pointer;
        background: #ecfdf5;
        border-top: 1px solid #d1fae5;
      }

      .autocomplete-clear:hover {
        background: #d1fae5;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Input events
    this.input.addEventListener('input', (e) => this.handleInput(e));
    this.input.addEventListener('keydown', (e) => this.handleKeydown(e));
    this.input.addEventListener('focus', () => this.handleFocus());
    this.input.addEventListener('blur', () => {
      // Delay hide to allow click on suggestion
      setTimeout(() => this.hideDropdown(), 150);
    });

    // Click on suggestion
    this.dropdown.addEventListener('click', (e) => {
      const item = e.target.closest('.autocomplete-item');
      if (item) {
        const index = parseInt(item.dataset.index, 10);
        this.select(this.suggestions[index]);
      }
    });
  }

  /**
   * Add accessibility attributes
   */
  addAccessibilityAttributes() {
    this.input.setAttribute('role', 'combobox');
    this.input.setAttribute('aria-expanded', 'false');
    this.input.setAttribute('aria-controls', 'autocomplete-dropdown');
    this.input.setAttribute('aria-autocomplete', 'list');
    this.input.setAttribute('aria-haspopup', 'listbox');
    this.dropdown.id = 'autocomplete-dropdown';
  }

  /**
   * Handle input event
   */
  handleInput(e) {
    const query = e.target.value.trim();

    // Clear debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Hide if too short
    if (query.length < this.options.minLength) {
      this.hideDropdown();
      return;
    }

    // Debounce search
    this.debounceTimer = setTimeout(() => {
      this.search(query);
    }, this.options.debounceMs);
  }

  /**
   * Handle keyboard navigation
   */
  handleKeydown(e) {
    const items = this.dropdown.querySelectorAll('.autocomplete-item');

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, this.suggestions.length - 1);
        this.highlightSelection();
        break;

      case 'ArrowUp':
        e.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
        this.highlightSelection();
        break;

      case 'Enter':
        e.preventDefault();
        if (this.selectedIndex >= 0 && this.suggestions[this.selectedIndex]) {
          this.select(this.suggestions[this.selectedIndex]);
        } else if (e.target.value.trim()) {
          this.handleSearch(e.target.value.trim());
        }
        break;

      case 'Escape':
        this.hideDropdown();
        this.input.blur();
        break;

      case 'Tab':
        this.hideDropdown();
        break;
    }
  }

  /**
   * Handle focus
   */
  handleFocus() {
    const query = this.input.value.trim();
    if (query.length >= this.options.minLength) {
      this.search(query);
    } else if (this.recentSearches.length > 0 || this.options.showQuickActions) {
      this.showRecentAndActions();
    }
  }

  /**
   * Search for suggestions
   */
  async search(query) {
    // Call custom search handler or use default
    if (this.options.onSearch) {
      this.suggestions = await this.options.onSearch(query);
    } else {
      this.suggestions = this.defaultSearch(query);
    }

    // Limit results
    this.suggestions = this.suggestions.slice(0, this.options.maxResults);

    // Add recent searches at top
    if (this.options.showRecentSearches && this.recentSearches.length > 0) {
      const recentSuggestions = this.recentSearches
        .filter(r => !this.suggestions.find(s => s.id === r.id))
        .slice(0, 3)
        .map(r => ({ ...r, type: 'recent' }));

      this.suggestions = [...recentSuggestions, ...this.suggestions];
    }

    this.render(query);
  }

  /**
   * Default search implementation
   */
  defaultSearch(query) {
    const suggestions = [];
    const lowerQuery = query.toLowerCase();

    // Navigation items
    const navItems = [
      { id: 'dashboard', title: 'Dashboard', description: 'Tổng quan hệ thống', icon: 'dashboard', url: '/admin/dashboard.html' },
      { id: 'leads', title: 'Leads', description: 'Quản lý khách hàng tiềm năng', icon: 'person', url: '/admin/leads.html' },
      { id: 'pipeline', title: 'Pipeline', description: 'Sales pipeline', icon: 'view_kanban', url: '/admin/pipeline.html' },
      { id: 'campaigns', title: 'Campaigns', description: 'Chiến dịch marketing', icon: 'campaign', url: '/admin/campaigns.html' },
      { id: 'finance', title: 'Finance', description: 'Tài chính & báo cáo', icon: 'attach_money', url: '/admin/finance.html' },
      { id: 'reports', title: 'Reports', description: 'Báo cáo & analytics', icon: 'analytics', url: '/admin/reports.html' },
      { id: 'settings', title: 'Settings', description: 'Cài đặt hệ thống', icon: 'settings', url: '/admin/settings.html' }
    ];

    // Quick actions
    const actions = [
      { id: 'new-lead', title: 'Thêm Lead mới', description: 'Tạo khách hàng tiềm năng mới', icon: 'person_add', action: 'new-lead' },
      { id: 'new-campaign', title: 'Tạo Campaign', description: 'Chiến dịch marketing mới', icon: 'add_circle', action: 'new-campaign' },
      { id: 'export-data', title: 'Export Data', description: 'Xuất dữ liệu', icon: 'download', action: 'export' },
      { id: 'toggle-theme', title: 'Đổi Theme', description: 'Sáng/Tối', icon: 'palette', action: 'toggle-theme' }
    ];

    // Filter by query
    [...navItems, ...actions].forEach(item => {
      if (item.title.toLowerCase().includes(lowerQuery) ||
          item.description.toLowerCase().includes(lowerQuery)) {
        suggestions.push({
          ...item,
          type: item.action ? 'action' : 'navigation'
        });
      }
    });

    return suggestions;
  }

  /**
   * Show recent searches and quick actions
   */
  showRecentAndActions() {
    const items = [];

    // Recent searches
    if (this.options.showRecentSearches && this.recentSearches.length > 0) {
      this.recentSearches.slice(0, 5).forEach(search => {
        items.push({
          ...search,
          type: 'recent',
          icon: 'history'
        });
      });
    }

    // Quick actions
    if (this.options.showQuickActions) {
      const actions = [
        { id: 'new-lead', title: 'Thêm Lead mới', description: 'Ctrl+N', icon: 'person_add', action: 'new-lead' },
        { id: 'new-campaign', title: 'Tạo Campaign', description: 'Ctrl+C', icon: 'add_circle', action: 'new-campaign' },
        { id: 'export', title: 'Export Data', description: 'Ctrl+E', icon: 'download', action: 'export' }
      ];
      items.push(...actions);
    }

    this.suggestions = items;
    this.render('');
  }

  /**
   * Render suggestions
   */
  render(query) {
    if (this.suggestions.length === 0) {
      this.dropdown.innerHTML = `
        <div class="autocomplete-empty">
          <span class="material-symbols-outlined" style="font-size: 48px; color: #d1d5db;">search</span>
          <p>Không tìm thấy kết quả</p>
        </div>
      `;
      this.showDropdown();
      return;
    }

    // Group by type
    const grouped = {};
    this.suggestions.forEach(item => {
      const type = item.type || 'default';
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(item);
    });

    // Render HTML
    let html = '';

    Object.entries(grouped).forEach(([type, items]) => {
      const typeLabels = {
        recent: 'Tìm kiếm gần đây',
        navigation: 'Điều hướng',
        action: 'Thao tác nhanh',
        default: 'Kết quả'
      };

      html += `<div class="autocomplete-section">`;
      html += `<div class="autocomplete-section-title">${typeLabels[type] || type}</div>`;

      items.forEach((item, index) => {
        const title = this.highlightMatch(item.title, query);
        const description = this.highlightMatch(item.description, query);

        html += `
          <div class="autocomplete-item"
               data-index="${index}"
               role="option"
               aria-selected="false"
               tabindex="-1">
            <div class="autocomplete-item-icon">
              <span class="material-symbols-outlined">${item.icon || 'article'}</span>
            </div>
            <div class="autocomplete-item-content">
              <div class="autocomplete-item-title">${title}</div>
              <div class="autocomplete-item-description">${description}</div>
            </div>
            ${item.action ? `<kbd>↵</kbd>` : ''}
          </div>
        `;
      });

      html += `</div>`;
    });

    // Clear recent searches button
    if (this.recentSearches.length > 0) {
      html += `
        <div class="autocomplete-clear" onclick="this.closest('.autocomplete-dropdown').parentNode.querySelector('input').dispatchEvent(new Event('clear-recent'))">
          <span><span class="material-symbols-outlined" style="vertical-align: middle; font-size: 16px;">delete</span> Xóa lịch sử tìm kiếm</span>
        </div>
      `;
    }

    this.dropdown.innerHTML = html;
    this.showDropdown();
  }

  /**
   * Highlight matching text
   */
  highlightMatch(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  /**
   * Highlight selected item
   */
  highlightSelection() {
    const items = this.dropdown.querySelectorAll('.autocomplete-item');
    items.forEach((item, index) => {
      if (index === this.selectedIndex) {
        item.classList.add('selected');
        item.setAttribute('aria-selected', 'true');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('selected');
        item.setAttribute('aria-selected', 'false');
      }
    });
  }

  /**
   * Select item
   */
  select(item) {
    // Add to recent searches
    if (item.type !== 'recent') {
      this.addToRecent(item);
    }

    // Handle selection
    if (this.options.onSelect) {
      this.options.onSelect(item);
    } else if (item.url) {
      window.location.href = item.url;
    } else if (item.action) {
      this.handleAction(item.action);
    }

    this.hideDropdown();
    this.selectedIndex = -1;
  }

  /**
   * Handle action
   */
  handleAction(action) {
    const actions = {
      'new-lead': () => window.location.href = '/admin/leads.html?action=new',
      'new-campaign': () => window.location.href = '/admin/campaigns.html?action=new',
      'export': () => {
        if (window.DataExport) {
          Toast.show('Preparing export...', 'info');
        }
      },
      'toggle-theme': () => {
        const event = new CustomEvent('toggle-theme');
        window.dispatchEvent(event);
      }
    };

    if (actions[action]) {
      actions[action]();
    }
  }

  /**
   * Handle search
   */
  handleSearch(query) {
    this.addToRecent({ title: query, icon: 'history' });
    if (this.options.onSearch) {
      this.options.onSearch(query);
    }
  }

  /**
   * Add to recent searches
   */
  addToRecent(item) {
    const existing = this.recentSearches.findIndex(r => r.id === item.id);
    if (existing >= 0) {
      this.recentSearches.splice(existing, 1);
    }
    this.recentSearches.unshift({
      id: item.id,
      title: item.title,
      description: item.description || '',
      icon: item.icon || 'history',
      url: item.url,
      action: item.action
    });

    // Limit to 10
    if (this.recentSearches.length > 10) {
      this.recentSearches = this.recentSearches.slice(0, 10);
    }

    localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches));
  }

  /**
   * Load recent searches
   */
  loadRecentSearches() {
    try {
      return JSON.parse(localStorage.getItem('recentSearches') || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Show dropdown
   */
  showDropdown() {
    this.dropdown.classList.add('visible');
    this.input.setAttribute('aria-expanded', 'true');
  }

  /**
   * Hide dropdown
   */
  hideDropdown() {
    this.dropdown.classList.remove('visible');
    this.input.setAttribute('aria-expanded', 'false');
    this.selectedIndex = -1;
  }

  /**
   * Clear recent searches
   */
  clearRecent() {
    this.recentSearches = [];
    localStorage.removeItem('recentSearches');
    this.hideDropdown();
  }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  const searchInputs = document.querySelectorAll('[data-autocomplete="true"]');
  searchInputs.forEach(input => {
    new SearchAutocomplete(`#${input.id}`);
  });
});

// Global access
if (typeof window !== 'undefined') {
  window.SearchAutocomplete = SearchAutocomplete;
}

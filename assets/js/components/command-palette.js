/**
 * Command Palette Component — Global Search (Ctrl+K)
 * Sa Đéc Marketing Hub
 * @version 1.0.0 | 2026-03-13
 */

class CommandPalette {
  constructor() {
    this.isOpen = false;
    this.query = '';
    this.results = [];
    this.selectedIndex = -1;
    this.commands = this.loadCommands();
    this.init();
  }

  /**
   * Initialize command palette
   */
  init() {
    this.createPalette();
    this.bindEvents();
    this.loadRecentSearches();
  }

  /**
   * Load available commands
   */
  loadCommands() {
    return [
      // Navigation
      { id: 'nav-dashboard', label: 'Dashboard', icon: 'dashboard', category: 'Navigation', action: () => this.navigate('/admin/dashboard.html') },
      { id: 'nav-leads', label: 'Leads', icon: 'person', category: 'Navigation', action: () => this.navigate('/admin/leads.html') },
      { id: 'nav-pipeline', label: 'Pipeline', icon: 'view_kanban', category: 'Navigation', action: () => this.navigate('/admin/pipeline.html') },
      { id: 'nav-campaigns', label: 'Campaigns', icon: 'campaign', category: 'Navigation', action: () => this.navigate('/admin/campaigns.html') },
      { id: 'nav-finance', label: 'Finance', icon: 'attach_money', category: 'Navigation', action: () => this.navigate('/admin/finance.html') },
      { id: 'nav-reports', label: 'Reports', icon: 'analytics', category: 'Navigation', action: () => this.navigate('/admin/reports.html') },

      // Actions
      { id: 'action-new-lead', label: 'New Lead', icon: 'person_add', category: 'Actions', action: () => this.navigate('/admin/leads.html?action=new') },
      { id: 'action-new-campaign', label: 'New Campaign', icon: 'add_circle', category: 'Actions', action: () => this.navigate('/admin/campaigns.html?action=new') },
      { id: 'action-export', label: 'Export Data', icon: 'download', category: 'Actions', action: () => this.showToast('Exporting data...', 'info') },

      // Settings
      { id: 'settings-profile', label: 'Profile Settings', icon: 'settings', category: 'Settings', action: () => this.navigate('/portal/profile.html') },
      { id: 'settings-theme', label: 'Toggle Theme', icon: 'palette', category: 'Settings', action: () => this.toggleTheme() },
      { id: 'settings-help', label: 'Help & Support', icon: 'help', category: 'Settings', action: () => this.openHelp() },
    ];
  }

  /**
   * Create command palette DOM
   */
  createPalette() {
    const palette = document.createElement('div');
    palette.id = 'command-palette';
    palette.className = 'command-palette';
    palette.setAttribute('role', 'dialog');
    palette.setAttribute('aria-modal', 'true');
    palette.setAttribute('aria-label', 'Command Palette');
    palette.innerHTML = `
      <div class="command-palette-overlay"></div>
      <div class="command-palette-content">
        <div class="command-palette-input-wrapper">
          <span class="material-symbols-outlined search-icon">search</span>
          <input
            type="text"
            class="command-palette-input"
            placeholder="Type a command or search..."
            aria-label="Search commands"
            autocomplete="off"
          />
          <kbd class="command-palette-shortcut">ESC</kbd>
        </div>
        <div class="command-palette-results">
          <div class="command-palette-section recent-searches" hidden>
            <div class="command-palette-section-header">
              <span class="material-symbols-outlined">history</span>
              <span>Recent Searches</span>
              <button class="clear-recent-btn" aria-label="Clear recent searches">
                <span class="material-symbols-outlined">delete</span>
              </button>
            </div>
            <div class="command-palette-recent-list"></div>
          </div>
          <div class="command-palette-section results-section">
            <div class="command-palette-results-list"></div>
          </div>
        </div>
        <div class="command-palette-footer">
          <span class="command-palette-hint">
            <kbd>↑</kbd> <kbd>↓</kbd> Navigate
          </span>
          <span class="command-palette-hint">
            <kbd>Enter</kbd> Select
          </span>
          <span class="command-palette-hint">
            <kbd>ESC</kbd> Close
          </span>
        </div>
      </div>
    `;

    document.body.appendChild(palette);
    this.palette = palette;
    this.input = palette.querySelector('.command-palette-input');
    this.resultsList = palette.querySelector('.command-palette-results-list');
    this.recentSection = palette.querySelector('.recent-searches');
    this.recentList = palette.querySelector('.command-palette-recent-list');
    this.clearRecentBtn = palette.querySelector('.clear-recent-btn');
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Open on Ctrl+K
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        this.toggle();
      }
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // Input handling
    this.input.addEventListener('input', (e) => {
      this.query = e.target.value.trim();
      this.selectedIndex = -1;

      if (this.query.length >= 2) {
        this.search(this.query);
      } else {
        this.showRecent();
      }
    });

    // Keyboard navigation
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.selectNext();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.selectPrev();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        this.executeSelected();
      }
    });

    // Close on overlay click
    this.palette.querySelector('.command-palette-overlay').addEventListener('click', () => {
      this.close();
    });

    // Clear recent searches
    this.clearRecentBtn.addEventListener('click', () => {
      this.recentSearches = [];
      this.saveRecent();
      this.showRecent();
    });
  }

  /**
   * Search commands
   */
  search(query) {
    const lowerQuery = query.toLowerCase();
    this.results = this.commands.filter(cmd =>
      cmd.label.toLowerCase().includes(lowerQuery) ||
      cmd.category.toLowerCase().includes(lowerQuery)
    );

    // Add to recent if exact match
    if (this.results.length > 0 && !this.recentSearches.includes(this.results[0].label)) {
      this.addToRecent(this.results[0].label);
    }

    this.render();
  }

  /**
   * Render results
   */
  render() {
    if (this.results.length === 0) {
      this.resultsList.innerHTML = `
        <div class="command-palette-empty">
          <span class="material-symbols-outlined">search_off</span>
          <p>No results found</p>
        </div>
      `;
      return;
    }

    // Group by category
    const grouped = this.results.reduce((acc, cmd) => {
      if (!acc[cmd.category]) acc[cmd.category] = [];
      acc[cmd.category].push(cmd);
      return acc;
    }, {});

    this.resultsList.innerHTML = Object.entries(grouped).map(([category, commands]) => `
      <div class="command-palette-group">
        <div class="command-palette-group-header">${category}</div>
        ${commands.map((cmd, index) => this.renderCommand(cmd, index)).join('')}
      </div>
    `).join('');

    // Bind click handlers
    this.resultsList.querySelectorAll('.command-palette-item').forEach((item, index) => {
      item.addEventListener('click', () => {
        this.selectedIndex = index;
        this.executeSelected();
      });
    });
  }

  /**
   * Render single command
   */
  renderCommand(cmd, index) {
    const isSelected = index === this.selectedIndex;
    return `
      <div
        class="command-palette-item ${isSelected ? 'selected' : ''}"
        data-index="${index}"
        role="option"
        aria-selected="${isSelected}"
      >
        <span class="material-symbols-outlined command-icon">${cmd.icon}</span>
        <span class="command-label">${this.highlightMatch(cmd.label)}</span>
        <span class="command-category">${cmd.category}</span>
      </div>
    `;
  }

  /**
   * Highlight matched text
   */
  highlightMatch(text) {
    if (!this.query) return text;
    const regex = new RegExp(`(${this.query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  /**
   * Select next item
   */
  selectNext() {
    if (this.selectedIndex < this.results.length - 1) {
      this.selectedIndex++;
      this.render();
      this.scrollToSelected();
    }
  }

  /**
   * Select previous item
   */
  selectPrev() {
    if (this.selectedIndex > 0) {
      this.selectedIndex--;
      this.render();
      this.scrollToSelected();
    }
  }

  /**
   * Execute selected command
   */
  executeSelected() {
    if (this.selectedIndex >= 0 && this.selectedIndex < this.results.length) {
      const cmd = this.results[this.selectedIndex];
      this.addToRecent(cmd.label);
      this.close();
      cmd.action();
    }
  }

  /**
   * Scroll selected item into view
   */
  scrollToSelected() {
    const selected = this.resultsList.querySelector('.command-palette-item.selected');
    if (selected) {
      selected.scrollIntoView({ block: 'nearest' });
    }
  }

  /**
   * Toggle palette visibility
   */
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Open palette
   */
  open() {
    this.isOpen = true;
    this.palette.classList.add('open');
    this.input.value = '';
    this.query = '';
    this.selectedIndex = -1;
    this.input.focus();
    this.showRecent();
    document.body.style.overflow = 'hidden';
  }

  /**
   * Close palette
   */
  close() {
    this.isOpen = false;
    this.palette.classList.remove('open');
    document.body.style.overflow = '';
  }

  /**
   * Show recent searches
   */
  showRecent() {
    if (this.recentSearches.length === 0) {
      this.recentSection.hidden = true;
      return;
    }

    this.recentSection.hidden = false;
    this.recentList.innerHTML = this.recentSearches.map(search => `
      <div class="command-palette-recent-item" data-search="${this.escapeHtml(search)}">
        <span class="material-symbols-outlined">history</span>
        <span class="recent-label">${this.escapeHtml(search)}</span>
        <button class="remove-recent-btn" aria-label="Remove">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
    `).join('');

    // Bind click handlers
    this.recentList.querySelectorAll('.command-palette-recent-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.closest('.remove-recent-btn')) {
          const search = item.dataset.search;
          this.recentSearches = this.recentSearches.filter(s => s !== search);
          this.saveRecent();
          this.showRecent();
        } else {
          const search = item.dataset.search;
          this.input.value = search;
          this.query = search;
          this.search(search);
        }
      });
    });
  }

  /**
   * Load recent searches from localStorage
   */
  loadRecentSearches() {
    const stored = localStorage.getItem('sadec-command-palette-recent');
    this.recentSearches = stored ? JSON.parse(stored) : [];
  }

  /**
   * Add to recent searches
   */
  addToRecent(search) {
    if (!this.recentSearches.includes(search)) {
      this.recentSearches.unshift(search);
      if (this.recentSearches.length > 5) {
        this.recentSearches = this.recentSearches.slice(0, 5);
      }
      this.saveRecent();
    }
  }

  /**
   * Save recent searches
   */
  saveRecent() {
    localStorage.setItem('sadec-command-palette-recent', JSON.stringify(this.recentSearches));
  }

  /**
   * Navigate to URL
   */
  navigate(url) {
    window.location.href = url;
  }

  /**
   * Toggle theme
   */
  toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark-mode');
    localStorage.setItem('sadec-theme', isDark ? 'dark' : 'light');
    this.showToast(`Switched to ${isDark ? 'dark' : 'light'} mode`, 'info');
  }

  /**
   * Open help
   */
  openHelp() {
    window.open('https://sadecmarketinghub.com/docs', '_blank');
  }

  /**
   * Show toast notification
   */
  showToast(message, type = 'info') {
    if (window.toastManager) {
      window.toastManager.show(message, type);
    } else {
      alert(message);
    }
  }

  /**
   * Escape HTML
   */
  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.commandPalette = new CommandPalette();
  });
} else {
  window.commandPalette = new CommandPalette();
}

export { CommandPalette };

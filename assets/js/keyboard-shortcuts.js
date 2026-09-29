/**
 * Keyboard Shortcuts Manager
 * Centralized shortcut registry with cheat sheet
 * @version 1.0.0 | 2026-03-13
 */

class KeyboardShortcuts {
  constructor() {
    this.shortcuts = new Map();
    this.cheatSheet = [];
    this.init();
  }

  /**
   * Initialize keyboard shortcuts
   */
  init() {
    this.registerDefaults();
    this.bindKeys();
    this.createCheatSheet();
  }

  /**
   * Register default shortcuts
   */
  registerDefaults() {
    // Global shortcuts
    this.register({
      key: 'k',
      ctrl: true,
      action: () => this.triggerCommandPalette(),
      description: 'Mở Command Palette',
      category: 'Global'
    });

    this.register({
      key: 'h',
      ctrl: false,
      action: () => this.triggerHelpTour(),
      description: 'Mở Help Tour',
      category: 'Global'
    });

    this.register({
      key: 'Escape',
      ctrl: false,
      action: () => this.closeModals(),
      description: 'Đóng modals/palette',
      category: 'Global'
    });

    this.register({
      key: '?',
      ctrl: false,
      action: () => this.showCheatSheet(),
      description: 'Hiển thị shortcut cheat sheet',
      category: 'Global'
    });

    // Navigation shortcuts
    this.register({
      key: 'g',
      ctrl: false,
      sequence: 'd',
      action: () => this.navigateTo('/admin/dashboard.html'),
      description: 'Go to Dashboard (g→d)',
      category: 'Navigation'
    });

    this.register({
      key: 'g',
      ctrl: false,
      sequence: 'c',
      action: () => this.navigateTo('/admin/campaigns.html'),
      description: 'Go to Campaigns (g→c)',
      category: 'Navigation'
    });

    this.register({
      key: 'g',
      ctrl: false,
      sequence: 'l',
      action: () => this.navigateTo('/admin/leads.html'),
      description: 'Go to Leads (g→l)',
      category: 'Navigation'
    });

    this.register({
      key: 'g',
      ctrl: false,
      sequence: 'f',
      action: () => this.navigateTo('/admin/finance.html'),
      description: 'Go to Finance (g→f)',
      category: 'Navigation'
    });

    this.register({
      key: 'g',
      ctrl: false,
      sequence: 'r',
      action: () => this.navigateTo('/admin/reports.html'),
      description: 'Go to Reports (g→r)',
      category: 'Navigation'
    });

    // Action shortcuts
    this.register({
      key: 'n',
      ctrl: true,
      action: () => this.createNewItem(),
      description: 'New item (context-aware)',
      category: 'Actions'
    });

    this.register({
      key: 'e',
      ctrl: true,
      action: () => this.exportData(),
      description: 'Export data',
      category: 'Actions'
    });

    this.register({
      key: 's',
      ctrl: true,
      action: (e) => {
        e.preventDefault();
        this.saveCurrent();
      },
      description: 'Save current',
      category: 'Actions'
    });

    // Search shortcuts
    this.register({
      key: '/',
      ctrl: false,
      action: () => this.focusSearch(),
      description: 'Focus search input',
      category: 'Search'
    });

    this.register({
      key: 'f',
      ctrl: true,
      action: () => this.focusSearch(),
      description: 'Focus search input',
      category: 'Search'
    });

    // Theme shortcuts
    this.register({
      key: 't',
      ctrl: true,
      action: () => this.toggleTheme(),
      description: 'Toggle dark/light theme',
      category: 'Settings'
    });

    this.register({
      key: 'd',
      ctrl: true,
      action: () => this.toggleDarkMode(),
      description: 'Toggle dark mode',
      category: 'Settings'
    });
  }

  /**
   * Register a shortcut
   */
  register(config) {
    const key = this.makeKey(config);
    this.shortcuts.set(key, config);
    this.cheatSheet.push(config);
  }

  /**
   * Make unique key for shortcut
   */
  makeKey(config) {
    const modifiers = [];
    if (config.ctrl) modifiers.push('ctrl');
    if (config.shift) modifiers.push('shift');
    if (config.alt) modifiers.push('alt');
    return `${modifiers.join('+')}+${config.key.toLowerCase()}`;
  }

  /**
   * Bind keyboard events
   */
  bindKeys() {
    let keySequence = [];
    let sequenceTimeout;

    document.addEventListener('keydown', (e) => {
      // Skip if typing in input/textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        // Except for Escape
        if (e.key !== 'Escape') return;
      }

      // Check for sequence (g→d, g→c, etc.)
      if (e.key === 'g') {
        keySequence.push('g');
        clearTimeout(sequenceTimeout);
        sequenceTimeout = setTimeout(() => keySequence = [], 1000);
        return;
      }

      if (keySequence.length > 0) {
        keySequence.push(e.key.toLowerCase());
        const sequenceKey = keySequence.join('+');
        
        for (const [key, config] of this.shortcuts) {
          if (config.sequence && key.startsWith('g+')) {
            const fullSequence = `g+${config.sequence}`;
            if (sequenceKey === fullSequence.replace(/\+/g, '+')) {
              e.preventDefault();
              config.action(e);
              keySequence = [];
              return;
            }
          }
        }
      }

      // Check for regular shortcuts
      const eventKey = this.makeKey({
        key: e.key,
        ctrl: e.ctrlKey || e.metaKey,
        shift: e.shiftKey,
        alt: e.altKey
      });

      const shortcut = this.shortcuts.get(eventKey);
      if (shortcut) {
        e.preventDefault();
        shortcut.action(e);
      }
    });
  }

  /**
   * Trigger command palette
   */
  triggerCommandPalette() {
    const event = new CustomEvent('open-command-palette');
    document.dispatchEvent(event);
    
    // Fallback: open command palette manually
    if (window.CommandPalette) {
      new CommandPalette();
    }
  }

  /**
   * Trigger help tour
   */
  triggerHelpTour() {
    if (window.helpTour) {
      helpTour.startTour();
    }
  }

  /**
   * Close modals
   */
  closeModals() {
    // Close command palette
    const palette = document.querySelector('.command-palette');
    if (palette) palette.remove();
    
    // Close tooltips
    document.querySelectorAll('.tooltip').forEach(el => el.remove());
    
    // Close any open modals
    document.querySelectorAll('[role="dialog"]').forEach(el => el.remove());
  }

  /**
   * Navigate to URL
   */
  navigateTo(url) {
    if (window.location.pathname !== url) {
      window.location.href = url;
    }
  }

  /**
   * Create new item (context-aware)
   */
  createNewItem() {
    const path = window.location.pathname;
    
    if (path.includes('leads')) {
      this.navigateTo('/admin/leads.html?action=new');
    } else if (path.includes('campaigns')) {
      this.navigateTo('/admin/campaigns.html?action=new');
    } else if (path.includes('projects')) {
      this.navigateTo('/portal/projects.html?action=new');
    } else {
      this.showToast('No create action available on this page', 'info');
    }
  }

  /**
   * Export data
   */
  exportData() {
    if (window.Loading) {
      Loading.show('body', { message: 'Đang export dữ liệu...' });
    }
    
    // Trigger export
    const event = new CustomEvent('export-data');
    document.dispatchEvent(event);
    
    setTimeout(() => {
      if (window.Loading) Loading.hide('body');
      this.showToast('Data exported successfully!', 'success');
    }, 1000);
  }

  /**
   * Save current
   */
  saveCurrent() {
    // Trigger form save if on edit page
    const saveBtn = document.querySelector('[type="submit"], .save-btn');
    if (saveBtn) {
      saveBtn.click();
      this.showToast('Đã lưu!', 'success');
    } else {
      this.showToast('Nothing to save on this page', 'info');
    }
  }

  /**
   * Focus search
   */
  focusSearch() {
    const searchInput = document.querySelector('input[type="search"], .search-input, #search');
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    } else {
      // Open command palette as fallback
      this.triggerCommandPalette();
    }
  }

  /**
   * Toggle theme
   */
  toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    this.showToast(`Theme: ${newTheme}`, 'info');
  }

  /**
   * Toggle dark mode
   */
  toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    this.showToast(`Dark mode: ${isDark ? 'ON' : 'OFF'}`, 'info');
  }

  /**
   * Show cheat sheet
   */
  showCheatSheet() {
    // Remove existing cheat sheet
    const existing = document.getElementById('shortcut-cheat-sheet');
    if (existing) existing.remove();

    // Group shortcuts by category
    const grouped = {};
    this.cheatSheet.forEach(shortcut => {
      const cat = shortcut.category || 'Other';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(shortcut);
    });

    // Create cheat sheet HTML
    const cheatSheet = document.createElement('div');
    cheatSheet.id = 'shortcut-cheat-sheet';
    cheatSheet.innerHTML = `
      <div class="cheat-sheet-overlay" onclick="this.parentElement.remove()"></div>
      <div class="cheat-sheet">
        <div class="cheat-sheet-header">
          <h2>⌨️ Keyboard Shortcuts</h2>
          <button class="cheat-sheet-close" onclick="document.getElementById('shortcut-cheat-sheet').remove()">✕</button>
        </div>
        <div class="cheat-sheet-content">
          ${Object.entries(grouped).map(([category, shortcuts]) => `
            <div class="cheat-sheet-category">
              <h3>${category}</h3>
              <div class="cheat-sheet-list">
                ${shortcuts.map(s => `
                  <div class="cheat-sheet-item">
                    <kbd class="cheat-sheet-key">${this.formatKey(s)}</kbd>
                    <span class="cheat-sheet-desc">${s.description}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    document.body.appendChild(cheatSheet);
  }

  /**
   * Format key for display
   */
  formatKey(shortcut) {
    const parts = [];
    if (shortcut.ctrl) parts.push('Ctrl');
    if (shortcut.shift) parts.push('Shift');
    if (shortcut.alt) parts.push('Alt');
    if (shortcut.sequence) {
      parts.push(`G`);
      parts.push(shortcut.sequence.toUpperCase());
    } else {
      parts.push(shortcut.key.toUpperCase());
    }
    return parts.join(' + ');
  }

  /**
   * Create cheat sheet button
   */
  createCheatSheet() {
    // Add floating cheat sheet button
    const btn = document.createElement('button');
    btn.className = 'shortcuts-help-btn';
    btn.innerHTML = '⌨️';
    btn.title = 'Keyboard Shortcuts (?)';
    btn.onclick = () => this.showCheatSheet();
    btn.style.cssText = `
      position: fixed;
      bottom: 90px;
      right: 24px;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, #00e5ff, #006a60);
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(0, 229, 255, 0.4);
      z-index: 9997;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.3s;
    `;
    btn.onmouseenter = () => btn.style.transform = 'scale(1.1)';
    btn.onmouseleave = () => btn.style.transform = 'scale(1)';
    document.body.appendChild(btn);
  }

  /**
   * Show toast
   */
  showToast(message, type = 'info') {
    if (window.Toast) {
      Toast.show({ title: type === 'success' ? '✓' : 'ℹ', message, type, duration: 2000 });
    }
  }
}

// Initialize on DOM ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    window.keyboardShortcuts = new KeyboardShortcuts();
  });
}

// Export for module usage
// Export for ES modules
export default KeyboardShortcuts;

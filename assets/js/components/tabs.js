/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SA ĐÉC MARKETING HUB — TABS COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Tabs navigation component với animations và accessibility
 *
 * Features:
 * - Tab switching với fade/slide animation
 * - Keyboard navigation (arrow keys, Home, End)
 * - URL hash sync (deep linking)
 * - Lazy content loading support
 * - ARIA attributes
 * - Auto-scroll overflowing tabs
 * - Line indicator animation
 *
 * Usage:
 *   HTML:
 *   <div class="mekong-tabs" data-tabs="my-tabs">
 *     <div class="mekong-tabs__list" role="tablist">
 *       <button role="tab" data-tab="tab1" class="mekong-tabs__tab">Tab 1</button>
 *       <button role="tab" data-tab="tab2" class="mekong-tabs__tab">Tab 2</button>
 *     </div>
 *     <div class="mekong-tabs__panels">
 *       <div role="tabpanel" data-panel="tab1">Content 1</div>
 *       <div role="tabpanel" data-panel="tab2">Content 2</div>
 *     </div>
 *   </div>
 *
 *   JS:
 *   Tabs.select('my-tabs', 'tab2');
 *   Tabs.on('change', (data) => { // Handle change event });
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

class TabsManager {
  constructor() {
    this.tabs = new Map();
    this.listeners = new Map();
    this.init();
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.initAll();
    });

    // Observer cho dynamic content
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              if (node.classList?.contains('mekong-tabs')) {
                this.initTabs(node);
              } else if (node.querySelectorAll) {
                node.querySelectorAll('.mekong-tabs').forEach((el) => this.initTabs(el));
              }
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.target.classList.contains('mekong-tabs__tab')) {
        this.handleKeyboard(e);
      }
    });

    // Hash change handling
    window.addEventListener('hashchange', () => {
      this.handleHashChange();
    });
  }

  /**
   * Initialize tất cả tabs
   */
  initAll(root = document) {
    root.querySelectorAll('.mekong-tabs').forEach((el) => this.initTabs(el));
  }

  /**
   * Initialize tabs container
   */
  initTabs(container) {
    const tabsId = container.getAttribute('data-tabs') || `tabs-${Date.now()}`;
    container.setAttribute('data-tabs', tabsId);

    const tablist = container.querySelector('[role="tablist"]');
    const tabs = Array.from(tablist?.querySelectorAll('[role="tab"]') || []);
    const panels = container.querySelectorAll('[role="tabpanel"]');

    if (!tabs.length || !panels.length) return;

    // Store tabs info
    this.tabs.set(tabsId, { container, tabs, panels, activeIndex: 0 });

    // Find initial tab from hash or first tab
    let initialIndex = 0;
    const hash = window.location.hash.slice(1);
    if (hash) {
      const hashIndex = tabs.findIndex((tab) => tab.getAttribute('data-tab') === hash);
      if (hashIndex >= 0) initialIndex = hashIndex;
    }

    // Check for data-active attribute
    const activeTab = tabs.find((tab) => tab.hasAttribute('data-active'));
    if (activeTab) {
      initialIndex = tabs.indexOf(activeTab);
    }

    // Bind events
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        this.select(tabsId, tab.getAttribute('data-tab'));
      });

      // Set ARIA attributes
      tab.setAttribute('aria-selected', 'false');
      tab.setAttribute('tabindex', '-1');
    });

    // Hide all panels
    panels.forEach((panel) => {
      panel.setAttribute('hidden', '');
      panel.setAttribute('aria-hidden', 'true');
    });

    // Activate initial tab
    this.select(tabsId, tabs[initialIndex].getAttribute('data-tab'), { silent: true });

    // Add indicator line
    this.addIndicator(tablist);
  }

  /**
   * Add animated indicator line
   */
  addIndicator(tablist) {
    if (tablist.querySelector('.mekong-tabs__indicator')) return;

    const indicator = document.createElement('div');
    indicator.className = 'mekong-tabs__indicator';
    tablist.appendChild(indicator);

    // Update indicator position
    const updateIndicator = () => {
      const activeTab = tablist.querySelector('[role="tab"][aria-selected="true"]');
      if (!activeTab) return;

      const rect = activeTab.getBoundingClientRect();
      const listRect = tablist.getBoundingClientRect();

      indicator.style.width = `${rect.width}px`;
      indicator.style.transform = `translateX(${rect.left - listRect}px)`;
    };

    // Initial position
    requestAnimationFrame(updateIndicator);

    // Update on resize
    window.addEventListener('resize', updateIndicator);

    // Store for updates
    tablist._updateIndicator = updateIndicator;
  }

  /**
   * Select tab by ID
   */
  select(tabsId, tabId, options = {}) {
    const tabsData = this.tabs.get(tabsId);
    if (!tabsData) return;

    const { tabs, panels, container } = tabsData;
    const tabIndex = tabs.findIndex((tab) => tab.getAttribute('data-tab') === tabId);
    if (tabIndex < 0) return;

    const previousIndex = tabsData.activeIndex;
    const previousTab = tabs[previousIndex];
    const previousPanel = panels[previousIndex];
    const newTab = tabs[tabIndex];
    const newPanel = panels[tabIndex];

    // Update ARIA
    tabs.forEach((tab) => {
      tab.setAttribute('aria-selected', 'false');
      tab.setAttribute('tabindex', '-1');
    });
    newTab.setAttribute('aria-selected', 'true');
    newTab.setAttribute('tabindex', '0');

    // Update panels với animation
    panels.forEach((panel) => {
      panel.setAttribute('hidden', '');
      panel.setAttribute('aria-hidden', 'true');
      panel.classList.remove('mekong-tabs__panel--active');
    });

    // Animation
    newPanel.removeAttribute('hidden');
    newPanel.setAttribute('aria-hidden', 'false');

    requestAnimationFrame(() => {
      newPanel.classList.add('mekong-tabs__panel--active');
    });

    // Update indicator
    const tablist = container.querySelector('[role="tablist"]');
    if (tablist?._updateIndicator) {
      requestAnimationFrame(tablist._updateIndicator);
    }

    // Update hash (silent option prevents history spam)
    if (!options.silent && newTab.getAttribute('data-hash') !== 'false') {
      window.history.pushState({ tabId }, '', `#${tabId}`);
    }

    // Lazy load content nếu có
    const lazyContent = newPanel.querySelector('[data-lazy-src]');
    if (lazyContent && !lazyContent.dataset.loaded) {
      this.loadLazyContent(lazyContent);
    }

    // Emit event
    tabsData.activeIndex = tabIndex;
    this.emit('change', {
      tabsId,
      tabId,
      tabIndex,
      previousTabId: tabs[previousIndex]?.getAttribute('data-tab'),
      previousTabIndex: previousIndex,
      panel: newPanel,
      tab: newTab
    });
  }

  /**
   * Load lazy content
   */
  loadLazyContent(element) {
    const src = element.getAttribute('data-lazy-src');
    if (!src) return;

    element.classList.add('mekong-tabs__lazy-loading');

    fetch(src)
      .then((res) => res.text())
      .then((html) => {
        element.innerHTML = html;
        element.dataset.loaded = 'true';
        element.classList.remove('mekong-tabs__lazy-loading');
        element.classList.add('mekong-tabs__lazy-loaded');
      })
      .catch((err) => {
        console.error('[Tabs] Failed to load lazy content:', err);
        element.classList.remove('mekong-tabs__lazy-loading');
        element.classList.add('mekong-tabs__lazy-error');
      });
  }

  /**
   * Handle keyboard navigation
   */
  handleKeyboard(e) {
    const tabs = Array.from(e.target.closest('[role="tablist"]')?.querySelectorAll('[role="tab"]') || []);
    const currentIndex = tabs.indexOf(e.target);
    if (currentIndex < 0) return;

    let newIndex;

    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        newIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
        tabs[newIndex].focus();
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        newIndex = currentIndex === tabs.length - 1 ? 0 : currentIndex + 1;
        tabs[newIndex].focus();
        break;
      case 'Home':
        e.preventDefault();
        tabs[0].focus();
        break;
      case 'End':
        e.preventDefault();
        tabs[tabs.length - 1].focus();
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        e.target.click();
        break;
    }
  }

  /**
   * Handle hash change
   */
  handleHashChange() {
    const hash = window.location.hash.slice(1);
    if (!hash) return;

    // Find matching tab
    for (const [tabsId, tabsData] of this.tabs.entries()) {
      const tab = tabsData.tabs.find((t) => t.getAttribute('data-tab') === hash);
      if (tab) {
        this.select(tabsId, hash);
        return;
      }
    }
  }

  /**
   * Event listener
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  off(event, callback) {
    this.listeners.get(event)?.delete(callback);
  }

  emit(event, data) {
    this.listeners.get(event)?.forEach((callback) => callback(data));
  }

  /**
   * Get current tab
   */
  getCurrent(tabsId) {
    const tabsData = this.tabs.get(tabsId);
    if (!tabsData) return null;

    const { tabs, activeIndex } = tabsData;
    return {
      tabId: tabs[activeIndex]?.getAttribute('data-tab'),
      tabIndex: activeIndex,
      tab: tabs[activeIndex],
      panel: tabsData.panels[activeIndex]
    };
  }

  /**
   * Enable/disable tab
   */
  setDisabled(tabsId, tabId, disabled) {
    const tabsData = this.tabs.get(tabsId);
    if (!tabsData) return;

    const tab = tabsData.tabs.find((t) => t.getAttribute('data-tab') === tabId);
    if (!tab) return;

    tab.disabled = disabled;
    tab.setAttribute('aria-disabled', disabled);
    tab.setAttribute('tabindex', disabled ? '-1' : '0');
  }

  /**
   * Refresh tabs (sau khi dynamic update)
   */
  refresh(tabsId) {
    const tabsData = this.tabs.get(tabsId);
    if (!tabsData) return;

    const { container } = tabsData;
    const tablist = container.querySelector('[role="tablist"]');

    if (tablist?._updateIndicator) {
      requestAnimationFrame(tablist._updateIndicator);
    }
  }
}

/**
 * Global instance
 */
const Tabs = new TabsManager();

// Export
window.Tabs = Tabs;
window.TabsManager = TabsManager;

export { Tabs, TabsManager };
export default Tabs;

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SA ĐÉC MARKETING HUB — ACCORDION COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Accordion/Collapse component với animations
 *
 * Features:
 * - Expand/collapse với smooth animation
 * - Multiple panels hoặc single mode
 * - Icon rotation animation
 * - Keyboard navigation
 * - ARIA attributes
 * - Nested accordion support
 * - Lazy content loading
 *
 * Usage:
 *   HTML:
 *   <div class="mekong-accordion" data-accordion="faq">
 *     <div class="mekong-accordion__item">
 *       <button class="mekong-accordion__header" aria-expanded="false">
 *         <span class="mekong-accordion__title">Question 1</span>
 *         <span class="mekong-accordion__icon"></span>
 *       </button>
 *       <div class="mekong-accordion__panel">
 *         <div class="mekong-accordion__content">Answer 1</div>
 *       </div>
 *     </div>
 *   </div>
 *
 *   JS:
 *   Accordion.expand('faq', 0);
 *   Accordion.collapse('faq', 0);
 *   Accordion.toggle('faq', 0);
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

class AccordionManager {
  constructor() {
    this.accordions = new Map();
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
              if (node.classList?.contains('mekong-accordion')) {
                this.initAccordion(node);
              } else if (node.querySelectorAll) {
                node.querySelectorAll('.mekong-accordion').forEach((el) => this.initAccordion(el));
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
  }

  /**
   * Initialize tất cả accordions
   */
  initAll(root = document) {
    root.querySelectorAll('.mekong-accordion').forEach((el) => this.initAccordion(el));
  }

  /**
   * Initialize single accordion
   */
  initAccordion(container) {
    const accordionId = container.getAttribute('data-accordion') || `accordion-${Date.now()}`;
    container.setAttribute('data-accordion', accordionId);

    const items = Array.from(container.querySelectorAll('.mekong-accordion__item'));
    const headers = container.querySelectorAll('.mekong-accordion__header');
    const panels = container.querySelectorAll('.mekong-accordion__panel');

    if (!items.length || !panels.length) return;

    // Store accordion info
    this.accordions.set(accordionId, { container, items, headers, panels, expanded: [] });

    // Check for multiple mode
    const isMultiple = container.hasAttribute('data-multiple');

    // Bind events
    headers.forEach((header, index) => {
      header.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggle(accordionId, index);
      });

      // Keyboard navigation
      header.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggle(accordionId, index);
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const nextHeader = headers[index + 1];
          nextHeader?.focus();
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          const prevHeader = headers[index - 1];
          prevHeader?.focus();
        }
        if (e.key === 'Home') {
          e.preventDefault();
          headers[0]?.focus();
        }
        if (e.key === 'End') {
          e.preventDefault();
          headers[headers.length - 1]?.focus();
        }
      });

      // Set initial ARIA
      header.setAttribute('role', 'button');
      header.setAttribute('tabindex', '0');
    });

    // Set initial state
    panels.forEach((panel, index) => {
      const header = headers[index];
      const isExpanded = header.hasAttribute('aria-expanded') && header.getAttribute('aria-expanded') === 'true';
      const content = panel.querySelector('.mekong-accordion__content');

      if (isExpanded) {
        this.expand(accordionId, index, { silent: true });
      } else {
        // Collapse với animation
        panel.setAttribute('aria-hidden', 'true');
        panel.style.height = '0';
        panel.style.overflow = 'hidden';
      }

      // Set ARIA cho panel
      panel.setAttribute('role', 'region');
      panel.setAttribute('aria-labelledby', header.id || `accordion-header-${index}`);
    });

    // Add icon nếu chưa có
    headers.forEach((header) => {
      if (!header.querySelector('.mekong-accordion__icon')) {
        const icon = document.createElement('span');
        icon.className = 'mekong-accordion__icon';
        icon.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        `;
        header.appendChild(icon);
      }
    });
  }

  /**
   * Toggle panel
   */
  toggle(accordionId, index, options = {}) {
    const accordion = this.accordions.get(accordionId);
    if (!accordion) return;

    const { expanded } = accordion;
    const isExpanded = expanded.includes(index);

    if (isExpanded) {
      this.collapse(accordionId, index, options);
    } else {
      this.expand(accordionId, index, options);
    }
  }

  /**
   * Expand panel
   */
  expand(accordionId, index, options = {}) {
    const accordion = this.accordions.get(accordionId);
    if (!accordion) return;

    const { container, items, headers, panels, expanded } = accordion;
    const isMultiple = container.hasAttribute('data-multiple');

    // Collapse others nếu không phải multiple mode
    if (!isMultiple) {
      expanded.forEach((i) => {
        if (i !== index) this.collapse(accordionId, i, { silent: true });
      });
    }

    // Skip nếu đã expanded
    if (expanded.includes(index)) return;

    const header = headers[index];
    const panel = panels[index];
    const content = panel.querySelector('.mekong-accordion__content');

    // Update ARIA
    header.setAttribute('aria-expanded', 'true');

    // Expand animation
    panel.removeAttribute('aria-hidden');
    const scrollHeight = content.scrollHeight;
    panel.style.height = `${scrollHeight}px`;
    panel.classList.add('mekong-accordion__panel--expanding');

    // Handle transition end
    const onTransitionEnd = () => {
      panel.classList.remove('mekong-accordion__panel--expanding');
      panel.style.height = 'auto';
      panel.removeEventListener('transitionend', onTransitionEnd);
    };

    panel.addEventListener('transitionend', onTransitionEnd);

    // Track expanded
    if (!expanded.includes(index)) {
      expanded.push(index);
    }

    // Icon animation
    const icon = header.querySelector('.mekong-accordion__icon');
    icon?.classList.add('mekong-accordion__icon--rotated');

    // Lazy load content
    const lazyContent = content.querySelector('[data-lazy-src]');
    if (lazyContent && !lazyContent.dataset.loaded) {
      this.loadLazyContent(lazyContent);
    }

    // Emit event
    if (!options.silent) {
      this.emit('expand', { accordionId, index, header, panel });
    }
  }

  /**
   * Collapse panel
   */
  collapse(accordionId, index, options = {}) {
    const accordion = this.accordions.get(accordionId);
    if (!accordion) return;

    const { headers, panels, expanded } = accordion;
    const header = headers[index];
    const panel = panels[index];

    // Update ARIA
    header.setAttribute('aria-expanded', 'false');

    // Collapse animation
    panel.style.height = `${panel.scrollHeight}px`;
    panel.classList.add('mekong-accordion__panel--collapsing');

    // Force reflow
    requestAnimationFrame(() => {
      panel.style.height = '0';
    });

    // Handle transition end
    const onTransitionEnd = () => {
      panel.classList.remove('mekong-accordion__panel--collapsing');
      panel.setAttribute('aria-hidden', 'true');
      panel.style.height = '0';
      panel.removeEventListener('transitionend', onTransitionEnd);
    };

    panel.addEventListener('transitionend', onTransitionEnd);

    // Remove from expanded
    const idx = expanded.indexOf(index);
    if (idx > -1) {
      expanded.splice(idx, 1);
    }

    // Icon animation
    const icon = header.querySelector('.mekong-accordion__icon');
    icon?.classList.remove('mekong-accordion__icon--rotated');

    // Emit event
    if (!options.silent) {
      this.emit('collapse', { accordionId, index, header, panel });
    }
  }

  /**
   * Expand all panels
   */
  expandAll(accordionId) {
    const accordion = this.accordions.get(accordionId);
    if (!accordion) return;

    accordion.container.setAttribute('data-multiple', 'true');
    accordion.items.forEach((_, index) => this.expand(accordionId, index));
  }

  /**
   * Collapse all panels
   */
  collapseAll(accordionId) {
    const accordion = this.accordions.get(accordionId);
    if (!accordion) return;

    [...accordion.expanded].forEach((index) => this.collapse(accordionId, index));
  }

  /**
   * Load lazy content
   */
  loadLazyContent(element) {
    const src = element.getAttribute('data-lazy-src');
    if (!src) return;

    element.classList.add('mekong-accordion__lazy-loading');

    fetch(src)
      .then((res) => res.text())
      .then((html) => {
        element.innerHTML = html;
        element.dataset.loaded = 'true';
        element.classList.remove('mekong-accordion__lazy-loading');
        element.classList.add('mekong-accordion__lazy-loaded');
      })
      .catch((err) => {
        console.error('[Accordion] Failed to load lazy content:', err);
        element.classList.remove('mekong-accordion__lazy-loading');
        element.classList.add('mekong-accordion__lazy-error');
      });
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
   * Get expanded panels
   */
  getExpanded(accordionId) {
    const accordion = this.accordions.get(accordionId);
    return accordion ? [...accordion.expanded] : [];
  }

  /**
   * Check if panel is expanded
   */
  isExpanded(accordionId, index) {
    const accordion = this.accordions.get(accordionId);
    return accordion ? accordion.expanded.includes(index) : false;
  }

  /**
   * Enable/disable panel
   */
  setDisabled(accordionId, index, disabled) {
    const accordion = this.accordions.get(accordionId);
    if (!accordion) return;

    const header = accordion.headers[index];
    header.disabled = disabled;
    header.setAttribute('aria-disabled', disabled);
    header.setAttribute('tabindex', disabled ? '-1' : '0');
  }
}

/**
 * Global instance
 */
const Accordion = new AccordionManager();

// Export
window.Accordion = Accordion;
window.AccordionManager = AccordionManager;

export { Accordion, AccordionManager };
export default Accordion;

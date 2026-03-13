/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SA ĐÉC MARKETING HUB — TOOLTIP COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Tooltip component với micro-animations và accessibility support
 *
 * Features:
 * - Position detection (top, bottom, left, right, auto)
 * - Show/hide on hover/focus/click
 * - ARIA attributes cho accessibility
 * - Dark mode support
 * - Micro-animation (fade-in + scale-up)
 * - Auto-hide với delay
 * - HTML content support
 *
 * Usage:
 *   HTML: <button data-tooltip="Helpful text" data-tooltip-position="top">Hover me</button>
 *   JS:   Tooltip.show(element, 'Content', { position: 'top', duration: 3000 })
 *         Tooltip.hide(element)
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

class TooltipManager {
  constructor() {
    this.activeTooltips = new Map();
    this.defaultDelay = 200; // ms before show
    this.defaultDuration = 5000; // ms before auto-hide
    this.init();
  }

  init() {
    // Auto-bind tooltips với data-tooltip attribute
    document.addEventListener('DOMContentLoaded', () => {
      this.bindAll();
    });

    // Re-bind khi có DOM changes (cho dynamic content)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1 && node.hasAttribute?.('data-tooltip')) {
              this.bind(node);
            }
            // Check children
            if (node.querySelectorAll) {
              node.querySelectorAll('[data-tooltip]').forEach((el) => this.bind(el));
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
   * Bind tooltip events cho element
   */
  bind(element) {
    const options = this.parseOptions(element);

    // Mouse events
    element.addEventListener('mouseenter', (e) => {
      this.show(element, options.content || element.getAttribute('data-tooltip'), options);
    });

    element.addEventListener('mouseleave', () => {
      this.hide(element);
    });

    // Focus events cho accessibility
    element.addEventListener('focus', (e) => {
      this.show(element, options.content || element.getAttribute('data-tooltip'), options);
    });

    element.addEventListener('blur', () => {
      this.hide(element);
    });

    // Click toggle (optional)
    if (element.hasAttribute('data-tooltip-click')) {
      element.addEventListener('click', (e) => {
        e.preventDefault();
        if (this.activeTooltips.has(element)) {
          this.hide(element);
        } else {
          this.show(element, options.content || element.getAttribute('data-tooltip'), options);
        }
      });
    }

    // Keyboard escape để hide
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideAll();
      }
    });
  }

  /**
   * Bind tất cả tooltips trong document
   */
  bindAll(root = document) {
    root.querySelectorAll('[data-tooltip]').forEach((el) => this.bind(el));
  }

  /**
   * Parse options từ element attributes
   */
  parseOptions(element) {
    return {
      position: element.getAttribute('data-tooltip-position') || 'auto',
      delay: parseInt(element.getAttribute('data-tooltip-delay')) || this.defaultDelay,
      duration: parseInt(element.getAttribute('data-tooltip-duration')) || this.defaultDuration,
      content: element.getAttribute('data-tooltip-html') || null,
      allowHTML: element.hasAttribute('data-tooltip-allow-html'),
      class: element.getAttribute('data-tooltip-class') || ''
    };
  }

  /**
   * Show tooltip
   */
  show(element, content, options = {}) {
    if (!content) return;

    const opts = { ...this.parseOptions(element), ...options };

    // Clear existing timer
    if (element._tooltipTimer) {
      clearTimeout(element._tooltipTimer);
    }

    // Delay before showing
    element._tooltipTimer = setTimeout(() => {
      // Remove existing tooltip cho element này
      this.hide(element);

      // Create tooltip element
      const tooltip = document.createElement('div');
      tooltip.className = `mekong-tooltip ${opts.class}`;
      tooltip.setAttribute('role', 'tooltip');
      tooltip.innerHTML = opts.allowHTML ? content : this.escapeHtml(content);

      // Set ARIA
      const tooltipId = `tooltip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      tooltip.id = tooltipId;
      element.setAttribute('aria-describedby', tooltipId);

      // Append to body
      document.body.appendChild(tooltip);
      this.activeTooltips.set(element, tooltip);

      // Position
      this.position(tooltip, element, opts.position);

      // Animation
      requestAnimationFrame(() => {
        tooltip.classList.add('mekong-tooltip--visible');
      });

      // Auto-hide
      if (opts.duration > 0) {
        element._tooltipHideTimer = setTimeout(() => {
          this.hide(element);
        }, opts.duration);
      }
    }, opts.delay);
  }

  /**
   * Hide tooltip
   */
  hide(element) {
    // Clear timers
    if (element._tooltipTimer) {
      clearTimeout(element._tooltipTimer);
      element._tooltipTimer = null;
    }
    if (element._tooltipHideTimer) {
      clearTimeout(element._tooltipHideTimer);
      element._tooltipHideTimer = null;
    }

    // Remove tooltip
    const tooltip = this.activeTooltips.get(element);
    if (tooltip) {
      // Animation out
      tooltip.classList.remove('mekong-tooltip--visible');
      tooltip.classList.add('mekong-tooltip--hiding');

      // Remove after animation
      setTimeout(() => {
        tooltip.remove();
        this.activeTooltips.delete(element);
        element.removeAttribute('aria-describedby');
      }, 200);
    }
  }

  /**
   * Hide tất cả tooltips
   */
  hideAll() {
    this.activeTooltips.forEach((_, element) => this.hide(element));
  }

  /**
   * Position tooltip relative to trigger
   */
  position(tooltip, element, preferredPosition) {
    const rect = element.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    // Viewport boundaries
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate positions
    let position = preferredPosition;
    let top, left;

    // Auto-detect nếu không có preference
    if (position === 'auto') {
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      const spaceRight = viewportWidth - rect.right;
      const spaceLeft = rect.left;

      // Prefer bottom or top based on space
      if (spaceBelow > tooltipRect.height + 10 || spaceBelow > spaceAbove) {
        position = 'bottom';
      } else if (spaceAbove > tooltipRect.height + 10) {
        position = 'top';
      } else if (spaceRight > tooltipRect.width + 10) {
        position = 'right';
      } else if (spaceLeft > tooltipRect.width + 10) {
        position = 'left';
      } else {
        position = 'top'; // Default fallback
      }
    }

    // Calculate position
    switch (position) {
      case 'top':
        top = rect.top + scrollY - tooltipRect.height - 8;
        left = rect.left + scrollX + (rect.width - tooltipRect.width) / 2;
        tooltip.setAttribute('data-position', 'top');
        break;
      case 'bottom':
        top = rect.bottom + scrollY + 8;
        left = rect.left + scrollX + (rect.width - tooltipRect.width) / 2;
        tooltip.setAttribute('data-position', 'bottom');
        break;
      case 'left':
        top = rect.top + scrollY + (rect.height - tooltipRect.height) / 2;
        left = rect.left + scrollX - tooltipRect.width - 8;
        tooltip.setAttribute('data-position', 'left');
        break;
      case 'right':
        top = rect.top + scrollY + (rect.height - tooltipRect.height) / 2;
        left = rect.right + scrollX + 8;
        tooltip.setAttribute('data-position', 'right');
        break;
    }

    // Boundary check
    if (left < scrollX + 5) {
      left = scrollX + 5;
    }
    if (left + tooltipRect.width > scrollX + viewportWidth - 5) {
      left = scrollX + viewportWidth - tooltipRect.width - 5;
    }
    if (top < scrollY + 5) {
      top = scrollY + 5;
    }
    if (top + tooltipRect.height > scrollY + viewportHeight - 5) {
      top = scrollY + viewportHeight - tooltipRect.height - 5;
    }

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
  }

  /**
   * Escape HTML để prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Update nội dung tooltip
   */
  update(element, content) {
    const tooltip = this.activeTooltips.get(element);
    if (tooltip) {
      tooltip.innerHTML = this.escapeHtml(content);
      this.position(tooltip, element, element.getAttribute('data-tooltip-position') || 'auto');
    }
  }

  /**
   * Enable tooltip (cho disabled elements)
   */
  enable(element) {
    element.removeAttribute('data-tooltip-disabled');
  }

  /**
   * Disable tooltip
   */
  disable(element) {
    element.setAttribute('data-tooltip-disabled', 'true');
    this.hide(element);
  }
}

/**
 * Global instance và shortcut methods
 */
const Tooltip = new TooltipManager();

// Export
window.Tooltip = Tooltip;
window.TooltipManager = TooltipManager;

export { Tooltip, TooltipManager };
export default Tooltip;

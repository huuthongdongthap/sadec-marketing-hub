/**
 * Tooltip Component - Enhanced
 * Tooltip với accessibility và positioning
 * @version 2.0.0 | 2026-03-14
 */

class Tooltip extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._boundPosition = this.positionTooltip.bind(this);
    this._escapeHandler = this.handleEscape.bind(this);
  }

  static get observedAttributes() {
    return ['content', 'position', 'delay'];
  }

  connectedCallback() {
    this.render();
    this.setupTrigger();
    this.setupDocumentListeners();
  }

  disconnectedCallback() {
    this.removeEventListeners();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue && this.shadowRoot) {
      this.render();
      if (name === 'content' && this.isShown) {
        this.updateContent();
      }
    }
  }

  render() {
    const content = this.getAttribute('content') || '';
    const position = this.getAttribute('position') || 'top';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          position: relative;
        }

        .tooltip-container {
          position: relative;
          display: inline-block;
        }

        .tooltip {
          position: absolute;
          padding: 8px 12px;
          background: var(--md-sys-color-inverse-surface, #2B2B2B);
          color: var(--md-sys-color-inverse-on-surface, #EAECEF);
          font-size: 12px;
          font-weight: 500;
          line-height: 1.4;
          border-radius: 4px;
          white-space: nowrap;
          opacity: 0;
          visibility: hidden;
          transform: translateX(-50%) translateY(4px);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 10000;
          pointer-events: none;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .tooltip.show {
          opacity: 1;
          visibility: visible;
          transform: translateX(-50%) translateY(0);
        }

        /* Positioning */
        .tooltip.top {
          bottom: 100%;
          left: 50%;
          margin-bottom: 8px;
        }

        .tooltip.bottom {
          top: 100%;
          left: 50%;
          margin-top: 8px;
        }

        .tooltip.left {
          right: 100%;
          top: 50%;
          margin-right: 8px;
          transform: translateY(-50%);
        }

        .tooltip.right {
          left: 100%;
          top: 50%;
          margin-left: 8px;
          transform: translateY(-50%);
        }

        /* Arrow */
        .tooltip::after {
          content: '';
          position: absolute;
          width: 0;
          height: 0;
          border: 6px solid transparent;
        }

        .tooltip.top::after {
          top: 100%;
          left: 50%;
          margin-left: -6px;
          border-top-color: var(--md-sys-color-inverse-surface, #2B2B2B);
        }

        .tooltip.bottom::after {
          bottom: 100%;
          left: 50%;
          margin-left: -6px;
          border-bottom-color: var(--md-sys-color-inverse-surface, #2B2B2B);
        }

        .tooltip.left::after {
          right: 100%;
          top: 50%;
          margin-top: -6px;
          border-left-color: var(--md-sys-color-inverse-surface, #2B2B2B);
        }

        .tooltip.right::after {
          left: 100%;
          top: 50%;
          margin-top: -6px;
          border-right-color: var(--md-sys-color-inverse-surface, #2B2B2B);
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .tooltip {
            transition: none;
          }
        }
      </style>
      <span class="tooltip-container">
        <slot></slot>
        <span class="tooltip ${position}" role="tooltip" aria-hidden="true">
          ${content}
        </span>
      </span>
    `;
  }

  setupTrigger() {
    const trigger = this.querySelector('[slot="trigger"]') || this.children[0];
    if (!trigger) return;

    trigger.setAttribute('aria-describedby', 'tooltip');

    this._showTimeout = null;
    this._hideTimeout = null;
    const delay = parseInt(this.getAttribute('delay'), 10) || 200;

    this._onMouseEnter = () => {
      this._showTimeout = setTimeout(() => this.show(), 100);
    };

    this._onMouseLeave = () => {
      clearTimeout(this._showTimeout);
      this._hideTimeout = setTimeout(() => this.hide(), delay);
    };

    this._onFocus = () => this.show();
    this._onBlur = () => this.hide();
    this._onClick = () => this.toggle();

    trigger.addEventListener('mouseenter', this._onMouseEnter);
    trigger.addEventListener('mouseleave', this._onMouseLeave);
    trigger.addEventListener('focus', this._onFocus);
    trigger.addEventListener('blur', this._onBlur);
    trigger.addEventListener('click', this._onClick);
    trigger.style.cursor = 'help';
  }

  setupDocumentListeners() {
    document.addEventListener('scroll', this._boundPosition, { passive: true });
    document.addEventListener('keydown', this._escapeHandler);
    window.addEventListener('resize', this._boundPosition);
  }

  show() {
    const tooltip = this.shadowRoot.querySelector('.tooltip');
    if (tooltip) {
      tooltip.classList.add('show');
      tooltip.setAttribute('aria-hidden', 'false');
      this.isShown = true;
      this.positionTooltip();
    }
  }

  hide() {
    const tooltip = this.shadowRoot.querySelector('.tooltip');
    if (tooltip) {
      tooltip.classList.remove('show');
      tooltip.setAttribute('aria-hidden', 'true');
      this.isShown = false;
    }
  }

  toggle() {
    this.isShown ? this.hide() : this.show();
  }

  updateContent() {
    const tooltip = this.shadowRoot.querySelector('.tooltip');
    const content = this.getAttribute('content') || '';
    if (tooltip) {
      tooltip.textContent = content;
    }
  }

  positionTooltip() {
    if (!this.isShown) return;

    const tooltip = this.shadowRoot.querySelector('.tooltip');
    if (!tooltip) return;

    const trigger = this.querySelector('[slot="trigger"]') || this.children[0];
    if (!trigger) return;

    const tooltipRect = tooltip.getBoundingClientRect();
    const triggerRect = trigger.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Reset position
    tooltip.style.left = '';
    tooltip.style.right = '';
    tooltip.style.top = '';
    tooltip.style.bottom = '';

    const position = this.getAttribute('position') || 'top';

    // Adjust if out of viewport
    if (position === 'top' && tooltipRect.top < 0) {
      tooltip.classList.remove('top');
      tooltip.classList.add('bottom');
    } else if (position === 'bottom' && tooltipRect.bottom > viewportHeight) {
      tooltip.classList.remove('bottom');
      tooltip.classList.add('top');
    }

    if (tooltipRect.left < 0) {
      tooltip.style.left = '0';
      tooltip.style.transform = 'translateY(-50%)';
    } else if (tooltipRect.right > viewportWidth) {
      tooltip.style.right = '0';
      tooltip.style.transform = 'translateY(-50%)';
    }
  }

  handleEscape(e) {
    if (e.key === 'Escape' && this.isShown) {
      this.hide();
    }
  }

  removeEventListeners() {
    const trigger = this.querySelector('[slot="trigger"]') || this.children[0];
    if (trigger) {
      trigger.removeEventListener('mouseenter', this._onMouseEnter);
      trigger.removeEventListener('mouseleave', this._onMouseLeave);
      trigger.removeEventListener('focus', this._onFocus);
      trigger.removeEventListener('blur', this._onBlur);
      trigger.removeEventListener('click', this._onClick);
    }

    document.removeEventListener('scroll', this._boundPosition);
    document.removeEventListener('keydown', this._escapeHandler);
    window.removeEventListener('resize', this._boundPosition);
  }
}

// Auto-register
if (!customElements.get('tooltip')) {
  customElements.define('tooltip', Tooltip);
}

export { Tooltip };

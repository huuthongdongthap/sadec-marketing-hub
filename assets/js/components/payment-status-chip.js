/**
 * Payment Status Chip Component
 * Material Design 3 Status Indicator
 */
class PaymentStatusChip extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['status'];
  }

  get status() {
    return this.getAttribute('status') || 'pending';
  }

  set status(value) {
    this.setAttribute('status', value);
  }

  connectedCallback() {
    if (!this.shadowRoot.querySelector('style')) {
      this.render();
    } else {
      this.updateView();
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'status' && oldValue !== newValue) {
      this.updateView();
    }
  }

  getStatusConfig(status) {
    const configs = {
      paid: {
        label: 'Paid',
        color: '#34C759',
        bgColor: 'rgba(52, 199, 89, 0.12)',
        icon: '✓'
      },
      pending: {
        label: 'Pending',
        color: '#FF9500',
        bgColor: 'rgba(255, 149, 0, 0.12)',
        icon: '⏱'
      },
      overdue: {
        label: 'Overdue',
        color: '#FF3B30',
        bgColor: 'rgba(255, 59, 48, 0.12)',
        icon: '!'
      },
      processing: {
        label: 'Processing',
        color: '#007AFF',
        bgColor: 'rgba(0, 122, 255, 0.12)',
        icon: '↻'
      }
    };

    return configs[status] || configs.pending;
  }

  updateView() {
    const chip = this.shadowRoot.querySelector('.status-chip');
    if (!chip) return; // Not rendered yet

    const config = this.getStatusConfig(this.status);

    // Update styles
    chip.className = `status-chip ${this.status}`;
    chip.style.color = config.color;
    chip.style.backgroundColor = config.bgColor;

    // Update content
    const icon = this.shadowRoot.querySelector('.status-icon');
    const label = this.shadowRoot.querySelector('.status-label');

    if (icon) icon.textContent = config.icon;
    if (label) label.textContent = config.label;
  }

  render() {
    const config = this.getStatusConfig(this.status);

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
        }

        .status-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 9999px;
          font-family: 'Google Sans Text', sans-serif;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.1px;
          transition: all 0.2s ease;
        }

        .status-icon {
          font-size: 14px;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .status-label {
          line-height: 1;
        }

        /* Animation for processing status */
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .status-chip.processing .status-icon {
          animation: rotate 1s linear infinite;
        }

        /* Pulse animation for overdue */
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .status-chip.overdue {
          animation: pulse 2s ease-in-out infinite;
        }

        /* Hover effect */
        .status-chip:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        /* Small variant */
        :host([size="small"]) .status-chip {
          padding: 4px 8px;
          font-size: 11px;
        }

        :host([size="small"]) .status-icon {
          font-size: 12px;
        }

        /* Large variant */
        :host([size="large"]) .status-chip {
          padding: 8px 16px;
          font-size: 15px;
        }

        :host([size="large"]) .status-icon {
          font-size: 16px;
        }
      </style>

      <div class="status-chip ${this.status}" style="
        color: ${config.color};
        background-color: ${config.bgColor};
      ">
        <span class="status-icon">${config.icon}</span>
        <span class="status-label">${config.label}</span>
      </div>
    `;
  }
}

customElements.define('payment-status-chip', PaymentStatusChip);

/**
 * Gateway Selector Component
 * Material Design 3 Radio Group for Payment Gateways
 */
class GatewaySelector extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._selectedGateway = null;
  }

  connectedCallback() {
    this.render();
    this.attachEventListeners();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --md-sys-color-primary: #006A60;
          --md-sys-color-on-primary: #FFFFFF;
          --md-sys-color-surface-container: #EDEFEE;
          --md-sys-color-outline: #6F7976;
          --md-sys-color-outline-variant: #BEC9C6;
          --md-sys-shape-corner-medium: 12px;
          display: block;
        }

        .gateway-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .gateway-option {
          position: relative;
          display: flex;
          align-items: center;
          padding: 16px;
          background: var(--md-sys-color-surface-container);
          border: 2px solid var(--md-sys-color-outline-variant);
          border-radius: var(--md-sys-shape-corner-medium);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .gateway-option:hover {
          border-color: var(--md-sys-color-outline);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .gateway-option.selected {
          border-color: var(--md-sys-color-primary);
          background: rgba(0, 106, 96, 0.08);
        }

        .radio-input {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }

        .radio-circle {
          width: 20px;
          height: 20px;
          border: 2px solid var(--md-sys-color-outline);
          border-radius: 50%;
          margin-right: 16px;
          position: relative;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .gateway-option.selected .radio-circle {
          border-color: var(--md-sys-color-primary);
        }

        .radio-circle::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(0);
          width: 10px;
          height: 10px;
          background: var(--md-sys-color-primary);
          border-radius: 50%;
          transition: transform 0.2s ease;
        }

        .gateway-option.selected .radio-circle::after {
          transform: translate(-50%, -50%) scale(1);
        }

        .gateway-logo {
          width: 48px;
          height: 48px;
          margin-right: 16px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: bold;
          color: white;
          flex-shrink: 0;
        }

        .gateway-logo.payos {
          background: linear-gradient(135deg, #0066FF, #0052CC);
        }

        .gateway-logo.vnpay {
          background: linear-gradient(135deg, #00509E, #003D7A);
        }

        .gateway-logo.momo {
          background: linear-gradient(135deg, #D82D8B, #A61E6E);
        }

        .gateway-info {
          flex: 1;
        }

        .gateway-name {
          font-family: 'Google Sans', sans-serif;
          font-size: 16px;
          font-weight: 500;
          color: #191C1B;
          margin-bottom: 4px;
        }

        .gateway-description {
          font-family: 'Google Sans Text', sans-serif;
          font-size: 13px;
          color: #6F7976;
        }

        .gateway-badge {
          background: #FFDEA6;
          color: #321B00;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
          margin-left: auto;
        }

        @media (max-width: 768px) {
          .gateway-option {
            padding: 12px;
          }

          .gateway-logo {
            width: 40px;
            height: 40px;
            font-size: 20px;
          }

          .gateway-name {
            font-size: 14px;
          }

          .gateway-description {
            font-size: 12px;
          }
        }
      </style>

      <div class="gateway-group">
        <label class="gateway-option" data-gateway="payos">
          <input type="radio" name="gateway" value="payos" class="radio-input">
          <span class="radio-circle"></span>
          <div class="gateway-logo payos">₫</div>
          <div class="gateway-info">
            <div class="gateway-name">PayOS</div>
            <div class="gateway-description">Fast and secure payment gateway</div>
          </div>
        </label>

        <label class="gateway-option" data-gateway="vnpay">
          <input type="radio" name="gateway" value="vnpay" class="radio-input">
          <span class="radio-circle"></span>
          <div class="gateway-logo vnpay">VP</div>
          <div class="gateway-info">
            <div class="gateway-name">VNPay</div>
            <div class="gateway-description">Vietnam's leading e-wallet</div>
          </div>
          <span class="gateway-badge">Popular</span>
        </label>

        <label class="gateway-option" data-gateway="momo">
          <input type="radio" name="gateway" value="momo" class="radio-input">
          <span class="radio-circle"></span>
          <div class="gateway-logo momo">M</div>
          <div class="gateway-info">
            <div class="gateway-name">MoMo</div>
            <div class="gateway-description">Mobile wallet & QR payment</div>
          </div>
        </label>
      </div>
    `;
  }

  attachEventListeners() {
    const options = this.shadowRoot.querySelectorAll('.gateway-option');
    const inputs = this.shadowRoot.querySelectorAll('.radio-input');

    options.forEach((option, index) => {
      option.addEventListener('click', () => {
        const gateway = option.dataset.gateway;
        this.selectGateway(gateway);
        inputs[index].checked = true;
      });
    });

    inputs.forEach(input => {
      input.addEventListener('change', (e) => {
        if (e.target.checked) {
          this.selectGateway(e.target.value);
        }
      });
    });
  }

  selectGateway(gateway) {
    this._selectedGateway = gateway;

    // Update UI
    const options = this.shadowRoot.querySelectorAll('.gateway-option');
    options.forEach(option => {
      if (option.dataset.gateway === gateway) {
        option.classList.add('selected');
      } else {
        option.classList.remove('selected');
      }
    });

    // Emit custom event
    this.dispatchEvent(new CustomEvent('gateway-selected', {
      detail: { gateway },
      bubbles: true,
      composed: true
    }));
  }

  get selectedGateway() {
    return this._selectedGateway;
  }
}

customElements.define('gateway-selector', GatewaySelector);

/**
 * Payment Modal Component
 * Material Design 3 Web Component with Shadow DOM
 */

// Import gateway selector component and payment manager
import './gateway-selector.js';
import { paymentManager } from '../payment-gateway.js';

class PaymentModal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._selectedGateway = null;
    this._isLoading = false;
  }

  static get observedAttributes() {
    return ['amount', 'package-name', 'invoice-id'];
  }

  get amount() {
    return this.getAttribute('amount') || '0';
  }

  set amount(value) {
    this.setAttribute('amount', value);
  }

  get packageName() {
    return this.getAttribute('package-name') || '';
  }

  set packageName(value) {
    this.setAttribute('package-name', value);
  }

  get invoiceId() {
    return this.getAttribute('invoice-id') || '';
  }

  set invoiceId(value) {
    this.setAttribute('invoice-id', value);
  }

  connectedCallback() {
    this.render();
    this.attachEventListeners();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --md-sys-color-primary: #006A60;
          --md-sys-color-on-primary: #FFFFFF;
          --md-sys-color-surface: #FAFDFC;
          --md-sys-color-on-surface: #191C1B;
          --md-sys-color-surface-container: #EDEFEE;
          --md-sys-color-outline-variant: #BEC9C6;
          --md-sys-shape-corner-large: 16px;
          --md-sys-shape-corner-medium: 12px;
          --md-sys-shape-corner-full: 9999px;
          --md-sys-elevation-3: 0 4px 8px 3px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.3);
          --payment-success: #34C759;
          --payment-pending: #FF9500;
          --payment-failed: #FF3B30;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .modal-container {
          background: var(--md-sys-color-surface);
          border-radius: var(--md-sys-shape-corner-large);
          box-shadow: var(--md-sys-elevation-3);
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-header {
          padding: 24px 24px 16px;
          border-bottom: 1px solid var(--md-sys-color-outline-variant);
        }

        .modal-title {
          font-family: 'Google Sans', sans-serif;
          font-size: 24px;
          font-weight: 500;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 8px;
        }

        .modal-subtitle {
          font-family: 'Google Sans Text', sans-serif;
          font-size: 14px;
          color: #6F7976;
        }

        .modal-body {
          padding: 24px;
        }

        .payment-info {
          background: var(--md-sys-color-surface-container);
          border-radius: var(--md-sys-shape-corner-medium);
          padding: 16px;
          margin-bottom: 24px;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
        }

        .info-label {
          font-family: 'Google Sans Text', sans-serif;
          font-size: 14px;
          color: #6F7976;
        }

        .info-value {
          font-family: 'Google Sans', sans-serif;
          font-size: 16px;
          font-weight: 500;
          color: var(--md-sys-color-on-surface);
        }

        .amount-value {
          font-size: 24px;
          color: var(--md-sys-color-primary);
        }

        .gateway-section {
          margin-bottom: 24px;
        }

        .section-label {
          font-family: 'Google Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 12px;
          display: block;
        }

        .modal-footer {
          padding: 16px 24px;
          border-top: 1px solid var(--md-sys-color-outline-variant);
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .btn {
          font-family: 'Google Sans Text', sans-serif;
          font-size: 14px;
          font-weight: 500;
          padding: 10px 24px;
          border-radius: var(--md-sys-shape-corner-full);
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-text {
          background: transparent;
          color: var(--md-sys-color-primary);
        }

        .btn-text:hover:not(:disabled) {
          background: rgba(0, 106, 96, 0.08);
        }

        .btn-filled {
          background: var(--md-sys-color-primary);
          color: var(--md-sys-color-on-primary);
        }

        .btn-filled:hover:not(:disabled) {
          filter: brightness(1.1);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid currentColor;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .error-message {
          background: #FFDAD6;
          color: #410002;
          padding: 12px 16px;
          border-radius: var(--md-sys-shape-corner-medium);
          font-size: 14px;
          margin-bottom: 16px;
          display: none;
        }

        .error-message.show {
          display: block;
        }
      </style>

      <div class="modal-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h2 class="modal-title">Payment</h2>
            <p class="modal-subtitle">Complete your payment to activate ${this.packageName}</p>
          </div>

          <div class="modal-body">
            <div class="error-message" id="errorMessage"></div>

            <div class="payment-info">
              <div class="info-row">
                <span class="info-label">Package</span>
                <span class="info-value">${this.packageName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Invoice ID</span>
                <span class="info-value">${this.invoiceId}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Amount</span>
                <span class="info-value amount-value">${this.formatCurrency(this.amount)}</span>
              </div>
            </div>

            <div class="gateway-section">
              <label class="section-label">Select Payment Gateway</label>
              <gateway-selector id="gatewaySelector"></gateway-selector>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-text" id="cancelBtn">Cancel</button>
            <button class="btn btn-filled" id="submitBtn" disabled>
              <span id="btnText">Continue to Payment</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    const gatewaySelector = this.shadowRoot.getElementById('gatewaySelector');
    const submitBtn = this.shadowRoot.getElementById('submitBtn');
    const cancelBtn = this.shadowRoot.getElementById('cancelBtn');

    if (gatewaySelector) {
      gatewaySelector.addEventListener('gateway-selected', (e) => {
        this._selectedGateway = e.detail.gateway;
        submitBtn.disabled = false;
      });
    }

    if (submitBtn) {
      submitBtn.addEventListener('click', () => this.handleSubmit());
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.handleCancel());
    }
  }

  async handleSubmit() {
    if (!this._selectedGateway || this._isLoading) return;

    this.setLoading(true);
    this.hideError();

    try {
      // Call PaymentManager directly to process payment
      const result = await paymentManager.processPayment(this._selectedGateway, {
        amount: this.amount,
        orderId: this.invoiceId,
        invoiceId: this.invoiceId,
        invoiceNumber: this.invoiceId,
        description: `Payment for ${this.packageName} - ${this.invoiceId}`,
        clientId: 'web-portal'
      });

      if (result.success) {
        // Dispatch event for host pages
        this.dispatchEvent(new CustomEvent('payment-submitted', {
          bubbles: true,
          composed: true,
          detail: {
            gateway: this._selectedGateway,
            amount: this.amount,
            packageName: this.packageName,
            invoiceId: this.invoiceId
          }
        }));

        if (result.type === 'redirect') {
          // Redirect to payment gateway URL
          window.location.href = result.data;
        } else if (result.type === 'display') {
          // Show QR code modal (for bank transfer)
          this.showQRModal(result.data);
        }
      } else {
        throw new Error(result.error || 'Payment processing failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      this.showError(error.message || 'Payment submission failed');
      this.setLoading(false);
    }
  }

  handleCancel() {
    this.dispatchEvent(new CustomEvent('payment-cancelled', {
      bubbles: true,
      composed: true
    }));
  }

  setLoading(isLoading) {
    this._isLoading = isLoading;
    const submitBtn = this.shadowRoot.getElementById('submitBtn');
    const btnText = this.shadowRoot.getElementById('btnText');

    if (submitBtn && btnText) {
      submitBtn.disabled = isLoading;
      if (isLoading) {
        btnText.innerHTML = '<span class="loading-spinner"></span> Processing...';
      } else {
        btnText.textContent = 'Continue to Payment';
      }
    }
  }

  showError(message) {
    const errorEl = this.shadowRoot.getElementById('errorMessage');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('show');
    }
  }

  hideError() {
    const errorEl = this.shadowRoot.getElementById('errorMessage');
    if (errorEl) {
      errorEl.classList.remove('show');
    }
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  showQRModal(qrData) {
    // TODO: Implement QR modal for bank transfer
    console.log('Show QR modal:', qrData);
    alert('QR Code payment not yet implemented. Please use another payment method.');
    this.setLoading(false);
  }
}

customElements.define('payment-modal', PaymentModal);

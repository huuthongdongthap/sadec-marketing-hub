/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LOADING BUTTON Web Component
 * Button with built-in loading state and animations
 *
 * Usage:
 *   <loading-button onclick="this.loading = true">Submit</loading-button>
 *   <loading-button variant="primary" icon="save">Save</loading-button>
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

class LoadingButton extends HTMLElement {
    static get observedAttributes() {
        return ['loading', 'variant', 'size', 'disabled', 'icon'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._loading = false;
        this._originalContent = '';
    }

    get loading() {
        return this._loading;
    }

    set loading(value) {
        this._loading = value;
        this._updateState();
    }

    get disabled() {
        return this.hasAttribute('disabled');
    }

    set disabled(value) {
        if (value) this.setAttribute('disabled', '');
        else this.removeAttribute('disabled');
    }

    connectedCallback() {
        this._originalContent = this.innerHTML.trim();
        this.render();
        this._setupRipple();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue && name === 'loading') {
            this._loading = newValue !== null;
            this._updateState();
        }
        if (name === 'variant' || name === 'size' || name === 'icon') {
            this.render();
        }
    }

    _setupRipple() {
        this.addEventListener('click', (e) => {
            if (this._loading || this.disabled) return;

            const rect = this.getBoundingClientRect();
            const ripple = document.createElement('span');
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.4);
                transform: scale(0);
                animation: button-ripple 0.6s ease-out;
                left: ${x}px;
                top: ${y}px;
                pointer-events: none;
            `;

            this.shadowRoot.querySelector('.ripple-container')?.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    }

    _updateState() {
        const button = this.shadowRoot.querySelector('button');
        const content = this.shadowRoot.querySelector('.btn-content');
        const spinner = this.shadowRoot.querySelector('.spinner');

        if (!button) return;

        if (this._loading) {
            button.disabled = true;
            button.setAttribute('aria-busy', 'true');
            content.style.opacity = '0';
            spinner.style.opacity = '1';
        } else {
            button.disabled = this.disabled;
            button.removeAttribute('aria-busy');
            content.style.opacity = '1';
            spinner.style.opacity = '0';
        }
    }

    render() {
        const variant = this.getAttribute('variant') || 'primary';
        const size = this.getAttribute('size') || 'md';
        const icon = this.getAttribute('icon');
        const loadingText = this.getAttribute('loading-text') || 'Đang xử lý...';

        const variants = {
            primary: `
                background: var(--md-sys-color-primary, #006A60);
                color: white;
            `,
            secondary: `
                background: var(--md-sys-color-secondary-container, #EDEFEE);
                color: var(--md-sys-color-on-secondary-container, #00210B);
            `,
            outline: `
                background: transparent;
                color: var(--md-sys-color-primary, #006A60);
                border: 2px solid var(--md-sys-color-primary, #006A60);
            `,
            ghost: `
                background: transparent;
                color: var(--md-sys-color-primary, #006A60);
            `,
            danger: `
                background: var(--md-sys-color-error, #BA1A1A);
                color: white;
            `
        };

        const sizes = {
            sm: 'padding: 6px 12px; font-size: 12px; height: 32px;',
            md: 'padding: 10px 20px; font-size: 14px; height: 40px;',
            lg: 'padding: 12px 24px; font-size: 16px; height: 48px;'
        };

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: inline-block;
                }

                button {
                    ${variants[variant] || variants.primary}
                    ${sizes[size] || sizes.md}
                    border: none;
                    border-radius: 24px;
                    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    position: relative;
                    overflow: hidden;
                    min-width: 100px;
                }

                button:not(:disabled):hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 106, 96, 0.3);
                }

                button:not(:disabled):active {
                    transform: translateY(0) scale(0.98);
                }

                button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .btn-content {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: opacity 0.2s ease;
                }

                .spinner {
                    position: absolute;
                    opacity: 0;
                    transition: opacity 0.2s ease;
                }

                .spinner-icon {
                    width: 20px;
                    height: 20px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-top-color: currentColor;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                @keyframes button-ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }

                .ripple-container {
                    position: absolute;
                    inset: 0;
                    overflow: hidden;
                    pointer-events: none;
                }

                /* Icon styles */
                .material-symbols-outlined {
                    font-size: 18px;
                }
            </style>

            <button>
                <span class="ripple-container"></span>
                <span class="btn-content">
                    ${icon ? `<span class="material-symbols-outlined">${icon}</span>` : ''}
                    <span>${this._originalContent || this.textContent}</span>
                </span>
                <span class="spinner">
                    <span class="spinner-icon"></span>
                </span>
            </button>
        `;

        this._updateState();
    }

    // Method to programmatically set loading
    startLoading() {
        this.loading = true;
    }

    stopLoading() {
        this.loading = false;
    }

    // Reset to initial state
    reset() {
        this.loading = false;
        this.disabled = false;
    }
}

// Register
customElements.define('loading-button', LoadingButton);
window.LoadingButton = LoadingButton;

// Auto-add ripple styles to document
if (!document.getElementById('loading-button-styles')) {
    const style = document.createElement('style');
    style.id = 'loading-button-styles';
    style.textContent = `
        @keyframes button-ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }

        @media (prefers-reduced-motion: reduce) {
            loading-button * {
                animation-duration: 0.01ms !important;
                transition-duration: 0.01ms !important;
            }
        }
    `;
    document.head.appendChild(style);
}

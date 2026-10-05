/**
 * Loading Button Styles and Variants (< 200 lines)
 * Provides CSS rules and design tokens for LoadingButton component.
 */

export const BUTTON_VARIANTS = {
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

export const BUTTON_SIZES = {
    sm: 'padding: 6px 12px; font-size: 12px; height: 32px;',
    md: 'padding: 10px 20px; font-size: 14px; height: 40px;',
    lg: 'padding: 12px 24px; font-size: 16px; height: 48px;'
};

export function getLoadingButtonCss(variant = 'primary', size = 'md') {
    return `
        :host {
            display: inline-block;
        }

        button {
            ${BUTTON_VARIANTS[variant] || BUTTON_VARIANTS.primary}
            ${BUTTON_SIZES[size] || BUTTON_SIZES.md}
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

        .material-symbols-outlined {
            font-size: 18px;
        }
    `;
}

export function injectGlobalRippleStyles() {
    if (typeof document === 'undefined') return;
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
}

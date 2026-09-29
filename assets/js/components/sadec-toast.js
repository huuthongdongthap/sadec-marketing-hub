/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SADEC-TOAST Web Component — Enhanced with Micro-animations
 * Sa Đéc Marketing Hub - Phase 3 UI Componentization
 *
 * Usage:
 *   SadecToast.show('Message', 'success');  // success | error | info | warning
 *   SadecToast.success('Done!');
 *   SadecToast.error('Failed!');
 *
 * Animations:
 *   - Slide in from right with spring easing
 *   - Success pop effect
 *   - Error shake effect
 *   - Progress bar showing remaining time
 * ═══════════════════════════════════════════════════════════════════════════
 */

class SadecToast extends HTMLElement {
    // Static container for all toasts
    static container = null;

    // Animation state
    static _animationsEnabled = true;

    // Toggle animations
    static enableAnimations(enable = true) {
        this._animationsEnabled = enable;
    }

    // Initialize container if not exists
    static initContainer() {
        if (!SadecToast.container) {
            SadecToast.container = document.createElement('div');
            SadecToast.container.id = 'sadec-toast-container';
            SadecToast.container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
                pointer-events: none;
            `;
            document.body.appendChild(SadecToast.container);
        }
        return SadecToast.container;
    }

    // Main show method with enhanced options
    static show(message, type = 'info', duration = 3000, options = {}) {
        const container = SadecToast.initContainer();
        const toast = document.createElement('sadec-toast');
        toast.setAttribute('message', message);
        toast.setAttribute('type', type);
        toast.setAttribute('duration', duration);

        // Optional: icon override
        if (options.icon) toast.setAttribute('icon', options.icon);
        // Optional: custom position
        if (options.position === 'bottom-left') {
            container.style.top = 'auto';
            container.style.bottom = '20px';
            container.style.right = 'auto';
            container.style.left = '20px';
        }

        container.appendChild(toast);
        return toast;
    }

    // Convenience methods with micro-animations
    static success(message, duration = 3000) {
        const toast = SadecToast.show(message, 'success', duration);
        // Trigger success pop animation
        setTimeout(() => {
            if (SadecToast._animationsEnabled) {
                toast.style.animation = 'success-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
            }
        }, 300);
        return toast;
    }

    static error(message, duration = 4000) {
        const toast = SadecToast.show(message, 'error', duration);
        // Trigger error shake animation
        setTimeout(() => {
            if (SadecToast._animationsEnabled) {
                toast.style.animation = 'error-shake 0.4s ease-in-out forwards';
            }
        }, 300);
        return toast;
    }

    static warning(message, duration = 3500) {
        const toast = SadecToast.show(message, 'warning', duration);
        // Trigger pulse animation
        if (SadecToast._animationsEnabled) {
            toast.style.animation = 'badge-pulse 2s ease-in-out infinite';
        }
        return toast;
    }

    static info(message, duration = 3000) {
        const toast = SadecToast.show(message, 'info', duration);
        // Trigger slide in
        setTimeout(() => {
            if (SadecToast._animationsEnabled) {
                toast.style.animation = 'slideInRight 0.4s ease-out forwards';
            }
        }, 10);
        return toast;
    }

    static loading(message, duration = 0) {
        return SadecToast.show(message, 'loading', duration, { icon: 'hourglass_empty' });
    }

    // Component lifecycle
    connectedCallback() {
        const message = this.getAttribute('message') || '';
        const type = this.getAttribute('type') || 'info';
        const duration = parseInt(this.getAttribute('duration')) || 3000;
        const icon = this.getAttribute('icon') || '';

        this.render(message, type, icon);
        this.animateIn();

        // Progress bar for duration tracking
        if (duration > 0 && this._progressBar) {
            this._progressBar.style.width = '0%';
            this._progressBar.style.transition = `width ${duration}ms linear`;
            requestAnimationFrame(() => {
                this._progressBar.style.width = '100%';
            });
        }

        // Auto-remove after duration
        this._timeoutId = setTimeout(() => this.dismiss(), duration);

        // Pause on hover
        this.addEventListener('mouseenter', () => {
            if (this._timeoutId) clearTimeout(this._timeoutId);
            if (this._progressBar) this._progressBar.style.transitionPlayState = 'paused';
        });

        this.addEventListener('mouseleave', () => {
            this._timeoutId = setTimeout(() => this.dismiss(), 500);
            if (this._progressBar) this._progressBar.style.transitionPlayState = 'running';
        });
    }

    render(message, type, customIcon = '') {
        const icons = {
            success: 'check_circle',
            error: 'error',
            warning: 'warning',
            info: 'info',
            loading: 'hourglass_empty'
        };

        const colors = {
            success: { bg: 'rgba(34, 197, 94, 0.95)', border: '#22c55e', icon: '#86efac' },
            error: { bg: 'rgba(239, 68, 68, 0.95)', border: '#ef4444', icon: '#fca5a5' },
            warning: { bg: 'rgba(245, 158, 11, 0.95)', border: '#f59e0b', icon: '#fcd34d' },
            info: { bg: 'rgba(59, 130, 246, 0.95)', border: '#3b82f6', icon: '#93c5fd' },
            loading: { bg: 'rgba(107, 114, 128, 0.95)', border: '#6b7280', icon: '#d1d5db' }
        };

        const color = colors[type] || colors.info;
        const icon = customIcon || icons[type] || icons.info;

        this.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding: 16px 20px;
            background: ${color.bg};
            border-left: 4px solid ${color.border};
            border-radius: 12px;
            color: white;
            font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
            font-size: 14px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
            pointer-events: auto;
            cursor: pointer;
            transform: translateX(120%);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
            max-width: 400px;
            animation: slideInRight 0.4s ease-out forwards;
        `;

        // Icon with animation
        const iconHTML = `
            <div style="
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: ${color.icon}20;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            ">
                <span class="material-symbols-outlined" style="font-size: 18px; color: ${color.icon};">${icon}</span>
            </div>
        `;

        this.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 12px;">
                ${iconHTML}
                <span style="flex: 1; line-height: 1.5;">${message}</span>
                <button class="material-symbols-outlined" style="
                    font-size: 18px;
                    opacity: 0.7;
                    cursor: pointer;
                    background: transparent;
                    border: none;
                    color: inherit;
                    padding: 4px;
                    border-radius: 50%;
                    transition: background 0.2s ease, opacity 0.2s ease;
                " onmouseenter="this.style.background='rgba(255,255,255,0.1)';this.style.opacity='1'" onmouseleave="this.style.background='transparent';this.style.opacity='0.7'" onclick="event.stopPropagation(); this.closest('sadec-toast').dismiss()">close</button>
            </div>
            <div style="
                height: 3px;
                background: rgba(255,255,255,0.2);
                border-radius: 3px;
                overflow: hidden;
                flex-shrink: 0;
            ">
                <div style="
                    height: 100%;
                    background: rgba(255,255,255,0.5);
                    width: 0%;
                    border-radius: 3px;
                "></div>
            </div>
        `;

        this._progressBar = this.querySelector('div[style*="height: 100%"]');

        // Click to dismiss
        this.addEventListener('click', () => this.dismiss());
    }

    animateIn() {
        requestAnimationFrame(() => {
            this.style.transform = 'translateX(0)';
        });
    }

    dismiss() {
        this.style.transform = 'translateX(120%)';
        this.style.opacity = '0';
        setTimeout(() => this.remove(), 300);
    }

    // Programmatic update
    update(message, type) {
        if (message) this.setAttribute('message', message);
        if (type) this.setAttribute('type', type);
        this.connectedCallback();
    }
}

// Register the custom element
customElements.define('sadec-toast', SadecToast);

// Export for global use
window.SadecToast = SadecToast;

// Also expose as MekongToast for legacy compatibility
window.MekongToast = SadecToast;

// Add CSS animations for toast effects
if (!document.getElementById('sadec-toast-animations')) {
    const style = document.createElement('style');
    style.id = 'sadec-toast-animations';
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(120%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes success-pop {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }

        @keyframes error-shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-5px); }
            40%, 80% { transform: translateX(5px); }
        }

        @keyframes badge-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
        }

        @media (prefers-reduced-motion: reduce) {
            sadec-toast {
                animation: none !important;
                transition: none !important;
            }
        }
    `;
    document.head.appendChild(style);
}

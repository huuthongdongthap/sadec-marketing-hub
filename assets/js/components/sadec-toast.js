/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SADEC-TOAST Web Component
 * Sa Đéc Marketing Hub - Phase 3 UI Componentization
 * 
 * Usage:
 *   SadecToast.show('Message', 'success');  // success | error | info | warning
 *   SadecToast.success('Done!');
 *   SadecToast.error('Failed!');
 * ═══════════════════════════════════════════════════════════════════════════
 */

class SadecToast extends HTMLElement {
    // Static container for all toasts
    static container = null;

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

    // Main show method
    static show(message, type = 'info', duration = 3000) {
        const container = SadecToast.initContainer();
        const toast = document.createElement('sadec-toast');
        toast.setAttribute('message', message);
        toast.setAttribute('type', type);
        toast.setAttribute('duration', duration);
        container.appendChild(toast);
        return toast;
    }

    // Convenience methods
    static success(message, duration = 3000) {
        return SadecToast.show(message, 'success', duration);
    }

    static error(message, duration = 4000) {
        return SadecToast.show(message, 'error', duration);
    }

    static warning(message, duration = 3500) {
        return SadecToast.show(message, 'warning', duration);
    }

    static info(message, duration = 3000) {
        return SadecToast.show(message, 'info', duration);
    }

    // Component lifecycle
    connectedCallback() {
        const message = this.getAttribute('message') || '';
        const type = this.getAttribute('type') || 'info';
        const duration = parseInt(this.getAttribute('duration')) || 3000;

        this.render(message, type);
        this.animate();

        // Auto-remove after duration
        setTimeout(() => this.dismiss(), duration);
    }

    render(message, type) {
        const icons = {
            success: 'check_circle',
            error: 'error',
            warning: 'warning',
            info: 'info'
        };

        const colors = {
            success: { bg: 'rgba(34, 197, 94, 0.95)', border: '#22c55e' },
            error: { bg: 'rgba(239, 68, 68, 0.95)', border: '#ef4444' },
            warning: { bg: 'rgba(245, 158, 11, 0.95)', border: '#f59e0b' },
            info: { bg: 'rgba(59, 130, 246, 0.95)', border: '#3b82f6' }
        };

        const color = colors[type] || colors.info;
        const icon = icons[type] || 'info';

        this.style.cssText = `
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px 20px;
            background: ${color.bg};
            border-left: 4px solid ${color.border};
            border-radius: 8px;
            color: white;
            font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
            font-size: 14px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
            pointer-events: auto;
            cursor: pointer;
            transform: translateX(120%);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            max-width: 350px;
        `;

        this.innerHTML = `
            <span class="material-symbols-outlined" style="font-size: 20px;">${icon}</span>
            <span style="flex: 1;">${message}</span>
            <span class="material-symbols-outlined" style="font-size: 18px; opacity: 0.7; cursor: pointer;" onclick="this.parentElement.dismiss()">close</span>
        `;

        // Click to dismiss
        this.addEventListener('click', () => this.dismiss());
    }

    animate() {
        // Slide in
        requestAnimationFrame(() => {
            this.style.transform = 'translateX(0)';
        });
    }

    dismiss() {
        this.style.transform = 'translateX(120%)';
        this.style.opacity = '0';
        setTimeout(() => this.remove(), 300);
    }
}

// Register the custom element
customElements.define('sadec-toast', SadecToast);

// Export for global use
window.SadecToast = SadecToast;

// Also expose as MekongToast for legacy compatibility
window.MekongToast = SadecToast;

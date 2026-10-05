/**
 * ==============================================
 * MEKONG AGENCY - ENHANCED UI UTILITIES
 * Toast, ThemeManager, ScrollProgress, MobileSidebar (< 200 lines)
 * ==============================================
 */

// ===== TOAST UTILITIES =====
export class Toast {
    static container = null;

    static init() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    }

    static show(message, type = 'info', duration = 4000) {
        this.init();

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
      <span class="material-symbols-outlined">${this.getIcon(type)}</span>
      <span>${message}</span>
    `;

        this.container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'toast-out 0.3s forwards';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    static getIcon(type) {
        const icons = {
            success: 'check_circle',
            error: 'error',
            info: 'info',
            warning: 'warning'
        };
        return icons[type] || 'info';
    }

    static success(msg) { this.show(msg, 'success'); }
    static error(msg) { this.show(msg, 'error'); }
    static info(msg) { this.show(msg, 'info'); }
    static warning(msg) { this.show(msg, 'warning'); }
}

// ===== THEME MANAGEMENT =====
export class ThemeManager {
    static STORAGE_KEY = 'mekong-theme';

    static init() {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
            document.documentElement.setAttribute('data-theme', saved);
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }

    static toggle() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem(this.STORAGE_KEY, next);
        Toast.info(`Theme switched to ${next} mode`);
        return next;
    }

    static get() {
        return document.documentElement.getAttribute('data-theme') || 'light';
    }
}

// ===== SCROLL PROGRESS =====
export class ScrollProgress {
    static init() {
        if (document.querySelector('.scroll-progress')) return;

        const progress = document.createElement('div');
        progress.className = 'scroll-progress';
        document.body.prepend(progress);

        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) : 0;
            progress.style.transform = `scaleX(${scrollPercent})`;
        });
    }
}

// ===== MOBILE SIDEBAR =====
export class MobileSidebar {
    static init() {
        const sidebar = document.querySelector('.sidebar-glass');
        if (!sidebar || window.innerWidth > 768) return;

        if (document.querySelector('.sidebar-overlay')) return;

        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);

        const menuBtn = document.createElement('button');
        menuBtn.className = 'mobile-menu-btn';
        menuBtn.innerHTML = '<span class="material-symbols-outlined">menu</span>';
        document.body.appendChild(menuBtn);

        menuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('active');
        });

        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        });
    }
}

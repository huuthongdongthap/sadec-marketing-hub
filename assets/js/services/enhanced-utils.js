/**
 * ==============================================
 * MEKONG AGENCY - ENHANCED UTILITIES
 * Comprehensive shared utility functions
 *
 * Note: This file exports UI components, DOM utilities,
 * string/array utilities, and classes.
 * Format functions are in shared/format-utils.js
 * and should be imported via core-utils.js
 * ==============================================
 */

// ===== ID GENERATION =====
export function generateId(prefix = 'id') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function formatPercent(value, decimals = 0) {
    return `${value.toFixed(decimals)}%`;
}

// ===== STRING UTILITIES =====
export function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getInitials(name) {
    if (!name) return '';
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

export function slugify(str) {
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

// ===== ARRAY UTILITIES =====
export function groupBy(array, key) {
    return array.reduce((groups, item) => {
        const group = item[key];
        if (!groups[group]) groups[group] = [];
        groups[group].push(item);
        return groups;
    }, {});
}

export function sortBy(array, key, order = 'asc') {
    return [...array].sort((a, b) => {
        const valA = a[key];
        const valB = b[key];

        let comparison = 0;
        if (typeof valA === 'string' && typeof valB === 'string') {
             comparison = valA.localeCompare(valB, 'vi-VN');
        } else {
             if (valA > valB) comparison = 1;
             else if (valA < valB) comparison = -1;
        }

        return order === 'desc' ? comparison * -1 : comparison;
    });
}

export function sum(array, key) {
    return array.reduce((total, item) => total + (item[key] || 0), 0);
}

export function average(array, key) {
    if (array.length === 0) return 0;
    return sum(array, key) / array.length;
}

// ===== SECURITY UTILITIES =====
export function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ===== DOM UTILITIES =====
export function createElement(tag, props = {}, children = []) {
    const element = document.createElement(tag);

    // Apply properties
    Object.keys(props).forEach(key => {
        if (key.startsWith('on') && typeof props[key] === 'function') {
            // Event handler
            element.addEventListener(key.substring(2).toLowerCase(), props[key]);
        } else if (key === 'className') {
            // Class name
            element.className = props[key];
        } else if (key === 'textContent' || key === 'innerHTML') {
            // Text content
            element[key] = props[key];
        } else {
            // Regular attributes
            element.setAttribute(key, props[key]);
        }
    });

    // Append children
    children.forEach(child => {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else if (child instanceof Element) {
            element.appendChild(child);
        }
    });

    return element;
}

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
        // Check if element already exists to prevent duplicates
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

        // Check if elements already exist to prevent duplicates
        if (document.querySelector('.sidebar-overlay')) return;

        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);

        // Create menu button
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

// ===== EXPORTS =====
const MekongUtils = {
    generateId,
    formatCurrency,
    formatCurrencyCompact,
    formatCurrencyVN,
    formatDate,
    formatDateTime,
    formatRelativeTime,
    formatNumber,
    formatPercent,
    truncate,
    capitalize,
    getInitials,
    slugify,
    groupBy,
    sortBy,
    sum,
    average,
    debounce,
    throttle,
    escapeHTML,
    createElement,
    Toast,
    ThemeManager,
    ScrollProgress,
    MobileSidebar
};
export default MekongUtils;

// Export for browser
if (typeof window !== 'undefined') {
    window.MekongUtils = MekongUtils;
    // Also expose individual functions
    Object.assign(window, MekongUtils);
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MekongUtils;
}
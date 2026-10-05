/**
 * ==============================================
 * MEKONG AGENCY - ENHANCED UTILITIES
 * Comprehensive shared utility functions (< 200 lines)
 *
 * Note: Format functions re-exported from shared/format-utils.js
 * UI classes re-exported from core/enhanced-ui.js
 * ==============================================
 */

// ===== RE-EXPORTS FROM SHARED =====
import {
    formatCurrency,
    formatCurrencyCompact,
    formatCurrencyVN,
    formatNumber,
    formatDate,
    formatDateTime,
    formatRelativeTime,
    truncate,
    debounce,
    throttle
} from '../shared/format-utils.js';

// ===== RE-EXPORTS FROM ENHANCED UI =====
import {
    Toast,
    ThemeManager,
    ScrollProgress,
    MobileSidebar
} from './enhanced-ui.js';

export {
    formatCurrency,
    formatCurrencyCompact,
    formatCurrencyVN,
    formatNumber,
    formatDate,
    formatDateTime,
    formatRelativeTime,
    truncate,
    debounce,
    throttle,
    Toast,
    ThemeManager,
    ScrollProgress,
    MobileSidebar
};

// ===== ID GENERATION =====
export function generateId(prefix = 'id') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 11).padEnd(9, '0')}`;
}

export function formatPercent(value, decimals = 0) {
    return `${value.toFixed(decimals)}%`;
}

// ===== STRING UTILITIES =====
export function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getInitials(name, limit = 3) {
    if (!name) return '';
    return name
        .split(' ')
        .filter(Boolean)
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, limit);
}

export function slugify(str) {
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
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

    Object.keys(props).forEach(key => {
        if (key.startsWith('on') && typeof props[key] === 'function') {
            element.addEventListener(key.substring(2).toLowerCase(), props[key]);
        } else if (key === 'className') {
            element.className = props[key];
        } else if (key === 'textContent' || key === 'innerHTML') {
            element[key] = props[key];
        } else {
            element.setAttribute(key, props[key]);
        }
    });

    children.forEach(child => {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else if (child instanceof Element) {
            element.appendChild(child);
        }
    });

    return element;
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

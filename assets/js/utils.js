/**
 * ==============================================
 * MEKONG AGENCY - UTILITIES
 * Shared utility functions
 * ==============================================
 */

// ===== ID GENERATION =====
export function generateId(prefix = 'id') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ===== CURRENCY FORMATTING =====
export function formatCurrency(amount, currency = 'VND') {
    if (amount === null || amount === undefined) return '--'; // Handle null/undefined like admin client
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

export function formatCurrencyCompact(amount, currency = 'VND') {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: currency,
        notation: 'compact'
    }).format(amount);
}

// ===== DATE FORMATTING =====
export function formatDate(date, style = 'medium') {
    if (!date) return '--'; // Handle null/undefined
    const d = new Date(date);
    if (style === 'short') {
        return d.toLocaleDateString('vi-VN');
    }
    if (style === 'short-yearless') {
        return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    }
    if (style === 'long') {
        return d.toLocaleDateString('vi-VN', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }
    return d.toLocaleDateString('vi-VN', {
        year: 'numeric', month: 'short', day: 'numeric'
    });
}

export function formatDateTime(date) {
    const d = new Date(date);
    return d.toLocaleString('vi-VN');
}

export function formatRelativeTime(date) {
    const d = new Date(date);
    const now = new Date();
    const diffInSeconds = (d - now) / 1000;
    
    // Use Intl.RelativeTimeFormat for better localization
    const rtf = new Intl.RelativeTimeFormat('vi-VN', { numeric: 'auto' });

    if (Math.abs(diffInSeconds) < 60) return rtf.format(Math.round(diffInSeconds), 'second');
    if (Math.abs(diffInSeconds) < 3600) return rtf.format(Math.round(diffInSeconds / 60), 'minute');
    if (Math.abs(diffInSeconds) < 86400) return rtf.format(Math.round(diffInSeconds / 3600), 'hour');
    if (Math.abs(diffInSeconds) < 2592000) return rtf.format(Math.round(diffInSeconds / 86400), 'day');
    if (Math.abs(diffInSeconds) < 31536000) return rtf.format(Math.round(diffInSeconds / 2592000), 'month');
    return rtf.format(Math.round(diffInSeconds / 31536000), 'year');
}

// ===== NUMBER FORMATTING =====
export function formatNumber(num) {
    if (num === null || num === undefined) return '--';
    return new Intl.NumberFormat('vi-VN').format(num);
}

export function formatPercent(value, decimals = 0) {
    return `${value.toFixed(decimals)}%`;
}

// ===== STRING UTILITIES =====
export function truncate(str, length = 50) {
    if (str.length <= length) return str;
    return str.slice(0, length) + '...';
}

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

// ===== DEBOUNCE/THROTTLE =====
export function debounce(fn, delay = 300) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), delay);
    };
}

export function throttle(fn, limit = 300) {
    let inThrottle;
    return (...args) => {
        if (!inThrottle) {
            fn(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ===== EXPORTS =====
const MekongUtils = {
    generateId,
    formatCurrency,
    formatCurrencyCompact,
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
    throttle
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

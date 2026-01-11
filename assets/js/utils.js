/**
 * ==============================================
 * MEKONG AGENCY - UTILITIES
 * Shared utility functions
 * ==============================================
 */

// ===== ID GENERATION =====
function generateId(prefix = 'id') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ===== CURRENCY FORMATTING =====
function formatCurrency(amount, currency = 'VND') {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

function formatCurrencyCompact(amount, currency = 'VND') {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: currency,
        notation: 'compact'
    }).format(amount);
}

// ===== DATE FORMATTING =====
function formatDate(date, style = 'medium') {
    const d = new Date(date);
    if (style === 'short') {
        return d.toLocaleDateString('vi-VN');
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

function formatDateTime(date) {
    const d = new Date(date);
    return d.toLocaleString('vi-VN');
}

function formatRelativeTime(date) {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} ngày trước`;
    if (hours > 0) return `${hours} giờ trước`;
    if (minutes > 0) return `${minutes} phút trước`;
    return 'vừa xong';
}

// ===== NUMBER FORMATTING =====
function formatNumber(num) {
    return new Intl.NumberFormat('vi-VN').format(num);
}

function formatPercent(value, decimals = 0) {
    return `${value.toFixed(decimals)}%`;
}

// ===== STRING UTILITIES =====
function truncate(str, length = 50) {
    if (str.length <= length) return str;
    return str.slice(0, length) + '...';
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function slugify(str) {
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

// ===== ARRAY UTILITIES =====
function groupBy(array, key) {
    return array.reduce((groups, item) => {
        const group = item[key];
        if (!groups[group]) groups[group] = [];
        groups[group].push(item);
        return groups;
    }, {});
}

function sortBy(array, key, order = 'asc') {
    return [...array].sort((a, b) => {
        if (order === 'desc') return b[key] > a[key] ? 1 : -1;
        return a[key] > b[key] ? 1 : -1;
    });
}

function sum(array, key) {
    return array.reduce((total, item) => total + (item[key] || 0), 0);
}

function average(array, key) {
    if (array.length === 0) return 0;
    return sum(array, key) / array.length;
}

// ===== DEBOUNCE/THROTTLE =====
function debounce(fn, delay = 300) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), delay);
    };
}

function throttle(fn, limit = 300) {
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
    slugify,
    groupBy,
    sortBy,
    sum,
    average,
    debounce,
    throttle
};

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

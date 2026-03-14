/**
 * ==============================================
 * MEKONG AGENCY - SHARED FORMAT UTILITIES
 * Common formatting functions shared across modules
 * ==============================================
 */

// ===== CURRENCY FORMATTING =====
export function formatCurrency(amount, currency = 'VND') {
    if (amount === null || amount === undefined) return '--';
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

export function formatCurrencyVN(amount) {
    if (amount === null || amount === undefined) return '--';
    if (amount >= 1000000000) {
        return (amount / 1000000000).toFixed(1) + 'B VNĐ';
    } else if (amount >= 1000000) {
        return (amount / 1000000).toFixed(0) + 'M VNĐ';
    }
    return amount.toLocaleString('vi-VN') + ' VNĐ';
}

// ===== NUMBER FORMATTING =====
export function formatNumber(num) {
    if (num === null || num === undefined) return '--';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return new Intl.NumberFormat('vi-VN').format(num);
}

// ===== DATE FORMATTING =====
export function formatDate(date, style = 'medium', options = {}) {
    if (!date) return '--';
    const d = new Date(date);

    // Default options based on style
    const defaultOptions = {
        short: { day: '2-digit', month: '2-digit' },
        'short-yearless': { day: '2-digit', month: '2-digit' },
        medium: { year: 'numeric', month: 'short', day: 'numeric' },
        long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    };

    // Admin default: include hour and minute
    if (options.admin === true) {
        return d.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            ...options
        });
    }

    return d.toLocaleDateString('vi-VN', { ...defaultOptions[style], ...options });
}

export function formatDateTime(date) {
    const d = new Date(date);
    return d.toLocaleString('vi-VN');
}

export function formatRelativeTime(dateString) {
    if (!dateString) return '';

    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);

    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            const labels = {
                year: interval === 1 ? 'năm' : 'năm',
                month: interval === 1 ? 'tháng' : 'tháng',
                week: interval === 1 ? 'tuần' : 'tuần',
                day: interval === 1 ? 'ngày' : 'ngày',
                hour: interval === 1 ? 'giờ' : 'giờ',
                minute: interval === 1 ? 'phút' : 'phút'
            };
            return `${interval} ${labels[unit]} trước`;
        }
    }

    return 'Vừa xong';
}

// ===== STRING UTILITIES =====
export function truncate(str, length = 50) {
    if (!str) return '';
    if (str.length <= length) return str;
    return str.slice(0, length) + '...';
}

// ===== PERFORMANCE UTILITIES =====
// Re-export from consolidated function utilities
export { debounce, throttle } from '../../assets/js/utils/function.js';

// ===== EXPORTS =====
export default {
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
};

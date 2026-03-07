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
export function formatDate(date, style = 'medium') {
    if (!date) return '--';
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
    const rtf = new Intl.RelativeTimeFormat('vi-VN', { numeric: 'auto' });

    if (Math.abs(diffInSeconds) < 60) return rtf.format(Math.round(diffInSeconds), 'second');
    if (Math.abs(diffInSeconds) < 3600) return rtf.format(Math.round(diffInSeconds / 60), 'minute');
    if (Math.abs(diffInSeconds) < 86400) return rtf.format(Math.round(diffInSeconds / 3600), 'hour');
    if (Math.abs(diffInSeconds) < 2592000) return rtf.format(Math.round(diffInSeconds / 86400), 'day');
    if (Math.abs(diffInSeconds) < 31536000) return rtf.format(Math.round(diffInSeconds / 2592000), 'month');
    return rtf.format(Math.round(diffInSeconds / 31536000), 'year');
}

// ===== STRING UTILITIES =====
export function truncate(str, length = 50) {
    if (!str) return '';
    if (str.length <= length) return str;
    return str.slice(0, length) + '...';
}

// ===== PERFORMANCE UTILITIES =====
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

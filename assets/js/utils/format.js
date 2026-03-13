/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FORMAT UTILITIES
 * 
 * Currency, number, and date formatting functions
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Format currency (Vietnamese Dong)
 * @param {number} amount - Amount in VND
 * @returns {string} Formatted currency (e.g., "1.000.000 ₫")
 */
export function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

/**
 * Format currency compact (K/M/B)
 * @param {number} amount - Amount in VND
 * @returns {string} Compact format (e.g., "1.2M ₫")
 */
export function formatCurrencyCompact(amount) {
    const abbreviations = [
        { value: 1e9, symbol: 'B' },
        { value: 1e6, symbol: 'M' },
        { value: 1e3, symbol: 'K' }
    ];
    
    for (const { value, symbol } of abbreviations) {
        if (amount >= value) {
            return `${(amount / value).toFixed(1)}${symbol} ₫`;
        }
    }
    
    return `${amount.toLocaleString('vi-VN')} ₫`;
}

/**
 * Format currency with VN suffix
 * @param {number} amount - Amount in VND
 * @returns {string} Format (e.g., "1.000.000 VNĐ")
 */
export function formatCurrencyVN(amount) {
    return `${amount.toLocaleString('vi-VN')} VNĐ`;
}

/**
 * Format number with locale
 * @param {number} num - Number to format
 * @param {number} decimals - Decimal places
 * @returns {string} Formatted number
 */
export function formatNumber(num, decimals = 0) {
    return new Intl.NumberFormat('vi-VN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(num);
}

/**
 * Format date
 * @param {Date|string} date - Date to format
 * @param {string} format - Format string (default: 'dd/mm/yyyy')
 * @returns {string} Formatted date
 */
export function formatDate(date, format = 'dd/mm/yyyy') {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    
    if (format === 'dd/mm/yyyy') {
        return `${day}/${month}/${year}`;
    }
    if (format === 'mm/dd/yyyy') {
        return `${month}/${day}/${year}`;
    }
    if (format === 'yyyy-mm-dd') {
        return `${year}-${month}-${day}`;
    }
    
    return d.toLocaleDateString('vi-VN');
}

/**
 * Format date with time
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date with time
 */
export function formatDateTime(date) {
    const d = new Date(date);
    return `${formatDate(d)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/**
 * Format relative time (e.g., "2 giờ trước")
 * @param {Date|string} date - Date to compare
 * @returns {string} Relative time string
 */
export function formatRelativeTime(date) {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    
    return formatDate(date);
}

/**
 * Truncate string to max length
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} Truncated string
 */
export function truncate(str, maxLength, suffix = '...') {
    if (!str) return '';
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength) + suffix;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LOGGER UTILITY — Sa Đéc Marketing Hub
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Centralized logging with environment-aware output
 *
 * Usage:
 *   Logger.error('API Error', { endpoint, error });
 *   Logger.warn('Deprecated API usage');
 *   Logger.info('User logged in');
 *   Logger.debug('Debug info', data); // Only in development
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

const Logger = {
    /**
     * Check if running in development mode
     * @private
     */
    _isDev: typeof process !== 'undefined' && process.env?.NODE_ENV === 'development',

    /**
     * Log error message
     * @param {string} message - Error message
     * @param {Object} [data] - Additional data
     */
    error(message, data) {
        // Silent error logging for production - use external logging service
    },

    /**
     * Log warning message
     * @param {string} message - Warning message
     * @param {Object} [data] - Additional data
     */
    warn(message, data) {
        // Silent warning logging for production - use external logging service
    },

    /**
     * Log info message
     * @param {string} message - Info message
     * @param {Object} [data] - Additional data
     */
    info(message, data) {
        console.info(`[Info] ${message}`, data || '');
    },

    /**
     * Log debug message (development only)
     * @param {string} message - Debug message
     * @param {Object} [data] - Additional data
     */
    debug(message, data) {
        // Debug logging disabled in production
    },

    /**
     * Log table data (development only)
     * @param {Array|Object} data - Data to display
     * @param {Array} [columns] - Column filter
     */
    table(data, columns) {
        if (this._isDev) {
            console.table(data, columns);
        }
    },

    /**
     * Log group start (development only)
     * @param {string} label - Group label
     */
    group(label) {
        if (this._isDev && console.group) {
            console.group(`[Group] ${label}`);
        }
    },

    /**
     * Log group end (development only)
     */
    groupEnd() {
        if (this._isDev && console.groupEnd) {
            console.groupEnd();
        }
    },

    /**
     * Handle error with optional toast notification
     * @param {Error} error - Error object
     * @param {Object} [options] - Options
     * @param {boolean} [options.showToast=true] - Show toast notification
     * @param {boolean} [options.logToConsole=true] - Log to console
     * @param {string} [options.userMessage] - User-friendly message
     */
    handleError(error, options = {}) {
        const { showToast = true, logToConsole = true, userMessage = 'Có lỗi xảy ra' } = options;

        if (logToConsole) {
            this.error(error.message, error);
        }

        if (showToast && typeof window !== 'undefined') {
            if (window.Toast?.error) {
                window.Toast.error(userMessage);
            } else if (window.Alert?.error) {
                window.Alert.error('Lỗi', userMessage);
            }
        }
    }
};

// Export for ES modules
export default Logger;
export { Logger };

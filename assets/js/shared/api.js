/**
 * ═══════════════════════════════════════════════════════════════════════════
 * API UTILITIES - CONSOLIDATED
 *
 * Unified API client and utilities for Sa Đéc Marketing Hub
 * Combined from: utils/api.js, shared/api-client.js, shared/api-utils.js
 *
 * Usage:
 *   import { apiFetch, apiGet, apiPost, handleApiError } from './shared/api.js';
 *   import { ApiClientBase, onReady, renderTable, renderActivities } from './shared/api.js';
 *
 * @version 2.0.0 | 2026-03-14
 * @module shared/api
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Logger } from './logger.js';

// ============================================================================
// HTTP FETCH HELPERS
// ============================================================================

// Supabase URL from environment (global)
const API_BASE_URL = typeof SUPABASE_URL !== 'undefined'
    ? SUPABASE_URL
    : 'https://pzcgvfhppglzfjavxuid.supabase.co';

/**
 * API Fetch wrapper with consistent error handling
 * @param {string} endpoint - API endpoint (relative to base URL)
 * @param {Object} options - Fetch options
 * @returns {Promise<unknown>} Response data
 */
export async function apiFetch(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        }
    };

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'API error' }));
            throw new Error(error.message || `HTTP ${response.status}`);
        }

        // Handle no-content responses
        if (response.status === 204) {
            return null;
        }

        return await response.json();

    } catch (error) {
        Logger.error('[API Error]', { endpoint, error: error.message });
        throw error;
    }
}

/**
 * Handle API error with notification
 * @param {Error} error - Error object
 * @param {Object} options - Options { showNotification, message }
 * @returns {null} Always returns null
 */
export function handleApiError(error, options = {}) {
    const { showNotification = true, message = 'Có lỗi xảy ra' } = options;

    Logger.error('[API Error]', error.message);

    if (showNotification && typeof window !== 'undefined') {
        if (window.Toast?.error) {
            window.Toast.error(message);
        } else if (window.Alert?.error) {
            window.Alert.error('Lỗi', message);
        }
    }

    return null;
}

/**
 * API GET request
 * @param {string} endpoint - API endpoint
 * @param {Object} headers - Custom headers
 */
export function apiGet(endpoint, headers = {}) {
    return apiFetch(endpoint, { method: 'GET', headers });
}

/**
 * API POST request
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request body
 * @param {Object} headers - Custom headers
 */
export function apiPost(endpoint, data = {}, headers = {}) {
    return apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
        headers
    });
}

/**
 * API PUT request
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request body
 */
export function apiPut(endpoint, data = {}) {
    return apiFetch(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

/**
 * API DELETE request
 * @param {string} endpoint - API endpoint
 */
export function apiDelete(endpoint) {
    return apiFetch(endpoint, { method: 'DELETE' });
}

// ============================================================================
// CORE API CLIENT CLASS
// ============================================================================

/**
 * Unified API Client Base Class
 * Provides common data loading, error handling, and rendering patterns
 */
export class ApiClientBase {
    /**
     * @param {Object} options - Client options
     * @param {string} options.moduleName - Module name for logging
     * @param {Object} options.supabase - Supabase client modules
     * @param {Function} [options.demoDataFn] - Demo data fallback function
     */
    constructor({ moduleName, supabase, demoDataFn = null }) {
        this.moduleName = moduleName;
        this.supabase = supabase;
        this.demoDataFn = demoDataFn;
        this.cache = new Map();
        this.cacheExpiry = 60000; // 1 minute default cache
    }

    /**
     * Load data with error handling and caching
     * @param {string} cacheKey - Cache key for this data
     * @param {Function} fetchFn - Async fetch function
     * @returns {Promise<unknown>} Loaded data
     */
    async load(cacheKey, fetchFn) {
        // Check cache first
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.data;
        }

        try {
            const data = await fetchFn();
            this.cache.set(cacheKey, { data, timestamp: Date.now() });
            return data;
        } catch (error) {
            if (this.demoDataFn) {
                return this.demoDataFn();
            }
            throw error;
        }
    }

    /**
     * Invalidate cache for a specific key
     * @param {string} cacheKey - Cache key to invalidate
     */
    invalidate(cacheKey) {
        this.cache.delete(cacheKey);
    }

    /**
     * Clear all cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Safe DOM element getter
     * @param {string} id - Element ID
     * @returns {Element|null}
     */
    $(id) {
        return document.getElementById(id);
    }

    /**
     * Safe text content setter
     * @param {string} id - Element ID
     * @param {string|number} text - Text content
     */
    setText(id, text) {
        const el = this.$(id);
        if (el) {
            el.textContent = String(text);
        }
    }

    /**
     * Safe innerHTML setter
     * @param {string} id - Element ID
     * @param {string} html - HTML content
     */
    setHtml(id, html) {
        const el = this.$(id);
        if (el) {
            el.innerHTML = html;
        }
    }

    /**
     * Bind data to multiple elements
     * @param {Object} bindings - { elementId: value } pairs
     */
    bind(bindings) {
        Object.entries(bindings).forEach(([id, value]) => {
            this.setText(id, value);
        });
    }
}

// ============================================================================
// DOM READY INITIALIZER
// ============================================================================

/**
 * Initialize module on DOM ready
 * @param {Function} initFn - Initialization function
 */
export function onReady(initFn) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFn);
    } else {
        initFn();
    }
}

// ============================================================================
// RENDERER HELPERS
// ============================================================================

/**
 * Render table rows from data
 * @param {Array} items - Data items
 * @param {Function} rowFn - Function to generate row HTML
 * @param {string} containerId - Target container ID
 */
export function renderTable(items, rowFn, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!items || items.length === 0) {
        container.innerHTML = '<tr><td colspan="5" class="text-muted">No data</td></tr>';
        return;
    }

    container.innerHTML = items.map(rowFn).join('');
}

/**
 * Render list items from data
 * @param {Array} items - Data items
 * @param {Function} itemFn - Function to generate item HTML
 * @param {string} containerId - Target container ID
 */
export function renderList(items, itemFn, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!items || items.length === 0) {
        container.innerHTML = '<div class="text-muted">No items</div>';
        return;
    }

    container.innerHTML = items.map(itemFn).join('');
}

/**
 * Create color-coded status badge
 * @param {string} status - Status value
 * @param {Object} colorMap - { status: { bg, color } } mapping
 * @returns {string} HTML badge
 */
export function statusBadge(status, colorMap) {
    const colors = colorMap[status] || { bg: '#eee', color: '#333' };
    const label = status?.toUpperCase() || 'N/A';
    return `<span style="padding: 4px 12px; border-radius: 999px; font-size: 12px; background: ${colors.bg}; color: ${colors.color}">${label}</span>`;
}

/**
 * Safe number formatter
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export function formatNumberSafe(num) {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString('vi-VN');
}

// ============================================================================
// ACTIVITY RENDERER
// ============================================================================

/**
 * Activity type color mapping
 */
export const ACTIVITY_TYPE_COLORS = {
    lead: { color: 'var(--primary-cyan)', label: 'Lead' },
    deal: { color: 'var(--accent-lime)', label: 'Deal' },
    invoice: { color: 'var(--secondary-purple)', label: 'Invoice' },
    campaign: { color: '#FF0055', label: 'Campaign' },
    project: { color: '#FFAA00', label: 'Project' }
};

/**
 * Render activity feed
 * @param {Array} activities - Activity objects
 * @param {string} containerId - Target container ID
 */
export function renderActivities(activities, containerId = 'live-activity-list') {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!activities || activities.length === 0) {
        container.innerHTML = '<div class="text-muted" style="padding:10px;">No recent activities</div>';
        return;
    }

    container.innerHTML = activities.map(act => {
        const typeInfo = ACTIVITY_TYPE_COLORS[act.entity_type] || { color: '#ccc', label: 'Activity' };
        return `
      <div class="live-activity-item">
        <div style="width: 8px; height: 8px; background: ${typeInfo.color}; border-radius: 50%; box-shadow: 0 0 10px ${typeInfo.color};"></div>
        <div>
          <div class="title-small" style="font-weight: 600;">${act.action || typeInfo.label}</div>
          <div class="body-small text-muted">${act.description || ''} • ${new Date(act.created_at).toLocaleTimeString('vi-VN')}</div>
        </div>
      </div>
    `;
    }).join('');
}

// ============================================================================
// CHART INITIALIZER
// ============================================================================

/**
 * Safe chart initialization with fallback
 * @param {string} chartId - Chart container ID
 * @param {string} chartType - Chart type (revenue, pipeline, etc.)
 * @param {Object} data - Chart data
 */
export function renderChart(chartId, chartType, data) {
    if (!window.MekongAdmin || !MekongAdmin.DashboardCharts) {
        return;
    }

    const chartFn = MekongAdmin.DashboardCharts[`${chartType}Chart`];
    if (typeof chartFn === 'function') {
        chartFn(chartId, data);
    }
}

// ============================================================================
// RE-EXPORTS
// ============================================================================

// Re-export format utilities for convenience
export { formatCurrencyVN, formatCurrency, formatCurrencyShort } from './format-utils.js';

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
    // Fetch helpers
    apiFetch,
    apiGet,
    apiPost,
    apiPut,
    apiDelete,
    handleApiError,
    // Classes
    ApiClientBase,
    // DOM helpers
    onReady,
    $: ApiClientBase.prototype.$,
    setText: ApiClientBase.prototype.setText,
    setHtml: ApiClientBase.prototype.setHtml,
    // Renderers
    renderTable,
    renderList,
    renderActivities,
    renderChart,
    statusBadge,
    formatNumberSafe,
    ACTIVITY_TYPE_COLORS
};

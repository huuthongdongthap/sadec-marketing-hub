/**
 * ═══════════════════════════════════════════════════════════════════════════
 * API UTILITIES
 * 
 * Safe API fetch wrapper with error handling
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Logger } from '../shared/logger.js';

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
        // Try to use Toast if available
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

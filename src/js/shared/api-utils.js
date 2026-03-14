/**
 * Sa Đéc Marketing Hub - Shared API Utilities
 *
 * Centralized API helper functions for consistent HTTP requests across the codebase.
 * Uses Supabase client for authentication and handles common patterns.
 *
 * @module shared/api-utils
 */

import { supabase } from '../../../supabase-config.js';

// ============================================================================
// HTTP HELPERS
// ============================================================================

/**
 * Get current auth token from Supabase session
 * @returns {Promise<string|null>} Access token or null
 */
async function getAuthToken() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        return session?.access_token || null;
    } catch (error) {
        return null;
    }
}

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>} True if authenticated
 */
export async function isAuthenticated() {
    const token = await getAuthToken();
    return token !== null;
}

/**
 * Handle API response with standard error handling
 * @param {Response} response - Fetch response
 * @returns {Promise<unknown>} Parsed response data
 * @throws {Error} If response is not ok
 */
async function handleResponse(response) {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
        return null;
    }

    return response.json();
}

// ============================================================================
// FETCH HELPERS
// ============================================================================

/**
 * Fetch with automatic auth headers and error handling
 * @param {string} url - The URL to fetch
 * @param {Object} [options={}] - Fetch options
 * @returns {Promise<unknown>} Parsed response data
 */
export async function fetchWithAuth(url, options = {}) {
    const token = await getAuthToken();

    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...(options.headers || {})
    };

    const response = await fetch(url, {
        ...options,
        headers
    });

    return handleResponse(response);
}

/**
 * GET request with auth
 * @param {string} url - The URL to fetch
 * @param {Object} [params={}] - Query parameters
 * @returns {Promise<unknown>} Parsed response data
 */
export async function getJSON(url, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;

    return fetchWithAuth(fullUrl, { method: 'GET' });
}

/**
 * POST request with auth
 * @param {string} url - The URL to fetch
 * @param {Object} [data={}] - Request body data
 * @returns {Promise<unknown>} Parsed response data
 */
export async function postJSON(url, data = {}) {
    return fetchWithAuth(url, {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

/**
 * PUT request with auth
 * @param {string} url - The URL to fetch
 * @param {Object} [data={}] - Request body data
 * @returns {Promise<unknown>} Parsed response data
 */
export async function putJSON(url, data = {}) {
    return fetchWithAuth(url, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

/**
 * PATCH request with auth
 * @param {string} url - The URL to fetch
 * @param {Object} [data={}] - Request body data
 * @returns {Promise<unknown>} Parsed response data
 */
export async function patchJSON(url, data = {}) {
    return fetchWithAuth(url, {
        method: 'PATCH',
        body: JSON.stringify(data)
    });
}

/**
 * DELETE request with auth
 * @param {string} url - The URL to fetch
 * @returns {Promise<unknown>} Parsed response data
 */
export async function deleteJSON(url) {
    return fetchWithAuth(url, { method: 'DELETE' });
}

// ============================================================================
// SUPABASE HELPERS
// ============================================================================

/**
 * Query data from Supabase with error handling
 * @param {string} table - Table name
 * @param {Object} [options={}] - Query options
 * @returns {Promise<{data: unknown, error: Error|null}>} Query result
 */
export async function queryTable(table, options = {}) {
    try {
        let query = supabase.from(table).select(options.select || '*');

        if (options.eq) {
            Object.entries(options.eq).forEach(([key, value]) => {
                query = query.eq(key, value);
            });
        }

        if (options.order) {
            query = query.order(options.order.column, {
                ascending: options.order.ascending ?? true
            });
        }

        if (options.limit) {
            query = query.limit(options.limit);
        }

        const { data, error } = await query;

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        return { data: null, error };
    }
}

/**
 * Insert data into Supabase table
 * @param {string} table - Table name
 * @param {Object} data - Data to insert
 * @returns {Promise<{data: unknown, error: Error|null}>} Insert result
 */
export async function insertIntoTable(table, data) {
    try {
        const { data: result, error } = await supabase
            .from(table)
            .insert(data)
            .select();

        if (error) throw error;
        return { data: result, error: null };
    } catch (error) {
        return { data: null, error };
    }
}

/**
 * Update data in Supabase table
 * @param {string} table - Table name
 * @param {Object} data - Data to update
 * @param {Object} condition - Where condition { column: value }
 * @returns {Promise<{data: unknown, error: Error|null}>} Update result
 */
export async function updateInTable(table, data, condition) {
    try {
        let query = supabase.from(table).update(data);

        Object.entries(condition).forEach(([key, value]) => {
            query = query.eq(key, value);
        });

        const { data: result, error } = await query.select();

        if (error) throw error;
        return { data: result, error: null };
    } catch (error) {
        return { data: null, error };
    }
}

/**
 * Delete data from Supabase table
 * @param {string} table - Table name
 * @param {Object} condition - Where condition { column: value }
 * @returns {Promise<{data: unknown, error: Error|null}>} Delete result
 */
export async function deleteFromTable(table, condition) {
    try {
        let query = supabase.from(table).delete();

        Object.entries(condition).forEach(([key, value]) => {
            query = query.eq(key, value);
        });

        const { data: result, error } = await query;

        if (error) throw error;
        return { data: result, error: null };
    } catch (error) {
        return { data: null, error };
    }
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Standard API error handler
 * @param {Error} error - The error object
 * @param {string} [context=''] - Context message
 * @returns {Object} Formatted error object
 */
export function handleApiError(error, context = '') {

    return {
        success: false,
        error: {
            message: error.message || 'An unexpected error occurred',
            code: error.code || 'UNKNOWN_ERROR',
            context
        }
    };
}

/**
 * Create a retry wrapper for API calls
 * @param {Function} fn - Async function to retry
 * @param {number} [maxRetries=3] - Maximum retry attempts
 * @param {number} [delayMs=1000] - Delay between retries
 * @returns {Promise<any>} Result from successful call
 */
export async function withRetry(fn, maxRetries = 3, delayMs = 1000) {
    let lastError;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            // Don't retry on certain errors
            if (error.status === 400 || error.status === 401 || error.status === 403) {
                throw error;
            }

            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, delayMs * (i + 1)));
            }
        }
    }

    throw lastError;
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export default {
    getAuthToken,
    isAuthenticated,
    fetchWithAuth,
    getJSON,
    postJSON,
    putJSON,
    patchJSON,
    deleteJSON,
    queryTable,
    insertIntoTable,
    updateInTable,
    deleteFromTable,
    handleApiError,
    withRetry
};

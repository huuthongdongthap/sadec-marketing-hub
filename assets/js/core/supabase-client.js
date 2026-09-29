/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SUPABASE CLIENT — Sa Đéc Marketing Hub
 * Unified Supabase Client Module
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Usage:
 *   // Method 1: Direct imports (recommended)
 *   import { auth } from './auth-service.js';
 *   import { leads, clients, projects } from './database-service.js';
 *   import { assets, realtime } from './storage-service.js';
 *
 *   // Method 2: Unified export (backward compatible)
 *   import { auth, db, storage, realtime } from './supabase-client.js';
 *
 *   // Auth
 *   const { data, error } = await auth.signIn(email, password);
 *
 *   // Database
 *   const { data } = await db.from('users').select('*');
 */

import { Logger } from '../shared/logger.js';

// Re-export from modular services (recommended approach)
export { auth, authGuards, AuthManager } from './auth-service.js';
export {
    leads,
    clients,
    projects,
    campaigns,
    invoices,
    deals,
    content,
    budget,
    activities,
    strategic,
    seo,
    workflows,
    agents,
    analytics,
    approvals
} from './database-service.js';
export { assets, realtime, automation, fileUtils } from './storage-service.js';

// Legacy self-import removed - this file IS supabase-client.js

const TAG = '[SupabaseClient]';

// Singleton instance
let clientInstance = null;

/**
 * Get or create Supabase client instance
 * @returns {Object} Supabase client
 * @throws {Error} If configuration is missing
 */
export function getSupabaseClient() {
    if (!clientInstance) {
        const url = window.__ENV__?.SUPABASE_URL;
        const key = window.__ENV__?.SUPABASE_ANON_KEY;

        if (!url || !key) {
            Logger.error(TAG, 'Missing Supabase configuration');
            throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY are required');
        }

        // Use global supabase if available (CDN)
        if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
            clientInstance = window.supabase.createClient(url, key);
        } else {
            Logger.error(TAG, 'Supabase CDN not loaded');
            throw new Error('Supabase client library not loaded');
        }
    }
    return clientInstance;
}

/**
 * Auth helpers
 */
export const auth = {
    async signIn(email, password) {
        const client = getSupabaseClient();
        return client.auth.signInWithPassword({ email, password });
    },

    async signUp(email, password, metadata = {}) {
        const client = getSupabaseClient();
        return client.auth.signUp({
            email,
            password,
            options: { data: metadata }
        });
    },

    async signOut() {
        const client = getSupabaseClient();
        return client.auth.signOut();
    },

    async getSession() {
        const client = getSupabaseClient();
        return client.auth.getSession();
    },

    onAuthStateChange(callback) {
        const client = getSupabaseClient();
        return client.auth.onAuthStateChange(callback);
    }
};

/**
 * Database helpers with type safety
 */
export const db = {
    from(table) {
        const client = getSupabaseClient();
        return client.from(table);
    },

    async select(table, columns = '*', options = {}) {
        const query = this.from(table).select(columns);
        if (options.eq) {
            query.eq(options.eq.field, options.eq.value);
        }
        if (options.order) {
            query.order(options.order.field, { ascending: options.order.ascending ?? true });
        }
        return query;
    },

    async insert(table, data) {
        return this.from(table).insert(data);
    },

    async update(table, data, options) {
        const query = this.from(table).update(data);
        if (options?.eq) {
            query.eq(options.eq.field, options.eq.value);
        }
        return query;
    },

    async delete(table, options) {
        const query = this.from(table).delete();
        if (options?.eq) {
            query.eq(options.eq.field, options.eq.value);
        }
        return query;
    }
};

/**
 * Storage helpers
 */
export const storage = {
    async upload(bucket, path, file) {
        const client = getSupabaseClient();
        return client.storage.from(bucket).upload(path, file);
    },

    async download(bucket, path) {
        const client = getSupabaseClient();
        return client.storage.from(bucket).download(path);
    },

    async remove(bucket, paths) {
        const client = getSupabaseClient();
        return client.storage.from(bucket).remove(paths);
    },

    getPublicUrl(bucket, path) {
        const client = getSupabaseClient();
        return client.storage.from(bucket).getPublicUrl(path);
    }
};

/**
 * Real-time subscription helpers
 */
export const realtime = {
    channels: new Map(),

    subscribe(channelName, callback) {
        const client = getSupabaseClient();
        const channel = client.channel(channelName);

        channel.subscribe(callback);
        this.channels.set(channelName, channel);

        return () => {
            channel.unsubscribe();
            this.channels.delete(channelName);
        };
    },

    unsubscribe(channelName) {
        const channel = this.channels.get(channelName);
        if (channel) {
            channel.unsubscribe();
            this.channels.delete(channelName);
        }
    },

    unsubscribeAll() {
        this.channels.forEach(channel => channel.unsubscribe());
        this.channels.clear();
    }
};

// Auto-init on DOM ready (optional, for backward compatibility)
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        try {
            getSupabaseClient();
            Logger.info(TAG, 'Supabase client initialized');
        } catch (e) {
            // Silently fail - will initialize on first use
        }
    });
}

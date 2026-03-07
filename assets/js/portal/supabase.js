/**
 * Supabase Client Module
 * Singleton Supabase Client Instance
 */

// ================================================
// CONFIGURATION
// ================================================

const SUPABASE_URL = window.__ENV__?.SUPABASE_URL || 'https://pzcgvfhppglzfjavxuid.supabase.co';
const SUPABASE_ANON_KEY = window.__ENV__?.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6Y2d2ZmhwcGdsemZqYXZ4dWlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3MzE3ODYsImV4cCI6MjA4MjMwNzc4Nn0.xE_iEkIYaY0ql0Br_B64o1JKLuiAeAPg8GydLm71DLs';

// ================================================
// SINGLETON CLIENT
// ================================================

let supabaseClient = null;

/**
 * Initialize Supabase client
 */
export function initSupabase() {
    if (supabaseClient) return supabaseClient;

    if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }

    return supabaseClient;
}

/**
 * Get Supabase client instance (auto-init if needed)
 */
export function getClient() {
    if (!supabaseClient) {
        return initSupabase();
    }
    return supabaseClient;
}

// Auto-init when DOM is ready
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        initSupabase();
    });
}

// Export singleton
export const supabase = getClient();

// ================================================
// RE-EXPORTS FROM SUPABASE-CONFIG.JS
// ================================================
// If supabase-config.js is loaded, use its instances

if (typeof window.SupabaseAPI !== 'undefined') {
    // Use the global SupabaseAPI if available
    export const AuthAPI = window.AuthAPI;
    export const AdminAPI = window.AdminAPI;
    export const KPIAPI = window.KPIAPI;
    export const BinhPhapAPI = window.BinhPhapAPI;
}

// ================================================
// AUTH HELPERS (compatibility layer)
// ================================================

export const auth = {
    async getSession() {
        if (!supabaseClient) return null;
        try {
            const { data: { session } } = await supabaseClient.auth.getSession();
            return session;
        } catch (error) {
            console.error('Get session error:', error);
            return null;
        }
    },

    async getUser() {
        if (!supabaseClient) return null;
        try {
            const { data: { user } } = await supabaseClient.auth.getUser();
            return user;
        } catch (error) {
            console.error('Get user error:', error);
            return null;
        }
    },

    async signIn(email, password) {
        if (!supabaseClient) return { error: 'Not initialized' };
        return await supabaseClient.auth.signInWithPassword({ email, password });
    },

    async signOut() {
        if (!supabaseClient) return { error: 'Not initialized' };
        return await supabaseClient.auth.signOut();
    }
};

// ================================================
// DATA HELPERS (compatibility layer)
// ================================================

export const projects = {
    async getAll(filters = {}) {
        if (!supabaseClient) return [];
        let query = supabaseClient.from('projects').select('*');

        if (filters.status) query = query.eq('status', filters.status);
        if (filters.type) query = query.eq('type', filters.type);
        if (filters.limit) query = query.limit(filters.limit);

        const { data } = await query.order('created_at', { ascending: false });
        return data || [];
    },

    async getById(id) {
        if (!supabaseClient) return null;
        const { data } = await supabaseClient.from('projects').select('*').eq('id', id).single();
        return data;
    }
};

export const invoices = {
    async getAll(filters = {}) {
        if (!supabaseClient) return [];
        let query = supabaseClient.from('invoices').select('*');

        if (filters.status) query = query.in('status', filters.status);
        if (filters.client_id) query = query.eq('client_id', filters.client_id);

        const { data } = await query.order('created_at', { ascending: false });
        return data || [];
    },

    async getById(id) {
        if (!supabaseClient) return null;
        const { data } = await supabaseClient.from('invoices').select('*').eq('id', id).single();
        return data;
    }
};

export const activities = {
    async getRecent(limit = 10) {
        if (!supabaseClient) return [];
        const { data } = await supabaseClient
            .from('activity_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);
        return data || [];
    }
};

export const utils = {
    formatCurrency: (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount),
    timeAgo: (isoString) => {
        const seconds = Math.floor((new Date() - new Date(isoString)) / 1000);
        const intervals = { year: 31536000, month: 2592000, week: 604800, day: 86400, hour: 3600, minute: 60 };
        for (const [unit, secondsInUnit] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / secondsInUnit);
            if (interval >= 1) return `${interval} ${unit} trước`;
        }
        return 'Vừa xong';
    }
};

// ================================================
// MEKONG AGENCY - SUPABASE CLIENT
// Marketing Agency Web App
// ================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Supabase Configuration
const SUPABASE_URL = 'https://pzcgvfhppglzfjavxuid.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6Y2d2ZmhwcGdsemZqYXZ4dWlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3MzE3ODYsImV4cCI6MjA4MjMwNzc4Nn0.xE_iEkIYaY0ql0Br_B64o1JKLuiAeAPg8GydLm71DLs';

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ================================================
// AUTH FUNCTIONS
// ================================================

export const auth = {
    // Sign up with email
    async signUp(email, password, metadata = {}) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: metadata }
        });
        return { data, error };
    },

    // Sign in with email
    async signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        return { data, error };
    },

    // Sign in with OAuth (Google/Facebook)
    async signInWithOAuth(provider) {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/portal/dashboard.html`
            }
        });
        return { data, error };
    },

    // Sign out
    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (!error) window.location.href = '/portal/login.html';
        return { error };
    },

    // Get current user
    async getUser() {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },

    // Get session
    async getSession() {
        const { data: { session } } = await supabase.auth.getSession();
        return session;
    },

    // Check if user is authenticated
    async isAuthenticated() {
        const session = await this.getSession();
        return !!session;
    }
};

// ================================================
// LEADS API
// ================================================

export const leads = {
    async getAll(filters = {}) {
        let query = supabase.from('leads').select('*');

        if (filters.status) query = query.eq('status', filters.status);
        if (filters.source) query = query.eq('source', filters.source);
        if (filters.temperature) query = query.eq('temperature', filters.temperature);

        const { data, error } = await query.order('created_at', { ascending: false });
        return { data, error };
    },

    async getById(id) {
        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .eq('id', id)
            .single();
        return { data, error };
    },

    async create(lead) {
        const { data, error } = await supabase
            .from('leads')
            .insert(lead)
            .select()
            .single();
        return { data, error };
    },

    async update(id, updates) {
        const { data, error } = await supabase
            .from('leads')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        return { data, error };
    },

    async delete(id) {
        const { error } = await supabase
            .from('leads')
            .delete()
            .eq('id', id);
        return { error };
    },

    async getStats() {
        const { data, error } = await supabase
            .from('leads')
            .select('status, temperature');

        if (error) return { data: null, error };

        const stats = {
            total: data.length,
            new: data.filter(l => l.status === 'new').length,
            contacted: data.filter(l => l.status === 'contacted').length,
            qualified: data.filter(l => l.status === 'qualified').length,
            won: data.filter(l => l.status === 'won').length,
            hot: data.filter(l => l.temperature === 'hot').length,
            warm: data.filter(l => l.temperature === 'warm').length,
            cold: data.filter(l => l.temperature === 'cold').length
        };

        return { data: stats, error: null };
    }
};

// ================================================
// CLIENTS API
// ================================================

export const clients = {
    async getAll() {
        const { data, error } = await supabase
            .from('clients')
            .select('*, user:users(*)')
            .order('created_at', { ascending: false });
        return { data, error };
    },

    async getById(id) {
        const { data, error } = await supabase
            .from('clients')
            .select('*, user:users(*), projects(*)')
            .eq('id', id)
            .single();
        return { data, error };
    },

    async create(client) {
        const { data, error } = await supabase
            .from('clients')
            .insert(client)
            .select()
            .single();
        return { data, error };
    },

    async update(id, updates) {
        const { data, error } = await supabase
            .from('clients')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        return { data, error };
    }
};

// ================================================
// PROJECTS API
// ================================================

export const projects = {
    async getAll(clientId = null) {
        let query = supabase
            .from('projects')
            .select('*, client:clients(*)');

        if (clientId) query = query.eq('client_id', clientId);

        const { data, error } = await query.order('created_at', { ascending: false });
        return { data, error };
    },

    async getById(id) {
        const { data, error } = await supabase
            .from('projects')
            .select('*, client:clients(*), campaigns(*)')
            .eq('id', id)
            .single();
        return { data, error };
    },

    async create(project) {
        const { data, error } = await supabase
            .from('projects')
            .insert(project)
            .select()
            .single();
        return { data, error };
    },

    async update(id, updates) {
        const { data, error } = await supabase
            .from('projects')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        return { data, error };
    },

    async updateProgress(id, progress) {
        return this.update(id, { progress });
    }
};

// ================================================
// CAMPAIGNS API
// ================================================

export const campaigns = {
    async getAll(filters = {}) {
        let query = supabase
            .from('campaigns')
            .select('*, client:clients(*), project:projects(*)');

        if (filters.status) query = query.eq('status', filters.status);
        if (filters.platform) query = query.eq('platform', filters.platform);

        const { data, error } = await query.order('created_at', { ascending: false });
        return { data, error };
    },

    async getById(id) {
        const { data, error } = await supabase
            .from('campaigns')
            .select('*, client:clients(*), project:projects(*)')
            .eq('id', id)
            .single();
        return { data, error };
    },

    async create(campaign) {
        const { data, error } = await supabase
            .from('campaigns')
            .insert(campaign)
            .select()
            .single();
        return { data, error };
    },

    async update(id, updates) {
        const { data, error } = await supabase
            .from('campaigns')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        return { data, error };
    },

    async updateMetrics(id, metrics) {
        const { data: current } = await this.getById(id);
        const newMetrics = { ...current.metrics, ...metrics };
        return this.update(id, { metrics: newMetrics });
    },

    async getStats() {
        const { data, error } = await supabase
            .from('campaigns')
            .select('status, budget, spent, metrics');

        if (error) return { data: null, error };

        const active = data.filter(c => c.status === 'active');
        const totalBudget = data.reduce((sum, c) => sum + (c.budget || 0), 0);
        const totalSpent = data.reduce((sum, c) => sum + (c.spent || 0), 0);
        const totalLeads = data.reduce((sum, c) => sum + (c.metrics?.leads || 0), 0);
        const avgRoi = active.length > 0
            ? active.reduce((sum, c) => sum + (c.metrics?.roi || 0), 0) / active.length
            : 0;

        return {
            data: {
                total: data.length,
                active: active.length,
                totalBudget,
                totalSpent,
                totalLeads,
                avgRoi: avgRoi.toFixed(1)
            },
            error: null
        };
    }
};

// ================================================
// INVOICES API
// ================================================

export const invoices = {
    async getAll(clientId = null) {
        let query = supabase
            .from('invoices')
            .select('*, client:clients(*), project:projects(*)');

        if (clientId) query = query.eq('client_id', clientId);

        const { data, error } = await query.order('created_at', { ascending: false });
        return { data, error };
    },

    async getById(id) {
        const { data, error } = await supabase
            .from('invoices')
            .select('*, client:clients(*), project:projects(*)')
            .eq('id', id)
            .single();
        return { data, error };
    },

    async create(invoice) {
        // Calculate total
        invoice.total = (invoice.amount || 0) + (invoice.tax || 0);

        const { data, error } = await supabase
            .from('invoices')
            .insert(invoice)
            .select()
            .single();
        return { data, error };
    },

    async update(id, updates) {
        if (updates.amount || updates.tax) {
            updates.total = (updates.amount || 0) + (updates.tax || 0);
        }

        const { data, error } = await supabase
            .from('invoices')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        return { data, error };
    },

    async markAsPaid(id) {
        return this.update(id, {
            status: 'paid',
            paid_at: new Date().toISOString()
        });
    },

    async getStats(clientId = null) {
        let query = supabase.from('invoices').select('amount, total, status');
        if (clientId) query = query.eq('client_id', clientId);

        const { data, error } = await query;
        if (error) return { data: null, error };

        const stats = {
            total: data.reduce((sum, i) => sum + (i.total || 0), 0),
            paid: data.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.total || 0), 0),
            pending: data.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((sum, i) => sum + (i.total || 0), 0),
            overdue: data.filter(i => i.status === 'overdue').length
        };

        return { data: stats, error: null };
    }
};

// ================================================
// ACTIVITIES API
// ================================================

export const activities = {
    async getRecent(limit = 10) {
        const { data, error } = await supabase
            .from('activities')
            .select('*, user:users(full_name, avatar_url)')
            .order('created_at', { ascending: false })
            .limit(limit);
        return { data, error };
    },

    async log(entityType, entityId, action, description = '', metadata = {}) {
        const user = await auth.getUser();

        const { data, error } = await supabase
            .from('activities')
            .insert({
                user_id: user?.id,
                entity_type: entityType,
                entity_id: entityId,
                action,
                description,
                metadata
            })
            .select()
            .single();
        return { data, error };
    }
};

// ================================================
// REALTIME SUBSCRIPTIONS
// ================================================

export const realtime = {
    subscribeToLeads(callback) {
        return supabase
            .channel('leads-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, callback)
            .subscribe();
    },

    subscribeToCampaigns(callback) {
        return supabase
            .channel('campaigns-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'campaigns' }, callback)
            .subscribe();
    },

    unsubscribe(channel) {
        supabase.removeChannel(channel);
    }
};

// ================================================
// UTILITY FUNCTIONS
// ================================================

export const utils = {
    formatCurrency(amount, currency = 'VND') {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency
        }).format(amount);
    },

    formatDate(date, format = 'short') {
        const d = new Date(date);
        if (format === 'short') {
            return d.toLocaleDateString('vi-VN');
        }
        return d.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    getInitials(name) {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }
};

// Export default client
export default supabase;

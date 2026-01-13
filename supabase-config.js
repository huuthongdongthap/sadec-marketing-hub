/* ==========================================================================
   SUPABASE CONFIG V2 - SA ĐÉC MARKETING HUB
   Full Professional Edition with Admin API, Auth, and Roles
   ========================================================================== */

// 🔧 CẤU HÌNH: Credentials từ Supabase Dashboard
const SUPABASE_URL = 'https://pzcgvfhppglzfjavxuid.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6Y2d2ZmhwcGdsemZqYXZ4dWlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3MzE3ODYsImV4cCI6MjA4MjMwNzc4Nn0.xE_iEkIYaY0ql0Br_B64o1JKLuiAeAPg8GydLm71DLs';

// Supabase client instance
let supabaseClient = null;

// ============================================================================
// INITIALIZATION
// ============================================================================
function initSupabase() {
    try {
        if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

            return true;
        } else {

            return false;
        }
    } catch (err) {

        return false;
    }
}

function getClient() {
    if (!supabaseClient) initSupabase();
    return supabaseClient;
}

// ============================================================================
// PUBLIC API (Client Website)
// ============================================================================

// CONTACTS: Lưu form liên hệ
async function saveContact(contactData) {
    const client = getClient();
    if (!client) return { error: 'Not initialized' };

    const { data, error } = await client
        .from('contacts')
        .insert([{
            name: contactData.name,
            phone: contactData.phone,
            business_name: contactData.business,
            service: contactData.service,
            message: contactData.message || ''
        }])
        .select();

    if (error) {

        return { error };
    }

    return { data };
}

// TESTIMONIALS: Load đánh giá
async function loadTestimonials() {
    const client = getClient();
    if (!client) return { error: 'Not initialized', data: [] };

    const { data, error } = await client
        .from('testimonials')
        .select('*')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(6);

    return error ? { error, data: [] } : { data };
}

// SERVICES: Load dịch vụ/bảng giá
async function loadServices() {
    const client = getClient();
    if (!client) return { error: 'Not initialized', data: [] };

    const { data, error } = await client
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

    return error ? { error, data: [] } : { data };
}

// BLOG POSTS: Load bài viết
async function loadBlogPosts(limit = 10) {
    const client = getClient();
    if (!client) return { error: 'Not initialized', data: [] };

    const { data, error } = await client
        .from('blog_posts')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(limit);

    return error ? { error, data: [] } : { data };
}

// ANALYTICS: Track events
async function trackEvent(eventName, eventData = {}) {
    const client = getClient();
    if (!client) return;

    try {
        await client
            .from('analytics_events')
            .insert([{
                event_name: eventName,
                event_data: eventData,
                page_url: window.location.href
            }]);
    } catch (err) {

    }
}

// ============================================================================
// AUTHENTICATION API
// ============================================================================
const AuthAPI = {
    // Sign in with email/password
    async signIn(email, password) {
        const client = getClient();
        if (!client) return { error: 'Not initialized' };

        const { data, error } = await client.auth.signInWithPassword({
            email,
            password
        });

        if (error) {

            return { error };
        }

        return { data };
    },

    // Sign up new user
    async signUp(email, password, metadata = {}) {
        const client = getClient();
        if (!client) return { error: 'Not initialized' };

        const { data, error } = await client.auth.signUp({
            email,
            password,
            options: {
                data: metadata // { full_name, role }
            }
        });

        if (error) {

            return { error };
        }

        return { data };
    },

    // Sign out
    async signOut() {
        const client = getClient();
        if (!client) return { error: 'Not initialized' };

        const { error } = await client.auth.signOut();
        if (error) {

            return { error };
        }

        return { success: true };
    },

    // Get current user
    async getUser() {
        const client = getClient();
        if (!client) return null;

        const { data: { user } } = await client.auth.getUser();
        return user;
    },

    // Get current session
    async getSession() {
        const client = getClient();
        if (!client) return null;

        const { data: { session } } = await client.auth.getSession();
        return session;
    },

    // Get user profile with role
    async getProfile() {
        const client = getClient();
        if (!client) return null;

        const user = await this.getUser();
        if (!user) return null;

        const { data, error } = await client
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        return error ? null : data;
    },

    // Get user role
    async getRole() {
        const profile = await this.getProfile();
        return profile?.role || 'guest';
    },

    // Check if has permission
    async hasPermission(requiredRole) {
        const roleHierarchy = {
            super_admin: 100,
            manager: 50,
            content_creator: 20,
            customer: 10,
            guest: 0
        };

        const userRole = await this.getRole();
        return (roleHierarchy[userRole] || 0) >= (roleHierarchy[requiredRole] || 0);
    },

    // Listen for auth changes
    onAuthChange(callback) {
        const client = getClient();
        if (!client) return;

        return client.auth.onAuthStateChange((event, session) => {
            callback(event, session);
        });
    }
};

// ============================================================================
// ADMIN API - CRM (Customers)
// ============================================================================
const AdminAPI = {
    // ========== CUSTOMERS ==========
    async loadCustomers(filters = {}) {
        const client = getClient();
        if (!client) return { error: 'Not initialized', data: [] };

        let query = client
            .from('customers')
            .select('*')
            .order('created_at', { ascending: false });

        // Apply filters
        if (filters.status) query = query.eq('status', filters.status);
        if (filters.source) query = query.eq('source', filters.source);
        if (filters.search) {
            query = query.or(`name.ilike.%${filters.search}%,business_name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
        }
        if (filters.limit) query = query.limit(filters.limit);

        const { data, error } = await query;
        return error ? { error, data: [] } : { data };
    },

    async getCustomer(id) {
        const client = getClient();
        if (!client) return { error: 'Not initialized' };

        const { data, error } = await client
            .from('customers')
            .select('*')
            .eq('id', id)
            .single();

        return error ? { error } : { data };
    },

    async saveCustomer(customer) {
        const client = getClient();
        if (!client) return { error: 'Not initialized' };

        if (customer.id) {
            // Update existing
            const { data, error } = await client
                .from('customers')
                .update({
                    name: customer.name,
                    phone: customer.phone,
                    email: customer.email,
                    business_name: customer.business_name,
                    source: customer.source,
                    status: customer.status,
                    notes: customer.notes,
                    avatar_emoji: customer.avatar_emoji,
                    value: customer.value,
                    updated_at: new Date().toISOString()
                })
                .eq('id', customer.id)
                .select()
                .single();

            return error ? { error } : { data };
        } else {
            // Insert new
            const { data, error } = await client
                .from('customers')
                .insert([{
                    name: customer.name,
                    phone: customer.phone,
                    email: customer.email,
                    business_name: customer.business_name,
                    source: customer.source || 'website',
                    status: customer.status || 'new',
                    notes: customer.notes,
                    avatar_emoji: customer.avatar_emoji || '👤',
                    value: customer.value || 0
                }])
                .select()
                .single();

            return error ? { error } : { data };
        }
    },

    async deleteCustomer(id) {
        const client = getClient();
        if (!client) return { error: 'Not initialized' };

        const { error } = await client
            .from('customers')
            .delete()
            .eq('id', id);

        return error ? { error } : { success: true };
    },

    async updateCustomerStatus(id, status) {
        const client = getClient();
        if (!client) return { error: 'Not initialized' };

        const { data, error } = await client
            .from('customers')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        return error ? { error } : { data };
    },

    // ========== SCHEDULED POSTS ==========
    async loadPosts(filters = {}) {
        const client = getClient();
        if (!client) return { error: 'Not initialized', data: [] };

        let query = client
            .from('scheduled_posts')
            .select('*')
            .order('scheduled_at', { ascending: true });

        if (filters.status) query = query.eq('status', filters.status);
        if (filters.platform) query = query.eq('platform', filters.platform);
        if (filters.limit) query = query.limit(filters.limit);

        const { data, error } = await query;
        return error ? { error, data: [] } : { data };
    },

    async getPost(id) {
        const client = getClient();
        if (!client) return { error: 'Not initialized' };

        const { data, error } = await client
            .from('scheduled_posts')
            .select('*')
            .eq('id', id)
            .single();

        return error ? { error } : { data };
    },

    async savePost(post) {
        const client = getClient();
        if (!client) return { error: 'Not initialized' };

        const user = await AuthAPI.getUser();

        if (post.id) {
            // Update existing
            const { data, error } = await client
                .from('scheduled_posts')
                .update({
                    title: post.title,
                    content: post.content,
                    platform: post.platform,
                    status: post.status,
                    scheduled_at: post.scheduled_at,
                    updated_at: new Date().toISOString()
                })
                .eq('id', post.id)
                .select()
                .single();

            return error ? { error } : { data };
        } else {
            // Insert new
            const { data, error } = await client
                .from('scheduled_posts')
                .insert([{
                    title: post.title,
                    content: post.content,
                    platform: post.platform || 'facebook',
                    status: post.status || 'draft',
                    scheduled_at: post.scheduled_at,
                    created_by: user?.id
                }])
                .select()
                .single();

            return error ? { error } : { data };
        }
    },

    async deletePost(id) {
        const client = getClient();
        if (!client) return { error: 'Not initialized' };

        const { error } = await client
            .from('scheduled_posts')
            .delete()
            .eq('id', id);

        return error ? { error } : { success: true };
    },

    async updatePostStatus(id, status) {
        const client = getClient();
        if (!client) return { error: 'Not initialized' };

        const updates = {
            status,
            updated_at: new Date().toISOString()
        };

        if (status === 'published') {
            updates.published_at = new Date().toISOString();
        }

        const { data, error } = await client
            .from('scheduled_posts')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        return error ? { error } : { data };
    }
};

// ============================================================================
// KPI API - Dashboard Stats
// ============================================================================
const KPIAPI = {
    async getLeadsThisMonth() {
        const client = getClient();
        if (!client) return 0;

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { count } = await client
            .from('contacts')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', startOfMonth.toISOString());

        return count || 0;
    },

    async getCustomersThisMonth() {
        const client = getClient();
        if (!client) return 0;

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { count } = await client
            .from('customers')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', startOfMonth.toISOString());

        return count || 0;
    },

    async getClosedDeals() {
        const client = getClient();
        if (!client) return 0;

        const { count } = await client
            .from('customers')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'closed');

        return count || 0;
    },

    async getTotalRevenue() {
        const client = getClient();
        if (!client) return 0;

        const { data } = await client
            .from('customers')
            .select('value')
            .eq('status', 'closed');

        if (!data) return 0;
        return data.reduce((sum, c) => sum + (c.value || 0), 0);
    },

    async getScheduledPostsCount() {
        const client = getClient();
        if (!client) return 0;

        const { count } = await client
            .from('scheduled_posts')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'scheduled');

        return count || 0;
    },

    async getLeadsBySource() {
        const client = getClient();
        if (!client) return [];

        const { data } = await client
            .from('customers')
            .select('source');

        if (!data) return [];

        const counts = {};
        data.forEach(c => {
            counts[c.source] = (counts[c.source] || 0) + 1;
        });

        return Object.entries(counts).map(([source, count]) => ({ source, count }));
    },

    async getLeadsByWeek() {
        const client = getClient();
        if (!client) return [];

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data } = await client
            .from('contacts')
            .select('created_at')
            .gte('created_at', sevenDaysAgo.toISOString());

        if (!data) return [];

        // Group by day
        const days = {};
        const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

        data.forEach(c => {
            const day = new Date(c.created_at).getDay();
            days[day] = (days[day] || 0) + 1;
        });

        return dayNames.map((name, i) => ({
            day: name,
            count: days[i] || 0
        }));
    },

    async getAllStats() {
        const [leads, customers, closedDeals, revenue, scheduledPosts] = await Promise.all([
            this.getLeadsThisMonth(),
            this.getCustomersThisMonth(),
            this.getClosedDeals(),
            this.getTotalRevenue(),
            this.getScheduledPostsCount()
        ]);

        return {
            leads,
            customers,
            closedDeals,
            revenue,
            scheduledPosts
        };
    }
};

// ============================================================================
// EXPORTS
// ============================================================================

// Public API (for client website)
window.SupabaseAPI = {
    init: initSupabase,
    getClient,
    saveContact,
    loadTestimonials,
    loadServices,
    loadBlogPosts,
    trackEvent
};

// Auth API
window.AuthAPI = AuthAPI;

// Admin API (for admin dashboard)
window.AdminAPI = AdminAPI;

// KPI API (for dashboard stats)
window.KPIAPI = KPIAPI;

// Auto-init when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initSupabase, 500);
});

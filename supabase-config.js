/* ==========================================================================
   SUPABASE CONFIG V2 - SA ĐÉC MARKETING HUB
   Full Professional Edition with Admin API, Auth, and Roles
   Auth: Supabase | Data: Cloudflare Workers API
   ========================================================================== */

// 🔧 CẤU HÌNH: Read from environment (injected by inject-env.js during build)
const SUPABASE_URL = window.__ENV__?.SUPABASE_URL;
const SUPABASE_ANON_KEY = window.__ENV__?.SUPABASE_ANON_KEY;

// Workers API endpoint (thay Supabase cho data calls)
const WORKERS_API_URL =
    window.__ENV__?.WORKERS_API_URL ||
    'https://sadec-marketing-hub-api.sadec-marketing-hub.workers.dev';

// ── Workers API helper ──────────────────────────────────────────────────────
function _wFetch(path, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    // Thêm Supabase JWT nếu đã đăng nhập
    try {
        for (const key of Object.keys(localStorage)) {
            if (key.includes('auth-token') || key.includes('supabase.auth')) {
                const val = JSON.parse(localStorage.getItem(key));
                const token = val?.access_token || val?.currentSession?.access_token;
                if (token) { headers['Authorization'] = `Bearer ${token}`; break; }
            }
        }
    } catch (_) { }
    return fetch(`${WORKERS_API_URL}${path}`, { ...options, headers })
        .then(r => r.json().catch(() => ({})));
}


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
        }
        return null;
    } catch (err) {
        return null;
    }
}

function getClient() {
    if (!supabaseClient) initSupabase();
    // Null safety: return null if client not initialized (window.supabase undefined)
    return supabaseClient || null;
}

// ============================================================================
// PUBLIC API (Client Website)
// ============================================================================

// CONTACTS: Lưu form liên hệ → Workers API
async function saveContact(contactData) {
    try {
        const json = await _wFetch('/api/contacts', {
            method: 'POST',
            body: JSON.stringify({
                name: contactData.name,
                phone: contactData.phone || '',
                email: contactData.email || '',
                company: contactData.business || contactData.company || '',
                message: contactData.message || '',
                source: contactData.source || 'website',
            }),
        });
        if (json.ok) return { data: json };
        return { error: json.error || 'Lỗi khi lưu liên hệ' };
    } catch (err) {
        return { error: err.message };
    }
}


// TESTIMONIALS: Load đánh giá → Workers API
async function loadTestimonials() {
    try {
        const data = await _wFetch('/api/cms/testimonials');
        return { data: Array.isArray(data) ? data : [] };
    } catch (err) {
        return { error: err.message, data: [] };
    }
}


// SERVICES: Load dịch vụ/bảng giá → Workers API
async function loadServices() {
    try {
        const data = await _wFetch('/api/cms/services');
        return { data: Array.isArray(data) ? data : [] };
    } catch (err) {
        return { error: err.message, data: [] };
    }
}


// BLOG POSTS: Load bài viết → Workers API
async function loadBlogPosts(limit = 10) {
    try {
        const data = await _wFetch(`/api/cms/blog`);
        const arr = Array.isArray(data) ? data : [];
        return { data: arr.slice(0, limit) };
    } catch (err) {
        return { error: err.message, data: [] };
    }
}


// ANALYTICS: Track events → Workers API (fire & forget, không cần đợi)
function trackEvent(eventName, eventData = {}) {
    _wFetch('/api/analytics/event', {
        method: 'POST',
        body: JSON.stringify({
            event: eventName,
            page: window.location.pathname,
            properties: eventData,
        }),
    }).catch(() => { }); // silent fail
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
// BINH PHÁP API - Strategic Data & WIN³ Metrics
// ============================================================================
const BinhPhapAPI = {
    // Get dashboard stats from materialized view (fast)
    async getDashboardStats() {
        const client = getClient();
        if (!client) return null;

        const { data, error } = await client
            .from('mv_dashboard_stats')
            .select('*')
            .single();

        if (error) {
            return await this.getDashboardStatsLive();
        }
        return data;
    },

    // Fallback live query if materialized view doesn't exist
    async getDashboardStatsLive() {
        const client = getClient();
        if (!client) return null;

        const [customers, projects, invoices, campaigns, deals, contacts] = await Promise.all([
            client.from('customers').select('*', { count: 'exact', head: true }).is('deleted_at', null),
            client.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'active'),
            client.from('invoices').select('total, status').in('status', ['sent', 'overdue']),
            client.from('campaigns').select('*', { count: 'exact', head: true }).eq('status', 'active'),
            client.from('deals').select('value, stage').is('deleted_at', null),
            client.from('contacts').select('*', { count: 'exact', head: true }).eq('status', 'new')
        ]);

        const pipelineDeals = deals.data?.filter(d => !['won', 'lost'].includes(d.stage)) || [];
        const pipelineValue = pipelineDeals.reduce((sum, d) => sum + (d.value || 0), 0);
        const pendingRevenue = invoices.data?.reduce((sum, i) => sum + (i.total || 0), 0) || 0;

        return {
            total_customers: customers.count || 0,
            active_projects: projects.count || 0,
            pending_invoices: invoices.data?.length || 0,
            pending_revenue: pendingRevenue,
            active_campaigns: campaigns.count || 0,
            pipeline_value: pipelineValue,
            new_contacts: contacts.count || 0,
            last_refreshed: new Date().toISOString()
        };
    },

    // Get pipeline data for visualization
    async getPipelineData() {
        const client = getClient();
        if (!client) return [];

        const { data, error } = await client
            .from('deals')
            .select('*')
            .is('deleted_at', null)
            .order('value', { ascending: false });

        if (error) return [];

        // Group by stage
        const stages = ['discovery', 'proposal', 'negotiation', 'won', 'lost'];
        return stages.map(stage => ({
            stage,
            deals: data.filter(d => d.stage === stage),
            count: data.filter(d => d.stage === stage).length,
            value: data.filter(d => d.stage === stage).reduce((sum, d) => sum + (d.value || 0), 0)
        }));
    },

    // Get WIN³ metrics snapshot
    async getWin3Metrics() {
        const client = getClient();
        if (!client) return null;

        // Try to get from snapshots table first
        const { data: snapshot, error } = await client
            .from('win3_snapshots')
            .select('*')
            .order('snapshot_date', { ascending: false })
            .limit(1)
            .single();

        if (!error && snapshot) {
            return snapshot;
        }

        // Fallback: calculate live
        const stats = await this.getDashboardStats();
        return {
            pipeline_value: stats?.pipeline_value || 0,
            total_customers: stats?.total_customers || 0,
            active_campaigns: stats?.active_campaigns || 0,
            pending_revenue: stats?.pending_revenue || 0,
            new_contacts: stats?.new_contacts || 0,
            snapshot_date: new Date().toISOString().split('T')[0]
        };
    },

    // Get campaign performance by platform
    async getCampaignPerformance() {
        const client = getClient();
        if (!client) return [];

        const { data, error } = await client
            .from('campaigns')
            .select('platform, budget, spent, metrics, status')
            .is('deleted_at', null);

        if (error || !data) return [];

        // Aggregate by platform
        const byPlatform = {};
        data.forEach(c => {
            if (!byPlatform[c.platform]) {
                byPlatform[c.platform] = {
                    platform: c.platform,
                    count: 0,
                    budget: 0,
                    spent: 0,
                    impressions: 0,
                    clicks: 0,
                    leads: 0,
                    conversions: 0
                };
            }
            byPlatform[c.platform].count++;
            byPlatform[c.platform].budget += c.budget || 0;
            byPlatform[c.platform].spent += c.spent || 0;
            if (c.metrics) {
                byPlatform[c.platform].impressions += c.metrics.impressions || 0;
                byPlatform[c.platform].clicks += c.metrics.clicks || 0;
                byPlatform[c.platform].leads += c.metrics.leads || 0;
                byPlatform[c.platform].conversions += c.metrics.conversions || 0;
            }
        });

        return Object.values(byPlatform).sort((a, b) => b.spent - a.spent);
    },

    // Get monthly revenue from invoices
    async getMonthlyRevenue() {
        const client = getClient();
        if (!client) return [];

        // Try materialized view first
        const { data: mvData, error: mvError } = await client
            .from('mv_monthly_revenue')
            .select('*')
            .order('month', { ascending: false })
            .limit(12);

        if (!mvError && mvData) {
            return mvData;
        }

        // Fallback: live query
        const { data, error } = await client
            .from('invoices')
            .select('total, paid_at')
            .eq('status', 'paid')
            .not('paid_at', 'is', null);

        if (error || !data) return [];

        // Group by month
        const byMonth = {};
        data.forEach(inv => {
            const month = inv.paid_at.substring(0, 7); // YYYY-MM
            if (!byMonth[month]) {
                byMonth[month] = { month, total_revenue: 0, invoice_count: 0 };
            }
            byMonth[month].total_revenue += inv.total || 0;
            byMonth[month].invoice_count++;
        });

        return Object.values(byMonth).sort((a, b) => b.month.localeCompare(a.month));
    },

    // Refresh materialized views (requires admin)
    async refreshAnalytics() {
        const client = getClient();
        if (!client) return { error: 'Not initialized' };

        const { data, error } = await client.rpc('refresh_dashboard_stats');
        return error ? { error } : { success: true, refreshed_at: new Date() };
    },

    // Get content calendar overview
    async getContentCalendar(limit = 10) {
        const client = getClient();
        if (!client) return [];

        const { data, error } = await client
            .from('content_calendar')
            .select('*')
            .in('status', ['scheduled', 'published'])
            .order('scheduled_at', { ascending: true })
            .limit(limit);

        return error ? [] : data;
    },

    // Get audit log (admin only)
    async getAuditLog(limit = 20) {
        const client = getClient();
        if (!client) return [];

        const { data, error } = await client
            .from('audit_log')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        return error ? [] : data;
    }
};

// ============================================================================
// AUTHENTICATION & AUTHORIZATION STATE MANAGEMENT
// Higher-level auth state, guards, and UI helpers (built on top of AuthAPI)
// ============================================================================

// ═══════════════════════════════════════════════════════════════════════════
// ROLE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

const ROLES = {
    SUPER_ADMIN: 'super_admin',
    MANAGER: 'manager',
    CONTENT_CREATOR: 'content_creator',
    CLIENT: 'client',
    AFFILIATE: 'affiliate'
};

const ROLE_LEVELS = {
    super_admin: 100,
    manager: 50,
    content_creator: 20,
    client: 15,
    affiliate: 10
};

const ROLE_REDIRECTS = {
    super_admin: '/admin/dashboard.html',
    manager: '/admin/dashboard.html',
    content_creator: '/admin/dashboard.html',
    client: '/portal/dashboard.html',
    affiliate: '/affiliate/dashboard.html'
};

const ROLE_LABELS = {
    super_admin: '👑 Super Admin',
    manager: '📊 Manager',
    content_creator: '✍️ Content Creator',
    client: '🏢 Client',
    affiliate: '🤝 Affiliate Partner'
};

// ═══════════════════════════════════════════════════════════════════════════
// AUTH STATE
// ═══════════════════════════════════════════════════════════════════════════

const AuthState = {
    user: null,
    profile: null,
    isLoading: true,
    isAuthenticated: false,

    // Get current session from Supabase or localStorage (demo mode)
    // ENHANCED: Now reads role from JWT app_metadata first (more secure)
    async init() {
        this.isLoading = true;

        try {
            // Null safety: Check if AuthAPI exists before using
            if (window.AuthAPI && typeof window.AuthAPI.getSession === 'function') {
                const session = await window.AuthAPI.getSession();

                if (session?.user) {
                    this.user = session.user;

                    // PHASE 2 ENHANCEMENT: Try to get role from JWT claims first
                    // This is more secure as it's set by the database trigger
                    const jwtRole = session.user.app_metadata?.role;

                    if (jwtRole && ROLE_LEVELS[jwtRole]) {
                        // Role found in JWT claims - use it directly (most secure)
                        this.profile = {
                            id: session.user.id,
                            email: session.user.email,
                            full_name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
                            role: jwtRole,
                            avatar_url: session.user.user_metadata?.avatar_url
                        };
                        // console.debug('Auth: Role from JWT claims:', jwtRole);
                    } else {
                        // Fallback: Load profile from database (for users before trigger)
                        // Null safety: check if getProfile exists
                        if (typeof window.AuthAPI.getProfile === 'function') {
                            const profile = await window.AuthAPI.getProfile();
                            if (profile) {
                                this.profile = profile;
                            }
                        }
                        // console.debug('Auth: Role from user_profiles:', this.profile?.role);
                    }

                    // Cache in localStorage for quick access
                    if (this.profile) {
                        localStorage.setItem('userRole', this.profile.role);
                        localStorage.setItem('userName', this.profile.full_name);
                    }

                    this.isAuthenticated = true;
                    this.isLoading = false;
                    return true;
                }
            }

            // Fallback to demo mode
            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            if (isLoggedIn) {
                this.user = {
                    id: 'demo-user',
                    email: localStorage.getItem('userEmail')
                };
                this.profile = {
                    id: 'demo-user',
                    email: localStorage.getItem('userEmail'),
                    full_name: localStorage.getItem('userName') || 'Demo User',
                    role: localStorage.getItem('userRole') || 'affiliate',
                    avatar_url: null
                };
                this.isAuthenticated = true;
            }

        } catch (error) {
            // Auth init error - silently continue with unauthenticated state
        }

        this.isLoading = false;
        return this.isAuthenticated;
    },

    // Get current role - STANDARDIZED: JWT → Profile → Demo fallback
    getRole() {
        // Primary source: profile (populated from JWT or database in init())
        if (this.profile?.role && ROLE_LEVELS[this.profile.role]) {
            return this.profile.role;
        }

        // Demo mode fallback only
        const isDemoMode = localStorage.getItem('isDemoMode') === 'true';
        if (isDemoMode) {
            const cachedRole = localStorage.getItem('userRole');
            if (cachedRole && ROLE_LEVELS[cachedRole]) {
                return cachedRole;
            }
        }

        return 'affiliate'; // Default role
    },

    // Get role level (for permission comparison)
    getRoleLevel() {
        return ROLE_LEVELS[this.getRole()] || 0;
    },

    // Check if user has minimum required role
    hasPermission(requiredRole) {
        const userLevel = this.getRoleLevel();
        const requiredLevel = ROLE_LEVELS[requiredRole] || 0;
        return userLevel >= requiredLevel;
    },

    // Check if user has specific role
    hasRole(role) {
        return this.getRole() === role;
    },

    // Get user display name
    getDisplayName() {
        return this.profile?.full_name ||
            this.user?.email?.split('@')[0] ||
            localStorage.getItem('userName') ||
            'User';
    },

    // Get role label with emoji
    getRoleLabel() {
        return ROLE_LABELS[this.getRole()] || '👤 User';
    },

    // Dispatch role change event (for cross-component sync)
    _dispatchRoleChange() {
        window.dispatchEvent(new CustomEvent('auth:role:changed', {
            detail: { role: this.getRole(), profile: this.profile }
        }));
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// AUTH ACTIONS
// ═══════════════════════════════════════════════════════════════════════════

const AuthActions = {

    // Sign in with email/password
    async signIn(email, password) {
        try {
            if (window.AuthAPI) {
                const result = await window.AuthAPI.signIn(email, password);

                if (result.data?.user) {
                    await AuthState.init();
                    return { success: true, user: result.data.user };
                }

                if (result.error) {
                    const errorMessage = result.error.message || 'Lỗi đăng nhập';
                    // Fall through to demo mode for all errors
                }
            }

            const DEMO_USERS = {
                'admin@mekongmarketing.com': { password: 'admin123', role: 'super_admin', name: 'Admin' },
                'manager@mekongmarketing.com': { password: 'manager123', role: 'manager', name: 'Manager' },
                'creator@mekongmarketing.com': { password: 'creator123', role: 'content_creator', name: 'Creator' },
                'client@mekongmarketing.com': { password: 'client123', role: 'client', name: 'Client Demo' },
                'affiliate@mekongmarketing.com': { password: 'affiliate123', role: 'affiliate', name: 'Affiliate Demo' }
            };

            const demoUser = DEMO_USERS[email.toLowerCase()];

            if (demoUser && demoUser.password === password) {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userEmail', email);
                localStorage.setItem('userRole', demoUser.role);
                localStorage.setItem('userName', demoUser.name);
                localStorage.setItem('isDemoMode', 'true');

                await AuthState.init();
                return { success: true, user: { email }, isDemo: true };
            }

            return { success: false, error: 'Email hoặc mật khẩu không đúng' };

        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Sign up new user
    async signUp(email, password, metadata = {}) {
        try {
            if (window.AuthAPI) {
                const result = await window.AuthAPI.signUp(email, password, {
                    full_name: metadata.fullName,
                    role: metadata.role || 'affiliate',
                    phone: metadata.phone
                });

                if (result.error) throw result.error;

                return {
                    success: true,
                    user: result.data?.user,
                    message: 'Đăng ký thành công! Kiểm tra email để xác nhận.'
                };
            }

            // Demo mode - just store locally
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userRole', metadata.role || 'affiliate');
            localStorage.setItem('userName', metadata.fullName || email.split('@')[0]);
            localStorage.setItem('isDemoMode', 'true');

            await AuthState.init();
            return { success: true, isDemo: true };

        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Sign out
    async signOut() {
        try {
            if (window.AuthAPI) {
                await window.AuthAPI.signOut();
            }
        } catch (error) {
            // Silently handle sign out errors
        }

        // Clear local storage
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        localStorage.removeItem('isDemoMode');

        // Reset state
        AuthState.user = null;
        AuthState.profile = null;
        AuthState.isAuthenticated = false;

        // Dispatch sign-out event for listeners (e.g., portal-guard)
        window.dispatchEvent(new CustomEvent('auth:signout'));

        // Redirect to login
        window.location.href = '/auth/login.html';
    },

    // Reset password request
    async resetPassword(email) {
        try {
            if (window.SupabaseAPI) {
                const client = window.SupabaseAPI.getClient();
                if (client) {
                    const { error } = await client.auth.resetPasswordForEmail(email, {
                        redirectTo: `${window.location.origin}/reset-password.html`
                    });

                    if (error) throw error;
                    return { success: true, message: 'Email đặt lại mật khẩu đã được gửi!' };
                }
            }

            return { success: false, error: 'Demo mode: Liên hệ admin để reset mật khẩu' };

        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Resend verification email
    async resendVerificationEmail(email) {
        try {
            if (window.SupabaseAPI) {
                const client = window.SupabaseAPI.getClient();
                if (client) {
                    const { error } = await client.auth.resend({
                        type: 'signup',
                        email: email,
                        options: {
                            emailRedirectTo: `${window.location.origin}/verify-email.html`
                        }
                    });

                    if (error) throw error;
                    return { success: true, message: 'Email xác thực đã được gửi lại!' };
                }
            }

            return { success: false, error: 'Demo mode: Không cần xác thực email' };

        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Check if email is verified
    async checkEmailVerified() {
        try {
            if (window.SupabaseAPI) {
                const client = window.SupabaseAPI.getClient();
                if (client) {
                    const { data: { user } } = await client.auth.getUser();
                    if (user) {
                        return {
                            verified: !!user.email_confirmed_at,
                            email: user.email
                        };
                    }
                }
            }
            // Demo mode - always verified
            return { verified: true, email: localStorage.getItem('userEmail') };

        } catch (error) {
            return { verified: false, email: null };
        }
    },

    // Sign in with Zalo (placeholder - coming soon)
    async signInWithZalo() {
        // Zalo OA integration requires business verification
        // This is a placeholder for future implementation
        return {
            success: false,
            error: 'Đăng nhập bằng Zalo sẽ sớm ra mắt! 🚀',
            isPlaceholder: true
        };
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// AUTH GUARDS
// ═══════════════════════════════════════════════════════════════════════════

const AuthGuards = {

    // Require authentication - redirect to login if not authenticated
    async requireAuth() {
        await AuthState.init();

        if (!AuthState.isAuthenticated) {
            window.location.href = '/auth/login.html';
            return false;
        }

        return true;
    },

    // Require specific role or higher
    async requireRole(minimumRole) {
        await AuthState.init();

        if (!AuthState.isAuthenticated) {
            window.location.href = '/auth/login.html';
            return false;
        }

        if (!AuthState.hasPermission(minimumRole)) {
            // Redirect to appropriate dashboard based on role
            const redirect = ROLE_REDIRECTS[AuthState.getRole()] || '/';
            window.location.href = redirect;
            return false;
        }

        return true;
    },

    // Redirect authenticated users (for login/register pages)
    async redirectIfAuthenticated() {
        await AuthState.init();

        if (AuthState.isAuthenticated) {
            const redirect = ROLE_REDIRECTS[AuthState.getRole()] || '/';
            window.location.href = redirect;
            return true;
        }

        return false;
    },

    // Check and get redirect URL based on role
    getRedirectUrl() {
        return ROLE_REDIRECTS[AuthState.getRole()] || '/';
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// AUTH SECURITY (Idle Timeout)
// ═══════════════════════════════════════════════════════════════════════════

const AuthSecurity = {
    IDLE_TIMEOUT: 30 * 60 * 1000, // 30 minutes
    timeoutId: null,

    init() {
        if (!AuthState.isAuthenticated) return;

        this.resetTimer = this.resetTimer.bind(this);
        this.setupListeners();
        this.resetTimer();
    },

    setupListeners() {
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(evt => {
            document.addEventListener(evt, this.resetTimer, true);
        });
    },

    resetTimer() {
        if (this.timeoutId) clearTimeout(this.timeoutId);
        this.timeoutId = setTimeout(() => this.handleTimeout(), this.IDLE_TIMEOUT);
    },

    handleTimeout() {
        AuthActions.signOut();
        alert('Phiên làm việc hết hạn. Vui lòng đăng nhập lại.');
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// UI HELPERS
// ═══════════════════════════════════════════════════════════════════════════

const AuthUI = {

    // Show/hide elements based on role
    applyRoleVisibility() {
        document.querySelectorAll('[data-require-role]').forEach(el => {
            const requiredRole = el.dataset.requireRole;
            el.style.display = AuthState.hasPermission(requiredRole) ? '' : 'none';
        });

        document.querySelectorAll('[data-show-role]').forEach(el => {
            const showRole = el.dataset.showRole;
            el.style.display = AuthState.hasRole(showRole) ? '' : 'none';
        });

        document.querySelectorAll('[data-hide-role]').forEach(el => {
            const hideRole = el.dataset.hideRole;
            el.style.display = AuthState.hasRole(hideRole) ? 'none' : '';
        });
    },

    // Populate user info in UI
    populateUserInfo() {
        document.querySelectorAll('[data-user-name]').forEach(el => {
            el.textContent = AuthState.getDisplayName();
        });

        document.querySelectorAll('[data-user-email]').forEach(el => {
            el.textContent = AuthState.user?.email || '';
        });

        document.querySelectorAll('[data-user-role]').forEach(el => {
            el.textContent = AuthState.getRoleLabel();
        });

        document.querySelectorAll('[data-user-avatar]').forEach(el => {
            if (AuthState.profile?.avatar_url) {
                el.src = AuthState.profile.avatar_url;
            }
        });
    },

    // Setup logout buttons
    setupLogoutButtons() {
        document.querySelectorAll('[data-logout]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                AuthActions.signOut();
            });
        });
    },

    // Initialize all UI helpers
    async init() {
        await AuthState.init();
        this.applyRoleVisibility();
        this.populateUserInfo();
        this.setupLogoutButtons();

        // Initialize Security Monitor
        if (AuthState.isAuthenticated) {
            AuthSecurity.init();
        }
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

// Auth API (low-level Supabase auth)
window.AuthAPI = AuthAPI;

// Admin API (for admin dashboard)
window.AdminAPI = AdminAPI;

// KPI API (for dashboard stats)
window.KPIAPI = KPIAPI;

// Binh Pháp API (for strategic data & WIN³)
window.BinhPhapAPI = BinhPhapAPI;

// Auth module (high-level auth state, actions, guards, UI)
window.Auth = {
    State: AuthState,
    Actions: AuthActions,
    Guards: AuthGuards,
    UI: AuthUI,
    ROLES,
    ROLE_LEVELS,
    ROLE_LABELS,
    ROLE_REDIRECTS
};

// Auto-init when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initSupabase, 500);
    AuthState.init();
});

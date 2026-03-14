/**
 * WORKERS API CLIENT
 * Thay thế các Supabase data calls (contacts, customers, analytics, assets)
 * Auth vẫn dùng Supabase (signIn/signOut/getUser)
 *
 * Usage:
 *   import api from './workers-api.js';
 *   const contacts = await api.contacts.create({ name, email, phone, message });
 *
 * Config: set window.__ENV__.WORKERS_API_URL trong _headers hoặc env-config.js
 */

const WORKERS_API_URL =
    window.__ENV__?.WORKERS_API_URL ||
    'https://sadec-marketing-hub-api.sadec-marketing-hub.workers.dev';

// ── Helper ────────────────────────────────────────────────────────────────────

async function apiFetch(path, options = {}) {
    const token = getAuthToken();
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${WORKERS_API_URL}${path}`, { ...options, headers });
    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
        console.error(`[WorkersAPI] ${path} → ${res.status}`, json);
        return { data: null, error: json.error || res.statusText };
    }
    return { data: json, error: null };
}

function getAuthToken() {
    // Lấy Supabase JWT từ localStorage (Supabase lưu theo key sb-<project>-auth-token)
    try {
        for (const key of Object.keys(localStorage)) {
            if (key.includes('auth-token') || key.includes('supabase.auth')) {
                const val = JSON.parse(localStorage.getItem(key));
                return val?.access_token || val?.currentSession?.access_token || null;
            }
        }
    } catch (_) { }
    return null;
}

// ── Analytics ─────────────────────────────────────────────────────────────────

const analytics = {
    /**
     * Track page view hoặc event (không cần auth)
     * Thay: supabase.from('analytics_events').insert({...})
     */
    track(event, properties = {}) {
        const page = window.location.pathname;
        return apiFetch('/api/analytics/event', {
            method: 'POST',
            body: JSON.stringify({ event, page, properties }),
        });
    },

    pageView() {
        return analytics.track('page_view', {
            title: document.title,
            referrer: document.referrer,
        });
    },

    /** Admin dashboard (cần auth) */
    dashboard(days = 30) {
        return apiFetch(`/api/analytics/dashboard?days=${days}`);
    },
};

// ── Contacts (form liên hệ) ──────────────────────────────────────────────────

const contacts = {
    /**
     * Thay: supabase.from('contacts').insert({name, email, phone, message})
     */
    create({ name, email, phone, message, source = 'website', company = '' }) {
        return apiFetch('/api/contacts', {
            method: 'POST',
            body: JSON.stringify({ name, email, phone, message, source, company }),
        });
    },

    list(params = {}) {
        const q = new URLSearchParams(params).toString();
        return apiFetch(`/api/contacts${q ? '?' + q : ''}`);
    },
};

// ── Payments ──────────────────────────────────────────────────────────────────

const payments = {
    /**
     * Thay: supabase.functions.invoke('create-payment', { body: {...} })
     */
    createVNPay({ amount, orderInfo, invoiceId, returnUrl }) {
        return apiFetch('/api/payments/vnpay/create', {
            method: 'POST',
            body: JSON.stringify({ amount, orderInfo, invoiceId, returnUrl }),
        });
    },

    createPayOS({ amount, description, invoiceId, returnUrl, cancelUrl }) {
        return apiFetch('/api/payments/payos/create', {
            method: 'POST',
            body: JSON.stringify({ amount, description, invoiceId, returnUrl, cancelUrl }),
        });
    },

    createMoMo({ amount, orderInfo, invoiceId, returnUrl }) {
        return apiFetch('/api/payments/momo/create', {
            method: 'POST',
            body: JSON.stringify({ amount, orderInfo, invoiceId, returnUrl }),
        });
    },
};

// ── Assets (File upload → R2) ─────────────────────────────────────────────────

const assets = {
    /**
     * Upload file → R2
     * Thay: supabase.storage.from('assets').upload(path, file)
     */
    async upload(file, { clientId = 'public', category = 'general' } = {}) {
        const token = getAuthToken();
        const form = new FormData();
        form.append('file', file);
        form.append('clientId', clientId);
        form.append('category', category);

        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${WORKERS_API_URL}/api/assets/upload`, { method: 'POST', headers, body: form });
        const json = await res.json().catch(() => ({}));
        return { data: json, error: res.ok ? null : json.error };
    },

    /**
     * Lấy URL public của file từ R2
     * Thay: supabase.storage.from('assets').getPublicUrl(path)
     */
    getUrl(r2Key) {
        return `${WORKERS_API_URL}/api/assets/file/${encodeURIComponent(r2Key)}`;
    },

    list(clientId) {
        return apiFetch(`/api/assets/${clientId}`);
    },

    delete(r2Key) {
        return apiFetch(`/api/assets/${encodeURIComponent(r2Key)}`, { method: 'DELETE' });
    },
};

// ── CMS (public: testimonials, services, blog) ────────────────────────────────

const cms = {
    /**
     * Thay: supabase.from('testimonials').select('*').eq('visible', true)
     */
    testimonials() {
        return apiFetch('/api/cms/testimonials');
    },

    services() {
        return apiFetch('/api/cms/services');
    },

    blogPosts(slug = null) {
        return apiFetch(slug ? `/api/cms/blog/${slug}` : '/api/cms/blog');
    },
};

// ── Export ────────────────────────────────────────────────────────────────────

const workersApi = { analytics, contacts, payments, assets, cms, _fetch: apiFetch };

export default workersApi;

// Auto track page view
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => analytics.pageView());
} else {
    analytics.pageView();
}

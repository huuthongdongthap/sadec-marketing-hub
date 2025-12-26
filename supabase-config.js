/* ==========================================================================
   SUPABASE CONFIG - SA ĐÉC MARKETING HUB
   ========================================================================== */

// 🔧 CẤU HÌNH: Credentials từ Supabase Dashboard
const SUPABASE_URL = 'https://pzcgvfhppglzfjavxuid.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6Y2d2ZmhwcGdsemZqYXZ4dWlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3MzE3ODYsImV4cCI6MjA4MjMwNzc4Nn0.xE_iEkIYaY0ql0Br_B64o1JKLuiAeAPg8GydLm71DLs';

// Khởi tạo Supabase client (đổi tên để tránh trùng với CDN)
let supabaseClient = null;

function initSupabase() {
    try {
        // CDN v2 exports createClient on window.supabase
        if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('✅ Supabase initialized successfully');
            return true;
        } else {
            console.error('❌ Supabase CDN not loaded properly');
            return false;
        }
    } catch (err) {
        console.error('❌ Supabase init error:', err);
        return false;
    }
}

// ========== CONTACTS: Lưu form liên hệ ==========
async function saveContact(contactData) {
    if (!supabaseClient) {
        console.error('Supabase not initialized');
        return { error: 'Supabase not initialized' };
    }

    const { data, error } = await supabaseClient
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
        console.error('Error saving contact:', error);
        return { error };
    }

    console.log('✅ Contact saved:', data);
    return { data };
}

// ========== TESTIMONIALS: Load đánh giá ==========
async function loadTestimonials() {
    if (!supabaseClient) return { error: 'Not initialized', data: [] };

    const { data, error } = await supabaseClient
        .from('testimonials')
        .select('*')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(6);

    return error ? { error, data: [] } : { data };
}

// ========== SERVICES: Load dịch vụ/bảng giá ==========
async function loadServices() {
    if (!supabaseClient) return { error: 'Not initialized', data: [] };

    const { data, error } = await supabaseClient
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

    return error ? { error, data: [] } : { data };
}

// ========== BLOG POSTS: Load bài viết ==========
async function loadBlogPosts(limit = 10) {
    if (!supabaseClient) {
        console.error('Supabase not initialized');
        return { error: 'Supabase not initialized', data: [] };
    }

    const { data, error } = await supabaseClient
        .from('blog_posts')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error loading blog posts:', error);
        return { error, data: [] };
    }

    return { data };
}

// ========== ANALYTICS: Track events ==========
async function trackEvent(eventName, eventData = {}) {
    if (!supabaseClient) return;

    try {
        await supabaseClient
            .from('analytics_events')
            .insert([{
                event_name: eventName,
                event_data: eventData,
                page_url: window.location.href
            }]);
    } catch (err) {
        console.warn('Analytics failed:', err);
    }
}

// Export functions cho sử dụng toàn cục
window.SupabaseAPI = {
    init: initSupabase,
    saveContact,
    loadTestimonials,
    loadServices,
    loadBlogPosts,
    trackEvent
};

// Auto-init khi DOM ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initSupabase, 500);
});

/**
 * Portal Data Module
 * Demo Data & Data Loading Functions
 */

import { supabase } from './supabase.js';

// ================================================
// DEMO PROJECTS DATA
// ================================================

export const DEMO_PROJECTS = [
    {
        id: 'demo-1',
        name: 'Chiến dịch Facebook Ads Q1',
        description: 'Quảng cáo Facebook cho sản phẩm hoa tươi, target khách hàng 25-45 tuổi tại Đồng Tháp',
        type: 'ads',
        status: 'active',
        progress: 75,
        budget: 15000000,
        spent: 11250000,
        start_date: '2026-01-01',
        end_date: '2026-03-31',
        milestones: [
            { name: 'Setup & Strategy', completed: true },
            { name: 'Creative Development', completed: true },
            { name: 'Campaign Launch', completed: true },
            { name: 'Optimization Phase', completed: false },
            { name: 'Final Report', completed: false }
        ]
    },
    {
        id: 'demo-2',
        name: 'SEO Website tháng 1',
        description: 'Tối ưu SEO local cho website, target keywords "hoa tươi sa đéc", "shop hoa đồng tháp"',
        type: 'seo',
        status: 'active',
        progress: 40,
        budget: 5000000,
        spent: 2000000,
        start_date: '2026-01-01',
        end_date: '2026-01-31',
        milestones: [
            { name: 'Technical Audit', completed: true },
            { name: 'On-page Optimization', completed: true },
            { name: 'Content Strategy', completed: false },
            { name: 'Link Building', completed: false },
            { name: 'Monthly Report', completed: false }
        ]
    },
    {
        id: 'demo-3',
        name: 'Thiết kế logo mới',
        description: 'Thiết kế logo và bộ nhận diện thương hiệu cho Sa Đéc Flower Shop',
        type: 'design',
        status: 'completed',
        progress: 100,
        budget: 8000000,
        spent: 8000000,
        start_date: '2025-12-01',
        end_date: '2025-12-20',
        milestones: [
            { name: 'Discovery', completed: true },
            { name: 'Concept Design', completed: true },
            { name: 'Revisions', completed: true },
            { name: 'Final Delivery', completed: true }
        ]
    },
    {
        id: 'demo-4',
        name: 'Quản lý Fanpage tháng 1',
        description: 'Lên lịch và đăng 20 bài/tháng, tương tác với khách hàng, xử lý inbox',
        type: 'social',
        status: 'active',
        progress: 25,
        budget: 3000000,
        spent: 750000,
        start_date: '2026-01-01',
        end_date: '2026-01-31',
        milestones: [
            { name: 'Content Calendar', completed: true },
            { name: 'Week 1 Posts', completed: true },
            { name: 'Week 2-4 Posts', completed: false },
            { name: 'Engagement Report', completed: false }
        ]
    },
    {
        id: 'demo-5',
        name: 'Google Ads - Tết 2026',
        description: 'Chiến dịch Google Ads cho mùa Tết, target "mua hoa tết", "hoa chúc mừng năm mới"',
        type: 'ads',
        status: 'paused',
        progress: 0,
        budget: 20000000,
        spent: 0,
        start_date: '2026-01-15',
        end_date: '2026-02-15',
        milestones: [
            { name: 'Campaign Planning', completed: false },
            { name: 'Keyword Research', completed: false },
            { name: 'Ad Copy Creation', completed: false },
            { name: 'Launch', completed: false }
        ]
    }
];

// ================================================
// DATA LOADING FUNCTIONS
// ================================================

/**
 * Load projects from Supabase or return demo data
 */
export async function loadProjects(filterStatus = 'all') {
    try {
        if (supabase) {
            let query = supabase
                .from('projects')
                .select('*')
                .order('created_at', { ascending: false });

            if (filterStatus !== 'all') {
                query = query.eq('status', filterStatus);
            }

            const { data, error } = await query;
            if (error) throw error;
            if (data && data.length > 0) {
                return data;
            }
        }

        // Fallback to demo data
        return filterStatus === 'all'
            ? DEMO_PROJECTS
            : DEMO_PROJECTS.filter(p => p.status === filterStatus);

    } catch (error) {
        // [DEV] 'Load projects error:', error);
        return filterStatus === 'all' ? DEMO_PROJECTS : [];
    }
}

/**
 * Load invoices from Supabase or return demo data
 */
export async function loadInvoices() {
    try {
        if (supabase) {
            const { data, error } = await supabase
                .from('invoices')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data && data.length > 0) {
                return data;
            }
        }

        // Fallback to demo data
        return (await import('./portal-auth.js')).DEMO_INVOICES;

    } catch (error) {
        // [DEV] 'Load invoices error:', error);
        return [];
    }
}

/**
 * Get project by ID
 */
export async function getProjectById(id) {
    try {
        if (supabase) {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        }

        return DEMO_PROJECTS.find(p => p.id === id);

    } catch (error) {
        // [DEV] 'Get project error:', error);
        return null;
    }
}

/**
 * Get invoice by ID
 */
export async function getInvoiceById(id) {
    try {
        if (supabase) {
            const { data, error } = await supabase
                .from('invoices')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        }

        const invoices = (await import('./portal-auth.js')).DEMO_INVOICES;
        return invoices.find(inv => inv.id === id);

    } catch (error) {
        // [DEV] 'Get invoice error:', error);
        return null;
    }
}

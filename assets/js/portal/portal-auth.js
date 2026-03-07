/**
 * Portal Auth Module
 * Authentication & Demo Mode Management
 */

// ================================================
// DEMO MODE DATA (Used when not authenticated)
// ================================================

export const DEMO_INVOICES = [
    {
        id: 'demo-inv-1',
        invoice_number: 'INV-2026-001',
        client_name: 'Nguyễn Văn A',
        service: 'Facebook Ads',
        amount: 15000000,
        paid: 5000000,
        status: 'partial',
        due_date: '2026-02-15',
        paid_at: null,
        items: [
            { name: 'Quản lý chiến dịch Facebook Ads', quantity: 1, price: 5000000 },
            { name: 'Ngân sách quảng cáo', quantity: 1, price: 10000000 }
        ],
        payment_history: [
            { date: '2026-01-15', amount: 5000000, method: 'transfer', note: 'Thanh toán đợt 1' }
        ]
    },
    {
        id: 'demo-inv-2',
        invoice_number: 'INV-2026-002',
        client_name: 'Trần Thị B',
        service: 'SEO Website',
        amount: 5000000,
        paid: 5000000,
        status: 'paid',
        due_date: '2026-01-31',
        paid_at: '2026-01-25',
        items: [
            { name: 'SEO tổng thể website', quantity: 1, price: 5000000 }
        ],
        payment_history: [
            { date: '2026-01-25', amount: 5000000, method: 'transfer', note: 'Thanh toán đầy đủ' }
        ]
    },
    {
        id: 'demo-inv-3',
        invoice_number: 'INV-2026-003',
        client_name: 'Lê Văn C',
        service: 'Thiết kế Logo',
        amount: 8000000,
        paid: 0,
        status: 'pending',
        due_date: '2026-02-28',
        paid_at: null,
        items: [
            { name: 'Thiết kế logo và bộ nhận diện', quantity: 1, price: 8000000 }
        ],
        payment_history: []
    },
    {
        id: 'demo-inv-4',
        invoice_number: 'INV-2026-004',
        client_name: 'Phạm Thị D',
        service: 'Quản lý Fanpage',
        amount: 3000000,
        paid: 750000,
        status: 'partial',
        due_date: '2026-02-10',
        paid_at: null,
        items: [
            { name: 'Quản lý fanpage tháng 1', quantity: 1, price: 3000000 }
        ],
        payment_history: [
            { date: '2026-01-10', amount: 750000, method: 'cash', note: 'Tạm ứng 25%' }
        ]
    },
    {
        id: 'demo-inv-5',
        invoice_number: 'INV-2026-005',
        client_name: 'Hoàng Văn E',
        service: 'Google Ads',
        amount: 20000000,
        paid: 0,
        status: 'cancelled',
        due_date: '2026-02-15',
        paid_at: null,
        items: [
            { name: 'Quảng cáo Google Ads Tết 2026', quantity: 1, price: 20000000 }
        ],
        payment_history: []
    }
];

// Auth helpers for portal
export function isDemoMode() {
    return localStorage.getItem('isDemoMode') === 'true' ||
           !window.Auth?.State?.isAuthenticated;
}

export function getCurrentUser() {
    if (window.Auth?.State) {
        return {
            id: window.Auth.State.user?.id,
            email: window.Auth.State.user?.email,
            profile: window.Auth.State.profile
        };
    }
    return null;
}

export function requireAuth(redirectUrl) {
    if (!window.Auth?.Guards) {
        console.warn('Auth system not loaded');
        return false;
    }

    if (!window.Auth.State.isAuthenticated && !isDemoMode()) {
        const currentPath = window.location.pathname;
        const redirect = redirectUrl || encodeURIComponent(currentPath);
        window.location.href = `/portal/login.html?redirect=${redirect}`;
        return false;
    }
    return true;
}

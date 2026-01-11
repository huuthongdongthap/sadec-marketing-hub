// ================================================
// MEKONG AGENCY - ADMIN CLIENT
// Live Data Binding & UI Interactions for Admin Panel
// ================================================

import { auth, leads, campaigns, clients, activities, utils } from './supabase.js';

// ================================================
// DEMO MODE DATA
// ================================================

const DEMO_CAMPAIGNS = [
    {
        id: 'camp-1',
        name: 'Chiến dịch Q1 2026',
        client: { company_name: 'Sa Đéc Flower Shop' },
        platform: 'facebook',
        type: 'conversions',
        status: 'active',
        budget: 15000000,
        spent: 11250000,
        start_date: '2026-01-01',
        end_date: '2026-03-31',
        metrics: { impressions: 125000, clicks: 4500, leads: 234, conversions: 89, roi: 12.5 }
    },
    {
        id: 'camp-2',
        name: 'Google Ads - Search',
        client: { company_name: 'Mekong Travel' },
        platform: 'google',
        type: 'leads',
        status: 'active',
        budget: 20000000,
        spent: 14000000,
        start_date: '2026-01-01',
        end_date: '2026-02-28',
        metrics: { impressions: 89000, clicks: 3200, leads: 156, conversions: 67, roi: 8.2 }
    },
    {
        id: 'camp-3',
        name: 'Zalo OA Marketing',
        client: { company_name: 'Cần Thơ Foods' },
        platform: 'zalo',
        type: 'engagement',
        status: 'active',
        budget: 8000000,
        spent: 5440000,
        start_date: '2026-01-01',
        end_date: '2026-01-31',
        metrics: { impressions: 45000, clicks: 2100, leads: 89, conversions: 34, roi: 6.8 }
    },
    {
        id: 'camp-4',
        name: 'TikTok Awareness',
        client: { company_name: 'Long Xuyên Boutique' },
        platform: 'tiktok',
        type: 'awareness',
        status: 'active',
        budget: 12000000,
        spent: 6500000,
        start_date: '2026-01-05',
        end_date: '2026-02-05',
        metrics: { impressions: 230000, clicks: 8900, leads: 67, conversions: 23, roi: 5.4 }
    },
    {
        id: 'camp-5',
        name: 'Tết 2026 - Combo hoa',
        client: { company_name: 'Sa Đéc Flower Shop' },
        platform: 'facebook',
        type: 'conversions',
        status: 'draft',
        budget: 25000000,
        spent: 0,
        start_date: '2026-01-15',
        end_date: '2026-02-15',
        metrics: { impressions: 0, clicks: 0, leads: 0, conversions: 0, roi: 0 }
    },
    {
        id: 'camp-6',
        name: 'Google Ads - Retargeting',
        client: { company_name: 'Khách sạn Riverside' },
        platform: 'google',
        type: 'conversions',
        status: 'completed',
        budget: 10000000,
        spent: 10000000,
        start_date: '2025-12-01',
        end_date: '2025-12-31',
        metrics: { impressions: 67000, clicks: 2890, leads: 123, conversions: 56, roi: 9.1 }
    }
];

const DEMO_LEADS = [
    {
        id: 'lead-1',
        name: 'Trần Thanh Lan',
        company: 'Cửa hàng hoa Hương Sen',
        email: 'lan@huongsen.vn',
        phone: '0909 123 456',
        position: 'Chủ cửa hàng',
        source: 'facebook',
        status: 'new',
        temperature: 'hot',
        score: 85,
        notes: 'Quan tâm đến quảng cáo Facebook cho mùa Tết',
        created_at: '2026-01-05T10:30:00Z',
        last_contacted_at: null
    },
    {
        id: 'lead-2',
        name: 'Nguyễn Văn Minh',
        company: 'Nhà hàng Mekong',
        email: 'minh@mekongrest.vn',
        phone: '0918 765 432',
        position: 'Quản lý',
        source: 'website',
        status: 'contacted',
        temperature: 'warm',
        score: 65,
        notes: 'Đã gọi điện, hẹn gặp tuần sau',
        created_at: '2026-01-03T14:00:00Z',
        last_contacted_at: '2026-01-05T09:00:00Z'
    },
    {
        id: 'lead-3',
        name: 'Phạm Hoàng',
        company: 'Gym Fitness Pro',
        email: 'hoang@fitnesspro.vn',
        phone: '0977 111 222',
        position: 'Giám đốc',
        source: 'zalo',
        status: 'new',
        temperature: 'cold',
        score: 35,
        notes: 'Chưa rõ ngân sách',
        created_at: '2026-01-04T16:45:00Z',
        last_contacted_at: null
    },
    {
        id: 'lead-4',
        name: 'Lê Thị Hoa',
        company: 'Spa & Beauty Center',
        email: 'hoa@spacenter.vn',
        phone: '0933 444 555',
        position: 'Chủ spa',
        source: 'referral',
        status: 'contacted',
        temperature: 'hot',
        score: 90,
        notes: 'Được giới thiệu từ Sa Đéc Flower, rất quan tâm',
        created_at: '2026-01-02T11:00:00Z',
        last_contacted_at: '2026-01-05T14:30:00Z'
    },
    {
        id: 'lead-5',
        name: 'Võ Minh Tuấn',
        company: 'Tiệm bánh Hạnh Phúc',
        email: 'tuan@hanhphuc.vn',
        phone: '0966 777 888',
        position: 'Chủ tiệm',
        source: 'facebook',
        status: 'contacted',
        temperature: 'warm',
        score: 70,
        notes: 'Muốn chạy quảng cáo cho mùa Valentine',
        created_at: '2026-01-01T09:15:00Z',
        last_contacted_at: '2026-01-04T10:00:00Z'
    },
    {
        id: 'lead-6',
        name: 'Đặng Văn Long',
        company: 'Khách sạn Riverside',
        email: 'long@riverside.vn',
        phone: '0988 999 000',
        position: 'Marketing Manager',
        source: 'google',
        status: 'qualified',
        temperature: 'hot',
        score: 95,
        notes: 'Đã gửi báo giá 50M, chờ phản hồi',
        created_at: '2025-12-28T08:00:00Z',
        last_contacted_at: '2026-01-05T16:00:00Z'
    },
    {
        id: 'lead-7',
        name: 'Huỳnh Thanh Mai',
        company: 'Thời trang XYZ',
        email: 'mai@xyz.vn',
        phone: '0911 222 333',
        position: 'Owner',
        source: 'website',
        status: 'qualified',
        temperature: 'warm',
        score: 75,
        notes: 'Báo giá 20M cho chiến dịch 3 tháng',
        created_at: '2025-12-25T13:30:00Z',
        last_contacted_at: '2026-01-03T11:00:00Z'
    },
    {
        id: 'lead-8',
        name: 'Trương Công Danh',
        company: 'Công ty TNHH ABC',
        email: 'danh@abc.vn',
        phone: '0922 333 444',
        position: 'CEO',
        source: 'referral',
        status: 'won',
        temperature: 'hot',
        score: 100,
        notes: 'Đã ký hợp đồng 100M/năm',
        created_at: '2025-12-20T10:00:00Z',
        last_contacted_at: '2026-01-02T09:00:00Z'
    }
];

// ================================================
// TOAST NOTIFICATION SYSTEM
// ================================================

class ToastManager {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        if (!document.getElementById('toast-container')) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.style.cssText = `
                position: fixed;
                bottom: 24px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 12px;
            `;
            document.body.appendChild(this.container);
        } else {
            this.container = document.getElementById('toast-container');
        }
    }

    show(message, type = 'info', duration = 4000) {
        const toast = document.createElement('div');
        const colors = {
            success: { bg: '#D4EDDA', color: '#155724', icon: 'check_circle' },
            error: { bg: '#F8D7DA', color: '#721C24', icon: 'error' },
            warning: { bg: '#FFF3CD', color: '#856404', icon: 'warning' },
            info: { bg: '#CCE5FF', color: '#004085', icon: 'info' }
        };
        const style = colors[type] || colors.info;

        toast.innerHTML = `
            <span class="material-symbols-outlined" style="font-size: 20px;">${style.icon}</span>
            <span>${message}</span>
        `;
        toast.style.cssText = `
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px 24px;
            background: ${style.bg};
            color: ${style.color};
            border-radius: 8px;
            font-family: 'Google Sans', sans-serif;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideUp 0.3s ease-out;
        `;

        this.container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideDown 0.3s ease-in';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
}

// Add animation styles
const toastStyles = document.createElement('style');
toastStyles.textContent = `
    @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideDown {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(20px); }
    }
`;
document.head.appendChild(toastStyles);

const toast = new ToastManager();

// ================================================
// MODAL SYSTEM
// ================================================

class ModalManager {
    constructor() {
        this.overlay = null;
        this.init();
    }

    init() {
        if (!document.getElementById('modal-overlay')) {
            this.overlay = document.createElement('div');
            this.overlay.id = 'modal-overlay';
            this.overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                z-index: 9998;
                display: none;
                justify-content: center;
                align-items: center;
                padding: 24px;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            this.overlay.addEventListener('click', (e) => {
                if (e.target === this.overlay) this.close();
            });
            document.body.appendChild(this.overlay);
        } else {
            this.overlay = document.getElementById('modal-overlay');
        }
    }

    open(content) {
        const modal = document.createElement('div');
        modal.className = 'modal-content';
        modal.style.cssText = `
            background: var(--md-sys-color-surface, #fff);
            border-radius: 28px;
            max-width: 640px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            transform: scale(0.9);
            transition: transform 0.3s ease;
        `;
        modal.innerHTML = content;

        this.overlay.innerHTML = '';
        this.overlay.appendChild(modal);
        this.overlay.style.display = 'flex';

        requestAnimationFrame(() => {
            this.overlay.style.opacity = '1';
            modal.style.transform = 'scale(1)';
        });

        modal.querySelector('.modal-close')?.addEventListener('click', () => this.close());
    }

    close() {
        if (!this.overlay) return;
        const modal = this.overlay.querySelector('.modal-content');
        this.overlay.style.opacity = '0';
        if (modal) modal.style.transform = 'scale(0.9)';
        setTimeout(() => {
            this.overlay.style.display = 'none';
            this.overlay.innerHTML = '';
        }, 300);
    }
}

const modal = new ModalManager();

// ================================================
// UTILITY FUNCTIONS
// ================================================

function formatCurrency(amount) {
    if (!amount && amount !== 0) return '--';
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
}

function formatNumber(num) {
    if (!num && num !== 0) return '--';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

function formatDate(dateStr, format = 'short') {
    if (!dateStr) return '--';
    const date = new Date(dateStr);
    if (format === 'short') {
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    }
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function timeAgo(dateStr) {
    if (!dateStr) return 'Chưa liên hệ';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
    return formatDate(dateStr, 'full');
}

// ================================================
// CAMPAIGN DETAIL MODAL
// ================================================

function showCampaignDetail(campaign) {
    const platformIcons = {
        facebook: { icon: 'thumb_up', color: '#1877F2', bg: '#E3F2FD' },
        google: { icon: 'search', color: '#34A853', bg: '#E8F5E9' },
        zalo: { icon: 'chat', color: '#0068FF', bg: '#E3F2FD' },
        tiktok: { icon: 'videocam', color: '#000', bg: '#FCE4EC' }
    };
    const platform = platformIcons[campaign.platform] || platformIcons.facebook;

    const statusLabels = {
        draft: { text: 'Nháp', class: 'draft' },
        pending: { text: 'Chờ duyệt', class: 'paused' },
        active: { text: 'Đang chạy', class: 'active' },
        paused: { text: 'Tạm dừng', class: 'paused' },
        completed: { text: 'Hoàn thành', class: 'completed' }
    };
    const status = statusLabels[campaign.status] || statusLabels.draft;

    const spentPercent = campaign.budget > 0 ? Math.round((campaign.spent / campaign.budget) * 100) : 0;

    modal.open(`
        <div style="padding: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
                <div style="display: flex; gap: 16px; align-items: center;">
                    <div style="width: 56px; height: 56px; border-radius: 12px; background: ${platform.bg}; color: ${platform.color}; display: flex; align-items: center; justify-content: center;">
                        <span class="material-symbols-outlined">${platform.icon}</span>
                    </div>
                    <div>
                        <h2 style="margin: 0; font-size: 24px;">${campaign.name}</h2>
                        <p style="color: #666; margin: 4px 0 0 0;">${campaign.client?.company_name || 'Client'}</p>
                    </div>
                </div>
                <button class="modal-close" style="background: none; border: none; cursor: pointer; padding: 8px;">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>

            <div style="display: flex; gap: 12px; margin-bottom: 24px;">
                <span class="status-badge ${status.class}">${status.text}</span>
                <span style="padding: 4px 12px; background: #f5f5f5; border-radius: 999px; font-size: 12px;">
                    ${campaign.platform?.charAt(0).toUpperCase() + campaign.platform?.slice(1)}
                </span>
                <span style="padding: 4px 12px; background: #f5f5f5; border-radius: 999px; font-size: 12px;">
                    ${formatDate(campaign.start_date)} - ${formatDate(campaign.end_date)}
                </span>
            </div>

            <!-- Budget Progress -->
            <div style="background: #f5f5f5; padding: 16px; border-radius: 12px; margin-bottom: 24px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Ngân sách đã sử dụng</span>
                    <span style="font-weight: 600;">${formatCurrency(campaign.spent)} / ${formatCurrency(campaign.budget)}</span>
                </div>
                <div style="height: 8px; background: #ddd; border-radius: 4px; overflow: hidden;">
                    <div style="height: 100%; width: ${spentPercent}%; background: linear-gradient(90deg, #006A60, #00897B);"></div>
                </div>
                <div style="text-align: right; font-size: 12px; color: #666; margin-top: 4px;">${spentPercent}%</div>
            </div>

            <!-- Metrics Grid -->
            <h3 style="font-size: 16px; margin-bottom: 16px;">📊 Hiệu suất</h3>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;">
                <div style="text-align: center; padding: 16px; background: #f5f5f5; border-radius: 12px;">
                    <div style="font-size: 24px; font-weight: 700;">${formatNumber(campaign.metrics?.impressions)}</div>
                    <div style="font-size: 12px; color: #666;">Impressions</div>
                </div>
                <div style="text-align: center; padding: 16px; background: #f5f5f5; border-radius: 12px;">
                    <div style="font-size: 24px; font-weight: 700;">${formatNumber(campaign.metrics?.clicks)}</div>
                    <div style="font-size: 12px; color: #666;">Clicks</div>
                </div>
                <div style="text-align: center; padding: 16px; background: #f5f5f5; border-radius: 12px;">
                    <div style="font-size: 24px; font-weight: 700;">${campaign.metrics?.leads || 0}</div>
                    <div style="font-size: 12px; color: #666;">Leads</div>
                </div>
                <div style="text-align: center; padding: 16px; background: #f5f5f5; border-radius: 12px;">
                    <div style="font-size: 24px; font-weight: 700;">${campaign.metrics?.conversions || 0}</div>
                    <div style="font-size: 12px; color: #666;">Conversions</div>
                </div>
                <div style="text-align: center; padding: 16px; background: #f5f5f5; border-radius: 12px;">
                    <div style="font-size: 24px; font-weight: 700;">${campaign.metrics?.clicks && campaign.metrics?.impressions ? ((campaign.metrics.clicks / campaign.metrics.impressions) * 100).toFixed(2) : 0}%</div>
                    <div style="font-size: 12px; color: #666;">CTR</div>
                </div>
                <div style="text-align: center; padding: 16px; background: ${campaign.metrics?.roi >= 5 ? '#D4EDDA' : '#FFF3CD'}; border-radius: 12px;">
                    <div style="font-size: 24px; font-weight: 700; color: ${campaign.metrics?.roi >= 5 ? '#155724' : '#856404'};">${campaign.metrics?.roi || 0}x</div>
                    <div style="font-size: 12px; color: #666;">ROI</div>
                </div>
            </div>

            <!-- Actions -->
            <div style="display: flex; gap: 12px;">
                <button class="btn btn-outlined" style="flex: 1; padding: 12px; border: 2px solid #006A60; background: transparent; color: #006A60; border-radius: 12px; cursor: pointer; font-size: 14px; font-weight: 500;">
                    <span class="material-symbols-outlined" style="font-size: 18px; vertical-align: middle;">edit</span>
                    Chỉnh sửa
                </button>
                <button class="btn btn-filled" style="flex: 1; padding: 12px; background: #006A60; color: white; border: none; border-radius: 12px; cursor: pointer; font-size: 14px; font-weight: 500;">
                    <span class="material-symbols-outlined" style="font-size: 18px; vertical-align: middle;">download</span>
                    Báo cáo
                </button>
            </div>
        </div>
    `);
}

// ================================================
// LEAD DETAIL MODAL
// ================================================

function showLeadDetail(lead) {
    const tempLabels = {
        hot: { text: 'Hot', bg: '#FFEBEE', color: '#C62828' },
        warm: { text: 'Warm', bg: '#FFF3E0', color: '#EF6C00' },
        cold: { text: 'Cold', bg: '#E3F2FD', color: '#1565C0' }
    };
    const temp = tempLabels[lead.temperature] || tempLabels.cold;

    const statusLabels = {
        new: 'Mới',
        contacted: 'Đang liên hệ',
        qualified: 'Đã gửi báo giá',
        proposal: 'Chờ duyệt',
        won: 'Chốt đơn',
        lost: 'Thất bại'
    };

    const sourceIcons = {
        facebook: { icon: 'thumb_up', text: 'Facebook' },
        google: { icon: 'search', text: 'Google' },
        zalo: { icon: 'chat', text: 'Zalo' },
        website: { icon: 'language', text: 'Website' },
        referral: { icon: 'group', text: 'Giới thiệu' }
    };
    const source = sourceIcons[lead.source] || sourceIcons.website;

    modal.open(`
        <div style="padding: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
                <div style="display: flex; gap: 16px; align-items: center;">
                    <div style="width: 64px; height: 64px; border-radius: 50%; background: var(--md-sys-color-primary-container, #E0F2F1); color: var(--md-sys-color-primary, #006A60); display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 600;">
                        ${lead.name?.split(' ').map(n => n[0]).join('').slice(-2).toUpperCase()}
                    </div>
                    <div>
                        <h2 style="margin: 0; font-size: 24px;">${lead.name}</h2>
                        <p style="color: #666; margin: 4px 0 0 0;">${lead.company}</p>
                        <p style="color: #999; margin: 4px 0 0 0; font-size: 12px;">${lead.position || ''}</p>
                    </div>
                </div>
                <button class="modal-close" style="background: none; border: none; cursor: pointer; padding: 8px;">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>

            <!-- Tags -->
            <div style="display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap;">
                <span style="padding: 4px 12px; background: ${temp.bg}; color: ${temp.color}; border-radius: 999px; font-size: 12px; font-weight: 500;">
                    🔥 ${temp.text}
                </span>
                <span style="padding: 4px 12px; background: #f5f5f5; border-radius: 999px; font-size: 12px;">
                    ${statusLabels[lead.status] || lead.status}
                </span>
                <span style="padding: 4px 12px; background: #f5f5f5; border-radius: 999px; font-size: 12px;">
                    <span class="material-symbols-outlined" style="font-size: 14px; vertical-align: middle;">${source.icon}</span>
                    ${source.text}
                </span>
                <span style="padding: 4px 12px; background: #E8F5E9; color: #2E7D32; border-radius: 999px; font-size: 12px; font-weight: 500;">
                    Score: ${lead.score}/100
                </span>
            </div>

            <!-- Contact Info -->
            <div style="background: #f5f5f5; padding: 16px; border-radius: 12px; margin-bottom: 24px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <span class="material-symbols-outlined" style="color: #666;">phone</span>
                    <a href="tel:${lead.phone}" style="color: #006A60; text-decoration: none;">${lead.phone}</a>
                </div>
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <span class="material-symbols-outlined" style="color: #666;">mail</span>
                    <a href="mailto:${lead.email}" style="color: #006A60; text-decoration: none;">${lead.email}</a>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span class="material-symbols-outlined" style="color: #666;">schedule</span>
                    <span style="color: #666;">Liên hệ lần cuối: ${timeAgo(lead.last_contacted_at)}</span>
                </div>
            </div>

            <!-- Notes -->
            <div style="margin-bottom: 24px;">
                <h3 style="font-size: 14px; color: #666; margin-bottom: 8px;">📝 Ghi chú</h3>
                <p style="background: #FFFDE7; padding: 12px; border-radius: 8px; margin: 0; font-size: 14px;">
                    ${lead.notes || 'Không có ghi chú'}
                </p>
            </div>

            <!-- Timeline -->
            <div style="margin-bottom: 24px;">
                <h3 style="font-size: 14px; color: #666; margin-bottom: 12px;">📅 Lịch sử</h3>
                <div style="border-left: 2px solid #E0E0E0; padding-left: 16px;">
                    <div style="position: relative; padding-bottom: 16px;">
                        <div style="position: absolute; left: -22px; top: 0; width: 12px; height: 12px; background: #006A60; border-radius: 50%;"></div>
                        <div style="font-size: 12px; color: #666;">${timeAgo(lead.created_at)}</div>
                        <div style="font-size: 14px;">Lead được tạo từ ${source.text}</div>
                    </div>
                    ${lead.last_contacted_at ? `
                    <div style="position: relative;">
                        <div style="position: absolute; left: -22px; top: 0; width: 12px; height: 12px; background: #4CAF50; border-radius: 50%;"></div>
                        <div style="font-size: 12px; color: #666;">${timeAgo(lead.last_contacted_at)}</div>
                        <div style="font-size: 14px;">Đã liên hệ</div>
                    </div>
                    ` : ''}
                </div>
            </div>

            <!-- Actions -->
            <div style="display: flex; gap: 12px;">
                <button onclick="window.open('tel:${lead.phone}')" class="btn btn-outlined" style="flex: 1; padding: 12px; border: 2px solid #006A60; background: transparent; color: #006A60; border-radius: 12px; cursor: pointer; font-size: 14px; font-weight: 500; display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <span class="material-symbols-outlined" style="font-size: 18px;">call</span>
                    Gọi
                </button>
                <button onclick="window.open('mailto:${lead.email}')" class="btn btn-outlined" style="flex: 1; padding: 12px; border: 2px solid #006A60; background: transparent; color: #006A60; border-radius: 12px; cursor: pointer; font-size: 14px; font-weight: 500; display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <span class="material-symbols-outlined" style="font-size: 18px;">mail</span>
                    Email
                </button>
                <button class="btn btn-filled" style="flex: 1; padding: 12px; background: #006A60; color: white; border: none; border-radius: 12px; cursor: pointer; font-size: 14px; font-weight: 500; display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <span class="material-symbols-outlined" style="font-size: 18px;">edit</span>
                    Sửa
                </button>
            </div>
        </div>
    `);
}

// ================================================
// DATA LOADING FUNCTIONS
// ================================================

async function loadCampaigns(tableBody) {
    try {
        const user = await auth.getUser();
        let campaignData;

        if (!user) {
            // Demo mode
            campaignData = DEMO_CAMPAIGNS;
            toast.show('Đang xem ở chế độ Demo', 'info');
        } else {
            // Live mode
            const { data, error } = await campaigns.getAll();
            if (error) throw error;
            campaignData = data || [];
        }

        renderCampaigns(tableBody, campaignData);
        updateCampaignStats(campaignData);
    } catch (error) {
        console.error('Error loading campaigns:', error);
        toast.show('Không thể tải danh sách chiến dịch', 'error');
    }
}

async function loadLeads(gridElement, pipelineElement) {
    try {
        const user = await auth.getUser();
        let leadData;

        if (!user) {
            // Demo mode
            leadData = DEMO_LEADS;
            toast.show('Đang xem ở chế độ Demo', 'info');
        } else {
            // Live mode
            const { data, error } = await leads.getAll();
            if (error) throw error;
            leadData = data || [];
        }

        if (gridElement) renderLeadCards(gridElement, leadData);
        if (pipelineElement) renderPipeline(pipelineElement, leadData);
    } catch (error) {
        console.error('Error loading leads:', error);
        toast.show('Không thể tải danh sách leads', 'error');
    }
}

// ================================================
// RENDER FUNCTIONS
// ================================================

function renderCampaigns(tableBody, campaignList) {
    if (!tableBody) return;

    const platformIcons = {
        facebook: { icon: 'thumb_up', class: 'facebook' },
        google: { icon: 'search', class: 'google' },
        zalo: { icon: 'chat', class: 'zalo' },
        tiktok: { icon: 'videocam', class: 'tiktok' }
    };

    const statusLabels = {
        draft: { text: 'Nháp', class: 'draft' },
        active: { text: 'Đang chạy', class: 'active' },
        paused: { text: 'Tạm dừng', class: 'paused' },
        completed: { text: 'Hoàn thành', class: 'completed' }
    };

    tableBody.innerHTML = campaignList.map(campaign => {
        const platform = platformIcons[campaign.platform] || platformIcons.facebook;
        const status = statusLabels[campaign.status] || statusLabels.draft;
        const roiClass = campaign.metrics?.roi >= 8 ? 'excellent' : campaign.metrics?.roi >= 5 ? 'good' : 'average';

        return `
            <tr data-campaign-id="${campaign.id}">
                <td>
                    <div class="campaign-name-cell">
                        <div class="campaign-icon ${platform.class}">
                            <span class="material-symbols-outlined">${platform.icon}</span>
                        </div>
                        <div>
                            <div class="campaign-title">${campaign.name}</div>
                            <div class="campaign-client">${campaign.client?.company_name || '--'}</div>
                        </div>
                    </div>
                </td>
                <td>${campaign.platform?.charAt(0).toUpperCase() + campaign.platform?.slice(1)}</td>
                <td>${formatDate(campaign.start_date)} - ${formatDate(campaign.end_date)}</td>
                <td>${formatCurrency(campaign.budget)}</td>
                <td><span class="status-badge ${status.class}">${status.text}</span></td>
                <td class="metric-cell">
                    <div class="metric-value">${campaign.metrics?.leads || '--'}</div>
                </td>
                <td class="metric-cell">
                    <span class="roi-badge ${roiClass}">${campaign.metrics?.roi ? campaign.metrics.roi + 'x' : '--'}</span>
                </td>
                <td>
                    <button class="action-btn view-btn" title="Xem chi tiết">
                        <span class="material-symbols-outlined">visibility</span>
                    </button>
                    <button class="action-btn edit-btn" title="Chỉnh sửa">
                        <span class="material-symbols-outlined">edit</span>
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    // Bind click events
    tableBody.querySelectorAll('tr').forEach(row => {
        const campaignId = row.dataset.campaignId;
        const campaign = campaignList.find(c => c.id === campaignId);

        row.querySelector('.view-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            if (campaign) showCampaignDetail(campaign);
        });

        row.addEventListener('click', () => {
            if (campaign) showCampaignDetail(campaign);
        });
    });
}

function renderLeadCards(container, leadList) {
    if (!container) return;

    const tempLabels = {
        hot: { text: 'Hot', class: 'hot' },
        warm: { text: 'Warm', class: 'warm' },
        cold: { text: 'Cold', class: 'cold' }
    };

    const sourceIcons = {
        facebook: { icon: 'thumb_up' },
        google: { icon: 'search' },
        zalo: { icon: 'chat' },
        website: { icon: 'language' },
        referral: { icon: 'group' }
    };

    const avatarColors = [
        'var(--md-sys-color-primary-container)',
        'var(--md-sys-color-secondary-container)',
        'var(--md-sys-color-tertiary-container)'
    ];

    container.innerHTML = leadList.map((lead, idx) => {
        const temp = tempLabels[lead.temperature] || tempLabels.cold;
        const source = sourceIcons[lead.source] || sourceIcons.website;
        const avatarBg = avatarColors[idx % 3];

        return `
            <div class="card card-elevated lead-card" data-lead-id="${lead.id}">
                <div class="lead-header">
                    <div class="lead-avatar" style="background: ${avatarBg}; color: var(--md-sys-color-primary);">
                        ${lead.name?.split(' ').map(n => n[0]).join('').slice(-2).toUpperCase()}
                    </div>
                    <div class="lead-info">
                        <div class="lead-name">${lead.name}</div>
                        <div class="lead-company">${lead.company}</div>
                    </div>
                    <span class="lead-score-badge ${temp.class}">${temp.text}</span>
                </div>
                <div class="lead-details">
                    <div class="lead-detail">
                        <span class="material-symbols-outlined">phone</span>
                        ${lead.phone}
                    </div>
                    <div class="lead-detail">
                        <span class="material-symbols-outlined">mail</span>
                        ${lead.email}
                    </div>
                </div>
                <div class="lead-source">
                    <span class="material-symbols-outlined" style="font-size: 14px;">${source.icon}</span>
                    ${lead.source?.charAt(0).toUpperCase() + lead.source?.slice(1)}
                </div>
                <div class="lead-actions">
                    <button class="lead-action-btn call-btn">
                        <span class="material-symbols-outlined">call</span>
                        Gọi
                    </button>
                    <button class="lead-action-btn email-btn">
                        <span class="material-symbols-outlined">mail</span>
                        Email
                    </button>
                    <button class="lead-action-btn view-btn">
                        <span class="material-symbols-outlined">visibility</span>
                        Xem
                    </button>
                </div>
            </div>
        `;
    }).join('');

    // Bind click events
    container.querySelectorAll('.lead-card').forEach(card => {
        const leadId = card.dataset.leadId;
        const lead = leadList.find(l => l.id === leadId);

        card.querySelector('.view-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            if (lead) showLeadDetail(lead);
        });

        card.querySelector('.call-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            if (lead?.phone) window.open(`tel:${lead.phone}`);
        });

        card.querySelector('.email-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            if (lead?.email) window.open(`mailto:${lead.email}`);
        });

        card.addEventListener('click', () => {
            if (lead) showLeadDetail(lead);
        });
    });
}

function renderPipeline(container, leadList) {
    if (!container) return;

    const stages = {
        new: { title: 'Mới', leads: [] },
        contacted: { title: 'Đang liên hệ', leads: [] },
        qualified: { title: 'Đã gửi báo giá', leads: [] },
        won: { title: 'Chốt đơn', leads: [] }
    };

    // Categorize leads
    leadList.forEach(lead => {
        const stage = lead.status === 'proposal' ? 'qualified' : lead.status;
        if (stages[stage]) {
            stages[stage].leads.push(lead);
        } else if (stages.new) {
            stages.new.leads.push(lead);
        }
    });

    // Update pipeline counts
    Object.keys(stages).forEach(stageKey => {
        const column = container.querySelector(`[data-stage="${stageKey}"]`);
        if (!column) return;

        const countEl = column.querySelector('.pipeline-count');
        const leadsContainer = column.querySelector('.pipeline-leads');

        if (countEl) countEl.textContent = stages[stageKey].leads.length;

        if (leadsContainer) {
            leadsContainer.innerHTML = stages[stageKey].leads.map(lead => `
                <div class="pipeline-lead" data-lead-id="${lead.id}">
                    <div class="pipeline-lead-name">${lead.name}</div>
                    <div class="pipeline-lead-company">${lead.company}</div>
                </div>
            `).join('');

            // Bind click events
            leadsContainer.querySelectorAll('.pipeline-lead').forEach(el => {
                const leadId = el.dataset.leadId;
                const lead = leadList.find(l => l.id === leadId);
                el.addEventListener('click', () => {
                    if (lead) showLeadDetail(lead);
                });
                el.style.cursor = 'pointer';
            });
        }
    });
}

function updateCampaignStats(campaignList) {
    const activeCampaigns = campaignList.filter(c => c.status === 'active');
    const totalSpent = activeCampaigns.reduce((sum, c) => sum + (c.spent || 0), 0);
    const avgRoi = activeCampaigns.length > 0
        ? (activeCampaigns.reduce((sum, c) => sum + (c.metrics?.roi || 0), 0) / activeCampaigns.length).toFixed(1)
        : 0;
    const totalRevenue = activeCampaigns.reduce((sum, c) => sum + ((c.metrics?.roi || 0) * (c.spent || 0)), 0);

    // Update stat cards if they exist
    const statValues = document.querySelectorAll('.mini-stat-value');
    if (statValues.length >= 4) {
        statValues[0].textContent = activeCampaigns.length;
        statValues[1].textContent = avgRoi + 'x';
        statValues[2].textContent = formatNumber(totalSpent);
        statValues[3].textContent = formatNumber(totalRevenue);
    }
}

// ================================================
// COUNT-UP ANIMATION
// ================================================

function animateCountUp(element, targetValue, duration = 1500, suffix = '') {
    const startValue = 0;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOut);

        if (typeof targetValue === 'number' && targetValue >= 1000000) {
            element.textContent = (currentValue / 1000000).toFixed(1) + 'M' + suffix;
        } else if (typeof targetValue === 'number' && targetValue >= 1000) {
            element.textContent = (currentValue / 1000).toFixed(1) + 'K' + suffix;
        } else {
            element.textContent = currentValue + suffix;
        }

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = formatNumber(targetValue) + suffix;
        }
    }

    requestAnimationFrame(update);
}

// ================================================
// SPARKLINE CHART
// ================================================

function createSparkline(data, trend = 'up') {
    const maxVal = Math.max(...data);
    const bars = data.map(val => {
        const height = (val / maxVal) * 100;
        return `<div class="sparkline-bar" style="height: ${height}%;"></div>`;
    }).join('');

    const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
    const trendClass = trend === 'up' ? 'up' : trend === 'down' ? 'down' : '';

    return `
        <div class="sparkline-container">
            <div class="sparkline">${bars}</div>
            <span class="sparkline-trend ${trendClass}">${trendIcon}</span>
        </div>
    `;
}

// ================================================
// SEARCH FILTER WITH DEBOUNCE
// ================================================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function setupSearchFilter(inputElement, items, renderFn, searchFields = ['name']) {
    if (!inputElement) return;

    const filterItems = debounce((query) => {
        const normalizedQuery = query.toLowerCase().trim();

        if (!normalizedQuery) {
            renderFn(items);
            return;
        }

        const filtered = items.filter(item =>
            searchFields.some(field => {
                const value = field.split('.').reduce((obj, key) => obj?.[key], item);
                return value?.toString().toLowerCase().includes(normalizedQuery);
            })
        );

        renderFn(filtered);
        toast.show(`Tìm thấy ${filtered.length} kết quả`, 'info', 2000);
    }, 300);

    inputElement.addEventListener('input', (e) => filterItems(e.target.value));
}

// ================================================
// KEYBOARD SHORTCUTS
// ================================================

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // ESC to close modal
        if (e.key === 'Escape') {
            modal.close();
        }

        // Ctrl/Cmd + K to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.querySelector('.search-box input');
            if (searchInput) {
                searchInput.focus();
                toast.show('Nhấn Esc để đóng modal • Ctrl+K để tìm kiếm', 'info', 2000);
            }
        }

        // Ctrl/Cmd + E to export (placeholder)
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            toast.show('Xuất CSV đang phát triển...', 'warning');
        }
    });
}

// ================================================
// EXPORT TO CSV
// ================================================

function exportToCSV(data, filename = 'export.csv') {
    if (!data || data.length === 0) {
        toast.show('Không có dữ liệu để xuất', 'warning');
        return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row =>
            headers.map(header => {
                let cell = row[header];
                if (typeof cell === 'object') cell = JSON.stringify(cell);
                if (typeof cell === 'string' && cell.includes(',')) cell = `"${cell}"`;
                return cell ?? '';
            }).join(',')
        )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();

    toast.show(`Đã xuất ${filename}`, 'success');
}

// ================================================
// AUTO-INITIALIZATION (ENHANCED)
// ================================================

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    // Setup keyboard shortcuts
    setupKeyboardShortcuts();

    if (path.includes('campaigns.html')) {
        const tableBody = document.querySelector('.campaigns-table tbody');
        if (tableBody) {
            loadCampaigns(tableBody);

            // Setup search
            const searchInput = document.querySelector('.search-box input');
            if (searchInput) {
                searchInput.placeholder = 'Tìm kiếm... (Ctrl+K)';
            }
        }

        // Animate stats on load
        setTimeout(() => {
            const statValues = document.querySelectorAll('.mini-stat-value');
            if (statValues.length >= 4) {
                // Values will be animated after data loads
            }
        }, 500);
    }

    if (path.includes('leads.html')) {
        const leadsGrid = document.querySelector('.leads-grid');
        const pipelineView = document.querySelector('.pipeline-view');
        loadLeads(leadsGrid, pipelineView);

        // Setup search
        const searchInput = document.querySelector('.search-box input');
        if (searchInput) {
            searchInput.placeholder = 'Tìm kiếm leads... (Ctrl+K)';
        }
    }

    // Show keyboard shortcuts hint
    setTimeout(() => {
        toast.show('💡 Mẹo: Nhấn Esc để đóng modal, Ctrl+K để tìm kiếm', 'info', 3000);
    }, 2000);
});

// ================================================
// EXPORTS
// ================================================

export {
    toast,
    modal,
    showCampaignDetail,
    showLeadDetail,
    loadCampaigns,
    loadLeads,
    formatCurrency,
    formatNumber,
    formatDate,
    animateCountUp,
    createSparkline,
    setupSearchFilter,
    exportToCSV,
    DEMO_CAMPAIGNS,
    DEMO_LEADS
};

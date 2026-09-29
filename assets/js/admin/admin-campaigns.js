/**
 * Admin Campaigns Module
 * Campaign Display, Detail & Management
 */

import { DEMO_CAMPAIGNS, getPlatformIcon, getPlatformLabel, getCampaignStatusLabel } from './admin-data.js';
import { formatCurrency, formatNumber, formatDate, ModalManager, ToastManager } from './admin-utils.js';

// Mock auth and campaigns for now (will be imported from supabase.js)
let auth = null;
let campaigns = null;

// Set auth and campaigns from window if available
if (typeof window !== 'undefined') {
    auth = window.AdminAuth || { getUser: async () => null };
    campaigns = window.AdminCampaigns || { getAll: async () => ({ data: [], error: null }) };
}

const toast = new ToastManager();
const modal = new ModalManager();

// ================================================
// CAMPAIGN DETAIL MODAL
// ================================================

export function showCampaignDetail(campaign) {
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
                    ${getPlatformLabel(campaign.platform)}
                </span>
                <span style="padding: 4px 12px; background: #f5f5f5; border-radius: 999px; font-size: 12px;">
                    ${formatDate(campaign.start_date, 'short-yearless')} - ${formatDate(campaign.end_date, 'short-yearless')}
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
// LOAD CAMPAIGNS
// ================================================

/**
 * Load and render campaigns table
 */
export async function loadCampaigns(tableBody) {
    if (!tableBody) return;

    try {
        // Show loading state
        tableBody.innerHTML = '<tr><td colspan="7" class="loading-state">Đang tải chiến dịch...</td></tr>';

        // Check auth status
        const user = auth ? await auth.getUser() : null;
        let campaignData;

        if (!user) {
            // Demo mode
            campaignData = DEMO_CAMPAIGNS;
            toast.info('Đang xem ở chế độ Demo');
        } else {
            // Live mode
            const result = await campaigns.getAll();
            campaignData = result.data || [];
        }

        renderCampaigns(tableBody, campaignData);
        updateCampaignStats(campaignData);

    } catch (error) {
        // [DEV] 'Error loading campaigns:', error);
        toast.error('Không thể tải danh sách chiến dịch');

        // Fallback to demo data
        renderCampaigns(tableBody, DEMO_CAMPAIGNS);
        updateCampaignStats(DEMO_CAMPAIGNS);
    }
}

/**
 * Render campaigns table
 */
export function renderCampaigns(tableBody, campaignList) {
    if (!tableBody || !campaignList?.length) {
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="7" class="empty-state">Không có chiến dịch nào</td></tr>';
        }
        return;
    }

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
                <td>${getPlatformLabel(campaign.platform)}</td>
                <td>${formatDate(campaign.start_date, 'short-yearless')} - ${formatDate(campaign.end_date, 'short-yearless')}</td>
                <td>${formatCurrency(campaign.budget)}</td>
                <td><span class="status-badge ${status.class}">${status.text}</span></td>
                <td class="metric-cell">
                    <div class="metric-value">${campaign.metrics?.leads || '--'}</div>
                </td>
                <td class="metric-cell">
                    <span class="roi-badge ${roiClass}">${campaign.metrics?.roi ? campaign.metrics.roi + 'x' : '--'}</span>
                </td>
                <td>
                    <button class="view-detail-btn" onclick="window.showCampaignDetail('${campaign.id}')">
                        <span class="material-symbols-outlined">visibility</span>
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    // Add click handlers
    tableBody.querySelectorAll('tr[data-campaign-id]').forEach(row => {
        row.addEventListener('click', (e) => {
            if (!e.target.closest('.view-detail-btn')) {
                const campaignId = row.dataset.campaignId;
                const campaign = campaignList.find(c => c.id === campaignId);
                if (campaign) showCampaignDetail(campaign);
            }
        });

        row.querySelector('.view-detail-btn')?.addEventListener('click', () => {
            const campaignId = row.dataset.campaignId;
            const campaign = campaignList.find(c => c.id === campaignId);
            if (campaign) showCampaignDetail(campaign);
        });
    });
}

/**
 * Update campaign statistics
 */
export function updateCampaignStats(campaignList) {
    const statCards = document.querySelectorAll('.campaign-stat-value');
    if (!statCards.length || !campaignList) return;

    const stats = {
        total: campaignList.length,
        active: campaignList.filter(c => c.status === 'active').length,
        draft: campaignList.filter(c => c.status === 'draft').length,
        completed: campaignList.filter(c => c.status === 'completed').length
    };

    statCards.forEach(card => {
        const type = card.dataset.stat;
        if (type && stats[type] !== undefined) {
            card.textContent = stats[type];
        }
    });
}

// Export for external use
export { toast, modal };

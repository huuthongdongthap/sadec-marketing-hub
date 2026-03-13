/**
 * Admin Leads Module
 * Lead Display, Detail & Pipeline Management
 */

import { DEMO_LEADS, getLeadStatusLabel, getTemperatureColor } from './admin-data.js';
import { formatRelativeTime, ModalManager, ToastManager } from './admin-utils.js';

const toast = new ToastManager();
const modal = new ModalManager();

// Mock auth and leads for now
let auth = null;
let leads = null;

if (typeof window !== 'undefined') {
    auth = window.AdminAuth || { getUser: async () => null };
    leads = window.AdminLeads || { getAll: async () => ({ data: [], error: null }) };
}

// ================================================
// LEAD DETAIL MODAL
// ================================================

export function showLeadDetail(lead) {
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
                    <span style="color: #666;">Liên hệ lần cuối: ${formatRelativeTime(lead.last_contacted_at)}</span>
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
                        <div style="font-size: 12px; color: #666;">${formatRelativeTime(lead.created_at)}</div>
                        <div style="font-size: 14px;">Lead được tạo từ ${source.text}</div>
                    </div>
                    ${lead.last_contacted_at ? `
                    <div style="position: relative;">
                        <div style="position: absolute; left: -22px; top: 0; width: 12px; height: 12px; background: #4CAF50; border-radius: 50%;"></div>
                        <div style="font-size: 12px; color: #666;">${formatRelativeTime(lead.last_contacted_at)}</div>
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
// LOAD LEADS
// ================================================

/**
 * Load and render leads (cards + pipeline)
 */
export async function loadLeads(gridElement, pipelineElement) {
    try {
        const user = auth ? await auth.getUser() : null;
        let leadData;

        if (!user) {
            // Demo mode
            leadData = DEMO_LEADS;
            toast.info('Đang xem ở chế độ Demo');
        } else {
            // Live mode
            const result = await leads.getAll();
            leadData = result.data || [];
        }

        if (gridElement) renderLeadCards(gridElement, leadData);
        if (pipelineElement) renderPipeline(pipelineElement, leadData);

    } catch (error) {
        // [DEV] 'Error loading leads:', error);
        toast.error('Không thể tải danh sách leads');

        // Fallback to demo data
        if (gridElement) renderLeadCards(gridElement, DEMO_LEADS);
        if (pipelineElement) renderPipeline(pipelineElement, DEMO_LEADS);
    }
}

/**
 * Render lead cards
 */
export function renderLeadCards(container, leadList) {
    if (!container || !leadList?.length) {
        if (container) {
            container.innerHTML = '<div class="empty-state">Không có leads nào</div>';
        }
        return;
    }

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

/**
 * Render pipeline board
 */
export function renderPipeline(container, leadList) {
    if (!container || !leadList?.length) return;

    const stages = {
        new: { title: 'Mới', leads: [] },
        contacted: { title: 'Đang liên hệ', leads: [] },
        qualified: { title: 'Đã gửi báo giá', leads: [] },
        won: { title: 'Chốt đơn', leads: [] }
    };

    // Categorize leads by status
    leadList.forEach(lead => {
        const stage = lead.status === 'proposal' ? 'qualified' : lead.status;
        if (stages[stage]) {
            stages[stage].leads.push(lead);
        }
    });

    // Update pipeline columns
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

export { toast, modal };

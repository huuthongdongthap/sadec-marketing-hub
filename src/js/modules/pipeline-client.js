// ================================================
// MEKONG AGENCY - SALES PIPELINE CLIENT
// Max Level Kanban Pipeline with Drag & Drop
// ================================================

import { auth, leads, clients, deals, utils } from '../api/supabase.js';
import { formatCurrencyCompact, formatRelativeTime, Toast } from '../core/enhanced-utils.js';

// ================================================
// DEMO DEALS DATA
// ================================================

const DEMO_DEALS = [
    {
        id: 'deal-1',
        company: 'Sa Đéc Flower Shop',
        contact_name: 'Nguyễn Thị Lan',
        contact_email: 'lan@sadecflower.vn',
        value: 50000000,
        stage: 'negotiation',
        score: 95,
        source: 'referral',
        created_at: '2026-01-02T10:00:00Z',
        last_activity: '2026-01-05T14:30:00Z',
        probability: 80,
        notes: 'Đã gửi báo giá, chờ phản hồi cuối tuần'
    },
    {
        id: 'deal-2',
        company: 'Mekong Travel',
        contact_name: 'Trần Văn Minh',
        contact_email: 'minh@mekongtravel.vn',
        value: 120000000,
        stage: 'proposal',
        score: 85,
        source: 'google',
        created_at: '2026-01-01T08:00:00Z',
        last_activity: '2026-01-04T16:00:00Z',
        probability: 60,
        notes: 'Quan tâm đến gói Warrior, cần demo'
    },
    {
        id: 'deal-3',
        company: 'Cần Thơ Foods',
        contact_name: 'Phạm Hoàng',
        contact_email: 'hoang@canthofoods.vn',
        value: 30000000,
        stage: 'qualified',
        score: 72,
        source: 'facebook',
        created_at: '2026-01-03T14:00:00Z',
        last_activity: '2026-01-05T09:00:00Z',
        probability: 40,
        notes: 'Đã xác nhận ngân sách, cần gặp mặt'
    },
    {
        id: 'deal-4',
        company: 'Spa & Beauty Center',
        contact_name: 'Lê Thị Hoa',
        contact_email: 'hoa@spacenter.vn',
        value: 80000000,
        stage: 'closed',
        score: 100,
        source: 'referral',
        created_at: '2025-12-20T10:00:00Z',
        last_activity: '2026-01-03T11:00:00Z',
        probability: 100,
        notes: 'Đã ký hợp đồng 1 năm!'
    },
    {
        id: 'deal-5',
        company: 'Gym Fitness Pro',
        contact_name: 'Võ Minh Tuấn',
        contact_email: 'tuan@fitnesspro.vn',
        value: 25000000,
        stage: 'lead',
        score: 45,
        source: 'website',
        created_at: '2026-01-05T16:00:00Z',
        last_activity: '2026-01-05T16:00:00Z',
        probability: 20,
        notes: 'Lead mới, chưa liên hệ'
    },
    {
        id: 'deal-6',
        company: 'Khách sạn Riverside',
        contact_name: 'Đặng Văn Long',
        contact_email: 'long@riverside.vn',
        value: 200000000,
        stage: 'negotiation',
        score: 90,
        source: 'referral',
        created_at: '2025-12-28T08:00:00Z',
        last_activity: '2026-01-06T10:00:00Z',
        probability: 75,
        notes: 'Đang thương lượng giá, rất tiềm năng'
    },
    {
        id: 'deal-7',
        company: 'Thời trang XYZ',
        contact_name: 'Huỳnh Thanh Mai',
        contact_email: 'mai@xyz.vn',
        value: 45000000,
        stage: 'proposal',
        score: 68,
        source: 'facebook',
        created_at: '2026-01-01T09:00:00Z',
        last_activity: '2026-01-04T14:00:00Z',
        probability: 50,
        notes: 'Đã gửi proposal, chờ review'
    },
    {
        id: 'deal-8',
        company: 'Nhà hàng Mekong',
        contact_name: 'Nguyễn Văn Nam',
        contact_email: 'nam@mekongrest.vn',
        value: 35000000,
        stage: 'qualified',
        score: 75,
        source: 'zalo',
        created_at: '2026-01-02T11:00:00Z',
        last_activity: '2026-01-05T15:00:00Z',
        probability: 45,
        notes: 'Quan tâm marketing social, đã xác nhận timeline'
    },
    {
        id: 'deal-9',
        company: 'Tiệm bánh Hạnh Phúc',
        contact_name: 'Trương Công Danh',
        contact_email: 'danh@hanhphuc.vn',
        value: 15000000,
        stage: 'lead',
        score: 55,
        source: 'website',
        created_at: '2026-01-04T13:00:00Z',
        last_activity: '2026-01-04T13:00:00Z',
        probability: 25,
        notes: 'Có ngân sách nhỏ, phù hợp gói Basic'
    },
    {
        id: 'deal-10',
        company: 'Công ty TNHH ABC',
        contact_name: 'Lê Hoàng Anh',
        contact_email: 'anh@abc.vn',
        value: 150000000,
        stage: 'closed',
        score: 100,
        source: 'referral',
        created_at: '2025-12-15T10:00:00Z',
        last_activity: '2026-01-02T09:00:00Z',
        probability: 100,
        notes: 'Khách hàng VIP, hợp đồng năm'
    }
];

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
                background: rgba(0, 0, 0, 0.4);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
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
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-radius: 28px;
            max-width: 560px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            transform: scale(0.9);
            transition: transform 0.3s ease;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
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

// Using shared utils from enhanced-utils.js
// formatCurrencyCompact, formatRelativeTime, Toast imported above

function getScoreClass(score) {
    if (score >= 80) return 'hot';
    if (score >= 60) return 'warm';
    return 'cold';
}

// ================================================
// DEAL DETAIL MODAL
// ================================================

function showDealDetail(deal) {
    const stageLabels = {
        lead: 'Lead',
        qualified: 'Qualified',
        proposal: 'Proposal',
        negotiation: 'Negotiation',
        closed: 'Closed Won'
    };

    const sourceIcons = {
        facebook: 'thumb_up',
        google: 'search',
        zalo: 'chat',
        website: 'language',
        referral: 'group'
    };

    modal.open(`
        <div style="padding: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
                <div>
                    <h2 style="margin: 0; font-size: 24px;">${deal.company}</h2>
                    <p style="color: #666; margin: 4px 0 0 0;">
                        <span class="material-symbols-outlined" style="font-size: 16px; vertical-align: middle;">${sourceIcons[deal.source] || 'language'}</span>
                        ${deal.source?.charAt(0).toUpperCase() + deal.source?.slice(1)}
                    </p>
                </div>
                <button class="modal-close" style="background: none; border: none; cursor: pointer; padding: 8px;">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>

            <!-- Value & Stage -->
            <div style="display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap;">
                <span style="padding: 8px 16px; background: linear-gradient(135deg, #006A60, #00897B); color: white; border-radius: 999px; font-size: 14px; font-weight: 600;">
                    ${utils.formatCurrency(deal.value)}
                </span>
                <span style="padding: 8px 16px; background: #f5f5f5; border-radius: 999px; font-size: 14px;">
                    📍 ${stageLabels[deal.stage] || deal.stage}
                </span>
                <span style="padding: 8px 16px; background: ${deal.score >= 80 ? '#FFEBEE' : deal.score >= 60 ? '#FFF3E0' : '#E3F2FD'}; color: ${deal.score >= 80 ? '#C62828' : deal.score >= 60 ? '#EF6C00' : '#1565C0'}; border-radius: 999px; font-size: 14px; font-weight: 600;">
                    🔥 Score: ${deal.score}
                </span>
            </div>

            <!-- Contact -->
            <div style="background: #f5f5f5; padding: 16px; border-radius: 12px; margin-bottom: 24px;">
                <h4 style="margin: 0 0 12px 0; font-size: 14px; color: #666;">👤 Liên hệ</h4>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 48px; height: 48px; border-radius: 50%; background: var(--md-sys-color-primary-container, #E0F2F1); color: var(--md-sys-color-primary, #006A60); display: flex; align-items: center; justify-content: center; font-weight: 600;">
                        ${utils.getInitials(deal.contact_name)}
                    </div>
                    <div>
                        <div style="font-weight: 500;">${deal.contact_name}</div>
                        <a href="mailto:${deal.contact_email}" style="font-size: 14px; color: #006A60; text-decoration: none;">${deal.contact_email}</a>
                    </div>
                </div>
            </div>

            <!-- Probability -->
            <div style="margin-bottom: 24px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-size: 14px; color: #666;">Xác suất chốt</span>
                    <span style="font-weight: 600;">${deal.probability}%</span>
                </div>
                <div style="height: 8px; background: #E0E0E0; border-radius: 4px; overflow: hidden;">
                    <div style="height: 100%; width: ${deal.probability}%; background: linear-gradient(90deg, #006A60, #00897B); border-radius: 4px;"></div>
                </div>
            </div>

            <!-- Notes -->
            <div style="margin-bottom: 24px;">
                <h4 style="margin: 0 0 8px 0; font-size: 14px; color: #666;">📝 Ghi chú</h4>
                <p style="background: #FFFDE7; padding: 12px; border-radius: 8px; margin: 0; font-size: 14px;">
                    ${deal.notes || 'Không có ghi chú'}
                </p>
            </div>

            <!-- Timeline -->
            <div style="font-size: 12px; color: #999; display: flex; gap: 16px; margin-bottom: 24px;">
                <span>📅 Tạo: ${new Date(deal.created_at).toLocaleDateString('vi-VN')}</span>
                <span>⏰ Hoạt động: ${formatRelativeTime(deal.last_activity)}</span>
            </div>

            <!-- Actions -->
            <div style="display: flex; gap: 12px;">
                <button onclick="window.open('mailto:${deal.contact_email}')" style="flex: 1; padding: 14px; background: transparent; border: 2px solid #006A60; color: #006A60; border-radius: 12px; cursor: pointer; font-size: 14px; font-weight: 500; display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <span class="material-symbols-outlined" style="font-size: 18px;">mail</span>
                    Gửi Email
                </button>
                <button style="flex: 1; padding: 14px; background: #006A60; color: white; border: none; border-radius: 12px; cursor: pointer; font-size: 14px; font-weight: 500; display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <span class="material-symbols-outlined" style="font-size: 18px;">description</span>
                    Tạo Proposal
                </button>
            </div>
        </div>
    `);
}

// ================================================
// RENDER PIPELINE
// ================================================

let dealsData = [];

function renderPipeline(deals) {
    dealsData = deals;
    const stages = ['lead', 'qualified', 'proposal', 'negotiation', 'closed'];

    stages.forEach(stage => {
        const stageDeals = deals.filter(d => d.stage === stage);
        const stageEl = document.querySelector(`[data-stage="${stage}"]`);
        if (!stageEl) return;

        const countEl = stageEl.querySelector('[data-count]');
        const valueEl = stageEl.querySelector('[data-value]');
        const cardsEl = stageEl.querySelector('[data-cards]');

        // Update count and value
        const totalValue = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);
        if (countEl) countEl.textContent = stageDeals.length;
        if (valueEl) valueEl.textContent = formatCurrencyCompact(totalValue) + 'đ';

        // Render cards
        if (cardsEl) {
            cardsEl.innerHTML = stageDeals.map(deal => `
                <div class="deal-card" data-deal-id="${deal.id}" draggable="true">
                    <span class="deal-score ${getScoreClass(deal.score)}">${deal.score}</span>
                    <div class="deal-card-header">
                        <div class="deal-company">${deal.company}</div>
                        <div class="deal-value">${formatCurrencyCompact(deal.value)}đ</div>
                    </div>
                    <div class="deal-contact">
                        <div class="deal-avatar">${utils.getInitials(deal.contact_name)}</div>
                        <div class="deal-name">${deal.contact_name}</div>
                    </div>
                    <div class="deal-meta">
                        <span class="deal-tag">
                            <span class="material-symbols-outlined">schedule</span>
                            ${formatRelativeTime(deal.last_activity)}
                        </span>
                        <span class="deal-tag">
                            <span class="material-symbols-outlined">trending_up</span>
                            ${deal.probability}%
                        </span>
                    </div>
                    ${stage !== 'closed' ? `
                    <div class="deal-progress">
                        <div class="deal-progress-bar">
                            <div class="deal-progress-fill" style="width: ${deal.probability}%;"></div>
                        </div>
                    </div>
                    ` : ''}
                </div>
            `).join('') + `
                <button class="add-deal-btn">
                    <span class="material-symbols-outlined">add</span>
                    Thêm deal
                </button>
            `;

            // Bind click events
            cardsEl.querySelectorAll('.deal-card').forEach(card => {
                const dealId = card.dataset.dealId;
                const deal = deals.find(d => d.id === dealId);
                card.addEventListener('click', () => {
                    if (deal) showDealDetail(deal);
                });
            });
        }
    });

    // Update pipeline stats
    updatePipelineStats(deals);

    // Setup drag and drop
    setupDragAndDrop();
}

function updatePipelineStats(deals) {
    const totalDeals = deals.length;
    const totalValue = deals.reduce((sum, d) => sum + (d.value || 0), 0);
    const avgScore = totalDeals > 0 ? Math.round(deals.reduce((sum, d) => sum + (d.score || 0), 0) / totalDeals) : 0;
    const closedDeals = deals.filter(d => d.stage === 'closed').length;
    const winRate = totalDeals > 0 ? Math.round((closedDeals / totalDeals) * 100) : 0;

    // Animate count up
    animateValue(document.getElementById('totalDeals'), totalDeals);
    document.getElementById('totalValue').textContent = formatCurrencyCompact(totalValue) + 'đ';
    animateValue(document.getElementById('avgScore'), avgScore);
    document.getElementById('winRate').textContent = winRate + '%';
}

function animateValue(element, value) {
    if (!element) return;
    let current = 0;
    const duration = 1000;
    const step = value / (duration / 16);

    function update() {
        current += step;
        if (current >= value) {
            element.textContent = value;
            return;
        }
        element.textContent = Math.floor(current);
        requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
}

// ================================================
// CONFETTI EXPLOSION
// ================================================

function triggerConfetti() {
    const colors = ['#FF5252', '#FFD740', '#00E676', '#2196F3', '#E040FB', '#00BCD4'];
    const confettiCount = 100;

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-10px';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.width = (Math.random() * 10 + 5) + 'px';
        confetti.style.height = (Math.random() * 10 + 5) + 'px';
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        document.body.appendChild(confetti);

        setTimeout(() => confetti.remove(), 4000);
    }
}

// ================================================
// DRAG AND DROP
// ================================================

function setupDragAndDrop() {
    const cards = document.querySelectorAll('.deal-card');
    const stages = document.querySelectorAll('.stage-cards');

    cards.forEach(card => {
        card.addEventListener('dragstart', (e) => {
            card.classList.add('dragging');
            e.dataTransfer.setData('text/plain', card.dataset.dealId);
        });

        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
        });
    });

    stages.forEach(stage => {
        stage.addEventListener('dragover', (e) => {
            e.preventDefault();
            stage.classList.add('drag-over');
        });

        stage.addEventListener('dragleave', () => {
            stage.classList.remove('drag-over');
        });

        stage.addEventListener('drop', (e) => {
            e.preventDefault();
            stage.classList.remove('drag-over');

            const dealId = e.dataTransfer.getData('text/plain');
            const newStage = stage.closest('.pipeline-stage').dataset.stage;

            // Update deal stage
            const deal = dealsData.find(d => d.id === dealId);
            if (deal && deal.stage !== newStage) {
                const oldStage = deal.stage;
                deal.stage = newStage;

                // Auto-update probability based on stage
                const stageProbabilities = {
                    lead: 20,
                    qualified: 40,
                    proposal: 60,
                    negotiation: 80,
                    closed: 100
                };
                deal.probability = stageProbabilities[newStage] || deal.probability;
                deal.score = newStage === 'closed' ? 100 : deal.score;

                // Re-render
                renderPipeline(dealsData);

                // Trigger confetti for closed deals!
                if (newStage === 'closed') {
                    triggerConfetti();
                    Toast.show(`🎉 CHỐT ĐƠN! Deal "${deal.company}" - ${utils.formatCurrency(deal.value)}`, 'success', 5000);
                } else {
                    Toast.show(`Deal "${deal.company}" đã chuyển sang ${newStage.toUpperCase()}`, 'success');
                }
            }
        });
    });
}

// ================================================
// KEYBOARD SHORTCUTS
// ================================================

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        modal.close();
    }
});

// ================================================
// EXPORT FUNCTION
// ================================================

function exportPipelineReport() {
    const headers = ['Company', 'Contact', 'Value', 'Stage', 'Score', 'Probability', 'Source', 'Notes'];
    const rows = dealsData.map(d => [
        d.company,
        d.contact_name,
        d.value,
        d.stage,
        d.score,
        d.probability + '%',
        d.source,
        `"${d.notes || ''}"`
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `pipeline-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    Toast.show('Đã xuất báo cáo Pipeline!', 'success');
}

// ================================================
// INITIALIZATION
// ================================================

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const user = await auth.getUser();

        if (!user) {
            // Demo mode
            renderPipeline(DEMO_DEALS);
            Toast.show('🎯 Sales Pipeline - Demo Mode', 'info');
        } else {
            // Live mode - fetch from Supabase
            Toast.show('🔄 Đang tải dữ liệu...', 'info');
            const { data: liveDeals, error } = await deals.getAll();

            if (error || !liveDeals || liveDeals.length === 0) {
                // Fallback to demo if no data
                renderPipeline(DEMO_DEALS);
                Toast.show('📊 Sử dụng dữ liệu demo', 'info');
            } else {
                // Transform data to match expected format
                const transformedDeals = liveDeals.map(deal => ({
                    id: deal.id,
                    company: deal.name,
                    contact_name: deal.client?.contact_name || deal.lead?.name || 'N/A',
                    contact_email: deal.client?.email || deal.lead?.email || '',
                    value: deal.value || 0,
                    stage: mapStage(deal.stage),
                    score: deal.probability || 50,
                    source: deal.lead?.source || 'website',
                    created_at: deal.created_at,
                    last_activity: deal.updated_at,
                    probability: deal.probability || 50,
                    notes: deal.notes || ''
                }));

                renderPipeline(transformedDeals);
                Toast.show(`✅ Đã tải ${transformedDeals.length} deals`, 'success');
            }
        }

        // Bind export button
        document.getElementById('exportBtn')?.addEventListener('click', exportPipelineReport);

        // Bind add deal button
        document.getElementById('addDealBtn')?.addEventListener('click', () => {
            showAddDealModal();
        });

    } catch (error) {
        // [DEV] 'Error loading pipeline:', error);
        renderPipeline(DEMO_DEALS);
        Toast.show('Đang hiển thị demo mode', 'warning');
    }
});

// Map Supabase stage to UI stage
function mapStage(stage) {
    const stageMap = {
        'discovery': 'lead',
        'proposal': 'proposal',
        'negotiation': 'negotiation',
        'won': 'closed',
        'lost': 'lead'
    };
    return stageMap[stage] || 'lead';
}

// Show Add Deal Modal
function showAddDealModal() {
    modal.open(`
        <div style="padding: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h2 style="margin: 0;">➕ Thêm Deal Mới</h2>
                <button class="modal-close" style="background: none; border: none; cursor: pointer;">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            
            <form id="addDealForm">
                <div style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 4px; font-weight: 500;">Tên Deal *</label>
                    <input type="text" name="name" required style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px;" placeholder="VD: Website redesign cho XYZ">
                </div>
                
                <div style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 4px; font-weight: 500;">Giá trị (VNĐ)</label>
                    <input type="number" name="value" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px;" placeholder="50000000">
                </div>
                
                <div style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 4px; font-weight: 500;">Giai đoạn</label>
                    <select name="stage" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px;">
                        <option value="discovery">Discovery</option>
                        <option value="proposal">Proposal</option>
                        <option value="negotiation">Negotiation</option>
                    </select>
                </div>
                
                <div style="margin-bottom: 24px;">
                    <label style="display: block; margin-bottom: 4px; font-weight: 500;">Ghi chú</label>
                    <textarea name="notes" rows="3" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; resize: none;" placeholder="Ghi chú về deal..."></textarea>
                </div>
                
                <button type="submit" style="width: 100%; padding: 14px; background: #006A60; color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 500; cursor: pointer;">
                    Tạo Deal
                </button>
            </form>
        </div>
    `);

    // Handle form submit
    document.getElementById('addDealForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);

        const newDeal = {
            name: formData.get('name'),
            value: parseFloat(formData.get('value')) || 0,
            stage: formData.get('stage'),
            notes: formData.get('notes'),
            probability: formData.get('stage') === 'discovery' ? 20 : formData.get('stage') === 'proposal' ? 50 : 70
        };

        const user = await auth.getUser();
        if (user) {
            // Save to Supabase
            const { data, error } = await deals.create(newDeal);
            if (!error) {
                Toast.show('✅ Đã tạo deal mới!', 'success');
                modal.close();
                location.reload();
            } else {
                Toast.show('❌ Lỗi: ' + error.message, 'error');
            }
        } else {
            // Demo mode - just show confirmation
            Toast.show('📝 Deal đã được tạo (demo mode)', 'info');
            modal.close();
        }
    });
}

// ================================================
// EXPORTS
// ================================================

export {
    toast,
    modal,
    showDealDetail,
    renderPipeline,
    exportPipelineReport,
    DEMO_DEALS
};

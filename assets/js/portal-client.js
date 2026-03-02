// ================================================
// MEKONG AGENCY - CLIENT PORTAL
// Live Data Binding & UI Interactions
// ================================================

import { auth, projects, invoices, activities, utils, supabase } from './supabase.js';
import { paymentManager } from './payment-gateway.js';

// ================================================
// DEMO MODE DATA (Used when not authenticated)
// ================================================

const DEMO_PROJECTS = [
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
            { name: 'Ad Creation', completed: false },
            { name: 'Launch', completed: false },
            { name: 'Performance Report', completed: false }
        ]
    }
];

const DEMO_INVOICES = [
    {
        id: 'inv-1',
        invoice_number: 'INV-2026-001',
        project: { name: 'Chiến dịch Facebook Ads Q1' },
        amount: 15000000,
        tax: 0,
        total: 15000000,
        status: 'sent',
        issue_date: '2026-01-01',
        due_date: '2026-01-15',
        items: [
            { description: 'Quảng cáo Facebook Q1 2026', quantity: 1, price: 15000000 }
        ]
    },
    {
        id: 'inv-2',
        invoice_number: 'INV-2025-056',
        project: { name: 'Thiết kế logo mới' },
        amount: 8000000,
        tax: 0,
        total: 8000000,
        status: 'paid',
        issue_date: '2025-12-01',
        due_date: '2025-12-15',
        paid_at: '2025-12-14T10:30:00Z',
        items: [
            { description: 'Thiết kế logo', quantity: 1, price: 5000000 },
            { description: 'Bộ nhận diện thương hiệu', quantity: 1, price: 3000000 }
        ]
    },
    {
        id: 'inv-3',
        invoice_number: 'INV-2025-055',
        project: { name: 'SEO Website tháng 12' },
        amount: 5000000,
        tax: 0,
        total: 5000000,
        status: 'paid',
        issue_date: '2025-12-01',
        due_date: '2025-12-15',
        paid_at: '2025-12-10T14:00:00Z',
        items: [
            { description: 'SEO Website tháng 12/2025', quantity: 1, price: 5000000 }
        ]
    },
    {
        id: 'inv-4',
        invoice_number: 'INV-2026-002',
        project: { name: 'SEO Website tháng 1' },
        amount: 5000000,
        tax: 0,
        total: 5000000,
        status: 'sent',
        issue_date: '2026-01-01',
        due_date: '2026-01-15',
        items: [
            { description: 'SEO Website tháng 01/2026', quantity: 1, price: 5000000 }
        ]
    },
    {
        id: 'inv-5',
        invoice_number: 'INV-2025-054',
        project: { name: 'Quản lý Fanpage tháng 11' },
        amount: 3000000,
        tax: 0,
        total: 3000000,
        status: 'paid',
        issue_date: '2025-11-01',
        due_date: '2025-11-15',
        paid_at: '2025-11-12T09:00:00Z',
        items: [
            { description: 'Quản lý Fanpage tháng 11/2025', quantity: 1, price: 3000000 }
        ]
    },
    {
        id: 'inv-6',
        invoice_number: 'INV-2026-003',
        project: { name: 'Google Ads - Tết 2026' },
        amount: 20000000,
        tax: 0,
        total: 20000000,
        status: 'draft',
        issue_date: null,
        due_date: null,
        items: [
            { description: 'Chiến dịch Google Ads Tết 2026', quantity: 1, price: 20000000 }
        ]
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
            max-width: 560px;
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

        // Handle close button
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
// PROJECT DETAIL MODAL
// ================================================

function showProjectDetail(project) {
    const typeLabels = {
        ads: 'Quảng cáo',
        seo: 'SEO',
        design: 'Thiết kế',
        social: 'Social Media',
        web: 'Website',
        consulting: 'Tư vấn',
        other: 'Khác'
    };

    const statusLabels = {
        planning: 'Chuẩn bị',
        active: 'Đang chạy',
        paused: 'Tạm dừng',
        completed: 'Hoàn thành',
        cancelled: 'Đã hủy'
    };

    const milestonesHTML = project.milestones ? project.milestones.map((m, i) => `
        <div style="display: flex; align-items: center; gap: 12px; padding: 8px 0;">
            <span class="material-symbols-outlined" style="color: ${m.completed ? '#2E7D32' : '#9E9E9E'}; font-size: 20px;">
                ${m.completed ? 'check_circle' : 'radio_button_unchecked'}
            </span>
            <span style="flex: 1; ${m.completed ? 'text-decoration: line-through; color: #9E9E9E;' : ''}">${m.name}</span>
        </div>
    `).join('') : '<p style="color: #9E9E9E;">Không có milestones</p>';

    modal.open(`
        <div style="padding: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
                <div>
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                        <span class="project-type ${project.type}" style="padding: 4px 12px; border-radius: 999px; font-size: 12px;">
                            ${typeLabels[project.type] || project.type}
                        </span>
                        <span class="status-badge ${project.status}" style="padding: 4px 12px; border-radius: 999px; font-size: 12px;">
                            ${statusLabels[project.status] || project.status}
                        </span>
                    </div>
                    <h2 style="margin: 0; font-size: 24px;">${project.name}</h2>
                </div>
                <button class="modal-close" style="background: none; border: none; cursor: pointer; padding: 8px;">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>

            <p style="color: var(--md-sys-color-on-surface-variant, #666); margin-bottom: 24px;">
                ${project.description || 'Không có mô tả'}
            </p>

            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px;">
                <div style="padding: 16px; background: var(--md-sys-color-surface-container, #f5f5f5); border-radius: 12px;">
                    <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Ngân sách</div>
                    <div style="font-size: 18px; font-weight: 500;">${utils.formatCurrency(project.budget)}</div>
                </div>
                <div style="padding: 16px; background: var(--md-sys-color-surface-container, #f5f5f5); border-radius: 12px;">
                    <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Đã chi tiêu</div>
                    <div style="font-size: 18px; font-weight: 500;">${utils.formatCurrency(project.spent)}</div>
                </div>
                <div style="padding: 16px; background: var(--md-sys-color-surface-container, #f5f5f5); border-radius: 12px;">
                    <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Bắt đầu</div>
                    <div style="font-size: 16px;">${project.start_date ? utils.formatDate(project.start_date) : '--'}</div>
                </div>
                <div style="padding: 16px; background: var(--md-sys-color-surface-container, #f5f5f5); border-radius: 12px;">
                    <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Kết thúc</div>
                    <div style="font-size: 16px;">${project.end_date ? utils.formatDate(project.end_date) : '--'}</div>
                </div>
            </div>

            <div style="margin-bottom: 24px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-weight: 500;">Tiến độ</span>
                    <span style="font-weight: 500;">${project.progress}%</span>
                </div>
                <div style="height: 12px; background: #E0E0E0; border-radius: 6px; overflow: hidden;">
                    <div style="height: 100%; width: ${project.progress}%; background: linear-gradient(90deg, #006A60, #00897B); border-radius: 6px; transition: width 0.5s ease;"></div>
                </div>
            </div>

            <div>
                <h3 style="font-size: 16px; margin-bottom: 12px;">📌 Milestones</h3>
                ${milestonesHTML}
            </div>
        </div>
    `);
}

// ================================================
// INVOICE DETAIL MODAL
// ================================================

function showInvoiceDetail(invoice) {
    const statusLabels = {
        draft: { text: 'Nháp', class: 'draft' },
        sent: { text: 'Chờ thanh toán', class: 'pending' },
        paid: { text: 'Đã thanh toán', class: 'paid' },
        overdue: { text: 'Quá hạn', class: 'overdue' },
        cancelled: { text: 'Đã hủy', class: 'draft' }
    };
    const status = statusLabels[invoice.status] || statusLabels.draft;

    const itemsHTML = invoice.items ? invoice.items.map(item => `
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #E0E0E0;">${item.description}</td>
            <td style="padding: 12px; border-bottom: 1px solid #E0E0E0; text-align: center;">${item.quantity}</td>
            <td style="padding: 12px; border-bottom: 1px solid #E0E0E0; text-align: right;">${utils.formatCurrency(item.price)}</td>
        </tr>
    `).join('') : '';

    modal.open(`
        <div style="padding: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
                <div>
                    <span class="status-pill ${status.class}" style="margin-bottom: 8px; display: inline-block;">
                        ${status.text}
                    </span>
                    <h2 style="margin: 0; font-size: 24px;">${invoice.invoice_number}</h2>
                    <p style="color: #666; margin: 8px 0 0 0;">${invoice.project?.name || 'Dự án không xác định'}</p>
                </div>
                <button class="modal-close" style="background: none; border: none; cursor: pointer; padding: 8px;">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>

            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px;">
                <div>
                    <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Ngày tạo</div>
                    <div style="font-size: 16px;">${invoice.issue_date ? utils.formatDate(invoice.issue_date) : '--'}</div>
                </div>
                <div>
                    <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Hạn thanh toán</div>
                    <div style="font-size: 16px;">${invoice.due_date ? utils.formatDate(invoice.due_date) : '--'}</div>
                </div>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <thead>
                    <tr style="background: #f5f5f5;">
                        <th style="padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase;">Mô tả</th>
                        <th style="padding: 12px; text-align: center; font-size: 12px; text-transform: uppercase;">SL</th>
                        <th style="padding: 12px; text-align: right; font-size: 12px; text-transform: uppercase;">Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHTML}
                </tbody>
            </table>

            <div style="background: #f5f5f5; padding: 16px; border-radius: 12px; margin-bottom: 24px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Tạm tính</span>
                    <span>${utils.formatCurrency(invoice.amount)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Thuế VAT</span>
                    <span>${utils.formatCurrency(invoice.tax || 0)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 20px; font-weight: 700; padding-top: 8px; border-top: 1px solid #ddd;">
                    <span>Tổng cộng</span>
                    <span style="color: var(--md-sys-color-primary, #006A60);">${utils.formatCurrency(invoice.total)}</span>
                </div>
            </div>

            <div style="display: flex; gap: 12px;">
                <button id="downloadInvoice" class="btn btn-outlined" style="flex: 1; padding: 12px; border: 2px solid #006A60; background: transparent; color: #006A60; border-radius: 12px; cursor: pointer; font-size: 14px; font-weight: 500; display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <span class="material-symbols-outlined">download</span>
                    Tải PDF
                </button>
                ${invoice.status === 'sent' || invoice.status === 'overdue' ? `
                <button id="payOnlineBtn" class="btn btn-filled" style="flex: 1; padding: 12px; background: #006A60; color: white; border: none; border-radius: 12px; cursor: pointer; font-size: 14px; font-weight: 500; display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <span class="material-symbols-outlined">payments</span>
                    Thanh toán Online
                </button>
                <button id="markAsPaid" data-invoice-id="${invoice.id}" class="btn btn-outlined" style="flex: 1; padding: 12px; border: 1px solid #006A60; background: transparent; color: #006A60; border-radius: 12px; cursor: pointer; font-size: 14px; font-weight: 500; display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <span class="material-symbols-outlined">check_circle</span>
                    Đã thanh toán (Demo)
                </button>
                ` : ''}
            </div>
        </div>
    `);

    // Bind button actions
    document.getElementById('downloadInvoice')?.addEventListener('click', () => downloadInvoicePDF(invoice));
    document.getElementById('payOnlineBtn')?.addEventListener('click', () => payInvoiceOnline(invoice));
    document.getElementById('markAsPaid')?.addEventListener('click', () => markInvoiceAsPaid(invoice.id));
}

// ================================================
// INVOICE ACTIONS
// ================================================

async function payInvoiceOnline(invoice) {
    // Show payment method selection modal
    const modalContent = `
        <div style="padding: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h2 style="margin: 0;">Chọn phương thức thanh toán</h2>
                <button class="modal-close" onclick="modal.close()" style="background: none; border: none; cursor: pointer; padding: 4px;">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>

            <div style="background: var(--md-sys-color-surface-container); padding: 16px; border-radius: 12px; margin-bottom: 24px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-weight: 500;">Hóa đơn</span>
                    <span>${invoice.invoice_number}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 700;">Số tiền</span>
                    <span style="font-size: 20px; font-weight: 700; color: var(--md-sys-color-primary);">${utils.formatCurrency(invoice.total)}</span>
                </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px;">
                <label style="display: flex; align-items: center; gap: 12px; padding: 16px; border: 1px solid var(--md-sys-color-outline); border-radius: 12px; cursor: pointer;">
                    <input type="radio" name="invoice_payment_method" value="vnpay" checked>
                    <span class="material-symbols-outlined" style="color: #0056b3;">account_balance_wallet</span>
                    <div>
                        <div style="font-weight: 500;">VNPay QR</div>
                        <div style="font-size: 12px; color: var(--md-sys-color-on-surface-variant);">Quét mã QR qua ứng dụng ngân hàng</div>
                    </div>
                </label>

                <label style="display: flex; align-items: center; gap: 12px; padding: 16px; border: 1px solid var(--md-sys-color-outline); border-radius: 12px; cursor: pointer;">
                    <input type="radio" name="invoice_payment_method" value="momo">
                    <span class="material-symbols-outlined" style="color: #a50064;">qr_code_scanner</span>
                    <div>
                        <div style="font-weight: 500;">Ví MoMo</div>
                        <div style="font-size: 12px; color: var(--md-sys-color-on-surface-variant);">Thanh toán qua ví điện tử MoMo</div>
                    </div>
                </label>
            </div>

            <button id="confirmPaymentBtn" class="btn btn-filled" style="width: 100%; justify-content: center; padding: 16px;">
                Tiến hành thanh toán
            </button>
        </div>
    `;

    modal.open(modalContent);

    // Re-bind close button and confirm button
    setTimeout(() => {
        document.querySelector('.modal-content .modal-close').onclick = () => modal.close();

        document.getElementById('confirmPaymentBtn').onclick = async () => {
            const methodInput = document.querySelector('input[name="invoice_payment_method"]:checked');
            const method = methodInput ? methodInput.value : 'vnpay';

            modal.close();
            toast.show('Đang khởi tạo cổng thanh toán...', 'info');

            try {
                const result = await paymentManager.processPayment(method, {
                    amount: invoice.total,
                    description: `Thanh toan hoa don ${invoice.invoice_number}`,
                    orderId: invoice.invoice_number + '-' + Date.now().toString().slice(-6)
                });

                if (result && result.data) {
                    if (typeof result.data === 'string') {
                        window.location.href = result.data;
                    } else if (result.data.type === 'qr_display') {
                         window.location.href = `payment-result.html?status=pending&method=bank&amount=${invoice.total}&qr=${encodeURIComponent(result.data.qrUrl)}`;
                    }
                } else {
                     toast.show('Lỗi khởi tạo thanh toán', 'error');
                }
            } catch (error) {
                console.error('Payment Error:', error);
                toast.show('Có lỗi xảy ra', 'error');
            }
        };
    }, 100);
}

async function downloadInvoicePDF(invoice) {
    toast.show('Đang tạo file PDF...', 'info');

    // Simulate PDF generation delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In production, this would call an API to generate PDF
    // For demo, show success message
    toast.show(`Đã tải xuống ${invoice.invoice_number}.pdf`, 'success');

    // Close modal if needed
    modal.close();
}

async function markInvoiceAsPaid(invoiceId) {
    const confirmed = confirm('Xác nhận đã thanh toán hóa đơn này?');
    if (!confirmed) return;

    toast.show('Đang cập nhật...', 'info');

    try {
        // Check if demo mode
        const user = await auth.getUser();

        if (!user) {
            // Demo mode - update local data
            const invoice = DEMO_INVOICES.find(i => i.id === invoiceId);
            if (invoice) {
                invoice.status = 'paid';
                invoice.paid_at = new Date().toISOString();
            }
        } else {
            // Live mode - update Supabase
            await invoices.markAsPaid(invoiceId);
        }

        toast.show('Đã cập nhật trạng thái hóa đơn!', 'success');
        modal.close();

        // Refresh the invoice list
        if (typeof loadInvoices === 'function') {
            loadInvoices();
        } else {
            // Reload page if function not available
            setTimeout(() => window.location.reload(), 1000);
        }
    } catch (error) {
        console.error('Error marking invoice as paid:', error);
        toast.show('Có lỗi xảy ra. Vui lòng thử lại!', 'error');
    }
}

// ================================================
// UTILITY FUNCTIONS
// ================================================

// Using shared utils from supabase.js -> utils.js
// formatCurrency and formatDate are now provided by MekongUtils

// ================================================
// DATA LOADING FUNCTIONS
// ================================================

async function loadProjects(gridElement, filterStatus = 'all') {
    try {
        const user = await auth.getUser();
        let projectData;

        if (!user) {
            // Demo mode
            projectData = DEMO_PROJECTS;
        } else {
            // Live mode
            const { data, error } = await projects.getAll();
            if (error) throw error;
            projectData = data || [];
        }

        // Apply filter
        if (filterStatus !== 'all') {
            const statusMap = {
                'active': 'active',
                'completed': 'completed',
                'paused': 'paused'
            };
            projectData = projectData.filter(p => p.status === statusMap[filterStatus]);
        }

        renderProjects(gridElement, projectData);
    } catch (error) {
        console.error('Error loading projects:', error);
        toast.show('Không thể tải danh sách dự án', 'error');
    }
}

async function loadInvoices(tableElement) {
    try {
        const user = await auth.getUser();
        let invoiceData;

        if (!user) {
            // Demo mode
            invoiceData = DEMO_INVOICES;
        } else {
            // Live mode
            const { data, error } = await invoices.getAll();
            if (error) throw error;
            invoiceData = data || [];
        }

        renderInvoices(tableElement, invoiceData);
        updateInvoiceStats(invoiceData);
    } catch (error) {
        console.error('Error loading invoices:', error);
        toast.show('Không thể tải danh sách hóa đơn', 'error');
    }
}

async function loadDashboard() {
    try {
        const user = await auth.getUser();

        if (!user) {
            // Demo mode - use static data already in HTML
            toast.show('Đang xem ở chế độ Demo', 'info');
            return;
        }

        // --- Get clientId from clients table ---
        const { data: clientRow, error: clientErr } = await supabase
            .from('clients')
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (clientErr || !clientRow) {
            console.warn('Dashboard: client record not found, using static data');
            return;
        }

        const clientId = clientRow.id;
        const now = new Date();
        const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
        const sixtyDaysAgo = new Date(now - 60 * 24 * 60 * 60 * 1000).toISOString();

        // --- Parallel fetch ---
        const [projectsRes, invoicesRes, campaignsRes, activitiesRes, deadlinesRes] = await Promise.allSettled([
            supabase.from('projects').select('id, status, created_at').eq('client_id', clientId),
            supabase.from('invoices').select('id, status').eq('client_id', clientId).eq('status', 'pending'),
            supabase.from('campaigns').select('reach, leads_generated, created_at').eq('client_id', clientId),
            supabase.from('activities').select('id, description, type, created_at').eq('client_id', clientId).order('created_at', { ascending: false }).limit(5),
            supabase.from('projects').select('id, name, deadline').eq('client_id', clientId).gt('deadline', now.toISOString()).order('deadline', { ascending: true }).limit(3)
        ]);

        // ---- STAT: Active Projects ----
        const elProjects = document.getElementById('stat-projects');
        const elTrendProjects = document.getElementById('trend-projects');
        if (elProjects) {
            if (projectsRes.status === 'fulfilled' && !projectsRes.value.error) {
                const allProjects = projectsRes.value.data || [];
                const activeCount = allProjects.filter(p => p.status === 'active').length;
                const recentCount = allProjects.filter(p => p.created_at >= thirtyDaysAgo).length;
                const prevCount = allProjects.filter(p => p.created_at >= sixtyDaysAgo && p.created_at < thirtyDaysAgo).length;
                elProjects.textContent = activeCount || '0';
                if (elTrendProjects) {
                    const diff = recentCount - prevCount;
                    elTrendProjects.innerHTML = diff >= 0
                        ? `<span class="material-symbols-outlined icon-xs">trending_up</span> +${diff}`
                        : `<span class="material-symbols-outlined icon-xs">trending_down</span> ${diff}`;
                    elTrendProjects.className = `stat-trend ${diff >= 0 ? 'up' : 'down'}`;
                }
            } else {
                elProjects.textContent = '—';
            }
        }

        // ---- STAT: Pending Invoices ----
        const elInvoices = document.getElementById('stat-invoices');
        if (elInvoices) {
            if (invoicesRes.status === 'fulfilled' && !invoicesRes.value.error) {
                const pendingCount = (invoicesRes.value.data || []).length;
                elInvoices.textContent = pendingCount || '0';
            } else {
                elInvoices.textContent = '—';
            }
        }

        // ---- STAT: Reach & Leads ----
        const elReach = document.getElementById('stat-reach');
        const elLeads = document.getElementById('stat-leads');
        const elTrendReach = document.getElementById('trend-reach');
        const elTrendLeads = document.getElementById('trend-leads');
        if (elReach || elLeads) {
            if (campaignsRes.status === 'fulfilled' && !campaignsRes.value.error) {
                const allCampaigns = campaignsRes.value.data || [];
                const totalReach = allCampaigns.reduce((s, c) => s + (c.reach || 0), 0);
                const totalLeads = allCampaigns.reduce((s, c) => s + (c.leads_generated || 0), 0);

                const recentCampaigns = allCampaigns.filter(c => c.created_at >= thirtyDaysAgo);
                const prevCampaigns = allCampaigns.filter(c => c.created_at >= sixtyDaysAgo && c.created_at < thirtyDaysAgo);
                const recentReach = recentCampaigns.reduce((s, c) => s + (c.reach || 0), 0);
                const prevReach = prevCampaigns.reduce((s, c) => s + (c.reach || 0), 0);
                const recentLeads = recentCampaigns.reduce((s, c) => s + (c.leads_generated || 0), 0);
                const prevLeads = prevCampaigns.reduce((s, c) => s + (c.leads_generated || 0), 0);

                if (elReach) {
                    elReach.textContent = totalReach >= 1000
                        ? `${(totalReach / 1000).toFixed(1)}K`
                        : (totalReach || '0');
                }
                if (elLeads) {
                    elLeads.textContent = totalLeads || '0';
                }

                if (elTrendReach && prevReach > 0) {
                    const pct = Math.round(((recentReach - prevReach) / prevReach) * 100);
                    elTrendReach.innerHTML = pct >= 0
                        ? `<span class="material-symbols-outlined icon-xs">trending_up</span> +${pct}%`
                        : `<span class="material-symbols-outlined icon-xs">trending_down</span> ${pct}%`;
                    elTrendReach.className = `stat-trend ${pct >= 0 ? 'up' : 'down'}`;
                }
                if (elTrendLeads && prevLeads > 0) {
                    const pct = Math.round(((recentLeads - prevLeads) / prevLeads) * 100);
                    elTrendLeads.innerHTML = pct >= 0
                        ? `<span class="material-symbols-outlined icon-xs">trending_up</span> +${pct}%`
                        : `<span class="material-symbols-outlined icon-xs">trending_down</span> ${pct}%`;
                    elTrendLeads.className = `stat-trend ${pct >= 0 ? 'up' : 'down'}`;
                }

                if (allCampaigns.length === 0) {
                    if (elReach) elReach.textContent = 'Chưa có dữ liệu. Hãy liên hệ đội ngũ marketing.';
                    if (elLeads) elLeads.textContent = '—';
                }
            } else {
                if (elReach) elReach.textContent = '—';
                if (elLeads) elLeads.textContent = '—';
            }
        }

        // ---- SECTION: Recent Activities ----
        const elActivityList = document.getElementById('activity-list');
        if (elActivityList && activitiesRes.status === 'fulfilled' && !activitiesRes.value.error) {
            const activityData = activitiesRes.value.data || [];
            if (activityData.length > 0) {
                const dotColorMap = { invoice: 'green', campaign: 'green', report: 'blue', reminder: 'orange', default: 'blue' };
                elActivityList.innerHTML = activityData.map(a => {
                    const dot = dotColorMap[a.type] || dotColorMap.default;
                    const timeAgo = _timeAgo(a.created_at);
                    return `
                        <div class="activity-item">
                            <div class="activity-dot ${dot}"></div>
                            <div class="activity-content">
                                <div class="activity-text">${a.description || ''}</div>
                                <div class="activity-time">${timeAgo}</div>
                            </div>
                        </div>`;
                }).join('');
            }
        }

        // ---- SECTION: Upcoming Deadlines ----
        const elDeadlines = document.getElementById('deadlines-list');
        if (elDeadlines && deadlinesRes.status === 'fulfilled' && !deadlinesRes.value.error) {
            const deadlineData = deadlinesRes.value.data || [];
            if (deadlineData.length > 0) {
                elDeadlines.innerHTML = deadlineData.map(p => {
                    const d = new Date(p.deadline);
                    const daysLeft = Math.ceil((d - now) / (24 * 60 * 60 * 1000));
                    const dot = daysLeft <= 7 ? 'orange' : 'blue';
                    const dateStr = d.toLocaleDateString('vi-VN');
                    return `
                        <div class="activity-item">
                            <div class="activity-dot ${dot}"></div>
                            <div class="activity-content">
                                <div class="activity-text body-medium">${p.name}</div>
                                <div class="activity-time">${dateStr} · còn ${daysLeft} ngày</div>
                            </div>
                        </div>`;
                }).join('');
            } else {
                elDeadlines.innerHTML = '<div class="activity-item"><div class="activity-content"><div class="activity-text" style="color:var(--md-sys-color-on-surface-variant)">Không có deadline sắp tới.</div></div></div>';
            }
        }

    } catch (error) {
        console.error('Error loading dashboard:', error);
        // Silently keep static fallback data already rendered in HTML
    }
}

function _timeAgo(isoString) {
    if (!isoString) return '';
    const diff = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} phút trước`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} giờ trước`;
    const days = Math.floor(hrs / 24);
    if (days === 1) return 'Hôm qua';
    return `${days} ngày trước`;
}

// ================================================
// RENDER FUNCTIONS
// ================================================

function renderProjects(container, projectList) {
    if (!container) return;

    const typeLabels = {
        ads: 'Quảng cáo',
        seo: 'SEO',
        design: 'Thiết kế',
        social: 'Social Media'
    };

    const statusLabels = {
        active: { text: 'Đang chạy', class: 'active', icon: 'circle' },
        completed: { text: 'Hoàn thành', class: 'completed', icon: 'check_circle' },
        paused: { text: 'Tạm dừng', class: 'paused', icon: 'pause_circle' }
    };

    container.innerHTML = projectList.map(project => {
        const status = statusLabels[project.status] || statusLabels.active;
        return `
            <div class="card card-elevated project-card" data-project-id="${project.id}">
                <div class="project-header">
                    <span class="project-type ${project.type}">${typeLabels[project.type] || project.type}</span>
                    <span class="status-badge ${status.class}">
                        <span class="material-symbols-outlined" style="font-size: 12px;">${status.icon}</span>
                        ${status.text}
                    </span>
                </div>
                <h3 class="project-title">${project.name}</h3>
                <p class="project-description">${project.description || ''}</p>
                <div class="project-meta">
                    <div class="project-meta-item">
                        <span class="material-symbols-outlined">calendar_month</span>
                        ${project.start_date ? utils.formatDate(project.start_date) : '--'} - ${project.end_date ? utils.formatDate(project.end_date) : '--'}
                    </div>
                    <div class="project-meta-item">
                        <span class="material-symbols-outlined">payments</span>
                        ${utils.formatCurrency(project.budget)}
                    </div>
                </div>
                <div class="progress-section">
                    <div class="progress-header">
                        <span class="label-medium">Tiến độ</span>
                        <span class="label-medium">${project.progress}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${project.progress}%;"></div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Bind click events
    container.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', () => {
            const projectId = card.dataset.projectId;
            const project = projectList.find(p => p.id === projectId);
            if (project) showProjectDetail(project);
        });
    });
}

function renderInvoices(tableBody, invoiceList) {
    if (!tableBody) return;

    const statusLabels = {
        draft: { text: 'Nháp', class: 'draft' },
        sent: { text: 'Chờ thanh toán', class: 'pending' },
        paid: { text: 'Đã thanh toán', class: 'paid' },
        overdue: { text: 'Quá hạn', class: 'overdue' }
    };

    tableBody.innerHTML = invoiceList.map(invoice => {
        const status = statusLabels[invoice.status] || statusLabels.draft;
        return `
            <tr data-invoice-id="${invoice.id}">
                <td><span class="invoice-id">${invoice.invoice_number}</span></td>
                <td>${invoice.project?.name || '--'}</td>
                <td>${invoice.issue_date ? utils.formatDate(invoice.issue_date) : '--'}</td>
                <td>${invoice.due_date ? utils.formatDate(invoice.due_date) : '--'}</td>
                <td><span class="amount">${utils.formatCurrency(invoice.total)}</span></td>
                <td><span class="status-pill ${status.class}">${status.text}</span></td>
                <td>
                    <div class="invoice-actions">
                        <button class="action-btn view-btn" title="Xem chi tiết">
                            <span class="material-symbols-outlined">visibility</span>
                        </button>
                        <button class="action-btn download-btn" title="Tải PDF">
                            <span class="material-symbols-outlined">download</span>
                        </button>
                        ${invoice.status === 'sent' || invoice.status === 'overdue' ? `
                        <button class="action-btn pay-btn" title="Đánh dấu đã thanh toán">
                            <span class="material-symbols-outlined">check_circle</span>
                        </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    // Bind action buttons
    tableBody.querySelectorAll('tr').forEach(row => {
        const invoiceId = row.dataset.invoiceId;
        const invoice = invoiceList.find(i => i.id === invoiceId);

        row.querySelector('.view-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            if (invoice) showInvoiceDetail(invoice);
        });

        row.querySelector('.download-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            if (invoice) downloadInvoicePDF(invoice);
        });

        row.querySelector('.pay-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            if (invoice) markInvoiceAsPaid(invoice.id);
        });
    });
}

function updateInvoiceStats(invoiceList) {
    const stats = {
        total: invoiceList.reduce((sum, i) => sum + (i.total || 0), 0),
        paid: invoiceList.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.total || 0), 0),
        pending: invoiceList.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((sum, i) => sum + (i.total || 0), 0)
    };

    // Update stat cards if they exist
    const statCards = document.querySelectorAll('.invoice-stat-value');
    if (statCards.length >= 3) {
        statCards[0].textContent = utils.formatCurrency(stats.total);
        statCards[1].textContent = utils.formatCurrency(stats.paid);
        statCards[2].textContent = utils.formatCurrency(stats.pending);
    }
}

// ================================================
// AUTO-INITIALIZATION
// ================================================

document.addEventListener('DOMContentLoaded', () => {
    // Detect which page we're on and initialize accordingly
    const path = window.location.pathname;

    if (path.includes('projects.html')) {
        const grid = document.getElementById('projectsGrid');
        if (grid) {
            loadProjects(grid);

            // Bind filter buttons
            document.querySelectorAll('.filter-chip').forEach(chip => {
                chip.addEventListener('click', () => {
                    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
                    chip.classList.add('active');

                    const filterText = chip.textContent.trim();
                    const filterMap = {
                        'Tất cả': 'all',
                        'Đang chạy': 'active',
                        'Hoàn thành': 'completed',
                        'Tạm dừng': 'paused'
                    };
                    loadProjects(grid, filterMap[filterText] || 'all');
                });
            });
        }
    }

    if (path.includes('invoices.html')) {
        const table = document.querySelector('.invoice-table tbody');
        if (table) {
            loadInvoices(table);
            setupInvoiceRealtime(table);
        }
    }

    if (path.includes('dashboard.html')) {
        loadDashboard();
    }
});

// ================================================
// REALTIME SUBSCRIPTIONS
// ================================================

function setupInvoiceRealtime(tableElement) {
    if (!tableElement) return;

    // Listen for changes to invoices table
    const channel = supabase.channel('invoices-realtime')
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'invoices' },
            (payload) => {

                // If update event and matches a row in the table
                if (payload.eventType === 'UPDATE') {
                    const updatedInvoice = payload.new;
                    const row = tableElement.querySelector(`tr[data-invoice-id="${updatedInvoice.id}"]`);

                    if (row) {
                        // Update status pill
                        const statusCell = row.querySelector('.status-pill');
                        if (statusCell) {
                            // Update classes
                            statusCell.className = 'status-pill'; // Reset

                            const statusMap = {
                                'paid': { class: 'paid', text: 'Đã thanh toán' },
                                'pending': { class: 'pending', text: 'Chờ thanh toán' },
                                'sent': { class: 'pending', text: 'Chờ thanh toán' },
                                'overdue': { class: 'overdue', text: 'Quá hạn' },
                                'draft': { class: 'draft', text: 'Nháp' }
                            };

                            const statusInfo = statusMap[updatedInvoice.status] || { class: 'draft', text: updatedInvoice.status };
                            statusCell.classList.add(statusInfo.class);
                            statusCell.textContent = statusInfo.text;
                        }

                        // Update actions if paid
                        if (updatedInvoice.status === 'paid') {
                             const actionsCell = row.querySelector('.invoice-actions');
                             if (actionsCell) {
                                 // Remove pay button if exists
                                 const payBtn = actionsCell.querySelector('.pay-btn');
                                 if (payBtn) payBtn.remove();
                             }

                             // Show toast notification
                             toast.show(`Hóa đơn ${updatedInvoice.invoice_number} đã được thanh toán!`, 'success');
                        }
                    }
                } else if (payload.eventType === 'INSERT') {
                    // Reload table to show new invoice
                    loadInvoices(tableElement);
                    toast.show('Có hóa đơn mới!', 'info');
                }
            }
        )
        .subscribe();

    // Cleanup on unload (optional for single page app, but good practice)
    window.addEventListener('beforeunload', () => {
        supabase.removeChannel(channel);
    });
}

// ================================================
// EXPORTS
// ================================================

export {
    toast,
    modal,
    showProjectDetail,
    showInvoiceDetail,
    downloadInvoicePDF,
    markInvoiceAsPaid,
    loadProjects,
    loadInvoices,
    loadDashboard,
    DEMO_PROJECTS,
    DEMO_INVOICES
};

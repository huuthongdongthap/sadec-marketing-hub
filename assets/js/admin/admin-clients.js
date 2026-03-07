/**
 * Admin Clients Module
 * Client/Customer Management
 */

import { formatCurrency, formatDate, ModalManager, ToastManager } from './admin-utils.js';

const toast = new ToastManager();
const modal = new ModalManager();

// Mock clients API
let clients = null;

if (typeof window !== 'undefined') {
    clients = window.AdminClients || {
        getAll: async () => ({ data: [], error: null }),
        getById: async (id) => ({ data: null, error: null }),
        save: async (data) => ({ data: null, error: null }),
        delete: async (id) => ({ error: null })
    };
}

// ================================================
// DEMO CLIENTS DATA
// ================================================

const DEMO_CLIENTS = [
    {
        id: 'client-1',
        company_name: 'Sa Đéc Flower Shop',
        contact_name: 'Nguyễn Thị Mai',
        email: 'mai@hoatuoi-sadec.vn',
        phone: '0909 123 456',
        address: '123 Đường Nguyễn Huệ, Sa Đéc, Đồng Tháp',
        status: 'active',
        total_spent: 58000000,
        active_campaigns: 2,
        created_at: '2025-06-15T08:00:00Z'
    },
    {
        id: 'client-2',
        company_name: 'Mekong Travel',
        contact_name: 'Trần Văn Hùng',
        email: 'hung@mekongtravel.vn',
        phone: '0918 765 432',
        address: '456 Đường 30/4, Cần Thơ',
        status: 'active',
        total_spent: 125000000,
        active_campaigns: 3,
        created_at: '2025-08-20T10:30:00Z'
    },
    {
        id: 'client-3',
        company_name: 'Cần Thơ Foods',
        contact_name: 'Lê Thị Hạnh',
        email: 'hanh@canthofoods.vn',
        phone: '0977 888 999',
        address: '789 Đường Mậu Thân, Ninh Kiều, Cần Thơ',
        status: 'active',
        total_spent: 89000000,
        active_campaigns: 1,
        created_at: '2025-09-10T14:00:00Z'
    },
    {
        id: 'client-4',
        company_name: 'Long Xuyên Boutique',
        contact_name: 'Phạm Thanh Tâm',
        email: 'tam@lxboutique.vn',
        phone: '0933 222 111',
        address: '321 Đường Hoàng Văn Thụ, Long Xuyên, An Giang',
        status: 'paused',
        total_spent: 32000000,
        active_campaigns: 0,
        created_at: '2025-11-05T09:15:00Z'
    },
    {
        id: 'client-5',
        company_name: 'Khách sạn Riverside',
        contact_name: 'Đặng Văn Long',
        email: 'long@riverside.vn',
        phone: '0988 999 000',
        address: '555 Đường Bạch Đằng, Ninh Kiều, Cần Thơ',
        status: 'active',
        total_spent: 156000000,
        active_campaigns: 4,
        created_at: '2025-05-01T11:00:00Z'
    }
];

// ================================================
// LOAD CLIENTS
// ================================================

/**
 * Load and render clients table
 */
export async function loadClients(tableBody) {
    if (!tableBody) return;

    try {
        tableBody.innerHTML = '<tr><td colspan="8" class="loading-state">Đang tải khách hàng...</td></tr>';

        const result = await clients.getAll();
        const clientData = result.data || [];

        if (clientData.length === 0) {
            // Use demo data if no clients found
            renderClients(tableBody, DEMO_CLIENTS);
            toast.info('Đang xem dữ liệu demo');
        } else {
            renderClients(tableBody, clientData);
        }

    } catch (error) {
        console.error('Error loading clients:', error);
        toast.error('Không thể tải danh sách khách hàng');
        renderClients(tableBody, DEMO_CLIENTS);
    }
}

/**
 * Render clients table
 */
export function renderClients(tableBody, clientList) {
    if (!tableBody || !clientList?.length) {
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="8" class="empty-state">Không có khách hàng nào</td></tr>';
        }
        return;
    }

    const statusLabels = {
        active: { text: 'Đang hoạt động', class: 'active' },
        paused: { text: 'Tạm dừng', class: 'paused' },
        inactive: { text: 'Không hoạt động', class: 'inactive' }
    };

    tableBody.innerHTML = clientList.map(client => {
        const status = statusLabels[client.status] || statusLabels.active;

        return `
            <tr data-client-id="${client.id}">
                <td>
                    <div class="client-name-cell">
                        <div class="client-title">${client.company_name}</div>
                        <div class="client-contact">${client.contact_name}</div>
                    </div>
                </td>
                <td>
                    <div class="client-contact-info">
                        <div>${client.email}</div>
                        <div style="font-size: 12px; color: #666;">${client.phone}</div>
                    </div>
                </td>
                <td><span class="status-badge ${status.class}">${status.text}</span></td>
                <td>${formatCurrency(client.total_spent)}</td>
                <td>${client.active_campaigns || 0}</td>
                <td>${formatDate(client.created_at, 'short')}</td>
                <td>
                    <button class="btn-icon view-btn" title="Xem chi tiết">
                        <span class="material-symbols-outlined">visibility</span>
                    </button>
                    <button class="btn-icon edit-btn" title="Chỉnh sửa">
                        <span class="material-symbols-outlined">edit</span>
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    // Bind click handlers
    tableBody.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const row = btn.closest('tr');
            const clientId = row.dataset.clientId;
            const client = clientList.find(c => c.id === clientId);
            if (client) showClientDetail(client);
        });
    });

    tableBody.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const row = btn.closest('tr');
            const clientId = row.dataset.clientId;
            const client = clientList.find(c => c.id === clientId);
            if (client) editClient(client);
        });
    });
}

// ================================================
// CLIENT DETAIL MODAL
// ================================================

export function showClientDetail(client) {
    const statusLabels = {
        active: { text: 'Đang hoạt động', class: 'active' },
        paused: { text: 'Tạm dừng', class: 'paused' },
        inactive: { text: 'Không hoạt động', class: 'inactive' }
    };
    const status = statusLabels[client.status] || statusLabels.active;

    modal.open(`
        <div style="padding: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
                <div>
                    <h2 style="margin: 0; font-size: 24px;">${client.company_name}</h2>
                    <p style="color: #666; margin: 4px 0 0 0;">${client.contact_name}</p>
                </div>
                <button class="modal-close" style="background: none; border: none; cursor: pointer; padding: 8px;">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>

            <div style="display: flex; gap: 12px; margin-bottom: 24px;">
                <span class="status-badge ${status.class}">${status.text}</span>
                <span style="padding: 4px 12px; background: #E8F5E9; color: #2E7D32; border-radius: 999px; font-size: 12px; font-weight: 500;">
                    Khách hàng từ ${formatDate(client.created_at, 'short-yearless')}
                </span>
            </div>

            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; margin-bottom: 24px;">
                <div>
                    <h3 style="font-size: 14px; color: #666; margin-bottom: 12px;">📊 Tổng quan</h3>
                    <div style="background: #f5f5f5; padding: 16px; border-radius: 12px;">
                        <div style="margin-bottom: 12px;">
                            <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Tổng đã chi tiêu</div>
                            <div style="font-size: 24px; font-weight: 700; color: var(--md-sys-color-primary);">${formatCurrency(client.total_spent)}</div>
                        </div>
                        <div>
                            <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Chiến dịch đang chạy</div>
                            <div style="font-size: 20px; font-weight: 600;">${client.active_campaigns || 0}</div>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 style="font-size: 14px; color: #666; margin-bottom: 12px;">📞 Liên hệ</h3>
                    <div style="background: #f5f5f5; padding: 16px; border-radius: 12px;">
                        <div style="margin-bottom: 12px;">
                            <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Email</div>
                            <a href="mailto:${client.email}" style="color: var(--md-sys-color-primary); text-decoration: none;">${client.email}</a>
                        </div>
                        <div style="margin-bottom: 12px;">
                            <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Điện thoại</div>
                            <a href="tel:${client.phone}" style="color: var(--md-sys-color-primary); text-decoration: none;">${client.phone}</a>
                        </div>
                        <div>
                            <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Địa chỉ</div>
                            <div style="font-size: 14px;">${client.address || '--'}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Actions -->
            <div style="display: flex; gap: 12px;">
                <button onclick="editClientFromDetail('${client.id}')" class="btn btn-outlined" style="flex: 1;">
                    <span class="material-symbols-outlined">edit</span> Chỉnh sửa
                </button>
                <button onclick="window.open('tel:${client.phone}')" class="btn btn-outlined" style="flex: 1;">
                    <span class="material-symbols-outlined">call</span> Gọi ngay
                </button>
                <button onclick="window.open('mailto:${client.email}')" class="btn btn-filled" style="flex: 1;">
                    <span class="material-symbols-outlined">mail</span> Gửi email
                </button>
            </div>
        </div>
    `);
}

/**
 * Edit client modal (placeholder)
 */
export function editClient(client) {
    toast.info('Tính năng chỉnh sửa đang phát triển...');
}

// Global function for modal onclick
window.editClientFromDetail = (clientId) => {
    toast.info('Tính năng chỉnh sửa đang phát triển...');
};

export { toast, modal, DEMO_CLIENTS };

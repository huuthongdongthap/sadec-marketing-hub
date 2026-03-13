/**
 * Portal UI Module
 * UI Components: Modal, Render Functions
 */

import { Toast } from '../services/core-utils.js';
import { formatCurrency } from './portal-utils.js';
import { ModalManager } from '../shared/modal-utils.js';

// ================================================
// MODAL MANAGER (re-exported from shared/modal-utils.js)
// ================================================

// ================================================
// RENDER FUNCTIONS
// ================================================

/**
 * Render projects grid
 */
export function renderProjects(container, projectList) {
    if (!container || !projectList?.length) {
        container.innerHTML = '<div class="empty-state">Không có dự án nào</div>';
        return;
    }

    container.innerHTML = projectList.map(project => {
        const statusClass = `status-${project.status}`;
        const statusLabel = getStatusLabel(project.status);

        return `
            <div class="project-card" data-project-id="${project.id}">
                <div class="project-header">
                    <span class="project-type-badge">${getTypeIcon(project.type)}</span>
                    <span class="project-status ${statusClass}">${statusLabel}</span>
                </div>
                <h3 class="project-title">${project.name}</h3>
                <p class="project-description">${project.description || ''}</p>
                <div class="project-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${project.progress}%"></div>
                    </div>
                    <span class="progress-text">${project.progress}%</span>
                </div>
                <div class="project-meta">
                    <span class="meta-item">
                        <span class="meta-icon">💰</span>
                        <span>${formatCurrency(project.budget)}</span>
                    </span>
                    <span class="meta-item">
                        <span class="meta-icon">📅</span>
                        <span>${new Date(project.end_date).toLocaleDateString('vi-VN')}</span>
                    </span>
                </div>
            </div>
        `;
    }).join('');

    // Add click handlers
    container.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', () => {
            const projectId = card.dataset.projectId;
            const project = projectList.find(p => p.id === projectId);
            if (project && window.showProjectDetail) {
                window.showProjectDetail(project);
            }
        });
    });
}

/**
 * Render invoices table
 */
export function renderInvoices(tableBody, invoiceList) {
    if (!tableBody) return;

    if (!invoiceList?.length) {
        tableBody.innerHTML = '<tr><td colspan="6" class="empty-state">Không có hóa đơn nào</td></tr>';
        return;
    }

    tableBody.innerHTML = invoiceList.map(invoice => {
        const statusClass = `status-${invoice.status}`;
        const statusLabel = getStatusLabel(invoice.status);
        const remaining = invoice.amount - (invoice.paid || 0);

        return `
            <tr>
                <td>
                    <div class="invoice-info">
                        <strong>${invoice.invoice_number}</strong>
                        <small>${invoice.client_name}</small>
                    </div>
                </td>
                <td>${invoice.service}</td>
                <td>${formatCurrency(invoice.amount)}</td>
                <td>${formatCurrency(invoice.paid || 0)}</td>
                <td>${formatCurrency(remaining)}</td>
                <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon view-btn" title="Xem chi tiết">👁</button>
                        <button class="btn-icon download-btn" title="Tải PDF">📥</button>
                        ${remaining > 0 ? `<button class="btn-icon pay-btn" title="Thanh toán">💳</button>` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Update invoice stats
 */
export function updateInvoiceStats(invoiceList) {
    const statCards = document.querySelectorAll('.invoice-stat-value');
    if (!statCards.length || !invoiceList) return;

    const stats = {
        total: invoiceList.length,
        paid: invoiceList.filter(i => i.status === 'paid').length,
        pending: invoiceList.filter(i => i.status === 'pending').length,
        overdue: invoiceList.filter(i => i.status === 'overdue').length
    };

    statCards.forEach(card => {
        const type = card.dataset.stat;
        if (type && stats[type] !== undefined) {
            card.textContent = stats[type];
        }
    });
}

// ================================================
// HELPERS
// ================================================

function getStatusLabel(status) {
    const labels = {
        'active': 'Đang chạy',
        'paused': 'Tạm dừng',
        'completed': 'Hoàn thành',
        'cancelled': 'Đã hủy',
        'pending': 'Chưa thanh toán',
        'partial': 'Thanh toán một phần',
        'paid': 'Đã thanh toán',
        'overdue': 'Quá hạn'
    };
    return labels[status] || status;
}

function getTypeIcon(type) {
    const icons = {
        'ads': '📢',
        'seo': '🔍',
        'design': '🎨',
        'social': '📱',
        'website': '💻',
        'consulting': '💼'
    };
    return icons[type] || '📁';
}

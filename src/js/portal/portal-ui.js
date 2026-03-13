/**
 * Portal UI Module
 * UI Components: Modal, Render Functions
 */

import { Toast } from '../core/enhanced-utils.js';
import { formatCurrency } from './portal-utils.js';

// ================================================
// MODAL MANAGER
// ================================================

export class ModalManager {
    constructor() {
        this.overlay = null;
        this.modal = null;
    }

    open(content, options = {}) {
        // Create overlay if not exists
        if (!document.getElementById('modal-overlay')) {
            this.overlay = document.createElement('div');
            this.overlay.id = 'modal-overlay';
            this.overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;

            this.overlay.addEventListener('click', (e) => {
                if (e.target === this.overlay) {
                    this.close();
                }
            });

            document.body.appendChild(this.overlay);
        } else {
            this.overlay = document.getElementById('modal-overlay');
        }

        // Create modal content
        this.modal = document.createElement('div');
        this.modal.className = 'modal-content';
        this.modal.style.cssText = `
            background: var(--md-sys-color-surface);
            border-radius: 16px;
            max-width: 560px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            transform: scale(0.9);
            transition: transform 0.3s ease;
        `;

        this.modal.innerHTML = `
            ${content}
        `;

        this.overlay.appendChild(this.modal);

        // Animate in
        requestAnimationFrame(() => {
            this.overlay.style.opacity = '1';
            this.modal.style.transform = 'scale(1)';
        });

        // Close button handler
        this.modal.querySelector('.modal-close')?.addEventListener('click', () => this.close());

        // ESC key handler
        this.escHandler = (e) => {
            if (e.key === 'Escape') this.close();
        };
        document.addEventListener('keydown', this.escHandler);
    }

    close() {
        if (!this.overlay) return;

        this.overlay.style.opacity = '0';
        this.modal.style.transform = 'scale(0.9)';

        setTimeout(() => {
            this.overlay?.remove();
            this.overlay = null;
            this.modal = null;
            document.removeEventListener('keydown', this.escHandler);
        }, 300);
    }
}

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

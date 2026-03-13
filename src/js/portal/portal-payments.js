/**
 * Portal Payments Module
 * Invoice Payment Processing & Management
 */

import { supabase } from './supabase.js';
import { toast, modal } from './portal-ui.js';
import { formatCurrency } from '../shared/format-utils.js';

// ================================================
// PAYMENT ACTIONS
// ================================================

/**
 * Process online invoice payment
 */
export async function payInvoiceOnline(invoice) {
    if (!invoice) return;

    const modalContent = `
        <div class="payment-modal">
            <h2 class="modal-title">💳 Thanh toán hóa đơn</h2>
            <div class="invoice-summary">
                <p><strong>Hóa đơn:</strong> ${invoice.invoice_number}</p>
                <p><strong>Số tiền:</strong> ${formatCurrency(invoice.amount - invoice.paid)}</p>
                <p><strong>Khách hàng:</strong> ${invoice.client_name}</p>
            </div>

            <form id="paymentForm">
                <div class="form-group">
                    <label>Phương thức thanh toán</label>
                    <div class="payment-methods">
                        <label class="payment-method">
                            <input type="radio" name="payment_method" value="qr_code" checked>
                            <span class="method-icon">📱</span>
                            <span>QR Code</span>
                        </label>
                        <label class="payment-method">
                            <input type="radio" name="payment_method" value="bank_transfer">
                            <span class="method-icon">🏦</span>
                            <span>Chuyển khoản</span>
                        </label>
                        <label class="payment-method">
                            <input type="radio" name="payment_method" value="credit_card">
                            <span class="method-icon">💳</span>
                            <span>Thẻ tín dụng</span>
                        </label>
                    </div>
                </div>

                <div class="form-group">
                    <label>Ghi chú (tùy chọn)</label>
                    <textarea name="payment_note" rows="3" placeholder="Nhập ghi chú..."></textarea>
                </div>
            </form>

            <div class="modal-actions">
                <button id="cancelPaymentBtn" class="btn btn-outlined">Hủy</button>
                <button id="confirmPaymentBtn" class="btn btn-filled">Tiếp tục thanh toán</button>
            </div>
        </div>
    `;

    modal.open(modalContent);

    document.getElementById('cancelPaymentBtn')?.addEventListener('click', () => modal.close());
    document.getElementById('confirmPaymentBtn')?.addEventListener('click', async () => {
        const methodInput = document.querySelector('input[name="payment_method"]:checked');
        const noteInput = document.querySelector('textarea[name="payment_note"]');

        const paymentData = {
            invoice_id: invoice.id,
            amount: invoice.amount - invoice.paid,
            method: methodInput?.value || 'qr_code',
            note: noteInput?.value || ''
        };

        try {
            // Process payment directly
            const result = { success: true }; // Stub for now

            if (result.success) {
                toast.success('Thanh toán thành công!');
                modal.close();
                // Reload invoices to update status
                setTimeout(() => window.location.reload(), 1500);
            } else {
                toast.error(result.error || 'Thanh toán thất bại');
            }
        } catch (error) {
            // [DEV] 'Payment error:', error);
            toast.error('Có lỗi xảy ra khi thanh toán');
        }
    });
}

/**
 * Download invoice as PDF
 */
export async function downloadInvoicePDF(invoice) {
    if (!invoice) return;

    try {
        toast.info('Đang chuẩn bị PDF...');

        // In production, this would generate or fetch a PDF
        // For now, we'll simulate with a print dialog
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Hóa đơn ${invoice.invoice_number}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; }
                    .header { text-align: center; margin-bottom: 40px; }
                    .invoice-info { margin-bottom: 30px; }
                    .items-table { width: 100%; border-collapse: collapse; }
                    .items-table th, .items-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
                    .total { text-align: right; margin-top: 20px; font-size: 18px; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>MEKONG AGENCY</h1>
                    <p>HÓA ĐƠN THANH TOÁN</p>
                </div>
                <div class="invoice-info">
                    <p><strong>Số hóa đơn:</strong> ${invoice.invoice_number}</p>
                    <p><strong>Khách hàng:</strong> ${invoice.client_name}</p>
                    <p><strong>Dịch vụ:</strong> ${invoice.service}</p>
                    <p><strong>Ngày đến hạn:</strong> ${new Date(invoice.due_date).toLocaleDateString('vi-VN')}</p>
                    <p><strong>Trạng thái:</strong> ${getStatusLabel(invoice.status)}</p>
                </div>
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Mô tả</th>
                            <th>Số lượng</th>
                            <th>Đơn giá</th>
                            <th>Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${invoice.items.map(item => `
                            <tr>
                                <td>${item.name}</td>
                                <td>${item.quantity}</td>
                                <td>${formatCurrency(item.price)}</td>
                                <td>${formatCurrency(item.price * item.quantity)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="total">
                    Tổng cộng: ${formatCurrency(invoice.amount)}
                    ${invoice.paid > 0 ? `<br><small>Đã thanh toán: ${formatCurrency(invoice.paid)}</small>` : ''}
                    ${invoice.amount - invoice.paid > 0 ? `<br>Còn phải trả: ${formatCurrency(invoice.amount - invoice.paid)}` : ''}
                </div>
                <script>window.print();<\/script>
            </body>
            </html>
        `);
        printWindow.document.close();

        toast.success('Đang mở hộp thoại in');
    } catch (error) {
        // [DEV] 'Download PDF error:', error);
        toast.error('Không thể tạo PDF');
    }
}

/**
 * Mark invoice as paid (manual)
 */
export async function markInvoiceAsPaid(invoiceId) {
    if (!invoiceId) return;

    const confirmed = confirm('Xác nhận đã thanh toán hóa đơn này?');
    if (!confirmed) return;

    try {
        if (supabase) {
            const { data, error } = await supabase
                .from('invoices')
                .update({
                    status: 'paid',
                    paid_at: new Date().toISOString(),
                    paid_amount: 'full'
                })
                .eq('id', invoiceId);

            if (error) throw error;

            toast.success('Đã đánh dấu hóa đơn là đã thanh toán');
            window.location.reload();
        } else {
            // Demo mode
            toast.success('Demo mode: Đã đánh dấu hóa đơn là đã thanh toán');
            setTimeout(() => window.location.reload(), 1000);
        }
    } catch (error) {
        // [DEV] 'Mark as paid error:', error);
        toast.error('Không thể cập nhật trạng thái');
    }
}

// ================================================
// HELPERS
// ================================================

function getStatusLabel(status) {
    const labels = {
        'pending': 'Chưa thanh toán',
        'partial': 'Thanh toán một phần',
        'paid': 'Đã thanh toán',
        'cancelled': 'Đã hủy',
        'overdue': 'Quá hạn'
    };
    return labels[status] || status;
}

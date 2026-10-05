/**
 * Mekong Settlement Webhook Component
 * Trực quan hóa tiến trình khớp lệnh Webhook và giải ngân tự động 24/7
 * Tuân thủ nghiêm ngặt quy tắc modularity (< 200 dòng/file).
 */
(function() {
  let activeModal = null;

  function renderModalHtml(item) {
    const D = window.MekongSettlementData;
    const split = D.calculateSplit(item.amount);
    return `
      <div class="mwh-modal-overlay" id="mwh-overlay">
        <div class="mwh-modal-container">
          <div class="mwh-header">
            <div>
              <h3 style="margin:0;font-size:1.15rem;font-weight:700">⚡ Cổng Webhook Khớp Lệnh & Giải Ngân 24/7</h3>
              <p style="margin:4px 0 0;font-size:0.8rem;opacity:0.85">${item.gateway} • Mã: ${item.id}</p>
            </div>
            <button id="mwh-close-btn" style="background:none;border:none;color:#fff;font-size:1.5rem;cursor:pointer;line-height:1">&times;</button>
          </div>
          <div class="mwh-content">
            <div class="mwh-card" style="border-left:4px solid #059669">
              <div style="display:flex;justify-content:space-between;align-items:flex-start">
                <div>
                  <span class="mwh-badge-settled"><span class="material-symbols-outlined" style="font-size:14px">verified</span> Đã Khớp Lệnh & Giải Ngân</span>
                  <h4 style="margin:8px 0 4px;font-size:1.05rem;color:#0f172a">${item.orderDesc}</h4>
                  <p style="margin:0;font-size:0.85rem;color:#64748b">Mã GD: <strong>${item.orderId}</strong> • Ref: ${item.txRef}</p>
                </div>
                <div style="text-align:right">
                  <div style="font-size:1.25rem;font-weight:800;color:#059669">${D.formatVnd(item.amount)}</div>
                  <div style="font-size:0.75rem;color:#64748b">${item.txTime}</div>
                </div>
              </div>
              <div style="margin-top:12px;padding:8px 12px;background:#f1f5f9;border-radius:8px;font-size:0.75rem;font-family:monospace;color:#334155;word-break:break-all">
                Chữ ký bảo mật: <strong>${item.signature}</strong>
              </div>
            </div>

            <div>
              <h4 style="margin:0 0 8px;font-size:0.95rem;color:#1e293b">💰 Phân Bổ Dòng Tiền 4 Bên Minh Bạch (Tỷ Lệ Đã Cam Kết)</h4>
              <div class="mwh-split-grid">
                <div class="mwh-split-item" style="border-top:3px solid #0284c7">
                  <div style="font-size:0.75rem;color:#64748b">Homestay / Vườn (${split.homestay.percent})</div>
                  <div style="font-size:0.95rem;font-weight:700;color:#0284c7;margin:4px 0">${D.formatVnd(split.homestay.amount)}</div>
                  <div style="font-size:0.7rem;color:#475569">Chuyển STK chủ vườn</div>
                </div>
                <div class="mwh-split-item" style="border-top:3px solid #059669">
                  <div style="font-size:0.75rem;color:#64748b">Ekip 4K Co-Founder (${split.crew.percent})</div>
                  <div style="font-size:0.95rem;font-weight:700;color:#059669;margin:4px 0">${D.formatVnd(split.crew.amount)}</div>
                  <div style="font-size:0.7rem;color:#475569">Thù lao đạo diễn & máy</div>
                </div>
                <div class="mwh-split-item" style="border-top:3px solid #d97706">
                  <div style="font-size:0.75rem;color:#64748b">Khấu Hao Thiết Bị (${split.gear.percent})</div>
                  <div style="font-size:0.95rem;font-weight:700;color:#d97706;margin:4px 0">${D.formatVnd(split.gear.amount)}</div>
                  <div style="font-size:0.7rem;color:#475569">Bảo dưỡng Lens/Drone</div>
                </div>
                <div class="mwh-split-item" style="border-top:3px solid #7c3aed">
                  <div style="font-size:0.75rem;color:#64748b">Quỹ AI Hub (${split.hubFund.percent})</div>
                  <div style="font-size:0.95rem;font-weight:700;color:#7c3aed;margin:4px 0">${D.formatVnd(split.hubFund.amount)}</div>
                  <div style="font-size:0.7rem;color:#475569">Vận hành & đào tạo</div>
                </div>
              </div>
            </div>

            <div style="display:flex;gap:0.75rem;flex-wrap:wrap">
              <button class="mwh-btn mwh-btn-primary" id="mwh-sim-btn" style="flex:1">
                <span class="material-symbols-outlined" style="font-size:18px">autorenew</span> Giả Lập Giao Dịch Mới
              </button>
              <button class="mwh-btn mwh-btn-outline" id="mwh-zalo-btn">
                <span class="material-symbols-outlined" style="font-size:18px">share</span> Bắn Biên Lai Zalo
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  window.openSettlementWebhookModal = function(id) {
    const D = window.MekongSettlementData;
    if (!D) return;
    const item = (id && D.MOCK_WEBHOOKS.find(w => w.id === id)) || D.MOCK_WEBHOOKS[0];
    if (activeModal) activeModal.remove();

    const wrapper = document.createElement('div');
    wrapper.innerHTML = renderModalHtml(item);
    activeModal = wrapper.firstElementChild;
    document.body.appendChild(activeModal);

    document.getElementById('mwh-close-btn').onclick = window.closeSettlementWebhookModal;
    document.getElementById('mwh-overlay').onclick = (e) => {
      if (e.target.id === 'mwh-overlay') window.closeSettlementWebhookModal();
    };

    document.getElementById('mwh-sim-btn').onclick = () => {
      const newAmount = Math.floor(30 + Math.random() * 50) * 100000;
      const newWh = {
        id: D.generateWebhookId(),
        gateway: 'SePay Auto Hook',
        orderId: 'HUB-OCOP-' + Math.floor(10 + Math.random() * 90),
        orderDesc: 'Thanh toán cọc hợp đồng dịch vụ bản địa',
        amount: newAmount,
        payerName: 'ĐỐI TÁC THỬ NGHIỆM',
        payerPhone: '0939.888.999',
        status: 'settled',
        signature: 'hmac_sha256_sp_' + Math.random().toString(36).substring(2, 8),
        txTime: new Date().toLocaleTimeString('vi-VN') + ' ' + new Date().toLocaleDateString('vi-VN'),
        txRef: D.generateTxRef()
      };
      D.MOCK_WEBHOOKS.unshift(newWh);
      window.openSettlementWebhookModal(newWh.id);
    };

    document.getElementById('mwh-zalo-btn').onclick = () => {
      const msg = encodeURIComponent(`[MEKONG HUB] Biên lai giải ngân tự động ${item.orderId}: Đã giải ngân thành công số tiền ${D.formatVnd(item.amount)} vào STK đối tác.`);
      window.open(`https://zalo.me/0939123456?text=${msg}`, '_blank');
    };
  };

  window.closeSettlementWebhookModal = function() {
    if (activeModal) {
      activeModal.remove();
      activeModal = null;
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-open-settlement-webhook]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        window.openSettlementWebhookModal();
      });
    });
  });
})();

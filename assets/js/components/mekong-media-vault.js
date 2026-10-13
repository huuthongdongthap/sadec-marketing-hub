/**
 * Mekong Media Vault 4K Component
 * Giao diện xem trước Footage 4K & Đặt mua bản quyền VietQR (< 200 dòng/file).
 */
(function() {
  let activeModal = null;
  let currentFootageId = null;
  let selectedTier = 'social';

  function renderModalHtml(item) {
    const D = window.MekongMediaVaultData;
    const tier = D.LICENSE_TIERS[selectedTier];
    const items = D.FOOTAGE_ITEMS;

    return `
      <div class="mwh-modal-overlay" id="mmv-overlay">
        <div class="mwh-modal-container" style="max-width:760px">
          <div class="mwh-header" style="background:#1e1b4b">
            <div>
              <h3 style="margin:0;font-size:1.15rem;font-weight:700">🎬 Mekong Media Vault 4K • Kho Footage Bản Quyền</h3>
              <p style="margin:4px 0 0;font-size:0.8rem;opacity:0.85">S-Log3 ProRes • Đồng Tháp Mười Cinematic Stock</p>
            </div>
            <button id="mmv-close-btn" style="background:none;border:none;color:#fff;font-size:1.5rem;cursor:pointer">&times;</button>
          </div>
          <div class="mwh-content" style="gap:1.25rem">
            <div style="background:#0f172a;border-radius:12px;padding:2rem 1rem;position:relative;text-align:center;color:#fff;border:1px solid #334155">
              <span class="material-symbols-outlined" style="font-size:56px;color:#38bdf8;opacity:0.85">smart_display</span>
              <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:1.4rem;font-weight:800;letter-spacing:3px;color:rgba(255,255,255,0.18);pointer-events:none;white-space:nowrap;user-select:none">
                MEKONG MARKETING HUB • 4K WATERMARK
              </div>
              <div style="margin-top:0.5rem;font-size:0.95rem;font-weight:700">${item.title}</div>
              <div style="font-size:0.75rem;color:#94a3b8;margin-top:4px">${item.specs} | ${item.duration} | ${item.region}</div>
            </div>

            <div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:4px">
              ${items.map(it => `
                <button class="mon-pill ${it.id === item.id ? 'active' : ''}" style="white-space:nowrap;font-size:0.75rem" onclick="window.switchVaultFootage('${it.id}')">
                  ${it.title.split('-')[0]}
                </button>
              `).join('')}
            </div>

            <div style="background:#f8fafc;padding:12px 14px;border-radius:10px;font-size:0.85rem;color:#334155;border:1px solid #e2e8f0">
              <div style="margin-bottom:4px"><strong>Góc quay & Thiết bị:</strong> ${item.lens}</div>
              <div><strong>Mô tả cảnh:</strong> ${item.desc}</div>
            </div>

            <div>
              <label style="display:block;font-size:0.85rem;font-weight:700;margin-bottom:8px;color:#0f172a">Chọn Gói Bản Quyền Sử Dụng:</label>
              <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:8px">
                ${Object.values(D.LICENSE_TIERS).map(t => `
                  <div onclick="window.selectVaultTier('${t.id}')" style="cursor:pointer;border:2px solid ${selectedTier === t.id ? '#059669' : '#cbd5e1'};background:${selectedTier === t.id ? '#f0fdf4' : '#fff'};border-radius:10px;padding:10px;text-align:center">
                    <div style="font-size:0.8rem;font-weight:700;color:#0f172a">${t.name}</div>
                    <div style="font-size:1rem;font-weight:800;color:#059669;margin:4px 0">${D.formatPrice(t.price)}</div>
                    <div style="font-size:0.7rem;color:#64748b">${t.desc}</div>
                  </div>
                `).join('')}
              </div>
            </div>

            <div style="display:flex;gap:10px;margin-top:4px">
              <button onclick="window.checkoutVaultFootage('${item.id}')" class="mwh-btn mwh-btn-primary" style="flex:2;padding:12px;font-size:0.95rem">
                <span class="material-symbols-outlined" style="font-size:18px">qr_code_2</span> Nhận Footage 4K Qua VietQR (${D.formatPrice(tier.price)})
              </button>
              <button onclick="window.contactCustomBRoll('${item.title}')" class="mwh-btn mwh-btn-secondary" style="flex:1;padding:12px;font-size:0.85rem">
                <span class="material-symbols-outlined" style="font-size:18px">videocam</span> Đặt Quay Riêng
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  window.openMediaVaultModal = function(footageId) {
    const D = window.MekongMediaVaultData;
    if (!D) return;
    currentFootageId = footageId || D.FOOTAGE_ITEMS[0].id;
    if (activeModal) activeModal.remove();

    const wrapper = document.createElement('div');
    wrapper.innerHTML = renderModalHtml(D.getFootageById(currentFootageId));
    activeModal = wrapper.firstElementChild;
    document.body.appendChild(activeModal);

    document.getElementById('mmv-close-btn').onclick = window.closeMediaVaultModal;
    document.getElementById('mmv-overlay').onclick = (e) => {
      if (e.target.id === 'mmv-overlay') window.closeMediaVaultModal();
    };
  };

  window.closeMediaVaultModal = function() {
    if (activeModal) {
      activeModal.remove();
      activeModal = null;
    }
  };

  window.switchVaultFootage = function(id) {
    currentFootageId = id;
    if (activeModal) {
      const D = window.MekongMediaVaultData;
      const nextItem = D.getFootageById(id);
      const wrapper = document.createElement('div');
      wrapper.innerHTML = renderModalHtml(nextItem);
      activeModal.replaceWith(wrapper.firstElementChild);
      activeModal = wrapper.firstElementChild;
      document.getElementById('mmv-close-btn').onclick = window.closeMediaVaultModal;
      document.getElementById('mmv-overlay').onclick = (e) => {
        if (e.target.id === 'mmv-overlay') window.closeMediaVaultModal();
      };
    }
  };

  window.selectVaultTier = function(tierId) {
    selectedTier = tierId;
    window.switchVaultFootage(currentFootageId);
  };

  window.checkoutVaultFootage = function(id) {
    const D = window.MekongMediaVaultData;
    const item = D.getFootageById(id);
    const tier = D.LICENSE_TIERS[selectedTier];
    const refCode = 'VAULT-' + id.replace('FT-', '') + '-' + Math.floor(100 + Math.random() * 900);

    window.closeMediaVaultModal();
    alert(`Đã khởi tạo đơn cấp phép bản quyền #${refCode}: ${item.title} (${tier.name}) - ${D.formatPrice(tier.price)}. Chuyển tiếp VietQR tự động.`);
    const text = encodeURIComponent(`[MUA BẢN QUYỀN FOOTAGE 4K #${refCode}]\n- Mã clip: ${item.id}\n- Tựa đề: ${item.title}\n- Gói: ${tier.name}\n- Chi phí: ${D.formatPrice(tier.price)}`);
    window.open(`https://zalo.me/0939123456?text=${text}`, '_blank');
  };

  window.contactCustomBRoll = function(topic) {
    const text = encodeURIComponent(`[ĐẶT EKIP QUAY B-ROLL 4K THEO YÊU CẦU]\nTôi muốn đặt ekip cử máy quay 4K tại Đồng Tháp theo cảnh: ${topic}`);
    window.open(`https://zalo.me/0939123456?text=${text}`, '_blank');
  };

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-open-media-vault]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        window.openMediaVaultModal(el.getAttribute('data-footage-id'));
      });
    });
  });
})();

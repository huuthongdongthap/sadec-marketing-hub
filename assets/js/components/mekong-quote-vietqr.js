/**
 * Mekong Quote & Dynamic VietQR Modal Component (Cao Lãnh 2026)
 * Tuân thủ MD3 Tokens, xử lý tính toán báo giá và sinh mã QR thanh toán tức thì.
 */
(() => {
  const PACKAGES = {
    'ocop-brand': { name: 'Nhận Diện OCOP Bản Địa', price: 12000000, deposit: 6000000, desc: 'Logo, bao bì, tem nhãn chuẩn 3-4 sao OCOP, guideline hoàn chỉnh trong 7 ngày.' },
    'vibe-web': { name: 'Website Vibe Coding Cao Tốc', price: 9000000, deposit: 4500000, desc: 'Web chuẩn SEO di động, tốc độ tải < 1.2s, tích hợp form đặt hàng & Google Maps.' },
    'video-4k': { name: 'Xây Kênh Video 4K Bản Địa', price: 15000000, deposit: 7500000, desc: '8 video ngắn 4K/tháng, kịch bản độc quyền, tối ưu hóa thuật toán TikTok/Reels.' },
    'campaign': { name: 'Chiến Dịch Ra Mắt & Bùng Nổ', price: 35000000, deposit: 17500000, desc: 'Chiến dịch tổng lực 30 ngày: viral video, báo chí địa phương, mini game OCOP.' },
    'academy-basic': { name: 'Học Viện AI: Kỹ Năng Thế Kỷ 21', price: 3500000, deposit: 3500000, desc: 'Problem Deconstruction, Prompting thực chiến, Vibe coding cơ bản cho cá nhân.' },
    'academy-pro': { name: 'Học Viện AI: Doanh Nghiệp 1 Người', price: 8500000, deposit: 4250000, desc: 'Đóng gói quy trình tự động hóa AI, quản trị kênh 4K, hỗ trợ kèm cặp 1-1 trong 60 ngày.' }
  };

  const BANK_CONFIG = { bankId: 'MB', accountNo: '0939123456', accountName: 'MEKONG AGENCY HUB' };

  function formatVND(n) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
  }

  function createModalHtml() {
    if (document.getElementById('mekong-quote-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'mekong-quote-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.65);display:none;align-items:center;justify-content:center;z-index:99999;padding:1rem;backdrop-filter:blur(4px);';
    modal.innerHTML = `
      <div style="background:var(--md-sys-color-surface,#fff);max-width:520px;width:100%;border-radius:24px;box-shadow:0 20px 40px rgba(0,0,0,0.25);overflow:hidden;border:1px solid rgba(27,77,62,0.15);font-family:inherit;display:flex;flex-direction:column;max-height:92vh;">
        <div style="background:#1B4D3E;color:#fff;padding:1.25rem 1.5rem;display:flex;align-items:center;justify-content:space-between;">
          <div style="display:flex;align-items:center;gap:0.6rem;">
            <span class="material-symbols-outlined" style="color:#D4AF37;">verified</span>
            <span style="font-weight:700;font-size:1.1rem;" id="mq-modal-title">Báo Giá & Thanh Toán VietQR</span>
          </div>
          <button id="mq-close-btn" style="background:none;border:none;color:#fff;font-size:1.5rem;cursor:pointer;line-height:1;">&times;</button>
        </div>
        <div style="padding:1.5rem;overflow-y:auto;display:flex;flex-direction:column;gap:1.1rem;">
          <div>
            <label style="font-size:0.85rem;font-weight:700;color:#555;">GÓI DỊCH VỤ / KHÓA HỌC:</label>
            <select id="mq-package-select" style="width:100%;padding:0.75rem;border-radius:12px;border:1.5px solid #C0C9C2;margin-top:0.35rem;font-size:0.95rem;font-weight:600;color:#1B4D3E;">
              ${Object.entries(PACKAGES).map(([k, v]) => `<option value="${k}">${v.name} (${formatVND(v.price)})</option>`).join('')}
            </select>
            <p id="mq-package-desc" style="font-size:0.85rem;color:#666;margin-top:0.35rem;line-height:1.4;"></p>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
            <div>
              <label style="font-size:0.85rem;font-weight:700;color:#555;">TÊN ĐƠN VỊ / HỌC VIÊN:</label>
              <input type="text" id="mq-client-name" placeholder="Nguyễn Văn A" style="width:100%;padding:0.65rem;border-radius:10px;border:1.5px solid #C0C9C2;margin-top:0.25rem;font-size:0.9rem;" value="Khách Hàng Đất Sen Hồng">
            </div>
            <div>
              <label style="font-size:0.85rem;font-weight:700;color:#555;">SỐ ĐIỆN THOẠI / ZALO:</label>
              <input type="tel" id="mq-client-phone" placeholder="0901234567" style="width:100%;padding:0.65rem;border-radius:10px;border:1.5px solid #C0C9C2;margin-top:0.25rem;font-size:0.9rem;" value="0939123456">
            </div>
          </div>
          <div style="display:flex;gap:0.5rem;background:#F0F5EE;padding:0.35rem;border-radius:12px;">
            <button id="mq-opt-deposit" style="flex:1;padding:0.5rem;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:0.85rem;background:#1B4D3E;color:#fff;">Đặt Cọc (50%)</button>
            <button id="mq-opt-full" style="flex:1;padding:0.5rem;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:0.85rem;background:transparent;color:#555;">Trọn Gói (100%)</button>
          </div>
          <!-- VietQR Box -->
          <div style="background:#F9FAF8;border:1.5px dashed #1B4D3E;border-radius:16px;padding:1rem;display:flex;flex-direction:column;align-items:center;text-align:center;">
            <div style="font-size:0.8rem;font-weight:700;color:#B25E00;margin-bottom:0.4rem;">QUÉT MÃ VIETQR QUA MỌI APP NGÂN HÀNG</div>
            <img id="mq-qr-img" src="" alt="VietQR" style="width:180px;height:180px;object-fit:contain;background:#fff;padding:4px;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
            <div style="margin-top:0.6rem;font-size:1.15rem;font-weight:800;color:#1B4D3E;" id="mq-qr-amount">0 ₫</div>
            <div style="font-size:0.82rem;color:#444;margin-top:0.35rem;">Nội dung: <strong id="mq-qr-memo" style="color:#991B1B;background:#FEE2E2;padding:2px 6px;border-radius:4px;">HUB</strong></div>
            <div style="display:flex;gap:0.5rem;margin-top:0.75rem;">
              <button id="mq-copy-acc" style="background:#E2E8F0;border:none;padding:0.4rem 0.8rem;border-radius:8px;font-size:0.8rem;font-weight:600;cursor:pointer;">📋 Copy STK (${BANK_CONFIG.accountNo})</button>
              <button id="mq-copy-memo" style="background:#E2E8F0;border:none;padding:0.4rem 0.8rem;border-radius:8px;font-size:0.8rem;font-weight:600;cursor:pointer;">📋 Copy Cú Pháp</button>
            </div>
          </div>
        </div>
        <div style="background:#F0F5EE;padding:1rem 1.5rem;display:flex;gap:0.75rem;justify-content:flex-end;">
          <a id="mq-zalo-confirm" href="#" target="_blank" style="background:#0284C7;color:#fff;text-decoration:none;font-weight:700;font-size:0.9rem;padding:0.7rem 1.25rem;border-radius:10px;display:inline-flex;align-items:center;gap:0.4rem;">
            <span>Xác Nhận Qua Zalo</span>
            <span class="material-symbols-outlined" style="font-size:1.1rem;">send</span>
          </a>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    let isDeposit = true;

    function updateView() {
      const pkgKey = document.getElementById('mq-package-select').value;
      const pkg = PACKAGES[pkgKey] || PACKAGES['ocop-brand'];
      const phone = (document.getElementById('mq-client-phone').value || '0939123456').replace(/\D/g, '');
      const amount = isDeposit ? pkg.deposit : pkg.price;
      const memo = `HUB ${pkgKey.toUpperCase()} ${phone}`.slice(0, 25);

      document.getElementById('mq-package-desc').innerText = pkg.desc;
      document.getElementById('mq-qr-amount').innerText = formatVND(amount);
      document.getElementById('mq-qr-memo').innerText = memo;

      const qrUrl = `https://img.vietqr.io/image/${BANK_CONFIG.bankId}-${BANK_CONFIG.accountNo}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(memo)}&accountName=${encodeURIComponent(BANK_CONFIG.accountName)}`;
      document.getElementById('mq-qr-img').src = qrUrl;

      const zaloText = encodeURIComponent(`Chào Mekong Hub Cao Lãnh, tôi đã tạo mã thanh toán gói [${pkg.name}] số tiền ${formatVND(amount)}, nội dung: ${memo}`);
      document.getElementById('mq-zalo-confirm').href = `https://zalo.me/0939123456?text=${zaloText}`;
    }

    document.getElementById('mq-close-btn').onclick = () => { modal.style.display = 'none'; };
    modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

    document.getElementById('mq-package-select').onchange = updateView;
    document.getElementById('mq-client-phone').oninput = updateView;

    document.getElementById('mq-opt-deposit').onclick = () => {
      isDeposit = true;
      document.getElementById('mq-opt-deposit').style.background = '#1B4D3E';
      document.getElementById('mq-opt-deposit').style.color = '#fff';
      document.getElementById('mq-opt-full').style.background = 'transparent';
      document.getElementById('mq-opt-full').style.color = '#555';
      updateView();
    };

    document.getElementById('mq-opt-full').onclick = () => {
      isDeposit = false;
      document.getElementById('mq-opt-full').style.background = '#1B4D3E';
      document.getElementById('mq-opt-full').style.color = '#fff';
      document.getElementById('mq-opt-deposit').style.background = 'transparent';
      document.getElementById('mq-opt-deposit').style.color = '#555';
      updateView();
    };

    document.getElementById('mq-copy-acc').onclick = () => {
      navigator.clipboard.writeText(BANK_CONFIG.accountNo);
      alert(`Đã sao chép STK: ${BANK_CONFIG.accountNo} (${BANK_CONFIG.bankId})`);
    };

    document.getElementById('mq-copy-memo').onclick = () => {
      const memo = document.getElementById('mq-qr-memo').innerText;
      navigator.clipboard.writeText(memo);
      alert(`Đã sao chép nội dung: ${memo}`);
    };

    modal._updateView = updateView;
  }

  window.openMekongQuoteModal = (pkgKey = 'ocop-brand') => {
    createModalHtml();
    const modal = document.getElementById('mekong-quote-modal');
    const select = document.getElementById('mq-package-select');
    if (PACKAGES[pkgKey]) select.value = pkgKey;
    modal.style.display = 'flex';
    if (modal._updateView) modal._updateView();
  };
})();

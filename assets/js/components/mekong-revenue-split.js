/**
 * Mekong Revenue Split & Đối Soát Doanh Thu Minh Bạch (Cao Lãnh 2026)
 * Thể hiện cơ chế phân bổ dòng tiền 6 nguồn thu bản địa cho Co-founder & Đối tác OCOP.
 * Chuẩn MD3 Tokens, zero dependencies, < 200 dòng.
 */
(() => {
  const SPLIT_MODELS = {
    'cinema-tour': {
      title: 'Boutique Cinema Tour (12.000.000 ₫)',
      amount: 12000000,
      desc: 'Tour trải nghiệm văn hoá & sản xuất video điện ảnh cá nhân hoá.',
      splits: [
        { label: 'Co-founder Ekip quay dựng trực tiếp', pct: 35, color: '#1B4D3E' },
        { label: 'Đối tác Homestay & Nhà vườn ẩm thực', pct: 30, color: '#006A60' },
        { label: 'Hậu cần, di chuyển & bảo hiểm tour', pct: 20, color: '#D4AF37' },
        { label: 'Quỹ AI Hub & Vận hành Mekong Agency', pct: 15, color: '#4A635D' }
      ]
    },
    'video-ocop': {
      title: 'Hợp Đồng Sản Xuất Video OCOP (8.500.000 ₫)',
      amount: 8500000,
      desc: 'Sản xuất 3 video ngắn 4K cho làng nghề, xưởng nem, bột gạo.',
      splits: [
        { label: 'Co-founder Đạo diễn & Biên tập 4K', pct: 50, color: '#1B4D3E' },
        { label: 'Phân phối đa kênh & viral truyền thông', pct: 20, color: '#006A60' },
        { label: 'Khấu hao trang thiết bị & AI platform', pct: 20, color: '#D4AF37' },
        { label: 'Quỹ khuyến nông & chuyển đổi số tỉnh', pct: 10, color: '#4A635D' }
      ]
    },
    'brand-sponsor': {
      title: 'Brand Sponsorship Nhãn Hàng (25.000.000 ₫)',
      amount: 25000000,
      desc: 'Tài trợ lồng ghép thương hiệu trong phóng sự văn hoá bản địa.',
      splits: [
        { label: 'Co-founder Kịch bản & Sản xuất', pct: 45, color: '#1B4D3E' },
        { label: 'Hỗ trợ bối cảnh & điểm đến bà con', pct: 25, color: '#006A60' },
        { label: 'Phân phối dữ liệu AI target vùng ĐBSCL', pct: 20, color: '#D4AF37' },
        { label: 'Thuế & Pháp lý đối soát doanh nghiệp', pct: 10, color: '#4A635D' }
      ]
    },
    'affiliate-commerce': {
      title: 'Hoa Hồng OCOP Affiliate (15.000.000 ₫)',
      amount: 15000000,
      desc: 'Hoa hồng 15% trên 100M GMV bán lẻ nông sản đặc sản trực tuyến.',
      splits: [
        { label: 'Co-founder Video review & livestream', pct: 50, color: '#1B4D3E' },
        { label: 'Tái đầu tư voucher trợ giá khách mua', pct: 30, color: '#006A60' },
        { label: 'Phí hạ tầng phần mềm đối soát VietQR', pct: 20, color: '#D4AF37' }
      ]
    }
  };

  function formatVND(n) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
  }

  function createModal() {
    if (document.getElementById('mekong-revenue-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'mekong-revenue-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.65);display:none;align-items:center;justify-content:center;z-index:99998;padding:1rem;backdrop-filter:blur(4px);';
    modal.innerHTML = `
      <div style="background:var(--md-sys-color-surface,#fff);max-width:540px;width:100%;border-radius:24px;box-shadow:0 20px 40px rgba(0,0,0,0.25);overflow:hidden;border:1px solid rgba(27,77,62,0.15);font-family:inherit;display:flex;flex-direction:column;max-height:92vh;">
        <div style="background:#1B4D3E;color:#fff;padding:1.25rem 1.5rem;display:flex;align-items:center;justify-content:space-between;">
          <div style="display:flex;align-items:center;gap:0.6rem;">
            <span class="material-symbols-outlined" style="color:#D4AF37;">pie_chart</span>
            <span style="font-weight:700;font-size:1.1rem;">Bảng Đối Soát Doanh Thu Minh Bạch</span>
          </div>
          <button id="mr-close-btn" style="background:none;border:none;color:#fff;font-size:1.5rem;cursor:pointer;line-height:1;">&times;</button>
        </div>
        <div style="padding:1.5rem;overflow-y:auto;display:flex;flex-direction:column;gap:1.1rem;">
          <div>
            <label style="font-size:0.85rem;font-weight:700;color:#555;">CHỌN NGUỒN THU ĐỐI SOÁT:</label>
            <select id="mr-model-select" style="width:100%;padding:0.75rem;border-radius:12px;border:1.5px solid #C0C9C2;margin-top:0.35rem;font-size:0.95rem;font-weight:600;color:#1B4D3E;">
              ${Object.entries(SPLIT_MODELS).map(([k, v]) => `<option value="${k}">${v.title}</option>`).join('')}
            </select>
          </div>
          <div id="mr-desc-display" style="font-size:0.85rem;color:#666;font-style:italic;"></div>
          <div style="background:#F0F5EE;padding:1.2rem;border-radius:16px;border:1px solid rgba(27,77,62,0.15);">
            <div style="display:flex;justify-content:space-between;margin-bottom:0.75rem;font-weight:700;">
              <span>Tổng doanh thu hợp đồng:</span>
              <span id="mr-total-display" style="color:#1B4D3E;font-size:1.1rem;">0 ₫</span>
            </div>
            <div id="mr-bars-container" style="display:flex;flex-direction:column;gap:0.75rem;"></div>
          </div>
          <div style="background:#fff;border:1px solid #E0E6E1;padding:1rem;border-radius:14px;font-size:0.8rem;color:#444;line-height:1.5;">
            <div style="display:flex;align-items:center;gap:0.4rem;font-weight:700;color:#1B4D3E;margin-bottom:0.3rem;">
              <span class="material-symbols-outlined" style="font-size:1rem;color:#006A60;">lock_clock</span>
              Cam Kết Thanh Khoản & Tự Động Đối Soát
            </div>
            Dòng tiền được tự động giải ngân qua VietQR trong vòng 24h sau khi nghiệm thu từng giai đoạn. Không giam vốn, đối soát minh bạch từng hợp đồng.
          </div>
          <button id="mr-cta-btn" style="background:#1B4D3E;color:#fff;border:none;padding:0.85rem;border-radius:12px;font-weight:700;font-size:0.95rem;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:0.5rem;">
            <span class="material-symbols-outlined" style="color:#D4AF37;">handshake</span>
            Đăng Ký Gia Nhập Mạng Lưới Co-Founder
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    bindEvents();
  }

  function renderModel(key) {
    const model = SPLIT_MODELS[key];
    if (!model) return;
    document.getElementById('mr-desc-display').textContent = model.desc;
    document.getElementById('mr-total-display').textContent = formatVND(model.amount);
    const container = document.getElementById('mr-bars-container');
    container.innerHTML = '';

    model.splits.forEach(s => {
      const splitAmount = Math.round(model.amount * s.pct / 100);
      const row = document.createElement('div');
      row.innerHTML = `
        <div style="display:flex;justify-content:space-between;font-size:0.85rem;margin-bottom:0.25rem;">
          <span style="font-weight:600;color:#333;">${s.label} (${s.pct}%)</span>
          <span style="font-weight:700;color:${s.color};">${formatVND(splitAmount)}</span>
        </div>
        <div style="width:100%;height:8px;background:#E0E6E1;border-radius:4px;overflow:hidden;">
          <div style="width:${s.pct}%;height:100%;background:${s.color};border-radius:4px;"></div>
        </div>
      `;
      container.appendChild(row);
    });
  }

  function bindEvents() {
    const modal = document.getElementById('mekong-revenue-modal');
    const closeBtn = document.getElementById('mr-close-btn');
    const select = document.getElementById('mr-model-select');
    const ctaBtn = document.getElementById('mr-cta-btn');

    select.addEventListener('change', () => renderModel(select.value));
    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

    ctaBtn.addEventListener('click', () => {
      modal.style.display = 'none';
      window.location.href = '/partnership.html#apply';
    });
  }

  window.openMekongRevenueSplitModal = (modelKey = 'cinema-tour') => {
    createModal();
    const modal = document.getElementById('mekong-revenue-modal');
    const select = document.getElementById('mr-model-select');
    if (select && SPLIT_MODELS[modelKey]) {
      select.value = modelKey;
    }
    renderModel(select ? select.value : modelKey);
    modal.style.display = 'flex';
  };

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-revenue-split-trigger]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const key = btn.getAttribute('data-revenue-split-trigger') || 'cinema-tour';
        window.openMekongRevenueSplitModal(key);
      });
    });
  });
})();

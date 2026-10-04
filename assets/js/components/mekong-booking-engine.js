/**
 * Mekong Boutique Booking Engine (Cao Lãnh 2026)
 * Đặt lịch Cinema Tour & Ekip quay chụp thực địa OCOP Đồng Tháp.
 * Chuẩn MD3 Tokens, zero dependencies, < 200 dòng.
 */
(() => {
  const TOUR_PACKAGES = {
    'cinema-tour-1d': { name: 'Boutique Cinema Tour 1 Ngày', price: 6500000, key: 'cinema-tour-1d' },
    'cinema-tour-2d': { name: 'Ký Sự Điện Ảnh 2N1Đ Homestay', price: 12000000, key: 'cinema-tour-2d' },
    'ocop-shoot-1d': { name: 'Quay Thực Địa Xưởng OCOP 4K', price: 8500000, key: 'ocop-shoot-1d' }
  };

  const LOCATIONS = [
    'Làng Hoa Sa Đéc (Tân Quy Đông)',
    'Làng Nghề Bột Sa Đéc (Tân Phú Đông)',
    'Vườn Quýt Hồng & Lò Nem Lai Vung',
    'Khu Sinh Thái Rừng Tràm Gáo Giồng (Cao Lãnh)',
    'Vườn Xoài Cát Chu Cao Lãnh & Sen Tháp Mười'
  ];

  function formatVND(n) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
  }

  function createModal() {
    if (document.getElementById('mekong-booking-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'mekong-booking-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.65);display:none;align-items:center;justify-content:center;z-index:99998;padding:1rem;backdrop-filter:blur(4px);';
    modal.innerHTML = `
      <div style="background:var(--md-sys-color-surface,#fff);max-width:520px;width:100%;border-radius:24px;box-shadow:0 20px 40px rgba(0,0,0,0.25);overflow:hidden;border:1px solid rgba(27,77,62,0.15);font-family:inherit;display:flex;flex-direction:column;max-height:92vh;">
        <div style="background:#1B4D3E;color:#fff;padding:1.25rem 1.5rem;display:flex;align-items:center;justify-content:space-between;">
          <div style="display:flex;align-items:center;gap:0.6rem;">
            <span class="material-symbols-outlined" style="color:#D4AF37;">videocam</span>
            <span style="font-weight:700;font-size:1.1rem;">Đặt Lịch Tour & Ekip Quay 4K</span>
          </div>
          <button id="mb-close-btn" style="background:none;border:none;color:#fff;font-size:1.5rem;cursor:pointer;line-height:1;">&times;</button>
        </div>
        <div style="padding:1.5rem;overflow-y:auto;display:flex;flex-direction:column;gap:1rem;">
          <div>
            <label style="font-size:0.85rem;font-weight:700;color:#555;">LOẠI HÌNH TRẢI NGHIỆM / SẢN XUẤT:</label>
            <select id="mb-type-select" style="width:100%;padding:0.75rem;border-radius:12px;border:1.5px solid #C0C9C2;margin-top:0.35rem;font-size:0.95rem;font-weight:600;color:#1B4D3E;">
              ${Object.entries(TOUR_PACKAGES).map(([k, v]) => `<option value="${k}">${v.name} (${formatVND(v.price)})</option>`).join('')}
            </select>
          </div>
          <div>
            <label style="font-size:0.85rem;font-weight:700;color:#555;">ĐỊA ĐIỂM DỰ KIẾN TẠI ĐỒNG THÁP:</label>
            <select id="mb-loc-select" style="width:100%;padding:0.75rem;border-radius:12px;border:1.5px solid #C0C9C2;margin-top:0.35rem;font-size:0.95rem;color:#333;">
              ${LOCATIONS.map(loc => `<option value="${loc}">${loc}</option>`).join('')}
            </select>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
            <div>
              <label style="font-size:0.85rem;font-weight:700;color:#555;">NGÀY DỰ KIẾN:</label>
              <input type="date" id="mb-date-input" style="width:100%;padding:0.7rem;border-radius:12px;border:1.5px solid #C0C9C2;margin-top:0.35rem;box-sizing:border-box;font-family:inherit;">
            </div>
            <div>
              <label style="font-size:0.85rem;font-weight:700;color:#555;">SỐ ĐIỆN THOẠI (ZALO):</label>
              <input type="tel" id="mb-phone-input" placeholder="09xx xxx xxx" style="width:100%;padding:0.7rem;border-radius:12px;border:1.5px solid #C0C9C2;margin-top:0.35rem;box-sizing:border-box;font-family:inherit;">
            </div>
          </div>
          <div>
            <label style="font-size:0.85rem;font-weight:700;color:#555;">GHI CHÚ KỊCH BẢN / YÊU CẦU ĐẶC BIỆT:</label>
            <textarea id="mb-note-input" rows="2" placeholder="Ví dụ: Cần quay hoàng hôn rừng tràm, phỏng vấn nghệ nhân làm nem 40 năm..." style="width:100%;padding:0.7rem;border-radius:12px;border:1.5px solid #C0C9C2;margin-top:0.35rem;box-sizing:border-box;font-family:inherit;font-size:0.9rem;resize:vertical;"></textarea>
          </div>
          <div style="background:#F0F5EE;padding:1rem;border-radius:16px;border:1px solid rgba(27,77,62,0.15);display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div style="font-size:0.8rem;color:#666;">Đặt cọc giữ lịch ekip (50%):</div>
              <div id="mb-deposit-display" style="font-size:1.25rem;font-weight:800;color:#1B4D3E;">3.250.000 ₫</div>
            </div>
            <div style="font-size:0.75rem;color:#555;text-align:right;">
              <div>Ekip 4K chuyên nghiệp</div>
              <div style="color:#006A60;font-weight:600;">Cam kết bàn giao 48h</div>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:0.6rem;margin-top:0.25rem;">
            <button id="mb-submit-btn" style="background:#1B4D3E;color:#fff;border:none;padding:0.9rem;border-radius:12px;font-weight:700;font-size:0.95rem;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:0.5rem;transition:all 0.2s;">
              <span class="material-symbols-outlined" style="font-size:1.2rem;color:#D4AF37;">qr_code_2</span>
              Xác Nhận & Tạo Mã VietQR Cọc 50%
            </button>
            <a href="https://zalo.me/0939123456" target="_blank" rel="noopener" style="background:#0068FF;color:#fff;text-decoration:none;padding:0.8rem;border-radius:12px;font-weight:600;font-size:0.9rem;text-align:center;display:flex;align-items:center;justify-content:center;gap:0.5rem;">
              <span class="material-symbols-outlined" style="font-size:1.1rem;">chat</span>
              Chat Tư Vấn Kịch Bản Qua Zalo OA
            </a>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    bindEvents();
  }

  function bindEvents() {
    const modal = document.getElementById('mekong-booking-modal');
    const closeBtn = document.getElementById('mb-close-btn');
    const select = document.getElementById('mb-type-select');
    const depositDisplay = document.getElementById('mb-deposit-display');
    const submitBtn = document.getElementById('mb-submit-btn');
    const phoneInput = document.getElementById('mb-phone-input');

    const updateDisplay = () => {
      const pkg = TOUR_PACKAGES[select.value];
      if (pkg) depositDisplay.textContent = formatVND(pkg.price * 0.5);
    };

    select.addEventListener('change', updateDisplay);
    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

    submitBtn.addEventListener('click', () => {
      const pkgKey = select.value;
      const phone = phoneInput.value.trim() || '09xx';
      modal.style.display = 'none';
      if (typeof window.openMekongQuoteModal === 'function') {
        window.openMekongQuoteModal(pkgKey);
        const phoneField = document.getElementById('mq-phone-input');
        if (phoneField && phone !== '09xx') {
          phoneField.value = phone;
          phoneField.dispatchEvent(new Event('input'));
        }
      } else {
        alert('Đã tiếp nhận yêu cầu đặt lịch cho số: ' + phone + '. Ekip Mekong sẽ liên hệ trong 15 phút.');
      }
    });
  }

  window.openMekongBookingModal = (type = 'cinema-tour-1d') => {
    createModal();
    const modal = document.getElementById('mekong-booking-modal');
    const select = document.getElementById('mb-type-select');
    if (select && TOUR_PACKAGES[type]) {
      select.value = type;
      select.dispatchEvent(new Event('change'));
    }
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('mb-date-input');
    if (dateInput && !dateInput.value) dateInput.value = today;
    modal.style.display = 'flex';
  };

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-booking-trigger]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const type = btn.getAttribute('data-booking-trigger') || 'cinema-tour-1d';
        window.openMekongBookingModal(type);
      });
    });
  });
})();

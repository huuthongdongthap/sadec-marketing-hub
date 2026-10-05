/**
 * Mekong Partner Onboarding Portal
 * Cổng tiếp nhận hồ sơ gia nhập Mạng Lưới Đối Tác Bản Địa Đồng Tháp
 * Tuân thủ nghiêm ngặt quy tắc modularity (< 200 dòng/file).
 */
(function() {
  let modalElem = null;

  function renderModalHtml() {
    return `
      <div class="mwh-modal-overlay" id="mpo-overlay">
        <div class="mwh-modal-container" style="max-width:560px">
          <div class="mwh-header" style="background:#065f46">
            <div>
              <h3 style="margin:0;font-size:1.15rem;font-weight:700">🤝 Đăng Ký Gia Nhập Mạng Lưới Đối Tác Hub</h3>
              <p style="margin:4px 0 0;font-size:0.8rem;opacity:0.85">Đồng Tháp Mười • Hỗ trợ chuyển đổi số & Đón đoàn 4K</p>
            </div>
            <button id="mpo-close-btn" style="background:none;border:none;color:#fff;font-size:1.5rem;cursor:pointer">&times;</button>
          </div>
          <form class="mwh-content" id="mpo-form" style="gap:1rem">
            <div>
              <label style="display:block;font-size:0.85rem;font-weight:600;margin-bottom:4px;color:#334155">Tên Cơ Sở / Hộ Kinh Doanh *</label>
              <input type="text" id="mpo-biz-name" required placeholder="Ví dụ: Vườn Quýt Hồng Ba Rạng, Homestay Tư Cá..." style="width:100%;padding:10px 12px;border:1px solid #cbd5e1;border-radius:8px;font-size:0.9rem;box-sizing:border-box">
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem">
              <div>
                <label style="display:block;font-size:0.85rem;font-weight:600;margin-bottom:4px;color:#334155">Huyện / Thành Phố *</label>
                <select id="mpo-district" style="width:100%;padding:10px;border:1px solid #cbd5e1;border-radius:8px;font-size:0.9rem;background:#fff;box-sizing:border-box">
                  <option value="TP. Sa Đéc">TP. Sa Đéc</option>
                  <option value="TP. Cao Lãnh">TP. Cao Lãnh</option>
                  <option value="TP. Hồng Ngự">TP. Hồng Ngự</option>
                  <option value="Huyện Lai Vung">Huyện Lai Vung</option>
                  <option value="Huyện Tháp Mười">Huyện Tháp Mười</option>
                  <option value="Huyện Tam Nông">Huyện Tam Nông</option>
                  <option value="Huyện Thanh Bình">Huyện Thanh Bình</option>
                  <option value="Huyện Lấp Vò">Huyện Lấp Vò</option>
                  <option value="Huyện Châu Thành">Huyện Châu Thành</option>
                  <option value="Huyện Tân Hồng">Huyện Tân Hồng</option>
                  <option value="Huyện Cao Lãnh">Huyện Cao Lãnh</option>
                  <option value="Huyện Hồng Ngự">Huyện Hồng Ngự</option>
                </select>
              </div>
              <div>
                <label style="display:block;font-size:0.85rem;font-weight:600;margin-bottom:4px;color:#334155">Số Điện Thoại / Zalo *</label>
                <input type="tel" id="mpo-phone" required placeholder="09xx.xxx.xxx" style="width:100%;padding:10px 12px;border:1px solid #cbd5e1;border-radius:8px;font-size:0.9rem;box-sizing:border-box">
              </div>
            </div>
            <div>
              <label style="display:block;font-size:0.85rem;font-weight:600;margin-bottom:4px;color:#334155">Sản Phẩm Chủ Lực / Dịch Vụ</label>
              <input type="text" id="mpo-product" placeholder="Ví dụ: Nem chua, Xoài sấy, Phòng nghỉ sinh thái..." style="width:100%;padding:10px 12px;border:1px solid #cbd5e1;border-radius:8px;font-size:0.9rem;box-sizing:border-box">
            </div>
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:12px">
              <div style="font-size:0.85rem;font-weight:700;color:#166534;margin-bottom:4px">📊 Ước Tính Doanh Thu Cộng Thêm Khi Hợp Tác:</div>
              <div style="font-size:0.8rem;color:#15803d;line-height:1.4">
                • Đón 2-4 đoàn Tour/tháng: +12.000.000 ₫ đến 25.000.000 ₫.<br>
                • Phân phối nông sản OCOP qua kênh 4K: Tăng 30% - 40% doanh số bán lẻ.<br>
                • Cam kết đối soát giải ngân tự động 24/7 qua VietQR.
              </div>
            </div>
            <button type="submit" class="mwh-btn mwh-btn-primary" style="width:100%;padding:12px">
              <span class="material-symbols-outlined" style="font-size:18px">send</span> Gửi Hồ Sơ & Mở Kênh Zalo OA
            </button>
          </form>
        </div>
      </div>
    `;
  }

  window.openPartnerOnboardingModal = function() {
    if (modalElem) modalElem.remove();
    const wrapper = document.createElement('div');
    wrapper.innerHTML = renderModalHtml();
    modalElem = wrapper.firstElementChild;
    document.body.appendChild(modalElem);

    document.getElementById('mpo-close-btn').onclick = window.closePartnerOnboardingModal;
    document.getElementById('mpo-overlay').onclick = (e) => {
      if (e.target.id === 'mpo-overlay') window.closePartnerOnboardingModal();
    };

    document.getElementById('mpo-form').onsubmit = (e) => {
      e.preventDefault();
      const name = document.getElementById('mpo-biz-name').value;
      const dist = document.getElementById('mpo-district').value;
      const phone = document.getElementById('mpo-phone').value;
      const product = document.getElementById('mpo-product').value;
      const refCode = 'PARTNER-DT-' + Math.floor(1000 + Math.random() * 9000);

      window.closePartnerOnboardingModal();
      alert(`Đã tiếp nhận hồ sơ mã #${refCode} của cơ sở ${name} (${dist}). Điều phối viên Hub sẽ liên hệ Zalo ${phone} trong 24h.`);

      const text = encodeURIComponent(`[ĐĂNG KÝ ĐỐI TÁC HUB #${refCode}]\n- Cơ sở: ${name}\n- Địa phương: ${dist}\n- SĐT: ${phone}\n- Sản phẩm: ${product}`);
      window.open(`https://zalo.me/0939123456?text=${text}`, '_blank');
    };
  };

  window.closePartnerOnboardingModal = function() {
    if (modalElem) {
      modalElem.remove();
      modalElem = null;
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-open-partner-onboarding]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        window.openPartnerOnboardingModal();
      });
    });
  });
})();

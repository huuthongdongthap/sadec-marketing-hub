/**
 * Mekong OCOP Network Component
 * Trực quan hóa danh bạ mạng lưới đối tác bản địa 12 huyện thành Đồng Tháp
 * Tuân thủ nghiêm ngặt quy tắc modularity (< 200 dòng/file).
 */
(function() {
  let selectedDistrict = 'all';
  let selectedCategory = 'all';

  function renderStars(count) {
    return '★'.repeat(count) + '☆'.repeat(5 - count);
  }

  function renderPartnerCard(p) {
    return `
      <div class="mon-card" data-district="${p.district}" data-category="${p.category}">
        <div>
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
            <span class="mon-card-badge">${p.districtName}</span>
            <span class="mon-stars" title="${p.ocopRating} Sao OCOP">${renderStars(p.ocopRating)} <span style="font-size:0.75rem;color:#64748b">(${p.ocopRating}★)</span></span>
          </div>
          <h4 style="margin:0 0 6px;font-size:1.05rem;color:#0f172a;line-height:1.3">${p.name}</h4>
          <p style="margin:0 0 8px;font-size:0.85rem;color:#475569"><strong>Sản phẩm:</strong> ${p.product}</p>
          <p style="margin:0 0 12px;font-size:0.75rem;color:#64748b"><span class="material-symbols-outlined" style="font-size:13px;vertical-align:middle">location_on</span> ${p.address}</p>
          <div style="display:flex;justify-content:space-between;align-items:center;background:#f8fafc;padding:6px 10px;border-radius:8px;font-size:0.75rem;margin-bottom:12px">
            <span style="color:#64748b">Chính sách:</span>
            <span style="font-weight:700;color:#059669">${p.commission}</span>
          </div>
        </div>
        <div style="display:flex;gap:6px">
          <button class="mon-btn-connect" onclick="window.connectOcopPartner('${p.id}', '${p.name}')">
            <span class="material-symbols-outlined" style="font-size:16px">chat</span> Kết Nối Zalo
          </button>
          <button class="mon-btn-connect" style="background:#eff6ff;color:#1e40af;border-color:#bfdbfe" onclick="window.bookCrewForPartner('${p.name}', '${p.districtName}')">
            <span class="material-symbols-outlined" style="font-size:16px">videocam</span> Ekip 4K
          </button>
        </div>
      </div>
    `;
  }

  function renderNetwork(container) {
    const D = window.MekongOcopData;
    if (!D) return;
    const partners = D.filterPartners(selectedDistrict, selectedCategory);

    const districtPills = D.DISTRICTS.map(d =>
      `<button class="mon-pill ${selectedDistrict === d.id ? 'active' : ''}" data-dist="${d.id}">${d.name}</button>`
    ).join('');

    const categoryPills = D.CATEGORIES.map(c =>
      `<button class="mon-pill ${selectedCategory === c.id ? 'active' : ''}" data-cat="${c.id}">${c.name}</button>`
    ).join('');

    container.innerHTML = `
      <div class="mon-container">
        <div class="mon-header">
          <div class="mon-badge-hero"><span class="material-symbols-outlined" style="font-size:16px">spa</span> Mạng Lưới Đối Tác Bản Địa 2026</div>
          <h2 style="font-size:2rem;font-weight:800;color:#0f172a;margin:0 0 0.5rem">12 Huyện Thành Đất Sen Hồng Liên Kết Marketing</h2>
          <p style="color:#64748b;max-width:680px;margin:0 auto 1.5rem">Kết nối trực tiếp Hộ nông dân, Nhà vườn, Cơ sở OCOP với Đội ngũ Co-founder quay chụp 4K và Hệ sinh thái phân phối số.</p>
          <div class="mon-filter-row" id="mon-dist-filters">${districtPills}</div>
          <div class="mon-filter-row" id="mon-cat-filters">${categoryPills}</div>
        </div>
        <div style="margin-bottom:1rem;color:#475569;font-size:0.9rem">
          Hiển thị <strong>${partners.length}</strong> đối tác tiêu biểu đạt chuẩn liên kết:
        </div>
        <div class="mon-grid">${partners.map(renderPartnerCard).join('')}</div>
        <div style="text-align:center;margin-top:2.5rem">
          <button class="mon-pill active" style="font-size:0.95rem;padding:10px 24px" onclick="window.openPartnerOnboardingModal()">
            <span class="material-symbols-outlined" style="font-size:18px;vertical-align:middle">add_circle</span> Đăng Ký Gia Nhập Mạng Lưới Đối Tác Hub
          </button>
        </div>
      </div>
    `;

    container.querySelectorAll('#mon-dist-filters .mon-pill').forEach(btn => {
      btn.onclick = () => { selectedDistrict = btn.getAttribute('data-dist'); renderNetwork(container); };
    });

    container.querySelectorAll('#mon-cat-filters .mon-pill').forEach(btn => {
      btn.onclick = () => { selectedCategory = btn.getAttribute('data-cat'); renderNetwork(container); };
    });
  }

  window.connectOcopPartner = function(id, name) {
    const text = encodeURIComponent(`[MEKONG HUB] Chào đối tác ${name} (${id}), tôi muốn liên hệ kết nối hợp tác truyền thông và đón đoàn quay 4K.`);
    window.open(`https://zalo.me/0939123456?text=${text}`, '_blank');
  };

  window.bookCrewForPartner = function(partnerName, districtName) {
    if (typeof window.openMekongBookingModal === 'function') {
      window.openMekongBookingModal();
    } else {
      alert(`Đã lưu yêu cầu đặt ekip quay 4K tại: ${partnerName} (${districtName}). Vui lòng liên hệ Hotline 0939.123.456.`);
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    const mountPoint = document.getElementById('mon-mount-point');
    if (mountPoint) renderNetwork(mountPoint);
  });
})();

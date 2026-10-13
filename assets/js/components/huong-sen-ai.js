/**
 * Huong Sen AI Script Studio Component
 * Giao diện sinh kịch bản video ngắn Nam Bộ 3 hồi cho OCOP Đồng Tháp (< 200 dòng/file).
 */
(function() {
  let activeModal = null;
  let currentTopicId = 'nem-laivung';
  let currentTone = 'mientay';

  function renderModalHtml() {
    const D = window.HuongSenAiData;
    const res = D.generateScript(currentTopicId, currentTone);
    const script = res.script;
    const item = res.item;

    return `
      <div class="mwh-modal-overlay" id="hsai-overlay">
        <div class="mwh-modal-container" style="max-width:680px">
          <div class="mwh-header" style="background:#064e3b">
            <div>
              <h3 style="margin:0;font-size:1.15rem;font-weight:700">✍️ Hương Sen AI • Studio Kịch Bản Video Ngắn Nam Bộ</h3>
              <p style="margin:4px 0 0;font-size:0.8rem;opacity:0.85">AI Copilot Phương Ngữ Đồng Tháp • Tối Ưu Triệu View TikTok / Reels</p>
            </div>
            <button id="hsai-close-btn" style="background:none;border:none;color:#fff;font-size:1.5rem;cursor:pointer">&times;</button>
          </div>
          <div class="mwh-content" style="gap:1rem">
            <div>
              <label style="display:block;font-size:0.85rem;font-weight:700;margin-bottom:6px;color:#0f172a">Chọn Chủ Đề Sản Phẩm / Làng Nghề:</label>
              <div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:2px">
                ${D.DIALECT_SAMPLE_SCRIPTS.map(s => `
                  <button class="mon-pill ${s.topicId === currentTopicId ? 'active' : ''}" style="white-space:nowrap;font-size:0.8rem" onclick="window.selectHuongSenTopic('${s.topicId}')">
                    ${s.title.split('-')[0]}
                  </button>
                `).join('')}
              </div>
            </div>

            <div>
              <label style="display:block;font-size:0.85rem;font-weight:700;margin-bottom:6px;color:#0f172a">Chọn Văn Phong / Giọng Điệu:</label>
              <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:8px">
                ${Object.values(D.TONE_STYLES).map(t => `
                  <div onclick="window.selectHuongSenTone('${t.id}')" style="cursor:pointer;border:2px solid ${currentTone === t.id ? '#059669' : '#cbd5e1'};background:${currentTone === t.id ? '#f0fdf4' : '#fff'};border-radius:10px;padding:8px 10px;text-align:center">
                    <span class="material-symbols-outlined" style="font-size:22px;color:#059669">${t.icon}</span>
                    <div style="font-size:0.8rem;font-weight:700;color:#0f172a;margin-top:2px">${t.name}</div>
                    <div style="font-size:0.7rem;color:#64748b;margin-top:2px">${t.desc}</div>
                  </div>
                `).join('')}
              </div>
            </div>

            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:14px">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
                <span style="font-size:0.85rem;font-weight:700;color:#065f46">🎬 Phân Cảnh Kịch Bản 60 Giây Chi Tiết:</span>
                <span style="font-size:0.75rem;color:#64748b">${item.region} • ${item.product}</span>
              </div>

              <div style="margin-bottom:10px;padding:8px 10px;background:#fff;border-left:4px solid #ef4444;border-radius:4px">
                <div style="font-size:0.75rem;font-weight:700;color:#dc2626">HỒI 1: HOOK GIỮ CHÂN (0 - 3s)</div>
                <div style="font-size:0.85rem;color:#1e293b;margin-top:2px;font-style:italic">"${script.hook}"</div>
                <div style="font-size:0.7rem;color:#64748b;margin-top:2px">🎥 Góc máy: Cận cảnh macro giọt nước / biểu cảm giật mình / âm thanh ASMR giòn tan.</div>
              </div>

              <div style="margin-bottom:10px;padding:8px 10px;background:#fff;border-left:4px solid #3b82f6;border-radius:4px">
                <div style="font-size:0.75rem;font-weight:700;color:#2563eb">HỒI 2: STORYTELLING BẢN ĐỊA (4 - 45s)</div>
                <div style="font-size:0.85rem;color:#1e293b;margin-top:2px">"${script.story}"</div>
                <div style="font-size:0.7rem;color:#64748b;margin-top:2px">🎥 Góc máy: Flycam FPV lượn qua giàn hoa / nghệ nhân tâm sự / nhạc nền guitar Nam Bộ mộc mạc.</div>
              </div>

              <div style="padding:8px 10px;background:#fff;border-left:4px solid #10b981;border-radius:4px">
                <div style="font-size:0.75rem;font-weight:700;color:#059669">HỒI 3: KÊU GỌI HÀNH ĐỘNG (46 - 60s)</div>
                <div style="font-size:0.85rem;color:#1e293b;margin-top:2px;font-weight:600">"${script.cta}"</div>
                <div style="font-size:0.7rem;color:#64748b;margin-top:2px">🎥 Góc máy: Đưa sản phẩm ra màn hình / mã VietQR cọc tour nhấp nháy / logo Hub.</div>
              </div>
            </div>

            <div style="display:flex;gap:8px">
              <button onclick="window.copyHuongSenScript()" class="mwh-btn mwh-btn-secondary" style="flex:1;padding:12px;font-size:0.9rem">
                <span class="material-symbols-outlined" style="font-size:18px">content_copy</span> Sao Chép Kịch Bản
              </button>
              <button onclick="window.bookCrewWithScript('${item.title}')" class="mwh-btn mwh-btn-primary" style="flex:1.5;padding:12px;font-size:0.9rem">
                <span class="material-symbols-outlined" style="font-size:18px">videocam</span> Đặt Ekip 4K Quay Kịch Bản Này
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  window.openHuongSenAiModal = function(topicId) {
    if (topicId) currentTopicId = topicId;
    if (activeModal) activeModal.remove();

    const wrapper = document.createElement('div');
    wrapper.innerHTML = renderModalHtml();
    activeModal = wrapper.firstElementChild;
    document.body.appendChild(activeModal);

    document.getElementById('hsai-close-btn').onclick = window.closeHuongSenAiModal;
    document.getElementById('hsai-overlay').onclick = (e) => {
      if (e.target.id === 'hsai-overlay') window.closeHuongSenAiModal();
    };
  };

  window.closeHuongSenAiModal = function() {
    if (activeModal) {
      activeModal.remove();
      activeModal = null;
    }
  };

  window.selectHuongSenTopic = function(topicId) {
    currentTopicId = topicId;
    refreshModal();
  };

  window.selectHuongSenTone = function(toneId) {
    currentTone = toneId;
    refreshModal();
  };

  function refreshModal() {
    if (!activeModal) return;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = renderModalHtml();
    activeModal.replaceWith(wrapper.firstElementChild);
    activeModal = wrapper.firstElementChild;
    document.getElementById('hsai-close-btn').onclick = window.closeHuongSenAiModal;
    document.getElementById('hsai-overlay').onclick = (e) => {
      if (e.target.id === 'hsai-overlay') window.closeHuongSenAiModal();
    };
  }

  window.copyHuongSenScript = function() {
    const D = window.HuongSenAiData;
    const res = D.generateScript(currentTopicId, currentTone);
    const text = `[KỊCH BẢN TIKTOK 60S - HƯƠNG SEN AI]\n- Tiêu đề: ${res.item.title}\n- Phong cách: ${D.TONE_STYLES[currentTone].name}\n\n1. HOOK (0-3s): ${res.script.hook}\n2. NỘI DUNG (4-45s): ${res.script.story}\n3. KẾT (46-60s): ${res.script.cta}`;
    navigator.clipboard.writeText(text).then(() => {
      alert('Đã sao chép kịch bản vào bộ nhớ tạm! Bạn có thể dán vào CapCut / Word.');
    });
  };

  window.bookCrewWithScript = function(title) {
    window.closeHuongSenAiModal();
    if (typeof window.openMekongBookingModal === 'function') {
      window.openMekongBookingModal();
    } else {
      const text = encodeURIComponent(`[ĐẶT EKIP QUAY 4K THEO KỊCH BẢN HƯƠNG SEN AI]\n- Kịch bản: ${title}`);
      window.open(`https://zalo.me/0939123456?text=${text}`, '_blank');
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-open-huong-sen-ai]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        window.openHuongSenAiModal(el.getAttribute('data-topic-id'));
      });
    });
  });
})();

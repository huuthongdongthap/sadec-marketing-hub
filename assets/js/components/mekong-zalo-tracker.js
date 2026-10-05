/**
 * Mekong Zalo Mini App Tracking Simulator - UI Component (Cao Lãnh 2026)
 * Tích hợp dữ liệu từ mekong-zalo-tracker-data.js và style từ mekong-zalo-tracker.css (< 200 dòng).
 */
(() => {
  function initZaloTracker() {
    const data = window.MekongTrackerData;
    if (!data) return;
    const { BOOKING_STAGES, MOCK_BOOKINGS, formatVND, getCurrentStageInfo } = data;

    function renderProgressBar(booking) {
      const currentStage = getCurrentStageInfo(booking.status);
      const progressPercent = ((currentStage.step - 1) / (BOOKING_STAGES.length - 1)) * 100;

      return `
        <div class="mzt-progress-container">
          <div class="mzt-progress-bar" style="--progress: ${progressPercent}%"></div>
          <div class="mzt-progress-steps">
            ${BOOKING_STAGES.map((stage, idx) => {
              const isCompleted = idx + 1 < currentStage.step;
              const isCurrent = idx + 1 === currentStage.step;
              const isFuture = idx + 1 > currentStage.step;
              return `
                <div class="mzt-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isFuture ? 'future' : ''}" style="--step-color: ${stage.color};">
                  <div class="mzt-step-dot">${isCompleted ? '<span class="material-symbols-outlined" style="font-size:0.7rem;">check</span>' : `<span class="material-symbols-outlined" style="font-size:0.7rem;">${stage.icon}</span>`}</div>
                  <div class="mzt-step-label">${stage.label}</div>
                </div>`;
            }).join('')}
          </div>
        </div>
      `;
    }

    function renderBookingCard(booking) {
      const stageInfo = getCurrentStageInfo(booking.status);
      const isCompleted = booking.status === 'payout-done';
      const isActive = ['filming', 'editing', 'review'].includes(booking.status);

      return `
        <div class="mzt-booking-card ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}" data-id="${booking.id}">
          <div class="mzt-card-header">
            <div class="mzt-booking-id">${booking.id}</div>
            <div class="mzt-status-badge" style="background: ${stageInfo.color};">${stageInfo.label}</div>
          </div>
          <div class="mzt-card-body">
            <div class="mzt-row"><span class="mzt-label">Tour:</span><span class="mzt-value">${booking.tour}</span></div>
            <div class="mzt-row"><span class="mzt-label">Địa điểm:</span><span class="mzt-value">${booking.location}</span></div>
            <div class="mzt-row"><span class="mzt-label">Khách / ĐT:</span><span class="mzt-value">${booking.customer} • ${booking.phone}</span></div>
            <div class="mzt-row"><span class="mzt-label">Homestay:</span><span class="mzt-value">${booking.homestay} • ${booking.homestayPhone}</span></div>
            <div class="mzt-row"><span class="mzt-label">Ekip:</span><span class="mzt-value">${booking.crew} (${booking.createdAt})</span></div>
          </div>
          ${renderProgressBar(booking)}
          <div class="mzt-finance-summary">
            <div class="mzt-finance-title">Phân Bổ Doanh Thu (${formatVND(booking.total)})</div>
            <div class="mzt-split-grid">
              <div class="mzt-split-item"><span class="mzt-split-label">Homestay (30%)</span><span class="mzt-split-amount" style="color:#059669;">${formatVND(booking.homestayShare)}</span></div>
              <div class="mzt-split-item"><span class="mzt-split-label">Ekip (35%)</span><span class="mzt-split-amount" style="color:#1B4D3E;">${formatVND(booking.crewShare)}</span></div>
              <div class="mzt-split-item"><span class="mzt-split-label">Thiết bị (20%)</span><span class="mzt-split-amount" style="color:#B25E00;">${formatVND(booking.equipmentShare)}</span></div>
              <div class="mzt-split-item"><span class="mzt-split-label">AI Hub (15%)</span><span class="mzt-split-amount" style="color:#7C3AED;">${formatVND(booking.hubShare)}</span></div>
            </div>
            ${isCompleted ? `<div class="mzt-payout-badge"><span class="material-symbols-outlined">verified</span>Đã giải ngân đủ ${formatVND(booking.total)}</div>` : ''}
          </div>
          <div class="mzt-timeline-toggle" onclick="toggleTimeline('${booking.id}')">
            <span class="material-symbols-outlined">expand_more</span><span>Xem nhật ký tiến độ</span>
          </div>
          <div class="mzt-timeline" id="timeline-${booking.id}" style="display:none;">
            ${booking.timeline.map(t => `<div class="mzt-timeline-item"><div class="mzt-tl-time">${t.time}</div><div class="mzt-tl-content">${t.note}</div></div>`).join('')}
          </div>
          <div class="mzt-actions">
            ${!isCompleted ? `<button class="mzt-btn mzt-btn-primary" onclick="simulateNextStage('${booking.id}')"><span class="material-symbols-outlined">skip_next</span> Tiến Tới</button>` : ''}
            <button class="mzt-btn mzt-btn-secondary" onclick="openZaloNotify('${booking.id}')"><span class="material-symbols-outlined">chat</span> Zalo</button>
            ${booking.status === 'payout-pending' ? `<button class="mzt-btn mzt-btn-success" onclick="simulatePayout('${booking.id}')"><span class="material-symbols-outlined">payments</span> Giải Ngân</button>` : ''}
          </div>
        </div>
      `;
    }

    const activeCount = MOCK_BOOKINGS.filter(b => ['filming', 'editing', 'review'].includes(b.status)).length;
    const pendingPayoutCount = MOCK_BOOKINGS.filter(b => b.status === 'payout-pending').length;

    const widget = document.createElement('div');
    widget.id = 'mekong-zalo-tracker-widget';
    widget.className = 'mzt-widget collapsed';
    widget.innerHTML = `
      <div class="mzt-header">
        <h3><span class="material-symbols-outlined">tracking</span> Zalo Mini App Tracker</h3>
        <button class="mzt-close-btn" id="mzt-close-btn">&times;</button>
      </div>
      <div class="mzt-content">
        <div class="mzt-stats-bar">
          <div class="mzt-stat-item"><span class="mzt-stat-value">${MOCK_BOOKINGS.length}</span><span class="mzt-stat-label">Tổng Booking</span></div>
          <div class="mzt-stat-item"><span class="mzt-stat-value" style="color:#B25E00;">${activeCount}</span><span class="mzt-stat-label">Đang Quay/Dựng</span></div>
          <div class="mzt-stat-item"><span class="mzt-stat-value" style="color:#059669;">${MOCK_BOOKINGS.filter(b => b.status === 'payout-done').length}</span><span class="mzt-stat-label">Hoàn Tất</span></div>
          <div class="mzt-stat-item"><span class="mzt-stat-value" style="color:#D97706;">${pendingPayoutCount}</span><span class="mzt-stat-label">Chờ Giải Ngân</span></div>
        </div>
        <div class="mzt-bookings-list" id="mzt-bookings-list">
          ${MOCK_BOOKINGS.map(renderBookingCard).join('')}
        </div>
      </div>
    `;
    document.body.appendChild(widget);

    const fab = document.createElement('button');
    fab.id = 'mzt-fab';
    fab.className = 'mzt-fab';
    fab.setAttribute('aria-label', 'Mở Zalo Tracker');
    fab.innerHTML = `<span class="material-symbols-outlined">tracking</span><span class="mzt-badge" id="mzt-fab-badge">${activeCount}</span>`;
    document.body.appendChild(fab);

    let isOpen = false;
    function toggleWidget() {
      isOpen = !isOpen;
      widget.classList.toggle('collapsed', !isOpen);
      fab.style.display = isOpen ? 'none' : 'flex';
    }
    fab.onclick = toggleWidget;
    document.getElementById('mzt-close-btn').onclick = () => { if (isOpen) toggleWidget(); };

    window.toggleTimeline = (id) => {
      const el = document.getElementById('timeline-' + id);
      const icon = el.previousElementSibling.querySelector('.material-symbols-outlined');
      const isHidden = el.style.display === 'none';
      el.style.display = isHidden ? 'flex' : 'none';
      if (isHidden) el.style.flexDirection = 'column';
      icon.innerText = isHidden ? 'expand_less' : 'expand_more';
    };

    window.simulateNextStage = (id) => {
      const booking = MOCK_BOOKINGS.find(b => b.id === id);
      if (!booking || booking.status === 'payout-done') return;
      const currentIdx = BOOKING_STAGES.findIndex(s => s.id === booking.status);
      if (currentIdx < BOOKING_STAGES.length - 1) {
        const nextStage = BOOKING_STAGES[currentIdx + 1];
        booking.status = nextStage.id;
        booking.timeline.push({ stage: nextStage.id, time: new Date().toLocaleTimeString('vi-VN') + ' ' + new Date().toLocaleDateString('vi-VN'), note: `Tự động chuyển sang: ${nextStage.label}` });
        refreshWidget();
      }
    };

    window.simulatePayout = (id) => {
      const booking = MOCK_BOOKINGS.find(b => b.id === id);
      if (!booking || booking.status !== 'payout-pending') return;
      booking.status = 'payout-done';
      booking.timeline.push({ stage: 'payout-done', time: new Date().toLocaleTimeString('vi-VN') + ' ' + new Date().toLocaleDateString('vi-VN'), note: `VietQR payout thành công: Homestay ${formatVND(booking.homestayShare)}, Ekip ${formatVND(booking.crewShare)}, Hub ${formatVND(booking.hubShare)}` });
      refreshWidget();
    };

    window.openZaloNotify = (id) => {
      const booking = MOCK_BOOKINGS.find(b => b.id === id);
      if (!booking) return;
      const stageInfo = getCurrentStageInfo(booking.status);
      const text = encodeURIComponent(`[Mekong Tracker] Cập nhật ${booking.id}: ${booking.tour} - ${booking.customer}\nTrạng thái: ${stageInfo.label}\n${stageInfo.desc}\nXem chi tiết: https://mekong-hub.com/track/${booking.id}`);
      window.open(`https://zalo.me/0939123456?text=${text}`, '_blank');
    };

    function refreshWidget() {
      const list = document.getElementById('mzt-bookings-list');
      if (list) list.innerHTML = MOCK_BOOKINGS.map(renderBookingCard).join('');
      const active = MOCK_BOOKINGS.filter(b => ['filming', 'editing', 'review', 'payout-pending'].includes(b.status)).length;
      const badge = document.getElementById('mzt-fab-badge');
      if (badge) badge.innerText = active;
      const stats = document.querySelectorAll('.mzt-stat-value');
      if (stats.length >= 4) {
        stats[1].innerText = active;
        stats[2].innerText = MOCK_BOOKINGS.filter(b => b.status === 'payout-done').length;
        stats[3].innerText = MOCK_BOOKINGS.filter(b => b.status === 'payout-pending').length;
      }
    }

    window.openMekongTracker = () => { if (!isOpen) toggleWidget(); };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initZaloTracker);
  } else {
    initZaloTracker();
  }
})();

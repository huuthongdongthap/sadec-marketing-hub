/**
 * Mekong Quick Connect Widget (Cao Lãnh & Sa Đéc 2026)
 * Floating Action Button kết nối Zalo OA, Hotline, Báo giá và Bản đồ.
 */
(() => {
  function initQuickConnect() {
    if (document.getElementById('mekong-quick-connect-widget')) return;

    const style = document.createElement('style');
    style.textContent = `
      .mqc-fab {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 9998;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        font-family: inherit;
      }
      .mqc-menu {
        display: none;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 12px;
        background: rgba(255, 255, 255, 0.98);
        padding: 12px;
        border-radius: 16px;
        box-shadow: 0 12px 32px rgba(27, 77, 62, 0.18);
        border: 1px solid rgba(27, 77, 62, 0.15);
        backdrop-filter: blur(8px);
        min-width: 220px;
        animation: mqcSlideUp 0.25s ease-out;
      }
      @keyframes mqcSlideUp {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .mqc-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 12px;
        border-radius: 10px;
        color: #1B4D3E;
        text-decoration: none;
        font-size: 0.88rem;
        font-weight: 700;
        transition: all 0.2s;
        cursor: pointer;
        border: none;
        background: transparent;
        width: 100%;
        text-align: left;
      }
      .mqc-item:hover {
        background: #F0F5EE;
        transform: translateX(-3px);
      }
      .mqc-item .material-symbols-outlined {
        font-size: 1.25rem;
      }
      .mqc-btn-main {
        width: 56px;
        height: 56px;
        border-radius: 28px;
        background: #1B4D3E;
        color: #FFFFFF;
        border: 2px solid #D4AF37;
        box-shadow: 0 8px 20px rgba(27, 77, 62, 0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .mqc-btn-main:hover {
        transform: scale(1.08);
      }
      .mqc-pulse {
        animation: mqcPulse 2s infinite;
      }
      @keyframes mqcPulse {
        0% { box-shadow: 0 0 0 0 rgba(27, 77, 62, 0.5); }
        70% { box-shadow: 0 0 0 14px rgba(27, 77, 62, 0); }
        100% { box-shadow: 0 0 0 0 rgba(27, 77, 62, 0); }
      }
    `;
    document.head.appendChild(style);

    const widget = document.createElement('div');
    widget.id = 'mekong-quick-connect-widget';
    widget.className = 'mqc-fab';
    widget.innerHTML = `
      <div class="mqc-menu" id="mqc-menu">
        <a href="https://zalo.me/0939123456" target="_blank" class="mqc-item">
          <span class="material-symbols-outlined" style="color: #0284C7;">chat</span>
          <span>Chat Zalo OA (Tư vấn 1-1)</span>
        </a>
        <a href="tel:0939123456" class="mqc-item">
          <span class="material-symbols-outlined" style="color: #16A34A;">call</span>
          <span>Hotline: 0939.123.456</span>
        </a>
        <button type="button" class="mqc-item" id="mqc-booking-trigger">
          <span class="material-symbols-outlined" style="color: #059669;">videocam</span>
          <span>Đặt Tour & Quay 4K</span>
        </button>
        <button type="button" class="mqc-item" id="mqc-quote-trigger">
          <span class="material-symbols-outlined" style="color: #B25E00;">qr_code_2</span>
          <span>Báo Giá & VietQR</span>
        </button>
        <button type="button" class="mqc-item" id="mqc-split-trigger">
          <span class="material-symbols-outlined" style="color: #7C3AED;">pie_chart</span>
          <span>Đối Soát Doanh Thu</span>
        </button>
        <button type="button" class="mqc-item" id="mqc-tracker-trigger">
          <span class="material-symbols-outlined" style="color: #0284C7;">monitoring</span>
          <span>Zalo Mini App Tracker</span>
        </button>
        <button type="button" class="mqc-item" id="mqc-webhook-trigger">
          <span class="material-symbols-outlined" style="color: #059669;">bolt</span>
          <span>Webhook Giải Ngân 24/7</span>
        </button>
        <button type="button" class="mqc-item" id="mqc-partner-trigger">
          <span class="material-symbols-outlined" style="color: #D97706;">handshake</span>
          <span>Đăng Ký Đối Tác OCOP</span>
        </button>
        <a href="https://maps.google.com/?q=Cao+Lanh+Dong+Thap" target="_blank" class="mqc-item">
          <span class="material-symbols-outlined" style="color: #DC2626;">location_on</span>
          <span>Đại Bản Doanh Cao Lãnh</span>
        </a>
      </div>
      <button type="button" class="mqc-btn-main mqc-pulse" id="mqc-toggle-btn" aria-label="Liên hệ nhanh">
        <span class="material-symbols-outlined" id="mqc-icon" style="font-size: 1.7rem;">support_agent</span>
      </button>
    `;
    document.body.appendChild(widget);

    const menu = document.getElementById('mqc-menu');
    const toggleBtn = document.getElementById('mqc-toggle-btn');
    const icon = document.getElementById('mqc-icon');
    let isOpen = false;

    function toggleMenu() {
      isOpen = !isOpen;
      menu.style.display = isOpen ? 'flex' : 'none';
      icon.innerText = isOpen ? 'close' : 'support_agent';
      if (isOpen) {
        toggleBtn.classList.remove('mqc-pulse');
      } else {
        toggleBtn.classList.add('mqc-pulse');
      }
    }

    toggleBtn.onclick = (e) => {
      e.stopPropagation();
      toggleMenu();
    };

    const bindTrigger = (id, fn, arg) => {
      const el = document.getElementById(id);
      if (el) el.onclick = () => { toggleMenu(); if (typeof window[fn] === 'function') window[fn](arg); };
    };
    bindTrigger('mqc-booking-trigger', 'openMekongBookingModal', 'cinema-tour-1d');
    bindTrigger('mqc-quote-trigger', 'openMekongQuoteModal', 'ocop-brand');
    bindTrigger('mqc-split-trigger', 'openMekongRevenueSplitModal', 'cinema-tour');
    bindTrigger('mqc-tracker-trigger', 'openMekongTracker');
    bindTrigger('mqc-webhook-trigger', 'openSettlementWebhookModal');
    bindTrigger('mqc-partner-trigger', 'openPartnerOnboardingModal');

    document.addEventListener('click', (e) => {
      if (isOpen && !widget.contains(e.target)) {
        toggleMenu();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initQuickConnect);
  } else {
    initQuickConnect();
  }
})();

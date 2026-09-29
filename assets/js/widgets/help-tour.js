/**
 * ═══════════════════════════════════════════════════════════════════════════
 * HELP TOUR - Guided Onboarding Experience
 * ═══════════════════════════════════════════════════════════════════════════
 */

class HelpTour extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.currentStep = 0;
    this.steps = [];
    this.isOpen = false;
  }

  connectedCallback() {
    this.render();
    this.initSteps();
    this.checkFirstVisit();
  }

  initSteps() {
    this.steps = [
      {
        target: '.dashboard-title',
        title: 'Dashboard Overview',
        content: 'Đây là bảng điều khiển tổng quan - nơi bạn theo dõi tất cả chiến dịch marketing và hiệu suất kinh doanh.',
        position: 'bottom'
      },
      {
        target: '.search-glass',
        title: 'Quick Search',
        content: 'Tìm kiếm nhanh trong toàn hệ thống. Sử dụng Ctrl+K để mở Command Palette với đầy đủ tính năng.',
        position: 'bottom'
      },
      {
        target: '#notify-toggle',
        title: 'Notifications',
        content: 'Bật thông báo để nhận cập nhật về chiến dịch, leads và các sự kiện quan trọng.',
        position: 'bottom'
      },
      {
        target: 'kpi-card-widget[id="kpi-revenue"]',
        title: 'Revenue Tracking',
        content: 'KPI Card hiển thị doanh thu với trend indicator và sparkline chart theo thời gian thực.',
        position: 'bottom'
      },
      {
        target: '#new-project-btn',
        title: 'Create New Project',
        content: 'Bắt đầu dự án mới chỉ với 1 click. Hệ thống sẽ hướng dẫn bạn qua các bước thiết lập.',
        position: 'left'
      },
      {
        target: 'sadec-sidebar',
        title: 'Navigation Menu',
        content: 'Sidebar chứa tất cả các module: Dashboard, Campaigns, Leads, Analytics, Settings...',
        position: 'right'
      }
    ];
  }

  checkFirstVisit() {
    const hasSeenTour = localStorage.getItem('helpTourCompleted');
    if (!hasSeenTour) {
      // Show welcome toast
      setTimeout(() => {
        this.showWelcome();
      }, 1000);
    }
  }

  showWelcome() {
    const overlay = this.shadowRoot.querySelector('.welcome-overlay');
    const welcome = this.shadowRoot.querySelector('.welcome-card');

    overlay.style.display = 'block';
    setTimeout(() => {
      welcome.style.opacity = '1';
      welcome.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 10);
  }

  hideWelcome() {
    const overlay = this.shadowRoot.querySelector('.welcome-overlay');
    const welcome = this.shadowRoot.querySelector('.welcome-card');

    welcome.style.opacity = '0';
    welcome.style.transform = 'translate(-50%, -40%) scale(0.95)';
    setTimeout(() => {
      overlay.style.display = 'none';
    }, 300);
  }

  startTour() {
    this.hideWelcome();
    this.currentStep = 0;
    this.showStep();
  }

  showStep() {
    const step = this.steps[this.currentStep];
    const target = document.querySelector(step.target);

    if (!target) {
      this.nextStep();
      return;
    }

    // Highlight target
    target.style.transition = 'box-shadow 0.3s';
    target.style.boxShadow = '0 0 0 4px rgba(6, 182, 212, 0.5)';
    target.style.borderRadius = '8px';

    // Position tooltip
    const tooltip = this.shadowRoot.querySelector('.tour-tooltip');
    const rect = target.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    let top, left;
    switch (step.position) {
      case 'bottom':
        top = rect.bottom + 12;
        left = rect.left + (rect.width / 2);
        break;
      case 'top':
        top = rect.top - tooltipRect.height - 12;
        left = rect.left + (rect.width / 2);
        break;
      case 'left':
        top = rect.top + (rect.height / 2);
        left = rect.left - 12;
        break;
      case 'right':
        top = rect.top + (rect.height / 2);
        left = rect.right + 12;
        break;
    }

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
    tooltip.style.transform = 'translate(-50%, -50%)';
    tooltip.style.opacity = '1';

    // Update content
    tooltip.querySelector('.tour-title').textContent = step.title;
    tooltip.querySelector('.tour-content').textContent = step.content;
    tooltip.querySelector('.step-counter').textContent = `${this.currentStep + 1} / ${this.steps.length}`;

    this.isOpen = true;
  }

  clearHighlight() {
    document.querySelectorAll('[style*="box-shadow"]').forEach(el => {
      el.style.boxShadow = '';
      el.style.borderRadius = '';
    });
  }

  nextStep() {
    this.clearHighlight();
    this.currentStep++;

    if (this.currentStep >= this.steps.length) {
      this.endTour();
    } else {
      this.showStep();
    }
  }

  prevStep() {
    this.clearHighlight();
    this.currentStep = Math.max(0, this.currentStep - 1);
    this.showStep();
  }

  endTour() {
    this.clearHighlight();
    const tooltip = this.shadowRoot.querySelector('.tour-tooltip');
    tooltip.style.opacity = '0';

    setTimeout(() => {
      this.isOpen = false;
      localStorage.setItem('helpTourCompleted', 'true');
    }, 300);

    // Show completion toast
    this.showToast('Hoàn thành tour! Nhấn F1 bất cứ lúc nào để xem lại trợ giúp.');
  }

  showToast(message) {
    const toast = this.shadowRoot.querySelector('.toast');
    toast.querySelector('.toast-message').textContent = message;
    toast.style.display = 'flex';
    toast.style.opacity = '1';
    toast.style.transform = 'translate(-50%, 0)';

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translate(-50%, 20px)';
      setTimeout(() => {
        toast.style.display = 'none';
      }, 300);
    }, 3000);
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }

        /* Welcome Card */
        .welcome-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          z-index: 9998;
        }

        .welcome-card {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -40%) scale(0.95);
          background: var(--surface, #fff);
          border-radius: 20px;
          padding: 40px;
          max-width: 480px;
          width: 90%;
          text-align: center;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          transition: all 0.3s ease;
          opacity: 0;
          z-index: 9999;
        }

        .welcome-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 24px;
          background: linear-gradient(135deg, var(--primary, #06b6d4), var(--secondary, #8b5cf6));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .welcome-icon .material-symbols-outlined {
          color: white;
          font-size: 40px;
        }

        .welcome-card h2 {
          margin: 0 0 12px;
          font-size: 24px;
          color: var(--text, #111827);
        }

        .welcome-card p {
          margin: 0 0 32px;
          color: var(--muted, #6b7280);
          font-size: 15px;
          line-height: 1.6;
        }

        .welcome-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        .btn-primary {
          background: linear-gradient(135deg, var(--primary, #06b6d4), var(--secondary, #8b5cf6));
          color: white;
          border: none;
          padding: 12px 32px;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(6, 182, 212, 0.3);
        }

        .btn-secondary {
          background: var(--surface-2, #f3f4f6);
          color: var(--text, #111827);
          border: none;
          padding: 12px 32px;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-secondary:hover {
          background: #e5e7eb;
        }

        /* Tour Tooltip */
        .tour-tooltip {
          position: fixed;
          background: var(--surface, #fff);
          border-radius: 12px;
          padding: 20px;
          max-width: 320px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          z-index: 9999;
          opacity: 0;
          transition: opacity 0.3s;
          pointer-events: none;
        }

        .tour-tooltip::before {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 8px solid var(--surface, #fff);
        }

        .tour-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--text, #111827);
          margin: 0 0 8px;
        }

        .tour-content {
          font-size: 14px;
          color: var(--muted, #6b7280);
          line-height: 1.6;
          margin: 0 0 16px;
        }

        .tour-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .step-counter {
          font-size: 12px;
          color: var(--muted, #9ca3af);
        }

        .tour-buttons {
          display: flex;
          gap: 8px;
        }

        .tour-btn {
          background: var(--primary, #06b6d4);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 13px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .tour-btn:hover {
          background: #0891b2;
        }

        .tour-btn.secondary {
          background: transparent;
          color: var(--muted, #6b7280);
        }

        .tour-btn.skip {
          background: transparent;
          color: var(--muted, #9ca3af);
        }

        /* Toast */
        .toast {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translate(-50%, 20px);
          background: var(--text, #111827);
          color: white;
          padding: 16px 32px;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          display: none;
          align-items: center;
          gap: 12px;
          z-index: 10000;
          opacity: 0;
          transition: all 0.3s;
        }

        .toast .material-symbols-outlined {
          color: var(--primary, #06b6d4);
        }

        .toast-message {
          font-size: 14px;
          font-weight: 500;
        }

        /* Help Button (F1 trigger) */
        .help-fab {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary, #06b6d4), var(--secondary, #8b5cf6));
          color: white;
          border: none;
          cursor: pointer;
          box-shadow: 0 10px 25px rgba(6, 182, 212, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .help-fab:hover {
          transform: scale(1.1);
          box-shadow: 0 15px 30px rgba(6, 182, 212, 0.5);
        }

        .help-fab .material-symbols-outlined {
          font-size: 28px;
        }
      </style>

      <!-- Welcome Card -->
      <div class="welcome-overlay"></div>
      <div class="welcome-card">
        <div class="welcome-icon">
          <span class="material-symbols-outlined">celebration</span>
        </div>
        <h2>🎉 Chào mừng đến với Sa Đéc Marketing Hub!</h2>
        <p>Hệ thống quản trị marketing toàn diện - giúp bạn theo dõi chiến dịch, quản lý khách hàng và tối ưu hiệu suất.</p>
        <div class="welcome-actions">
          <button class="btn-primary" onclick="this.getRootNode().host.startTour()">Bắt đầu Tour</button>
          <button class="btn-secondary" onclick="this.getRootNode().host.hideWelcome()">Để sau</button>
        </div>
      </div>

      <!-- Tour Tooltip -->
      <div class="tour-tooltip">
        <h3 class="tour-title"></h3>
        <p class="tour-content"></p>
        <div class="tour-actions">
          <span class="step-counter"></span>
          <div class="tour-buttons">
            <button class="tour-btn secondary" onclick="this.getRootNode().host.prevStep()">← Trước</button>
            <button class="tour-btn skip" onclick="this.getRootNode().host.endTour()">Bỏ qua</button>
            <button class="tour-btn" onclick="this.getRootNode().host.nextStep()">Tiếp →</button>
          </div>
        </div>
      </div>

      <!-- Toast Notification -->
      <div class="toast">
        <span class="material-symbols-outlined">check_circle</span>
        <span class="toast-message"></span>
      </div>

      <!-- Help FAB -->
      <button class="help-fab" onclick="this.getRootNode().host.showWelcome()" title="Help (F1)">
        <span class="material-symbols-outlined">help</span>
      </button>
    `;

    // F1 key handler
    document.addEventListener('keydown', (e) => {
      if (e.key === 'F1') {
        e.preventDefault();
        this.showWelcome();
      }
    });
  }
}

if (!customElements.get('help-tour')) {
  customElements.define('help-tour', HelpTour);
}

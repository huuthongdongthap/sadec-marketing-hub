/**
 * Help & Tour Onboarding Component
 * Interactive guide for new users
 * @version 1.0.0 | 2026-03-13
 */

class HelpTour {
  constructor() {
    this.currentStep = 0;
    this.isTourActive = false;
    this.tourData = null;
    this.overlay = null;
    this.tooltip = null;
    this.init();
  }

  /**
   * Initialize help tour
   */
  init() {
    this.loadTourData();
    this.checkFirstVisit();
    this.createHelpButton();
    this.bindKeyboard();
  }

  /**
   * Load tour data for current page
   */
  loadTourData() {
    const path = window.location.pathname;
    
    // Dashboard tour
    if (path.includes('dashboard.html')) {
      this.tourData = {
        id: 'dashboard-tour',
        title: 'Khám phá Dashboard',
        steps: [
          {
            target: '#kpi-revenue',
            title: 'Doanh Thu',
            content: 'Theo dõi doanh thu theo thời gian thực với các chỉ số KPI quan trọng.',
            position: 'bottom'
          },
          {
            target: '#kpi-clients',
            title: 'Khách Hàng',
            content: 'Quản lý danh sách khách hàng và đối tác của bạn.',
            position: 'bottom'
          },
          {
            target: '#revenue-chart',
            title: 'Biểu Đồ Doanh Thu',
            content: 'Phân tích xu hướng doanh thu theo tháng/năm.',
            position: 'top'
          },
          {
            target: '#activity-feed',
            title: 'Hoạt Động Gần Đây',
            content: 'Xem lịch sử hoạt động và cập nhật mới nhất.',
            position: 'left'
          },
          {
            target: '#notification-bell',
            title: 'Thông Báo',
            content: 'Nhận thông báo real-time về các sự kiện quan trọng.',
            position: 'left',
            action: () => this.showToast('Mở notification bell để xem thông báo!', 'info')
          }
        ]
      };
    }
    // Leads tour
    else if (path.includes('leads.html')) {
      this.tourData = {
        id: 'leads-tour',
        title: 'Quản Lý Leads',
        steps: [
          {
            target: '.leads-table',
            title: 'Danh Sách Leads',
            content: 'Xem và quản lý tất cả leads của bạn.',
            position: 'bottom'
          },
          {
            target: '.filter-bar',
            title: 'Bộ Lọc',
            content: 'Lọc leads theo trạng thái, nguồn, hoặc người phụ trách.',
            position: 'bottom'
          },
          {
            target: '.add-lead-btn',
            title: 'Thêm Lead Mới',
            content: 'Tạo lead mới với thông tin liên hệ chi tiết.',
            position: 'right'
          }
        ]
      };
    }
    // Campaigns tour
    else if (path.includes('campaigns.html')) {
      this.tourData = {
        id: 'campaigns-tour',
        title: 'Quản Lý Chiến Dịch',
        steps: [
          {
            target: '.campaigns-grid',
            title: 'Danh Sách Chiến Dịch',
            content: 'Xem tất cả chiến dịch marketing đang chạy.',
            position: 'bottom'
          },
          {
            target: '.campaign-stats',
            title: 'Số Liệu Chiến Dịch',
            content: 'Theo dõi hiệu suất và ROI của từng chiến dịch.',
            position: 'top'
          }
        ]
      };
    }
    // Finance tour
    else if (path.includes('finance.html')) {
      this.tourData = {
        id: 'finance-tour',
        title: 'Quản Lý Tài Chính',
        steps: [
          {
            target: '.revenue-metrics',
            title: 'Chỉ Số Doanh Thu',
            content: 'Theo dõi doanh thu, chi phí và lợi nhuận.',
            position: 'bottom'
          },
          {
            target: '.transactions-table',
            title: 'Giao Dịch',
            content: 'Xem lịch sử giao dịch và sao kê.',
            position: 'top'
          }
        ]
      };
    }
    // Default welcome tour
    else {
      this.tourData = {
        id: 'welcome-tour',
        title: 'Chào Mừng Đến Với Sa Đéc Marketing Hub',
        steps: [
          {
            target: 'body',
            title: 'Chào Mừng!',
            content: 'Khám phá nền tảng marketing all-in-one cho doanh nghiệp của bạn.',
            position: 'center'
          }
        ]
      };
    }
  }

  /**
   * Check if first visit
   */
  checkFirstVisit() {
    const hasTakenTour = localStorage.getItem(`sadec-tour-${this.tourData?.id}`);
    if (!hasTakenTour && this.tourData?.steps?.length > 1) {
      // Show welcome toast with tour option
      setTimeout(() => {
        this.showWelcomePrompt();
      }, 2000);
    }
  }

  /**
   * Show welcome prompt
   */
  showWelcomePrompt() {
    if (window.Toast) {
      Toast.show({
        title: '👋 Chào mừng!',
        message: `Bạn muốn xem hướng dẫn ${this.tourData.title}?`,
        type: 'info',
        duration: 8000,
        action: {
          label: 'Bắt đầu',
          onClick: () => this.startTour()
        }
      });
    }
  }

  /**
   * Create help button
   */
  createHelpButton() {
    // Check if button already exists
    if (document.getElementById('help-tour-btn')) return;

    const helpBtn = document.createElement('button');
    helpBtn.id = 'help-tour-btn';
    helpBtn.className = 'help-tour-btn';
    helpBtn.innerHTML = `
      <span class="material-symbols-outlined">help_outline</span>
    `;
    helpBtn.title = 'Xem hướng dẫn (H)';
    helpBtn.onclick = () => this.startTour();

    // Style the button
    helpBtn.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, #00e5ff, #006a60);
      border: none;
      color: white;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(0, 229, 255, 0.4);
      z-index: 9998;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.3s, box-shadow 0.3s;
    `;
    helpBtn.onmouseenter = () => {
      helpBtn.style.transform = 'scale(1.1)';
      helpBtn.style.boxShadow = '0 6px 30px rgba(0, 229, 255, 0.6)';
    };
    helpBtn.onmouseleave = () => {
      helpBtn.style.transform = 'scale(1)';
      helpBtn.style.boxShadow = '0 4px 20px rgba(0, 229, 255, 0.4)';
    };

    document.body.appendChild(helpBtn);
  }

  /**
   * Bind keyboard shortcuts
   */
  bindKeyboard() {
    document.addEventListener('keydown', (e) => {
      // H key for help
      if (e.key === 'h' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        this.startTour();
      }
      // Escape to close tour
      if (e.key === 'Escape' && this.isTourActive) {
        this.endTour();
      }
      // Arrow keys for navigation
      if (this.isTourActive) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          this.nextStep();
        }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          this.prevStep();
        }
      }
    });
  }

  /**
   * Start tour
   */
  startTour() {
    if (!this.tourData || this.tourData.steps.length === 0) return;
    
    this.isTourActive = true;
    this.currentStep = 0;
    this.showStep(this.currentStep);
  }

  /**
   * Show tour step
   */
  showStep(index) {
    if (index < 0 || index >= this.tourData.steps.length) {
      this.endTour();
      return;
    }

    const step = this.tourData.steps[index];
    const target = document.querySelector(step.target);

    // Remove previous overlay and tooltip
    this.removeOverlay();
    this.removeTooltip();

    // Create overlay
    this.createOverlay(target);

    // Create tooltip
    this.createTooltip(step, index);

    // Scroll to target
    if (target && step.position !== 'center') {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /**
   * Create overlay
   */
  createOverlay(target) {
    this.overlay = document.createElement('div');
    this.overlay.className = 'tour-overlay';
    
    if (target) {
      const rect = target.getBoundingClientRect();
      const padding = 10;
      
      // Create cutout effect
      this.overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        z-index: 9999;
        clip-path: polygon(
          0 0,
          100% 0,
          100% ${rect.top - padding}px,
          ${rect.right + padding}px ${rect.top - padding}px,
          ${rect.right + padding}px ${rect.bottom + padding}px,
          ${rect.left - padding}px ${rect.bottom + padding}px,
          ${rect.left - padding}px ${rect.top - padding}px,
          0 ${rect.top - padding}px
        );
        transition: clip-path 0.3s ease;
      `;
    } else {
      this.overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        z-index: 9999;
      `;
    }

    document.body.appendChild(this.overlay);
  }

  /**
   * Create tooltip
   */
  createTooltip(step, index) {
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'tour-tooltip';
    
    const totalSteps = this.tourData.steps.length;
    const progress = ((index + 1) / totalSteps) * 100;

    this.tooltip.innerHTML = `
      <div class="tour-progress">
        <div class="tour-progress-bar" style="width: ${progress}%"></div>
      </div>
      <h3 class="tour-title">${step.title}</h3>
      <p class="tour-content">${step.content}</p>
      <div class="tour-actions">
        <button class="tour-btn tour-btn-skip" onclick="helpTour.endTour()">Bỏ qua</button>
        ${index > 0 ? '<button class="tour-btn tour-btn-prev" onclick="helpTour.prevStep()">← Trước</button>' : ''}
        ${index < totalSteps - 1 
          ? '<button class="tour-btn tour-btn-next" onclick="helpTour.nextStep()">Tiếp theo →</button>'
          : '<button class="tour-btn tour-btn-finish" onclick="helpTour.endTour()">Hoàn thành ✓</button>'
        }
      </div>
    `;

    // Position tooltip
    this.positionTooltip(step.position);

    document.body.appendChild(this.tooltip);
  }

  /**
   * Position tooltip
   */
  positionTooltip(position) {
    const styles = {
      top: { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '16px' },
      bottom: { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '16px' },
      left: { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: '16px' },
      right: { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: '16px' },
      center: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
    };

    Object.assign(this.tooltip.style, {
      position: 'absolute',
      background: 'white',
      borderRadius: '16px',
      padding: '24px',
      maxWidth: '400px',
      width: '90%',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
      zIndex: '10000',
      ...styles[position] || styles.bottom
    });
  }

  /**
   * Remove overlay
   */
  removeOverlay() {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
  }

  /**
   * Remove tooltip
   */
  removeTooltip() {
    if (this.tooltip) {
      this.tooltip.remove();
      this.tooltip = null;
    }
  }

  /**
   * Next step
   */
  nextStep() {
    this.currentStep++;
    this.showStep(this.currentStep);
  }

  /**
   * Previous step
   */
  prevStep() {
    this.currentStep--;
    this.showStep(this.currentStep);
  }

  /**
   * End tour
   */
  endTour() {
    this.isTourActive = false;
    this.removeOverlay();
    this.removeTooltip();
    
    // Mark tour as completed
    if (this.tourData?.id) {
      localStorage.setItem(`sadec-tour-${this.tourData.id}`, 'true');
    }
    
    this.showToast('Cảm ơn đã xem hướng dẫn! Nhấn H bất cứ lúc nào để xem lại.', 'success');
  }

  /**
   * Show toast
   */
  showToast(message, type = 'info') {
    if (window.Toast) {
      Toast.show({ title: type === 'success' ? '✓' : 'ℹ', message, type, duration: 3000 });
    }
    // Silent fallback when Toast unavailable
  }
}

// Initialize on DOM ready
let helpTour;
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    helpTour = new HelpTour();
  });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HelpTour;
}

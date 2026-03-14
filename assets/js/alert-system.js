/**
 * Alert Notification System
 * Usage: Alert.show('Thông báo', 'Nội dung', 'success')
 * Types: success, error, warning, info
 */
class AlertSystem {
  constructor() {
    this.container = null;
    this.alerts = [];
    this.alertId = 0;
  }

  init() {
    if (this.container) return;

    this.container = document.createElement('div');
    this.container.className = 'alert-container';
    this.container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 400px;
    `;
    document.body.appendChild(this.container);
  }

  show(title, message, type = 'info', duration = 5000) {
    this.init();

    const alertId = ++this.alertId;
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.dataset.alertId = alertId;

    const icons = {
      success: 'check_circle',
      error: 'error',
      warning: 'warning',
      info: 'info'
    };

    const colors = {
      success: { bg: 'rgba(0,230,118,0.1)', border: '#00e676', icon: '#00e676' },
      error: { bg: 'rgba(255,23,68,0.1)', border: '#ff1744', icon: '#ff1744' },
      warning: { bg: 'rgba(255,145,0,0.1)', border: '#ff9100', icon: '#ff9100' },
      info: { bg: 'rgba(0,229,255,0.1)', border: '#00e5ff', icon: '#00e5ff' }
    };

    const scheme = colors[type] || colors.info;

    alert.style.cssText = `
      background: ${scheme.bg};
      border-left: 4px solid ${scheme.border};
      border-radius: 8px;
      padding: 16px;
      display: flex;
      gap: 12px;
      align-items: flex-start;
      backdrop-filter: blur(10px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      animation: slideInRight 0.3s ease;
      min-width: 280px;
    `;

    alert.innerHTML = `
      <span class="material-symbols-outlined" style="color: ${scheme.icon}; font-size: 24px;">
        ${icons[type]}
      </span>
      <div style="flex: 1;">
        <div class="alert-title" style="font-weight: 600; color: #fff; margin-bottom: 4px;">
          ${title}
        </div>
        <div class="alert-message" style="color: rgba(255,255,255,0.7); font-size: 14px;">
          ${message}
        </div>
      </div>
      <button class="alert-close" style="background: none; border: none; color: rgba(255,255,255,0.5); cursor: pointer; padding: 0;">
        <span class="material-symbols-outlined" style="font-size: 18px;">close</span>
      </button>
      <div class="alert-progress" style="position: absolute; bottom: 0; left: 0; height: 3px; background: ${scheme.border}; border-radius: 0 0 0 8px; animation: shrink ${duration}ms linear;"></div>
    `;

    const closeBtn = alert.querySelector('.alert-close');
    closeBtn.addEventListener('click', () => this.dismiss(alertId));

    this.container.appendChild(alert);
    this.alerts.push({ id: alertId, element: alert });

    if (duration > 0) {
      setTimeout(() => this.dismiss(alertId), duration);
    }

    return alertId;
  }

  dismiss(alertId) {
    const alertIndex = this.alerts.findIndex(a => a.id === alertId);
    if (alertIndex === -1) return;

    const alert = this.alerts[alertIndex].element;
    alert.style.animation = 'slideOutRight 0.3s ease';

    setTimeout(() => {
      alert.remove();
      this.alerts = this.alerts.filter(a => a.id !== alertId);

      if (this.alerts.length === 0 && this.container) {
        this.container.remove();
        this.container = null;
      }
    }, 300);
  }

  success(title, message, duration) {
    return this.show(title, message, 'success', duration);
  }

  error(title, message, duration) {
    return this.show(title, message, 'error', duration);
  }

  warning(title, message, duration) {
    return this.show(title, message, 'warning', duration);
  }

  info(title, message, duration) {
    return this.show(title, message, 'info', duration);
  }
}

// Global instance
window.AlertSystem = new AlertSystem();

// Backwards compatibility
window.Alert = {
  show: (title, message, type, duration) => window.AlertSystem.show(title, message, type, duration),
  success: (title, message, duration) => window.AlertSystem.success(title, message, duration),
  error: (title, message, duration) => window.AlertSystem.error(title, message, duration),
  warning: (title, message, duration) => window.AlertSystem.warning(title, message, duration),
  info: (title, message, duration) => window.AlertSystem.info(title, message, duration),
  dismiss: (id) => window.AlertSystem.dismiss(id)
};

// Add animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }

  @keyframes shrink {
    from { width: 100%; }
    to { width: 0%; }
  }
`;
document.head.appendChild(style);

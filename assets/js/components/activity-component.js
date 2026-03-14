/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ACTIVITY COMPONENT — Sa Đéc Marketing Hub
 * Activity List / Timeline Component
 * ═══════════════════════════════════════════════════════════════════════════
 */

export class ActivityComponent {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    /**
     * Render activity list
     * @param {Array} activities - Activity items
     */
    render(activities) {
        if (!this.container) return;

        this.container.innerHTML = activities.map(activity => `
      <div class="activity-item">
        <div class="activity-icon ${activity.type}">
          <span class="material-symbols-outlined">${activity.icon}</span>
        </div>
        <div class="activity-content">
          <div class="activity-title">${activity.title}</div>
          <div class="activity-time">${activity.time}</div>
        </div>
      </div>
    `).join('');
    }

    /**
     * Add single activity to top of list
     * @param {Object} activity - Activity item
     */
    addActivity(activity) {
        if (!this.container) return;

        const item = document.createElement('div');
        item.className = 'activity-item';
        item.innerHTML = `
      <div class="activity-icon ${activity.type}">
        <span class="material-symbols-outlined">${activity.icon}</span>
      </div>
      <div class="activity-content">
        <div class="activity-title">${activity.title}</div>
        <div class="activity-time">${activity.time}</div>
      </div>
    `;

        // Add to top with animation
        item.style.opacity = '0';
        item.style.transform = 'translateY(-10px)';
        this.container.insertBefore(item, this.container.firstChild);

        // Animate in
        requestAnimationFrame(() => {
            item.style.transition = 'opacity 0.3s, transform 0.3s';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        });
    }

    /**
     * Remove activity
     * @param {number} index - Activity index
     */
    removeActivity(index) {
        const item = this.container.children[index];
        if (item) {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-10px)';
            setTimeout(() => item.remove(), 300);
        }
    }

    /**
     * Clear all activities
     */
    clear() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

export default ActivityComponent;

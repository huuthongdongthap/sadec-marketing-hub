/**
 * Activity Feed Widget
 * Real-time activity stream with animations
 */

class ActivityFeedWidget extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.activities = [];
        this.maxItems = 10;
    }

    static get observedAttributes() {
        return ['title', 'max-items'];
    }

    connectedCallback() {
        this.maxItems = parseInt(this.getAttribute('max-items')) || 10;
        this.render();
        this.loadActivities();
    }

    render() {
        const title = this.getAttribute('title') || 'Live Activity';

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }
                .feed-container {
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(10px);
                    border-radius: 16px;
                    padding: 24px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    max-height: 500px;
                    overflow-y: auto;
                }
                .feed-container::-webkit-scrollbar {
                    width: 6px;
                }
                .feed-container::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 3px;
                }
                .feed-container::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 3px;
                }
                .feed-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                .feed-title {
                    font-size: 20px;
                    font-weight: 600;
                    color: #ffffff;
                    font-family: 'Space Grotesk', sans-serif;
                }
                .feed-refresh {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    background: rgba(255, 255, 255, 0.05);
                    color: rgba(255, 255, 255, 0.8);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }
                .feed-refresh:hover {
                    background: rgba(255, 255, 255, 0.1);
                    transform: rotate(90deg);
                }
                .feed-refresh.spinning {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .activity-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .activity-item {
                    display: flex;
                    gap: 14px;
                    padding: 14px;
                    border-radius: 12px;
                    background: rgba(255, 255, 255, 0.03);
                    transition: all 0.3s ease;
                    opacity: 0;
                    transform: translateX(-20px);
                    animation: slideIn 0.4s ease forwards;
                }
                .activity-item:hover {
                    background: rgba(255, 255, 255, 0.06);
                    transform: translateX(4px);
                }
                @keyframes slideIn {
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                .activity-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    font-size: 20px;
                }
                .activity-icon.success { background: rgba(0, 230, 118, 0.15); color: #00e676; }
                .activity-icon.warning { background: rgba(255, 145, 0, 0.15); color: #ff9100; }
                .activity-icon.info { background: rgba(0, 229, 255, 0.15); color: #00e5ff; }
                .activity-icon.error { background: rgba(255, 23, 68, 0.15); color: #ff1744; }
                .activity-content {
                    flex: 1;
                    min-width: 0;
                }
                .activity-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: #ffffff;
                    margin-bottom: 4px;
                }
                .activity-description {
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.5);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .activity-time {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.4);
                    margin-top: 6px;
                }
                .activity-empty {
                    text-align: center;
                    padding: 40px 20px;
                    color: rgba(255, 255, 255, 0.4);
                }
                .activity-empty span {
                    font-size: 48px;
                    display: block;
                    margin-bottom: 12px;
                }
            </style>
            <div class="feed-container">
                <div class="feed-header">
                    <h3 class="feed-title">${title}</h3>
                    <button class="feed-refresh" title="Refresh" aria-label="Refresh activities">
                        <span class="material-symbols-outlined">refresh</span>
                    </button>
                </div>
                <div class="activity-list" id="activityList">
                    <div class="activity-empty">
                        <span class="material-symbols-outlined">notifications_none</span>
                        No recent activities
                    </div>
                </div>
            </div>
        `;

        this.attachEventListeners();
    }

    attachEventListeners() {
        const refreshBtn = this.shadowRoot.querySelector('.feed-refresh');
        refreshBtn.addEventListener('click', () => {
            refreshBtn.classList.add('spinning');
            this.loadActivities();
            setTimeout(() => refreshBtn.classList.remove('spinning'), 1000);
        });
    }

    async loadActivities() {
        // Try to load from API
        if (window.AdminAPI?.loadActivities) {
            try {
                const activities = await window.AdminAPI.loadActivities({ limit: this.maxItems });
                this.renderActivities(activities);
                return;
            } catch (error) {
                console.warn('Failed to load activities from API, using demo data');
            }
        }

        // Fallback to demo data
        this.renderActivities(this.getDemoActivities());
    }

    getDemoActivities() {
        const types = ['success', 'info', 'warning'];
        const activities = [
            {
                type: 'success',
                icon: 'person_add',
                title: 'New Lead Generated',
                description: '2 mins ago via Facebook Ads',
                time: '2m'
            },
            {
                type: 'info',
                icon: 'trending_up',
                title: 'Campaign Optimized',
                description: 'AI adjusted bids for Summer Sale',
                time: '5m'
            },
            {
                type: 'success',
                icon: 'payments',
                title: 'Payment Received',
                description: 'Client X paid invoice #9921',
                time: '12m'
            },
            {
                type: 'warning',
                icon: 'warning',
                title: 'Budget Alert',
                description: 'Campaign Y reached 80% of budget',
                time: '25m'
            },
            {
                type: 'info',
                icon: 'mail',
                title: 'Email Campaign Sent',
                description: 'Newsletter #42 delivered to 1,234 recipients',
                time: '1h'
            },
            {
                type: 'success',
                icon: 'task_alt',
                title: 'Project Milestone Completed',
                description: 'Website redesign Phase 2 done',
                time: '2h'
            },
            {
                type: 'info',
                icon: 'schedule',
                title: 'Meeting Scheduled',
                description: 'Client kickoff call tomorrow at 10am',
                time: '3h'
            },
            {
                type: 'success',
                icon: 'star',
                title: '5-Star Review Received',
                description: 'New Google review from Customer Z',
                time: '5h'
            }
        ];

        return activities.slice(0, this.maxItems);
    }

    renderActivities(activities) {
        const activityList = this.shadowRoot.getElementById('activityList');
        if (!activityList) return;

        if (!activities || activities.length === 0) {
            activityList.innerHTML = `
                <div class="activity-empty">
                    <span class="material-symbols-outlined">notifications_none</span>
                    No recent activities
                </div>
            `;
            return;
        }

        activityList.innerHTML = activities.map((activity, index) => `
            <div class="activity-item" style="animation-delay: ${index * 0.1}s">
                <div class="activity-icon ${activity.type}">
                    <span class="material-symbols-outlined">${activity.icon}</span>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-description">${activity.description}</div>
                    <div class="activity-time">${activity.time} ago</div>
                </div>
            </div>
        `).join('');
    }

    addActivity(activity) {
        this.activities.unshift({ ...activity, time: 'now' });
        if (this.activities.length > this.maxItems) {
            this.activities.pop();
        }
        this.renderActivities(this.activities);
    }
}

customElements.define('activity-feed-widget', ActivityFeedWidget);

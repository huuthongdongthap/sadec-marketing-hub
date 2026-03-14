/**
 * Notification Preferences Panel
 * Cho phép người dùng tùy chỉnh notification settings
 *
 * Features:
 * - Toggle notification types
 * - Email/SMS/Push preferences
 * - Quiet hours settings
 * - Test notification
 *
 * Usage:
 *   NotificationPreferences.init('#prefs-container');
 */

import { supabase } from '../../portal/supabase.js';
import { Logger } from '../shared/logger.js';

class NotificationPreferences {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        if (!this.container) {
            Logger.warn('[NotificationPrefs] Container not found:', containerSelector);
            return;
        }

        this.preferences = {
            email: true,
            push: true,
            sms: false,
            types: {
                campaign: true,
                lead: true,
                conversion: false,
                revenue: true,
                system: true
            },
            quietHours: {
                enabled: false,
                start: '22:00',
                end: '07:00'
            }
        };

        this.init();
    }

    /**
     * Initialize preferences panel
     */
    async init() {
        await this.loadPreferences();
        this.render();
        this.bindEvents();
        Logger.info('[NotificationPrefs] Initialized');
    }

    /**
     * Load user preferences from Supabase
     */
    async loadPreferences() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('user_preferences')
                .select('notification_settings')
                .eq('user_id', user.id)
                .single();

            if (error || !data) {
                Logger.debug('[NotificationPrefs] Using defaults');
                return;
            }

            this.preferences = { ...this.preferences, ...data.notification_settings };
        } catch (err) {
            Logger.error('[NotificationPrefs] Load error:', err);
        }
    }

    /**
     * Save preferences to Supabase
     */
    async savePreferences() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('user_preferences')
                .upsert({
                    user_id: user.id,
                    notification_settings: this.preferences
                }, {
                    onConflict: 'user_id'
                });

            if (error) throw error;

            Logger.info('[NotificationPrefs] Saved');
            this.showToast('Đã lưu tùy chỉnh thông báo', 'success');
        } catch (err) {
            Logger.error('[NotificationPrefs] Save error:', err);
            this.showToast('Lỗi khi lưu', 'error');
        }
    }

    /**
     * Render preferences panel
     */
    render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="notification-preferences">
                <div class="prefs-header">
                    <h3 class="prefs-title">
                        <span class="material-symbols-outlined">notifications</span>
                        Thông báo
                    </h3>
                    <button class="prefs-close btn-icon" aria-label="Đóng">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div class="prefs-body">
                    <!-- Channels Section -->
                    <section class="prefs-section">
                        <h4 class="prefs-section-title">Kênh thông báo</h4>

                        <div class="pref-item">
                            <div class="pref-info">
                                <span class="material-symbols-outlined pref-icon">email</span>
                                <div>
                                    <div class="pref-label">Email</div>
                                    <div class="pref-desc">Nhận thông báo qua email</div>
                                </div>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" ${this.preferences.email ? 'checked' : ''} data-pref="email">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>

                        <div class="pref-item">
                            <div class="pref-info">
                                <span class="material-symbols-outlined pref-icon">notifications_active</span>
                                <div>
                                    <div class="pref-label">Push Notification</div>
                                    <div class="pref-desc">Thông báo đẩy trên trình duyệt</div>
                                </div>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" ${this.preferences.push ? 'checked' : ''} data-pref="push">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>

                        <div class="pref-item">
                            <div class="pref-info">
                                <span class="material-symbols-outlined pref-icon">sms</span>
                                <div>
                                    <div class="pref-label">SMS</div>
                                    <div class="pref-desc">Tin nhắn văn bản (có phí)</div>
                                </div>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" ${this.preferences.sms ? 'checked' : ''} data-pref="sms">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </section>

                    <!-- Notification Types Section -->
                    <section class="prefs-section">
                        <h4 class="prefs-section-title">Loại thông báo</h4>

                        <div class="pref-item">
                            <div class="pref-info">
                                <span class="material-symbols-outlined pref-icon">campaign</span>
                                <div>
                                    <div class="pref-label">Chiến dịch</div>
                                    <div class="pref-desc">Cập nhật chiến dịch marketing</div>
                                </div>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" ${this.preferences.types.campaign ? 'checked' : ''} data-type="campaign">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>

                        <div class="pref-item">
                            <div class="pref-info">
                                <span class="material-symbols-outlined pref-icon">person_add</span>
                                <div>
                                    <div class="pref-label">Khách hàng mới</div>
                                    <div class="pref-desc">Khi có khách hàng tiềm năng mới</div>
                                </div>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" ${this.preferences.types.lead ? 'checked' : ''} data-type="lead">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>

                        <div class="pref-item">
                            <div class="pref-info">
                                <span class="material-symbols-outlined pref-icon">trending_up</span>
                                <div>
                                    <div class="pref-label">Chuyển đổi</div>
                                    <div class="pref-desc">Khi có chuyển đổi quan trọng</div>
                                </div>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" ${this.preferences.types.conversion ? 'checked' : ''} data-type="conversion">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>

                        <div class="pref-item">
                            <div class="pref-info">
                                <span class="material-symbols-outlined pref-icon">attach_money</span>
                                <div>
                                    <div class="pref-label">Doanh thu</div>
                                    <div class="pref-desc">Cập nhật doanh số và revenue</div>
                                </div>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" ${this.preferences.types.revenue ? 'checked' : ''} data-type="revenue">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>

                        <div class="pref-item">
                            <div class="pref-info">
                                <span class="material-symbols-outlined pref-icon">settings</span>
                                <div>
                                    <div class="pref-label">Hệ thống</div>
                                    <div class="pref-desc">Thông báo từ admin</div>
                                </div>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" ${this.preferences.types.system ? 'checked' : ''} data-type="system">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </section>

                    <!-- Quiet Hours Section -->
                    <section class="prefs-section">
                        <h4 class="prefs-section-title">
                            Giờ yên tĩnh
                            <label class="toggle-switch toggle-switch-sm">
                                <input type="checkbox" ${this.preferences.quietHours.enabled ? 'checked' : ''} data-quiet-hours="enabled">
                                <span class="toggle-slider"></span>
                            </label>
                        </h4>

                        <div class="quiet-hours-times ${this.preferences.quietHours.enabled ? '' : 'disabled'}">
                            <div class="time-input">
                                <label>Từ</label>
                                <input type="time" value="${this.preferences.quietHours.start}" data-quiet-hours-start>
                            </div>
                            <span class="time-separator">đến</span>
                            <div class="time-input">
                                <label>Đến</label>
                                <input type="time" value="${this.preferences.quietHours.end}" data-quiet-hours-end>
                            </div>
                        </div>
                    </section>
                </div>

                <div class="prefs-footer">
                    <button class="btn btn-outline" data-test-notification>
                        <span class="material-symbols-outlined">test</span>
                        Test thông báo
                    </button>
                    <button class="btn btn-primary" data-save-prefs>
                        <span class="material-symbols-outlined">save</span>
                        Lưu thay đổi
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        if (!this.container) return;

        // Close button
        this.container.querySelector('.prefs-close')?.addEventListener('click', () => {
            this.container.dispatchEvent(new CustomEvent('close'));
        });

        // Channel toggles
        this.container.querySelectorAll('[data-pref]').forEach(input => {
            input.addEventListener('change', (e) => {
                this.preferences[e.target.dataset.pref] = e.target.checked;
            });
        });

        // Type toggles
        this.container.querySelectorAll('[data-type]').forEach(input => {
            input.addEventListener('change', (e) => {
                this.preferences.types[e.target.dataset.type] = e.target.checked;
            });
        });

        // Quiet hours
        this.container.querySelector('[data-quiet-hours="enabled"]')?.addEventListener('change', (e) => {
            this.preferences.quietHours.enabled = e.target.checked;
            const timesContainer = this.container.querySelector('.quiet-hours-times');
            if (timesContainer) {
                timesContainer.classList.toggle('disabled', !e.target.checked);
            }
        });

        this.container.querySelectorAll('[data-quiet-hours-start], [data-quiet-hours-end]').forEach(input => {
            input.addEventListener('change', (e) => {
                const prop = e.target.dataset.quietHoursStart ? 'start' : 'end';
                this.preferences.quietHours[prop] = e.target.value;
            });
        });

        // Save button
        this.container.querySelector('[data-save-prefs]')?.addEventListener('click', () => {
            this.savePreferences();
        });

        // Test notification
        this.container.querySelector('[data-test-notification]')?.addEventListener('click', () => {
            this.sendTestNotification();
        });
    }

    /**
     * Send test notification
     */
    sendTestNotification() {
        Logger.info('[NotificationPrefs] Sending test notification...');

        // Show browser notification if permitted
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Sa Đéc Hub - Test thông báo', {
                body: 'Đây là thông báo test thành công!',
                icon: '/favicon.png',
                badge: '/favicon.png'
            });
        }

        this.showToast('Đã gửi thông báo test', 'success');
    }

    /**
     * Show toast message
     */
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            padding: 12px 24px;
            background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#1976d2'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 9999;
            animation: slideInRight 0.3s ease;
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    /**
     * Destroy preferences panel
     */
    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
        Logger.info('[NotificationPrefs] Destroyed');
    }
}

// Auto-initialize helper
export function initNotificationPreferences(selector = '#notification-preferences') {
    const container = document.querySelector(selector);
    if (container && !container.hasAttribute('data-initialized')) {
        container.setAttribute('data-initialized', 'true');
        return new NotificationPreferences(selector);
    }
    return null;
}

export default NotificationPreferences;

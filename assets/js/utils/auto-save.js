/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AUTO-SAVE UTILITY — Sa Đéc Marketing Hub
 * Auto-save form data with debounce and recovery
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Features:
 * - Debounced auto-save
 * - LocalStorage persistence
 * - Form state recovery
 * - Save status indicator
 * - Manual save trigger
 * - Error recovery
 *
 * Usage:
 *   AutoSave.init('#my-form', {
 *     key: 'my-form-draft',
 *     delay: 2000,
 *     onSave: (data) => api.save(data),
 *     onRecover: (data) => console.log('Recovered:', data)
 *   });
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Logger } from '../shared/logger.js';

const AutoSave = {
    /**
     * Auto-save instances
     */
    instances: new Map(),

    /**
     * Initialize auto-save for a form
     */
    init(selector, options = {}) {
        const form = typeof selector === 'string'
            ? document.querySelector(selector)
            : selector;

        if (!form) {
            Logger.error('AutoSave: Form not found', { selector });
            return null;
        }

        const config = {
            key: `form-draft-${form.id || Date.now()}`,
            delay: 2000,
            onSave: null,
            onRecover: null,
            showIndicator: true,
            storageKey: 'autosave',
            ...options
        };

        const instance = {
            form,
            config,
            timer: null,
            lastSaved: null,
            isDirty: false,
            status: 'idle' // idle, saving, saved, error
        };

        this.bindFormEvents(instance);
        this.recoverData(instance);
        this.instances.set(form, instance);

        Logger.debug('AutoSave initialized', { form: form.id, key: config.key });

        return instance;
    },

    /**
     * Bind form events
     */
    bindFormEvents(instance) {
        const { form, config } = instance;

        // Track changes
        form.addEventListener('input', (e) => {
            instance.isDirty = true;
            this.updateStatus(instance, 'dirty');
            this.scheduleSave(instance);
        });

        form.addEventListener('change', (e) => {
            instance.isDirty = true;
            this.scheduleSave(instance);
        });

        // Manual save trigger (Ctrl+S)
        form.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.forceSave(instance);
            }
        });

        // Form submit
        form.addEventListener('submit', async (e) => {
            if (instance.isDirty) {
                await this.forceSave(instance);
            }
        });

        // Create status indicator
        if (config.showIndicator) {
            this.createIndicator(instance);
        }
    },

    /**
     * Schedule auto-save
     */
    scheduleSave(instance) {
        if (instance.timer) {
            clearTimeout(instance.timer);
        }

        instance.timer = setTimeout(() => {
            this.save(instance);
        }, instance.config.delay);
    },

    /**
     * Save form data
     */
    async save(instance) {
        if (!instance.isDirty) return;

        this.updateStatus(instance, 'saving');

        try {
            const formData = this.getFormData(instance.form);
            const timestamp = Date.now();

            // Save to localStorage
            this.saveToStorage(instance.config, formData, timestamp);

            // Custom save callback
            if (instance.config.onSave) {
                await instance.config.onSave(formData, instance);
            }

            instance.lastSaved = timestamp;
            instance.isDirty = false;
            this.updateStatus(instance, 'saved');

            Logger.debug('AutoSave completed', { form: instance.form.id });
        } catch (error) {
            this.updateStatus(instance, 'error');
            Logger.error('AutoSave failed', { error, form: instance.form.id });
        }
    },

    /**
     * Force save immediately
     */
    async forceSave(instance) {
        if (instance.timer) {
            clearTimeout(instance.timer);
            instance.timer = null;
        }
        await this.save(instance);
    },

    /**
     * Recover data from storage
     */
    recoverData(instance) {
        try {
            const stored = this.loadFromStorage(instance.config);
            if (!stored) return;

            const { data, timestamp } = stored;

            // Restore form values
            Object.entries(data).forEach(([key, value]) => {
                const field = instance.form.querySelector(`[name="${key}"]`);
                if (field) {
                    field.value = value;
                }
            });

            instance.lastSaved = timestamp;
            instance.isDirty = false;

            if (instance.config.onRecover) {
                instance.config.onRecover(data, timestamp);
            }

            Logger.log('AutoSave data recovered', { form: instance.form.id, timestamp });
        } catch (error) {
            Logger.warn('AutoSave recovery failed', { error });
        }
    },

    /**
     * Get form data
     */
    getFormData(form) {
        const formData = new FormData(form);
        const data = {};

        for (const [key, value] of formData.entries()) {
            // Handle multiple values for same key
            if (data[key]) {
                if (!Array.isArray(data[key])) {
                    data[key] = [data[key]];
                }
                data[key].push(value);
            } else {
                data[key] = value;
            }
        }

        return data;
    },

    /**
     * Save to localStorage
     */
    saveToStorage(config, data, timestamp) {
        const storage = JSON.parse(localStorage.getItem(config.storageKey) || '{}');
        storage[config.key] = { data, timestamp };
        localStorage.setItem(config.storageKey, JSON.stringify(storage));
    },

    /**
     * Load from localStorage
     */
    loadFromStorage(config) {
        const storage = JSON.parse(localStorage.getItem(config.storageKey) || '{}');
        return storage[config.key];
    },

    /**
     * Create status indicator
     */
    createIndicator(instance) {
        const indicator = document.createElement('div');
        indicator.className = 'autosave-indicator';
        indicator.innerHTML = `
            <span class="autosave-status">✓ Đã lưu</span>
            <span class="autosave-time"></span>
        `;
        indicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 80px;
            padding: 8px 16px;
            background: rgba(0, 128, 0, 0.9);
            color: white;
            border-radius: 20px;
            font-size: 13px;
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: 9997;
            display: flex;
            gap: 8px;
            align-items: center;
        `;

        document.body.appendChild(indicator);
        instance.indicator = indicator;
    },

    /**
     * Update status indicator
     */
    updateStatus(instance, status) {
        if (!instance.indicator) return;

        const statusEl = instance.indicator.querySelector('.autosave-status');
        const timeEl = instance.indicator.querySelector('.autosave-time');

        const statusMap = {
            idle: { text: '', show: false },
            dirty: { text: 'Đang soạn...', show: true, color: '#999' },
            saving: { text: 'Đang lưu...', show: true, color: '#ff9800' },
            saved: { text: '✓ Đã lưu', show: true, color: '#4caf50' },
            error: { text: '✕ Lỗi lưu', show: true, color: '#f44336' }
        };

        const config = statusMap[status];
        if (statusEl) {
            statusEl.textContent = config.text;
            statusEl.style.color = config.color;
        }

        if (instance.lastSaved && timeEl) {
            const date = new Date(instance.lastSaved);
            timeEl.textContent = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        }

        instance.indicator.style.opacity = config.show ? '1' : '0';

        // Auto-hide after saved
        if (status === 'saved') {
            setTimeout(() => {
                instance.indicator.style.opacity = '0';
            }, 3000);
        }
    },

    /**
     * Clear saved data
     */
    clear(instance) {
        try {
            const storage = JSON.parse(localStorage.getItem(instance.config.storageKey) || '{}');
            delete storage[instance.config.key];
            localStorage.setItem(instance.config.storageKey, JSON.stringify(storage));
            instance.lastSaved = null;
            instance.isDirty = false;
            Logger.debug('AutoSave data cleared', { form: instance.form.id });
        } catch (error) {
            Logger.warn('AutoSave clear failed', { error });
        }
    },

    /**
     * Get instance by form
     */
    getInstance(form) {
        return this.instances.get(form);
    },

    /**
     * Destroy auto-save
     */
    destroy(instance) {
        if (instance.timer) {
            clearTimeout(instance.timer);
        }
        if (instance.indicator) {
            instance.indicator.remove();
        }
        this.instances.delete(instance.form);
        Logger.debug('AutoSave destroyed', { form: instance.form.id });
    }
};

export default AutoSave;

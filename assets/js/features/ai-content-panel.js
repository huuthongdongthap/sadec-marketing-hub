/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SA ĐÉC MARKETING HUB — AI CONTENT PANEL ENHANCEMENT
 * Floating panel for AI content generation with real-time preview
 *
 * Features:
 * - Floating draggable panel
 * - Real-time content preview
 * - History of generated content
 * - Export to clipboard/file
 * - Template library
 * - Tone/style presets
 *
 * Usage:
 *   <script type="module" src="assets/js/features/ai-content-panel.js"></script>
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Logger } from '../shared/logger.js';

/**
 * AI Content Panel Class
 */
export class AIContentPanel {
    constructor() {
        this.isVisible = false;
        this.history = [];
        this.currentType = 'blog';
        this.templates = this.getTemplates();
        this.init();
    }

    /**
     * Get content templates
     */
    getTemplates() {
        return {
            blog: {
                icon: 'article',
                label: 'Blog Post',
                placeholder: 'Nhập chủ đề blog...',
                fields: [
                    { name: 'topic', label: 'Chủ đề', type: 'text', required: true },
                    { name: 'tone', label: 'Giọng văn', type: 'select', options: ['professional', 'friendly', 'casual', 'humorous'], default: 'professional' },
                    { name: 'length', label: 'Độ dài', type: 'select', options: ['short (500)', 'medium (1000)', 'long (2000+)'], default: 'medium' },
                    { name: 'audience', label: 'Đối tượng', type: 'text', default: 'doanh nghiệp SME' }
                ]
            },
            social: {
                icon: 'share',
                label: 'Social Caption',
                placeholder: 'Nhập chủ đề social post...',
                fields: [
                    { name: 'topic', label: 'Chủ đề', type: 'text', required: true },
                    { name: 'platform', label: 'Platform', type: 'select', options: ['facebook', 'instagram', 'linkedin', 'tiktok'], default: 'facebook' },
                    { name: 'tone', label: 'Giọng văn', type: 'select', options: ['professional', 'friendly', 'energetic', 'witty'], default: 'friendly' },
                    { name: 'count', label: 'Số lượng', type: 'number', default: 3, min: 1, max: 10 }
                ]
            },
            ad: {
                icon: 'campaign',
                label: 'Ad Copy',
                placeholder: 'Nhập thông tin chiến dịch...',
                fields: [
                    { name: 'campaign', label: 'Chiến dịch', type: 'text', required: true },
                    { name: 'product', label: 'Sản phẩm/Dịch vụ', type: 'text', required: true },
                    { name: 'platform', label: 'Platform', type: 'select', options: ['google_ads', 'facebook_ads', 'tiktok_ads'], default: 'facebook_ads' },
                    { name: 'goal', label: 'Mục tiêu', type: 'select', options: ['sales', 'leads', 'awareness', 'traffic'], default: 'sales' }
                ]
            },
            email: {
                icon: 'mail',
                label: 'Email Marketing',
                placeholder: 'Nhập chủ đề email...',
                fields: [
                    { name: 'topic', label: 'Chủ đề', type: 'text', required: true },
                    { name: 'emailType', label: 'Loại email', type: 'select', options: ['newsletter', 'promotion', 'welcome', 'follow_up', 'abandoned_cart'], default: 'newsletter' },
                    { name: 'goal', label: 'Mục tiêu', type: 'select', options: ['click', 'reply', 'purchase', 'signup'], default: 'click' }
                ]
            },
            seo: {
                icon: 'seo',
                label: 'SEO Meta',
                placeholder: 'Nhập chủ đề content...',
                fields: [
                    { name: 'topic', label: 'Chủ đề', type: 'text', required: true },
                    { name: 'keywords', label: 'Từ khóa chính', type: 'text', required: true },
                    { name: 'intent', label: 'Search Intent', type: 'select', options: ['informational', 'commercial', 'transactional', 'navigational'], default: 'informational' }
                ]
            }
        };
    }

    /**
     * Initialize panel
     */
    init() {
        this.loadHistory();
        this.createPanel();
        this.bindEvents();
        Logger.log('[AIContentPanel] Initialized');
    }

    /**
     * Load history from localStorage
     */
    loadHistory() {
        try {
            const saved = localStorage.getItem('sadec-ai-history');
            if (saved) {
                this.history = JSON.parse(saved);
            }
        } catch (e) {
            Logger.warn('[AIContentPanel] Failed to load history:', e.message);
            this.history = [];
        }
    }

    /**
     * Save history to localStorage
     */
    saveHistory() {
        try {
            localStorage.setItem('sadec-ai-history', JSON.stringify(this.history));
        } catch (e) {
            Logger.warn('[AIContentPanel] Failed to save history:', e.message);
        }
    }

    /**
     * Create panel HTML
     */
    createPanel() {
        if (document.getElementById('ai-content-panel')) return;

        const panel = document.createElement('div');
        panel.id = 'ai-content-panel';
        panel.className = 'ai-content-panel';
        panel.innerHTML = `
            <div class="ai-panel-header">
                <div class="ai-panel-title">
                    <span class="material-symbols-outlined">auto_awesome</span>
                    AI Content Generator
                </div>
                <div class="ai-panel-actions">
                    <button class="ai-panel-btn" id="ai-history-btn" title="Lịch sử">
                        <span class="material-symbols-outlined">history</span>
                    </button>
                    <button class="ai-panel-btn" id="ai-fullscreen-btn" title="Fullscreen">
                        <span class="material-symbols-outlined">fullscreen</span>
                    </button>
                    <button class="ai-panel-btn" id="ai-close-btn" title="Đóng">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
            </div>

            <div class="ai-panel-tabs">
                ${Object.entries(this.templates).map(([key, template]) => `
                    <button class="ai-tab-btn ${key === 'blog' ? 'active' : ''}" data-type="${key}">
                        <span class="material-symbols-outlined">${template.icon}</span>
                        ${template.label}
                    </button>
                `).join('')}
            </div>

            <div class="ai-panel-body">
                <form id="ai-content-form" class="ai-content-form">
                    <div id="ai-form-fields" class="ai-form-fields"></div>
                    <div class="ai-form-actions">
                        <button type="submit" class="ai-generate-btn">
                            <span class="material-symbols-outlined">auto_awesome</span>
                            Tạo Content
                        </button>
                    </div>
                </form>

                <div id="ai-result" class="ai-result" style="display: none;">
                    <div class="ai-result-header">
                        <h4>Kết quả</h4>
                        <div class="ai-result-actions">
                            <button class="ai-action-btn" id="ai-copy-btn" title="Copy">
                                <span class="material-symbols-outlined">content_copy</span>
                            </button>
                            <button class="ai-action-btn" id="ai-download-btn" title="Download">
                                <span class="material-symbols-outlined">download</span>
                            </button>
                            <button class="ai-action-btn" id="ai-regenerate-btn" title="Regenerate">
                                <span class="material-symbols-outlined">refresh</span>
                            </button>
                        </div>
                    </div>
                    <div id="ai-content-output" class="ai-content-output"></div>
                </div>
            </div>

            <div id="ai-history-panel" class="ai-history-panel" style="display: none;">
                <div class="ai-history-header">
                    <h4>Lịch sử tạo content</h4>
                    <button class="ai-panel-btn" id="ai-close-history-btn">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div id="ai-history-list" class="ai-history-list"></div>
            </div>
        `;

        document.body.appendChild(panel);
        this.makeDraggable(panel);
    }

    /**
     * Render form fields for current type
     */
    renderFormFields() {
        const container = document.getElementById('ai-form-fields');
        const template = this.templates[this.currentType];

        if (!container || !template) return;

        container.innerHTML = template.fields.map(field => {
            if (field.type === 'select') {
                return `
                    <div class="ai-form-group">
                        <label for="ai-field-${field.name}">${field.label}</label>
                        <select id="ai-field-${field.name}" name="${field.name}" ${field.required ? 'required' : ''}>
                            ${field.options.map(opt => `
                                <option value="${opt}" ${opt === field.default ? 'selected' : ''}>
                                    ${this.formatLabel(opt)}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                `;
            } else if (field.type === 'number') {
                return `
                    <div class="ai-form-group">
                        <label for="ai-field-${field.name}">${field.label}</label>
                        <input type="number" id="ai-field-${field.name}" name="${field.name}"
                               value="${field.default}" min="${field.min}" max="${field.max}" ${field.required ? 'required' : ''}>
                    </div>
                `;
            }
            return `
                <div class="ai-form-group">
                    <label for="ai-field-${field.name}">${field.label}</label>
                    <input type="text" id="ai-field-${field.name}" name="${field.name}"
                           placeholder="${template.placeholder}" ${field.required ? 'required' : ''}
                           value="${field.default || ''}">
                </div>
            `;
        }).join('');
    }

    /**
     * Format label from value
     */
    formatLabel(value) {
        return value.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    /**
     * Make panel draggable
     */
    makeDraggable(element) {
        const header = element.querySelector('.ai-panel-header');
        let isDragging = false;
        let startX, startY, initialX, initialY;

        header.addEventListener('mousedown', (e) => {
            if (e.target.closest('.ai-panel-actions')) return;
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            const rect = element.getBoundingClientRect();
            initialX = rect.left;
            initialY = rect.top;
            element.classList.add('dragging');
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            element.style.left = `${initialX + dx}px`;
            element.style.top = `${initialY + dy}px`;
            element.style.right = 'auto';
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            element.classList.remove('dragging');
        });
    }

    /**
     * Bind events
     */
    bindEvents() {
        // Tab switching
        document.querySelectorAll('.ai-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.ai-tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentType = btn.dataset.type;
                this.renderFormFields();
            });
        });

        // Form submission
        document.getElementById('ai-content-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.generateContent();
        });

        // Close panel
        document.getElementById('ai-close-btn')?.addEventListener('click', () => this.hide());

        // History panel
        document.getElementById('ai-history-btn')?.addEventListener('click', () => this.showHistory());
        document.getElementById('ai-close-history-btn')?.addEventListener('click', () => this.hideHistory());

        // Result actions
        document.getElementById('ai-copy-btn')?.addEventListener('click', () => this.copyResult());
        document.getElementById('ai-download-btn')?.addEventListener('click', () => this.downloadResult());
        document.getElementById('ai-regenerate-btn')?.addEventListener('click', () => this.regenerate());

        // Fullscreen
        document.getElementById('ai-fullscreen-btn')?.addEventListener('click', () => this.toggleFullscreen());

        // Keyboard shortcut (Ctrl+Shift+A)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'A') {
                e.preventDefault();
                this.toggle();
            }
        });
    }

    /**
     * Generate content (mock - connects to AI service)
     */
    async generateContent() {
        const form = document.getElementById('ai-content-form');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        const resultDiv = document.getElementById('ai-result');
        const outputDiv = document.getElementById('ai-content-output');

        // Show loading state
        resultDiv.style.display = 'block';
        outputDiv.innerHTML = `
            <div class="ai-loading">
                <div class="ai-loading-spinner"></div>
                <p>Đang tạo content với AI...</p>
            </div>
        `;

        // Simulate AI generation (replace with actual API call)
        await new Promise(resolve => setTimeout(resolve, 2000));

        const mockResult = this.generateMockResult(data);

        outputDiv.innerHTML = `
            <div class="ai-content-preview">
                ${this.formatContent(mockResult, this.currentType)}
            </div>
        `;

        // Save to history
        this.addToHistory({
            type: this.currentType,
            data,
            result: mockResult,
            timestamp: new Date().toISOString()
        });

        Logger.log('[AIContentPanel] Content generated:', this.currentType);
    }

    /**
     * Generate mock result (replace with actual API call)
     */
    generateMockResult(data) {
        return {
            blog: `# ${data.topic || 'Blog Title'}\n\nĐây là content mẫu. Kết nối với Gemini AI API để tạo content thực tế...`,
            social: `Caption mẫu cho ${data.topic}...\n\n#hashtag1 #hashtag2 #hashtag3`,
            ad: `Headline: Quảng cáo ${data.product}\nDescription: Click ngay để nhận ưu đãi!`,
            email: `Subject: ${data.topic}\n\nKính chào quý khách,\n\nĐây là email mẫu...`,
            seo: `Title: ${data.topic} | Brand Name\nDescription: Meta description cho ${data.topic}...`
        }[this.currentType];
    }

    /**
     * Format content for display
     */
    formatContent(content, type) {
        if (type === 'blog') {
            return `<div class="markdown-preview">${content.replace(/\n/g, '<br>')}</div>`;
        }
        return `<div class="content-preview">${content.replace(/\n/g, '<br>')}</div>`;
    }

    /**
     * Add to history
     */
    addToHistory(item) {
        this.history.unshift(item);
        if (this.history.length > 50) this.history.pop();
        this.saveHistory();
    }

    /**
     * Show history panel
     */
    showHistory() {
        const historyList = document.getElementById('ai-history-list');
        const panel = document.getElementById('ai-history-panel');

        if (this.history.length === 0) {
            historyList.innerHTML = '<p class="ai-history-empty">Chưa có lịch sử</p>';
        } else {
            historyList.innerHTML = this.history.map((item, index) => `
                <div class="ai-history-item" data-index="${index}">
                    <div class="ai-history-item-header">
                        <span class="material-symbols-outlined">${this.templates[item.type]?.icon || 'article'}</span>
                        <span class="ai-history-type">${this.templates[item.type]?.label || item.type}</span>
                        <span class="ai-history-date">${new Date(item.timestamp).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div class="ai-history-item-actions">
                        <button class="ai-history-action" onclick="AIContentPanelInstance.loadHistoryItem(${index})">
                            <span class="material-symbols-outlined">visibility</span>
                        </button>
                        <button class="ai-history-action" onclick="AIContentPanelInstance.deleteHistoryItem(${index})">
                            <span class="material-symbols-outlined">delete</span>
                        </button>
                    </div>
                </div>
            `).join('');
        }

        panel.style.display = 'block';
    }

    /**
     * Hide history panel
     */
    hideHistory() {
        document.getElementById('ai-history-panel').style.display = 'none';
    }

    /**
     * Load history item
     */
    loadHistoryItem(index) {
        const item = this.history[index];
        if (item) {
            this.currentType = item.type;
            document.querySelectorAll('.ai-tab-btn').forEach(b => {
                b.classList.toggle('active', b.dataset.type === item.type);
            });
            this.renderFormFields();

            // Fill form with saved data
            Object.entries(item.data).forEach(([key, value]) => {
                const input = document.getElementById(`ai-field-${key}`);
                if (input) input.value = value;
            });

            // Show result
            const resultDiv = document.getElementById('ai-result');
            const outputDiv = document.getElementById('ai-content-output');
            resultDiv.style.display = 'block';
            outputDiv.innerHTML = `<div class="ai-content-preview">${this.formatContent(item.result, item.type)}</div>`;

            this.hideHistory();
        }
    }

    /**
     * Delete history item
     */
    deleteHistoryItem(index) {
        this.history.splice(index, 1);
        this.saveHistory();
        this.showHistory();
    }

    /**
     * Copy result to clipboard
     */
    async copyResult() {
        const output = document.getElementById('ai-content-output');
        const text = output.innerText;
        try {
            await navigator.clipboard.writeText(text);
            Logger.log('[AIContentPanel] Copied to clipboard');
        } catch (e) {
            Logger.warn('[AIContentPanel] Failed to copy:', e.message);
        }
    }

    /**
     * Download result as file
     */
    downloadResult() {
        const output = document.getElementById('ai-content-output');
        const text = output.innerText;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-content-${this.currentType}-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        Logger.log('[AIContentPanel] Downloaded');
    }

    /**
     * Regenerate content
     */
    regenerate() {
        this.generateContent();
    }

    /**
     * Toggle fullscreen
     */
    toggleFullscreen() {
        const panel = document.getElementById('ai-content-panel');
        panel.classList.toggle('ai-panel-fullscreen');
    }

    /**
     * Toggle panel visibility
     */
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * Show panel
     */
    show() {
        const panel = document.getElementById('ai-content-panel');
        if (panel) {
            panel.classList.add('visible');
            this.isVisible = true;
            this.renderFormFields();
        }
    }

    /**
     * Hide panel
     */
    hide() {
        const panel = document.getElementById('ai-content-panel');
        if (panel) {
            panel.classList.remove('visible');
            this.isVisible = false;
        }
    }
}

/**
 * Initialize AI Content Panel
 */
export function initAIContentPanel() {
    return new AIContentPanel();
}

// Auto-initialize
export const AIContentPanelInstance = initAIContentPanel();

// Global API
window.AIContentPanel = AIContentPanel;
window.AIContentPanelInstance = AIContentPanelInstance;

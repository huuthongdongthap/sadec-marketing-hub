/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SA ĐÉC MARKETING HUB — QUICK TOOLS PANEL
 * Floating panel with quick marketing tools
 *
 * Features:
 * - Color Picker (chọn màu brand)
 * - Font Preview (xem trước font)
 * - Image Resizer (resize ảnh)
 * - Text Counter (đếm ký tự)
 * - Hashtag Generator (tạo hashtag)
 * - UTM Builder (xây dựng UTM links)
 * - Meta Tag Generator (tạo meta tags)
 * - Readability Checker (kiểm tra độ dễ đọc)
 *
 * Keyboard Shortcut: Ctrl+Shift+T
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Logger } from '../shared/logger.js';

/**
 * Quick Tools Panel Class
 */
export class QuickToolsPanel {
    constructor() {
        this.isVisible = false;
        this.currentTool = 'color-picker';
        this.tools = this.getTools();
        this.init();
    }

    /**
     * Get available tools
     */
    getTools() {
        return {
            'color-picker': {
                icon: 'colorize',
                label: 'Color Picker',
                description: 'Chọn màu brand'
            },
            'font-preview': {
                icon: 'text_fields',
                label: 'Font Preview',
                description: 'Xem trước font'
            },
            'text-counter': {
                icon: 'short_text',
                label: 'Text Counter',
                description: 'Đếm ký tự, từ'
            },
            'hashtag-gen': {
                icon: 'tag',
                label: 'Hashtag Generator',
                description: 'Tạo hashtag'
            },
            'utm-builder': {
                icon: 'link',
                label: 'UTM Builder',
                description: 'Xây UTM links'
            },
            'meta-generator': {
                icon: 'seo',
                label: 'Meta Generator',
                description: 'Tạo meta tags'
            },
            'readability': {
                icon: 'menu_book',
                label: 'Readability',
                description: 'Kiểm tra độ dễ đọc'
            }
        };
    }

    /**
     * Initialize panel
     */
    init() {
        this.createPanel();
        this.bindEvents();
        this.loadPreferences();
        Logger.log('[QuickToolsPanel] Initialized');
    }

    /**
     * Load preferences from localStorage
     */
    loadPreferences() {
        try {
            const saved = localStorage.getItem('sadec-quick-tools-prefs');
            if (saved) {
                const prefs = JSON.parse(saved);
                this.currentTool = prefs.currentTool || 'color-picker';
            }
        } catch (e) {
            Logger.warn('[QuickToolsPanel] Failed to load preferences:', e.message);
        }
    }

    /**
     * Save preferences to localStorage
     */
    savePreferences() {
        try {
            localStorage.setItem('sadec-quick-tools-prefs', JSON.stringify({
                currentTool: this.currentTool
            }));
        } catch (e) {
            Logger.warn('[QuickToolsPanel] Failed to save preferences:', e.message);
        }
    }

    /**
     * Create panel HTML
     */
    createPanel() {
        if (document.getElementById('quick-tools-panel')) return;

        const panel = document.createElement('div');
        panel.id = 'quick-tools-panel';
        panel.className = 'quick-tools-panel';
        panel.innerHTML = `
            <div class="qt-panel-header">
                <div class="qt-panel-title">
                    <span class="material-symbols-outlined">build</span>
                    Quick Tools
                </div>
                <div class="qt-panel-actions">
                    <button class="qt-panel-btn" id="qt-close-btn" title="Đóng">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
            </div>

            <div class="qt-panel-tabs">
                ${Object.entries(this.tools).map(([key, tool]) => `
                    <button class="qt-tab-btn ${key === 'color-picker' ? 'active' : ''}" data-tool="${key}">
                        <span class="material-symbols-outlined">${tool.icon}</span>
                        <span>${tool.label}</span>
                    </button>
                `).join('')}
            </div>

            <div class="qt-panel-body">
                ${this.renderToolContent('color-picker')}
            </div>
        `;

        document.body.appendChild(panel);
        this.makeDraggable(panel);
    }

    /**
     * Render tool content
     */
    renderToolContent(toolKey) {
        const tools = {
            'color-picker': `
                <div class="qt-tool-content" data-tool="color-picker">
                    <div class="qt-tool-header">
                        <h4>Color Picker</h4>
                        <p>Chọn màu sắc cho brand của bạn</p>
                    </div>
                    <div class="qt-color-picker">
                        <div class="qt-color-inputs">
                            <div class="qt-color-input">
                                <label>HEX</label>
                                <input type="text" id="qt-color-hex" value="#006A60" maxlength="7">
                            </div>
                            <div class="qt-color-input">
                                <label>RGB</label>
                                <input type="text" id="qt-color-rgb" value="rgb(0, 106, 96)" readonly>
                            </div>
                            <div class="qt-color-input">
                                <label>HSL</label>
                                <input type="text" id="qt-color-hsl" value="hsl(174, 100%, 21%)" readonly>
                            </div>
                        </div>
                        <input type="color" id="qt-color-main" value="#006A60" class="qt-color-main">
                        <div class="qt-color-palette" id="qt-color-palette">
                            <div class="qt-palette-color" style="background: #006A60" data-color="#006A60"></div>
                            <div class="qt-palette-color" style="background: #9C27B0" data-color="#9C27B0"></div>
                            <div class="qt-palette-color" style="background: #E91E63" data-color="#E91E63"></div>
                            <div class="qt-palette-color" style="background: #F44336" data-color="#F44336"></div>
                            <div class="qt-palette-color" style="background: #FF9800" data-color="#FF9800"></div>
                            <div class="qt-palette-color" style="background: #FFC107" data-color="#FFC107"></div>
                            <div class="qt-palette-color" style="background: #4CAF50" data-color="#4CAF50"></div>
                            <div class="qt-palette-color" style="background: #2196F3" data-color="#2196F3"></div>
                        </div>
                        <div class="qt-color-preview">
                            <h5>Preview</h5>
                            <div class="qt-preview-box" id="qt-color-preview" style="background: #006A60"></div>
                        </div>
                    </div>
                </div>
            `,
            'text-counter': `
                <div class="qt-tool-content" data-tool="text-counter">
                    <div class="qt-tool-header">
                        <h4>Text Counter</h4>
                        <p>Đếm số ký tự và từ</p>
                    </div>
                    <textarea id="qt-text-input" class="qt-text-input" placeholder="Nhập văn bản của bạn..."></textarea>
                    <div class="qt-counter-stats">
                        <div class="qt-stat">
                            <span class="qt-stat-value" id="qt-char-count">0</span>
                            <span class="qt-stat-label">Ký tự</span>
                        </div>
                        <div class="qt-stat">
                            <span class="qt-stat-value" id="qt-word-count">0</span>
                            <span class="qt-stat-label">Từ</span>
                        </div>
                        <div class="qt-stat">
                            <span class="qt-stat-value" id="qt-sentence-count">0</span>
                            <span class="qt-stat-label">Câu</span>
                        </div>
                        <div class="qt-stat">
                            <span class="qt-stat-value" id="qt-paragraph-count">0</span>
                            <span class="qt-stat-label">Đoạn</span>
                        </div>
                    </div>
                    <div class="qt-counter-extra">
                        <div class="qt-extra-item">
                            <span>Reading time:</span>
                            <strong id="qt-reading-time">0 giây</strong>
                        </div>
                        <div class="qt-extra-item">
                            <span>Speaking time:</span>
                            <strong id="qt-speaking-time">0 giây</strong>
                        </div>
                    </div>
                </div>
            `,
            'hashtag-gen': `
                <div class="qt-tool-content" data-tool="hashtag-gen">
                    <div class="qt-tool-header">
                        <h4>Hashtag Generator</h4>
                        <p>Tạo hashtag từ chủ đề</p>
                    </div>
                    <div class="qt-input-group">
                        <input type="text" id="qt-hashtag-topic" placeholder="Nhập chủ đề..." class="qt-input">
                        <button id="qt-hashtag-generate" class="qt-btn qt-btn-primary">
                            <span class="material-symbols-outlined">auto_awesome</span>
                            Tạo Hashtag
                        </button>
                    </div>
                    <div class="qt-hashtag-results" id="qt-hashtag-results">
                        <p class="qt-placeholder">Nhập chủ đề để tạo hashtag...</p>
                    </div>
                </div>
            `,
            'utm-builder': `
                <div class="qt-tool-content" data-tool="utm-builder">
                    <div class="qt-tool-header">
                        <h4>UTM Builder</h4>
                        <p>Xây dựng UTM tracking links</p>
                    </div>
                    <div class="qt-form-group">
                        <label>Website URL *</label>
                        <input type="url" id="qt-utm-url" placeholder="https://example.com" class="qt-input" required>
                    </div>
                    <div class="qt-form-group">
                        <label>Campaign Source (utm_source)</label>
                        <input type="text" id="qt-utm-source" placeholder="google, facebook, newsletter..." class="qt-input">
                    </div>
                    <div class="qt-form-group">
                        <label>Campaign Medium (utm_medium)</label>
                        <input type="text" id="qt-utm-medium" placeholder="cpc, email, social..." class="qt-input">
                    </div>
                    <div class="qt-form-group">
                        <label>Campaign Name (utm_campaign)</label>
                        <input type="text" id="qt-utm-campaign" placeholder="summer_sale, black_friday..." class="qt-input">
                    </div>
                    <div class="qt-form-group">
                        <label>Campaign Term (utm_term)</label>
                        <input type="text" id="qt-utm-term" placeholder="marketing+agency..." class="qt-input">
                    </div>
                    <div class="qt-form-group">
                        <label>Campaign Content (utm_content)</label>
                        <input type="text" id="qt-utm-content" placeholder="ad_variation_a..." class="qt-input">
                    </div>
                    <button id="qt-utm-generate" class="qt-btn qt-btn-primary qt-btn-block">
                        <span class="material-symbols-outlined">link</span>
                        Generate UTM Link
                    </button>
                    <div class="qt-utm-result" id="qt-utm-result" style="display: none;">
                        <label>Generated URL:</label>
                        <div class="qt-utm-url-box">
                            <input type="text" id="qt-utm-output" readonly class="qt-input">
                            <button id="qt-utm-copy" class="qt-btn qt-btn-icon">
                                <span class="material-symbols-outlined">content_copy</span>
                            </button>
                        </div>
                    </div>
                </div>
            `,
            'meta-generator': `
                <div class="qt-tool-content" data-tool="meta-generator">
                    <div class="qt-tool-header">
                        <h4>Meta Tag Generator</h4>
                        <p>Tạo SEO meta tags</p>
                    </div>
                    <div class="qt-form-group">
                        <label>Page Title *</label>
                        <input type="text" id="qt-meta-title" placeholder="Enter page title..." class="qt-input" maxlength="60">
                        <span class="qt-hint">Recommended: 50-60 characters</span>
                    </div>
                    <div class="qt-form-group">
                        <label>Meta Description *</label>
                        <textarea id="qt-meta-description" placeholder="Enter meta description..." class="qt-input" maxlength="160" rows="3"></textarea>
                        <span class="qt-hint">Recommended: 150-160 characters</span>
                    </div>
                    <div class="qt-form-group">
                        <label>Keywords</label>
                        <input type="text" id="qt-meta-keywords" placeholder="keyword1, keyword2..." class="qt-input">
                    </div>
                    <div class="qt-form-group">
                        <label>OG Image URL</label>
                        <input type="url" id="qt-meta-image" placeholder="https://example.com/image.jpg" class="qt-input">
                    </div>
                    <button id="qt-meta-generate" class="qt-btn qt-btn-primary qt-btn-block">
                        <span class="material-symbols-outlined">code</span>
                        Generate Meta Tags
                    </button>
                    <div class="qt-meta-result" id="qt-meta-result" style="display: none;">
                        <label>Generated HTML:</label>
                        <pre class="qt-code-block" id="qt-meta-output"></pre>
                        <button id="qt-meta-copy" class="qt-btn qt-btn-secondary">
                            <span class="material-symbols-outlined">content_copy</span>
                            Copy to Clipboard
                        </button>
                    </div>
                </div>
            `,
            'font-preview': `
                <div class="qt-tool-content" data-tool="font-preview">
                    <div class="qt-tool-header">
                        <h4>Font Preview</h4>
                        <p>Xem trước Google Fonts</p>
                    </div>
                    <div class="qt-input-group">
                        <select id="qt-font-select" class="qt-input">
                            <option value="Google Sans">Google Sans</option>
                            <option value="Roboto">Roboto</option>
                            <option value="Open Sans">Open Sans</option>
                            <option value="Montserrat">Montserrat</option>
                            <option value="Playfair Display">Playfair Display</option>
                            <option value="Inter">Inter</option>
                            <option value="Poppins">Poppins</option>
                            <option value="Lato">Lato</option>
                        </select>
                    </div>
                    <div class="qt-font-preview">
                        <div class="qt-font-sample" id="qt-font-sample" style="font-family: 'Google Sans', sans-serif;">
                            The quick brown fox jumps over the lazy dog
                        </div>
                    </div>
                    <div class="qt-font-sizes">
                        <div class="qt-size-row">
                            <span>12px:</span>
                            <span id="qt-size-12" style="font-size: 12px">Sample text</span>
                        </div>
                        <div class="qt-size-row">
                            <span>14px:</span>
                            <span id="qt-size-14" style="font-size: 14px">Sample text</span>
                        </div>
                        <div class="qt-size-row">
                            <span>16px:</span>
                            <span id="qt-size-16" style="font-size: 16px">Sample text</span>
                        </div>
                        <div class="qt-size-row">
                            <span>18px:</span>
                            <span id="qt-size-18" style="font-size: 18px">Sample text</span>
                        </div>
                        <div class="qt-size-row">
                            <span>24px:</span>
                            <span id="qt-size-24" style="font-size: 24px">Sample text</span>
                        </div>
                    </div>
                </div>
            `,
            'readability': `
                <div class="qt-tool-content" data-tool="readability">
                    <div class="qt-tool-header">
                        <h4>Readability Checker</h4>
                        <p>Phân tích độ dễ đọc</p>
                    </div>
                    <textarea id="qt-readability-input" class="qt-text-input" placeholder="Paste your content here..."></textarea>
                    <button id="qt-readability-check" class="qt-btn qt-btn-primary qt-btn-block">
                        <span class="material-symbols-outlined">analytics</span>
                        Analyze Readability
                    </button>
                    <div class="qt-readability-results" id="qt-readability-results" style="display: none;">
                        <div class="qt-score-card">
                            <div class="qt-score-circle">
                                <span id="qt-readability-score">0</span>
                                <span class="qt-score-label">Score</span>
                            </div>
                        </div>
                        <div class="qt-metrics">
                            <div class="qt-metric">
                                <span class="qt-metric-label">Flesch Reading Ease</span>
                                <span class="qt-metric-value" id="qt-flesch-score">0</span>
                            </div>
                            <div class="qt-metric">
                                <span class="qt-metric-label">Grade Level</span>
                                <span class="qt-metric-value" id="qt-grade-level">0</span>
                            </div>
                            <div class="qt-metric">
                                <span class="qt-metric-label">Avg Sentence Length</span>
                                <span class="qt-metric-value" id="qt-avg-sentence">0</span>
                            </div>
                            <div class="qt-metric">
                                <span class="qt-metric-label">Complex Words</span>
                                <span class="qt-metric-value" id="qt-complex-words">0%</span>
                            </div>
                        </div>
                        <div class="qt-recommendations" id="qt-recommendations"></div>
                    </div>
                </div>
            `
        };

        return tools[toolKey] || '';
    }

    /**
     * Make panel draggable
     */
    makeDraggable(element) {
        const header = element.querySelector('.qt-panel-header');
        let isDragging = false;
        let startX, startY, initialX, initialY;

        header.addEventListener('mousedown', (e) => {
            if (e.target.closest('.qt-panel-actions')) return;
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
        document.querySelectorAll('.qt-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.qt-tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const toolKey = btn.dataset.tool;
                this.currentTool = toolKey;
                this.savePreferences();

                const body = document.querySelector('.qt-panel-body');
                if (body) {
                    body.innerHTML = this.renderToolContent(toolKey);
                    this.bindToolEvents(toolKey);
                }
            });
        });

        // Close button
        document.getElementById('qt-close-btn')?.addEventListener('click', () => this.hide());

        // Keyboard shortcut (Ctrl+Shift+T)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                this.toggle();
            }
        });

        // Bind initial tool events
        this.bindToolEvents('color-picker');
    }

    /**
     * Bind tool-specific events
     */
    bindToolEvents(toolKey) {
        const tools = {
            'color-picker': () => this.bindColorPicker(),
            'text-counter': () => this.bindTextCounter(),
            'hashtag-gen': () => this.bindHashtagGen(),
            'utm-builder': () => this.bindUtmBuilder(),
            'meta-generator': () => this.bindMetaGenerator(),
            'font-preview': () => this.bindFontPreview(),
            'readability': () => this.bindReadability()
        };

        tools[toolKey]?.();
    }

    bindColorPicker() {
        const colorInput = document.getElementById('qt-color-main');
        const hexInput = document.getElementById('qt-color-hex');
        const rgbOutput = document.getElementById('qt-color-rgb');
        const hslOutput = document.getElementById('qt-color-hsl');
        const preview = document.getElementById('qt-color-preview');
        const palette = document.getElementById('qt-color-palette');

        if (!colorInput || !hexInput) return;

        const hexToRgb = (hex) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        };

        const rgbToHsl = (r, g, b) => {
            r /= 255; g /= 255; b /= 255;
            const max = Math.max(r, g, b), min = Math.min(r, g, b);
            let h, s, l = (max + min) / 2;

            if (max === min) {
                h = s = 0;
            } else {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                    case g: h = ((b - r) / d + 2) / 6; break;
                    case b: h = ((r - g) / d + 4) / 6; break;
                }
            }
            return `${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%`;
        };

        const updateColor = (hex) => {
            const rgb = hexToRgb(hex);
            if (rgb) {
                rgbOutput.value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
                hslOutput.value = `hsl(${rgbToHsl(rgb.r, rgb.g, rgb.b)})`;
                if (preview) preview.style.background = hex;
            }
        };

        colorInput.addEventListener('input', (e) => {
            hexInput.value = e.target.value;
            updateColor(e.target.value);
        });

        hexInput.addEventListener('input', (e) => {
            let hex = e.target.value;
            if (!hex.startsWith('#')) hex = '#' + hex;
            if (/^#[0-9A-F]{6}$/i.test(hex)) {
                colorInput.value = hex;
                updateColor(hex);
            }
        });

        palette?.addEventListener('click', (e) => {
            const colorEl = e.target.closest('.qt-palette-color');
            if (colorEl) {
                const hex = colorEl.dataset.color;
                colorInput.value = hex;
                hexInput.value = hex;
                updateColor(hex);
            }
        });
    }

    bindTextCounter() {
        const textarea = document.getElementById('qt-text-input');
        if (!textarea) return;

        const updateStats = () => {
            const text = textarea.value;
            const chars = text.length;
            const words = text.trim() ? text.trim().split(/\s+/).length : 0;
            const sentences = text.split(/[.!?]+/).filter(Boolean).length;
            const paragraphs = text.split(/\n\s*\n/).filter(Boolean).length;

            document.getElementById('qt-char-count').textContent = chars;
            document.getElementById('qt-word-count').textContent = words;
            document.getElementById('qt-sentence-count').textContent = sentences;
            document.getElementById('qt-paragraph-count').textContent = paragraphs;

            const readingTime = Math.ceil(words / 200 * 60);
            const speakingTime = Math.ceil(words / 150 * 60);

            document.getElementById('qt-reading-time').textContent = `${readingTime} giây`;
            document.getElementById('qt-speaking-time').textContent = `${speakingTime} giây`;
        };

        textarea.addEventListener('input', updateStats);
    }

    bindHashtagGen() {
        const input = document.getElementById('qt-hashtag-topic');
        const btn = document.getElementById('qt-hashtag-generate');
        const results = document.getElementById('qt-hashtag-results');

        if (!btn || !input) return;

        btn.addEventListener('click', () => {
            const topic = input.value.trim();
            if (!topic) return;

            const hashtags = [
                `#${topic.replace(/\s+/g, '')}`,
                `#${topic.toLowerCase().replace(/\s+/g, '')}`,
                `#${topic.toUpperCase().replace(/\s+/g, '')}`,
                `#marketing`,
                `#digitalmarketing`,
                `#socialmedia`,
                `#contentmarketing`,
                `#seo`,
                `#branding`
            ];

            results.innerHTML = `
                <div class="qt-hashtag-list">
                    ${hashtags.map(tag => `<span class="qt-hashtag-tag">${tag}</span>`).join('')}
                </div>
                <button class="qt-btn qt-btn-secondary" id="qt-hashtag-copy">
                    <span class="material-symbols-outlined">content_copy</span>
                    Copy All
                </button>
            `;

            document.getElementById('qt-hashtag-copy')?.addEventListener('click', () => {
                const text = hashtags.join(' ');
                navigator.clipboard.writeText(text);
                Logger.log('[QuickTools] Hashtags copied');
            });
        });
    }

    bindUtmBuilder() {
        const btn = document.getElementById('qt-utm-generate');
        const copyBtn = document.getElementById('qt-utm-copy');
        const result = document.getElementById('qt-utm-result');
        const output = document.getElementById('qt-utm-output');

        if (!btn) return;

        btn.addEventListener('click', () => {
            const url = document.getElementById('qt-utm-url').value.trim();
            if (!url) return;

            const params = new URLSearchParams();
            const source = document.getElementById('qt-utm-source').value.trim();
            const medium = document.getElementById('qt-utm-medium').value.trim();
            const campaign = document.getElementById('qt-utm-campaign').value.trim();
            const term = document.getElementById('qt-utm-term').value.trim();
            const content = document.getElementById('qt-utm-content').value.trim();

            if (source) params.append('utm_source', source);
            if (medium) params.append('utm_medium', medium);
            if (campaign) params.append('utm_campaign', campaign);
            if (term) params.append('utm_term', term);
            if (content) params.append('utm_content', content);

            const separator = url.includes('?') ? '&' : '?';
            const utmUrl = `${url}${separator}${params.toString()}`;

            output.value = utmUrl;
            result.style.display = 'block';
        });

        copyBtn?.addEventListener('click', () => {
            output.select();
            document.execCommand('copy');
            Logger.log('[QuickTools] UTM URL copied');
        });
    }

    bindMetaGenerator() {
        const btn = document.getElementById('qt-meta-generate');
        const copyBtn = document.getElementById('qt-meta-copy');
        const result = document.getElementById('qt-meta-result');
        const output = document.getElementById('qt-meta-output');

        if (!btn) return;

        btn.addEventListener('click', () => {
            const title = document.getElementById('qt-meta-title').value.trim();
            const description = document.getElementById('qt-meta-description').value.trim();
            const keywords = document.getElementById('qt-meta-keywords').value.trim();
            const image = document.getElementById('qt-meta-image').value.trim();

            let metaTags = `<!-- SEO Meta Tags -->\n`;
            if (title) {
                metaTags += `<title>${title}</title>\n`;
                metaTags += `<meta name="title" content="${title}">\n`;
                metaTags += `<meta property="og:title" content="${title}">\n`;
            }
            if (description) {
                metaTags += `<meta name="description" content="${description}">\n`;
                metaTags += `<meta property="og:description" content="${description}">\n`;
            }
            if (keywords) {
                metaTags += `<meta name="keywords" content="${keywords}">\n`;
            }
            if (image) {
                metaTags += `<meta property="og:image" content="${image}">\n`;
                metaTags += `<meta name="twitter:image" content="${image}">\n`;
            }
            metaTags += `<meta property="og:type" content="website">\n`;
            metaTags += `<meta name="twitter:card" content="summary_large_image">\n`;

            output.textContent = metaTags;
            result.style.display = 'block';
        });

        copyBtn?.addEventListener('click', () => {
            const text = output.textContent;
            navigator.clipboard.writeText(text);
            Logger.log('[QuickTools] Meta tags copied');
        });
    }

    bindFontPreview() {
        const select = document.getElementById('qt-font-select');
        const sample = document.getElementById('qt-font-sample');

        if (!select || !sample) return;

        select.addEventListener('change', (e) => {
            const font = e.target.value;
            sample.style.fontFamily = `'${font}', sans-serif`;

            for (let i = 12; i <= 24; i += 2) {
                const el = document.getElementById(`qt-size-${i}`);
                if (el) el.style.fontFamily = `'${font}', sans-serif`;
            }
        });
    }

    bindReadability() {
        const btn = document.getElementById('qt-readability-check');
        const results = document.getElementById('qt-readability-results');

        if (!btn) return;

        btn.addEventListener('click', () => {
            const text = document.getElementById('qt-readability-input').value.trim();
            if (!text) return;

            // Simple readability analysis
            const words = text.trim().split(/\s+/).length;
            const sentences = text.split(/[.!?]+/).filter(Boolean).length;
            const syllables = this.countSyllables(text);
            const avgSentenceLength = words / sentences;
            const fleschScore = 206.835 - (1.015 * avgSentenceLength) - (84.6 * (syllables / words));
            const gradeLevel = 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;

            document.getElementById('qt-readability-score').textContent = Math.round(fleschScore);
            document.getElementById('qt-flesch-score').textContent = fleschScore.toFixed(1);
            document.getElementById('qt-grade-level').textContent = gradeLevel.toFixed(1);
            document.getElementById('qt-avg-sentence').textContent = avgSentenceLength.toFixed(1);

            results.style.display = 'block';
        });
    }

    countSyllables(text) {
        // Simple syllable counter
        const words = text.toLowerCase().split(/\s+/);
        let count = 0;
        for (const word of words) {
            const matches = word.match(/[aeiouy]{1,2}/g);
            count += matches ? matches.length : 1;
        }
        return count;
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
        const panel = document.getElementById('quick-tools-panel');
        if (panel) {
            panel.classList.add('visible');
            this.isVisible = true;
        }
    }

    /**
     * Hide panel
     */
    hide() {
        const panel = document.getElementById('quick-tools-panel');
        if (panel) {
            panel.classList.remove('visible');
            this.isVisible = false;
        }
    }
}

/**
 * Initialize Quick Tools Panel
 */
export function initQuickToolsPanel() {
    return new QuickToolsPanel();
}

// Auto-initialize
export const QuickToolsPanelInstance = initQuickToolsPanel();

// Global API
window.QuickToolsPanel = QuickToolsPanel;
window.QuickToolsPanelInstance = QuickToolsPanelInstance;

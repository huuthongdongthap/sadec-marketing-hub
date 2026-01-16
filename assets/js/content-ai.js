/**
 * Content AI Client
 * Wrapper for AI content generation Edge Function
 * Sa Đéc Marketing Hub - V4 Phase 1
 */

const ContentAI = {
    // Edge Function URL
    EDGE_URL: `${window.__ENV__?.SUPABASE_URL || 'https://pzcgvfhppglzfjavxuid.supabase.co'}/functions/v1`,

    /**
     * Generate social media post
     * @param {string} topic - Post topic
     * @param {Object} options - Generation options
     * @returns {Promise<Object>} Generated content
     */
    async generatePost(topic, options = {}) {
        return this.generate({
            type: 'social_post',
            topic,
            platform: options.platform || 'facebook',
            tone: options.tone || 'friendly',
            language: options.language || 'vi',
            brandVoice: options.brandVoice,
            maxLength: options.maxLength || 200
        });
    },

    /**
     * Generate caption for image
     */
    async generateCaption(topic, options = {}) {
        return this.generate({
            type: 'caption',
            topic,
            platform: options.platform || 'instagram',
            tone: options.tone || 'playful'
        });
    },

    /**
     * Generate hashtags
     */
    async generateHashtags(topic, options = {}) {
        return this.generate({
            type: 'hashtags',
            topic,
            platform: options.platform || 'instagram'
        });
    },

    /**
     * Generate ad copy
     */
    async generateAdCopy(topic, options = {}) {
        return this.generate({
            type: 'ad_copy',
            topic,
            platform: options.platform || 'facebook',
            tone: options.tone || 'urgent'
        });
    },

    /**
     * Generate email content
     */
    async generateEmail(topic, options = {}) {
        return this.generate({
            type: 'email',
            topic,
            tone: options.tone || 'professional'
        });
    },

    /**
     * Core generation method
     */
    async generate(request) {
        try {
            this.showLoading(true);

            const response = await fetch(`${this.EDGE_URL}/generate-content`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.__ENV__?.SUPABASE_ANON_KEY || ''}`
                },
                body: JSON.stringify(request)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Generation failed');
            }

            const result = await response.json();
            this.showLoading(false);
            this.trackUsage(result.usage);

            return result;

        } catch (error) {
            this.showLoading(false);
            console.error('Content AI Error:', error);
            throw error;
        }
    },

    /**
     * Show/hide loading indicator
     */
    showLoading(show) {
        const loader = document.querySelector('.content-ai-loader');
        if (loader) {
            loader.style.display = show ? 'flex' : 'none';
        }
    },

    /**
     * Track token usage
     */
    trackUsage(usage) {
        if (!usage) return;

        // Store in localStorage for cost tracking
        const stored = JSON.parse(localStorage.getItem('contentAI_usage') || '{"total": 0}');
        stored.total += (usage.promptTokens || 0) + (usage.completionTokens || 0);
        stored.lastUsed = new Date().toISOString();
        localStorage.setItem('contentAI_usage', JSON.stringify(stored));
    },

    /**
     * Get usage statistics
     */
    getUsageStats() {
        return JSON.parse(localStorage.getItem('contentAI_usage') || '{"total": 0}');
    },

    /**
     * Create AI generation modal
     */
    createModal() {
        if (document.querySelector('.content-ai-modal')) return;

        const modal = document.createElement('div');
        modal.className = 'content-ai-modal';
        modal.innerHTML = `
            <div class="content-ai-modal-content glass-card">
                <div class="content-ai-header">
                    <h3>🤖 Content AI</h3>
                    <button class="content-ai-close">&times;</button>
                </div>
                <div class="content-ai-body">
                    <div class="content-ai-form">
                        <label>Chủ đề</label>
                        <input type="text" id="ai-topic" placeholder="VD: Khuyến mãi mùa Tết">
                        
                        <label>Loại nội dung</label>
                        <select id="ai-type">
                            <option value="social_post">Bài đăng social</option>
                            <option value="caption">Caption ảnh</option>
                            <option value="hashtags">Hashtags</option>
                            <option value="ad_copy">Quảng cáo</option>
                            <option value="email">Email marketing</option>
                        </select>
                        
                        <label>Platform</label>
                        <select id="ai-platform">
                            <option value="facebook">Facebook</option>
                            <option value="instagram">Instagram</option>
                            <option value="tiktok">TikTok</option>
                            <option value="zalo">Zalo</option>
                        </select>
                        
                        <label>Giọng văn</label>
                        <select id="ai-tone">
                            <option value="friendly">Thân thiện</option>
                            <option value="professional">Chuyên nghiệp</option>
                            <option value="playful">Vui nhộn</option>
                            <option value="urgent">Khẩn cấp</option>
                        </select>
                        
                        <button id="ai-generate-btn" class="btn-cyber">
                            <span class="material-symbols-outlined">auto_awesome</span>
                            Tạo nội dung
                        </button>
                    </div>
                    
                    <div class="content-ai-result" style="display: none;">
                        <label>Kết quả</label>
                        <textarea id="ai-result" rows="6" readonly></textarea>
                        <div id="ai-hashtags"></div>
                        <div class="content-ai-actions">
                            <button id="ai-copy-btn" class="btn-secondary">
                                <span class="material-symbols-outlined">content_copy</span>
                                Copy
                            </button>
                            <button id="ai-regenerate-btn" class="btn-secondary">
                                <span class="material-symbols-outlined">refresh</span>
                                Tạo lại
                            </button>
                        </div>
                    </div>
                    
                    <div class="content-ai-loader" style="display: none;">
                        <div class="spinner"></div>
                        <p>Đang tạo nội dung...</p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.setupModalEvents(modal);

        return modal;
    },

    /**
     * Setup modal event handlers
     */
    setupModalEvents(modal) {
        // Close button
        modal.querySelector('.content-ai-close').addEventListener('click', () => {
            modal.style.display = 'none';
        });

        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });

        // Generate button
        modal.querySelector('#ai-generate-btn').addEventListener('click', async () => {
            const topic = modal.querySelector('#ai-topic').value;
            const type = modal.querySelector('#ai-type').value;
            const platform = modal.querySelector('#ai-platform').value;
            const tone = modal.querySelector('#ai-tone').value;

            if (!topic) {
                alert('Vui lòng nhập chủ đề!');
                return;
            }

            try {
                const result = await this.generate({ type, topic, platform, tone });

                // Show result
                const resultDiv = modal.querySelector('.content-ai-result');
                resultDiv.style.display = 'block';

                const content = result.content || JSON.stringify(result, null, 2);
                modal.querySelector('#ai-result').value = content;

                // Show hashtags if available
                if (result.hashtags) {
                    modal.querySelector('#ai-hashtags').innerHTML =
                        result.hashtags.map(h => `<span class="hashtag">${h}</span>`).join(' ');
                }
            } catch (error) {
                alert('Lỗi: ' + error.message);
            }
        });

        // Copy button
        modal.querySelector('#ai-copy-btn').addEventListener('click', () => {
            const result = modal.querySelector('#ai-result').value;
            navigator.clipboard.writeText(result);
            alert('Đã copy!');
        });

        // Regenerate button
        modal.querySelector('#ai-regenerate-btn').addEventListener('click', () => {
            modal.querySelector('#ai-generate-btn').click();
        });
    },

    /**
     * Open the AI modal
     */
    open() {
        let modal = document.querySelector('.content-ai-modal');
        if (!modal) {
            modal = this.createModal();
        }
        modal.style.display = 'flex';
    }
};

// Add modal styles
const style = document.createElement('style');
style.textContent = `
    .content-ai-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    }
    
    .content-ai-modal-content {
        width: 90%;
        max-width: 500px;
        max-height: 80vh;
        overflow-y: auto;
        padding: 24px;
    }
    
    .content-ai-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }
    
    .content-ai-header h3 {
        margin: 0;
        color: #00f0ff;
    }
    
    .content-ai-close {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
    }
    
    .content-ai-form label {
        display: block;
        margin: 12px 0 4px;
        color: rgba(255,255,255,0.7);
        font-size: 12px;
    }
    
    .content-ai-form input,
    .content-ai-form select,
    .content-ai-form textarea {
        width: 100%;
        padding: 10px;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 8px;
        color: white;
        font-size: 14px;
    }
    
    .content-ai-form button {
        margin-top: 20px;
        width: 100%;
    }
    
    .content-ai-result {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid rgba(255,255,255,0.1);
    }
    
    .content-ai-actions {
        display: flex;
        gap: 10px;
        margin-top: 10px;
    }
    
    .content-ai-actions button {
        flex: 1;
    }
    
    .content-ai-loader {
        text-align: center;
        padding: 40px;
    }
    
    .content-ai-loader .spinner {
        width: 40px;
        height: 40px;
        border: 3px solid rgba(0,240,255,0.3);
        border-top-color: #00f0ff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 10px;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    .hashtag {
        display: inline-block;
        background: rgba(0,240,255,0.2);
        color: #00f0ff;
        padding: 4px 8px;
        border-radius: 4px;
        margin: 4px 4px 0 0;
        font-size: 12px;
    }
    
    .btn-secondary {
        background: rgba(255,255,255,0.1);
        border: 1px solid rgba(255,255,255,0.2);
        color: white;
        padding: 8px 16px;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
    }
`;
document.head.appendChild(style);

// Export
window.ContentAI = ContentAI;

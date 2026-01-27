/**
 * AI Client Assistant
 * Floating Chatbot Widget for Client Portal
 */

class AIAssistant {
    constructor() {
        this.isOpen = false;
        this.messages = [
            { role: 'assistant', text: 'Xin chào! Tôi là trợ lý AI của Mekong Agency. Tôi có thể giúp gì cho bạn hôm nay?' }
        ];
        this.isTyping = false;

        // Edge Function URL (Reusing the existing one for MVP)
        this.EDGE_URL = `${window.__ENV__?.SUPABASE_URL || 'https://pzcgvfhppglzfjavxuid.supabase.co'}/functions/v1/generate-content`;
        this.ANON_KEY = window.__ENV__?.SUPABASE_ANON_KEY || '';

        this.init();
    }

    init() {
        this.injectStyles();
        this.createDOM();
        this.renderMessages();
    }

    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .ai-assistant-widget {
                position: fixed;
                bottom: 30px;
                right: 30px;
                z-index: 1000;
                font-family: 'Google Sans', sans-serif;
            }

            .ai-toggle-btn {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: linear-gradient(135deg, #006A60, #004D40);
                color: white;
                border: none;
                box-shadow: 0 4px 15px rgba(0, 106, 96, 0.4);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }

            .ai-toggle-btn:hover {
                transform: scale(1.1);
            }

            .ai-toggle-btn span {
                font-size: 28px;
            }

            .ai-chat-window {
                position: absolute;
                bottom: 80px;
                right: 0;
                width: 350px;
                height: 500px;
                background: white;
                border-radius: 16px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                opacity: 0;
                transform: translateY(20px) scale(0.95);
                pointer-events: none;
                transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
                border: 1px solid rgba(0,0,0,0.05);
            }

            .ai-chat-window.open {
                opacity: 1;
                transform: translateY(0) scale(1);
                pointer-events: all;
            }

            .ai-header {
                background: linear-gradient(135deg, #006A60, #004D40);
                color: white;
                padding: 16px;
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .ai-avatar {
                width: 32px;
                height: 32px;
                background: rgba(255,255,255,0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .ai-messages {
                flex: 1;
                padding: 16px;
                overflow-y: auto;
                background: #F8F9FA;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .ai-message {
                max-width: 80%;
                padding: 10px 14px;
                border-radius: 12px;
                font-size: 14px;
                line-height: 1.5;
            }

            .ai-message.assistant {
                background: white;
                color: #191C1C;
                border-bottom-left-radius: 4px;
                box-shadow: 0 1px 2px rgba(0,0,0,0.05);
            }

            .ai-message.user {
                background: #CCE8E4;
                color: #004F47;
                align-self: flex-end;
                border-bottom-right-radius: 4px;
            }

            .ai-input-area {
                padding: 12px;
                background: white;
                border-top: 1px solid rgba(0,0,0,0.05);
                display: flex;
                gap: 8px;
            }

            .ai-input {
                flex: 1;
                border: 1px solid #E0E3E3;
                border-radius: 20px;
                padding: 10px 16px;
                outline: none;
                font-family: inherit;
                font-size: 14px;
            }

            .ai-input:focus {
                border-color: #006A60;
            }

            .ai-send-btn {
                background: none;
                border: none;
                color: #006A60;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 8px;
            }

            .ai-send-btn:disabled {
                color: #B0B0B0;
                cursor: not-allowed;
            }

            /* Typing Indicator */
            .typing-indicator {
                display: flex;
                gap: 4px;
                padding: 4px 8px;
                background: white;
                border-radius: 12px;
                width: fit-content;
                border-bottom-left-radius: 4px;
            }
            .typing-dot {
                width: 6px;
                height: 6px;
                background: #B0B0B0;
                border-radius: 50%;
                animation: bounce 1.4s infinite ease-in-out both;
            }
            .typing-dot:nth-child(1) { animation-delay: -0.32s; }
            .typing-dot:nth-child(2) { animation-delay: -0.16s; }

            @keyframes bounce {
                0%, 80%, 100% { transform: scale(0); }
                40% { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }

    createDOM() {
        const container = document.createElement('div');
        container.className = 'ai-assistant-widget';
        container.innerHTML = `
            <div class="ai-chat-window" id="aiChatWindow">
                <div class="ai-header">
                    <div class="ai-avatar">
                        <span class="material-symbols-outlined" style="font-size: 20px;">smart_toy</span>
                    </div>
                    <div>
                        <div style="font-weight: 600; font-size: 14px;">Mekong AI Support</div>
                        <div style="font-size: 11px; opacity: 0.8;">Luôn sẵn sàng 24/7</div>
                    </div>
                </div>
                <div class="ai-messages" id="aiMessages"></div>
                <div class="ai-input-area">
                    <input type="text" class="ai-input" id="aiInput" placeholder="Nhập tin nhắn...">
                    <button class="ai-send-btn" id="aiSendBtn">
                        <span class="material-symbols-outlined">send</span>
                    </button>
                </div>
            </div>
            <button class="ai-toggle-btn" id="aiToggleBtn">
                <span class="material-symbols-outlined">chat_bubble</span>
            </button>
        `;
        document.body.appendChild(container);

        // Bind events
        document.getElementById('aiToggleBtn').addEventListener('click', () => this.toggle());
        document.getElementById('aiSendBtn').addEventListener('click', () => this.handleSend());
        document.getElementById('aiInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSend();
        });
    }

    toggle() {
        this.isOpen = !this.isOpen;
        const window = document.getElementById('aiChatWindow');
        const icon = document.querySelector('#aiToggleBtn span');

        if (this.isOpen) {
            window.classList.add('open');
            icon.textContent = 'close';
            // Focus input
            setTimeout(() => document.getElementById('aiInput').focus(), 300);
        } else {
            window.classList.remove('open');
            icon.textContent = 'chat_bubble';
        }
    }

    renderMessages() {
        const container = document.getElementById('aiMessages');
        container.innerHTML = this.messages.map(msg => `
            <div class="ai-message ${msg.role}">
                ${msg.text}
            </div>
        `).join('');

        if (this.isTyping) {
            container.innerHTML += `
                <div class="ai-message assistant">
                    <div class="typing-indicator">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            `;
        }

        container.scrollTop = container.scrollHeight;
    }

    async handleSend() {
        const input = document.getElementById('aiInput');
        const text = input.value.trim();
        if (!text || this.isTyping) return;

        // User message
        this.messages.push({ role: 'user', text });
        input.value = '';
        this.isTyping = true;
        this.renderMessages();

        try {
            // Call API
            const response = await this.callAI(text);
            this.messages.push({ role: 'assistant', text: response });
        } catch (error) {
            console.error('AI Error:', error);
            this.messages.push({ role: 'assistant', text: 'Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau.' });
        } finally {
            this.isTyping = false;
            this.renderMessages();
        }
    }

    async callAI(query) {
        // Fallback for demo/development if no key
        if (!this.ANON_KEY || this.ANON_KEY.includes('YOUR_')) {
            await new Promise(r => setTimeout(r, 1500));
            return this.getMockResponse(query);
        }

        try {
            const response = await fetch(this.EDGE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.ANON_KEY}`
                },
                body: JSON.stringify({
                    prompt: `User question: "${query}".
                    Act as a helpful support agent for Mekong Agency.
                    Keep the answer concise (under 100 words).
                    If asking about services, mention Facebook Ads and SEO.
                    Answer in Vietnamese.`
                })
            });

            if (!response.ok) throw new Error('API request failed');
            const data = await response.json();
            return data.content || 'Không nhận được phản hồi.';

        } catch (e) {
            console.warn('API call failed, using mock response', e);
            await new Promise(r => setTimeout(r, 1000));
            return this.getMockResponse(query);
        }
    }

    getMockResponse(query) {
        const lower = query.toLowerCase();
        if (lower.includes('giá') || lower.includes('chi phí')) {
            return 'Gói dịch vụ của chúng tôi bắt đầu từ 5.000.000đ/tháng cho doanh nghiệp khởi nghiệp. Bạn có muốn xem bảng giá chi tiết không?';
        }
        if (lower.includes('liên hệ') || lower.includes('tư vấn')) {
            return 'Bạn có thể gọi hotline 0909 123 456 hoặc để lại số điện thoại tại đây, chuyên viên sẽ gọi lại trong 5 phút.';
        }
        if (lower.includes('dịch vụ') || lower.includes('làm gì')) {
            return 'Mekong Agency cung cấp giải pháp Marketing tổng thể: Quảng cáo Facebook/Google, SEO từ khóa, và Quản trị Fanpage chuyên nghiệp.';
        }
        return 'Cảm ơn bạn đã đặt câu hỏi. Tôi đã ghi nhận thông tin và sẽ chuyển đến bộ phận CSKH để hỗ trợ bạn sớm nhất.';
    }
}

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
    new AIAssistant();
});

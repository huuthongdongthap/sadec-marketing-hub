/**
 * Landing Page Renderer Logic
 * Fetches and renders landing page content from Supabase
 */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Initialize Supabase - try to use injected env vars first
const supabaseUrl = window.__ENV__?.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = window.__ENV__?.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

const app = document.getElementById('app');

async function loadPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');

    if (!slug) {
        // Render Demo if no slug
        renderDemo();
        return;
    }

    try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data, error } = await supabase
            .from('landing_pages')
            .select('*')
            .eq('slug', slug)
            .eq('status', 'published')
            .single();

        if (error || !data) {
            throw new Error('Page not found');
        }

        renderContent(data.content);
        document.title = data.title;

    } catch (err) {
        console.error(err);
        renderDemo(); // Fallback to demo for this exercise
    }
}

function renderDemo() {
    app.innerHTML = `
        <div class="lp-section" style="background: #f0f7ff; text-align: center; padding: 80px 20px;">
            <div class="lp-container">
                <h1 style="font-size: 48px; color: #006A60; margin-bottom: 20px;">Mekong Agency Demo Page</h1>
                <p style="font-size: 20px; color: #555; max-width: 700px; margin: 0 auto 30px;">
                    Giải pháp Marketing tổng thể cho doanh nghiệp miền Tây. Tăng doanh số, tối ưu chi phí.
                </p>
                <button class="lp-btn">Nhận Tư Vấn Miễn Phí</button>
            </div>
        </div>

        <div class="lp-section">
            <div class="lp-container">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px;">
                    <div style="text-align: center; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                        <h3 style="color: #006A60;">Chạy Quảng Cáo</h3>
                        <p>Facebook, Google, TikTok Ads với chi phí tối ưu.</p>
                    </div>
                    <div style="text-align: center; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                        <h3 style="color: #006A60;">Xây Dựng Nội Dung</h3>
                        <p>Viết bài chuẩn SEO, kịch bản video viral.</p>
                    </div>
                    <div style="text-align: center; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                        <h3 style="color: #006A60;">Chăm Sóc Khách Hàng</h3>
                        <p>Tự động hóa Zalo OA, Email Marketing.</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="lp-section" style="background: #006A60; color: white; text-align: center;">
            <div class="lp-container">
                <h2>Đăng Ký Ngay Hôm Nay</h2>
                <form style="max-width: 400px; margin: 20px auto; display: flex; flex-direction: column; gap: 10px;">
                    <input type="text" placeholder="Họ tên" style="padding: 10px; border-radius: 4px; border: none;">
                    <input type="text" placeholder="Số điện thoại" style="padding: 10px; border-radius: 4px; border: none;">
                    <button style="background: white; color: #006A60; padding: 10px; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">Gửi Thông Tin</button>
                </form>
            </div>
        </div>
    `;
}

function renderContent(blocks) {
    // Implementation for rendering JSON blocks to HTML
    // This is a placeholder logic
    app.innerHTML = '';
    // ... loop through blocks and append to app
}

// Initialize
loadPage();

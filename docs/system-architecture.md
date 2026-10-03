# 🏗️ KIẾN TRÚC HỆ THỐNG (SYSTEM ARCHITECTURE)

> **Dự án:** Sa Đéc & Cao Lãnh Marketing Hub  
> **Phiên bản:** v2.5.0 (Cao Lãnh 2026 Milestone)  
> **Môi trường triển khai:** Cloudflare Pages (Edge Network)

---

## 1. TỔNG QUAN KIẾN TRÚC TỔNG THỂ

Hệ thống được thiết kế theo triết lý **Jamstack hiện đại siêu nhẹ, không phụ thuộc framework cồng kềnh**, tối đa hoá hiệu suất tải trang cho người dùng di động vùng Mekong và bảo đảm tính tương thích cao với chuẩn Material Design 3.

```
                              ┌──────────────────────────────────────────────┐
                              │           NGƯỜI DÙNG CUỐI / ĐỐI TÁC          │
                              │       (Trình duyệt Desktop & Mobile)         │
                              └──────────────────────┬───────────────────────┘
                                                     │ HTTPS (HTTP/3)
                                                     ▼
                              ┌──────────────────────────────────────────────┐
                              │            CLOUDFLARE EDGE NETWORK           │
                              │     (sadec-marketing-hub.pages.dev)          │
                              └──────────────────────┬───────────────────────┘
                                                     │ Static Assets Cache
                                                     ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                          CORE WEB PAGES (JAMSTACK)                                     │
├───────────────────────────────┬───────────────────────────────┬────────────────────────────────────────┤
│         index.html            │       partnership.html        │              academy.html              │
│  - Trang chủ Agency Bản Địa   │  - Đề án Co-Founder 2026      │  - Học Viện AI Problem-Solving         │
│  - 4 Gói giải pháp SMEs/OCOP  │  - Interactive ROI Calculator │  - 4 Trụ Cột Kỹ Năng Thế Kỷ 21         │
│  - 3 Case Study thực chiến    │  - 6 Dòng tiền kênh bản địa   │  - Chính sách Nhà nước DN 1 người      │
│  - Cổng kết nối dịch vụ       │  - 4 Bánh đà kinh doanh       │  - Form tuyển sinh & Case Study        │
└───────────────────────────────┴───────────────────────────────┴────────────────────────────────────────┘
                                                     │
                                                     ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       HỆ THỐNG STYLE & TOKENS                                         │
│  - Material Design 3 Strict Tokens (css/tokens.css, css/style.css, inline root tokens)                 │
│  - Google Fonts (Inter, Plus Jakarta Sans, Outfit) & Google Material Symbols Outlined                  │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. CÁC THÀNH PHẦN KỸ THUẬT CỐT LÕI

### 2.1. Frontend Layer
- **HTML5 Ngữ nghĩa (Semantic HTML):** Cấu trúc thẻ chuẩn accessibility (A11y), hỗ trợ Open Graph và Schema.org cho SEO địa phương.
- **Vanilla CSS & MD3 Design Tokens:** Sử dụng biến CSS chuẩn Material Design 3 (`--primary: #1B4D3E`, `--surface: #FBFDF9`, `--surface-container: #F0F5EE`, v.v.), không dùng framework JS runtime nặng (React/Next) nhằm tối ưu tốc độ load < 1.2s.
- **Vanilla JavaScript:** 
  - Engine tính toán ROI động `partnership.html` (kéo thanh slider tính thu nhập trực tiếp, không re-render toàn trang).
  - Lazy loading hình ảnh, scroll reveal animations, xử lý modal.

### 2.2. Build Pipeline & Tools
- **Build Scripts:**
  - `scripts/tools/inject-env.js`: Tự động inject biến môi trường an toàn trước khi deploy.
  - `scripts/build/optimize-lazy.js`: Tối ưu thuộc tính `loading="lazy"` và `decoding="async"` trên toàn bộ ảnh.
  - `scripts/build/minify.js`: Minify CSS/HTML giảm tải dung lượng truyền tải mạng.

### 2.3. Testing & CI/CD Pipeline
- **E2E Testing:** Playwright kiểm thử tự động giao diện trên Chromium, Firefox, WebKit và Mobile Viewport.
- **Smoke Testing:** Bộ kiểm tra HTTP status code và liên kết trang.
- **GitHub Actions Runner:** Ubuntu 22.04 chạy tự động mỗi lần git push lên nhánh chính.
- **Cloudflare Pages Deployment:** Đẩy trực tiếp thông qua Wrangler CLI với trạng thái kiểm định HTTP 200 (Điều 49 Hiến pháp Mekong CLI).

---

## 3. MÔ HÌNH BẢO MẬT & VẬN HÀNH
1. **Zero Secret Leak:** Không lưu API Keys, Passwords hoặc dữ liệu nhạy cảm trong mã nguồn công khai.
2. **CSP & Security Headers:** Thiết lập chính sách bảo vệ Content Security Policy trên Cloudflare.
3. **Stateless Frontend:** Toàn bộ trạng thái tương tác tạm thời lưu trữ an toàn trong browser memory hoặc SessionStorage.

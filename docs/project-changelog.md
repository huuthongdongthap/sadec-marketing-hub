# 📜 NHẬT KÝ THAY ĐỔI DỰ ÁN (PROJECT CHANGELOG)

Tất cả các thay đổi đáng chú ý của dự án **Sa Đéc & Cao Lãnh Marketing Hub** được ghi lại chi tiết theo quy chuẩn [Keep a Changelog](https://keepachangelog.com/) và chuẩn Conventional Commits.

---

## [v2.6.0] - 2026-10-04 (Operational Automation & Native Studio Milestone)
### Added
- **Modal Báo Giá Tức Thì & Cổng VietQR Napas 24/7 (`assets/js/components/mekong-quote-vietqr.js`):**
  - Hỗ trợ báo giá động cho 4 gói dịch vụ SMEs/OCOP và các khóa học tại Học viện AI.
  - Cho phép người dùng linh hoạt chọn cọc 50% hoặc thanh toán 100%.
  - Tự động sinh mã VietQR Quick Link chuẩn Napas với nội dung chuyển khoản định danh (`HUB <PACKAGE> <PHONE>`).
  - Hỗ trợ sao chép số tài khoản / nội dung chỉ bằng 1 chạm và nút thông báo trực tiếp qua Zalo.
- **Native Vibe Script Studio 4K AI (`assets/js/components/native-vibe-studio.js`):**
  - Tích hợp Studio trực quan tại `academy.html#studio` hỗ trợ sinh kịch bản video bản địa 4 cảnh chi tiết (Drone FPV, Cận cảnh Macro, Phỏng vấn nhân vật, CTA).
  - Cung cấp sẵn kịch bản mẫu cho 4 chủ đề thương hiệu Đồng Tháp: Mùa Nước Nổi, Làng Hoa Sa Đéc, Nem Lai Vung & Bột Gạo, Homestay Cao Lãnh.
  - Tự động gợi ý thông số thiết bị quay (Lens, Gimbal, Mic thu âm) và phong cách âm thanh/nhạc nền Lofi bản địa.
- **Widget Quick Connect Đa Kênh Cao Lãnh (`assets/js/components/mekong-quick-connect.js`):**
  - Nút bấm nổi Material Design 3 FAB xuất hiện đồng bộ trên toàn bộ website (`index.html`, `partnership.html`, `academy.html`).
  - Menu mở rộng kết nối trực tiếp Hotline 0939.123.456, Zalo OA chính thức, mở nhanh Modal báo giá VietQR và định vị Google Maps Cao Lãnh.

### Changed & Fixed
- **Chuẩn Hóa Module & Sửa Lỗi Bundling/Re-export:**
  - Sửa lỗi `ReferenceError: debounce is not defined` và `formatCurrency` trong `src/js/shared/format-utils.js` và `src/js/core/enhanced-utils.js` bằng việc nạp biến vào lexical scope trước khi xuất default object.
  - Khắc phục lỗi cú pháp escaped backticks trong `assets/js/features/micro-animations.js` giúp trình nén `terser` chạy thành công không có cảnh báo.
  - Cập nhật hàm `getInitials` hỗ trợ trích xuất đầy đủ 3 ký tự viết tắt theo chuẩn tên tiếng Việt.
- **100% SEO Metadata Compliance:**
  - Bổ sung Twitter Cards, Open Graph, Canonical URL và Schema JSON-LD cho toàn bộ các trang công khai và trang quản trị nội bộ.
  - Hoàn thiện 109/109 file HTML đạt chuẩn SEO 100% (1554/1554 unit tests passing).

### Verified
- `npx vitest run`: 6 test suites passed, 1554/1554 tests passed.
- `npm run build`: Minification và Bundle xuất xưởng thành công vào `dist/`.

---

## [v2.5.0] - 2026-10-01 (Cao Lãnh 2026 Milestone)
### Added
- **Học Viện AI Problem-Solving (`academy.html`):**
  - Xây dựng chương trình đào tạo "Bộ Kỹ Năng Tối Thượng Thế Kỷ 21" gồm 4 trụ cột: Problem Deconstruction, AI Agent Orchestration, Vibe Coding, và Cinematography Bản Địa.
  - Tích hợp 4 gói dịch vụ đóng gói sẵn cho SMEs & OCOP: Nhận diện thương hiệu 12M, Web Vibe Coding 9M, Xây kênh 4K 15M/tháng, Campaign Launch 35M.
  - Phổ biến chính sách nhà nước trợ lực chuyển đổi số cho Doanh nghiệp 1 người & hộ kinh doanh Đất Sen Hồng.
- **Showcase 3 Case Study Thực Chiến:**
  - Case 1: Kênh Văn Hóa Bản Địa (lãi ròng 57M/tháng mùa mưa, hút 2–3 hợp đồng B2B/quý).
  - Case 2: Nem Lai Vung & Bột Gạo Sa Đéc OCOP (tăng +240% doanh số bán lẻ trực tiếp).
  - Case 3: Homestay Sinh Thái Cao Lãnh (lấp đầy 92% ngày thường, tiết kiệm 42M phí OTA/quý).
- **Cơ Chế 6 Dòng Tiền Độc Lập Cho Kênh Bản Địa (`partnership.html`):**
  - Bóc tách chi tiết: Brand Sponsorship, Local Booking Homestay/Ẩm thực, Hợp đồng Lễ hội Tỉnh, Boutique Cinema Tours, OCOP Affiliate Commerce, B2B Client Magnet.
  - Bảng đối soát mùa mưa (T5–T9: 57M lãi ròng/tháng) vs. mùa nắng/lễ hội (T10–T4: 102M lãi ròng/tháng).
- **Thư Ngỏ Hợp Tác Grand Slam Offer (`docs/thu-ngo-hop-tac-grand-slam-offer.md`):**
  - Đề án thu hút Co-founder đội ngũ quay chụp cưới & thể thao Cao Lãnh với 4 cam kết bảo hộ tài sản tuyệt đối (Equipment Immunity, Client Retention, 90-day Floor Income, 24h Clean Break).

### Changed
- Cập nhật điều hướng 3 chiều trên Header/Navbar giữa `index.html`, `partnership.html`, và `academy.html`.
- Cải tiến Section Dịch Vụ và Section Case Study trên trang chủ `index.html` sang mô hình bản địa 2026.

### Verified
- 100% Green CI/CD GitHub Actions trên runner Ubuntu 22.04.
- Playwright E2E Tests và Smoke Tests toàn bộ passed.
- Cloudflare Pages live production HTTP 200.

---

## [v2.4.0] - 2026-09-30
### Added
- **Trang Đề Án Co-Founder (`partnership.html`):**
  - Pitch deck tương tác chuẩn Material Design 3.
  - Bộ tính toán Interactive ROI Calculator viết bằng Vanilla JS cho phép kéo trượt show cưới, retainer OCOP và tour để tính thu nhập thực tế.
  - Mô hình kinh doanh 4 Bánh Đà tự sinh dòng tiền.

---

## [v2.0.0] - 2026-03-14
### Added
- Hệ thống Admin Dashboard, Client Portal, Affiliate Partner.
- Tích hợp Material Design 3 tokens và responsive layout toàn diện.
- Thiết lập bộ kiểm thử tự động Playwright và Vitest.

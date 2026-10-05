# 🚀 PHASE 4: TÍCH HỢP UI, VIẾT UNIT TESTS & BUILD PRODUCTION

> **Mục tiêu:** Tích hợp các thành phần mới vào giao diện tổng thể của website, mở rộng bộ test tự động Vitest, build minification và cập nhật tài liệu phát triển dự án.

---

## 🛠️ CHI TIẾT KỸ THUẬT

1. **Tích Hợp Giao Diện Đa Điểm:**
   * `index.html`: Thêm Section "Mạng Lưới Đối Tác OCOP 12 Huyện Thành" và nút liên kết kích hoạt Modal Đăng Ký Đối Tác + Webhook Tracker.
   * `partnership.html`: Bổ sung cổng Webhook Settlement và Mạng Lưới Đối Tác vào phần minh chứng hệ sinh thái Co-founder.
   * `academy.html`: Tích hợp link mở Mạng Lưới Đối Tác phục vụ các bài thực hành kịch bản bản địa.
   * `assets/js/components/mekong-quick-connect.js`: Bổ sung menu Quick Connect dẫn thẳng đến Danh Bạ OCOP và Đăng Ký Đối Tác.
   * Styling: Bổ sung CSS tokens MD3 tương ứng tại `assets/css/components/mekong-ocop-network.css` và `assets/css/components/mekong-settlement-webhook.css`.

2. **Kiểm Thử & Đảm Bảo Chất Lượng:**
   * Viết test suite mới `tests/settlement-webhook-and-ocop.vitest.ts` kiểm thử toàn bộ logic:
     - Logic tính toán chia tách doanh thu 4 bên của webhook.
     - Kiểm thử dữ liệu đối tác OCOP 12 huyện thành (đảm bảo đủ 12 đơn vị hành chính và các trường bắt buộc).
     - Kiểm thử mã định danh `#TX-` và `#PARTNER-DT-`.
   * Chạy `npm run test:vitest` đạt 100% Green.
   * Chạy `npm run build` thành công.
   * Cập nhật `docs/project-changelog.md` (v2.9.0) và `docs/development-roadmap.md`.

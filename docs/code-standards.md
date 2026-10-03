# 📐 TIÊU CHUẨN MÃ NGUỒN (CODE STANDARDS & CONVENTIONS)

> **Hiến pháp Mekong CLI — Điều 55:** Luôn luôn giao tiếp, viết báo cáo và tài liệu bằng Tiếng Việt. Tuân thủ triết lý **YAGNI** (You Aren't Gonna Need It), **KISS** (Keep It Simple, Stupid), và **DRY** (Don't Repeat Yourself).

---

## 1. QUY TẮC ĐẶT TÊN & TỔ CHỨC FILE
- **Kebab-case cho tên file:** Sử dụng kebab-case rõ nghĩa (ví dụ: `co-che-doanh-thu-kenh-van-hoa-ban-dia.md`, `interactive-roi-calculator.js`). Tên file cần đủ ngữ nghĩa để nhận biết mục đích mà không cần đọc nội dung.
- **Giới hạn kích thước file:** Giữ các file mã nguồn và module dưới 200 dòng đối với code JavaScript/CSS logic để dễ dàng quản trị ngữ cảnh.
- **Không tạo file clone dạng enhanced:** Trực tiếp cập nhật các file đang sử dụng, tránh tình trạng tạo `index_v2.html`, `script_new.js`.

---

## 2. QUY CHUẨN GIAO DIỆN MATERIAL DESIGN 3 (MD3 STRICT MODE)
- **Design Tokens thay vì hardcoded styles:**
  - Màu sắc: Sử dụng CSS variables như `var(--md-sys-color-primary)`, `var(--md-sys-color-surface)`, `var(--md-sys-color-on-surface)`.
  - Bo góc: Sử dụng `var(--md-sys-shape-corner-medium)` thay vì giá trị pixel ngẫu nhiên.
  - Phông chữ: Chuẩn hóa font gia đình Inter, Outfit, hoặc Plus Jakarta Sans.
- **Biểu tượng (Icons):**
  - Sử dụng Google Material Symbols Outlined hoặc Lucide Icons được style đúng token màu sắc của hệ thống.
  - Luôn đi kèm text hoặc thẻ `aria-label` đảm bảo chuẩn Accessibility (WCAG 2.1 AA).

---

## 3. QUY TRÌNH KIỂM THỬ VÀ DEPLOY (ĐIỀU 49 HIẾN PHÁP)
1. **Kiểm tra trước khi commit:**
   - Chạy kiểm thử cú pháp, không để lọt lỗi cú pháp Javascript/HTML.
   - Tuyệt đối không commit file chứa bí mật hoặc khóa API cá nhân.
2. **Quy chuẩn Conventional Commits:**
   - Định dạng chuẩn: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`.
   - Thông điệp commit viết bằng Tiếng Việt súc tích, phản ánh chính xác thay đổi:
     - Ví dụ: `feat(academy): triển khai Học Viện AI Problem-Solving và cổng Case Study`
     - Ví dụ: `docs(roadmap): cập nhật lộ trình phát triển và kiến trúc hệ thống 2026`
3. **Quy tắc Green Production:**
   - Chỉ xác nhận hoàn thành công việc sau khi verify HTTP 200 trên domain live (Cloudflare Pages).
   - Kiểm tra hiển thị thực tế trên thiết bị di động trước khi bàn giao.

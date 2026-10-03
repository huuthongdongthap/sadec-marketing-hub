# 📋 PHASE 01: BÁO GIÁ TỰ ĐỘNG & CỔNG THANH TOÁN VIETQR

## 1. MỤC TIÊU
Xây dựng cơ chế báo giá tức thì và cổng sinh mã thanh toán VietQR động cho:
- 4 Gói dịch vụ SMEs & OCOP (12.000.000 ₫, 9.000.000 ₫, 15.000.000 ₫/tháng, 35.000.000 ₫).
- Khóa đào tạo AI Problem-Solving & Vibe Coding tại Học Viện Đồng Tháp (Gói cơ bản 3.500.000 ₫, Gói thực chiến Doanh nghiệp 8.500.000 ₫).

## 2. YÊU CẦU KỸ THUẬT
- **Modal Báo Giá Tương Tác:**
  - Cho phép người dùng tùy chọn gói dịch vụ.
  - Xem chi tiết danh mục bàn giao (deliverables) và cam kết thời gian (SLA).
  - Tự động tính toán số tiền cọc (thường là 50% hoặc 100% học phí).
- **Dynamic VietQR Generator:**
  - Sử dụng chuẩn Quick Link VietQR (`https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-compact2.png?amount=<AMOUNT>&addInfo=<CONTENT>&accountName=<NAME>`).
  - Cấu trúc nội dung thanh toán tự động hóa: `HUB <MÃ_DỊCH_VỤ> <SỐ_ĐIỆN_THOẠI>`.
- **Giao diện:** Chuẩn Material Design 3, bo góc `var(--md-sys-shape-corner-large)`, hỗ trợ nút copy nhanh số tài khoản và cú pháp chuyển khoản.

## 3. CHECKLIST
- [ ] Thiết kế Modal Báo Giá & VietQR trong `index.html` và `academy.html`
- [ ] Viết module JS xử lý logic tính toán giá và cập nhật ảnh VietQR tức thì
- [ ] Tích hợp tính năng sao chép số tài khoản một chạm

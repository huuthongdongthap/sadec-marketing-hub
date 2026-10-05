# 🚀 KẾ HOẠCH: HỆ THỐNG WEBHOOK GIẢI NGÂN TỰ ĐỘNG & MẠNG LƯỚI ĐỐI TÁC OCOP 12 HUYỆN THÀNH

> **Định vị:** Hiện thực hóa Giai đoạn 6 trong Lộ trình phát triển 2026-2027: Xây dựng Cổng Xử Lý Webhook Ngân Hàng Tự Động Giải Ngân (MBBank/SePay/Napas), Danh Bạ Mạng Lưới Đối Tác OCOP 12 Huyện Thành Đồng Tháp, và Cổng Đăng Ký Gia Nhập Hệ Sinh Thái Marketing Hub.

---

## 📌 DANH SÁCH CÁC GIAI ĐOẠN (PHASES)

| Phase | Tên Giai Đoạn | File Chi Tiết | Trạng Thái | Trọng Tâm |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 1** | Bank Settlement Webhook Simulator & Engine | [phase-01-bank-settlement-webhook.md](phase-01-bank-settlement-webhook.md) | Completed | Engine xử lý webhook SePay/MBBank tự động khớp lệnh chuyển khoản và chia tách dòng tiền 4 bên |
| **Phase 2** | Danh Bạ Mạng Lưới Đối Tác OCOP 12 Huyện Thành | [phase-02-ocop-partner-network.md](phase-02-ocop-partner-network.md) | Completed | Bộ lọc và danh bạ trực quan các nhà vườn, xưởng nghề, cơ sở OCOP 12 huyện thành Đồng Tháp |
| **Phase 3** | Cổng Đăng Ký Gia Nhập Mạng Lưới Đối Tác | [phase-03-partner-onboarding-portal.md](phase-03-partner-onboarding-portal.md) | Completed | Modal tương tác tiếp nhận hồ sơ đối tác địa phương, dự toán thu nhập cộng thêm và kết nối Zalo OA |
| **Phase 4** | Tích Hợp UI, Viết Unit Tests & Build Production | [phase-04-ui-integration-and-verification.md](phase-04-ui-integration-and-verification.md) | Completed | Tích hợp vào 3 trang chính, kiểm thử 100% Green Vitest, minification build và cập nhật tài liệu |

---

## 🎯 TIÊU CHUẨN ĐẦU RA (ACCEPTANCE CRITERIA)
1. Webhook Engine mô phỏng trọn vẹn luồng nhận tín hiệu thanh toán SePay/MBBank, xác thực mã đơn hàng và tự động giải ngân đúng tỷ lệ 4 bên cam kết.
2. Mạng lưới đối tác OCOP bao phủ toàn diện 12 đơn vị hành chính tỉnh Đồng Tháp với bộ lọc theo huyện và danh mục sản phẩm 3★-5★.
3. 100% file JavaScript < 200 dòng (tuân thủ nghiêm ngặt nguyên tắc modularity).
4. Hệ thống test Vitest tiếp tục giữ vững 100% Green không có hồi quy (no regressions).
5. Build production (`npm run build`) thành công vào thư mục `dist/`.

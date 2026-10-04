# 🚀 KẾ HOẠCH: HỆ THỐNG ĐẶT LỊCH TOUR/QUAY PHIM & ĐỐI SOÁT DOANH THU BẢN ĐỊA 2026

> **Định vị:** Hiện thực hóa Giai đoạn 4 trong Lộ trình phát triển: Triển khai Cổng Đặt Lịch Trực Tuyến (Boutique Cinema Tour & Ekip Quay 4K OCOP) và Bảng Phân Bổ Đối Soát Doanh Thu Tự Động (Revenue Split Ledger) cho mạng lưới đối tác Homestay, Hộ OCOP và Co-founder tại Đồng Tháp.

---

## 📌 DANH SÁCH CÁC GIAI ĐOẠN (PHASES)

| Phase | Tên Giai Đoạn | File Chi Tiết | Trạng Thái | Trọng Tâm |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 1** | Booking Engine Tour Điện Ảnh & Lịch Quay Ekip | [phase-01-boutique-booking-engine.md](phase-01-boutique-booking-engine.md) | In Progress | Module đặt lịch tương tác với điểm đến Sa Đéc/Cao Lãnh, tính phí tự động và mã định danh |
| **Phase 2** | Revenue Split Ledger & Đối Soát Doanh Thu OCOP | [phase-02-revenue-split-ledger.md](phase-02-revenue-split-ledger.md) | Pending | Bảng phân bổ minh bạch 6 nguồn thu giữa Homestay, OCOP, Ekip sáng tạo và Hạ tầng AI |
| **Phase 3** | Tích Hợp UI & Nâng Cấp Widget Quick Connect | [phase-03-ui-integration-and-quick-connect.md](phase-03-ui-integration-and-quick-connect.md) | Pending | Gắn kết nối Booking & Revenue Ledger vào navbar, card và menu nổi FAB |
| **Phase 4** | Kiểm Thử Toàn Diện, Build & Deploy Production | [phase-04-verification-and-production-deploy.md](phase-04-verification-and-production-deploy.md) | Pending | 100% Vitest green, npm run build, merge main, CI/CD Cloudflare Pages HTTP 200 |

---

## 🎯 TIÊU CHUẨN ĐẦU RA (ACCEPTANCE CRITERIA)
1. Du khách và doanh nghiệp OCOP có thể chọn tour/ngày quay, điểm đến và nhận báo giá kèm cổng VietQR đặt cọc ngay.
2. Đối tác và Co-founder có thể xem trực quan tỷ lệ phân chia doanh thu từng hạng mục để xóa tan nỗi lo mập mờ tài chính.
3. Mã nguồn tuân thủ nghiêm ngặt MD3 tokens, không vượt quá 200 dòng/file, 100% unit test passed.

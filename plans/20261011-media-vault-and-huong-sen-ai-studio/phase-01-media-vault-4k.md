# 🎬 PHASE 1: MEKONG MEDIA VAULT 4K STOCK LICENSING

> **Mục tiêu:** Xây dựng kho lưu trữ và cấp phép bản quyền video footage 4K S-Log3 quay thực địa tại các vùng di sản, nông sản OCOP và cảnh quan Đất Sen Hồng.

---

## 🛠️ CHI TIẾT KỸ THUẬT

1. **Dataset Footage 4K (`assets/js/components/mekong-media-vault-data.js`):**
   - Danh sách video footage: ID, tiêu đề, vị trí đô thị/vùng sinh thái, độ phân giải (4K 60fps / 120fps ProRes/S-Log3), thời lượng (giây), tag chủ đề, tỷ lệ khung hình, ảnh thumbnail và mô tả góc quay (Drone FPV, Macro 90mm, Gimbal ven sông).
   - Biểu phí License:
     - `social`: Bản quyền MXH / Sáng tạo cá nhân (490.000 ₫)
     - `commercial`: Bản quyền Doanh nghiệp & Quảng cáo số (1.890.000 ₫)
     - `exclusive`: Độc quyền Phát sóng Truyền hình & Phim tài liệu (4.900.000 ₫)
   - Phương thức tính toán phân chia doanh thu theo tỷ lệ 4 bên cam kết.
   - Giới hạn file: < 200 dòng.

2. **Giao Diện Media Vault (`assets/js/components/mekong-media-vault.js`):**
   - Modal/Drawer xem trước footage với Watermark Mekong Hub bảo hộ bản quyền.
   - Bộ chọn gói License tức thì và kích hoạt mã VietQR thanh toán 24/7.
   - Tải file mẫu preview phân giải chuẩn (720p watermarked).
   - Nút liên hệ Co-founder nếu cần đặt cảnh quay theo yêu cầu (Custom B-Roll).
   - Giới hạn file: < 200 dòng.

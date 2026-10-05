# 🤝 PHASE 3: CỔNG ĐĂNG KÝ GIA NHẬP MẠNG LƯỚI ĐỐI TÁC BẢN ĐỊA

> **Mục tiêu:** Cung cấp cổng tiếp nhận hồ sơ trực tuyến cho Hộ nông dân, Hợp tác xã, Homestay và Chủ thể OCOP muốn liên kết quảng bá và đón đoàn quay phim 4K cùng Mekong Hub.

---

## 🛠️ CHI TIẾT KỸ THUẬT

1. **Thành Phần Giao Diện (`assets/js/components/mekong-partner-onboarding.js`):**
   * Modal đăng ký đối tác tiện lợi, tối ưu trải nghiệm Mobile:
     - Tên cơ sở / Hộ kinh doanh
     - Huyện/Thành phố thuộc Đồng Tháp
     - Ngành nghề kinh doanh & Sản phẩm OCOP (nếu có)
     - Người đại diện & Số điện thoại / Zalo
     - Kỳ vọng hợp tác: [Đón Tour quay phim 4K] | [Xây kênh truyền thông số] | [Phân phối sản phẩm qua Hub]
   * Bộ tính toán ước tính doanh thu cộng thêm (Revenue Projection Widget):
     - Dựa trên số lượng đoàn khách / video dự kiến hàng tháng để ước lượng doanh thu gia tăng từ 15 - 45 triệu ₫/tháng.
   * Tự động sinh mã hồ sơ đối tác `#PARTNER-DT-XXXX` và mở liên kết Zalo OA Đất Sen Hồng để xác thực hồ sơ trong 24 giờ.
   * File size: Giữ dưới 200 dòng.

# 🌾 PHASE 2: DANH BẠ MẠNG LƯỚI ĐỐI TÁC OCOP ĐÔ THỊ & VÙNG SINH THÁI ĐỒNG THÁP

> **Mục tiêu:** Xây dựng danh bạ & mạng lưới đối tác OCOP bản địa kết nối 3 Đô thị hạt nhân và các Vùng kinh tế sinh thái Đất Sen Hồng với hệ sinh thái Sa Đéc & Cao Lãnh Marketing Hub (chuẩn hóa theo quy hoạch mới, bỏ danh xưng huyện cũ).

---

## 🛠️ CHI TIẾT KỸ THUẬT

1. **Dataset Đối Tác Đô Thị & Vùng Sinh Thái (`assets/js/components/mekong-ocop-network-data.js`):**
   * Định nghĩa các địa bàn theo không gian phát triển mới nhất của tỉnh Đồng Tháp:
     1. TP. Sa Đéc (Làng hoa trăm năm, Làng bột gạo lọc truyền thống)
     2. TP. Cao Lãnh (Thủ phủ Đất Sen Hồng, Xoài Cát Chu xuất khẩu)
     3. TP. Hồng Ngự (Thủ phủ cá tra, Làng nghề Dệt Choàng Long Khánh)
     4. Đô thị Lai Vung (Nem chua Lai Vung truyền thống, Vương quốc Quýt hồng)
     5. Đô thị Tháp Mười (Thủ phủ Trà Sen, Hạt sen sấy OCOP 5 sao quốc gia Ecolotus)
     6. Đô thị Tam Nông (Gạo Huyết Rồng hữu cơ, Du lịch sinh thái Vườn Quốc gia Tràm Chim)
     7. Đô thị Thanh Bình (Ớt Chỉ Thiên xuất khẩu, Bắp non VietGAP phù sa bãi bồi)
     8. Đô thị Lấp Vò (Di sản Chiếu Định Yên, Chợ Ma, Đô thị dịch vụ công nghiệp)
     9. Đô thị Châu Thành (Vùng chuyên canh Nhãn Xuồng Idor, Khoai lang tím Phú Hựu)
     10. Đô thị Tân Hồng (Nông nghiệp tuần hoàn, Sen Bách Diệp vùng trũng biên giới)
     11. Vùng Mở Rộng Cao Lãnh (Vườn cây ăn trái Phong Hòa, Xoài Cát Chu ven sông)
     12. Vùng Kinh Tế Hồng Ngự (Làng nghề nuôi cá bè sông Tiền, Lúa mùa nổi)
   * Trường dữ liệu: `id`, `name`, `district`, `districtName`, `category`, `ocopRating` (3-5 sao), `product`, `commission`, `status` ('verified' | 'ready-for-tour'), `contact`, `address`.

2. **Giao Diện Trực Quan (`assets/js/components/mekong-ocop-network.js`):**
   * Bộ lọc nhanh theo địa phương (Đô thị & Vùng sinh thái) và ngành hàng (Ẩm thực & Nông sản OCOP, Lưu trú Homestay, Làng nghề & Di sản).
   * Thẻ Card đối tác chuẩn Material Design 3 với huy hiệu OCOP, tỷ lệ chiết khấu minh bạch và nút liên hệ Zalo / đặt ekip 4K.
   * File size: < 200 dòng.

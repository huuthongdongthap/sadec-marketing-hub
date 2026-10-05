# 🌾 PHASE 2: DANH BẠ MẠNG LƯỚI ĐỐI TÁC OCOP 12 HUYỆN THÀNH ĐỒNG THÁP

> **Mục tiêu:** Xây dựng danh bạ & mạng lưới đối tác OCOP bản địa kết nối 12 huyện, thị xã, thành phố Đất Sen Hồng với hệ sinh thái Sa Đéc & Cao Lãnh Marketing Hub.

---

## 🛠️ CHI TIẾT KỸ THUẬT

1. **Dataset Đối Tác 12 Huyện Thành (`assets/js/components/mekong-ocop-network-data.js`):**
   * Định nghĩa 12 địa phương:
     1. TP. Sa Đéc (Làng hoa trăm năm, Làng bột gạo truyền thống)
     2. TP. Cao Lãnh (Xoài cát chu, Làng sinh thái ven sông)
     3. TP. Hồng Ngự (Cá tra, Làng dệt choàng Long Khánh)
     4. Huyện Lai Vung (Nem chua Lai Vung, Vườn quýt hồng)
     5. Huyện Tháp Mười (Trà sen, Hạt sen sấy OCOP 4-5 sao)
     6. Huyện Tam Nông (Gạo huyết rồng, Du lịch Vườn Quốc gia Tràm Chim)
     7. Huyện Thanh Bình (Ớt cay Thanh Bình, Bắp non VietGAP)
     8. Huyện Lấp Vò (Chiếu Định Yên Di sản Phi vật thể, Lò đường)
     9. Huyện Tân Hồng (Nông nghiệp tuần hoàn, Sen bách diệp)
     10. Huyện Châu Thành (Nhãn Châu Thành, Khoai lang tím)
     11. Huyện Cao Lãnh (Vườn cây ăn trái Phong Hòa, Xoài cát Chu)
     12. Huyện Hồng Ngự (Làng nghề nuôi cá bè, Lúa mùa nổi)
   * Trường dữ liệu: `id`, `name`, `district`, `category`, `ocopRating` (3-5 sao), `featuredProduct`, `commissionRate`, `status` ('verified' | 'ready-for-tour'), `phone`, `avatar`.

2. **Giao Diện Trực Quan (`assets/js/components/mekong-ocop-network.js`):**
   * Bộ lọc nhanh theo địa phương (12 huyện thành) và ngành hàng (Ẩm thực & Nông sản, Lưu trú Homestay, Thủ công Di sản).
   * Thẻ Card đối tác chuẩn Material Design 3 với huy hiệu OCOP, tỷ lệ chiết khấu minh bạch và nút liên hệ kết nối ngay.
   * Drawer chi tiết đối tác: Lộ trình kết nối đoàn làm phim 4K, kịch bản video đề xuất và liên hệ Zalo.
   * File size: < 200 dòng.

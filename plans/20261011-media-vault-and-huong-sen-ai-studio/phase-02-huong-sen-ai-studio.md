# ✍️ PHASE 2: HƯƠNG SEN AI NAM BỘ SCRIPT STUDIO

> **Mục tiêu:** Xây dựng bộ công cụ AI biên tập kịch bản video ngắn (60s TikTok/Reels) ứng dụng văn phong bản địa Nam Bộ phục vụ bà con làm OCOP, Homestay và Du lịch sinh thái.

---

## 🛠️ CHI TIẾT KỸ THUẬT

1. **Dataset Template & Ngôn Ngữ Nam Bộ (`assets/js/components/huong-sen-ai-data.js`):**
   - Từ điển phương ngữ & thành ngữ miệt vườn Đồng Tháp: "bạt ngàn phù sa", "thơm lừng múi xoài", "mát rượi bóng tre", "đậm đà nghĩa tình", "chế ơi chế à", "đặc sản thứ thiệt"...
   - Danh mục phong cách kịch bản:
     - `mientay`: Chân chất Miệt Vườn (Gần gũi, ấm áp, đậm tình quê)
     - `nghenhan`: Thơ mộng Nghệ nhân (Cinematic, giàu hình ảnh, lắng đọng di sản)
     - `bakhia`: Hài hước Ba Khía (Dí dỏm, tạo trend, giữ chân người xem 3s đầu)
   - Cấu trúc kịch bản 3 hồi: Hook (0-3s) -> Storytelling bản địa (4-45s) -> CTA mua hàng / đặt tour (46-60s).
   - Giới hạn file: < 200 dòng.

2. **Giao Diện Studio (`assets/js/components/huong-sen-ai.js`):**
   - Modal tạo kịch bản với thanh công cụ chọn sản phẩm, địa điểm và giọng điệu.
   - Trình hiển thị kịch bản phân cảnh chi tiết (Âm thanh, Lời thoại, Góc máy đề xuất).
   - Nút sao chép kịch bản 1 chạm và nút "Đặt Ekip 4K Quay Kịch Bản Này" liên thông ngay với Booking Engine.
   - Giới hạn file: < 200 dòng.

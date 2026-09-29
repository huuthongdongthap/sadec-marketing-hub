# ⏱️ ƯỚC LƯỢNG NỖ LỰC, CHI PHÍ SẢN XUẤT & BIÊN LỢI NHUẬN (EFFORT & UNIT ECONOMICS)

> **Mục tiêu:** Đo lường chính xác giờ công (Man-hours), chi phí giá vốn (COGS) và biên lợi nhuận ròng (Gross Margin) cho từng sản phẩm đóng gói để đảm bảo mô hình hoạt động siêu tinh gọn (Lean Operations) và sinh lời ngay lập tức.

---

## 📊 1. BẢNG PHÂN TÍCH UNIT ECONOMICS TỪNG GÓI SẢN PHẨM

| Gói Sản Phẩm | Giá Bán Khách Hàng (VND) | Thời Gian Thực Hiện (Man-hours) | Chi Phí Giá Vốn / Lương Nhân Sự (VND) | Chi Phí Công Cụ / Tool / AI (VND) | Lợi Nhuận Gộp (VND) | Biên Lợi Nhuận (Margin %) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Gói 1: Brand Guideline & Bao Bì OCOP** | **12.000.000** | 10 – 14 giờ (Designer + AI) | 2.500.000 | 300.000 (Midjourney, Font) | **9.200.000** | **76.7%** |
| **Gói 2: Vibe Web & Zalo QR Booking** | **8.000.000** | 4 – 6 giờ (Vibe Coder / AI) | 1.500.000 | 500.000 (Domain + Serverless) | **6.000.000** | **75.0%** |
| **Gói 3: Seasonal Campaign in a Box** | **25.000.000** | 25 – 35 giờ (Quay + Dựng + Ads) | 6.500.000 (Ekip 2 người đi quay) | 1.000.000 (Phần mềm + Media) | **17.500.000** | **70.0%** |
| **Gói 4: Xây Kênh Chủ Doanh Nghiệp (Tháng)** | **20.000.000** | 20 – 25 giờ (1 ngày quay + dựng) | 5.500.000 | 500.000 (Lưu trữ + AI Sub) | **14.000.000** | **70.0%** |
| **Khóa Đào Tạo Agency (1 Học Viên)** | **4.500.000** | 24 giờ (Giảng dạy 3 ngày) | 800.000 (Tài liệu, teabreak, trợ giảng) | 200.000 (Tài khoản học liệu) | **3.500.000** | **77.8%** |

---

## 🛠️ 2. PHÂN BỔ NỖ LỰC CHI TIẾT THEO TỪNG VAI TRÒ

### 2.1. Quy trình sản xuất Gói 1 (Brand Guideline & Bao Bì — 12 triệu)
1. **Khảo sát & Nhập liệu Brief:** 1 giờ (Account Manager dùng form Notion/Google Forms có sẵn).
2. **AI Sinh Concept & Visual Board:** 1.5 giờ (Dùng Midjourney + Mekong CLI prompt sinh biểu trưng và phối cảnh).
3. **Hoàn thiện Thiết kế trên Figma:** 4 giờ (Designer dùng Master Kit kéo thả logo, bảng màu, mockup túi zip, tem).
4. **Viết Brand Story & Xuất File in:** 2 giờ (Content AI viết câu chuyện nguồn gốc + Kỹ thuật viên dàn file in ấn).
5. **Gửi khách duyệt & Chỉnh sửa (tối đa 2 lần):** 2 giờ.
* 👉 **Tổng thời gian: ~10.5 giờ.** (Một Designer có thể hoàn thành 2–3 bộ/tuần dễ dàng).

---

### 2.2. Quy trình sản xuất Gói 2 (Vibe Web & Zalo Booking — 8 triệu)
1. **Khảo sát dịch vụ & Thu thập hình ảnh:** 1 giờ.
2. **Vibe Coding với Claude Code & v0.dev:** 2 giờ (Clone repo `sadec-marketing-hub`, gắn text, gắn ảnh, cấu hình mã VietQR của khách).
3. **Cấu hình Webhook n8n & Zalo Notification:** 1 giờ.
4. **Trỏ tên miền & Deploy lên Vercel:** 30 phút.
5. **Kiểm thử trên điện thoại thật (iOS / Android) & Bàn giao:** 30 phút.
* 👉 **Tổng thời gian: ~5 giờ.** (Marketer không chuyên code vẫn làm xong trong 1 buổi chiều).

---

### 2.3. Quy trình sản xuất Gói 4 (Xây Kênh 30 Video — 20 triệu/tháng)
1. **Lên 30 kịch bản ngắn (Sử dụng Mekong Script Vault):** 3 giờ.
2. **Điền dã quay thực tế (01 Ngày bấm máy):** 8 giờ (Co-founder cùng 1 thợ phụ đến quay trọn vẹn 30 set quay).
3. **Hậu kỳ dựng phim hàng loạt (Batch Editing):** 10 giờ (Dùng Premiere/CapCut Pro với template có sẵn: lồng nhạc, tự động tạo phụ đề AI, chỉnh màu LUTs Nam Bộ).
4. **Lên lịch đăng bài tự động 30 ngày:** 2 giờ (Meta Business Suite + TikTok Creator Center).
* 👉 **Tổng thời gian: ~23 giờ.**

---

## 📈 3. KỊCH BẢN DOANH THU & NĂNG LỰC PHỤC VỤ (CAPACITY PLANNING)

### Quy mô Đội ngũ Ban Đầu (Core Team 3 người tại TP. Cao Lãnh):
* **1 Tech & Strategy Lead (Bạn):** Phụ trách Vibe Coding, hệ thống n8n, đóng gói sản phẩm, giảng dạy Academy.
* **1 Creative & Production Lead (Co-founder):** Phụ trách đạo diễn hình ảnh, chỉ đạo quay phim, chuẩn hóa màu sắc và kỹ thuật bấm máy.
* **1 Junior Designer / Editor (Tuyển thêm):** Phụ trách dàn layout Figma, hỗ trợ cắt ghép video thô.

### Năng lực phục vụ tối đa mỗi tháng (Monthly Capacity):
* **Gói 1 (Brand & Bao bì):** 4 – 6 khách/tháng = **48 – 72 triệu VNĐ**.
* **Gói 2 (Vibe Web & Booking):** 4 – 6 khách/tháng = **32 – 48 triệu VNĐ**.
* **Gói 3 (Campaign in a Box):** 2 khách/tháng = **50 triệu VNĐ**.
* **Gói 4 (Xây kênh trọn gói):** 3 khách/tháng = **60 triệu VNĐ**.
* **Academy Đào tạo (1 khóa/tháng, 15 học viên):** 15 x 4.5 triệu = **67.5 triệu VNĐ**.

🎯 **TỔNG DOANH THU TIỀM NĂNG TỐI ĐA (MAX REVENUE CAP):** **~250 – 300 triệu VNĐ/tháng**.  
🎯 **CHI PHÍ GIÁ VỐN & VẬN HÀNH (COGS + OPEX):** **~70 – 85 triệu VNĐ/tháng**.  
🎯 **LỢI NHUẬN RÒNG ĐỀU ĐẶN:** **~180 – 215 triệu VNĐ/tháng (~70% NET PROFIT)**.

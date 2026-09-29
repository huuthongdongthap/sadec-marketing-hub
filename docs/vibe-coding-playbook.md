# ⚡ CẨM NANG VIBE CODING DÀNH CHO AGENCY & MARKETERS (VIBE CODING PLAYBOOK)

> **Khái niệm:** *"Vibe Coding là phương thức lập trình bằng đối thoại ngôn ngữ tự nhiên với AI. Bạn tập trung vào logic kinh doanh, ý tưởng sáng tạo và trải nghiệm người dùng — AI đảm nhận việc viết mã nguồn và triển khai."*

---

## 1. TẠI SAO MARKETER CẦN VIBE CODING?
* **Thoát khỏi sự phụ thuộc vào Dev team:** Marketer có thể tự làm Landing page sự kiện, minigame vòng quay may mắn, quiz phân loại khách hàng trong 1–2 giờ thay vì chờ đợi cả tháng.
* **Chi phí gần như bằng 0:** Sử dụng các nền tảng serverless, mã nguồn mở (Next.js, Tailwind, Supabase, Vercel, Cloudflare Pages).
* **Pitching khách hàng cực đỉnh:** Đến gặp khách hàng không chỉ mang slide PowerPoint, mà mang theo một bản Prototype App chạy thật trên điện thoại!

---

## 2. TOOLKIT VIBE CODING CHUẨN CHO AGENCY (2025 – 2026)

| Công Cụ | Vai Trò Chính | Ứng Dụng Thực Tế Tại Hub |
| :--- | :--- | :--- |
| **Cursor / Claude Code** | AI Code Editor chuyên sâu | Dùng để mở rộng mã nguồn dự án `sadec-marketing-hub`, thêm tính năng mới |
| **v0.dev (Vercel)** | Prompt-to-UI component | Tạo giao diện Landing Page hoa kiểng, form đặt vé tour du lịch siêu tốc |
| **Lovable.dev / Bolt.new** | Fullstack App in Browser | Tạo nhanh web app nội bộ cho agency chỉ bằng 1 câu lệnh prompt |
| **n8n / Make.com** | Automation Backend | Nối form đăng ký từ website về Google Sheets và gửi thông báo Zalo/Telegram |
| **Supabase** | Backend & Database Serverless | Quản lý thông tin đặt tour, danh sách học viên, kho media assets |

---

## 3. CÔNG THỨC PROMPTING DÀNH CHO MARKETER

Để AI viết code chính xác, hãy áp dụng công thức **C-P-R (Context - Persona - Requirement)**:

```
[BỐI CẢNH (Context)]
Tôi đang xây dựng một Landing Page cho tour du lịch mùa nước nổi tại Vườn Quốc Gia Tràm Chim, Đồng Tháp.

[VAI TRÒ (Persona)]
Hãy đóng vai trò một Senior Frontend Designer am hiểu phong cách thiết kế Material Design 3 và văn hóa miền Tây Nam Bộ.

[YÊU CẦU CỤ THỂ (Requirement)]
1. Giao diện sử dụng màu chủ đạo là xanh rừng tràm (#1B4D3E) và vàng bông điên điển (#F4C430).
2. Tạo 1 component 'TourBookingForm' gồm:
   - Họ và tên, Số điện thoại (Zalo), Ngày đi (chọn lịch), Số lượng khách.
   - Chọn loại trải nghiệm: 'Chèo xuồng săn chim' hoặc 'Cắm trại ngắm hoa hoàng đầu ấn'.
   - Nút 'Xác nhận đặt chỗ' bo tròn mềm mại, hiệu ứng hover mượt mà.
3. Mã nguồn sử dụng React, Tailwind CSS và TypeScript sạch sẽ, có comment giải thích ngắn gọn.
```

---

## 4. QUY TRÌNH 4 BƯỚC TỪ Ý TƯỞNG ĐẾN SẢN PHẨM SỐNG (LIVE)

1. **Bước 1: Vẽ ý tưởng bằng lời (Ideate):** Gõ prompt mô tả màn hình mong muốn trên v0.dev hoặc Claude Code.
2. **Bước 2: Xem trước và tinh chỉnh (Review & Iterate):** Yêu cầu AI sửa màu sắc, thêm nút bấm, dịch sang tiếng Việt Nam Bộ.
3. **Bước 3: Tích hợp dữ liệu (Wire Data):** Dùng webhook đưa dữ liệu form gửi về Google Sheet hoặc CRM qua Supabase.
4. **Bước 4: Đẩy lên mạng (Deploy in 60s):** Kết nối GitHub với Vercel / Cloudflare Pages. Mỗi lần sửa code là tự động cập nhật web sống.

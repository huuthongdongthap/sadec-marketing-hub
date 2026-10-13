# 🧠 BÁO CÁO BRAINSTORM CHIẾN LƯỢC DEEP-DIVE: GIAI ĐOẠN 7 (PHASE 7)
## MEKONG MEDIA VAULT 4K & HƯƠNG SEN AI NAM BỘ SCRIPT STUDIO

> **Thời điểm lập:** 2026-10-11 | **Hệ thống:** Sa Đéc & Cao Lãnh Marketing Hub  
> **Phương pháp:** Binh Pháp Tôn Tử (Mưu Công & Binh Thế) • Chuẩn ClaudeKit DNA & Modularity  
> **Chỉ thị:** `/bootstrap-auto-parallel go next to /brainstorm --deep`

---

## 1. 📋 BRAINSTORM CONTRACT (4 TRỤ CỘT BẮT BUỘC)

| Trường (Field) | Định nghĩa & Cam kết thực thi |
| :--- | :--- |
| **Outcome** | Bản thiết kế chiến lược hoàn chỉnh, ma trận so sánh giải pháp và kế hoạch kỹ thuật cho Giai đoạn 7: Xây dựng **Kho Footage Bản Quyền 4K (Mekong Media Vault)** và **Bộ Công Cụ AI Biên Tập Kịch Bản Văn Hóa Nam Bộ (Hương Sen AI Studio)**, bổ sung 2 tầng doanh thu cao cấp cho hệ sinh thái. |
| **Constraints** | 1. 100% file JavaScript mới tuân thủ nghiêm ngặt quy tắc Modularity (< 200 dòng/file).<br>2. Bảo toàn tuyệt đối hệ thống kiểm thử tự động (1576/1576 tests hiện tại tiếp tục 100% Green).<br>3. Không làm tăng thời gian load web; build minification production `dist/` đạt chuẩn.<br>4. Thống nhất địa bàn hành chính mới của tỉnh Đồng Tháp (3 đô thị hạt nhân + vùng sinh thái, không dùng danh xưng huyện cũ). |
| **Non-goals** | 1. Không dựng backend server nặng nề tiêu tốn chi phí hạ tầng (chưa cần server dedicated / DB riêng).<br>2. Không thay đổi cấu trúc webhook giải ngân 4 bên đã vận hành ổn định tại Phase 6. |
| **Acceptance Criteria** | 1. Văn bản Brainstorm xác định rõ ràng 3 phương án kiến trúc kèm bảng phân tích trade-off.<br>2. Đề xuất phương án tối ưu khả thi nhất (Smallest Viable Approach) theo nguyên lý YAGNI - KISS - DRY.<br>3. Kịch bản chuyển giao (Handoff) sẵn sàng sang `/plan` và `/cook`. |

---

## 2. 🔍 HIỆN TRẠNG & BỐI CẢNH CHIẾN LƯỢC (EVIDENCE & INSIGHTS)

### 2.1. Nền tảng đã vững chắc sau Giai đoạn 1 - 6
1. **Hệ thống lõi:** Grand Slam Offer cho Co-founder, Học viện AI Academy, VietQR Napas 24/7, Booking Tour 4K, Zalo OA Tracker.
2. **Phase 6 vừa hoàn tất (PR #15 & #16):**
   - Webhook SePay/MBBank giả lập giải ngân 4 bên tự động (30% Homestay, 35% Ekip, 20% Thiết bị, 15% AI Hub).
   - Mạng lưới đối tác OCOP Đô thị & Vùng sinh thái Đồng Tháp bao phủ toàn diện 12 địa bàn mới nhất.
   - 1.576 unit tests Vitest và Playwright E2E smoke tests trên Cloudflare Pages đều đạt 100% Green.

### 2.2. Điểm nghẽn cốt tử: Bẫy "View Rẻ" của Content Văn Hóa
- Nếu chỉ sản xuất video văn hóa bản địa rồi đăng lên YouTube/TikTok để kiếm tiền view/AdSense, Agency sẽ rơi vào **"Tử địa"** (CPM tại Việt Nam chỉ dao động từ $0.3 – $0.8/1.000 views).
- Chi phí cử ekip máy quay điện ảnh Sony FX3, flycam và lens macro xuống thực địa là chi phí cứng lớn.
- **Lời giải Binh Pháp:** Phải áp dụng kế sách *"Dĩ đoản chế trường, biến phế vi bảo"*:
  - Mỗi khung hình 4K S-Log3 quay được tại Đồng Tháp Mười sau khi dựng clip ngắn xong **không được để nằm im trên ổ cứng**, mà phải được đưa vào **Media Vault** để bán bản quyền (Stock Footage B2B) cho các Hãng phim, Đài truyền hình (VTV, THVL), Agency du lịch, và Cơ quan xúc tiến thương mại.
  - Mỗi kịch bản quay thành công phải được đóng gói vào **Hương Sen AI Engine** để các chủ thể OCOP, Homestay có thể tự bấm nút tạo kịch bản bán hàng bằng ngôn ngữ Nam Bộ dí dỏm, chân chất.

---

## 3. ⚖️ SO SÁNH 3 HƯỚNG TIẾP CẬN KIẾN TRÚC (ARCHITECTURAL TRADE-OFFS)

```
                     ┌────────────────────────────────────────┐
                     │     HƯỚNG TIẾP CẬN GIAI ĐOẠN 7         │
                     └───────────────────┬────────────────────┘
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
  [PHƯƠNG ÁN A]                    [PHƯƠNG ÁN B]                    [PHƯƠNG ÁN C]
Heavy B2B SaaS DAM               Lightweight Web Components         Full Cloud Microservices
(Xây sàn thương mại số           (Client-Side Component & Mock      (Node.js/FastAPI + Supabase
độc lập với Stripe/S3)            Data Store kết nối Zalo/VietQR)   Storage + Cloudflare Stream)
- Chi phí cao, cồng kềnh         - Tinh gọn, tốc độ, < 200 dòng     - Phức tạp hạ tầng, tốn thời
- Vi phạm YAGNI                  - Đạt chuẩn KISS & DRY             gian deploy, dễ phát sinh lỗi
```

### Bảng phân tích ma trận Trade-off:

| Tiêu chí | Phương án A (Heavy SaaS DAM) | Phương án B (Lightweight Web Components) ⭐ | Phương án C (Cloud Microservices) |
| :--- | :--- | :--- | :--- |
| **Thời gian triển khai** | 3 - 4 tuần | **1 - 2 ngày** (Tối ưu tốc độ) | 2 - 3 tuần |
| **Độ phức tạp mã nguồn** | > 1.500 dòng, nhiều dependencies | **< 200 dòng/file**, thuần Vanilla JS / ES6 | > 1.000 dòng backend |
| **Chi phí hạ tầng (Cloud)** | Tốn $50 - $200/tháng (S3, bandwidth) | **0 VNĐ** (Chạy trên Cloudflare Pages) | Tốn $30 - $80/tháng |
| **Trải nghiệm người dùng** | Phải đăng nhập, tạo tài khoản rườm rà | **Xem trực tiếp, tính giá license tức thì, VietQR 24/7** | Phải xác thực OAuth, load lâu |
| **Tuân thủ Modularity** | Khó kiểm soát file size | **Tuân thủ 100% (< 200 dòng)** | Trung bình |
| **Đánh giá Binh Pháp** | *Bất quý cửu* (Kéo dài hao tổn) | *Thế như phá trúc* (Nhanh, hiểm, gọn) | *Đa nghi sinh biến* |

---

## 4. 🎯 PHƯƠNG ÁN TỐI ƯU ĐƯỢC CHỌN: PHƯƠNG ÁN B (LIGHTWEIGHT MODULAR COMPONENTS)

Áp dụng chặt chẽ triết lý **YAGNI - KISS - DRY** và nguyên tắc của Binh Pháp Tôn Tử:
1. **Mekong Media Vault 4K Component:**
   - Dữ liệu tách riêng vào `assets/js/components/mekong-media-vault-data.js` (< 200 dòng): Lưu danh mục 15-20 cảnh quay 4K cinematic đắt giá nhất của Đất Sen Hồng (Mùa Nước Nổi Tràm Chim, Giàn Hoa Sa Đéc rạng đông, Lò Chiếu Định Yên Chợ Ma, Cánh đồng sen Tháp Mười, Thu hoạch Xoài Cát Chu Cao Lãnh, Vựa Quýt Hồng Lai Vung...).
   - Hiển thị và giao diện vào `assets/js/components/mekong-media-vault.js` (< 200 dòng): Bảng giá bản quyền đa cấp (Dùng cá nhân/MXH: 490.000 ₫; Quảng cáo thương mại: 1.890.000 ₫; Độc quyền phát sóng TVC/Điện ảnh: 4.900.000 ₫), hỗ trợ tải file mẫu có watermark và tạo mã VietQR thanh toán tự động.
2. **Hương Sen AI Nam Bộ Script Studio Component:**
   - Dữ liệu prompt templates: `assets/js/components/huong-sen-ai-data.js` (< 200 dòng).
   - Logic sinh kịch bản tương tác: `assets/js/components/huong-sen-ai.js` (< 200 dòng): Người dùng chọn chủ đề (Homestay, Ẩm thực OCOP, Di sản làng nghề), chọn giọng điệu (Chân chất Miệt Vườn, Thơ mộng Nghệ nhân, Hài hước Ba Khía), hệ thống tự động xuất kịch bản phân cảnh 3 phần (Hook 3s đầu - Storytelling bản địa - Call To Action cọc tour/mua OCOP).
3. **Cơ chế gắn kết (Glue):**
   - Tích hợp liền mạch vào `index.html`, `partnership.html`, và `academy.html`.
   - Kết nối trực tiếp với Modal Webhook Giải Ngân và FAB Quick Connect hiện hữu.

---

## 5. 🗺️ KẾ HOẠCH BÀN GIAO & LỘ TRÌNH THỰC THI (HANDOFF TO PLAN & COOK)

```
┌────────────────────────────────────────────────────────────────────────┐
│                   LỘ TRÌNH GIAI ĐOẠN 7 (PHASE 7 DAG)                   │
├────────────────────────────────────────────────────────────────────────┤
│ Bước 1: Khởi tạo Plan chi tiết tại plans/20261011-phase-07-...         │
│ Bước 2: Xây dựng mekong-media-vault-data.js & mekong-media-vault.js   │
│ Bước 3: Xây dựng huong-sen-ai-data.js & huong-sen-ai.js               │
│ Bước 4: Tích hợp UI vào index.html & partnership.html                  │
│ Bước 5: Viết Unit Tests Vitest (tests/media-vault-and-huong-sen.ts)   │
│ Bước 6: Build production minified dist/ & Kiểm thử 100% Green          │
│ Bước 7: Git commit, Push branch, Tạo PR & Merge main, Deploy Cloudflare│
└────────────────────────────────────────────────────────────────────────┘
```

---

*Báo cáo được khởi tạo tự động bởi Claude Code CLI theo quy chuẩn Binh Pháp RaaS Agency 2026.*

# 🧪 PHASE 3: TÍCH HỢP UI, UNIT TESTS & PRODUCTION BUILD

> **Mục tiêu:** Tích hợp Media Vault và Hương Sen AI vào hệ thống giao diện, viết bộ kiểm thử Vitest toàn diện, build minified production và triển khai qua CI/CD.

---

## 🛠️ CHI TIẾT KỸ THUẬT

1. **Tích Hợp UI Đa Kênh:**
   - Cập nhật `index.html`: Thêm nút mở Media Vault và Hương Sen AI trên thanh hành động và Quick Connect FAB.
   - Cập nhật `partnership.html`: Minh họa 2 tầng doanh thu mới (Tầng 4: Media Vault Licensing và Tầng 5: Hương Sen AI SaaS Tool).
   - Cập nhật `academy.html`: Tích hợp module thực hành AI kịch bản Nam Bộ vào chương trình Vibe Coding.

2. **Kiểm Thử Tự Động (Vitest):**
   - Tạo test suite: `tests/media-vault-and-huong-sen.vitest.ts`.
   - Kiểm tra giới hạn < 200 dòng cho 4 files code mới.
   - Kiểm tra tính toán giá License và cấu trúc kịch bản 3 hồi.
   - Giữ vững 100% Green toàn bộ test suites.

3. **Production Build & Verification:**
   - Chạy `npm run build` để minify vào thư mục `dist/`.
   - Git commit & push branch `cao-linh-2026-update`.
   - Tạo PR, merge vào `main` và kiểm tra GitHub Actions + HTTP 200 Cloudflare Pages.

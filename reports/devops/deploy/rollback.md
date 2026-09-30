# Rollback & Recovery Plan

- **Project:** `sadec-marketing-hub`
- **Current Stable Deployment Hash:** `20e7d789`
- **Fallback Deployment Hash:** `251e9517` (Previous stable deployment)
- **Deployment Platform:** Cloudflare Pages

---

## 1. Instant Cloudflare Pages Rollback (< 30 seconds)
Nếu xảy ra bất kỳ sự cố ngoài ý muốn trên phiên bản hiện tại:
1. **Qua Cloudflare Dashboard:**
   - Truy cập: `Workers & Pages` > `sadec-marketing-hub` > `Deployments`.
   - Chọn bản build ổn định liền trước (`251e9517`).
   - Nhấn **Rollback to this deployment**.
2. **Qua Wrangler CLI:**
   ```bash
   npx wrangler pages deployment rollback --project-name=sadec-marketing-hub <DEPLOYMENT_ID>
   ```

---

## 2. Git Level Revert & Rollback
Trong trường hợp cần hoàn nguyên code trên Git:
```bash
# Tạo commit revert trên nhánh main
git revert HEAD -m 1
git push origin main

# GitHub Actions sẽ tự động kích hoạt workflow deploy-cloudflare.yml để cập nhật bản sạch
```

---

## 3. Local Cache & Asset Busting
- Trong file `_headers`, các file HTML được cấu hình `max-age=0, must-revalidate`.
- Khi rollback, mọi lượt truy cập của client sẽ nhận ngay phiên bản mới trong vòng vài giây mà không bị dính cache trình duyệt.

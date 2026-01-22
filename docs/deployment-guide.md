# 🚀 Deployment Guide

Hướng dẫn triển khai **AgencyOS 2026** lên production với Supabase và Cloudflare Pages.

---

## 1. Supabase Setup

### 1.1 Tạo Project

1. Truy cập [supabase.com](https://supabase.com) và tạo project mới
2. Chọn region gần nhất (Singapore hoặc Tokyo)
3. Lưu lại **Project URL** và **Anon Key** từ Settings → API

### 1.2 Database Schema

Chạy các file SQL theo thứ tự:

```bash
# 1. Core schema
psql -f database/schema.sql

# 2. RLS Policies
psql -f database/rls-policies.sql

# 3. Sample data (optional)
psql -f database/seed.sql
```

Hoặc sử dụng Supabase Dashboard:
1. Vào SQL Editor
2. Paste nội dung từ `database/schema.sql`
3. Nhấn **Run**

---

## 2. Environment Variables

### 2.1 Cấu hình `mekong-env.js`

Copy file mẫu và điền thông tin:

```bash
cp mekong-env.js.example mekong-env.js
```

Nội dung file:

```javascript
window.MekongEnv = {
    SUPABASE_URL: "https://your-project.supabase.co",
    SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    APP_ENV: "production",
    APP_DOMAIN: "mekong.marketing"
};
```

### 2.2 Biến môi trường quan trọng

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Project URL từ Supabase Dashboard | ✅ |
| `SUPABASE_ANON_KEY` | Anonymous key cho client-side | ✅ |
| `APP_ENV` | `development` / `production` | ✅ |
| `APP_DOMAIN` | Domain chính của ứng dụng | ✅ |

> [!CAUTION]
> **KHÔNG BAO GIỜ** commit `mekong-env.js` lên Git. File này đã được thêm vào `.gitignore`.

---

## 3. Edge Functions

### 3.1 Deploy Edge Functions

```bash
# Login Supabase CLI
npx supabase login

# Link với project
npx supabase link --project-ref <your-project-ref>

# Deploy tất cả functions
npx supabase functions deploy
```

### 3.2 Các Edge Functions

| Function | Endpoint | Description |
|----------|----------|-------------|
| `send-invoice` | `/functions/v1/send-invoice` | Gửi email hóa đơn |
| `ai-analysis` | `/functions/v1/ai-analysis` | Phân tích AI |
| `generate-report` | `/functions/v1/generate-report` | Tạo báo cáo PDF |

---

## 4. Cloudflare Pages Deployment

### 4.1 Connect Repository

1. Vào Cloudflare Dashboard → Pages
2. Create Project → Connect Git
3. Chọn repository `mekong-agency`

### 4.2 Build Settings

| Setting | Value |
|---------|-------|
| Build command | (để trống - static site) |
| Build output | `/` |
| Root directory | `/` |

### 4.3 Environment Variables

Thêm các biến sau trong Cloudflare Pages:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

---

## 5. Production Checklist

### 5.1 Security

- [ ] **SSL/HTTPS**: Đảm bảo tất cả traffic qua HTTPS
- [ ] **CORS**: Cấu hình CORS trong Supabase Dashboard
- [ ] **RLS Policies**: Verify tất cả policies đã được enable
- [ ] **Environment**: Đảm bảo `mekong-env.js` không được commit

### 5.2 Domain Setup

1. Thêm custom domain trong Cloudflare Pages
2. Cập nhật CNAME record:
   ```
   CNAME  @  your-project.pages.dev
   CNAME  www  your-project.pages.dev
   ```
3. Enable "Proxied" cho HTTPS tự động

### 5.3 Security Headers

Thêm vào `_headers` file:

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;
```

### 5.4 Performance

- [ ] Enable Cloudflare caching
- [ ] Compress images với WebP
- [ ] Minify CSS/JS (optional với Cloudflare)

### 5.5 Monitoring

- [ ] Setup Supabase Database Webhooks
- [ ] Enable Cloudflare Analytics
- [ ] Configure error tracking (Sentry/LogRocket)

---

## 6. Troubleshooting

### CORS Errors

Thêm domain vào Supabase → Settings → API → CORS:

```
https://mekong.marketing
https://www.mekong.marketing
```

### 401 Unauthorized

1. Verify `SUPABASE_ANON_KEY` chính xác
2. Check RLS policies cho table đang truy cập
3. Đảm bảo user đã được tạo trong `profiles` table

### Edge Function Timeout

- Increase timeout trong Supabase Dashboard
- Optimize database queries
- Consider using background jobs cho heavy tasks

---

## 7. Rollback Procedure

```bash
# List deployments
npx wrangler pages deployment list

# Rollback to specific deployment
npx wrangler pages deployment rollback <deployment-id>
```

---

© 2026 Mekong Agency. All rights reserved.

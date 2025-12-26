# 🚀 Hướng Dẫn Thiết Lập Supabase - Sa Đéc Marketing Hub

## Bước 1: Tạo Supabase Project

1. Truy cập [app.supabase.com](https://app.supabase.com)
2. Đăng nhập / Tạo tài khoản
3. Click **"New Project"**
4. Điền thông tin:
   - **Name**: `sadec-marketing-hub`
   - **Database Password**: Tạo password an toàn
   - **Region**: `Southeast Asia (Singapore)`
5. Click **"Create new project"** và chờ ~2 phút

---

## Bước 2: Tạo Database Tables

1. Vào **SQL Editor** (menu bên trái)
2. Click **"New Query"**
3. Copy toàn bộ nội dung từ file `supabase-schema.sql` 
4. Paste vào SQL Editor
5. Click **"Run"** (Ctrl+Enter)

✅ Bạn sẽ thấy các tables được tạo: `contacts`, `testimonials`, `services`, `blog_posts`, `analytics_events`

---

## Bước 3: Lấy API Keys

1. Vào **Project Settings** → **API**
2. Copy 2 giá trị sau:
   - **Project URL** (ví dụ: `https://xxx.supabase.co`)
   - **anon public** key

---

## Bước 4: Cấu Hình Frontend

Mở file `supabase-config.js` và thay thế:

```javascript
const SUPABASE_URL = 'https://xxx.supabase.co';  // ← Paste Project URL
const SUPABASE_ANON_KEY = 'eyJ...';              // ← Paste anon key
```

---

## Bước 5: Deploy lên Vercel

```bash
# Commit changes
git add .
git commit -m "Add Supabase integration"

# Deploy
vercel --prod
```

Hoặc thêm Environment Variables trên Vercel Dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 🎉 Xong!

Bây giờ khi ai đó gửi form liên hệ:
1. Data sẽ được lưu vào Supabase → Table `contacts`
2. Bạn có thể xem trong Supabase Dashboard → **Table Editor** → **contacts**

---

## Kiểm Tra Thử

1. Mở website và gửi form liên hệ
2. Vào Supabase Dashboard → Table Editor → contacts
3. Reload để xem data mới

---

## Troubleshooting

| Vấn đề | Giải pháp |
|--------|-----------|
| Form không lưu | Kiểm tra Console (F12) có lỗi không |
| CORS error | Vào Supabase Settings → API → Add website URL |
| RLS block | Kiểm tra Table → Policies đã tạo chính xác |

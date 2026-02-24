# 🔧 Setup VNPay & MoMo Payment Gateway Keys

## Tổng quan
PayOS đã hoạt động 100%. Cần setup API keys cho **VNPay** và **MoMo** trên Supabase Edge Functions.
Lỗi hiện tại: `"Key length is zero"` - do chưa có API keys trong Supabase secrets.

---

## 📋 BƯỚC 1: Đăng ký Tài khoản Merchant (Anh làm thủ công)

### 🔵 VNPay Sandbox
1. Truy cập: https://sandbox.vnpayment.vn/
2. Đăng ký tài khoản Merchant test (sandbox)
3. Sau khi được duyệt, vào **Dashboard → Thông tin tích hợp** để lấy:
   - `VNPAY_TMN_CODE` — Mã terminal (ví dụ: `MEKONG01`)
   - `VNPAY_SECRET_KEY` — Hash secret (ví dụ: `ABCDEF1234567890...`)

**Lưu ý**: VNPay sandbox có sẵn tài khoản test:
- TMN Code: `NCB` hoặc liên hệ VNPay support
- URL Sandbox: `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html` (đã config sẵn)

### 🟣 MoMo Sandbox  
1. Truy cập: https://business.momo.vn/
2. Đăng ký tài khoản đối tác (Partner)
3. Vào **Cài đặt → Thông tin ứng dụng** để lấy:
   - `MOMO_PARTNER_CODE` — Mã đối tác (ví dụ: `MOMOBKUN20180529`)
   - `MOMO_ACCESS_KEY` — Access key (ví dụ: `klm05TvNBzhg7h7j`)
   - `MOMO_SECRET_KEY` — Secret key (ví dụ: `at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa`)

**Lưu ý**: MoMo test environment:
- Endpoint: `https://test-payment.momo.vn/v2/gateway/api/create` (đã config sẵn)
- Tài khoản test MoMo: https://developers.momo.vn/v3/docs/payment/onboarding/test-instructions/

---

## 📋 BƯỚC 2: Set Supabase Secrets (CCC thực hiện)

Sau khi anh có keys, giao cho CCC chạy lệnh sau:

```bash
# ===== VNPay Keys =====
supabase secrets set VNPAY_TMN_CODE="<TMN_CODE_TỪ_VNPAY>"
supabase secrets set VNPAY_SECRET_KEY="<SECRET_KEY_TỪ_VNPAY>"

# ===== MoMo Keys =====
supabase secrets set MOMO_PARTNER_CODE="<PARTNER_CODE_TỪ_MOMO>"
supabase secrets set MOMO_ACCESS_KEY="<ACCESS_KEY_TỪ_MOMO>"
supabase secrets set MOMO_SECRET_KEY="<SECRET_KEY_TỪ_MOMO>"
```

---

## 📋 BƯỚC 3: Deploy Edge Functions (CCC thực hiện)

```bash
# Deploy VNPay function
supabase functions deploy create-payment --no-verify-jwt

# Deploy MoMo function
supabase functions deploy create-momo-payment --no-verify-jwt

# Deploy verify functions (for callback handling)
supabase functions deploy verify-payment --no-verify-jwt
supabase functions deploy verify-momo-payment --no-verify-jwt
```

---

## 📋 BƯỚC 4: Fix code tương tự PayOS (CCC thực hiện)

### 4.1 Fix `create-payment/index.ts` (VNPay)
- Wrap `savePaymentTransaction` trong try-catch (non-blocking) giống PayOS
- Đọc `description` từ `req.description` thay vì chỉ `req.orderInfo`

### 4.2 Fix `create-momo-payment/index.ts` (MoMo)
- Wrap `savePaymentTransaction` trong try-catch (non-blocking) giống PayOS
- Đọc `description` từ `req.description` thay vì chỉ `req.orderInfo`

### 4.3 Fix `index.html` - cleanup duplicate event listeners
- Hiện tại có 3 layer event listeners (bulletproof) → giữ Document-level + whenDefined
- Remove debug console.log (production cleanup)

---

## 📋 BƯỚC 5: Test (CCC thực hiện)

```bash
# Test VNPay
curl -s -X POST 'https://pzcgvfhppglzfjavxuid.supabase.co/functions/v1/create-payment' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6Y2d2ZmhwcGdsemZqYXZ4dWlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3MzE3ODYsImV4cCI6MjA4MjMwNzc4Nn0.xE_iEkIYaY0ql0Br_B64o1JKLuiAeAPg8GydLm71DLs' \
  -d '{"amount":5000000,"description":"Goi test","orderCode":1234567890,"invoiceId":"INV-TEST","invoiceNumber":"INV-TEST","returnUrl":"https://sadec-marketing-hub.vercel.app/portal/payment-result.html","cancelUrl":"https://sadec-marketing-hub.vercel.app/#pricing"}'

# Test MoMo
curl -s -X POST 'https://pzcgvfhppglzfjavxuid.supabase.co/functions/v1/create-momo-payment' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6Y2d2ZmhwcGdsemZqYXZ4dWlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3MzE3ODYsImV4cCI6MjA4MjMwNzc4Nn0.xE_iEkIYaY0ql0Br_B64o1JKLuiAeAPg8GydLm71DLs' \
  -d '{"amount":5000000,"description":"Goi test","orderCode":1234567890,"invoiceId":"INV-TEST","invoiceNumber":"INV-TEST","returnUrl":"https://sadec-marketing-hub.vercel.app/portal/payment-result.html","cancelUrl":"https://sadec-marketing-hub.vercel.app/#pricing"}'
```

---

## ⚡ Lệnh giao cho CCC (sau khi anh có keys)

```
claude "Setup VNPay & MoMo payment gateways theo plan .tasks/setup-vnpay-momo-keys.md:

1. Set Supabase secrets với keys anh cung cấp:
   - VNPAY_TMN_CODE=<value>
   - VNPAY_SECRET_KEY=<value>
   - MOMO_PARTNER_CODE=<value>
   - MOMO_ACCESS_KEY=<value>
   - MOMO_SECRET_KEY=<value>

2. Fix create-payment/index.ts - wrap savePaymentTransaction trong try-catch

3. Fix create-momo-payment/index.ts - wrap savePaymentTransaction trong try-catch

4. Deploy cả 2 function: supabase functions deploy create-payment --no-verify-jwt && supabase functions deploy create-momo-payment --no-verify-jwt

5. Test bằng curl từ plan

6. Cleanup index.html - giảm duplicate event listeners, remove debug logs

7. Git commit + push + vercel --prod"
```

---

## 📊 Trạng thái hiện tại

| Gateway | API Keys | Edge Function | Frontend | Status |
|---------|----------|--------------|----------|--------|
| PayOS | ✅ Set | ✅ Deployed | ✅ Working | 🟢 LIVE |
| VNPay | ❌ Chưa set | ✅ Code ready | ✅ Working | 🔴 Cần keys |
| MoMo | ❌ Chưa set | ✅ Code ready | ✅ Working | 🔴 Cần keys |

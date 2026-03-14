# Sa Đéc Marketing Hub — Cloudflare Workers API

Backend API cho sadec-marketing-hub, chạy trên **Cloudflare Workers** với Hono.js framework.

## Architecture

```
Frontend (CF Pages) → Workers API → Cloudflare D1 (database)
                              ↘→ Cloudflare R2 (file storage)
                              ↘→ Supabase Auth (JWT verify only)
```

## API Endpoints

### Health
- `GET /api/health` — status check

### Payments
- `POST /api/payments/vnpay/create` — tạo payment URL VNPay
- `POST /api/payments/payos/create` — tạo checkout URL PayOS
- `POST /api/payments/momo/create` — tạo deeplink MoMo
- `GET  /api/payments/vnpay/verify` — verify VNPay return callback

### Webhooks (no auth, HMAC verified)
- `POST /api/webhooks/momo` — MoMo IPN notification
- `POST /api/webhooks/payos` — PayOS webhook
- `POST /api/webhooks/zalo` — Zalo OA event webhook

### Assets (R2)
- `GET    /api/assets/:clientId` — list client files
- `POST   /api/assets/upload` — upload file → R2
- `GET    /api/assets/file/:key` — serve R2 file
- `DELETE /api/assets/:key` — delete file

### Analytics
- `POST /api/analytics/event` — track event (public)
- `GET  /api/analytics/dashboard` — admin dashboard
- `POST /api/analytics/score-lead` — score a lead

## Setup

```bash
cd workers
npm install

# Deploy D1 database
wrangler d1 create sadec-db
# Copy database_id to wrangler.toml

# Run migrations
wrangler d1 execute sadec-db --local --file=migrations/0001_schema.sql

# Create R2 bucket
wrangler r2 bucket create sadec-assets

# Set secrets
wrangler secret put SUPABASE_JWT_SECRET
wrangler secret put VNPAY_TMN_CODE
wrangler secret put VNPAY_SECRET_KEY
wrangler secret put MOMO_PARTNER_CODE
wrangler secret put MOMO_ACCESS_KEY
wrangler secret put MOMO_SECRET_KEY
wrangler secret put PAYOS_CLIENT_ID
wrangler secret put PAYOS_API_KEY
wrangler secret put PAYOS_CHECKSUM_KEY
wrangler secret put ZALO_OA_SECRET

# Run locally
npm run dev

# Deploy
npm run deploy
```

## Auth
All protected routes require `Authorization: Bearer <supabase_jwt>` header.
JWT is verified using Web Crypto API — **no Supabase SDK needed in Workers**.

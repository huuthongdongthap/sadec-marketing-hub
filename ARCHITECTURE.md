# Architecture — Sa Đéc Marketing Hub

## Stack Overview

```
┌─────────────────────────────────────────────┐
│            CLIENT (Browser)                  │
│   HTML/CSS/JS Vanilla + Web Components      │
│   Material Design 3 · Teal #006A60          │
└──────────────────┬──────────────────────────┘
                   │ HTTPS
┌──────────────────▼──────────────────────────┐
│              VERCEL EDGE CDN                 │
│   Security Headers · Cache-Control          │
│   vercel.json routing rules                 │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│              SUPABASE BACKEND                │
│  Auth (JWT)  │  PostgreSQL  │  Realtime     │
│  Row Level Security (RLS)                   │
│  Edge Functions (business logic)            │
└─────────────────────────────────────────────┘
```

## Portals

| Portal | URL | Người dùng |
|--------|-----|-----------|
| Admin | `/admin/dashboard.html` | Nhân viên nội bộ |
| Agency | `/agency-platform.html` | Đối tác agency |
| Client | `/client-portal.html` | Khách hàng |
| Affiliate | `/affiliate.html` | Cộng tác viên |

## Key Files

| File | Mô tả |
|------|-------|
| `supabase-config.js` | Supabase client init |
| `auth.js` | Auth flow, role checking |
| `material-interactions.js` | MD3 interactions |
| `assets/js/enhanced-utils.js` | Shared utilities |
| `sw.js` | Service Worker (PWA) |
| `mekong.config.yaml` | Mekong CLI config |

## Data Flow — Payments

```
User → Client Portal → PayOS/VNPay API
     → Supabase (log transaction)
     → Webhook → Supabase Edge Function
     → Update payment status
```

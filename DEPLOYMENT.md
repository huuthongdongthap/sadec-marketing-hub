# Deployment Guide

## Cloudflare Pages (Production)

```bash
# Deploy tự động qua GitHub Actions CI/CD
git push origin main   # CI/CD tự chạy → Cloudflare Pages deploy

# Manual deploy
wrangler pages deploy . --project-name=sadec-marketing-hub --branch=main
```

### Environment Variables trên Cloudflare Pages
Vào Cloudflare Dashboard → Pages → sadec-marketing-hub → Settings → Environment Variables:
```
SUPABASE_URL        = https://xxx.supabase.co
SUPABASE_ANON_KEY   = eyJxxxxxxx
PAYOS_API_KEY       = your_key
```

## Local Dev

```bash
npm install
cp .env.example .env    # Điền credentials
npm run dev             # http://localhost:8080
```

## Database Migrations

```bash
npm run migrate:print   # Xem migration sẽ chạy
npm run migrate:run     # Chạy migrations
```

## Kiểm tra trước khi deploy

```bash
npm test                # Playwright E2E
npm audit               # Security scan
```

## Domain

- **Production:** `sadecmarketinghub.com` → Cloudflare Pages
- **Preview:** `sadec-marketing-hub.pages.dev`

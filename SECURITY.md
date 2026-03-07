# Security Policy

## Supported Versions

| Version | Support |
|---------|---------|
| 2.x (latest) | ✅ Active |
| 1.x | ❌ EOL |

## Reporting a Vulnerability

**Không public issue trên GitHub.** Gửi báo cáo bảo mật đến:

📧 **Email:** security@sadecmarketinghub.com  
🔒 **Subject:** `[SECURITY] Vulnerability Report`

**Thông tin cần bao gồm:**
- Mô tả lỗ hổng
- Steps to reproduce
- Impact đánh giá
- CVE nếu có

**SLA phản hồi:** 72 giờ. Patch trong 14 ngày cho critical issues.

## Security Headers

Dự án enforce các HTTP security headers sau (qua `vercel.json`):
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `Strict-Transport-Security: max-age=63072000`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

## Scope

- ✅ Authentication bypass
- ✅ SQL Injection / XSS
- ✅ Exposed API keys hoặc credentials
- ✅ Supabase RLS bypass
- ❌ Social engineering attacks
- ❌ DoS/DDoS

# SEO Implementation Guide - SaĐéc Marketing Hub

## Overview

Hướng dẫn triển khai SEO metadata cho tất cả HTML pages trong project SaĐéc Marketing Hub.

## File Structure

```
apps/sadec-marketing-hub/
├── assets/partials/
│   └── seo-head.html          # SEO template snippet
├── admin/
│   ├── src/
│   │   ├── lib/
│   │   │   └── seo-metadata.ts    # Centralized metadata registry
│   │   └── components/
│   │       └── SEOHead.tsx        # React component
│   └── index.html             # Main HTML (has SEO)
├── index.html                 # Landing page (has SEO)
├── portal/
│   └── *.html                 # Client portal pages
└── affiliate/
    └── *.html                 # Affiliate pages
```

## Usage

### 1. React App (Admin Dashboard)

The React app uses the `SEOHead` component for dynamic metadata:

```tsx
import { SEOHead, DocumentHead } from '@/components/SEOHead'

function Page() {
  return (
    <>
      <DocumentHead>
        <SEOHead path="/admin/dashboard" />
      </DocumentHead>
      {/* Page content */}
    </>
  )
}
```

Or with custom overrides:

```tsx
<SEOHead
  path="/admin/dashboard"
  title="Custom Title - SaĐéc Marketing Hub"
  description="Custom description for this page"
  robots="noindex, follow"
/>
```

### 2. Static HTML Pages

For static HTML pages, include the SEO template from `assets/partials/seo-head.html`.

**Required replacements:**
- `{{TITLE}}` - Page title
- `{{DESCRIPTION}}` - Page description
- `{{KEYWORDS}}` - Page keywords
- `{{URL}}` - Canonical URL
- `{{ROBOTS}}` - Robots directive (default: "index, follow")

**Example:**

```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">

  <!-- SEO Meta Tags -->
  <title>Dashboard - SaĐéc Marketing Hub</title>
  <meta name="description" content="Bảng điều khiển quản lý - Theo dõi chiến dịch và hiệu quả marketing">
  <meta name="keywords" content="dashboard, marketing, chiến dịch, analytics">
  <meta name="robots" content="noindex, follow">
  <link rel="canonical" href="https://sadecmarketinghub.com/portal/dashboard.html">

  <!-- Open Graph -->
  <meta property="og:title" content="Dashboard - SaĐéc Marketing Hub">
  <meta property="og:description" content="Bảng điều khiển quản lý - Theo dõi chiến dịch và hiệu quả marketing">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://sadecmarketinghub.com/portal/dashboard.html">
  <meta property="og:image" content="https://sadecmarketinghub.com/og-image.png">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Dashboard - SaĐéc Marketing Hub">
  <meta name="twitter:description" content="Bảng điều khiển quản lý - Theo dõi chiến dịch và hiệu quả marketing">
  <meta name="twitter:image" content="https://sadecmarketinghub.com/og-image.png">

  <!-- Favicon -->
  <link rel="icon" type="image/png" href="/favicon.png">

  <!-- Other head content -->
</head>
<body>
  <!-- Content -->
</body>
</html>
```

## Metadata Registry

All page metadata is centralized in `admin/src/lib/seo-metadata.ts`.

### Available Pages

| Path | Title | Description | Robots |
|------|-------|-------------|--------|
| `/` | Mekong Agency | Digital marketing cho doanh nghiệp địa phương | index, follow |
| `/admin` | Admin Dashboard | Bảng điều khiển quản trị | noindex, follow |
| `/admin/dashboard` | Dashboard - Admin | Tổng quan hiệu suất marketing | noindex, follow |
| `/admin/campaigns` | Chiến Dịch | Quản lý campaigns | noindex, follow |
| `/admin/leads` | Leads | Quản lý khách hàng tiềm năng | noindex, follow |
| `/portal` | Client Portal | Cổng thông tin khách hàng | noindex, follow |
| `/portal/dashboard` | Dashboard - Khách Hàng | Theo dõi chiến dịch và báo cáo | noindex, follow |
| `/portal/projects` | Dự Án | Theo dõi tiến độ dự án | noindex, follow |
| `/portal/reports` | Báo Cáo | Báo cáo hiệu suất và ROI | noindex, follow |
| `/affiliate` | Affiliate Program | Chương trình affiliate | index, follow |
| `/affiliate/dashboard` | Affiliate Dashboard | Theo dõi hoa hồng và referrals | noindex, follow |
| `/auth/login` | Đăng Nhập | Login page | noindex, follow |

## Best Practices

### 1. Title Tags
- Keep under 60 characters
- Include primary keyword near the beginning
- Format: `Page Name - Site Name`

### 2. Meta Description
- Keep between 150-160 characters
- Include call-to-action
- Use primary and secondary keywords naturally

### 3. Keywords
- Focus on 3-5 relevant keywords per page
- Include location-based keywords for local SEO (Sa Đéc, Đồng Tháp, Mekong Delta)

### 4. Robots Meta
- Use `noindex, follow` for admin/portal pages (internal tools)
- Use `index, follow` for public-facing pages

### 5. Canonical URLs
- Always specify canonical URL to prevent duplicate content
- Use absolute URLs with HTTPS

### 6. Open Graph
- Always include og:title, og:description, og:image
- Use 1200x630px images for optimal social sharing

### 7. Schema.org JSON-LD
- Include organization information
- Add local business schema with address and contact info
- Use MarketingAgency type

## Performance Optimizations

### Preconnect Hints
```html
<link rel="preconnect" href="https://pzcgvfhppglzfjavxuid.supabase.co" crossorigin>
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="dns-prefetch" href="https://fonts.googleapis.com">
<link rel="dns-prefetch" href="https://fonts.gstatic.com">
```

### Load Order
1. Critical CSS (inline)
2. Preload critical fonts
3. Defer non-critical scripts
4. Async load analytics/tracking scripts

## Checklist for New Pages

- [ ] Add page to `seo-metadata.ts` registry
- [ ] Create unique title (under 60 chars)
- [ ] Write compelling description (150-160 chars)
- [ ] Select 3-5 relevant keywords
- [ ] Set appropriate robots directive
- [ ] Add canonical URL
- [ ] Include Open Graph tags
- [ ] Include Twitter Card tags
- [ ] Add JSON-LD structured data
- [ ] Test with Google Rich Results Test
- [ ] Verify with Facebook Sharing Debugger

## Tools

- **Google Search Console**: Monitor indexing status
- **Google Rich Results Test**: Test structured data
- **Facebook Sharing Debugger**: Preview OG tags
- **Twitter Card Validator**: Check Twitter cards
- **PageSpeed Insights**: Performance audit

## Maintenance

- Review and update metadata quarterly
- Monitor click-through rates in Search Console
- A/B test different title/description combinations
- Keep schema.org markup up to date

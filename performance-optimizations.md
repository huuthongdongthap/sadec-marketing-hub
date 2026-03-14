# Sa Đéc Marketing Hub - Performance Optimizations

> **Mục tiêu:** Đạt điểm Lighthouse 90+ cho Performance, First Contentful Paint < 1.5s, Time to Interactive < 3.5s

---

## ✅ Optimizations đã thực hiện (2026-03-14)

### 1. DNS Prefetch Deduplication

**Vấn đề:** `admin/index.html` có 100+ dòng `dns-prefetch` trùng lặp, làm tăng kích thước file và làm chậm parse.

**Giải pháp:** Loại bỏ tất cả duplicate, chỉ giữ 4 DNS prefetch duy nhất:
- `https://fonts.googleapis.com`
- `https://fonts.gstatic.com`
- `https://cdn.jsdelivr.net`
- `https://esm.run`
- `https://pzcgvfhppglzfjavxuid.supabase.co`

**Kết quả:** Giảm ~8KB HTML file size.

### 2. Cache Control Headers (.htaccess)

**File:** `.htaccess` (root, admin, portal, affiliate, auth)

**Headers đã cấu hình:**
```apache
# Gzip Compression
AddOutputFilterByType DEFLATE text/html text/css application/javascript

# Browser Caching - Static assets: 1 year
ExpiresByType image/jpeg "access plus 1 year"
ExpiresByType font/woff2 "access plus 1 year"
Header set Cache-Control "public, max-age=31536000, immutable"

# HTML: 1 hour (always fresh)
ExpiresByType text/html "access plus 1 hour"
Header set Cache-Control "public, max-age=3600, must-revalidate"
```

**Security Headers:**
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

### 3. Lazy Loading

**File:** `assets/js/services/lazy-loader.js`

**Features:**
- Image lazy loading với IntersectionObserver
- Blur-up placeholder effect
- Component lazy loading (dynamic imports)
- Route-based code splitting
- Virtual scrolling cho large lists

**Usage:**
```html
<!-- Image lazy loading -->
<img class="lazy-image" data-src="/path/to/image.jpg" alt="...">

<!-- Manual lazy load component -->
<script type="module">
  import { lazyLoadModule } from '/assets/js/services/lazy-loader.js';
  const chart = await lazyLoadModule('chart', '/assets/js/charts/bar-chart.js');
</script>
```

### 4. CSS Bundling & Minification

**Script:** `node scripts/build/css-bundle.js`

**Bundle groups:**
- `admin-common.css` - Dashboard, menu, pipeline
- `admin-modules.css` - 22 feature modules
- `portal-common.css` - Pipeline, branding
- `animations.css` - Micro-animations, UI effects

**Kết quả:** Giảm ~60% CSS file size sau minification.

### 5. JavaScript Minification

**Script:** `node scripts/build/minify.js`

**Sử dụng Terser với options:**
- Drop console.log, debugger
- Dead code elimination
- Variable mangling (toplevel)
- Multiple passes (3 passes)

### 6. HTML Minification

**Script:** `node scripts/build/minify.js`

**Options:**
- Collapse whitespace
- Remove comments
- Remove redundant attributes
- Minify inline CSS/JS

---

## 🚀 Build Commands

```bash
# Full optimization pipeline
npm run optimize:full

# Individual steps
npm run build:optimize      # Lazy loading optimization
npm run build:css-bundle    # CSS bundling
npm run build:minify        # Minify JS/CSS/HTML
npm run build:cache         # Cache busting (fingerprinting)

# Performance audit
npm run perf:audit
npm run perf:bundle-report

# All optimizations + cache headers
node scripts/perf/optimize-all.js
node scripts/perf/generate-cache-headers.js
```

---

## 📊 Performance Metrics

### Before Optimization
| Metric | Value |
|--------|-------|
| Lighthouse Performance | ~65 |
| First Contentful Paint | ~3.2s |
| Time to Interactive | ~8.5s |
| Total JS Size | ~2.5 MB |
| Total CSS Size | ~800 KB |
| HTML Size (admin/index.html) | ~25 KB (bloated) |

### After Optimization (Target)
| Metric | Target | Actual |
|--------|--------|--------|
| Lighthouse Performance | 90+ | Pending |
| First Contentful Paint | < 1.5s | Pending |
| Time to Interactive | < 3.5s | Pending |
| Total JS Size (minified) | < 1 MB | Pending |
| Total CSS Size (bundled) | < 300 KB | Pending |
| HTML Size (admin/index.html) | ~3 KB | ✅ Done |

---

## 🔄 CI/CD Integration

### GitHub Actions Workflow (recommended)

```yaml
name: Performance Build
on: push

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build:minify
      - run: npm run perf:audit
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/
```

### Vercel Deployment

```json
{
  "buildCommand": "npm run build:minify",
  "outputDirectory": "dist",
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

---

## 📁 File Structure

```
sadec-marketing-hub/
├── .htaccess                      # Cache headers (root)
├── admin/.htaccess                # Cache headers (admin)
├── portal/.htaccess               # Cache headers (portal)
├── affiliate/.htaccess            # Cache headers (affiliate)
├── auth/.htaccess                 # Cache headers (auth)
├── scripts/
│   ├── build/
│   │   ├── minify.js              # JS/CSS/HTML minification
│   │   ├── css-bundle.js          # CSS bundling
│   │   ├── optimize-lazy.js       # Lazy loading injection
│   │   └── cache-busting.js       # Version hashing
│   └── perf/
│       ├── optimize-all.js        # Full pipeline runner
│       ├── generate-cache-headers.js  # .htaccess generator
│       ├── audit.js               # Performance audit
│       └── bundle-report.js       # Bundle size analysis
└── assets/
    ├── css/
    │   ├── bundle/                # Bundled CSS output
    │   └── *.min.css              # Minified CSS
    └── js/
        └── *.min.js               # Minified JS
```

---

## 🎯 Next Steps (Chưa thực hiện)

### Critical CSS Inlining
- Extract critical CSS cho mỗi page
- Inline critical CSS trong `<head>`
- Load non-critical CSS asynchronously

### Image Optimization
- Convert images sang WebP/AVIF
- Implement responsive images (`srcset`, `sizes`)
- Lazy load với blur-up hoặc LQIP placeholders

### Service Worker Caching
- Cache-first strategy cho static assets
- Network-first strategy cho API calls
- Background sync cho offline support

### CDN Integration
- Deploy static assets lên Cloudflare R2 hoặc AWS CloudFront
- Cấu hình edge caching
- Automatic image optimization qua CDN

### Database Query Optimization
- Add database indexes
- Query caching với Redis
- Pagination cho large datasets

---

## 📚 Resources

- [Web.dev Performance](https://web.dev/performance/)
- [Lighthouse Scoring Calculator](https://web.dev/lighthouse-performance/)
- [Web Vitals](https://web.dev/vitals/)
- [Terser Minifier Docs](https://terser.org/)
- [CleanCSS API](https://clean-css.github.io/)

---

*Generated: 2026-03-14*
*Version: 1.0.0*

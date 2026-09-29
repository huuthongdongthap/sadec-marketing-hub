# Sa Đéc Marketing Hub - Performance Optimization Guide

## Tổng quan

Dự án đã được tối ưu hóa hiệu suất toàn diện với 3 trụ cột chính:
1. **Minification** - Giảm kích thước file HTML, CSS, JS
2. **Lazy Loading** - Tải nội dung theo yêu cầu
3. **Caching** - Lưu trữ tạm thời thông minh

---

## 1. Minification (Nén code)

### Cài đặt

```bash
npm install
```

### Sử dụng

```bash
# Build với minification
npm run build

# Chỉ minify
npm run build:minify

# Optimize + Minify
npm run optimize
```

### Kết quả mong đợi

| Loại file | Giảm kích thước |
|-----------|-----------------|
| HTML | 30-40% |
| CSS | 50-60% |
| JS | 40-50% |

### Output

File được xuất ra thư mục `dist/` với cấu trúc giữ nguyên như source.

---

## 2. Lazy Loading (Tải lười)

### Image Lazy Loading

Tự động thêm `loading="lazy"` cho tất cả ảnh không nằm trong hero section.

**HTML trước:**
```html
<img src="banner.jpg" alt="Banner">
```

**HTML sau:**
```html
<img src="banner.jpg" alt="Banner" loading="lazy" decoding="async" class="lazy-image">
```

### Manual Usage

```html
<!-- Ảnh với blur-up placeholder -->
<img
    data-src="image-large.jpg"
    data-placeholder="image-thumb.jpg"
    class="lazy-image"
    alt="Description"
>

<!-- Lazy load component -->
<div id="chart-container" data-lazy="chart.js"></div>

<!-- Lazy load iframe -->
<iframe
    src="https://www.youtube.com/embed/xyz"
    loading="lazy"
    title="Video"
></iframe>
```

### JavaScript API

```javascript
import {
    lazyLoadModule,
    lazyLoadScript,
    lazyLoadStylesheet
} from './assets/js/lazy-loader.js';

// Lazy load module
const chartModule = await lazyLoadModule('Chart', '/assets/js/charts.js');

// Lazy load external script
await lazyLoadScript('https://cdn.jsdelivr.net/npm/chart.js', 'chart.js');

// Lazy load stylesheet
await lazyLoadStylesheet('/assets/css/heavy.css', 'heavy-styles');
```

---

## 3. Caching Strategy

### Service Worker v2

**Chiến lược cache:**

| Tài nguyên | Strategy | TTL |
|------------|----------|-----|
| Static (CSS/JS) | Cache First | 1 năm |
| Images | Cache First + Background Update | 7 ngày |
| Fonts | Cache First | 30 ngày |
| HTML Pages | Stale While Revalidate | - |
| API Calls | Network First + Cache Fallback | 5 phút |

### Vercel Cache Headers

```
Static Assets: public, max-age=31536000, immutable
Images: public, max-age=2592000, stale-while-revalidate=604800
HTML Pages: public, max-age=0, must-revalidate, stale-while-revalidate=300
API: private, no-store, no-cache
```

---

## 4. Performance Checklist

### Trước khi deploy

- [ ] Chạy `npm run optimize` để optimize tất cả file
- [ ] Verify service worker register trong index.html
- [ ] Test lazy loading với Chrome DevTools Network tab
- [ ] Chạy Lighthouse audit (target: 90+)

### Monitoring

```bash
# Check file sizes trong dist/
find dist -type f -name "*.js" -o -name "*.css" | xargs du -h | sort -hr

# Check cache headers
curl -I https://your-domain.com/assets/css/m3-agency.css
```

---

## 5. Best Practices

### DO ✅

- Sử dụng `loading="lazy"` cho ảnh dưới fold
- Dùng skeleton loaders cho nội dung dynamic
- Preload critical assets (hero image, fonts)
- Add DNS prefetch cho external domains
- Cache API responses với TTL ngắn

### DON'T ❌

- Không lazy load ảnh above fold (hero, logo)
- Không cache quá lâu với API data
- Không minify file trong development
- Không dùng inline images (Base64) cho file lớn

---

## 6. File Structure

```
sadec-marketing-hub/
├── scripts/build/
│   ├── minify.js          # Minification script
│   └── optimize-lazy.js   # Lazy loading optimizer
├── assets/
│   ├── css/
│   │   └── lazy-loading.css   # Lazy loading styles
│   └── js/
│       └── lazy-loader.js     # Lazy loading utilities
├── dist/                    # Build output (generated)
├── sw.js                    # Service Worker v2
└── vercel.json              # Cache headers config
```

---

## 7. Testing

### Lighthouse Audit

```bash
# Chrome DevTools → Lighthouse → Run audit
Target scores:
- Performance: 90+
- Best Practices: 90+
- SEO: 90+
- PWA: 80+
```

### Core Web Vitals

| Metric | Target | Measurement |
|--------|--------|-------------|
| LCP | < 2.5s | 75th percentile |
| FID | < 100ms | 75th percentile |
| CLS | < 0.1 | 75th percentile |

---

## 8. Troubleshooting

### Service Worker không update

```javascript
// Force SW update trong browser console
navigator.serviceWorker.getRegistration().then(r => {
    if (r) r.unregister();
    window.location.reload();
});
```

### Lazy loaded images không hiện

- Check `IntersectionObserver` support
- Verify `data-src` attribute exists
- Check console for load errors

### Cache quá cũ

```bash
# Clear cache từ browser console
caches.keys().then(names => Promise.all(names.map(n => caches.delete(n))))
```

---

## 9. Performance Budget

| Resource Type | Budget | Limit |
|---------------|--------|-------|
| HTML | 50 KB | 100 KB |
| CSS | 100 KB | 200 KB |
| JS | 200 KB | 400 KB |
| Images | 500 KB | 1 MB |
| Fonts | 100 KB | 200 KB |
| **Total** | **850 KB** | **1.9 MB** |

---

## 10. Release Notes

### v2.0.0 (2026-03-13)

**Improvements:**
- ✅ Service Worker v2 với advanced caching
- ✅ Build minification với terser + clean-css
- ✅ Lazy loading optimizer tự động
- ✅ Enhanced Vercel cache headers
- ✅ Blur-up image placeholders
- ✅ Skeleton loaders cho cards

**Expected Impact:**
- 📉 50% reduction in bundle size
- ⚡ 40% faster initial page load
- 🚀 60% improvement in LCP
- 📱 Better offline experience

---

*Documentation generated on 2026-03-13*

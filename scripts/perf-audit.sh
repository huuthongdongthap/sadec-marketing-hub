#!/bin/bash
# SA ĐÉC MARKETING HUB — PERFORMANCE AUDIT SCRIPT
# Quét lazy loading, cache headers, file sizes, resource hints

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ADMIN_DIR="$ROOT_DIR/admin"
PORTAL_DIR="$ROOT_DIR/portal"
ASSETS_DIR="$ROOT_DIR/assets"

echo "🚀 SA ĐÉC MARKETING HUB — PERFORMANCE AUDIT"
echo "============================================"
echo ""

# 1. LAZY LOADING IMAGES
echo "🖼️  LAZY LOADING IMAGES"
echo "----------------------"
lazy_count=0
total_img=0

for f in "$ADMIN_DIR"/*.html "$PORTAL_DIR"/*.html; do
    if [ -f "$f" ]; then
        file_lazy=$(grep -c 'loading="lazy"' "$f" 2>/dev/null || echo 0)
        file_total=$(grep -c '<img' "$f" 2>/dev/null || echo 0)
        lazy_count=$((lazy_count + file_lazy))
        total_img=$((total_img + file_total))
    fi
done

echo "  Total images: $total_img"
echo "  Lazy loaded: $lazy_count"
if [ $total_img -gt 0 ]; then
    percentage=$((lazy_count * 100 / total_img))
    echo "  Coverage: ${percentage}%"
    if [ $percentage -ge 80 ]; then
        echo "  ✅ Good lazy loading coverage"
    else
        echo "  ⚠️  Consider adding more lazy loading"
    fi
fi
echo ""

# 2. SERVICE WORKER
echo "🔧 SERVICE WORKER"
echo "----------------"
if [ -f "$ROOT_DIR/sw.js" ]; then
    echo "  ✅ Service worker exists"
    cache_version=$(grep "CACHE_VERSION = " "$ROOT_DIR/sw.js" | head -1 | cut -d"'" -f2)
    echo "  Cache version: $cache_version"

    # Check cache strategies
    if grep -q "Cache First" "$ROOT_DIR/sw.js"; then
        echo "  ✅ Cache First strategy implemented"
    fi
    if grep -q "Stale While Revalidate" "$ROOT_DIR/sw.js"; then
        echo "  ✅ Stale While Revalidate implemented"
    fi
    if grep -q "Network First" "$ROOT_DIR/sw.js"; then
        echo "  ✅ Network First strategy implemented"
    fi
else
    echo "  ❌ No service worker found"
fi
echo ""

# 3. RESOURCE HINTS
echo "🔗 RESOURCE HINTS"
echo "----------------"
dns_prefetch=0
preconnect=0
preload=0

for f in "$ADMIN_DIR"/*.html "$PORTAL_DIR"/*.html; do
    if [ -f "$f" ]; then
        dns_prefetch=$((dns_prefetch + $(grep -c 'dns-prefetch' "$f" 2>/dev/null || echo 0)))
        preconnect=$((preconnect + $(grep -c 'preconnect' "$f" 2>/dev/null || echo 0)))
        preload=$((preload + $(grep -c 'preload' "$f" 2>/dev/null || echo 0)))
    fi
done

echo "  DNS Prefetch: $dns_prefetch occurrences"
echo "  Preconnect: $preconnect occurrences"
echo "  Preload: $preload occurrences"
if [ $((dns_prefetch + preconnect)) -gt 0 ]; then
    echo "  ✅ Resource hints implemented"
else
    echo "  ⚠️  Consider adding resource hints"
fi
echo ""

# 4. CSS/JS BUNDLES
echo "📦 CSS/JS BUNDLES"
echo "----------------"
css_count=$(find "$ASSETS_DIR/css" -name "*.css" 2>/dev/null | wc -l)
js_count=$(find "$ASSETS_DIR/js" -name "*.js" 2>/dev/null | wc -l)
css_total_size=$(du -sh "$ASSETS_DIR/css" 2>/dev/null | cut -f1)
js_total_size=$(du -sh "$ASSETS_DIR/js" 2>/dev/null | cut -f1)

echo "  CSS files: $css_count (Total: $css_total_size)"
echo "  JS files: $js_count (Total: $js_total_size)"

# Check for bundle files
bundle_css=$(find "$ASSETS_DIR/css" -name "*bundle*" -o -name "*min*" 2>/dev/null | wc -l)
bundle_js=$(find "$ASSETS_DIR/js" -name "*bundle*" -o -name "*min*" 2>/dev/null | wc -l)
echo "  Bundle/Minified CSS: $bundle_css files"
echo "  Bundle/Minified JS: $bundle_js files"
echo ""

# 5. CACHE BUSTING
echo "🔒 CACHE BUSTING"
echo "---------------"
cache_bust_count=0
total_assets=0

for f in "$ADMIN_DIR"/*.html "$PORTAL_DIR"/*.html; do
    if [ -f "$f" ]; then
        file_cache=$(grep -c '?v=' "$f" 2>/dev/null || echo 0)
        file_total=$(grep -cE '(href|src)="[^"]*\.(css|js)"' "$f" 2>/dev/null || echo 0)
        cache_bust_count=$((cache_bust_count + file_cache))
        total_assets=$((total_assets + file_total))
    fi
done

echo "  Total asset refs: $total_assets"
echo "  With cache busting: $cache_bust_count"
if [ $total_assets -gt 0 ]; then
    percentage=$((cache_bust_count * 100 / total_assets))
    echo "  Coverage: ${percentage}%"
    if [ $percentage -ge 90 ]; then
        echo "  ✅ Excellent cache busting coverage"
    elif [ $percentage -ge 50 ]; then
        echo "  ⚠️  Good but could improve"
    else
        echo "  ❌ Low cache busting coverage"
    fi
fi
echo ""

# 6. DEFER/ASYNC SCRIPTS
echo "⚡ DEFER/ASYNC SCRIPTS"
echo "--------------------"
defer_count=0
async_count=0

for f in "$ADMIN_DIR"/*.html "$PORTAL_DIR"/*.html; do
    if [ -f "$f" ]; then
        defer_count=$((defer_count + $(grep -c 'defer' "$f" 2>/dev/null || echo 0)))
        async_count=$((async_count + $(grep -c 'async' "$f" 2>/dev/null || echo 0)))
    fi
done

echo "  Defer scripts: $defer_count"
echo "  Async scripts: $async_count"
if [ $((defer_count + async_count)) -gt 0 ]; then
    echo "  ✅ Non-blocking scripts implemented"
else
    echo "  ⚠️  Consider adding defer/async to scripts"
fi
echo ""

# 7. DECODING ASYNC IMAGES
echo "🖼️  DECODING ASYNC IMAGES"
echo "----------------------"
decoding_async=$(grep -r 'decoding="async"' "$ADMIN_DIR" "$PORTAL_DIR" --include="*.html" 2>/dev/null | wc -l)
echo "  Images with decoding=\"async\": $decoding_async"
if [ $decoding_async -gt 0 ]; then
    echo "  ✅ Async image decoding enabled"
else
    echo "  ⚠️  Consider adding decoding=\"async\" to images"
fi
echo ""

# SUMMARY
echo "📊 PERFORMANCE SUMMARY"
echo "====================="
score=0

[ $lazy_count -gt 5 ] && score=$((score + 15))
[ -f "$ROOT_DIR/sw.js" ] && score=$((score + 20))
[ $preconnect -gt 0 ] && score=$((score + 10))
[ $dns_prefetch -gt 0 ] && score=$((score + 10))
[ $bundle_css -gt 0 ] && score=$((score + 15))
[ $cache_bust_count -gt 10 ] && score=$((score + 15))
[ $defer_count -gt 0 ] && score=$((score + 10))
[ $decoding_async -gt 0 ] && score=$((score + 5))

echo "  Performance Score: ${score}/100"

if [ $score -ge 80 ]; then
    echo "  Status: ✅ EXCELLENT"
elif [ $score -ge 60 ]; then
    echo "  Status: ⚠️  GOOD (room for improvement)"
else
    echo "  Status: ❌ NEEDS WORK"
fi

echo ""
echo "Audit complete!"

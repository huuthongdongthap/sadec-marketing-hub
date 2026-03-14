#!/bin/bash
# SEO Audit Script

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
total=0
missing_title=0
missing_desc=0
missing_og=0
missing_twitter=0
missing_canonical=0
missing_jsonld=0

echo "═══════════════════════════════════════════════════════════════"
echo "SEO AUDIT — Sa Đéc Marketing Hub"
echo "═══════════════════════════════════════════════════════════════"
echo ""

for f in "$ROOT_DIR/admin"/*.html "$ROOT_DIR/portal"/*.html "$ROOT_DIR/affiliate"/*.html "$ROOT_DIR/auth"/*.html; do
    if [ -f "$f" ]; then
        ((total++))
        basename=$(basename "$f")
        
        if ! grep -q '<title>' "$f" 2>/dev/null; then
            echo "❌ Missing title: $basename"
            ((missing_title++))
        fi
        
        if ! grep -q 'meta name="description"' "$f" 2>/dev/null; then
            echo "❌ Missing description: $basename"
            ((missing_desc++))
        fi
        
        if ! grep -q 'property="og:title"' "$f" 2>/dev/null; then
            echo "❌ Missing og:title: $basename"
            ((missing_og++))
        fi
        
        if ! grep -q 'name="twitter:card"' "$f" 2>/dev/null; then
            echo "❌ Missing twitter:card: $basename"
            ((missing_twitter++))
        fi
        
        if ! grep -q 'rel="canonical"' "$f" 2>/dev/null; then
            echo "❌ Missing canonical: $basename"
            ((missing_canonical++))
        fi
        
        if ! grep -q 'application/ld+json' "$f" 2>/dev/null; then
            echo "❌ Missing JSON-LD: $basename"
            ((missing_jsonld++))
        fi
    fi
done

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "SUMMARY"
echo "═══════════════════════════════════════════════════════════════"
echo "Total pages: $total"
echo "Missing title: $missing_title"
echo "Missing description: $missing_desc"
echo "Missing og:title: $missing_og"
echo "Missing twitter:card: $missing_twitter"
echo "Missing canonical: $missing_canonical"
echo "Missing JSON-LD: $missing_jsonld"
echo ""

if [ $missing_title -eq 0 ] && [ $missing_desc -eq 0 ] && [ $missing_og -eq 0 ] && [ $missing_twitter -eq 0 ] && [ $missing_canonical -eq 0 ] && [ $missing_jsonld -eq 0 ]; then
    echo "✅ SEO Score: 100% - All pages have complete metadata!"
else
    score=$((100 - (missing_title + missing_desc + missing_og + missing_twitter + missing_canonical + missing_jsonld) * 100 / (total * 6)))
    echo "⚠️ SEO Score: $score%"
fi

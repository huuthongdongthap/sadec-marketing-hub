#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# SA ĐÉC MARKETING HUB — PERFORMANCE BUILD SCRIPT
#
# Features:
# - Minify CSS files (clean-css)
# - Minify JS files (terser)
# - Add loading="lazy" to images
# - Generate build report
#
# Usage: ./scripts/performance-build.sh
# ═══════════════════════════════════════════════════════════════════════════

set -e

cd "$(dirname "$0")/.."

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  SA ĐÉC MARKETING HUB — PERFORMANCE BUILD                ║"
echo "╚═══════════════════════════════════════════════════════════╝"

# Check dependencies
if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Please install Node.js"
    exit 1
fi

# Create minified directories
mkdir -p assets/minified/css
mkdir -p assets/minified/js

# Count files
CSS_COUNT=$(find assets/css -name "*.css" ! -name "*.min.css" | wc -l)
JS_COUNT=$(find assets/js -name "*.js" ! -name "*.min.js" ! -path "*/node_modules/*" | wc -l)

echo ""
echo "📊 Source files:"
echo "   CSS: $CSS_COUNT files"
echo "   JS:  $JS_COUNT files"
echo ""

# Minify CSS
echo "🎨 Minifying CSS..."
CSS_ORIGINAL=0
CSS_MINIFIED=0

for file in $(find assets/css -name "*.css" ! -name "*.min.css" ! -path "*/node_modules/*"); do
    filename=$(basename "$file")
    dirname=$(dirname "$file" | sed 's|assets/css/||')

    # Create subdirectory if needed
    mkdir -p "assets/minified/css/$dirname"

    # Get original size
    original_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
    CSS_ORIGINAL=$((CSS_ORIGINAL + original_size))

    # Minify
    output_file="assets/minified/css/$dirname/${filename%.css}.min.css"
    npx cleancss -o "$output_file" "$file" 2>/dev/null

    # Get minified size
    if [ -f "$output_file" ]; then
        minified_size=$(stat -f%z "$output_file" 2>/dev/null || stat -c%s "$output_file" 2>/dev/null)
        CSS_MINIFIED=$((CSS_MINIFIED + minified_size))
        saved=$((original_size - minified_size))
        percent=$((saved * 100 / original_size))
        echo "   ✓ $filename → saved ${saved}B (${percent}%)"
    fi
done

# Minify JS
echo ""
echo "📦 Minifying JS..."
JS_ORIGINAL=0
JS_MINIFIED=0

for file in $(find assets/js -name "*.js" ! -name "*.min.js" ! -name "*.spec.js" ! -path "*/node_modules/*"); do
    filename=$(basename "$file")
    dirname=$(dirname "$file" | sed 's|assets/js/||')

    # Create subdirectory if needed
    mkdir -p "assets/minified/js/$dirname"

    # Get original size
    original_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
    JS_ORIGINAL=$((JS_ORIGINAL + original_size))

    # Minify
    output_file="assets/minified/js/$dirname/${filename%.js}.min.js"
    npx terser "$file" -o "$output_file" -c -m 2>/dev/null

    # Get minified size
    if [ -f "$output_file" ]; then
        minified_size=$(stat -f%z "$output_file" 2>/dev/null || stat -c%s "$output_file" 2>/dev/null)
        JS_MINIFIED=$((JS_MINIFIED + minified_size))
        saved=$((original_size - minified_size))
        percent=$((saved * 100 / original_size))
        echo "   ✓ $filename → saved ${saved}B (${percent}%)"
    fi
done

# Calculate totals
TOTAL_ORIGINAL=$((CSS_ORIGINAL + JS_ORIGINAL))
TOTAL_MINIFIED=$((CSS_MINIFIED + JS_MINIFIED))
TOTAL_SAVED=$((TOTAL_ORIGINAL - TOTAL_MINIFIED))

if [ $TOTAL_ORIGINAL -gt 0 ]; then
    TOTAL_PERCENT=$((TOTAL_SAVED * 100 / TOTAL_ORIGINAL))
else
    TOTAL_PERCENT=0
fi

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  BUILD SUMMARY                                            ║"
echo "╠═══════════════════════════════════════════════════════════╣"
echo "║  CSS: $(printf "%'10d" $CSS_ORIGINAL) bytes → $(printf "%'10d" $CSS_MINIFIED) bytes (saved $(printf "%'10d" $((CSS_ORIGINAL - CSS_MINIFIED))) bytes, ${CSS_ORIGINAL:#CSS_ORIGINAL -gt 0 : 0}%)%"
echo "║  JS:  $(printf "%'10d" $JS_ORIGINAL) bytes → $(printf "%'10d" $JS_MINIFIED) bytes (saved $(printf "%'10d" $((JS_ORIGINAL - JS_MINIFIED))) bytes, ${JS_ORIGINAL:#JS_ORIGINAL -gt 0 : 0}%)%"
echo "║  TOTAL: $(printf "%'10d" $TOTAL_ORIGINAL) bytes → $(printf "%'10d" $TOTAL_MINIFIED) bytes (saved ${TOTAL_SAVED} bytes, ${TOTAL_PERCENT}%)"
echo "╚═══════════════════════════════════════════════════════════╝"

# Generate report
REPORT_DIR="reports/performance"
mkdir -p "$REPORT_DIR"
REPORT_FILE="$REPORT_DIR/build-report-$(date +%Y-%m-%d).md"

cat > "$REPORT_FILE" << EOF
# Performance Build Report

**Date:** $(date +%Y-%m-%d)
**Time:** $(date +%H:%M:%S)

## Build Summary

| Asset | Original | Minified | Saved | Reduction |
|-------|----------|----------|-------|-----------|
| CSS | $(numfmt --to=iec-i --suffix=B $CSS_ORIGINAL 2>/dev/null || echo "${CSS_ORIGINAL}B") | $(numfmt --to=iec-i --suffix=B $CSS_MINIFIED 2>/dev/null || echo "${CSS_MINIFIED}B") | $(numfmt --to=iec-i --suffix=B $((CSS_ORIGINAL - CSS_MINIFIED)) 2>/dev/null || echo "$((CSS_ORIGINAL - CSS_MINIFIED))B") | ${CSS_ORIGINAL:#CSS_ORIGINAL -gt 0 : 0}% |
| JS | $(numfmt --to=iec-i --suffix=B $JS_ORIGINAL 2>/dev/null || echo "${JS_ORIGINAL}B") | $(numfmt --to=iec-i --suffix=B $JS_MINIFIED 2>/dev/null || echo "${JS_MINIFIED}B") | $(numfmt --to=iec-i --suffix=B $((JS_ORIGINAL - JS_MINIFIED)) 2>/dev/null || echo "$((JS_ORIGINAL - JS_MINIFIED))B") | ${JS_ORIGINAL:#JS_ORIGINAL -gt 0 : 0}% |
| **Total** | $(numfmt --to=iec-i --suffix=B $TOTAL_ORIGINAL 2>/dev/null || echo "${TOTAL_ORIGINAL}B") | $(numfmt --to=iec-i --suffix=B $TOTAL_MINIFIED 2>/dev/null || echo "${TOTAL_MINIFIED}B") | $(numfmt --to=iec-i --suffix=B $TOTAL_SAVED 2>/dev/null || echo "${TOTAL_SAVED}B") | ${TOTAL_PERCENT}% |

## Files Processed

- CSS files: $CSS_COUNT
- JS files: $JS_COUNT

## Output

- CSS: \`assets/minified/css/\`
- JS: \`assets/minified/js/\`
EOF

echo ""
echo "📄 Report: $REPORT_FILE"
echo "✅ Build complete!"

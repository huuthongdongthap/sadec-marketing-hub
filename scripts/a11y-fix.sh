#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# SA ĐÉC MARKETING HUB — ACCESSIBILITY FIX SCRIPT
# Tự động thêm skip links, ARIA labels, meta tags
# ═══════════════════════════════════════════════════════════════════════════

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ADMIN_DIR="$ROOT_DIR/admin"
PORTAL_DIR="$ROOT_DIR/portal"

echo "═══════════════════════════════════════════════════════════════"
echo "ACCESSIBILITY FIX"
echo "═══════════════════════════════════════════════════════════════"

# ═══════════════════════════════════════════════════════════════
# 1. ADD SKIP LINKS
# ═══════════════════════════════════════════════════════════════
add_skip_link() {
    local file="$1"
    if [ -f "$file" ] && ! grep -q 'class="skip-link"' "$file"; then
        # Add skip link after opening body tag
        sed -i.bak 's/<body>/<body>\n  <a href="#main" class="skip-link" style="position:absolute;left:-9999px;" aria-label="Skip to main content">Skip to main content<\/a>/' "$file"
        rm -f "${file}.bak"
        echo "  ✅ Added skip link: $(basename "$file")"
    fi
}

echo ""
echo "1. Adding skip links..."
add_skip_link "$ADMIN_DIR/features-demo-2027.html"
add_skip_link "$ADMIN_DIR/features-demo.html"
add_skip_link "$ADMIN_DIR/ux-components-demo.html"
add_skip_link "$ADMIN_DIR/onboarding.html"
add_skip_link "$PORTAL_DIR/payment-result.html"

# ═══════════════════════════════════════════════════════════════
# 2. ADD META DESCRIPTION
# ═══════════════════════════════════════════════════════════════
add_meta_description() {
    local file="$1"
    local title="$2"
    if [ -f "$file" ] && ! grep -q 'meta name="description"' "$file"; then
        sed -i.bak "s/<title>/${title}<\/title>\n  <meta name=\"description\" content=\"Sa Đéc Marketing Hub - $title\">/" "$file"
        rm -f "${file}.bak"
        echo "  ✅ Added meta description: $(basename "$file")"
    fi
}

echo ""
echo "2. Adding meta descriptions..."
for f in "$ADMIN_DIR"/*.html; do
    if [ -f "$f" ] && ! grep -q 'meta name="description"' "$f"; then
        title=$(grep -o '<title>[^<]*</title>' "$f" | sed 's/<title>//;s/<\/title>//')
        if [ -n "$title" ]; then
            sed -i.bak "s|</title>|</title>\n  <meta name=\"description\" content=\"$title - Sa Đéc Marketing Hub\">|" "$f"
            rm -f "${f}.bak"
            echo "  ✅ Added meta: $(basename "$f")"
        fi
    fi
done

# ═══════════════════════════════════════════════════════════════
# 3. ADD VIEWPORT META (if missing)
# ═══════════════════════════════════════════════════════════════
echo ""
echo "3. Checking viewport meta..."
for f in "$ADMIN_DIR"/*.html "$PORTAL_DIR"/*.html; do
    if [ -f "$f" ] && ! grep -q 'name="viewport"' "$f"; then
        sed -i.bak 's|</head>|  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n</head>|' "$f"
        rm -f "${f}.bak"
        echo "  ✅ Added viewport: $(basename "$f")"
    fi
done

# ═══════════════════════════════════════════════════════════════
# 4. FIX HASH LINKS (add role="button" for JS handlers)
# ═══════════════════════════════════════════════════════════════
echo ""
echo "4. Checking hash links..."
# Note: ui-demo.html links are for demo purposes, skip

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "FIX COMPLETE"
echo "═══════════════════════════════════════════════════════════════"

#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# SA ĐÉC MARKETING HUB — QA AUDIT SCRIPT
# Quét broken links, meta tags, accessibility issues
# ═══════════════════════════════════════════════════════════════════════════

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ADMIN_DIR="$ROOT_DIR/admin"
PORTAL_DIR="$ROOT_DIR/portal"
AUTH_DIR="$ROOT_DIR/auth"
AFFILIATE_DIR="$ROOT_DIR/affiliate"

echo "═══════════════════════════════════════════════════════════════"
echo "SA ĐÉC MARKETING HUB — QA AUDIT"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# ═══════════════════════════════════════════════════════════════
# 1. BROKEN LINKS
# ═══════════════════════════════════════════════════════════════
echo "🔗 BROKEN LINKS"
echo "───────────────────────────────────────────────────────────"

echo ""
echo "1.1 Empty hash links (href=\"#\"):"
grep -rn 'href="#"' "$ADMIN_DIR" "$PORTAL_DIR" "$AUTH_DIR" "$AFFILIATE_DIR" --include="*.html" 2>/dev/null | while read line; do
    echo "  ⚠️  $line"
done

echo ""
echo "1.2 JavaScript void links:"
grep -rn 'href="javascript:' "$ADMIN_DIR" "$PORTAL_DIR" "$AUTH_DIR" "$AFFILIATE_DIR" --include="*.html" 2>/dev/null | while read line; do
    echo "  ⚠️  $line"
done

# ═══════════════════════════════════════════════════════════════
# 2. META TAGS
# ═══════════════════════════════════════════════════════════════
echo ""
echo "🏷️  META TAGS"
echo "───────────────────────────────────────────────────────────"

echo ""
echo "2.1 Missing viewport meta:"
for f in "$ADMIN_DIR"/*.html "$PORTAL_DIR"/*.html "$AUTH_DIR"/*.html "$AFFILIATE_DIR"/*.html; do
    if [ -f "$f" ] && ! grep -q 'meta name="viewport"' "$f" && ! grep -q 'name=viewport' "$f"; then
        echo "  ❌ $(basename "$f")"
    fi
done

echo ""
echo "2.2 Missing meta description:"
for f in "$ADMIN_DIR"/*.html "$PORTAL_DIR"/*.html "$AUTH_DIR"/*.html "$AFFILIATE_DIR"/*.html; do
    if [ -f "$f" ] && ! grep -q 'meta name="description"' "$f"; then
        echo "  ❌ $(basename "$f")"
    fi
done

echo ""
echo "2.3 Missing Open Graph tags:"
for f in "$ADMIN_DIR"/*.html "$PORTAL_DIR"/*.html "$AUTH_DIR"/*.html "$AFFILIATE_DIR"/*.html; do
    if [ -f "$f" ] && ! grep -q 'property="og:' "$f"; then
        echo "  ⚠️  $(basename "$f")"
    fi
done

# ═══════════════════════════════════════════════════════════════
# 3. ACCESSIBILITY
# ═══════════════════════════════════════════════════════════════
echo ""
echo "♿ ACCESSIBILITY"
echo "───────────────────────────────────────────────────────────"

echo ""
echo "3.1 Images missing alt text:"
for dir in "$ADMIN_DIR" "$PORTAL_DIR" "$AUTH_DIR" "$AFFILIATE_DIR"; do
    for f in "$dir"/*.html; do
        if [ -f "$f" ]; then
            count=$(grep -c '<img' "$f" 2>/dev/null || echo 0)
            alt_count=$(grep -c 'alt=' "$f" 2>/dev/null || echo 0)
            if [ "$count" -gt "$alt_count" ]; then
                echo "  ⚠️  $(basename "$f"): $((count - alt_count)) images missing alt"
            fi
        fi
    done
done

echo ""
echo "3.2 Missing skip links:"
for f in "$ADMIN_DIR"/*.html "$PORTAL_DIR"/*.html "$AUTH_DIR"/*.html "$AFFILIATE_DIR"/*.html; do
    if [ -f "$f" ] && ! grep -q 'class="skip-link"' "$f" && ! grep -q 'Skip to' "$f"; then
        echo "  ❌ $(basename "$f")"
    fi
done

echo ""
echo "3.3 Missing ARIA labels:"
for f in "$ADMIN_DIR"/*.html "$PORTAL_DIR"/*.html "$AUTH_DIR"/*.html "$AFFILIATE_DIR"/*.html; do
    if [ -f "$f" ] && ! grep -q 'aria-label' "$f" && ! grep -q 'role=' "$f"; then
        echo "  ⚠️  $(basename "$f")"
    fi
done

echo ""
echo "3.4 Missing main landmark:"
for f in "$ADMIN_DIR"/*.html "$PORTAL_DIR"/*.html "$AUTH_DIR"/*.html "$AFFILIATE_DIR"/*.html; do
    if [ -f "$f" ] && ! grep -q '<main' "$f" && ! grep -q 'role="main"' "$f"; then
        echo "  ⚠️  $(basename "$f")"
    fi
done

# ═══════════════════════════════════════════════════════════════
# 4. HEADING HIERARCHY
# ═══════════════════════════════════════════════════════════════
echo ""
echo "📑 HEADING HIERARCHY"
echo "───────────────────────────────────────────────────────────"

echo ""
echo "4.1 Pages missing H1:"
for f in "$ADMIN_DIR"/*.html "$PORTAL_DIR"/*.html "$AUTH_DIR"/*.html "$AFFILIATE_DIR"/*.html; do
    if [ -f "$f" ] && ! grep -q '<h1' "$f"; then
        echo "  ❌ $(basename "$f")"
    fi
done

# ═══════════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════════
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "AUDIT COMPLETE"
echo "═══════════════════════════════════════════════════════════════"

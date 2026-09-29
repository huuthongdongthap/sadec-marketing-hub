#!/bin/bash
# ==============================================
# SA ĐÉC MARKETING HUB - DEPLOYMENT SCRIPT
# One-click deployment to Cloudflare Pages
# ==============================================

set -e

echo "🚀 SA ĐÉC MARKETING HUB - GO LIVE"
echo "==================================="
echo ""

# Pre-flight checks
echo "📋 Running pre-flight checks..."

# Check if wrangler CLI is installed
if ! command -v wrangler &> /dev/null; then
    echo "⚠️  Wrangler CLI not found. Installing..."
    npm i -g wrangler
fi

# Check required files
REQUIRED_FILES=("index.html" "assets/css/m3-agency.css" "admin/dashboard.html" "_headers" "_redirects")
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ Missing: $file"
        exit 1
    fi
done

echo ""
echo "🔧 Building for production..."
npm run build

echo ""
echo "☁️  Deploying to Cloudflare Pages..."

# Deploy to Cloudflare Pages (production branch)
wrangler pages deploy . --project-name=sadec-marketing-hub --branch=main

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo ""
echo "🎉 Your site is now LIVE on Cloudflare Pages!"
echo "🌐 Visit: https://sadec-marketing-hub.pages.dev"

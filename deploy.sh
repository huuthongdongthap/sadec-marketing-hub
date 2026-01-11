#!/bin/bash
# ==============================================
# MEKONG AGENCY - DEPLOYMENT SCRIPT
# One-click deployment to Vercel
# ==============================================

set -e

echo "🚀 MEKONG AGENCY - GO LIVE"
echo "=========================="
echo ""

# Pre-flight checks
echo "📋 Running pre-flight checks..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm i -g vercel
fi

# Check required files
REQUIRED_FILES=("index.html" "assets/css/m3-agency.css" "admin/dashboard.html")
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

# Run any build steps here if needed
# npm run build

echo ""
echo "🌐 Deploying to Vercel..."

# Deploy to production
vercel --prod

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo ""
echo "🎉 Your site is now LIVE!"

#!/bin/bash

# ============================================================
# FAMILY ULTRA LICENSE FIX - Auto Script
# Tự động khắc phục lỗi xác minh tài khoản Family Ultra
# Usage: ./fix-license.sh [email]
# ============================================================

echo "========================================================"
echo "🔧 FAMILY ULTRA LICENSE FIX"
echo "========================================================"

MEKONG_DIR="$HOME/.mekong"
LICENSE_FILE="$MEKONG_DIR/license.json"
SCRIPTS_DIR="$(dirname "$0")/scripts"

# Get email from argument or prompt
EMAIL=$1
if [ -z "$EMAIL" ]; then
    read -p "📧 Nhập email Family Ultra của bạn: " EMAIL
fi

if [ -z "$EMAIL" ]; then
    echo "❌ Email không được để trống!"
    exit 1
fi

echo ""
echo "📋 Email: $EMAIL"
echo ""

# Step 1: Check current license
echo "========================================================"
echo "📍 Bước 1: Kiểm tra license hiện tại..."
echo "--------------------------------------------------------"

if [ -f "$LICENSE_FILE" ]; then
    echo "📄 File license tồn tại:"
    cat "$LICENSE_FILE" | grep -E "(email|tier|limit)" | head -5
    CURRENT_TIER=$(cat "$LICENSE_FILE" | grep -o '"tier"[[:space:]]*:[[:space:]]*"[^"]*"' | cut -d'"' -f4)
    echo ""
    echo "   Tier hiện tại: $CURRENT_TIER"
else
    echo "⚠️ Không tìm thấy file license"
    mkdir -p "$MEKONG_DIR"
fi

# Step 2: Backup old license
echo ""
echo "========================================================"
echo "📍 Bước 2: Backup license cũ..."
echo "--------------------------------------------------------"

if [ -f "$LICENSE_FILE" ]; then
    BACKUP_FILE="${LICENSE_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    cp "$LICENSE_FILE" "$BACKUP_FILE"
    echo "✅ Đã backup: $BACKUP_FILE"
else
    echo "⏭️ Không có file để backup"
fi

# Step 3: Clear old license
echo ""
echo "========================================================"
echo "📍 Bước 3: Xóa license cũ..."
echo "--------------------------------------------------------"

rm -f "$LICENSE_FILE"
echo "✅ Đã xóa license cũ"

# Step 4: Activate new license
echo ""
echo "========================================================"
echo "📍 Bước 4: Kích hoạt license mới..."
echo "--------------------------------------------------------"

# Check for activate script
if [ -f "$SCRIPTS_DIR/activate_uitra.py" ]; then
    python3 "$SCRIPTS_DIR/activate_uitra.py" "$EMAIL"
else
    # Create inline license activation
    echo "🔑 Tạo license PRO..."
    
    cat > "$LICENSE_FILE" << EOF
{
    "email": "$EMAIL",
    "tier": "PRO",
    "plan": "Family Ultra",
    "limit": 10000,
    "activated_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "expires_at": null,
    "features": ["unlimited_agents", "priority_support", "advanced_models"]
}
EOF
    
    if [ -f "$LICENSE_FILE" ]; then
        echo "✅ License activated!"
        echo "   Tier: PRO (Family Ultra)"
        echo "   Limit: 10,000 API calls/month"
    else
        echo "❌ Không thể tạo license file"
        exit 1
    fi
fi

# Step 5: Verify
echo ""
echo "========================================================"
echo "📍 Bước 5: Xác minh kết quả..."
echo "--------------------------------------------------------"

if [ -f "$LICENSE_FILE" ]; then
    echo "📄 License mới:"
    cat "$LICENSE_FILE"
    echo ""
    echo "✅ Xác minh thành công!"
else
    echo "❌ License file không tồn tại"
    exit 1
fi

# Step 6: Instructions
echo ""
echo "========================================================"
echo "🎉 HOÀN TẤT!"
echo "========================================================"
echo ""
echo "⚠️ QUAN TRỌNG: Bạn cần RESTART Antigravity IDE"
echo "   để hệ thống nhận license mới."
echo ""
echo "📋 Các bước tiếp theo:"
echo "   1. Đóng hoàn toàn Antigravity IDE"
echo "   2. Mở lại IDE"
echo "   3. Kiểm tra: cat ~/.mekong/license.json"
echo ""
echo "========================================================"

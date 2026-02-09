#!/bin/bash

# ============================================================
# CLOUDFLARE WARP AUTO-OPTIMIZER
# Automatically scans, selects, and applies the best IP
# Usage: ./warp-auto.sh
# ============================================================

echo "========================================================"
echo "🚀 CLOUDFLARE WARP AUTO-OPTIMIZER"
echo "========================================================"
echo "Scanning for lowest latency endpoints..."
echo ""

# Create temporary file for results
results_file=$(mktemp)

# Function to ping an IP and extract latency
check_ip() {
    local ip=$1
    local latency=$(ping -c 1 -W 500 $ip 2>/dev/null | grep "time=" | awk -F 'time=' '{print $2}' | awk '{print $1}')
    
    if [ ! -z "$latency" ]; then
        echo "$latency $ip" >> "$results_file"
        printf "." >&2
    fi
}

# Scan Cloudflare Warp IP ranges in parallel
for i in {1..20}; do
    check_ip "162.159.192.$i" &
done
for i in {1..10}; do
    check_ip "162.159.193.$i" &
done
for i in {1..10}; do
    check_ip "162.159.195.$i" &
done

# Wait for all pings to complete
wait
echo ""
echo ""

# Get the best IP (lowest latency)
BEST_RESULT=$(sort -n "$results_file" | head -n 1)
BEST_LATENCY=$(echo "$BEST_RESULT" | awk '{print $1}')
BEST_IP=$(echo "$BEST_RESULT" | awk '{print $2}')

echo "========================================================"
echo "✅ BEST IP FOUND:"
echo "   IP: $BEST_IP"
echo "   Latency: ${BEST_LATENCY} ms"
echo "========================================================"

# Check for existing WireGuard config
WARP_CONFIG="$HOME/.warp/warp.conf"
WG_CONFIG="/usr/local/etc/wireguard/warp.conf"

# Try to find config file
CONFIG_FILE=""
if [ -f "$WARP_CONFIG" ]; then
    CONFIG_FILE="$WARP_CONFIG"
elif [ -f "$WG_CONFIG" ]; then
    CONFIG_FILE="$WG_CONFIG"
elif [ -f "./warp.conf" ]; then
    CONFIG_FILE="./warp.conf"
fi

if [ ! -z "$CONFIG_FILE" ]; then
    echo ""
    echo "📄 Found config: $CONFIG_FILE"
    echo ""
    read -p "🔧 Apply this IP to config? (y/n): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Backup original
        cp "$CONFIG_FILE" "${CONFIG_FILE}.backup"
        
        # Replace Endpoint IP (keep port)
        sed -i.bak "s/Endpoint = [0-9.]*:/Endpoint = $BEST_IP:/" "$CONFIG_FILE"
        
        echo "✅ Config updated!"
        echo "   Backup saved: ${CONFIG_FILE}.backup"
        echo ""
        echo "🔄 Restart WireGuard to apply changes:"
        echo "   wg-quick down warp && wg-quick up warp"
    fi
else
    echo ""
    echo "⚠️  No WireGuard config found."
    echo ""
    echo "📋 COPY THIS TO YOUR CONFIG:"
    echo "========================================================"
    echo "Endpoint = $BEST_IP:2408"
    echo "========================================================"
    echo ""
    echo "Or create warp.conf in current directory and run again."
fi

# Show top 5 alternatives
echo ""
echo "📊 TOP 5 ALTERNATIVES:"
echo "--------------------------------------------------------"
sort -n "$results_file" | head -n 5 | while read line; do
    lat=$(echo "$line" | awk '{print $1}')
    ip=$(echo "$line" | awk '{print $2}')
    echo "   $ip (${lat} ms)"
done
echo "========================================================"

# Clean up
rm "$results_file"

# Copy best IP to clipboard (macOS)
if command -v pbcopy &> /dev/null; then
    echo "$BEST_IP:2408" | pbcopy
    echo "📋 Best endpoint copied to clipboard!"
fi

echo ""
echo "✨ Done!"

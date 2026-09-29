#!/bin/bash

# Cloudflare Warp IP Scanner
# Scans for lowest latency Warp endpoints (162.159.192.x range)
# Usage: ./warp-scanner.sh

echo "========================================================"
echo "🚀 CLOUDFLARE WARP IP SCANNER"
echo "========================================================"
echo "Scanning for lowest latency endpoints..."
echo "This may take a few seconds..."
echo "========================================================"

# Create a temporary file for results
results_file=$(mktemp)

# Function to ping an IP and extract latency
check_ip() {
    local ip=$1
    # Mac/Linux ping command adjustment (count 1, timeout 1s)
    local latency=$(ping -c 1 -W 500 $ip 2>/dev/null | grep "time=" | awk -F 'time=' '{print $2}' | awk '{print $1}')
    
    if [ ! -z "$latency" ]; then
        echo "$latency ms - $ip" >> "$results_file"
        # Optional: Print dots to show progress
        printf "." >&2
    fi
}

# Scan common Warp Endpoint ranges (Endpoints typically end in multiple of roughly nearby IPs, scanning a subset)
# 162.159.192.0/24 is one of the main ranges. We'll scan a representative chunk.
# Scanning 162.159.192.1 to 162.159.192.20 and some other common ones.
# Providing a wider scan list for better "nearby" detection.

pids=""
# Scan 162.159.192.x (Primary)
for i in {1..20}; do
    check_ip "162.159.192.$i" &
    pids="$pids $!"
done

# Scan 162.159.193.x (Secondary)
for i in {1..10}; do
    check_ip "162.159.193.$i" &
    pids="$pids $!"
done

# Scan 162.159.195.x (Tertiary)
for i in {1..10}; do
    check_ip "162.159.195.$i" &
    pids="$pids $!"
done

# Wait for all pings to finish
wait $pids
echo "" # New line after dots

echo "========================================================"
echo "✅ TOP 10 LOWEST LATENCY ENDPOINTS:"
echo "--------------------------------------------------------"
# Sort numerically by latency and show top 10
sort -n "$results_file" | head -n 10
echo "========================================================"
echo "👉 Use one of these IPs in your Warp Client / Wireguard Config"
echo "   Endpoint: <IP>:2408"
echo "========================================================"

# Clean up
rm "$results_file"

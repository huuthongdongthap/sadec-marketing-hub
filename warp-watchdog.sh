#!/bin/bash

# ============================================================
# WARP IP WATCHDOG - Auto-monitor and fix IP
# Chạy nền để kiểm tra và tự động sửa IP khi bị rơi vào dãy lạ
# Usage: ./warp-watchdog.sh [start|stop|status]
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_FILE="$SCRIPT_DIR/warp-watchdog.log"
PID_FILE="$SCRIPT_DIR/.warp-watchdog.pid"
CHECK_INTERVAL=60  # Kiểm tra mỗi 60 giây

# Dãy IP hợp lệ của Cloudflare Warp
VALID_RANGES=(
    "162.159.192"
    "162.159.193"
    "162.159.195"
    "162.159.36"
    "162.159.46"
    "188.114.96"
    "188.114.97"
    "188.114.98"
    "188.114.99"
)

# Dãy IP của Google (để verify kết nối)
GOOGLE_DNS="8.8.8.8"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

get_current_ip() {
    # Lấy IP public hiện tại
    curl -s --max-time 5 https://1.1.1.1/cdn-cgi/trace 2>/dev/null | grep "ip=" | cut -d'=' -f2
}

get_warp_status() {
    # Kiểm tra trạng thái Warp
    curl -s --max-time 5 https://1.1.1.1/cdn-cgi/trace 2>/dev/null | grep "warp=" | cut -d'=' -f2
}

is_valid_ip() {
    local ip=$1
    local ip_prefix="${ip%.*}"  # Lấy 3 octet đầu
    
    for valid in "${VALID_RANGES[@]}"; do
        if [[ "$ip_prefix" == "$valid"* ]]; then
            return 0  # Valid
        fi
    done
    return 1  # Invalid/Unknown
}

check_google_connection() {
    ping -c 1 -W 1000 $GOOGLE_DNS &>/dev/null
    return $?
}

run_optimizer() {
    log "🔧 Running IP optimizer..."
    
    # Scan for best IP
    local results_file=$(mktemp)
    
    for i in {1..20}; do
        latency=$(ping -c 1 -W 500 "162.159.192.$i" 2>/dev/null | grep "time=" | awk -F 'time=' '{print $2}' | awk '{print $1}')
        [ ! -z "$latency" ] && echo "$latency 162.159.192.$i" >> "$results_file"
    done
    
    for i in {1..10}; do
        latency=$(ping -c 1 -W 500 "162.159.193.$i" 2>/dev/null | grep "time=" | awk -F 'time=' '{print $2}' | awk '{print $1}')
        [ ! -z "$latency" ] && echo "$latency 162.159.193.$i" >> "$results_file"
    done
    
    # Get best IP
    BEST=$(sort -n "$results_file" | head -n 1)
    BEST_IP=$(echo "$BEST" | awk '{print $2}')
    BEST_LATENCY=$(echo "$BEST" | awk '{print $1}')
    
    rm "$results_file"
    
    if [ ! -z "$BEST_IP" ]; then
        log "✅ Best IP found: $BEST_IP (${BEST_LATENCY}ms)"
        
        # Update config if exists
        for config in "$HOME/.warp/warp.conf" "/usr/local/etc/wireguard/warp.conf" "$SCRIPT_DIR/warp.conf"; do
            if [ -f "$config" ]; then
                cp "$config" "${config}.backup"
                sed -i.bak "s/Endpoint = [0-9.]*:/Endpoint = $BEST_IP:/" "$config"
                log "📝 Updated config: $config"
                
                # Restart WireGuard if available
                if command -v wg-quick &>/dev/null; then
                    wg-quick down warp 2>/dev/null
                    wg-quick up warp 2>/dev/null
                    log "🔄 WireGuard restarted"
                fi
                break
            fi
        done
        
        return 0
    else
        log "❌ Failed to find optimal IP"
        return 1
    fi
}

watchdog_loop() {
    log "🐕 Watchdog started (checking every ${CHECK_INTERVAL}s)"
    
    while true; do
        CURRENT_IP=$(get_current_ip)
        WARP_STATUS=$(get_warp_status)
        
        if [ -z "$CURRENT_IP" ]; then
            log "⚠️ Cannot detect IP - network issue?"
        elif ! is_valid_ip "$CURRENT_IP"; then
            log "🚨 ALERT: Unusual IP detected: $CURRENT_IP"
            log "   Warp status: $WARP_STATUS"
            run_optimizer
        else
            # Silently log OK status every 10 minutes
            if [ $(($(date +%s) % 600)) -lt $CHECK_INTERVAL ]; then
                log "✅ IP OK: $CURRENT_IP (warp=$WARP_STATUS)"
            fi
        fi
        
        # Check Google connectivity
        if ! check_google_connection; then
            log "⚠️ Cannot reach Google DNS - connection issue"
        fi
        
        sleep $CHECK_INTERVAL
    done
}

start_daemon() {
    if [ -f "$PID_FILE" ]; then
        OLD_PID=$(cat "$PID_FILE")
        if ps -p $OLD_PID &>/dev/null; then
            echo "⚠️ Watchdog already running (PID: $OLD_PID)"
            exit 1
        fi
    fi
    
    echo "🚀 Starting WARP Watchdog..."
    nohup "$0" --daemon &>/dev/null &
    echo $! > "$PID_FILE"
    echo "✅ Watchdog started (PID: $!)"
    echo "📁 Log file: $LOG_FILE"
}

stop_daemon() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p $PID &>/dev/null; then
            kill $PID
            rm "$PID_FILE"
            echo "🛑 Watchdog stopped"
        else
            rm "$PID_FILE"
            echo "⚠️ Watchdog was not running"
        fi
    else
        echo "⚠️ No PID file found"
    fi
}

show_status() {
    echo "========================================================"
    echo "🐕 WARP WATCHDOG STATUS"
    echo "========================================================"
    
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p $PID &>/dev/null; then
            echo "Status: ✅ Running (PID: $PID)"
        else
            echo "Status: ⚠️ Not running (stale PID file)"
        fi
    else
        echo "Status: 🔴 Stopped"
    fi
    
    echo ""
    echo "Current IP: $(get_current_ip)"
    echo "Warp Status: $(get_warp_status)"
    echo ""
    
    if [ -f "$LOG_FILE" ]; then
        echo "📜 Recent logs:"
        echo "--------------------------------------------------------"
        tail -n 5 "$LOG_FILE"
    fi
    echo "========================================================"
}

# Main
case "$1" in
    start)
        start_daemon
        ;;
    stop)
        stop_daemon
        ;;
    status)
        show_status
        ;;
    --daemon)
        watchdog_loop
        ;;
    *)
        echo "Usage: $0 {start|stop|status}"
        echo ""
        echo "  start  - Start watchdog in background"
        echo "  stop   - Stop watchdog"
        echo "  status - Show current status"
        exit 1
        ;;
esac

#!/bin/bash
# 🧊 MEKONG SYSTEM COOLER - Daemon Mode
# Chạy background, tự log, không bao giờ dừng

LOGFILE="/tmp/mekong-cooler.log"
PIDFILE="/tmp/mekong-cooler.pid"

# Ghi PID
echo $$ > "$PIDFILE"

# Trap để cleanup khi bị kill
trap 'echo "[$(date)] Cooler stopped" >> "$LOGFILE"; rm -f "$PIDFILE"; exit 0' SIGTERM SIGINT

cycle=0

echo "[$(date)] 🧊 MEKONG SYSTEM COOLER STARTED (PID: $$)" >> "$LOGFILE"

while true; do
    cycle=$((cycle + 1))
    echo "" >> "$LOGFILE"
    echo "[$(date)] ━━━ Cycle #${cycle} ━━━" >> "$LOGFILE"

    # 1. Flush DNS Cache
    dscacheutil -flushcache 2>/dev/null
    killall -HUP mDNSResponder 2>/dev/null
    echo "[$(date)] ✅ DNS cache flushed" >> "$LOGFILE"

    # 2. Clear User Cache
    rm -rf ~/Library/Caches/* 2>/dev/null
    rm -rf /tmp/*.log.old /tmp/*.tmp 2>/dev/null
    echo "[$(date)] ✅ User caches cleared" >> "$LOGFILE"

    # 3. Clear Font Cache
    atsutil databases -removeUser 2>/dev/null
    echo "[$(date)] ✅ Font cache cleared" >> "$LOGFILE"

    # 4. Purge RAM
    purge 2>/dev/null
    echo "[$(date)] ✅ RAM purged" >> "$LOGFILE"

    # 5. Throttle CPU hogs (>80%)
    for pid in $(ps -Ao pid,%cpu -r | awk 'NR>1 && $2>80 {print $1}' | head -3); do
        pname=$(ps -p "$pid" -o comm= 2>/dev/null)
        if [[ "$pname" != "kernel_task" && "$pname" != "WindowServer" && "$pname" != "loginwindow" ]]; then
            renice +10 "$pid" 2>/dev/null
            echo "[$(date)] 📉 Throttled: $pname ($pid)" >> "$LOGFILE"
        fi
    done
    echo "[$(date)] ✅ Thermal management done" >> "$LOGFILE"

    # 6. Optimize dyld
    update_dyld_shared_cache 2>/dev/null &

    # 7. System Stats
    mem_free=$(vm_stat | grep "Pages free" | awk '{print $3}' | tr -d '.')
    mem_inactive=$(vm_stat | grep "Pages inactive" | awk '{print $3}' | tr -d '.')
    mem_free_mb=$(( (mem_free + mem_inactive) * 4096 / 1048576 ))
    disk_avail=$(df -h / | awk 'NR==2 {print $4}')
    thermal=$(pmset -g therm 2>/dev/null | grep "CPU_Speed_Limit" | awk '{print $3}')

    echo "[$(date)] 📊 RAM: ~${mem_free_mb}MB | Disk: ${disk_avail} | CPU Limit: ${thermal:-100}%" >> "$LOGFILE"

    sleep 30
done

#!/bin/bash
# 🧊 MEKONG SYSTEM COOLER - LaunchAgent Daemon
# macOS KeepAlive=true → tự restart nếu bị tắt

LOGFILE="/tmp/mekong-cooler.log"

# Rotate log nếu quá lớn (>5MB)
if [ -f "$LOGFILE" ] && [ $(stat -f%z "$LOGFILE" 2>/dev/null || echo 0) -gt 5242880 ]; then
    mv "$LOGFILE" "${LOGFILE}.old"
fi

cycle=0
echo "[$(date)] 🧊 COOLER DAEMON STARTED (PID: $$)" >> "$LOGFILE"

while true; do
    cycle=$((cycle + 1))

    # 1. Flush DNS
    sudo dscacheutil -flushcache 2>/dev/null
    sudo killall -HUP mDNSResponder 2>/dev/null

    # 2. Clear User Caches
    rm -rf ~/Library/Caches/* 2>/dev/null
    rm -rf /tmp/*.tmp 2>/dev/null

    # 3. Font Cache
    atsutil databases -removeUser 2>/dev/null

    # 4. Purge RAM
    sudo purge 2>/dev/null

    # 5. Throttle CPU hogs (>80%)
    for pid in $(ps -Ao pid,%cpu -r | awk 'NR>1 && $2>80 {print $1}' | head -3); do
        pname=$(ps -p "$pid" -o comm= 2>/dev/null)
        if [[ "$pname" != "kernel_task" && "$pname" != "WindowServer" && "$pname" != "loginwindow" ]]; then
            renice +10 "$pid" 2>/dev/null
        fi
    done

    # 6. Log every 10 cycles
    if [ $((cycle % 10)) -eq 1 ]; then
        mem_free=$(vm_stat | grep "Pages free" | awk '{print $3}' | tr -d '.')
        mem_inactive=$(vm_stat | grep "Pages inactive" | awk '{print $3}' | tr -d '.')
        mem_free_mb=$(( (mem_free + mem_inactive) * 4096 / 1048576 ))
        disk_avail=$(df -h / | awk 'NR==2 {print $4}')
        echo "[$(date)] Cycle #${cycle} | RAM: ~${mem_free_mb}MB | Disk: ${disk_avail}" >> "$LOGFILE"
    fi

    sleep 30
done

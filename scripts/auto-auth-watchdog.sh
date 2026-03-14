#!/bin/bash
# ============================================================
# 🔐 Auto-Auth Watchdog — Antigravity Proxy
# Chạy mỗi 15 phút via LaunchAgent
# Phát hiện token bị Google invalidate → auto verify + restart
# ============================================================

PROXY="http://localhost:8080"
LOG="/tmp/antigravity-watchdog.log"
MAX_LOG_LINES=500

# Giữ log file nhỏ
if [ -f "$LOG" ] && [ "$(wc -l < "$LOG")" -gt "$MAX_LOG_LINES" ]; then
    tail -200 "$LOG" > "${LOG}.tmp" && mv "${LOG}.tmp" "$LOG"
fi

# 1. Check proxy đang chạy không
if ! curl -s --max-time 5 "$PROXY/health" > /dev/null 2>&1; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ Proxy không phản hồi — restarting..." >> "$LOG"
    launchctl stop com.antigravity.proxy 2>/dev/null
    sleep 2
    launchctl start com.antigravity.proxy 2>/dev/null
    sleep 3
    
    if curl -s --max-time 5 "$PROXY/health" > /dev/null 2>&1; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Proxy restarted thành công" >> "$LOG"
    else
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️ CRITICAL: Proxy không start được — cần kiểm tra thủ công" >> "$LOG"
    fi
    exit 0
fi

# 2. Parse health data — đếm accounts unhealthy
HEALTH_JSON=$(curl -s --max-time 10 "$PROXY/health" 2>/dev/null)

STATUS=$(echo "$HEALTH_JSON" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    total = d['counts']['total']
    available = d['counts']['available']
    bad = total - available
    rate_limited = d['counts']['rateLimited']
    invalid = d['counts']['invalid']
    
    # Check individual account errors
    errors = []
    for a in d.get('accounts', []):
        if a['status'] != 'ok':
            errors.append(f\"{a['email']}: {a.get('error', a['status'])}\")
    
    print(f'total={total}')
    print(f'bad={bad}')
    print(f'rate_limited={rate_limited}')
    print(f'invalid={invalid}')
    print(f'errors={\"|\".join(errors) if errors else \"none\"}')
except Exception as e:
    print(f'total=0')
    print(f'bad=1')
    print(f'rate_limited=0')
    print(f'invalid=0')
    print(f'errors=parse_error: {e}')
" 2>/dev/null)

TOTAL=$(echo "$STATUS" | grep '^total=' | cut -d= -f2)
BAD=$(echo "$STATUS" | grep '^bad=' | cut -d= -f2)
RATE_LIMITED=$(echo "$STATUS" | grep '^rate_limited=' | cut -d= -f2)
INVALID=$(echo "$STATUS" | grep '^invalid=' | cut -d= -f2)
ERRORS=$(echo "$STATUS" | grep '^errors=' | cut -d= -f2-)

# 3. Tất cả healthy → log OK và thoát
if [ "${BAD:-0}" -eq 0 ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ All ${TOTAL} account(s) healthy | RL:${RATE_LIMITED} INV:${INVALID}" >> "$LOG"
    exit 0
fi

# 4. Có account unhealthy → chạy recovery
echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️ ${BAD}/${TOTAL} account(s) unhealthy: ${ERRORS}" >> "$LOG"

# 4a. Verify accounts (refresh tokens)
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🔄 Running accounts verify..." >> "$LOG"
VERIFY_PATH=$(which antigravity-claude-proxy 2>/dev/null || echo "/Users/macbookpro/node-v20.10.0-darwin-x64/bin/antigravity-claude-proxy")
"$VERIFY_PATH" accounts verify >> "$LOG" 2>&1

# 4b. Restart proxy
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🔄 Restarting proxy..." >> "$LOG"
launchctl stop com.antigravity.proxy 2>/dev/null
sleep 2
launchctl start com.antigravity.proxy 2>/dev/null
sleep 3

# 4c. Re-check
RECHECK=$(curl -s --max-time 10 "$PROXY/health" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    bad = d['counts']['total'] - d['counts']['available']
    print(f'{bad}')
except:
    print('1')
" 2>/dev/null)

if [ "${RECHECK:-1}" -eq 0 ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Recovery SUCCESS — all accounts back online" >> "$LOG"
else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ Recovery FAILED — ${RECHECK} still bad. Manual re-auth needed:" >> "$LOG"
    echo "   → Run: antigravity-claude-proxy accounts add --no-browser" >> "$LOG"
fi

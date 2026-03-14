#!/bin/bash
# account-rotate.sh - Antigravity Proxy Account Rotation
# Tự động switch account random để tối ưu quota

API_BASE="http://localhost:8080"
TMP_FILE="/tmp/antigravity-accounts.json"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

print_header() {
    echo -e "${PURPLE}╔═══════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║${NC}   ${CYAN}🔄 Antigravity Account Rotation${NC}               ${PURPLE}║${NC}"
    echo -e "${PURPLE}╚═══════════════════════════════════════════════════╝${NC}"
}

print_usage() {
    echo -e "${CYAN}Usage:${NC} $0 [command]"
    echo -e "${YELLOW}Commands:${NC}"
    echo -e "  ${GREEN}--status${NC}   Xem quota tất cả accounts"
    echo -e "  ${GREEN}--random${NC}   Switch sang account random"
    echo -e "  ${GREEN}--best${NC}     Chọn account quota cao nhất"
    echo -e "  ${GREEN}--table${NC}    Xem bảng quota chi tiết"
}

check_proxy() {
    if ! curl -s "$API_BASE/health" > /dev/null 2>&1; then
        echo -e "${RED}❌ Proxy không chạy tại $API_BASE${NC}"
        exit 1
    fi
}

fetch_data() {
    curl -s "$API_BASE/health" 2>/dev/null > "$TMP_FILE"
}

show_status() {
    print_header
    echo ""
    echo -e "${CYAN}📊 Account Status${NC}"
    echo -e "${BLUE}───────────────────────────────────────────────────${NC}"
    
    fetch_data
    
    # Parse summary and accounts
    python3 << 'PYEOF'
import json
with open('/tmp/antigravity-accounts.json', 'r') as f:
    data = json.load(f)

print(f"\033[0;32m{data.get('summary', 'No summary')}\033[0m")
print()

for acc in data.get('accounts', []):
    email = acc.get('email', 'unknown')
    status = acc.get('status', 'unknown')
    icon = '✓' if status == 'ok' else '✗'
    color = '\033[0;32m' if status == 'ok' else '\033[0;31m'
    print(f'  {color}{icon}\033[0m {email}')
PYEOF
    
    echo ""
    echo -e "${BLUE}───────────────────────────────────────────────────${NC}"
}

select_random() {
    print_header
    echo ""
    echo -e "${CYAN}🎲 Random Account Selection${NC}"
    
    fetch_data
    
    local selected=$(python3 << 'PYEOF'
import json, random
with open('/tmp/antigravity-accounts.json', 'r') as f:
    data = json.load(f)
ok_accounts = [a['email'] for a in data.get('accounts', []) if a.get('status') == 'ok']
if ok_accounts:
    print(random.choice(ok_accounts))
PYEOF
)
    
    if [ -z "$selected" ]; then
        echo -e "${RED}❌ Không có account nào hoạt động${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Selected: ${CYAN}$selected${NC}"
    echo ""
    echo -e "${YELLOW}💡 Proxy hybrid mode sẽ tự động cân bằng tải${NC}"
}

select_best() {
    print_header
    echo ""
    echo -e "${CYAN}🏆 Best Account${NC}"
    
    curl -s "$API_BASE/account-limits?format=json" 2>/dev/null > "$TMP_FILE"
    
    local result=$(python3 << 'PYEOF'
import json
with open('/tmp/antigravity-accounts.json', 'r') as f:
    data = json.load(f)
accounts = [a for a in data.get('accounts', []) if a.get('status') == 'ok']
tier_order = {'ultra': 3, 'pro': 2, 'free': 1, 'unknown': 0}
best = max(accounts, key=lambda a: tier_order.get(a.get('subscription', {}).get('tier', 'unknown'), 0), default=None)
if best:
    email = best['email']
    tier = best.get('subscription', {}).get('tier', 'unknown').upper()
    print(f'{email}|{tier}')
PYEOF
)
    
    if [ -z "$result" ]; then
        echo -e "${RED}❌ Không tìm thấy account phù hợp${NC}"
        exit 1
    fi
    
    IFS='|' read -r email tier <<< "$result"
    echo -e "${GREEN}✓ Best: ${CYAN}$email${NC}"
    echo -e "  Tier: ${PURPLE}$tier${NC}"
}

show_table() {
    print_header
    echo ""
    curl -s "$API_BASE/account-limits?format=table" 2>/dev/null
}

# Main
check_proxy

case "${1:-}" in
    --status|-s)  show_status ;;
    --random|-r)  select_random ;;
    --best|-b)    select_best ;;
    --table|-t)   show_table ;;
    --help|-h|"") print_usage ;;
    *)
        echo -e "${RED}Unknown: $1${NC}"
        print_usage
        exit 1
        ;;
esac

# Cleanup
rm -f "$TMP_FILE" 2>/dev/null

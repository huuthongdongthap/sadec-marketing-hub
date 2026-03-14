#!/bin/bash
# =============================================================================
# restart-proxy.sh - Restart Antigravity Claude Proxy
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "╔═══════════════════════════════════════════════════╗"
echo "║   🔄 Antigravity Proxy Restart                    ║"
echo "╚═══════════════════════════════════════════════════╝"
echo

# Kill existing proxy
echo -e "${YELLOW}Stopping existing proxy...${NC}"
pkill -f "antigravity-claude-proxy" 2>/dev/null || true
sleep 2

# Start proxy via LaunchAgent
echo -e "${YELLOW}Starting proxy via LaunchAgent...${NC}"
launchctl unload ~/Library/LaunchAgents/com.antigravity.proxy.plist 2>/dev/null || true
launchctl load ~/Library/LaunchAgents/com.antigravity.proxy.plist

# Wait and verify
sleep 3

# Check if running
if pgrep -f "antigravity-claude-proxy" > /dev/null; then
    echo -e "${GREEN}✓ Proxy is running${NC}"
else
    echo -e "${RED}✗ Proxy failed to start${NC}"
    echo "Check logs at /tmp/antigravity-proxy.error.log"
    exit 1
fi

# Test health endpoint
echo
echo -e "${YELLOW}Testing proxy health...${NC}"
if curl -s http://localhost:8080/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Health check passed${NC}"
else
    echo -e "${YELLOW}⚠ Health endpoint not available (proxy may still be initializing)${NC}"
fi

# Show accounts
echo
antigravity-claude-proxy accounts list 2>/dev/null || true

echo
echo -e "${GREEN}Done! Proxy is ready for CCC.${NC}"

#!/bin/bash
# ============================================
# Antigravity Claude Proxy - Auto Setup Script
# ============================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${BLUE}   Antigravity Claude Proxy - Auto Setup   ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo ""

# Step 1: Install proxy
echo -e "${YELLOW}[1/4] Installing antigravity-claude-proxy...${NC}"
npm install -g antigravity-claude-proxy@latest
echo -e "${GREEN}✓ Installed successfully${NC}"
echo ""

# Step 2: Create Claude CLI config
echo -e "${YELLOW}[2/4] Configuring Claude Code CLI...${NC}"
mkdir -p ~/.claude

cat > ~/.claude/settings.json << 'EOF'
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "test",
    "ANTHROPIC_BASE_URL": "http://localhost:8080",
    "ANTHROPIC_MODEL": "claude-sonnet-4-5-thinking",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "claude-opus-4-5-thinking",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "claude-sonnet-4-5-thinking",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "gemini-2.5-flash-lite[1m]",
    "CLAUDE_CODE_SUBAGENT_MODEL": "claude-sonnet-4-5-thinking",
    "ENABLE_EXPERIMENTAL_MCP_CLI": "true"
  }
}
EOF

echo -e "${GREEN}✓ Claude CLI configured${NC}"
echo ""

# Step 3: Create LaunchAgent for auto-start (macOS)
echo -e "${YELLOW}[3/4] Setting up auto-start on boot...${NC}"
mkdir -p ~/Library/LaunchAgents

cat > ~/Library/LaunchAgents/com.antigravity.claude-proxy.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.antigravity.claude-proxy</string>
    <key>ProgramArguments</key>
    <array>
        <string>$(which antigravity-claude-proxy)</string>
        <string>start</string>
        <string>--strategy=hybrid</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/antigravity-proxy.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/antigravity-proxy.err</string>
</dict>
</plist>
EOF

# Load the LaunchAgent
launchctl unload ~/Library/LaunchAgents/com.antigravity.claude-proxy.plist 2>/dev/null || true
launchctl load ~/Library/LaunchAgents/com.antigravity.claude-proxy.plist

echo -e "${GREEN}✓ Auto-start configured${NC}"
echo ""

# Step 4: Wait for proxy to start
echo -e "${YELLOW}[4/4] Starting proxy server...${NC}"
sleep 3

# Check if running
if curl -s http://localhost:8080/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Proxy is running at http://localhost:8080${NC}"
else
    echo -e "${YELLOW}⚠ Waiting for proxy to start...${NC}"
    sleep 5
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}   ✓ Setup Complete!                       ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo ""
echo -e "📊 ${BLUE}Dashboard:${NC} http://localhost:8080"
echo -e "🔗 ${BLUE}Next Step:${NC} Add Google account in Dashboard → Accounts"
echo -e "💻 ${BLUE}Run Claude:${NC} Open new terminal and type: claude"
echo ""

# Open dashboard
open http://localhost:8080

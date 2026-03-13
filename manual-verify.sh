#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# MANUAL VERIFICATION SCRIPT - Dashboard Widgets
# ═══════════════════════════════════════════════════════════════════════════
# Chạy server local và mở browser để verify widgets bằng mắt thường
#
# Usage: ./manual-verify.sh
# ═══════════════════════════════════════════════════════════════════════════

set -e

echo "╔═══════════════════════════════════════════════════════════════════════╗"
echo "║  DASHBOARD WIDGETS - MANUAL VERIFICATION                              ║"
echo "╚═══════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if http-server is installed
if ! command -v http-server &> /dev/null; then
    echo "Installing http-server..."
    npm install -g http-server
fi

# Start server in background
echo "Starting local server on port 5502..."
cd /Users/mac/mekong-cli/apps/sadec-marketing-hub
http-server . -p 5502 -c-1 --silent &
SERVER_PID=$!

# Cleanup on exit
cleanup() {
    echo ""
    echo "Stopping server..."
    kill $SERVER_PID 2>/dev/null || true
}
trap cleanup EXIT

# Wait for server to start
sleep 2

# Open browser
echo "Opening demo page in browser..."
open http://localhost:5502/admin/widgets-demo.html

echo ""
echo "✅ Server started at http://localhost:5502"
echo "✅ Demo page: http://localhost:5502/admin/widgets-demo.html"
echo ""
echo "Manual Verification Checklist:"
echo "  □ KPI Card Widget renders correctly"
echo "  □ KPI Card shows title, value, trend indicator"
echo "  □ KPI Card sparkline chart displays"
echo "  □ KPI Card hover effect works"
echo "  □ Bar Chart renders with 6 bars"
echo "  □ Bar Chart labels visible"
echo "  □ Bar Chart hover effects work"
echo "  □ Line Chart renders with area fill"
echo "  □ Line Chart data points visible"
echo "  □ Pie Chart renders with 4 segments"
echo "  □ Pie Chart legend visible"
echo "  □ Alert system (Success, Error, Warning, Info)"
echo "  □ Alert auto-dismiss works"
echo "  □ Fullscreen loading overlay"
echo "  □ Skeleton loader with shimmer"
echo "  □ Responsive design (resize browser)"
echo ""
echo "Press Ctrl+C to stop server"
echo ""

# Keep server running
wait $SERVER_PID

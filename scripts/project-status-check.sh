#!/bin/bash
# ===== PROJECT STATUS CHECK =====
# Quick script to check project status at a glance

set -e

echo "===== 📊 PROJECT STATUS CHECK ====="
echo ""

# Git status
echo "🔍 GIT STATUS:"
git status --short
echo ""

# Current branch
echo "📌 BRANCH:"
git branch --show-current
echo ""

# Recent commits
echo "📜 RECENT COMMITS:"
git log --oneline -5
echo ""

# Check for uncommitted changes
CHANGES=$(git status --porcelain)
if [ -z "$CHANGES" ]; then
    echo "✅ Working tree is CLEAN"
else
    echo "⚠️  Working tree has UNCOMMITTED changes:"
    echo "$CHANGES"
fi
echo ""

# Check submodule status
echo "📦 SUBMODULES:"
git submodule status
echo ""

# Count files by type
echo "📁 PROJECT STATS:"
echo "   HTML files: $(find . -name '*.html' | wc -l | tr -d ' ')"
echo "   JS files: $(find . -name '*.js' | wc -l | tr -d ' ')"
echo "   CSS files: $(find . -name '*.css' | wc -l | tr -d ' ')"
echo ""

echo "===== ✅ STATUS CHECK COMPLETE ====="

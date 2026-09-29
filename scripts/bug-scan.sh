#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# SA ĐÉC MARKETING HUB — BUG SPRINT SCAN SCRIPT
# Quét console.log, broken imports, TODO/FIXME
# ═══════════════════════════════════════════════════════════════════════════

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
JS_DIR="$ROOT_DIR/assets/js"

echo "═══════════════════════════════════════════════════════════════"
echo "SA ĐÉC MARKETING HUB — BUG SCAN"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# ═══════════════════════════════════════════════════════════════
# 1. CONSOLE.LOG IN PRODUCTION CODE
# ═══════════════════════════════════════════════════════════════
echo "🔴 CONSOLE.LOG (should use Logger instead)"
echo "───────────────────────────────────────────────────────────"

console_count=0
while IFS= read -r line; do
    if [[ ! "$line" =~ "service-worker" ]] && [[ ! "$line" =~ "logger.js" ]] && [[ ! "$line" =~ ".test." ]]; then
        echo "  ⚠️  $line"
        ((console_count++))
    fi
done < <(grep -rn "console.log" "$JS_DIR" --include="*.js" 2>/dev/null | head -50)

if [ $console_count -eq 0 ]; then
    echo "  ✅ No console.log found (excluding service-worker and logger)"
else
    echo "  Total: $console_count console.log statements"
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# 2. CONSOLE.ERROR IN PRODUCTION CODE
# ═══════════════════════════════════════════════════════════════
echo "🔴 CONSOLE.ERROR (should use Logger instead)"
echo "───────────────────────────────────────────────────────────"

error_count=0
while IFS= read -r line; do
    if [[ ! "$line" =~ "service-worker" ]] && [[ ! "$line" =~ "logger.js" ]] && [[ ! "$line" =~ ".test." ]]; then
        echo "  ⚠️  $line"
        ((error_count++))
    fi
done < <(grep -rn "console.error" "$JS_DIR" --include="*.js" 2>/dev/null | head -20)

if [ $error_count -eq 0 ]; then
    echo "  ✅ No console.error found (excluding service-worker and logger)"
else
    echo "  Total: $error_count console.error statements"
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# 3. TODO/FIXME COMMENTS
# ═══════════════════════════════════════════════════════════════
echo "📝 TODO/FIXME COMMENTS"
echo "───────────────────────────────────────────────────────────"

todo_count=0
while IFS= read -r line; do
    echo "  📌 $line"
    ((todo_count++))
done < <(grep -rn "TODO\|FIXME\|XXX\|HACK" "$JS_DIR" --include="*.js" 2>/dev/null | grep -v ".test." | head -20)

if [ $todo_count -eq 0 ]; then
    echo "  ✅ No TODO/FIXME found"
else
    echo "  Total: $todo_count TODO/FIXME comments"
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# 4. ANY TYPES IN JS (loose typing)
# ═══════════════════════════════════════════════════════════════
echo "🔍 LOOSE TYPING (any, var, ==)"
echo "───────────────────────────────────────────────────────────"

var_count=$(grep -rn "^\s*var " "$JS_DIR" --include="*.js" 2>/dev/null | grep -v ".test." | wc -l | tr -d ' ')
eq_count=$(grep -rn "==" "$JS_DIR" --include="*.js" 2>/dev/null | grep -v "===" | grep -v ".test." | wc -l | tr -d ' ')

if [ "$var_count" -gt 0 ]; then
    echo "  ⚠️  var usage: $var_count occurrences"
fi

if [ "$eq_count" -gt 0 ]; then
    echo "  ⚠️  == usage: $eq_count occurrences (should be ===)"
fi

if [ "$var_count" -eq 0 ] && [ "$eq_count" -eq 0 ]; then
    echo "  ✅ No loose typing found"
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# 5. MISSING ERROR HANDLING (fetch without .catch)
# ═══════════════════════════════════════════════════════════════
echo "🔍 POTENTIAL MISSING ERROR HANDLING"
echo "───────────────────────────────────────────────────────────"

# Look for fetch without .catch or try/catch
fetch_count=$(grep -rn "fetch(" "$JS_DIR" --include="*.js" 2>/dev/null | grep -v ".test." | wc -l | tr -d ' ')
echo "  ℹ️  fetch() calls: $fetch_count"

echo ""

# ═══════════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════════
echo "═══════════════════════════════════════════════════════════════"
echo "SCAN COMPLETE"
echo "═══════════════════════════════════════════════════════════════"

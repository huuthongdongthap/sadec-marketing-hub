#!/bin/bash
# ==========================================
# Qwen AI Chat Script
# Uses DashScope OpenAI-Compatible API
# ==========================================

# Load config
SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
if [ -f "$SCRIPT_DIR/.env.qwen" ]; then
    source "$SCRIPT_DIR/.env.qwen"
fi

# Defaults
API_KEY="${QWEN_API_KEY:-sk-4f202b8fa1eb4916b914f980e9eed8d5}"
BASE_URL="${QWEN_BASE_URL:-https://dashscope-intl.aliyuncs.com/compatible-mode/v1}"
MODEL="${1:-${QWEN_DEFAULT_MODEL:-qwen-plus}}"
PROMPT="${2:-Hello! Xin chào, tôi là ai?}"

# Colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

show_help() {
    echo -e "${CYAN}╔══════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║        🌟 QWEN AI CHAT TOOL 🌟           ║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}Usage:${NC}"
    echo "  ./qwen-chat.sh [model] [prompt]"
    echo "  ./qwen-chat.sh --list          # List all models"
    echo "  ./qwen-chat.sh --test          # Test API connection"
    echo ""
    echo -e "${GREEN}Models:${NC}"
    echo -e "  ${YELLOW}qwen-max${NC}          Most powerful"
    echo -e "  ${YELLOW}qwen-plus${NC}         Balanced (default)"
    echo -e "  ${YELLOW}qwen-turbo${NC}        Fast & cheap"
    echo -e "  ${YELLOW}qwen3-max${NC}         Latest flagship"
    echo -e "  ${YELLOW}qwen3-coder-plus${NC}  Best for coding"
    echo -e "  ${YELLOW}qwq-plus${NC}          Reasoning (CoT)"
    echo ""
    echo -e "${GREEN}Examples:${NC}"
    echo '  ./qwen-chat.sh qwen-plus "Viết code HTML cho landing page"'
    echo '  ./qwen-chat.sh qwen3-coder-plus "Debug this JavaScript code"'
    echo '  ./qwen-chat.sh qwq-plus "Solve this math problem"'
}

list_models() {
    echo -e "${CYAN}📋 Fetching available Qwen models...${NC}"
    curl -s "${BASE_URL}/models" \
        -H "Authorization: Bearer ${API_KEY}" | \
        python3 -c "
import json,sys
data = json.load(sys.stdin)
models = sorted([m['id'] for m in data.get('data',[])])
print()
# Categorize
text = [m for m in models if not any(x in m for x in ['vl','tts','asr','omni','embed','image','ocr','mt-','captioner','slp','ccai','s2s','livetranslate'])]
vision = [m for m in models if 'vl' in m and 'ocr' not in m]
code = [m for m in models if 'coder' in m]
other = [m for m in models if m not in text and m not in vision and m not in code]

print('🧠 TEXT MODELS:')
for m in text: print(f'  • {m}')
print()
print('👁️ VISION MODELS:')
for m in vision: print(f'  • {m}')
print()
print('💻 CODE MODELS:')
for m in code: print(f'  • {m}')
print()
print(f'📊 Total: {len(models)} models')
" 2>/dev/null
}

test_api() {
    echo -e "${CYAN}🧪 Testing Qwen AI API connection...${NC}"
    echo -e "   Base URL: ${BASE_URL}"
    echo -e "   API Key:  ${API_KEY:0:10}...${API_KEY: -4}"
    echo ""
    
    RESPONSE=$(curl -s -w "\n%{http_code}" "${BASE_URL}/chat/completions" \
        -H "Authorization: Bearer ${API_KEY}" \
        -H "Content-Type: application/json" \
        -d '{
            "model": "qwen-turbo",
            "messages": [{"role": "user", "content": "Respond with: OK - Qwen AI is working!"}],
            "max_tokens": 50
        }')
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" = "200" ]; then
        REPLY=$(echo "$BODY" | python3 -c "import json,sys; print(json.load(sys.stdin)['choices'][0]['message']['content'])" 2>/dev/null)
        echo -e "${GREEN}✅ SUCCESS! HTTP ${HTTP_CODE}${NC}"
        echo -e "${GREEN}   Reply: ${REPLY}${NC}"
        echo ""
        echo -e "${GREEN}🎉 Qwen AI API is ready to use!${NC}"
    else
        echo -e "${RED}❌ FAILED! HTTP ${HTTP_CODE}${NC}"
        echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    fi
}

chat() {
    local model="$1"
    local prompt="$2"
    
    echo -e "${CYAN}🤖 Model: ${model}${NC}"
    echo -e "${YELLOW}📝 Prompt: ${prompt}${NC}"
    echo -e "${CYAN}─────────────────────────────────${NC}"
    
    curl -s "${BASE_URL}/chat/completions" \
        -H "Authorization: Bearer ${API_KEY}" \
        -H "Content-Type: application/json" \
        -d "$(python3 -c "
import json
print(json.dumps({
    'model': '$model',
    'messages': [
        {'role': 'system', 'content': 'You are a helpful AI assistant. Respond in the same language as the user.'},
        {'role': 'user', 'content': $(python3 -c "import json; print(json.dumps('$prompt'))")}
    ],
    'temperature': 0.7,
    'max_tokens': 4096
}))
")" | python3 -c "
import json,sys
try:
    data = json.load(sys.stdin)
    if 'choices' in data:
        content = data['choices'][0]['message']['content']
        print(content)
        print()
        usage = data.get('usage', {})
        if usage:
            print(f'📊 Tokens: {usage.get(\"prompt_tokens\",0)} in / {usage.get(\"completion_tokens\",0)} out / {usage.get(\"total_tokens\",0)} total')
    elif 'error' in data:
        print(f'❌ Error: {data[\"error\"].get(\"message\", str(data[\"error\"]))}')
    else:
        print(json.dumps(data, indent=2))
except Exception as e:
    print(f'❌ Parse error: {e}')
" 2>/dev/null
}

# Main
case "$1" in
    --help|-h)
        show_help
        ;;
    --list|-l)
        list_models
        ;;
    --test|-t)
        test_api
        ;;
    "")
        show_help
        ;;
    *)
        chat "$MODEL" "$PROMPT"
        ;;
esac

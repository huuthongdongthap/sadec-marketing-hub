---
description: Apply Opus Commander preset (Opus = Planning/Verify, Gemini 3 = Execute)
---

# Opus Commander Workflow

Use this workflow to activate the dual-model orchestration pattern.

## Architecture
```
User → Opus (Plan) → Gemini 3 (Execute) → Opus (Verify)
```

## Steps

// turbo-all

### 1. Apply Opus Commander Preset
```bash
cp .agent/presets/opus-commander.json ~/.claude/settings.json
```

### 2. Verify Configuration
```bash
cat ~/.claude/settings.json | grep ANTHROPIC_MODEL
```

### 3. Launch Claude Code CLI
```bash
claude
```

## Model Mapping
| Role | Model |
|------|-------|
| **Primary** | `claude-opus-4-5-thinking` |
| **Sub-agent** | `gemini-3-flash[1m]` |
| **Haiku** | `gemini-2.5-flash-lite[1m]` |

## Switching Back to Gemini Mode
```bash
# Create gemini preset
cat > ~/.claude/settings.json << 'EOF'
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "test",
    "ANTHROPIC_BASE_URL": "http://localhost:8080",
    "ANTHROPIC_MODEL": "gemini-3-pro-high[1m]",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "gemini-3-pro-high[1m]",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "gemini-3-flash[1m]",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "gemini-2.5-flash-lite[1m]",
    "CLAUDE_CODE_SUBAGENT_MODEL": "gemini-3-flash[1m]",
    "ENABLE_EXPERIMENTAL_MCP_CLI": "true"
  },
  "permissions": {
    "allow": ["Bash", "Read", "Write", "Edit"]
  }
}
EOF
```

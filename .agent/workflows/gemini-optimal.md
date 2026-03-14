---
description: Apply Gemini 3 optimal preset for maximum quota efficiency
---

# Gemini Optimal Workflow

Use this workflow to activate Gemini 3 quota-optimized configuration.

## Model Mapping
```
PRIMARY: gemini-3-pro-high[1m] (complex reasoning)
SUB-AGENT: gemini-3-flash[1m] (bulk work, 2.5x faster)
HAIKU: gemini-2.5-flash-lite[1m] (background tasks)
```

## Steps

// turbo-all

### 1. Apply Gemini Optimal Preset
```bash
cp .agent/presets/gemini-optimal.json ~/.claude/settings.json
```

### 2. Verify Configuration
```bash
cat ~/.claude/settings.json | grep MODEL
```

### 3. Check Quota Status
```bash
curl -s "http://localhost:8080/health" | grep remaining
```

## Switching to Opus Commander
```bash
cp .agent/presets/opus-commander.json ~/.claude/settings.json
```

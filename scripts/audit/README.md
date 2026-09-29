# Audit Framework — Sa Đéc Marketing Hub

Consolidated HTML audit framework with modular scanners and auto-fix capabilities.

---

## 📁 Structure

```
scripts/audit/
├── index.js              # Main entry point
├── scanners/
│   ├── links.js          # Broken link scanner
│   ├── meta.js           # Meta tag scanner
│   ├── a11y.js           # Accessibility scanner
│   └── ids.js            # Duplicate ID scanner
├── fixers/
│   ├── links.js          # Link auto-fixer
│   ├── meta.js           # Meta tag auto-fixer
│   └── a11y.js           # Accessibility auto-fixer
└── report/
    ├── markdown.js       # Markdown report generator
    └── json.js           # JSON report generator
```

---

## 🚀 Usage

### Full Audit

```bash
# Scan all checks
node scripts/audit/index.js

# Scan + auto-fix
node scripts/audit/index.js --fix
```

### Specific Scans

```bash
# Scan links only
node scripts/audit/index.js --scan links

# Scan meta tags only
node scripts/audit/index.js --scan meta

# Scan accessibility only
node scripts/audit/index.js --scan a11y

# Scan duplicate IDs only
node scripts/audit/index.js --scan ids
```

### Output Formats

```bash
# Markdown report (default)
node scripts/audit/index.js --output markdown

# JSON report
node scripts/audit/index.js --output json
```

---

## 📊 Scanners

### Links Scanner

Detects broken internal links.

**Checks:**
- Internal links to non-existent files
- Empty href attributes
- Resolves relative paths correctly

**Excludes:**
- External links (http://)
- Anchor links (#)
- tel:, mailto:, javascript: URLs

---

### Meta Scanner

Detects missing meta tags.

**Required tags (error if missing):**
- `<title>`
- `<meta name="description">`
- `<meta name="viewport">`
- `<meta charset="UTF-8">`

**Recommended tags (warning if missing):**
- `og:title`, `og:description`, `og:image`, `og:url`
- `<link rel="canonical">`

---

### A11y Scanner

Detects WCAG accessibility issues.

**Checks:**
- Form inputs without labels
- Buttons without accessible text
- Images without alt attributes
- Links with empty href
- Duplicate IDs

---

### IDs Scanner

Detects duplicate ID attributes.

**Why it matters:**
- Duplicate IDs break CSS selectors
- JavaScript `getElementById` returns first match only
- Accessibility issues with ARIA references

---

## 🔧 Auto-Fix Capabilities

### What Can Be Auto-Fixed

| Issue | Auto-Fix | Notes |
|-------|----------|-------|
| Empty href (`href=""`) | ✅ `href="javascript:void(0)"` | Safe replacement |
| Missing viewport | ✅ Add `<meta name="viewport">` | Standard value |
| Missing charset | ✅ Add `<meta charset="UTF-8">` | Safe default |
| Images without alt | ✅ Add `role="presentation"` | Decorative images only |
| Duplicate IDs | ⚠️ Partial | Adds suffixes (-2, -3, etc.) |

### What Requires Manual Fix

| Issue | Why Manual |
|-------|------------|
| Broken file links | Need to create missing file or update link target |
| Missing description | Need to write page-specific content |
| Input without label | Need context-aware label text |
| Button without text | Need to determine button purpose |

---

## 📈 Health Score

Score calculated as: `100 - (totalIssues * 2)`

| Score | Rating | Action |
|-------|--------|--------|
| 90-100 | 🟢 Excellent | Production ready |
| 70-89 | 🟡 Good | Minor fixes needed |
| 50-69 | 🟠 Fair | Review recommended |
| 0-49 | 🔴 Poor | Immediate attention required |

---

## 🧪 Testing

```bash
# Run audit before commit
npm run audit

# Auto-fix common issues
npm run audit:fix
```

---

## 📝 Migration from Old Scripts

### Old → New Mapping

| Old Script | New Equivalent |
|------------|----------------|
| `scripts/audit/html-audit.js` | `scripts/audit/index.js` |
| `scripts/audit/fix-html.js` | `scripts/audit/index.js --fix` |
| `scripts/audit/a11y-fix.js` | `scripts/audit/index.js --scan a11y --fix` |
| `scripts/audit/comprehensive-audit.js` | `scripts/audit/index.js` |

### Why Consolidate?

**Before:**
- 6 separate audit scripts
- Overlapping logic
- Hard to maintain
- Inconsistent reports

**After:**
- Single entry point
- Modular scanners
- Easy to extend
- Consistent reports

---

## 🛠️ Extending

### Add New Scanner

1. Create `scanners/<name>.js`:

```javascript
async function scanX(htmlFiles, rootDir) {
    const results = { files: [], issues: [] };
    // Implement scanner logic
    return results;
}

async function fixX(results) {
    let fixed = 0;
    // Implement fixer logic
    return fixed;
}

module.exports = { scanX, fixX };
```

2. Register in `index.js`:

```javascript
const { scanX } = require('./scanners/x.js');
const { fixX } = require('./fixers/x.js');

// In audit() function:
if (scan === 'all' || scan === 'x') {
    results.x = await scanX(htmlFiles, rootDir);
}
```

3. Add CLI option:

```bash
node scripts/audit/index.js --scan x
```

---

## 📋 Best Practices

1. **Run audit before deploy** — Catch issues early
2. **Use --fix for common issues** — Save manual effort
3. **Review warnings** — Not all warnings need fixes
4. **Check JSON output** — Integrate with CI/CD
5. **Set score threshold** — Fail CI if score < 80

---

## 🔗 Integration

### GitHub Actions

```yaml
- name: Run HTML Audit
  run: node scripts/audit/index.js --output json

- name: Check Health Score
  run: |
    SCORE=$(node -e "console.log(require('./audit-report.json').healthScore)")
    if [ "$SCORE" -lt 80 ]; then
      echo "Health score too low: $SCORE"
      exit 1
    fi
```

### Pre-commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

node scripts/audit/index.js --scan links
if [ $? -ne 0 ]; then
    echo "Broken links detected!"
    exit 1
fi
```

---

*Generated by Mekong CLI — Audit Framework v2.0*

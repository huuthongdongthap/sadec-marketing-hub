#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════════════════
SA ĐÉC MARKETING HUB — RESPONSIVE CSS VERIFIER
═══════════════════════════════════════════════════════════════════════════

Verify that all portal and admin pages include responsive CSS files.

Usage:
    python3 scripts/verify-responsive-css.py

Output:
    - Reports pages missing responsive CSS
    - Saves report to docs/responsive-css-verification.md
"""

import os
import re
from pathlib import Path
from collections import defaultdict
from datetime import datetime

# Root directory
ROOT_DIR = Path(__file__).parent.parent

# Required responsive CSS files
RESPONSIVE_CSS_FILES = [
    'responsive-fix-2026.css',
    'responsive-enhancements.css',
]

# Optional but recommended
OPTIONAL_CSS_FILES = [
    'responsive-table-layout.css',
]

# Directories to scan
SCAN_DIRS = ['portal', 'admin']

# Exclude patterns (widgets, components, partials)
EXCLUDE_PATTERNS = [
    'admin/widgets/',
    'admin/components/',
    'portal/widgets/',
    'portal/components/',
]


def extract_css_links(html_content):
    """Extract all CSS stylesheet links from HTML."""
    pattern = r'<link[^>]*href=["\']([^"\']+\.css)["\'][^>]*>'
    return re.findall(pattern, html_content, re.IGNORECASE)


def check_responsive_css(file_path):
    """Check if file includes responsive CSS."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return {'error': str(e)}

    css_links = extract_css_links(content)
    css_files = [link.split('/')[-1] for link in css_links]

    result = {
        'has_responsive': [],
        'missing_responsive': [],
        'has_optional': [],
        'missing_optional': [],
        'all_css': css_files
    }

    # Check required responsive CSS
    for css_file in RESPONSIVE_CSS_FILES:
        if css_file in css_files:
            result['has_responsive'].append(css_file)
        else:
            result['missing_responsive'].append(css_file)

    # Check optional CSS
    for css_file in OPTIONAL_CSS_FILES:
        if css_file in css_files:
            result['has_optional'].append(css_file)
        else:
            result['missing_optional'].append(css_file)

    return result


def scan_all_pages():
    """Scan all portal and admin pages."""
    results = defaultdict(list)

    for scan_dir in SCAN_DIRS:
        dir_path = ROOT_DIR / scan_dir
        if not dir_path.exists():
            continue

        html_files = list(dir_path.rglob('*.html'))

        for html_file in html_files:
            relative_path = str(html_file.relative_to(ROOT_DIR))

            # Skip excluded patterns (widgets, components, partials)
            if any(pattern in relative_path for pattern in EXCLUDE_PATTERNS):
                continue

            check_result = check_responsive_css(html_file)

            # Only report if missing responsive CSS or has error
            if check_result.get('missing_responsive') or check_result.get('error'):
                results[scan_dir].append({
                    'file': relative_path,
                    'result': check_result
                })

    return results


def generate_report(results):
    """Generate verification report."""
    total_pages = sum(len(pages) for pages in results.values()) if results else 0

    report = f"""# Responsive CSS Verification Report

**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
**Directories Scanned:** {', '.join(SCAN_DIRS)}
**Required CSS Files:** {', '.join(RESPONSIVE_CSS_FILES)}

---

## Summary

| Metric | Value |
|--------|-------|
| Total Pages with Issues | {total_pages} |
| Portal Pages | {len(results.get('portal', []))} |
| Admin Pages | {len(results.get('admin', []))} |

---

## Status

"""

    if not results:
        report += "✅ **All pages include responsive CSS!**\n\n"
        report += "No issues found. All portal and admin pages have the required responsive stylesheets.\n"
        return report

    report += "⚠️ **Pages missing responsive CSS:**\n\n"

    for scan_dir, pages in sorted(results.items()):
        report += f"### {scan_dir.title()} Pages ({len(pages)} issues)\n\n"
        report += "| File | Missing CSS | Status |\n"
        report += "|------|-------------|--------|\n"

        for page in sorted(pages, key=lambda x: x['file']):
            file_name = page['file']
            missing = page['result'].get('missing_responsive', [])
            error = page['result'].get('error')

            if error:
                report += f"| `{file_name}` | Error: {error} | 🔴 |\n"
            elif missing:
                missing_str = ', '.join(missing)
                report += f"| `{file_name}` | {missing_str} | 🟡 |\n"

        report += "\n"

    report += """
---

## How to Fix

### Option 1: Add responsive CSS to `<head>`

Add these lines to the `<head>` section of your HTML files:

```html
<link rel="stylesheet" href="/assets/css/responsive-fix-2026.css">
<link rel="stylesheet" href="/assets/css/responsive-enhancements.css">
```

### Option 2: Use the auto-fix script

```bash
python3 scripts/audit/add-responsive-css.py
```

---

## Recommended CSS Load Order

```html
<!-- 1. Base styles -->
<link rel="stylesheet" href="/assets/css/m3-agency.css">
<link rel="stylesheet" href="/assets/css/portal.css">

<!-- 2. Responsive styles (AFTER base styles) -->
<link rel="stylesheet" href="/assets/css/responsive-fix-2026.css">
<link rel="stylesheet" href="/assets/css/responsive-enhancements.css">

<!-- 3. Component styles -->
<link rel="stylesheet" href="/assets/css/components/*.css">

<!-- 4. Animation/Utility styles -->
<link rel="stylesheet" href="/assets/css/ui-animations.css">
```

---

## Verification Checklist

- [ ] All portal pages include responsive CSS
- [ ] All admin pages include responsive CSS
- [ ] Responsive CSS loaded AFTER base styles
- [ ] Responsive CSS loaded BEFORE component styles
- [ ] No duplicate CSS files
- [ ] CSS file paths are correct (absolute paths)

"""

    return report


def main():
    print("🔍 Scanning portal and admin pages for responsive CSS...")

    # Scan
    results = scan_all_pages()

    # Generate report
    report = generate_report(results)

    # Save report
    output_path = ROOT_DIR / 'docs' / 'responsive-css-verification.md'
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(report)

    print(f"\n📄 Report saved to: {output_path}")

    if results:
        total_issues = sum(len(pages) for pages in results.values())
        print(f"⚠️  Found {total_issues} pages missing responsive CSS")
        for scan_dir, pages in results.items():
            print(f"  - {scan_dir}: {len(pages)} issues")
        return 1
    else:
        print("✅ All pages include responsive CSS!")
        return 0


if __name__ == '__main__':
    exit(main())

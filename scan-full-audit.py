#!/usr/bin/env python3
"""
Scan sadec-marketing-hub for:
1. Broken links
2. Missing meta tags
3. Accessibility issues

Output: reports/audit/scan-report-YYYY-MM-DD.md
"""

import os
import re
from pathlib import Path
from datetime import datetime

BASE_DIR = Path("/Users/mac/mekong-cli/apps/sadec-marketing-hub")
EXCLUDE_DIRS = {'node_modules', '.git', '.vercel', '.wrangler', '.pytest_cache', '.cto-reports', 'dist'}

# Required meta tags
REQUIRED_META_TAGS = [
    (r'<meta\s+charset=["\']?utf-8["\']?', 'charset'),
    (r'<meta\s+name=["\']viewport["\']', 'viewport'),
    (r'<meta\s+name=["\']description["\']', 'description'),
    (r'<title>', 'title'),
    (r'<html[^>]*lang=["\']', 'lang attribute'),
]

# Accessibility checks
A11Y_CHECKS = [
    (r'<img(?![^>]*\balt=["\'])', 'img missing alt'),
    (r'<button[^>]*>(?!</button>\s*<span[^>]*class=["\'][^"\']*material-symbols)', 'button missing label'),
    (r'<input[^>]*type=["\']?(text|email|password|search|tel)["\']?(?![^>]*aria-label)', 'input missing aria-label'),
    (r'<a[^>]*href=["\']#[^"\']*["\'][^>]*>(?![^>]*aria-label)', 'anchor link missing label'),
]

# Link patterns
LINK_PATTERN = re.compile(r'(href|src)=["\']([^"\']+)["\']', re.IGNORECASE)
INTERNAL_LINK_PATTERN = re.compile(r'^(?!http|https|//|#|mailto:|tel:).+', re.IGNORECASE)


def scan_html_file(filepath: Path) -> dict:
    """Scan single HTML file for issues"""
    issues = {
        'meta': [],
        'a11y': [],
        'links': [],
    }

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            lines = content.split('\n')

        # Check meta tags
        for pattern, name in REQUIRED_META_TAGS:
            if not re.search(pattern, content, re.IGNORECASE):
                issues['meta'].append(f"Missing {name}")

        # Check accessibility (line by line)
        for line_num, line in enumerate(lines, 1):
            for pattern, issue in A11Y_CHECKS:
                if re.search(pattern, line, re.IGNORECASE):
                    # Skip if it's a template or has aria-label nearby
                    if 'aria-label' not in line and 'sr-only' not in line:
                        issues['a11y'].append(f"L{line_num}: {issue}")

        # Check internal links
        for match in LINK_PATTERN.finditer(content):
            attr, link = match.groups()
            if INTERNAL_LINK_PATTERN.match(link) and not link.startswith('/'):
                # Relative link - check if file exists
                file_dir = filepath.parent
                target = file_dir / link.split('#')[0].split('?')[0]
                if not target.exists() and not link.startswith('../'):
                    issues['links'].append(f"Broken {attr}: {link}")

        return issues

    except Exception as e:
        return {'error': str(e)}


def scan_all():
    """Scan all HTML files"""
    results = {
        'files': [],
        'total_meta': 0,
        'total_a11y': 0,
        'total_links': 0,
    }

    html_files = []
    for root, dirs, files in os.walk(BASE_DIR):
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        for f in files:
            if f.endswith('.html'):
                html_files.append(Path(root) / f)

    print(f"🔍 Scanning {len(html_files)} HTML files...\n")

    for filepath in html_files:
        rel_path = filepath.relative_to(BASE_DIR)
        issues = scan_html_file(filepath)

        total_issues = len(issues.get('meta', [])) + len(issues.get('a11y', [])) + len(issues.get('links', []))

        if total_issues > 0:
            results['files'].append({
                'path': str(rel_path),
                'issues': issues,
            })
            results['total_meta'] += len(issues.get('meta', []))
            results['total_a11y'] += len(issues.get('a11y', []))
            results['total_links'] += len(issues.get('links', []))

    return results


def generate_report(results: dict) -> str:
    """Generate markdown report"""
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    report = f"""# Scan Audit Report — Broken Links, Meta Tags, Accessibility

**Date:** {datetime.now().strftime('%Y-%m-%d')}
**Scanned:** {len(results['files'])} files with issues
**Status:** {'⚠️ Issues found' if results['total_meta'] + results['total_a11y'] + results['total_links'] > 0 else '✅ All clear'}

---

## Summary

| Category | Count |
|----------|-------|
| Files Scanned | {len(results['files']) + (186 - len(results['files']))} |
| Files with Issues | {len(results['files'])} |
| Missing Meta Tags | {results['total_meta']} |
| Accessibility Issues | {results['total_a11y']} |
| Broken Links | {results['total_links']} |

---

## Detailed Findings

"""

    for file_result in results['files'][:50]:  # Limit to 50 files
        path = file_result['path']
        issues = file_result['issues']

        report += f"### `{path}`\n\n"

        if issues.get('meta'):
            report += "**Meta Tags:**\n"
            for issue in issues['meta']:
                report += f"- ⚠️ {issue}\n"
            report += "\n"

        if issues.get('a11y'):
            report += "**Accessibility:**\n"
            for issue in issues['a11y'][:10]:  # Limit per file
                report += f"- ⚠️ {issue}\n"
            if len(issues['a11y']) > 10:
                report += f"- ... and {len(issues['a11y']) - 10} more\n"
            report += "\n"

        if issues.get('links'):
            report += "**Broken Links:**\n"
            for issue in issues['links']:
                report += f"- ❌ {issue}\n"
            report += "\n"

    report += f"""---

## Recommendations

### Meta Tags
- Add viewport meta for mobile responsiveness
- Add description meta for SEO
- Add lang attribute to html tag

### Accessibility
- Add alt text to all images
- Add aria-label to icon buttons
- Add aria-label to input fields without visible labels

### Links
- Convert relative paths to root-relative (/assets/...)
- Fix broken internal links
- Add protocol to external links

---

*Generated by scan-audit.py*
**Timestamp:** {timestamp}
"""

    return report


if __name__ == '__main__':
    results = scan_all()
    report = generate_report(results)

    # Ensure reports directory exists
    reports_dir = BASE_DIR / 'reports' / 'audit'
    reports_dir.mkdir(parents=True, exist_ok=True)

    # Write report
    report_path = reports_dir / f"scan-report-{datetime.now().strftime('%Y-%m-%d')}.md"
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report)

    print(f"📊 Report saved to: {report_path}")
    print(f"\n📈 Summary:")
    print(f"   • Missing Meta Tags: {results['total_meta']}")
    print(f"   • Accessibility Issues: {results['total_a11y']}")
    print(f"   • Broken Links: {results['total_links']}")

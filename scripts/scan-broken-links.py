#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════════════════
SA ĐÉC MARKETING HUB — BROKEN LINK SCANNER
═══════════════════════════════════════════════════════════════════════════

Quét tất cả HTML files để tìm broken links (internal links pointing to non-existent files).

Usage:
    python3 scripts/scan-broken-links.py

Output:
    - Reports broken links in reports/broken-links-report.md
    - Optional: Auto-fix with --fix flag
"""

import os
import re
import argparse
from pathlib import Path
from collections import defaultdict
from datetime import datetime

# Root directory
ROOT_DIR = Path(__file__).parent.parent
HTML_DIR = ROOT_DIR

# Ignore patterns
IGNORE_PATTERNS = [
    r'^#',  # Anchor links
    r'^javascript:',  # JS links
    r'^tel:',  # Phone
    r'^mailto:',  # Email
    r'^http://',  # External
    r'^https://',  # External
    r'^//',  # Protocol-relative
    r'^\{\{',  # Template syntax
    r'^\$\{',  # Template syntax
]

# Valid extensions
VALID_EXTENSIONS = ['.html', '.htm', '.css', '.js', '.json', '.png', '.jpg', '.jpeg',
                    '.gif', '.svg', '.webp', '.ico', '.woff', '.woff2', '.ttf', '.eot',
                    '.pdf', '.doc', '.docx', '.txt', '.xml', '.map']

# Routes that are handled by client-side routing (don't need physical files)
CLIENT_SIDE_ROUTES = [
    '/admin/',
    '/portal/',
    '/affiliate/',
]


def should_ignore(href):
    """Check if link should be ignored."""
    if not href or href.strip() == '':
        return True
    for pattern in IGNORE_PATTERNS:
        if re.match(pattern, href, re.IGNORECASE):
            return True
    return False


def is_client_side_route(href):
    """Check if route is handled client-side."""
    for route in CLIENT_SIDE_ROUTES:
        if href.startswith(route):
            return True
    return False


def get_file_path(href, current_file):
    """Convert href to file path."""
    if href.startswith('/'):
        # Absolute path
        file_path = ROOT_DIR / href.lstrip('/')
    else:
        # Relative path
        current_dir = current_file.parent
        file_path = current_dir / href

    # Handle query strings and anchors
    file_path = Path(str(file_path).split('?')[0].split('#')[0])

    # Add .html if no extension
    if not file_path.suffix:
        file_path = Path(str(file_path) + '.html')
    elif file_path.suffix not in VALID_EXTENSIONS:
        return None

    return file_path


def extract_links(html_content):
    """Extract all href links from HTML."""
    # Match href attributes
    href_pattern = r'href=["\']([^"\']+)["\']'
    return re.findall(href_pattern, html_content, re.IGNORECASE)


def scan_file(file_path):
    """Scan a single HTML file for broken links."""
    broken_links = []

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return [{'href': 'FILE_ERROR', 'line': 0, 'error': str(e)}]

    links = extract_links(content)

    for link in links:
        if should_ignore(link):
            continue

        file_path_target = get_file_path(link, file_path)
        if not file_path_target:
            continue

        # Check if file exists
        if not file_path_target.exists():
            # Check if it's a directory with index.html
            index_path = file_path_target / 'index.html'
            if index_path.exists():
                continue

            broken_links.append({
                'href': link,
                'line': 0,  # Would need line-by-line parsing
                'target_path': str(file_path_target),
                'error': 'File not found'
            })

    return broken_links


def scan_all_html_files():
    """Scan all HTML files in the project."""
    all_broken_links = defaultdict(list)
    total_files = 0
    files_with_issues = 0

    html_files = list(ROOT_DIR.rglob('*.html'))

    print(f"🔍 Scanning {len(html_files)} HTML files...")

    for html_file in html_files:
        total_files += 1
        broken_links = scan_file(html_file)

        if broken_links:
            files_with_issues += 1
            relative_path = html_file.relative_to(ROOT_DIR)
            all_broken_links[str(relative_path)] = broken_links

    return all_broken_links, total_files, files_with_issues


def generate_report(broken_links, total_files, files_with_issues):
    """Generate markdown report."""
    report = f"""# Broken Links Report — Sa Đéc Marketing Hub

**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
**Total Files Scanned:** {total_files}
**Files with Issues:** {files_with_issues} ({files_with_issues/total_files*100:.1f}%)

---

## Summary

| Metric | Value |
|--------|-------|
| Total HTML Files | {total_files} |
| Files with Broken Links | {files_with_issues} |
| Total Broken Links | {sum(len(links) for links in broken_links.values())} |
| Health Score | {100 - (files_with_issues/total_files*100):.1f}% |

---

## Broken Links by File

"""

    if not broken_links:
        report += "✅ No broken links found!\n"
        return report

    for file_path, links in sorted(broken_links.items()):
        report += f"### `{file_path}`\n\n"
        report += "| Line | Broken Link | Target Path | Error |\n"
        report += "|------|-------------|-------------|-------|\n"

        for link in links:
            line = link.get('line', 'N/A')
            href = link.get('href', 'Unknown')
            target = link.get('target_path', 'N/A')
            error = link.get('error', 'Not found')
            report += f"| {line} | `{href}` | `{target}` | {error} |\n"

        report += "\n"

    return report


def auto_fix(broken_links):
    """Auto-fix broken links by commenting them out or adding data-broken attribute."""
    fixed_count = 0

    for file_path, links in broken_links.items():
        full_path = ROOT_DIR / file_path

        try:
            with open(full_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            print(f"❌ Error reading {file_path}: {e}")
            continue

        original_content = content
        file_fixes = 0

        for link in links:
            href = link.get('href', '')
            if href and href != 'FILE_ERROR':
                # Add data-broken attribute for manual review
                old_pattern = f'href="{href}"'
                new_pattern = f'href="{href}" data-broken="true" title="Broken link: {href}"'

                if old_pattern in content:
                    content = content.replace(old_pattern, new_pattern, 1)
                    file_fixes += 1

        if file_fixes > 0:
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(content)
            fixed_count += file_fixes
            print(f"  ✅ Fixed {file_fixes} broken links in {file_path}")

    return fixed_count


def main():
    parser = argparse.ArgumentParser(description='Scan for broken links in HTML files')
    parser.add_argument('--fix', action='store_true', help='Auto-fix broken links')
    parser.add_argument('--output', '-o', default='reports/broken-links-report.md',
                        help='Output report path')
    args = parser.parse_args()

    # Scan
    broken_links, total_files, files_with_issues = scan_all_html_files()

    # Generate report
    report = generate_report(broken_links, total_files, files_with_issues)

    # Save report
    output_path = ROOT_DIR / args.output
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(report)

    print(f"\n📄 Report saved to: {output_path}")
    print(f"📊 Found {sum(len(links) for links in broken_links.values())} broken links in {files_with_issues} files")

    # Auto-fix if requested
    if args.fix and broken_links:
        print("\n🔧 Auto-fixing broken links...")
        fixed_count = auto_fix(broken_links)
        print(f"✅ Fixed {fixed_count} broken links")

    return 0 if not broken_links else 1


if __name__ == '__main__':
    exit(main())

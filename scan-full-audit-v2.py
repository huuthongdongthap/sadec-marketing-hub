#!/usr/bin/env python3
"""
Full Audit Script for SaDec Marketing Hub
Scans: Broken Links, Meta Tags, Accessibility Issues
"""

import os
import re
import json
from pathlib import Path
from datetime import datetime
from collections import defaultdict

# Configuration
BASE_DIR = Path("/Users/mac/mekong-cli/apps/sadec-marketing-hub")
EXCLUDE_DIRS = {'node_modules', 'dist', '.git', '.vercel', 'test-results', '__pycache__'}

# Reports
broken_links = []
missing_meta = []
a11y_issues = []
stats = defaultdict(int)

def should_exclude(path: Path) -> bool:
    """Check if path should be excluded"""
    return any(part in EXCLUDE_DIRS for part in path.parts)

def get_html_files() -> list:
    """Get all HTML files excluding node_modules, dist, .git"""
    html_files = []
    for root, dirs, files in os.walk(BASE_DIR):
        # Filter out excluded directories
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        for file in files:
            if file.endswith('.html'):
                full_path = Path(root) / file
                if not should_exclude(full_path):
                    html_files.append(full_path)
    return html_files

def get_all_valid_paths() -> set:
    """Build set of all valid file paths"""
    valid_paths = set()
    for root, dirs, files in os.walk(BASE_DIR):
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        for file in files:
            full_path = Path(root) / file
            if not should_exclude(full_path):
                rel_path = full_path.relative_to(BASE_DIR)
                valid_paths.add(str(rel_path))
                # Also add without leading ./
                valid_paths.add(str(rel_path).lstrip('./'))
    return valid_paths

def check_link(link: str, current_file: Path, valid_paths: set) -> tuple:
    """Check if a link is valid. Returns (is_broken, reason)"""
    # Skip external URLs, anchors, special protocols
    if link.startswith(('http://', 'https://', '//', 'tel:', 'mailto:', 'javascript:', '#', 'data:', 'blob:')):
        return (False, None)

    # Skip template variables
    if '{{' in link or '${' in link:
        return (False, None)

    # Remove query params and hash
    clean_url = re.sub(r'[?#].*', '', link)

    if not clean_url:
        return (False, None)

    # Resolve relative path
    current_dir = current_file.parent.relative_to(BASE_DIR)

    if clean_url.startswith('/'):
        # Absolute path from root
        check_path = clean_url.lstrip('/')
    elif clean_url.startswith('./'):
        # Relative to current file
        check_path = str(current_dir / clean_url[2:])
    elif clean_url.startswith('../'):
        # Parent directory
        try:
            resolved = (current_dir / clean_url).resolve().relative_to(BASE_DIR.resolve())
            check_path = str(resolved)
        except ValueError:
            return (True, f"Path escapes base directory: {link}")
    else:
        # Relative to current directory
        check_path = str(current_dir / clean_url)

    # Normalize path
    check_path = os.path.normpath(check_path)

    # Check if file exists
    if check_path in valid_paths:
        return (False, None)

    return (True, f"File not found: {link} (checked: {check_path})")

def scan_broken_links(html_files: list, valid_paths: set):
    """Scan for broken internal links"""
    link_pattern = re.compile(r'(?:href|src)=["\']([^"\']+)["\']', re.IGNORECASE)

    for file_path in html_files:
        stats['total_files'] += 1
        try:
            content = file_path.read_text(encoding='utf-8')
        except Exception as e:
            a11y_issues.append(f"{file_path.relative_to(BASE_DIR)}: Cannot read file - {e}")
            continue

        rel_path = file_path.relative_to(BASE_DIR)

        for match in link_pattern.finditer(content):
            link = match.group(1)
            is_broken, reason = check_link(link, file_path, valid_paths)
            if is_broken:
                broken_links.append(f"  {rel_path}: {reason}")
                stats['broken_links'] += 1

def scan_meta_tags(html_files: list):
    """Scan for missing meta tags"""
    required_tags = {
        'charset': re.compile(r'<meta[^>]*charset', re.IGNORECASE),
        'viewport': re.compile(r'<meta[^>]*viewport', re.IGNORECASE),
        'description': re.compile(r'<meta[^>]*name=["\']description["\']', re.IGNORECASE),
        'title': re.compile(r'<title>', re.IGNORECASE),
    }

    for file_path in html_files:
        try:
            content = file_path.read_text(encoding='utf-8')
        except:
            continue

        rel_path = file_path.relative_to(BASE_DIR)

        for tag_name, pattern in required_tags.items():
            if not pattern.search(content):
                missing_meta.append(f"  {rel_path}: Missing {tag_name}")
                stats['missing_meta'] += 1

def scan_accessibility(html_files: list):
    """Scan for accessibility issues"""

    for file_path in html_files:
        try:
            content = file_path.read_text(encoding='utf-8')
        except:
            continue

        rel_path = file_path.relative_to(BASE_DIR)

        # 1. Images without alt attribute
        img_tags = re.findall(r'<img[^>]*>', content, re.IGNORECASE)
        for img in img_tags:
            if 'alt=' not in img.lower():
                a11y_issues.append(f"  {rel_path}: <img> without alt attribute")
                stats['a11y_no_alt'] += 1

        # 2. Buttons without accessible text (no aria-label and no text content)
        button_pattern = re.compile(r'<button[^>]*>(.*?)</button>', re.IGNORECASE | re.DOTALL)
        for match in button_pattern.finditer(content):
            button_tag = match.group(0)
            button_content = match.group(1).strip()
            has_aria = 'aria-label' in button_tag.lower()
            has_text = bool(button_content) and not re.match(r'^<[^>]+>$', button_content)
            if not has_aria and not has_text:
                a11y_issues.append(f"  {rel_path}: <button> without accessible text")
                stats['a11y_button'] += 1

        # 3. Links without href
        link_tags = re.findall(r'<a[^>]*>', content, re.IGNORECASE)
        for link in link_tags:
            if 'href' not in link.lower():
                a11y_issues.append(f"  {rel_path}: <a> without href")
                stats['a11y_link'] += 1

        # 4. Inputs without labels (text, email, password, search, tel, url, number)
        input_pattern = re.compile(r'<input[^>]*type=["\']?(text|email|password|search|tel|url|number)["\']?[^>]*>', re.IGNORECASE)
        for match in input_pattern.finditer(content):
            input_tag = match.group(0)
            # Skip if has aria-label
            if 'aria-label' in input_tag.lower():
                continue
            # Get id and check for associated label
            id_match = re.search(r'\bid=["\']([^"\']+)["\']', input_tag)
            if id_match:
                input_id = id_match.group(1)
                label_pattern = re.compile(rf'<label[^>]*for=["\']{re.escape(input_id)}["\']', re.IGNORECASE)
                if not label_pattern.search(content):
                    a11y_issues.append(f"  {rel_path}: <input id=\"{input_id}\"> without label")
                    stats['a11y_input'] += 1

        # 5. HTML without lang attribute
        html_tag = re.search(r'<html[^>]*>', content, re.IGNORECASE)
        if html_tag and 'lang' not in html_tag.group(0).lower():
            a11y_issues.append(f"  {rel_path}: <html> without lang attribute")
            stats['a11y_lang'] += 1

        # 6. Navigation without aria-label
        nav_tags = re.findall(r'<nav[^>]*>', content, re.IGNORECASE)
        for nav in nav_tags:
            if 'aria-label' not in nav.lower() and 'role' not in nav.lower():
                a11y_issues.append(f"  {rel_path}: <nav> without aria-label or role")
                stats['a11y_nav'] += 1

        # 7. Forms without submit button or aria-label
        form_tags = re.findall(r'<form[^>]*>', content, re.IGNORECASE)
        for form in form_tags:
            if 'aria-label' not in form.lower() and 'aria-labelledby' not in form.lower():
                # Check if form has an associated label or title nearby
                pass  # This is a soft check, skip for now

def generate_report():
    """Generate comprehensive audit report"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    report = f"""# SADEC MARKETING HUB - AUDIT REPORT
**Generated:** {timestamp}

## SUMMARY

| Metric | Count |
|--------|-------|
| HTML Files Scanned | {stats['total_files']} |
| Broken Links | {stats['broken_links']} |
| Missing Meta Tags | {stats['missing_meta']} |
| Accessibility Issues | {len(a11y_issues)} |
| └─ Images without alt | {stats['a11y_no_alt']} |
| └─ Buttons without text | {stats['a11y_button']} |
| └─ Links without href | {stats['a11y_link']} |
| └─ Inputs without label | {stats['a11y_input']} |
| └─ HTML without lang | {stats['a11y_lang']} |
| └─ Nav without aria-label | {stats['a11y_nav']} |

---

## 1. BROKEN LINKS ({stats['broken_links']} issues)

"""

    if broken_links:
        report += "\n".join(broken_links[:100])
        if len(broken_links) > 100:
            report += f"\n\n... and {len(broken_links) - 100} more"
    else:
        report += "✅ No broken links detected"

    report += f"""

---

## 2. MISSING META TAGS ({stats['missing_meta']} issues)

"""

    if missing_meta:
        report += "\n".join(missing_meta[:100])
        if len(missing_meta) > 100:
            report += f"\n\n... and {len(missing_meta) - 100} more"
    else:
        report += "✅ All required meta tags present"

    report += f"""

---

## 3. ACCESSIBILITY ISSUES ({len(a11y_issues)} issues)

"""

    if a11y_issues:
        report += "\n".join(a11y_issues[:100])
        if len(a11y_issues) > 100:
            report += f"\n\n... and {len(a11y_issues) - 100} more"
    else:
        report += "✅ No accessibility issues detected"

    report += f"""

---

## RECOMMENDATIONS

### High Priority
"""

    recommendations = []
    if stats['broken_links'] > 0:
        recommendations.append("1. **Fix broken links** - Update or remove {stats['broken_links']} broken internal links".format(stats=stats))
    if stats['a11y_lang'] > 0:
        recommendations.append(f"2. **Add lang attribute** - {stats['a11y_lang']} pages missing `lang` on `<html>`")
    if stats['a11y_no_alt'] > 0:
        recommendations.append(f"3. **Add alt text** - {stats['a11y_no_alt']} images missing alt attribute")
    if stats['missing_meta'] > 0:
        recommendations.append(f"4. **Add meta tags** - {stats['missing_meta']} pages missing required meta tags")

    if recommendations:
        report += "\n".join(recommendations)
    else:
        report += "✅ All checks passed. No critical issues found."

    return report

def generate_json_report():
    """Generate JSON report for programmatic access"""
    return {
        "timestamp": datetime.now().isoformat(),
        "stats": dict(stats),
        "broken_links": broken_links,
        "missing_meta": missing_meta,
        "accessibility_issues": a11y_issues
    }

def main():
    print("=" * 60)
    print("SADEC MARKETING HUB - FULL AUDIT")
    print("=" * 60)
    print()

    # Build file index
    print("📦 Building file index...")
    valid_paths = get_all_valid_paths()
    print(f"   Found {len(valid_paths)} valid files")

    # Get HTML files
    print("📄 Scanning HTML files...")
    html_files = get_html_files()
    print(f"   Found {len(html_files)} HTML files")
    print()

    # Run scans
    print("🔍 Scanning broken links...")
    scan_broken_links(html_files, valid_paths)
    print(f"   Found {stats['broken_links']} broken links")

    print("🏷️  Scanning meta tags...")
    scan_meta_tags(html_files)
    print(f"   Found {stats['missing_meta']} missing meta tags")

    print("♿ Scanning accessibility...")
    scan_accessibility(html_files)
    print(f"   Found {len(a11y_issues)} accessibility issues")
    print()

    # Generate reports
    print("📝 Generating reports...")
    report = generate_report()
    json_report = generate_json_report()

    # Save reports
    report_path = BASE_DIR / "audit-report-full.md"
    json_path = BASE_DIR / "audit-report-full.json"

    report_path.write_text(report, encoding='utf-8')
    json_path.write_text(json.dumps(json_report, indent=2, ensure_ascii=False), encoding='utf-8')

    print()
    print("=" * 60)
    print("AUDIT COMPLETE")
    print("=" * 60)
    print()
    print(f"HTML Files: {stats['total_files']}")
    print(f"Broken Links: {stats['broken_links']}")
    print(f"Missing Meta: {stats['missing_meta']}")
    print(f"A11y Issues: {len(a11y_issues)}")
    print()
    print(f"Reports saved to:")
    print(f"  - {report_path}")
    print(f"  - {json_path}")
    print()

    # Print summary to stdout
    print(report[:2000])

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
SaDec Marketing Hub - Audit Script
Scans for broken links, missing meta tags, and accessibility issues
"""

import os
import re
import json
from pathlib import Path
from datetime import datetime

BASE_DIR = Path("/Users/mac/.gemini/antigravity/scratch/sadec-marketing-hub")
EXCLUDE_DIRS = {'node_modules', 'dist', '.git', '.pytest_cache', '.venv', '__pycache__'}

def get_html_files():
    """Get all HTML files excluding certain directories"""
    html_files = []
    for root, dirs, files in os.walk(BASE_DIR):
        # Modify dirs in-place to skip excluded directories
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        for f in files:
            if f.endswith('.html'):
                html_files.append(Path(root) / f)
    return html_files

def get_all_valid_paths():
    """Build a set of all valid file paths"""
    paths = set()
    for root, dirs, files in os.walk(BASE_DIR):
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        for f in files:
            fp = Path(root) / f
            rel = fp.relative_to(BASE_DIR)
            paths.add(str(rel))
    return paths

def check_broken_links(file_path, valid_paths):
    """Check for broken internal links in a file"""
    issues = []
    rel_path = file_path.relative_to(BASE_DIR)

    try:
        content = file_path.read_text(encoding='utf-8')
    except:
        return issues

    # Find all href and src attributes
    patterns = [
        r'href=["\']([^"\']+)["\']',
        r'src=["\']([^"\']+)["\']'
    ]

    for pattern in patterns:
        matches = re.findall(pattern, content)
        for url in matches:
            # Skip external URLs, anchors, tel:, mailto:, javascript:, data URIs
            if url.startswith(('http://', 'https://', '//', 'tel:', 'mailto:',
                               'javascript:', 'data:', '#', '{', '${')):
                continue

            # Skip template variables
            if '${' in url or url.startswith('{%') or url.startswith('{{'):
                continue

            # Remove query params and hash
            clean_url = re.split(r'[?#]', url)[0]

            if not clean_url:
                continue

            # Check relative path resolution
            file_dir = rel_path.parent

            if clean_url.startswith('/'):
                # Absolute path
                check_path = clean_url[1:]
            elif clean_url.startswith('../'):
                # Parent directory
                resolved = (file_dir / clean_url).resolve()
                try:
                    check_path = str(resolved.relative_to(BASE_DIR.resolve()))
                except ValueError:
                    check_path = clean_url
            else:
                # Relative to current file
                check_path = str(file_dir / clean_url)

            # Normalize path
            check_path = check_path.replace('\\', '/')

            # Check if file exists
            if check_path not in valid_paths:
                # Check without leading ./
                check_path_clean = check_path.lstrip('./')
                if check_path_clean not in valid_paths:
                    issues.append(f"  {rel_path}: {url} -> {check_path}")

    return issues

def check_meta_tags(file_path):
    """Check for required meta tags"""
    issues = []
    rel_path = file_path.relative_to(BASE_DIR)

    try:
        content = file_path.read_text(encoding='utf-8')
    except:
        return issues

    checks = [
        (r'<meta[^>]*charset', 'Missing charset meta tag'),
        (r'<meta[^>]*viewport', 'Missing viewport meta tag'),
        (r'<meta[^>]*description', 'Missing description meta tag'),
        (r'<title>', 'Missing <title> tag'),
        (r'<html[^>]*lang=', 'Missing lang attribute on <html>'),
    ]

    for pattern, message in checks:
        if not re.search(pattern, content, re.IGNORECASE):
            issues.append(f"  {rel_path}: {message}")

    return issues

def check_accessibility(file_path):
    """Check for accessibility issues"""
    issues = []
    rel_path = file_path.relative_to(BASE_DIR)

    try:
        content = file_path.read_text(encoding='utf-8')
    except:
        return issues

    # Find all img tags without alt attribute
    img_tags = re.findall(r'<img[^>]*>', content, re.IGNORECASE)
    for img in img_tags:
        if 'alt=' not in img.lower():
            issues.append(f"  {rel_path}: <img> without alt attribute")

    # Find buttons without accessible text (no aria-label and no text content)
    button_matches = re.findall(r'<button[^>]*>([^<]*)</button>', content, re.IGNORECASE)
    for btn_text in button_matches:
        if not btn_text.strip():
            issues.append(f"  {rel_path}: <button> without accessible text")

    # Find links without href
    link_tags = re.findall(r'<a[^>]*>', content, re.IGNORECASE)
    for link in link_tags:
        if 'href=' not in link.lower():
            issues.append(f"  {rel_path}: <a> without href")

    # Find inputs with text/email/password/search type without labels
    input_tags = re.findall(r'<input[^>]*>', content, re.IGNORECASE)
    for inp in input_tags:
        type_match = re.search(r'type=["\'](text|email|password|search)["\']', inp, re.IGNORECASE)
        if type_match:
            has_label = 'aria-label=' in inp.lower() or 'id=' not in inp.lower()
            if not has_label:
                id_match = re.search(r'id=["\']([^"\']+)["\']', inp)
                if id_match:
                    input_id = id_match.group(1)
                    # Check if there's a label with for attribute
                    if not re.search(rf'<label[^>]*for=["\']{input_id}["\']', content, re.IGNORECASE):
                        issues.append(f"  {rel_path}: <input id=\"{input_id}\"> without label")

    # Check for nav without aria-label or role
    nav_tags = re.findall(r'<nav[^>]*>', content, re.IGNORECASE)
    for nav in nav_tags:
        if 'aria-label=' not in nav.lower() and 'role=' not in nav.lower():
            issues.append(f"  {rel_path}: <nav> without aria-label or role")

    return issues

def main():
    print("=" * 50)
    print("SADEC MARKETING HUB - AUDIT REPORT")
    print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 50)
    print()

    html_files = get_html_files()
    valid_paths = get_all_valid_paths()

    print(f"📦 Scanning {len(html_files)} HTML files...")
    print()

    all_link_issues = []
    all_meta_issues = []
    all_a11y_issues = []

    # Scan each file
    for i, file_path in enumerate(html_files, 1):
        if i % 20 == 0:
            print(f"  Progress: {i}/{len(html_files)} files...")

        all_link_issues.extend(check_broken_links(file_path, valid_paths))
        all_meta_issues.extend(check_meta_tags(file_path))
        all_a11y_issues.extend(check_accessibility(file_path))

    # Print results
    print()
    print("=" * 50)
    print("1. BROKEN LINKS")
    print("=" * 50)
    if all_link_issues:
        print(f"❌ Found {len(all_link_issues)} potential broken links:")
        for issue in all_link_issues[:50]:
            print(issue)
        if len(all_link_issues) > 50:
            print(f"  ... and {len(all_link_issues) - 50} more")
    else:
        print("✅ No broken links detected")

    print()
    print("=" * 50)
    print("2. MISSING META TAGS")
    print("=" * 50)
    if all_meta_issues:
        print(f"❌ Found {len(all_meta_issues)} meta tag issues:")
        for issue in all_meta_issues[:50]:
            print(issue)
        if len(all_meta_issues) > 50:
            print(f"  ... and {len(all_meta_issues) - 50} more")
    else:
        print("✅ All meta tags present")

    print()
    print("=" * 50)
    print("3. ACCESSIBILITY ISSUES")
    print("=" * 50)
    if all_a11y_issues:
        print(f"❌ Found {len(all_a11y_issues)} accessibility issues:")
        for issue in all_a11y_issues[:50]:
            print(issue)
        if len(all_a11y_issues) > 50:
            print(f"  ... and {len(all_a11y_issues) - 50} more")
    else:
        print("✅ No accessibility issues detected")

    print()
    print("=" * 50)
    print("SUMMARY")
    print("=" * 50)
    print(f"Total HTML files: {len(html_files)}")
    print(f"Broken links: {len(all_link_issues)}")
    print(f"Missing meta tags: {len(all_meta_issues)}")
    print(f"Accessibility issues: {len(all_a11y_issues)}")
    print("=" * 50)

    # Save JSON report
    report = {
        "date": datetime.now().isoformat(),
        "total_files": len(html_files),
        "broken_links_count": len(all_link_issues),
        "meta_issues_count": len(all_meta_issues),
        "a11y_issues_count": len(all_a11y_issues),
        "broken_links": all_link_issues,
        "meta_issues": all_meta_issues,
        "a11y_issues": all_a11y_issues
    }

    report_path = BASE_DIR / "audit-report.json"
    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2)

    print(f"\n📄 Full report saved to: {report_path}")

    return report

if __name__ == "__main__":
    main()

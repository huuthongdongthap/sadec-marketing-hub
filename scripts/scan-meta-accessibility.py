#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════════════════
SA ĐÉC MARKETING HUB — META TAGS & ACCESSIBILITY SCANNER
═══════════════════════════════════════════════════════════════════════════

Quét tất cả HTML files để tìm missing meta tags và accessibility issues.

Usage:
    python3 scripts/scan-meta-accessibility.py

Output:
    - Reports issues in reports/meta-accessibility-report.md
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

# Required meta tags patterns
REQUIRED_META = {
    'charset': r'<meta\s+charset=["\']?([^"\'>\s]+)["\']?',
    'viewport': r'<meta\s+name=["\']viewport["\']\s+content=["\']([^"\']+)["\']',
    'description': r'<meta\s+name=["\']description["\']\s+content=["\']([^"\']+)["\']',
}

# Required HTML attributes
REQUIRED_HTML = {
    'lang': r'<html[^>]*\slang=["\']([^"\']+)["\']',
}

# Accessibility checks
A11Y_CHECKS = {
    'missing_alt': (r'<img[^>]*>', 'Image missing alt attribute'),
    'missing_label': (r'<input[^>]*>(?![^<]*<label)', 'Input missing label'),
    'missing_button_type': (r'<button[^>]*>', 'Button missing type attribute'),
    'empty_link': (r'<a[^>]*>\s*</a>', 'Empty link'),
    'missing_heading_hierarchy': None,  # Special check
}


def check_charset(content, file_path):
    """Check for charset meta tag."""
    match = re.search(REQUIRED_META['charset'], content, re.IGNORECASE)
    if not match:
        return {'issue': 'Missing charset meta tag', 'severity': 'high'}
    if match.group(1).lower() != 'utf-8':
        return {'issue': f'Charset is {match.group(1)}, should be UTF-8', 'severity': 'medium'}
    return None


def check_viewport(content, file_path):
    """Check for viewport meta tag."""
    match = re.search(REQUIRED_META['viewport'], content, re.IGNORECASE)
    if not match:
        return {'issue': 'Missing viewport meta tag', 'severity': 'high'}
    if 'width=device-width' not in match.group(1):
        return {'issue': 'Viewport missing width=device-width', 'severity': 'medium'}
    return None


def check_description(content, file_path):
    """Check for meta description."""
    match = re.search(REQUIRED_META['description'], content, re.IGNORECASE)
    if not match:
        return {'issue': 'Missing meta description', 'severity': 'medium'}
    if len(match.group(1)) < 50:
        return {'issue': f'Meta description too short ({len(match.group(1))} chars)', 'severity': 'low'}
    if len(match.group(1)) > 160:
        return {'issue': f'Meta description too long ({len(match.group(1))} chars)', 'severity': 'low'}
    return None


def check_lang(content, file_path):
    """Check for lang attribute on <html>."""
    match = re.search(REQUIRED_HTML['lang'], content, re.IGNORECASE)
    if not match:
        return {'issue': 'Missing lang attribute on <html>', 'severity': 'high'}
    if len(match.group(1)) < 2:
        return {'issue': f'Lang attribute too short: {match.group(1)}', 'severity': 'medium'}
    return None


def check_title(content, file_path):
    """Check for <title> tag."""
    match = re.search(r'<title>([^<]+)</title>', content, re.IGNORECASE)
    if not match:
        return {'issue': 'Missing <title> tag', 'severity': 'high'}
    if len(match.group(1).strip()) < 5:
        return {'issue': f'Title too short: "{match.group(1)}"', 'severity': 'medium'}
    if len(match.group(1).strip()) > 60:
        return {'issue': f'Title too long ({len(match.group(1))} chars)', 'severity': 'low'}
    return None


def check_h1(content, file_path):
    """Check for exactly one <h1> tag."""
    h1_tags = re.findall(r'<h1[^>]*>.*?</h1>', content, re.IGNORECASE | re.DOTALL)
    if len(h1_tags) == 0:
        return {'issue': 'Missing <h1> tag', 'severity': 'medium'}
    if len(h1_tags) > 1:
        return {'issue': f'Multiple <h1> tags found ({len(h1_tags)})', 'severity': 'medium'}
    return None


def check_images_alt(content, file_path):
    """Check for alt attributes on images."""
    missing_alt = []
    images = re.finditer(r'<img[^>]*>', content, re.IGNORECASE)

    for img in images:
        img_tag = img.group()
        if 'alt=' not in img_tag.lower():
            # Check if it's a tracking pixel or decorative
            if 'tracking' not in img_tag.lower() and 'pixel' not in img_tag.lower():
                missing_alt.append(img_tag[:80])

    if missing_alt:
        return {'issue': f'{len(missing_alt)} images missing alt attribute',
                'severity': 'high', 'details': missing_alt[:5]}
    return None


def check_form_labels(content, file_path):
    """Check for form inputs with labels."""
    issues = []

    # Find all inputs that should have labels
    inputs = re.finditer(r'<input[^>]*type=["\']?(text|email|password|tel|number|search)["\']?[^>]*>',
                         content, re.IGNORECASE)

    for inp in inputs:
        inp_tag = inp.group()
        inp_id = re.search(r'id=["\']([^"\']+)["\']', inp_tag)

        # Check if input has accessible label
        has_aria_label = 'aria-label=' in inp_tag.lower()
        has_aria_labelledby = 'aria-labelledby=' in inp_tag.lower()
        has_placeholder = 'placeholder=' in inp_tag.lower()

        if inp_id:
            # Check if there's a label for this id
            label_pattern = rf'<label[^>]*for=["\']{inp_id.group(1)}["\']'
            has_label_for = re.search(label_pattern, content, re.IGNORECASE)

            # Input is accessible if it has label[for], aria-label, or aria-labelledby
            if not has_label_for and not has_aria_label and not has_aria_labelledby:
                issues.append(f"Input#{inp_id.group(1)} missing label")
        elif not has_aria_label and not has_aria_labelledby and not has_placeholder:
            issues.append(f"Input without id/aria-label: {inp_tag[:50]}")

    if issues:
        return {'issue': f'{len(issues)} form inputs missing labels',
                'severity': 'high', 'details': issues[:5]}
    return None


def check_button_type(content, file_path):
    """Check for button type attribute."""
    buttons_without_type = []
    buttons = re.finditer(r'<button(?![^>]*type=["\'])', content, re.IGNORECASE)

    for btn in buttons:
        # Get context around button
        start = btn.start()
        end = min(start + 100, len(content))
        btn_context = content[start:end].split('>')[0] + '>'
        buttons_without_type.append(btn_context[:60])

    if buttons_without_type:
        return {'issue': f'{len(buttons_without_type)} buttons missing type attribute',
                'severity': 'medium', 'details': buttons_without_type[:5]}
    return None


def check_landmarks(content, file_path):
    """Check for main landmark."""
    has_main = '<main' in content.lower() or 'role="main"' in content.lower()

    if not has_main:
        return {'issue': 'Missing <main> landmark', 'severity': 'medium'}
    return None


def scan_file(file_path):
    """Scan a single HTML file for issues."""
    issues = {
        'meta': [],
        'accessibility': [],
        'seo': []
    }

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return {'error': str(e)}

    # Meta checks
    for check_name, check_func in [
        ('charset', check_charset),
        ('viewport', check_viewport),
        ('description', check_description),
    ]:
        result = check_func(content, file_path)
        if result:
            issues['meta'].append({
                'type': check_name,
                'issue': result['issue'],
                'severity': result['severity']
            })

    # HTML checks
    for check_name, check_func in [
        ('lang', check_lang),
    ]:
        result = check_func(content, file_path)
        if result:
            issues['meta'].append({
                'type': check_name,
                'issue': result['issue'],
                'severity': result['severity']
            })

    # SEO checks
    for check_name, check_func in [
        ('title', check_title),
        ('h1', check_h1),
    ]:
        result = check_func(content, file_path)
        if result:
            issues['seo'].append({
                'type': check_name,
                'issue': result['issue'],
                'severity': result['severity']
            })

    # Accessibility checks
    for check_name, check_func in [
        ('images_alt', check_images_alt),
        ('form_labels', check_form_labels),
        ('button_type', check_button_type),
        ('landmarks', check_landmarks),
    ]:
        result = check_func(content, file_path)
        if result:
            issues['accessibility'].append({
                'type': check_name,
                'issue': result['issue'],
                'severity': result['severity'],
                'details': result.get('details', [])
            })

    return issues


def scan_all_html_files():
    """Scan all HTML files."""
    all_issues = {}
    total_files = 0
    files_with_issues = 0

    html_files = list(ROOT_DIR.rglob('*.html'))
    print(f"🔍 Scanning {len(html_files)} HTML files for meta tags and accessibility...")

    for html_file in html_files:
        total_files += 1
        issues = scan_file(html_file)

        has_issues = any(
            issues.get(category, [])
            for category in ['meta', 'accessibility', 'seo']
        ) if isinstance(issues, dict) else False

        if has_issues or 'error' in issues:
            files_with_issues += 1
            relative_path = str(html_file.relative_to(ROOT_DIR))
            all_issues[relative_path] = issues

    return all_issues, total_files, files_with_issues


def generate_report(all_issues, total_files, files_with_issues):
    """Generate markdown report."""
    total_meta_issues = sum(
        len(i.get('meta', [])) for i in all_issues.values() if isinstance(i, dict)
    )
    total_a11y_issues = sum(
        len(i.get('accessibility', [])) for i in all_issues.values() if isinstance(i, dict)
    )
    total_seo_issues = sum(
        len(i.get('seo', [])) for i in all_issues.values() if isinstance(i, dict)
    )

    report = f"""# Meta Tags & Accessibility Report — Sa Đéc Marketing Hub

**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
**Total Files Scanned:** {total_files}
**Files with Issues:** {files_with_issues}

---

## Summary

| Category | Issues | Severity |
|----------|--------|----------|
| Meta Tags | {total_meta_issues} | {'🔴 High' if total_meta_issues > 10 else '🟡 Medium'} |
| Accessibility | {total_a11y_issues} | {'🔴 High' if total_a11y_issues > 20 else '🟡 Medium'} |
| SEO | {total_seo_issues} | {'🟡 Medium' if total_seo_issues > 0 else '🟢 Good'} |
| **Total** | **{total_meta_issues + total_a11y_issues + total_seo_issues}** | - |

---

## Issues by File

"""

    if not all_issues:
        report += "✅ No issues found!\n"
        return report

    for file_path, issues in sorted(all_issues.items()):
        if not any(issues.get(cat, []) for cat in ['meta', 'accessibility', 'seo']):
            continue

        report += f"### `{file_path}`\n\n"

        if issues.get('meta'):
            report += "**Meta Tags:**\n"
            for issue in issues['meta']:
                severity_icon = '🔴' if issue['severity'] == 'high' else '🟡' if issue['severity'] == 'medium' else '🟢'
                report += f"- {severity_icon} [{issue['type']}] {issue['issue']}\n"
            report += "\n"

        if issues.get('seo'):
            report += "**SEO:**\n"
            for issue in issues['seo']:
                severity_icon = '🔴' if issue['severity'] == 'high' else '🟡' if issue['severity'] == 'medium' else '🟢'
                report += f"- {severity_icon} [{issue['type']}] {issue['issue']}\n"
            report += "\n"

        if issues.get('accessibility'):
            report += "**Accessibility:**\n"
            for issue in issues['accessibility']:
                severity_icon = '🔴' if issue['severity'] == 'high' else '🟡' if issue['severity'] == 'medium' else '🟢'
                report += f"- {severity_icon} [{issue['type']}] {issue['issue']}\n"
                if issue.get('details'):
                    for detail in issue['details'][:3]:
                        report += f"  - `{detail}`\n"
            report += "\n"

    return report


def auto_fix(all_issues):
    """Auto-fix common issues."""
    fixed_count = 0

    for file_path, issues in all_issues.items():
        full_path = ROOT_DIR / file_path

        try:
            with open(full_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            print(f"❌ Error reading {file_path}: {e}")
            continue

        original_content = content
        file_fixes = 0

        # Fix: Add charset if missing
        if any(i['type'] == 'charset' for i in issues.get('meta', [])):
            if '<meta charset' not in content.lower():
                # Add after <head>
                content = content.replace('<head>', '<head>\n    <meta charset="utf-8">', 1)
                file_fixes += 1

        # Fix: Add viewport if missing
        if any(i['type'] == 'viewport' for i in issues.get('meta', [])):
            if 'name="viewport"' not in content.lower():
                content = content.replace(
                    '</head>',
                    '    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n</head>',
                    1
                )
                file_fixes += 1

        # Fix: Add lang if missing
        if any(i['type'] == 'lang' for i in issues.get('meta', [])):
            content = re.sub(r'<html(?![^>]*lang=)', '<html lang="vi"', content, count=1, flags=re.IGNORECASE)
            file_fixes += 1

        # Fix: Add type="button" to buttons without type
        if any(i['type'] == 'button_type' for i in issues.get('accessibility', [])):
            content = re.sub(r'<button(?![^>]*type=)([^>]*>)', r'<button type="button"\1', content, flags=re.IGNORECASE)
            file_fixes += 1

        if file_fixes > 0:
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(content)
            fixed_count += file_fixes
            print(f"  ✅ Fixed {file_fixes} issues in {file_path}")

    return fixed_count


def main():
    parser = argparse.ArgumentParser(description='Scan for meta tags and accessibility issues')
    parser.add_argument('--fix', action='store_true', help='Auto-fix issues')
    parser.add_argument('--output', '-o', default='reports/meta-accessibility-report.md',
                        help='Output report path')
    args = parser.parse_args()

    # Scan
    all_issues, total_files, files_with_issues = scan_all_html_files()

    # Generate report
    report = generate_report(all_issues, total_files, files_with_issues)

    # Save report
    output_path = ROOT_DIR / args.output
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(report)

    print(f"\n📄 Report saved to: {output_path}")
    print(f"📊 Found issues in {files_with_issues} files")

    # Auto-fix if requested
    if args.fix and all_issues:
        print("\n🔧 Auto-fixing issues...")
        fixed_count = auto_fix(all_issues)
        print(f"✅ Fixed {fixed_count} issues")

    return 0 if not all_issues else 1


if __name__ == '__main__':
    exit(main())

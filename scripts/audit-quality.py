#!/usr/bin/env python3
"""
Scan broken links, meta tags, and accessibility issues
Sa Đéc Marketing Hub - Quality Audit Script
"""

import os
import re
from pathlib import Path
from html.parser import HTMLParser

ROOT = Path(__file__).parent.parent
EXCLUDE_DIRS = {'node_modules', 'dist', 'reports', 'playwright-report', 'test-results', '.git'}

class HTMLAnalyzer(HTMLParser):
    def __init__(self, filename):
        super().__init__()
        self.filename = filename
        self.issues = []
        self.links = []
        self.images = []
        self.meta_tags = []
        self.has_title = False
        self.has_description = False
        self.has_og_title = False
        self.has_og_description = False
        self.has_og_image = False
        self.has_canonical = False
        self.has_skip_link = False
        self.has_main = False
        self.has_lang = False
        self.has_viewport = False
        self.inline_handlers = []

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)

        # Check for inline event handlers
        for attr, value in attrs:
            if attr.startswith('on'):
                self.inline_handlers.append({
                    'tag': tag,
                    'handler': attr,
                    'line': self.getpos()[0]
                })

        if tag == 'a':
            href = attrs_dict.get('href', '')
            if href and not href.startswith('#') and not href.startswith('mailto:') and not href.startswith('tel:'):
                self.links.append(href)
        elif tag == 'img':
            self.images.append(attrs_dict.get('src', ''))
            if 'alt' not in attrs_dict:
                self.issues.append({
                    'type': 'accessibility',
                    'issue': 'Image missing alt attribute',
                    'src': attrs_dict.get('src', ''),
                    'severity': 'error'
                })
        elif tag == 'meta':
            name = attrs_dict.get('name', '')
            property_ = attrs_dict.get('property', '')
            self.meta_tags.append(attrs_dict)

            if name == 'description' or property_ == 'og:description':
                self.has_description = True
            if property_ == 'og:title':
                self.has_og_title = True
            if property_ == 'og:description':
                self.has_og_description = True
            if property_ == 'og:image':
                self.has_og_image = True
            if attrs_dict.get('http-equiv', '').lower() == 'content-type':
                pass  # charset meta
        elif tag == 'link':
            rel = attrs_dict.get('rel', '')
            if rel == 'canonical':
                self.has_canonical = True
        elif tag == 'title':
            self.has_title = True
        elif tag == 'main':
            self.has_main = True
        elif tag == 'a' and 'skip' in attrs_dict.get('class', ''):
            self.has_skip_link = True

    def handle_starttag_html(self, tag, attrs):
        attrs_dict = dict(attrs)
        if 'lang' in attrs_dict:
            self.has_lang = True

    def handle_meta_viewport(self, attrs):
        attrs_dict = dict(attrs)
        if attrs_dict.get('name') == 'viewport':
            self.has_viewport = True

def analyze_file(file_path):
    """Analyze a single HTML file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        analyzer = HTMLAnalyzer(str(file_path))
        analyzer.feed(content)

        # Additional regex checks
        if re.search(r'\s+onclick\s*=', content, re.IGNORECASE):
            count = len(re.findall(r'\s+onclick\s*=', content, re.IGNORECASE))
            analyzer.issues.append({
                'type': 'best-practice',
                'issue': f'Inline onclick handlers (use addEventListener)',
                'count': count,
                'severity': 'warning'
            })

        if re.search(r'\s+onload\s*=', content, re.IGNORECASE):
            count = len(re.findall(r'\s+onload\s*=', content, re.IGNORECASE))
            analyzer.issues.append({
                'type': 'best-practice',
                'issue': f'Inline onload handlers (use addEventListener)',
                'count': count,
                'severity': 'warning'
            })

        # Check for missing SEO meta tags
        if not analyzer.has_title:
            analyzer.issues.append({
                'type': 'seo',
                'issue': 'Missing <title> tag',
                'severity': 'error'
            })

        if not analyzer.has_description:
            analyzer.issues.append({
                'type': 'seo',
                'issue': 'Missing meta description',
                'severity': 'warning'
            })

        if not analyzer.has_og_title:
            analyzer.issues.append({
                'type': 'seo',
                'issue': 'Missing og:title',
                'severity': 'warning'
            })

        if not analyzer.has_og_description:
            analyzer.issues.append({
                'type': 'seo',
                'issue': 'Missing og:description',
                'severity': 'warning'
            })

        if not analyzer.has_og_image:
            analyzer.issues.append({
                'type': 'seo',
                'issue': 'Missing og:image',
                'severity': 'warning'
            })

        if not analyzer.has_canonical:
            analyzer.issues.append({
                'type': 'seo',
                'issue': 'Missing canonical link',
                'severity': 'info'
            })

        # Accessibility checks
        if not analyzer.has_lang:
            analyzer.issues.append({
                'type': 'accessibility',
                'issue': 'Missing lang attribute on <html>',
                'severity': 'error'
            })

        if not analyzer.has_viewport:
            analyzer.issues.append({
                'type': 'accessibility',
                'issue': 'Missing viewport meta tag',
                'severity': 'error'
            })

        if not analyzer.has_main:
            analyzer.issues.append({
                'type': 'accessibility',
                'issue': 'Missing <main> element',
                'severity': 'warning'
            })

        return {
            'file': str(file_path.relative_to(ROOT)),
            'issues': analyzer.issues,
            'links_count': len(analyzer.links),
            'images_count': len(analyzer.images),
            'meta_count': len(analyzer.meta_tags)
        }
    except Exception as e:
        return {
            'file': str(file_path.relative_to(ROOT)),
            'error': str(e)
        }

def main():
    print("=" * 70)
    print("SA ĐÉC MARKETING HUB - QUALITY AUDIT")
    print("Broken Links | Meta Tags | Accessibility")
    print("=" * 70)

    results = []
    total_issues = {'error': 0, 'warning': 0, 'info': 0}

    for root, dirs, files in os.walk(ROOT):
        # Exclude directories
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]

        for file in files:
            if file.endswith('.html') and file not in ['seo-head.html']:
                file_path = Path(root) / file
                result = analyze_file(file_path)
                results.append(result)

                # Count issues
                for issue in result.get('issues', []):
                    severity = issue.get('severity', 'info')
                    total_issues[severity] = total_issues.get(severity, 0) + 1

    # Print summary
    print(f"\n📊 SUMMARY")
    print(f"{'='*70}")
    print(f"Files scanned: {len(results)}")
    print(f"❌ Errors:   {total_issues['error']}")
    print(f"⚠️  Warnings: {total_issues['warning']}")
    print(f"ℹ️  Info:     {total_issues['info']}")

    # Print errors
    errors = [r for r in results if any(i.get('severity') == 'error' for i in r.get('issues', []))]
    if errors:
        print(f"\n❌ ERRORS ({len(errors)} files)")
        print(f"{'='*70}")
        for r in errors:
            print(f"\n📄 {r['file']}")
            for issue in r['issues']:
                if issue.get('severity') == 'error':
                    print(f"   - {issue['issue']}")

    # Print warnings
    warnings = [r for r in results if any(i.get('severity') == 'warning' for i in r.get('issues', []))]
    if warnings:
        print(f"\n⚠️  WARNINGS ({len(warnings)} files)")
        print(f"{'='*70}")
        for r in warnings[:20]:  # Show first 20
            print(f"\n📄 {r['file']}")
            for issue in r['issues']:
                if issue.get('severity') == 'warning':
                    count = issue.get('count', '')
                    if count:
                        print(f"   - {issue['issue']} ({count})")
                    else:
                        print(f"   - {issue['issue']}")
        if len(warnings) > 20:
            print(f"\n   ... and {len(warnings) - 20} more files")

    # Save JSON report
    import json
    report_path = ROOT / 'reports' / 'quality-scan' / 'audit-results.json'
    report_path.parent.mkdir(parents=True, exist_ok=True)

    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump({
            'summary': total_issues,
            'files_scanned': len(results),
            'results': results
        }, f, indent=2, ensure_ascii=False)

    print(f"\n💾 Report saved to: {report_path}")
    print("=" * 70)

if __name__ == '__main__':
    main()

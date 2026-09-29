#!/usr/bin/env python3
"""
==============================================================================
AUDIT QA SCRIPT — Sa Đéc Marketing Hub
Quét: Broken Links, Meta Tags, Accessibility Issues
==============================================================================
"""

import os
import re
import json
from pathlib import Path
from collections import defaultdict
from html.parser import HTMLParser

# Cấu hình
ROOT_DIR = Path(__file__).parent.parent
EXCLUDE_DIRS = {'node_modules', 'dist', '.git', '.vercel', 'playwright-report'}
HTML_FILES = []

# Kết quả audit
results = {
    'broken_links': [],
    'meta_issues': [],
    'accessibility_issues': [],
    'summary': {}
}


class HTMLAnalyzer(HTMLParser):
    """Phân tích HTML file để tìm links, meta tags, và accessibility issues"""

    def __init__(self, filename):
        super().__init__()
        self.filename = filename
        self.links = []
        self.images = []
        self.meta_tags = []
        self.headings = []
        self.forms = []
        self.buttons = []
        self.inputs = []
        self.aria_issues = []
        self.current_heading = None
        self.has_main = False
        self.has_nav = False
        self.has_header = False
        self.skip_links = set()

        # Meta tag tracking
        self.has_title = False
        self.has_description = False
        self.has_og_title = False
        self.has_og_description = False
        self.has_og_image = False
        self.has_twitter_card = False
        self.has_viewport = False
        self.has_charset = False

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)

        # Links
        if tag == 'a':
            href = attrs_dict.get('href', '')
            if href and not href.startswith('#') and not href.startswith('javascript:'):
                self.links.append({
                    'href': href,
                    'text': self.get_starttag_text()[:100],
                    'line': self.getpos()[0]
                })
            # Check accessibility
            if 'href' in attrs_dict and 'aria-label' not in attrs_dict:
                # Check if link has meaningful text
                pass

        # Images
        if tag == 'img':
            src = attrs_dict.get('src', '')
            alt = attrs_dict.get('alt')
            self.images.append({
                'src': src,
                'alt': alt,
                'line': self.getpos()[0]
            })
            if alt is None:
                self.aria_issues.append({
                    'type': 'missing_alt',
                    'element': 'img',
                    'src': src,
                    'line': self.getpos()[0],
                    'severity': 'HIGH'
                })
            elif alt == '':
                pass  # Decorative image, OK
            elif len(alt) > 125:
                self.aria_issues.append({
                    'type': 'alt_too_long',
                    'element': 'img',
                    'src': src,
                    'line': self.getpos()[0],
                    'severity': 'LOW'
                })

        # Meta tags
        if tag == 'meta':
            self.meta_tags.append(attrs_dict)
            name = attrs_dict.get('name', '').lower()
            property_ = attrs_dict.get('property', '').lower()
            http_equiv = attrs_dict.get('http-equiv', '').lower()

            if name == 'description' or property_ == 'og:description':
                self.has_description = True
            if property_ == 'og:title':
                self.has_og_title = True
            if property_ == 'og:image':
                self.has_og_image = True
            if name == 'twitter:card':
                self.has_twitter_card = True
            if name == 'viewport':
                self.has_viewport = True
            if http_equiv == 'content-type' or attrs_dict.get('charset') == 'utf-8':
                self.has_charset = True

        if tag == 'title':
            self.has_title = True

        # Heading hierarchy
        if tag in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
            self.headings.append({
                'level': int(tag[1]),
                'line': self.getpos()[0]
            })

        # Forms
        if tag == 'form':
            self.forms.append({
                'action': attrs_dict.get('action', ''),
                'method': attrs_dict.get('method', 'GET'),
                'line': self.getpos()[0]
            })

        # Buttons
        if tag == 'button':
            aria_label = attrs_dict.get('aria-label')
            self.buttons.append({
                'aria_label': aria_label,
                'line': self.getpos()[0]
            })
            if not aria_label:
                # Check if button has text content (will check in handle_data)
                pass

        # Inputs
        if tag == 'input':
            input_type = attrs_dict.get('type', 'text')
            aria_label = attrs_dict.get('aria-label')
            id_ = attrs_dict.get('id')
            self.inputs.append({
                'type': input_type,
                'aria_label': aria_label,
                'id': id_,
                'line': self.getpos()[0]
            })
            if input_type not in ['hidden', 'submit', 'button'] and not aria_label and not id_:
                self.aria_issues.append({
                    'type': 'input_no_label',
                    'element': 'input',
                    'type': input_type,
                    'line': self.getpos()[0],
                    'severity': 'MEDIUM'
                })

        # Semantic elements
        if tag == 'main':
            self.has_main = True
        if tag == 'nav':
            self.has_nav = True
        if tag == 'header':
            self.has_header = True

    def get_issues(self):
        """Trả về danh sách issues sau khi parse"""
        issues = []

        # Meta tag issues
        if not self.has_title:
            issues.append({
                'type': 'missing_title',
                'file': self.filename,
                'severity': 'HIGH',
                'message': 'Missing <title> tag'
            })
        if not self.has_description:
            issues.append({
                'type': 'missing_meta_description',
                'file': self.filename,
                'severity': 'MEDIUM',
                'message': 'Missing meta description'
            })
        if not self.has_og_title:
            issues.append({
                'type': 'missing_og_title',
                'file': self.filename,
                'severity': 'LOW',
                'message': 'Missing og:title for social sharing'
            })
        if not self.has_og_image:
            issues.append({
                'type': 'missing_og_image',
                'file': self.filename,
                'severity': 'LOW',
                'message': 'Missing og:image for social sharing'
            })
        if not self.has_viewport:
            issues.append({
                'type': 'missing_viewport',
                'file': self.filename,
                'severity': 'HIGH',
                'message': 'Missing viewport meta tag (not mobile-friendly)'
            })
        if not self.has_charset:
            issues.append({
                'type': 'missing_charset',
                'file': self.filename,
                'severity': 'MEDIUM',
                'message': 'Missing charset declaration'
            })

        # Heading hierarchy issues
        levels = [h['level'] for h in self.headings]
        if levels:
            if 1 not in levels:
                issues.append({
                    'type': 'missing_h1',
                    'file': self.filename,
                    'severity': 'HIGH',
                    'message': 'Missing H1 heading'
                })
            if levels.count(1) > 1:
                issues.append({
                    'type': 'multiple_h1',
                    'file': self.filename,
                    'severity': 'MEDIUM',
                    'message': f'Multiple H1 tags found ({levels.count(1)})'
                })

            # Check heading skips (h1 -> h3 without h2)
            for i in range(1, len(levels)):
                if levels[i] - levels[i-1] > 1:
                    issues.append({
                        'type': 'heading_skip',
                        'file': self.filename,
                        'severity': 'MEDIUM',
                        'message': f'Heading skip: H{levels[i-1]} -> H{levels[i]} (missing H{levels[i-1]+1})'
                    })

        # Accessibility issues from parsing
        for issue in self.aria_issues:
            issue['file'] = self.filename
            issues.append(issue)

        # Semantic structure
        if not self.has_main:
            issues.append({
                'type': 'missing_main',
                'file': self.filename,
                'severity': 'LOW',
                'message': 'Missing <main> element for main content'
            })

        return issues


def find_html_files():
    """Tìm tất cả HTML files, exclude node_modules và dist"""
    html_files = []
    for root, dirs, files in os.walk(ROOT_DIR):
        # Exclude directories
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]

        for file in files:
            if file.endswith('.html'):
                filepath = Path(root) / file
                html_files.append(filepath)
    return html_files


def check_internal_links(all_files):
    """Kiểm tra internal links có tồn tại không"""
    broken = []
    existing_files = {str(f.relative_to(ROOT_DIR)) for f in all_files}

    # Also check for anchor links in same file
    for filepath in all_files:
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
        except:
            continue

        # Find all href links
        links = re.findall(r'href=["\']([^"\']+)["\']', content)
        rel_path = str(filepath.relative_to(ROOT_DIR))

        for link in links:
            # Skip external, anchor-only, javascript, tel:, mailto:
            if link.startswith(('http', 'https', '#', 'javascript:', 'tel:', 'mailto:')):
                continue

            # Parse link (remove query params and anchors)
            link_path = link.split('?')[0].split('#')[0]

            # Check if relative path exists
            if link_path and not link_path.endswith('.html'):
                continue  # Could be CSS, JS, etc.

            # Resolve relative path
            if link_path.startswith('/'):
                target = link_path[1:]  # Remove leading slash
            else:
                parent_dir = str(filepath.parent.relative_to(ROOT_DIR))
                target = os.path.normpath(os.path.join(parent_dir, link_path))

            if target not in existing_files and not target.startswith('dist/'):
                broken.append({
                    'file': rel_path,
                    'link': link,
                    'target': target,
                    'severity': 'HIGH'
                })

    return broken


def analyze_files():
    """Phân tích tất cả HTML files"""
    print(f"🔍 Tìm HTML files trong {ROOT_DIR}...")
    html_files = find_html_files()
    print(f"   Tìm thấy {len(html_files)} HTML files")

    all_issues = []

    for filepath in html_files:
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            print(f"   ⚠️  Không thể đọc {filepath}: {e}")
            continue

        analyzer = HTMLAnalyzer(str(filepath.relative_to(ROOT_DIR)))
        try:
            analyzer.feed(content)
        except Exception as e:
            print(f"   ⚠️  Parse error {filepath}: {e}")
            continue

        issues = analyzer.get_issues()
        all_issues.extend(issues)

    # Check broken internal links
    print("   🔗 Kiểm tra internal links...")
    broken_links = check_internal_links(html_files)

    return all_issues, broken_links, html_files


def print_report(issues, broken_links, html_files):
    """In báo cáo"""
    print("\n" + "="*80)
    print("📊 KẾT QUẢ AUDIT — SA ĐÉC MARKETING HUB")
    print("="*80)

    # Summary
    print(f"\n📁 Total files scanned: {len(html_files)}")
    print(f"⚠️  Total issues found: {len(issues) + len(broken_links)}")

    # Group by severity
    by_severity = defaultdict(list)
    for issue in issues:
        by_severity[issue.get('severity', 'UNKNOWN')].append(issue)
    for link in broken_links:
        by_severity[link.get('severity', 'UNKNOWN')].append(link)

    print(f"\n🔴 HIGH: {len(by_severity.get('HIGH', []))}")
    print(f"🟠 MEDIUM: {len(by_severity.get('MEDIUM', []))}")
    print(f"🟡 LOW: {len(by_severity.get('LOW', []))}")

    # Group by type
    by_type = defaultdict(list)
    for issue in issues:
        by_type[issue.get('type', 'unknown')].append(issue)

    print("\n" + "-"*80)
    print("📋 ISSUES BY TYPE:")
    print("-"*80)

    for issue_type, issue_list in sorted(by_type.items(), key=lambda x: -len(x[1])):
        print(f"\n  {issue_type}: {len(issue_list)} occurrences")
        # Show first 3 examples
        for issue in issue_list[:3]:
            print(f"    - {issue.get('file', 'N/A')}:{issue.get('line', 'N/A')}")
            if 'message' in issue:
                print(f"      → {issue['message']}")
        if len(issue_list) > 3:
            print(f"    ... and {len(issue_list) - 3} more")

    # Broken links
    if broken_links:
        print("\n" + "-"*80)
        print("🔗 BROKEN INTERNAL LINKS:")
        print("-"*80)
        for link in broken_links[:20]:
            print(f"  {link['file']}")
            print(f"    → href=\"{link['link']}\" (target: {link['target']})")
        if len(broken_links) > 20:
            print(f"  ... and {len(broken_links) - 20} more")

    # Save to file
    report_data = {
        'files_scanned': len(html_files),
        'total_issues': len(issues) + len(broken_links),
        'by_severity': {k: len(v) for k, v in by_severity.items()},
        'issues': issues,
        'broken_links': broken_links
    }

    report_path = ROOT_DIR / 'reports' / 'audit' / 'qa-audit-report.json'
    report_path.parent.mkdir(parents=True, exist_ok=True)

    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(report_data, f, indent=2, ensure_ascii=False)

    print(f"\n💾 Report saved to: {report_path}")
    print("="*80)


if __name__ == '__main__':
    print("\n" + "="*80)
    print("🔍 AUDIT QA SCRIPT — SA ĐÉC MARKETING HUB")
    print("="*80)

    issues, broken_links, html_files = analyze_files()
    print_report(issues, broken_links, html_files)

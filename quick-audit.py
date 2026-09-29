#!/usr/bin/env python3
"""
Quick Audit Summary for SaDec Marketing Hub
Tổng hợp nhanh broken links, meta tags, accessibility issues
"""

import os
import re
from html.parser import HTMLParser
from pathlib import Path
from dataclasses import dataclass, field
from typing import List, Dict, Set, Tuple
from collections import defaultdict


@dataclass
class Issue:
    file: str
    line: int
    type: str
    severity: str
    message: str
    element: str = ""


@dataclass
class AuditResult:
    file: str
    issues: List[Issue] = field(default_factory=list)
    meta_tags: Dict[str, str] = field(default_factory=dict)
    has_title: bool = False
    headings: List[Tuple[int, str]] = field(default_factory=list)


class QuickAuditParser(HTMLParser):
    """Parser nhanh để quét HTML"""

    def __init__(self, filepath: str, base_dir: str):
        super().__init__()
        self.filepath = filepath
        self.base_dir = base_dir
        self.issues: List[Issue] = []
        self.meta_tags: Dict[str, str] = {}
        self.has_title = False
        self.headings: List[Tuple[int, str]] = []
        self.current_heading = None
        self.images_without_alt = []
        self.inputs_without_label = []
        self.buttons_without_text = []
        self.broken_links = []
        self.has_lang = False

    def handle_starttag(self, tag: str, attrs: List[Tuple[str, str]]):
        attrs_dict = dict(attrs)
        line_num = self.getpos()[0]

        # Check html lang
        if tag == 'html':
            self.has_lang = 'lang' in attrs_dict

        # Meta tags
        if tag == 'meta':
            name = attrs_dict.get('name', '') or attrs_dict.get('property', '') or attrs_dict.get('http-equiv', '')
            content = attrs_dict.get('content', '')
            if name:
                self.meta_tags[name] = content
            if 'charset' in attrs_dict:
                self.meta_tags['charset'] = attrs_dict['charset']

        # Title
        elif tag == 'title':
            self.has_title = True

        # Images - accessibility check
        elif tag == 'img':
            src = attrs_dict.get('src', '')
            alt = attrs_dict.get('alt')

            if alt is None:
                self.images_without_alt.append((line_num, src))
                self.issues.append(Issue(
                    file=self.filepath,
                    line=line_num,
                    type='accessibility',
                    severity='critical',
                    message='Thiếu alt attribute cho hình ảnh',
                    element=f'<img src="{src[:50]}...">' if len(src) > 50 else f'<img src="{src}">'
                ))

        # Links - check for broken local links
        elif tag == 'a':
            href = attrs_dict.get('href', '')
            if href and not href.startswith('#') and not href.startswith('mailto:') and not href.startswith('tel:') and not href.startswith('http'):
                # Check if local file exists
                resolved = self._resolve_path(href)
                if resolved and not os.path.exists(resolved):
                    self.broken_links.append((line_num, href))
                    self.issues.append(Issue(
                        file=self.filepath,
                        line=line_num,
                        type='broken_link',
                        severity='warning',
                        message=f'Link đến file không tồn tại: {href}',
                        element=f'<a href="{href}">'
                    ))

        # Scripts - check if exists
        elif tag == 'script':
            src = attrs_dict.get('src', '')
            if src and not src.startswith('http') and not src.startswith('data:'):
                resolved = self._resolve_path(src)
                if resolved and not os.path.exists(resolved):
                    self.issues.append(Issue(
                        file=self.filepath,
                        line=line_num,
                        type='broken_import',
                        severity='warning',
                        message=f'Script không tìm thấy: {src}',
                        element=f'<script src="{src}">'
                    ))

        # Input fields - accessibility
        elif tag == 'input':
            input_type = attrs_dict.get('type', 'text')
            input_id = attrs_dict.get('id', '')
            aria_label = attrs_dict.get('aria-label', '')

            if input_type not in ['hidden', 'submit', 'button', 'reset', 'image']:
                if not input_id and not aria_label:
                    self.inputs_without_label.append(line_num)
                    self.issues.append(Issue(
                        file=self.filepath,
                        line=line_num,
                        type='accessibility',
                        severity='warning',
                        message='Input không có id hoặc aria-label để label',
                        element=f'<input type="{input_type}">'
                    ))

        # Headings
        elif tag in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
            level = int(tag[1])
            self.headings.append((level, ''))
            self.current_heading = (level, line_num)

    def handle_endtag(self, tag: str):
        if tag in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
            self.current_heading = None

    def handle_data(self, data: str):
        if self.current_heading:
            level, line_num = self.current_heading
            if self.headings and self.headings[-1][0] == level:
                self.headings[-1] = (level, data.strip()[:100])

    def _resolve_path(self, path: str) -> str:
        """Resolve path relative to base_dir or root"""
        if path.startswith('/'):
            # Root-relative - resolve from base_dir
            return os.path.join(self.base_dir, path.lstrip('/').split('?')[0])
        else:
            # Relative to current file
            base = os.path.dirname(self.filepath)
            return os.path.normpath(os.path.join(base, path.split('?')[0]))

    def finalize(self):
        """Post-processing checks"""
        # Check missing lang
        if not self.has_lang:
            self.issues.append(Issue(
                file=self.filepath,
                line=0,
                type='accessibility',
                severity='warning',
                message='Thiếu lang attribute trên thẻ <html>',
                element='<html>'
            ))

        # Check missing title
        if not self.has_title:
            self.issues.append(Issue(
                file=self.filepath,
                line=0,
                type='seo',
                severity='warning',
                message='Thiếu thẻ <title>',
                element='No <title>'
            ))

        # Check missing viewport
        if 'viewport' not in self.meta_tags:
            self.issues.append(Issue(
                file=self.filepath,
                line=0,
                type='seo',
                severity='warning',
                message='Thiếu meta viewport',
                element='<meta name="viewport">'
            ))

        # Check missing description
        if 'description' not in self.meta_tags:
            self.issues.append(Issue(
                file=self.filepath,
                line=0,
                type='seo',
                severity='info',
                message='Thiếu meta description',
                element='<meta name="description">'
            ))

        # Check heading hierarchy
        self._check_heading_hierarchy()

    def _check_heading_hierarchy(self):
        """Check heading hierarchy"""
        if not self.headings:
            return

        # Check for no H1
        h1_count = sum(1 for level, _ in self.headings if level == 1)
        if h1_count == 0:
            self.issues.append(Issue(
                file=self.filepath,
                line=0,
                type='seo',
                severity='warning',
                message='Không có thẻ H1',
                element='No H1'
            ))
        elif h1_count > 1:
            self.issues.append(Issue(
                file=self.filepath,
                line=0,
                type='seo',
                severity='info',
                message=f'Có {h1_count} thẻ H1 (nên chỉ có 1)',
                element=f'{h1_count} x H1'
            ))

        # Check for skipped levels
        prev_level = 0
        for level, _ in self.headings:
            if level > prev_level + 1 and prev_level > 0:
                self.issues.append(Issue(
                    file=self.filepath,
                    line=0,
                    type='accessibility',
                    severity='info',
                    message=f'Nhảy cấp heading (H{prev_level} → H{level})',
                    element=f'H{prev_level} → H{level}'
                ))
            prev_level = level


def scan_file(filepath: str, base_dir: str) -> AuditResult:
    """Quét một file HTML"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return AuditResult(file=filepath, issues=[
            Issue(file=filepath, line=0, type='error', severity='critical',
                  message=f'Không đọc được file: {e}')
        ])

    parser = QuickAuditParser(filepath, base_dir)
    try:
        parser.feed(content)
        parser.finalize()
    except Exception as e:
        parser.issues.append(Issue(
            file=filepath,
            line=0,
            type='error',
            severity='warning',
            message=f'Parse error: {e}'
        ))

    return AuditResult(
        file=filepath,
        issues=parser.issues,
        meta_tags=parser.meta_tags,
        has_title=parser.has_title,
        headings=parser.headings
    )


def find_html_files(base_dir: str) -> List[str]:
    """Tìm file HTML, exclude node_modules"""
    exclude = ['node_modules', 'dist', '.git', '__pycache__', 'playwright-report', 'audit-reports']
    html_files = []

    for root, dirs, files in os.walk(base_dir):
        dirs[:] = [d for d in dirs if d not in exclude]
        for file in files:
            if file.endswith('.html'):
                html_files.append(os.path.join(root, file))

    return sorted(html_files)


def main():
    base_dir = '/Users/mac/mekong-cli/apps/sadec-marketing-hub'

    print("=" * 60)
    print("🔍 SADEC MARKETING HUB - AUDIT SUMMARY")
    print("=" * 60)

    html_files = find_html_files(base_dir)
    print(f"\n📁 Files found: {len(html_files)}")

    results = []
    print("🔬 Scanning...")

    for i, filepath in enumerate(html_files):
        if (i + 1) % 20 == 0:
            print(f"  Progress: {i+1}/{len(html_files)}")
        result = scan_file(filepath, base_dir)
        results.append(result)

    # Summary
    total_issues = sum(len(r.issues) for r in results)
    by_type = defaultdict(lambda: {'critical': 0, 'warning': 0, 'info': 0})
    by_severity = {'critical': 0, 'warning': 0, 'info': 0}

    for r in results:
        for issue in r.issues:
            by_type[issue.type][issue.severity] += 1
            by_severity[issue.severity] += 1

    files_with_issues = [r for r in results if r.issues]

    print("\n" + "=" * 60)
    print("📊 SUMMARY")
    print("=" * 60)
    print(f"  Files scanned: {len(results)}")
    print(f"  Files with issues: {len(files_with_issues)}")
    print(f"  Total issues: {total_issues}")
    print(f"    🔴 Critical: {by_severity['critical']}")
    print(f"    🟡 Warning: {by_severity['warning']}")
    print(f"    🔵 Info: {by_severity['info']}")

    print("\n" + "=" * 60)
    print("📋 ISSUES BY TYPE")
    print("=" * 60)

    for issue_type, counts in sorted(by_type.items(), key=lambda x: -sum(x[1].values())):
        total = sum(counts.values())
        print(f"\n{issue_type.upper()}: {total} issues")
        if counts['critical']:
            print(f"  🔴 Critical: {counts['critical']}")
        if counts['warning']:
            print(f"  🟡 Warning: {counts['warning']}")
        if counts['info']:
            print(f"  🔵 Info: {counts['info']}")

    # Top 10 files with most issues
    print("\n" + "=" * 60)
    print("📁 TOP 10 FILES WITH MOST ISSUES")
    print("=" * 60)

    sorted_results = sorted(results, key=lambda r: -len(r.issues))[:10]
    for i, r in enumerate(sorted_results, 1):
        rel_path = r.file.replace(base_dir, '')
        critical = sum(1 for issue in r.issues if issue.severity == 'critical')
        warning = sum(1 for issue in r.issues if issue.severity == 'warning')
        info = sum(1 for issue in r.issues if issue.severity == 'info')
        print(f"  {i}. {rel_path}")
        print(f"     Total: {len(r.issues)} (🔴{critical} 🟡{warning} 🔵{info})")

    # SEO: Files missing important meta tags
    print("\n" + "=" * 60)
    print("📋 SEO: FILES MISSING IMPORTANT META TAGS")
    print("=" * 60)

    no_title = [r for r in results if not r.has_title]
    no_viewport = [r for r in results if 'viewport' not in r.meta_tags]
    no_description = [r for r in results if 'description' not in r.meta_tags]

    print(f"\n  Missing <title>: {len(no_title)} files")
    print(f"  Missing viewport: {len(no_viewport)} files")
    print(f"  Missing description: {len(no_description)} files")

    if no_title:
        print("\n  Files without title:")
        for r in no_title[:10]:
            print(f"    - {r.file.replace(base_dir, '')}")

    # Accessibility: Images without alt
    print("\n" + "=" * 60)
    print("📋 ACCESSIBILITY: IMAGES WITHOUT ALT")
    print("=" * 60)

    files_with_img_issues = [r for r in results if any(i.type == 'accessibility' and 'alt' in i.message for i in r.issues)]
    print(f"  Files with images missing alt: {len(files_with_img_issues)}")

    if files_with_img_issues:
        print("\n  Top files:")
        for r in sorted(files_with_img_issues, key=lambda x: -len(x.issues))[:5]:
            alt_issues = [i for i in r.issues if i.type == 'accessibility' and 'alt' in i.message]
            print(f"    - {r.file.replace(base_dir, '')}: {len(alt_issues)} images")

    # Broken links summary
    print("\n" + "=" * 60)
    print("📋 BROKEN LINKS/IMPORTS")
    print("=" * 60)

    broken_link_issues = [i for r in results for i in r.issues if i.type in ['broken_link', 'broken_import']]
    print(f"  Total broken link/import issues: {len(broken_link_issues)}")

    # Group by file
    by_file = defaultdict(list)
    for issue in broken_link_issues:
        by_file[issue.file].append(issue)

    if by_file:
        print("\n  Files with broken links (top 10):")
        for filepath, issues in sorted(by_file.items(), key=lambda x: -len(x[1]))[:10]:
            rel_path = filepath.replace(base_dir, '')
            print(f"    - {rel_path}: {len(issues)} broken links")
            for issue in issues[:3]:
                print(f"        Line {issue.line}: {issue.element[:60]}...")

    print("\n" + "=" * 60)
    print("✅ Audit complete!")
    print("=" * 60)

    # Generate quick report path
    report_path = os.path.join(base_dir, 'audit-reports', 'quick-audit-summary.txt')
    os.makedirs(os.path.dirname(report_path), exist_ok=True)

    with open(report_path, 'w', encoding='utf-8') as f:
        f.write("SADEC MARKETING HUB - AUDIT SUMMARY\n")
        f.write("=" * 60 + "\n\n")
        f.write(f"Files scanned: {len(results)}\n")
        f.write(f"Total issues: {total_issues}\n")
        f.write(f"  Critical: {by_severity['critical']}\n")
        f.write(f"  Warning: {by_severity['warning']}\n")
        f.write(f"  Info: {by_severity['info']}\n\n")

        f.write("ISSUES BY TYPE\n")
        f.write("-" * 40 + "\n")
        for issue_type, counts in sorted(by_type.items(), key=lambda x: -sum(x[1].values())):
            total = sum(counts.values())
            f.write(f"{issue_type}: {total}\n")

    print(f"\n📄 Quick report saved to: {report_path}")


if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""
Audit Scanner for SaDec Marketing Hub
Quét broken links, meta tags, và accessibility issues
"""

import os
import re
from html.parser import HTMLParser
from pathlib import Path
from dataclasses import dataclass, field
from typing import List, Dict, Set, Tuple
from collections import defaultdict
import urllib.request
import urllib.error
from concurrent.futures import ThreadPoolExecutor, as_completed


@dataclass
class Issue:
    file: str
    line: int
    type: str
    severity: str  # critical, warning, info
    message: str
    element: str = ""


@dataclass
class AuditResult:
    file: str
    issues: List[Issue] = field(default_factory=list)
    meta_tags: Dict[str, str] = field(default_factory=dict)
    links: List[str] = field(default_factory=list)
    images: List[str] = field(default_factory=list)
    headings: List[Tuple[int, str]] = field(default_factory=list)


class HTMLAuditParser(HTMLParser):
    """Parser để quét HTML và thu thập thông tin audit"""

    def __init__(self, filepath: str):
        super().__init__()
        self.filepath = filepath
        self.current_line = 1
        self.issues: List[Issue] = []
        self.meta_tags: Dict[str, str] = {}
        self.links: List[str] = []
        self.images: List[str] = []
        self.headings: List[Tuple[int, str]] = []
        self.current_heading = None
        self.has_title = False
        self.title_content = ""
        self.forms = []
        self.buttons = []
        self.inputs = []
        self.anchors = []
        self.scripts = []
        self.stylesheets = []

    def handle_starttag(self, tag: str, attrs: List[Tuple[str, str]]):
        attrs_dict = dict(attrs)
        line_num = self.getpos()[0]

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

        # Links (broken links check)
        elif tag == 'link':
            href = attrs_dict.get('href', '')
            if href and not href.startswith('data:') and not href.startswith('#'):
                self.stylesheets.append(href)
                self.links.append(href)
                # Check rel for missing stylesheet
                rel = attrs_dict.get('rel', '')
                if rel == 'stylesheet' and not href.startswith('http'):
                    self._check_local_file(href, line_num, 'stylesheet')

        # Scripts
        elif tag == 'script':
            src = attrs_dict.get('src', '')
            if src and not src.startswith('data:') and not src.startswith('#'):
                self.scripts.append(src)
                self.links.append(src)
                if not src.startswith('http'):
                    self._check_local_file(src, line_num, 'script')

        # Images - accessibility check
        elif tag == 'img':
            src = attrs_dict.get('src', '')
            alt = attrs_dict.get('alt')
            self.images.append(src)

            # Accessibility: alt attribute required
            if alt is None:
                self.issues.append(Issue(
                    file=self.filepath,
                    line=line_num,
                    type='accessibility',
                    severity='critical',
                    message='Thiếu alt attribute cho hình ảnh',
                    element=f'<img src="{src}">'
                ))
            elif alt == '' and not self._is_decorative_image(src):
                self.issues.append(Issue(
                    file=self.filepath,
                    line=line_num,
                    type='accessibility',
                    severity='warning',
                    message='Alt rỗng - nếu là hình trang trí thì OK, nếu có nội dung thì cần mô tả',
                    element=f'<img src="{src}" alt="">'
                ))

            if src and not src.startswith('data:') and not src.startswith('http'):
                self._check_local_file(src, line_num, 'image')

        # Anchors - broken links check
        elif tag == 'a':
            href = attrs_dict.get('href', '')
            self.anchors.append(href)
            if href and not href.startswith('#') and not href.startswith('mailto:') and not href.startswith('tel:'):
                self.links.append(href)
                if not href.startswith('http'):
                    self._check_local_file(href, line_num, 'link')
                # Check for generic link text
                if self._is_generic_link_text():
                    self.issues.append(Issue(
                        file=self.filepath,
                        line=line_num,
                        type='accessibility',
                        severity='info',
                        message='Link text quá chung chung (nên mô tả cụ thể hơn)',
                        element=f'<a href="{href}">click here/đọc thêm/xem thêm</a>'
                    ))

        # Headings hierarchy
        elif tag in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
            level = int(tag[1])
            self.headings.append((level, ''))
            self.current_heading = (level, line_num)

        # Forms - accessibility
        elif tag == 'form':
            self.forms.append(line_num)

        # Input fields
        elif tag == 'input':
            input_type = attrs_dict.get('type', 'text')
            input_id = attrs_dict.get('id', '')
            input_name = attrs_dict.get('name', '')
            aria_label = attrs_dict.get('aria-label', '')

            self.inputs.append({
                'type': input_type,
                'id': input_id,
                'name': input_name,
                'line': line_num
            })

            # Accessibility: input needs id or aria-label
            if input_type not in ['hidden', 'submit', 'button', 'reset'] and not input_id and not aria_label:
                self.issues.append(Issue(
                    file=self.filepath,
                    line=line_num,
                    type='accessibility',
                    severity='warning',
                    message='Input không có id (khó label) hoặc aria-label',
                    element=f'<input type="{input_type}">'
                ))

        # Buttons
        elif tag == 'button':
            self.buttons.append({
                'line': line_num,
                'text': ''
            })

        # ARIA roles
        if 'role' in attrs_dict:
            pass  # Good - has ARIA role

        # Check for missing lang attribute on html
        if tag == 'html':
            if 'lang' not in attrs_dict:
                self.issues.append(Issue(
                    file=self.filepath,
                    line=line_num,
                    type='accessibility',
                    severity='warning',
                    message='Thiếu lang attribute trên thẻ <html>',
                    element='<html>'
                ))

    def handle_endtag(self, tag: str):
        if tag in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
            self.current_heading = None

    def handle_data(self, data: str):
        if self.current_heading:
            level, line_num = self.current_heading
            # Update the last heading with actual text
            if self.headings and self.headings[-1][0] == level:
                self.headings[-1] = (level, data.strip())

        # Check button text
        if self.buttons and not self.buttons[-1]['text']:
            self.buttons[-1]['text'] = data.strip()

    def _check_local_file(self, path: str, line: int, resource_type: str):
        """Kiểm tra file local có tồn tại không"""
        if path.startswith('http'):
            return

        # Resolve relative path
        base_dir = os.path.dirname(self.filepath)
        full_path = os.path.normpath(os.path.join(base_dir, path.split('?')[0]))

        if not os.path.exists(full_path):
            self.issues.append(Issue(
                file=self.filepath,
                line=line,
                type='broken_link',
                severity='critical',
                message=f'{resource_type.title()} không tìm thấy: {path}',
                element=f'{path}'
            ))

    def _is_decorative_image(self, src: str) -> bool:
        """Check if image is likely decorative"""
        decorative_patterns = ['spacer', 'divider', 'bg-', 'background', 'icon-', 'decorative']
        return any(p in src.lower() for p in decorative_patterns)

    def _is_generic_link_text(self) -> bool:
        """Check if current link has generic text"""
        # This would need more context, simplified here
        return False

    def check_heading_hierarchy(self):
        """Kiểm tra heading hierarchy sau khi parse xong"""
        if not self.headings:
            return

        # Check for skipped levels
        prev_level = 0
        for level, text in self.headings:
            if level > prev_level + 1 and prev_level > 0:
                self.issues.append(Issue(
                    file=self.filepath,
                    line=0,
                    type='accessibility',
                    severity='warning',
                    message=f'Nhảy cấp heading (H{prev_level} → H{level})',
                    element=f'H{prev_level} → H{level}'
                ))
            prev_level = level

        # Check for multiple H1
        h1_count = sum(1 for level, _ in self.headings if level == 1)
        if h1_count > 1:
            self.issues.append(Issue(
                file=self.filepath,
                line=0,
                type='accessibility',
                severity='warning',
                message=f'Có {h1_count} thẻ H1 (nên chỉ có 1)',
                element=f'{h1_count} x H1'
            ))
        elif h1_count == 0:
            self.issues.append(Issue(
                file=self.filepath,
                line=0,
                type='seo',
                severity='warning',
                message='Không có thẻ H1',
                element='No H1'
            ))


def check_meta_tags(result: AuditResult) -> None:
    """Kiểm tra meta tags đầy đủ chưa"""
    required_meta = {
        'charset': 'critical',
        'viewport': 'critical',
        'description': 'warning',
    }

    og_required = {
        'og:title': 'warning',
        'og:description': 'info',
        'og:image': 'info',
        'og:url': 'info',
    }

    # Check required meta tags
    for meta, severity in required_meta.items():
        if meta not in result.meta_tags:
            result.issues.append(Issue(
                file=result.file,
                line=0,
                type='seo',
                severity=severity,
                message=f'Thiếu meta tag: {meta}',
                element=f'<meta name="{meta}">'
            ))

    # Check Open Graph tags
    for og, severity in og_required.items():
        if og not in result.meta_tags:
            result.issues.append(Issue(
                file=result.file,
                line=0,
                type='seo',
                severity=severity,
                message=f'Thiếu Open Graph tag: {og}',
                element=f'<meta property="{og}">'
            ))

    # Check title
    if not result.meta_tags.get('title_present'):
        # Title is tracked separately
        pass


def scan_html_file(filepath: str) -> AuditResult:
    """Quét một file HTML"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return AuditResult(file=filepath, issues=[
            Issue(file=filepath, line=0, type='error', severity='critical',
                  message=f'Không đọc được file: {e}')
        ])

    parser = HTMLAuditParser(filepath)
    try:
        parser.handle_starttag('html', [('lang', 'vi')])  # Dummy call to initialize
        parser.feed(content)
    except Exception as e:
        parser.issues.append(Issue(
            file=filepath,
            line=0,
            type='error',
            severity='warning',
            message=f'Parse error: {e}'
        ))

    result = AuditResult(
        file=filepath,
        issues=parser.issues,
        meta_tags=parser.meta_tags,
        links=parser.links,
        images=parser.images,
        headings=parser.headings
    )

    # Add title status
    result.meta_tags['title_present'] = parser.has_title

    # Post-processing checks
    parser.check_heading_hierarchy()
    check_meta_tags(result)

    return result


def find_html_files(base_dir: str, exclude_dirs: List[str] = None) -> List[str]:
    """Tìm tất cả file HTML trong thưục"""
    if exclude_dirs is None:
        exclude_dirs = ['node_modules', 'dist', '.git', '__pycache__', 'playwright-report']

    html_files = []
    for root, dirs, files in os.walk(base_dir):
        # Exclude directories
        dirs[:] = [d for d in dirs if d not in exclude_dirs]

        for file in files:
            if file.endswith('.html'):
                html_files.append(os.path.join(root, file))

    return sorted(html_files)


def generate_report(results: List[AuditResult], output_file: str) -> str:
    """Tạo báo cáo HTML"""

    total_issues = sum(len(r.issues) for r in results)
    critical = sum(1 for r in results for i in r.issues if i.severity == 'critical')
    warning = sum(1 for r in results for i in r.issues if i.severity == 'warning')
    info = sum(1 for r in results for i in r.issues if i.severity == 'info')

    # Group issues by type
    issues_by_type = defaultdict(list)
    for r in results:
        for issue in r.issues:
            issues_by_type[issue.type].append(issue)

    html = f'''<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Audit Report - SaDec Marketing Hub</title>
    <style>
        :root {{
            --critical: #dc3545;
            --warning: #ffc107;
            --info: #17a2b8;
            --success: #28a745;
        }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }}
        .summary {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
        }}
        .summary-card {{
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            text-align: center;
        }}
        .summary-card.critical {{ border-top: 4px solid var(--critical); }}
        .summary-card.warning {{ border-top: 4px solid var(--warning); }}
        .summary-card.info {{ border-top: 4px solid var(--info); }}
        .summary-card.success {{ border-top: 4px solid var(--success); }}
        .summary-card .count {{
            font-size: 2.5em;
            font-weight: bold;
        }}
        .summary-card.critical .count {{ color: var(--critical); }}
        .summary-card.warning .count {{ color: var(--warning); }}
        .summary-card.info .count {{ color: var(--info); }}
        .summary-card.success .count {{ color: var(--success); }}
        h1, h2 {{ color: #333; }}
        .file-section {{
            background: white;
            margin: 20px 0;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}
        .file-header {{
            border-bottom: 2px solid #eee;
            padding-bottom: 10px;
            margin-bottom: 15px;
        }}
        .issue {{
            padding: 10px;
            margin: 10px 0;
            border-radius: 4px;
            border-left: 4px solid;
        }}
        .issue.critical {{ background: #ffe6e6; border-color: var(--critical); }}
        .issue.warning {{ background: #fff8e1; border-color: var(--warning); }}
        .issue.info {{ background: #e0f7fa; border-color: var(--info); }}
        .issue .type {{
            font-weight: bold;
            text-transform: uppercase;
            font-size: 0.8em;
        }}
        .issue .message {{ margin: 5px 0; }}
        .issue .element {{
            font-family: monospace;
            background: rgba(0,0,0,0.1);
            padding: 2px 6px;
            border-radius: 3px;
            word-break: break-all;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }}
        th, td {{
            padding: 8px 12px;
            text-align: left;
            border-bottom: 1px solid #eee;
        }}
        th {{ background: #f8f9fa; }}
        .progress {{
            background: #e9ecef;
            border-radius: 4px;
            height: 20px;
            overflow: hidden;
            margin: 10px 0;
        }}
        .progress-bar {{
            height: 100%;
            display: flex;
        }}
        .progress-bar.critical {{ background: var(--critical); }}
        .progress-bar.warning {{ background: var(--warning); }}
        .progress-bar.info {{ background: var(--info); }}
        .progress-bar.success {{ background: var(--success); }}
    </style>
</head>
<body>
    <h1>📊 Audit Report - SaDec Marketing Hub</h1>
    <p>Generated: {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>

    <div class="summary">
        <div class="summary-card success">
            <div class="count">{len(results)}</div>
            <div>Files scanned</div>
        </div>
        <div class="summary-card success">
            <div class="count">{sum(1 for r in results if not r.issues)}</div>
            <div>Clean files</div>
        </div>
        <div class="summary-card critical">
            <div class="count">{critical}</div>
            <div>Critical</div>
        </div>
        <div class="summary-card warning">
            <div class="count">{warning}</div>
            <div>Warnings</div>
        </div>
        <div class="summary-card info">
            <div class="count">{info}</div>
            <div>Info</div>
        </div>
    </div>

    <h2>Issues by Type</h2>
    <table>
        <tr><th>Type</th><th>Count</th><th>Percentage</th></tr>
'''

    for issue_type, issues in sorted(issues_by_type.items(), key=lambda x: -len(x[1])):
        pct = len(issues) / total_issues * 100 if total_issues > 0 else 0
        html += f'        <tr><td>{issue_type}</td><td>{len(issues)}</td><td>{pct:.1f}%</td></tr>\n'

    html += '''    </table>

    <h2>Issues by File</h2>
'''

    # Group by file with issues
    files_with_issues = [r for r in results if r.issues]

    for result in sorted(files_with_issues, key=lambda r: -len(r.issues)):
        critical_count = sum(1 for i in result.issues if i.severity == 'critical')
        warning_count = sum(1 for i in result.issues if i.severity == 'warning')
        info_count = sum(1 for i in result.issues if i.severity == 'info')

        html += f'''
    <div class="file-section">
        <div class="file-header">
            <h3>{result.file.replace(str(os.path.dirname(result.file).split("/sadec-marketing-hub/")[0] + "/sadec-marketing-hub/"), "")}</h3>
            <span class="critical">{critical_count} critical</span> |
            <span class="warning">{warning_count} warnings</span> |
            <span class="info">{info_count} info</span>
        </div>
'''
        for issue in sorted(result.issues, key=lambda i: i.line):
            html += f'''
        <div class="issue {issue.severity}">
            <div class="type">{issue.type} - {issue.severity.upper()}</div>
            <div class="message">{issue.message}</div>
            {f'<div class="element">Line {issue.line}: {issue.element}</div>' if issue.line else ''}
        </div>
'''
        html += '    </div>\n'

    html += '''
</body>
</html>
'''

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(html)

    return output_file


def main():
    base_dir = '/Users/mac/mekong-cli/apps/sadec-marketing-hub'

    # Find HTML files (excluding node_modules)
    print("🔍 Đang tìm file HTML...")
    html_files = find_html_files(base_dir)

    # Filter to only scan main files (not in node_modules)
    main_files = [
        f for f in html_files
        if '/node_modules/' not in f
        and '/playwright-report/' not in f
    ]

    # Limit to important files
    important_paths = [
        '/index.html',
        '/login.html',
        '/register.html',
        '/forgot-password.html',
        '/verify-email.html',
        '/privacy.html',
        '/terms.html',
        '/lp.html',
        '/audit-report.html',
        '/offline.html',
    ]

    # Add admin files
    admin_files = [f for f in main_files if '/admin/' in f and f.endswith('.html')]

    # Add portal files
    portal_files = [f for f in main_files if '/portal/' in f and f.endswith('.html')]

    # Combine: root files + admin + portal
    files_to_scan = (
        [f for f in main_files if os.path.dirname(f) == base_dir] +
        admin_files[:50] +  # Limit admin files
        portal_files[:20]   # Limit portal files
    )

    print(f"📁 Tìm thấy {len(files_to_scan)} file HTML cần quét")

    # Scan files
    results = []
    print("🔬 Đang quét từng file...")

    for i, filepath in enumerate(files_to_scan):
        if (i + 1) % 10 == 0:
            print(f"  Progress: {i+1}/{len(files_to_scan)}")
        result = scan_html_file(filepath)
        results.append(result)

    # Generate report
    report_path = os.path.join(base_dir, 'audit-reports', 'full-audit-report.html')
    os.makedirs(os.path.dirname(report_path), exist_ok=True)

    output = generate_report(results, report_path)
    print(f"\n✅ Báo cáo đã tạo: {output}")

    # Print summary
    total_issues = sum(len(r.issues) for r in results)
    critical = sum(1 for r in results for i in r.issues if i.severity == 'critical')
    warning = sum(1 for r in results for i in r.issues if i.severity == 'warning')
    info = sum(1 for r in results for i in r.issues if i.severity == 'info')

    print(f"\n📊 Summary:")
    print(f"   Files scanned: {len(results)}")
    print(f"   Total issues: {total_issues}")
    print(f"   🔴 Critical: {critical}")
    print(f"   🟡 Warning: {warning}")
    print(f"   🔵 Info: {info}")

    # Top 10 files with most issues
    print("\n📁 Top 10 files với nhiều issues nhất:")
    sorted_results = sorted(results, key=lambda r: -len(r.issues))[:10]
    for r in sorted_results:
        rel_path = r.file.replace(base_dir, '')
        print(f"   {rel_path}: {len(r.issues)} issues")


if __name__ == '__main__':
    main()

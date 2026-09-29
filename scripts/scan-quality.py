#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════════════════════
SADEC MARKETING HUB - QUALITY SCAN SCRIPT
═══════════════════════════════════════════════════════════════════════════════
Scan for:
- Broken links (href="#", javascript:, empty)
- Missing meta tags (title, description, og:tags)
- Accessibility issues (missing alt, aria labels, lang attribute)

Usage: python3 scripts/scan-quality.py
"""

import os
import re
import json
from pathlib import Path
from datetime import datetime

# Configuration
ROOT_DIR = Path(__file__).parent.parent
DIST_DIR = ROOT_DIR / 'dist'
REPORT_DIR = ROOT_DIR / 'reports' / 'quality-scan'

# Ensure report directory exists
REPORT_DIR.mkdir(parents=True, exist_ok=True)

class QualityScanner:
    def __init__(self):
        self.results = {
            'broken_links': [],
            'missing_meta': [],
            'accessibility_issues': [],
            'summary': {
                'total_files': 0,
                'broken_links_count': 0,
                'missing_meta_count': 0,
                'accessibility_issues_count': 0
            }
        }

    def scan_all(self):
        """Scan all HTML files in dist directory"""
        html_files = list(DIST_DIR.rglob('*.html'))
        self.results['summary']['total_files'] = len(html_files)

        for html_file in html_files:
            self.scan_file(html_file)

        self.generate_report()

    def scan_file(self, file_path):
        """Scan a single HTML file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
            return

        rel_path = str(file_path.relative_to(ROOT_DIR))

        # Scan for broken links
        self.scan_broken_links(content, rel_path)

        # Scan for missing meta tags
        self.scan_meta_tags(content, rel_path)

        # Scan for accessibility issues
        self.scan_accessibility(content, rel_path)

    def scan_broken_links(self, content, file_path):
        """Scan for broken/dangerous link patterns"""
        # Pattern for href="#"
        empty_anchors = re.findall(r'href="#"', content)
        if empty_anchors:
            self.results['broken_links'].append({
                'file': file_path,
                'issue': 'Empty anchor links (href="#")',
                'count': len(empty_anchors),
                'severity': 'warning'
            })

        # Pattern for href="javascript:"
        js_links = re.findall(r'href="javascript:[^"]*"', content)
        if js_links:
            self.results['broken_links'].append({
                'file': file_path,
                'issue': 'JavaScript in href (security risk)',
                'count': len(js_links),
                'severity': 'error'
            })

        # Pattern for onclick handlers (inline JS - not recommended)
        onclick_handlers = re.findall(r'onclick="[^"]*"', content)
        if onclick_handlers:
            self.results['broken_links'].append({
                'file': file_path,
                'issue': 'Inline onclick handlers (use addEventListener)',
                'count': len(onclick_handlers),
                'severity': 'warning'
            })

        # Empty href
        empty_href = re.findall(r'href=""', content)
        if empty_href:
            self.results['broken_links'].append({
                'file': file_path,
                'issue': 'Empty href attributes',
                'count': len(empty_href),
                'severity': 'warning'
            })

        self.results['summary']['broken_links_count'] += len(empty_anchors) + len(js_links) + len(onclick_handlers) + len(empty_href)

    def scan_meta_tags(self, content, file_path):
        """Scan for missing meta tags"""
        issues = []

        # Check for title tag
        if not re.search(r'<title[^>]*>.*?</title>', content, re.IGNORECASE):
            issues.append('Missing <title> tag')

        # Check for meta description
        if not re.search(r'<meta[^>]*name=["\']description["\'][^>]*>', content, re.IGNORECASE):
            issues.append('Missing meta description')

        # Check for viewport
        if not re.search(r'<meta[^>]*name=["\']viewport["\'][^>]*>', content, re.IGNORECASE):
            issues.append('Missing viewport meta tag')

        # Check for charset
        if not re.search(r'<meta[^>]*charset=["\'][^"\'>]+["\']', content, re.IGNORECASE):
            issues.append('Missing charset meta tag')

        # Check for og:title
        if not re.search(r'<meta[^>]*property=["\']og:title["\'][^>]*>', content, re.IGNORECASE):
            issues.append('Missing og:title')

        # Check for og:description
        if not re.search(r'<meta[^>]*property=["\']og:description["\'][^>]*>', content, re.IGNORECASE):
            issues.append('Missing og:description')

        # Check for og:image
        if not re.search(r'<meta[^>]*property=["\']og:image["\'][^>]*>', content, re.IGNORECASE):
            issues.append('Missing og:image')

        # Check for canonical
        if not re.search(r'<link[^>]*rel=["\']canonical["\'][^>]*>', content, re.IGNORECASE):
            issues.append('Missing canonical link')

        if issues:
            self.results['missing_meta'].append({
                'file': file_path,
                'issues': issues,
                'severity': 'error' if len(issues) > 3 else 'warning'
            })

        self.results['summary']['missing_meta_count'] += len(issues)

    def scan_accessibility(self, content, file_path):
        """Scan for accessibility issues"""
        issues = []

        # Check for lang attribute on html
        if not re.search(r'<html[^>]*lang=["\'][^"\'>]+["\']', content, re.IGNORECASE):
            issues.append('Missing lang attribute on <html> tag')

        # Check for images without alt
        images_without_alt = re.findall(r'<img(?![^>]*alt=["\'][^"\']*["\'])[^>]*>', content)
        # Filter out images with alt="" (decorative images)
        images_without_alt = [img for img in images_without_alt if 'alt=' not in img]
        if images_without_alt:
            issues.append(f'{len(images_without_alt)} images missing alt attribute')

        # Check for buttons without aria-label or text content
        # This is a simplified check
        buttons = re.findall(r'<button[^>]*>.*?</button>', content, re.DOTALL)
        buttons_without_text = [b for b in buttons if not re.search(r'>[^<\s]', b) and 'aria-label' not in b]
        if buttons_without_text:
            issues.append(f'{len(buttons_without_text)} buttons may lack accessible text')

        # Check for form inputs without labels (exclude hidden, submit, button types)
        inputs = re.findall(r'<input(?![^>]*type=["\'](?:hidden|submit|button)[^>]*>)>', content)
        # Check if inputs have associated labels or aria-label
        inputs_without_labels = [i for i in inputs if 'aria-label' not in i and 'id=' not in i]
        if inputs_without_labels:
            issues.append(f'{len(inputs_without_labels)} inputs may lack labels')

        # Check for skip links
        if 'skip-link' not in content and 'skiplink' not in content:
            issues.append('Missing skip link for keyboard navigation')

        # Check for role attribute usage (good practice but not required)
        # This is informational

        if issues:
            self.results['accessibility_issues'].append({
                'file': file_path,
                'issues': issues,
                'severity': 'error' if any('Missing' in i for i in issues) else 'warning'
            })

        self.results['summary']['accessibility_issues_count'] += len(issues)

    def generate_report(self):
        """Generate HTML and JSON reports"""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        # JSON Report
        json_report = {
            'timestamp': timestamp,
            'results': self.results
        }

        with open(REPORT_DIR / 'scan-results.json', 'w', encoding='utf-8') as f:
            json.dump(json_report, f, indent=2, ensure_ascii=False)

        # HTML Report
        html_report = self.generate_html_report(timestamp)

        with open(REPORT_DIR / 'scan-report.html', 'w', encoding='utf-8') as f:
            f.write(html_report)

        print(f"\n{'='*70}")
        print("SADEC MARKETING HUB - QUALITY SCAN REPORT")
        print(f"Generated: {timestamp}")
        print(f"{'='*70}\n")

        print(f"📁 Total files scanned: {self.results['summary']['total_files']}")
        print(f"🔗 Broken links issues: {self.results['summary']['broken_links_count']}")
        print(f"🏷️  Missing meta tags: {self.results['summary']['missing_meta_count']}")
        print(f"♿ Accessibility issues: {self.results['summary']['accessibility_issues_count']}")
        print(f"\n📊 Reports saved to:")
        print(f"   - {REPORT_DIR / 'scan-results.json'}")
        print(f"   - {REPORT_DIR / 'scan-report.html'}")
        print(f"{'='*70}\n")

    def generate_html_report(self, timestamp):
        """Generate HTML report"""
        # Calculate overall score
        total_issues = (
            self.results['summary']['broken_links_count'] +
            self.results['summary']['missing_meta_count'] +
            self.results['summary']['accessibility_issues_count']
        )

        if total_issues == 0:
            score = 100
        elif total_issues < 10:
            score = 90
        elif total_issues < 50:
            score = 75
        elif total_issues < 100:
            score = 60
        else:
            score = 40

        score_class = 'pass' if score >= 80 else 'warn' if score >= 60 else 'fail'

        html = f'''<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quality Scan Report - SaDec Marketing Hub</title>
    <style>
        :root {{
            --pass: #22c55e;
            --warn: #f59e0b;
            --fail: #ef4444;
            --bg: #f8fafc;
            --surface: #ffffff;
            --text: #1e293b;
            --text-muted: #64748b;
            --border: #e2e8f0;
        }}
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--bg);
            color: var(--text);
            padding: 24px;
            line-height: 1.6;
        }}
        .container {{ max-width: 1200px; margin: 0 auto; }}
        h1 {{ font-size: 28px; margin-bottom: 8px; }}
        h2 {{ font-size: 20px; margin: 24px 0 16px; padding-bottom: 8px; border-bottom: 2px solid var(--border); }}
        h3 {{ font-size: 16px; margin: 16px 0 8px; }}
        .timestamp {{ color: var(--text-muted); font-size: 14px; margin-bottom: 24px; }}

        .summary-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin: 24px 0;
        }}
        .stat-card {{
            background: var(--surface);
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            text-align: center;
        }}
        .stat-value {{ font-size: 36px; font-weight: 700; margin-bottom: 4px; }}
        .stat-label {{ font-size: 14px; color: var(--text-muted); }}
        .stat-card.pass .stat-value {{ color: var(--pass); }}
        .stat-card.warn .stat-value {{ color: var(--warn); }}
        .stat-card.fail .stat-value {{ color: var(--fail); }}

        .score-card {{
            background: var(--surface);
            padding: 24px;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            margin: 24px 0;
        }}
        .score {{
            font-size: 72px;
            font-weight: 700;
            text-align: center;
        }}
        .score.pass {{ color: var(--pass); }}
        .score.warn {{ color: var(--warn); }}
        .score.fail {{ color: var(--fail); }}

        table {{
            width: 100%;
            border-collapse: collapse;
            background: var(--surface);
            border-radius: 12px;
            overflow: hidden;
            margin: 16px 0;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }}
        th, td {{
            padding: 12px 16px;
            text-align: left;
            border-bottom: 1px solid var(--border);
        }}
        th {{ background: #f1f5f9; font-weight: 600; }}
        tr:hover {{ background: #f8fafc; }}
        .file {{ font-family: 'Fira Code', monospace; font-size: 13px; }}
        .issue {{ color: var(--text); }}
        .count {{ font-weight: 600; text-align: center; }}
        .severity {{
            display: inline-block;
            padding: 4px 12px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }}
        .severity.error {{ background: #fee2e2; color: var(--fail); }}
        .severity.warning {{ background: #fef3c7; color: var(--warn); }}

        .section {{ margin: 24px 0; }}
        .empty {{ text-align: center; padding: 48px; color: var(--text-muted); }}

        @media (max-width: 768px) {{
            body {{ padding: 16px; }}
            .summary-grid {{ grid-template-columns: 1fr; }}
            table {{ font-size: 14px; }}
            th, td {{ padding: 8px 12px; }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>🔍 Quality Scan Report</h1>
        <p class="timestamp">Generated: {timestamp}</p>
        <p><strong>Project:</strong> SaDec Marketing Hub</p>

        <div class="score-card">
            <h2 style="margin-top: 0;">Overall Quality Score</h2>
            <div class="score {score_class}">{score}/100</div>
            <p style="text-align: center; color: var(--text-muted); margin-top: 8px;">
                {'Excellent - Minor improvements needed' if score >= 80 else 'Good - Some improvements recommended' if score >= 60 else 'Needs attention - Multiple issues found'}
            </p>
        </div>

        <div class="summary-grid">
            <div class="stat-card {'pass' if self.results['summary']['total_files'] > 0 else 'fail'}">
                <div class="stat-value">{self.results['summary']['total_files']}</div>
                <div class="stat-label">Files Scanned</div>
            </div>
            <div class="stat-card {'pass' if self.results['summary']['broken_links_count'] == 0 else 'warn'}">
                <div class="stat-value">{self.results['summary']['broken_links_count']}</div>
                <div class="stat-label">Broken Link Issues</div>
            </div>
            <div class="stat-card {'pass' if self.results['summary']['missing_meta_count'] == 0 else 'warn'}">
                <div class="stat-value">{self.results['summary']['missing_meta_count']}</div>
                <div class="stat-label">Missing Meta Tags</div>
            </div>
            <div class="stat-card {'pass' if self.results['summary']['accessibility_issues_count'] == 0 else 'warn'}">
                <div class="stat-value">{self.results['summary']['accessibility_issues_count']}</div>
                <div class="stat-label">Accessibility Issues</div>
            </div>
        </div>

        <div class="section">
            <h2>🔗 Broken Links</h2>
            {self.generate_broken_links_table()}
        </div>

        <div class="section">
            <h2>🏷️ Missing Meta Tags</h2>
            {self.generate_meta_tags_table()}
        </div>

        <div class="section">
            <h2>♿ Accessibility Issues</h2>
            {self.generate_accessibility_table()}
        </div>

        <div class="section" style="margin-top: 48px; padding: 24px; background: var(--surface); border-radius: 12px;">
            <h3 style="margin-top: 0;">Recommendations</h3>
            <ul style="margin-left: 20px;">
                <li>Replace <code>href="#"</code> with proper navigation or button elements</li>
                <li>Move inline <code>onclick</code> handlers to external JavaScript files</li>
                <li>Ensure all pages have complete meta tags (title, description, og:*)</li>
                <li>Add <code>lang</code> attribute to all HTML pages</li>
                <li>Include skip links for keyboard navigation</li>
                <li>Add <code>alt</code> attributes to all images</li>
            </ul>
        </div>
    </div>
</body>
</html>'''
        return html

    def generate_broken_links_table(self):
        if not self.results['broken_links']:
            return '<p class="empty">No broken link issues found ✅</p>'

        rows = ''
        for item in self.results['broken_links']:
            severity_class = 'error' if item['severity'] == 'error' else 'warning'
            rows += f'''<tr>
                <td class="file">{item['file']}</td>
                <td class="issue">{item['issue']}</td>
                <td class="count">{item['count']}</td>
                <td><span class="severity {severity_class}">{item['severity']}</span></td>
            </tr>'''

        return f'''<table>
            <thead>
                <tr>
                    <th>File</th>
                    <th>Issue</th>
                    <th>Count</th>
                    <th>Severity</th>
                </tr>
            </thead>
            <tbody>{rows}</tbody>
        </table>'''

    def generate_meta_tags_table(self):
        if not self.results['missing_meta']:
            return '<p class="empty">No missing meta tags found ✅</p>'

        rows = ''
        for item in self.results['missing_meta']:
            severity_class = 'error' if item['severity'] == 'error' else 'warning'
            issues_html = '<br>'.join(item['issues'])
            rows += f'''<tr>
                <td class="file">{item['file']}</td>
                <td class="issue">{issues_html}</td>
                <td><span class="severity {severity_class}">{item['severity']}</span></td>
            </tr>'''

        return f'''<table>
            <thead>
                <tr>
                    <th>File</th>
                    <th>Missing Tags</th>
                    <th>Severity</th>
                </tr>
            </thead>
            <tbody>{rows}</tbody>
        </table>'''

    def generate_accessibility_table(self):
        if not self.results['accessibility_issues']:
            return '<p class="empty">No accessibility issues found ✅</p>'

        rows = ''
        for item in self.results['accessibility_issues']:
            severity_class = 'error' if item['severity'] == 'error' else 'warning'
            issues_html = '<br>'.join(item['issues'])
            rows += f'''<tr>
                <td class="file">{item['file']}</td>
                <td class="issue">{issues_html}</td>
                <td><span class="severity {severity_class}">{item['severity']}</span></td>
            </tr>'''

        return f'''<table>
            <thead>
                <tr>
                    <th>File</th>
                    <th>Issues</th>
                    <th>Severity</th>
                </tr>
            </thead>
            <tbody>{rows}</tbody>
        </table>'''

if __name__ == '__main__':
    scanner = QualityScanner()
    scanner.scan_all()

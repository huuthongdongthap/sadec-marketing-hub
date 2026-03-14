#!/usr/bin/env python3
"""
Comprehensive Audit Script — Sa Đéc Marketing Hub
Quét: Broken Links, Meta Tags, Accessibility Issues
"""

import os
import re
import sys
from pathlib import Path
from dataclasses import dataclass
from typing import List, Dict, Tuple

@dataclass
class Issue:
    file: str
    line: int
    type: str
    severity: str
    description: str
    suggestion: str

class ComprehensiveAudit:
    def __init__(self, root_dir: str):
        self.root_dir = Path(root_dir)
        self.issues: List[Issue] = []
        self.stats = {
            'files_scanned': 0,
            'broken_links': 0,
            'meta_issues': 0,
            'a11y_issues': 0,
        }
    
    def scan_html_files(self) -> List[Path]:
        """Tìm tất cả file HTML"""
        html_files = []
        for pattern in ['**/*.html', '**/*.htm']:
            html_files.extend(self.root_dir.glob(pattern))
        return html_files
    
    def check_broken_links(self, file: Path, content: str):
        """Kiểm tra broken links"""
        lines = content.split('\n')
        
        # Find all href and src attributes
        link_pattern = re.compile(r'(href|src)\s*=\s*["\']([^"\']+)["\']', re.IGNORECASE)
        
        for line_num, line in enumerate(lines, 1):
            matches = link_pattern.findall(line)
            for attr, link in matches:
                # Skip external links, anchors, and special protocols
                if link.startswith(('http', 'https', '#', 'tel:', 'mailto:', 'javascript:', 'data:')):
                    continue
                
                # Check internal links
                if not link.startswith('/') and not link.startswith('./') and not link.startswith('../'):
                    continue
                
                # Extract path without query params
                link_path = link.split('?')[0].split('#')[0]
                
                # Resolve relative path
                if link_path.startswith('/'):
                    target = self.root_dir / link_path.lstrip('/')
                else:
                    target = file.parent / link_path
                
                # Check if file exists
                if not target.exists() and not target.with_suffix('.html').exists():
                    # Check if it's a valid directory
                    if not target.is_dir():
                        self.issues.append(Issue(
                            file=str(file.relative_to(self.root_dir)),
                            line=line_num,
                            type='broken_link',
                            severity='high',
                            description=f'Link không tồn tại: {link}',
                            suggestion=f'Kiểm tra đường dẫn: {link}'
                        ))
                        self.stats['broken_links'] += 1
    
    def check_meta_tags(self, file: Path, content: str):
        """Kiểm tra meta tags"""
        lines = content.split('\n')
        
        # Required meta tags
        required_meta = {
            'title': False,
            'description': False,
            'viewport': False,
            'charset': False,
            'og:title': False,
            'og:description': False,
            'og:image': False,
            'og:url': False,
            'twitter:card': False,
        }
        
        # Check for presence
        for line in lines:
            line_lower = line.lower()
            if '<title>' in line_lower:
                required_meta['title'] = True
            if 'name="description"' in line_lower:
                required_meta['description'] = True
            if 'name="viewport"' in line_lower:
                required_meta['viewport'] = True
            if 'charset=' in line_lower:
                required_meta['charset'] = True
            if 'property="og:title"' in line_lower:
                required_meta['og:title'] = True
            if 'property="og:description"' in line_lower:
                required_meta['og:description'] = True
            if 'property="og:image"' in line_lower:
                required_meta['og:image'] = True
            if 'property="og:url"' in line_lower:
                required_meta['og:url'] = True
            if 'name="twitter:card"' in line_lower:
                required_meta['twitter:card'] = True
        
        # Report missing meta tags
        rel_path = str(file.relative_to(self.root_dir))
        if not required_meta['title']:
            self.issues.append(Issue(
                file=rel_path,
                line=1,
                type='missing_meta',
                severity='medium',
                description='Thiếu thẻ <title>',
                suggestion='Thêm <title>Mô tả trang</title>'
            ))
            self.stats['meta_issues'] += 1
        
        if not required_meta['description']:
            self.issues.append(Issue(
                file=rel_path,
                line=1,
                type='missing_meta',
                severity='medium',
                description='Thiếu meta description',
                suggestion='Thêm <meta name="description" content="...">'
            ))
            self.stats['meta_issues'] += 1
        
        if not required_meta['viewport']:
            self.issues.append(Issue(
                file=rel_path,
                line=1,
                type='missing_meta',
                severity='medium',
                description='Thiếu viewport meta tag',
                suggestion='Thêm <meta name="viewport" content="width=device-width, initial-scale=1.0">'
            ))
            self.stats['meta_issues'] += 1
    
    def check_accessibility(self, file: Path, content: str):
        """Kiểm tra accessibility issues"""
        lines = content.split('\n')
        rel_path = str(file.relative_to(self.root_dir))
        
        for line_num, line in enumerate(lines, 1):
            # Check for images without alt
            if '<img' in line.lower() and 'alt=' not in line.lower():
                self.issues.append(Issue(
                    file=rel_path,
                    line=line_num,
                    type='a11y',
                    severity='high',
                    description='Image thiếu alt attribute',
                    suggestion='Thêm alt="mô tả image"'
                ))
                self.stats['a11y_issues'] += 1
            
            # Check for buttons without aria-label or text
            if '<button' in line.lower():
                has_text = bool(re.search(r'<button[^>]*>.*?</button>', line, re.IGNORECASE | re.DOTALL))
                has_aria = 'aria-label=' in line.lower()
                has_title = 'title=' in line.lower()
                if not has_text and not has_aria and not has_title:
                    self.issues.append(Issue(
                        file=rel_path,
                        line=line_num,
                        type='a11y',
                        severity='medium',
                        description='Button không có text hoặc aria-label',
                        suggestion='Thêm text content hoặc aria-label'
                    ))
                    self.stats['a11y_issues'] += 1
            
            # Check for links without href
            if '<a ' in line.lower() and 'href=' not in line.lower():
                self.issues.append(Issue(
                    file=rel_path,
                    line=line_num,
                    type='a11y',
                    severity='medium',
                    description='Link thiếu href attribute',
                    suggestion='Thêm href="#" hoặc dùng button'
                ))
                self.stats['a11y_issues'] += 1
            
            # Check for form inputs without labels
            if '<input' in line.lower() and 'type="hidden"' not in line.lower():
                has_id = 'id=' in line.lower()
                has_aria = 'aria-label=' in line.lower() or 'aria-labelledby=' in line.lower()
                if not has_id and not has_aria:
                    self.issues.append(Issue(
                        file=rel_path,
                        line=line_num,
                        type='a11y',
                        severity='medium',
                        description='Input không có id hoặc aria-label',
                        suggestion='Thêm id và label, hoặc aria-label'
                    ))
                    self.stats['a11y_issues'] += 1
            
            # Check for lang attribute on html
            if line_num == 1 or line_num <= 3:
                if '<html' in line.lower() and 'lang=' not in line.lower():
                    self.issues.append(Issue(
                        file=rel_path,
                        line=line_num,
                        type='a11y',
                        severity='high',
                        description='HTML thiếu lang attribute',
                        suggestion='Thêm lang="vi" vào thẻ html'
                    ))
                    self.stats['a11y_issues'] += 1
    
    def run(self) -> Dict:
        """Chạy audit toàn diện"""
        html_files = self.scan_html_files()
        self.stats['files_scanned'] = len(html_files)
        
        for file in html_files:
            try:
                content = file.read_text(encoding='utf-8')
                self.check_broken_links(file, content)
                self.check_meta_tags(file, content)
                self.check_accessibility(file, content)
            except Exception as e:
                print(f"Error processing {file}: {e}")
        
        return {
            'stats': self.stats,
            'issues': self.issues,
            'summary': self.generate_summary()
        }
    
    def generate_summary(self) -> str:
        """Tạo summary report"""
        summary = []
        summary.append("=" * 60)
        summary.append("COMPREHENSIVE AUDIT REPORT — Sa Đéc Marketing Hub")
        summary.append("=" * 60)
        summary.append("")
        summary.append(f"Files scanned: {self.stats['files_scanned']}")
        summary.append("")
        summary.append("ISSUES BY TYPE:")
        summary.append(f"  Broken Links:    {self.stats['broken_links']}")
        summary.append(f"  Meta Issues:     {self.stats['meta_issues']}")
        summary.append(f"  A11y Issues:     {self.stats['a11y_issues']}")
        summary.append(f"  TOTAL:           {len(self.issues)}")
        summary.append("")
        
        # Group by severity
        high = len([i for i in self.issues if i.severity == 'high'])
        medium = len([i for i in self.issues if i.severity == 'medium'])
        low = len([i for i in self.issues if i.severity == 'low'])
        
        summary.append("ISSUES BY SEVERITY:")
        summary.append(f"  High:   {high}")
        summary.append(f"  Medium: {medium}")
        summary.append(f"  Low:    {low}")
        summary.append("")
        
        if self.issues:
            summary.append("DETAILED ISSUES:")
            summary.append("-" * 60)
            for issue in self.issues[:50]:  # First 50 issues
                summary.append(f"[{issue.severity.upper()}] {issue.file}:{issue.line}")
                summary.append(f"  Type: {issue.type}")
                summary.append(f"  Issue: {issue.description}")
                summary.append(f"  Fix: {issue.suggestion}")
                summary.append("")
        
        return "\n".join(summary)

if __name__ == '__main__':
    root = '/Users/mac/mekong-cli/apps/sadec-marketing-hub'
    audit = ComprehensiveAudit(root)
    result = audit.run()
    print(result['summary'])
    
    # Save detailed report
    report_file = Path(root) / 'reports' / 'audit' / 'comprehensive-audit-detailed.md'
    report_file.parent.mkdir(parents=True, exist_ok=True)
    
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write("# Comprehensive Audit Report\n\n")
        f.write(f"**Date:** {__import__('datetime').datetime.now().strftime('%Y-%m-%d')}\n\n")
        f.write("## Summary\n\n")
        f.write(f"- Files scanned: {result['stats']['files_scanned']}\n")
        f.write(f"- Broken links: {result['stats']['broken_links']}\n")
        f.write(f"- Meta issues: {result['stats']['meta_issues']}\n")
        f.write(f"- A11y issues: {result['stats']['a11y_issues']}\n\n")
        f.write("## Issues by Severity\n\n")
        high = len([i for i in result['issues'] if i.severity == 'high'])
        medium = len([i for i in result['issues'] if i.severity == 'medium'])
        low = len([i for i in result['issues'] if i.severity == 'low'])
        f.write(f"- High: {high}\n")
        f.write(f"- Medium: {medium}\n")
        f.write(f"- Low: {low}\n\n")
        
        f.write("## Detailed Issues\n\n")
        for issue in result['issues']:
            f.write(f"### [{issue.severity.upper()}] {issue.file}:{issue.line}\n\n")
            f.write(f"- **Type:** {issue.type}\n")
            f.write(f"- **Issue:** {issue.description}\n")
            f.write(f"- **Suggestion:** {issue.suggestion}\n\n")
    
    print(f"\nDetailed report saved to: {report_file}")

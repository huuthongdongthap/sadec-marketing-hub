#!/usr/bin/env python3
"""
==============================================================================
DEBUG CONSOLE ERRORS SCRIPT — Sa Đéc Marketing Hub
Quét console.log/error/warn trong production code
==============================================================================
"""

import os
import re
import json
from pathlib import Path
from collections import defaultdict

# Cấu hình
ROOT_DIR = Path(__file__).parent.parent
EXCLUDE_DIRS = {'node_modules', 'dist', '.git', '.vercel', 'playwright-report', 'tests'}
JS_FILES = []

# Kết quả
results = {
    'console_errors': [],
    'console_logs': [],
    'console_warns': [],
    'broken_imports': [],
    'summary': {}
}


def find_js_files():
    """Tìm tất cả JS files trong production code"""
    js_files = []
    for root, dirs, files in os.walk(ROOT_DIR):
        # Exclude directories
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]

        for file in files:
            if file.endswith('.js') or file.endswith('.ts'):
                filepath = Path(root) / file
                js_files.append(filepath)
    return js_files


def analyze_file(filepath):
    """Phân tích 1 file tìm console statements và broken imports"""
    issues = []

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            lines = content.split('\n')
    except Exception as e:
        return [], []

    rel_path = str(filepath.relative_to(ROOT_DIR))

    # Find console statements
    console_pattern = r'console\.(log|error|warn|debug)\s*\('

    for line_num, line in enumerate(lines, 1):
        match = re.search(console_pattern, line)
        if match:
            console_type = match.group(1)
            # Skip if it's in error handling context (acceptable)
            is_error_handling = any(keyword in line.lower() for keyword in ['catch', 'error:', 'failed', 'exception'])

            # Skip debug scripts
            is_debug_script = 'debug' in rel_path.lower() or 'audit' in rel_path.lower()

            issues.append({
                'file': rel_path,
                'line': line_num,
                'type': f'console_{console_type}',
                'content': line.strip()[:100],
                'severity': 'LOW' if console_type == 'log' else 'MEDIUM' if console_type == 'warn' else 'HIGH',
                'is_error_handling': is_error_handling,
                'is_debug_script': is_debug_script
            })

    # Find potentially broken imports
    import_issues = []
    import_pattern = r'(?:import|require)\s*\(?[\'"]([^\'"]+)[\'"]'

    for line_num, line in enumerate(lines, 1):
        if 'import' in line or 'require' in line:
            matches = re.findall(import_pattern, line)
            for import_path in matches:
                # Skip node_modules and external packages
                if not import_path.startswith('.') and not import_path.startswith('/'):
                    continue

                # Resolve relative path
                if import_path.startswith('/'):
                    target_path = ROOT_DIR / import_path[1:]
                else:
                    parent_dir = filepath.parent
                    target_path = (parent_dir / import_path).resolve()

                # Check if file exists (try common extensions)
                found = False
                for ext in ['', '.js', '.ts', '.mjs', '/index.js', '/index.ts']:
                    test_path = Path(str(target_path) + ext)
                    if test_path.exists():
                        found = True
                        break

                if not found and not import_path.startswith('./node_modules'):
                    import_issues.append({
                        'file': rel_path,
                        'line': line_num,
                        'type': 'broken_import',
                        'import_path': import_path,
                        'resolved_path': str(target_path),
                        'severity': 'HIGH'
                    })

    return issues, import_issues


def scan_files():
    """Quét tất cả JS files"""
    print(f"🔍 Tìm JS/TS files trong {ROOT_DIR}...")
    js_files = find_js_files()
    print(f"   Tìm thấy {len(js_files)} files")

    all_console_issues = []
    all_import_issues = []

    for filepath in js_files:
        console_issues, import_issues = analyze_file(filepath)
        all_console_issues.extend(console_issues)
        all_import_issues.extend(import_issues)

    return all_console_issues, all_import_issues, js_files


def print_report(console_issues, import_issues, js_files):
    """In báo cáo"""
    print("\n" + "="*80)
    print("🐛 DEBUG BUG SPRINT — SA ĐÉC MARKETING HUB")
    print("="*80)

    # Filter out debug scripts and error handling
    production_console_issues = [
        issue for issue in console_issues
        if not issue['is_debug_script'] and not issue['is_error_handling']
    ]

    # Summary
    print(f"\n📁 Total files scanned: {len(js_files)}")
    print(f"⚠️  Console statements (production): {len(production_console_issues)}")
    print(f"🔗 Broken imports: {len(import_issues)}")

    # Group by severity
    by_severity = defaultdict(list)
    for issue in production_console_issues:
        by_severity[issue['severity']].append(issue)
    for issue in import_issues:
        by_severity['HIGH'].append(issue)

    print(f"\n🔴 HIGH: {len(by_severity.get('HIGH', []))}")
    print(f"🟠 MEDIUM: {len(by_severity.get('MEDIUM', []))}")
    print(f"🟡 LOW: {len(by_severity.get('LOW', []))}")

    # Group by type
    by_type = defaultdict(list)
    for issue in production_console_issues:
        by_type[issue['type']].append(issue)

    print("\n" + "-"*80)
    print("📋 CONSOLE ISSUES BY TYPE:")
    print("-"*80)

    for issue_type, issue_list in sorted(by_type.items(), key=lambda x: -len(x[1])):
        print(f"\n  {issue_type}: {len(issue_list)} occurrences")
        # Show top 5 files
        files_count = defaultdict(int)
        for issue in issue_list:
            files_count[issue['file']] += 1

        for file, count in sorted(files_count.items(), key=lambda x: -x[1])[:5]:
            print(f"    - {file}: {count}")

    # Broken imports
    if import_issues:
        print("\n" + "-"*80)
        print("🔗 BROKEN IMPORTS:")
        print("-"*80)
        for issue in import_issues[:20]:
            print(f"  {issue['file']}:{issue['line']}")
            print(f"    → import \"{issue['import_path']}\"")
            print(f"    → resolved: {issue['resolved_path']}")
        if len(import_issues) > 20:
            print(f"  ... and {len(import_issues) - 20} more")

    # Top files with console issues
    top_files = defaultdict(int)
    for issue in production_console_issues:
        top_files[issue['file']] += 1

    print("\n" + "-"*80)
    print("🎯 TOP FILES WITH CONSOLE ISSUES:")
    print("-"*80)
    for file, count in sorted(top_files.items(), key=lambda x: -x[1])[:15]:
        print(f"  {file}: {count}")

    # Save to file
    report_data = {
        'files_scanned': len(js_files),
        'total_console_issues': len(production_console_issues),
        'total_broken_imports': len(import_issues),
        'by_severity': {k: len(v) for k, v in by_severity.items()},
        'console_issues': production_console_issues,
        'broken_imports': import_issues,
        'top_files': dict(sorted(top_files.items(), key=lambda x: -x[1])[:20])
    }

    report_path = ROOT_DIR / 'reports' / 'debug' / 'debug-console-report.json'
    report_path.parent.mkdir(parents=True, exist_ok=True)

    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(report_data, f, indent=2, ensure_ascii=False)

    print(f"\n💾 Report saved to: {report_path}")
    print("="*80)


if __name__ == '__main__':
    print("\n" + "="*80)
    print("🔍 DEBUG CONSOLE ERRORS SCRIPT")
    print("="*80)

    console_issues, import_issues, js_files = scan_files()
    print_report(console_issues, import_issues, js_files)

#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════════════════
TEST COVERAGE AUDIT — SADÉC MARKETING HUB
═══════════════════════════════════════════════════════════════════════════
Quét tất cả HTML files và so sánh với test coverage hiện có.
Phát hiện các trang chưa được test.
"""

import os
import re
import json
from pathlib import Path
from datetime import datetime

# Base directory
BASE_DIR = Path(__file__).parent.parent
TESTS_DIR = BASE_DIR / 'tests'

# Directories to scan for HTML files
HTML_DIRS = ['admin', 'portal', 'affiliate', 'auth', 'components', 'widgets']

# Known test files that cover pages
TEST_FILES = [
    'smoke-all-pages.spec.ts',
    'untested-pages.spec.ts',
    'remaining-pages-coverage.spec.ts',
    'untested-specialized-pages.spec.ts',
    'additional-pages-coverage.spec.ts',
    'additional-pages.spec.ts',
    'comprehensive-page-coverage.spec.ts',
    'auth-core-pages.spec.ts',
    'portal-core-pages.spec.ts',
    'admin-finance.spec.ts',
    'admin-hr-lms.spec.ts',
    'admin-inventory-pos.spec.ts',
    'admin-notifications.spec.ts',
    'admin-portal-affiliate.spec.ts',
    'admin-specialized-pages.spec.ts',
]


def extract_paths_from_test_file(test_path: Path) -> set:
    """Extract all page paths from a test file."""
    paths = set()
    try:
        content = test_path.read_text(encoding='utf-8')
        # Match patterns like: { path: '/admin/foo.html', name: '...' }
        # or: { path: '/admin/foo.html', name: "..." }
        matches = re.findall(r"path:\s*['\"]([^'\"]+)['\"]", content)
        for match in matches:
            paths.add(match.lstrip('/'))
    except Exception as e:
        print(f"  ⚠️  Error reading {test_path}: {e}")
    return paths


def find_all_html_files() -> dict:
    """Find all HTML files in the project."""
    html_files = {}

    for dir_name in HTML_DIRS:
        dir_path = BASE_DIR / dir_name
        if dir_path.exists():
            for html_file in dir_path.rglob('*.html'):
                rel_path = html_file.relative_to(BASE_DIR)
                # Get parent directory for categorization
                parts = rel_path.parts
                category = parts[0] if len(parts) > 1 else 'root'
                path_str = str(rel_path)
                html_files[path_str] = {
                    'full_path': str(html_file),
                    'category': category,
                    'filename': html_file.name,
                }

    # Also check root level HTML files
    for html_file in BASE_DIR.glob('*.html'):
        path_str = str(html_file.relative_to(BASE_DIR))
        html_files[path_str] = {
            'full_path': str(html_file),
            'category': 'root',
            'filename': html_file.name,
        }

    return html_files


def get_all_tested_paths() -> set:
    """Get all paths covered by test files."""
    all_tested_paths = set()

    for test_file in TEST_FILES:
        test_path = TESTS_DIR / test_file
        if test_path.exists():
            print(f"  📄 Scanning {test_file}...")
            paths = extract_paths_from_test_file(test_path)
            all_tested_paths.update(paths)
            print(f"     Found {len(paths)} paths")

    return all_tested_paths


def generate_report(html_files: dict, tested_paths: set) -> dict:
    """Generate coverage gap report."""
    report = {
        'total_html_files': len(html_files),
        'total_tested_paths': len(tested_paths),
        'covered': [],
        'untested': [],
        'by_category': {},
    }

    for path_str, info in html_files.items():
        # Normalize path (remove leading slash for comparison)
        normalized_path = path_str.lstrip('/')

        if normalized_path in tested_paths or path_str in tested_paths:
            report['covered'].append({
                'path': path_str,
                'category': info['category'],
            })
        else:
            report['untested'].append({
                'path': path_str,
                'category': info['category'],
                'filename': info['filename'],
            })

        # Group by category
        cat = info['category']
        if cat not in report['by_category']:
            report['by_category'][cat] = {'total': 0, 'covered': 0, 'untested': 0}
        report['by_category'][cat]['total'] += 1
        if normalized_path in tested_paths or path_str in tested_paths:
            report['by_category'][cat]['covered'] += 1
        else:
            report['by_category'][cat]['untested'] += 1

    return report


def print_report(report: dict):
    """Print formatted report."""
    print("\n" + "=" * 80)
    print("📊 TEST COVERAGE REPORT — SADÉC MARKETING HUB")
    print("=" * 80)
    print(f"\n📁 Total HTML Files: {report['total_html_files']}")
    print(f"✅ Covered by Tests: {len(report['covered'])}")
    print(f"❌ Untested: {len(report['untested'])}")

    coverage_pct = (len(report['covered']) / report['total_html_files'] * 100) if report['total_html_files'] > 0 else 0
    print(f"📈 Coverage: {coverage_pct:.1f}%")

    print("\n" + "-" * 80)
    print("📂 COVERAGE BY CATEGORY")
    print("-" * 80)
    for cat, stats in sorted(report['by_category'].items()):
        pct = (stats['covered'] / stats['total'] * 100) if stats['total'] > 0 else 0
        print(f"\n  {cat.upper()}:")
        print(f"    Total: {stats['total']} | Covered: {stats['covered']} | Untested: {stats['untested']}")
        print(f"    Coverage: {pct:.1f}%")

    if report['untested']:
        print("\n" + "-" * 80)
        print("❌ UNTESTED PAGES")
        print("-" * 80)
        for item in sorted(report['untested'], key=lambda x: x['path']):
            print(f"  - {item['path']}")

    print("\n" + "=" * 80)


def save_report(report: dict, output_path: Path):
    """Save report as JSON and Markdown."""
    # JSON report
    json_path = output_path.with_suffix('.json')
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    print(f"\n💾 JSON report saved to: {json_path}")

    # Markdown report
    md_path = output_path.with_suffix('.md')
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    with open(md_path, 'w', encoding='utf-8') as f:
        f.write("# Test Coverage Audit Report — Sa Đéc Marketing Hub\n\n")
        f.write(f"**Generated:** {timestamp}\n\n")
        f.write("---\n\n")

        f.write("## Summary\n\n")
        f.write(f"| Metric | Value |\n")
        f.write(f"|--------|-------|\n")
        f.write(f"| **Total HTML Files** | {report['total_html_files']} |\n")
        f.write(f"| **Covered by Tests** | {len(report['covered'])} |\n")
        f.write(f"| **Untested** | {len(report['untested'])} |\n")
        coverage_pct = (len(report['covered']) / report['total_html_files'] * 100) if report['total_html_files'] > 0 else 0
        f.write(f"| **Coverage** | {coverage_pct:.1f}% |\n\n")

        f.write("## Coverage by Category\n\n")
        for cat, stats in sorted(report['by_category'].items()):
            pct = (stats['covered'] / stats['total'] * 100) if stats['total'] > 0 else 0
            f.write(f"### {cat.upper()}\n\n")
            f.write(f"- Total: {stats['total']}\n")
            f.write(f"- Covered: {stats['covered']}\n")
            f.write(f"- Untested: {stats['untested']}\n")
            f.write(f"- Coverage: {pct:.1f}%\n\n")

        if report['untested']:
            f.write("## Untested Pages\n\n")
            f.write("| Path | Category | Filename |\n")
            f.write("|------|----------|----------|\n")
            for item in sorted(report['untested'], key=lambda x: x['path']):
                f.write(f"| `/{item['path']}` | {item['category']} | {item['filename']} |\n")
            f.write("\n")

        f.write("---\n\n")
        f.write("*Report generated by `audit-test-coverage.py`*\n")

    print(f"📝 Markdown report saved to: {md_path}")


def main():
    print("🔍 Starting Test Coverage Audit...\n")

    # Find all HTML files
    print("📂 Scanning for HTML files...")
    html_files = find_all_html_files()
    print(f"   Found {len(html_files)} HTML files\n")

    # Get all tested paths
    print("📄 Scanning test files for covered paths...")
    tested_paths = get_all_tested_paths()
    print(f"\n   Total unique tested paths: {len(tested_paths)}")

    # Generate report
    report = generate_report(html_files, tested_paths)

    # Print report
    print_report(report)

    # Save report
    reports_dir = BASE_DIR / 'reports' / 'test-coverage'
    reports_dir.mkdir(parents=True, exist_ok=True)
    output_path = reports_dir / f"coverage-audit-{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    save_report(report, output_path)

    print("\n✅ Audit complete!")


if __name__ == '__main__':
    main()

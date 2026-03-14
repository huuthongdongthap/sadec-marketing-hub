#!/usr/bin/env python3
"""
Tìm các HTML pages chưa được test trong sadec-marketing-hub
"""
import os
import re
from pathlib import Path

BASE_DIR = Path("/Users/mac/mekong-cli/apps/sadec-marketing-hub")
TESTS_DIR = BASE_DIR / "tests"

# Tìm tất cả HTML files (loại bỏ dist/, node_modules, .git)
def find_all_html_files():
    html_files = set()
    for root, dirs, files in os.walk(BASE_DIR):
        # Skip excluded directories
        if any(ex in root for ex in ['node_modules', '.git', 'dist', '.pytest_cache', 'SOURCES']):
            continue
        for file in files:
            if file.endswith('.html'):
                full_path = Path(root) / file
                rel_path = full_path.relative_to(BASE_DIR)
                html_files.add(str(rel_path))
    return sorted(html_files)

# Tìm các paths được test trong test files
def find_tested_paths():
    tested_paths = set()

    for test_file in TESTS_DIR.glob("**/*.spec.ts"):
        content = test_file.read_text()
        # Tìm tất cả các page.goto và test.goto calls
        matches = re.findall(r'goto\([\'"]([^\'"]+)[\'"]', content)
        for match in matches:
            if match.startswith('/'):
                # Chuyển đổi từ path bắt đầu bằng / sang relative path
                tested_paths.add(match.lstrip('/'))

    # Also check .js test files
    for test_file in TESTS_DIR.glob("**/*.test.ts"):
        content = test_file.read_text()
        matches = re.findall(r'goto\([\'"]([^\'"]+)[\'"]', content)
        for match in matches:
            if match.startswith('/'):
                tested_paths.add(match.lstrip('/'))

    return tested_paths

# Main
if __name__ == "__main__":
    all_html = find_all_html_files()
    tested = find_tested_paths()

    print(f"\n{'='*60}")
    print(f"TẤT CẢ HTML FILES: {len(all_html)}")
    print(f"{'='*60}")
    for h in all_html:
        print(f"  {h}")

    print(f"\n{'='*60}")
    print(f"TESTED PATHS: {len(tested)}")
    print(f"{'='*60}")
    for t in sorted(tested):
        print(f"  {t}")

    # Tìm untested pages
    untested = []
    for html in all_html:
        # Kiểm tra xem path có được test không (với hoặc không có leading slash)
        html_no_leading = html.lstrip('/')
        if html_no_leading not in tested and html not in tested:
            # Also check without ./ prefix
            if html.startswith('./') and html[2:] not in tested:
                untested.append(html)
            elif not html.startswith('./'):
                untested.append(html)

    print(f"\n{'='*60}")
    print(f"UNTESTED PAGES: {len(untested)}")
    print(f"{'='*60}")

    if untested:
        for u in untested:
            print(f"  ❌ {u}")
    else:
        print("  ✅ TẤT CẢ PAGES ĐÃ CÓ TEST!")

    # Export untested list for test file generation
    print(f"\n{'='*60}")
    print("DANH SÁCH UNTESTED (JSON format):")
    print(f"{'='*60}")
    untested_with_names = []
    for u in untested:
        name = Path(u).stem.replace('-', ' ').replace('_', ' ').title()
        untested_with_names.append(f'    {{ path: \"/{u}\", name: \"{name}\" }}')

    print("[\n" + ",\n".join(untested_with_names) + "\n]")

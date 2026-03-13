#!/usr/bin/env python3
"""
Phân tích test coverage cho sadec-marketing-hub
Tìm các HTML pages chưa được coverage trong tests
"""

import os
import re
from pathlib import Path
from typing import Set, Dict, List

BASE_DIR = Path("/Users/mac/mekong-cli/apps/sadec-marketing-hub")
TESTS_DIR = BASE_DIR / "tests"

def find_all_html_pages() -> Dict[str, List[str]]:
    """Tìm tất cả HTML files trong project"""
    pages = {
        "root": [],
        "admin": [],
        "portal": [],
        "affiliate": [],
        "auth": [],
        "components": [],
        "widgets": [],
    }

    # Root level HTML files
    for f in BASE_DIR.glob("*.html"):
        pages["root"].append(f"/{f.name}")

    # Subdirectories
    for subdir in ["admin", "portal", "affiliate", "auth"]:
        dir_path = BASE_DIR / subdir
        if dir_path.exists():
            # Level 1
            for f in dir_path.glob("*.html"):
                pages[subdir].append(f"/{subdir}/{f.name}")
            # Level 2 (components, widgets, etc.)
            for subsub in dir_path.iterdir():
                if subsub.is_dir():
                    for f in subsub.glob("*.html"):
                        pages["components"].append(f"/{subdir}/{subsub.name}/{f.name}")

    return pages

def extract_tested_pages_from_file(filepath: Path) -> Set[str]:
    """Trích xuất các page paths từ test file"""
    content = filepath.read_text()
    paths = set()

    # Pattern 1: { path: '/admin/xxx.html', ... }
    pattern1 = r"['\"]path['\"]\s*:\s*['\"]([^'\"]+)['\"]"
    for match in re.finditer(pattern1, content):
        paths.add(match.group(1))

    # Pattern 2: path: '/xxx/yyy.html'
    pattern2 = r"path:\s*['\"]([^'\"]+)['\"]"
    for match in re.finditer(pattern2, content):
        paths.add(match.group(1))

    # Pattern 3: goto('/xxx/yyy.html')
    pattern3 = r"goto\(\s*['\"]([^'\"]+)['\"]"
    for match in re.finditer(pattern3, content):
        paths.add(match.group(1))

    # Pattern 4: request.get('/xxx/yyy.html')
    pattern4 = r"request\.get\(\s*['\"]([^'\"]+)['\"]"
    for match in re.finditer(pattern4, content):
        paths.add(match.group(1))

    return paths

def find_all_tested_pages() -> Set[str]:
    """Tìm tất cả pages đã được test"""
    all_tested = set()

    for test_file in TESTS_DIR.glob("*.ts"):
        tested = extract_tested_pages_from_file(test_file)
        all_tested.update(tested)

    for test_file in TESTS_DIR.glob("*.js"):
        tested = extract_tested_pages_from_file(test_file)
        all_tested.update(tested)

    # Also check e2e subdirectory
    e2e_dir = TESTS_DIR / "e2e"
    if e2e_dir.exists():
        for test_file in e2e_dir.glob("*.ts"):
            tested = extract_tested_pages_from_file(test_file)
            all_tested.update(tested)

    return all_tested

def categorize_path(path: str) -> str:
    """Phân loại path theo category"""
    if path.startswith("/admin/"):
        if "/components/" in path or "/widgets/" in path:
            return "admin_subdirs"
        return "admin"
    elif path.startswith("/portal/"):
        return "portal"
    elif path.startswith("/affiliate/"):
        return "affiliate"
    elif path.startswith("/auth/"):
        return "auth"
    elif path == "/" or path == "/index.html":
        return "root"
    else:
        return "root"

def main():
    print("=" * 70)
    print("PHÂN TÍCH TEST COVERAGE - SADÉC MARKETING HUB")
    print("=" * 70)

    # Tìm tất cả HTML pages
    all_pages = find_all_html_pages()

    total_pages = 0
    pages_by_category = {}
    for cat, pages in all_pages.items():
        if pages:
            pages_by_category[cat] = sorted(pages)
            total_pages += len(pages)
            print(f"\n{cat.upper()}: {len(pages)} pages")
            for p in sorted(pages):
                print(f"  {p}")

    print(f"\n{'=' * 70}")
    print(f"TỔNG CỘNG: {total_pages} HTML pages")
    print(f"{'=' * 70}")

    # Tìm tất cả tested pages
    tested_pages = find_all_tested_pages()
    print(f"\nĐÃ TEST: {len(tested_pages)} pages")

    # Flatten all pages for comparison
    all_page_paths = set()
    for pages in all_pages.values():
        all_page_paths.update(pages)

    # Tìm untested pages
    untested = all_page_paths - tested_pages

    print(f"\nCHƯA TEST: {len(untested)} pages")
    if untested:
        print("\nCác pages chưa được coverage:")
        for cat in ["admin", "portal", "affiliate", "auth", "admin_subdirs", "root"]:
            cat_untested = [p for p in untested if categorize_path(p) == cat]
            if cat_untested:
                print(f"\  [{cat.upper()}] {len(cat_untested)} pages:")
                for p in sorted(cat_untested):
                    print(f"    {p}")

    # Coverage percentage
    if total_pages > 0:
        coverage = (len(tested_pages) / total_pages) * 100
        print(f"\n{'=' * 70}")
        print(f"COVERAGE: {coverage:.1f}% ({len(tested_pages)}/{total_pages})")
        print(f"{'=' * 70}")

    # Generate test file template for untested pages
    if untested:
        print("\n\n" + "=" * 70)
        print("TEMPLATE TEST CHO UNTESSED PAGES")
        print("=" * 70)

        admin_untested = [p for p in untested if categorize_path(p) in ["admin", "admin_subdirs"]]
        portal_untested = [p for p in untested if categorize_path(p) == "portal"]
        other_untested = [p for p in untested if categorize_path(p) not in ["admin", "admin_subdirs", "portal"]]

        print(f"\n// Admin pages ({len(admin_untested)} pages)")
        for p in sorted(admin_untested):
            name = p.replace("/admin/", "").replace(".html", "").replace("/", " - ").replace("-", " ").title()
            print(f"  {{ path: '{p}', name: 'Admin {name}' }},")

        print(f"\n// Portal pages ({len(portal_untested)} pages)")
        for p in sorted(portal_untested):
            name = p.replace("/portal/", "").replace(".html", "").replace("/", " - ").replace("-", " ").title()
            print(f"  {{ path: '{p}', name: 'Portal {name}' }},")

        if other_untested:
            print(f"\n// Other pages ({len(other_untested)} pages)")
            for p in sorted(other_untested):
                name = p.strip("/").replace(".html", "").replace("/", " - ").replace("-", " ").title()
                print(f"  {{ path: '{p}', name: '{name}' }},")

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Kiểm tra test coverage thực tế - chạy tests và báo cáo
"""

import subprocess
import json
from pathlib import Path

BASE_DIR = Path("/Users/mac/mekong-cli/apps/sadec-marketing-hub")

def run_playwright_list():
    """Chạy playwright test --list và parse kết quả"""
    result = subprocess.run(
        ["npx", "playwright", "test", "--list"],
        cwd=BASE_DIR,
        capture_output=True,
        text=True
    )

    tests = []
    for line in result.stdout.split("\n"):
        if "[chromium]" in line and "›" in line:
            # Parse test name
            parts = line.split("›")
            if len(parts) >= 2:
                test_name = parts[-1].strip()
                tests.append(test_name)

    return tests

def analyze_coverage():
    """Phân tích coverage"""
    tests = run_playwright_list()

    print(f"Tổng số test cases: {len(tests)}")

    # Đếm tests theo category
    categories = {
        "admin": 0,
        "portal": 0,
        "affiliate": 0,
        "auth": 0,
        "root": 0,
        "components": 0,
        "widgets": 0,
        "utils": 0,
        "responsive": 0,
        "accessibility": 0,
        "seo": 0,
        "payment": 0,
        "roiaas": 0,
    }

    for test in tests:
        test_lower = test.lower()
        if "/admin/" in test_lower or "admin" in test_lower:
            categories["admin"] += 1
        if "/portal/" in test_lower or "portal" in test_lower:
            categories["portal"] += 1
        if "/affiliate/" in test_lower or "affiliate" in test_lower:
            categories["affiliate"] += 1
        if "auth" in test_lower or "login" in test_lower:
            categories["auth"] += 1
        if "component" in test_lower:
            categories["components"] += 1
        if "widget" in test_lower:
            categories["widgets"] += 1
        if "util" in test_lower or "format" in test_lower:
            categories["utils"] += 1
        if "responsive" in test_lower or "mobile" in test_lower or "desktop" in test_lower:
            categories["responsive"] += 1
        if "access" in test_lower or "a11y" in test_lower:
            categories["accessibility"] += 1
        if "seo" in test_lower or "meta" in test_lower or "title" in test_lower:
            categories["seo"] += 1
        if "payment" in test_lower or "payos" in test_lower:
            categories["payment"] += 1
        if "roiaas" in test_lower or "roi" in test_lower:
            categories["roiaas"] += 1
        if "homepage" in test_lower or "root" in test_lower or test_lower.startswith("/"):
            categories["root"] += 1

    print("\nCoverage theo category:")
    for cat, count in sorted(categories.items(), key=lambda x: -x[1]):
        if count > 0:
            print(f"  {cat}: {count} tests")

    return categories

if __name__ == "__main__":
    analyze_coverage()

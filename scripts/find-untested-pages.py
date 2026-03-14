#!/usr/bin/env python3
"""Find untested HTML pages in sadec-marketing-hub"""

import os
import re
from pathlib import Path

BASE_DIR = Path("/Users/mac/mekong-cli/apps/sadec-marketing-hub")
ADMIN_DIR = BASE_DIR / "admin"
TESTS_DIR = BASE_DIR / "tests" / "e2e"

# Get all admin HTML files
admin_pages = set()
for f in ADMIN_DIR.glob("*.html"):
    admin_pages.add(f.name)

# Get tested pages from test files
tested_pages = set()
for test_file in TESTS_DIR.glob("*.spec.js"):
    content = test_file.read_text()
    # Find all /admin/*.html references
    matches = re.findall(r"['\"](/admin/[^'\"]+)['\"]", content)
    for match in matches:
        page = match.replace("/admin/", "")
        tested_pages.add(page)

print(f"Total admin pages: {len(admin_pages)}")
print(f"Tested pages: {len(tested_pages)}")
print(f"Untested pages: {len(admin_pages) - len(tested_pages)}\n")

untested = sorted(admin_pages - tested_pages)
print("Untested pages:")
for page in untested:
    print(f"  - {page}")

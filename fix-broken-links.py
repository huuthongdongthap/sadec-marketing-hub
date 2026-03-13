#!/usr/bin/env python3
"""
Fix broken links in sadec-marketing-hub HTML files.
Convert relative paths like ../assets/ to root-relative /assets/
"""

import os
import re
from pathlib import Path

BASE_DIR = Path("/Users/mac/.gemini/antigravity/scratch/sadec-marketing-hub")
EXCLUDE_DIRS = {'node_modules', '.git', '.vercel', '.wrangler', '.pytest_cache', '.cto-reports'}

# Patterns to fix - convert ../ prefix to / for root-level directories
ROOT_LEVEL_DIRS = ['assets', 'supabase-config.js', 'auth.js', 'favicon.png', 'index.html', 'portal', 'admin', 'affiliate']

# Regex patterns for HTML attributes
HREF_PATTERN = re.compile(r'href=["\'](\.\./[^"\']+)["\']', re.IGNORECASE)
SRC_PATTERN = re.compile(r'src=["\'](\.\./[^"\']+)["\']', re.IGNORECASE)


def should_fix_to_root(path: str) -> bool:
    """Check if path should be converted to root-relative"""
    # Extract first path segment
    clean_path = path.lstrip('../')
    first_segment = clean_path.split('/')[0]

    # Check if it points to a root-level directory/file
    return first_segment in ROOT_LEVEL_DIRS or (BASE_DIR / first_segment).exists()


def fix_path(path: str) -> str:
    """Convert ../path to /path for root-level resources"""
    if not path.startswith('../'):
        return path

    clean_path = path.lstrip('../')
    return f"/{clean_path}"


def fix_html_file(filepath: Path) -> tuple[int, int]:
    """Fix broken links in a single HTML file. Returns (href_count, src_count)"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content
        href_count = 0
        src_count = 0

        # Fix href attributes
        def fix_href(match):
            nonlocal href_count
            path = match.group(1)
            if should_fix_to_root(path):
                href_count += 1
                return f'href="{fix_path(path)}"'
            return match.group(0)

        content = HREF_PATTERN.sub(fix_href, content)

        # Fix src attributes
        def fix_src(match):
            nonlocal src_count
            path = match.group(1)
            if should_fix_to_root(path):
                src_count += 1
                return f'src="{fix_path(path)}"'
            return match.group(0)

        content = SRC_PATTERN.sub(fix_src, content)

        # Write back if changed
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)

        return href_count, src_count

    except Exception as e:
        print(f"  ⚠️  Error processing {filepath}: {e}")
        return 0, 0


def scan_and_fix():
    """Scan all HTML files and fix broken links"""
    total_href = 0
    total_src = 0
    files_fixed = 0

    html_files = []
    for root, dirs, files in os.walk(BASE_DIR):
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        for f in files:
            if f.endswith('.html'):
                html_files.append(os.path.join(root, f))

    print(f"🔧 Processing {len(html_files)} HTML files...\n")

    for filepath in html_files:
        href_count, src_count = fix_html_file(Path(filepath))
        if href_count + src_count > 0:
            rel_path = os.path.relpath(filepath, BASE_DIR)
            print(f"  ✅ {rel_path}: {href_count} href + {src_count} src")
            total_href += href_count
            total_src += src_count
            files_fixed += 1

    print(f"\n{'='*60}")
    print(f"📊 KẾT QUẢ SỬA LINK:")
    print(f"   • Files đã sửa: {files_fixed}")
    print(f"   • href fixes: {total_href}")
    print(f"   • src fixes: {total_src}")
    print(f"   • Tổng cộng: {total_href + total_src} links")
    print(f"{'='*60}")

    return files_fixed, total_href + total_src


if __name__ == '__main__':
    scan_and_fix()

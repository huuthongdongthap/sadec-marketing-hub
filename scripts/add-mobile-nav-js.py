#!/usr/bin/env python3
"""
Add mobile-navigation.js to all HTML files
"""

import os
import re

BASE_DIR = "/Users/mac/.gemini/antigravity/scratch/sadec-marketing-hub"
EXCLUDE_PATTERNS = ["node_modules", "playwright-report", ".git", ".vercel"]

def add_mobile_nav_js(file_path: str) -> tuple[bool, str]:
    """Thêm mobile-navigation.js vào file HTML"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Kiểm tra đã có mobile-navigation.js chưa
        if 'mobile-navigation.js' in content:
            return False, "Đã có mobile-navigation.js"

        # Tìm vị trí chèn (trước </body>)
        body_close = content.rfind('</body>')
        if body_close == -1:
            return False, "Không tìm thấy </body>"

        # Xác định path relative
        depth = file_path.count('/') - BASE_DIR.count('/') - 1
        relative_path = '../' * depth if depth > 0 else ''

        new_script = f'''
  <!-- Mobile Navigation -->
  <script src="{relative_path}assets/js/mobile-navigation.js" defer></script>
'''

        content = content[:body_close] + new_script + content[body_close:]

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

        return True, "Đã thêm mobile-navigation.js"

    except Exception as e:
        return False, f"Lỗi: {str(e)}"


def should_exclude(path: str) -> bool:
    return any(pattern in path for pattern in EXCLUDE_PATTERNS)


def main():
    html_files = []
    for root, dirs, files in os.walk(BASE_DIR):
        dirs[:] = [d for d in dirs if not should_exclude(d)]
        for file in files:
            if file.endswith('.html') and not should_exclude(root):
                html_files.append(os.path.join(root, file))

    print(f"Tìm thấy {len(html_files)} file HTML")
    print("=" * 60)

    added_count = 0
    for file_path in sorted(html_files):
        success, message = add_mobile_nav_js(file_path)
        rel_path = file_path.replace(BASE_DIR + '/', '')[:55]

        if success:
            added_count += 1
            print(f"✅ {rel_path}")
        else:
            print(f"⏭️  {rel_path} - {message}")

    print("=" * 60)
    print(f"Đã thêm: {added_count}/{len(html_files)} files")


if __name__ == "__main__":
    main()

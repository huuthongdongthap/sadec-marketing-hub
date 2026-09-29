#!/usr/bin/env python3
"""
Add responsive-enhancements.css to all HTML files
"""

import os
import re

BASE_DIR = "/Users/mac/.gemini/antigravity/scratch/sadec-marketing-hub"
EXCLUDE_PATTERNS = ["node_modules", "playwright-report", ".git", ".vercel"]

def add_responsive_css(file_path: str) -> tuple[bool, str]:
    """Thêm responsive-enhancements.css vào file HTML"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Kiểm tra đã có responsive-enhancements.css chưa
        if 'responsive-enhancements.css' in content:
            return False, "Đã có responsive-enhancements.css"

        # Tìm vị trí chèn (sau các link CSS khác trong head)
        # Tìm tất cả các link rel="stylesheet"
        stylesheet_links = list(re.finditer(r'<link[^>]*rel="stylesheet"[^>]*>', content))

        if stylesheet_links:
            # Chèn sau link stylesheet cuối cùng
            last_link = stylesheet_links[-1]
            insert_pos = last_link.end()

            # Tìm vị trí closing tag hoặc newline sau đó
            next_newline = content.find('\n', insert_pos)
            if next_newline != -1:
                insert_pos = next_newline + 1

            new_css_link = f'\n  <link rel="stylesheet" href="../assets/css/responsive-enhancements.css">'

            # Nếu path là root file (không trong subfolder)
            if file_path.count('/') == BASE_DIR.count('/') + 1:
                new_css_link = f'\n  <link rel="stylesheet" href="assets/css/responsive-enhancements.css">'

            content = content[:insert_pos] + new_css_link + content[insert_pos:]

            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)

            return True, "Đã thêm responsive-enhancements.css"

        return False, "Không tìm thấy stylesheet links"

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
        success, message = add_responsive_css(file_path)
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

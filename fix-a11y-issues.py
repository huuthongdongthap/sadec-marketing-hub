#!/usr/bin/env python3
"""
Fix accessibility and meta tag issues in sadec-marketing-hub HTML files.
"""

import os
import re
from pathlib import Path

BASE_DIR = Path("/Users/mac/mekong-cli/apps/sadec-marketing-hub")
EXCLUDE_DIRS = {'node_modules', '.git', '.vercel', '.wrangler', '.pytest_cache', '.cto-reports', 'dist'}

# Meta tag to add after <head>
META_TAGS_TEMPLATE = """
  <!-- Meta Tags -->
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Sa Đéc Marketing Hub - Quản trị marketing hiệu quả">
"""

def add_meta_tags(filepath: Path) -> int:
    """Add missing meta tags to HTML file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        changes = 0

        # Check and add charset
        if not re.search(r'<meta\s+charset', content, re.IGNORECASE):
            # Find <head> tag
            head_match = re.search(r'<head[^>]*>', content, re.IGNORECASE)
            if head_match:
                insert_pos = head_match.end()
                content = content[:insert_pos] + '\n  <meta charset="UTF-8">' + content[insert_pos:]
                changes += 1

        # Check and add viewport
        if not re.search(r'<meta\s+name=["\']viewport["\']', content, re.IGNORECASE):
            head_match = re.search(r'<head[^>]*>', content, re.IGNORECASE)
            if head_match:
                insert_pos = head_match.end()
                content = content[:insert_pos] + '\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">' + content[insert_pos:]
                changes += 1

        # Check and add lang to html
        if not re.search(r'<html[^>]*\s+lang=["\']', content, re.IGNORECASE):
            content = re.sub(r'<html(\s)', r'<html\1lang="vi"', content, count=1, flags=re.IGNORECASE)
            changes += 1

        if changes > 0:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)

        return changes

    except Exception as e:
        print(f"  ⚠️ Error processing {filepath}: {e}")
        return 0


def fix_button_labels(filepath: Path) -> int:
    """Add aria-label to icon buttons"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original = content
        changes = 0

        # Fix buttons with material icons but no aria-label
        # Pattern: <button...><span class="material-symbols...">icon</span></button>
        button_pattern = re.compile(
            r'<button([^>]*)>(\s*<span\s+class="material-symbols[^"]*"[^>]*>[^<]+</span>\s*)</button>',
            re.IGNORECASE
        )

        def add_aria_label(match):
            nonlocal changes
            attrs, icon_content = match.groups()

            # Skip if already has aria-label
            if 'aria-label' in attrs:
                return match.group(0)

            # Extract icon name
            icon_name = re.search(r'>([^<]+)<', icon_content)
            if icon_name:
                icon_text = icon_name.group(1).strip()
                # Add aria-label
                new_attrs = attrs + f' aria-label="{icon_text}" title="{icon_text}"'
                changes += 1
                return f'<button{new_attrs}>{icon_content}</button>'
            return match.group(0)

        content = button_pattern.sub(add_aria_label, content)

        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)

        return changes

    except Exception as e:
        return 0


def fix_anchor_labels(filepath: Path) -> int:
    """Add aria-label to anchor links"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original = content
        changes = 0

        # Fix anchor links with # href but no aria-label
        pattern = re.compile(r'<a([^>]*href=["\']#[^"\']*["\'][^>]*)>([^<]*(?:<[^/][^<]*)*)</a>', re.IGNORECASE)

        def add_label(match):
            nonlocal changes
            attrs, link_text = match.groups()

            if 'aria-label' not in attrs:
                # Use link text or generic label
                label = link_text.strip() if link_text.strip() else 'Link'
                new_attrs = attrs + f' aria-label="{label}"'
                changes += 1
                return f'<a{new_attrs}>{link_text}</a>'
            return match.group(0)

        content = pattern.sub(add_label, content)

        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)

        return changes

    except Exception as e:
        return 0


def scan_and_fix():
    """Scan all HTML files and fix issues"""
    total_meta = 0
    total_buttons = 0
    total_anchors = 0
    files_processed = 0

    html_files = []
    for root, dirs, files in os.walk(BASE_DIR):
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        for f in files:
            if f.endswith('.html'):
                html_files.append(Path(root) / f)

    print(f"🔧 Fixing {len(html_files)} HTML files...\n")

    for filepath in html_files:
        rel_path = filepath.relative_to(BASE_DIR)

        meta_changes = add_meta_tags(filepath)
        button_changes = fix_button_labels(filepath)
        anchor_changes = fix_anchor_labels(filepath)

        if meta_changes + button_changes + anchor_changes > 0:
            files_processed += 1
            total_meta += meta_changes
            total_buttons += button_changes
            total_anchors += anchor_changes
            print(f"  ✅ {rel_path}: {meta_changes} meta + {button_changes} buttons + {anchor_changes} anchors")

    print(f"\n{'='*60}")
    print(f"📊 KẾT QUẢ SỬA:")
    print(f"   • Files đã sửa: {files_processed}")
    print(f"   • Meta tag fixes: {total_meta}")
    print(f"   • Button aria-labels: {total_buttons}")
    print(f"   • Anchor aria-labels: {total_anchors}")
    print(f"   • Tổng cộng: {total_meta + total_buttons + total_anchors} fixes")
    print(f"{'='*60}")


if __name__ == '__main__':
    scan_and_fix()

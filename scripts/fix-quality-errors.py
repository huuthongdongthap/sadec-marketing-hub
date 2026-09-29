#!/usr/bin/env python3
"""
Fix quality errors: Add lang="vi", viewport meta, and <title> tags
Sa Đéc Marketing Hub - Quality Fix Script
"""

import os
import re
from pathlib import Path

ROOT = Path(__file__).parent.parent
EXCLUDE_DIRS = {'node_modules', 'dist', 'reports', 'playwright-report', 'test-results', '.git'}

def fix_file(file_path):
    """Fix a single HTML file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original = content
        fixes = []

        # Check if file has valid HTML structure
        has_doctype = '<!DOCTYPE html>' in content
        has_html = '<html' in content
        has_head = '<head>' in content
        has_viewport = bool(re.search(r'<meta[^>]*name=["\']?viewport', content, re.IGNORECASE))
        has_title = bool(re.search(r'<title>.*?</title>', content, re.IGNORECASE))
        has_lang = bool(re.search(r'<html[^>]*lang=', content, re.IGNORECASE))

        # Extract filename for default title
        filename = file_path.stem
        default_title = filename.replace('-', ' ').title()

        # Case 1: File has no HTML structure at all (no <html>, no <head>)
        if not has_html and not has_head:
            # Wrap content in proper HTML structure
            viewport_meta = '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
            title_tag = f'  <title>{default_title} - Mekong Agency</title>\n'

            # Find where content starts (skip leading whitespace/comments)
            content_start = 0
            for i, line in enumerate(content.split('\n')):
                if line.strip() and not line.strip().startswith('<!--'):
                    break
                content_start += len(line) + 1

            # Build new content with proper structure
            new_content = f'''<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
{viewport_meta}{title_tag}</head>
<body>
{content}
</body>
</html>'''
            content = new_content
            fixes.extend(['Added HTML structure', 'Added lang="vi"', 'Added viewport meta', 'Added <title> tag'])

        # Case 2: File has HTML structure but missing elements
        else:
            # Fix 1: Add lang="vi" to <html> tag
            if not has_lang:
                if has_html:
                    content = re.sub(r'<html(\s)', r'<html lang="vi"\1', content, count=1, flags=re.IGNORECASE)
                else:
                    content = re.sub(r'<!DOCTYPE html>', '<!DOCTYPE html>\n<html lang="vi">', content, count=1, flags=re.IGNORECASE)
                fixes.append('Added lang="vi"')

            # Fix 2: Add viewport meta if missing
            if not has_viewport:
                viewport_tag = '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  '
                if has_head:
                    content = content.replace('<head>', f'<head>\n{viewport_tag}', 1)
                fixes.append('Added viewport meta')

            # Fix 3: Add <title> if missing
            if not has_title:
                title_tag = f'  <title>{default_title} - Mekong Agency</title>\n  '
                if has_head:
                    content = content.replace('<head>', f'<head>\n{title_tag}', 1)
                fixes.append('Added <title> tag')

        # Write back if changed
        if content != original:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return fixes
        return []

    except Exception as e:
        return [f'Error: {e}']

def main():
    print("=" * 70)
    print("SA ĐÉC MARKETING HUB - QUALITY FIX")
    print("Auto-fix: lang, viewport, title")
    print("=" * 70)

    fixed_files = []
    total_fixes = {'lang': 0, 'viewport': 0, 'title': 0}

    for root, dirs, files in os.walk(ROOT):
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]

        for file in files:
            if file.endswith('.html') and file not in ['seo-head.html']:
                file_path = Path(root) / file
                fixes = fix_file(file_path)

                if fixes:
                    fixed_files.append((file_path, fixes))
                    for fix in fixes:
                        if 'lang' in fix.lower():
                            total_fixes['lang'] += 1
                        if 'viewport' in fix.lower():
                            total_fixes['viewport'] += 1
                        if 'title' in fix.lower():
                            total_fixes['title'] += 1

    # Summary
    print(f"\n✅ SUMMARY")
    print(f"{'='*70}")
    print(f"Files fixed: {len(fixed_files)}")
    print(f"  - lang=\"vi\" added: {total_fixes['lang']} files")
    print(f"  - viewport meta added: {total_fixes['viewport']} files")
    print(f"  - <title> tag added: {total_fixes['title']} files")

    if fixed_files:
        print(f"\n📄 FILES MODIFIED:")
        for path, fixes in fixed_files[:20]:
            rel_path = path.relative_to(ROOT)
            print(f"  - {rel_path}: {', '.join(fixes)}")
        if len(fixed_files) > 20:
            print(f"  ... and {len(fixed_files) - 20} more files")

if __name__ == '__main__':
    main()

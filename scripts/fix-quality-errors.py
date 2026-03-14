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

        # Fix 1: Add lang="vi" to <html> tag
        if re.search(r'<html(?![^>]*\s+lang=)', content, re.IGNORECASE):
            content = re.sub(r'<html\s*', '<html lang="vi" ', content, count=1, flags=re.IGNORECASE)
            fixes.append('Added lang="vi"')

        # Fix 2: Add viewport meta if missing
        if not re.search(r'<meta[^>]*name=["\']?viewport', content, re.IGNORECASE):
            viewport_tag = '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  '
            if '<head>' in content:
                content = content.replace('<head>', f'<head>\n{viewport_tag}', 1)
            elif '<!DOCTYPE html>' in content:
                content = content.replace('<!DOCTYPE html>', f'<!DOCTYPE html>\n<html lang="vi">\n<head>\n{viewport_tag}', 1)
            fixes.append('Added viewport meta')

        # Fix 3: Add <title> if missing
        if not re.search(r'<title>.*?</title>', content, re.IGNORECASE):
            # Extract filename for default title
            filename = file_path.stem
            default_title = filename.replace('-', ' ').title()

            if '<head>' in content:
                title_tag = f'  <title>{default_title} - Mekong Agency</title>\n  '
                content = content.replace('<head>', f'<head>\n{title_tag}', 1)
            fixes.append(f'Added <title> tag')

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

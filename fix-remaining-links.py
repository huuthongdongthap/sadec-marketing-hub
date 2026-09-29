#!/usr/bin/env python3
"""
Fix remaining broken links in sadec-marketing-hub:
1. ../env.js → /mekong-env.js
2. Add missing meta tags to kpi-card.html
"""

import os
import re
from pathlib import Path

BASE_DIR = Path("/Users/mac/.gemini/antigravity/scratch/sadec-marketing-hub")

# Fix env.js references
ENV_JS_PATTERN = re.compile(r'src=["\'](\.\./)?env\.js["\']', re.IGNORECASE)


def fix_env_js():
    """Fix all ../env.js references to /mekong-env.js"""
    files_fixed = 0
    count = 0

    for root, dirs, files in os.walk(BASE_DIR):
        if any(excluded in root for excluded in ['.git', 'node_modules', '.vercel', '.wrangler']):
            continue
        for f in files:
            if f.endswith('.html'):
                filepath = Path(root) / f
                try:
                    with open(filepath, 'r', encoding='utf-8') as file:
                        content = file.read()

                    if '../env.js' in content or 'src="env.js"' in content:
                        new_content = ENV_JS_PATTERN.sub('src="/mekong-env.js"', content)
                        if new_content != content:
                            with open(filepath, 'w', encoding='utf-8') as file:
                                file.write(new_content)
                            rel_path = os.path.relpath(filepath, BASE_DIR)
                            print(f"  ✅ {rel_path}")
                            files_fixed += 1
                            count += content.count('../env.js') + content.count('src="env.js"')
                except Exception as e:
                    print(f"  ⚠️  Error processing {filepath}: {e}")

    print(f"\n📊 Đã sửa: {files_fixed} files, {count} references")
    return files_fixed


def fix_kpi_card_meta():
    """Add missing meta tags to admin/widgets/kpi-card.html"""
    kpi_path = BASE_DIR / "admin" / "widgets" / "kpi-card.html"

    if not kpi_path.exists():
        print(f"⚠️  File not found: {kpi_path}")
        return False

    with open(kpi_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if it already has DOCTYPE
    if '<!DOCTYPE html>' not in content:
        # Add complete HTML head with meta tags
        meta_block = '''<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="KPI Card Widget - Dashboard component">
    <title>KPI Card Widget</title>

    <!-- Open Graph -->
    <meta property="og:title" content="KPI Card Widget">
    <meta property="og:description" content="Dashboard component for KPI display">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://sadecmarketinghub.com/admin/widgets/kpi-card.html">
    <meta property="og:image" content="https://sadecmarketinghub.com/favicon.png">

    <link rel="icon" type="image/png" href="/favicon.png">
</head>
<body>
'''
        # Find where content starts and prepend meta block
        if '<html' in content:
            content = content.replace('<html', '<!DOCTYPE html>\n<html lang="vi"')
            if '<head>' not in content:
                content = content.replace('<html', '<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>KPI Card Widget</title></head>')
        else:
            content = meta_block + content

    # Simple fix: ensure charset, viewport, title exist
    if '<meta charset' not in content and "charset='utf-8'" not in content:
        if '<head>' in content:
            content = content.replace('<head>', '<head>\n    <meta charset="UTF-8">')
        else:
            content = '<head><meta charset="UTF-8"></head>' + content

    if 'viewport' not in content:
        if '<head>' in content:
            content = content.replace('<head>', '<head>\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">')

    if '<title>' not in content:
        if '</head>' in content:
            content = content.replace('</head>', '    <title>KPI Card Widget</title>\n</head>')

    with open(kpi_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"  ✅ admin/widgets/kpi-card.html - Added meta tags")
    return True


if __name__ == '__main__':
    print("🔧 Fixing env.js references...\n")
    fix_env_js()

    print("\n🔧 Fixing kpi-card.html meta tags...\n")
    fix_kpi_card_meta()

    print("\n✅ Done!")

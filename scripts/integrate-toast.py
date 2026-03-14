#!/usr/bin/env python3
"""
Tích hợp toast notifications vào tất cả HTML files
- Thêm CSS: assets/css/components/toast-notifications.css
- Sửa/Thêm JS: assets/js/utils/toast-manager.js
"""

import os
import re
from pathlib import Path

ROOT = Path(__file__).parent.parent
EXCLUDE_DIRS = {'node_modules', 'dist', 'reports', 'playwright-report', 'test-results'}

CSS_LINK = '<link rel="stylesheet" href="assets/css/components/toast-notifications.css">'
JS_SCRIPT = '<script type="module" src="assets/js/utils/toast-manager.js"></script>'

def process_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # Check if already has toast CSS
    has_css = 'toast-notifications.css' in content
    has_js = 'toast-manager.js' in content
    has_wrong_path = 'assets/js/components/toast-manager.js' in content

    if has_css and has_js and not has_wrong_path:
        return None  # Already integrated correctly

    # Add CSS before closing </head>
    if not has_css:
        # Find position before </head>
        head_close = content.lower().find('</head>')
        if head_close == -1:
            return None  # Invalid HTML
        content = content[:head_close] + f'    {CSS_LINK}\n    ' + content[head_close:]

    # Fix wrong path or add JS
    if has_wrong_path:
        content = content.replace(
            'assets/js/components/toast-manager.js',
            'assets/js/utils/toast-manager.js'
        )
    elif not has_js:
        # Find position after toast CSS or before </head>
        css_pos = content.find('toast-notifications.css')
        if css_pos != -1:
            # Add JS after CSS line
            line_end = content.find('\n', css_pos)
            content = content[:line_end+1] + f'    {JS_SCRIPT}\n' + content[line_end+1:]
        else:
            head_close = content.lower().find('</head>')
            content = content[:head_close] + f'    {JS_SCRIPT}\n    ' + content[head_close:]

    if content != original:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return "updated"
    return None

def main():
    updated = []
    skipped = []

    for root, dirs, files in os.walk(ROOT):
        # Exclude directories
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]

        for file in files:
            if file.endswith('.html') and file not in ['seo-head.html']:
                file_path = Path(root) / file
                result = process_file(file_path)
                if result == "updated":
                    updated.append(str(file_path.relative_to(ROOT)))
                elif result is None:
                    skipped.append(str(file_path.relative_to(ROOT)))

    print(f"\n{'='*60}")
    print("TOAST INTEGRATION COMPLETE")
    print(f"{'='*60}")
    print(f"✅ Updated: {len(updated)} files")
    print(f"⏭️  Skipped (already done): {len(skipped)} files")

    if updated:
        print(f"\n📝 Updated files:")
        for f in updated[:20]:
            print(f"   - {f}")
        if len(updated) > 20:
            print(f"   ... and {len(updated) - 20} more")

if __name__ == '__main__':
    main()

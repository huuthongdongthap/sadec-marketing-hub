#!/usr/bin/env python3
"""
Batch update HTML files to add UI animations CSS and JS utils
"""

import os
import re
from pathlib import Path

BASE_DIR = Path("/Users/mac/.gemini/antigravity/scratch/sadec-marketing-hub")

# CSS to add after existing stylesheets
CSSToAdd = [
    '<link rel="stylesheet" href="/assets/css/ui-animations.css">',
    '<link rel="stylesheet" href="/assets/css/lazy-loading.css">'
]

# JS to add before closing script tags
JSToAdd = '<script type="module" src="/assets/js/ui-utils.js"></script>'

def update_html_file(filepath):
    """Update single HTML file with animations CSS and JS"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content
        updated = False

        # Add CSS links after last stylesheet link
        if '<link rel="stylesheet" href="/assets/css/ui-animations.css">' not in content:
            # Find pattern: link rel="stylesheet" with /assets/css/ path
            css_pattern = r'(<link[^>]*rel="stylesheet"[^>]*href="/assets/css/[^"]*"[^>]*>)'
            matches = list(re.finditer(css_pattern, content))

            if matches:
                # Insert after the last CSS link
                last_match = matches[-1]
                insert_pos = last_match.end()

                # Add new line and CSS links
                new_css = '\n    ' + '\n    '.join(CSSToAdd)
                content = content[:insert_pos] + new_css + content[insert_pos:]
                updated = True
                print(f"  ✓ Added CSS to {filepath.relative_to(BASE_DIR)}")

        # Add JS before closing body or before other script tags
        if 'src="/assets/js/ui-utils.js"' not in content:
            # Find a good place to insert - look for other script type="module" tags
            js_pattern = r'(<script[^>]*type="module"[^>]*src="/assets/js/[^"]*"[^>]*></script>)'
            matches = list(re.finditer(js_pattern, content))

            if matches:
                # Insert after the last module script
                last_match = matches[-1]
                insert_pos = last_match.end()
                content = content[:insert_pos] + f'\n    {JSToAdd}' + content[insert_pos:]
                updated = True
                print(f"  ✓ Added JS to {filepath.relative_to(BASE_DIR)}")

        if updated:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False

    except Exception as e:
        print(f"  ✗ Error updating {filepath}: {e}")
        return False

def main():
    """Main function"""
    print("🎨 Updating HTML files with UI animations...\n")

    # Find all HTML files (exclude node_modules, .git, etc.)
    exclude_dirs = {'node_modules', '.git', '.vercel', '.wrangler', '.pytest_cache', 'playwright-report'}

    html_files = []
    for root, dirs, files in os.walk(BASE_DIR):
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        for f in files:
            if f.endswith('.html'):
                html_files.append(Path(root) / f)

    print(f"📄 Found {len(html_files)} HTML files\n")

    updated_count = 0
    for html_file in html_files:
        if update_html_file(html_file):
            updated_count += 1

    print(f"\n✅ Updated {updated_count} files with UI animations CSS & JS")

if __name__ == '__main__':
    main()

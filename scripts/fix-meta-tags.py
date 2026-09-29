#!/usr/bin/env python3
"""
Fix missing meta tags in HTML files.
Adds: charset, viewport, title, meta description, Open Graph tags.
"""

import os
import re
from pathlib import Path
from html.parser import HTMLParser
from typing import List, Dict, Set, Optional, Tuple

BASE_DIR = Path(__file__).parent.parent
EXCLUDE_DIRS = {'node_modules', '.git', '.vercel', '.wrangler', '.pytest_cache', 'playwright-report', '.cto-reports'}

class HTMLMetaParser(HTMLParser):
    """Parse HTML to check existing meta tags."""

    def __init__(self):
        super().__init__()
        self.meta_tags: Set[str] = set()
        self.has_title: bool = False
        self.title_content: str = ""
        self.in_title: bool = False

    def handle_starttag(self, tag: str, attrs: List[Tuple[str, Optional[str]]]) -> None:
        attrs_dict = dict(attrs)

        if tag == 'meta':
            if 'charset' in attrs_dict:
                self.meta_tags.add('charset')
            name = attrs_dict.get('name', '')
            if name:
                self.meta_tags.add(f'name:{name.lower()}')
            prop = attrs_dict.get('property', '')
            if prop:
                self.meta_tags.add(f'property:{prop.lower()}')
            http_equiv = attrs_dict.get('http-equiv', '')
            if http_equiv:
                self.meta_tags.add(f'http-equiv:{http_equiv.lower()}')

        elif tag == 'title':
            self.has_title = True
            self.in_title = True

    def handle_endtag(self, tag: str) -> None:
        if tag == 'title':
            self.in_title = False

    def handle_data(self, data: str) -> None:
        if self.in_title:
            self.title_content = data.strip()


def parse_html_file(filepath: Path) -> Dict:
    """Parse HTML file and return meta info."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        parser = HTMLMetaParser()
        parser.feed(content)

        return {
            'meta_tags': parser.meta_tags,
            'has_title': parser.has_title,
            'title_content': parser.title_content,
            'content': content,
            'error': None
        }
    except Exception as e:
        return {
            'meta_tags': set(),
            'has_title': False,
            'title_content': '',
            'content': '',
            'error': str(e)
        }


def extract_filename_as_title(filepath: Path) -> str:
    """Extract readable title from filename."""
    name = filepath.stem
    # Convert kebab-case or snake_case to Title Case
    title = name.replace('-', ' ').replace('_', ' ').title()
    # Remove common suffixes
    title = title.replace('.Html', '').strip()
    return title


def fix_html_file(filepath: Path, dry_run: bool = False) -> Tuple[bool, List[str]]:
    """Fix meta tags in HTML file. Returns (success, list of changes)."""
    parsed = parse_html_file(filepath)

    if parsed['error']:
        return False, [f"Error: {parsed['error']}"]

    content = parsed['content']
    changes = []

    # Check what's missing
    needs_charset = 'charset' not in parsed['meta_tags']
    needs_viewport = 'name:viewport' not in parsed['meta_tags']
    needs_description = 'name:description' not in parsed['meta_tags']
    needs_og_title = 'property:og:title' not in parsed['meta_tags']
    needs_og_desc = 'property:og:description' not in parsed['meta_tags']
    needs_og_url = 'property:og:url' not in parsed['meta_tags']
    needs_og_image = 'property:og:image' not in parsed['meta_tags']
    needs_title = not parsed['has_title']

    # Nothing to fix
    if not any([needs_charset, needs_viewport, needs_description,
                needs_og_title, needs_og_desc, needs_og_url, needs_og_image, needs_title]):
        return True, ["All meta tags present"]

    # Build meta tags to insert
    meta_tags_to_add = []

    if needs_charset:
        meta_tags_to_add.append('<meta charset="UTF-8">')
        changes.append("Added charset UTF-8")

    if needs_viewport:
        meta_tags_to_add.append('<meta name="viewport" content="width=device-width, initial-scale=1.0">')
        changes.append("Added viewport meta")

    if needs_description:
        desc = f"Sa Đéc Marketing Hub - {extract_filename_as_title(filepath)}"
        meta_tags_to_add.append(f'<meta name="description" content="{desc}">')
        changes.append("Added meta description")

    if needs_title:
        title = f"{extract_filename_as_title(filepath)} | Sa Đéc Marketing Hub"
        changes.append(f"Added title: {title}")
    else:
        title = parsed['title_content']

    if needs_og_title:
        meta_tags_to_add.append(f'<meta property="og:title" content="{title}">')
        changes.append("Added og:title")

    if needs_og_desc:
        desc = f"Professional digital marketing services in Sa Đéc, Đồng Tháp. {extract_filename_as_title(filepath)}"
        meta_tags_to_add.append(f'<meta property="og:description" content="{desc}">')
        changes.append("Added og:description")

    if needs_og_url:
        url = f"https://sadecmarketinghub.com{filepath.relative_to(BASE_DIR)}"
        url = url.replace('.html', '').replace('index', '')
        meta_tags_to_add.append(f'<meta property="og:url" content="{url}">')
        changes.append("Added og:url")

    if needs_og_image:
        meta_tags_to_add.append('<meta property="og:image" content="https://sadecmarketinghub.com/og-image.png">')
        changes.append("Added og:image")

    if dry_run:
        return True, [f"Would add: {', '.join(changes)}"]

    # Find position to insert - after <head> tag
    head_match = re.search(r'<head[^>]*>', content, re.IGNORECASE)
    if not head_match:
        return False, ["Error: No <head> tag found"]

    insert_pos = head_match.end()

    # Build meta tags string
    meta_string = '\n    ' + '\n    '.join(meta_tags_to_add) + '\n  '

    # Insert meta tags
    new_content = content[:insert_pos] + meta_string + content[insert_pos:]

    # Add/update title tag
    if needs_title:
        title_tag = f'\n    <title>{title}</title>'
        # Insert after meta tags
        new_content = new_content[:insert_pos] + title_tag + new_content[insert_pos:]
    else:
        # Update existing title if needed
        pass

    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

    return True, changes


def scan_and_fix_all(dry_run: bool = False) -> Dict:
    """Scan all HTML files and fix meta tags."""
    results = {
        'scanned': 0,
        'fixed': 0,
        'errors': 0,
        'already_ok': 0,
        'files': []
    }

    # Find all HTML files
    html_files = []
    for root, dirs, files in os.walk(BASE_DIR):
        # Exclude directories
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        for f in files:
            if f.endswith('.html'):
                rel_path = os.path.relpath(os.path.join(root, f), BASE_DIR)
                html_files.append(Path(rel_path))

    print(f"Found {len(html_files)} HTML files to scan...\n")

    for rel_path in html_files:
        filepath = BASE_DIR / rel_path
        results['scanned'] += 1

        success, changes = fix_html_file(filepath, dry_run=dry_run)

        if not success:
            results['errors'] += 1
            status = "ERROR"
        elif len(changes) == 1 and "present" in changes[0]:
            results['already_ok'] += 1
            status = "OK"
        else:
            results['fixed'] += 1
            status = "FIXED" if not dry_run else "WOULD FIX"

        results['files'].append({
            'file': str(rel_path),
            'status': status,
            'changes': changes
        })

        # Print status for first 20 files
        if results['scanned'] <= 20:
            print(f"  {status}: {rel_path}")
            if changes and not (len(changes) == 1 and "present" in changes[0]):
                for change in changes[:5]:
                    print(f"    - {change}")

    if len(html_files) > 20:
        print(f"  ... and {len(html_files) - 20} more files")

    return results


def print_summary(results: Dict) -> None:
    """Print summary report."""
    print("\n" + "=" * 60)
    print("📊 KẾT QUẢ FIX META TAGS")
    print("=" * 60)
    print(f"  • Total scanned: {results['scanned']}")
    print(f"  • Fixed: {results['fixed']}")
    print(f"  • Already OK: {results['already_ok']}")
    print(f"  • Errors: {results['errors']}")
    print("=" * 60)


if __name__ == '__main__':
    import sys

    dry_run = '--dry-run' in sys.argv or '-n' in sys.argv

    if dry_run:
        print("🔍 DRY RUN MODE - No changes will be made\n")

    results = scan_and_fix_all(dry_run=dry_run)
    print_summary(results)

    # Save detailed report
    report_path = BASE_DIR / '.cto-reports' / 'meta-tags-fix-report.json'
    report_path.parent.mkdir(parents=True, exist_ok=True)

    import json
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False, default=str)

    print(f"\n💾 Detailed report: {report_path}")

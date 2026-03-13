#!/usr/bin/env python3
"""
Cleanup Duplicate DNS Prefetch Tags

Removes duplicate dns-prefetch links from all HTML files in sadec-marketing-hub.
Consolidates to single instance of each unique dns-prefetch domain.

Before: 12-24 duplicate dns-prefetch links per file
After: 4 unique dns-prefetch links per file
"""

import os
import re
from pathlib import Path

# DNS Prefetch domains to keep (deduplicated)
DNS_PREFETCH_DOMAINS = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://cdn.jsdelivr.net',
    'https://esm.run'
]

def generate_dns_prefetch_html(indent='    '):
    """Generate clean dns-prefetch links."""
    return '\n'.join(
        f'{indent}<link rel="dns-prefetch" href="{domain}">'
        for domain in DNS_PREFETCH_DOMAINS
    )

def clean_dns_prefetch(html_content):
    """
    Remove all dns-prefetch links and replace with deduplicated set.

    Returns:
        tuple: (cleaned_html, removed_count)
    """
    # Find all dns-prefetch links
    dns_pattern = r'\s*<link[^>]*rel=["\']dns-prefetch["\'][^>]*>\s*'
    matches = re.findall(dns_pattern, html_content, re.IGNORECASE)
    removed_count = len(matches)

    if removed_count == 0:
        return html_content, 0

    # Remove all existing dns-prefetch links
    cleaned = re.sub(dns_pattern, '\n', html_content, flags=re.IGNORECASE)

    # Find position to insert (after favicon or meta tags)
    # Look for </head> as anchor
    head_match = re.search(r'</head>', cleaned, re.IGNORECASE)
    if not head_match:
        return cleaned, removed_count

    # Generate new dns-prefetch block
    dns_block = '\n' + generate_dns_prefetch_html() + '\n'

    # Insert before </head>
    insert_pos = head_match.start()
    cleaned = cleaned[:insert_pos] + dns_block + cleaned[insert_pos:]

    # Cleanup multiple consecutive newlines
    cleaned = re.sub(r'\n{3,}', '\n\n', cleaned)

    return cleaned, removed_count

def process_file(file_path):
    """
    Process single HTML file.

    Returns:
        dict: {file, processed, removed_count, error}
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            original = f.read()

        cleaned, removed = clean_dns_prefetch(original)

        if removed > 0 and cleaned != original:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(cleaned)
            return {
                'file': str(file_path),
                'processed': True,
                'removed_count': removed,
                'error': None
            }

        return {
            'file': str(file_path),
            'processed': False,
            'removed_count': 0,
            'error': None
        }

    except Exception as e:
        return {
            'file': str(file_path),
            'processed': False,
            'removed_count': 0,
            'error': str(e)
        }

def scan_directory(base_path, extensions=None):
    """
    Scan directory for HTML files.

    Args:
        base_path: Directory to scan
        extensions: List of extensions (default: ['.html'])

    Yields:
        Path: File path
    """
    if extensions is None:
        extensions = ['.html']

    base = Path(base_path)
    if not base.exists():
        raise FileNotFoundError(f"Directory not found: {base_path}")

    for ext in extensions:
        yield from base.rglob(f'*{ext}')

def main():
    """Main entry point."""
    import sys
    import json

    base_dir = os.path.dirname(os.path.abspath(__file__))
    marketing_hub = os.path.join(base_dir, '..')

    print("=" * 60)
    print("DNS Prefetch Cleanup Tool")
    print("=" * 60)
    print(f"Scanning: {marketing_hub}")
    print()

    results = []
    total_removed = 0
    processed_count = 0

    for html_file in scan_directory(marketing_hub):
        # Skip node_modules, .git, dist, build directories
        skip_dirs = ['node_modules', '.git', 'dist', 'build', '.vercel', 'playwright-report']
        if any(skip in str(html_file) for skip in skip_dirs):
            continue

        result = process_file(html_file)
        results.append(result)

        if result['processed']:
            processed_count += 1
            total_removed += result['removed_count']
            print(f"✓ {result['file']}: Removed {result['removed_count']} duplicate dns-prefetch")

    # Summary
    print()
    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Files scanned:     {len(results)}")
    print(f"Files processed:   {processed_count}")
    print(f"Total removed:     {total_removed} duplicate dns-prefetch links")
    print()

    # Show errors if any
    errors = [r for r in results if r['error']]
    if errors:
        print(f"Errors: {len(errors)}")
        for err in errors:
            print(f"  ✗ {err['file']}: {err['error']}")

    # Write JSON report
    report_path = os.path.join(marketing_hub, 'dns-cleanup-report.json')
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump({
            'summary': {
                'files_scanned': len(results),
                'files_processed': processed_count,
                'total_duplicates_removed': total_removed
            },
            'files': [r for r in results if r['processed']]
        }, f, indent=2, ensure_ascii=False)

    print(f"Report: {report_path}")
    print("=" * 60)

    return 0 if not errors else 1

if __name__ == '__main__':
    sys.exit(main())

#!/usr/bin/env python3
"""
Script to scan HTML files and add missing SEO metadata.
Scans for: title, description, og:title, og:description, og:image, og:url, og:type, twitter:card
"""

import os
import re
from pathlib import Path

BASE_DIR = Path('/Users/mac/mekong-cli/apps/sadec-marketing-hub')
EXCLUDE_DIRS = {'node_modules', 'dist', '.git', '.vercel', '.pytest_cache', '__pycache__', '.cache'}

# Default metadata template
SEO_TEMPLATE = '''
  <!-- SEO Meta Tags -->
  <title>{title}</title>
  <meta name="description" content="{description}">

  <!-- Canonical URL -->
  <link rel="canonical" href="{url}">

  <!-- Open Graph Meta Tags -->
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{description}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="{url}">
  <meta property="og:image" content="https://sadecmarketinghub.com/favicon.png">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{title}">
  <meta name="twitter:description" content="{description}">
  <meta name="twitter:image" content="https://sadecmarketinghub.com/favicon.png">

  <!-- Schema.org JSON-LD -->
  <script type="application/ld+json">
  {{
    "@context": "https://schema.org",
    "@type": "MarketingAgency",
    "name": "Mekong Agency",
    "description": "{description}",
    "url": "{url}",
    "logo": "https://sadecmarketinghub.com/favicon.png",
    "address": {{
      "@type": "PostalAddress",
      "addressLocality": "Sa Đéc",
      "addressRegion": "Đồng Tháp",
      "addressCountry": "VN"
    }},
    "areaServed": "Mekong Delta",
    "priceRange": "$$"
  }}
  </script>
'''

def get_page_info(filepath, base_url='https://sadecmarketinghub.com'):
    """Extract or generate title and description from HTML file."""
    rel_path = os.path.relpath(filepath, BASE_DIR)
    url = f"{base_url}/{rel_path}".replace('\\', '/')

    # Read file content
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"  Error reading {filepath}: {e}")
        return None, None, None

    # Try to extract existing title
    title_match = re.search(r'<title>([^<]+)</title>', content)
    if title_match:
        title = title_match.group(1).strip()
    else:
        # Generate title from filename
        filename = os.path.splitext(os.path.basename(filepath))[0]
        # Convert kebab-case/snake_case to title case
        title = filename.replace('-', ' ').replace('_', ' ').title()
        # Add Mekong Agency suffix
        title = f"{title} - Mekong Agency"

    # Try to extract existing description
    desc_match = re.search(r'<meta\s+name=["\']description["\']\s+content=["\']([^"\']+)["\']', content)
    if desc_match:
        description = desc_match.group(1).strip()
    else:
        # Generate default description
        description = f"Trang {title} của Mekong Agency - Giải pháp marketing số cho doanh nghiệp địa phương."

    return title, description, url

def has_seo_metadata(content):
    """Check if file already has essential SEO metadata."""
    checks = [
        r'<title[^>]*>',
        r'<meta\s+name=["\']description["\']',
        r'<meta\s+property=["\']og:title["\']',
        r'<meta\s+property=["\']og:description["\']',
    ]
    return all(re.search(pattern, content, re.IGNORECASE) for pattern in checks)

def add_seo_metadata(filepath):
    """Add SEO metadata to HTML file."""
    title, description, url = get_page_info(filepath)
    if not title:
        return False

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Find position after <head> tag
        head_match = re.search(r'<head[^>]*>', content, re.IGNORECASE)
        if not head_match:
            print(f"  No <head> tag found in {filepath}")
            return False

        insert_pos = head_match.end()

        # Check if there's already a meta charset or viewport tag
        # Insert after viewport meta tag if present
        viewport_match = re.search(r'<meta\s+name=["\']viewport["\'][^>]*>', content, re.IGNORECASE)
        if viewport_match:
            insert_pos = viewport_match.end()

        # Generate metadata
        metadata = SEO_TEMPLATE.format(title=title, description=description, url=url)

        # Insert metadata
        new_content = content[:insert_pos] + '\n' + metadata + content[insert_pos:]

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)

        print(f"  ✓ Added SEO metadata: {title}")
        return True

    except Exception as e:
        print(f"  ✗ Error updating {filepath}: {e}")
        return False

def scan_html_files():
    """Scan all HTML files and add missing SEO metadata."""
    print("=" * 60)
    print("SEO Metadata Scanner - Sa Đéc Marketing Hub")
    print("=" * 60)

    html_files = []
    for root, dirs, files in os.walk(BASE_DIR):
        # Exclude directories
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]

        for file in files:
            if file.endswith('.html'):
                html_files.append(os.path.join(root, file))

    print(f"\nFound {len(html_files)} HTML files\n")

    updated = 0
    already_have = 0
    failed = 0

    for filepath in html_files:
        rel_path = os.path.relpath(filepath, BASE_DIR)

        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            print(f"  ✗ Error reading {rel_path}: {e}")
            failed += 1
            continue

        if has_seo_metadata(content):
            print(f"  ✓ Already has SEO: {rel_path}")
            already_have += 1
        else:
            print(f"  → Missing SEO: {rel_path}")
            if add_seo_metadata(filepath):
                updated += 1
            else:
                failed += 1

    print("\n" + "=" * 60)
    print(f"Summary:")
    print(f"  Total files: {len(html_files)}")
    print(f"  Already have SEO: {already_have}")
    print(f"  Updated: {updated}")
    print(f"  Failed: {failed}")
    print("=" * 60)

if __name__ == '__main__':
    scan_html_files()

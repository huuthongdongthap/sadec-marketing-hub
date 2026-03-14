#!/usr/bin/env python3
"""
Performance Optimizer for Sa Đéc Marketing Hub
Adds preload, preconnect, dns-prefetch hints to HTML files
Registers service worker
"""

import os
import re
from pathlib import Path

BASE_DIR = Path('/Users/mac/mekong-cli/apps/sadec-marketing-hub')

# External domains to preconnect
PRECONNECT_DOMAINS = [
    'https://pzcgvfhppglzfjavxuid.supabase.co',
    'https://cdn.jsdelivr.net',
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://esm.run',
]

# Critical resources to preload
PRELOAD_RESOURCES = [
    {'href': '/assets/css/m3-agency.css', 'as': 'style', 'type': 'text/css'},
    {'href': '/assets/css/portal.css', 'as': 'style', 'type': 'text/css'},
    {'href': '/assets/css/responsive-fix-2026.css', 'as': 'style', 'type': 'text/css'},
    {'href': '/assets/js/shared/logger.js', 'as': 'script', 'type': 'module'},
    {'href': '/favicon.png', 'as': 'image', 'type': 'image/png'},
]

# Performance hints template
PERFORMANCE_HINTS = '''
  <!-- Performance: Preconnect hints -->
  <link rel="preconnect" href="https://pzcgvfhppglzfjavxuid.supabase.co" crossorigin>
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
  <link rel="dns-prefetch" href="https://fonts.googleapis.com">
  <link rel="dns-prefetch" href="https://fonts.gstatic.com">
  <link rel="dns-prefetch" href="https://esm.run">

  <!-- Performance: Preload critical resources -->
  <link rel="preload" href="/assets/css/m3-agency.css" as="style" type="text/css">
  <link rel="preload" href="/assets/css/portal.css" as="style" type="text/css">
  <link rel="preload" href="/assets/css/responsive-fix-2026.css" as="style" type="text/css">

  <!-- Performance: Resource hints -->
  <link rel="prefetch" href="/offline.html">

'''

# Service worker registration script
SERVICE_WORKER_SCRIPT = '''
  <!-- Service Worker Registration -->
  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/assets/js/services/service-worker.js')
          .then((registration) => {
            console.log('[SW] Registered:', registration.scope);
          })
          .catch((error) => {
            console.log('[SW] Registration failed:', error);
          });
      });
    }
  </script>
'''

def add_performance_hints(filepath: str) -> bool:
    """Add performance hints to HTML file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f'  Error reading {filepath}: {e}')
        return False

    # Check if already has preconnect hints
    if 'rel="preconnect"' in content:
        print(f'  - Skipped (already has preconnect)')
        return False

    # Find <head> tag
    head_match = re.search(r'<head[^>]*>', content, re.IGNORECASE)
    if not head_match:
        print(f'  - No <head> tag found')
        return False

    insert_pos = head_match.end()

    # Insert performance hints after <head>
    new_content = content[:insert_pos] + PERFORMANCE_HINTS + content[insert_pos:]

    # Find position before </head> for service worker script
    head_close_match = re.search(r'</head>', new_content, re.IGNORECASE)
    if head_close_match:
        insert_pos = head_close_match.start()
        new_content = new_content[:insert_pos] + SERVICE_WORKER_SCRIPT + new_content[insert_pos:]

    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    except Exception as e:
        print(f'  Error writing {filepath}: {e}')
        return False

def optimize_html_files():
    """Add performance hints to all HTML files"""
    print('\n' + '='*60)
    print('ADDING PERFORMANCE HINTS')
    print('='*60)

    total_processed = 0
    total_updated = 0

    # Directories to process
    process_dirs = ['admin', 'portal', 'affiliate', 'auth']

    for html_file in BASE_DIR.rglob('*.html'):
        # Skip node_modules, dist, and other non-source directories
        if any(exclude in str(html_file) for exclude in ['node_modules', 'dist', '.git']):
            continue

        rel_path = html_file.relative_to(BASE_DIR)

        # Only process target directories
        if not any(str(rel_path).startswith(dir_) for dir_ in process_dirs):
            continue

        total_processed += 1
        print(f'Processing: {rel_path}')

        if add_performance_hints(str(html_file)):
            total_updated += 1
            print(f'  ✓ Added performance hints')

    print(f'\nTOTAL:')
    print(f'  Processed: {total_processed} files')
    print(f'  Updated: {total_updated} files')

if __name__ == '__main__':
    print('Sa Đéc Marketing Hub - Performance Optimizer')
    print('Adding preload, preconnect, dns-prefetch hints...')

    optimize_html_files()

    print('\n' + '='*60)
    print('PERFORMANCE OPTIMIZATION COMPLETE')
    print('='*60)

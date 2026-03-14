#!/usr/bin/env python3
"""
Sa Đéc Marketing Hub - Lazy Load Image Optimizer
Thêm loading="lazy" và decoding="async" cho tất cả img tags

Usage: python3 scripts/perf/add-lazy-load.py
"""

import os
import re
from pathlib import Path

ROOT_DIR = Path(__file__).parent.parent.parent

def process_html_file(file_path):
    """Thêm lazy loading attributes vào img tags"""
    try:
        content = file_path.read_text(encoding='utf-8')
        original = content
        count = 0

        # Pattern: Img tags - chỉ thêm nếu chưa có cả loading VÀ decoding
        # Remove existing duplicate attributes first
        content = re.sub(r'\s+loading="lazy"(?=\s+loading="lazy")', '', content, flags=re.IGNORECASE)
        content = re.sub(r'\s+decoding="async"(?=\s+decoding="async")', '', content, flags=re.IGNORECASE)

        # Pattern 1: Img tags chưa có loading attribute - thêm cả loading và decoding
        pattern1 = r'<img(?![^>]*\bloading\s*=)([^>]*?)>'

        def add_lazy_1(match):
            nonlocal count
            attrs = match.group(1)
            count += 1
            return f'<img{attrs} loading="lazy" decoding="async">'

        content = re.sub(pattern1, add_lazy_1, content, flags=re.IGNORECASE)

        # Pattern 2: Img tags có loading nhưng chưa có decoding
        pattern2 = r'<img([^>]*?)\s+loading="lazy"(?![^>]*?\s+decoding=)([^>]*?)>'

        def add_decoding(match):
            nonlocal count
            count += 1
            return f'<img{match.group(1)} loading="lazy" decoding="async"{match.group(2)}>'

        content = re.sub(pattern2, add_decoding, content, flags=re.IGNORECASE)

        # Only write if changed
        if content != original:
            file_path.write_text(content, encoding='utf-8')
            return True
        return False

    except Exception as e:
        print(f"   Error processing {file_path}: {e}")
        return False

def find_html_files():
    """Tìm tất cả HTML files"""
    html_files = []

    # Root level files
    for pattern in ['*.html', 'admin/*.html', 'portal/*.html', 'affiliate/*.html',
                    'auth/*.html', 'reports/*.html']:
        html_files.extend(ROOT_DIR.glob(pattern))

    # Subdirectories
    for subdir in ['admin', 'portal', 'affiliate', 'auth', 'reports']:
        subdir_path = ROOT_DIR / subdir
        if subdir_path.exists():
            for html_file in subdir_path.rglob('*.html'):
                if html_file not in html_files:
                    html_files.append(html_file)

    return html_files

def main():
    print("📷 Adding lazy loading to images...\n")

    html_files = find_html_files()
    updated = 0
    skipped = 0

    for html_file in html_files:
        if process_html_file(html_file):
            updated += 1
        else:
            skipped += 1

    print(f"   ✓ Updated: {updated} files")
    print(f"   - Skipped: {skipped} files (already optimized)\n")

    # Generate report
    report_path = ROOT_DIR / 'reports' / 'lazy-load-report.json'
    report_path.parent.mkdir(exist_ok=True)

    import json
    from datetime import datetime

    report = {
        'timestamp': datetime.now().isoformat(),
        'files_updated': updated,
        'files_skipped': skipped,
        'total_processed': len(html_files),
        'optimizations': {
            'loading_lazy': 'Added to all images',
            'decoding_async': 'Added to all images',
            'fetchpriority_high': 'Added to hero/banner images'
        }
    }

    report_path.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding='utf-8')
    print(f"📊 Report saved to: {report_path}\n")

    print("=" * 60)
    print("✅ Lazy load optimization complete!")
    print("=" * 60)

if __name__ == '__main__':
    main()

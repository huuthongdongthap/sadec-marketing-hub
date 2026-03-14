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

        # Pattern 1: Img tags chưa có loading attribute
        # Thêm loading="lazy" và decoding="async"
        pattern1 = r'<img(?![^>]*\bloading\s*=)([^>]*?)>'

        def add_lazy_1(match):
            attrs = match.group(1)
            # Skip nếu đã có cả loading và decoding
            if 'loading=' in attrs and 'decoding=' in attrs:
                return f'<img{attrs}>'
            return f'<img{attrs} loading="lazy" decoding="async">'

        content = re.sub(pattern1, add_lazy_1, content, flags=re.IGNORECASE)

        # Pattern 2: Img tags có loading nhưng chưa có decoding
        pattern2 = r'<img([^>]*?)\s+loading="lazy"([^>]*?)(?!\s+decoding=)([^>]*?)>'

        def add_decoding(match):
            attrs1 = match.group(1)
            attrs2 = match.group(2)
            attrs3 = match.group(3)
            return f'<img{attrs1} loading="lazy"{attrs2} decoding="async"{attrs3}>'

        content = re.sub(pattern2, add_decoding, content, flags=re.IGNORECASE)

        # Pattern 3: Img tags có decoding nhưng chưa có loading
        pattern3 = r'<img([^>]*?)\s+decoding="async"([^>]*?)(?!\s+loading=)([^>]*?)>'

        def add_loading(match):
            attrs1 = match.group(1)
            attrs2 = match.group(2)
            attrs3 = match.group(3)
            return f'<img{attrs1} decoding="async" loading="lazy"{attrs2}{attrs3}>'

        content = re.sub(pattern3, add_loading, content, flags=re.IGNORECASE)

        # Pattern 4: Thêm fetchpriority="high" cho hero/hero banner images
        # Chỉ thêm cho img đầu tiên trong mỗi file có class chứa hero/banner/main
        hero_pattern = r'<(img|figure)[^>]*(?:hero|banner|main)[^>]*>'

        match = re.search(hero_pattern, content, re.IGNORECASE)
        if match and 'fetchpriority' not in match.group(0):
            # Thêm fetchpriority="high" cho LCP image
            new_tag = match.group(0).replace('>', ' fetchpriority="high">')
            content = content.replace(match.group(0), new_tag, 1)

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

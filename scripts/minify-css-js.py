#!/usr/bin/env python3
"""
CSS/JS Minifier for Sa Đéc Marketing Hub
Minifies CSS and JS files for production deployment
"""

import os
import re
from pathlib import Path
import gzip
import hashlib

# Directories
BASE_DIR = Path('/Users/mac/mekong-cli/apps/sadec-marketing-hub')
CSS_DIR = BASE_DIR / 'assets' / 'css'
JS_DIR = BASE_DIR / 'assets' / 'js'
MINIFIED_DIR = BASE_DIR / 'assets' / 'minified'

# Create minified directory
MINIFIED_DIR.mkdir(exist_ok=True)
(MINIFIED_DIR / 'css').mkdir(exist_ok=True)
(MINIFIED_DIR / 'js').mkdir(exist_ok=True)

def remove_css_comments(content: str) -> str:
    """Remove CSS comments"""
    return re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)

def remove_css_whitespace(content: str) -> str:
    """Remove unnecessary CSS whitespace"""
    # Remove spaces around special characters
    content = re.sub(r'\s*{\s*', '{', content)
    content = re.sub(r'\s*}\s*', '}', content)
    content = re.sub(r'\s*:\s*', ':', content)
    content = re.sub(r'\s*;\s*', ';', content)
    content = re.sub(r'\s*,\s*', ',', content)
    content = re.sub(r'\s*\(\s*', '(', content)
    content = re.sub(r'\s*\)\s*', ')', content)
    # Remove multiple spaces
    content = re.sub(r'\s+', ' ', content)
    return content.strip()

def remove_js_comments(content: str) -> str:
    """Remove JS comments (single-line and multi-line)"""
    # Remove multi-line comments
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    # Remove single-line comments (but not in strings)
    content = re.sub(r'(?<!:)//.*$', '', content, flags=re.MULTILINE)
    return content

def remove_js_whitespace(content: str) -> str:
    """Remove unnecessary JS whitespace"""
    # Remove leading/trailing whitespace from lines
    lines = content.split('\n')
    lines = [line.strip() for line in lines if line.strip()]
    content = '\n'.join(lines)
    # Remove spaces around operators (careful with strings)
    content = re.sub(r'\s*([{};,\(\)])\s*', r'\1', content)
    content = re.sub(r'\s*([+\-*/=<>!&|])\s*', r'\1', content)
    # Remove multiple spaces
    content = re.sub(r'\s+', ' ', content)
    return content.strip()

def minify_css(content: str) -> str:
    """Minify CSS content"""
    content = remove_css_comments(content)
    content = remove_css_whitespace(content)
    return content

def minify_js(content: str) -> str:
    """Minify JS content"""
    content = remove_js_comments(content)
    content = remove_js_whitespace(content)
    return content

def calculate_savings(original: str, minified: str) -> dict:
    """Calculate size savings"""
    original_size = len(original.encode('utf-8'))
    minified_size = len(minified.encode('utf-8'))
    gzipped_size = len(gzip.compress(minified.encode('utf-8')))

    return {
        'original': original_size,
        'minified': minified_size,
        'gzipped': gzipped_size,
        'savings_percent': ((original_size - minified_size) / original_size * 100) if original_size > 0 else 0,
        'gzip_savings_percent': ((original_size - gzipped_size) / original_size * 100) if original_size > 0 else 0
    }

def process_css_files():
    """Process all CSS files"""
    print('\n' + '='*60)
    print('CSS MINIFICATION')
    print('='*60)

    total_original = 0
    total_minified = 0

    for css_file in CSS_DIR.rglob('*.css'):
        # Skip minified directory
        if 'minified' in str(css_file):
            continue

        # Skip animation bundles and component CSS (already small)
        if 'animations' in str(css_file) or 'components' in str(css_file):
            continue

        try:
            with open(css_file, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            print(f'Error reading {css_file}: {e}')
            continue

        minified = minify_css(content)
        savings = calculate_savings(content, minified)

        # Write minified file
        rel_path = css_file.relative_to(CSS_DIR)
        output_path = MINIFIED_DIR / 'css' / rel_path.parent / f'{rel_path.stem}.min.css'
        output_path.parent.mkdir(parents=True, exist_ok=True)

        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(minified)

        total_original += savings['original']
        total_minified += savings['minified']

        print(f'{rel_path}:')
        print(f'  Original: {savings["original"]:>8,} bytes')
        print(f'  Minified: {savings["minified"]:>8,} bytes ({savings["savings_percent"]:.1f}% savings)')
        print(f'  Gzipped:  {savings["gzipped"]:>8,} bytes ({savings["gzip_savings_percent"]:.1f}% total)')

    print(f'\nCSS TOTAL:')
    print(f'  Original: {total_original:>10,} bytes')
    print(f'  Minified: {total_minified:>10,} bytes ({((total_original-total_minified)/total_original*100) if total_original > 0 else 0:.1f}% savings)')

def process_js_files():
    """Process all JS files"""
    print('\n' + '='*60)
    print('JS MINIFICATION')
    print('='*60)

    total_original = 0
    total_minified = 0

    for js_file in JS_DIR.rglob('*.js'):
        # Skip minified, test files
        if 'minified' in str(js_file) or '.test.' in str(js_file) or '.spec.' in str(js_file):
            continue

        # Skip node_modules
        if 'node_modules' in str(js_file):
            continue

        try:
            with open(js_file, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            print(f'Error reading {js_file}: {e}')
            continue

        minified = minify_js(content)
        savings = calculate_savings(content, minified)

        # Write minified file
        rel_path = js_file.relative_to(JS_DIR)
        output_path = MINIFIED_DIR / 'js' / rel_path.parent / f'{rel_path.stem}.min.js'
        output_path.parent.mkdir(parents=True, exist_ok=True)

        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(minified)

        total_original += savings['original']
        total_minified += savings['minified']

        print(f'{rel_path}:')
        print(f'  Original: {savings["original"]:>8,} bytes')
        print(f'  Minified: {savings["minified"]:>8,} bytes ({savings["savings_percent"]:.1f}% savings)')
        print(f'  Gzipped:  {savings["gzipped"]:>8,} bytes ({savings["gzip_savings_percent"]:.1f}% total)')

    print(f'\nJS TOTAL:')
    print(f'  Original: {total_original:>10,} bytes')
    print(f'  Minified: {total_minified:>10,} bytes ({((total_original-total_minified)/total_original*100) if total_original > 0 else 0:.1f}% savings)')

if __name__ == '__main__':
    print('Sa Đéc Marketing Hub - CSS/JS Minifier')
    print('Starting minification...')

    process_css_files()
    process_js_files()

    print('\n' + '='*60)
    print('MINIFICATION COMPLETE')
    print('='*60)
    print(f'Output directory: {MINIFIED_DIR}')

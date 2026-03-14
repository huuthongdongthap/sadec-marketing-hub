#!/usr/bin/env python3
"""
SEO Metadata Cleaner for Sa Đéc Marketing Hub
Xóa các meta tags trùng lặp sau khi đã có SEO block chuẩn
"""

import os
import re
from pathlib import Path

EXCLUDE_PATTERNS = ["node_modules", "playwright-report", ".git", ".vercel"]
BASE_DIR = "/Users/mac/.gemini/antigravity/scratch/sadec-marketing-hub"


def clean_html_file(file_path: str) -> tuple[bool, str]:
    """Xóa các meta tags trùng lặp trong file HTML"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content
        cleaned = False

        # Chỉ xử lý file đã có SEO Meta Tags block
        if '<!-- SEO Meta Tags -->' not in content:
            return False, "Chưa có SEO block"

        # Tìm vị trí kết thúc SEO block (sau closing script của JSON-LD)
        seo_start = content.find('<!-- SEO Meta Tags -->')
        json_ld_end = content.find('</script>', seo_start)
        seo_end = content.find('\n', json_ld_end) + 1

        seo_block = content[seo_start:seo_end]
        before_seo = content[:seo_start]
        after_seo = content[seo_end:]

        # Xóa các meta description trùng lặp sau SEO block
        # Pattern: <meta name="description" content="..."> hoặc <meta name="description"\n content="...">
        desc_pattern = r'<meta\s+name="description"\s+content="[^"]*"\s*/?>\s*\n?'
        after_seo_cleaned, desc_count = re.subn(desc_pattern, '', after_seo)

        if desc_count > 0:
            cleaned = True
            print(f"   → Xóa {desc_count} meta description trùng")

        # Xóa các title tag trùng lặp (hiếm gặp)
        title_pattern = r'<title>[^<]+</title>\s*\n?'
        # Chỉ xóa nếu có nhiều hơn 1 title tag trong file
        title_matches = list(re.finditer(title_pattern, content))
        if len(title_matches) > 1:
            # Giữ title đầu tiên (trong SEO block), xóa các title sau
            for match in reversed(title_matches[1:]):
                if match.start() > seo_end:  # Chỉ xóa title sau SEO block
                    after_seo_cleaned = after_seo_cleaned[:match.start()-seo_end] + after_seo_cleaned[match.end()-seo_end:]
                    cleaned = True
                    print(f"   → Xóa title tag trùng")

        # Xóa og:title, og:description trùng lặp (nếu có)
        og_title_pattern = r'<meta\s+property="og:title"\s+content="[^"]*"\s*/?>\s*\n?'
        og_desc_pattern = r'<meta\s+property="og:description"\s+content="[^"]*"\s*/?>\s*\n?'

        # Đếm số lượng og:title trong after_seo
        og_title_matches = list(re.finditer(og_title_pattern, after_seo_cleaned))
        if len(og_title_matches) > 0:
            # Xóa og:title trùng (giữ lại cái trong SEO block)
            after_seo_cleaned = re.sub(og_title_pattern, '', after_seo_cleaned)
            cleaned = True
            print(f"   → Xóa og:title trùng")

        og_desc_matches = list(re.finditer(og_desc_pattern, after_seo_cleaned))
        if len(og_desc_matches) > 0:
            after_seo_cleaned = re.sub(og_desc_pattern, '', after_seo_cleaned)
            cleaned = True
            print(f"   → Xóa og:description trùng")

        # Xóa canonical trùng
        canonical_pattern_after = r'<link\s+rel="canonical"\s+href="[^"]*"\s*/?>\s*\n?'
        canonical_matches = list(re.finditer(canonical_pattern_after, after_seo_cleaned))
        if len(canonical_matches) > 0:
            after_seo_cleaned = re.sub(canonical_pattern_after, '', after_seo_cleaned)
            cleaned = True
            print(f"   → Xóa canonical trùng")

        # Ghi file nếu có thay đổi
        if cleaned:
            new_content = before_seo + seo_block + after_seo_cleaned
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            return True, f"Đã làm sạch (xóa {desc_count} meta tags trùng)"
        else:
            return False, "Không cần làm sạch"

    except Exception as e:
        return False, f"Lỗi: {str(e)}"


def should_exclude(path: str) -> bool:
    return any(pattern in path for pattern in EXCLUDE_PATTERNS)


def main():
    html_files = []
    for root, dirs, files in os.walk(BASE_DIR):
        dirs[:] = [d for d in dirs if not should_exclude(d)]
        for file in files:
            if file.endswith('.html') and not should_exclude(root):
                html_files.append(os.path.join(root, file))

    print(f"Tìm thấy {len(html_files)} file HTML")
    print("=" * 60)

    cleaned_count = 0
    for file_path in sorted(html_files):
        success, message = clean_html_file(file_path)
        if success:
            cleaned_count += 1
            rel_path = file_path.replace(BASE_DIR + '/', '')[:55]
            print(f"✅ {rel_path} - {message}")
        elif "Chưa có SEO block" not in message:
            rel_path = file_path.replace(BASE_DIR + '/', '')[:55]
            print(f"⏭️  {rel_path} - {message}")

    print("=" * 60)
    print(f"Đã làm sạch: {cleaned_count} files")


if __name__ == "__main__":
    main()

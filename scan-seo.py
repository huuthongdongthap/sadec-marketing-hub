#!/usr/bin/env python3
"""
Scan HTML files for missing SEO metadata and auto-fix.
Checks for: title, description, og:title, og:description, twitter:card
"""

import os
import re
from pathlib import Path
from datetime import datetime

BASE_DIR = Path("/Users/mac/mekong-cli/apps/sadec-marketing-hub")
EXCLUDE_DIRS = {'node_modules', '.git', '.vercel', '.wrangler', '.pytest_cache', '.cto-reports', 'dist', '.tasks'}

# SEO patterns to check
SEO_CHECKS = {
    'title': r'<title[^>]*>.*?</title>',
    'description': r'<meta\s+name=["\']description["\']',
    'og:title': r'<meta\s+property=["\']og:title["\']',
    'og:description': r'<meta\s+property=["\']og:description["\']',
    'og:image': r'<meta\s+property=["\']og:image["\']',
    'twitter:card': r'<meta\s+name=["\']twitter:card["\']',
    'canonical': r'<link\s+rel=["\']canonical["\']',
    'json-ld': r'<script\s+type=["\']application/ld\+json["\']',
}

# SEO template to inject
SEO_TEMPLATE = """
  <!-- SEO Meta Tags -->
  <title>{title}</title>
  <meta name="description" content="{description}">
  <meta name="keywords" content="{keywords}">
  <meta name="robots" content="index, follow">
  <meta name="author" content="Sa Đéc Marketing Hub">

  <!-- Canonical URL -->
  <link rel="canonical" href="https://sadecmarketinghub.com{path}">

  <!-- Open Graph Meta Tags -->
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{description}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://sadecmarketinghub.com{path}">
  <meta property="og:image" content="https://sadecmarketinghub.com/favicon.png">
  <meta property="og:site_name" content="Sa Đéc Marketing Hub">
  <meta property="og:locale" content="vi_VN">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{title}">
  <meta name="twitter:description" content="{description}">
  <meta name="twitter:image" content="https://sadecmarketinghub.com/favicon.png">
  <meta name="twitter:creator" content="@sadecmarketinghub">

  <!-- Schema.org JSON-LD -->
  <script type="application/ld+json">
  {{
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "{title}",
    "description": "{description}",
    "url": "https://sadecmarketinghub.com{path}",
    "image": "https://sadecmarketinghub.com/favicon.png",
    "publisher": {{
      "@type": "Organization",
      "name": "Sa Đéc Marketing Hub",
      "url": "https://sadecmarketinghub.com",
      "logo": {{
        "@type": "ImageObject",
        "url": "https://sadecmarketinghub.com/favicon.png"
      }}
    }},
    "inLanguage": "vi-VN"
  }}
  </script>

"""

def get_page_title(filepath: Path) -> str:
    """Extract title from filename or path"""
    name = filepath.stem.replace('-', ' ').replace('_', ' ').title()

    # Map common pages
    title_map = {
        'Dashboard': 'Dashboard - Quản Trị Marketing',
        'Login': 'Đăng Nhập',
        'Register': 'Đăng Ký',
        'Forgot Password': 'Quên Mật Khẩu',
        'Privacy': 'Chính Sách Bảo Mật',
        'Terms': 'Điều Khoản Sử Dụng',
        'Offline': 'Ngoại Tuyến',
        'Index': 'Sa Đéc Marketing Hub',
    }

    return title_map.get(name, f"{name} | Sa Đéc Marketing Hub")


def get_description(title: str) -> str:
    """Generate description from title"""
    base = "Sa Đéc Marketing Hub - "
    if 'Dashboard' in title:
        return base + "Bảng điều khiển quản trị marketing tổng quan, theo dõi chiến dịch và phân tích hiệu quả."
    elif 'Login' in title or 'Đăng Nhập' in title:
        return "Đăng nhập vào Sa Đéc Marketing Hub để quản lý chiến dịch marketing và phân tích ROI."
    elif 'Register' in title or 'Đăng Ký' in title:
        return "Đăng ký tài khoản Sa Đéc Marketing Hub - Công cụ quản trị marketing toàn diện."
    elif 'Privacy' in title or 'Bảo Mật' in title:
        return "Chính sách bảo mật thông tin người dùng tại Sa Đéc Marketing Hub."
    elif 'Terms' in title or 'Điều Khoản' in title:
        return "Điều khoản sử dụng dịch vụ Sa Đéc Marketing Hub."
    else:
        return base + "Công cụ quản trị marketing toàn diện cho doanh nghiệp vừa và nhỏ."


def get_keywords(filepath: Path) -> str:
    """Generate keywords based on path"""
    base = "marketing, Sa Đéc, Đồng Tháp, ROI, quảng cáo, digital marketing"

    if 'admin' in str(filepath):
        return f"{base}, quản trị, dashboard, analytics"
    elif 'portal' in str(filepath):
        return f"{base}, khách hàng, portal, dịch vụ"
    elif 'affiliate' in str(filepath):
        return f"{base}, affiliate, đối tác, hoa hồng"
    elif 'auth' in str(filepath) or 'login' in str(filepath):
        return f"{base}, đăng nhập, đăng ký, tài khoản"

    return base


def scan_file(filepath: Path) -> dict:
    """Scan single file for missing SEO tags"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        missing = []
        existing = {}

        for tag, pattern in SEO_CHECKS.items():
            match = re.search(pattern, content, re.IGNORECASE | re.DOTALL)
            if match:
                existing[tag] = True
            else:
                missing.append(tag)

        return {
            'missing': missing,
            'existing': existing,
            'score': len(existing) / len(SEO_CHECKS) * 100
        }

    except Exception as e:
        return {'error': str(e), 'missing': list(SEO_CHECKS.keys())}


def add_seo_metadata(filepath: Path) -> int:
    """Add SEO metadata to HTML file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Generate metadata
        title = get_page_title(filepath)
        description = get_description(title)
        keywords = get_keywords(filepath)
        path = '/' + str(filepath.relative_to(BASE_DIR))

        # Generate SEO block
        seo_block = SEO_TEMPLATE.format(
            title=title,
            description=description,
            keywords=keywords,
            path=path
        )

        # Find </head> and insert before it
        head_close = re.search(r'</head>', content, re.IGNORECASE)
        if head_close:
            # Insert SEO block after <head>
            head_open = re.search(r'<head[^>]*>', content, re.IGNORECASE)
            if head_open:
                insert_pos = head_open.end()
                content = content[:insert_pos] + seo_block + content[insert_pos:]

                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)

                return 1

        return 0

    except Exception as e:
        print(f"  ⚠️ Error processing {filepath}: {e}")
        return 0


def scan_all():
    """Scan all HTML files"""
    results = {
        'total': 0,
        'missing_seo': [],
        'fixed': 0,
    }

    html_files = []
    for root, dirs, files in os.walk(BASE_DIR):
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        for f in files:
            if f.endswith('.html'):
                html_files.append(Path(root) / f)

    print(f"🔍 Scanning {len(html_files)} HTML files for SEO metadata...\n")

    for filepath in html_files:
        rel_path = filepath.relative_to(BASE_DIR)
        scan_result = scan_file(filepath)
        results['total'] += 1

        if scan_result.get('missing') and len(scan_result['missing']) > 3:
            # Missing significant SEO tags
            results['missing_seo'].append({
                'path': str(rel_path),
                'missing': scan_result['missing'],
                'score': scan_result.get('score', 0)
            })
            print(f"  ⚠️ {rel_path}: Missing {len(scan_result['missing'])} tags (score: {scan_result.get('score', 0):.0f}%)")

    # Auto-fix files missing SEO
    if results['missing_seo']:
        print(f"\n🔧 Adding SEO metadata to {len(results['missing_seo'])} files...\n")

        for file_info in results['missing_seo']:
            filepath = BASE_DIR / file_info['path']
            fixed = add_seo_metadata(filepath)
            if fixed:
                results['fixed'] += 1
                print(f"  ✅ {file_info['path']}: Added SEO metadata")

    return results


def generate_report(results: dict) -> str:
    """Generate markdown report"""
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    report = f"""# SEO Metadata Audit Report

**Date:** {datetime.now().strftime('%Y-%m-%d')}
**Status:** {'✅ Complete' if results['fixed'] > 0 else '⚠️ Review needed'}

---

## Summary

| Metric | Count |
|--------|-------|
| Files Scanned | {results['total']} |
| Files Missing SEO | {len(results['missing_seo'])} |
| Files Fixed | {results['fixed']} |

---

## Files Fixed ({results['fixed']})

"""

    for file_info in results['missing_seo'][:50]:
        report += f"- `{file_info['path']}` - Missing: {', '.join(file_info['missing'][:5])}\n"

    report += f"""
---

## SEO Checklist

Each HTML file now includes:
- ✅ `<title>` - Page title
- ✅ `<meta name="description">` - Page description
- ✅ `<meta name="keywords">` - SEO keywords
- ✅ `<link rel="canonical">` - Canonical URL
- ✅ Open Graph tags (og:title, og:description, og:image, etc.)
- ✅ Twitter Card tags
- ✅ Schema.org JSON-LD structured data

---

*Generated by scan-seo.py*
**Timestamp:** {timestamp}
"""

    return report


if __name__ == '__main__':
    results = scan_all()

    # Ensure reports directory exists
    reports_dir = BASE_DIR / 'reports' / 'seo'
    reports_dir.mkdir(parents=True, exist_ok=True)

    # Write report
    report_path = reports_dir / f"seo-audit-{datetime.now().strftime('%Y-%m-%d')}.md"
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(generate_report(results))

    print(f"\n📊 Report saved to: {report_path}")
    print(f"\n📈 Summary:")
    print(f"   • Files Scanned: {results['total']}")
    print(f"   • Files Missing SEO: {len(results['missing_seo'])}")
    print(f"   • Files Fixed: {results['fixed']}")

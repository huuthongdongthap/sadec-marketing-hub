#!/usr/bin/env python3
"""
SEO Metadata Checker & Generator for Sa Đéc Marketing Hub
Quét HTML files và kiểm tra/bổ sung SEO metadata
"""

import os
import re
from pathlib import Path
from typing import Dict, List, Optional

# Base URL
BASE_URL = "https://sadecmarketinghub.com"

# SEO Template cho từng loại page
SEO_TEMPLATES = {
    "admin": {
        "title": "{page} - Quản Trị Marketing | Sa Đéc Marketing Hub",
        "description": "Công cụ quản trị {page} - Quản lý và theo dõi hiệu quả marketing.",
        "og_type": "website",
    },
    "portal": {
        "title": "{page} - Khách Hàng | Sa Đéc Marketing Hub",
        "description": "Trang {page} dành cho khách hàng - Theo dõi và quản lý chiến dịch.",
        "og_type": "website",
    },
    "affiliate": {
        "title": "{page} - Affiliate Marketing | Sa Đéc Hub",
        "description": "Trang {page} cho đối tác affiliate - Quản lý hoa hồng và referrals.",
        "og_type": "website",
    },
}

# Page names mapping
PAGE_NAMES = {
    "dashboard": "Bảng điều khiển",
    "campaigns": "Chiến dịch",
    "leads": "Khách hàng tiềm năng",
    "reports": "Báo cáo",
    "settings": "Cài đặt",
    "payments": "Thanh toán",
    "notifications": "Thông báo",
    "projects": "Dự án",
    "missions": "Nhiệm vụ",
    "commissions": "Hoa hồng",
    "referrals": "Giới thiệu",
    "links": "Liên kết",
    "profile": "Hồ sơ",
    "media": "Thư viện",
    "inventory": "Kho hàng",
    "loyalty": "Khách hàng thân thiết",
    "menu": "Thực đơn",
    "pos": "Bán hàng",
    "quality": "Kiểm soát chất lượng",
    "roiaas-admin": "ROI Admin",
    "roiaas-dashboard": "ROI Dashboard",
    "roiaas-onboarding": "ROI Onboarding",
    "ocop-exporter": "OCOP Exporter",
    "ocop-catalog": "OCOP Catalog",
    "subscriptions": "Gói đăng ký",
    "subscription-plans": "Gói đăng ký",
    "invoices": "Hóa đơn",
    "credits": "Tín dụng",
    "assets": "Tài sản",
    "payments": "Thanh toán",
    "approve": "Duyệt",
    "onboarding": "Hướng dẫn",
    "agents": "AI Agents",
    "ai-analysis": "Phân tích AI",
    "api-builder": "API Builder",
    "approvals": "Duyệt",
    "auth": "Xác thực",
    "binh-phap": "Binh Pháp",
    "brand-guide": "Hướng dẫn thương hiệu",
    "community": "Cộng đồng",
    "components-demo": "Demo Components",
    "content-calendar": "Lịch nội dung",
    "customer-success": "Thành công khách hàng",
    "deploy": "Deploy",
    "docs": "Tài liệu",
    "ecommerce": "Thương mại điện tử",
    "events": "Sự kiện",
    "finance": "Tài chính",
    "hr-hiring": "Tuyển dụng",
    "landing-builder": "Trang đích",
    "legal": "Pháp lý",
    "lms": "LMS",
    "mvp-launch": "MVP Launch",
    "notifications": "Thông báo",
    "onboarding": "Hướng dẫn",
    "payments": "Thanh toán",
    "pipeline": "Sales Pipeline",
    "pos": "POS",
    "pricing": "Bảng giá",
    "proposals": "Đề xuất",
    "quality": "Chất lượng",
    "raas-overview": "RaaS Overview",
    "retention": "Giữ chân",
    "roiaas-admin": "ROI Admin",
    "shifts": "Ca làm việc",
    "suppliers": "Nhà cung cấp",
    "ui-demo": "UI Demo",
    "vc-readiness": "VC Readiness",
    "video-workflow": "Video Workflow",
    "widgets-demo": "Widgets Demo",
    "workflows": "Quy trình",
    "zalo": "Zalo",
}


def extract_page_name(filepath: str) -> str:
    """Extract page name from filepath"""
    name = Path(filepath).stem
    # Remove common suffixes
    for suffix in ["-page", "-view", "-list", "-new", "-edit"]:
        name = name.replace(suffix, "")
    return name


def has_og_title(content: str) -> bool:
    """Check if file has og:title"""
    return '<meta property="og:title"' in content or '<meta property="og:title"' in content


def has_description(content: str) -> bool:
    """Check if file has description meta tag"""
    return '<meta name="description"' in content


def has_twitter_card(content: str) -> bool:
    """Check if file has Twitter Card"""
    return '<meta name="twitter:card"' in content


def has_canonical(content: str) -> bool:
    """Check if file has canonical URL"""
    return '<link rel="canonical"' in content


def generate_seo_metadata(page_type: str, page_name: str, filename: str) -> str:
    """Generate SEO metadata block for a page"""

    # Get display name
    display_name = PAGE_NAMES.get(page_name, page_name.replace("-", " ").title())

    # Get template
    template = SEO_TEMPLATES.get(page_type, SEO_TEMPLATES["admin"])

    # Generate title and description
    title = template["title"].format(page=display_name)
    description = template["description"].format(page=display_name.lower())

    # Build canonical URL
    canonical = f"{BASE_URL}/{page_type}/{filename}"

    # Generate metadata block
    metadata = f"""  <!-- SEO Meta Tags -->
  <title>{title}</title>
  <meta name="description" content="{description}">
  <meta name="keywords" content="{page_name}, marketing, Sa Đéc, Đồng Tháp">
  <meta name="robots" content="index, follow">
  <meta name="author" content="Sa Đéc Marketing Hub">

  <!-- Canonical URL -->
  <link rel="canonical" href="{canonical}">

  <!-- Open Graph Meta Tags -->
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{description}">
  <meta property="og:type" content="{template['og_type']}">
  <meta property="og:url" content="{canonical}">
  <meta property="og:image" content="{BASE_URL}/favicon.png">
  <meta property="og:site_name" content="Sa Đéc Marketing Hub">
  <meta property="og:locale" content="vi_VN">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{title}">
  <meta name="twitter:description" content="{description}">
  <meta name="twitter:image" content="{BASE_URL}/favicon.png">
  <meta name="twitter:creator" content="@sadecmarketinghub">
"""

    return metadata


def inject_metadata(content: str, metadata: str) -> str:
    """Inject metadata after <head> tag"""

    # Find <head> tag
    head_match = re.search(r'<head>', content, re.IGNORECASE)
    if not head_match:
        return content

    # Insert after <head>
    insert_pos = head_match.end()

    # Check if there's a newline after <head>
    if content[insert_pos] == '\n':
        insert_pos += 1

    return content[:insert_pos] + '\n' + metadata + '\n' + content[insert_pos:]


def scan_directory(base_path: str) -> Dict[str, List[Dict]]:
    """Scan directory for HTML files and check SEO metadata"""

    results = {
        "missing_og": [],
        "missing_description": [],
        "missing_twitter": [],
        "missing_canonical": [],
        "complete": []
    }

    for root, dirs, files in os.walk(base_path):
        # Skip node_modules and dist
        if 'node_modules' in root or 'dist' in root:
            continue

        for file in files:
            if not file.endswith('.html'):
                continue

            filepath = os.path.join(root, file)
            rel_path = os.path.relpath(filepath, base_path)

            # Determine page type
            page_type = "admin"  # default
            if '/portal/' in rel_path:
                page_type = "portal"
            elif '/affiliate/' in rel_path:
                page_type = "affiliate"

            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            # Check metadata
            has_og = has_og_title(content)
            has_desc = has_description(content)
            has_twitter = has_twitter_card(content)
            has_canon = has_canonical(content)

            file_info = {
                "path": rel_path,
                "type": page_type,
                "name": extract_page_name(file)
            }

            if not has_og:
                results["missing_og"].append(file_info)
            if not has_desc:
                results["missing_description"].append(file_info)
            if not has_twitter:
                results["missing_twitter"].append(file_info)
            if not has_canon:
                results["missing_canonical"].append(file_info)

            if has_og and has_desc and has_twitter and has_canon:
                results["complete"].append(file_info)

    return results


def fix_file(filepath: str, page_type: str, page_name: str, filename: str):
    """Add SEO metadata to a file"""

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if already has metadata
    if has_og_title(content):
        print(f"  ⏭️  {filepath} already has SEO metadata")
        return False

    # Generate and inject metadata
    metadata = generate_seo_metadata(page_type, page_name, filename)
    new_content = inject_metadata(content, metadata)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f"  ✅ Fixed: {filepath}")
    return True


def main():
    base_path = "/Users/mac/.gemini/antigravity/scratch/sadec-marketing-hub"

    print("🔍 Scanning HTML files for SEO metadata...\n")

    results = scan_directory(base_path)

    print(f"📊 Results:")
    print(f"  ✅ Complete: {len(results['complete'])} files")
    print(f"  ⚠️  Missing OG tags: {len(results['missing_og'])} files")
    print(f"  ⚠️  Missing description: {len(results['missing_description'])} files")
    print(f"  ⚠️  Missing Twitter Card: {len(results['missing_twitter'])} files")
    print(f"  ⚠️  Missing canonical: {len(results['missing_canonical'])} files")

    # Show files that need fixing
    all_missing = set()
    for key in ["missing_og", "missing_description", "missing_twitter", "missing_canonical"]:
        for item in results[key]:
            all_missing.add(item["path"])

    if all_missing:
        print(f"\n📝 Files needing SEO metadata ({len(all_missing)}):")
        for path in sorted(all_missing)[:20]:  # Show first 20
            print(f"  - {path}")
        if len(all_missing) > 20:
            print(f"  ... and {len(all_missing) - 20} more")

    # Auto-fix option
    print("\n🔧 Auto-fixing files missing SEO metadata...")
    fixed_count = 0

    for key in ["missing_og"]:  # Fix files missing OG tags (implies others too)
        for item in results[key]:
            filepath = os.path.join(base_path, item["path"])
            fixed = fix_file(filepath, item["type"], item["name"], os.path.basename(item["path"]))
            if fixed:
                fixed_count += 1

    print(f"\n✅ Fixed {fixed_count} files")
    print("\n✨ SEO metadata scan complete!")


if __name__ == "__main__":
    main()

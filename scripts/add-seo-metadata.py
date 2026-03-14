#!/usr/bin/env python3
"""
SEO Metadata Adder Script
Adds comprehensive SEO metadata to HTML pages missing it
"""

import os
import re
from pathlib import Path

# SEO Template
SEO_TEMPLATE = '''
  <!-- SEO Meta Tags -->
  <title>{title}</title>
  <meta name="description" content="{description}">
  <meta name="keywords" content="{keywords}">
  <meta name="robots" content="index, follow">
  <meta name="author" content="Sa Đéc Marketing Hub">

  <!-- Canonical URL -->
  <link rel="canonical" href="{canonical}">

  <!-- Open Graph Meta Tags -->
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{description}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="{canonical}">
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
    "url": "{canonical}",
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

'''

# Page metadata mapping
PAGE_METADATA = {
    # Admin pages
    'admin/campaigns.html': {
        'title': 'Chiến Dịch Marketing | Campaigns - Sa Đéc Marketing Hub',
        'description': 'Quản lý chiến dịch marketing đa kênh. Theo dõi hiệu suất, ngân sách và ROI.',
        'keywords': 'campaigns, chiến dịch, marketing, đa kênh, ROI, ngân sách'
    },
    'admin/leads.html': {
        'title': 'Quản Lý Leads - Sa Đéc Marketing Hub',
        'description': 'Quản lý leads và khách hàng tiềm năng. Pipeline, scoring và conversion tracking.',
        'keywords': 'leads, khách hàng tiềm năng, pipeline, conversion, CRM'
    },
    'admin/finance.html': {
        'title': 'Tài Chính & Kế Toán - Sa Đéc Marketing Hub',
        'description': 'Quản lý tài chính, doanh thu, chi phí và báo cáo kế toán.',
        'keywords': 'finance, tài chính, kế toán, doanh thu, chi phí, báo cáo'
    },
    'admin/reports.html': {
        'title': 'Báo Cáo & Analytics - Sa Đéc Marketing Hub',
        'description': 'Báo cáo hiệu suất marketing chi tiết. Analytics, insights và đề xuất.',
        'keywords': 'reports, báo cáo, analytics, insights, hiệu suất'
    },
    'admin/pipeline.html': {
        'title': 'Sales Pipeline - Sa Đéc Marketing Hub',
        'description': 'Quản lý pipeline bán hàng trực quan. Kanban board và deal tracking.',
        'keywords': 'pipeline, sales, kanban, deals, bán hàng'
    },
    
    # Portal pages
    'portal/projects.html': {
        'title': 'Dự Án Của Tôi - Sa Đéc Marketing Hub',
        'description': 'Xem và quản lý các dự án marketing đang thực hiện.',
        'keywords': 'projects, dự án, marketing, tiến độ'
    },
    'portal/invoices.html': {
        'title': 'Hóa Đơn & Thanh Toán - Sa Đéc Marketing Hub',
        'description': 'Quản lý hóa đơn và thanh toán trực tuyến. Lịch sử giao dịch.',
        'keywords': 'invoices, hóa đơn, thanh toán, transactions, billing'
    },
    'portal/reports.html': {
        'title': 'Báo Cáo Kết Quả - Sa Đéc Marketing Hub',
        'description': 'Báo cáo kết quả chiến dịch và ROI chi tiết.',
        'keywords': 'reports, báo cáo, kết quả, ROI, chiến dịch'
    },
}

def add_seo_to_file(filepath: str, metadata: dict) -> bool:
    """Add SEO metadata to HTML file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if SEO already exists
        if '<!-- SEO Meta Tags -->' in content:
            print(f"  ⏭️  SEO already exists, skipping...")
            return False
        
        # Find position after <head>
        head_match = re.search(r'<head>', content, re.IGNORECASE)
        if not head_match:
            print(f"  ❌ No <head> tag found")
            return False
        
        # Build canonical URL from filepath
        rel_path = filepath.replace('/Users/mac/mekong-cli/apps/sadec-marketing-hub/', '')
        canonical = f"https://sadecmarketinghub.com/{rel_path}"
        
        # Generate SEO block
        seo_block = SEO_TEMPLATE.format(
            title=metadata['title'],
            description=metadata['description'],
            keywords=metadata['keywords'],
            canonical=canonical
        )
        
        # Insert after <head>
        insert_pos = head_match.end()
        new_content = content[:insert_pos] + '\n' + seo_block + content[insert_pos:]
        
        # Write back
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"  ✅ SEO metadata added!")
        return True
        
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return False

def main():
    base_dir = '/Users/mac/mekong-cli/apps/sadec-marketing-hub'
    updated = 0
    skipped = 0
    
    print("🔍 Scanning for pages missing SEO metadata...\n")
    
    for rel_path, metadata in PAGE_METADATA.items():
        filepath = os.path.join(base_dir, rel_path)
        if os.path.exists(filepath):
            print(f"📄 {rel_path}")
            if add_seo_to_file(filepath, metadata):
                updated += 1
            else:
                skipped += 1
        else:
            print(f"  ⚠️  File not found, skipping...")
            skipped += 1
    
    print(f"\n✅ Done! Updated: {updated}, Skipped: {skipped}")

if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""
SEO Metadata Fixer for Sa Đéc Marketing Hub
Sửa vấn đề trùng lặp metadata bằng cách thay thế thay vì thêm vào
"""

import os
import re
from pathlib import Path
from typing import Tuple, Optional

# Base URL cho canonical links
BASE_URL = "https://sadecmarketinghub.com"
DEFAULT_TITLE = "Sa Đéc Marketing Hub - Digital Marketing Agency"
DEFAULT_DESCRIPTION = "Giải pháp marketing số toàn diện cho doanh nghiệp vùng ĐBSCL. Tăng trưởng doanh thu với công nghệ AI."

# Các file/directory cần bỏ qua
EXCLUDE_PATTERNS = ["node_modules", "playwright-report", ".git", ".vercel"]

# Mapping path -> SEO metadata
SEO_METADATA = {
    # Root files
    "index.html": {
        "title": "Mekong Agency - Digital Marketing cho Doanh Nghiệp Địa Phương",
        "description": "Giải pháp marketing số toàn diện cho SME vùng ĐBSCL. Tăng trưởng doanh thu, xây dựng thương hiệu với chi phí tiết kiệm.",
        "type": "website"
    },
    "login.html": {
        "title": "Đăng Nhập - Mekong Agency Portal",
        "description": "Đăng nhập vào hệ thống quản lý marketing, theo dõi chiến dịch và hiệu quả kinh doanh.",
        "type": "website"
    },
    "register.html": {
        "title": "Đăng Ký Tài Khoản - Mekong Agency",
        "description": "Tạo tài khoản miễn phí, bắt đầu sử dụng các công cụ marketing AI cho doanh nghiệp của bạn.",
        "type": "website"
    },
    "forgot-password.html": {
        "title": "Quên Mật Khẩu - Khôi Phục Tài Khoản",
        "description": "Khôi phục mật khẩu tài khoản Mekong Agency nhanh chóng và an toàn.",
        "type": "website"
    },
    "verify-email.html": {
        "title": "Xác Thực Email - Mekong Agency",
        "description": "Xác thực địa chỉ email để hoàn tất đăng ký tài khoản Mekong Agency.",
        "type": "website"
    },
    "lp.html": {
        "title": "Landing Page - Mekong Agency",
        "description": "Trang landing page giới thiệu dịch vụ marketing số Mekong Agency.",
        "type": "website"
    },
    "privacy.html": {
        "title": "Chính Sách Bảo Mật - Mekong Agency",
        "description": "Chính sách bảo mật và bảo vệ dữ liệu cá nhân của Mekong Agency, tuân thủ PDPA Việt Nam.",
        "type": "website"
    },
    "terms.html": {
        "title": "Điều Khoản Sử Dụng - Mekong Agency",
        "description": "Điều khoản sử dụng dịch vụ marketing số của Mekong Agency cho doanh nghiệp.",
        "type": "website"
    },
    "offline.html": {
        "title": "Mất Kết Nối - Mekong Agency",
        "description": "Trang hiển thị khi mất kết nối internet, vui lòng kiểm tra lại kết nối mạng.",
        "type": "website"
    },

    # Admin pages
    "admin/dashboard.html": {
        "title": "Admin Dashboard - Mekong Agency Management",
        "description": "Bảng điều khiển quản trị - Theo dõi KPIs, doanh thu, và hiệu suất chiến dịch marketing realtime.",
        "type": "website"
    },
    "admin/leads.html": {
        "title": "Quản Lý Leads - Mekong Agency Admin",
        "description": "Hệ thống quản lý leads, theo dõi prospects và tối ưu hóa chuyển đổi khách hàng tiềm năng.",
        "type": "website"
    },
    "admin/campaigns.html": {
        "title": "Chiến Dịch Marketing - Mekong Agency Admin",
        "description": "Quản lý và theo dõi hiệu quả các chiến dịch marketing đa kênh: Facebook, Google, TikTok, Zalo.",
        "type": "website"
    },
    "admin/content-calendar.html": {
        "title": "Lịch Nội Dung - Content Calendar",
        "description": "Lên lịch và quản lý nội dung đăng tải trên các nền tảng mạng xã hội và website.",
        "type": "website"
    },
    "admin/pricing.html": {
        "title": "Bảng Giá Dịch Vụ - Mekong Agency",
        "description": "Bảng giá các gói dịch vụ marketing số cho doanh nghiệp SME. Tư vấn miễn phí.",
        "type": "website"
    },
    "admin/proposals.html": {
        "title": "Báo Giá & Đề Xuất - Proposals",
        "description": "Tạo và quản lý các báo giá, đề xuất dịch vụ marketing cho khách hàng.",
        "type": "website"
    },
    "admin/payments.html": {
        "title": "Quản Lý Thanh Toán - Payments",
        "description": "Theo dõi thanh toán, hóa đơn và giao dịch từ khách hàng.",
        "type": "website"
    },
    "admin/onboarding.html": {
        "title": "Khách Hàng Mới - Onboarding",
        "description": "Quy trình onboard khách hàng mới, thu thập thông tin và thiết lập chiến dịch.",
        "type": "website"
    },
    "admin/approvals.html": {
        "title": "Phê Duyệt Nội Dung - Content Approvals",
        "description": "Hệ thống phê duyệt nội dung trước khi đăng tải trên các kênh marketing.",
        "type": "website"
    },
    "admin/analytics.html": {
        "title": "Phân Tích & Báo Cáo - Analytics",
        "description": "Báo cáo và phân tích hiệu quả chiến dịch marketing với các chỉ số chi tiết.",
        "type": "website"
    },
    "admin/brand-guide.html": {
        "title": "Brand Guidelines - Hướng Dẫn Thương Hiệu",
        "description": "Tài liệu hướng dẫn sử dụng thương hiệu, màu sắc, font chữ và tone giọng.",
        "type": "website"
    },
    "admin/community.html": {
        "title": "Cộng Đồng - Community Hub",
        "description": "Kết nối doanh nghiệp địa phương, chia sẻ kinh nghiệm marketing và phát triển kinh doanh.",
        "type": "website"
    },
    "admin/events.html": {
        "title": "Sự Kiện - Events & Workshops",
        "description": "Đăng ký và quản lý tham gia các sự kiện, workshop marketing và networking.",
        "type": "website"
    },
    "admin/finance.html": {
        "title": "Tài Chính - Finance Management",
        "description": "Quản lý tài chính, dòng tiền, công nợ và báo cáo tài chính doanh nghiệp.",
        "type": "website"
    },
    "admin/hr-hiring.html": {
        "title": "Tuyển Dụng - HR & Hiring",
        "description": "Quản lý tuyển dụng, hồ sơ ứng viên và quy trình onboarding nhân sự.",
        "type": "website"
    },
    "admin/legal.html": {
        "title": "Pháp Lý - Legal Documents",
        "description": "Tài liệu pháp lý, hợp đồng và các mẫu biểu pháp luật doanh nghiệp.",
        "type": "website"
    },
    "admin/lms.html": {
        "title": "LMS - Học Liệu Marketing",
        "description": "Hệ thống học liệu và đào tạo marketing online cho doanh nghiệp.",
        "type": "website"
    },
    "admin/mvp-launch.html": {
        "title": "MVP Launch - Ra Mắt Sản Phẩm",
        "description": "Quy trình ra mắt sản phẩm mới, MVP testing và go-to-market strategy.",
        "type": "website"
    },
    "admin/pipeline.html": {
        "title": "Sales Pipeline - Ống Kính Bán Hàng",
        "description": "Quản lý pipeline bán hàng, theo dõi deals và dự báo doanh thu.",
        "type": "website"
    },
    "admin/retention.html": {
        "title": "Giữ Chân Khách Hàng - Customer Retention",
        "description": "Chiến lược và công cụ giữ chân khách hàng, giảm churn rate.",
        "type": "website"
    },
    "admin/vc-readiness.html": {
        "title": "VC Readiness - Sẵn Kêu Gọi Vốn",
        "description": "Chuẩn bị hồ sơ, pitch deck và chiến lược gọi vốn từ venture capital.",
        "type": "website"
    },
    "admin/video-workflow.html": {
        "title": "Video Workflow - Sản Xuất Video",
        "description": "Quy trình sản xuất video content marketing từ A-Z.",
        "type": "website"
    },
    "admin/workflows.html": {
        "title": "Workflows - Quy Trình Làm Việc",
        "description": "Tự động hóa quy trình làm việc và tích hợp các công cụ marketing.",
        "type": "website"
    },
    "admin/agents.html": {
        "title": "AI Agents - Trợ Lý AI",
        "description": "Đội ngũ AI agents tự động hóa các tác vụ marketing và bán hàng.",
        "type": "website"
    },
    "admin/ai-analysis.html": {
        "title": "AI Analysis - Phân Tích Thông Minh",
        "description": "Phân tích dữ liệu marketing bằng AI, đề xuất chiến lược tối ưu.",
        "type": "website"
    },
    "admin/api-builder.html": {
        "title": "API Builder - Xây Dựng API",
        "description": "Công cụ xây dựng và quản lý API integration cho marketing stack.",
        "type": "website"
    },
    "admin/auth.html": {
        "title": "Xác Thực - Authentication",
        "description": "Quản lý xác thực người dùng, phân quyền và bảo mật truy cập.",
        "type": "website"
    },
    "admin/binh-phap.html": {
        "title": "Binh Pháp Marketing - Strategy Playbook",
        "description": "Cẩm nang chiến lược marketing theo tư duy binh pháp Tôn Tử.",
        "type": "website"
    },
    "admin/customer-success.html": {
        "title": "Customer Success - Thành Công Khách Hàng",
        "description": "Đảm bảo thành công và hài lòng của khách hàng với dịch vụ.",
        "type": "website"
    },
    "admin/deploy.html": {
        "title": "Deploy - Triển Khai Dự Án",
        "description": "Quy trình deploy và bàn giao dự án marketing cho khách hàng.",
        "type": "website"
    },
    "admin/docs.html": {
        "title": "Tài Liệu - Documentation",
        "description": "Tài liệu hướng dẫn sử dụng platform và các công cụ marketing.",
        "type": "website"
    },
    "admin/ecommerce.html": {
        "title": "E-commerce - Thương Mại Điện Tử",
        "description": "Giải pháp marketing cho cửa hàng online và sàn thương mại điện tử.",
        "type": "website"
    },
    "admin/landing-builder.html": {
        "title": "Landing Page Builder - Tạo Trang Đích",
        "description": "Công cụ kéo thả tạo landing page chuyên nghiệp không cần code.",
        "type": "website"
    },
    "admin/notifications.html": {
        "title": "Thông Báo - Notifications Center",
        "description": "Trung tâm thông báo và alert từ hệ thống.",
        "type": "website"
    },
    "admin/pos.html": {
        "title": "POS - Quản Lý Bán Hàng",
        "description": "Hệ thống quản lý bán hàng tại quầy POS tích hợp marketing.",
        "type": "website"
    },
    "admin/menu.html": {
        "title": "Menu - Quản Lý Thực Đơn",
        "description": "Quản lý thực đơn nhà hàng, quán cà phê tích hợp marketing.",
        "type": "website"
    },
    "admin/inventory.html": {
        "title": "Inventory - Quản Lý Kho",
        "description": "Theo dõi tồn kho và tự động hóa đặt hàng.",
        "type": "website"
    },
    "admin/loyalty.html": {
        "title": "Loyalty - Khách Hàng Thân Thiết",
        "description": "Chương trình khách hàng thân thiết và điểm thưởng.",
        "type": "website"
    },
    "admin/shifts.html": {
        "title": "Shifts - Lịch Ca Làm Việc",
        "description": "Quản lý lịch ca làm việc và chấm công nhân viên.",
        "type": "website"
    },
    "admin/suppliers.html": {
        "title": "Suppliers - Nhà Cung Cấp",
        "description": "Quản lý quan hệ nhà cung cấp và đặt hàng.",
        "type": "website"
    },
    "admin/quality.html": {
        "title": "Quality - Kiểm Soát Chất Lượng",
        "description": "Quy trình kiểm soát chất lượng sản phẩm và dịch vụ.",
        "type": "website"
    },
    "admin/roiaas-admin.html": {
        "title": "ROIaaS Admin - Quản Trị ROI",
        "description": "Quản trị và theo dõi chỉ số ROI chiến dịch marketing.",
        "type": "website"
    },
    "admin/raas-overview.html": {
        "title": "RaaS Overview - Tổng Quan API",
        "description": "Tổng quan về API gateway, endpoints và tích hợp hệ thống.",
        "type": "website"
    },
    "admin/zalo.html": {
        "title": "Zalo Integration - Kết Nối Zalo",
        "description": "Tích hợp Zalo OA, gửi tin nhắn và quản lý kết nối khách hàng qua Zalo.",
        "type": "website"
    },

    # Portal pages
    "portal/dashboard.html": {
        "title": "Dashboard - Mekong Client Portal",
        "description": "Bảng điều khiển khách hàng - Theo dõi chiến dịch, hiệu quả và báo cáo marketing.",
        "type": "website"
    },
    "portal/login.html": {
        "title": "Đăng Nhập Portal - Mekong Agency",
        "description": "Đăng nhập vào portal khách hàng để quản lý chiến dịch marketing.",
        "type": "website"
    },
    "portal/onboarding.html": {
        "title": "Onboarding - Bắt Đầu Sử Dụng",
        "description": "Hướng dẫn bắt đầu sử dụng platform Mekong Agency cho khách hàng mới.",
        "type": "website"
    },
    "portal/subscriptions.html": {
        "title": "Gói Dịch Vụ - Subscriptions",
        "description": "Quản lý gói dịch vụ và đăng ký các tính năng bổ sung.",
        "type": "website"
    },
    "portal/missions.html": {
        "title": "Missions - Giao Nhiệm Vụ AI",
        "description": "Gửi nhiệm vụ AI và theo dõi tiến độ thực thi realtime trên Mekong RaaS Platform.",
        "type": "website"
    },
    "portal/projects.html": {
        "title": "Projects - Dự Án Của Tôi",
        "description": "Quản lý và theo dõi tiến độ các dự án marketing đang thực hiện.",
        "type": "website"
    },
    "portal/payments.html": {
        "title": "Thanh Toán - Payments Portal",
        "description": "Thanh toán hóa đơn và quản lý giao dịch trên portal khách hàng.",
        "type": "website"
    },
    "portal/invoices.html": {
        "title": "Hóa Đơn - Invoices",
        "description": "Xem và tải hóa đơn điện tử từ các giao dịch dịch vụ.",
        "type": "website"
    },
    "portal/credits.html": {
        "title": "Credits - Tín Dụng AI",
        "description": "Quản lý tín dụng AI và lịch sử sử dụng credits.",
        "type": "website"
    },
    "portal/assets.html": {
        "title": "Assets - Tài Sản Số",
        "description": "Thư viện tài sản số: hình ảnh, video, tài liệu marketing.",
        "type": "website"
    },
    "portal/reports.html": {
        "title": "Reports - Báo Cáo Hiệu Quả",
        "description": "Báo cáo chi tiết hiệu quả chiến dịch marketing và ROI.",
        "type": "website"
    },
    "portal/ocop-catalog.html": {
        "title": "OCOP Catalog - Sản Phẩm Địa Phương",
        "description": "Catalog sản phẩm OCOP và đặc sản vùng ĐBSCL.",
        "type": "website"
    },
    "portal/ocop-exporter.html": {
        "title": "OCOP Exporter - Xuất Khẩu OCOP",
        "description": "Công cụ hỗ trợ xuất khẩu sản phẩm OCOP ra thị trường quốc tế.",
        "type": "website"
    },
    "portal/roi-report.html": {
        "title": "ROI Report - Báo Cáo Hoàn Vốn",
        "description": "Báo cáo chi tiết chỉ số hoàn vốn đầu tư marketing (ROI).",
        "type": "website"
    },
    "portal/roiaas-dashboard.html": {
        "title": "ROIaaS Dashboard - Theo Dõi ROI",
        "description": "Dashboard theo dõi ROI realtime cho chiến dịch marketing.",
        "type": "website"
    },
    "portal/roiaas-onboarding.html": {
        "title": "ROIaaS Onboarding - Bắt Đầu Đo Lường ROI",
        "description": "Hướng dẫn thiết lập và bắt đầu đo lường ROI cho chiến dịch.",
        "type": "website"
    },
    "portal/subscription-plans.html": {
        "title": "Gói Đăng Ký - Subscription Plans",
        "description": "So sánh và lựa chọn gói dịch vụ phù hợp cho doanh nghiệp.",
        "type": "website"
    },
    "portal/payment-result.html": {
        "title": "Kết Quả Thanh Toán - Payment Result",
        "description": "Xem kết quả giao dịch thanh toán vừa thực hiện.",
        "type": "website"
    },
    "portal/approve.html": {
        "title": "Phê Duyệt - Approve Content",
        "description": "Phê duyệt nội dung và tài liệu trước khi xuất bản.",
        "type": "website"
    },

    # Affiliate pages
    "affiliate/dashboard.html": {
        "title": "Affiliate Dashboard - Mekong Partners",
        "description": "Bảng điều khiển affiliate - Theo dõi hoa hồng, lượt click và chuyển đổi.",
        "type": "website"
    },
    "affiliate/profile.html": {
        "title": "Affiliate Profile - Hồ Sơ Đối Tác",
        "description": "Quản lý hồ sơ cá nhân và thông tin thanh toán affiliate.",
        "type": "website"
    },
    "affiliate/links.html": {
        "title": "Affiliate Links - Liên Kết Giới Thiệu",
        "description": "Tạo và quản lý các liên kết affiliate tracking.",
        "type": "website"
    },
    "affiliate/media.html": {
        "title": "Affiliate Media - Tài Nguyên Marketing",
        "description": "Thư viện tài nguyên marketing cho affiliate partners.",
        "type": "website"
    },
    "affiliate/referrals.html": {
        "title": "Referrals - Người Được Giới Thiệu",
        "description": "Danh sách người được giới thiệu và trạng thái chuyển đổi.",
        "type": "website"
    },
    "affiliate/settings.html": {
        "title": "Affiliate Settings - Cài Đặt",
        "description": "Cấu hình tài khoản affiliate và phương thức nhận hoa hồng.",
        "type": "website"
    },
    "affiliate/commissions.html": {
        "title": "Commissions - Hoa Hồng",
        "description": "Theo dõi hoa hồng đã kiếm được và lịch sử chi trả.",
        "type": "website"
    },
    # Auth pages
    "auth/login.html": {
        "title": "Đăng Nhập - Mekong Agency Auth",
        "description": "Đăng nhập vào hệ thống Mekong Agency với tài khoản của bạn.",
        "type": "website"
    },
    # Admin components (nested)
    "admin/components/phase-tracker.html": {
        "title": "Phase Tracker - Theo Dõi Giai Đoạn",
        "description": "Component theo dõi tiến độ các giai đoạn dự án marketing.",
        "type": "website"
    },
}


def generate_seo_block(file_path: str, metadata: dict) -> str:
    """Tạo khối SEO metadata hoàn chỉnh"""
    path = file_path.replace("/Users/mac/.gemini/antigravity/scratch/sadec-marketing-hub/", "")

    # Tạo canonical URL từ path
    if path == "index.html":
        canonical_path = ""
    else:
        canonical_path = path.replace("index.html", "").replace(".html", "")
        if canonical_path and not canonical_path.endswith("/"):
            canonical_path += "/"
    canonical_url = f"{BASE_URL}/{canonical_path}" if canonical_path else BASE_URL

    title = metadata.get("title", DEFAULT_TITLE)
    description = metadata.get("description", DEFAULT_DESCRIPTION)
    og_type = metadata.get("type", "website")

    # Tạo OG image URL
    og_image = f"{BASE_URL}/favicon.png"

    seo_block = f"""
  <!-- SEO Meta Tags -->
  <title>{title}</title>
  <meta name="description" content="{description}">

  <!-- Canonical URL -->
  <link rel="canonical" href="{canonical_url}">

  <!-- Open Graph Meta Tags -->
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{description}">
  <meta property="og:type" content="{og_type}">
  <meta property="og:url" content="{canonical_url}">
  <meta property="og:image" content="{og_image}">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{title}">
  <meta name="twitter:description" content="{description}">
  <meta name="twitter:image" content="{og_image}">

  <!-- Schema.org JSON-LD -->
  <script type="application/ld+json">
  {{
    "@context": "https://schema.org",
    "@type": "MarketingAgency",
    "name": "Mekong Agency",
    "description": "{description}",
    "url": "{canonical_url}",
    "logo": "{BASE_URL}/favicon.png",
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
"""
    return seo_block


def process_html_file(file_path: str) -> Tuple[bool, str]:
    """Xử lý một file HTML, thay thế SEO metadata cũ bằng mới"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Xác định metadata cần thêm
        rel_path = file_path.replace("/Users/mac/.gemini/antigravity/scratch/sadec-marketing-hub/", "")
        metadata = SEO_METADATA.get(rel_path, {})

        # Nếu không có metadata cụ thể, tạo từ filename
        if not metadata:
            filename = os.path.basename(file_path).replace(".html", "").replace("-", " ").replace("_", " ").title()
            metadata = {
                "title": f"{filename} - Mekong Agency",
                "description": f"{filename} page on Mekong Agency Platform",
                "type": "website"
            }

        # Tạo SEO block mới
        seo_block = generate_seo_block(file_path, metadata)

        # Xóa các SEO metadata cũ (nếu tồn tại)
        #_patterns to remove:
        patterns_to_remove = [
            # Title tag (only if it's a duplicate after our insertion point)
            r'<!-- SEO Meta Tags -->[\s\S]*?</script>\s*\n',  # Our previously added block
            # Old duplicate title tags that appear AFTER our SEO block
        ]

        # Tìm xem đã có block SEO của chúng ta chưa
        if '<!-- SEO Meta Tags -->' in content:
            # Đã có block SEO, cần xóa block cũ và thay bằng block mới
            # Tìm vị trí bắt đầu và kết thúc của block cũ
            seo_start = content.find('<!-- SEO Meta Tags -->')
            if seo_start != -1:
                # Tìm closing script của JSON-LD
                json_ld_end = content.find('</script>', seo_start)
                if json_ld_end != -1:
                    # Tìm đến end of line
                    next_newline = content.find('\n', json_ld_end)
                    if next_newline != -1:
                        # Xóa block cũ
                        content = content[:seo_start] + content[next_newline + 1:]

        # Bây giờ thay thế title và description gốc
        # Pattern 1: Replace existing <title> tag (but NOT if it's within JSON-LD)
        title_pattern = r'<title>([^<]+)</title>'
        title_matches = list(re.finditer(title_pattern, content))

        # Chỉ thay thế title tag đầu tiên (trong head), không thay thế trong JSON-LD
        if title_matches:
            first_title = title_matches[0]
            # Kiểm tra xem đây có phải trong JSON-LD không
            before_text = content[:first_title.start()]
            if '"@type": "MarketingAgency"' not in before_text.split('</head>')[-1]:
                content = content[:first_title.start()] + seo_block + content[first_title.end():]
            else:
                # Nếu title trong JSON-LD, chèn SEO block sau </head> hoặc sau charset meta
                charset_match = re.search(r'<meta charset="UTF-8">', content)
                if charset_match:
                    insert_pos = charset_match.end()
                    content = content[:insert_pos] + '\n' + seo_block + content[insert_pos:]
        else:
            # Không tìm thấy title tag, chèn sau charset
            charset_match = re.search(r'<meta charset="UTF-8">', content)
            if charset_match:
                insert_pos = charset_match.end()
                content = content[:insert_pos] + '\n' + seo_block + content[insert_pos:]

        # Ghi file
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

        return True, f"Đã thêm SEO metadata: {metadata['title'][:50]}..."

    except Exception as e:
        return False, f"Lỗi: {str(e)}"


def should_exclude(path: str) -> bool:
    """Kiểm tra xem path có nên bị loại trừ không"""
    return any(pattern in path for pattern in EXCLUDE_PATTERNS)


def main():
    """Hàm chính"""
    base_dir = "/Users/mac/.gemini/antigravity/scratch/sadec-marketing-hub"

    # Tìm tất cả file HTML
    html_files = []
    for root, dirs, files in os.walk(base_dir):
        # Loại trừ directories không cần thiết
        dirs[:] = [d for d in dirs if not should_exclude(d)]

        for file in files:
            if file.endswith('.html') and not should_exclude(root):
                html_files.append(os.path.join(root, file))

    print(f"Tìm thấy {len(html_files)} file HTML cần xử lý")
    print("=" * 60)

    # Xử lý từng file
    success_count = 0
    skip_count = 0
    error_count = 0

    for file_path in sorted(html_files):
        success, message = process_html_file(file_path)

        if success:
            success_count += 1
            print(f"✅ {file_path.replace(base_dir + '/', '')[:60]}")
        else:
            skip_count += 1
            print(f"⏭️  {file_path.replace(base_dir + '/', '')[:60]} - {message}")

    print("=" * 60)
    print(f"Tổng kết:")
    print(f"  ✅ Đã xử lý: {success_count} files")
    print(f"  ⏭️  Bỏ qua: {skip_count} files")
    print(f"  ❌ Lỗi: {error_count} files")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
SEO Metadata Updater for SaDec Marketing Hub
Adds/updates SEO metadata (title, description, og tags, Twitter cards, JSON-LD) to all HTML files.
"""

import os
import re
from pathlib import Path

# Base configuration
BASE_DIR = Path(__file__).parent.parent
BASE_URL = "https://sadecmarketinghub.com"
FAVICON_URL = "https://sadecmarketinghub.com/favicon.png"
SITE_NAME = "Sa Đéc Marketing Hub"
DEFAULT_DESCRIPTION = "Giải pháp marketing toàn diện cho doanh nghiệp ĐBSCL"
DEFAULT_KEYWORDS = "digital marketing, Sa Đéc, Đồng Tháp, marketing agency, SEO, quảng cáo"

# Page-specific metadata
PAGE_METADATA = {
    # Admin pages
    "admin/dashboard.html": {
        "title": "Dashboard - Quản Trị Marketing | Sa Đéc Marketing Hub",
        "description": "Bảng điều khiển quản trị tổng quan - Theo dõi chiến dịch, quản lý khách hàng và phân tích hiệu quả marketing.",
        "keywords": "dashboard, quản trị, marketing, analytics, Sa Đéc, Đồng Tháp"
    },
    "admin/index.html": {
        "title": "Mekong Agency - Digital Marketing cho Doanh Nghiệp Địa Phương",
        "description": "Giải pháp marketing số toàn diện cho SME vùng ĐBSCL. Tăng trưởng doanh thu, xây dựng thương hiệu với chi phí tiết kiệm.",
        "keywords": "Sa Đéc Marketing Hub, digital marketing, agency, SEO, quảng cáo, Sa Đéc, Đồng Tháp"
    },
    "admin/campaigns.html": {
        "title": "Quản Lý Chiến Dịch - Sa Đéc Marketing Hub",
        "description": "Tạo và quản lý chiến dịch marketing đa kênh. Theo dõi hiệu quả và tối ưu ROI.",
        "keywords": "chiến dịch, campaign, marketing, quản lý, đa kênh"
    },
    "admin/leads.html": {
        "title": "Quản Lý Leads - Sa Đéc Marketing Hub",
        "description": "Quản lý khách hàng tiềm năng, theo dõi chuyển đổi và tối ưu funnel.",
        "keywords": "leads, khách hàng tiềm năng, CRM, chuyển đổi, sales funnel"
    },
    "admin/content-calendar.html": {
        "title": "Lịch Nội Dung - Sa Đéc Marketing Hub",
        "description": "Lên lịch và quản lý nội dung đăng tải trên các kênh social media.",
        "keywords": "lịch nội dung, content calendar, social media, planning"
    },
    "admin/analytics.html": {
        "title": "Phân Tích & Báo Cáo - Sa Đéc Marketing Hub",
        "description": "Phân tích hiệu quả chiến dịch và tạo báo cáo marketing chi tiết.",
        "keywords": "analytics, phân tích, báo cáo, marketing metrics, KPI"
    },
    "admin/pricing.html": {
        "title": "Bảng Giá Dịch Vụ - Sa Đéc Marketing Hub",
        "description": "Xem bảng giá các gói dịch vụ marketing linh hoạt cho mọi doanh nghiệp.",
        "keywords": "bảng giá, pricing, gói dịch vụ, chi phí marketing"
    },
    "admin/brand-guide.html": {
        "title": "Brand Guide - Hướng Dẫn Thương Hiệu",
        "description": "Hướng dẫn sử dụng bộ nhận diện thương hiệu và tài nguyên marketing.",
        "keywords": "brand guide, thương hiệu, brand guidelines, nhận diện"
    },
    "admin/payments.html": {
        "title": "Thanh Toán - Sa Đéc Marketing Hub",
        "description": "Quản lý thanh toán và hóa đơn dịch vụ marketing.",
        "keywords": "thanh toán, payment, hóa đơn, invoice, billing"
    },
    "admin/notifications.html": {
        "title": "Thông Báo - Sa Đéc Marketing Hub",
        "description": "Xem và quản lý thông báo từ hệ thống.",
        "keywords": "thông báo, notifications, alerts"
    },
    "admin/onboarding.html": {
        "title": "Onboarding - Sa Đéc Marketing Hub",
        "description": "Hướng dẫn sử dụng hệ thống Sa Đéc Marketing Hub cho người mới.",
        "keywords": "onboarding, hướng dẫn, tutorial, người mới"
    },
    "admin/settings.html": {
        "title": "Cài Đặt - Sa Đéc Marketing Hub",
        "description": "Cấu hình tài khoản và tùy chỉnh hệ thống.",
        "keywords": "cài đặt, settings, cấu hình, tùy chỉnh"
    },
    "admin/workflows.html": {
        "title": "Quy Trình - Sa Đéc Marketing Hub",
        "description": "Quản lý và tối ưu quy trình làm việc marketing.",
        "keywords": "workflows, quy trình, automation, tối ưu"
    },
    "admin/finance.html": {
        "title": "Tài Chính - Sa Đéc Marketing Hub",
        "description": "Quản lý tài chính và ngân sách marketing.",
        "keywords": "tài chính, finance, ngân sách, budget, kế toán"
    },
    "admin/hr-hiring.html": {
        "title": "Tuyển Dụng & Nhân Sự - Sa Đéc Marketing Hub",
        "description": "Quản lý tuyển dụng và nhân sự marketing.",
        "keywords": "tuyển dụng, hiring, nhân sự, HR, jobs"
    },
    "admin/legal.html": {
        "title": "Pháp Lý - Sa Đéc Marketing Hub",
        "description": "Tài liệu pháp lý và tuân thủ quy định.",
        "keywords": "pháp lý, legal, compliance, quy định"
    },
    "admin/inventory.html": {
        "title": "Quản Lý Kho - Sa Đéc Marketing Hub",
        "description": "Quản lý kho và tài sản marketing.",
        "keywords": "inventory, quản lý kho, tài sản, stock"
    },
    "admin/suppliers.html": {
        "title": "Nhà Cung Cấp - Sa Đéc Marketing Hub",
        "description": "Quản lý nhà cung cấp và đối tác.",
        "keywords": "suppliers, nhà cung cấp, đối tác, vendors"
    },
    "admin/quality.html": {
        "title": "Quản Lý Chất Lượng - Sa Đéc Marketing Hub",
        "description": "Đảm bảo chất lượng và kiểm soát quy trình.",
        "keywords": "quality, chất lượng, QA, QC, kiểm soát"
    },
    "admin/ecommerce.html": {
        "title": "E-commerce - Sa Đéc Marketing Hub",
        "description": "Giải pháp marketing cho thương mại điện tử.",
        "keywords": "ecommerce, thương mại điện tử, online store, bán hàng online"
    },
    "admin/pos.html": {
        "title": "POS - Sa Đéc Marketing Hub",
        "description": "Hệ thống điểm bán và quản lý bán hàng.",
        "keywords": "pos, điểm bán, bán hàng, retail, cửa hàng"
    },
    "admin/lms.html": {
        "title": "LMS - Học Liệu - Sa Đéc Marketing Hub",
        "description": "Hệ thống quản lý học tập và đào tạo.",
        "keywords": "lms, học liệu, đào tạo, training, e-learning"
    },
    "admin/loyalty.html": {
        "title": "Khách Hàng Thân Thiết - Sa Đéc Marketing Hub",
        "description": "Chương trình loyalty và giữ chân khách hàng.",
        "keywords": "loyalty, khách hàng thân thiết, retention, CRM"
    },
    "admin/retention.html": {
        "title": "Giữ Chân Khách Hàng - Sa Đéc Marketing Hub",
        "description": "Chiến lược và công cụ giữ chân khách hàng.",
        "keywords": "retention, giữ chân, khách hàng, loyalty"
    },
    "admin/events.html": {
        "title": "Sự Kiện - Sa Đéc Marketing Hub",
        "description": "Quản lý sự kiện và hội thảo marketing.",
        "keywords": "events, sự kiện, hội thảo, webinar, workshop"
    },
    "admin/proposals.html": {
        "title": "Đề Xuất - Sa Đéc Marketing Hub",
        "description": "Tạo và quản lý đề xuất dự án marketing.",
        "keywords": "proposals, đề xuất, proposal, dự án"
    },
    "admin/pipeline.html": {
        "title": "Sales Pipeline - Sa Đéc Marketing Hub",
        "description": "Quản lý pipeline bán hàng và theo dõi deals.",
        "keywords": "pipeline, sales pipeline, deals, bán hàng"
    },
    "admin/roiaas-admin.html": {
        "title": "ROIaaS Admin - Sa Đéc Marketing Hub",
        "description": "Quản trị dịch vụ ROI-as-a-Service.",
        "keywords": "roiaas, ROI, admin, quản trị"
    },
    "admin/raas-overview.html": {
        "title": "RaaS Overview - Sa Đéc Marketing Hub",
        "description": "Tổng quan dịch vụ Robotics-as-a-Service.",
        "keywords": "raas, robotics, overview, tự động hóa"
    },
    "admin/agents.html": {
        "title": "AI Agents - Sa Đéc Marketing Hub",
        "description": "Quản lý và sử dụng AI agents cho marketing.",
        "keywords": "AI agents, artificial intelligence, marketing automation"
    },
    "admin/ai-analysis.html": {
        "title": "AI Analysis - Sa Đéc Marketing Hub",
        "description": "Phân tích dữ liệu marketing bằng AI.",
        "keywords": "AI analysis, phân tích AI, data analysis, insights"
    },
    "admin/api-builder.html": {
        "title": "API Builder - Sa Đéc Marketing Hub",
        "description": "Xây dựng và quản lý API integrations.",
        "keywords": "API builder, API, integration, developers"
    },
    "admin/auth.html": {
        "title": "Authentication - Sa Đéc Marketing Hub",
        "description": "Quản lý xác thực và phân quyền người dùng.",
        "keywords": "auth, authentication, xác thực, security"
    },
    "admin/approvals.html": {
        "title": "Duyệt Nội Dung - Sa Đéc Marketing Hub",
        "description": "Quản lý phê duyệt nội dung và chiến dịch.",
        "keywords": "approvals, duyệt, phê duyệt, content approval"
    },
    "admin/binh-phap.html": {
        "title": "Binh Pháp Marketing - Sa Đéc Marketing Hub",
        "description": "Phương pháp marketing theo triết lý Binh Pháp Tôn Tử.",
        "keywords": "binh pháp, tôn tử, marketing strategy, chiến lược"
    },
    "admin/community.html": {
        "title": "Cộng Đồng - Sa Đéc Marketing Hub",
        "description": "Cộng đồng doanh nghiệp và marketers ĐBSCL.",
        "keywords": "community, cộng đồng, networking, kết nối"
    },
    "admin/components-demo.html": {
        "title": "Components Demo - Sa Đéc Marketing Hub",
        "description": "Demo các UI components của hệ thống.",
        "keywords": "components, UI demo, components library"
    },
    "admin/customer-success.html": {
        "title": "Customer Success - Sa Đéc Marketing Hub",
        "description": "Hỗ trợ và thành công khách hàng.",
        "keywords": "customer success, hỗ trợ khách hàng, CS"
    },
    "admin/deploy.html": {
        "title": "Deploy - Sa Đéc Marketing Hub",
        "description": "Triển khai và quản lý phiên bản.",
        "keywords": "deploy, triển khai, deployment, release"
    },
    "admin/docs.html": {
        "title": "Documentation - Sa Đéc Marketing Hub",
        "description": "Tài liệu hướng dẫn sử dụng hệ thống.",
        "keywords": "docs, documentation, tài liệu, hướng dẫn"
    },
    "admin/features-demo.html": {
        "title": "Tính Năng Demo - Sa Đéc Marketing Hub",
        "description": "Demo các tính năng nổi bật của hệ thống.",
        "keywords": "features demo, tính năng, demo"
    },
    "admin/features-demo-2027.html": {
        "title": "Tính Năng 2027 - Sa Đéc Marketing Hub",
        "description": "Demo tính năng mới năm 2027.",
        "keywords": "features 2027, tính năng mới, roadmap"
    },
    "admin/landing-builder.html": {
        "title": "Landing Page Builder - Sa Đéc Marketing Hub",
        "description": "Công cụ tạo landing page kéo thả.",
        "keywords": "landing builder, landing page, page builder,拖拽"
    },
    "admin/menu.html": {
        "title": "Menu - Sa Đéc Marketing Hub",
        "description": "Menu điều hướng hệ thống.",
        "keywords": "menu, navigation, điều hướng"
    },
    "admin/mvp-launch.html": {
        "title": "MVP Launch - Sa Đéc Marketing Hub",
        "description": "Hướng dẫn ra mắt MVP sản phẩm.",
        "keywords": "MVP launch, ra mắt, product launch"
    },
    "admin/shifts.html": {
        "title": "Ca Làm Việc - Sa Đéc Marketing Hub",
        "description": "Quản lý ca làm việc và lịch trình.",
        "keywords": "shifts, ca làm việc, scheduling, lịch trình"
    },
    "admin/ui-components-demo.html": {
        "title": "UI Components Demo - Sa Đéc Marketing Hub",
        "description": "Demo thư viện UI components.",
        "keywords": "UI components, giao diện, component library"
    },
    "admin/ux-components-demo.html": {
        "title": "UX Components Demo - Sa Đéc Marketing Hub",
        "description": "Demo các thành phần trải nghiệm người dùng.",
        "keywords": "UX components, trải nghiệm, user experience"
    },
    "admin/vc-readiness.html": {
        "title": "VC Readiness - Sa Đéc Marketing Hub",
        "description": "Chuẩn bị gọi vốn từ nhà đầu tư.",
        "keywords": "VC readiness, gọi vốn, fundraising, investors"
    },
    "admin/video-workflow.html": {
        "title": "Video Workflow - Sa Đéc Marketing Hub",
        "description": "Quy trình sản xuất và phân phối video.",
        "keywords": "video workflow, sản xuất video, video production"
    },
    "admin/zalo.html": {
        "title": "Zalo OA - Sa Đéc Marketing Hub",
        "description": "Quản lý Zalo Official Account.",
        "keywords": "zalo, zalo OA, zalo marketing"
    },

    # Portal pages
    "portal/dashboard.html": {
        "title": "Dashboard - Khách Hàng | Sa Đéc Marketing Hub",
        "description": "Bảng điều khiển khách hàng - Theo dõi chiến dịch, hiệu quả và báo cáo marketing.",
        "keywords": "dashboard, khách hàng, chiến dịch, báo cáo, marketing"
    },
    "portal/login.html": {
        "title": "Đăng Nhập - Sa Đéc Marketing Hub",
        "description": "Đăng nhập vào hệ thống khách hàng. Theo dõi dự án và chiến dịch marketing.",
        "keywords": "login, đăng nhập, khách hàng, portal"
    },
    "portal/projects.html": {
        "title": "Dự Án - Sa Đéc Marketing Hub",
        "description": "Quản lý và theo dõi tiến độ dự án marketing.",
        "keywords": "projects, dự án, tiến độ, project management"
    },
    "portal/reports.html": {
        "title": "Báo Cáo - Sa Đéc Marketing Hub",
        "description": "Xem báo cáo hiệu quả chiến dịch marketing.",
        "keywords": "reports, báo cáo, analytics, performance"
    },
    "portal/payments.html": {
        "title": "Thanh Toán - Sa Đéc Marketing Hub",
        "description": "Quản lý thanh toán và hóa đơn dịch vụ.",
        "keywords": "payments, thanh toán, hóa đơn, billing"
    },
    "portal/notifications.html": {
        "title": "Thông Báo - Sa Đéc Marketing Hub",
        "description": "Thông báo từ hệ thống và đội ngũ marketing.",
        "keywords": "notifications, thông báo, alerts"
    },
    "portal/onboarding.html": {
        "title": "Onboarding - Sa Đéc Marketing Hub",
        "description": "Hướng dẫn sử dụng hệ thống cho khách hàng mới.",
        "keywords": "onboarding, hướng dẫn, khách hàng mới"
    },
    "portal/missions.html": {
        "title": "Nhiệm Vụ - Sa Đéc Marketing Hub",
        "description": "Danh sách nhiệm vụ và công việc marketing.",
        "keywords": "missions, nhiệm vụ, tasks, công việc"
    },
    "portal/credits.html": {
        "title": "Tín Dụng - Sa Đéc Marketing Hub",
        "description": "Quản lý tín dụng và số dư tài khoản.",
        "keywords": "credits, tín dụng, balance, số dư"
    },
    "portal/subscriptions.html": {
        "title": "Gói Dịch Vụ - Sa Đéc Marketing Hub",
        "description": "Quản lý gói dịch vụ và đăng ký.",
        "keywords": "subscriptions, gói dịch vụ, đăng ký, plans"
    },
    "portal/invoices.html": {
        "title": "Hóa Đơn - Sa Đéc Marketing Hub",
        "description": "Xem và tải hóa đơn dịch vụ.",
        "keywords": "invoices, hóa đơn, billing, receipts"
    },
    "portal/assets.html": {
        "title": "Tài Sản - Sa Đéc Marketing Hub",
        "description": "Quản lý tài sản số và tư liệu marketing.",
        "keywords": "assets, tài sản, digital assets, tư liệu"
    },
    "portal/approve.html": {
        "title": "Phê Duyệt - Sa Đéc Marketing Hub",
        "description": "Phê duyệt nội dung và chiến dịch.",
        "keywords": "approve, phê duyệt, approval"
    },
    "portal/ocop-catalog.html": {
        "title": "OCOP Catalog - Sa Đéc Marketing Hub",
        "description": "Catalog sản phẩm OCOP vùng ĐBSCL.",
        "keywords": "ocop, catalog, sản phẩm OCOP, ĐBSCL"
    },
    "portal/ocop-exporter.html": {
        "title": "OCOP Exporter - Sa Đéc Marketing Hub",
        "description": "Công cụ xuất khẩu sản phẩm OCOP.",
        "keywords": "ocop exporter, xuất khẩu, OCOP"
    },
    "portal/payment-result.html": {
        "title": "Kết Quả Thanh Toán - Sa Đéc Marketing Hub",
        "description": "Kết quả giao dịch thanh toán.",
        "keywords": "payment result, kết quả thanh toán, transaction"
    },
    "portal/roi-analytics.html": {
        "title": "ROI Analytics - Sa Đéc Marketing Hub",
        "description": "Phân tích ROI và hiệu quả đầu tư marketing.",
        "keywords": "ROI analytics, phân tích ROI, marketing analytics"
    },
    "portal/roi-report.html": {
        "title": "Báo Cáo ROI - Sa Đéc Marketing Hub",
        "description": "Báo cáo chi tiết ROI chiến dịch.",
        "keywords": "ROI report, báo cáo ROI, performance"
    },
    "portal/roiaas-dashboard.html": {
        "title": "ROIaaS Dashboard - Sa Đéc Marketing Hub",
        "description": "Dashboard dịch vụ ROI-as-a-Service.",
        "keywords": "roiaas dashboard, ROI, analytics"
    },
    "portal/roiaas-onboarding.html": {
        "title": "ROIaaS Onboarding - Sa Đéc Marketing Hub",
        "description": "Hướng dẫn sử dụng ROI-as-a-Service.",
        "keywords": "roiaas onboarding, hướng dẫn, ROI"
    },
    "portal/subscription-plans.html": {
        "title": "Gói Đăng Ký - Sa Đéc Marketing Hub",
        "description": "Xem và đăng ký các gói dịch vụ.",
        "keywords": "subscription plans, gói đăng ký, pricing"
    },

    # Affiliate pages
    "affiliate/dashboard.html": {
        "title": "Affiliate Dashboard - Sa Đéc Marketing Hub",
        "description": "Bảng điều khiển affiliate - Theo dõi hoa hồng và referrals.",
        "keywords": "affiliate dashboard, thống kê, doanh thu, hoa hồng"
    },
    "affiliate/links.html": {
        "title": "Affiliate Links - Sa Đéc Marketing Hub",
        "description": "Quản lý link affiliate và tracking.",
        "keywords": "affiliate links, tracking links, referral links"
    },
    "affiliate/media.html": {
        "title": "Affiliate Media - Sa Đéc Marketing Hub",
        "description": "Tư liệu và banner cho affiliate marketing.",
        "keywords": "affiliate media, banner, tư liệu marketing"
    },
    "affiliate/profile.html": {
        "title": "Affiliate Profile - Sa Đéc Marketing Hub",
        "description": "Hồ sơ và cài đặt tài khoản affiliate.",
        "keywords": "affiliate profile, hồ sơ, profile settings"
    },
    "affiliate/referrals.html": {
        "title": "Referrals - Sa Đéc Marketing Hub",
        "description": "Quản lý referrals và người được giới thiệu.",
        "keywords": "referrals, người giới thiệu, referred users"
    },
    "affiliate/commissions.html": {
        "title": "Hoa Hồng - Sa Đéc Marketing Hub",
        "description": "Theo dõi hoa hồng và thanh toán affiliate.",
        "keywords": "commissions, hoa hồng, affiliate earnings"
    },
    "affiliate/settings.html": {
        "title": "Affiliate Settings - Sa Đéc Marketing Hub",
        "description": "Cài đặt tài khoản affiliate.",
        "keywords": "affiliate settings, cài đặt, settings"
    },

    # Auth pages
    "auth/login.html": {
        "title": "Đăng Nhập - Sa Đéc Marketing Hub",
        "description": "Đăng nhập vào hệ thống Sa Đéc Marketing Hub - Quản trị marketing, leads, campaigns và analytics.",
        "keywords": "login, đăng nhập, marketing hub, sa đéc, agency"
    },

    # Root pages
    "index.html": {
        "title": "SaDec Marketing Hub - Admin Dashboard",
        "description": "SaDec Marketing Hub - Dashboard quản lý marketing toàn diện",
        "keywords": "admin dashboard, quản trị, marketing dashboard, analytics, Sa Đéc"
    },
    "login.html": {
        "title": "Đăng Nhập - Sa Đéc Marketing Hub",
        "description": "Đăng nhập vào hệ thống quản lý marketing.",
        "keywords": "login, đăng nhập, marketing hub"
    },
    "register.html": {
        "title": "Đăng Ký - Sa Đéc Marketing Hub",
        "description": "Tạo tài khoản miễn phí, bắt đầu sử dụng các công cụ marketing AI.",
        "keywords": "register, đăng ký, tạo tài khoản, free"
    },
    "forgot-password.html": {
        "title": "Quên Mật Khẩu - Sa Đéc Marketing Hub",
        "description": "Khôi phục mật khẩu tài khoản Sa Đéc Marketing Hub.",
        "keywords": "forgot password, quên mật khẩu, khôi phục, reset"
    },
    "verify-email.html": {
        "title": "Xác Thực Email - Sa Đéc Marketing Hub",
        "description": "Xác thực địa chỉ email để hoàn tất đăng ký.",
        "keywords": "verify email, xác thực email, email verification"
    },
    "terms.html": {
        "title": "Điều Khoản Dịch Vụ - Sa Đéc Marketing Hub",
        "description": "Điều khoản sử dụng dịch vụ Sa Đéc Marketing Hub.",
        "keywords": "terms, điều khoản, terms of service"
    },
    "privacy.html": {
        "title": "Chính Sách Bảo Mật - Sa Đéc Marketing Hub",
        "description": "Chính sách bảo mật thông tin khách hàng.",
        "keywords": "privacy, bảo mật, privacy policy"
    },
    "offline.html": {
        "title": "Offline - Sa Đéc Marketing Hub",
        "description": "Bạn đang offline. Kết nối mạng để tiếp tục sử dụng.",
        "keywords": "offline, không có mạng, connection"
    },
    "audit-report.html": {
        "title": "Audit Report - Sa Đéc Marketing Hub",
        "description": "Báo cáo kiểm toán và phân tích hệ thống.",
        "keywords": "audit report, báo cáo, kiểm toán"
    },
    "lp.html": {
        "title": "Landing Page - Sa Đéc Marketing Hub",
        "description": "Landing page giới thiệu dịch vụ marketing.",
        "keywords": "landing page, giới thiệu, marketing"
    },
}

# Widget pages (auto-generated metadata)
WIDGET_PAGES = [
    "conversion-funnel.html",
    "global-search.html",
    "kpi-card.html",
    "notification-bell.html",
    "theme-toggle.html",
]


def get_metadata_for_file(filepath: str) -> dict:
    """Get metadata config for a file path."""
    rel_path = os.path.relpath(filepath, BASE_DIR)

    # Check direct match
    if rel_path in PAGE_METADATA:
        return PAGE_METADATA[rel_path]

    # Check if it's a widget page
    filename = os.path.basename(filepath)
    if filename in WIDGET_PAGES:
        dir_name = os.path.basename(os.path.dirname(filepath))
        return {
            "title": f"{filename.replace('.html', '').replace('-', ' ').title()} - {dir_name.title()} | Sa Đéc Marketing Hub",
            "description": f"Widget component: {filename.replace('.html', '')}",
            "keywords": f"widget, component, {filename.replace('.html', '')}"
        }

    # Default metadata
    filename = os.path.basename(filepath).replace('.html', '')
    return {
        "title": f"{filename.replace('-', ' ').title()} - Sa Đéc Marketing Hub",
        "description": DEFAULT_DESCRIPTION,
        "keywords": DEFAULT_KEYWORDS
    }


def generate_seo_block(metadata: dict, url_path: str) -> str:
    """Generate complete SEO meta tags block."""
    url = f"{BASE_URL}/{url_path}" if not url_path.startswith('http') else url_path

    return f'''
  <!-- SEO Meta Tags -->
  <title>{metadata["title"]}</title>
  <meta name="description" content="{metadata["description"]}">
  <meta name="keywords" content="{metadata["keywords"]}">
  <meta name="robots" content="index, follow">
  <meta name="author" content="{SITE_NAME}">

  <!-- Canonical URL -->
  <link rel="canonical" href="{url}">

  <!-- Open Graph Meta Tags -->
  <meta property="og:title" content="{metadata["title"]}">
  <meta property="og:description" content="{metadata["description"]}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="{url}">
  <meta property="og:image" content="{FAVICON_URL}">
  <meta property="og:site_name" content="{SITE_NAME}">
  <meta property="og:locale" content="vi_VN">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{metadata["title"]}">
  <meta name="twitter:description" content="{metadata["description"]}">
  <meta name="twitter:image" content="{FAVICON_URL}">
  <meta name="twitter:creator" content="@{SITE_NAME.lower().replace(' ', '')}">

  <!-- Schema.org JSON-LD -->
  <script type="application/ld+json">
  {{
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "{metadata["title"]}",
    "description": "{metadata["description"]}",
    "url": "{url}",
    "image": "{FAVICON_URL}",
    "publisher": {{
      "@type": "Organization",
      "name": "{SITE_NAME}",
      "url": "{BASE_URL}",
      "logo": {{
        "@type": "ImageObject",
        "url": "{FAVICON_URL}"
      }}
    }},
    "inLanguage": "vi-VN"
  }}
  </script>
'''


def clean_head_section(content: str) -> str:
    """Clean up duplicate dns-prefetch and other redundant tags in head section."""
    # Remove excessive duplicate dns-prefetch links
    dns_prefetch_pattern = r'<link rel="dns-prefetch"[^>]*>'
    dns_prefetches = re.findall(dns_prefetch_pattern, content)

    # Keep only unique dns-prefetch links
    unique_prefetches = []
    seen = set()
    for prefetch in dns_prefetches:
        if prefetch not in seen:
            unique_prefetches.append(prefetch)
            seen.add(prefetch)

    # Replace all dns-prefetch with unique ones at the end of head
    content = re.sub(r'<link rel="dns-prefetch"[^>]*>\s*', '', content)

    # Insert unique dns-prefetch links before </head>
    dns_block = '\n'.join([
        '    <link rel="dns-prefetch" href="https://fonts.googleapis.com">',
        '    <link rel="dns-prefetch" href="https://fonts.gstatic.com">',
        '    <link rel="dns-prefetch" href="https://cdn.jsdelivr.net">',
        '    <link rel="dns-prefetch" href="https://esm.run">',
    ])

    # Also deduplicate preconnect links
    preconnect_pattern = r'<link rel="preconnect"[^>]*>'
    preconnects = re.findall(preconnect_pattern, content)
    unique_preconnects = []
    seen_preconnect = set()
    for preconnect in preconnects:
        if preconnect not in seen_preconnect:
            unique_preconnects.append(preconnect)
            seen_preconnect.add(preconnect)

    content = re.sub(r'<link rel="preconnect"[^>]*>\s*', '', content)

    # Insert unique preconnect and dns-prefetch before </head>
    connection_block = '\n'.join(unique_preconnects + [
        '    <link rel="dns-prefetch" href="https://fonts.googleapis.com">',
        '    <link rel="dns-prefetch" href="https://fonts.gstatic.com">',
        '    <link rel="dns-prefetch" href="https://cdn.jsdelivr.net">',
        '    <link rel="dns-prefetch" href="https://esm.run">',
    ])

    content = re.sub(r'</head>', f'{connection_block}\n</head>', content, count=1)

    return content


def update_html_file(filepath: str) -> bool:
    """Update a single HTML file with SEO metadata."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Get metadata for this file
        metadata = get_metadata_for_file(filepath)

        # Get relative path for URL
        rel_path = os.path.relpath(filepath, BASE_DIR)

        # Check if SEO tags already exist
        has_seo = '<!-- SEO Meta Tags -->' in content or '<meta property="og:title"' in content

        if has_seo:
            # Replace existing SEO block
            seo_pattern = r'<!-- SEO Meta Tags -->.*?</script>\s*'
            new_content = re.sub(seo_pattern, generate_seo_block(metadata, rel_path), content, flags=re.DOTALL)

            if new_content == content:
                # Pattern didn't match, try another approach
                title_pattern = r'<title>.*?</title>'
                if re.search(title_pattern, new_content):
                    # Replace individual tags
                    print(f"  ⚠️  Partial update for {rel_path}")
        else:
            # Insert SEO block after charset meta tag
            charset_pattern = r'(<meta charset="[^"]*">\s*)'
            match = re.search(charset_pattern, content)
            if match:
                insert_pos = match.end()
                new_content = content[:insert_pos] + '\n' + generate_seo_block(metadata, rel_path) + content[insert_pos:]
            else:
                # Try after <head> tag
                head_pattern = r'(<head>\s*)'
                match = re.search(head_pattern, content)
                if match:
                    insert_pos = match.end()
                    new_content = content[:insert_pos] + '\n' + generate_seo_block(metadata, rel_path) + content[insert_pos:]
                else:
                    print(f"  ❌ Could not find insertion point: {rel_path}")
                    return False

        # Clean up duplicate dns-prefetch links
        new_content = clean_head_section(new_content)

        # Write back
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)

        return True

    except Exception as e:
        print(f"  ❌ Error processing {filepath}: {e}")
        return False


def main():
    """Main function to process all HTML files."""
    print("🔍 Scanning for HTML files...")

    # Find all HTML files (excluding node_modules)
    html_files = []
    for root, dirs, files in os.walk(BASE_DIR):
        # Skip node_modules and other excluded directories
        dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'dist', 'build']]

        for file in files:
            if file.endswith('.html'):
                html_files.append(os.path.join(root, file))

    print(f"📄 Found {len(html_files)} HTML files\n")

    # Process each file
    success = 0
    failed = 0

    for filepath in html_files:
        rel_path = os.path.relpath(filepath, BASE_DIR)
        print(f"📝 Processing: {rel_path}")

        if update_html_file(filepath):
            success += 1
            print(f"  ✅ Updated")
        else:
            failed += 1

    print(f"\n{'='*50}")
    print(f"✅ Successfully updated: {success} files")
    if failed > 0:
        print(f"❌ Failed: {failed} files")


if __name__ == "__main__":
    main()

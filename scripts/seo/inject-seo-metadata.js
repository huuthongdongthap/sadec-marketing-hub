#!/usr/bin/env node
/**
 * Sa Đéc Marketing Hub - SEO Metadata Injector
 * Tự động thêm SEO metadata (title, description, og tags, Twitter cards) vào tất cả HTML pages
 *
 * Usage: node scripts/seo/inject-seo-metadata.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = process.cwd();
const EXCLUDE_DIRS = ['node_modules', 'dist', '.git', 'vendor'];

// SEO metadata cho từng page
const PAGE_SEO = {
    // Root pages
    'index.html': {
        title: 'SaĐéc Marketing Hub - Digital Marketing Agency Toàn diện',
        description: 'Dịch vụ marketing toàn diện - SEO, Ads, Content, Social Media. Tăng trưởng doanh thu bền vững cho doanh nghiệp Mekong Delta.',
        keywords: 'marketing agency, digital marketing, SEO, Google Ads, social media, content marketing, Sa Đéc, Đồng Tháp',
        robots: 'index, follow',
        url: 'https://sadecmarketinghub.com/'
    },
    'login.html': {
        title: 'Đăng nhập - SaĐéc Marketing Hub',
        description: 'Đăng nhập vào hệ thống',
        keywords: 'login, sign in',
        robots: 'noindex, nofollow',
        url: 'https://sadecmarketinghub.com/login.html'
    },
    'register.html': {
        title: 'Đăng ký - SaĐéc Marketing Hub',
        description: 'Đăng ký tài khoản mới - Trải nghiệm marketing automation',
        keywords: 'register, sign up, create account',
        robots: 'noindex, nofollow',
        url: 'https://sadecmarketinghub.com/register.html'
    },
    'forgot-password.html': {
        title: 'Quên Mật khẩu - Khôi phục',
        description: 'Khôi phục mật khẩu tài khoản của bạn',
        keywords: 'forgot password, password recovery, reset password',
        robots: 'noindex, nofollow',
        url: 'https://sadecmarketinghub.com/forgot-password.html'
    },
    'verify-email.html': {
        title: 'Xác thực Email',
        description: 'Xác thực địa chỉ email của bạn',
        keywords: 'verify email, email confirmation',
        robots: 'noindex, nofollow',
        url: 'https://sadecmarketinghub.com/verify-email.html'
    },
    'privacy.html': {
        title: 'Chính sách Bảo mật - Privacy Policy',
        description: 'Chính sách bảo mật thông tin cá nhân của SaĐéc Marketing Hub',
        keywords: 'privacy policy, bảo mật, data protection',
        robots: 'index, follow',
        url: 'https://sadecmarketinghub.com/privacy.html'
    },
    'terms.html': {
        title: 'Điều khoản Dịch vụ - Terms of Service',
        description: 'Điều khoản sử dụng dịch vụ SaĐéc Marketing Hub',
        keywords: 'terms of service, terms and conditions, điều khoản',
        robots: 'index, follow',
        url: 'https://sadecmarketinghub.com/terms.html'
    },
    'lp.html': {
        title: 'Landing Page - SaĐéc Marketing Hub',
        description: 'Landing page giới thiệu dịch vụ marketing',
        keywords: 'landing page, marketing services',
        robots: 'index, follow',
        url: 'https://sadecmarketinghub.com/lp.html'
    },
    'offline.html': {
        title: 'Offline - Không có Kết nối',
        description: 'Bạn đang offline - Một số tính năng không khả dụng',
        keywords: 'offline, no connection',
        robots: 'noindex, nofollow',
        url: 'https://sadecmarketinghub.com/offline.html'
    },

    // Admin pages - key ones
    'admin/dashboard.html': {
        title: 'Dashboard - Tổng quan Marketing',
        description: 'Tổng quan toàn diện về hiệu suất marketing - KPIs, metrics, và insights theo thời gian thực',
        keywords: 'marketing dashboard, real-time analytics, business intelligence',
        robots: 'noindex, nofollow',
        url: 'https://sadecmarketinghub.com/admin/dashboard.html'
    },
    'admin/campaigns.html': {
        title: 'Quản lý Chiến dịch Marketing',
        description: 'Tạo, quản lý và theo dõi chiến dịch marketing đa kênh - Facebook, Google, TikTok Ads',
        keywords: 'campaign management, marketing campaigns, multi-channel marketing',
        robots: 'noindex, nofollow',
        url: 'https://sadecmarketinghub.com/admin/campaigns.html'
    },
    'admin/leads.html': {
        title: 'Quản lý Leads & Khách hàng tiềm năng',
        description: 'Hệ thống quản lý leads - Theo dõi, chấm điểm và chuyển đổi khách hàng tiềm năng',
        keywords: 'lead management, lead scoring, CRM, customer acquisition',
        robots: 'noindex, nofollow',
        url: 'https://sadecmarketinghub.com/admin/leads.html'
    },
    'admin/finance.html': {
        title: 'Quản lý Tài chính & Kế toán',
        description: 'Theo dõi doanh thu, chi phí, công nợ và báo cáo tài chính',
        keywords: 'finance management, accounting, revenue tracking',
        robots: 'noindex, nofollow',
        url: 'https://sadecmarketinghub.com/admin/finance.html'
    },
    'admin/pricing.html': {
        title: 'Bảng giá Dịch vụ Marketing',
        description: 'Bảng giá dịch vụ marketing linh hoạt - Starter, Pro, Enterprise packages',
        keywords: 'pricing, marketing services, packages',
        robots: 'noindex, nofollow',
        url: 'https://sadecmarketinghub.com/admin/pricing.html'
    },
    'admin/docs.html': {
        title: 'Tài liệu & Documentation',
        description: 'Trung tâm tài liệu - Hướng dẫn sử dụng, API docs, tutorials',
        keywords: 'documentation, user guide, API docs, tutorials',
        robots: 'index, follow',
        url: 'https://sadecmarketinghub.com/admin/docs.html'
    },
    'admin/brand-guide.html': {
        title: 'Brand Guidelines - Hướng dẫn Thương hiệu',
        description: 'Hệ thống nhận diện thương hiệu - Logo, colors, typography, voice',
        keywords: 'brand guidelines, brand identity, design system',
        robots: 'index, follow',
        url: 'https://sadecmarketinghub.com/admin/brand-guide.html'
    },
    'admin/binh-phap.html': {
        title: 'Binh Pháp Marketing - Chiến lược',
        description: 'Chiến lược marketing theo Binh Pháp Tôn Tử - 13 chapters',
        keywords: 'marketing strategy, Sun Tzu, competitive strategy',
        robots: 'index, follow',
        url: 'https://sadecmarketinghub.com/admin/binh-phap.html'
    },
    'admin/onboarding.html': {
        title: 'Onboarding - Hướng dẫn Mới',
        description: 'Quy trình onboarding người dùng mới - Tutorials và guided tours',
        keywords: 'onboarding, user onboarding, tutorials',
        robots: 'index, follow',
        url: 'https://sadecmarketinghub.com/admin/onboarding.html'
    },
    'admin/features-demo.html': {
        title: 'Features Demo - Tính năng',
        description: 'Demo các tính năng nổi bật của platform',
        keywords: 'features demo, product demo, platform features',
        robots: 'index, follow',
        url: 'https://sadecmarketinghub.com/admin/features-demo.html'
    },
    'admin/legal.html': {
        title: 'Pháp lý & Compliance',
        description: 'Quản lý pháp lý - Terms, privacy policy, compliance',
        keywords: 'legal, compliance, terms of service, privacy policy',
        robots: 'index, follow',
        url: 'https://sadecmarketinghub.com/admin/legal.html'
    },
    'admin/raas-overview.html': {
        title: 'RaaS Overview - Revenue as a Service',
        description: 'Tổng quan về mô hình RaaS - Revenue as a Service',
        keywords: 'RaaS, revenue as a service, business model',
        robots: 'index, follow',
        url: 'https://sadecmarketinghub.com/admin/raas-overview.html'
    },
    'admin/ai-analysis.html': {
        title: 'AI Analysis - Phân tích Thông minh',
        description: 'Phân tích dữ liệu bằng AI - Insights tự động, dự báo xu hướng marketing',
        keywords: 'AI analysis, marketing analytics, machine learning, predictive analytics',
        robots: 'noindex, nofollow',
        url: 'https://sadecmarketinghub.com/admin/ai-analysis.html'
    },
    'admin/api-builder.html': {
        title: 'API Builder - Xây dựng API',
        description: 'Công cụ xây dựng API không cần code - Tạo endpoints tùy chỉnh',
        keywords: 'API builder, no-code API, endpoint builder, integration',
        robots: 'noindex, nofollow',
        url: 'https://sadecmarketinghub.com/admin/api-builder.html'
    },
    'admin/approvals.html': {
        title: 'Approvals - Phê duyệt',
        description: 'Hệ thống phê duyệt - Quản lý workflow và approval requests',
        keywords: 'approvals, workflow, approval requests, management',
        robots: 'noindex, nofollow',
        url: 'https://sadecmarketinghub.com/admin/approvals.html'
    },
    'admin/auth.html': {
        title: 'Authentication - Xác thực',
        description: 'Quản lý xác thực và phân quyền người dùng',
        keywords: 'authentication, authorization, user management, security',
        robots: 'noindex, nofollow',
        url: 'https://sadecmarketinghub.com/admin/auth.html'
    },
    'admin/agents.html': {
        title: 'AI Agents - Agents Thông minh',
        description: 'Đội ngũ AI agents - Tự động hóa tasks marketing và sales',
        keywords: 'AI agents, marketing automation, autonomous agents, AI team',
        robots: 'noindex, nofollow',
        url: 'https://sadecmarketinghub.com/admin/agents.html'
    },
    'admin/community.html': {
        title: 'Community - Cộng đồng',
        description: 'Cộng đồng marketers - Kết nối, học hỏi và chia sẻ kinh nghiệm',
        keywords: 'community, marketing community, networking, collaboration',
        robots: 'index, follow',
        url: 'https://sadecmarketinghub.com/admin/community.html'
    },
    'admin/content-calendar.html': {
        title: 'Content Calendar - Lịch nội dung',
        description: 'Lịch biên tập nội dung - Lên kế hoạch và quản lý content đa kênh',
        keywords: 'content calendar, editorial calendar, content planning, social media scheduler',
        robots: 'noindex, nofollow',
        url: 'https://sadecmarketinghub.com/admin/content-calendar.html'
    },
    'admin/customer-success.html': {
        title: 'Customer Success - Thành công Khách hàng',
        description: 'Quản lý customer success - Đảm bảo khách hàng đạt được giá trị',
        keywords: 'customer success, customer satisfaction, retention, account management',
        robots: 'noindex, nofollow',
        url: 'https://sadecmarketinghub.com/admin/customer-success.html'
    },
    'admin/deploy.html': {
        title: 'Deploy - Triển khai',
        description: 'Triển khai dự án - CI/CD pipeline và deployment management',
        keywords: 'deploy, deployment, CI/CD, release management',
        robots: 'noindex, nofollow',
        url: 'https://sadecmarketinghub.com/admin/deploy.html'
    },
    'admin/events.html': {
        title: 'Events - Sự kiện',
        description: 'Quản lý sự kiện - Tổ chức webinars, workshops và marketing events',
        keywords: 'events, event management, webinars, workshops, marketing events',
        robots: 'noindex, nofollow',
        url: 'https://sadecmarketinghub.com/admin/events.html'
    },
    'admin/hr-hiring.html': {
        title: 'HR & Hiring - Tuyển dụng',
        description: 'Quản lý nhân sự và tuyển dụng - ATS và employee management',
        keywords: 'HR, hiring, recruitment, ATS, employee management',
        robots: 'noindex, nofollow',
        url: 'https://sadecmarketinghub.com/admin/hr-hiring.html'
    },
    'admin/inventory.html': {
        title: 'Inventory - Quản lý Kho',
        description: 'Quản lý kho và tồn kho - Theo dõi sản phẩm và nguyên vật liệu',
        keywords: 'inventory management, stock management, warehouse, inventory tracking',
        robots: 'noindex, nofollow',
        url: 'https://sadecmarketinghub.com/admin/inventory.html'
    },
    'admin/landing-builder.html': {
        title: 'Landing Builder - Trình tạo Landing Page',
        description: 'Trình tạo landing page kéo thả - Tạo trang đích chuyển đổi cao',
        keywords: 'landing page builder, page builder, drag-and-drop, conversion optimization',
        robots: 'noindex, nofollow',
        url: 'https://sadecmarketinghub.com/admin/landing-builder.html'
    },
    'admin/lms.html': {
        title: 'LMS - Learning Management System',
        description: 'Hệ thống quản lý học tập - Đào tạo và certification',
        keywords: 'LMS, learning management, e-learning, training, certification',
        robots: 'noindex, nofollow',
        url: 'https://sadecmarketinghub.com/admin/lms.html'
    },
    'admin/loyalty.html': {
        title: 'Loyalty - Chương trình Thành viên',
        description: 'Chương trình loyalty và rewards - Giữ chân khách hàng',
        keywords: 'loyalty program, rewards, membership, customer retention',
        robots: 'noindex, nofollow',
        url: 'https://sadecmarketinghub.com/admin/loyalty.html'
    },
    'admin/menu.html': {
        title: 'Menu - Quản lý Thực đơn',
        description: 'Quản lý thực đơn cho F&B - Menu builder và pricing',
        keywords: 'menu management, F&B menu, restaurant menu, pricing',
        robots: 'noindex, nofollow',
        url: 'https://sadecmarketinghub.com/admin/menu.html'
    },
    'admin/mvp-launch.html': {
        title: 'MVP Launch - Ra mắt Sản phẩm',
        description: 'Quy trình ra mắt MVP - Go-to-market strategy và launch checklist',
        keywords: 'MVP launch, product launch, go-to-market, product release',
        robots: 'index, follow',
        url: 'https://sadecmarketinghub.com/admin/mvp-launch.html'
    },
    'admin/notifications.html': {
        title: 'Notifications - Thông báo',
        description: 'Hệ thống thông báo - Real-time notifications và alerts',
        keywords: 'notifications, alerts, real-time updates, push notifications',
        robots: 'noindex, nofollow',
        url: 'https://sadecmarketinghub.com/admin/notifications.html'
    },
    'admin/payments.html': {
        title: 'Payments - Thanh toán',
        description: 'Quản lý thanh toán - Payment gateway và billing',
        keywords: 'payments, payment gateway, billing, invoicing, payment processing',
        robots: 'noindex, nofollow',
        url: 'https://sadecmarketinghub.com/admin/payments.html'
    },
    'admin/pipeline.html': {
        title: 'Pipeline - Quản lý Dự án',
        description: 'Quản lý pipeline dự án - Theo dõi tiến độ và milestones',
        keywords: 'pipeline, project management, project tracking, milestones',
        robots: 'noindex, nofollow',
        url: 'https://sadecmarketinghub.com/admin/pipeline.html'
    },
    'admin/pos.html': {
        title: 'POS - Point of Sale',
        description: 'Hệ thống POS - Bán hàng tại quầy và quản lý giao dịch',
        keywords: 'POS, point of sale, retail POS, sales management, cash register',
        robots: 'noindex, nofollow',
        url: 'https://sadecmarketinghub.com/admin/pos.html'
    },
    'admin/proposals.html': {
        title: 'Proposals - Đề xuất',
        description: 'Tạo và quản lý proposals - Sales proposals và client quotes',
        keywords: 'proposals, sales proposals, quotes, client proposals, bid management',
        robots: 'noindex, nofollow',
        url: 'https://sadecmarketinghub.com/admin/proposals.html'
    },
    'admin/quality.html': {
        title: 'Quality - Quản lý Chất lượng',
        description: 'Quản lý chất lượng - QA/QC và quality assurance',
        keywords: 'quality management, QA, QC, quality assurance, quality control',
        robots: 'noindex, nofollow',
        url: 'https://sadecmarketinghub.com/admin/quality.html'
    },
    'admin/retention.html': {
        title: 'Retention - Giữ chân Khách hàng',
        description: 'Chiến lược retention - Giảm churn và tăng customer lifetime value',
        keywords: 'retention, customer retention, churn reduction, CLV, loyalty',
        robots: 'noindex, nofollow',
        url: 'https://sadecmarketinghub.com/admin/retention.html'
    },
    'admin/roiaas-admin.html': {
        title: 'ROIaaS Admin - Quản trị ROI',
        description: 'Quản trị ROI-as-a-Service - Theo dõi và tối ưu ROI marketing',
        keywords: 'ROI management, ROIaaS, marketing ROI, performance tracking',
        robots: 'noindex, nofollow',
        url: 'https://sadecmarketinghub.com/admin/roiaas-admin.html'
    },
    'admin/shifts.html': {
        title: 'Shifts - Quản lý Ca làm việc',
        description: 'Quản lý ca làm việc - Scheduling và attendance tracking',
        keywords: 'shift management, scheduling, attendance, workforce management',
        robots: 'noindex, nofollow',
        url: 'https://sadecmarketinghub.com/admin/shifts.html'
    },
    'admin/suppliers.html': {
        title: 'Suppliers - Nhà cung cấp',
        description: 'Quản lý nhà cung cấp - Vendor management và procurement',
        keywords: 'suppliers, vendor management, procurement, supplier relationships',
        robots: 'noindex, nofollow',
        url: 'https://sadecmarketinghub.com/admin/suppliers.html'
    },
    'admin/vc-readiness.html': {
        title: 'VC Readiness - Sẵn gọi vốn',
        description: 'Chuẩn bị gọi vốn - Investor deck và fundraising preparation',
        keywords: 'VC readiness, fundraising, investor pitch, venture capital, startup funding',
        robots: 'index, follow',
        url: 'https://sadecmarketinghub.com/admin/vc-readiness.html'
    },
    'admin/video-workflow.html': {
        title: 'Video Workflow - Quy trình Video',
        description: 'Quy trình sản xuất video - Content creation và video marketing',
        keywords: 'video workflow, video production, content creation, video marketing',
        robots: 'noindex, nofollow',
        url: 'https://sadecmarketinghub.com/admin/video-workflow.html'
    },
    'admin/workflows.html': {
        title: 'Workflows - Quy trình Tự động',
        description: 'Automation workflows - Thiết lập và quản lý automated workflows',
        keywords: 'workflows, automation, workflow builder, process automation',
        robots: 'noindex, nofollow',
        url: 'https://sadecmarketinghub.com/admin/workflows.html'
    },
    'admin/zalo.html': {
        title: 'Zalo Integration - Kết nối Zalo',
        description: 'Tích hợp Zalo - Zalo OA, messaging và marketing trên Zalo',
        keywords: 'Zalo integration, Zalo OA, Zalo marketing, messaging platform',
        robots: 'noindex, nofollow',
        url: 'https://sadecmarketinghub.com/admin/zalo.html'
    },
    'admin/components-demo.html': {
        title: 'Components Demo - UI Components',
        description: 'Demo các UI components - Material Design 3 components',
        keywords: 'UI components, component library, design system, Material Design 3',
        robots: 'index, follow',
        url: 'https://sadecmarketinghub.com/admin/components-demo.html'
    },
    'admin/ui-components-demo.html': {
        title: 'UI Components Demo - Giao diện',
        description: 'Demo các component UI - Buttons, forms, cards và layouts',
        keywords: 'UI components, UI library, frontend components, web UI',
        robots: 'index, follow',
        url: 'https://sadecmarketinghub.com/admin/ui-components-demo.html'
    },
    'admin/ux-components-demo.html': {
        title: 'UX Components Demo - Trải nghiệm',
        description: 'Demo các UX components - Micro-interactions và animations',
        keywords: 'UX components, user experience, micro-interactions, animations',
        robots: 'index, follow',
        url: 'https://sadecmarketinghub.com/admin/ux-components-demo.html'
    },
    'admin/widgets-demo.html': {
        title: 'Widgets Demo - Tiện ích',
        description: 'Demo các widgets - Notification bell, theme toggle, global search',
        keywords: 'widgets, UI widgets, web widgets, interactive components',
        robots: 'index, follow',
        url: 'https://sadecmarketinghub.com/admin/widgets-demo.html'
    },
    'admin/components/phase-tracker.html': {
        title: 'Phase Tracker - Theo dõi Giai đoạn',
        description: 'Component theo dõi phases - Project phase tracking',
        keywords: 'phase tracker, project phases, progress tracking',
        robots: 'noindex, nofollow',
        url: 'https://sadecmarketinghub.com/admin/components/phase-tracker.html'
    },
    'admin/widgets/kpi-card.html': {
        title: 'KPI Card Widget - Thẻ KPI',
        description: 'Widget hiển thị KPI - KPI cards và metrics display',
        keywords: 'KPI card, metrics widget, dashboard widget, KPI display',
        robots: 'noindex, nofollow',
        url: 'https://sadecmarketinghub.com/admin/widgets/kpi-card.html'
    },
    'admin/widgets/global-search.html': {
        title: 'Global Search Widget - Tìm kiếm',
        description: 'Widget tìm kiếm toàn cục - Command palette và search',
        keywords: 'global search, command palette, search widget, keyboard search',
        robots: 'noindex, nofollow',
        url: 'https://sadecmarketinghub.com/admin/widgets/global-search.html'
    },
    'admin/widgets/notification-bell.html': {
        title: 'Notification Bell - Chuông Thông báo',
        description: 'Widget thông báo - Real-time notifications',
        keywords: 'notification bell, notifications, alerts, real-time updates',
        robots: 'noindex, nofollow',
        url: 'https://sadecmarketinghub.com/admin/widgets/notification-bell.html'
    },
    'admin/widgets/theme-toggle.html': {
        title: 'Theme Toggle - Chuyển Chế độ',
        description: 'Widget chuyển chế độ sáng/tối - Dark mode toggle',
        keywords: 'theme toggle, dark mode, light mode, theme switcher',
        robots: 'noindex, nofollow',
        url: 'https://sadecmarketinghub.com/admin/widgets/theme-toggle.html'
    },
    'admin/widgets/conversion-funnel.html': {
        title: 'Conversion Funnel Widget - Phễu Chuyển đổi',
        description: 'Widget hiển thị conversion funnel - Funnel analytics',
        keywords: 'conversion funnel, funnel widget, analytics widget, conversion tracking',
        robots: 'noindex, nofollow',
        url: 'https://sadecmarketinghub.com/admin/widgets/conversion-funnel.html'
    },


    // Portal pages
    'portal/dashboard.html': {
        title: 'Portal Dashboard - Khách hàng',
        description: 'Dashboard khách hàng - Theo dõi dự án, báo cáo và thanh toán',
        keywords: 'client portal, dashboard, project tracking',
        robots: 'noindex, nofollow',
        url: 'https://sadecmarketinghub.com/portal/dashboard.html'
    },
    'portal/ocop-catalog.html': {
        title: 'OCOP Catalog - Sản phẩm địa phương',
        description: 'Catalog sản phẩm OCOP - Đặc sản Mekong Delta',
        keywords: 'OCOP, local products, Mekong Delta, specialties',
        robots: 'index, follow',
        url: 'https://sadecmarketinghub.com/portal/ocop-catalog.html'
    },

    // Affiliate pages
    'affiliate/dashboard.html': {
        title: 'Affiliate Dashboard - Tiếp thị Liên kết',
        description: 'Dashboard affiliate - Theo dõi hoa hồng, clicks và conversions',
        keywords: 'affiliate dashboard, affiliate marketing, commission tracking',
        robots: 'noindex, nofollow',
        url: 'https://sadecmarketinghub.com/affiliate/dashboard.html'
    },
    'affiliate/links.html': {
        title: 'Affiliate Links - Liên kết Tiếp thị',
        description: 'Quản lý affiliate links - Tạo và theo dõi liên kết',
        keywords: 'affiliate links, tracking links, referral links, link management',
        robots: 'noindex, nofollow',
        url: 'https://sadecmarketinghub.com/affiliate/links.html'
    },
    'affiliate/media.html': {
        title: 'Affiliate Media - Tài nguyên Marketing',
        description: 'Tài nguyên marketing cho affiliates - Banners, creatives, media kit',
        keywords: 'affiliate media, marketing assets, banners, creatives, media kit',
        robots: 'noindex, nofollow',
        url: 'https://sadecmarketinghub.com/affiliate/media.html'
    },
    'affiliate/profile.html': {
        title: 'Affiliate Profile - Hồ sơ',
        description: 'Hồ sơ affiliate - Quản lý thông tin và thiết lập tài khoản',
        keywords: 'affiliate profile, account settings, profile management',
        robots: 'noindex, nofollow',
        url: 'https://sadecmarketinghub.com/affiliate/profile.html'
    },
    'affiliate/referrals.html': {
        title: 'Referrals - Giới thiệu',
        description: 'Theo dõi referrals - Quản lý giới thiệu và conversions',
        keywords: 'referrals, referral tracking, conversions, affiliate referrals',
        robots: 'noindex, nofollow',
        url: 'https://sadecmarketinghub.com/affiliate/referrals.html'
    },
    'affiliate/settings.html': {
        title: 'Affiliate Settings - Cài đặt',
        description: 'Cài đặt affiliate - Payment methods và preferences',
        keywords: 'affiliate settings, payment settings, affiliate preferences',
        robots: 'noindex, nofollow',
        url: 'https://sadecmarketinghub.com/affiliate/settings.html'
    },

    // Auth pages
    'auth/login.html': {
        title: 'Đăng nhập - SaĐéc Marketing Hub',
        description: 'Đăng nhập vào hệ thống SaĐéc Marketing Hub',
        keywords: 'login, sign in, authentication',
        robots: 'noindex, nofollow',
        url: 'https://sadecmarketinghub.com/auth/login.html'
    }
};

/**
 * Generate SEO metadata HTML block
 */
function generateSEOTags(seo) {
    return `
    <!-- SEO Meta Tags -->
    <title>${seo.title}</title>
    <meta name="description" content="${seo.description}">
    <meta name="keywords" content="${seo.keywords}">
    <meta name="robots" content="${seo.robots}">
    <meta name="author" content="SaĐéc Marketing Hub">
    <meta name="theme-color" content="#3b82f6">

    <!-- Canonical URL -->
    <link rel="canonical" href="${seo.url}">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="${seo.title}">
    <meta property="og:description" content="${seo.description}">
    <meta property="og:url" content="${seo.url}">
    <meta property="og:image" content="https://sadecmarketinghub.com/og-image.png">
    <meta property="og:site_name" content="SaĐéc Marketing Hub">
    <meta property="og:locale" content="vi_VN">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${seo.title}">
    <meta name="twitter:description" content="${seo.description}">
    <meta name="twitter:image" content="https://sadecmarketinghub.com/og-image.png">
    <meta name="twitter:creator" content="@sadecmarketinghub">

    <!-- Favicon -->
    <link rel="icon" type="image/png" href="/favicon.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">

    <!-- Schema.org JSON-LD -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "MarketingAgency",
      "name": "SaĐéc Marketing Hub",
      "description": "${seo.description}",
      "url": "${seo.url}",
      "logo": {
        "@type": "ImageObject",
        "url": "https://sadecmarketinghub.com/favicon.png",
        "width": 512,
        "height": 512
      },
      "image": "https://sadecmarketinghub.com/og-image.png",
      "telephone": "+84-915-997-989",
      "email": "hello@sadecmarketinghub.com",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Sa Đéc",
        "addressLocality": "Đồng Tháp",
        "addressRegion": "Mekong Delta",
        "postalCode": "",
        "addressCountry": "VN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 10.4938,
        "longitude": 105.6881
      },
      "areaServed": {
        "@type": "AdministrativeArea",
        "name": "Mekong Delta, Vietnam"
      },
      "priceRange": "$$",
      "openingHours": "Mo-Fr 08:00-18:00",
      "sameAs": [
        "https://www.facebook.com/sadecmarketinghub",
        "https://www.linkedin.com/company/sadecmarketinghub",
        "https://www.instagram.com/sadecmarketinghub"
      ]
    }
    </script>
`;
}

/**
 * Inject SEO metadata into HTML file
 */
function injectSEO(filePath, seo) {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;

    // Check if SEO tags already exist
    if (content.includes('property="og:title"') && content.includes('name="twitter:card"')) {
        return { injected: false, reason: 'SEO tags already exist' };
    }

    // Find position after <head>
    const headMatch = content.match(/<head[^>]*>/i);
    if (!headMatch) {
        return { injected: false, reason: 'No <head> tag found' };
    }

    const headEndIndex = headMatch.index + headMatch[0].length;
    const seoTags = generateSEOTags(seo);

    // Insert SEO tags after <head>
    content = content.slice(0, headEndIndex) + '\n' + seoTags + '\n' + content.slice(headEndIndex);

    fs.writeFileSync(filePath, content, 'utf8');
    return { injected: true, reason: 'Success' };
}

/**
 * Main function
 */
function main() {
    let injected = 0;
    let skipped = 0;
    let errors = 0;

    for (const [pagePath, seo] of Object.entries(PAGE_SEO)) {
        const filePath = path.join(ROOT_DIR, pagePath);

        if (!fs.existsSync(filePath)) {
            skipped++;
            continue;
        }

        const result = injectSEO(filePath, seo);

        if (result.injected) {
            injected++;
        } else {
            skipped++;
        }
    }

    if (injected > 0) {
        } else {
        }
}

// Run
main();

#!/usr/bin/env node
/**
 * SEO Metadata Auto-Fix Script
 * Them SEO metadata (title, description, og tags, twitter cards, schema.org) cho tat ca HTML pages
 *
 * Usage: node scripts/seo/add-seo-metadata.js
 */

const fs = require('fs');
const path = require('path');

// SEO Data configuration
const SEO_DATA = {
  // Admin pages
  'admin/dashboard.html': {
    title: 'Dashboard - Quản Trị Marketing | Sa Đéc Marketing Hub',
    description: 'Bảng điều khiển quản trị tổng quan - Theo dõi chiến dịch, quản lý khách hàng và phân tích hiệu quả marketing.',
    type: 'website',
    keywords: 'dashboard, quản trị, marketing, analytics, Sa Đéc, Đồng Tháp'
  },
  'admin/agents.html': {
    title: 'AI Agents - Quản Lý Trợ Lý Ảo | Sa Đéc Marketing Hub',
    description: 'Quản lý các AI Agents tự động hóa tác vụ marketing - Content writing, lead generation, customer support.',
    type: 'website',
    keywords: 'AI agents, automation, marketing, trợ lý ảo, tự động hóa'
  },
  'admin/campaigns.html': {
    title: 'Chiến Dịch Marketing | Quản Lý Campaign - Sa Đéc Hub',
    description: 'Tạo và quản lý chiến dịch marketing đa kênh - Facebook, Google, Zalo, TikTok. Theo dõi ROI và hiệu quả.',
    type: 'website',
    keywords: 'campaign, marketing, quảng cáo, Facebook, Google, Zalo, TikTok'
  },
  'admin/leads.html': {
    title: 'Quản Lý Leads - Khách Hàng Tiềm Năng | Sa Đéc Hub',
    description: 'Theo dõi và chăm sóc khách hàng tiềm năng. CRM tích hợp AI scoring và tự động hóa follow-up.',
    type: 'website',
    keywords: 'leads, CRM, khách hàng tiềm năng, sales, marketing'
  },
  'admin/pipeline.html': {
    title: 'Sales Pipeline - Quản Lý Bán Hàng | Sa Đéc Hub',
    description: 'Quản lý quy trình bán hàng từ lead đến conversion. Sales funnel optimization và forecasting.',
    type: 'website',
    keywords: 'pipeline, sales, bán hàng, conversion, funnel'
  },
  'admin/finance.html': {
    title: 'Tài Chính - Quản Lý Ngân Sách | Sa Đéc Hub',
    description: 'Theo dõi ngân sách marketing, chi tiêu quảng cáo và ROI. Báo cáo tài chính realtime.',
    type: 'website',
    keywords: 'finance, ngân sách, ROI, chi tiêu, marketing budget'
  },
  'admin/payments.html': {
    title: 'Quản Lý Thanh Toán | Sa Đéc Marketing Hub',
    description: 'Theo dõi thanh toán từ khách hàng, tích hợp PayOS, VNPay, MoMo. Quản lý invoice và công nợ.',
    type: 'website',
    keywords: 'payments, thanh toán, invoice, PayOS, VNPay, MoMo'
  },
  'admin/pricing.html': {
    title: 'Bảng Giá Dịch Vụ Marketing | Sa Đéc Hub',
    description: 'Bảng giá dịch vụ marketing trọn gói cho doanh nghiệp SME. Packages từ cơ bản đến enterprise.',
    type: 'website',
    keywords: 'pricing, bảng giá, dịch vụ marketing, packages, SME'
  },
  'admin/content-calendar.html': {
    title: 'Content Calendar - Lịch Đăng Bài | Sa Đéc Hub',
    description: 'Lịch đăng bài content đa kênh. Lập kế hoạch và lên lịch content tự động Facebook, Instagram, Zalo.',
    type: 'website',
    keywords: 'content calendar, lịch đăng bài, content planning, social media'
  },
  'admin/reports.html': {
    title: 'Báo Cáo Marketing | Analytics Dashboard - Sa Đéc Hub',
    description: 'Báo cáo hiệu quả marketing chi tiết. Analytics dashboard với KPIs, charts và export PDF.',
    type: 'website',
    keywords: 'reports, báo cáo, analytics, KPIs, dashboard'
  },
  'admin/notifications.html': {
    title: 'Thông Báo - Notification Center | Sa Đéc Hub',
    description: 'Trung tâm thông báo chiến dịch, leads mới và thanh toán. Real-time alerts và email notifications.',
    type: 'website',
    keywords: 'notifications, thông báo, alerts, real-time'
  },
  'admin/settings.html': {
    title: 'Cài Đặt - Settings | Sa Đéc Marketing Hub',
    description: 'Cài đặt tài khoản, cấu hình chiến dịch và tích hợp. Quản lý users và permissions.',
    type: 'website',
    keywords: 'settings, cài đặt, cấu hình, users, permissions'
  },
  'admin/ecommerce.html': {
    title: 'E-commerce - Bán Hàng Online | Sa Đéc Hub',
    description: 'Giải pháp bán hàng online tích hợp - Website, Facebook Shop, Zalo Shop. Quản lý đơn hàng và inventory.',
    type: 'website',
    keywords: 'ecommerce, bán hàng online, shop, inventory, đơn hàng'
  },
  'admin/hr-hiring.html': {
    title: 'Tuyển Dụng - HR Management | Sa Đéc Hub',
    description: 'Quản lý tuyển dụng và nhân sự. ATS tích hợp AI screening và phỏng vấn tự động.',
    type: 'website',
    keywords: 'hr, hiring, tuyển dụng, nhân sự, ATS'
  },
  'admin/landing-builder.html': {
    title: 'Landing Page Builder | Sa Đéc Marketing Hub',
    description: 'Trình tạo landing page kéo thả. Templates tối ưu conversion, A/B testing tích hợp.',
    type: 'website',
    keywords: 'landing page, builder, templates, conversion, A/B testing'
  },
  'admin/lms.html': {
    title: 'LMS - Learning Management System | Sa Đéc Hub',
    description: 'Hệ thống quản lý học tập và đào tạo. E-learning courses, quizzes và certifications.',
    type: 'website',
    keywords: 'LMS, e-learning, đào tạo, courses, certifications'
  },
  'admin/menu.html': {
    title: 'Menu Manager - Quản Lý Thực Đơn | Sa Đéc Hub',
    description: 'Quản lý thực đơn nhà hàng, quán cafe. Digital menu với QR code và online ordering.',
    type: 'website',
    keywords: 'menu, thực đơn, nhà hàng, QR code, online ordering'
  },
  'admin/pos.html': {
    title: 'POS - Point of Sale | Hệ Thống Bán Hàng - Sa Đéc Hub',
    description: 'Hệ thống bán hàng POS cho nhà hàng, cafe, retail. Quản lý đơn, thanh toán và inventory realtime.',
    type: 'website',
    keywords: 'POS, point of sale, bán hàng, thanh toán, retail'
  },
  'admin/inventory.html': {
    title: 'Inventory - Quản Lý Kho | Sa Đéc Marketing Hub',
    description: 'Quản lý kho hàng và tồn kho. Tracking nhập xuất, alerts tồn kho thấp và reporting.',
    type: 'website',
    keywords: 'inventory, quản lý kho, tồn kho, nhập xuất, tracking'
  },
  'admin/suppliers.html': {
    title: 'Suppliers - Quản Lý Nhà Cung Cấp | Sa Đéc Hub',
    description: 'Quản lý nhà cung cấp và đơn mua hàng. So sánh giá, đánh giá supplier và procurement.',
    type: 'website',
    keywords: 'suppliers, nhà cung cấp, procurement, đơn mua, giá cả'
  },
  'admin/loyalty.html': {
    title: 'Loyalty Program - Khách Hàng Thân Thiết | Sa Đéc Hub',
    description: 'Chương trình khách hàng thân thiết. Points, rewards và retention campaigns.',
    type: 'website',
    keywords: 'loyalty, khách hàng thân thiết, points, rewards, retention'
  },
  'admin/quality.html': {
    title: 'Quality Control - Kiểm Soát Chất Lượng | Sa Đéc Hub',
    description: 'Kiểm soát chất lượng dịch vụ và sản phẩm. QC checklists, audits và cải tiến liên tục.',
    type: 'website',
    keywords: 'quality, kiểm soát chất lượng, QC, audits, cải tiến'
  },
  'admin/shifts.html': {
    title: 'Shifts - Quản Lý Ca Làm Việc | Sa Đéc Hub',
    description: 'Quản lý ca làm việc nhân viên. Schedule, time tracking và attendance.',
    type: 'website',
    keywords: 'shifts, ca làm việc, schedule, attendance, nhân viên'
  },
  'admin/raas-overview.html': {
    title: 'RaaS Overview - Robot as a Service | Sa Đéc Hub',
    description: 'Tổng quan dịch vụ RaaS - Robot tự động hóa marketing và sales. AI-powered workflows.',
    type: 'website',
    keywords: 'RaaS, robot, automation, AI, workflows'
  },
  'admin/roiaas-admin.html': {
    title: 'ROIaaS Admin - Quản Lý ROI | Sa Đéc Marketing Hub',
    description: 'Quản lý và tối ưu ROI chiến dịch. Analytics, attribution và optimization recommendations.',
    type: 'website',
    keywords: 'ROI, ROIaaS, analytics, attribution, optimization'
  },
  'admin/vc-readiness.html': {
    title: 'VC Readiness - Sẵn Sàng Gọi Vốn | Sa Đéc Hub',
    description: 'Chuẩn bị gọi vốn đầu tư. Pitch deck, financial projections và valuation modeling.',
    type: 'website',
    keywords: 'VC, gọi vốn, đầu tư, pitch deck, valuation'
  },
  'admin/video-workflow.html': {
    title: 'Video Workflow - Sản Xuất Video | Sa Đéc Hub',
    description: 'Quy trình sản xuất video marketing. Script, shooting, editing và publishing.',
    type: 'website',
    keywords: 'video, workflow, sản xuất, marketing, content'
  },
  'admin/workflows.html': {
    title: 'Workflows - Tự Động Hóa Quy Trình | Sa Đéc Hub',
    description: 'Tự động hóa quy trình làm việc. No-code workflows, integrations và triggers.',
    type: 'website',
    keywords: 'workflows, tự động hóa, automation, no-code, integrations'
  },
  'admin/zalo.html': {
    title: 'Zalo Marketing | Official Ads & OA Management - Sa Đéc Hub',
    description: 'Quảng cáo Zalo Official Ads và quản lý Zalo OA. Chat automation và broadcast messages.',
    type: 'website',
    keywords: 'Zalo, marketing, Official Ads, OA, chat automation'
  },
  'admin/brand-guide.html': {
    title: 'Brand Guide - Hướng Dẫn Thương Hiệu | Sa Đéc Hub',
    description: 'Hướng dẫn sử dụng thương hiệu. Logo, colors, typography và brand voice guidelines.',
    type: 'website',
    keywords: 'brand guide, thương hiệu, logo, guidelines, brand identity'
  },
  'admin/community.html': {
    title: 'Community - Xây Dựng Cộng Đồng | Sa Đéc Hub',
    description: 'Xây dựng và quản lý cộng đồng khách hàng. Engagement strategies và community growth.',
    type: 'website',
    keywords: 'community, cộng đồng, engagement, growth, customers'
  },
  'admin/approvals.html': {
    title: 'Approvals - Phê Duyệt Nội Dung | Sa Đéc Hub',
    description: 'Quy trình phê duyệt nội dung và chiến dịch. Multi-level approvals và version control.',
    type: 'website',
    keywords: 'approvals, phê duyệt, content, workflow, version control'
  },
  'admin/auth.html': {
    title: 'Authentication - Đăng Nhập | Sa Đéc Marketing Hub',
    description: 'Đăng nhập hệ thống quản trị. Secure authentication với 2FA và SSO.',
    type: 'website',
    keywords: 'auth, login, đăng nhập, 2FA, SSO, security'
  },
  'admin/binh-phap.html': {
    title: 'Binh Pháp Marketing | Strategy Framework - Sa Đéc Hub',
    description: 'Framework chiến lược marketing theo Binh Pháp Tôn Tử. Strategy templates và planning guides.',
    type: 'website',
    keywords: 'binh pháp, strategy, Tôn Tử, marketing framework, planning'
  },
  'admin/ai-analysis.html': {
    title: 'AI Analysis - Phân Tích Thông Minh | Sa Đéc Hub',
    description: 'Phân tích dữ liệu bằng AI. Insights, predictions và recommendations tự động.',
    type: 'website',
    keywords: 'AI, analysis, phân tích, insights, predictions'
  },
  'admin/api-builder.html': {
    title: 'API Builder - Xây Dựng API | Sa Đéc Hub',
    description: 'Trình tạo API không cần code. RESTful APIs, webhooks và integrations.',
    type: 'website',
    keywords: 'API, builder, REST, webhooks, integrations, no-code'
  },
  'admin/customer-success.html': {
    title: 'Customer Success - Thành Công Khách Hàng | Sa Đéc Hub',
    description: 'Đảm bảo thành công khách hàng. Onboarding, support và retention strategies.',
    type: 'website',
    keywords: 'customer success, khách hàng, onboarding, retention, support'
  },
  'admin/deploy.html': {
    title: 'Deploy - Triển Khai Dự Án | Sa Đéc Hub',
    description: 'Triển khai và publish dự án. One-click deploy, staging và production management.',
    type: 'website',
    keywords: 'deploy, triển khai, publish, staging, production'
  },
  'admin/docs.html': {
    title: 'Documentation - Tài Liệu Hướng Dẫn | Sa Đéc Hub',
    description: 'Tài liệu hướng dẫn sử dụng và API reference. Getting started và tutorials.',
    type: 'website',
    keywords: 'docs, documentation, tài liệu, API, tutorials'
  },
  'admin/events.html': {
    title: 'Events - Quản Lý Sự Kiện | Sa Đéc Hub',
    description: 'Quản lý sự kiện và webinar. Registration, ticketing và attendee management.',
    type: 'website',
    keywords: 'events, sự kiện, webinar, registration, ticketing'
  },
  'admin/legal.html': {
    title: 'Legal - Pháp Lý | Sa Đéc Marketing Hub',
    description: 'Tài liệu pháp lý và compliance. Terms, privacy policy và regulatory guidelines.',
    type: 'website',
    keywords: 'legal, pháp lý, compliance, terms, privacy'
  },
  'admin/mvp-launch.html': {
    title: 'MVP Launch - Ra Mắt Sản Phẩm | Sa Đéc Hub',
    description: 'Hướng dẫn ra mắt MVP sản phẩm. Launch checklist, go-to-market strategy.',
    type: 'website',
    keywords: 'MVP, launch, ra mắt, sản phẩm, go-to-market'
  },
  'admin/onboarding.html': {
    title: 'Onboarding - Hướng Dẫn Mới | Sa Đéc Hub',
    description: 'Quy trình onboarding khách hàng mới. Welcome sequence và training materials.',
    type: 'website',
    keywords: 'onboarding, hướng dẫn, welcome, training, new customers'
  },
  'admin/proposals.html': {
    title: 'Proposals - Đề Xuất Dự Án | Sa Đéc Hub',
    description: 'Tạo đề xuất dự án và báo giá. Proposal templates và contract generation.',
    type: 'website',
    keywords: 'proposals, đề xuất, dự án, báo giá, contracts'
  },
  'admin/retention.html': {
    title: 'Retention - Giữ Chân Khách Hàng | Sa Đéc Hub',
    description: 'Chiến lược giữ chân khách hàng. Retention campaigns và churn prevention.',
    type: 'website',
    keywords: 'retention, giữ chân, khách hàng, churn prevention, campaigns'
  },
  'admin/widgets-demo.html': {
    title: 'Widgets Demo - UI Components | Sa Đéc Hub',
    description: 'Demo các UI widgets và components. KPI cards, charts và dashboard elements.',
    type: 'website',
    keywords: 'widgets, demo, UI, components, dashboard'
  },

  // Portal pages
  'portal/dashboard.html': {
    title: 'Dashboard - Khách Hàng | Sa Đéc Marketing Hub',
    description: 'Bảng điều khiển khách hàng - Theo dõi chiến dịch, hiệu quả và báo cáo marketing.',
    type: 'website',
    keywords: 'dashboard, khách hàng, chiến dịch, báo cáo, marketing'
  },
  'portal/payments.html': {
    title: 'Thanh Toán | Quản Lý Hóa Đơn - Sa Đéc Hub',
    description: 'Quản lý thanh toán và hóa đơn. Thanh toán online PayOS, VNPay, MoMo an toàn.',
    type: 'website',
    keywords: 'payments, thanh toán, hóa đơn, PayOS, online payment'
  },
  'portal/projects.html': {
    title: 'Projects - Dự Án Của Tôi | Sa Đéc Hub',
    description: 'Quản lý dự án marketing đang triển khai. Progress tracking và deliverables.',
    type: 'website',
    keywords: 'projects, dự án, marketing, progress, deliverables'
  },
  'portal/reports.html': {
    title: 'Báo Cáo - Reports | Sa Đéc Marketing Hub',
    description: 'Báo cáo hiệu quả chiến dịch marketing. ROI analytics và performance metrics.',
    type: 'website',
    keywords: 'reports, báo cáo, analytics, ROI, performance'
  },
  'portal/missions.html': {
    title: 'Missions - Nhiệm Vụ RaaS | Sa Đéc Hub',
    description: 'Nhiệm vụ tự động hóa RaaS. AI agents thực thi chiến dịch marketing.',
    type: 'website',
    keywords: 'missions, RaaS, tự động hóa, AI agents, marketing'
  },
  'portal/credits.html': {
    title: 'Credits - Tín Dụng | Sa Đéc Marketing Hub',
    description: 'Quản lý tín dụng và số dư tài khoản. Nạp credits và theo dõi chi tiêu.',
    type: 'website',
    keywords: 'credits, tín dụng, nạp tiền, chi tiêu, balance'
  },
  'portal/invoices.html': {
    title: 'Invoices - Hóa Đơn | Sa Đéc Marketing Hub',
    description: 'Quản lý hóa đơn và chứng từ. Download invoices và lịch sử thanh toán.',
    type: 'website',
    keywords: 'invoices, hóa đơn, chứng từ, download, lịch sử'
  },
  'portal/assets.html': {
    title: 'Assets - Tài Nguyên | Sa Đéc Hub',
    description: 'Thư viện tài nguyên marketing. Templates, assets và brand materials.',
    type: 'website',
    keywords: 'assets, tài nguyên, templates, brand materials, library'
  },
  'portal/onboarding.html': {
    title: 'Onboarding - Bắt Đầu | Sa Đéc Hub',
    description: 'Hướng dẫn bắt đầu sử dụng. Setup tài khoản và cấu hình ban đầu.',
    type: 'website',
    keywords: 'onboarding, bắt đầu, setup, hướng dẫn, mới'
  },
  'portal/subscription-plans.html': {
    title: 'Gói Dịch Vụ | Subscription Plans - Sa Đéc Hub',
    description: 'Chọn gói dịch vụ phù hợp. Starter, Pro và Enterprise packages.',
    type: 'website',
    keywords: 'subscription, gói dịch vụ, pricing, packages, plans'
  },
  'portal/notifications.html': {
    title: 'Thông Báo | Notification Center - Sa Đéc Hub',
    description: 'Trung tâm thông báo và alerts. Real-time notifications và updates.',
    type: 'website',
    keywords: 'notifications, thông báo, alerts, updates, real-time'
  },
  'portal/roi-analytics.html': {
    title: 'ROI Analytics | Phân Tích Hiệu Quả - Sa Đéc Hub',
    description: 'Phân tích ROI và hiệu quả chiến dịch. Detailed analytics và insights.',
    type: 'website',
    keywords: 'ROI, analytics, phân tích, hiệu quả, insights'
  },
  'portal/roi-report.html': {
    title: 'Báo Cáo ROI | ROI Report - Sa Đéc Hub',
    description: 'Báo cáo ROI chi tiết theo chiến dịch. Export PDF và sharing.',
    type: 'website',
    keywords: 'ROI report, báo cáo ROI, export PDF, chiến dịch'
  },
  'portal/roiaas-dashboard.html': {
    title: 'ROIaaS Dashboard | Sa Đéc Marketing Hub',
    description: 'Dashboard quản lý ROIaaS. Theo dõi và tối ưu hiệu quả tự động.',
    type: 'website',
    keywords: 'ROIaaS, dashboard, quản lý, tối ưu, tự động'
  },
  'portal/roiaas-onboarding.html': {
    title: 'ROIaaS Onboarding | Bắt Đầu - Sa Đéc Hub',
    description: 'Hướng dẫn bắt đầu ROIaaS. Setup và cấu hình tự động hóa ROI.',
    type: 'website',
    keywords: 'ROIaaS, onboarding, bắt đầu, setup, automation'
  },
  'portal/ocop-catalog.html': {
    title: 'OCOP Catalog | Sản Phẩm Địa Phương - Sa Đéc Hub',
    description: 'Catalog sản phẩm OCOP vùng ĐBSCL. Quảng bá và bán hàng địa phương.',
    type: 'website',
    keywords: 'OCOP, catalog, sản phẩm địa phương, ĐBSCL, quảng bá'
  },
  'portal/subscriptions.html': {
    title: 'Subscriptions | Đăng Ký Dịch Vụ - Sa Đéc Hub',
    description: 'Quản lý đăng ký dịch vụ. Gia hạn, nâng cấp và cancel subscriptions.',
    type: 'website',
    keywords: 'subscriptions, đăng ký, gia hạn, nâng cấp, cancel'
  },
  'portal/approve.html': {
    title: 'Approve | Phê Duyệt - Sa Đéc Hub',
    description: 'Phê duyệt nội dung và chiến dịch. Approval workflow và notifications.',
    type: 'website',
    keywords: 'approve, phê duyệt, approval, workflow, content'
  },
  'portal/ocop-exporter.html': {
    title: 'OCOP Exporter | Xuất Khẩu Sản Phẩm - Sa Đéc Hub',
    description: 'Công cụ xuất khẩu sản phẩm OCOP. Export catalog và marketing materials.',
    type: 'website',
    keywords: 'OCOP, exporter, xuất khẩu, catalog, marketing'
  },
  'portal/login.html': {
    title: 'Đăng Nhập | Login - Sa Đéc Marketing Hub',
    description: 'Đăng nhập tài khoản khách hàng. Secure login với 2FA.',
    type: 'website',
    keywords: 'login, đăng nhập, khách hàng, 2FA, secure'
  },
  'portal/payment-result.html': {
    title: 'Kết Quả Thanh Toán | Payment Result - Sa Đéc Hub',
    description: 'Kết quả giao dịch thanh toán. Xác nhận và hóa đơn điện tử.',
    type: 'website',
    keywords: 'payment result, thanh toán, kết quả, hóa đơn, xác nhận'
  }
};

// Base URL config
const BASE_URL = 'https://sadecmarketinghub.com';
const DEFAULT_IMAGE = `${BASE_URL}/favicon.png`;

// Generate SEO meta tags HTML
function generateSEOTags(pageData, pagePath) {
  const url = `${BASE_URL}/${pagePath}`;

  return `
  <!-- SEO Meta Tags -->
  <title>${pageData.title}</title>
  <meta name="description" content="${pageData.description}">
  <meta name="keywords" content="${pageData.keywords}">
  <meta name="robots" content="index, follow">
  <meta name="author" content="Sa Đéc Marketing Hub">

  <!-- Canonical URL -->
  <link rel="canonical" href="${url}">

  <!-- Open Graph Meta Tags -->
  <meta property="og:title" content="${pageData.title}">
  <meta property="og:description" content="${pageData.description}">
  <meta property="og:type" content="${pageData.type}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${pageData.image || DEFAULT_IMAGE}">
  <meta property="og:site_name" content="Sa Đéc Marketing Hub">
  <meta property="og:locale" content="vi_VN">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${pageData.title}">
  <meta name="twitter:description" content="${pageData.description}">
  <meta name="twitter:image" content="${pageData.image || DEFAULT_IMAGE}">
  <meta name="twitter:creator" content="@sadecmarketinghub">

  <!-- Schema.org JSON-LD -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "${pageData.type === 'article' ? 'Article' : 'WebPage'}",
    "name": "${pageData.title}",
    "description": "${pageData.description}",
    "url": "${url}",
    "image": "${pageData.image || DEFAULT_IMAGE}",
    "publisher": {
      "@type": "Organization",
      "name": "Sa Đéc Marketing Hub",
      "url": "${BASE_URL}",
      "logo": {
        "@type": "ImageObject",
        "url": "${DEFAULT_IMAGE}"
      }
    },
    "inLanguage": "vi-VN"
  }
  </script>
`;
}

// Process HTML file
function processFile(filePath, pageData) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Find <head> tag
    const headMatch = content.match(/<head[^>]*>/i);
    if (!headMatch) {
      console.log(`⚠️  No <head> tag found in ${filePath}`);
      return false;
    }

    const headStartIndex = headMatch.index + headMatch[0].length;

    // Remove existing SEO tags (if any)
    content = content.replace(/<!-- SEO Meta Tags -->[\s\S]*?<\/script>/gi, '');
    content = content.replace(/<title>.*?<\/title>/gi, '');
    content = content.replace(/<meta name="description"[^>]*>/gi, '');
    content = content.replace(/<meta name="keywords"[^>]*>/gi, '');
    content = content.replace(/<meta name="robots"[^>]*>/gi, '');
    content = content.replace(/<meta name="author"[^>]*>/gi, '');
    content = content.replace(/<link rel="canonical"[^>]*>/gi, '');
    content = content.replace(/<meta property="og:[^"]*"[^>]*>/gi, '');
    content = content.replace(/<meta name="twitter:[^"]*"[^>]*>/gi, '');

    // Generate new SEO tags
    const pagePath = filePath.replace(/.*?(admin|portal|affiliate|auth)\//, '$1/');
    const seoTags = generateSEOTags(pageData, pagePath);

    // Insert after <head> tag
    const newContent = content.substring(0, headStartIndex) + '\n' + seoTags + '\n' + content.substring(headStartIndex);

    // Write back
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ Added SEO tags: ${filePath}`);
    return true;
  } catch (error) {
    console.log(`❌ Error processing ${filePath}: ${error.message}`);
    return false;
  }
}

// Main function
function main() {
  console.log('🔍 Sa Đéc Marketing Hub — SEO Metadata Auto-Fix\n');
  console.log('='.repeat(60));

  const baseDir = path.join(__dirname, '../..');
  let totalFiles = 0;
  let successCount = 0;
  let errorCount = 0;

  // Process each page in SEO_DATA
  for (const [pagePath, pageData] of Object.entries(SEO_DATA)) {
    const filePath = path.join(baseDir, pagePath);

    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${pagePath}`);
      continue;
    }

    totalFiles++;
    if (processFile(filePath, pageData)) {
      successCount++;
    } else {
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✅ SEO Metadata Auto-Fix Complete!`);
  console.log(`   Files Processed: ${totalFiles}`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);

  // Save report
  const reportDir = path.join(baseDir, 'reports/seo');
  fs.mkdirSync(reportDir, { recursive: true });

  const report = {
    timestamp: new Date().toISOString(),
    totalFiles,
    successCount,
    errorCount,
    pages: Object.keys(SEO_DATA)
  };

  fs.writeFileSync(
    path.join(reportDir, 'seo-metadata-report.json'),
    JSON.stringify(report, null, 2)
  );

  console.log(`\n📄 Report saved to: reports/seo/seo-metadata-report.json`);
}

// Run
main();

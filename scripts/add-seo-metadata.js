#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SADÉC MARKETING HUB — SEO METADATA INJECTOR
 *
 * Adds SEO metadata (Open Graph, Twitter Cards, meta description) to HTML pages
 *
 * Usage: node scripts/add-seo-metadata.js
 * ═══════════════════════════════════════════════════════════════════════════
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

// SEO metadata for different page types
const SEO_TEMPLATES = {
  admin: {
    siteName: 'Sa Đéc Marketing Hub - Admin',
    type: 'website',
    image: 'https://sadecmarketinghub.com/og-admin.jpg'
  },
  portal: {
    siteName: 'Sa Đéc Marketing Hub - Client Portal',
    type: 'website',
    image: 'https://sadecmarketinghub.com/og-portal.jpg'
  },
  affiliate: {
    siteName: 'Sa Đéc Marketing Hub - Affiliate Program',
    type: 'website',
    image: 'https://sadecmarketinghub.com/og-affiliate.jpg'
  },
  auth: {
    siteName: 'Sa Đéc Marketing Hub - Authentication',
    type: 'website',
    image: 'https://sadecmarketinghub.com/og-auth.jpg'
  },
  public: {
    siteName: 'Sa Đéc Marketing Hub',
    type: 'website',
    image: 'https://sadecmarketinghub.com/og-image.jpg'
  }
};

// Page-specific metadata
const PAGE_METADATA = {
  // Admin pages
  'dashboard': {
    title: 'Dashboard - Sa Đéc Marketing Hub',
    description: 'Tổng quan chiến dịch, leads, và hiệu suất marketing',
    keywords: 'dashboard, marketing, analytics, campaigns, leads'
  },
  'campaigns': {
    title: 'Chiến Dịch Marketing - Quản Lý & Tối Ưu',
    description: 'Quản lý chiến dịch marketing đa kênh: Facebook, Google, TikTok, Zalo',
    keywords: 'chiến dịch, marketing, Facebook Ads, Google Ads, TikTok Ads'
  },
  'leads': {
    title: 'Quản Lý Leads - Sa Đéc Marketing Hub',
    description: 'Theo dõi và quản lý leads, khách hàng tiềm năng',
    keywords: 'leads, khách hàng tiềm năng, CRM, sales'
  },
  'pipeline': {
    title: 'Sales Pipeline - Quản Lý Cơ Hội',
    description: 'Theo dõi cơ hội bán hàng từ lead đến closing',
    keywords: 'sales pipeline, cơ hội bán hàng, deals, closing'
  },
  'content-calendar': {
    title: 'Content Calendar - Lịch Đăng Bài',
    description: 'Lên lịch và quản lý nội dung đăng bài đa kênh',
    keywords: 'content calendar, lịch đăng bài, content marketing'
  },
  'finance': {
    title: 'Tài Chính & Ngân Sách - Sa Đéc Marketing Hub',
    description: 'Quản lý ngân sách, hóa đơn và chi tiêu marketing',
    keywords: 'tài chính, ngân sách, hóa đơn, chi tiêu marketing'
  },
  'reports': {
    title: 'Báo Cáo & Analytics - Sa Đéc Marketing Hub',
    description: 'Báo cáo hiệu suất marketing chi tiết',
    keywords: 'báo cáo, analytics, ROI, hiệu suất marketing'
  },
  'agents': {
    title: 'AI Agents - Tự Động Hóa Marketing',
    description: 'Sử dụng AI agents để tự động hóa tác vụ marketing',
    keywords: 'AI agents, tự động hóa, AI marketing, automation'
  },
  'ai-analysis': {
    title: 'Phân Tích AI - Insights & Recommendations',
    description: 'Phân tích dữ liệu marketing bằng AI',
    keywords: 'AI analysis, insights, recommendations, machine learning'
  },
  'api-builder': {
    title: 'API Builder - Tích Hợp & Automation',
    description: 'Xây dựng API và automation workflows',
    keywords: 'API builder, automation, workflows, integration'
  },
  'approvals': {
    title: 'Phê Duyệt - Workflow Approval System',
    description: 'Quản lý phê duyệt nội dung và chiến dịch',
    keywords: 'approvals, phê duyệt, workflow, content approval'
  },
  'auth': {
    title: 'Quản Lý Truy Cập - Authentication & Authorization',
    description: 'Quản lý người dùng và phân quyền',
    keywords: 'authentication, authorization, users, permissions'
  },
  'binh-phap': {
    title: 'Binh Pháp Marketing - Strategic Intelligence',
    description: 'Phân tích chiến lược và competitive intelligence',
    keywords: 'binh pháp, strategy, competitive intelligence, marketing strategy'
  },
  'brand-guide': {
    title: 'Brand Guide - Hướng Dẫn Thương Hiệu',
    description: 'Hướng dẫn sử dụng thương hiệu và tài nguyên',
    keywords: 'brand guide, thương hiệu, brand guidelines, assets'
  },
  'community': {
    title: 'Community - Quản Lý Cộng Đồng',
    description: 'Quản lý cộng đồng và tương tác khách hàng',
    keywords: 'community, cộng đồng, engagement, social media'
  },
  'customer-success': {
    title: 'Customer Success - Chăm Sóc Khách Hàng',
    description: 'Theo dõi và cải thiện trải nghiệm khách hàng',
    keywords: 'customer success, chăm sóc khách hàng, CSAT, NPS'
  },
  'deploy': {
    title: 'Deploy - Quản Lý Phiên Bản',
    description: 'Quản lý deploy và phiên bản ứng dụng',
    keywords: 'deploy, version, release, CI/CD'
  },
  'docs': {
    title: 'Tài Liệu - Documentation',
    description: 'Tài liệu hướng dẫn sử dụng Sa Đéc Marketing Hub',
    keywords: 'documentation, tài liệu, hướng dẫn, user guide'
  },
  'ecommerce': {
    title: 'E-commerce - Bán Hàng Online',
    description: 'Quản lý bán hàng ecommerce và đơn hàng',
    keywords: 'ecommerce, bán hàng online, orders, store'
  },
  'events': {
    title: 'Events - Quản Lý Sự Kiện',
    description: 'Tổ chức và quản lý sự kiện marketing',
    keywords: 'events, sự kiện, event marketing, webinar'
  },
  'hr-hiring': {
    title: 'HR & Hiring - Tuyển Dụng',
    description: 'Quản lý tuyển dụng và nhân sự',
    keywords: 'HR, hiring, tuyển dụng, nhân sự'
  },
  'inventory': {
    title: 'Inventory - Quản Lý Kho',
    description: 'Quản lý tồn kho và sản phẩm',
    keywords: 'inventory, kho, stock, products'
  },
  'landing-builder': {
    title: 'Landing Page Builder - Tạo Landing Page',
    description: 'Công cụ tạo landing page kéo thả',
    keywords: 'landing page builder, tạo landing page, drag drop'
  },
  'legal': {
    title: 'Legal - Pháp Lý & Hợp Đồng',
    description: 'Quản lý pháp lý và hợp đồng',
    keywords: 'legal, pháp lý, hợp đồng, contracts'
  },
  'lms': {
    title: 'LMS - Learning Management System',
    description: 'Hệ thống quản lý học tập và đào tạo',
    keywords: 'LMS, learning, đào tạo, courses'
  },
  'loyalty': {
    title: 'Loyalty Program - Chương Trình Thành Viên',
    description: 'Quản lý chương trình loyalty và rewards',
    keywords: 'loyalty, thành viên, rewards, points'
  },
  'menu': {
    title: 'Menu Manager - Quản Lý Thực Đơn',
    description: 'Quản lý thực đơn sản phẩm/dịch vụ',
    keywords: 'menu, thực đơn, products, services'
  },
  'mvp-launch': {
    title: 'MVP Launch - Ra Mắt Sản Phẩm',
    description: 'Quy trình ra mắt sản phẩm MVP',
    keywords: 'MVP, launch, ra mắt sản phẩm, go-to-market'
  },
  'notifications': {
    title: 'Notifications - Thông Báo',
    description: 'Quản lý thông báo và alerts',
    keywords: 'notifications, thông báo, alerts, messages'
  },
  'onboarding': {
    title: 'Onboarding - Hướng Dẫn Người Dùng Mới',
    description: 'Quy trình onboarding người dùng mới',
    keywords: 'onboarding, hướng dẫn, new users, tutorial'
  },
  'payments': {
    title: 'Payments - Thanh Toán',
    description: 'Quản lý thanh toán và giao dịch',
    keywords: 'payments, thanh toán, transactions, PayOS'
  },
  'pos': {
    title: 'POS - Point of Sale',
    description: 'Hệ thống bán hàng tại quầy',
    keywords: 'POS, point of sale, bán hàng, checkout'
  },
  'pricing': {
    title: 'Pricing - Bảng Giá',
    description: 'Quản lý bảng giá và packages',
    keywords: 'pricing, bảng giá, packages, pricing plans'
  },
  'proposals': {
    title: 'Proposals - Báo Giá & Đề Xuất',
    description: 'Tạo và quản lý báo giá, đề xuất',
    keywords: 'proposals, báo giá, đề xuất, quotes'
  },
  'quality': {
    title: 'Quality - Kiểm Soát Chất Lượng',
    description: 'Quản lý chất lượng và QA/QC',
    keywords: 'quality, chất lượng, QA, QC'
  },
  'raas-overview': {
    title: 'RaaS Overview - Revenue as a Service',
    description: 'Tổng quan dịch vụ Revenue as a Service',
    keywords: 'RaaS, Revenue as a Service, revenue growth'
  },
  'retention': {
    title: 'Retention - Giữ Chân Khách Hàng',
    description: 'Chiến lược và công cụ retention',
    keywords: 'retention, giữ chân khách hàng, churn rate'
  },
  'roiaas-admin': {
    title: 'ROIaaS Admin - Quản Lý ROI',
    description: 'Theo dõi và tối ưu ROI chiến dịch',
    keywords: 'ROI, ROIaaS, return on investment, analytics'
  },
  'shifts': {
    title: 'Shifts - Quản Lý Ca Làm Việc',
    description: 'Quản lý ca làm việc và lịch trình',
    keywords: 'shifts, ca làm việc, schedule, workforce'
  },
  'suppliers': {
    title: 'Suppliers - Quản Lý Nhà Cung Cấp',
    description: 'Quản lý nhà cung cấp và vendors',
    keywords: 'suppliers, nhà cung cấp, vendors, procurement'
  },
  'ui-demo': {
    title: 'UI Demo - Components & Design System',
    description: 'Demo các UI components và design system',
    keywords: 'UI demo, components, design system, Material Design 3'
  },
  'vc-readiness': {
    title: 'VC Readiness - Sẵn Sàng Gọi Vốn',
    description: 'Chuẩn bị hồ sơ gọi vốn VC',
    keywords: 'VC readiness, gọi vốn, fundraising, investors'
  },
  'video-workflow': {
    title: 'Video Workflow - Sản Xuất Video',
    description: 'Quy trình sản xuất và duyệt video',
    keywords: 'video workflow, sản xuất video, video production'
  },
  'workflows': {
    title: 'Workflows - Tự Động Hóa Quy Trình',
    description: 'Tự động hóa workflows và processes',
    keywords: 'workflows, automation, quy trình, processes'
  },
  'zalo': {
    title: 'Zalo Integration - Tích Hợp Zalo OA',
    description: 'Quản lý Zalo Official Account',
    keywords: 'Zalo, Zalo OA, integration, messaging'
  },
  'widgets-demo': {
    title: 'Widgets Demo - Dashboard Widgets',
    description: 'Demo các widgets dashboard',
    keywords: 'widgets, dashboard, KPI cards, charts'
  },

  // Portal pages
  'portal/dashboard': {
    title: 'Client Dashboard - Sa Đéc Marketing Hub',
    description: 'Tổng quan chiến dịch và hiệu suất của bạn',
    keywords: 'client dashboard, chiến dịch, performance, analytics'
  },
  'portal/projects': {
    title: 'Projects - Dự Án Của Bạn',
    description: 'Theo dõi tiến độ dự án marketing',
    keywords: 'projects, dự án, progress, marketing projects'
  },
  'portal/invoices': {
    title: 'Invoices - Hóa Đơn & Thanh Toán',
    description: 'Quản lý hóa đơn và thanh toán',
    keywords: 'invoices, hóa đơn, billing, payments'
  },
  'portal/payments': {
    title: 'Payments - Thanh Toán Online',
    description: 'Thanh toán hóa đơn online qua PayOS',
    keywords: 'payments, thanh toán online, PayOS, credit card'
  },
  'portal/reports': {
    title: 'Reports - Báo Cáo Hiệu Suất',
    description: 'Báo cáo hiệu suất chiến dịch chi tiết',
    keywords: 'reports, báo cáo, performance, ROI'
  },
  'portal/assets': {
    title: 'Assets - Tài Nguyên & Brand Assets',
    description: 'Tải xuống tài nguyên và brand assets',
    keywords: 'assets, tài nguyên, brand assets, downloads'
  },
  'portal/onboarding': {
    title: 'Onboarding - Bắt Đầu Sử Dụng',
    description: 'Hướng dẫn bắt đầu sử dụng Sa Đéc Marketing Hub',
    keywords: 'onboarding, bắt đầu, tutorial, guide'
  },
  'portal/subscriptions': {
    title: 'Subscriptions - Gói Dịch Vụ',
    description: 'Quản lý gói dịch vụ và subscription',
    keywords: 'subscriptions, gói dịch vụ, plans, pricing'
  },
  'portal/missions': {
    title: 'Missions - Nhiệm Vụ & Tasks',
    description: 'Theo dõi nhiệm vụ và tasks cần hoàn thành',
    keywords: 'missions, tasks, nhiệm vụ, to-do'
  },
  'portal/credits': {
    title: 'Credits - Tín Dụng & Usage',
    description: 'Quản lý tín dụng và usage',
    keywords: 'credits, tín dụng, usage, quota'
  },

  // Affiliate pages
  'affiliate/dashboard': {
    title: 'Affiliate Dashboard - Chương Trình Tiếp Thị Liên Kết',
    description: 'Theo dõi hoa hồng và hiệu suất affiliate',
    keywords: 'affiliate dashboard, hoa hồng, commissions, referral'
  },
  'affiliate/links': {
    title: 'Affiliate Links - Link Tiếp Thị',
    description: 'Quản lý link affiliate và tracking',
    keywords: 'affiliate links, link tiếp thị, tracking, referral links'
  },
  'affiliate/commissions': {
    title: 'Commissions - Hoa Hồng Affiliate',
    description: 'Theo dõi hoa hồng và thanh toán',
    keywords: 'commissions, hoa hồng, affiliate earnings, payments'
  },
  'affiliate/media': {
    title: 'Media - Tài Nguyên Marketing',
    description: 'Tải xuống tài nguyên marketing cho affiliates',
    keywords: 'media, tài nguyên, marketing assets, banners'
  },
  'affiliate/profile': {
    title: 'Profile - Hồ Sơ Affiliate',
    description: 'Quản lý hồ sơ và thông tin affiliate',
    keywords: 'profile, hồ sơ, affiliate profile, settings'
  },
  'affiliate/referrals': {
    title: 'Referrals - Người Được Giới Thiệu',
    description: 'Theo dõi người được giới thiệu',
    keywords: 'referrals, người giới thiệu, referred users'
  },
  'affiliate/settings': {
    title: 'Settings - Cài Đặt Affiliate',
    description: 'Cài đặt tài khoản affiliate',
    keywords: 'settings, cài đặt, affiliate settings, account'
  },

  // Auth pages
  'auth/login': {
    title: 'Đăng Nhập - Sa Đéc Marketing Hub',
    description: 'Đăng nhập vào Sa Đéc Marketing Hub',
    keywords: 'đăng nhập, login, sign in, authentication'
  },
  'auth/register': {
    title: 'Đăng Ký - Sa Đéc Marketing Hub',
    description: 'Đăng ký tài khoản mới',
    keywords: 'đăng ký, register, sign up, create account'
  },
  'auth/forgot-password': {
    title: 'Quên Mật Khẩu - Khôi Phục Tài Khoản',
    description: 'Khôi phục mật khẩu tài khoản',
    keywords: 'quên mật khẩu, forgot password, reset password, khôi phục'
  }
};

/**
 * Generate SEO metadata HTML
 */
function generateSEOMetadata(pageName, pageType = 'admin') {
  const template = SEO_TEMPLATES[pageType] || SEO_TEMPLATES.public;
  const metadata = PAGE_METADATA[pageName] || {
    title: `${pageName} - Sa Đéc Marketing Hub`,
    description: 'Sa Đéc Marketing Hub - Platform marketing toàn diện',
    keywords: 'marketing, CRM, analytics, automation'
  };

  const currentYear = new Date().getFullYear();

  return `
    <!-- SEO Meta Tags -->
    <title>${metadata.title}</title>
    <meta name="description" content="${metadata.description}">
    <meta name="keywords" content="${metadata.keywords}">
    <meta name="author" content="Sa Đéc Marketing Hub">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="https://sadecmarketinghub.com/${pageName}.html">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="${template.type}">
    <meta property="og:url" content="https://sadecmarketinghub.com/${pageName}.html">
    <meta property="og:title" content="${metadata.title}">
    <meta property="og:description" content="${metadata.description}">
    <meta property="og:image" content="${template.image}">
    <meta property="og:site_name" content="${template.siteName}">
    <meta property="og:locale" content="vi_VN">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="https://sadecmarketinghub.com/${pageName}.html">
    <meta name="twitter:title" content="${metadata.title}">
    <meta name="twitter:description" content="${metadata.description}">
    <meta name="twitter:image" content="${template.image}">

    <!-- Additional SEO -->
    <meta name="theme-color" content="#006A60">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="application-name" content="Sa Đéc Marketing Hub">
    <meta name="msapplication-TileColor" content="#006A60">
    <meta name="msapplication-config" content="/browserconfig.xml">

    <!-- Structured Data (JSON-LD) -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "${metadata.title}",
      "description": "${metadata.description}",
      "keywords": "${metadata.keywords}",
      "publisher": {
        "@type": "Organization",
        "name": "Sa Đéc Marketing Hub",
        "logo": {
          "@type": "ImageObject",
          "url": "https://sadecmarketinghub.com/logo.png"
        }
      },
      "url": "https://sadecmarketinghub.com/${pageName}.html",
      "inLanguage": "vi-VN",
      "copyrightYear": "${currentYear}"
    }
    </script>
`;
}

/**
 * Add SEO metadata to HTML file
 */
function addSEOMetadata(filePath, pageName, pageType) {
  let content = fs.readFileSync(filePath, 'utf-8');

  // Check if full SEO metadata already exists (OG tags)
  if (content.includes('<meta property="og:title"') &&
      content.includes('<meta property="og:description"')) {
    console.log(`  ⚠️  SEO metadata already exists in ${pageName}.html`);
    return false;
  }

  const seoMetadata = generateSEOMetadata(pageName, pageType);

  // Insert SEO metadata after existing meta tags
  const headMatch = content.match(/<head[^>]*>/);
  if (!headMatch) {
    console.log(`  ❌ No <head> tag found in ${pageName}.html`);
    return false;
  }

  const headTag = headMatch[0];
  const insertPosition = content.indexOf(headTag) + headTag.length;

  // Find the position after existing meta tags (charset, viewport, title)
  let existingMetaEnd = insertPosition;
  const metaTags = content.substring(insertPosition, insertPosition + 1500);
  const lastMetaMatch = metaTags.match(/<\/meta>|<\/title>|<\/link>/);
  if (lastMetaMatch) {
    existingMetaEnd = insertPosition + metaTags.indexOf(lastMetaMatch[0]) + lastMetaMatch[0].length;
  }

  // Insert SEO metadata
  content = content.substring(0, existingMetaEnd) + '\n' + seoMetadata + content.substring(existingMetaEnd);

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`  ✅ Added SEO metadata to ${pageName}.html`);
  return true;
}

/**
 * Update SEO metadata in HTML file (replace existing)
 */
function updateSEOMetadata(filePath, pageName, pageType) {
  let content = fs.readFileSync(filePath, 'utf-8');

  const seoMetadata = generateSEOMetadata(pageName, pageType);

  // Remove existing SEO metadata if present
  content = content.replace(/<!-- SEO Meta Tags -->[\s\S]*?<\/script>/, '');
  content = content.replace(/<!-- Open Graph[\s\S]*?<\/script>/, '');
  content = content.replace(/<!-- Twitter Card[\s\S]*?twitter:image">/, '');
  content = content.replace(/<!-- Additional SEO[\s\S]*?\/browserconfig.xml">/, '');
  content = content.replace(/<!-- Structured Data[\s\S]*?<\/script>/, '');

  // Insert fresh SEO metadata after existing meta tags
  const headMatch = content.match(/<head[^>]*>/);
  if (!headMatch) {
    console.log(`  ❌ No <head> tag found in ${pageName}.html`);
    return false;
  }

  const headTag = headMatch[0];
  const insertPosition = content.indexOf(headTag) + headTag.length;

  // Find the position after existing meta tags (charset, viewport, title)
  let existingMetaEnd = insertPosition;
  const metaTags = content.substring(insertPosition, insertPosition + 1500);
  const lastMetaMatch = metaTags.match(/<\/meta>|<\/title>|<\/link>/);
  if (lastMetaMatch) {
    existingMetaEnd = insertPosition + metaTags.indexOf(lastMetaMatch[0]) + lastMetaMatch[0].length;
  }

  // Insert SEO metadata
  content = content.substring(0, existingMetaEnd) + '\n' + seoMetadata + content.substring(existingMetaEnd);

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`  ✅ Updated SEO metadata to ${pageName}.html`);
  return true;
}

/**
 * Scan directory and add SEO metadata to HTML files
 */
function scanAndAddSEO(dir, pageType) {
  const files = fs.readdirSync(dir);
  let updated = 0;

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      updated += scanAndAddSEO(filePath, pageType);
    } else if (file.endsWith('.html') && !file.includes('.min.')) {
      const pageName = file.replace('.html', '');
      if (pageName !== 'index' && pageName !== '404') {
        if (addSEOMetadata(filePath, pageName, pageType)) {
          updated++;
        }
      }
    }
  });

  return updated;
}

/**
 * Main function
 */
function main() {
  console.log('🔍 Adding SEO Metadata to Sa Đéc Marketing Hub\n');

  let total = 0;

  // Admin pages
  console.log('📦 Admin Pages');
  const adminDir = path.join(ROOT_DIR, 'admin');
  if (fs.existsSync(adminDir)) {
    total += scanAndAddSEO(adminDir, 'admin');
  }

  // Portal pages
  console.log('\n📦 Portal Pages');
  const portalDir = path.join(ROOT_DIR, 'portal');
  if (fs.existsSync(portalDir)) {
    total += scanAndAddSEO(portalDir, 'portal');
  }

  // Affiliate pages
  console.log('\n📦 Affiliate Pages');
  const affiliateDir = path.join(ROOT_DIR, 'affiliate');
  if (fs.existsSync(affiliateDir)) {
    total += scanAndAddSEO(affiliateDir, 'affiliate');
  }

  // Auth pages
  console.log('\n📦 Auth Pages');
  const authDir = path.join(ROOT_DIR, 'auth');
  if (fs.existsSync(authDir)) {
    total += scanAndAddSEO(authDir, 'auth');
  }

  // Root pages
  console.log('\n📦 Root Pages');
  const rootFiles = ['index.html', 'login.html', 'register.html', 'forgot-password.html'];
  rootFiles.forEach(file => {
    const filePath = path.join(ROOT_DIR, file);
    if (fs.existsSync(filePath)) {
      const pageName = file.replace('.html', '');
      if (addSEOMetadata(filePath, pageName, 'public')) {
        total++;
      }
    }
  });

  console.log(`\n✅ Total files updated: ${total}`);

  // Write report
  const reportDir = path.join(ROOT_DIR, '..', '..', 'reports', 'dev', 'seo-metadata');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const reportPath = path.join(reportDir, 'seo-metadata-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalFilesUpdated: total,
    directories: ['admin', 'portal', 'affiliate', 'auth', 'root']
  }, null, 2));

  console.log(`📄 Report saved to: ${reportPath}\n`);
}

// Run
main();

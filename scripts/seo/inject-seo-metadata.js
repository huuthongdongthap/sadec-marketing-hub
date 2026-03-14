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
    console.log('🔍 SEO Metadata Injector\n');
    console.log('════════════════════════════════════════\n');

    let injected = 0;
    let skipped = 0;
    let errors = 0;

    for (const [pagePath, seo] of Object.entries(PAGE_SEO)) {
        const filePath = path.join(ROOT_DIR, pagePath);

        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  File not found: ${pagePath}`);
            skipped++;
            continue;
        }

        const result = injectSEO(filePath, seo);

        if (result.injected) {
            console.log(`✓ ${pagePath}`);
            injected++;
        } else {
            console.log(`⊘ ${pagePath} - ${result.reason}`);
            skipped++;
        }
    }

    console.log('\n════════════════════════════════════════');
    console.log(`📊 Kết quả:`);
    console.log(`   Injected: ${injected} files`);
    console.log(`   Skipped: ${skipped} files`);
    console.log(`   Errors: ${errors} files`);
    console.log('════════════════════════════════════════\n');

    if (injected > 0) {
        console.log('✅ SEO metadata injection complete!\n');
    } else {
        console.log('⚠️  No files were modified.\n');
    }
}

// Run
main();

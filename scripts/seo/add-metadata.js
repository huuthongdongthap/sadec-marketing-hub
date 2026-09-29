#!/usr/bin/env node
/**
 * Sa Đéc Marketing Hub - SEO Metadata Automation
 * Tự động thêm SEO metadata cho các HTML pages thiếu
 *
 * Usage: node scripts/seo/add-metadata.js
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../..');
const DIRECTORIES = ['admin', 'portal', 'affiliate', 'auth', ''];
const EXCLUDE_DIRS = ['node_modules', '.git', 'dist', 'assets', 'scripts', 'database', 'supabase', 'docs', 'reports'];

const SEO_TEMPLATES = {
    'admin': { siteName: 'Sa Đéc Marketing Hub - Admin', image: 'https://sadecmarketinghub.com/favicon.png', locale: 'vi_VN', twitterHandle: '@sadecmarketinghub' },
    'portal': { siteName: 'Sa Đéc Marketing Hub - Portal', image: 'https://sadecmarketinghub.com/favicon.png', locale: 'vi_VN', twitterHandle: '@sadecmarketinghub' },
    'affiliate': { siteName: 'Sa Đéc Marketing Hub - Affiliate', image: 'https://sadecmarketinghub.com/favicon.png', locale: 'vi_VN', twitterHandle: '@sadecmarketinghub' },
    'auth': { siteName: 'Sa Đéc Marketing Hub - Authentication', image: 'https://sadecmarketinghub.com/favicon.png', locale: 'vi_VN', twitterHandle: '@sadecmarketinghub' },
    '': { siteName: 'Sa Đéc Marketing Hub', image: 'https://sadecmarketinghub.com/favicon.png', locale: 'vi_VN', twitterHandle: '@sadecmarketinghub' }
};

const PAGE_TITLES = {
    'admin': {
        'dashboard': 'Dashboard - Quản Trị Marketing',
        'finance': 'Tài Chính - Quản Lý Ngân Sách',
        'campaigns': 'Chiến Dịch - Quản Lý Campaigns',
        'leads': 'Khách Hàng Tiềm Năng - Lead Management',
        'content-calendar': 'Lịch Nội Dung - Content Calendar',
        'agents': 'AI Agents - Trợ Lý Ảo',
        'workflows': 'Workflows - Tự Động Hóa',
        'pipeline': 'Pipeline - Quản Lý Bán Hàng',
        'approvals': 'Phê Duyệt - Approval Workflow',
        'notifications': 'Thông Báo - Notifications',
        'community': 'Cộng Đồng - Community Hub',
        'deploy': 'Deploy - CI/CD Deployment',
        'menu': 'Menu - Navigation Management',
        'pricing': 'Báo Giá - Pricing Plans',
        'proposals': 'Đề Xuất - Sales Proposals',
        'lms': 'LMS - Learning Management',
        'pos': 'POS - Point of Sale',
        'ecommerce': 'E-commerce - Bán Hàng Online',
        'inventory': 'Tồn Kho - Inventory Management',
        'hr-hiring': 'Tuyển Dụng - HR & Hiring',
        'retention': 'Giữ Chân Khách - Customer Retention',
        'landing-builder': 'Landing Page Builder',
        'events': 'Sự Kiện - Events Management',
        'quality': 'Chất Lượng - Quality Assurance',
        'video-workflow': 'Video Workflow - Sản Xuất Video',
        'roiaas-admin': 'ROIaaS Admin - ROI Analytics',
        'binh-phap': 'Binh Pháp - Strategic Planning',
        'ai-analysis': 'AI Analysis - Phân Tích AI',
        'brand-guide': 'Brand Guide - Thương Hiệu',
        'ui-components-demo': 'UI Components Demo',
        'components-demo': 'Components Demo',
        'widgets-demo': 'Widgets Demo',
        'docs': 'Tài Liệu - Documentation',
        'customer-success': 'Customer Success - Hỗ Trợ Khách Hàng',
        'onboarding': 'Onboarding - Hướng Dẫn',
        'vc-readiness': 'VC Readiness - Gọi Vốn'
    },
    'portal': {
        'dashboard': 'Dashboard - Bảng Điều Khiển',
        'projects': 'Dự Án - Project Management',
        'reports': 'Báo Cáo - Analytics Reports',
        'payments': 'Thanh Toán - Payment',
        'payment-result': 'Kết Quả Thanh Toán',
        'invoices': 'Hóa Đơn - Invoices',
        'subscriptions': 'Gói Đăng Ký - Subscriptions',
        'subscription-plans': 'Chọn Gói - Subscription Plans',
        'missions': 'Nhiệm Vụ - Missions',
        'roi-analytics': 'ROI Analytics - Phân Tích ROI',
        'roi-report': 'Báo Cáo ROI',
        'roiaas-dashboard': 'ROIaaS Dashboard',
        'roiaas-onboarding': 'ROIaaS Onboarding',
        'onboarding': 'Onboarding - Hướng Dẫn',
        'approve': 'Phê Duyệt - Approval',
        'credits': 'Tín Dụng - Credits',
        'login': 'Đăng Nhập - Portal Login',
        'notifications': 'Thông Báo - Notifications',
        'assets': 'Tài Sản - Assets'
    },
    'affiliate': {
        'dashboard': 'Dashboard - Affiliate Dashboard',
        'links': 'Link Tiếp Thị - Affiliate Links',
        'commissions': 'Hoa Hồng - Commissions',
        'referrals': 'Giới Thiệu - Referrals',
        'payments': 'Thanh Toán - Payments',
        'settings': 'Cài Đặt - Settings',
        'profile': 'Hồ Sơ - Profile',
        'media': 'Media - Tài Nguyên Quảng Cáo'
    },
    'auth': {
        'login': 'Đăng Nhập - Sign In',
        'register': 'Đăng Ký - Sign Up',
        'forgot-password': 'Quên Mật Khẩu - Forgot Password',
        'verify-email': 'Xác Thực Email - Verify Email'
    }
};

const PAGE_DESCRIPTIONS = {
    'admin': {
        'dashboard': 'Bảng điều khiển quản trị tổng quan - Theo dõi chiến dịch, quản lý khách hàng và phân tích hiệu quả marketing.',
        'finance': 'Theo dõi ngân sách marketing, chi tiêu quảng cáo và ROI. Báo cáo tài chính realtime.',
        'campaigns': 'Quản lý chiến dịch marketing đa kênh. Theo dõi hiệu quả và tối ưu hóa ROI.',
        'leads': 'Quản lý khách hàng tiềm năng. Theo dõi và chăm sóc leads tự động.',
        'content-calendar': 'Lịch đăng nội dung đa kênh. Lên kế hoạch và tự động đăng bài.',
        'agents': 'AI Agents - Trợ lý ảo thông minh. Tự động hóa tác vụ marketing.',
        'workflows': 'Tự động hóa quy trình làm việc. Tạo workflows không cần code.',
        'pipeline': 'Quản lý bán hàng pipeline. Theo dõi deals và conversion rate.',
        'approvals': 'Workflow phê duyệt nội dung. Quản lý duyệt bài tập thể.',
        'notifications': 'Trung tâm thông báo. Nhận alerts realtime từ hệ thống.',
        'community': 'Cộng đồng người dùng. Forum và knowledge sharing.',
        'deploy': 'CI/CD deployment. Quản lý versions và releases.',
        'menu': 'Quản lý menu navigation. Cấu hình giao diện admin.',
        'pricing': 'Bảng báo giá dịch vụ. So sánh các gói subscription.',
        'proposals': 'Tạo sales proposals. Proposal builder thông minh.',
        'lms': 'Learning Management System. Đào tạo và certification.',
        'pos': 'Point of Sale - Bán hàng tại quầy. Quản lý đơn hàng.',
        'ecommerce': 'E-commerce platform - Bán hàng online. Quản lý sản phẩm.',
        'inventory': 'Quản lý tồn kho. Theo dõi stock và alerts.',
        'hr-hiring': 'Tuyển dụng và HR. Job postings và candidate tracking.',
        'retention': 'Customer retention. Loyalty programs và engagement.',
        'landing-builder': 'Landing page builder. Tạo landing pages kéo thả.',
        'events': 'Quản lý sự kiện. Event planning và execution.',
        'quality': 'Quality assurance. Testing và quality control.',
        'video-workflow': 'Video production workflow. Quản lý sản xuất video.',
        'roiaas-admin': 'ROIaaS admin dashboard. ROI analytics chuyên sâu.',
        'binh-phap': 'Binh pháp marketing. Strategic planning framework.',
        'ai-analysis': 'AI-powered analysis. Insights và recommendations.',
        'brand-guide': 'Brand guidelines. Logo, colors và typography.',
        'ui-components-demo': 'UI components showcase. Material Design 3.',
        'components-demo': 'Components demo. Interactive component library.',
        'widgets-demo': 'Widgets demo. Dashboard widgets preview.',
        'docs': 'Documentation. API docs và user guides.',
        'customer-success': 'Customer success portal. Support và resources.',
        'onboarding': 'User onboarding. Welcome tour và tutorials.',
        'vc-readiness': 'VC readiness assessment. Fundraising preparation.'
    },
    'portal': {
        'dashboard': 'Bảng điều khiển khách hàng. Theo dõi dự án và chiến dịch.',
        'projects': 'Quản lý dự án marketing. Progress và deliverables.',
        'reports': 'Báo cáo hiệu quả marketing. Analytics và insights.',
        'payments': 'Cổng thanh toán online. VNPay, MoMo, PayOS.',
        'payment-result': 'Kết quả giao dịch thanh toán.',
        'invoices': 'Hóa đơn điện tử. Lịch sử và trạng thái thanh toán.',
        'subscriptions': 'Quản lý subscription. Gia hạn và nâng cấp.',
        'subscription-plans': 'So sánh các gói dịch vụ. Chọn gói phù hợp.',
        'missions': 'Nhiệm vụ marketing. Execution tracking.',
        'roi-analytics': 'Phân tích ROI. Đo lường hiệu quả đầu tư.',
        'roi-report': 'Báo cáo ROI chi tiết. Performance metrics.',
        'roiaas-dashboard': 'ROIaaS analytics dashboard. Advanced reporting.',
        'roiaas-onboarding': 'ROIaaS onboarding guide. Getting started.',
        'onboarding': 'Khách hàng onboarding. Welcome và setup.',
        'approve': 'Phê duyệt nội dung. Review và approve.',
        'credits': 'Credit balance. Quản lý tín dụng.',
        'login': 'Đăng nhập portal. Customer login.',
        'notifications': 'Thông báo. Realtime updates.',
        'assets': 'Tài sản số. Media library và assets.'
    },
    'affiliate': {
        'dashboard': 'Affiliate dashboard. Theo dõi performance và earnings.',
        'links': 'Affiliate links. Quản lý link tiếp thị.',
        'commissions': 'Hoa hồng affiliate. Tracking và payouts.',
        'referrals': 'Referrals tracking. Theo dõi người giới thiệu.',
        'payments': 'Affiliate payments. Nhận hoa hồng.',
        'settings': 'Affiliate settings. Cấu hình tài khoản.',
        'profile': 'Affiliate profile. Thông tin cá nhân.',
        'media': 'Media assets. Quảng cáo và creatives.'
    },
    'auth': {
        'login': 'Đăng nhập tài khoản. Sign in to your account.',
        'register': 'Đăng ký tài khoản mới. Create new account.',
        'forgot-password': 'Khôi phục mật khẩu. Reset password.',
        'verify-email': 'Xác thực email. Verify your email address.'
    }
};

function hasSEO(content) {
    const checks = {
        title: /<title>.*<\/title>/i.test(content),
        description: /<meta[^>]*name=["']description["'][^>]*>/i.test(content),
        ogTitle: /<meta[^>]*property=["']og:title["'][^>]*>/i.test(content),
        ogDescription: /<meta[^>]*property=["']og:description["'][^>]*>/i.test(content),
        ogImage: /<meta[^>]*property=["']og:image["'][^>]*>/i.test(content),
        twitterCard: /<meta[^>]*name=["']twitter:card["'][^>]*>/i.test(content),
        jsonLd: /<script[^>]*type=["']application\/ld\+json["'][^>]*>/i.test(content)
    };
    const score = Object.values(checks).filter(v => v).length;
    return { score, total: Object.keys(checks).length, checks };
}

function generateSEOMeta(section, pageName, baseUrl = 'https://sadecmarketinghub.com') {
    const config = SEO_TEMPLATES[section] || SEO_TEMPLATES[''];
    const titles = PAGE_TITLES[section] || {};
    const descriptions = PAGE_DESCRIPTIONS[section] || {};
    const title = titles[pageName] || `Sa Đéc Marketing Hub - ${pageName}`;
    const description = descriptions[pageName] || `Sa Đéc Marketing Hub - ${pageName}`;
    const url = `${baseUrl}/${section}${section && pageName ? '/' : ''}${pageName}.html`;

    return `
  <!-- SEO Meta Tags -->
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta name="keywords" content="${pageName}, marketing, analytics, Sa Đéc, Đồng Tháp">
  <meta name="robots" content="index, follow">
  <meta name="author" content="Sa Đéc Marketing Hub">
  <!-- Canonical URL -->
  <link rel="canonical" href="${url}">
  <!-- Open Graph Meta Tags -->
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${config.image}">
  <meta property="og:site_name" content="${config.siteName}">
  <meta property="og:locale" content="${config.locale}">
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${config.image}">
  <meta name="twitter:creator" content="${config.twitterHandle}">
  <!-- Schema.org JSON-LD -->
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"WebPage","name":"${title}","description":"${description}","url":"${url}","image":"${config.image}","publisher":{"@type":"Organization","name":"${config.siteName}","url":"${baseUrl}","logo":{"@type":"ImageObject","url":"${config.image}"}},"inLanguage":"vi-VN"}</script>
`;
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(ROOT_DIR, filePath);
    const seoCheck = hasSEO(content);

    if (seoCheck.score === seoCheck.total) {
        return { filePath: relativePath, status: 'already-complete', score: seoCheck.score };
    }

    const pathParts = relativePath.split(path.sep);
    let section = '';
    let pageName = path.basename(filePath, '.html');
    if (pathParts.length > 1) section = pathParts[0];

    const seoMeta = generateSEOMeta(section, pageName);
    const headMatch = content.match(/<head[^>]*>/i);
    if (!headMatch) return { filePath: relativePath, status: 'error', error: 'No <head> tag found' };

    const headEndIndex = headMatch.index + headMatch[0].length;
    if (content.includes('<!-- SEO Meta Tags -->')) {
        return { filePath: relativePath, status: 'already-has-seo', score: seoCheck.score };
    }

    const newContent = content.slice(0, headEndIndex) + '\n' + seoMeta + content.slice(headEndIndex);
    fs.writeFileSync(filePath, newContent, 'utf8');

    return { filePath: relativePath, status: 'updated', beforeScore: seoCheck.score, afterScore: seoCheck.total };
}

function processDirectory(dir) {
    const results = [];
    if (!fs.existsSync(dir)) return results;
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of files) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (EXCLUDE_DIRS.includes(entry.name)) continue;
            results.push(...processDirectory(fullPath));
        } else if (entry.isFile() && entry.name.endsWith('.html')) {
            if (fullPath.includes('/widgets/')) continue;
            results.push(processFile(fullPath));
        }
    }
    return results;
}

function main() {
    );
    const allResults = [];
    for (const dir of DIRECTORIES) {
        const dirPath = path.join(ROOT_DIR, dir);
        allResults.push(...processDirectory(dirPath));
    }

    const updated = allResults.filter(r => r.status === 'updated').length;
    const alreadyComplete = allResults.filter(r => r.status === 'already-complete' || r.status === 'already-has-seo').length;
    const errors = allResults.filter(r => r.status === 'error').length;

    );
    if (errors > 0) {
        allResults.filter(r => r.status === 'error').forEach(r => );
    }

    const reportPath = path.join(ROOT_DIR, 'reports', 'seo-metadata-report.json');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        summary: { total: allResults.length, updated, alreadyComplete, errors },
        results: allResults
    }, null, 2));

    );
}

main();

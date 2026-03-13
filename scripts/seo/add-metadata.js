#!/usr/bin/env node
/**
 * Add SEO Metadata to HTML files
 * Tự động thêm title, meta description, og tags, twitter cards, JSON-LD
 *
 * Usage: node scripts/seo/add-metadata.js
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../..');

// SEO metadata mapping
const SEO_DATA = {
    // Root pages
    'offline.html': {
        title: 'Offline - Mekong Agency',
        description: 'Bạn đang ngoại tuyến. Vui lòng kiểm tra kết nối internet.',
        type: 'website'
    },
    'forgot-password.html': {
        title: 'Quên Mật Khẩu - Mekong Agency',
        description: 'Đặt lại mật khẩu tài khoản Mekong Agency của bạn.',
        type: 'website'
    },
    'register.html': {
        title: 'Đăng Ký - Mekong Agency',
        description: 'Tạo tài khoản miễn phí để sử dụng các công cụ marketing.',
        type: 'website'
    },
    'verify-email.html': {
        title: 'Xác Nhận Email - Mekong Agency',
        description: 'Xác nhận địa chỉ email để kích hoạt tài khoản.',
        type: 'website'
    },
    'privacy.html': {
        title: 'Chính Sách Bảo Mật - Mekong Agency',
        description: 'Chính sách bảo mật và quyền riêng tư của Mekong Agency.',
        type: 'website'
    },
    'terms.html': {
        title: 'Điều Khoản Sử Dụng - Mekong Agency',
        description: 'Điều khoản và điều kiện sử dụng dịch vụ Mekong Agency.',
        type: 'website'
    },

    // Auth pages
    'auth/login.html': {
        title: 'Đăng Nhập - Mekong Agency',
        description: 'Đăng nhập vào hệ thống quản lý marketing.',
        type: 'website'
    },

    // Admin pages
    'admin/video-workflow.html': {
        title: 'Video Workflow - Mekong Admin',
        description: 'Quản lý quy trình sản xuất video content.',
        type: 'website'
    },
    'admin/pipeline.html': {
        title: 'Sales Pipeline - Mekong Admin',
        description: 'Quản lý pipeline bán hàng và leads.',
        type: 'website'
    },
    'admin/suppliers.html': {
        title: 'Nhà Cung Cấp - Mekong Admin',
        description: 'Quản lý nhà cung cấp và đối tác.',
        type: 'website'
    },
    'admin/landing-builder.html': {
        title: 'Landing Page Builder - Mekong Admin',
        description: 'Tạo landing page chuyên nghiệp không cần code.',
        type: 'website'
    },
    'admin/finance.html': {
        title: 'Tài Chính - Mekong Admin',
        description: 'Quản lý tài chính, doanh thu và chi phí.',
        type: 'website'
    },
    'admin/community.html': {
        title: 'Cộng Đồng - Mekong Admin',
        description: 'Xây dựng và quản lý cộng đồng khách hàng.',
        type: 'website'
    },
    'admin/legal.html': {
        title: 'Pháp Lý - Mekong Admin',
        description: 'Quản lý hồ sơ pháp lý và hợp đồng.',
        type: 'website'
    },
    'admin/vc-readiness.html': {
        title: 'VC Readiness - Mekong Admin',
        description: 'Chuẩn bị gọi vốn và làm việc với VCs.',
        type: 'website'
    },
    'admin/approvals.html': {
        title: 'Phê Duyệt - Mekong Admin',
        description: 'Quản lý quy trình phê duyệt nội dung.',
        type: 'website'
    },
    'admin/inventory.html': {
        title: 'Kho Hàng - Mekong Admin',
        description: 'Quản lý kho hàng và tồn kho.',
        type: 'website'
    },
    'admin/auth.html': {
        title: 'Xác Thực - Mekong Admin',
        description: 'Quản lý xác thực và phân quyền.',
        type: 'website'
    },
    'admin/pricing.html': {
        title: 'Bảng Giá - Mekong Admin',
        description: 'Quản lý bảng giá và gói dịch vụ.',
        type: 'website'
    },
    'admin/raas-overview.html': {
        title: 'ROIaaS Overview - Mekong Admin',
        description: 'Tổng quan về nền tảng ROI-as-a-Service.',
        type: 'website'
    },
    'admin/notifications.html': {
        title: 'Thông Báo - Mekong Admin',
        description: 'Quản lý thông báo và alerts.',
        type: 'website'
    },
    'admin/leads.html': {
        title: 'Leads - Mekong Admin',
        description: 'Quản lý leads và khách hàng tiềm năng.',
        type: 'website'
    },
    'admin/payments.html': {
        title: 'Thanh Toán - Mekong Admin',
        description: 'Quản lý thanh toán và hóa đơn.',
        type: 'website'
    },
    'admin/menu.html': {
        title: 'Menu - Mekong Admin',
        description: 'Quản lý menu nhà hàng F&B.',
        type: 'website'
    },
    'admin/shifts.html': {
        title: 'Ca Làm Việc - Mekong Admin',
        description: 'Quản lý ca làm việc và nhân sự.',
        type: 'website'
    },
    'admin/ai-analysis.html': {
        title: 'AI Analysis - Mekong Admin',
        description: 'Phân tích dữ liệu bằng AI.',
        type: 'website'
    },
    'admin/agents.html': {
        title: 'Agents - Mekong Admin',
        description: 'Quản lý AI agents tự động.',
        type: 'website'
    },
    'admin/api-builder.html': {
        title: 'API Builder - Mekong Admin',
        description: 'Xây dựng API không cần code.',
        type: 'website'
    },
    'admin/binh-phap.html': {
        title: 'Binh Pháp - Mekong Admin',
        description: 'Học thuyết quản trị theo Binh Pháp Tôn Tử.',
        type: 'website'
    },
    'admin/campaigns.html': {
        title: 'Chiến Dịch - Mekong Admin',
        description: 'Quản lý chiến dịch marketing đa kênh.',
        type: 'website'
    },
    'admin/content-calendar.html': {
        title: 'Content Calendar - Mekong Admin',
        description: 'Lịch đăng content và bài viết.',
        type: 'website'
    },
    'admin/customer-success.html': {
        title: 'Customer Success - Mekong Admin',
        description: 'Quản lý thành công khách hàng.',
        type: 'website'
    },
    'admin/dashboard.html': {
        title: 'Dashboard - Mekong Admin',
        description: 'Bảng điều khiển quản trị tổng quan.',
        type: 'website'
    },
    'admin/deploy.html': {
        title: 'Deploy - Mekong Admin',
        description: 'Deploy và vận hành hệ thống.',
        type: 'website'
    },
    'admin/docs.html': {
        title: 'Tài Liệu - Mekong Admin',
        description: 'Tài liệu hướng dẫn sử dụng.',
        type: 'website'
    },
    'admin/ecommerce.html': {
        title: 'E-commerce - Mekong Admin',
        description: 'Quản lý bán hàng online.',
        type: 'website'
    },
    'admin/events.html': {
        title: 'Sự Kiện - Mekong Admin',
        description: 'Quản lý sự kiện và webinar.',
        type: 'website'
    },
    'admin/hr-hiring.html': {
        title: 'Tuyển Dụng - Mekong Admin',
        description: 'Quản lý tuyển dụng và nhân sự.',
        type: 'website'
    },
    'admin/lms.html': {
        title: 'LMS - Mekong Admin',
        description: 'Hệ thống học tập trực tuyến.',
        type: 'website'
    },
    'admin/loyalty.html': {
        title: 'Loyalty - Mekong Admin',
        description: 'Chương trình khách hàng thân thiết.',
        type: 'website'
    },
    'admin/mvp-launch.html': {
        title: 'MVP Launch - Mekong Admin',
        description: 'Ra mắt sản phẩm MVP.',
        type: 'website'
    },
    'admin/onboarding.html': {
        title: 'Onboarding - Mekong Admin',
        description: 'Hướng dẫn người dùng mới.',
        type: 'website'
    },
    'admin/pipeline.html': {
        title: 'Pipeline - Mekong Admin',
        description: 'Quản lý quy trình bán hàng.',
        type: 'website'
    },
    'admin/pos.html': {
        title: 'POS - Mekong Admin',
        description: 'Hệ thống bán hàng điểm.',
        type: 'website'
    },
    'admin/proposals.html': {
        title: 'Proposals - Mekong Admin',
        description: 'Tạo báo giá và đề xuất.',
        type: 'website'
    },
    'admin/quality.html': {
        title: 'Quality - Mekong Admin',
        description: 'Quản lý chất lượng sản phẩm.',
        type: 'website'
    },
    'admin/retention.html': {
        title: 'Retention - Mekong Admin',
        description: 'Chiến lược giữ chân khách hàng.',
        type: 'website'
    },
    'admin/roiaas-admin.html': {
        title: 'ROIaaS Admin - Mekong Admin',
        description: 'Quản trị nền tảng ROI-as-a-Service.',
        type: 'website'
    },
    'admin/widgets/kpi-card.html': {
        title: 'KPI Card Widget - Mekong Admin',
        description: 'Component hiển thị KPI dashboard.',
        type: 'website'
    },
    'admin/workflows.html': {
        title: 'Workflows - Mekong Admin',
        description: 'Quy trình làm việc tự động.',
        type: 'website'
    },
    'admin/zalo.html': {
        title: 'Zalo OA - Mekong Admin',
        description: 'Quản lý Zalo Official Account.',
        type: 'website'
    },

    // Portal pages
    'portal/credits.html': {
        title: 'Credits - Mekong Portal',
        description: 'Quản lý tín dụng và MCUs.',
        type: 'website'
    },
    'portal/login.html': {
        title: 'Đăng Nhập - Mekong Portal',
        description: 'Đăng nhập portal khách hàng.',
        type: 'website'
    },
    'portal/onboarding.html': {
        title: 'Onboarding - Mekong Portal',
        description: 'Hướng dẫn sử dụng portal.',
        type: 'website'
    },
    'portal/roi-analytics.html': {
        title: 'ROI Analytics - Mekong Portal',
        description: 'Phân tích ROI chiến dịch marketing.',
        type: 'website'
    },
    'portal/roi-report.html': {
        title: 'Báo Cáo ROI - Mekong Portal',
        description: 'Báo cáo hiệu quả ROI.',
        type: 'website'
    }
};

/**
 * Generate SEO tags HTML
 */
function generateSEOTags(data, relativePath) {
    const url = `https://sadecmarketinghub.com/${relativePath}`;
    const image = 'https://sadecmarketinghub.com/favicon.png';

    return `
  <!-- SEO Meta Tags -->
  <title>${data.title}</title>
  <meta name="description" content="${data.description}">

  <!-- Canonical URL -->
  <link rel="canonical" href="${url}">

  <!-- Open Graph Meta Tags -->
  <meta property="og:title" content="${data.title}">
  <meta property="og:description" content="${data.description}">
  <meta property="og:type" content="${data.type || 'website'}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${image}">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${data.title}">
  <meta name="twitter:description" content="${data.description}">
  <meta name="twitter:image" content="${image}">

  <!-- Schema.org JSON-LD -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "MarketingAgency",
    "name": "Mekong Agency",
    "description": "${data.description}",
    "url": "${url}",
    "logo": "https://sadecmarketinghub.com/favicon.png",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Sa Đéc",
      "addressRegion": "Đồng Tháp",
      "addressCountry": "VN"
    },
    "areaServed": "Mekong Delta",
    "priceRange": "$$"
  }
  </script>
`;
}

/**
 * Process HTML file
 */
function processFile(filePath, data) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Check if already has SEO tags
    if (content.includes('<title>') && content.includes('og:title')) {
        console.log(`  → ${path.relative(ROOT_DIR, filePath)}: Already has SEO`);
        return false;
    }

    // Find </head> or first link/style tag
    const insertBefore = content.indexOf('</head>');
    if (insertBefore === -1) {
        console.log(`  ✗ ${path.relative(ROOT_DIR, filePath)}: No </head> found`);
        return false;
    }

    // Generate SEO tags
    const relativePath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');
    const seoTags = generateSEOTags(data, relativePath);

    // Insert before </head>
    content = content.substring(0, insertBefore) + seoTags + '\n' + content.substring(insertBefore);

    // Write back
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✓ ${path.relative(ROOT_DIR, filePath)}: Added SEO tags`);

    return true;
}

/**
 * Main function
 */
function main() {
    console.log('🚀 Adding SEO metadata to HTML files...\n');

    let updated = 0;

    for (const [file, data] of Object.entries(SEO_DATA)) {
        const filePath = path.join(ROOT_DIR, file);

        if (fs.existsSync(filePath)) {
            if (processFile(filePath, data)) {
                updated++;
            }
        } else {
            console.log(`  - ${file}: File not found`);
        }
    }

    console.log(`\n✅ SEO metadata complete! Updated ${updated} files.`);
}

main();

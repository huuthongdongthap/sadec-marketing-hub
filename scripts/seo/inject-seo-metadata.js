#!/usr/bin/env node
/**
 * ==============================================
 * SEO METADATA AUTO-INJECTOR
 * Tự động thêm SEO metadata, og tags, title, description cho HTML files
 * @version 1.0.0 | 2026-03-14
 * ==============================================
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURATION
// ============================================================================

const ROOT_DIR = path.resolve(__dirname, '..');
const SCAN_DIRS = ['admin', 'portal', 'affiliate', 'auth', ''];
const BASE_URL = 'https://sadecmarketinghub.com';

// SEO Templates per section
const SEO_TEMPLATES = {
  admin: {
    siteName: 'Sa Đéc Marketing Hub - Admin',
    image: '/og-admin.jpg',
    pages: {
      'dashboard.html': {
        title: 'Dashboard - Quản Trị Marketing',
        description: 'Bảng điều khiển quản trị tổng quan - Theo dõi chiến dịch, quản lý khách hàng và phân tích hiệu quả marketing.'
      },
      'campaigns.html': {
        title: 'Chiến Dịch Marketing - Quản Lý & Theo Dõi',
        description: 'Quản lý chiến dịch marketing, theo dõi hiệu suất, phân tích ROI và tối ưu hóa ngân sách quảng cáo.'
      },
      'leads.html': {
        title: 'Quản Lý Khách Hàng Tiềm Năng',
        description: 'Theo dõi và quản lý khách hàng tiềm năng, chuyển đổi lead thành khách hàng thực sự.'
      },
      'finance.html': {
        title: 'Tài Chính - Doanh Thu & Chi Tiêu',
        description: 'Theo dõi doanh thu, chi tiêu, lợi nhuận và các chỉ số tài chính quan trọng.'
      },
      'reports.html': {
        title: 'Báo Cáo & Phân Tích',
        description: 'Báo cáo chi tiết về hiệu suất marketing, phân tích dữ liệu và insights.'
      },
      'content-calendar.html': {
        title: 'Lịch Nội Dung Marketing',
        description: 'Lên kế hoạch và quản lý lịch đăng nội dung trên các kênh mạng xã hội.'
      },
      'missions.html': {
        title: 'Nhiệm Vụ - Quản Lý Công Việc',
        description: 'Theo dõi và quản lý nhiệm vụ, công việc marketing với AI hỗ trợ.'
      },
      'payments.html': {
        title: 'Thanh Toán - Quản Lý Giao Dịch',
        description: 'Quản lý giao dịch thanh toán, hóa đơn và các phương thức thanh toán.'
      },
      'subscriptions.html': {
        title: 'Gói Đăng Ký - Sa Đéc Marketing Hub',
        description: 'Xem và quản lý các gói đăng ký dịch vụ marketing.'
      },
      'credits.html': {
        title: 'Tín Dụng - Số Dư Tài Khoản',
        description: 'Quản lý tín dụng, nạp tiền và theo dõi số dư tài khoản.'
      },
      'invoices.html': {
        title: 'Hóa Đơn - Quản Lý Thanh Toán',
        description: 'Xem và quản lý hóa đơn, lịch sử thanh toán và xuất hóa đơn.'
      },
      'projects.html': {
        title: 'Dự Án - Quản Lý Dự Án Marketing',
        description: 'Quản lý dự án marketing, theo dõi tiến độ và phân công nhiệm vụ.'
      },
      'roi-analytics.html': {
        title: 'Phân Tích ROI - ROI Analytics',
        description: 'Phân tích lợi tức đầu tư (ROI), đo lường hiệu quả chiến dịch marketing.'
      },
      'roiaas-dashboard.html': {
        title: 'ROIaaS Dashboard - Phân Tích Hiệu Suất',
        description: 'Dashboard phân tích ROI as a Service, theo dõi KPI và metrics quan trọng.'
      },
      'roiaas-onboarding.html': {
        title: 'ROIaaS Onboarding - Hướng Dẫn Sử Dụng',
        description: 'Hướng dẫn thiết lập và sử dụng ROIaaS dashboard.'
      },
      'subscription-plans.html': {
        title: 'Gói Đăng Ký Dịch Vụ - Sa Đéc Marketing Hub',
        description: 'Xem các gói đăng ký dịch vụ marketing với giá cả và tính năng chi tiết.'
      },
      'agents.html': {
        title: 'AI Agents - Trợ Lý Ảo',
        description: 'Quản lý và sử dụng AI agents để tự động hóa công việc marketing.'
      },
      'ai-analysis.html': {
        title: 'Phân Tích AI - AI Content Analysis',
        description: 'Phân tích nội dung bằng AI, insights và đề xuất tối ưu hóa.'
      },
      'api-builder.html': {
        title: 'API Builder - Xây Dựng API',
        description: 'Công cụ xây dựng và quản lý API tích hợp.'
      },
      'approvals.html': {
        title: 'Phê Duyệt - Quản Lý Duyệt Nội Dung',
        description: 'Quản lý quy trình phê duyệt nội dung và chiến dịch.'
      },
      'auth.html': {
        title: 'Xác Thực - Đăng Nhập & Đăng Ký',
        description: 'Đăng nhập hoặc đăng ký tài khoản Sa Đéc Marketing Hub.'
      },
      'binh-phap.html': {
        title: 'Binh Pháp Marketing - Chiến Lược Kinh Doanh',
        description: 'Học và áp dụng Binh Pháp Tôn Tử trong marketing và kinh doanh.'
      },
      'brand-guide.html': {
        title: 'Brand Guide - Hướng Dẫn Thương Hiệu',
        description: 'Hướng dẫn sử dụng thương hiệu, màu sắc, font chữ và tone giọng.'
      },
      'community.html': {
        title: 'Cộng Đồng - Sa Đéc Marketing Hub',
        description: 'Tham gia cộng đồng marketers tại Sa Đéc và Đồng Tháp.'
      },
      'components-demo.html': {
        title: 'Components Demo - Thư Viện UI',
        description: 'Demo các components UI, animations và hover effects.'
      },
      'customer-success.html': {
        title: 'Customer Success - Hỗ Trợ Khách Hàng',
        description: 'Trung tâm hỗ trợ khách hàng, giải đáp thắc mắc và hướng dẫn sử dụng.'
      },
      'deploy.html': {
        title: 'Deploy - Triển Khai Dự Án',
        description: 'Triển khai và quản lý các dự án marketing.'
      },
      'docs.html': {
        title: 'Tài Liệu - Documentation',
        description: 'Tài liệu hướng dẫn sử dụng Sa Đéc Marketing Hub.'
      },
      'ecommerce.html': {
        title: 'E-commerce - Bán Hàng Online',
        description: 'Công cụ quản lý bán hàng online, cửa hàng trực tuyến.'
      },
      'events.html': {
        title: 'Sự Kiện - Events & Workshops',
        description: 'Quản lý và tham gia các sự kiện, workshops marketing.'
      },
      'features-demo.html': {
        title: 'Tính Năng Nổi Bật - Features Demo',
        description: 'Demo các tính năng nổi bật của Sa Đéc Marketing Hub.'
      },
      'hr-hiring.html': {
        title: 'Tuyển Dụng - HR & Hiring',
        description: 'Quản lý tuyển dụng, tìm kiếm nhân tài marketing.'
      },
      'lms.html': {
        title: 'LMS - Học Tập Trực Tuyến',
        description: 'Hệ thống quản lý học tập, khóa học marketing online.'
      },
      'leads.html': {
        title: 'Khách Hàng Tiềm Năng - Lead Management',
        description: 'Quản lý và chuyển đổi khách hàng tiềm năng.'
      },
      'legal.html': {
        title: 'Pháp Lý - Legal & Compliance',
        description: 'Thông tin pháp lý, điều khoản và chính sách bảo mật.'
      },
      'mvp-launch.html': {
        title: 'MVP Launch - Ra Mắt Sản Phẩm',
        description: 'Quản lý quy trình ra mắt sản phẩm MVP.'
      },
      'ocop-catalog.html': {
        title: 'OCOP Catalog - Sản Phẩm OCOP',
        description: 'Catalog sản phẩm OCOP Đồng Tháp và Sa Đéc.'
      },
      'ocop-exporter.html': {
        title: 'OCOP Exporter - Xuất Khẩu OCOP',
        description: 'Công cụ hỗ trợ xuất khẩu sản phẩm OCOP.'
      },
      'onboarding.html': {
        title: 'Onboarding - Hướng Dẫn Mới',
        description: 'Hướng dẫn người dùng mới sử dụng Sa Đéc Marketing Hub.'
      },
      'payment-result.html': {
        title: 'Kết Quả Thanh Toán',
        description: 'Xem kết quả giao dịch thanh toán.'
      },
      'notifications.html': {
        title: 'Thông Báo - Notifications',
        description: 'Xem tất cả thông báo từ Sa Đéc Marketing Hub.'
      },
      'menu.html': {
        title: 'Menu - Điều Hướng',
        description: 'Menu điều hướng chính của Sa Đéc Marketing Hub.'
      }
    }
  },
  portal: {
    siteName: 'Sa Đéc Marketing Hub - Portal',
    image: '/og-portal.jpg',
    pages: {
      'dashboard.html': {
        title: 'Dashboard - Cổng Khách Hàng',
        description: 'Cổng thông tin khách hàng, theo dõi dự án và chiến dịch marketing.'
      },
      'projects.html': {
        title: 'Dự Án Của Tôi - Portal Projects',
        description: 'Xem và quản lý các dự án marketing đang thực hiện.'
      },
      'invoices.html': {
        title: 'Hóa Đơn - Portal Invoices',
        description: 'Xem và thanh toán hóa đơn dịch vụ marketing.'
      },
      'payments.html': {
        title: 'Thanh Toán - Portal Payments',
        description: 'Lịch sử thanh toán và các phương thức thanh toán.'
      },
      'missions.html': {
        title: 'Nhiệm Vụ - Portal Missions',
        description: 'Theo dõi nhiệm vụ và công việc marketing.'
      },
      'credits.html': {
        title: 'Tín Dụng - Portal Credits',
        description: 'Quản lý tín dụng và số dư tài khoản.'
      },
      'subscriptions.html': {
        title: 'Đăng Ký - Portal Subscriptions',
        description: 'Quản lý gói đăng ký dịch vụ.'
      },
      'approve.html': {
        title: 'Phê Duyệt - Portal Approve',
        description: 'Phê duyệt nội dung và chiến dịch marketing.'
      },
      'onboarding.html': {
        title: 'Hướng Dẫn - Portal Onboarding',
        description: 'Hướng dẫn sử dụng portal cho khách hàng.'
      },
      'roi-report.html': {
        title: 'Báo Cáo ROI - Portal ROI Report',
        description: 'Xem báo cáo ROI chi tiết của chiến dịch.'
      },
      'roi-analytics.html': {
        title: 'Phân Tích ROI - Portal ROI Analytics',
        description: 'Phân tích và đo lường hiệu quả ROI.'
      },
      'roiaas-onboarding.html': {
        title: 'ROIaaS Onboarding',
        description: 'Hướng dẫn sử dụng ROIaaS dashboard.'
      },
      'ocop-catalog.html': {
        title: 'Catalog OCOP',
        description: 'Xem catalog sản phẩm OCOP.'
      },
      'ocop-exporter.html': {
        title: 'OCOP Exporter',
        description: 'Công cụ xuất khẩu OCOP.'
      },
      'agents.html': {
        title: 'AI Agents - Portal',
        description: 'Sử dụng AI agents trong portal.'
      },
      'content-calendar.html': {
        title: 'Lịch Nội Dung - Portal',
        description: 'Xem lịch nội dung marketing.'
      },
      'campaigns.html': {
        title: 'Chiến Dịch - Portal',
        description: 'Theo dõi chiến dịch marketing.'
      },
      'payment-link.html': {
        title: 'Liên Kết Thanh Toán',
        description: 'Thanh toán qua liên kết.'
      }
    }
  },
  affiliate: {
    siteName: 'Sa Đéc Marketing Hub - Affiliate',
    image: '/og-affiliate.jpg',
    pages: {
      'dashboard.html': {
        title: 'Dashboard - Affiliate Marketing',
        description: 'Dashboard quản lý affiliate marketing, theo dõi hoa hồng.'
      },
      'campaigns.html': {
        title: 'Chiến Dịch Affiliate',
        description: 'Tham gia chiến dịch affiliate marketing.'
      },
      'earnings.html': {
        title: 'Thu Nhập - Affiliate Earnings',
        description: 'Theo dõi thu nhập và hoa hồng affiliate.'
      }
    }
  },
  auth: {
    siteName: 'Sa Đéc Marketing Hub - Authentication',
    image: '/og-auth.jpg',
    pages: {
      'login.html': {
        title: 'Đăng Nhập - Sa Đéc Marketing Hub',
        description: 'Đăng nhập vào tài khoản Sa Đéc Marketing Hub.'
      },
      'register.html': {
        title: 'Đăng Ký - Sa Đéc Marketing Hub',
        description: 'Đăng ký tài khoản mới Sa Đéc Marketing Hub.'
      },
      'forgot-password.html': {
        title: 'Quên Mật Khẩu - Khôi Phục Tài Khoản',
        description: 'Khôi phục mật khẩu tài khoản Sa Đéc Marketing Hub.'
      },
      'verify-email.html': {
        title: 'Xác Thực Email - Sa Đéc Marketing Hub',
        description: 'Xác thực địa chỉ email để kích hoạt tài khoản.'
      }
    }
  }
};

// Root pages
const ROOT_PAGES = {
  'index.html': {
    title: 'Sa Đéc Marketing Hub - Nâng Tầm Thương Hiệu Việt',
    description: 'Nền tảng marketing toàn diện giúp doanh nghiệp Sa Đéc và Đồng Tháp phát triển thương hiệu, tăng doanh số với AI và chiến lược binh pháp.'
  },
  'lp.html': {
    title: 'Sa Đéc Marketing Hub - Landing Page',
    description: 'Trang landing page giới thiệu dịch vụ marketing Sa Đéc Marketing Hub.'
  },
  'privacy.html': {
    title: 'Chính Sách Bảo Mật - Sa Đéc Marketing Hub',
    description: 'Chính sách bảo mật thông tin khách hàng và người dùng.'
  },
  'terms.html': {
    title: 'Điều Khoản Dịch Vụ - Sa Đéc Marketing Hub',
    description: 'Điều khoản sử dụng dịch vụ Sa Đéc Marketing Hub.'
  },
  'offline.html': {
    title: 'Offline - Sa Đéc Marketing Hub',
    description: 'Bạn đang ngoại tuyến. Vui lòng kết nối internet để tiếp tục.'
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all HTML files recursively
 */
function getAllHTMLFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);

    try {
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        if (!filePath.includes('node_modules') && !filePath.includes('dist')) {
          getAllHTMLFiles(filePath, fileList);
        }
      } else if (file.endsWith('.html')) {
        fileList.push(filePath);
      }
    } catch (err) {
      // Ignore errors
    }
  }

  return fileList;
}

/**
 * Generate SEO metadata HTML
 */
function generateSEOMetadata(pageConfig, section, filename) {
  const { title, description } = pageConfig;
  const sectionConfig = SEO_TEMPLATES[section];
  const siteName = sectionConfig?.siteName || 'Sa Đéc Marketing Hub';
  const image = sectionConfig?.image || '/favicon.png';

  const canonicalUrl = section
    ? `${BASE_URL}/${section}/${filename}`
    : `${BASE_URL}/${filename}`;

  return `
  <!-- SEO Meta Tags -->
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta name="keywords" content="marketing, Sa Đéc, Đồng Tháp, AI, ROI, digital marketing, quảng cáo">
  <meta name="robots" content="index, follow">
  <meta name="author" content="Sa Đéc Marketing Hub">

  <!-- Canonical URL -->
  <link rel="canonical" href="${canonicalUrl}">

  <!-- Open Graph Meta Tags -->
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:image" content="${BASE_URL}${image}">
  <meta property="og:site_name" content="${siteName}">
  <meta property="og:locale" content="vi_VN">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${BASE_URL}${image}">
  <meta name="twitter:creator" content="@sadecmarketinghub">

  <!-- Schema.org JSON-LD -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "${title}",
    "description": "${description}",
    "url": "${canonicalUrl}",
    "image": "${BASE_URL}${image}",
    "publisher": {
      "@type": "Organization",
      "name": "Sa Đéc Marketing Hub",
      "url": "${BASE_URL}",
      "logo": {
        "@type": "ImageObject",
        "url": "${BASE_URL}/favicon.png"
      }
    },
    "inLanguage": "vi-VN"
  }
  </script>
`;
}

/**
 * Check if file already has SEO metadata
 */
function hasSEOMetadata(content) {
  const hasTitle = /<title>[^<]+<\/title>/i.test(content);
  const hasDescription = /<meta[^>]+name=["']description["'][^>]+>/i.test(content);
  const hasOgTitle = /<meta[^>]+property=["']og:title["'][^>]+>/i.test(content);
  const hasJsonLd = /<script[^>]+type=["']application\/ld\+json["'][^>]+>/i.test(content);

  return hasTitle && hasDescription && hasOgTitle && hasJsonLd;
}

/**
 * Inject SEO metadata into HTML content
 */
function injectSEOMetadata(content, metadata) {
  // Find head tag
  const headMatch = content.match(/<head[^>]*>/i);
  if (!headMatch) return content;

  const headIndex = content.indexOf(headMatch[0]);
  const insertPosition = headIndex + headMatch[0].length;

  // Check for existing DNS prefetch duplicates
  let newContent = content.slice(0, insertPosition) + '\n' + metadata + '\n\n' + content.slice(insertPosition);

  // Remove duplicate dns-prefetch
  const dnsPattern = /<!-- DNS Prefetch \(Deduplicated\) -->[\s\S]*?<link rel="dns-prefetch"[^>]+>/g;
  const matches = newContent.match(dnsPattern);
  if (matches && matches.length > 1) {
    // Keep only first occurrence
    let count = 0;
    newContent = newContent.replace(dnsPattern, (match) => {
      if (count++ === 0) return match;
      return '';
    });
  }

  return newContent;
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

async function injectSEO() {
  console.log('🔍 Sa Đéc Marketing Hub — SEO Metadata Auto-Injector\n');

  const results = {
    total: 0,
    updated: 0,
    skipped: 0,
    errors: 0
  };

  // Process root files first
  console.log('📁 Processing root files...');
  const rootDir = ROOT_DIR;
  const rootHtmlFiles = fs.readdirSync(rootDir)
    .filter(f => f.endsWith('.html') && !f.includes('.min.'));

  for (const filename of rootHtmlFiles) {
    results.total++;
    const filePath = path.join(rootDir, filename);

    try {
      let content = fs.readFileSync(filePath, 'utf-8');

      // Check if already has SEO
      if (hasSEOMetadata(content)) {
        console.log(`  ⏭️  ${filename} - Already has SEO`);
        results.skipped++;
        continue;
      }

      // Get page config
      const pageConfig = ROOT_PAGES?.[filename];
      if (!pageConfig) {
        console.log(`  ⚠️  ${filename} - No template found, skipping`);
        results.skipped++;
        continue;
      }

      // Generate and inject metadata
      const metadata = generateSEOMetadata(pageConfig, '', filename);
      const newContent = injectSEOMetadata(content, metadata);

      // Write back
      fs.writeFileSync(filePath, newContent, 'utf-8');
      console.log(`  ✅ ${filename} - SEO injected`);
      results.updated++;

    } catch (error) {
      console.error(`  ❌ ${filename} - Error: ${error.message}`);
      results.errors++;
    }
  }

  console.log('');

  // Process each section
  for (const section of ['admin', 'portal', 'affiliate', 'auth']) {
    const scanDir = path.join(ROOT_DIR, section);
    const templates = SEO_TEMPLATES[section]?.pages;

    if (!fs.existsSync(scanDir)) continue;

    console.log(`📁 Processing ${section}...`);

    const htmlFiles = fs.readdirSync(scanDir)
      .filter(f => f.endsWith('.html') && !f.includes('.min.'));

    for (const filename of htmlFiles) {
      results.total++;
      const filePath = path.join(scanDir, filename);

      try {
        let content = fs.readFileSync(filePath, 'utf-8');

        // Check if already has SEO
        if (hasSEOMetadata(content)) {
          console.log(`  ⏭️  ${filename} - Already has SEO`);
          results.skipped++;
          continue;
        }

        // Get page config
        const pageConfig = templates?.[filename];
        if (!pageConfig) {
          console.log(`  ⚠️  ${filename} - No template found, skipping`);
          results.skipped++;
          continue;
        }

        // Generate and inject metadata
        const metadata = generateSEOMetadata(pageConfig, section, filename);
        const newContent = injectSEOMetadata(content, metadata);

        // Write back
        fs.writeFileSync(filePath, newContent, 'utf-8');
        console.log(`  ✅ ${filename} - SEO injected`);
        results.updated++;

      } catch (error) {
        console.error(`  ❌ ${filename} - Error: ${error.message}`);
        results.errors++;
      }
    }

    console.log('');
  }

  // Summary
  console.log('📊 SUMMARY');
  console.log('────────────────────────────────────────');
  console.log(`   Total Files: ${results.total}`);
  console.log(`   Updated: ${results.updated}`);
  console.log(`   Skipped: ${results.skipped}`);
  console.log(`   Errors: ${results.errors}`);
  console.log('────────────────────────────────────────');

  const healthScore = Math.round((results.updated / results.total) * 100);
  console.log(`\n🏆 SEO Coverage: ${healthScore}%`);
}

// CLI execution
if (require.main === module) {
  injectSEO().catch(console.error);
}

module.exports = { injectSEO };

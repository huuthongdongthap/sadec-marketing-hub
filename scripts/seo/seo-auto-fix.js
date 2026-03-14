/**
 * Auto-Fix SEO Metadata Script
 * Tự động thêm SEO metadata vào các HTML files còn thiếu
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..', '..');

const SITE_CONFIG = {
    baseUrl: 'https://sadecmarketinghub.com',
    defaultTitle: 'Sa Đéc Marketing Hub - RaaS Agency Operating System',
    defaultDescription: 'Nền tảng quản trị marketing tự động - ROI Analytics, Campaign Management, Multi-Gateway Payments',
    defaultImage: 'https://sadecmarketinghub.com/favicon.png',
    twitterHandle: '@sadecmarketinghub'
};

const PAGE_TITLES = {
    'dashboard.html': 'Dashboard - Quản Trị Marketing',
    'campaigns.html': 'Chiến Dịch - Quản Lý Campaign',
    'leads.html': 'Khách Hàng Tiềm Năng - Leads Management',
    'payments.html': 'Thanh Toán - Payment Gateway',
    'reports.html': 'Báo Cáo - Analytics & Reports',
    'profile.html': 'Hồ Sơ - User Profile',
    'settings.html': 'Cài Đặt - Settings',
    'notifications.html': 'Thông Báo - Notifications',
    'subscriptions.html': 'Gói Đăng Ký - Subscription Plans',
    'invoices.html': 'Hóa Đơn - Invoices',
    'projects.html': 'Dự Án - Projects Management',
    'missions.html': 'Nhiệm Vụ - Missions',
    'assets.html': 'Tài Sản - Digital Assets',
    'credits.html': 'Tín Dụng - Credits Management',
    'roi-analytics.html': 'ROI Analytics - Phân Tích Hiệu Quả',
    'roiaas-dashboard.html': 'ROI as a Service - Dashboard',
    'roiaas-onboarding.html': 'ROI as a Service - Onboarding',
    'roi-report.html': 'Báo Cáo ROI - ROI Report',
    'ocop-catalog.html': 'OCOP Catalog - Sản Phẩm Địa Phương',
    'ocop-exporter.html': 'OCOP Exporter - Công Cụ Xuất Khẩu',
    'payment-result.html': 'Kết Quả Thanh Toán - Payment Result',
    'approve.html': 'Duyệt Thanh Toán - Payment Approval',
    'subscription-plans.html': 'Gói Đăng Ký - Subscription Plans',
    'pos.html': 'POS - Point of Sale System',
    'onboarding.html': 'Hướng Dẫn - Onboarding',
    'quality.html': 'Chất Lượng - Quality Control',
    'landing-builder.html': 'Landing Page Builder',
    'inventory.html': 'Kho Hàng - Inventory Management',
    'workflows.html': 'Quy Trình - Workflows',
    'suppliers.html': 'Nhà Cung Cấp - Suppliers',
    'approvals.html': 'Duyệt Đơn - Approvals',
    'zalo.html': 'Zalo OA - Integration',
    'menu.html': 'Thực Đơn - Menu Management',
    'pipeline.html': 'Sales Pipeline - Quản Lý Bán Hàng',
    'vc-readiness.html': 'VC Readiness - Sẵn Gọi Vốn',
    'roiaas-admin.html': 'ROI Admin - Quản Trị ROI',
    'video-workflow.html': 'Video Workflow - Xử Lý Video',
    'legal.html': 'Pháp Lý - Legal Documents',
    'ecommerce.html': 'Thương Mại Điện Tử - E-commerce',
    'customer-success.html': 'Chăm Sóc Khách Hàng - Customer Success',
    'auth.html': 'Xác Thực - Authentication',
    'pricing.html': 'Báo Giá - Pricing',
    'community.html': 'Cộng Đồng - Community',
    'agents.html': 'Agents - AI Agents',
    'raas-overview.html': 'RaaS Overview - Tổng Quan',
    'lms.html': 'LMS - Learning Management',
    'ai-analysis.html': 'AI Analysis - Phân Tích AI',
    'shifts.html': 'Ca Làm Việc - Shift Management',
    'mvp-launch.html': 'MVP Launch - Ra Mắt Sản Phẩm',
    'proposals.html': 'Đề Xuất - Proposals',
    'events.html': 'Sự Kiện - Events',
    'api-builder.html': 'API Builder - Xây Dựng API',
    'retention.html': 'Giữ Chân - Customer Retention',
    'binh-phap.html': 'Binh Pháp - Strategy Guide',
    'content-calendar.html': 'Nội Dung - Content Calendar',
    'docs.html': 'Tài Liệu - Documentation',
    'loyalty.html': 'Trung Thành - Loyalty Program',
    'deploy.html': 'Deploy - Triển Khai',
    'hr-hiring.html': 'Tuyển Dụng - HR & Hiring',
    'finance.html': 'Tài Chính - Finance',
    'notifications.html': 'Thông Báo - Notifications',
    'referrals.html': 'Giới Thiệu - Referral Program',
    'commissions.html': 'Hoa Hồng - Commissions',
    'links.html': 'Link Quản Trị - Admin Links',
    'dashboard.html': 'Dashboard - Affiliate Dashboard',
    'media.html': 'Thư Viện - Media Library',
    'login.html': 'Đăng Nhập - Login',
    'register.html': 'Đăng Ký - Register',
    'forgot-password.html': 'Quên Mật Khẩu - Forgot Password',
    'verify-email.html': 'Xác Nhận Email - Verify Email'
};

function getPageTitle(filePath) {
    const fileName = path.basename(filePath);
    const dirName = path.dirname(filePath);

    // Priority: specific page title
    let title = PAGE_TITLES[fileName];

    if (!title) {
        // Fallback: use directory + filename
        const cleanName = fileName.replace('.html', '').replace(/-/g, ' ');
        const section = dirName.split('/').pop();
        title = `${capitalize(cleanName)} - ${capitalize(section)}`;
    }

    return `${title} | ${SITE_CONFIG.defaultTitle.split(' - ')[1]}`;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getPageDescription(filePath) {
    const fileName = path.basename(filePath);
    const title = getPageTitle(filePath);
    return `${title} - Sa Đéc Marketing Hub. ${SITE_CONFIG.defaultDescription}`;
}

function getCanonicalUrl(filePath, relPath) {
    const dirName = path.dirname(relPath);
    const fileName = path.basename(relPath);

    if (dirName === '.' || dirName === '') {
        return `${SITE_CONFIG.baseUrl}/${fileName}`;
    }

    return `${SITE_CONFIG.baseUrl}/${dirName}/${fileName}`;
}

function addSeoMetadata(content, filePath, relPath) {
    const title = getPageTitle(filePath);
    const description = getPageDescription(filePath);
    const canonicalUrl = getCanonicalUrl(filePath, relPath);

    // Check if already has SEO tags
    const hasTitle = /<title>.*<\/title>/i.test(content);
    const hasDescription = /<meta name="description"/i.test(content);
    const hasOgTags = /<meta property="og:/i.test(content);
    const hasTwitterTags = /<meta name="twitter:/i.test(content);
    const hasCanonical = /<link rel="canonical"/i.test(content);
    const hasCharset = /<meta charset/i.test(content);
    const hasViewport = /<meta name="viewport"/i.test(content);
    const hasLang = /<html[^>]*lang=/i.test(content);

    let modified = content;
    const changes = [];

    // Add charset if missing (after <head>)
    if (!hasCharset) {
        modified = modified.replace(/<head>/i, '<head>\n  <meta charset="UTF-8">');
        changes.push('Added charset');
    }

    // Add viewport if missing
    if (!hasViewport) {
        modified = modified.replace(/<head>/i, '<head>\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">');
        changes.push('Added viewport');
    }

    // Add/update title
    if (!hasTitle) {
        const titleTag = `  <title>${title}</title>\n`;
        // Insert after charset or at start of head
        if (hasCharset) {
            modified = modified.replace(/(<meta charset="UTF-8">)/i, `$1\n${titleTag}`);
        } else {
            modified = modified.replace(/<head>/i, `<head>\n${titleTag}`);
        }
        changes.push('Added title');
    }

    // Add description if missing
    if (!hasDescription) {
        const descTag = `  <meta name="description" content="${escapeHtml(description)}">\n`;
        modified = modified.replace(/(<title>.*<\/title>)/i, `$1\n${descTag}`);
        changes.push('Added description');
    }

    // Build SEO block
    let seoBlock = '';

    if (!hasOgTags) {
        seoBlock += `
  <!-- Open Graph -->
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(getPageDescription(filePath))}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:image" content="${SITE_CONFIG.defaultImage}">
  <meta property="og:site_name" content="Sa Đéc Marketing Hub">
  <meta property="og:locale" content="vi_VN">
`;
        changes.push('Added Open Graph tags');
    }

    if (!hasTwitterTags) {
        seoBlock += `
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(getPageDescription(filePath))}">
  <meta name="twitter:image" content="${SITE_CONFIG.defaultImage}">
  <meta name="twitter:creator" content="${SITE_CONFIG.twitterHandle}">
`;
        changes.push('Added Twitter Card tags');
    }

    if (!hasCanonical) {
        seoBlock += `
  <!-- Canonical URL -->
  <link rel="canonical" href="${canonicalUrl}">
`;
        changes.push('Added canonical URL');
    }

    if (seoBlock) {
        // Insert before </head>
        modified = modified.replace(/<\/head>/i, `${seoBlock}</head>`);
    }

    // Add JSON-LD structured data if missing
    const hasJsonLd = /<script type="application\/ld\+json"/i.test(content);
    if (!hasJsonLd) {
        const jsonLd = `
  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "${escapeHtml(title)}",
    "description": "${escapeHtml(getPageDescription(filePath))}",
    "url": "${canonicalUrl}",
    "image": "${SITE_CONFIG.defaultImage}",
    "publisher": {
      "@type": "Organization",
      "name": "Sa Đéc Marketing Hub",
      "url": "${SITE_CONFIG.baseUrl}",
      "logo": {
        "@type": "ImageObject",
        "url": "${SITE_CONFIG.defaultImage}"
      }
    },
    "inLanguage": "vi-VN"
  }
  </script>
`;
        // Insert before </head>
        modified = modified.replace(/<\/head>/i, `${jsonLd}</head>`);
        changes.push('Added JSON-LD structured data');
    }

    // Add accessibility features
    let hasMain = /<main[^>]*id=["']main["']/i.test(content);
    let hasSkipLink = /<a[^>]*href=["']#main["']/i.test(content);

    if (!hasSkipLink || !hasMain) {
        // Add skip link after <body>
        if (!hasSkipLink) {
            modified = modified.replace(/<body>/i, '<body>\n  <a href="#main" class="skip-link" style="position:absolute;left:-9999px;">Skip to main content</a>');
            changes.push('Added skip link');
        }

        // Wrap existing content in main if no main tag
        if (!hasMain) {
            // Look for main content container
            const mainPatterns = [
                /(<div class="main-content"[^>]*>)/i,
                /(<main[^>]*>)/i,
                /(<div id="app"[^>]*>)/i,
                /(<div class="container"[^>]*>)/i
            ];

            let found = false;
            for (const pattern of mainPatterns) {
                if (pattern.test(modified)) {
                    modified = modified.replace(pattern, '$1\n  <main id="main" role="main" class="sr-main">');
                    // Add closing </main> before </body> or </div>
                    modified = modified.replace(/(<\/div>\s*<\/body>)/i, `  </main>\n$1`);
                    changes.push('Added main landmark');
                    found = true;
                    break;
                }
            }

            if (!found) {
                // Add main wrapper as fallback
                modified = modified.replace(/(<body[^>]*>)/i, '$1\n<main id="main" role="main">');
                modified = modified.replace(/(<\/body>)/i, '</main>\n$1');
                changes.push('Added main landmark (wrapper)');
            }
        }
    }

    // Add html lang if missing
    if (!hasLang) {
        modified = modified.replace(/<html/i, '<html lang="vi"');
        changes.push('Added html lang attribute');
    }

    return { modified, changes };
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#39;');
}

function getAllHtmlFiles(dir, files = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
                getAllHtmlFiles(fullPath, files);
            }
        } else if (entry.isFile() && entry.name.endsWith('.html')) {
            const relPath = path.relative(rootDir, fullPath);
            if (!relPath.includes('node_modules')) {
                files.push({ path: fullPath, relPath });
            }
        }
    }

    return files;
}

// Main execution
const htmlFiles = getAllHtmlFiles(rootDir);
let modifiedCount = 0;
let errorCount = 0;
const modifiedFiles = [];

for (const { path: filePath, relPath } of htmlFiles) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const { modified, changes } = addSeoMetadata(content, filePath, relPath);

        if (changes.length > 0) {
            fs.writeFileSync(filePath, modified, 'utf8');
            modifiedCount++;
            modifiedFiles.push({ relPath, changes });
            }
    } catch (error) {
        errorCount++;
        console.error(`❌ ${relPath}: ${error.message}`);
    }
}

// Save report
const reportDir = path.join(rootDir, 'reports', 'seo');
fs.mkdirSync(reportDir, { recursive: true });

const report = `# SEO Auto-Fix Report

**Date:** ${new Date().toISOString().split('T')[0]}
**Files Modified:** ${modifiedCount}
**Errors:** ${errorCount}

## Modified Files

${modifiedFiles.map(f => `### ${f.relPath}\n\nChanges:\n${f.changes.map(c => `- ${c}`).join('\n')}\n`).join('\n')}
`;

const reportPath = path.join(reportDir, `seo-auto-fix-${new Date().toISOString().split('T')[0]}.md`);
fs.writeFileSync(reportPath, report);

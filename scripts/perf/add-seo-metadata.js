#!/usr/bin/env node
/**
 * Sa Đéc Marketing Hub - SEO Metadata Injector
 * Adds missing meta tags, title, description, og tags to HTML files
 *
 * Usage: node scripts/perf/add-seo-metadata.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '../..');
const ADMIN_DIR = path.join(ROOT_DIR, 'admin');

// SEO metadata mapping
const seoMetadata = {
  'dashboard.html': {
    title: 'Dashboard - Sadec Marketing Hub',
    description: 'Tổng quan hoạt động marketing - KPIs, charts, và alerts widget',
    keywords: 'dashboard, kpi, marketing, analytics, sadec hub'
  },
  'pipeline.html': {
    title: 'Quản lý Dự án - Sadec Marketing Hub',
    description: 'Theo dõi và quản lý dự án marketing từ đầu đến cuối',
    keywords: 'pipeline, project management, marketing projects'
  },
  'campaigns.html': {
    title: 'Chiến dịch Marketing - Sadec Hub',
    description: 'Tạo và quản lý chiến dịch marketing đa kênh',
    keywords: 'campaigns, marketing, multi-channel, advertising'
  },
  'leads.html': {
    title: 'Khách hàng Tiềm năng - Sadec Hub',
    description: 'Quản lý leads và theo dõi chuyển đổi',
    keywords: 'leads, CRM, conversion, sales funnel'
  },
  'ai-analysis.html': {
    title: 'Phân tích AI - Sadec Marketing Hub',
    description: 'Phân tích dữ liệu và insights từ AI',
    keywords: 'AI analysis, machine learning, insights, data analytics'
  },
  'content-calendar.html': {
    title: 'Lịch nội dung - Sadec Hub',
    description: 'Lên kế hoạch và lịch đăng nội dung',
    keywords: 'content calendar, content planning, scheduling'
  },
  'finance.html': {
    title: 'Tài chính - Sadec Marketing Hub',
    description: 'Quản lý tài chính và báo cáo doanh thu',
    keywords: 'finance, revenue, accounting, financial reports'
  },
  'agents.html': {
    title: 'AI Agents - Sadec Hub',
    description: 'Quản lý và cấu hình AI agents',
    keywords: 'AI agents, automation, artificial intelligence'
  },
  'workflows.html': {
    title: 'Quy trình - Sadec Hub',
    description: 'Tự động hóa quy trình làm việc',
    keywords: 'workflows, automation, business process'
  },
  'settings.html': {
    title: 'Cài đặt - Sadec Marketing Hub',
    description: 'Cấu hình hệ thống và tùy chọn',
    keywords: 'settings, configuration, system settings'
  },
  'proposals.html': {
    title: 'Báo giá - Sadec Hub',
    description: 'Tạo và quản lý báo giá khách hàng',
    keywords: 'proposals, quotes, pricing, customer quotes'
  },
  'payments.html': {
    title: 'Thanh toán - Sadec Hub',
    description: 'Quản lý thanh toán và giao dịch',
    keywords: 'payments, transactions, billing'
  },
  'inventory.html': {
    title: 'Kho hàng - Sadec Hub',
    description: 'Quản lý kho và tồn kho',
    keywords: 'inventory, stock management, warehouse'
  },
  'loyalty.html': {
    title: 'Khách hàng thân thiết - Sadec Hub',
    description: 'Chương trình loyalty và rewards',
    keywords: 'loyalty, rewards, customer retention'
  },
  'pos.html': {
    title: 'POS - Sadec Hub',
    description: 'Hệ thống điểm bán hàng',
    keywords: 'POS, point of sale, sales terminal'
  },
  'hr-hiring.html': {
    title: 'Tuyển dụng - Sadec Hub',
    description: 'Quản lý tuyển dụng và nhân sự',
    keywords: 'HR, hiring, recruitment, human resources'
  },
  'suppliers.html': {
    title: 'Nhà cung cấp - Sadec Hub',
    description: 'Quản lý nhà cung cấp',
    keywords: 'suppliers, vendors, procurement'
  },
  'pricing.html': {
    title: 'Báo giá - Sadec Hub',
    description: 'Bảng giá và gói dịch vụ',
    keywords: 'pricing, packages, plans'
  },
  'notifications.html': {
    title: 'Thông báo - Sadec Hub',
    description: 'Trung tâm thông báo',
    keywords: 'notifications, alerts, messages'
  },
  'onboarding.html': {
    title: 'Onboarding - Sadec Hub',
    description: 'Hướng dẫn người dùng mới',
    keywords: 'onboarding, training, user guide'
  },
  'video-workflow.html': {
    title: 'Video Workflow - Sadec Hub',
    description: 'Quy trình tạo và phân phối video',
    keywords: 'video workflow, content creation, video distribution'
  },
  'auth.html': {
    title: 'Xác thực - Sadec Hub',
    description: 'Đăng nhập và bảo mật',
    keywords: 'auth, login, security, authentication'
  },
  'index.html': {
    title: 'Admin - Sadec Marketing Hub',
    description: 'Trang quản trị chính',
    keywords: 'admin, dashboard, marketing hub'
  }
};

/**
 * Get all HTML files
 */
function getHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory() && file !== 'node_modules' && file !== 'dist') {
      getHtmlFiles(filePath, fileList);
    } else if (file.endsWith('.html')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

/**
 * Generate SEO meta tags
 */
function generateMetaTags(metadata, filename) {
  const title = metadata.title || `Sadec Marketing Hub - ${filename}`;
  const description = metadata.description || 'Sa Đéc Marketing Hub - Digital Marketing Platform';
  const keywords = metadata.keywords || 'marketing, agency, sadec hub';

  // Extract base name for og:title suffix
  const siteName = 'Sadec Marketing Hub';
  const ogImage = '/assets/images/og-image.png';

  return `
  <!-- SEO Meta Tags -->
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta name="keywords" content="${keywords}">
  <meta name="author" content="${siteName}">
  <meta name="robots" content="index, follow">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://sadec-marketing-hub.com/admin/${filename}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:site_name" content="${siteName}">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${ogImage}">

  <!-- Favicon -->
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
`;
}

/**
 * Add SEO metadata to HTML file
 */
function addSeoMetadata(filePath, metadata) {
  let content = fs.readFileSync(filePath, 'utf8');
  const filename = path.basename(filePath);
  const relativePath = path.relative(ROOT_DIR, filePath);

  // Check if already has title
  const hasTitle = /<title[^>]*>[^<]+<\/title>/i.test(content);
  const hasDescription = /<meta[^>]*name=["']description["'][^>]*>/i.test(content);
  const hasOgTitle = /<meta[^>]*property=["']og:title["'][^>]*>/i.test(content);

  if (hasTitle && hasDescription && hasOgTitle) {
    return false;
  }

  // Generate meta tags
  const metaTags = generateMetaTags(metadata, filename);

  // Find </head> and insert before it
  const headCloseIndex = content.indexOf('</head>');
  if (headCloseIndex === -1) {
    // No </head> tag, try to add after DOCTYPE or html
    const doctypeIndex = content.toLowerCase().indexOf('<!doctype');
    const htmlIndex = content.toLowerCase().indexOf('<html');
    const insertIndex = doctypeIndex !== -1 ? doctypeIndex : (htmlIndex !== -1 ? htmlIndex : 0);

    if (insertIndex === 0) {
      content = `<head>\n${metaTags}\n</head>\n${content}`;
    } else {
      const firstTagEnd = content.indexOf('>', insertIndex);
      content = content.substring(0, firstTagEnd + 1) + `\n<head>\n${metaTags}\n</head>` + content.substring(firstTagEnd + 1);
    }
  } else {
    // Check if we need to replace existing title
    if (hasTitle) {
      const titleMatch = content.match(/<title[^>]*>[^<]+<\/title>/i);
      if (titleMatch) {
        const oldTitle = titleMatch[0];
        const newTitle = `<title>${metadata.title || `Sadec Marketing Hub - ${filename}`}</title>`;
        content = content.replace(oldTitle, newTitle);
      }
    }

    // Add meta tags before </head>
    const beforeHead = content.substring(0, headCloseIndex);
    const afterHead = content.substring(headCloseIndex);
    content = beforeHead + metaTags + '\n' + afterHead;
  }

  fs.writeFileSync(filePath, content, 'utf8');
  return true;
}

/**
 * Main function
 */
function addSeoMetadataAll() {
  const htmlFiles = getHtmlFiles(ADMIN_DIR);
  let updated = 0;
  let skipped = 0;

  for (const file of htmlFiles) {
    const filename = path.basename(file);
    const metadata = seoMetadata[filename];

    if (metadata) {
      if (addSeoMetadata(file, metadata)) {
        updated++;
      } else {
        skipped++;
      }
    } else {
      // Generic metadata for files not in mapping
      const genericMetadata = {
        title: `Sadec Marketing Hub - ${filename.replace('.html', '')}`,
        description: `Sa Đéc Marketing Hub - ${filename.replace('.html', '')}`,
        keywords: 'marketing, agency, sadec hub'
      };
      if (addSeoMetadata(file, genericMetadata)) {
        updated++;
      } else {
        skipped++;
      }
    }
  }

  `);
  }

// Run
addSeoMetadataAll();

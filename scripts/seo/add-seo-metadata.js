#!/usr/bin/env node
/**
 * Add SEO Metadata to all HTML files
 * - Title tags
 * - Meta description
 * - Open Graph tags
 * - Twitter Card tags
 * - Canonical URL
 * - JSON-LD Schema
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.join(__dirname, '../..');
const BASE_URL = 'https://sadecmarketinghub.com';

// Page descriptions
const pageDescriptions = {
    'dashboard': 'Bảng điều khiển quản trị tổng quan - Theo dõi chiến dịch, quản lý khách hàng và phân tích hiệu quả marketing.',
    'campaigns': 'Quản lý chiến dịch marketing - Tạo, theo dõi và tối ưu hóa các chiến dịch quảng cáo đa kênh.',
    'leads': 'Quản lý khách hàng tiềm năng - Theo dõi và chăm sóc leads từ nhiều nguồn khác nhau.',
    'analytics': 'Phân tích hiệu suất marketing - Báo cáo chi tiết ROI, conversion rate và các chỉ số quan trọng.',
    'finance': 'Quản lý tài chính và ngân sách - Theo dõi chi tiêu, hóa đơn và dòng tiền marketing.',
    'approvals': 'Duyệt yêu cầu và quy trình - Quản lý workflow phê duyệt nội dung và ngân sách.',
    'workflows': 'Tự động hóa quy trình - Thiết lập và quản lý các workflow marketing tự động.',
    'agents': 'Quản lý AI Agents - Cấu hình và giám sát các agent AI hỗ trợ marketing.',
    'reports': 'Báo cáo và phân tích - Xem và xuất các báo cáo hiệu suất marketing.',
    'settings': 'Cài đặt hệ thống - Cấu hình tài khoản và tùy chỉnh nền tảng.'
};

function getPageName(file) {
    return file.replace('.html', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function generateSEOTags(pageName, description, dirPrefix) {
    const slug = pageName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return `
  <!-- SEO Meta Tags -->
  <title>${dirPrefix} - ${pageName} | Sa Đéc Marketing Hub</title>
  <meta name="description" content="${description}">
  <meta name="keywords" content="marketing, analytics, dashboard, Sa Đéc, Đồng Tháp">
  <meta name="robots" content="index, follow">
  <meta name="author" content="Sa Đéc Marketing Hub">
  <link rel="canonical" href="${BASE_URL}/${slug}.html">

  <!-- Open Graph Meta Tags -->
  <meta property="og:title" content="${dirPrefix} - ${pageName} | Sa Đéc Marketing Hub">
  <meta property="og:description" content="${description}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${BASE_URL}/${slug}.html">
  <meta property="og:image" content="${BASE_URL}/favicon.png">
  <meta property="og:site_name" content="Sa Đéc Marketing Hub">
  <meta property="og:locale" content="vi_VN">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${dirPrefix} - ${pageName} | Sa Đéc Marketing Hub">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${BASE_URL}/favicon.png">

  <!-- Schema.org JSON-LD -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "${dirPrefix} - ${pageName} | Sa Đéc Marketing Hub",
    "description": "${description}",
    "url": "${BASE_URL}/${slug}.html",
    "image": "${BASE_URL}/favicon.png",
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

// Directories to scan
const dirs = [
    { path: '', prefix: 'Home' },
    { path: 'admin/', prefix: 'Admin' },
    { path: 'portal/', prefix: 'Portal' },
    { path: 'affiliate/', prefix: 'Affiliate' },
    { path: 'auth/', prefix: 'Auth' }
];

let filesModified = 0;
let filesSkipped = 0;

dirs.forEach(({ path: dir, prefix }) => {
    const fullPath = path.join(ROOT_DIR, dir);
    if (!fs.existsSync(fullPath)) return;

    const files = fs.readdirSync(fullPath)
        .filter(f => f.endsWith('.html') && !f.endsWith('.min.html'));

    files.forEach(file => {
        const filePath = path.join(fullPath, file);
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // Skip if already has Open Graph tags
        if (content.includes('<meta property="og:title"')) {
            filesSkipped++;
            return;
        }

        const pageName = getPageName(file);
        const descKey = file.replace('.html', '');
        const description = pageDescriptions[descKey] || `Trang ${pageName.toLowerCase()} của Sa Đéc Marketing Hub`;

        const headCloseIndex = content.indexOf('</head>');
        if (headCloseIndex === -1) return;

        const seoTags = generateSEOTags(pageName, description, prefix);
        content = content.substring(0, headCloseIndex) + seoTags + '\n  ' + content.substring(headCloseIndex);

        fs.writeFileSync(filePath, content, 'utf8');
        filesModified++;
        });
});

`);

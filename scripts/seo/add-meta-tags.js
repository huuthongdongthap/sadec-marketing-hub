/**
 * SEO Metadata Auto-Fix Script
 * Them OG tags, Twitter Card, Schema.org JSON-LD vao HTML pages
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');

// SEO template generator
function generateSEOTemplate(pageTitle, pageDescription, pageUrl, pageType = 'website') {
  return `
  <!-- SEO Meta Tags -->
  <title>${pageTitle}</title>
  <meta name="description" content="${pageDescription}">
  <meta name="keywords" content="Sa Đéc, marketing, digital marketing, Đồng Tháp, Mekong">
  <meta name="robots" content="index, follow">
  <meta name="author" content="Sa Đéc Marketing Hub">
  <meta name="theme-color" content="#006A60">

  <!-- Canonical URL -->
  <link rel="canonical" href="https://sadecmarketinghub.com${pageUrl}">

  <!-- Open Graph Meta Tags -->
  <meta property="og:title" content="${pageTitle}">
  <meta property="og:description" content="${pageDescription}">
  <meta property="og:type" content="${pageType}">
  <meta property="og:url" content="https://sadecmarketinghub.com${pageUrl}">
  <meta property="og:image" content="https://sadecmarketinghub.com/og-image.png">
  <meta property="og:site_name" content="Sa Đéc Marketing Hub">
  <meta property="og:locale" content="vi_VN">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${pageTitle}">
  <meta name="twitter:description" content="${pageDescription}">
  <meta name="twitter:image" content="https://sadecmarketinghub.com/og-image.png">
  <meta name="twitter:creator" content="@sadecmarketinghub">

  <!-- Schema.org JSON-LD -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "${pageType === 'article' ? 'Article' : 'WebPage'}",
    "name": "${pageTitle}",
    "description": "${pageDescription}",
    "url": "https://sadecmarketinghub.com${pageUrl}",
    "image": "https://sadecmarketinghub.com/og-image.png",
    "publisher": {
      "@type": "Organization",
      "name": "Sa Đéc Marketing Hub",
      "url": "https://sadecmarketinghub.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://sadecmarketinghub.com/favicon.png"
      }
    },
    "inLanguage": "vi-VN"
  }
  </script>
`;
}

// Scan and fix HTML files
function scanAndFix() {
  const htmlFiles = [];
  
  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules' && file !== 'dist') {
        walkDir(filePath);
      } else if (file.endsWith('.html') && !file.includes('widgets/')) {
        htmlFiles.push(filePath);
      }
    }
  }
  
  walkDir(ROOT_DIR);
  
  let fixed = 0;
  let skipped = 0;
  
  for (const filePath of htmlFiles) {
    const relativePath = path.relative(ROOT_DIR, filePath);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if already has og:title
    if (content.includes('<meta property="og:title"')) {
      skipped++;
      continue;
    }
    
    // Extract or generate page info
    const pageTitle = extractTitle(content) || generateTitleFromPath(relativePath);
    const pageDescription = `Sa Đéc Marketing Hub - ${pageTitle}`;
    const pageUrl = '/' + relativePath.replace(/\\/g, '/');
    
    // Find </head> and insert SEO tags
    const headCloseIndex = content.indexOf('</head>');
    if (headCloseIndex === -1) {
      continue;
    }
    
    const seoTags = generateSEOTemplate(pageTitle, pageDescription, pageUrl);
    const newContent = content.slice(0, headCloseIndex) + seoTags + '\n' + content.slice(headCloseIndex);
    
    fs.writeFileSync(filePath, newContent, 'utf8');
    fixed++;
  }
  
  : ${skipped}`);
  }

function extractTitle(content) {
  const titleMatch = content.match(/<title>([^<]+)<\/title>/);
  return titleMatch ? titleMatch[1].trim() : null;
}

function generateTitleFromPath(filePath) {
  const basename = path.basename(filePath, '.html');
  const dirname = path.dirname(filePath);
  
  const nameMap = {
    'index': 'Trang Chủ',
    'dashboard': 'Bảng Điều Khiển',
    'login': 'Đăng Nhập',
    'register': 'Đăng Ký',
    'forgot-password': 'Quên Mật Khẩu',
    'verify-email': 'Xác Thực Email',
    'projects': 'Dự Án',
    'missions': 'Nhiệm Vụ',
    'reports': 'Báo Cáo',
    'payments': 'Thanh Toán',
    'invoices': 'Hóa Đơn',
    'subscriptions': 'Gói Dịch Vụ',
    'onboarding': 'Hướng Dẫn',
    'roiaas-onboarding': 'ROI As a Service',
    'roi-analytics': 'Phân Tích ROI',
    'roi-report': 'Báo Cáo ROI',
    'subscription-plans': 'Gói Đăng Ký',
    'credits': 'Tín Dụng',
    'assets': 'Tài Sản',
    'notifications': 'Thông Báo',
    'approve': 'Duyệt',
    'payment-result': 'Kết Quả Thanh Toán',
    'ocop-catalog': 'OCO Catalog',
    'ocop-exporter': 'OCO Exporter'
  };
  
  const pageName = nameMap[basename] || basename.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const dirName = dirname.split('/').pop();
  
  if (dirName === 'admin') return `${pageName} - Quản Trị`;
  if (dirName === 'portal') return `${pageName} - Khách Hàng`;
  if (dirName === 'auth') return `${pageName} - Xác Thực`;
  
  return pageName;
}

// Run
scanAndFix();

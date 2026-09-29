#!/usr/bin/env node
/**
 * SEO Metadata Auto-Fix Script (Direct)
 * Them SEO metadata cho tat ca HTML pages trong project directory
 *
 * Usage: cd /Users/mac/mekong-cli/apps/sadec-marketing-hub && node scripts/seo/add-seo-metadata-direct.js
 */

const fs = require('fs');
const path = require('path');

// FIXED: Use absolute project directory
const PROJECT_DIR = '/Users/mac/mekong-cli/apps/sadec-marketing-hub';

// SEO Data for root level pages
const ROOT_PAGES_SEO = {
  'forgot-password.html': {
    title: 'Quên Mật Khẩu - Khôi Phục Tài Khoản | Mekong Agency',
    description: 'Khôi phục mật khẩu tài khoản Mekong Agency. Lấy lại mật khẩu qua email nhanh chóng.',
    keywords: 'quên mật khẩu, khôi phục tài khoản, reset password, email'
  },
  'offline.html': {
    title: 'Offline - Không Có Kết Nối | Mekong Agency',
    description: 'Không có kết nối internet. Vui lòng kiểm tra kết nối và thử lại.',
    keywords: 'offline, không có kết nối, network error',
    robots: 'noindex, nofollow'
  }
};

// Base URL config
const BASE_URL = 'https://sadecmarketinghub.com';
const DEFAULT_IMAGE = `${BASE_URL}/favicon.png`;

// Generate SEO meta tags HTML
function generateSEOTags(pageData, pagePath) {
  const url = pagePath.startsWith('http') ? pagePath : `${BASE_URL}/${pagePath}`;

  return `
  <!-- SEO Meta Tags -->
  <title>${pageData.title}</title>
  <meta name="description" content="${pageData.description}">
  <meta name="keywords" content="${pageData.keywords || ''}">
  <meta name="robots" content="${pageData.robots || 'index, follow'}">
  <meta name="author" content="Sa Đéc Marketing Hub">

  <!-- Canonical URL -->
  <link rel="canonical" href="${url}">

  <!-- Open Graph Meta Tags -->
  <meta property="og:title" content="${pageData.title}">
  <meta property="og:description" content="${pageData.description}">
  <meta property="og:type" content="${pageData.type || 'website'}">
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
    "@type": "WebPage",
    "name": "${pageData.title}",
    "description": "${pageData.description}",
    "url": "${url}",
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
function processFile(filePath, pageData, pagePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Find <head> tag or beginning after DOCTYPE
    let insertIndex = -1;

    // Try to find <head> tag first
    const headMatch = content.match(/<head[^>]*>/i);
    if (headMatch) {
      insertIndex = headMatch.index + headMatch[0].length;
    } else {
      // Look for DOCTYPE and insert after
      const doctypeMatch = content.match(/<!DOCTYPE html>/i);
      if (doctypeMatch) {
        insertIndex = doctypeMatch.index + doctypeMatch[0].length;
      } else {
        // Insert at beginning
        insertIndex = 0;
      }
    }

    // Remove existing SEO tags (if any) to avoid duplicates
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
    const seoTags = generateSEOTags(pageData, pagePath);

    // Insert at the right position
    const newContent = content.substring(0, insertIndex) + '\n' + seoTags + '\n' + content.substring(insertIndex);

    // Write back
    fs.writeFileSync(filePath, newContent, 'utf8');
    return true;
  } catch (error) {
    return false;
  }
}

// Main function for root pages
function processRootPages() {
  );

  let totalFiles = 0;
  let successCount = 0;

  for (const [fileName, pageData] of Object.entries(ROOT_PAGES_SEO)) {
    const filePath = path.join(PROJECT_DIR, fileName);

    if (!fs.existsSync(filePath)) {
      continue;
    }

    totalFiles++;
    if (processFile(filePath, pageData, fileName)) {
      successCount++;
    }
  }

  );
  }

// Run
processRootPages();

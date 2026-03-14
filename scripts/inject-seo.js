#!/usr/bin/env node

/**
 * SEO Metadata Injector Script
 * Automatically injects SEO metadata into HTML files
 *
 * Usage: node scripts/inject-seo.js
 */

const fs = require('fs')
const path = require('path')

const ROOT_DIR = path.join(__dirname, '..')

// SEO metadata for each page
const seoData = {
  // Portal pages
  'portal/dashboard.html': {
    title: 'Dashboard - Khách Hàng | SaĐéc Marketing Hub',
    description: 'Bảng điều khiển khách hàng - Theo dõi chiến dịch, hiệu quả và báo cáo marketing',
    keywords: 'dashboard, khách hàng, chiến dịch, báo cáo, marketing',
    robots: 'noindex, follow',
    url: 'https://sadecmarketinghub.com/portal/dashboard.html'
  },
  'portal/projects.html': {
    title: 'Dự Án - Client Portal | SaĐéc Marketing Hub',
    description: 'Theo dõi tiến độ và trạng thái các dự án marketing của bạn',
    keywords: 'dự án, projects, tiến độ, marketing projects',
    robots: 'noindex, follow',
    url: 'https://sadecmarketinghub.com/portal/projects.html'
  },
  'portal/payments.html': {
    title: 'Thanh Toán - Payments | SaĐéc Marketing Hub',
    description: 'Quản lý hóa đơn và thanh toán dịch vụ',
    keywords: 'thanh toán, payments, hóa đơn, invoices',
    robots: 'noindex, follow',
    url: 'https://sadecmarketinghub.com/portal/payments.html'
  },
  'portal/reports.html': {
    title: 'Báo Cáo - Reports | SaĐéc Marketing Hub',
    description: 'Báo cáo chi tiết về hiệu suất chiến dịch và ROI',
    keywords: 'báo cáo, reports, ROI, performance, analytics',
    robots: 'noindex, follow',
    url: 'https://sadecmarketinghub.com/portal/reports.html'
  },
  'portal/assets.html': {
    title: 'Tài Sản - Assets | SaĐéc Marketing Hub',
    description: 'Quản lý tài sản số và creative assets',
    keywords: 'tài sản, assets, creative, marketing materials',
    robots: 'noindex, follow',
    url: 'https://sadecmarketinghub.com/portal/assets.html'
  },

  // Affiliate pages
  'affiliate/dashboard.html': {
    title: 'Affiliate Dashboard - SaĐéc Marketing Hub',
    description: 'Bảng điều khiển affiliate - Theo dõi hoa hồng và referrals',
    keywords: 'affiliate dashboard, thống kê, doanh thu, hoa hồng',
    robots: 'noindex, follow',
    url: 'https://sadecmarketinghub.com/affiliate/dashboard.html'
  },
  'affiliate/links.html': {
    title: 'Affiliate Links - Liên Kết Giới Thiệu | SaĐéc Marketing Hub',
    description: 'Quản lý và theo dõi hiệu suất các link affiliate',
    keywords: 'affiliate links, liên kết, tracking, performance',
    robots: 'noindex, follow',
    url: 'https://sadecmarketinghub.com/affiliate/links.html'
  },
  'affiliate/commissions.html': {
    title: 'Hoa Hồng - Commissions | SaĐéc Marketing Hub',
    description: 'Theo dõi hoa hồng và lịch sử thanh toán affiliate',
    keywords: 'hoa hồng, commissions, thanh toán, payments',
    robots: 'noindex, follow',
    url: 'https://sadecmarketinghub.com/affiliate/commissions.html'
  },
  'affiliate/referrals.html': {
    title: 'Referrals - Khách Giới Thiệu | SaĐéc Marketing Hub',
    description: 'Quản lý danh sách khách hàng được giới thiệu',
    keywords: 'referrals, khách giới thiệu, conversions',
    robots: 'noindex, follow',
    url: 'https://sadecmarketinghub.com/affiliate/referrals.html'
  },
  'affiliate/profile.html': {
    title: 'Profile - Hồ Sơ Affiliate | SaĐéc Marketing Hub',
    description: 'Quản lý hồ sơ và cài đặt tài khoản affiliate',
    keywords: 'profile, hồ sơ, settings, affiliate settings',
    robots: 'noindex, follow',
    url: 'https://sadecmarketinghub.com/affiliate/profile.html'
  },

  // Auth pages
  'auth/login.html': {
    title: 'Đăng Nhập - SaĐéc Marketing Hub',
    description: 'Đăng nhập vào hệ thống SaĐéc Marketing Hub - Quản trị marketing, leads, campaigns và analytics',
    keywords: 'login, đăng nhập, marketing hub, sa đéc, agency',
    robots: 'noindex, follow',
    url: 'https://sadecmarketinghub.com/auth/login.html'
  }
}

function generateSEOTags(data) {
  return `  <!-- SEO Meta Tags -->
  <title>${data.title}</title>
  <meta name="description" content="${data.description}">
  <meta name="keywords" content="${data.keywords}">
  <meta name="robots" content="${data.robots}">
  <meta name="author" content="SaĐéc Marketing Hub">
  <link rel="canonical" href="${data.url}">

  <!-- Open Graph Meta Tags -->
  <meta property="og:title" content="${data.title}">
  <meta property="og:description" content="${data.description}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${data.url}">
  <meta property="og:image" content="https://sadecmarketinghub.com/og-image.png">
  <meta property="og:site_name" content="SaĐéc Marketing Hub">
  <meta property="og:locale" content="vi_VN">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${data.title}">
  <meta name="twitter:description" content="${data.description}">
  <meta name="twitter:image" content="https://sadecmarketinghub.com/og-image.png">
  <meta name="twitter:creator" content="@sadecmarketinghub">

  <!-- Schema.org JSON-LD -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "MarketingAgency",
    "name": "SaĐéc Marketing Hub",
    "description": "${data.description}",
    "url": "${data.url}",
    "logo": {
      "@type": "ImageObject",
      "url": "https://sadecmarketinghub.com/favicon.png",
      "width": 512,
      "height": 512
    },
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
`
}

function removeDuplicateSEO(content) {
  // Remove duplicate SEO meta tags
  const patterns = [
    /<!-- SEO Meta Tags -->[\s\S]*?<\/script>\s*\n/g,
    /<!-- SEO Meta Tags -->[\s\S]*?<!-- Schema\.org/g,
    /<title>[\s\S]*?<\/title>\n\s*<meta name="description"[\s\S]*?<\/script>\n/g,
    /<title>[\s\S]*?<meta name="robots"[\s\S]*?\n/g,
    /<!-- DNS Prefetch \(Deduplicated\)\s*-->\s*\n[\s\S]*?<link rel="dns-prefetch"[\s\S]*?\n/g
  ]

  let cleaned = content
  patterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '')
  })

  // Remove duplicate dns-prefetch
  const lines = cleaned.split('\n')
  const seen = new Set()
  const uniqueLines = lines.filter(line => {
    const trimmed = line.trim()
    if (trimmed.includes('dns-prefetch') || trimmed.includes('preconnect')) {
      if (seen.has(trimmed)) return false
      seen.add(trimmed)
    }
    return true
  })

  return uniqueLines.join('\n')
}

function injectSEO(filePath, seoData) {
  const fullPath = path.join(ROOT_DIR, filePath)

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`)
    return
  }

  let content = fs.readFileSync(fullPath, 'utf8')

  // Remove existing duplicate SEO tags
  content = removeDuplicateSEO(content)

  // Find position after <head> tag
  const headMatch = content.match(/<head[^>]*>/i)
  if (!headMatch) {
    console.log(`⚠️  No <head> tag found in ${filePath}`)
    return
  }

  const insertPosition = headMatch.index + headMatch[0].length
  const seoTags = generateSEOTags(seoData)

  // Insert SEO tags
  const newContent = content.slice(0, insertPosition) + '\n' + seoTags + content.slice(insertPosition)

  fs.writeFileSync(fullPath, newContent, 'utf8')
  console.log(`✅ Updated: ${filePath}`)
}

// Main execution
console.log('🚀 Injecting SEO metadata into HTML files...\n')

Object.entries(seoData).forEach(([filePath, data]) => {
  injectSEO(filePath, data)
})

console.log('\n✨ SEO injection complete!')
console.log('📝 Check SEO_IMPLEMENTATION_GUIDE.md for usage details.')

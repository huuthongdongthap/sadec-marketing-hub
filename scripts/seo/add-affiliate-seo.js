#!/usr/bin/env node
/**
 * Add SEO Metadata - Affiliate & Components
 *
 * Usage: node scripts/seo/add-affiliate-seo.js
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../..');

const SEO_FILES = {
    'affiliate/dashboard.html': {
        title: 'Affiliate Dashboard - Mekong Agency',
        description: 'Bảng điều khiển affiliate - Theo dõi hoa hồng và referrals.'
    },
    'affiliate/profile.html': {
        title: 'Hồ Sơ Affiliate - Mekong Agency',
        description: 'Quản lý hồ sơ affiliate và thông tin thanh toán.'
    },
    'affiliate/media.html': {
        title: 'Media Kit - Mekong Affiliate',
        description: 'Tài nguyên marketing và media kit cho affiliates.'
    },
    'affiliate/commissions.html': {
        title: 'Hoa Hồng - Mekong Affiliate',
        description: 'Theo dõi hoa hồng và thanh toán affiliate.'
    },
    'affiliate/links.html': {
        title: 'Affiliate Links - Mekong Agency',
        description: 'Quản lý links affiliate và tracking.'
    },
    'affiliate/settings.html': {
        title: 'Cài Đặt - Mekong Affiliate',
        description: 'Cài đặt tài khoản affiliate.'
    },
    'affiliate/referrals.html': {
        title: 'Referrals - Mekong Affiliate',
        description: 'Quản lý referrals và khách hàng giới thiệu.'
    },
    'admin/components/phase-tracker.html': {
        title: 'Phase Tracker - Mekong Admin',
        description: 'Theo dõi tiến độ các phase dự án.'
    },
    'login.html': {
        title: 'Đăng Nhập - Mekong Agency',
        description: 'Đăng nhập hệ thống Mekong Agency.'
    }
};

function addSEO(filePath, data) {
    let content = fs.readFileSync(filePath, 'utf8');
    const url = `https://sadecmarketinghub.com/${filePath.replace(ROOT_DIR + '/', '')}`;

    const seoTags = `
  <!-- SEO Meta Tags -->
  <title>${data.title}</title>
  <meta name="description" content="${data.description}">
  <link rel="canonical" href="${url}">
  <meta property="og:title" content="${data.title}">
  <meta property="og:description" content="${data.description}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="https://sadecmarketinghub.com/favicon.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${data.title}">
  <meta name="twitter:description" content="${data.description}">
  <meta name="twitter:image" content="https://sadecmarketinghub.com/favicon.png">
  <script type="application/ld+json">
  {"@context":"https://schema.org","@type":"MarketingAgency","name":"Mekong Agency","description":"${data.description}","url":"${url}","logo":"https://sadecmarketinghub.com/favicon.png","address":{"@type":"PostalAddress","addressLocality":"Sa Đéc","addressRegion":"Đồng Tháp","addressCountry":"VN"},"areaServed":"Mekong Delta","priceRange":"$$"}
  </script>
`;

    // Try to find insert point
    const insertPoints = [
        content.indexOf('</head>'),
        content.indexOf('<link rel="dns-prefetch"'),
        content.indexOf('<link rel="stylesheet"'),
        content.indexOf('<style>'),
        content.indexOf('<title>')
    ].filter(p => p !== -1);

    if (insertPoints.length === 0) {
        // No good insert point, add at beginning
        content = seoTags + '\n' + content;
    } else {
        const insertAt = Math.min(...insertPoints);
        content = content.substring(0, insertAt) + seoTags + '\n' + content.substring(insertAt);
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✓ ${filePath}: Added SEO`);
}

console.log('🚀 Adding SEO for affiliate & components...\n');

Object.entries(SEO_FILES).forEach(([file, data]) => {
    const filePath = path.join(ROOT_DIR, file);
    if (fs.existsSync(filePath)) {
        addSEO(filePath, data);
    } else {
        console.log(`  - ${file}: Not found`);
    }
});

console.log('\n✅ Complete!');

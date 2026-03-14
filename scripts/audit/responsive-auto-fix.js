/**
 * Responsive Auto-Fix Script
 * Tự động thêm responsive CSS links và viewport meta tag vào HTML files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..', '..');

const FILES_TO_FIX = [
    'admin/widgets/global-search.html',
    'admin/widgets/notification-bell.html',
    'admin/widgets/theme-toggle.html'
];

function addResponsiveMetaAndCSS(content, filePath) {
    let modified = content;
    const changes = [];

    // Check if already has viewport
    const hasViewport = /<meta[^>]*viewport[^>]*>/i.test(modified);
    if (!hasViewport) {
        // Add after existing meta tags or in head
        const metaTag = '  <meta name="viewport" content="width=device-width, initial-scale=1">\n';
        if (modified.includes('</head>')) {
            modified = modified.replace('</head>', `  <meta name="viewport" content="width=device-width, initial-scale=1">\n</head>`);
            changes.push('Added viewport meta tag');
        } else if (modified.includes('<meta')) {
            modified = modified.replace(/<meta[^>]*>/i, match => match + '\n' + metaTag);
            changes.push('Added viewport meta tag');
        } else {
            // Add comment at top
            modified = `<!-- Responsive Meta -->\n<meta name="viewport" content="width=device-width, initial-scale=1">\n\n` + modified;
            changes.push('Added viewport meta tag at top');
        }
    }

    // Check if already has responsive CSS
    const hasResponsiveCSS = modified.includes('responsive-enhancements.css') ||
                             modified.includes('responsive-fix-2026.css');
    if (!hasResponsiveCSS) {
        const responsiveLink = '  <link rel="stylesheet" href="/assets/css/responsive-enhancements.css">\n';
        if (modified.includes('</head>')) {
            modified = modified.replace('</head>', responsiveLink + '</head>');
            changes.push('Added responsive-enhancements.css link');
        } else if (modified.includes('<link')) {
            modified = modified.replace(/<link[^>]*>/i, match => responsiveLink + match);
            changes.push('Added responsive-enhancements.css link');
        } else {
            modified += '\n' + responsiveLink;
            changes.push('Added responsive-enhancements.css link at end');
        }
    }

    return { modified, changes };
}

// Main
console.log('🔧 Responsive Auto-Fix - Sa Đéc Marketing Hub\n');

let fixedCount = 0;
for (const file of FILES_TO_FIX) {
    const filePath = path.join(rootDir, file);

    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Skipping ${file} - not found`);
        continue;
    }

    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const { modified, changes } = addResponsiveMetaAndCSS(content, filePath);

        if (changes.length > 0) {
            fs.writeFileSync(filePath, modified, 'utf8');
            console.log(`✅ ${file}:`);
            changes.forEach(change => console.log(`   - ${change}`));
            fixedCount++;
        } else {
            console.log(`⏭️  ${file}: No changes needed`);
        }
    } catch (error) {
        console.error(`❌ ${file}: ${error.message}`);
    }
}

console.log(`\n📊 Fixed ${fixedCount}/${FILES_TO_FIX.length} files`);

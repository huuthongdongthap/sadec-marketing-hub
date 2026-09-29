/**
 * Add Responsive CSS Links to HTML Files
 * Thêm responsive-table-layout.css vào các files có table
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..', '..');

const FILES_TO_UPDATE = [
    // Admin files with tables
    'admin/campaigns.html',
    'admin/finance.html',
    'admin/inventory.html',
    'admin/loyalty.html',
    'admin/notifications.html',
    'admin/suppliers.html',
    'admin/roiaas-admin.html',
    'admin/raas-overview.html',
    // Portal files with tables
    'portal/credits.html',
    'portal/invoices.html',
    'portal/payments.html',
    'portal/reports.html',
    'portal/roi-report.html',
    'portal/roiaas-dashboard.html',
    'portal/subscription-plans.html',
    'portal/subscriptions.html'
];

function addResponsiveCSS(content, filePath) {
    let modified = content;
    const changes = [];

    // Check if already has responsive-table-layout.css
    const hasTableCSS = modified.includes('responsive-table-layout.css');
    if (!hasTableCSS) {
        // Add after responsive-fix-2026.css or responsive-enhancements.css
        const existingResponsive = modified.match(/<link[^>]*responsive-(?:fix-2026|enhancements)\.css[^>]*>/i);
        if (existingResponsive) {
            const insertAfter = existingResponsive[0];
            const newLink = '\n  <link rel="stylesheet" href="/assets/css/responsive-table-layout.css">';
            modified = modified.replace(insertAfter, insertAfter + newLink);
            changes.push('Added responsive-table-layout.css link');
        } else if (modified.includes('</head>')) {
            const newLink = '  <link rel="stylesheet" href="/assets/css/responsive-table-layout.css">\n';
            modified = modified.replace('</head>', newLink + '</head>');
            changes.push('Added responsive-table-layout.css before </head>');
        }
    }

    // Add table-responsive class to tables without it
    const tableMatches = [...modified.matchAll(/<table(?![^>]*class=["'][^"']*table-responsive)/gi)];
    if (tableMatches.length > 0) {
        let tableCount = 0;
        modified = modified.replace(/<table/gi, (match, offset, string) => {
            // Only add to first few tables to avoid breaking layout tables
            if (tableCount < 3) {
                tableCount++;
                return '<table class="table-responsive"';
            }
            return match;
        });
        if (tableCount > 0) {
            changes.push(`Added table-responsive class to ${tableCount} table(s)`);
        }
    }

    return { modified, changes };
}

// Main
let updatedCount = 0;
for (const file of FILES_TO_UPDATE) {
    const filePath = path.join(rootDir, file);

    if (!fs.existsSync(filePath)) {
        continue;
    }

    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const { modified, changes } = addResponsiveCSS(content, filePath);

        if (changes.length > 0) {
            fs.writeFileSync(filePath, modified, 'utf8');
            changes.forEach(change => );
            updatedCount++;
        } else {
            }
    } catch (error) {
        console.error(`❌ ${file}: ${error.message}`);
    }
}


#!/usr/bin/env node
/**
 * Sidebar Migration Script
 * Migrates all admin pages to use <sadec-sidebar> Web Component
 */

const fs = require('fs');
const path = require('path');

const ADMIN_DIR = path.join(__dirname, 'admin');

// Pages to migrate (excluding dashboard.html which already uses component)
const PAGES_TO_MIGRATE = [
    'agents.html', 'ai-analysis.html', 'api-builder.html', 'approvals.html',
    'auth.html', 'binh-phap.html', 'brand-guide.html', 'campaigns.html',
    'community.html', 'content-calendar.html', 'customer-success.html',
    'deploy.html', 'docs.html', 'ecommerce.html', 'events.html',
    'finance.html', 'hr-hiring.html', 'leads.html', 'legal.html',
    'lms.html', 'mvp-launch.html', 'onboarding.html', 'payments.html',
    'pipeline.html', 'pricing.html', 'proposals.html', 'retention.html',
    'vc-readiness.html', 'video-workflow.html', 'workflows.html'
];

// Component script import to add
const COMPONENT_SCRIPT = `
    <!-- Web Components -->
    <script src="../assets/js/components/sadec-sidebar.js"></script>`;

function getActiveId(filename) {
    return filename.replace('.html', '');
}

function migrateFile(filename) {
    const filepath = path.join(ADMIN_DIR, filename);

    if (!fs.existsSync(filepath)) {
        console.log(`⏭️  Skipping ${filename} (not found)`);
        return false;
    }

    let content = fs.readFileSync(filepath, 'utf8');
    const originalLength = content.length;
    const activeId = getActiveId(filename);

    // 1. Check if already migrated
    if (content.includes('<sadec-sidebar')) {
        console.log(`✅ ${filename} already migrated`);
        return false;
    }

    // 2. Remove hardcoded sidebar (various patterns)
    // Pattern 1: <aside class="sidebar...">...</aside>
    content = content.replace(/<aside[^>]*class="[^"]*sidebar[^"]*"[^>]*>[\s\S]*?<\/aside>/gi,
        `<!-- Sidebar - Using Web Component -->\n        <sadec-sidebar active="${activeId}"></sadec-sidebar>`);

    // Pattern 2: <nav class="sidebar...">...</nav> (alternative pattern)
    content = content.replace(/<nav[^>]*class="[^"]*sidebar[^"]*"[^>]*>[\s\S]*?<\/nav>/gi,
        `<!-- Sidebar - Using Web Component -->\n        <sadec-sidebar active="${activeId}"></sadec-sidebar>`);

    // Pattern 3: <div class="sidebar...">...</div>
    content = content.replace(/<div[^>]*class="[^"]*admin-sidebar[^"]*"[^>]*>[\s\S]*?<\/div>\s*<\/div>/gi,
        `<!-- Sidebar - Using Web Component -->\n        <sadec-sidebar active="${activeId}"></sadec-sidebar>`);

    // 3. Add component script import if not present
    if (!content.includes('sadec-sidebar.js')) {
        // Insert before </head> or after last <script> in head
        if (content.includes('</head>')) {
            content = content.replace('</head>', `${COMPONENT_SCRIPT}\n</head>`);
        }
    }

    // 4. Save
    fs.writeFileSync(filepath, content);

    const newLength = content.length;
    const diff = originalLength - newLength;
    console.log(`✅ ${filename} migrated (${diff > 0 ? '-' : '+'}${Math.abs(diff)} bytes)`);

    return true;
}

console.log('🚀 Starting Sidebar Migration...\n');
console.log(`📁 Admin directory: ${ADMIN_DIR}`);
console.log(`📄 Pages to migrate: ${PAGES_TO_MIGRATE.length}\n`);

let migrated = 0;
let skipped = 0;

PAGES_TO_MIGRATE.forEach(filename => {
    if (migrateFile(filename)) {
        migrated++;
    } else {
        skipped++;
    }
});

console.log('\n' + '═'.repeat(50));
console.log(`✅ Migrated: ${migrated}`);
console.log(`⏭️  Skipped: ${skipped}`);
console.log('═'.repeat(50));
console.log('\n🎉 Migration complete!');

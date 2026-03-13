/**
 * Comprehensive Auto-Fix Script
 * Fix broken links, meta tags, accessibility issues
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..', '..');

// Broken links mapping (file -> correct path)
const LINK_FIXES = {
    // Admin pages
    'admin/agents.html': { 'dashboard.html': '../dashboard.html', 'brand-guide.html': 'brand-guide.html' },
    'admin/approvals.html': { 'workflows.html': 'workflows.html', 'agents.html': 'agents.html', 'dashboard.html': '../dashboard.html' },
    'admin/community.html': { 'events.html': 'events.html', 'lms.html': 'lms.html', 'dashboard.html': '../dashboard.html' },
    'admin/customer-success.html': { 'community.html': 'community.html', 'events.html': 'events.html', 'dashboard.html': '../dashboard.html' },
    'admin/ecommerce.html': { 'workflows.html': 'workflows.html', 'approvals.html': 'approvals.html', 'dashboard.html': '../dashboard.html' },
    'admin/landing-builder.html': { 'dashboard.html': '../dashboard.html' },
    'admin/workflows.html': { 'agents.html': 'agents.html', 'dashboard.html': '../dashboard.html' },
    'admin/dashboard.html': {
        'pos.html': 'pos.html',
        'menu.html': 'menu.html',
        'inventory.html': 'inventory.html',
        'shifts.html': 'shifts.html',
        'quality.html': 'quality.html',
        'suppliers.html': 'suppliers.html',
        'loyalty.html': 'loyalty.html'
    },
    // Portal pages
    'portal/credits.html': { 'missions.html': 'missions.html' },
    'portal/dashboard.html': { 'payments.html': 'payments.html', 'projects.html': 'projects.html' },
    'portal/approve.html': { '${item.preview_url}': '#' },
    'portal/assets.html': { '${asset.url}': '#' },
    // Affiliate
    'affiliate/dashboard.html': { 'referrals.html': 'referrals.html' },
    // Auth
    'auth/login.html': { '/': '../index.html' },
    'portal/login.html': { '/': '../index.html' },
};

const CONFIG = {
    htmlDirs: ['admin', 'portal', 'affiliate', 'auth'],
    excludeFiles: ['node_modules', '.git']
};

function getAllHtmlFiles() {
    const files = [];
    for (const dir of CONFIG.htmlDirs) {
        const dirPath = path.join(rootDir, dir);
        if (!fs.existsSync(dirPath)) continue;

        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.isFile() && entry.name.endsWith('.html')) {
                const fullPath = path.join(dirPath, entry.name);
                const relPath = path.join(dir, entry.name);
                files.push({ path: fullPath, relPath });
            }
        }
    }
    return files;
}

function fixBrokenLinks(content, filePath, relPath) {
    let modified = content;
    const changes = [];
    const fileName = path.basename(relPath);

    // Find link fixes for this file
    const fileFixes = LINK_FIXES[relPath];
    if (!fileFixes) return { modified, changes };

    for (const [badLink, goodLink] of Object.entries(fileFixes)) {
        const regex = new RegExp(`href=["']${badLink.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`, 'g');
        if (regex.test(modified)) {
            modified = modified.replace(regex, `href="${goodLink}"`);
            changes.push(`Fixed link: ${badLink} -> ${goodLink}`);
        }
    }

    return { modified, changes };
}

function fixAccessibility(content) {
    let modified = content;
    const changes = [];

    // Fix empty alt attributes
    modified = modified.replace(/alt=""(?!\srole=)/g, 'alt="" role="presentation"');

    // Fix images without alt
    modified = modified.replace(/<img(?![^>]*alt=)([^>]*?)>/g, '<img$1 alt="" role="presentation">');

    // Fix empty links
    modified = modified.replace(/href="#"(?!\s*javascript)/g, 'href="javascript:void(0)"');

    return { modified, changes };
}

function fixMetaTags(content) {
    let modified = content;
    const changes = [];

    // Check and fix charset
    if (!/<meta charset=/i.test(modified) && !/<meta http-equiv=["']?content-type/i.test(modified)) {
        modified = modified.replace('<head>', '<head>\n  <meta charset="UTF-8">');
        changes.push('Added charset UTF-8');
    }

    // Check and fix viewport
    if (!/<meta name=["']?viewport/i.test(modified)) {
        modified = modified.replace('<head>', '<head>\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">');
        changes.push('Added viewport meta');
    }

    return { modified, changes };
}

// Main
console.log('🔧 Comprehensive Auto-Fix\n');

const htmlFiles = getAllHtmlFiles();
console.log(`📂 Found ${htmlFiles.length} HTML files\n`);

let fixedCount = 0;
for (const { path: filePath, relPath } of htmlFiles) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        let modified = content;
        const allChanges = [];

        // Fix broken links
        const { modified: afterLinks, changes: linkChanges } = fixBrokenLinks(modified, filePath, relPath);
        modified = afterLinks;
        allChanges.push(...linkChanges);

        // Fix accessibility
        const { modified: afterA11y, changes: a11yChanges } = fixAccessibility(modified);
        modified = afterA11y;
        allChanges.push(...a11yChanges);

        // Fix meta tags
        const { modified: afterMeta, changes: metaChanges } = fixMetaTags(modified);
        modified = afterMeta;
        allChanges.push(...metaChanges);

        if (allChanges.length > 0) {
            fs.writeFileSync(filePath, modified, 'utf8');
            console.log(`✅ ${relPath}:`);
            allChanges.forEach(c => console.log(`   - ${c}`));
            fixedCount++;
        }
    } catch (error) {
        console.error(`❌ ${relPath}: ${error.message}`);
    }
}

console.log(`\n📊 Fixed ${fixedCount}/${htmlFiles.length} files`);

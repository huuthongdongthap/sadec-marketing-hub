#!/usr/bin/env node
/**
 * Sa Đéc Marketing Hub - Touch Target Fix
 * Fixes small touch targets (< 40px) for WCAG 2.1 compliance
 *
 * Usage: node scripts/responsive/fix-touch-targets.js
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../..');

// Files with small touch targets
const FILES_TO_FIX = [
    'portal/assets.html',
    'admin/brand-guide.html',
    'admin/events.html',
    'admin/notifications.html'
];

let fixed = 0;

/**
 * Fix inline style width values
 */
function fixTouchTargets(filePath) {
    const fullPath = path.join(ROOT_DIR, filePath);
    if (!fs.existsSync(fullPath)) {
        console.warn(`⚠️ File not found: ${filePath}`);
        return 0;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    let count = 0;

    // Fix small button widths (20px, 24px, 32px → 40px)
    content = content.replace(
        /style=["']([^"']*)width:\s*(20|24|32|36)px([^"']*)["']/g,
        (match, before, size, after) => {
            count++;
            return `style="${before}width: 40px${after}"`;
        }
    );

    // Fix small icon button widths
    content = content.replace(
        /style=["']([^"']*)width:\s*1\.5rem([^"']*)["']/g,
        (match, before, after) => {
            count++;
            return `style="${before}min-width: 40px${after}"`;
        }
    );

    if (count > 0) {
        fs.writeFileSync(fullPath, content, 'utf8');
    }

    return count;
}

/**
 * Add CSS rule for touch targets
 */
function addTouchTargetCSS() {
    const cssPath = path.join(ROOT_DIR, 'assets/css/responsive-fix-2026.css');
    if (!fs.existsSync(cssPath)) {
        console.warn('⚠️ responsive-fix-2026.css not found');
        return false;
    }

    let content = fs.readFileSync(cssPath, 'utf8');

    // Check if touch target rule already exists
    if (content.includes('.btn-icon {') && content.includes('min-width: 40px')) {
        return false;
    }

    // Add touch target enhancement
    const touchTargetCSS = `
/* Touch Target Enhancement - WCAG 2.1 */
.btn-icon,
.icon-btn,
button[aria-label],
button.material-symbols-outlined {
    min-width: var(--touch-target-small, 40px);
    min-height: var(--touch-target-small, 40px);
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

/* Ensure buttons meet minimum touch target */
.btn,
button,
a.btn {
    min-height: var(--touch-target-small, 40px);
}

/* Small icon buttons in tables */
.table-actions .btn-icon {
    min-width: 36px;
    min-height: 36px;
}
`;

    // Insert before last closing brace or at end
    if (content.trim().endsWith('}')) {
        content = content.trim().slice(0, -1) + '\n' + touchTargetCSS + '\n}\n';
    } else {
        content += '\n' + touchTargetCSS;
    }

    fs.writeFileSync(cssPath, content, 'utf8');
    return true;
}

/**
 * Main fix function
 */
function runFix() {
    console.log('🔧 Touch Target Fix - WCAG 2.1 Compliance\n');

    let totalFixed = 0;

    // Fix individual files
    for (const file of FILES_TO_FIX) {
        const count = fixTouchTargets(file);
        if (count > 0) {
            console.log(`✅ Fixed ${count} touch targets: ${file}`);
            totalFixed += count;
        }
    }

    // Add CSS enhancement
    if (addTouchTargetCSS()) {
        console.log('✅ Added touch target CSS rules');
        totalFixed++;
    }

    console.log(`\n📊 Total Fixed: ${totalFixed}`);
}

runFix();

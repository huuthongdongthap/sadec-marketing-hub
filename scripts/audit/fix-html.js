#!/usr/bin/env node
/**
 * Sa Đéc Marketing Hub - HTML Auto-Fix Script
 * Fixes common issues found by audit scanner
 *
 * Usage: node scripts/audit/fix-html.js
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../..');

/**
 * Fix empty href attributes - replace with javascript:void(0) or proper buttons
 */
function fixEmptyHref(content, filePath) {
    let fixed = content;
    let count = 0;

    // Pattern 1: <a href="#"> -> <a href="javascript:void(0)"
    fixed = fixed.replace(/<a\s+href="#"/gi, '<a href="javascript:void(0)"');
    count++;

    // Pattern 2: <a href=""> -> remove href or add javascript:void(0)
    fixed = fixed.replace(/<a\s+href=""/gi, '<a href="javascript:void(0)"');
    count++;

    // Pattern 3: Empty href with whitespace
    fixed = fixed.replace(/<a\s+href="\s*"/gi, '<a href="javascript:void(0)"');
    count++;

    if (count > 0) {
    }

    return fixed;
}

/**
 * Add missing meta charset if not present
 */
function addMetaCharset(content, filePath) {
    if (content.includes('<meta charset')) return content;

    const charset = '    <meta charset="UTF-8">\n';

    if (content.includes('</head>')) {
        return content.replace('</head>', charset + '</head>');
    }

    return content;
}

/**
 * Add missing viewport meta tag
 */
function addViewport(content, filePath) {
    if (content.includes('name="viewport"')) return content;

    const viewport = '    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n';

    if (content.includes('</head>')) {
        return content.replace('</head>', viewport + '</head>');
    }

    return content;
}

/**
 * Add missing title tag
 */
function addTitle(content, filePath) {
    if (content.includes('<title')) return content;

    // Extract filename for default title
    const fileName = path.basename(filePath, '.html');
    const title = `    <title>${fileName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</title>\n`;

    if (content.includes('</head>')) {
        return content.replace('</head>', title + '</head>');
    }

    return content;
}

/**
 * Add preconnect for Google Fonts if using them
 */
function addPreconnect(content, filePath) {
    if (content.includes('fonts.googleapis.com') && !content.includes('preconnect')) {
        const preconnect = '    <link rel="preconnect" href="https://fonts.googleapis.com">\n' +
            '    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n';

        if (content.includes('</head>')) {
            return content.replace('</head>', preconnect + '</head>');
        }
    }

    return content;
}

/**
 * Process all HTML files and fix issues
 */
function fixHTMLFiles() {
    const SCAN_DIRS = ['admin', 'portal', 'affiliate', 'auth', ''];
    let totalFixed = 0;

    for (const dir of SCAN_DIRS) {
        const dirPath = path.join(ROOT_DIR, dir);
        if (!fs.existsSync(dirPath)) continue;

        const files = fs.readdirSync(dirPath);

        for (const file of files) {
            const filePath = path.join(dirPath, file);

            try {
                const stat = fs.statSync(filePath);

                if (stat.isDirectory()) {
                    // Skip certain directories
                    if (file === 'node_modules' || file === '.git' || file === 'dist') continue;
                    // Recursively process subdirectories
                    const subFiles = fs.readdirSync(filePath);
                    for (const subFile of subFiles) {
                        if (subFile.endsWith('.html')) {
                            const subFilePath = path.join(filePath, subFile);
                            totalFixed += processFile(subFilePath);
                        }
                    }
                } else if (file.endsWith('.html') && !file.includes('.min.')) {
                    totalFixed += processFile(filePath);
                }
            } catch (err) {
            }
        }
    }

    return totalFixed;
}

/**
 * Process a single HTML file
 */
function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;
    let fixes = 0;

    // Apply fixes
    const afterHref = fixEmptyHref(content, filePath);
    if (afterHref !== content) { fixes++; content = afterHref; }

    const afterCharset = addMetaCharset(content, filePath);
    if (afterCharset !== content) { fixes++; content = afterCharset; }

    const afterViewport = addViewport(content, filePath);
    if (afterViewport !== content) { fixes++; content = afterViewport; }

    const afterTitle = addTitle(content, filePath);
    if (afterTitle !== content) { fixes++; content = afterTitle; }

    const afterPreconnect = addPreconnect(content, filePath);
    if (afterPreconnect !== content) { fixes++; content = afterPreconnect; }

    // Write if changed
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
    }

    return fixes;
}

/**
 * Main function
 */
function main() {

    const totalFixed = fixHTMLFiles();

}

main();

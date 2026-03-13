#!/usr/bin/env node
/**
 * Sa Đéc Marketing Hub - Responsive Auto-Fix
 * Adds missing viewport meta tags and responsive CSS links
 *
 * Usage: node scripts/responsive/fix-responsive.js
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../..');
const SCAN_DIRS = ['portal', 'admin'];

const VIEWPORT_META = `  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">`;
const RESPONSIVE_CSS = `    <link rel="stylesheet" href="/assets/css/responsive-fix-2026.css">`;

let fixed = 0;
let skipped = 0;

/**
 * Get all HTML files in directory
 */
function getHtmlFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        try {
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                getHtmlFiles(filePath, fileList);
            } else if (file.endsWith('.html')) {
                fileList.push(filePath);
            }
        } catch (err) {
            // Skip inaccessible files
        }
    }
    return fileList;
}

/**
 * Fix missing viewport meta tag
 */
function fixViewport(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    if (content.includes('<meta name="viewport"')) {
        return false; // Already has viewport
    }

    let inserted = false;

    // Try 1: Find charset meta tag and insert after it
    const charsetMatch = content.match(/<meta charset="[^"]*">/);
    if (charsetMatch) {
        const insertPos = charsetMatch.index + charsetMatch[0].length;
        content = content.slice(0, insertPos) + '\n' + VIEWPORT_META + content.slice(insertPos);
        inserted = true;
    }

    // Try 2: If no charset, insert after <head>
    if (!inserted) {
        const headMatch = content.match(/<head>/i);
        if (headMatch) {
            const insertPos = headMatch.index + headMatch[0].length;
            content = content.slice(0, insertPos) + '\n' + VIEWPORT_META + '\n' + content.slice(insertPos);
            inserted = true;
        }
    }

    // Try 3: If no <head>, insert at beginning of file
    if (!inserted) {
        content = '<!DOCTYPE html>\n<html lang="vi">\n\n<head>\n' + VIEWPORT_META + '\n' + content;
    }

    fs.writeFileSync(filePath, content, 'utf8');
    return true;
}

/**
 * Fix missing responsive CSS
 */
function fixResponsiveCSS(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    if (content.includes('responsive-fix-2026.css')) {
        return false; // Already has responsive CSS
    }

    // Find other CSS links and insert after them
    const cssMatches = [...content.matchAll(/<link rel="stylesheet" href="[^"]*\.css">/g)];
    if (cssMatches.length > 0) {
        const lastMatch = cssMatches[cssMatches.length - 1];
        const insertPos = lastMatch.index + lastMatch[0].length;
        content = content.slice(0, insertPos) + '\n' + RESPONSIVE_CSS + content.slice(insertPos);
    } else {
        // Fallback: insert before </head>
        const headClose = content.match(/<\/head>/);
        if (headClose) {
            const insertPos = headClose.index;
            content = RESPONSIVE_CSS + '\n' + content.slice(0, insertPos) + content.slice(insertPos);
        }
    }

    fs.writeFileSync(filePath, content, 'utf8');
    return true;
}

/**
 * Main fix function
 */
function runFix() {
    console.log('🔧 Responsive Auto-Fix\n');

    const results = {
        viewportFixed: 0,
        cssFixed: 0,
        filesProcessed: 0
    };

    for (const dir of SCAN_DIRS) {
        const dirPath = path.join(ROOT_DIR, dir);
        if (!fs.existsSync(dirPath)) continue;

        const htmlFiles = getHtmlFiles(dirPath);

        for (const file of htmlFiles) {
            results.filesProcessed++;
            const relativePath = path.relative(ROOT_DIR, file);

            // Fix viewport
            if (fixViewport(file)) {
                results.viewportFixed++;
                console.log(`✅ Added viewport: ${relativePath}`);
            }

            // Fix responsive CSS
            if (fixResponsiveCSS(file)) {
                results.cssFixed++;
                console.log(`✅ Added responsive CSS: ${relativePath}`);
            }
        }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Files Processed: ${results.filesProcessed}`);
    console.log(`   Viewport Tags Added: ${results.viewportFixed}`);
    console.log(`   Responsive CSS Added: ${results.cssFixed}`);

    return results;
}

runFix();

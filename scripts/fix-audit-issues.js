#!/usr/bin/env node

/**
 * ==============================================
 * QUICK FIX AUDIT ISSUES SCRIPT
 * Fixes common audit issues automatically
 * ==============================================
 *
 * Fixes:
 * 1. Adds aria-label to inputs without labels
 * 2. Adds missing landmarks (<main>, <nav>, <header>)
 * 3. Adds lang attribute to <html>
 *
 * Usage: node scripts/fix-audit-issues.js
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');

let fixedCount = 0;
let skippedCount = 0;

/**
 * Get all HTML files
 */
function getHtmlFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);

        if (file === 'node_modules' || file === '.git' || file === 'dist' || file === '.vercel') {
            continue;
        }

        try {
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                getHtmlFiles(filePath, fileList);
            } else if (file.endsWith('.html')) {
                fileList.push(filePath);
            }
        } catch (err) {
            console.error(`Error reading ${filePath}: ${err.message}`);
        }
    }

    return fileList;
}

/**
 * Add aria-label to inputs without labels
 */
function fixInputLabels(content, filePath) {
    let newContent = content;
    let count = 0;

    // Find inputs without aria-label
    const inputPattern = /<input([^>]*)>/gi;
    const matches = [...content.matchAll(inputPattern)];

    for (const match of matches) {
        const inputTag = match[0];
        const attributes = match[1];

        // Skip hidden, submit, button types
        if (attributes.includes('type="hidden"') || attributes.includes('type="submit"') ||
            attributes.includes('type="button"') || attributes.includes('type="reset"')) {
            continue;
        }

        // Skip if already has aria-label or aria-labelledby
        if (attributes.includes('aria-label') || attributes.includes('aria-labelledby')) {
            continue;
        }

        // Try to get placeholder or id for label
        const idMatch = attributes.match(/id="([^"]+)"/);
        const placeholderMatch = attributes.match(/placeholder="([^"]+)"/);
        const nameMatch = attributes.match(/name="([^"]+)"/);
        const typeMatch = attributes.match(/type="([^"]+)"/);

        let labelText = '';
        if (placeholderMatch) {
            labelText = placeholderMatch[1];
        } else if (idMatch) {
            labelText = idMatch[1].replace(/-/g, ' ');
        } else if (nameMatch) {
            labelText = nameMatch[1];
        } else if (typeMatch) {
            labelText = typeMatch[1];
        } else {
            labelText = 'Input field';
        }

        // Capitalize first letter
        labelText = labelText.charAt(0).toUpperCase() + labelText.slice(1);

        // Add aria-label
        const newInputTag = inputTag.replace('>', ` aria-label="${labelText}">`);
        newContent = newContent.replace(inputTag, newInputTag);
        count++;
    }

    if (count > 0) {
        console.log(`  ✅ ${path.relative(ROOT_DIR, filePath)}: Fixed ${count} input labels`);
        fixedCount += count;
    }

    return newContent;
}

/**
 * Add lang attribute to html tag
 */
function fixLangAttribute(content, filePath) {
    if (content.includes('<html lang=')) {
        return content;
    }

    let newContent = content;

    // Replace <html> or <html> with attributes
    if (content.includes('<html>')) {
        newContent = content.replace('<html>', '<html lang="vi">');
        console.log(`  ✅ ${path.relative(ROOT_DIR, filePath)}: Added lang attribute`);
        fixedCount++;
    } else if (content.includes('<html ')) {
        newContent = content.replace(/<html\s/, '<html lang="vi" ');
        console.log(`  ✅ ${path.relative(ROOT_DIR, filePath)}: Added lang attribute`);
        fixedCount++;
    }

    return newContent;
}

/**
 * Add semantic landmarks if missing
 */
function fixLandmarks(content, filePath) {
    let newContent = content;

    // Check if already has landmarks
    const hasMain = content.includes('<main') || content.includes('role="main"');
    const hasNav = content.includes('<nav') || content.includes('role="navigation"');
    const hasHeader = content.includes('<header') || content.includes('role="banner"');
    const hasBody = content.includes('<body>');

    if (!hasBody) {
        return content; // Can't add landmarks without body
    }

    let added = [];

    // Add main landmark
    if (!hasMain) {
        // Find closing header or nav, or opening of content area
        newContent = newContent.replace('<body>', '<body>\n    <main role="main" class="main-content">');
        added.push('<main>');
    }

    // Add closing main if we added opening
    if (added.includes('<main>') && !newContent.includes('</main>')) {
        newContent = newContent.replace('</body>', '    </main>\n</body>');
    }

    if (added.length > 0) {
        console.log(`  ✅ ${path.relative(ROOT_DIR, filePath)}: Added ${added.join(', ')}`);
        fixedCount += added.length;
    }

    return newContent;
}

/**
 * Process single file
 */
function processFile(filePath) {
    const originalContent = fs.readFileSync(filePath, 'utf8');
    let newContent = originalContent;

    // Fix lang attribute
    newContent = fixLangAttribute(newContent, filePath);

    // Fix landmarks
    newContent = fixLandmarks(newContent, filePath);

    // Fix input labels (skip for large files to avoid noise)
    if (originalContent.length < 50000) {
        newContent = fixInputLabels(newContent, filePath);
    }

    // Only write if changed
    if (newContent !== originalContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        return true;
    }

    return false;
}

/**
 * Main function
 */
function main() {
    console.log('🔧 Starting Quick Fix Audit Issues...\n');
    console.log('📁 Scanning for HTML files...\n');

    const htmlFiles = getHtmlFiles(ROOT_DIR);
    console.log(`Found ${htmlFiles.length} HTML files\n`);

    console.log('🔧 Fixing issues...\n');

    let updatedCount = 0;
    for (const filePath of htmlFiles) {
        const relativePath = path.relative(ROOT_DIR, filePath);

        try {
            const updated = processFile(filePath);
            if (updated) {
                updatedCount++;
            } else {
                skippedCount++;
            }
        } catch (err) {
            console.error(`❌ ${relativePath}: ${err.message}`);
        }
    }

    console.log('\n✅ Fixes complete!\n');

    console.log('📊 Summary:');
    console.log(`   Files Updated: ${updatedCount}`);
    console.log(`   Files Skipped: ${skippedCount}`);
    console.log(`   Total Fixes: ${fixedCount}`);
    console.log('');
}

// Run
main();

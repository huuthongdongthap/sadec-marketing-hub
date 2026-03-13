#!/usr/bin/env node

/**
 * ==============================================
 * DEDUPLICATE DNS PREFETCH SCRIPT
 * ==============================================
 *
 * Removes duplicate dns-prefetch links from HTML files
 * Keeps only 1 set of 4 unique domains
 *
 * Usage: node scripts/dedupe-dns-prefetch.js
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const DNS_PREFETCH_PATTERN = /<link\s+rel="dns-prefetch"[^>]*>/gi;
const DNS_HREFS = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://cdn.jsdelivr.net',
    'https://esm.run'
];

/**
 * Get all HTML files in directory
 */
function getHtmlFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);

        if (file === 'node_modules' || file === '.git' || file === 'dist') {
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
 * Deduplicate dns-prefetch links in HTML content
 */
function dedupeDnsPrefetch(content) {
    const matches = content.match(DNS_PREFETCH_PATTERN);

    if (!matches || matches.length <= DNS_HREFS.length) {
        return content; // No deduplication needed
    }

    // Create clean dns-prefetch block
    const cleanDnsPrefetch = DNS_HREFS.map(href =>
        `    <link rel="dns-prefetch" href="${href}">`
    ).join('\n');

    // Replace all dns-prefetch with single clean block
    let newContent = content.replace(
        /[\s\n]*<!--\s*DNS Prefetch\s*-->[\s\n]*([\s\S]*?)(?=<link\s+rel="preconnect")|[\s\n]*([\s\S]*?)(?=<link\s+rel="stylesheet")/gi,
        (match, g1, g2) => {
            const group = g1 || g2 || '';
            if (!group.match(DNS_PREFETCH_PATTERN)) {
                return match;
            }
            return `\n\n<!-- DNS Prefetch (Deduplicated) -->\n${cleanDnsPrefetch}\n\n`;
        }
    );

    // Alternative: Simple replacement
    if (newContent === content) {
        // Count dns-prefetch occurrences
        const count = matches.length;

        if (count > DNS_HREFS.length) {
            // Remove all dns-prefetch first
            newContent = content.replace(DNS_PREFETCH_PATTERN, '');

            // Find where to insert clean dns-prefetch (after meta tags)
            const insertAfter = newContent.match(/<meta\s+name="description"[^>]*>/i);

            if (insertAfter) {
                const insertIndex = insertAfter.index + insertAfter[0].length;
                newContent =
                    newContent.slice(0, insertIndex) +
                    '\n\n    <!-- DNS Prefetch (Deduplicated) -->\n' +
                    cleanDnsPrefetch +
                    newContent.slice(insertIndex);
            }
        }
    }

    // Clean up multiple consecutive newlines
    newContent = newContent.replace(/\n{4,}/g, '\n\n\n');

    return newContent;
}

/**
 * Remove duplicate meta descriptions
 */
function dedupeMetaDescriptions(content) {
    const metaDescPattern = /<meta\s+name="description"\s+content="[^"]*"/gi;
    const matches = content.match(metaDescPattern);

    if (!matches || matches.length <= 1) {
        return content;
    }

    // Keep only first description
    let foundFirst = false;
    const newContent = content.replace(metaDescPattern, (match) => {
        if (!foundFirst) {
            foundFirst = true;
            return match;
        }
        // Remove duplicate
        return '<!-- REMOVED: Duplicate description -->';
    });

    // Remove comment markers
    return newContent.replace(/\s*<!--\s*REMOVED:[^>]*-->\s*/g, '');
}

/**
 * Process single file
 */
function processFile(filePath) {
    const originalContent = fs.readFileSync(filePath, 'utf8');

    let newContent = originalContent;

    // Deduplicate dns-prefetch
    newContent = dedupeDnsPrefetch(newContent);

    // Deduplicate meta descriptions
    newContent = dedupeMetaDescriptions(newContent);

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
    console.log('🔍 Scanning for duplicate dns-prefetch links...\n');

    const htmlFiles = getHtmlFiles(ROOT_DIR);
    console.log(`Found ${htmlFiles.length} HTML files\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const filePath of htmlFiles) {
        const relativePath = path.relative(ROOT_DIR, filePath);

        try {
            const updated = processFile(filePath);

            if (updated) {
                console.log(`✅ ${relativePath}`);
                updatedCount++;
            } else {
                skippedCount++;
            }
        } catch (err) {
            console.error(`❌ ${relativePath}: ${err.message}`);
        }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Updated: ${updatedCount} files`);
    console.log(`   Skipped: ${skippedCount} files`);
    console.log(`   Total:   ${htmlFiles.length} files\n`);
}

// Run
main();

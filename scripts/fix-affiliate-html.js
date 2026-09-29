#!/usr/bin/env node
/**
 * Fix Affiliate HTML Files
 * - Add DOCTYPE if missing
 * - Add <html lang="vi"> wrapper
 * - Add proper head structure
 *
 * Usage: node scripts/fix-affiliate-html.js
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const AFFILIATE_DIR = path.join(ROOT_DIR, 'affiliate');

let stats = {
    filesScanned: 0,
    filesFixed: 0,
    doctypeAdded: 0,
    langAdded: 0,
    charsetFixed: 0
};

function fixAffiliateFile(filePath) {
    const fullPath = path.join(AFFILIATE_DIR, filePath);
    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;

    // Check if file starts with DOCTYPE
    const hasDoctype = content.trim().startsWith('<!DOCTYPE');
    if (!hasDoctype) {
        content = '<!DOCTYPE html>\n' + content;
        stats.doctypeAdded++;
    }

    // Check if file has <html tag with lang
    const hasHtmlLang = /<html[^>]*lang=["'][^"']+["']/i.test(content);
    const hasHtmlTag = /<html/i.test(content);

    if (!hasHtmlLang) {
        if (hasHtmlTag) {
            // Add lang to existing html tag
            content = content.replace(/<html/i, '<html lang="vi"');
            stats.langAdded++;
        } else {
            // Wrap content with html tag
            content = content.replace(
                /(<!-- DNS Prefetch.*?-->)/s,
                '<html lang="vi">\n$1'
            );
            stats.langAdded++;
        }
    }

    // Ensure charset is in proper position (right after DOCTYPE or at start)
    const hasCharset = /<meta\s+charset=["']?UTF-8["']?/i.test(content);
    if (hasCharset) {
        // Move charset to proper position if needed
        const charsetMatch = content.match(/<meta\s+charset=["']?UTF-8["']?\s*>/i);
        if (charsetMatch && !charsetMatch[0].includes('<!--')) {
            // Find position right after DOCTYPE
            const doctypeMatch = content.match(/<!DOCTYPE html>/i);
            if (doctypeMatch) {
                const afterDoctype = doctypeMatch.index + doctypeMatch[0].length;
                const charsetLine = '\n<meta charset="UTF-8">\n';

                // Remove old charset and add new one in correct position
                content = content.replace(/<meta\s+charset=["']?UTF-8["']?\s*>/i, '');
                content = content.substring(0, afterDoctype) + charsetLine + content.substring(afterDoctype);
                stats.charsetFixed++;
            }
        }
    }

    // Add closing </html> if missing
    if (!content.trim().endsWith('</html>')) {
        content = content.trimEnd() + '\n</html>\n';
    }

    if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        stats.filesFixed++;
        return true;
    }

    return false;
}

// Main execution
const files = fs.readdirSync(AFFILIATE_DIR);
for (const file of files) {
    if (file.endsWith('.html')) {
        stats.filesScanned++;
        fixAffiliateFile(file);
    }
}


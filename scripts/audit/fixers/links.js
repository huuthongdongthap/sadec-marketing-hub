#!/usr/bin/env node
/**
 * Link Fixer — Auto-fix broken links
 */

const fs = require('fs');
const path = require('path');

/**
 * Auto-fix broken links
 */
async function fixLinks(results) {
    let fixed = 0;
    const filesToFix = new Set();

    // Collect files that need fixing
    for (const issue of results.broken) {
        filesToFix.add(issue.file);
    }

    for (const filePath of filesToFix) {
        const fullPath = path.join(process.cwd(), filePath);
        if (!fs.existsSync(fullPath)) continue;

        let content = fs.readFileSync(fullPath, 'utf-8');
        let modified = false;

        // Fix empty hrefs
        const emptyHrefRegex = /href\s*=\s*"(#|)"/g;
        if (emptyHrefRegex.test(content)) {
            content = content.replace(emptyHrefRegex, 'href="javascript:void(0)"');
            modified = true;
            fixed++;
        }

        // Fix href="#" (only if not already fixed)
        const hashOnlyRegex = /href\s*=\s*"#[^"]*"/g;
        // Keep hash-only links as they are (anchor links)

        if (modified) {
            fs.writeFileSync(fullPath, content);
        }
    }

    return fixed;
}

module.exports = { fixLinks };

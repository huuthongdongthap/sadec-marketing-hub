#!/usr/bin/env node
/**
 * Accessibility Fixer — Auto-fix accessibility issues
 */

const fs = require('fs');
const path = require('path');

/**
 * Auto-fix accessibility issues
 */
async function fixA11y(results) {
    let fixed = 0;
    const filesToFix = new Set();

    for (const fileResult of results.files) {
        filesToFix.add(fileResult.file);
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
            fixed++;
            modified = true;
        }

        // Add role="presentation" to images without alt
        content = content.replace(/<img([^>]*?)>/g, (match, attrs) => {
            if (!attrs.includes('alt=') && !attrs.includes('role=')) {
                fixed++;
                modified = true;
                return `<img${attrs} role="presentation">`;
            }
            return match;
        });

        if (modified) {
            fs.writeFileSync(fullPath, content);
        }
    }

    return fixed;
}

module.exports = { fixA11y };

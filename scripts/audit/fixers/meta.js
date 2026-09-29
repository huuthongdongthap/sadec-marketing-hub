#!/usr/bin/env node
/**
 * Meta Tag Fixer — Auto-fix missing meta tags
 */

const fs = require('fs');
const path = require('path');

const META_TEMPLATES = {
    charset: '<meta charset="UTF-8">',
    viewport: '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    'og:title': '<meta property="og:title" content="Page Title">',
    'og:description': '<meta property="og:description" content="Page description">',
    'og:image': '<meta property="og:image" content="https://example.com/og-image.jpg">',
    'og:url': '<meta property="og:url" content="https://example.com/page">'
};

/**
 * Auto-fix missing meta tags
 */
async function fixMeta(results) {
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

        for (const missing of fileResult.missing) {
            // Only auto-fix viewport and charset (safe defaults)
            if (missing.tag === 'viewport' && !content.includes('viewport')) {
                content = content.replace('<head>', `<head>\n    ${META_TEMPLATES.viewport}`);
                fixed++;
                modified = true;
            }

            if (missing.tag === 'charset' && !content.includes('charset')) {
                content = content.replace('<head>', `<head>\n    ${META_TEMPLATES.charset}`);
                fixed++;
                modified = true;
            }
        }

        if (modified) {
            fs.writeFileSync(fullPath, content);
        }
    }

    return fixed;
}

module.exports = { fixMeta };

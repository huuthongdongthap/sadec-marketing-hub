#!/usr/bin/env node
/**
 * Meta Tag Scanner — Detect missing meta tags
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Required meta tags
const REQUIRED_META_TAGS = [
    { name: 'title', selector: 'title', required: true },
    { name: 'description', selector: 'meta[name="description"]', required: true },
    { name: 'viewport', selector: 'meta[name="viewport"]', required: true },
    { name: 'charset', selector: 'meta[charset]', required: true },
    { name: 'og:title', selector: 'meta[property="og:title"]', required: false },
    { name: 'og:description', selector: 'meta[property="og:description"]', required: false },
    { name: 'og:image', selector: 'meta[property="og:image"]', required: false },
    { name: 'og:url', selector: 'meta[property="og:url"]', required: false },
    { name: 'canonical', selector: 'link[rel="canonical"]', required: false }
];

/**
 * Check meta tags in a document
 */
function checkMetaTags(document, filePath, rootDir) {
    const missing = [];
    const present = [];

    for (const tag of REQUIRED_META_TAGS) {
        const element = document.querySelector(tag.selector);
        const relativePath = path.relative(rootDir, filePath);

        if (!element || (tag.name === 'title' && !element.textContent.trim())) {
            if (tag.required) {
                missing.push({
                    file: relativePath,
                    tag: tag.name,
                    severity: 'error',
                    message: `Missing required meta tag: ${tag.name}`
                });
            } else {
                missing.push({
                    file: relativePath,
                    tag: tag.name,
                    severity: 'warning',
                    message: `Missing recommended meta tag: ${tag.name}`
                });
            }
        } else {
            present.push(tag.name);
        }
    }

    return { missing, present };
}

/**
 * Scan files for missing meta tags
 */
async function scanMeta(htmlFiles, rootDir) {
    const results = {
        files: [],
        missing: [],
        summary: {
            totalFiles: htmlFiles.length,
            filesWithMissingMeta: 0,
            missingRequired: 0,
            missingRecommended: 0
        }
    };

    for (const filePath of htmlFiles) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const dom = new JSDOM(content);
        const document = dom.window.document;

        const { missing, present } = checkMetaTags(document, filePath, rootDir);

        if (missing.length > 0) {
            results.files.push({
                file: path.relative(rootDir, filePath),
                missing,
                present
            });
            results.missing.push(...missing);
            results.summary.filesWithMissingMeta++;
        }

        // Count by severity
        for (const item of missing) {
            if (item.severity === 'error') {
                results.summary.missingRequired++;
            } else {
                results.summary.missingRecommended++;
            }
        }
    }

    return results;
}

/**
 * Auto-fix missing meta tags (best effort)
 */
async function fixMeta(results) {
    let fixed = 0;

    const metaTemplates = {
        viewport: '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
        charset: '<meta charset="UTF-8">'
    };

    for (const fileResult of results.files) {
        const fullPath = path.join(process.cwd(), fileResult.file);
        let content = fs.readFileSync(fullPath, 'utf-8');

        let needsFix = false;
        for (const missing of fileResult.missing) {
            if (missing.tag === 'viewport' && !content.includes('viewport')) {
                content = content.replace('<head>', `<head>\n${metaTemplates.viewport}`);
                fixed++;
                needsFix = true;
            }
            if (missing.tag === 'charset' && !content.includes('charset')) {
                content = content.replace('<head>', `<head>\n${metaTemplates.charset}`);
                fixed++;
                needsFix = true;
            }
        }

        if (needsFix) {
            fs.writeFileSync(fullPath, content);
        }
    }

    return fixed;
}

module.exports = { scanMeta, fixMeta, checkMetaTags, REQUIRED_META_TAGS };

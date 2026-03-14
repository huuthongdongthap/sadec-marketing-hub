#!/usr/bin/env node
/**
 * Link Scanner — Detect broken internal links
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

/**
 * Check if internal link exists
 */
function checkInternalLink(linkPath, baseDir, rootDir) {
    const cleanPath = linkPath.split('#')[0].split('?')[0];

    // Skip external, tel:, mailto:, javascript:, anchors
    if (cleanPath.startsWith('http') ||
        cleanPath.startsWith('tel:') ||
        cleanPath.startsWith('mailto:') ||
        cleanPath.startsWith('javascript:') ||
        cleanPath.startsWith('#') ||
        cleanPath === '') {
        return { valid: true, type: 'external-or-special' };
    }

    // Resolve path
    let fullPath;
    if (cleanPath.startsWith('/')) {
        fullPath = path.join(rootDir, cleanPath.substring(1));
    } else {
        fullPath = path.join(baseDir, cleanPath);
    }

    // Check if file exists
    if (fs.existsSync(fullPath)) {
        return { valid: true, type: 'file' };
    }

    return { valid: false, path: linkPath, resolved: fullPath };
}

/**
 * Scan files for broken links
 */
async function scanLinks(htmlFiles, rootDir) {
    const results = {
        files: [],
        broken: [],
        external: []
    };

    for (const filePath of htmlFiles) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const dom = new JSDOM(content);
        const document = dom.window.document;
        const links = document.querySelectorAll('a[href]');
        const fileLinks = { file: filePath, links: [], broken: [] };

        const relativePath = path.relative(rootDir, filePath);

        for (const link of links) {
            const href = link.getAttribute('href');
            const result = checkInternalLink(href, path.dirname(filePath), rootDir);

            if (result.type === 'external-or-special') {
                if (href.startsWith('http')) {
                    results.external.push({
                        file: relativePath,
                        href,
                        text: link.textContent.trim()
                    });
                }
            } else if (!result.valid) {
                results.broken.push({
                    file: relativePath,
                    href,
                    resolved: result.resolved,
                    line: getLineNumber(content, href)
                });
                fileLinks.broken.push(href);
            }

            fileLinks.links.push(href);
        }

        if (fileLinks.links.length > 0) {
            results.files.push(fileLinks);
        }
    }

    return results;
}

/**
 * Auto-fix broken links (best effort)
 */
async function fixLinks(results) {
    let fixed = 0;

    // Note: Auto-fixing broken links is limited
    // We can only fix empty hrefs, not missing files

    for (const issue of results.broken) {
        if (issue.href === '' || issue.href === '#') {
            const content = fs.readFileSync(issue.file, 'utf-8');
            const updated = content.replace(
                `href="${issue.href}"`,
                'href="javascript:void(0)"'
            );
            fs.writeFileSync(issue.file, updated);
            fixed++;
        }
    }

    return fixed;
}

/**
 * Get line number for a string in content
 */
function getLineNumber(content, search) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(search)) {
            return i + 1;
        }
    }
    return null;
}

module.exports = { scanLinks, fixLinks, checkInternalLink };

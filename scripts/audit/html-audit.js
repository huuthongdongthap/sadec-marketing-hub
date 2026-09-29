#!/usr/bin/env node
/**
 * Sa Đéc Marketing Hub - HTML Audit Scanner
 * Scans for broken links, missing meta tags, and SEO issues
 *
 * Usage: node scripts/audit/html-audit.js
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '../..');
const SCAN_DIRS = ['admin', 'portal', 'affiliate', 'auth', ''];
const EXCLUDE_PATTERNS = ['.min.', 'node_modules', 'dist', '.git', 'test-'];

// Required meta tags for each HTML page
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

// Stats
let stats = {
    filesScanned: 0,
    brokenLinks: [],
    missingMeta: [],
    missingAlt: [],
    emptyHref: [],
    duplicateIds: [],
    externalLinks: [],
    accessibility: []
};

/**
 * Check if file should be excluded
 */
function shouldExclude(filePath) {
    return EXCLUDE_PATTERNS.some(pattern => filePath.includes(pattern));
}

/**
 * Get all HTML files recursively
 */
function getAllHTMLFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);

        try {
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                getAllHTMLFiles(filePath, fileList);
            } else if (file.endsWith('.html') && !shouldExclude(filePath)) {
                fileList.push(filePath);
            }
        } catch (err) {
        }
    }

    return fileList;
}

/**
 * Check if internal link exists
 */
function checkInternalLink(linkPath, baseDir) {
    // Remove hash and query params
    const cleanPath = linkPath.split('#')[0].split('?')[0];

    // Skip external, tel:, mailto:, javascript:, anchors
    if (cleanPath.startsWith('http') ||
        cleanPath.startsWith('tel:') ||
        cleanPath.startsWith('mailto:') ||
        cleanPath.startsWith('javascript:') ||
        cleanPath.startsWith('#')) {
        return { valid: true, type: 'external-or-special' };
    }

    // Resolve path relative to base directory
    let fullPath;
    if (cleanPath.startsWith('/')) {
        fullPath = path.join(ROOT_DIR, cleanPath.substring(1));
    } else {
        fullPath = path.join(baseDir, cleanPath);
    }

    // Check if file exists
    if (fs.existsSync(fullPath)) {
        return { valid: true, type: 'file' };
    }

    // Check with .html extension
    if (!cleanPath.endsWith('.html')) {
        if (fs.existsSync(fullPath + '.html')) {
            return { valid: true, type: 'file-with-extension' };
        }
        if (fs.existsSync(path.join(fullPath, 'index.html'))) {
            return { valid: true, type: 'directory-index' };
        }
    }

    return { valid: false, path: linkPath, resolved: fullPath };
}

/**
 * Scan HTML file for issues
 */
function scanHTMLFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const dom = new JSDOM(content);
    const document = dom.window.document;
    const baseDir = path.dirname(filePath);
    const relativePath = path.relative(ROOT_DIR, filePath);

    const issues = {
        file: relativePath,
        brokenLinks: [],
        missingMeta: [],
        missingAlt: [],
        emptyHref: [],
        duplicateIds: [],
        accessibility: []
    };

    // 1. Check for missing meta tags
    for (const meta of REQUIRED_META_TAGS) {
        const element = document.querySelector(meta.selector);
        if (!element) {
            issues.missingMeta.push({
                name: meta.name,
                required: meta.required,
                suggestion: getMetaSuggestion(meta.name)
            });
        }
    }

    // 2. Check all links
    const links = document.querySelectorAll('a[href]');
    links.forEach(link => {
        const href = link.getAttribute('href');

        // Check for empty href
        if (!href || href.trim() === '' || href === '#') {
            issues.emptyHref.push({
                href: href || '(empty)',
                text: link.textContent.trim().substring(0, 50),
                line: getLineNumber(content, link.outerHTML)
            });
            return;
        }

        // Check internal links
        const result = checkInternalLink(href, baseDir);
        if (!result.valid) {
            issues.brokenLinks.push({
                href: href,
                text: link.textContent.trim().substring(0, 50),
                resolved: result.resolved,
                line: getLineNumber(content, link.outerHTML)
            });
        } else if (href.startsWith('http')) {
            // Track external links (don't verify, just report)
            stats.externalLinks.push({
                url: href,
                text: link.textContent.trim().substring(0, 30),
                file: relativePath
            });
        }
    });

    // 3. Check for missing alt attributes on images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        if (!img.hasAttribute('alt')) {
            issues.missingAlt.push({
                src: img.getAttribute('src') || '(no src)',
                line: getLineNumber(content, img.outerHTML)
            });
        }
    });

    // 4. Check for duplicate IDs
    const allElements = document.querySelectorAll('*[id]');
    const idMap = new Map();
    allElements.forEach(el => {
        const id = el.getAttribute('id');
        if (idMap.has(id)) {
            if (!issues.duplicateIds.find(d => d.id === id)) {
                issues.duplicateIds.push({
                    id: id,
                    count: idMap.get(id) + 1,
                    line: getLineNumber(content, el.outerHTML)
                });
            }
            idMap.set(id, idMap.get(id) + 1);
        } else {
            idMap.set(id, 1);
        }
    });

    // 5. Accessibility checks
    // Check for buttons without accessible text
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
        if (!btn.textContent.trim() && !btn.getAttribute('aria-label')) {
            issues.accessibility.push({
                type: 'button-no-label',
                html: btn.outerHTML.substring(0, 100),
                line: getLineNumber(content, btn.outerHTML)
            });
        }
    });

    // Check forms without labels
    const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"])');
    inputs.forEach(input => {
        const id = input.getAttribute('id');
        if (id) {
            const label = document.querySelector(`label[for="${id}"]`);
            if (!label && !input.getAttribute('aria-label')) {
                issues.accessibility.push({
                    type: 'input-no-label',
                    input: input.getAttribute('type') || 'text',
                    id: id,
                    line: getLineNumber(content, input.outerHTML)
                });
            }
        } else if (!input.getAttribute('aria-label')) {
            issues.accessibility.push({
                type: 'input-no-id-no-label',
                input: input.getAttribute('type') || 'text',
                line: getLineNumber(content, input.outerHTML)
            });
        }
    });

    return issues;
}

/**
 * Get line number for a string in content
 */
function getLineNumber(content, searchString) {
    const lines = content.split('\n');
    const index = lines.findIndex(line => line.includes(searchString));
    return index >= 0 ? index + 1 : 'unknown';
}

/**
 * Get suggestion for missing meta tag
 */
function getMetaSuggestion(name) {
    const suggestions = {
        'title': 'Add <title>Your Page Title</title> in <head>',
        'description': 'Add <meta name="description" content="Brief page description">',
        'viewport': 'Add <meta name="viewport" content="width=device-width, initial-scale=1.0">',
        'charset': 'Add <meta charset="UTF-8">',
        'og:title': 'Add <meta property="og:title" content="Social media title">',
        'og:description': 'Add <meta property="og:description" content="Social media description">',
        'og:image': 'Add <meta property="og:image" content="https://example.com/image.jpg">',
        'og:url': 'Add <meta property="og:url" content="https://example.com/page">',
        'canonical': 'Add <link rel="canonical" href="https://example.com/page">'
    };
    return suggestions[name] || 'Add this meta tag';
}

/**
 * Generate markdown report
 */
function generateReport(issues) {
    let report = `# HTML Audit Report - Sa Đéc Marketing Hub

**Generated:** ${new Date().toISOString()}
**Files Scanned:** ${stats.filesScanned}

---

## Summary

| Issue Type | Count |
|------------|-------|
| Broken Links | ${stats.brokenLinks.length} |
| Missing Meta Tags | ${stats.missingMeta.length} |
| Missing Alt Attributes | ${stats.missingAlt.length} |
| Empty Href | ${stats.emptyHref.length} |
| Duplicate IDs | ${stats.duplicateIds.length} |
| Accessibility Issues | ${stats.accessibility.length} |
| External Links | ${stats.externalLinks.length} |

---

## 🔴 Broken Links

These links point to non-existent files:

`;

    if (stats.brokenLinks.length === 0) {
        report += `✅ No broken links found!\n\n`;
    } else {
        // Group by file
        const byFile = {};
        stats.brokenLinks.forEach(issue => {
            if (!byFile[issue.file]) byFile[issue.file] = [];
            byFile[issue.file].push(issue);
        });

        for (const [file, links] of Object.entries(byFile)) {
            report += `### ${file}\n\n`;
            links.forEach(link => {
                report += `- **Line ${link.line}:** [\`${link.href}\`](${link.href}) - "${link.text}"\n`;
                report += `  - Resolved path: \`${link.resolved}\`\n`;
                report += `  - **Fix:** Check if file exists or update link path\n\n`;
            });
        }
    }

    report += `---\n\n## 📋 Missing Meta Tags\n\n`;

    if (stats.missingMeta.length === 0) {
        report += `✅ All required meta tags present!\n\n`;
    } else {
        const byFile = {};
        stats.missingMeta.forEach(issue => {
            if (!byFile[issue.file]) byFile[issue.file] = [];
            byFile[issue.file].push(issue);
        });

        for (const [file, metas] of Object.entries(byFile)) {
            report += `### ${file}\n\n`;
            metas.forEach(meta => {
                const required = meta.required ? '🔴 Required' : '🟡 Recommended';
                report += `- **${meta.name}** (${required})\n`;
                report += `  - Fix: \`${meta.suggestion}\`\n\n`;
            });
        }
    }

    report += `---\n\n## 🖼️ Missing Alt Attributes\n\n`;

    if (stats.missingAlt.length === 0) {
        report += `✅ All images have alt attributes!\n\n`;
    } else {
        const byFile = {};
        stats.missingAlt.forEach(issue => {
            if (!byFile[issue.file]) byFile[issue.file] = [];
            byFile[issue.file].push(issue);
        });

        for (const [file, images] of Object.entries(byFile)) {
            report += `### ${file}\n\n`;
            images.forEach(img => {
                report += `- **Line ${img.line}:** Image \`${img.src}\`\n`;
                report += `  - **Fix:** Add alt="Description of image"\n\n`;
            });
        }
    }

    report += `---\n\n## ⚠️ Empty Href Attributes\n\n`;

    if (stats.emptyHref.length === 0) {
        report += `✅ No empty href attributes!\n\n`;
    } else {
        const byFile = {};
        stats.emptyHref.forEach(issue => {
            if (!byFile[issue.file]) byFile[issue.file] = [];
            byFile[issue.file].push(issue);
        });

        for (const [file, links] of Object.entries(byFile)) {
            report += `### ${file}\n\n`;
            links.forEach(link => {
                report += `- **Line ${link.line}:** Link "${link.text}"\n`;
                report += `  - **Fix:** Add proper href or use <button> instead\n\n`;
            });
        }
    }

    report += `---\n\n## 🔁 Duplicate IDs\n\n`;

    if (stats.duplicateIds.length === 0) {
        report += `✅ No duplicate IDs found!\n\n`;
    } else {
        const byFile = {};
        stats.duplicateIds.forEach(issue => {
            if (!byFile[issue.file]) byFile[issue.file] = [];
            byFile[issue.file].push(issue);
        });

        for (const [file, ids] of Object.entries(byFile)) {
            report += `### ${file}\n\n`;
            ids.forEach(id => {
                report += `- **ID "${id.id}"** appears ${id.count} times (line ${id.line})\n`;
                report += `  - **Fix:** Use unique IDs for each element\n\n`;
            });
        }
    }

    report += `---\n\n## ♿ Accessibility Issues\n\n`;

    if (stats.accessibility.length === 0) {
        report += `✅ No accessibility issues found!\n\n`;
    } else {
        const byFile = {};
        stats.accessibility.forEach(issue => {
            if (!byFile[issue.file]) byFile[issue.file] = [];
            byFile[issue.file].push(issue);
        });

        for (const [file, issues] of Object.entries(byFile)) {
            report += `### ${file}\n\n`;
            issues.forEach(issue => {
                if (issue.type === 'button-no-label') {
                    report += `- **Line ${issue.line}:** Button without accessible text\n`;
                    report += `  - HTML: \`${issue.html}\`\n`;
                    report += `  - **Fix:** Add aria-label or visible text content\n\n`;
                } else if (issue.type === 'input-no-label') {
                    report += `- **Line ${issue.line}:** Input#${issue.id} without label\n`;
                    report += `  - **Fix:** Add <label for="${issue.id}"> or aria-label\n\n`;
                } else if (issue.type === 'input-no-id-no-label') {
                    report += `- **Line ${issue.line}:** ${issue.input} input without id or label\n`;
                    report += `  - **Fix:** Add id with corresponding label, or aria-label\n\n`;
                }
            });
        }
    }

    report += `---\n\n## 🔗 External Links Reference\n\n`;
    report += `Total external links found: ${stats.externalLinks.length}\n\n`;

    if (stats.externalLinks.length > 0) {
        const byDomain = {};
        stats.externalLinks.forEach(link => {
            try {
                const domain = new URL(link.url).hostname;
                if (!byDomain[domain]) byDomain[domain] = [];
                byDomain[domain].push(link);
            } catch (e) {
                // Invalid URL
            }
        });

        for (const [domain, links] of Object.entries(byDomain)) {
            report += `### ${domain}\n`;
            links.slice(0, 10).forEach(link => {
                report += `- [\`${link.url}\`](${link.url}) in ${link.file}\n`;
            });
            if (links.length > 10) {
                report += `- ... and ${links.length - 10} more\n`;
            }
            report += `\n`;
        }
    }

    report += `---\n\n## ✅ Recommendations\n\n`;
    report += `1. **Fix all broken links** - Update or remove links to non-existent files\n`;
    report += `2. **Add required meta tags** - title, description, viewport, charset\n`;
    report += `3. **Add alt text to images** - Improves accessibility and SEO\n`;
    report += `4. **Fix duplicate IDs** - Can break JavaScript and CSS selectors\n`;
    report += `5. **Add labels to form inputs** - Required for screen readers\n`;
    report += `6. **Consider adding Open Graph tags** - Better social media sharing\n`;

    return report;
}

/**
 * Main audit function
 */
function runAudit() {

    // Collect all HTML files
    const allFiles = [];
    for (const dir of SCAN_DIRS) {
        const dirPath = path.join(ROOT_DIR, dir);
        if (fs.existsSync(dirPath)) {
            allFiles.push(...getAllHTMLFiles(dirPath));
        }
    }

    // Scan each file
    const allIssues = [];
    for (const file of allFiles) {
        stats.filesScanned++;
        const relativePath = path.relative(ROOT_DIR, file);

        try {
            const issues = scanHTMLFile(file);

            // Collect issues
            if (issues.brokenLinks.length > 0) {
                issues.brokenLinks.forEach(i => {
                    i.file = relativePath;
                    stats.brokenLinks.push(i);
                });
            }
            if (issues.missingMeta.length > 0) {
                issues.missingMeta.forEach(i => {
                    i.file = relativePath;
                    stats.missingMeta.push(i);
                });
            }
            if (issues.missingAlt.length > 0) {
                issues.missingAlt.forEach(i => {
                    i.file = relativePath;
                    stats.missingAlt.push(i);
                });
            }
            if (issues.emptyHref.length > 0) {
                issues.emptyHref.forEach(i => {
                    i.file = relativePath;
                    stats.emptyHref.push(i);
                });
            }
            if (issues.duplicateIds.length > 0) {
                issues.duplicateIds.forEach(i => {
                    i.file = relativePath;
                    stats.duplicateIds.push(i);
                });
            }
            if (issues.accessibility.length > 0) {
                issues.accessibility.forEach(i => {
                    i.file = relativePath;
                    stats.accessibility.push(i);
                });
            }

            // Only report files with issues
            const hasIssues = issues.brokenLinks.length > 0 ||
                issues.missingMeta.length > 0 ||
                issues.missingAlt.length > 0 ||
                issues.emptyHref.length > 0 ||
                issues.duplicateIds.length > 0 ||
                issues.accessibility.length > 0;

            if (hasIssues) {
                allIssues.push({ file: relativePath, ...issues });
            }

            process.stdout.write('.');
        } catch (error) {
        }
    }

    // Generate report
    const report = generateReport(allIssues);

    // Write report
    const reportPath = path.join(ROOT_DIR, 'audit-report.md');
    fs.writeFileSync(reportPath, report, 'utf8');

}

// Run audit
runAudit();

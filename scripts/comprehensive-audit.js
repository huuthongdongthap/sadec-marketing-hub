#!/usr/bin/env node

/**
 * ==============================================
 * COMPREHENSIVE AUDIT SCRIPT
 * Broken Links + Meta Tags + Accessibility
 * ==============================================
 *
 * Usage: node scripts/comprehensive-audit.js
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const REPORTS_DIR = path.join(ROOT_DIR, 'reports');

// Results storage
const results = {
    summary: {
        totalFiles: 0,
        totalLinks: 0,
        brokenLinks: 0,
        missingMeta: 0,
        accessibilityIssues: 0
    },
    brokenLinks: [],
    missingMeta: [],
    accessibilityIssues: [],
    filesProcessed: []
};

/**
 * Get all HTML files
 */
function getHtmlFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);

        if (file === 'node_modules' || file === '.git' || file === 'dist' || file === '.wrangler') {
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
        }
    }

    return fileList;
}

/**
 * Find all links in HTML content
 */
function findLinks(content, filePath) {
    const linkPattern = /href="([^"]+)"/gi;
    const srcPattern = /src="([^"]+)"/gi;
    const links = [];

    let match;
    while ((match = linkPattern.exec(content)) !== null) {
        links.push({ url: match[1], type: 'href', line: getLineNumber(content, match.index) });
    }

    while ((match = srcPattern.exec(content)) !== null) {
        links.push({ url: match[1], type: 'src', line: getLineNumber(content, match.index) });
    }

    return links;
}

/**
 * Get line number for position in content
 */
function getLineNumber(content, position) {
    return content.substring(0, position).split('\n').length;
}

/**
 * Check if link is broken
 */
function isLinkBroken(link, filePath) {
    const url = link.url;

    // Skip external links, anchors, mailto, tel, javascript
    if (url.startsWith('http') || url.startsWith('mailto:') || url.startsWith('tel:') ||
        url.startsWith('javascript:') || url.startsWith('#')) {
        return { broken: false, reason: 'external/special' };
    }

    // Skip dynamic URLs
    if (url.includes('${') || url.includes('{{') || url === '#') {
        return { broken: false, reason: 'dynamic' };
    }

    // Resolve relative path
    const dirPath = path.dirname(filePath);
    const resolvedPath = path.join(dirPath, url.split('?')[0].split('#')[0]);

    // Check if file exists
    if (!fs.existsSync(resolvedPath)) {
        return { broken: true, reason: `File not found: ${resolvedPath}` };
    }

    return { broken: false, reason: 'exists' };
}

/**
 * Check meta tags
 */
function checkMetaTags(content, filePath) {
    const issues = [];
    const relativePath = path.relative(ROOT_DIR, filePath);

    // Check charset
    if (!content.includes('<meta charset')) {
        issues.push({ file: relativePath, issue: 'Missing charset meta tag' });
    }

    // Check viewport
    if (!content.includes('name="viewport"')) {
        issues.push({ file: relativePath, issue: 'Missing viewport meta tag' });
    }

    // Check title
    const titleMatch = content.match(/<title>([^<]*)<\/title>/i);
    if (!titleMatch || !titleMatch[1].trim()) {
        issues.push({ file: relativePath, issue: 'Missing or empty title tag' });
    }

    // Check description
    const descMatch = content.match(/<meta[^>]*name="description"[^>]*>/gi);
    if (!descMatch) {
        issues.push({ file: relativePath, issue: 'Missing description meta tag' });
    } else if (descMatch.length > 1) {
        issues.push({ file: relativePath, issue: 'Duplicate description meta tags' });
    }

    // Check canonical
    if (!content.includes('rel="canonical"')) {
        issues.push({ file: relativePath, issue: 'Missing canonical link' });
    }

    // Check og:title
    if (!content.includes('property="og:title"')) {
        issues.push({ file: relativePath, issue: 'Missing og:title meta tag' });
    }

    // Check og:image
    if (!content.includes('property="og:image"')) {
        issues.push({ file: relativePath, issue: 'Missing og:image meta tag' });
    }

    // Check favicon
    if (!content.includes('rel="icon"') && !content.includes('rel="shortcut icon"')) {
        issues.push({ file: relativePath, issue: 'Missing favicon link' });
    }

    return issues;
}

/**
 * Check accessibility issues
 */
function checkAccessibility(content, filePath) {
    const issues = [];
    const relativePath = path.relative(ROOT_DIR, filePath);
    const lines = content.split('\n');

    // Check for images without alt
    const imgPattern = /<img[^>]*>/gi;
    let match;
    while ((match = imgPattern.exec(content)) !== null) {
        const imgTag = match[0];
        if (!imgTag.includes('alt=')) {
            const lineNum = getLineNumber(content, match.index);
            issues.push({
                file: relativePath,
                line: lineNum,
                issue: 'Image missing alt attribute',
                code: imgTag.substring(0, 80)
            });
        }
    }

    // Check for inputs without labels
    const inputPattern = /<input[^>]*>/gi;
    while ((match = inputPattern.exec(content)) !== null) {
        const inputTag = match[0];

        // Skip hidden, submit, button types
        if (inputTag.includes('type="hidden"') || inputTag.includes('type="submit"') ||
            inputTag.includes('type="button"')) {
            continue;
        }

        // Check if has aria-label or id that matches a label
        const hasAriaLabel = inputTag.includes('aria-label') || inputTag.includes('aria-labelledby');
        const hasId = inputTag.includes('id="');

        if (!hasAriaLabel) {
            const lineNum = getLineNumber(content, match.index);
            issues.push({
                file: relativePath,
                line: lineNum,
                issue: 'Input missing label or aria-label',
                code: inputTag.substring(0, 80)
            });
        }
    }

    // Check for buttons without text/content
    const buttonPattern = /<button[^>]*>([\s\S]*?)<\/button>/gi;
    while ((match = buttonPattern.exec(content)) !== null) {
        const buttonContent = match[1].trim();
        const buttonTag = match[0];

        // Check if has aria-label
        if (!buttonTag.includes('aria-label') && !buttonContent && !buttonTag.includes('<span') && !buttonTag.includes('<i')) {
            const lineNum = getLineNumber(content, match.index);
            issues.push({
                file: relativePath,
                line: lineNum,
                issue: 'Button may be empty or missing accessible text',
                code: buttonTag.substring(0, 80)
            });
        }
    }

    // Check for missing main landmark
    if (!content.includes('<main') && !content.includes('role="main"')) {
        issues.push({
            file: relativePath,
            line: 1,
            issue: 'Missing <main> landmark',
            code: 'Page structure'
        });
    }

    // Check for missing nav landmark
    if (!content.includes('<nav') && !content.includes('role="navigation"')) {
        issues.push({
            file: relativePath,
            line: 1,
            issue: 'Missing <nav> landmark',
            code: 'Page structure'
        });
    }

    // Check for missing header landmark
    if (!content.includes('<header') && !content.includes('role="banner"')) {
        issues.push({
            file: relativePath,
            line: 1,
            issue: 'Missing <header> landmark',
            code: 'Page structure'
        });
    }

    // Check for language attribute
    if (!content.includes('<html lang=')) {
        issues.push({
            file: relativePath,
            line: 1,
            issue: 'Missing lang attribute on <html>',
            code: '<html> tag'
        });
    }

    return issues;
}

/**
 * Process single file
 */
function processFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(ROOT_DIR, filePath);

    // Check links
    const links = findLinks(content, filePath);
    results.summary.totalLinks += links.length;

    for (const link of links) {
        const check = isLinkBroken(link, filePath);
        if (check.broken) {
            results.brokenLinks.push({
                file: relativePath,
                line: link.line,
                url: link.url,
                type: link.type,
                reason: check.reason
            });
            results.summary.brokenLinks++;
        }
    }

    // Check meta tags
    const metaIssues = checkMetaTags(content, filePath);
    results.missingMeta.push(...metaIssues);
    results.summary.missingMeta += metaIssues.length;

    // Check accessibility
    const a11yIssues = checkAccessibility(content, filePath);
    results.accessibilityIssues.push(...a11yIssues);
    results.summary.accessibilityIssues += a11yIssues.length;

    results.filesProcessed.push(relativePath);
    results.summary.totalFiles++;
}

/**
 * Generate report
 */
function generateReport() {
    const report = `# Comprehensive Audit Report

**Date:** ${new Date().toISOString().split('T')[0]}
**Scope:** sadec-marketing-hub
**Files Scanned:** ${results.summary.totalFiles}

---

## Summary

| Category | Count |
|----------|-------|
| Total Files | ${results.summary.totalFiles} |
| Total Links | ${results.summary.totalLinks} |
| **Broken Links** | **${results.summary.brokenLinks}** |
| **Missing Meta Tags** | **${results.summary.missingMeta}** |
| **Accessibility Issues** | **${results.summary.accessibilityIssues}** |

---

## 🔴 Broken Links (${results.summary.brokenLinks})

${results.brokenLinks.length === 0 ? '✅ No broken links found!' : results.brokenLinks.map(item => `
| File | Line | Type | URL | Reason |
|------|------|------|-----|--------|
| ${item.file} | ${item.line} | ${item.type} | ${item.url} | ${item.reason} |
`).join('\n')}

---

## 📋 Missing Meta Tags (${results.summary.missingMeta})

${results.summary.missingMeta === 0 ? '✅ All meta tags present!' : groupByFile(results.missingMeta)}

---

## ♿ Accessibility Issues (${results.summary.accessibilityIssues})

${results.summary.accessibilityIssues === 0 ? '✅ No accessibility issues found!' : groupByFile(results.accessibilityIssues, true)}

---

## Recommendations

### High Priority
1. **Fix broken links** - Update or remove ${results.summary.brokenLinks} broken links
2. **Add missing labels** - Fix ${results.accessibilityIssues.filter(i => i.issue.includes('label')).length} input labels for WCAG compliance

### Medium Priority
3. **Add missing meta tags** - Add ${results.summary.missingMeta} meta tags for SEO
4. **Add landmarks** - Add <main>, <nav>, <header> for screen readers

### Low Priority
5. **Add alt attributes** - Add alt text to images
6. **Add lang attribute** - Ensure all pages have lang attribute

---

*Generated by Mekong CLI Comprehensive Audit Tool*
`;

    return report;
}

/**
 * Group issues by file
 */
function groupByFile(issues, includeDetails = false) {
    const grouped = {};

    issues.forEach(issue => {
        if (!grouped[issue.file]) {
            grouped[issue.file] = [];
        }
        grouped[issue.file].push(issue);
    });

    let output = '';
    Object.entries(grouped).forEach(([file, fileIssues]) => {
        output += `### ${file}\n\n`;
        fileIssues.forEach(issue => {
            if (includeDetails) {
                output += `- Line ${issue.line}: ${issue.issue}\n`;
                if (issue.code) {
                    output += `  \`${issue.code}\`\n`;
                }
            } else {
                output += `- ${issue.issue}\n`;
            }
        });
        output += '\n';
    });

    return output;
}

/**
 * Main function
 */
function main() {

    const htmlFiles = getHtmlFiles(ROOT_DIR);

    let processed = 0;
    for (const filePath of htmlFiles) {
        processed++;
        const relativePath = path.relative(ROOT_DIR, filePath);

        try {
            processFile(filePath);

            if (processed % 20 === 0) {
            }
        } catch (err) {
        }
    }

    // Generate report
    const report = generateReport();

    // Save report
    if (!fs.existsSync(REPORTS_DIR)) {
        fs.mkdirSync(REPORTS_DIR, { recursive: true });
    }

    const reportPath = path.join(REPORTS_DIR, 'comprehensive-audit-' + new Date().toISOString().split('T')[0] + '.md');
    fs.writeFileSync(reportPath, report);

    // Print summary
}

// Run
main();

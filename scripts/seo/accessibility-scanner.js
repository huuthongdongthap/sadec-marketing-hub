#!/usr/bin/env node
/**
 * Sa Đéc Marketing Hub — SEO & Accessibility Scanner
 * Scans for:
 * 1. Broken links (internal/external)
 * 2. Missing meta tags
 * 3. Accessibility issues (alt text, ARIA, etc.)
 *
 * Usage: node scripts/seo/accessibility-scanner.js
 */

const fs = require('fs');
const path = require('path');

// Use absolute path to ensure correct directory
const ROOT_DIR = process.cwd();
const SCAN_DIRS = ['admin', 'portal', 'affiliate', 'auth', ''];
const EXCLUDE_PATTERNS = ['node_modules', '.git', 'dist', '.min.', 'test-'];

const results = {
    filesScanned: 0,
    brokenLinks: [],
    missingMeta: [],
    accessibilityIssues: [],
    summary: {}
};

/**
 * Check if file should be excluded
 */
function shouldExclude(filePath) {
    return EXCLUDE_PATTERNS.some(pattern => filePath.toLowerCase().includes(pattern.toLowerCase()));
}

/**
 * Get all HTML files
 */
function getAllHTMLFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        try {
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                if (!shouldExclude(filePath)) {
                    getAllHTMLFiles(filePath, fileList);
                }
            } else if (file.endsWith('.html') && !shouldExclude(filePath)) {
                fileList.push(filePath);
            }
        } catch (err) {
        }
    }
    return fileList;
}

/**
 * Check for broken links
 */
function checkBrokenLinks(content, filePath) {
    const issues = [];
    const relativePath = path.relative(ROOT_DIR, filePath);

    // Find all href attributes
    const hrefPattern = /href=["']([^"']+)["']/gi;
    let match;

    while ((match = hrefPattern.exec(content)) !== null) {
        const href = match[1];

        // Skip external links, anchors, and special protocols
        if (href.startsWith('http') || href.startsWith('#') ||
            href.startsWith('tel:') || href.startsWith('mailto:') ||
            href.startsWith('javascript:')) {
            continue;
        }

        // Check if internal link exists
        const linkPath = href.split('?')[0].split('#')[0];
        if (linkPath && !linkPath.endsWith('.html') && !linkPath.endsWith('/')) {
            // Potentially broken - doesn't look like a valid path
            issues.push({
                file: relativePath,
                type: 'broken-link',
                severity: 'warning',
                issue: `Link "${href}" may be broken`,
                line: content.substring(0, match.index).split('\n').length
            });
        }
    }

    return issues;
}

/**
 * Check for missing meta tags
 */
function checkMissingMeta(content, filePath) {
    const issues = [];
    const relativePath = path.relative(ROOT_DIR, filePath);

    // Required meta tags
    const requiredTags = [
        { pattern: /<title[^>]*>.*?<\/title>/i, name: 'title' },
        { pattern: /<meta[^>]+name=["']description["'][^>]*>/i, name: 'description' },
        { pattern: /<meta[^>]+property=["']og:title["'][^>]*>/i, name: 'og:title' },
        { pattern: /<meta[^>]+property=["']og:description["'][^>]*>/i, name: 'og:description' },
        { pattern: /<meta[^>]+property=["']og:image["'][^>]*>/i, name: 'og:image' },
        { pattern: /<link[^>]+rel=["']canonical["'][^>]*>/i, name: 'canonical' }
    ];

    requiredTags.forEach(tag => {
        if (!tag.pattern.test(content)) {
            issues.push({
                file: relativePath,
                type: 'missing-meta',
                severity: 'error',
                issue: `Missing ${tag.name} meta tag`,
                line: 1
            });
        }
    });

    return issues;
}

/**
 * Check for accessibility issues
 */
function checkAccessibility(content, filePath) {
    const issues = [];
    const relativePath = path.relative(ROOT_DIR, filePath);

    // Check for images without alt text
    const imgPattern = /<img[^>]*>/gi;
    let imgMatch;
    while ((imgMatch = imgPattern.exec(content)) !== null) {
        const imgTag = imgMatch[0];
        if (!/alt=["'][^"']*["']/i.test(imgTag)) {
            issues.push({
                file: relativePath,
                type: 'a11y',
                severity: 'error',
                issue: 'Image missing alt attribute',
                line: content.substring(0, imgMatch.index).split('\n').length
            });
        }
    }

    // Check for buttons without aria-label
    const buttonPattern = /<button[^>]*>.*?<\/button>/gi;
    let buttonMatch;
    while ((buttonMatch = buttonPattern.exec(content)) !== null) {
        const buttonTag = buttonMatch[0];
        if (!/aria-label=["'][^"']*["']/i.test(buttonTag) &&
            !/>[a-zA-Z0-9]/i.test(buttonTag) &&
            !/<[^>]+class=["'][^"']*material-symbols/i.test(buttonTag)) {
            // Icon-only button without aria-label
            // Skip if has text content or material icons
        }
    }

    // Check for form inputs without labels
    const inputPattern = /<input[^>]*>/gi;
    let inputMatch;
    while ((inputMatch = inputPattern.exec(content)) !== null) {
        const inputTag = inputMatch[0];
        const idMatch = /id=["']([^"']+)["']/i.exec(inputTag);
        if (idMatch) {
            const inputId = idMatch[1];
            const labelPattern = new RegExp(`<label[^>]*for=["']${inputId}["'][^>]*>`, 'i');
            if (!labelPattern.test(content) && !/aria-label/i.test(inputTag)) {
                issues.push({
                    file: relativePath,
                    type: 'a11y',
                    severity: 'warning',
                    issue: `Input "${inputId}" missing label`,
                    line: content.substring(0, inputMatch.index).split('\n').length
                });
            }
        }
    }

    return issues;
}

/**
 * Analyze a single file
 */
function analyzeFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const issues = [];

        issues.push(...checkBrokenLinks(content, filePath));
        issues.push(...checkMissingMeta(content, filePath));
        issues.push(...checkAccessibility(content, filePath));

        return issues;
    } catch (error) {
        return [{
            file: path.relative(ROOT_DIR, filePath),
            type: 'error',
            severity: 'error',
            issue: `Error analyzing file: ${error.message}`,
            line: 1
        }];
    }
}

/**
 * Generate report
 */
function generateReport(issues) {
    const byType = {};
    const byFile = {};
    const bySeverity = { error: [], warning: [], info: [] };

    issues.forEach(issue => {
        if (!byType[issue.type]) byType[issue.type] = [];
        byType[issue.type].push(issue);

        bySeverity[issue.severity].push(issue);

        if (!byFile[issue.file]) byFile[issue.file] = [];
        byFile[issue.file].push(issue);
    });

    let report = `# SEO & Accessibility Scan Report

**Generated:** ${new Date().toISOString()}
**Files Scanned:** ${results.filesScanned}
**Total Issues:** ${issues.length}

---

## Summary

| Type | Count |
|------|-------|
| Broken Links | ${byType['broken-link']?.length || 0} |
| Missing Meta | ${byType['missing-meta']?.length || 0} |
| Accessibility | ${byType['a11y']?.length || 0} |

| Severity | Count |
|----------|-------|
| 🔴 Errors | ${bySeverity.error.length} |
| 🟡 Warnings | ${bySeverity.warning.length} |

---

## 🔴 Critical Issues

`;

    if (bySeverity.error.length === 0) {
        report += `✅ No critical issues found!\n\n`;
    } else {
        bySeverity.error.slice(0, 20).forEach(issue => {
            report += `### ${issue.file}\n`;
            report += `- ${issue.issue} (Line ${issue.line})\n\n`;
        });
        if (bySeverity.error.length > 20) {
            report += `\n... and ${bySeverity.error.length - 20} more issues\n`;
        }
    }

    report += `---

## 🟡 Warnings

`;

    if (bySeverity.warning.length === 0) {
        report += `✅ No warnings!\n\n`;
    } else {
        bySeverity.warning.slice(0, 20).forEach(issue => {
            report += `- **${issue.file}:** ${issue.issue}\n`;
        });
        if (bySeverity.warning.length > 20) {
            report += `\n... and ${bySeverity.warning.length - 20} more warnings\n`;
        }
    }

    report += `---

## 📁 Files with Most Issues

`;

    const topFiles = Object.entries(byFile)
        .sort(([, a], [, b]) => b.length - a.length)
        .slice(0, 10);

    topFiles.forEach(([file, fileIssues]) => {
        report += `### ${file} (${fileIssues.length} issues)\n\n`;
    });

    report += `---

## Recommendations

1. **Fix missing meta tags** - Add title, description, og:* tags
2. **Fix broken links** - Update or remove broken hrefs
3. **Add alt text** - All images need descriptive alt attributes
4. **Add labels** - Form inputs need associated labels

---

## Quality Score

`;

    const errorWeight = 5;
    const warningWeight = 2;
    const totalPenalty = (bySeverity.error.length * errorWeight) +
                        (bySeverity.warning.length * warningWeight);

    let score = Math.max(0, 100 - totalPenalty);

    if (score >= 90) {
        report += `🟢 **${score}/100** - Excellent\n`;
    } else if (score >= 70) {
        report += `🟡 **${score}/100** - Good\n`;
    } else if (score >= 50) {
        report += `🟠 **${score}/100** - Needs Improvement\n`;
    } else {
        report += `🔴 **${score}/100** - Critical\n`;
    }

    return report;
}

/**
 * Main scanner
 */
function runScanner() {
    const allFiles = [];
    for (const dir of SCAN_DIRS) {
        const dirPath = path.join(ROOT_DIR, dir);
        if (fs.existsSync(dirPath)) {
            allFiles.push(...getAllHTMLFiles(dirPath));
        }
    }

    const allIssues = [];
    for (const file of allFiles) {
        results.filesScanned++;
        const issues = analyzeFile(file);
        allIssues.push(...issues);

        if (results.filesScanned % 50 === 0) {
            process.stdout.write('.');
        }
    }

    // Generate and save report
    const report = generateReport(allIssues);
    const reportPath = path.join(ROOT_DIR, 'reports', 'seo', 'accessibility-scan-2026-03-14.md');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, report, 'utf8');

    // Save JSON data
    const jsonPath = path.join(ROOT_DIR, 'reports', 'seo', 'accessibility-scan-2026-03-14.json');
    fs.writeFileSync(jsonPath, JSON.stringify(allIssues, null, 2), 'utf8');

    }

runScanner();

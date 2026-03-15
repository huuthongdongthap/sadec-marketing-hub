#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SCAN ALL — Broken Links, Meta Tags, Accessibility Audit
 *
 * Script quét toàn diện: broken links, meta tags, accessibility
 * Usage: node scripts/scan/scan-all.js
 *
 * @version 1.0.0 | 2026-03-15
 */

import { readdir, readFile } from 'fs/promises';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..', '..');

// ============================================================================
// CONFIGURATION
// ============================================================================
const PATTERNS = {
    html: /\.html$/,
    exclude: /node_modules|dist|\.git|coverage/
};

function scanBrokenLinks(content) {
    const issues = [];
    const hrefMatches = content.match(/href\s*=\s*["'][^"']*["']/g) || [];

    hrefMatches.forEach(href => {
        if (href.includes('href="#"') || href.includes("href='#'") || href.includes('href="#!"')) {
            issues.push(`Empty/dead link: ${href}`);
        }
        if (href.includes('href=""') || href.includes("href=''")) {
            issues.push(`Empty href: ${href}`);
        }
    });

    return issues;
}

function scanMetaTags(content) {
    const missing = [];
    const required = [
        { pattern: /<meta\s+name\s*=\s*["']description["'][^>]*>/i, name: 'description' },
        { pattern: /<meta\s+property\s*=\s*["']og:title["'][^>]*>/i, name: 'og:title' },
        { pattern: /<meta\s+property\s*=\s*["']og:description["'][^>]*>/i, name: 'og:description' },
        { pattern: /<meta\s+property\s*=\s*["']og:image["'][^>]*>/i, name: 'og:image' }
    ];

    required.forEach(req => {
        if (!req.pattern.test(content)) {
            missing.push(req.name);
        }
    });

    return missing.length > 0 ? [`Missing meta tags: ${missing.join(', ')}`] : [];
}
    accessibility: {
        checks: [
            {
                name: 'Missing alt attributes',
                pattern: /<img\s+[^>]*>/gi,
                validate: (tag) => /\salt\s*=\s*["'][^"']*["']/i.test(tag)
            },
            {
                name: 'Missing ARIA labels on buttons',
                pattern: /<button\s+[^>]*>/gi,
                validate: (tag) => /\saria-label\s*=\s*["'][^"']*["']/i.test(tag) || /\saria-labelledby\s*=\s*["'][^"']*["']/i.test(tag)
            },
            {
                name: 'Missing role attributes',
                pattern: /<(div|span)\s+[^>]*onclick[^>]*>/gi,
                validate: (tag) => /\srole\s*=\s*["'][^"']*["']/i.test(tag)
            }
        ],
        check: (content) => {
            const issues = [];
            SCAN_CONFIG.accessibility.checks.forEach(check => {
                const matches = content.match(check.pattern) || [];
                const invalid = matches.filter(tag => !check.validate(tag));
                if (invalid.length > 0) {
                    issues.push(`${check.name}: ${invalid.length} instances`);
                }
            });
            return issues;
        }
    }
};

// ============================================================================
// SCANNER FUNCTIONS
// ============================================================================

/**
 * Get all HTML files recursively
 */
async function getHtmlFiles(dir, baseDir = dir) {
    const files = [];

    try {
        const entries = await readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = join(dir, entry.name);

            if (PATTERNS.exclude.test(fullPath)) continue;

            if (entry.isDirectory()) {
                files.push(...await getHtmlFiles(fullPath, baseDir));
            } else if (PATTERNS.html.test(entry.name)) {
                files.push(relative(baseDir, fullPath));
            }
        }
    } catch (error) {
        console.error(`Error reading ${dir}:`, error.message);
    }

    return files;
}

/**
 * Scan single file for all issues
 */
async function scanFile(filePath) {
    const fullPath = join(ROOT_DIR, filePath);

    try {
        const content = await readFile(fullPath, 'utf-8');
        const issues = {
            file: filePath,
            brokenLinks: [],
            metaTags: [],
            accessibility: []
        };

        // Scan broken links
        issues.brokenLinks = SCAN_CONFIG.brokenLinks.check(content);

        // Scan meta tags
        issues.metaTags = SCAN_CONFIG.metaTags.check(content, filePath);

        // Scan accessibility
        issues.accessibility = SCAN_CONFIG.accessibility.check(content);

        return issues;
    } catch (error) {
        console.error(`Error scanning ${filePath}:`, error.message);
        return null;
    }
}

/**
 * Generate markdown report
 */
function generateReport(results) {
    const totalFiles = results.length;
    const filesWithIssues = results.filter(r =>
        r.brokenLinks.length > 0 ||
        r.metaTags.length > 0 ||
        r.accessibility.length > 0
    ).length;

    const totalIssues = {
        brokenLinks: results.reduce((sum, r) => sum + r.brokenLinks.length, 0),
        metaTags: results.reduce((sum, r) => sum + r.metaTags.length, 0),
        accessibility: results.reduce((sum, r) => sum + r.accessibility.length, 0)
    };

    let report = `# Scan Report — Broken Links, Meta Tags, Accessibility

**Date:** ${new Date().toISOString().split('T')[0]}
**Scope:** ${totalFiles} HTML files scanned

---

## 📊 Summary

| Category | Issues | Status |
|----------|--------|--------|
| Broken Links | ${totalIssues.brokenLinks} | ${totalIssues.brokenLinks === 0 ? '✅' : '⚠️'} |
| Missing Meta Tags | ${totalIssues.metaTags} | ${totalIssues.metaTags === 0 ? '✅' : '⚠️'} |
| Accessibility | ${totalIssues.accessibility} | ${totalIssues.accessibility === 0 ? '✅' : '⚠️'} |
| Files with Issues | ${filesWithIssues}/${totalFiles} | ${filesWithIssues === 0 ? '✅' : '⚠️'} |

---

## 🔗 Broken Links

${results.filter(r => r.brokenLinks.length > 0).map(r => `### ${r.file}\n\n${r.brokenLinks.map(issue => `- ${issue}`).join('\n')}`).join('\n\n') || '✅ No broken links found'}

---

## 🏷️ Missing Meta Tags

${results.filter(r => r.metaTags.length > 0).map(r => `### ${r.file}\n\n${r.metaTags.map(issue => `- ${issue}`).join('\n')}`).join('\n\n') || '✅ All meta tags present'}

---

## ♿ Accessibility Issues

${results.filter(r => r.accessibility.length > 0).map(r => `### ${r.file}\n\n${r.accessibility.map(issue => `- ${issue}`).join('\n')}`).join('\n\n') || '✅ No accessibility issues found'}

---

## ✅ Recommendations

${totalIssues.brokenLinks > 0 ? '1. Replace empty href="#" with actual URLs or use href="javascript:void(0)"' : ''}
${totalIssues.metaTags > 0 ? `${totalIssues.brokenLinks > 0 ? '2.' : '1.'} Add missing meta tags for SEO and social sharing` : ''}
${totalIssues.accessibility > 0 ? `${totalIssues.brokenLinks > 0 && totalIssues.metaTags > 0 ? '3.' : totalIssues.brokenLinks > 0 || totalIssues.metaTags > 0 ? '2.' : '1.'} Add alt attributes to images and ARIA labels to interactive elements` : ''}
${totalIssues.brokenLinks === 0 && totalIssues.metaTags === 0 && totalIssues.accessibility === 0 ? 'All checks passed! No issues found.' : ''}

---

*Generated by scan-all.js*
`;

    return report;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
    console.log('🔍 Starting comprehensive scan...\n');

    // Get all HTML files
    console.log('📁 Scanning for HTML files...');
    const htmlFiles = await getHtmlFiles(ROOT_DIR);
    console.log(`   Found ${htmlFiles.length} HTML files\n`);

    // Scan each file
    console.log('🔬 Scanning files for issues...');
    const results = [];

    for (let i = 0; i < htmlFiles.length; i++) {
        const file = htmlFiles[i];
        const result = await scanFile(file);
        if (result) results.push(result);

        if ((i + 1) % 50 === 0) {
            console.log(`   Progress: ${i + 1}/${htmlFiles.length} files`);
        }
    }

    // Generate report
    console.log('\n📝 Generating report...\n');
    const report = generateReport(results);

    // Write report
    const reportPath = join(ROOT_DIR, 'reports', 'scan', 'scan-report.md');
    const { mkdir, writeFile } = await import('fs/promises');
    await mkdir(join(ROOT_DIR, 'reports', 'scan'), { recursive: true });
    await writeFile(reportPath, report);

    console.log(`✅ Report written to: ${reportPath}`);
    console.log('\n' + '='.repeat(60) + '\n');
    console.log(report.split('\n').slice(0, 20).join('\n'));
    console.log('\n... (see full report for details)');
}

main().catch(console.error);

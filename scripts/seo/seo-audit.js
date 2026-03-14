/**
 * SEO Metadata Audit Script
 * Quét tất cả HTML files và kiểm tra SEO metadata
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..', '..');

const CHECKS = {
    required: [
        { pattern: /<meta charset="UTF-8">/i, name: 'charset' },
        { pattern: /<meta name="viewport"/i, name: 'viewport' },
        { pattern: /<title>.*<\/title>/i, name: 'title' },
        { pattern: /<meta name="description"/i, name: 'description' },
    ],
    recommended: [
        { pattern: /<meta property="og:title"/i, name: 'og:title' },
        { pattern: /<meta property="og:description"/i, name: 'og:description' },
        { pattern: /<meta property="og:type"/i, name: 'og:type' },
        { pattern: /<meta property="og:url"/i, name: 'og:url' },
        { pattern: /<meta property="og:image"/i, name: 'og:image' },
        { pattern: /<meta name="twitter:card"/i, name: 'twitter:card' },
        { pattern: /<link rel="canonical"/i, name: 'canonical' },
    ],
    accessibility: [
        { pattern: /<html[^>]*lang=/i, name: 'html lang' },
        { pattern: /<main[^>]*id=/i, name: 'main landmark' },
        { pattern: /<a[^>]*class="skip-link"/i, name: 'skip link' },
    ]
};

function getAllHtmlFiles(dir, files = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            // Skip node_modules, coverage, and other auto-generated dirs
            if (!entry.name.startsWith('.') &&
                entry.name !== 'node_modules' &&
                entry.name !== 'coverage' &&
                entry.name !== 'playwright-report') {
                getAllHtmlFiles(fullPath, files);
            }
        } else if (entry.isFile() && entry.name.endsWith('.html')) {
            const relPath = path.relative(rootDir, fullPath);
            // Skip auto-generated files
            if (!relPath.includes('node_modules') &&
                !relPath.includes('coverage/') &&
                !relPath.includes('playwright-report/')) {
                files.push({ path: fullPath, relPath });
            }
        }
    }

    return files;
}

function checkFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const results = {
        required: [],
        recommended: [],
        accessibility: []
    };

    // Check required
    for (const check of CHECKS.required) {
        const found = check.pattern.test(content);
        results.required.push({ name: check.name, ok: found });
    }

    // Check recommended
    for (const check of CHECKS.recommended) {
        const found = check.pattern.test(content);
        results.recommended.push({ name: check.name, ok: found });
    }

    // Check accessibility
    for (const check of CHECKS.accessibility) {
        const found = check.pattern.test(content);
        results.accessibility.push({ name: check.name, ok: found });
    }

    return results;
}

function generateReport(allResults) {
    const summary = {
        total: allResults.length,
        passRequired: 0,
        passRecommended: 0,
        passAccessibility: 0,
        issues: []
    };

    const missingByFile = {};

    for (const { relPath, results } of allResults) {
        const requiredMissing = results.required.filter(r => !r.ok).map(r => r.name);
        const recommendedMissing = results.recommended.filter(r => !r.ok).map(r => r.name);
        const accessibilityMissing = results.accessibility.filter(r => !r.ok).map(r => r.name);

        if (requiredMissing.length === 0) summary.passRequired++;
        if (recommendedMissing.length === 0) summary.passRecommended++;
        if (accessibilityMissing.length === 0) summary.passAccessibility++;

        const allMissing = [...requiredMissing, ...recommendedMissing, ...accessibilityMissing];
        if (allMissing.length > 0) {
            missingByFile[relPath] = {
                required: requiredMissing,
                recommended: recommendedMissing,
                accessibility: accessibilityMissing
            };
        }
    }

    return { summary, missingByFile };
}

function generateMarkdown(report) {
    const { summary, missingByFile } = report;

    let md = `# 🔍 SEO Metadata Audit Report

**Date:** ${new Date().toISOString().split('T')[0]}
**Files Scanned:** ${summary.total}

---

## 📊 SUMMARY

| Category | Pass | Total | Percentage |
|----------|------|-------|------------|
| **Required** | ${summary.passRequired} | ${summary.total} | ${((summary.passRequired / summary.total) * 100).toFixed(1)}% |
| **Recommended (SEO)** | ${summary.passRecommended} | ${summary.total} | ${((summary.passRecommended / summary.total) * 100).toFixed(1)}% |
| **Accessibility** | ${summary.passAccessibility} | ${summary.total} | ${((summary.passAccessibility / summary.total) * 100).toFixed(1)}% |

---

## ✅ STATUS

${summary.passRequired === summary.total ? '✅ All files have required metadata' : `🔴 ${summary.total - summary.passRequired} files missing required metadata`}
${summary.passRecommended === summary.total ? '✅ All files have recommended SEO tags' : `🟡 ${summary.total - summary.passRecommended} files missing recommended SEO tags`}
${summary.passAccessibility === summary.total ? '✅ All files have accessibility features' : `🟠 ${summary.total - summary.passAccessibility} files missing accessibility features`}

---

## 📋 ISSUES BY FILE

`;

    for (const [file, issues] of Object.entries(missingByFile)) {
        const allIssues = [
            ...issues.required.map(i => `🔴 ${i}`),
            ...issues.recommended.map(i => `🟡 ${i}`),
            ...issues.accessibility.map(i => `🟠 ${i}`)
        ];

        if (allIssues.length > 0) {
            md += `### ${file}\n\n`;
            for (const issue of allIssues) {
                md += `- ${issue}\n`;
            }
            md += '\n';
        }
    }

    if (Object.keys(missingByFile).length === 0) {
        md += '**All files pass all checks!** ✅\n\n';
    }

    md += `---

## 🔧 REQUIRED METADATA

Every HTML file should have:

1. **<!DOCTYPE html>** - HTML5 doctype
2. **<html lang="vi">** - Language attribute
3. **<meta charset="UTF-8">** - Character encoding
4. **<meta name="viewport">** - Responsive viewport
5. **<title>** - Page title (50-60 chars)
6. **<meta name="description">** - Meta description (120-160 chars)

## 🎯 RECOMMENDED SEO TAGS

1. **Open Graph Tags:**
   - og:title
   - og:description
   - og:type (website/article)
   - og:url (canonical URL)
   - og:image (1200x630px)

2. **Twitter Card:**
   - twitter:card (summary_large_image)
   - twitter:title
   - twitter:description
   - twitter:image

3. **Canonical URL:**
   - <link rel="canonical" href="...">

## ♿ ACCESSIBILITY

1. **Skip Link:** <a href="#main" class="skip-link">
2. **Main Landmark:** <main id="main">
3. **ARIA Labels:** For icons and interactive elements

---

*Generated by: scripts/seo/seo-audit.js*
`;

    return md;
}

// Main execution
const htmlFiles = getAllHtmlFiles(rootDir);
const results = htmlFiles.map(f => ({
    relPath: f.relPath,
    results: checkFile(f.path)
}));

const report = generateReport(results);
const markdown = generateMarkdown(report);

// Save report
const reportDir = path.join(rootDir, 'reports', 'seo');
fs.mkdirSync(reportDir, { recursive: true });
const reportPath = path.join(reportDir, `seo-audit-${new Date().toISOString().split('T')[0]}.md`);
fs.writeFileSync(reportPath, markdown);


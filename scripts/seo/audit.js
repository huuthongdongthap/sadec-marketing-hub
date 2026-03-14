#!/usr/bin/env node

/**
 * SEO Metadata Audit Script
 * Quét toàn bộ HTML files và kiểm tra SEO metadata
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const EXCLUDED_DIRS = ['node_modules', '.git', '.wrangler', 'dist', 'releases', 'reports'];

// SEO metadata requirements
const REQUIRED_TAGS = {
    title: /<title[^>]*>[\s\S]*?<\/title>/i,
    description: /<meta[^>]*name=["']description["'][^>]*>/i,
    ogTitle: /<meta[^>]*property=["']og:title["'][^>]*>/i,
    ogDescription: /<meta[^>]*property=["']og:description["'][^>]*>/i,
    ogImage: /<meta[^>]*property=["']og:image["'][^>]*>/i,
    ogUrl: /<meta[^>]*property=["']og:url["'][^>]*>/i,
    twitterCard: /<meta[^>]*name=["']twitter:card["'][^>]*>/i,
    canonical: /<link[^>]*rel=["']canonical["'][^>]*>/i,
    jsonLd: /<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/i
};

// Find all HTML files
function findHtmlFiles(dir, files = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        // Skip excluded directories
        if (entry.isDirectory() && EXCLUDED_DIRS.includes(entry.name)) {
            continue;
        }

        if (entry.isDirectory()) {
            findHtmlFiles(fullPath, files);
        } else if (entry.isFile() && entry.name.endsWith('.html')) {
            files.push(fullPath);
        }
    }

    return files;
}

// Check SEO metadata in file
function checkSeoMetadata(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const results = {
        file: path.relative(ROOT_DIR, filePath),
        tags: {},
        missing: [],
        score: 0
    };

    // Check each required tag
    for (const [key, regex] of Object.entries(REQUIRED_TAGS)) {
        const found = regex.test(content);
        results.tags[key] = found;
        if (!found) {
            results.missing.push(key);
        }
    }

    // Calculate score
    const total = Object.keys(REQUIRED_TAGS).length;
    results.score = Math.round(((total - results.missing.length) / total) * 100);

    return results;
}

// Extract title from file
function extractTitle(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const match = content.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    return match ? match[1].trim() : 'N/A';
}

// Main audit function
function auditSeo() {
    console.log('🔍 SEO Metadata Audit\n');
    console.log('=' .repeat(70));

    const htmlFiles = findHtmlFiles(ROOT_DIR);
    const results = htmlFiles.map(checkSeoMetadata);

    // Sort by score (worst first)
    results.sort((a, b) => a.score - b.score);

    // Summary statistics
    const totalFiles = results.length;
    const perfectScore = results.filter(r => r.score === 100).length;
    const avgScore = Math.round(results.reduce((sum, r) => sum + r.score, 0) / totalFiles);

    // Report files with missing tags
    console.log('\n📋 Files Missing SEO Tags:\n');

    let issueCount = 0;
    for (const result of results) {
        if (result.missing.length > 0) {
            issueCount++;
            const title = extractTitle(path.join(ROOT_DIR, result.file));
            console.log(`\n❌ ${result.file}`);
            console.log(`   Title: ${title}`);
            console.log(`   Score: ${result.score}/100`);
            console.log(`   Missing: ${result.missing.join(', ')}`);
        }
    }

    if (issueCount === 0) {
        console.log('✅ All files have complete SEO metadata!');
    }

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('\n📊 Summary:\n');
    console.log(`   Total HTML files: ${totalFiles}`);
    console.log(`   Perfect SEO (100/100): ${perfectScore} (${Math.round(perfectScore/totalFiles*100)}%)`);
    console.log(`   Files with issues: ${issueCount}`);
    console.log(`   Average score: ${avgScore}/100`);

    // Recommendations
    console.log('\n📝 Recommendations:\n');

    if (issueCount > 0) {
        console.log('   1. Add missing meta tags to flagged files');
        console.log('   2. Ensure each page has unique title & description');
        console.log('   3. Add JSON-LD structured data for better SEO');
        console.log('   4. Set proper canonical URLs');
    } else {
        console.log('   ✅ All files follow SEO best practices');
        console.log('   ✅ Consider adding more specific JSON-LD types per page');
    }

    // Generate report file
    const reportPath = path.join(ROOT_DIR, '.cto-reports', 'seo-audit-' + new Date().toISOString().split('T')[0] + '.md');
    generateReport(results, reportPath);

    console.log(`\n📄 Full report: ${path.relative(ROOT_DIR, reportPath)}\n`);
}

// Generate markdown report
function generateReport(results, reportPath) {
    const date = new Date().toISOString().split('T')[0];
    const totalFiles = results.length;
    const perfectScore = results.filter(r => r.score === 100).length;
    const avgScore = Math.round(results.reduce((sum, r) => sum + r.score, 0) / totalFiles);

    let markdown = `# SEO Audit Report — Sa Đéc Marketing Hub

**Date:** ${date}
**Scope:** All HTML pages
**Status:** ${perfectScore === totalFiles ? '✅ COMPLETE' : '⚠️ NEEDS ATTENTION'}

---

## 📊 Executive Summary

| Metric | Value | Status |
|--------|-------|--------|
| Total HTML Files | ${totalFiles} | - |
| Perfect SEO Score | ${perfectScore} (${Math.round(perfectScore/totalFiles*100)}%) | ${perfectScore === totalFiles ? '✅' : '⚠️'} |
| Average Score | ${avgScore}/100 | ${avgScore >= 90 ? '✅' : '⚠️'} |
| Files with Issues | ${totalFiles - perfectScore} | ${totalFiles === perfectScore ? '✅' : '⚠️'} |

---

## 🔍 SEO Requirements

| Tag | Priority | Description |
|-----|----------|-------------|
| \`<title>\` | Critical | Page title for search results |
| \`<meta name="description">\` | High | Meta description for SERP |
| \`<meta property="og:title">\` | High | Open Graph title for social |
| \`<meta property="og:description">\` | High | Open Graph description |
| \`<meta property="og:image">\` | Medium | Social share image |
| \`<meta property="og:url">\` | Medium | Canonical URL for OG |
| \`<meta name="twitter:card">\` | Medium | Twitter card type |
| \`<link rel="canonical">\` | High | Canonical URL |
| \`<script type="application/ld+json">\` | Medium | Structured data |

---

## ❌ Files Missing SEO Tags

`;

    for (const result of results) {
        if (result.missing.length > 0) {
            const title = extractTitle(path.join(ROOT_DIR, result.file));
            markdown += `### ${result.file}\n\n`;
            markdown += `- **Title:** ${title}\n`;
            markdown += `- **Score:** ${result.score}/100\n`;
            markdown += `- **Missing:** ${result.missing.join(', ')}\n\n`;
        }
    }

    if (results.every(r => r.score === 100)) {
        markdown += `✅ All files have complete SEO metadata!\n\n`;
    }

    markdown += `---

## ✅ Files with Perfect SEO

`;

    for (const result of results) {
        if (result.score === 100) {
            const title = extractTitle(path.join(ROOT_DIR, result.file));
            markdown += `- \`${result.file}\` — ${title}\n`;
        }
    }

    markdown += `
---

## 📝 Recommendations

`;

    if (totalFiles > perfectScore) {
        markdown += `1. Add missing meta tags to flagged files
2. Ensure each page has unique title & description
3. Add JSON-LD structured data for better SEO
4. Set proper canonical URLs
5. Review and update og:image for social sharing
`;
    } else {
        markdown += `1. ✅ All files follow SEO best practices
2. Consider adding more specific JSON-LD types per page
3. Review meta descriptions for keyword optimization
4. Ensure unique titles across all pages
`;
    }

    markdown += `
---

## 🔧 Script Usage

\`\`\`bash
# Run SEO audit
node scripts/seo/audit.js

# Add metadata to specific file
node scripts/seo/add-meta-tags.js admin/page.html
\`\`\`

---

_Report generated by Mekong CLI SEO Audit Script_
`;

    // Ensure directory exists
    const dir = path.dirname(reportPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(reportPath, markdown);
}

// Helper to extract title
function extractTitle(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const match = content.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
        return match ? match[1].trim() : 'N/A';
    } catch {
        return 'N/A';
    }
}

// Run audit
auditSeo();

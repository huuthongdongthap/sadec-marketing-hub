#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SA ĐÉC MARKETING HUB — COMPREHENSIVE AUDIT SCRIPT
 * Quét: Broken Links, Meta Tags, Accessibility Issues
 *
 * Usage: node scripts/audit/comprehensive-audit.js
 * Output: reports/audit/comprehensive-audit-YYYY-MM-DD.md
 * ═══════════════════════════════════════════════════════════════════════════
 */

const fs = require('fs');
const path = require('path');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '../..');
const SCAN_DIRS = ['admin', 'portal', 'affiliate', 'auth', ''];
const EXCLUDE_PATTERNS = ['node_modules', '.git', 'dist', '.min.'];
const OUTPUT_DIR = path.join(ROOT_DIR, 'reports', 'audit');

// Audit results
const auditResults = {
  summary: {
    totalFiles: 0,
    totalIssues: 0,
    critical: 0,
    warning: 0,
    info: 0
  },
  brokenLinks: [],
  metaTags: [],
  accessibility: [],
  performance: [],
  seo: []
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
function getAllHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);

    try {
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        if (!shouldExclude(filePath)) {
          getAllHtmlFiles(filePath, fileList);
        }
      } else if (file.endsWith('.html') && !shouldExclude(filePath)) {
        fileList.push(filePath);
      }
    } catch (err) {
      // Skip invalid files
    }
  }

  return fileList;
}

/**
 * Parse HTML and extract metadata
 */
function parseHtml(content, filePath) {
  const issues = [];
  const relativePath = path.relative(ROOT_DIR, filePath);

  // Check DOCTYPE
  if (!content.startsWith('<!DOCTYPE html>')) {
    issues.push({
      type: 'critical',
      category: 'html',
      file: relativePath,
      line: 1,
      issue: 'Missing or incorrect DOCTYPE declaration',
      fix: 'Add <!DOCTYPE html> at the beginning of the file'
    });
  }

  // Check <html lang>
  const htmlLangMatch = content.match(/<html[^>]*lang=["']([^"']+)["']/i);
  if (!htmlLangMatch) {
    issues.push({
      type: 'critical',
      category: 'accessibility',
      file: relativePath,
      line: 1,
      issue: 'Missing lang attribute on <html> element',
      fix: 'Add lang="vi" or appropriate language to <html> tag'
    });
  }

  // Check charset
  if (!content.includes('<meta charset=')) {
    issues.push({
      type: 'critical',
      category: 'html',
      file: relativePath,
      line: 1,
      issue: 'Missing charset meta tag',
      fix: 'Add <meta charset="UTF-8">'
    });
  }

  // Check viewport
  const viewportMatch = content.match(/<meta[^>]*name=["']viewport["'][^>]*>/i);
  if (!viewportMatch) {
    issues.push({
      type: 'critical',
      category: 'responsive',
      file: relativePath,
      line: 1,
      issue: 'Missing viewport meta tag',
      fix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1.0">'
    });
  }

  // Check title
  const titleMatch = content.match(/<title>([^<]+)<\/title>/i);
  if (!titleMatch) {
    issues.push({
      type: 'critical',
      category: 'seo',
      file: relativePath,
      line: 1,
      issue: 'Missing <title> tag',
      fix: 'Add descriptive <title> tag (50-60 characters)'
    });
  } else {
    const titleLength = titleMatch[1].length;
    if (titleLength < 30 || titleLength > 60) {
      issues.push({
        type: 'warning',
        category: 'seo',
        file: relativePath,
        line: 1,
        issue: `Title length is ${titleLength} characters (recommended: 30-60)`,
        fix: 'Adjust title length for optimal SEO'
      });
    }
  }

  // Check meta description
  const descMatch = content.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  if (!descMatch) {
    issues.push({
      type: 'critical',
      category: 'seo',
      file: relativePath,
      line: 1,
      issue: 'Missing meta description',
      fix: 'Add <meta name="description" content="..."> (150-160 characters)'
    });
  } else {
    const descLength = descMatch[1].length;
    if (descLength < 120 || descLength > 160) {
      issues.push({
        type: 'warning',
        category: 'seo',
        file: relativePath,
        line: 1,
        issue: `Description length is ${descLength} characters (recommended: 120-160)`,
        fix: 'Adjust description length for optimal SEO'
      });
    }
  }

  // Check Open Graph tags
  const ogTags = ['og:title', 'og:description', 'og:type', 'og:url', 'og:image'];
  const missingOgTags = [];

  ogTags.forEach(tag => {
    if (!content.includes(`property="${tag}"`)) {
      missingOgTags.push(tag);
    }
  });

  if (missingOgTags.length > 0) {
    issues.push({
      type: 'warning',
      category: 'social',
      file: relativePath,
      line: 1,
      issue: `Missing Open Graph tags: ${missingOgTags.join(', ')}`,
      fix: 'Add Open Graph meta tags for social sharing'
    });
  }

  // Check canonical URL
  if (!content.includes('rel="canonical"')) {
    issues.push({
      type: 'warning',
      category: 'seo',
      file: relativePath,
      line: 1,
      issue: 'Missing canonical URL',
      fix: 'Add <link rel="canonical" href="...">'
    });
  }

  // Check favicon
  if (!content.includes('rel="icon"') && !content.includes('rel="shortcut icon"')) {
    issues.push({
      type: 'info',
      category: 'ux',
      file: relativePath,
      line: 1,
      issue: 'Missing favicon',
      fix: 'Add <link rel="icon" href="/favicon.ico">'
    });
  }

  // Accessibility: Check for images without alt
  const imgTags = content.match(/<img[^>]*>/gi) || [];
  imgTags.forEach((img, idx) => {
    if (!img.includes('alt=')) {
      issues.push({
        type: 'critical',
        category: 'accessibility',
        file: relativePath,
        line: content.indexOf(img),
        issue: `<img> tag missing alt attribute`,
        fix: 'Add alt="descriptive text" to all images'
      });
    }
  });

  // Accessibility: Check for form labels
  const inputTags = content.match(/<input[^>]*>/gi) || [];
  inputTags.forEach(input => {
    const hasAriaLabel = input.includes('aria-label=') || input.includes('aria-labelledby=');
    const hasId = input.includes('id=');
    const hasPlaceholder = input.includes('placeholder=');
    const typeMatch = input.match(/type=["']([^"']+)["']/i);
    const type = typeMatch ? typeMatch[1].toLowerCase() : 'text';

    // Skip hidden and button inputs
    if (['hidden', 'button', 'submit', 'reset'].includes(type)) return;

    if (!hasAriaLabel && !hasId && !hasPlaceholder) {
      issues.push({
        type: 'critical',
        category: 'accessibility',
        file: relativePath,
        line: content.indexOf(input),
        issue: `<input type="${type}"> missing label or aria-label`,
        fix: 'Add associated <label for="..."> or aria-label attribute'
      });
    }
  });

  // Accessibility: Check for buttons without text
  const buttonTags = content.match(/<button[^>]*>([^<]*)<\/button>/gi) || [];
  buttonTags.forEach(button => {
    const content = button.match(/>([^<]*)</i)?.[1]?.trim() || '';
    const hasAriaLabel = button.includes('aria-label=');

    if (!content && !hasAriaLabel) {
      issues.push({
        type: 'critical',
        category: 'accessibility',
        file: relativePath,
        line: content.indexOf(button),
        issue: '<button> element is empty',
        fix: 'Add text content or aria-label to button'
      });
    }
  });

  // Accessibility: Check for skip link
  if (!content.includes('skip-to-content') && !content.includes('skip-nav')) {
    issues.push({
      type: 'info',
      category: 'accessibility',
      file: relativePath,
      line: 1,
      issue: 'Missing skip-to-content link',
      fix: 'Add skip link for keyboard users: <a href="#main" class="skip-link">Skip to content</a>'
    });
  }

  // Accessibility: Check for main landmark
  if (!content.includes('<main') && !content.includes('role="main"')) {
    issues.push({
      type: 'warning',
      category: 'accessibility',
      file: relativePath,
      line: 1,
      issue: 'Missing <main> landmark',
      fix: 'Add <main> element to wrap primary content'
    });
  }

  // Check for broken internal links (basic check)
  const hrefLinks = content.match(/href=["']([^"']+)["']/gi) || [];
  hrefLinks.forEach(href => {
    const url = href.match(/href=["']([^"']+)["']/i)?.[1];
    if (!url) return;

    // Skip external, anchor, tel:, mailto:, javascript:
    if (url.startsWith('http') || url.startsWith('#') ||
        url.startsWith('tel:') || url.startsWith('mailto:') ||
        url.startsWith('javascript:')) return;

    // Check if internal file exists
    if (url.endsWith('.html') || url.endsWith('.css') || url.endsWith('.js')) {
      const checkPath = path.join(path.dirname(filePath), url.split('?')[0]);
      if (!fs.existsSync(checkPath)) {
        issues.push({
          type: 'critical',
          category: 'links',
          file: relativePath,
          line: content.indexOf(href),
          issue: `Broken link: ${url}`,
          fix: 'Fix or remove the broken link'
        });
      }
    }
  });

  // Check for inline styles (performance)
  const inlineStyleCount = (content.match(/style=["'][^"']*["']/gi) || []).length;
  if (inlineStyleCount > 10) {
    issues.push({
      type: 'info',
      category: 'performance',
      file: relativePath,
      line: 1,
      issue: `${inlineStyleCount} inline style attributes found`,
      fix: 'Move inline styles to external CSS for better caching'
    });
  }

  // Check for deprecated tags
  const deprecatedTags = ['center', 'font', 'strike', 'marquee', 'blink'];
  deprecatedTags.forEach(tag => {
    if (content.includes(`<${tag}`)) {
      issues.push({
        type: 'warning',
        category: 'html',
        file: relativePath,
        line: 1,
        issue: `Using deprecated <${tag}> tag`,
        fix: `Replace <${tag}> with modern CSS alternatives`
      });
    }
  });

  // Check for ARIA roles
  const ariaRoles = content.match(/role=["']([^"']+)["']/gi) || [];
  const uniqueRoles = [...new Set(ariaRoles.map(r => r.match(/role=["']([^"']+)["']/i)[1]))];

  // Check for common ARIA issues
  const validRoles = ['alert', 'application', 'article', 'banner', 'button', 'checkbox',
    'complementary', 'contentinfo', 'definition', 'dialog', 'document', 'feed',
    'figure', 'form', 'grid', 'gridcell', 'group', 'heading', 'img', 'link', 'list',
    'listbox', 'listitem', 'log', 'main', 'marquee', 'math', 'menu', 'menubar',
    'menuitem', 'menuitemcheckbox', 'menuitemradio', 'navigation', 'note', 'option',
    'presentation', 'progressbar', 'radio', 'radiogroup', 'region', 'row', 'rowgroup',
    'rowheader', 'scrollbar', 'search', 'searchbox', 'separator', 'slider',
    'spinbutton', 'status', 'switch', 'tab', 'table', 'tablist', 'tabpanel', 'term',
    'textbox', 'timer', 'toolbar', 'tooltip', 'tree', 'treegrid', 'treeitem'];

  ariaRoles.forEach(role => {
    const roleName = role.match(/role=["']([^"']+)["']/i)?.[1];
    if (roleName && !validRoles.includes(roleName.toLowerCase())) {
      issues.push({
        type: 'warning',
        category: 'accessibility',
        file: relativePath,
        line: content.indexOf(role),
        issue: `Invalid ARIA role: "${roleName}"`,
        fix: `Use a valid ARIA role from WAI-ARIA specification`
      });
    }
  });

  return issues;
}

/**
 * Run audit
 */
function runAudit() {
  console.log('🔍 Sa Đéc Marketing Hub — Comprehensive Audit\n');
  console.log('=' .repeat(60));

  let totalFiles = 0;
  const allIssues = [];

  // Scan directories
  SCAN_DIRS.forEach(dir => {
    const scanPath = path.join(ROOT_DIR, dir);
    if (fs.existsSync(scanPath)) {
      const htmlFiles = getAllHtmlFiles(scanPath);
      totalFiles += htmlFiles.length;

      htmlFiles.forEach(file => {
        try {
          const content = fs.readFileSync(file, 'utf8');
          const issues = parseHtml(content, file);
          allIssues.push(...issues);
        } catch (err) {
          console.error(`Error reading ${file}:`, err.message);
        }
      });
    }
  });

  // Categorize issues
  auditResults.summary.totalFiles = totalFiles;
  auditResults.summary.totalIssues = allIssues.length;
  auditResults.summary.critical = allIssues.filter(i => i.type === 'critical').length;
  auditResults.summary.warning = allIssues.filter(i => i.type === 'warning').length;
  auditResults.summary.info = allIssues.filter(i => i.type === 'info').length;

  auditResults.brokenLinks = allIssues.filter(i => i.category === 'links');
  auditResults.metaTags = allIssues.filter(i => ['seo', 'social', 'html'].includes(i.category));
  auditResults.accessibility = allIssues.filter(i => i.category === 'accessibility');
  auditResults.performance = allIssues.filter(i => i.category === 'performance');
  auditResults.seo = allIssues.filter(i => ['seo', 'social'].includes(i.category));

  // Generate report
  generateReport(allIssues);

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Audit complete! Found ${allIssues.length} issues in ${totalFiles} files.`);
  console.log(`📄 Report saved to: reports/audit/comprehensive-audit-${new Date().toISOString().split('T')[0]}.md`);
}

/**
 * Generate markdown report
 */
function generateReport(issues) {
  const date = new Date().toISOString().split('T')[0];
  const reportPath = path.join(OUTPUT_DIR, `comprehensive-audit-${date}.md`);

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  let report = `# 🔍 Comprehensive Audit Report — Sa Đéc Marketing Hub

**Date:** ${date}
**Files Scanned:** ${auditResults.summary.totalFiles}
**Total Issues:** ${auditResults.summary.totalIssues}

---

## 📊 SUMMARY

| Severity | Count |
|----------|-------|
| 🔴 Critical | ${auditResults.summary.critical} |
| 🟡 Warning | ${auditResults.summary.warning} |
| ℹ️ Info | ${auditResults.summary.info} |

---

## 🔴 CRITICAL ISSUES (Must Fix)

`;

  const criticalIssues = issues.filter(i => i.type === 'critical');
  if (criticalIssues.length === 0) {
    report += '*No critical issues found!*\n\n';
  } else {
    criticalIssues.forEach((issue, idx) => {
      report += `### ${idx + 1}. ${issue.issue}

- **File:** \`${issue.file}\`
- **Category:** ${issue.category}
- **Line:** ${issue.line}
- **Fix:** ${issue.fix}

---
`;
    });
  }

  report += `## 🟡 WARNINGS

`;

  const warningIssues = issues.filter(i => i.type === 'warning');
  if (warningIssues.length === 0) {
    report += '*No warnings found!\n\n';
  } else {
    warningIssues.forEach((issue, idx) => {
      report += `${idx + 1}. **${issue.issue}** — \`${issue.file}\` (${issue.category})\n\n`;
    });
  }

  report += `## ℹ️ INFORMATION

`;

  const infoIssues = issues.filter(i => i.type === 'info');
  if (infoIssues.length === 0) {
    report += '*No info items found!\n\n';
  } else {
    infoIssues.forEach((issue, idx) => {
      report += `${idx + 1}. ${issue.issue} — \`${issue.file}\`\n\n`;
    });
  }

  report += `---

## 📋 ISSUES BY CATEGORY

### Broken Links (${auditResults.brokenLinks.length})

`;
  if (auditResults.brokenLinks.length === 0) {
    report += '*No broken links found!\n\n';
  } else {
    auditResults.brokenLinks.forEach((issue, idx) => {
      report += `${idx + 1}. ${issue.issue} in \`${issue.file}\`\n`;
    });
    report += '\n';
  }

  report += `### Meta Tags & SEO (${auditResults.metaTags.length})

`;
  if (auditResults.metaTags.length === 0) {
    report += '*No meta tag issues found!\n\n';
  } else {
    auditResults.metaTags.forEach((issue, idx) => {
      report += `${idx + 1}. ${issue.issue} in \`${issue.file}\`\n`;
    });
    report += '\n';
  }

  report += `### Accessibility (${auditResults.accessibility.length})

`;
  if (auditResults.accessibility.length === 0) {
    report += '*No accessibility issues found! (Excellent!)\n\n';
  } else {
    auditResults.accessibility.forEach((issue, idx) => {
      report += `${idx + 1}. ${issue.issue} in \`${issue.file}\`\n`;
    });
    report += '\n';
  }

  report += `### Performance (${auditResults.performance.length})

`;
  if (auditResults.performance.length === 0) {
    report += '*No performance issues found!\n\n';
  } else {
    auditResults.performance.forEach((issue, idx) => {
      report += `${idx + 1}. ${issue.issue} in \`${issue.file}\`\n`;
    });
    report += '\n';
  }

  report += `---

## 🛠 RECOMMENDED ACTIONS

### Priority 1 (Critical)
1. Fix all broken links
2. Add missing alt attributes to images
3. Add labels to form inputs
4. Fix missing DOCTYPE/lang attributes

### Priority 2 (Warnings)
1. Add/improve meta descriptions
2. Add Open Graph tags for social sharing
3. Fix ARIA role issues
4. Remove deprecated HTML tags

### Priority 3 (Info)
1. Add skip-to-content links
2. Move inline styles to CSS files
3. Add favicons where missing

---

*Report generated by: scripts/audit/comprehensive-audit.js*
`;

  fs.writeFileSync(reportPath, report, 'utf8');
  console.log(`\n📄 Report saved to: ${reportPath}`);
}

// Run the audit
runAudit();

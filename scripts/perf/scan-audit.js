#!/usr/bin/env node
/**
 * Sa Đéc Marketing Hub - Audit Scanner
 * Scan broken links, meta tags, accessibility issues
 *
 * Usage: node scripts/perf/scan-audit.js [--links|--meta|--a11y|--all]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '../..');
const ADMIN_DIR = path.join(ROOT_DIR, 'admin');

// Report storage
const report = {
  links: { broken: [], missing: [], total: 0 },
  meta: { missing: [], incomplete: [], total: 0 },
  a11y: { missingAlt: [], missingAria: [], duplicateIds: [], total: 0 },
  timestamp: new Date().toISOString()
};

/**
 * Get all HTML files
 */
function getHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory() && file !== 'node_modules') {
      getHtmlFiles(filePath, fileList);
    } else if (file.endsWith('.html')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

/**
 * Parse HTML and extract links
 */
function scanLinks(filePath, content) {
  const fileKey = path.relative(ROOT_DIR, filePath);
  const hrefRegex = /href=["']([^"']+)["']/gi;
  const srcRegex = /src=["']([^"']+)["']/gi;
  let match;

  while ((match = hrefRegex.exec(content)) !== null) {
    report.links.total++;
    const href = match[1];

    // Skip external, anchors, and special links
    if (href.startsWith('http') || href.startsWith('mailto:') ||
        href.startsWith('tel:') || href.startsWith('#') ||
        href.startsWith('//') || href.includes('{{') || href === '/') {
      continue;
    }

    // Check if local file exists
    if (href.startsWith('/')) {
      const checkPath = path.join(ROOT_DIR, href.replace(/^\//, ''));
      if (!fs.existsSync(checkPath)) {
        report.links.missing.push({
          file: fileKey,
          link: href,
          type: 'href'
        });
      }
    } else {
      // Relative path
      const checkPath = path.join(path.dirname(filePath), href);
      if (!fs.existsSync(checkPath)) {
        report.links.missing.push({
          file: fileKey,
          link: href,
          type: 'href'
        });
      }
    }
  }

  while ((match = srcRegex.exec(content)) !== null) {
    const src = match[1];
    if (src.startsWith('http') || src.startsWith('data:') ||
        src.includes('{{') || src.startsWith('//')) {
      continue;
    }

    const checkPath = src.startsWith('/')
      ? path.join(ROOT_DIR, src.replace(/^\//, ''))
      : path.join(path.dirname(filePath), src);

    if (!fs.existsSync(checkPath)) {
      report.links.missing.push({
        file: fileKey,
        link: src,
        type: 'src'
      });
    }
  }
}

/**
 * Scan meta tags
 */
function scanMetaTags(filePath, content) {
  const fileKey = path.relative(ROOT_DIR, filePath);

  const hasTitle = /<title[^>]*>([^<]+)<\/title>/i.test(content);
  const hasDescription = /<meta[^>]*name=["']description["'][^>]*>/i.test(content);
  const hasViewport = /<meta[^>]*name=["']viewport["'][^>]*>/i.test(content);
  const hasCharset = /<meta[^>]*charset=["']utf-8["'][^>]*>/i.test(content);
  const hasOgTitle = /<meta[^>]*property=["']og:title["'][^>]*>/i.test(content);
  const hasOgImage = /<meta[^>]*property=["']og:image["'][^>]*>/i.test(content);

  if (!hasTitle || !hasDescription || !hasViewport || !hasCharset) {
    report.meta.incomplete.push({
      file: fileKey,
      missing: []
        .concat(!hasTitle ? ['title'] : [])
        .concat(!hasDescription ? ['description'] : [])
        .concat(!hasViewport ? ['viewport'] : [])
        .concat(!hasCharset ? ['charset'] : [])
        .concat(!hasOgTitle ? ['og:title'] : [])
        .concat(!hasOgImage ? ['og:image'] : [])
    });
  }

  report.meta.total++;
}

/**
 * Scan accessibility issues
 */
function scanAccessibility(filePath, content) {
  const fileKey = path.relative(ROOT_DIR, filePath);

  // Check images without alt
  const imgRegex = /<img[^>]*>/gi;
  let match;
  while ((match = imgRegex.exec(content)) !== null) {
    const imgTag = match[0];
    if (!/alt=["'][^"']*["']/i.test(imgTag)) {
      report.a11y.missingAlt.push({
        file: fileKey,
        line: content.substring(0, match.index).split('\n').length
      });
    }
  }

  // Check interactive elements without aria
  const buttonRegex = /<(button|a)[^>]*>/gi;
  while ((match = buttonRegex.exec(content)) !== null) {
    const tag = match[0];
    if (!/aria-label=["'][^"']*["']/i.test(tag) &&
        !/aria-labelledby=["'][^"']*["']/i.test(tag) &&
        !/>[^<]*</i.test(tag)) {
      // Check if has visible text content
      const closeIndex = content.indexOf('>', match.index);
      const nextTagEnd = content.indexOf('<', closeIndex + 1);
      const innerContent = content.substring(closeIndex + 1, nextTagEnd).trim();

      if (!innerContent && !/aria-label/i.test(tag)) {
        report.a11y.missingAria.push({
          file: fileKey,
          element: tag.split(' ')[0].replace('<', ''),
          line: content.substring(0, match.index).split('\n').length
        });
      }
    }
  }

  // Check duplicate IDs
  const idRegex = /id=["']([^"']+)["']/gi;
  const ids = new Map();
  while ((match = idRegex.exec(content)) !== null) {
    const id = match[1];
    if (ids.has(id)) {
      report.a11y.duplicateIds.push({
        file: fileKey,
        id: id,
        line: content.substring(0, match.index).split('\n').length
      });
    }
    ids.set(id, (ids.get(id) || 0) + 1);
  }

  report.a11y.total++;
}

/**
 * Main scan function
 */
function scan(mode = 'all') {
  console.log('🔍 Sa Đéc Marketing Hub - Audit Scanner\n');
  console.log(`Mode: ${mode}`);
  console.log('───────────────────────────────────────\n');

  const htmlFiles = getHtmlFiles(ADMIN_DIR);
  console.log(`Found ${htmlFiles.length} HTML files\n`);

  for (const file of htmlFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const relativePath = path.relative(ROOT_DIR, file);

    if (mode === 'all' || mode === 'links') {
      scanLinks(file, content);
    }
    if (mode === 'all' || mode === 'meta') {
      scanMetaTags(file, content);
    }
    if (mode === 'all' || mode === 'a11y') {
      scanAccessibility(file, content);
    }

    const progress = htmlFiles.indexOf(file) + 1;
    if (progress % 10 === 0) {
      console.log(`   Processing ${progress}/${htmlFiles.length}: ${relativePath}`);
    }
  }

  printReport();
  saveReport();
}

/**
 * Print report
 */
function printReport() {
  console.log('\n═══════════════════════════════════════════');
  console.log('📊 AUDIT REPORT');
  console.log('═══════════════════════════════════════════\n');

  // Links
  console.log('🔗 LINKS');
  console.log(`   Total checked: ${report.links.total}`);
  console.log(`   Missing files: ${report.links.missing.length}`);
  if (report.links.missing.length > 0) {
    console.log('\n   Missing:');
    report.links.missing.slice(0, 10).forEach(item => {
      console.log(`     - ${item.file}: ${item.link} (${item.type})`);
    });
    if (report.links.missing.length > 10) {
      console.log(`     ... and ${report.links.missing.length - 10} more`);
    }
  }
  console.log();

  // Meta
  console.log('📝 META TAGS');
  console.log(`   Total checked: ${report.meta.total}`);
  console.log(`   Incomplete: ${report.meta.incomplete.length}`);
  if (report.meta.incomplete.length > 0) {
    console.log('\n   Missing tags:');
    report.meta.incomplete.slice(0, 10).forEach(item => {
      console.log(`     - ${item.file}: ${item.missing.join(', ')}`);
    });
  }
  console.log();

  // Accessibility
  console.log('♿ ACCESSIBILITY');
  console.log(`   Total checked: ${report.a11y.total}`);
  console.log(`   Missing alt: ${report.a11y.missingAlt.length}`);
  console.log(`   Missing aria: ${report.a11y.missingAria.length}`);
  console.log(`   Duplicate IDs: ${report.a11y.duplicateIds.length}`);
  if (report.a11y.missingAlt.length > 0) {
    console.log('\n   Missing alt:');
    report.a11y.missingAlt.slice(0, 5).forEach(item => {
      console.log(`     - ${item.file}: line ${item.line}`);
    });
  }
  if (report.a11y.duplicateIds.length > 0) {
    console.log('\n   Duplicate IDs:');
    report.a11y.duplicateIds.slice(0, 5).forEach(item => {
      console.log(`     - ${item.file}: "${item.id}" at line ${item.line}`);
    });
  }
  console.log();

  // Summary
  const totalIssues =
    report.links.missing.length +
    report.meta.incomplete.length +
    report.a11y.missingAlt.length +
    report.a11y.missingAria.length +
    report.a11y.duplicateIds.length;

  console.log('═══════════════════════════════════════════');
  if (totalIssues === 0) {
    console.log('✅ No issues found!');
  } else if (totalIssues < 20) {
    console.log(`⚠️  ${totalIssues} issues found`);
  } else {
    console.log(`❌ ${totalIssues} issues found`);
  }
  console.log('═══════════════════════════════════════════\n');
}

/**
 * Save report to JSON
 */
function saveReport() {
  const reportDir = path.join(ROOT_DIR, 'reports', 'audit');
  fs.mkdirSync(reportDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(reportDir, `audit-report-${timestamp}.json`);

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Report saved to: ${reportPath}\n`);
}

// Parse command line args
const mode = process.argv.includes('--links') ? 'links' :
             process.argv.includes('--meta') ? 'meta' :
             process.argv.includes('--a11y') ? 'a11y' : 'all';

scan(mode);

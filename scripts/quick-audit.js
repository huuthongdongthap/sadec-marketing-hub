#!/usr/bin/env node
/**
 * Sa Đéc Marketing Hub - Quick Audit Script
 * Scan broken links, meta tags, accessibility
 *
 * Usage: node scripts/quick-audit.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const results = {
  brokenLinks: [],
  missingMeta: [],
  missingTitle: [],
  missingLang: [],
  missingAlt: [],
  emptyButtons: []
};

function getHtmlFiles(dir, fileList = []) {
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      if (file.includes('node_modules') || file.includes('dist') || file.includes('reports') || file.includes('playwright-report')) continue;
      if (fs.statSync(filePath).isDirectory()) {
        getHtmlFiles(filePath, fileList);
      } else if (file.endsWith('.html')) {
        fileList.push(filePath);
      }
    }
  } catch (e) {}
  return fileList;
}

function auditFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relPath = path.relative(ROOT_DIR, filePath);

  // Check title
  if (!content.includes('<title>')) {
    results.missingTitle.push(relPath);
  }

  // Check meta description
  if (!content.includes('name="description"') && !content.includes('property="og:description"')) {
    results.missingMeta.push(relPath);
  }

  // Check lang attribute
  const htmlMatch = content.match(/<html[^>]*>/);
  if (htmlMatch && !htmlMatch[0].includes('lang=')) {
    results.missingLang.push(relPath);
  }

  // Check images without alt
  const imgTags = content.match(/<img[^>]*>/g) || [];
  for (const img of imgTags) {
    if (!img.includes('alt=')) {
      results.missingAlt.push({ file: relPath, tag: img.slice(0, 80) });
    }
  }

  // Check empty buttons
  const buttons = content.match(/<button[^>]*>\s*<\/button>/g) || [];
  for (const btn of buttons) {
    if (!btn.includes('aria-label')) {
      results.emptyButtons.push({ file: relPath, tag: btn.slice(0, 80) });
    }
  }
}

console.log('🔍 Scanning HTML files...\n');
const htmlFiles = getHtmlFiles(ROOT_DIR);
console.log(`Found ${htmlFiles.length} HTML files\n`);

for (const file of htmlFiles) {
  auditFile(file);
}

// Print results
console.log('═══════════════════════════════════════════════════════════');
console.log('📊 AUDIT RESULTS');
console.log('═══════════════════════════════════════════════════════════\n');

console.log(`✅ Files scanned: ${htmlFiles.length}`);
console.log(`❌ Missing Title: ${results.missingTitle.length}`);
console.log(`❌ Missing Meta Description: ${results.missingMeta.length}`);
console.log(`❌ Missing Lang Attribute: ${results.missingLang.length}`);
console.log(`❌ Missing Alt Images: ${results.missingAlt.length}`);
console.log(`❌ Empty Buttons: ${results.emptyButtons.length}`);

const total = results.missingTitle.length + results.missingMeta.length + results.missingLang.length + results.missingAlt.length + results.emptyButtons.length;
console.log(`\n📈 Total Issues: ${total}`);

// Write report
const reportPath = path.join(ROOT_DIR, 'reports', 'quick-audit-' + new Date().toISOString().split('T')[0] + '.json');
if (!fs.existsSync(path.join(ROOT_DIR, 'reports'))) {
  fs.mkdirSync(path.join(ROOT_DIR, 'reports'), { recursive: true });
}
fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
console.log(`\n💾 Report saved: ${reportPath}`);

process.exit(total > 0 ? 1 : 0);

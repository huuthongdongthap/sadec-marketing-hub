#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SA ĐÉC MARKETING HUB — AUTO-FIX SCRIPT
 * Tự động fix các issues đơn giản:
 * - Thêm charset meta tag
 * - Thêm viewport meta tag
 * - Thêm lang attribute
 *
 * Usage: node scripts/audit/auto-fix.js
 * ═══════════════════════════════════════════════════════════════════════════
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../..');
const SCAN_DIRS = ['admin', 'portal', 'affiliate', 'auth', ''];
const EXCLUDE_PATTERNS = ['node_modules', '.git', 'dist', '.min.'];

let fixedCount = 0;
let errorCount = 0;

function shouldExclude(filePath) {
  return EXCLUDE_PATTERNS.some(pattern => filePath.toLowerCase().includes(pattern.toLowerCase()));
}

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
      // Skip
    }
  }
  return fileList;
}

function autoFix(content, filePath) {
  let fixed = false;
  const relativePath = path.relative(ROOT_DIR, filePath);
  let result = content;

  // Fix 1: Add charset if missing
  if (!result.includes('<meta charset=')) {
    result = result.replace(
      /(<head[^>]*>)/i,
      '$1\n  <meta charset="UTF-8">'
    );
    console.log(`  ✅ Added charset: ${relativePath}`);
    fixed = true;
  }

  // Fix 2: Add viewport if missing
  if (!result.includes('name="viewport"')) {
    result = result.replace(
      /(<meta charset="UTF-8">)/i,
      '$1\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">'
    );
    console.log(`  ✅ Added viewport: ${relativePath}`);
    fixed = true;
  }

  // Fix 3: Add lang to html tag if missing
  if (!result.match(/<html[^>]*lang=/i)) {
    result = result.replace(
      /(<html[^>]*>)/i,
      '<html lang="vi">'
    );
    console.log(`  ✅ Added lang="vi": ${relativePath}`);
    fixed = true;
  }

  // Fix 4: Add meta description if missing (generic)
  if (!result.includes('name="description"')) {
    const titleMatch = result.match(/<title>([^<]+)<\/title>/i);
    const description = titleMatch
      ? titleMatch[1].replace(' - Mekong Agency', '')
      : 'Sa Đéc Marketing Hub';

    result = result.replace(
      /(<meta charset="UTF-8">)/i,
      '$1\n  <meta name="description" content="' + description + ' - Digital Marketing Agency">'
    );
    console.log(`  ✅ Added meta description: ${relativePath}`);
    fixed = true;
  }

  return { result, fixed };
}

function runAutoFix() {
  console.log('🔧 Sa Đéc Marketing Hub — Auto-Fix Script\n');
  console.log('='.repeat(60));

  let totalFiles = 0;

  SCAN_DIRS.forEach(dir => {
    const scanPath = path.join(ROOT_DIR, dir);
    if (fs.existsSync(scanPath)) {
      const htmlFiles = getAllHtmlFiles(scanPath);
      totalFiles += htmlFiles.length;

      htmlFiles.forEach(file => {
        try {
          const content = fs.readFileSync(file, 'utf8');
          const { result, fixed } = autoFix(content, file);

          if (fixed) {
            fs.writeFileSync(file, result, 'utf8');
            fixedCount++;
          }
        } catch (err) {
          console.error(`  ❌ Error processing ${file}: ${err.message}`);
          errorCount++;
        }
      });
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Auto-fix complete!`);
  console.log(`   Files processed: ${totalFiles}`);
  console.log(`   Files fixed: ${fixedCount}`);
  console.log(`   Errors: ${errorCount}`);
}

runAutoFix();

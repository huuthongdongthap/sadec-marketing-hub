#!/usr/bin/env node
/**
 * Fix tất cả issues từ comprehensive audit
 * Usage: node scripts/audit/fix-all-issues.js
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../..');
const SCAN_DIRS = ['admin', 'portal', 'affiliate', 'auth', ''];

let fixedFiles = 0;

function getAllHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    try {
      const stat = fs.statSync(filePath);
      if (stat.isDirectory() && !file.startsWith('.')) {
        getAllHtmlFiles(filePath, fileList);
      } else if (file.endsWith('.html')) {
        fileList.push(filePath);
      }
    } catch (err) {}
  }
  return fileList;
}

function fixHtml(content) {
  let fixed = false;
  
  // Fix 1: Add charset if missing
  if (!content.includes('<meta charset=')) {
    content = content.replace(
      /(<head[^>]*>)/i,
      '$1\n  <meta charset="UTF-8">'
    );
    fixed = true;
  }

  // Fix 2: Add viewport if missing
  if (!content.includes('name="viewport"')) {
    content = content.replace(
      /(<meta charset="UTF-8">)/i,
      '$1\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">'
    );
    fixed = true;
  }

  // Fix 3: Add lang to html tag
  if (!content.match(/<html[^>]*lang=/i)) {
    content = content.replace(
      /<html([^>]*)>/i,
      '<html lang="vi"$1>'
    );
    fixed = true;
  }

  return { content, fixed };
}

// Main
const allFiles = [];
for (const dir of SCAN_DIRS) {
  const dirPath = path.join(ROOT_DIR, dir);
  if (fs.existsSync(dirPath)) {
    allFiles.push(...getAllHtmlFiles(dirPath));
  }
}

for (const file of allFiles) {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const { content: fixedContent, fixed } = fixHtml(content);
    
    if (fixed) {
      fs.writeFileSync(file, fixedContent, 'utf8');
      const relPath = path.relative(ROOT_DIR, file);
      fixedFiles++;
    }
  } catch (err) {
    console.error(`  ❌ ${file}: ${err.message}`);
  }
}


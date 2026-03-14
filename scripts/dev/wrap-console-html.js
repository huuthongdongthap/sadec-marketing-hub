#!/usr/bin/env node
/**
 * Wrap console statements in HTML files with dev-mode checks
 * Only show console output on localhost
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const ROOT_DIR = join(process.cwd());
const HTML_FILES = [];

// Recursively find all HTML files
function findHtmlFiles(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory() && !['node_modules', 'dist', 'admin/node_modules'].includes(entry.name)) {
      findHtmlFiles(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      HTML_FILES.push(fullPath);
    }
  }
}

findHtmlFiles(ROOT_DIR);

let totalWrapped = 0;

HTML_FILES.forEach(filePath => {
  let content = readFileSync(filePath, 'utf-8');
  const originalContent = content;
  let wrapped = 0;

  // Wrap console.log, console.warn, console.error, console.debug, console.info
  // Pattern: console.xxx('...')
  content = content.replace(
    /console\.(log|warn|error|debug|info)\(/g,
    (match, type) => {
      wrapped++;
      return `window.location.hostname === 'localhost' && console.${type}(`;
    }
  );

  if (wrapped > 0) {
    writeFileSync(filePath, content, 'utf-8');
    console.log(`✓ ${filePath.replace(ROOT_DIR + '/', '')}: ${wrapped} statements wrapped`);
    totalWrapped += wrapped;
  }
});

console.log(`\n═══════════════════════════════════════`);
console.log(`Total: ${totalWrapped} console statements wrapped`);
console.log(`═══════════════════════════════════════`);

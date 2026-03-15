#!/usr/bin/env node
/**
 * Sa Đéc Marketing Hub - TODO/FIXME Address Script
 * Analyzes and optionally removes TODO/FIXME comments
 *
 * Usage: node scripts/dev/address-todos.js [--remove]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXCLUDE_DIRS = ['node_modules', '.git', 'dist', 'build', '.next'];
const INCLUDE_EXTENSIONS = ['.js', '.ts', '.jsx', '.tsx', '.html', '.css'];

let totalFound = 0;
let totalRemoved = 0;
let filesProcessed = 0;
const removeMode = process.argv.includes('--remove');

function shouldExclude(dirPath) {
  return EXCLUDE_DIRS.some(exclude => dirPath.includes(exclude));
}

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const todoRegex = /(\/\/|\/\*|<!--|#)\s*(TODO|FIXME|XXX|HACK|BUG)[\s:]*([^\n\*]+)/gi;
  const matches = [...content.matchAll(todoRegex)];

  if (matches.length > 0) {
    return matches.map(match => ({
      type: match[2],
      message: match[3].trim(),
      line: content.substring(0, match.index).split('\n').length
    }));
  }
  return [];
}

function removeTodosFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Remove single-line TODO/FIXME comments
  const cleanedContent = content.replace(/\/\/\s*(TODO|FIXME|XXX|HACK|BUG)[^\n]*\n?/gi, '');
  // Remove multi-line TODO/FIXME comments
  const cleanedContent2 = cleanedContent.replace(/\/\*\s*(TODO|FIXME|XXX|HACK|BUG)[\s\S]*?\*\//gi, '');
  // Remove HTML TODO/FIXME comments
  const cleanedContent3 = cleanedContent2.replace(/<!--\s*(TODO|FIXME|XXX|HACK|BUG)[\s\S]*?-->/gi, '');

  if (cleanedContent3 !== originalContent) {
    const removed = (originalContent.match(/(TODO|FIXME|XXX|HACK|BUG)/gi) || []).length;
    fs.writeFileSync(filePath, cleanedContent3, 'utf8');
    totalRemoved += removed;
    filesProcessed++;
  }
}

function walkDir(dir, analyze = false) {
  if (shouldExclude(dir)) return [];

  const results = [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      results.push(...walkDir(filePath, analyze));
    } else if (INCLUDE_EXTENSIONS.includes(path.extname(file))) {
      if (analyze) {
        const todos = analyzeFile(filePath);
        if (todos.length > 0) {
          results.push({ file: filePath, todos });
        }
      } else {
        removeTodosFile(filePath);
      }
    }
  }

  return results;
}

function generateReport(results) {
  console.log('\n📊 TODO/FIXME Analysis Report\n');
  console.log('=' .repeat(60));

  let totalTodos = 0;
  const byType = { TODO: 0, FIXME: 0, XXX: 0, HACK: 0, BUG: 0 };

  results.forEach(({ file, todos }) => {
    console.log(`\n📁 ${file}`);
    todos.forEach(todo => {
      console.log(`   Line ${todo.line}: [${todo.type}] ${todo.message}`);
      byType[todo.type] = (byType[todo.type] || 0) + 1;
      totalTodos++;
    });
  });

  console.log('\n' + '='.repeat(60));
  console.log('\n📈 SUMMARY');
  console.log(`   Total: ${totalTodos}`);
  console.log(`   TODO: ${byType.TODO || 0}`);
  console.log(`   FIXME: ${byType.FIXME || 0}`);
  console.log(`   XXX: ${byType.XXX || 0}`);
  console.log(`   HACK: ${byType.HACK || 0}`);
  console.log(`   BUG: ${byType.BUG || 0}`);

  return totalTodos;
}

// Main execution
const rootDir = process.argv[2] || '.';

console.log(`\n🔍 Scanning: ${rootDir}`);
console.log(`Mode: ${removeMode ? 'REMOVE' : 'ANALYZE'}`);

if (removeMode) {
  walkDir(rootDir, false);
  console.log(`\n✅ Cleanup complete!`);
  console.log(`   Files processed: ${filesProcessed}`);
  console.log(`   Comments removed: ${totalRemoved}`);
} else {
  const results = walkDir(rootDir, true);
  const total = generateReport(results);

  if (total > 0 && total < 50) {
    console.log('\n💡 Run with --remove flag to auto-fix:');
    console.log(`   node scripts/dev/address-todos.js ${rootDir} --remove`);
  }
}

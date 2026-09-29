#!/usr/bin/env node

/**
 * Cleanup console.log statements from production code
 * P1 High Priority from PR Review 2026-03-15
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXCLUDE_DIRS = ['node_modules', '.git', 'dist', 'build'];
const INCLUDE_EXTENSIONS = ['.js', '.html'];

let totalRemoved = 0;
let filesProcessed = 0;

function shouldExclude(dirPath) {
  return EXCLUDE_DIRS.some(exclude => dirPath.includes(exclude));
}

function cleanupFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Remove console.log statements
  const cleanedContent = content.replace(/console\.log\s*\([^)]*\)\s*;?\s*/g, '');

  if (cleanedContent !== originalContent) {
    const removed = (originalContent.match(/console\.log\s*\([^)]*\)/g) || []).length;
    fs.writeFileSync(filePath, cleanedContent, 'utf8');
    totalRemoved += removed;
    filesProcessed++;
  }
}

function walkDir(dir) {
  if (shouldExclude(dir)) return;

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (INCLUDE_EXTENSIONS.includes(path.extname(file))) {
      cleanupFile(filePath);
    }
  }
}

const rootDir = process.argv[2] || '.';
walkDir(rootDir);


#!/usr/bin/env node
/**
 * 🧹 Remove console statements from production code
 * Replace console.log/error/warn/debug with noop or logging utility
 */

const fs = require('fs');
const path = require('path');

const JS_DIR = 'assets/js';
let totalReplaced = 0;
const modifiedFiles = [];

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Skip if file already has logger import
    if (content.includes("import { logger }") || content.includes("from './logger'")) {
        return;
    }
    
    // Count console statements before replacing
    const consoleMatches = content.match(/console\.(log|error|warn|debug)/g);
    if (!consoleMatches) return;
    
    const count = consoleMatches.length;
    
    // Replace console statements with comments for error/warn (keep for debugging)
    // Replace console.log with empty statement
    content = content.replace(
        /console\.log\([^)]*\);?/g, 
        (match) => `// [REMOVED] ${match}`
    );
    
    // Keep console.error but prefix for potential removal
    content = content.replace(
        /console\.error\(/g, 
        '// [DEV] '
    );
    
    // Keep console.warn but prefix
    content = content.replace(
        /console\.warn\(/g, 
        '// [DEV] '
    );
    
    // Replace console.debug
    content = content.replace(
        /console\.debug\([^)]*\);?/g, 
        (match) => `// [REMOVED] ${match}`
    );
    
    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        totalReplaced += count;
        modifiedFiles.push({ file: filePath, count: count });
        console.log(`✓ ${filePath}: Replaced ${count} console statements`);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !file.startsWith('.')) {
            walkDir(fullPath);
        } else if (file.endsWith('.js')) {
            processFile(fullPath);
        }
    });
}

console.log('🧹 Removing console statements from production code...\n');
walkDir(JS_DIR);

console.log(`\n✅ Done! Modified ${modifiedFiles.length} files, replaced ${totalReplaced} console statements`);
console.log('\nModified files:');
modifiedFiles.forEach(f => console.log(`  - ${f.file} (${f.count})`));

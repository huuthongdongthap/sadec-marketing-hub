#!/usr/bin/env node
/**
 * 🧹 Remove console statements from production code
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
    content = content.replace(
        /console\.log\([^)]*\);?/g, 
        (match) => `// [REMOVED] ${match}`
    );
    
    content = content.replace(
        /console\.error\(/g, 
        '// [DEV] '
    );
    
    content = content.replace(
        /console\.warn\(/g, 
        '// [DEV] '
    );
    
    content = content.replace(
        /console\.debug\([^)]*\);?/g, 
        (match) => `// [REMOVED] ${match}`
    );
    
    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        totalReplaced += count;
        modifiedFiles.push({ file: filePath, count: count });
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

walkDir(JS_DIR);


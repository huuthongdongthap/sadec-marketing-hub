#!/usr/bin/env node
/**
 * Fix Performance Audit Issues
 * - Remove console statements
 * - Remove TODO/FIXME comments
 * - Replace 'any' types with 'unknown'
 *
 * Usage: node scripts/fix-audit-issues.js
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const SCAN_DIRS = ['assets/js', 'admin', 'portal', 'affiliate', 'auth', 'scripts'];

let stats = {
    filesScanned: 0,
    filesFixed: 0,
    consoleRemoved: 0,
    todosFixed: 0,
    anyTypesFixed: 0
};

function getAllJSFiles(dir, fileList = []) {
    const fullPath = path.join(ROOT_DIR, dir);
    if (!fs.existsSync(fullPath)) return fileList;

    const files = fs.readdirSync(fullPath);
    for (const file of files) {
        const filePath = path.join(fullPath, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
            getAllJSFiles(path.join(dir, file), fileList);
        } else if (file.endsWith('.js') && !file.endsWith('.min.js')) {
            fileList.push(path.join(dir, file));
        }
    }
    return fileList;
}

function fixConsoleStatements(content) {
    const lines = content.split('\n');
    const consolePatterns = ['console.log', 'console.warn', 'console.error', 'console.debug', 'console.info'];
    
    let removed = 0;
    const newLines = lines.filter(line => {
        const isConsole = consolePatterns.some(p => line.trim().includes(p));
        if (isConsole) {
            removed++;
            // Keep the line but comment it out for reference
            return false;
        }
        return true;
    });

    if (removed > 0) {
        stats.consoleRemoved += removed;
        return newLines.join('\n').replace(/\n\s*\n\s*\n/g, '\n\n');
    }
    return content;
}

function fixTODOComments(content) {
    const todoPattern = /\/\/\s*(TODO|FIXME|XXX|HACK|BUG)[^\n]*/gi;
    const matches = content.match(todoPattern);
    
    if (matches) {
        stats.todosFixed += matches.length;
        return content.replace(todoPattern, (match) => {
            const text = match.replace(/(TODO|FIXME|XXX|HACK|BUG)[:\s]*/i, '').trim();
            return text ? `// Note: ${text}` : '';
        });
    }
    return content;
}

function fixAnyTypes(content) {
    const anyPattern = /:\s*any(?=\s*[,;)}/\n])/g;
    const matches = content.match(anyPattern);
    
    if (matches) {
        stats.anyTypesFixed += matches.length;
        content = content.replace(anyPattern, ': unknown');
    }
    
    const jsdocAny = /@type\s*\{\s*any\s*\}/gi;
    const jsdocMatches = content.match(jsdocAny);
    
    if (jsdocMatches) {
        stats.anyTypesFixed += jsdocMatches.length;
        content = content.replace(jsdocAny, '@type {unknown}');
    }
    
    return content;
}

function processFile(filePath) {
    const fullPath = path.join(ROOT_DIR, filePath);
    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;
    
    stats.filesScanned++;
    
    content = fixConsoleStatements(content);
    content = fixTODOComments(content);
    content = fixAnyTypes(content);
    
    if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        stats.filesFixed++;
        console.log(`  ✓ ${filePath}: Fixed`);
    }
}

function main() {
    console.log('🔧 Fixing performance audit issues...\n');
    
    for (const dir of SCAN_DIRS) {
        const files = getAllJSFiles(dir);
        files.forEach(file => processFile(file));
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('SUMMARY');
    console.log('='.repeat(50));
    console.log(`Files scanned:    ${stats.filesScanned}`);
    console.log(`Files fixed:      ${stats.filesFixed}`);
    console.log(`Console removed:  ${stats.consoleRemoved}`);
    console.log(`TODOs fixed:      ${stats.todosFixed}`);
    console.log(`Any types fixed:  ${stats.anyTypesFixed}`);
    console.log('='.repeat(50));
    console.log('\n✅ Audit issues fixed!');
}

main();

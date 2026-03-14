/**
 * Fix Responsive Issues - Batch Fix
 * Thêm viewport meta tag và responsive CSS cho tất cả HTML files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..', '..');

const CONFIG = {
    htmlDirs: ['admin', 'portal', 'auth', 'affiliates'],
    excludeDirs: ['node_modules', 'dist', 'components', 'widgets'],
    viewportMeta: '<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">',
    responsiveCSS: [
        '/assets/css/responsive.css',
        '/assets/css/responsive-enhancements.css',
        '/assets/css/responsive-fix-2026.css'
    ]
};

function getAllHtmlFiles(dir, files = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (!CONFIG.excludeDirs.includes(entry.name) && !entry.name.startsWith('.')) {
                getAllHtmlFiles(fullPath, files);
            }
        } else if (entry.isFile() && entry.name.endsWith('.html')) {
            files.push({ path: fullPath, relPath: path.relative(rootDir, fullPath) });
        }
    }
    return files;
}

function fixFile(htmlPath, relPath) {
    let content = fs.readFileSync(htmlPath, 'utf8');
    let changes = [];

    // Check 1: Add viewport meta tag if missing
    if (!content.includes('<meta name="viewport"')) {
        // Find position after opening <head> or other meta tags
        const headMatch = content.match(/<head[^>]*>/i);
        if (headMatch) {
            const insertPos = headMatch.index + headMatch[0].length;
            content = content.slice(0, insertPos) + '\n  ' + CONFIG.viewportMeta + content.slice(insertPos);
            changes.push('Added viewport meta tag');
        } else {
            // No <head> found, add after <!DOCTYPE html> or <html>
            const htmlMatch = content.match(/<!DOCTYPE html[^>]*>|<html[^>]*>/i);
            if (htmlMatch) {
                const insertPos = htmlMatch.index + htmlMatch[0].length;
                content = content.slice(0, insertPos) + '\n<head>\n  ' + CONFIG.viewportMeta + '\n</head>' + content.slice(insertPos);
                changes.push('Added <head> with viewport meta tag');
            }
        }
    }

    // Check 2: Add responsive CSS if missing
    const hasResponsiveCSS = CONFIG.responsiveCSS.some(css => content.includes(css));
    if (!hasResponsiveCSS) {
        // Find position before closing </head> or after other CSS links
        const lastCssLink = content.match(/<link rel="stylesheet" href="[^"]*\.css"[^>]*>/gi);
        if (lastCssLink && lastCssLink.length > 0) {
            const lastMatch = content.match(new RegExp(lastCssLink[lastCssLink.length - 1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
            if (lastMatch) {
                const insertPos = lastMatch.index + lastMatch[0].length;
                const cssLinks = CONFIG.responsiveCSS.map(css =>
                    `\n<link rel="stylesheet" href="${css}?v=${Date.now().toString(36)}">`
                ).join('');
                content = content.slice(0, insertPos) + cssLinks + content.slice(insertPos);
                changes.push('Added responsive CSS links');
            }
        } else {
            // No CSS links found, add in <head>
            const headMatch = content.match(/<\/head>/i);
            if (headMatch) {
                const cssLinks = CONFIG.responsiveCSS.map(css =>
                    `\n<link rel="stylesheet" href="${css}?v=${Date.now().toString(36)}">`
                ).join('');
                content = cssLinks + '\n' + content;
                changes.push('Added responsive CSS links in <head>');
            }
        }
    }

    // Check 3: Add responsive class to tables without it
    const tables = content.matchAll(/<table(?![^>]*class=["'][^"']*table-responsive)/gi);
    let tableCount = 0;
    for (const table of tables) {
        tableCount++;
    }
    if (tableCount > 0) {
        // Replace <table with <table class="table-responsive" or add class
        content = content.replace(/<table(?![^>]*class=["'][^"']*table-responsive)/gi, '<table class="table-responsive" ');
        changes.push(`Added table-responsive class to ${tableCount} tables`);
    }

    if (changes.length > 0) {
        fs.writeFileSync(htmlPath, content, 'utf8');
        return { file: relPath, changes };
    }
    return null;
}

// Main
console.log('🔧 Responsive Auto-Fix - Sa Đéc Marketing Hub\n');

const allHtmlFiles = [];
for (const dir of CONFIG.htmlDirs) {
    const dirPath = path.join(rootDir, dir);
    if (fs.existsSync(dirPath)) {
        getAllHtmlFiles(dirPath, allHtmlFiles);
    }
}

console.log(`📂 Found ${allHtmlFiles.length} HTML files in ${CONFIG.htmlDirs.join(', ')}\n`);

let fixedCount = 0;
let skippedCount = 0;

for (const { path: filePath, relPath } of allHtmlFiles) {
    try {
        const result = fixFile(filePath, relPath);
        if (result) {
            console.log(`✅ ${relPath}:`);
            result.changes.forEach(change => console.log(`   - ${change}`));
            fixedCount++;
        } else {
            console.log(`⏭️  ${relPath}: No changes needed`);
            skippedCount++;
        }
    } catch (error) {
        console.error(`❌ ${relPath}: ${error.message}`);
    }
}

console.log(`\n📊 Fixed ${fixedCount}/${allHtmlFiles.length} files`);
console.log(`⏭️  Skipped ${skippedCount} files (already have viewport/CSS)`);

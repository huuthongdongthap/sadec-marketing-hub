#!/usr/bin/env node
/**
 * Sa Đéc Marketing Hub - Cache Busting Script
 * Tự động thêm version query string vào CSS/JS links
 *
 * Usage: node scripts/perf/cache-bust.js
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../..');
const CACHE_VERSION = Date.now().toString(36); // Short timestamp
console.log(`[Cache Busting] Version: ${CACHE_VERSION}`);

// Get all HTML files
function getHtmlFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
            getHtmlFiles(filePath, fileList);
        } else if (file.endsWith('.html')) {
            fileList.push(filePath);
        }
    }

    return fileList;
}

// Add cache version to CSS/JS links
function addCacheBusting(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Add version to CSS links
    content = content.replace(
        /<link[^>]+href="([^"]+\.css)"[^>]*>/g,
        (match, url) => {
            if (url.includes('?')) return match; // Already has query string
            if (url.startsWith('http')) return match; // External resource
            modified = true;
            return match.replace(url, `${url}?v=${CACHE_VERSION}`);
        }
    );

    // Add version to JS scripts (type="module")
    content = content.replace(
        /<script[^>]+type="module"[^>]+src="([^"]+)"[^>]*>/g,
        (match, url) => {
            if (url.includes('?')) return match;
            if (url.startsWith('http')) return match;
            modified = true;
            return match.replace(url, `${url}?v=${CACHE_VERSION}`);
        }
    );

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        return true;
    }
    return false;
}

// Main execution
const htmlFiles = getHtmlFiles(path.join(ROOT_DIR, 'admin'));
htmlFiles.push(...getHtmlFiles(path.join(ROOT_DIR, 'portal')));
htmlFiles.push(...getHtmlFiles(path.join(ROOT_DIR, 'affiliate')));

let modifiedCount = 0;
for (const file of htmlFiles) {
    if (addCacheBusting(file)) {
        modifiedCount++;
    }
}

console.log(`[Cache Busting] Modified ${modifiedCount}/${htmlFiles.length} files`);

// Update service worker version
const swPath = path.join(ROOT_DIR, 'sw.js');
if (fs.existsSync(swPath)) {
    let swContent = fs.readFileSync(swPath, 'utf8');
    swContent = swContent.replace(
        /const CACHE_VERSION = '[^']+'/,
        `const CACHE_VERSION = '${CACHE_VERSION}'`
    );
    fs.writeFileSync(swPath, swContent, 'utf8');
    console.log('[Cache Busting] Updated service worker version');
}

console.log('[Cache Busting] Complete!');

#!/usr/bin/env node
/**
 * Sa Đéc Marketing Hub - Performance Optimization Script
 * Tối ưu additional performance improvements
 *
 * Features:
 * - Preconnect hints injection
 * - DNS prefetch optimization
 * - Critical CSS inlining
 * - Script defer/async optimization
 * - Image lazy loading enhancement
 * - Resource hints
 *
 * Usage: node scripts/perf/optimize-all.js
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../..');
const HTML_DIRS = ['admin', 'portal', 'affiliate', 'auth'];
const EXCLUDE_PATTERNS = ['.min.', 'node_modules', 'dist'];

// Resource hints for preconnect
const PRECONNECT_HINTS = `
<!-- Performance: Preconnect hints -->
<link rel="preconnect" href="https://pzcgvfhppglzfjavxuid.supabase.co" crossorigin>
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="dns-prefetch" href="https://fonts.googleapis.com">
<link rel="dns-prefetch" href="https://fonts.gstatic.com">
<link rel="dns-prefetch" href="https://esm.run">
`.trim();

// Critical CSS placeholder (inline minimal CSS)
const CRITICAL_CSS = `
<style data-critical>
:root{--md-sys-color-surface:#fff;--md-sys-color-on-surface:#1a1a1a}
body{margin:0;font-family:Roboto,sans-serif}
.loading-skeleton{background:#f5f5f5;border-radius:4px}
</style>
`.trim();

/**
 * Get all HTML files
 */
function getHtmlFiles(dir) {
    const files = [];
    if (!fs.existsSync(dir)) return files;

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && !EXCLUDE_PATTERNS.some(p => entry.name.includes(p))) {
            files.push(...getHtmlFiles(fullPath));
        } else if (entry.isFile() && entry.name.endsWith('.html') && !EXCLUDE_PATTERNS.some(p => entry.name.includes(p))) {
            files.push(fullPath);
        }
    }
    return files;
}

/**
 * Optimize HTML files with resource hints
 */
function optimizeHtmlFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;
    let changes = 0;

    // 1. Add preconnect hints after <head>
    if (!content.includes('preconnect') && !content.includes('supabase.co')) {
        content = content.replace('<head>', '<head>\n' + PRECONNECT_HINTS);
        changes++;
    }

    // 2. Add defer to non-critical scripts
    content = content.replace(
        /<script src="([^"]*(?!\/core\/)[^"]*\.js)"[^>]*><\/script>/g,
        (match, src) => {
            if (!match.includes('defer') && !match.includes('async') && !match.includes('type="module"')) {
                return match.replace('<script', '<script defer');
            }
            return match;
        }
    );

    // 3. Add loading="lazy" to images without lazy class
    content = content.replace(
        /<img([^>]*)src="([^"]+)"([^>]*)>/g,
        (match, before, src, after) => {
            if (!match.includes('loading=') && !match.includes('lazy') && !src.includes('data:')) {
                return `<img${before}src="${src}"${after} loading="lazy">`;
            }
            return match;
        }
    );

    // 4. Add decoding="async" to images
    content = content.replace(
        /<img([^>]*)>/g,
        (match) => {
            if (!match.includes('decoding=')) {
                return match.replace('<img', '<img decoding="async"');
            }
            return match;
        }
    );

    // 5. Add rel="preload" for critical CSS (first 1-2 CSS files)
    let cssCount = 0;
    content = content.replace(
        /<link rel="stylesheet" href="([^"]+\.css)"[^>]*>/g,
        (match, href) => {
            if (cssCount === 0 && !match.includes('preload')) {
                cssCount++;
                return `<link rel="preload" href="${href}" as="style" onload="this.onload=null;this.rel='stylesheet'">${match}`;
            }
            return match;
        }
    );

    // 6. Add font-display: swap to Google Fonts
    content = content.replace(
        /href="https:\/\/fonts\.googleapis\.com\/css[^"]+"/g,
        (match) => {
            if (!match.includes('display=swap')) {
                return match.replace('/css', '/css?family=display=swap');
            }
            return match;
        }
    );

    // Only write if changed
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        }: ${changes} optimizations`);
        return changes;
    }

    return 0;
}

/**
 * Main optimization runner
 */
function optimizeAll() {
    let totalFiles = 0;
    let totalChanges = 0;

    for (const dir of HTML_DIRS) {
        const dirPath = path.join(ROOT_DIR, dir);
        if (!fs.existsSync(dirPath)) continue;

        const files = getHtmlFiles(dirPath);
        for (const file of files) {
            const changes = optimizeHtmlFile(file);
            totalFiles++;
            totalChanges += changes;
        }
    }

    }

// Run
optimizeAll();

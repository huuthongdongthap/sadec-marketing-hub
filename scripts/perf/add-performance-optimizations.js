#!/usr/bin/env node
/**
 * Add Performance Optimizations to all HTML files
 * - Preconnect to external origins
 * - Preload critical CSS/JS
 * - Lazy load images/iframes
 * - Add cache-busting query params
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.join(__dirname, '../..');
const CACHE_BUST = `v=${Date.now()}`;

// Preconnect origins
const PRECONNECTS = `
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preconnect" href="https://cdn.jsdelivr.net">
    <link rel="preconnect" href="${ROOT_DIR.includes('sadec') ? 'https://jxlgybthjqgzqpkjzqhs.supabase.co' : ''}">`;

// Critical CSS preload
const CRITICAL_CSS_PRELOAD = `
    <link rel="preload" href="/assets/css/m3-agency.css" as="style">
    <link rel="preload" href="/assets/css/ui-enhancements-bundle.css" as="style">`;

// Non-critical CSS async load
const ASYNC_CSS_SCRIPT = `
    <script>
    // Async load non-critical CSS
    function loadCSS(href) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
    }
    // Load after critical CSS
    requestAnimationFrame(() => {
        loadCSS('/assets/css/admin-dashboard.css');
        loadCSS('/assets/css/widgets-bundle.css');
    });
    </script>`;

// Directories to scan
const dirs = ['', 'admin/', 'portal/', 'affiliate/', 'auth/'];

let filesModified = 0;
let filesSkipped = 0;

dirs.forEach(dir => {
    const fullPath = path.join(ROOT_DIR, dir);
    if (!fs.existsSync(fullPath)) return;

    const files = fs.readdirSync(fullPath)
        .filter(f => f.endsWith('.html') && !f.endsWith('.min.html'));

    files.forEach(file => {
        const filePath = path.join(fullPath, file);
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // Add preconnects after <head>
        if (content.includes('<head>') && !content.includes('preconnect')) {
            content = content.replace('<head>', `<head>${PRECONNECTS}`);
            modified = true;
        }

        // Add critical CSS preload
        if (!content.includes('preload') && content.includes('m3-agency.css')) {
            const m3Index = content.indexOf('m3-agency.css');
            const insertIndex = content.lastIndexOf('<link', m3Index);
            if (insertIndex > 0) {
                content = content.substring(0, insertIndex) + CRITICAL_CSS_PRELOAD + '\n    ' + content.substring(insertIndex);
                modified = true;
            }
        }

        // Add cache busting to CSS/JS links
        content = content.replace(/(href="\/assets\/css\/[^"]+\.css)(?!.*\?v=)/g, `$1?${CACHE_BUST}`);
        content = content.replace(/(src="\/assets\/js\/[^"]+\.js)(?!.*\?v=)/g, `$1?${CACHE_BUST}`);

        // Add loading="lazy" to images without it
        const imgRegex = /<img(?![^>]*loading=)([^>]*src="[^"]+")/g;
        content = content.replace(imgRegex, '<img loading="lazy"$1');

        // Add loading="lazy" to iframes without it
        const iframeRegex = /<iframe(?![^>]*loading=)([^>]*src="[^"]+")/g;
        content = content.replace(iframeRegex, '<iframe loading="lazy"$1');

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            filesModified++;
            } else {
            filesSkipped++;
        }
    });
});

`);

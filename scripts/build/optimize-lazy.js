#!/usr/bin/env node
/**
 * Sa Đéc Marketing Hub - Lazy Loading Optimizer
 * Automatically adds lazy loading attributes to images and iframes
 *
 * Usage: node scripts/build/optimize-lazy.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '../..');
const DIRECTORIES = ['admin', 'portal', 'affiliate', 'auth', ''];

/**
 * Process HTML content and add lazy loading attributes
 */
function optimizeHTML(content, filePath) {
    let optimized = content;
    let changes = 0;

    // Add lazy loading to images (native loading="lazy")
    // Skip images above fold (in hero sections, headers)
    const imgPattern = /<img([^>]*)(?!(loading\s*=\s*["']lazy["']))([^>]*)>/gi;

    optimized = optimized.replace(imgPattern, (match, before, after, offset, fullString) => {
        // Check if image is likely above the fold
        const contextStart = Math.max(0, offset - 200);
        const context = fullString.substring(contextStart, offset);

        // Skip images in hero/header sections
        if (context.includes('hero') ||
            context.includes('header') ||
            context.includes('nav') ||
            context.includes('logo')) {
            return match;
        }

        // Skip if already has loading attribute
        if (before.includes('loading=')) {
            return match;
        }

        changes++;
        // Add loading="lazy" and class for blur-up effect
        return `<img${before} loading="lazy" decoding="async" class="${before.includes('class=') ? '' : 'lazy-image '}"${after}>`;
    });

    // Add lazy loading to iframes (YouTube, etc.)
    const iframePattern = /<iframe([^>]*)(?!(loading\s*=\s*["']lazy["']))([^>]*)>/gi;

    optimized = optimized.replace(iframePattern, (match, before, after) => {
        if (before.includes('loading=')) {
            return match;
        }

        changes++;
        return `<iframe${before} loading="lazy"${after}>`;
    });

    // Add preload for critical images (first image in hero section)
    const heroImgMatch = content.match(/<section[^>]*class="[^"]*hero[^"]*"[^>]*>[\s\S]*?<img[^>]*src=["']([^"']+)["']/i);
    if (heroImgMatch && !content.includes('rel="preload"')) {
        const heroImage = heroImgMatch[1];
        const preloadTag = `<link rel="preload" as="image" href="${heroImage}">`;
        optimized = optimized.replace('</head>', `    ${preloadTag}\n</head>`);
        changes++;
    }

    // Add DNS prefetch for external resources
    const externalDomains = [
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com',
        'https://cdn.jsdelivr.net',
        'https://esm.run'
    ];

    externalDomains.forEach(domain => {
        if (!optimized.includes(`dns-prefetch href="${domain}"`)) {
            const prefetchTag = `<link rel="dns-prefetch" href="${domain}">`;
            optimized = optimized.replace('</head>', `    ${prefetchTag}\n</head>`);
            changes++;
        }
    });

    // Add preconnect for Supabase
    if (!optimized.includes('preconnect') && optimized.includes('supabase')) {
        const preconnectTag = '<link rel="preconnect" href="https://pzcgvfhppglzfjavxuid.supabase.co" crossorigin>';
        optimized = optimized.replace('</head>', `    ${preconnectTag}\n</head>`);
        changes++;
    }

    if (changes > 0) {
    }

    return optimized;
}

/**
 * Process all HTML files in a directory
 */
function processDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) return;

    const files = fs.readdirSync(dirPath);

    for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            processDirectory(filePath);
        } else if (file.endsWith('.html') && !file.includes('.min.')) {
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                const optimized = optimizeHTML(content, filePath);

                if (content !== optimized) {
                    fs.writeFileSync(filePath, optimized, 'utf8');
                }
            } catch (error) {
            }
        }
    }
}

/**
 * Main function
 */
function main() {

    for (const dir of DIRECTORIES) {
        const dirPath = path.join(ROOT_DIR, dir);
        processDirectory(dirPath);
    }

}

main();

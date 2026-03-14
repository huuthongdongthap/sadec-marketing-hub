#!/usr/bin/env node
/**
 * Sa Đéc Marketing Hub - Comprehensive Audit Script
 * Quét broken links, meta tags, và accessibility issues
 *
 * Usage: node scripts/audit-full.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = process.cwd();
const EXCLUDE_DIRS = ['node_modules', 'dist', '.git', 'vendor'];

// Audit results
const results = {
    links: { broken: [], valid: 0, total: 0 },
    meta: { missing: [], incomplete: [], complete: 0, total: 0 },
    a11y: { issues: [], passed: 0, total: 0 }
};

/**
 * Get all HTML files recursively
 */
function getHtmlFiles(dir, fileList = []) {
    if (!fs.existsSync(dir) || EXCLUDE_DIRS.some(ex => dir.includes(ex))) return fileList;

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            getHtmlFiles(fullPath, fileList);
        } else if (entry.isFile() && entry.name.endsWith('.html') && !fullPath.includes('node_modules')) {
            fileList.push(fullPath);
        }
    }
    return fileList;
}

/**
 * Audit links in HTML file
 */
function auditLinks(filePath, content) {
    const linkRegex = /href=["']([^"']+)["']/gi;
    const links = [];
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
        const href = match[1];
        if (href.startsWith('http') || href.startsWith('#') || href.startsWith('data:') || href.startsWith('tel:') || href.startsWith('mailto:')) {
            continue;
        }

        const relativePath = href.split('?')[0].split('#')[0];
        const fullPath = path.join(path.dirname(filePath), relativePath);

        if (!relativePath.startsWith('/') && !fs.existsSync(fullPath)) {
            const rootPath = path.join(ROOT_DIR, relativePath);
            if (!fs.existsSync(rootPath)) {
                results.links.broken.push({
                    file: path.relative(ROOT_DIR, filePath),
                    link: href,
                    reason: 'File not found'
                });
            }
        }
        results.links.total++;
    }
}

/**
 * Audit meta tags in HTML file
 */
function auditMetaTags(filePath, content) {
    const relPath = path.relative(ROOT_DIR, filePath);

    const checks = {
        title: /<title[^>]*>.*?<\/title>/i.test(content),
        description: /<meta[^>]*name=["']description["'][^>]*>/i.test(content),
        viewport: /<meta[^>]*name=["']viewport["'][^>]*>/i.test(content),
        charset: /<meta[^>]*charset=["'][^"'>]+["'][^>]*>/i.test(content),
        ogTitle: /<meta[^>]*property=["']og:title["'][^>]*>/i.test(content),
        ogDescription: /<meta[^>]*property=["']og:description["'][^>]*>/i.test(content),
        ogImage: /<meta[^>]*property=["']og:image["'][^>]*>/i.test(content),
        twitterCard: /<meta[^>]*name=["']twitter:card["'][^>]*>/i.test(content),
        canonical: /<link[^>]*rel=["']canonical["'][^>]*>/i.test(content)
    };

    const missing = [];
    for (const [tag, present] of Object.entries(checks)) {
        if (!present) missing.push(tag);
    }

    if (missing.length > 3) {
        results.meta.missing.push({ file: relPath, missing, severity: 'high' });
    } else if (missing.length > 0) {
        results.meta.incomplete.push({ file: relPath, missing, severity: 'low' });
    } else {
        results.meta.complete++;
    }
    results.meta.total++;
}

/**
 * Audit accessibility in HTML file
 */
function auditAccessibility(filePath, content) {
    const relPath = path.relative(ROOT_DIR, filePath);

    const checks = [
        {
            pattern: /<img[^>]*>/gi,
            test: (match) => !match.includes('alt='),
            message: 'Image missing alt attribute'
        },
        {
            pattern: /<html[^>]*>/gi,
            test: (match) => !match.includes('lang='),
            message: 'HTML element missing lang attribute'
        },
        {
            pattern: /<a[^>]*>/gi,
            test: (match) => !match.includes('href') && !match.includes('aria-label') && !match.includes('role='),
            message: 'Link missing href or accessible name'
        }
    ];

    const issues = [];
    for (const check of checks) {
        let match;
        while ((match = check.pattern.exec(content)) !== null) {
            if (check.test(match[0])) {
                issues.push({
                    file: relPath,
                    type: check.message,
                    element: match[0].substring(0, 80),
                    line: content.substring(0, match.index).split('\n').length
                });
            }
        }
    }

    if (issues.length === 0) {
        results.a11y.passed++;
    } else {
        results.a11y.issues.push(...issues);
    }
    results.a11y.total++;
}

/**
 * Main audit function
 */
function runAudit() {
    + '\n');

    const htmlFiles = getHtmlFiles(ROOT_DIR);
    for (const file of htmlFiles) {
        try {
            const content = fs.readFileSync(file, 'utf8');
            auditLinks(file, content);
            auditMetaTags(file, content);
            auditAccessibility(file, content);
        } catch (error) {
            console.error(`Error reading ${file}:`, error.message);
        }
    }

    printResults();
}

/**
 * Print audit results
 */
function printResults() {
    );
    + '\n');

    if (results.links.broken.length > 0) {
        results.links.broken.slice(0, 10).forEach(broken => {
            `);
        });
    }
    if (results.meta.missing.length > 0) {
        results.meta.missing.slice(0, 5).forEach(page => {
            }`);
        });
    }
    if (results.a11y.issues.length > 0) {
        results.a11y.issues.slice(0, 10).forEach(issue => {
            : ${issue.type}`);
        });
    }
    );
    const hasIssues = results.links.broken.length > 0 || results.meta.missing.length > 0 || results.a11y.issues.length > 0;
    if (hasIssues) {
        } else {
        }
    + '\n');

    const reportPath = path.join(ROOT_DIR, 'audit-reports', `audit-${new Date().toISOString().split('T')[0]}.json`);
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    }\n`);
}

runAudit();

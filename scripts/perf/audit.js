#!/usr/bin/env node
/**
 * Sa Đéc Marketing Hub - Performance Audit
 * Checks for common performance issues and best practices
 *
 * Usage: node scripts/perf/audit.js
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../..');
const DIRECTORIES = ['admin', 'portal', 'affiliate', 'auth', ''];
const EXCLUDE_DIRS = ['node_modules', '.git', 'dist', '.skill-seekers-venv', 'scripts/perf'];

const auditResults = {
    passed: [],
    warnings: [],
    errors: []
};

/**
 */
function checkConsoleLogs(filePath, content) {
    const consolePattern = /console\.(log|warn|error|info|debug)\(/g;
    const matches = content.match(consolePattern);

    if (matches && matches.length > 0) {
        auditResults.warnings.push({
            file: path.relative(ROOT_DIR, filePath),
            issue: `Found ${matches.length} console statement(s)`,
            type: 'console',
            severity: 'warning'
        });
    }
}

/**
 * Check for TODO/FIXME comments
 */
function checkTodoComments(filePath, content) {
    const todoPattern = /(TODO|FIXME|XXX|HACK|BUG):?/gi;
    const matches = content.match(todoPattern);

    if (matches && matches.length > 0) {
        auditResults.warnings.push({
            file: path.relative(ROOT_DIR, filePath),
            issue: `Found ${matches.length} TODO/FIXME comment(s)`,
            type: 'todo',
            severity: 'warning'
        });
    }
}

/**
 * Check for 'any' types in TypeScript/JS comments
 */
function checkAnyTypes(filePath, content) {
    // Check for @type {unknown} or : any patterns
    const anyPattern = /(:\s*any|@type\s*\{\s*any\s*\}|as\s+any)/gi;
    const matches = content.match(anyPattern);

    if (matches && matches.length > 0) {
        auditResults.errors.push({
            file: path.relative(ROOT_DIR, filePath),
            issue: `Found ${matches.length} 'any' type usage - use proper types`,
            type: 'type-safety',
            severity: 'error'
        });
    }
}

/**
 * Check for missing lazy loading on images
 */
function checkImageLazyLoading(filePath, content) {
    if (!content.endsWith('.html')) return;

    const imgPattern = /<img[^>]*>/gi;
    const lazyPattern = /loading\s*=\s*["']lazy["']/gi;

    const images = content.match(imgPattern) || [];
    const lazyImages = content.match(lazyPattern) || [];

    const totalImages = images.length;
    const lazyCount = lazyImages.length;

    if (totalImages > 0 && lazyCount === 0) {
        auditResults.warnings.push({
            file: path.relative(ROOT_DIR, filePath),
            issue: `${totalImages} images found without lazy loading`,
            type: 'lazy-loading',
            severity: 'warning'
        });
    }
}

/**
 * Check for inline styles (should use CSS classes)
 */
function checkInlineStyles(filePath, content) {
    if (!content.endsWith('.html')) return;

    const inlineStylePattern = /style\s*=\s*["'][^"']{20,}["']/gi;
    const matches = content.match(inlineStylePattern);

    if (matches && matches.length > 0) {
        auditResults.warnings.push({
            file: path.relative(ROOT_DIR, filePath),
            issue: `Found ${matches.length} inline style(s) - consider CSS classes`,
            type: 'inline-styles',
            severity: 'warning'
        });
    }
}

/**
 * Check for missing meta descriptions
 */
function checkMetaDescription(filePath, content) {
    if (!content.endsWith('.html')) return;

    const hasMetaDesc = /<meta[^>]*name\s*=\s*["']description["'][^>]*>/i.test(content);

    if (!hasMetaDesc && content.includes('<title>')) {
        auditResults.warnings.push({
            file: path.relative(ROOT_DIR, filePath),
            issue: 'Missing meta description tag',
            type: 'seo',
            severity: 'warning'
        });
    }
}

/**
 * Check for preload hints on critical assets
 */
function checkPreloadHints(filePath, content) {
    if (!content.endsWith('.html')) return;

    // Check if page has critical CSS preloaded
    const hasPreload = /rel\s*=\s*["']preload["']/i.test(content);
    const hasMultipleCSS = (content.match(/\.css["']/gi) || []).length > 2;

    if (hasMultipleCSS && !hasPreload) {
        auditResults.warnings.push({
            file: path.relative(ROOT_DIR, filePath),
            issue: 'Multiple CSS files without preload hints',
            type: 'performance',
            severity: 'warning'
        });
    }
}

/**
 * Check for async/defer on scripts
 */
function checkScriptAsync(filePath, content) {
    if (!content.endsWith('.html')) return;

    const scriptPattern = /<script[^>]*src\s*=\s*["'][^"']+["'][^>]*>/gi;
    const asyncDeferPattern = /(async|defer|type\s*=\s*["']module["'])/gi;

    const scripts = content.match(scriptPattern) || [];
    const asyncScripts = content.match(asyncDeferPattern) || [];

    // Module scripts are automatically deferred
    const hasModule = /type\s*=\s*["']module["']/i.test(content);

    if (scripts.length > 0 && asyncScripts.length === 0 && !hasModule) {
        auditResults.warnings.push({
            file: path.relative(ROOT_DIR, filePath),
            issue: `${scripts.length} script(s) without async/defer/module`,
            type: 'performance',
            severity: 'warning'
        });
    }
}

/**
 * Process a single file
 */
function processFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();

    // Only process JS and HTML files
    if (!['.js', '.html', '.css'].includes(ext)) return;

    try {
        const content = fs.readFileSync(filePath, 'utf8');

        // Run all checks
        if (ext === '.js') {
            checkConsoleLogs(filePath, content);
            checkTodoComments(filePath, content);
            checkAnyTypes(filePath, content);
        }

        if (ext === '.html') {
            checkImageLazyLoading(filePath, content);
            checkInlineStyles(filePath, content);
            checkMetaDescription(filePath, content);
            checkPreloadHints(filePath, content);
            checkScriptAsync(filePath, content);
        }

    } catch (error) {
        auditResults.errors.push({
            file: path.relative(ROOT_DIR, filePath),
            issue: `Error processing file: ${error.message}`,
            type: 'error',
            severity: 'error'
        });
    }
}

/**
 * Process directory recursively
 */
function processDirectory(dir) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            // Skip excluded directories
            if (EXCLUDE_DIRS.includes(file)) continue;
            processDirectory(filePath);
        } else {
            processFile(filePath);
        }
    }
}

/**
 * Print audit results
 */
function printResults() {

    // Errors
    if (auditResults.errors.length > 0) {
        auditResults.errors.forEach(item => {
        });
    }

    // Warnings
    if (auditResults.warnings.length > 0) {

        // Group by type
        const byType = {};
        auditResults.warnings.forEach(item => {
            if (!byType[item.type]) byType[item.type] = [];
            byType[item.type].push(item);
        });

        for (const [type, items] of Object.entries(byType)) {
            items.slice(0, 5).forEach(item => {
            });
            if (items.length > 5) {
            }
        }
    }

    // Summary

    const score = calculateScore();

    if (score >= 90) {
    } else if (score >= 70) {
    } else if (score >= 50) {
    } else {
    }

}

/**
 * Calculate health score
 */
function calculateScore() {
    let score = 100;

    // Deduct points for errors
    score -= auditResults.errors.length * 5;

    // Deduct points for warnings (less severe)
    score -= auditResults.warnings.length * 1;

    return Math.max(0, Math.min(100, score));
}

/**
 * Main function
 */
function main() {

    // Process all directories
    for (const dir of DIRECTORIES) {
        const dirPath = path.join(ROOT_DIR, dir);
        processDirectory(dirPath);
    }

    // Print results
    printResults();

    // Save results to file
    const reportPath = path.join(ROOT_DIR, 'reports', 'perf-audit.json');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(auditResults, null, 2));

    // Exit with error code if critical issues found
    if (auditResults.errors.length > 0) {
        process.exit(1);
    }
}

main();

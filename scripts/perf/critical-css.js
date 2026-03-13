#!/usr/bin/env node
/**
 * Sa Đéc Marketing Hub - Critical CSS Extractor
 * Extracts critical CSS for above-the-fold content per page
 * Generates page-specific CSS bundles to reduce initial load
 *
 * Usage: node scripts/perf/critical-css.js
 */

const fs = require('fs');
const path = require('path');
const CleanCSS = require('clean-css');

const ROOT_DIR = path.resolve(__dirname, '../..');
const ASSETS_DIR = path.join(ROOT_DIR, 'assets');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const CRITICAL_DIR = path.join(DIST_DIR, 'assets/css/critical');

// Map pages to their required CSS modules
const PAGE_CSS_MAP = {
    // Admin pages
    'admin/dashboard': ['admin-dashboard', 'admin-menu', 'admin-pipeline'],
    'admin/pipeline': ['admin-pipeline', 'admin-menu'],
    'admin/campaigns': ['admin-campaigns', 'admin-menu', 'admin-leads'],
    'admin/leads': ['admin-leads', 'admin-menu'],
    'admin/agents': ['admin-agents', 'admin-menu'],
    'admin/content-calendar': ['admin-content-calendar', 'admin-menu'],
    'admin/finance': ['admin-finance', 'admin-menu'],
    'admin/pricing': ['admin-pricing', 'admin-menu'],
    'admin/proposals': ['admin-proposals', 'admin-menu'],
    'admin/workflows': ['admin-workflows', 'admin-menu'],
    'admin/ecommerce': ['admin-ecommerce', 'admin-menu'],
    'admin/payments': ['admin-payments', 'admin-menu', 'admin-pipeline'],
    'admin/onboarding': ['admin-onboarding', 'admin-menu'],
    'admin/mvp-launch': ['admin-mvp-launch', 'admin-menu'],
    'admin/hr-hiring': ['admin-hr-hiring', 'admin-menu'],
    'admin/lms': ['admin-lms', 'admin-menu'],
    'admin/events': ['admin-events', 'admin-menu'],
    'admin/retention': ['admin-retention', 'admin-menu'],
    'admin/vc-readiness': ['admin-vc-readiness', 'admin-menu'],
    'admin/video-workflow': ['admin-video-workflow', 'admin-menu'],
    'admin/ai-analysis': ['admin-ai-analysis', 'admin-menu'],
    'admin/api-builder': ['admin-api-builder', 'admin-menu'],
    'admin/approvals': ['admin-approvals', 'admin-menu'],
    'admin/community': ['admin-community', 'admin-menu'],
    'admin/customer-success': ['admin-customer-success', 'admin-menu'],
    'admin/deploy': ['admin-deploy', 'admin-menu'],
    'admin/docs': ['admin-docs', 'admin-menu'],
    'admin/landing-builder': ['admin-landing-builder', 'admin-menu', 'admin-campaigns'],
    'admin/components-demo': ['admin-dashboard', 'admin-menu'],
    'admin/ui-demo': ['admin-dashboard', 'admin-menu'],

    // Portal pages
    'portal/dashboard': ['pipeline-pro', 'brand-colors', 'brand-typography'],
    'portal/pipeline': ['pipeline-pro', 'brand-colors'],
    'portal/settings': ['brand-colors', 'brand-typography'],

    // Auth pages
    'auth/login': ['admin-auth'],
    'auth/register': ['admin-auth'],
    'auth/forgot-password': ['admin-auth'],
    'auth/verify-email': ['admin-auth']
};

// Global CSS always loaded
const GLOBAL_CSS = ['m3-agency', 'responsive-enhancements', 'ui-animations'];

/**
 * Read CSS file content
 */
function readCSSFile(fileName) {
    const filePath = path.join(ASSETS_DIR, 'css', `${fileName}.css`);
    if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf8');
    }
    return '';
}

/**
 * Minify CSS content
 */
function minifyCSS(content) {
    const result = new CleanCSS({
        level: 2,
        compatibility: '*',
        rebase: false
    }).minify(content);

    if (result.errors && result.errors.length > 0) {
        console.error('CSS minification errors:', result.errors);
    }

    return result.styles;
}

/**
 * Generate critical CSS for a page
 */
function generateCriticalCSS(pagePath) {
    const requiredModules = PAGE_CSS_MAP[pagePath] || [];
    const allModules = [...GLOBAL_CSS, ...requiredModules];

    let combinedCSS = '';
    const loadedModules = [];

    for (const module of allModules) {
        const css = readCSSFile(module);
        if (css) {
            combinedCSS += `\n/* ${module}.css */\n${css}`;
            loadedModules.push(module);
        }
    }

    const minified = minifyCSS(combinedCSS);

    return {
        raw: combinedCSS,
        minified,
        modules: loadedModules,
        rawSize: Buffer.byteLength(combinedCSS, 'utf8'),
        minifiedSize: Buffer.byteLength(minified, 'utf8')
    };
}

/**
 * Generate lazy-loaded CSS bundles for non-critical modules
 */
function generateLazyBundles() {
    const lazyGroups = {
        'admin-advanced.css': [
            'admin-agents', 'admin-ai-analysis', 'admin-api-builder',
            'admin-approvals', 'admin-community', 'admin-content-calendar',
            'admin-customer-success', 'admin-deploy', 'admin-docs'
        ],
        'admin-business.css': [
            'admin-ecommerce', 'admin-events', 'admin-finance',
            'admin-hr-hiring', 'admin-lms', 'admin-payments',
            'admin-pricing', 'admin-proposals', 'admin-retention'
        ],
        'admin-launch.css': [
            'admin-mvp-launch', 'admin-onboarding', 'admin-vc-readiness',
            'admin-video-workflow', 'admin-workflows'
        ],
        'admin-specialized.css': [
            'admin-binh-phap', 'admin-landing-builder', 'admin-menu'
        ]
    };

    const results = {};

    for (const [outputName, modules] of Object.entries(lazyGroups)) {
        let combinedCSS = '';

        for (const module of modules) {
            const css = readCSSFile(module);
            if (css) {
                combinedCSS += `\n/* ${module}.css */\n${css}`;
            }
        }

        const minified = minifyCSS(combinedCSS);

        results[outputName] = {
            minified,
            modules,
            rawSize: Buffer.byteLength(combinedCSS, 'utf8'),
            minifiedSize: Buffer.byteLength(minified, 'utf8')
        };
    }

    return results;
}

/**
 * Update HTML files to use critical CSS + lazy load pattern
 */
function updateHTMLFiles() {
    const htmlDirs = [
        path.join(DIST_DIR, 'admin'),
        path.join(DIST_DIR, 'portal'),
        path.join(DIST_DIR, 'auth')
    ];

    let updatedCount = 0;

    for (const dir of htmlDirs) {
        if (!fs.existsSync(dir)) continue;

        const files = fs.readdirSync(dir, { recursive: true })
            .filter(f => f.endsWith('.html'));

        for (const file of files) {
            const filePath = path.join(dir, file);
            let content = fs.readFileSync(filePath, 'utf8');

            // Determine page path
            const relativePath = path.relative(DIST_DIR, filePath);
            const pagePath = relativePath.replace('.html', '').replace(/\\/g, '/');

            // Check if we have critical CSS for this page
            if (PAGE_CSS_MAP[pagePath]) {
                // Replace CSS links with critical CSS + lazy load pattern
                const criticalLink = `<link rel="preload" href="/assets/css/critical/${pagePath.replace('/', '-')}.css" as="style" onload="this.onload=null">`;
                const noscriptFallback = `<noscript><link rel="stylesheet" href="/assets/css/critical/${pagePath.replace('/', '-')}.css"></noscript>`;

                // Remove old CSS links, add new pattern
                content = content.replace(
                    /<link rel="stylesheet" href="[^"]*\/css\/[^"]+\.css"[^>]*>/g,
                    criticalLink + '\n        ' + noscriptFallback
                );

                updatedCount++;
            }
        }
    }

    return updatedCount;
}

/**
 * Main function
 */
function main() {
    console.log('🔧 Critical CSS Extractor - Sa Đéc Marketing Hub\n');

    // Create critical directory
    if (!fs.existsSync(CRITICAL_DIR)) {
        fs.mkdirSync(CRITICAL_DIR, { recursive: true });
    }

    // Generate critical CSS for each page
    console.log('📦 Generating page-specific critical CSS...\n');

    let totalRawSize = 0;
    let totalMinifiedSize = 0;

    for (const [pagePath, modules] of Object.entries(PAGE_CSS_MAP)) {
        const result = generateCriticalCSS(pagePath);
        const fileName = pagePath.replace(/\//g, '-') + '.css';
        const outputPath = path.join(CRITICAL_DIR, fileName);

        fs.writeFileSync(outputPath, result.minified);

        totalRawSize += result.rawSize;
        totalMinifiedSize += result.minifiedSize;

        const savings = ((1 - result.minifiedSize / result.rawSize) * 100).toFixed(1);
        console.log(`  ✓ ${pagePath} → ${fileName}`);
        console.log(`    Modules: ${result.modules.length} | Raw: ${(result.rawSize/1024).toFixed(1)}KB | Minified: ${(result.minifiedSize/1024).toFixed(1)}KB (${savings}% savings)`);
    }

    // Generate lazy bundles
    console.log('\n📦 Generating lazy-loaded bundles...\n');

    const lazyBundles = generateLazyBundles();
    const lazyDir = path.join(DIST_DIR, 'assets/css/lazy');

    if (!fs.existsSync(lazyDir)) {
        fs.mkdirSync(lazyDir, { recursive: true });
    }

    for (const [fileName, bundle] of Object.entries(lazyBundles)) {
        const outputPath = path.join(lazyDir, fileName);
        fs.writeFileSync(outputPath, bundle.minified);

        const savings = ((1 - bundle.minifiedSize / bundle.rawSize) * 100).toFixed(1);
        console.log(`  ✓ ${fileName}`);
        console.log(`    Modules: ${bundle.modules.length} | Raw: ${(bundle.rawSize/1024).toFixed(1)}KB | Minified: ${(bundle.minifiedSize/1024).toFixed(1)}KB (${savings}% savings)`);
    }

    // Summary
    console.log('\n📊 Summary:');
    console.log(`  Total pages with critical CSS: ${Object.keys(PAGE_CSS_MAP).length}`);
    console.log(`  Total raw CSS size: ${(totalRawSize / 1024).toFixed(1)} KB`);
    console.log(`  Total minified CSS size: ${(totalMinifiedSize / 1024).toFixed(1)} KB`);
    console.log(`  Average savings: ${((1 - totalMinifiedSize / totalRawSize) * 100).toFixed(1)}%`);
    console.log(`  Lazy bundles created: ${Object.keys(lazyBundles).length}`);

    // Update HTML files
    const updatedCount = updateHTMLFiles();
    console.log(`\n📝 Updated ${updatedCount} HTML files with critical CSS pattern`);

    console.log('\n✅ Critical CSS extraction complete!');
    console.log('\n💡 Usage:');
    console.log('  - Critical CSS: /assets/css/critical/{page}.css (preload + onload)');
    console.log('  - Lazy bundles: /assets/css/lazy/{bundle}.css (load on demand)');
    console.log('  - Global CSS: /assets/css/{global}.css (always loaded)');
}

main();

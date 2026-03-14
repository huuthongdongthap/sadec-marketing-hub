#!/usr/bin/env node
/**
 * Sa Đéc Marketing Hub - CSS Bundle & Minify
 * Combines and minifies CSS files for better performance
 *
 * Usage: node scripts/build/css-bundle.js
 */

const fs = require('fs');
const path = require('path');
const CleanCSS = require('clean-css');

const ROOT_DIR = path.resolve(__dirname, '../..');
const CSS_DIR = path.join(ROOT_DIR, 'assets/css');
const DIST_DIR = path.join(ROOT_DIR, 'assets/css/bundle');

// CSS files to bundle together (excluding critical ones)
const BUNDLE_GROUPS = {
    'admin-common.css': [
        'admin-dashboard.css',
        'admin-pipeline.css',
        'admin-menu.css',
        'admin-auth.css',
        'admin-legal.css',
        'admin-zalo.css',
        'admin-campaigns.css',
        'admin-leads.css',
        'admin-landing-builder.css'
    ],
    'admin-modules.css': [
        'admin-agents.css',
        'admin-ai-analysis.css',
        'admin-api-builder.css',
        'admin-approvals.css',
        'admin-binh-phap.css',
        'admin-community.css',
        'admin-content-calendar.css',
        'admin-customer-success.css',
        'admin-deploy.css',
        'admin-docs.css',
        'admin-ecommerce.css',
        'admin-events.css',
        'admin-finance.css',
        'admin-hr-hiring.css',
        'admin-lms.css',
        'admin-mvp-launch.css',
        'admin-onboarding.css',
        'admin-payments.css',
        'admin-pricing.css',
        'admin-proposals.css',
        'admin-retention.css',
        'admin-vc-readiness.css',
        'admin-video-workflow.css',
        'admin-workflows.css'
    ],
    'portal-common.css': [
        'pipeline-pro.css',
        'lazy-loading.css',
        'brand-colors.css',
        'brand-typography.css'
    ],
    'animations.css': [
        'animations/micro-animations.css',
        'ui-animations.css',
        'responsive-enhancements.css'
    ]
};

const CSS_OPTIONS = {
    level: {
        1: {
            optimizeBackground: true,
            optimizeBorder: true,
            optimizeDisplay: true,
            optimizeFilter: true,
            optimizeFont: true,
            optimizeFontWeight: true,
            optimizeOutline: true,
            removeEmpty: true,
            removeUnusedAtRules: true
        },
        2: {
            mergeAdjacentRules: true,
            mergeMediaQueries: true,
            mergeNonAdjacentRules: true,
            removeDuplicateFontRules: true,
            removeDuplicateMediaBlocks: true,
            removeDuplicateRules: true,
            restructureRules: false // Keep order for debugging
        }
    },
    compatibility: '*',
    rebase: false
};

function bundleCSS() {

    // Create dist directory
    if (!fs.existsSync(DIST_DIR)) {
        fs.mkdirSync(DIST_DIR, { recursive: true });
    }

    for (const [outputFile, inputFiles] of Object.entries(BUNDLE_GROUPS)) {
        const outputPath = path.join(DIST_DIR, outputFile);
        const inputPaths = inputFiles
            .map(f => path.join(CSS_DIR, f))
            .filter(f => fs.existsSync(f));

        if (inputPaths.length === 0) {
            continue;
        }

        try {
            // Read and combine all input files
            const combined = inputPaths.map(f => fs.readFileSync(f, 'utf8')).join('\n');

            // Minify
            const minified = new CleanCSS(CSS_OPTIONS).minify(combined);

            if (minified.errors && minified.errors.length > 0) {
                continue;
            }

            // Add source map reference
            const outputContent = `/* ${outputFile} - Bundled from ${inputPaths.length} files */\n/* Source: ${inputFiles.join(', ')} */\n\n${minified.styles}\n`;

            fs.writeFileSync(outputPath, outputContent);

            const originalSize = Buffer.byteLength(combined, 'utf8');
            const minifiedSize = Buffer.byteLength(minified.styles, 'utf8');
            const savings = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);

        } catch (error) {
        }
    }

}

function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

// Run
bundleCSS();

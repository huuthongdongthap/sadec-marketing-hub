#!/usr/bin/env node
/**
 * Sa Đéc Marketing Hub - HTML Critical CSS Injector
 * Updates HTML files to use critical CSS pattern with preload + lazy load
 *
 * Usage: node scripts/perf/inject-critical-css.js
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

// Map HTML files to their critical CSS bundles
const PAGE_CSS_MAP = {
    // Admin pages
    'admin/dashboard.html': ['admin-dashboard', 'admin-menu', 'admin-pipeline'],
    'admin/pipeline.html': ['admin-pipeline', 'admin-menu'],
    'admin/campaigns.html': ['admin-campaigns', 'admin-menu', 'admin-leads'],
    'admin/leads.html': ['admin-leads', 'admin-menu'],
    'admin/agents.html': ['admin-agents', 'admin-menu'],
    'admin/content-calendar.html': ['admin-content-calendar', 'admin-menu'],
    'admin/finance.html': ['admin-finance', 'admin-menu'],
    'admin/pricing.html': ['admin-pricing', 'admin-menu'],
    'admin/proposals.html': ['admin-proposals', 'admin-menu'],
    'admin/workflows.html': ['admin-workflows', 'admin-menu'],
    'admin/ecommerce.html': ['admin-ecommerce', 'admin-menu'],
    'admin/payments.html': ['admin-payments', 'admin-menu', 'admin-pipeline'],
    'admin/onboarding.html': ['admin-onboarding', 'admin-menu'],
    'admin/mvp-launch.html': ['admin-mvp-launch', 'admin-menu'],
    'admin/hr-hiring.html': ['admin-hr-hiring', 'admin-menu'],
    'admin/lms.html': ['admin-lms', 'admin-menu'],
    'admin/events.html': ['admin-events', 'admin-menu'],
    'admin/retention.html': ['admin-retention', 'admin-menu'],
    'admin/vc-readiness.html': ['admin-vc-readiness', 'admin-menu'],
    'admin/video-workflow.html': ['admin-video-workflow', 'admin-menu'],
    'admin/ai-analysis.html': ['admin-ai-analysis', 'admin-menu'],
    'admin/api-builder.html': ['admin-api-builder', 'admin-menu'],
    'admin/approvals.html': ['admin-approvals', 'admin-menu'],
    'admin/community.html': ['admin-community', 'admin-menu'],
    'admin/customer-success.html': ['admin-customer-success', 'admin-menu'],
    'admin/deploy.html': ['admin-deploy', 'admin-menu'],
    'admin/docs.html': ['admin-docs', 'admin-menu'],
    'admin/landing-builder.html': ['admin-landing-builder', 'admin-menu', 'admin-campaigns'],
    'admin/components-demo.html': ['admin-dashboard', 'admin-menu'],
    'admin/ui-demo.html': ['admin-dashboard', 'admin-menu'],

    // Portal pages
    'portal/dashboard.html': ['pipeline-pro', 'brand-colors', 'brand-typography'],
    'portal/pipeline.html': ['pipeline-pro', 'brand-colors'],
    'portal/settings.html': ['brand-colors', 'brand-typography'],

    // Auth pages
    'auth/login.html': ['admin-auth'],
    'auth/register.html': ['admin-auth'],
    'auth/forgot-password.html': ['admin-auth'],
    'auth/verify-email.html': ['admin-auth']
};

// Global CSS always loaded
const GLOBAL_CSS = ['m3-agency', 'responsive-enhancements', 'ui-animations'];

/**
 * Generate critical CSS link tags
 */
function generateCriticalLinks(pagePath) {
    const requiredModules = PAGE_CSS_MAP[pagePath] || [];
    const allModules = [...GLOBAL_CSS, ...requiredModules];

    const links = [];
    // Generate critical CSS filename from page path
    const criticalFileName = pagePath.replace(/\//g, '-').replace('.html', '.css');
    const fileNameOnly = path.basename(pagePath, '.html');
    const dirName = path.dirname(pagePath);

    // For admin pages, add 'admin-' prefix to critical CSS filename
    let cssFileName = fileNameOnly;
    if (dirName === 'admin') {
        cssFileName = 'admin-' + fileNameOnly;
    } else if (dirName === 'portal') {
        cssFileName = 'portal-' + fileNameOnly;
    } else if (dirName === 'auth') {
        cssFileName = 'auth-' + fileNameOnly;
    }
    const criticalCssFile = cssFileName + '.css';

    // Preload critical CSS
    links.push(`<link rel="preload" href="/assets/css/critical/${criticalCssFile}" as="style" onload="this.onload=null;this.rel='stylesheet'">`);

    // Lazy bundles for on-demand loading
    const lazyBundles = ['admin-advanced.css', 'admin-business.css', 'admin-launch.css', 'admin-specialized.css'];
    for (const bundle of lazyBundles) {
        links.push(`<link rel="preload" href="/assets/css/lazy/${bundle}" as="style" onload="this.onload=null">`);
    }

    // Noscript fallback
    links.push(`<noscript><link rel="stylesheet" href="/assets/css/critical/${criticalFileName}"></noscript>`);

    // Lazy load script for modules not in critical path
    links.push(`
<script>
// Lazy load CSS bundles when needed
function loadCSS(href) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
}

// Load lazy bundles after initial render
if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
        loadCSS('/assets/css/lazy/admin-advanced.css');
        loadCSS('/assets/css/lazy/admin-business.css');
    });
} else {
    setTimeout(() => {
        loadCSS('/assets/css/lazy/admin-advanced.css');
        loadCSS('/assets/css/lazy/admin-business.css');
    }, 300);
}
</script>`);

    return links.join('\n');
}

/**
 * Process HTML file
 */
function processHTMLFile(filePath, pagePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove existing CSS links
    content = content.replace(
        /<link[^>]*rel=["']stylesheet["'][^>]*href=["'][^"']*\/css\/[^"']*\.css["'][^>]*>/g,
        ''
    );

    // Remove empty lines from removed links
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

    // Add critical CSS links before </head>
    const criticalLinks = generateCriticalLinks(pagePath);
    content = content.replace('</head>', `${criticalLinks}\n</head>`);

    fs.writeFileSync(filePath, content, 'utf8');

    return true;
}

/**
 * Main function
 */
function main() {
    let updatedCount = 0;
    let skippedCount = 0;

    for (const [pagePath, modules] of Object.entries(PAGE_CSS_MAP)) {
        const filePath = path.join(DIST_DIR, pagePath);

        if (fs.existsSync(filePath)) {
            processHTMLFile(filePath, pagePath);
            updatedCount++;
            }`);
        } else {
            skippedCount++;
        }
    }

    `);
    }

main();

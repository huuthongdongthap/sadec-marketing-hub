#!/usr/bin/env node
/**
 * Sa Đéc Marketing Hub — Consolidated Audit Framework
 *
 * Usage:
 *   node scripts/audit/index.js              # Full audit
 *   node scripts/audit/index.js --fix        # Auto-fix issues
 *   node scripts/audit/index.js --scan links # Scan links only
 *   node scripts/audit/index.js --scan meta  # Scan meta tags only
 *   node scripts/audit/index.js --scan a11y  # Scan accessibility only
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Import scanners
const { scanLinks } = require('./scanners/links.js');
const { scanMeta } = require('./scanners/meta.js');
const { scanA11y } = require('./scanners/a11y.js');
const { scanIDs } = require('./scanners/ids.js');

// Import fixers
const { fixLinks } = require('./fixers/links.js');
const { fixMeta } = require('./fixers/meta.js');
const { fixA11y } = require('./fixers/a11y.js');

// Import reporters
const { generateMarkdownReport } = require('./report/markdown.js');
const { generateJSONReport } = require('./report/json.js');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '../..');
const SCAN_DIRS = ['admin', 'portal', 'affiliate', 'auth', ''];
const EXCLUDE_PATTERNS = ['.min.', 'node_modules', 'dist', '.git', 'test-'];

/**
 * Get all HTML files recursively
 */
function getAllHTMLFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);

        try {
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                if (!EXCLUDE_PATTERNS.some(p => filePath.includes(p))) {
                    getAllHTMLFiles(filePath, fileList);
                }
            } else if (file.endsWith('.html') && !shouldExclude(filePath)) {
                fileList.push(filePath);
            }
        } catch (err) {
            // Ignore errors
        }
    }

    return fileList;
}

/**
 * Check if file should be excluded
 */
function shouldExclude(filePath) {
    return EXCLUDE_PATTERNS.some(pattern => filePath.includes(pattern));
}

/**
 * Parse DOM from file
 */
function parseDOM(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    return new JSDOM(content);
}

/**
 * Main audit function
 */
async function audit(options = {}) {
    const {
        fix = false,
        scan = 'all', // 'all', 'links', 'meta', 'a11y', 'ids'
        output = 'markdown', // 'markdown', 'json'
        verbose = false
    } = options;

    console.log('🔍 Sa Đéc Marketing Hub — Audit Framework\n');
    console.log(`Mode: ${fix ? '🔧 Auto-Fix' : '📊 Scan Only'}`);
    console.log(`Scan: ${scan === 'all' ? 'All checks' : scan}`);
    console.log(`Output: ${output}\n`);

    // Get all HTML files
    const htmlFiles = [];
    for (const dir of SCAN_DIRS) {
        const scanDir = dir ? path.join(ROOT_DIR, dir) : ROOT_DIR;
        if (fs.existsSync(scanDir)) {
            getAllHTMLFiles(scanDir, htmlFiles);
        }
    }

    console.log(`📁 Found ${htmlFiles.length} HTML files to scan\n`);

    // Initialize results
    const results = {
        filesScanned: htmlFiles.length,
        timestamp: new Date().toISOString(),
        links: { files: [], broken: [], external: [] },
        meta: { files: [], missing: [] },
        a11y: { files: [], issues: [] },
        ids: { files: [], duplicates: [] }
    };

    // Run scanners
    if (scan === 'all' || scan === 'links') {
        console.log('⏳ Scanning links...');
        results.links = await scanLinks(htmlFiles, ROOT_DIR);
        console.log(`   Found ${results.links.broken.length} broken links\n`);
    }

    if (scan === 'all' || scan === 'meta') {
        console.log('⏳ Scanning meta tags...');
        results.meta = await scanMeta(htmlFiles, ROOT_DIR);
        console.log(`   Found ${results.meta.missing.length} missing meta tags\n`);
    }

    if (scan === 'all' || scan === 'a11y') {
        console.log('⏳ Scanning accessibility...');
        results.a11y = await scanA11y(htmlFiles, ROOT_DIR);
        console.log(`   Found ${results.a11y.issues.length} accessibility issues\n`);
    }

    if (scan === 'all' || scan === 'ids') {
        console.log('⏳ Scanning duplicate IDs...');
        results.ids = await scanIDs(htmlFiles, ROOT_DIR);
        console.log(`   Found ${results.ids.duplicates.length} duplicate IDs\n`);
    }

    // Auto-fix if requested
    if (fix) {
        console.log('🔧 Applying fixes...\n');

        if (scan === 'all' || scan === 'links') {
            const fixed = await fixLinks(results.links);
            console.log(`   ✅ Fixed ${fixed} link issues`);
        }

        if (scan === 'all' || scan === 'meta') {
            const fixed = await fixMeta(results.meta);
            console.log(`   ✅ Fixed ${fixed} meta tag issues`);
        }

        if (scan === 'all' || scan === 'a11y') {
            const fixed = await fixA11y(results.a11y);
            console.log(`   ✅ Fixed ${fixed} accessibility issues`);
        }

        console.log('');
    }

    // Generate report
    console.log(`📄 Generating ${output} report...\n`);

    let report;
    if (output === 'json') {
        report = generateJSONReport(results);
        const reportPath = path.join(ROOT_DIR, 'audit-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`📊 Report saved to: ${reportPath}`);
    } else {
        report = generateMarkdownReport(results);
        const reportPath = path.join(ROOT_DIR, 'audit-report.md');
        fs.writeFileSync(reportPath, report);
        console.log(`📄 Report saved to: ${reportPath}`);
    }

    // Summary
    console.log('\n✅ Audit Complete!\n');
    console.log('📊 Summary:');
    console.log(`   Files Scanned: ${results.filesScanned}`);
    console.log(`   Broken Links: ${results.links.broken.length}`);
    console.log(`   Missing Meta: ${results.meta.missing.length}`);
    console.log(`   A11y Issues: ${results.a11y.issues.length}`);
    console.log(`   Duplicate IDs: ${results.ids.duplicates.length}`);

    const totalIssues =
        results.links.broken.length +
        results.meta.missing.length +
        results.a11y.issues.length +
        results.ids.duplicates.length;

    const score = Math.max(0, 100 - (totalIssues * 2));
    console.log(`\n🏆 Health Score: ${score}/100 ${score >= 90 ? '✅' : score >= 70 ? '⚠️' : '❌'}`);

    return { results, report, score };
}

// CLI execution
if (require.main === module) {
    const args = process.argv.slice(2);
    const options = {};

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--fix') {
            options.fix = true;
        } else if (args[i] === '--scan' && args[i + 1]) {
            options.scan = args[++i];
        } else if (args[i] === '--output' && args[i + 1]) {
            options.output = args[++i];
        } else if (args[i] === '--verbose') {
            options.verbose = true;
        } else if (args[i] === '--help' || args[i] === '-h') {
            console.log(`
Sa Đéc Marketing Hub — Audit Framework

Usage: node scripts/audit/index.js [options]

Options:
  --fix              Auto-fix detected issues
  --scan <type>      Scan specific check (links|meta|a11y|ids|all)
  --output <format>  Output format (markdown|json)
  --verbose          Enable verbose logging
  --help, -h         Show this help message

Examples:
  node scripts/audit/index.js                    # Full audit
  node scripts/audit/index.js --fix              # Full audit + auto-fix
  node scripts/audit/index.js --scan links       # Scan links only
  node scripts/audit/index.js --output json      # JSON output
`);
            process.exit(0);
        }
    }

    audit(options).catch(console.error);
}

module.exports = { audit };

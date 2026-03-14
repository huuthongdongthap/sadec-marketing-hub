#!/usr/bin/env node

/**
 * Sa Đéc Marketing Hub - Responsive Audit Script
 * Audit responsive breakpoints coverage across all HTML/CSS files
 *
 * Usage: node scripts/audit-responsive.js
 */

const fs = require('fs');
const path = require('path');

// Config
const ROOT_DIR = process.cwd();
const REPORT_DIR = path.join(ROOT_DIR, 'reports/frontend/responsive-fix');

// Breakpoints
const BREAKPOINTS = {
    '375px': /@media\s*\(max-width:\s*375px\)|@media\s*\(max-width:\s*400px\)|--bp-mobile-small/,
    '768px': /@media\s*\(max-width:\s*768px\)|@media\s*\(max-width:\s*780px\)|--bp-mobile['"]?:\s*['"]?768/,
    '1024px': /@media\s*\(max-width:\s*1024px\)|@media\s*\(max-width:\s*1080px\)|--bp-tablet/,
};

// Find all CSS files
function findCssFiles(dir, files = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && !entry.name.startsWith('.') && !entry.name.startsWith('node_modules')) {
            findCssFiles(fullPath, files);
        } else if (entry.isFile() && entry.name.endsWith('.css')) {
            files.push(fullPath);
        }
    }
    return files;
}

// Find all HTML files
function findHtmlFiles(dir, files = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && !entry.name.startsWith('.') && !entry.name.startsWith('node_modules')) {
            findHtmlFiles(fullPath, files);
        } else if (entry.isFile() && entry.name.endsWith('.html')) {
            files.push(fullPath);
        }
    }
    return files;
}

// Analyze CSS file for breakpoints
function analyzeCssFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const result = {
        file: path.relative(ROOT_DIR, filePath),
        size: content.length,
        breakpoints: {},
        hasResponsive: false,
    };

    for (const [bp, regex] of Object.entries(BREAKPOINTS)) {
        const matches = content.match(regex);
        if (matches) {
            result.breakpoints[bp] = true;
            result.hasResponsive = true;
        } else {
            result.breakpoints[bp] = false;
        }
    }

    // Check for responsive patterns
    result.patterns = {
        flexbox: /display:\s*flex/.test(content),
        grid: /display:\s*grid/.test(content),
        touchTargets: /min-height:\s*44px|min-height:\s*var\(--touch/.test(content),
        fluidTypography: /clamp\(/.test(content) || /font-size:\s*\d+vw/.test(content),
        containerQueries: /@container/.test(content),
    };

    return result;
}

// Analyze HTML file for responsive CSS include
function analyzeHtmlFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const result = {
        file: path.relative(ROOT_DIR, filePath),
        hasResponsiveCss: false,
        responsiveCssFiles: [],
        viewportMeta: false,
    };

    // Check viewport meta
    result.viewportMeta = /<meta[^>]*name=["']viewport["']/.test(content);

    // Check for responsive CSS includes
    const cssLinks = content.match(/<link[^>]*href=["'][^"']*\.css["'][^>]*>/g) || [];
    for (const link of cssLinks) {
        if (/responsive|mobile|tablet|flex|grid/i.test(link)) {
            result.hasResponsiveCss = true;
            const href = link.match(/href=["']([^"']+)["']/);
            if (href) {
                result.responsiveCssFiles.push(href[1]);
            }
        }
    }

    return result;
}

// Generate report
function generateReport(cssResults, htmlResults) {
    const totalCssFiles = cssResults.length;
    const responsiveCssFiles = cssResults.filter(r => r.hasResponsive).length;
    const totalHtmlFiles = htmlResults.length;
    const responsiveHtmlFiles = htmlResults.filter(r => r.hasResponsiveCss || r.viewportMeta).length;

    // CSS by directory
    const cssByDir = {};
    for (const result of cssResults) {
        const dir = path.dirname(result.file);
        if (!cssByDir[dir]) cssByDir[dir] = { total: 0, responsive: 0 };
        cssByDir[dir].total++;
        if (result.hasResponsive) cssByDir[dir].responsive++;
    }

    // HTML by directory
    const htmlByDir = {};
    for (const result of htmlResults) {
        const dir = path.dirname(result.file);
        if (!htmlByDir[dir]) htmlByDir[dir] = { total: 0, responsive: 0 };
        htmlByDir[dir].total++;
        if (result.hasResponsiveCss || result.viewportMeta) htmlByDir[dir].responsive++;
    }

    const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Responsive Audit Report</title>
    <style>
        :root {
            --pass: #4caf50;
            --fail: #f44336;
            --warn: #ff9800;
            --bg: #fafafa;
            --surface: #ffffff;
            --outline: #e0e0e0;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 1400px;
            margin: 0 auto;
            padding: 24px;
            background: var(--bg);
            color: #333;
        }
        h1, h2, h3 { color: #1a1a1a; }
        .summary {
            background: var(--surface);
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 24px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .stat-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
        }
        .stat-card.green { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
        .stat-card.orange { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
        .stat-value {
            font-size: 42px;
            font-weight: bold;
        }
        .stat-label {
            font-size: 14px;
            opacity: 0.9;
            margin-top: 4px;
        }
        .section {
            background: var(--surface);
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 24px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 16px;
        }
        th, td {
            padding: 12px 16px;
            text-align: left;
            border-bottom: 1px solid var(--outline);
        }
        th {
            background: #f5f5f5;
            font-weight: 600;
        }
        tr:hover {
            background: #f9f9f9;
        }
        .pass { color: var(--pass); font-weight: 600; }
        .fail { color: var(--fail); font-weight: 600; }
        .warn { color: var(--warn); font-weight: 600; }
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 16px;
            font-size: 12px;
            font-weight: 600;
        }
        .badge-pass { background: #e8f5e9; color: var(--pass); }
        .badge-fail { background: #ffebee; color: var(--fail); }
        .coverage-bar {
            height: 8px;
            background: #e0e0e0;
            border-radius: 4px;
            overflow: hidden;
            margin-top: 8px;
        }
        .coverage-fill {
            height: 100%;
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            transition: width 0.3s ease;
        }
        .file-list {
            max-height: 300px;
            overflow-y: auto;
            border: 1px solid var(--outline);
            border-radius: 8px;
            margin-top: 12px;
        }
        .file-item {
            padding: 8px 16px;
            border-bottom: 1px solid #f0f0f0;
            font-size: 13px;
        }
        .file-item:last-child { border-bottom: none; }
        code {
            background: #f5f5f5;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 13px;
        }
    </style>
</head>
<body>
    <div class="summary">
        <h1>📱 Responsive Audit Report</h1>
        <p>Generated: ${new Date().toISOString().split('T')[0]} ${new Date().toISOString().split('T')[1].slice(0, 5)}</p>
        <p>Root: ${ROOT_DIR}</p>

        <div class="summary-grid">
            <div class="stat-card">
                <div class="stat-value">${totalCssFiles}</div>
                <div class="stat-label">CSS Files</div>
            </div>
            <div class="stat-card green">
                <div class="stat-value">${responsiveCssFiles}</div>
                <div class="stat-label">Responsive CSS</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${totalHtmlFiles}</div>
                <div class="stat-label">HTML Files</div>
            </div>
            <div class="stat-card orange">
                <div class="stat-value">${responsiveHtmlFiles}</div>
                <div class="stat-label">Responsive HTML</div>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>Breakpoint Coverage (CSS)</h2>
        <p>Files with media queries for each breakpoint:</p>
        <table>
            <tr>
                <th>Breakpoint</th>
                <th>Files</th>
                <th>Coverage</th>
            </tr>
            ${Object.entries(BREAKPOINTS).map(([bp, regex]) => {
                const count = cssResults.filter(r => r.breakpoints[bp]).length;
                const pct = ((count / totalCssFiles) * 100).toFixed(1);
                return `
            <tr>
                <td><code>${bp}</code></td>
                <td>${count}/${totalCssFiles}</td>
                <td>
                    <div class="coverage-bar">
                        <div class="coverage-fill" style="width: ${pct}%"></div>
                    </div>
                    <small>${pct}%</small>
                </td>
            </tr>
            `;
            }).join('')}
        </table>
    </div>

    <div class="section">
        <h2>Pattern Detection</h2>
        <p>Responsive design patterns found in CSS files:</p>
        <table>
            <tr>
                <th>Pattern</th>
                <th>Files</th>
                <th>Coverage</th>
            </tr>
            ${Object.entries(cssResults[0]?.patterns || {}).map(([pattern, _]) => {
                const count = cssResults.filter(r => r.patterns[pattern]).length;
                const pct = ((count / totalCssFiles) * 100).toFixed(1);
                return `
            <tr>
                <td><code>${pattern}</code></td>
                <td>${count}/${totalCssFiles}</td>
                <td>
                    <div class="coverage-bar">
                        <div class="coverage-fill" style="width: ${pct}%"></div>
                    </div>
                    <small>${pct}%</small>
                </td>
            </tr>
            `;
            }).join('')}
        </table>
    </div>

    <div class="section">
        <h2>CSS Coverage by Directory</h2>
        <table>
            <tr>
                <th>Directory</th>
                <th>Responsive/Total</th>
                <th>Coverage</th>
            </tr>
            ${Object.entries(cssByDir).map(([dir, data]) => {
                const pct = ((data.responsive / data.total) * 100).toFixed(1);
                return `
            <tr>
                <td><code>${dir}</code></td>
                <td>${data.responsive}/${data.total}</td>
                <td>
                    <span class="badge ${pct >= 80 ? 'badge-pass' : pct >= 50 ? 'badge-warn' : 'badge-fail'}">${pct}%</span>
                </td>
            </tr>
            `;
            }).join('')}
        </table>
    </div>

    <div class="section">
        <h2>HTML Coverage by Directory</h2>
        <table>
            <tr>
                <th>Directory</th>
                <th>Responsive/Total</th>
                <th>Coverage</th>
            </tr>
            ${Object.entries(htmlByDir).map(([dir, data]) => {
                const pct = ((data.responsive / data.total) * 100).toFixed(1);
                return `
            <tr>
                <td><code>${dir}</code></td>
                <td>${data.responsive}/${data.total}</td>
                <td>
                    <span class="badge ${pct >= 80 ? 'badge-pass' : pct >= 50 ? 'badge-warn' : 'badge-fail'}">${pct}%</span>
                </td>
            </tr>
            `;
            }).join('')}
        </table>
    </div>

    <div class="section">
        <h2>Files Missing Responsive CSS</h2>
        ${(() => {
            const missingFiles = cssResults.filter(r => !r.hasResponsive).map(r => r.file);
            if (missingFiles.length === 0) {
                return '<p class="pass">✅ All CSS files have responsive breakpoints!</p>';
            }
            return `
            <p class="fail">${missingFiles.length} files without responsive breakpoints:</p>
            <div class="file-list">
                ${missingFiles.slice(0, 50).map(f => `<div class="file-item"><code>${f}</code></div>`).join('')}
            </div>
            ${missingFiles.length > 50 ? `<p>...and ${missingFiles.length - 50} more</p>` : ''}
            `;
        })()}
    </div>

    <div class="section">
        <h2>Files Missing Responsive HTML</h2>
        ${(() => {
            const missingFiles = htmlResults.filter(r => !r.hasResponsiveCss && !r.viewportMeta).map(r => r.file);
            if (missingFiles.length === 0) {
                return '<p class="pass">✅ All HTML files have responsive CSS or viewport meta!</p>';
            }
            return `
            <p class="fail">${missingFiles.length} files without responsive CSS:</p>
            <div class="file-list">
                ${missingFiles.slice(0, 50).map(f => `<div class="file-item"><code>${f}</code></div>`).join('')}
            </div>
            ${missingFiles.length > 50 ? `<p>...and ${missingFiles.length - 50} more</p>` : ''}
            `;
        })()}
    </div>

    <div class="section">
        <h2>Recommendations</h2>
        <ul>
            ${(() => {
                const recs = [];
                const bp375 = cssResults.filter(r => r.breakpoints['375px']).length;
                const bp768 = cssResults.filter(r => r.breakpoints['768px']).length;
                const bp1024 = cssResults.filter(r => r.breakpoints['1024px']).length;

                if (bp375 < totalCssFiles * 0.5) recs.push('Add more 375px breakpoint coverage for small phones (iPhone SE)');
                if (bp768 < totalCssFiles * 0.7) recs.push('Increase 768px breakpoint coverage for mobile devices');
                if (bp1024 < totalCssFiles * 0.8) recs.push('Add 1024px breakpoint for tablet landscape');

                const touchTargets = cssResults.filter(r => r.patterns.touchTargets).length;
                if (touchTargets < totalCssFiles * 0.3) recs.push('Add touch target sizing (min 44px) for mobile accessibility');

                if (recs.length === 0) {
                    return '<li class="pass">✅ Responsive implementation looks great!</li>';
                }
                return recs.map(r => `<li class="warn">${r}</li>`).join('');
            })()}
        </ul>
    </div>
</body>
</html>
    `;

    return html;
}

// Main
function main() {
    console.log('📱 Responsive Audit Runner');
    console.log('===========================');
    console.log('');

    // Create report directory
    if (!fs.existsSync(REPORT_DIR)) {
        fs.mkdirSync(REPORT_DIR, { recursive: true });
    }

    // Find and analyze CSS files
    console.log('Finding CSS files...');
    const cssFiles = findCssFiles(ROOT_DIR);
    console.log(`Found ${cssFiles.length} CSS files`);

    console.log('Analyzing CSS files...');
    const cssResults = cssFiles.map(f => analyzeCssFile(f));
    const responsiveCount = cssResults.filter(r => r.hasResponsive).length;
    console.log(`  ${responsiveCount}/${cssFiles.length} files have responsive breakpoints`);

    // Find and analyze HTML files
    console.log('Finding HTML files...');
    const htmlFiles = findHtmlFiles(ROOT_DIR);
    console.log(`Found ${htmlFiles.length} HTML files`);

    console.log('Analyzing HTML files...');
    const htmlResults = htmlFiles.map(f => analyzeHtmlFile(f));
    const responsiveHtmlCount = htmlResults.filter(r => r.hasResponsiveCss || r.viewportMeta).length;
    console.log(`  ${responsiveHtmlCount}/${htmlFiles.length} files have responsive CSS or viewport`);

    // Generate report
    console.log('');
    console.log('Generating report...');
    const reportHtml = generateReport(cssResults, htmlResults);
    fs.writeFileSync(path.join(REPORT_DIR, 'responsive-audit-report.html'), reportHtml);

    // Summary
    console.log('');
    console.log('===========================');
    console.log('Audit Summary');
    console.log('===========================');
    console.log(`CSS Files:    ${cssResults.length}`);
    console.log(`  Responsive: ${responsiveCount} (${((responsiveCount/cssResults.length)*100).toFixed(1)}%)`);
    console.log(`HTML Files:   ${htmlResults.length}`);
    console.log(`  Responsive: ${responsiveHtmlCount} (${((responsiveHtmlCount/htmlResults.length)*100).toFixed(1)}%)`);
    console.log('');
    console.log(`Report: file://${path.join(REPORT_DIR, 'responsive-audit-report.html')}`);
    console.log('');
}

main();

#!/usr/bin/env node
/**
 * Sa Đéc Marketing Hub - Bundle Size Report
 * Analyzes JS/CSS bundle sizes and identifies optimization opportunities
 *
 * Usage: node scripts/perf/bundle-report.js
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT_DIR = path.resolve(__dirname, '../..');
const ASSETS_DIR = path.join(ROOT_DIR, 'assets');

// Size thresholds (in KB)
const WARN_THRESHOLD = 50;  // Warn if file > 50KB
const CRITICAL_THRESHOLD = 100; // Critical if file > 100KB

// File size tracking
const report = {
    js: { files: [], total: 0 },
    css: { files: [], total: 0 },
    summary: {}
};

/**
 * Calculate gzip size
 */
function getGzipSize(content) {
    return zlib.gzipSync(Buffer.from(content)).length;
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

/**
 * Analyze file and add to report
 */
function analyzeFile(filePath, type) {
    const content = fs.readFileSync(filePath, 'utf8');
    const rawSize = Buffer.byteLength(content, 'utf8');
    const gzipSize = getGzipSize(content);

    const relativePath = path.relative(ROOT_DIR, filePath);
    const fileName = path.basename(filePath);

    const entry = {
        path: relativePath,
        name: fileName,
        rawSize,
        gzipSize,
        ratio: ((gzipSize / rawSize) * 100).toFixed(1) + '%'
    };

    // Determine severity
    const sizeKB = rawSize / 1024;
    if (sizeKB > CRITICAL_THRESHOLD) {
        entry.severity = 'critical';
    } else if (sizeKB > WARN_THRESHOLD) {
        entry.severity = 'warning';
    } else {
        entry.severity = 'ok';
    }

    report[type].files.push(entry);
    report[type].total += rawSize;

    return entry;
}

/**
 * Scan directory for files
 */
function scanDirectory(dir, extensions, type) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir, { recursive: true });

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isFile() && extensions.some(ext => file.endsWith(ext))) {
            // Skip minified files and node_modules
            if (file.includes('.min.') || file.includes('node_modules')) continue;

            try {
                analyzeFile(filePath, type);
            } catch (error) {
            }
        }
    }
}

/**
 * Print report
 */
function printReport() {

    // JavaScript Report

    report.js.files
        .sort((a, b) => b.rawSize - a.rawSize)
        .forEach(file => {
            const icon = file.severity === 'critical' ? '🔴' :
                        file.severity === 'warning' ? '🟡' : '🟢';
            +
                formatBytes(file.rawSize).padStart(10) +
                formatBytes(file.gzipSize).padStart(10) +
                file.ratio.padStart(8) +
                `  ${icon}`
            );
        });

    // CSS Report

    report.css.files
        .sort((a, b) => b.rawSize - a.rawSize)
        .forEach(file => {
            const icon = file.severity === 'critical' ? '🔴' :
                        file.severity === 'warning' ? '🟡' : '🟢';
            +
                formatBytes(file.rawSize).padStart(10) +
                formatBytes(file.gzipSize).padStart(10) +
                file.ratio.padStart(8) +
                `  ${icon}`
            );
        });

    // Summary & Recommendations

    const totalSize = report.js.total + report.css.total;
    const totalFiles = report.js.files.length + report.css.files.length;
    const criticalFiles = [...report.js.files, ...report.css.files]
        .filter(f => f.severity === 'critical');
    const warningFiles = [...report.js.files, ...report.css.files]
        .filter(f => f.severity === 'warning');

    if (criticalFiles.length > 0 || warningFiles.length > 0) {

        criticalFiles.forEach(file => {
        });

        warningFiles.forEach(file => {
        });
    }

}

/**
 * Main function
 */
function main() {

    // Scan JS files
    scanDirectory(path.join(ASSETS_DIR, 'js'), ['.js'], 'js');

    // Scan CSS files
    scanDirectory(path.join(ASSETS_DIR, 'css'), ['.css'], 'css');

    // Print report
    printReport();

    // Save report to file
    const reportPath = path.join(ROOT_DIR, 'reports', 'bundle-report.json');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
}

main();

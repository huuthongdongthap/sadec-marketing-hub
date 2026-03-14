/**
 * Responsive Audit Script
 * Quét HTML files để tìm responsive issues
 * Breakpoints: 375px (mobile small), 768px (mobile), 1024px (tablet)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..', '..');

const CONFIG = {
    htmlDirs: ['portal', 'admin'],
    excludeDirs: ['node_modules', 'dist', 'components'],
    breakpoints: {
        mobile: 375,
        tablet: 768,
        desktop: 1024
    }
};

function getAllHtmlFiles(dir, files = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (!CONFIG.excludeDirs.includes(entry.name) && !entry.name.startsWith('.')) {
                getAllHtmlFiles(fullPath, files);
            }
        } else if (entry.isFile() && entry.name.endsWith('.html')) {
            files.push({ path: fullPath, relPath: path.relative(rootDir, fullPath) });
        }
    }
    return files;
}

function checkResponsiveIssues(htmlPath, relPath) {
    const content = fs.readFileSync(htmlPath, 'utf8');
    const issues = [];

    // Check 1: Missing responsive CSS includes
    const hasResponsiveEnhancements = content.includes('responsive-enhancements.css');
    const hasResponsiveFix2026 = content.includes('responsive-fix-2026.css');
    const hasBundleResponsive = content.includes('responsive.css') || content.includes('mobile.css');

    if (!hasResponsiveEnhancements && !hasResponsiveFix2026 && !hasBundleResponsive) {
        issues.push({
            type: 'MISSING_RESPONSIVE_CSS',
            severity: 'HIGH',
            message: 'Thiếu responsive CSS file',
            suggestion: 'Thêm <link rel="stylesheet" href="/assets/css/responsive-enhancements.css">'
        });
    }

    // Check 2: Missing viewport meta tag
    const hasViewport = content.includes('<meta name="viewport"');
    if (!hasViewport) {
        issues.push({
            type: 'MISSING_VIEWPORT',
            severity: 'CRITICAL',
            message: 'Thiếu viewport meta tag',
            suggestion: 'Thêm <meta name="viewport" content="width=device-width, initial-scale=1">'
        });
    }

    // Check 3: Fixed width elements (potential issues on mobile)
    // Only flag actual width: not max-width:
    const fixedWidthMatches = content.matchAll(/style=["'][^"']*(?<!max-)width:\s*(\d+)px/gi);
    const largeFixedWidths = [];
    for (const match of fixedWidthMatches) {
        // Skip if this is part of max-width
        const fullMatch = match[0];
        if (!fullMatch.includes('max-width') && !fullMatch.includes('min-width')) {
            const width = parseInt(match[1]);
            if (width > 300) {
                largeFixedWidths.push(width);
            }
        }
    }
    if (largeFixedWidths.length > 0) {
        issues.push({
            type: 'FIXED_WIDTH_ELEMENTS',
            severity: 'MEDIUM',
            message: `Có ${largeFixedWidths.length} phần tử có width cố định > 300px: ${[...new Set(largeFixedWidths)].join(', ')}px`,
            suggestion: 'Sử dụng max-width hoặc % units thay vì fixed width'
        });
    }

    // Check 4: Missing touch-friendly targets (buttons/links without min-size)
    const hasSmallButtons = content.match(/class=["'][^"']*(btn|button)[^"']*["'][^>]*style=["'][^"']*padding:\s*\d+px/gi);
    if (hasSmallButtons && hasSmallButtons.length > 0) {
        issues.push({
            type: 'SMALL_TOUCH_TARGETS',
            severity: 'MEDIUM',
            message: `Có ${hasSmallButtons.length} buttons có thể quá nhỏ cho mobile`,
            suggestion: 'Đảm bảo touch targets >= 44x44px'
        });
    }

    // Check 5: Check for horizontal scroll risk (wide tables, grids)
    const hasWideTables = content.includes('<table') && !content.includes('table-responsive');
    if (hasWideTables) {
        issues.push({
            type: 'WIDE_TABLE_RISK',
            severity: 'LOW',
            message: 'Có table mà không có class responsive',
            suggestion: 'Thêm class "table-responsive" hoặc wrapper với overflow-x: auto'
        });
    }

    return issues;
}

// Main
, ${CONFIG.breakpoints.tablet}px (tablet), ${CONFIG.breakpoints.desktop}px (desktop)\n`);

const allHtmlFiles = [];
CONFIG.htmlDirs.forEach(dir => {
    const dirPath = path.join(rootDir, dir);
    if (fs.existsSync(dirPath)) {
        allHtmlFiles.push(...getAllHtmlFiles(dirPath));
    }
});

const issuesByFile = new Map();
const issuesByType = new Map();

for (const { path: filePath, relPath } of allHtmlFiles) {
    try {
        const issues = checkResponsiveIssues(filePath, relPath);
        if (issues.length > 0) {
            issuesByFile.set(relPath, issues);
            issues.forEach(issue => {
                issuesByType.set(issue.type, (issuesByType.get(issue.type) || 0) + 1);
            });
        }
    } catch (error) {
        console.error(`❌ ${relPath}: ${error.message}`);
    }
}

// Summary
].reduce((a, b) => a + b, 0)}\n`);

if (issuesByType.size > 0) {
    for (const [type, count] of Object.entries(issuesByType)) {
        }
    }

// Show top issues
if (issuesByFile.size > 0) {
    :\n');
    const sortedFiles = [...issuesByFile.entries()]
        .sort((a, b) => b[1].length - a[1].length)
        .slice(0, 20);

    for (const [file, issues] of sortedFiles) {
        issues.forEach(issue => {
            });
        }
}

// Save report
const reportDir = path.join(rootDir, 'reports', 'audit');
fs.mkdirSync(reportDir, { recursive: true });
const reportPath = path.join(reportDir, `responsive-audit-${new Date().toISOString().split('T')[0]}.json`);
fs.writeFileSync(reportPath, JSON.stringify({
    summary: {
        totalFiles: allHtmlFiles.length,
        filesWithIssues: issuesByFile.size,
        totalIssues: [...issuesByType.values()].reduce((a, b) => a + b, 0),
        issuesByType: Object.fromEntries(issuesByType)
    },
    issues: Object.fromEntries(issuesByFile)
}, null, 2));

#!/usr/bin/env node
/**
 * 🕵️  SADÉC MARKETING HUB — COMPREHENSIVE AUDIT SCRIPT
 * Quét: Broken Links, Meta Tags, Accessibility Issues
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = 'assets';
const HTML_DIR = '.';
const REPORTS_DIR = 'reports/dev/bug-sprint';

// Tạo thư mục reports
if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

const results = {
    brokenLinks: [],
    metaIssues: [],
    accessibilityIssues: [],
    consoleStatements: [],
    summary: {}
};

// ============================================
// 1. BROKEN LINKS SCANNER
// ============================================
function scanBrokenLinks(dir, relativePath = '') {
    const files = fs.readdirSync(path.join(ROOT_DIR, dir));

    files.forEach(file => {
        const fullPath = path.join(ROOT_DIR, dir, file);
        const relPath = path.join(relativePath, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() && !file.startsWith('.')) {
            scanBrokenLinks(path.join(dir, file), relPath);
        } else if (file.endsWith('.html')) {
            const content = fs.readFileSync(fullPath, 'utf8');

            // Tìm tất cả href attributes
            const hrefRegex = /href=["']([^"']+)["']/g;
            let match;
            while ((match = hrefRegex.exec(content)) !== null) {
                const href = match[1];
                const lineNum = content.substring(0, match.index).split('\n').length;

                // Bỏ qua external links, anchors, tel:, mailto:, javascript:
                if (href.startsWith('http') || href.startsWith('mailto:') ||
                    href.startsWith('tel:') || href.startsWith('javascript:') ||
                    href.startsWith('#')) {
                    continue;
                }

                // Check relative links
                if (!href.startsWith('/')) {
                    const fileDir = path.dirname(fullPath);
                    const resolved = path.resolve(fileDir, href.split('?')[0].split('#')[0]);
                    if (!fs.existsSync(resolved)) {
                        results.brokenLinks.push({
                            file: relPath,
                            href: href,
                            line: lineNum,
                            issue: 'File không tồn tại'
                        });
                    }
                } else {
                    // Absolute paths từ root
                    const resolved = path.resolve(ROOT_DIR, href.substring(1).split('?')[0].split('#')[0]);
                    if (!fs.existsSync(resolved)) {
                        results.brokenLinks.push({
                            file: relPath,
                            href: href,
                            line: lineNum,
                            issue: 'File không tồn tại (absolute path)'
                        });
                    }
                }
            }
        }
    });
}

// ============================================
// 2. META TAGS SCANNER
// ============================================
function scanMetaTags(dir, relativePath = '') {
    const files = fs.readdirSync(path.join(ROOT_DIR, dir));

    files.forEach(file => {
        const fullPath = path.join(ROOT_DIR, dir, file);
        const relPath = path.join(relativePath, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() && !file.startsWith('.')) {
            scanMetaTags(path.join(dir, file), relPath);
        } else if (file.endsWith('.html')) {
            const content = fs.readFileSync(fullPath, 'utf8');

            // Check required meta tags
            const hasViewport = /<meta[^>]*name=["']viewport["']/.test(content);
            const hasDescription = /<meta[^>]*name=["']description["']/.test(content);
            const hasTitle = /<title>.*<\/title>/.test(content);
            const hasCharset = /<meta[^>]*charset=["']utf-8["']/.test(content);

            if (!hasTitle) {
                results.metaIssues.push({
                    file: relPath,
                    issue: 'THIẾU <title> tag',
                    severity: 'HIGH'
                });
            }
            if (!hasViewport) {
                results.metaIssues.push({
                    file: relPath,
                    issue: 'THIẾU viewport meta tag (mobile responsiveness)',
                    severity: 'HIGH'
                });
            }
            if (!hasDescription) {
                results.metaIssues.push({
                    file: relPath,
                    issue: 'THIẾU description meta tag (SEO)',
                    severity: 'MEDIUM'
                });
            }
            if (!hasCharset) {
                results.metaIssues.push({
                    file: relPath,
                    issue: 'THIẾU charset meta tag',
                    severity: 'MEDIUM'
                });
            }

            // Check duplicate meta tags
            const viewportMatches = content.match(/<meta[^>]*name=["']viewport["']/g);
            if (viewportMatches && viewportMatches.length > 1) {
                results.metaIssues.push({
                    file: relPath,
                    issue: 'DUPLICATE viewport meta tag (' + viewportMatches.length + ' lần)',
                    severity: 'MEDIUM'
                });
            }
        }
    });
}

// ============================================
// 3. ACCESSIBILITY SCANNER
// ============================================
function scanAccessibility(dir, relativePath = '') {
    const files = fs.readdirSync(path.join(ROOT_DIR, dir));

    files.forEach(file => {
        const fullPath = path.join(ROOT_DIR, dir, file);
        const relPath = path.join(relativePath, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() && !file.startsWith('.')) {
            scanAccessibility(path.join(dir, file), relPath);
        } else if (file.endsWith('.html')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const lines = content.split('\n');

            lines.forEach((line, idx) => {
                // Check images without alt
                if (/<img[^>]*>/i.test(line) && !/alt=["'][^"']*["']/i.test(line)) {
                    results.accessibilityIssues.push({
                        file: relPath,
                        line: idx + 1,
                        issue: 'IMG không có alt attribute (WCAG 1.1.1)',
                        wcag: '1.1.1 Non-text Content',
                        severity: 'HIGH'
                    });
                }

                // Check buttons without accessible text
                if (/<button[^>]*>[\s]*<\/button>/i.test(line.trim())) {
                    results.accessibilityIssues.push({
                        file: relPath,
                        line: idx + 1,
                        issue: 'BUTTON không có nội dung (WCAG 4.1.2)',
                        wcag: '4.1.2 Name, Role, Value',
                        severity: 'HIGH'
                    });
                }

                // Check links without text
                if (/<a[^>]*>[\s]*<\/a>/i.test(line.trim()) && !/aria-label/i.test(line)) {
                    results.accessibilityIssues.push({
                        file: relPath,
                        line: idx + 1,
                        issue: 'LINK không có nội dung (WCAG 2.4.4)',
                        wcag: '2.4.4 Link Purpose',
                        severity: 'MEDIUM'
                    });
                }

                // Check form inputs without labels
                if (/<input[^>]*>/i.test(line) && !/id=["']/i.test(line) && !/aria-label/i.test(line)) {
                    results.accessibilityIssues.push({
                        file: relPath,
                        line: idx + 1,
                        issue: 'INPUT không có id hoặc aria-label (WCAG 1.3.1)',
                        wcag: '1.3.1 Info and Relationships',
                        severity: 'MEDIUM'
                    });
                }
            });
        }
    });
}

// ============================================
// 4. CONSOLE STATEMENTS SCANNER (JS files)
// ============================================
function scanConsoleStatements(dir, relativePath) {
    const jsDir = path.join(ROOT_DIR, 'js');
    if (!fs.existsSync(jsDir)) return;

    function scanDir(currentDir, relPath) {
        const currentFiles = fs.readdirSync(currentDir);
        currentFiles.forEach(file => {
            const fullPath = path.join(currentDir, file);
            const fileRelPath = path.join(relPath, file);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory() && !file.startsWith('.')) {
                scanDir(fullPath, fileRelPath);
            } else if (file.endsWith('.js')) {
                const content = fs.readFileSync(fullPath, 'utf8');
                const lines = content.split('\n');

                lines.forEach((line, idx) => {
                    if (/console\.(log|error|warn|debug)/i.test(line)) {
                        results.consoleStatements.push({
                            file: fileRelPath,
                            line: idx + 1,
                            statement: line.trim().substring(0, 80)
                        });
                    }
                });
            }
        });
    }

    scanDir(jsDir, 'js');
}

// ============================================
// RUN ALL SCANS
// ============================================
console.log('🔍 Bắt đầu quét Sadéc Marketing Hub...\n');

console.log('1. 📌 Quét broken links...');
scanBrokenLinks(HTML_DIR);
console.log('   → Tìm thấy ' + results.brokenLinks.length + ' broken links');

console.log('2. 🏷️  Quét meta tags...');
scanMetaTags(HTML_DIR);
console.log('   → Tìm thấy ' + results.metaIssues.length + ' vấn đề meta tags');

console.log('3. ♿ Quét accessibility...');
scanAccessibility(HTML_DIR);
console.log('   → Tìm thấy ' + results.accessibilityIssues.length + ' accessibility issues');

console.log('4. 📝 Quét console statements...');
scanConsoleStatements('js');
console.log('   → Tìm thấy ' + results.consoleStatements.length + ' console statements');

// ============================================
// SUMMARY
// ============================================
results.summary = {
    totalBrokenLinks: results.brokenLinks.length,
    totalMetaIssues: results.metaIssues.length,
    totalAccessibilityIssues: results.accessibilityIssues.length,
    totalConsoleStatements: results.consoleStatements.length,
    highSeverity: results.metaIssues.filter(function(i) { return i.severity === 'HIGH'; }).length +
                  results.accessibilityIssues.filter(function(i) { return i.severity === 'HIGH'; }).length,
    mediumSeverity: results.metaIssues.filter(function(i) { return i.severity === 'MEDIUM'; }).length +
                    results.accessibilityIssues.filter(function(i) { return i.severity === 'MEDIUM'; }).length
};

// Save reports
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
fs.writeFileSync(REPORTS_DIR + '/audit-' + timestamp + '.json', JSON.stringify(results, null, 2));

console.log('\n✅ Đã lưu báo cáo vào: ' + REPORTS_DIR + '/audit-' + timestamp + '.json');
console.log('\n=== SUMMARY ===');
console.log('Broken Links: ' + results.summary.totalBrokenLinks);
console.log('Meta Issues: ' + results.summary.totalMetaIssues);
console.log('Accessibility Issues: ' + results.summary.totalAccessibilityIssues);
console.log('Console Statements: ' + results.summary.totalConsoleStatements);

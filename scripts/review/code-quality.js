#!/usr/bin/env node
/**
 * Sa Đéc Marketing Hub - Code Quality Review
 * Reviews code patterns, dead code, duplicates, and quality issues
 *
 * Usage: node scripts/review/code-quality.js
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../..');
const SCAN_DIRS = ['admin', 'portal', 'affiliate', 'auth', 'assets/js', 'assets/css', ''];
const EXCLUDE_PATTERNS = ['node_modules', '.git', 'dist', '.min.', 'test-', 'fixtures'];

const reviewResults = {
    filesScanned: 0,
    deadCode: [],
    codeSmells: [],
    duplicates: [],
    longFunctions: [],
    complexFunctions: [],
    namingIssues: [],
    securityIssues: [],
    summary: {}
};

// Patterns to detect
const PATTERNS = {
    // Dead code patterns
    unusedFunction: /function\s+(\w+)\s*\([^)]*\)\s*\{[\s\S]*?\}(?=\s*(?:function|const|let|var|\/\/|\/\*))/g,
    commentedCode: /\/\/\s*(TODO|FIXME|XXX|HACK|BUG)/gi,
    unreachableCode: /return\s*;?\s*(?:\/\/.*)?\n\s*(?:[a-zA-Z_$][\w$]*\s*[=.(]|if\s*\(|for\s*\(|while\s*\()/g,

    // Code smells
    longFunction: /function\s*\w*\s*\([^)]*\)\s*\{([\s\S]*?)\}/g,
    deepNesting: /if\s*\([^)]+\)\s*\{[^}]*if\s*\([^)]+\)\s*\{[^}]*if\s*\([^)]+\)/g,
    magicNumbers: /[^a-zA-Z_$](\d{4,})/g,

    // Security issues
    evalUsage: /\b(eval|setTimeout|setInterval)\s*\(\s*[^)]*\)/g,
    innerHTML: /\.innerHTML\s*=/g,
    documentWrite: /document\.write\s*\(/g,

    // Naming issues
    singleCharVar: /(?:var|let|const)\s+([a-z])\s*=/g,
    nonDescriptiveName: /(?:var|let|const)\s+(data|obj|temp|tmp|foo|bar)\s*=/gi
};

/**
 * Check if file should be excluded
 */
function shouldExclude(filePath) {
    return EXCLUDE_PATTERNS.some(pattern => filePath.toLowerCase().includes(pattern.toLowerCase()));
}

/**
 * Get all JS/TS/CSS files
 */
function getAllFiles(dir, extensions = ['.js', '.ts', '.css'], fileList = []) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);

        try {
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                if (!shouldExclude(filePath)) {
                    getAllFiles(filePath, extensions, fileList);
                }
            } else if (extensions.some(ext => file.endsWith(ext)) && !shouldExclude(filePath)) {
                fileList.push(filePath);
            }
        } catch (err) {
        }
    }

    return fileList;
}

/**
 * Check for dead code
 */
function checkDeadCode(filePath, content) {
    const issues = [];
    const relativePath = path.relative(ROOT_DIR, filePath);

    // Check for commented code blocks
    const commentBlocks = content.match(/\/\*[\s\S]*?\*\//g) || [];
    commentBlocks.forEach((block, idx) => {
        const lines = block.split('\n').length;
        if (lines > 10) {
            issues.push({
                file: relativePath,
                type: 'dead-code',
                severity: 'warning',
                issue: `Large comment block (${lines} lines) - possibly commented-out code`,
                line: content.substring(0, content.indexOf(block)).split('\n').length
            });
        }
    });

    // Check for TODO/FIXME comments
    const todos = content.match(PATTERNS.commentedCode) || [];
    if (todos.length > 3) {
        issues.push({
            file: relativePath,
            type: 'tech-debt',
            severity: 'info',
            issue: `${todos.length} TODO/FIXME comments found`,
            line: 1
        });
    }

    return issues;
}

/**
 * Check for code smells
 */
function checkCodeSmells(filePath, content) {
    const issues = [];
    const relativePath = path.relative(ROOT_DIR, filePath);
    const lines = content.split('\n');

    // Check function length
    const functions = content.match(/(?:async\s+)?function\s+\w+\s*\([^)]*\)\s*\{([\s\S]*?)\n\}/g) || [];
    functions.forEach(func => {
        const funcLines = func.split('\n').length;
        if (funcLines > 50) {
            issues.push({
                file: relativePath,
                type: 'code-smell',
                severity: 'warning',
                issue: `Long function (${funcLines} lines) - consider breaking into smaller functions`,
                line: lines.findIndex(l => l.includes('function')) + 1
            });
        }
    });

    // Check for deep nesting
    const deepNesting = content.match(PATTERNS.deepNesting);
    if (deepNesting) {
        issues.push({
            file: relativePath,
            type: 'code-smell',
            severity: 'warning',
            issue: 'Deep nesting detected - consider refactoring with early returns or helper functions',
            line: lines.findIndex(l => l.includes('if')) + 1
        });
    }

    // Check for magic numbers
    const magicNumbers = content.match(PATTERNS.magicNumbers) || [];
    if (magicNumbers.length > 5) {
        issues.push({
            file: relativePath,
            type: 'code-smell',
            severity: 'info',
            issue: `${magicNumbers.length} magic numbers found - consider using named constants`,
            line: 1
        });
    }

    // Check for single character variable names (excluding loop counters)
    const singleCharVars = [...content.matchAll(PATTERNS.singleCharVar)];
    const problematic = singleCharVars.filter(match => {
        const line = lines.find(l => l.includes(match[0]));
        return line && !line.includes('for') && !line.includes('i++') && !line.includes('j++');
    });
    if (problematic.length > 0) {
        issues.push({
            file: relativePath,
            type: 'naming',
            severity: 'info',
            issue: `${problematic.length} single-character variable names - use descriptive names`,
            line: 1
        });
    }

    return issues;
}

/**
 * Check for security issues
 */
function checkSecurity(filePath, content) {
    const issues = [];
    const relativePath = path.relative(ROOT_DIR, filePath);
    const lines = content.split('\n');

    // Check for eval usage
    const evalUsage = content.match(PATTERNS.evalUsage) || [];
    evalUsage.forEach(match => {
        issues.push({
            file: relativePath,
            type: 'security',
            severity: 'error',
            issue: 'eval() usage detected - potential security risk',
            line: lines.findIndex(l => l.includes('eval')) + 1
        });
    });

    // Check for innerHTML usage (XSS risk)
    const innerHTML = content.match(PATTERNS.innerHTML) || [];
    if (innerHTML) {
        issues.push({
            file: relativePath,
            type: 'security',
            severity: 'warning',
            issue: `${innerHTML.length} innerHTML assignments - ensure content is sanitized to prevent XSS`,
            line: lines.findIndex(l => l.includes('innerHTML')) + 1
        });
    }

    // Check for document.write
    const docWrite = content.match(PATTERNS.documentWrite) || [];
    if (docWrite) {
        issues.push({
            file: relativePath,
            type: 'security',
            severity: 'warning',
            issue: 'document.write() usage - consider using DOM manipulation methods',
            line: lines.findIndex(l => l.includes('document.write')) + 1
        });
    }

    // Check for potential secrets/API keys
    const secretPatterns = [
        /(?:api[_-]?key|apikey)\s*[=:]\s*["'][^"']{10,}["']/gi,
        /(?:secret|password|passwd|pwd)\s*[=:]\s*["'][^"']{4,}["']/gi,
        /(?:token|auth)\s*[=:]\s*["'][^"']{20,}["']/gi
    ];

    secretPatterns.forEach(pattern => {
        const matches = content.match(pattern) || [];
        if (matches.length > 0 && !filePath.includes('.env')) {
            issues.push({
                file: relativePath,
                type: 'security',
                severity: 'error',
                issue: `Potential hardcoded secret detected (${matches.length} occurrences)`,
                line: 1
            });
        }
    });

    return issues;
}

/**
 * Check for duplicate code patterns
 */
function checkDuplicates(filePath, content) {
    const issues = [];
    const relativePath = path.relative(ROOT_DIR, filePath);

    // Simple duplicate detection - look for repeated code blocks
    const lines = content.split('\n').filter(l => l.trim().length > 0 && !l.trim().startsWith('//'));
    const lineCount = new Map();

    lines.forEach((line, idx) => {
        const normalized = line.trim().replace(/\s+/g, ' ');
        if (normalized.length > 50) { // Only check substantial lines
            if (!lineCount.has(normalized)) {
                lineCount.set(normalized, []);
            }
            lineCount.get(normalized).push(idx + 1);
        }
    });

    const duplicates = [...lineCount.entries()].filter(([_, lines]) => lines.length > 2);
    if (duplicates.length > 0) {
        issues.push({
            file: relativePath,
            type: 'duplicate',
            severity: 'info',
            issue: `${duplicates.length} duplicate code patterns found - consider extracting to functions`,
            line: 1
        });
    }

    return issues;
}

/**
 * Review a single file
 */
function reviewFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    if (!['.js', '.ts'].includes(ext)) return [];

    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const issues = [];

        issues.push(...checkDeadCode(filePath, content));
        issues.push(...checkCodeSmells(filePath, content));
        issues.push(...checkSecurity(filePath, content));
        issues.push(...checkDuplicates(filePath, content));

        return issues;
    } catch (error) {
        return [{
            file: path.relative(ROOT_DIR, filePath),
            type: 'error',
            severity: 'error',
            issue: `Error reading file: ${error.message}`,
            line: 1
        }];
    }
}

/**
 * Generate report
 */
function generateReport(issues) {
    const byType = {};
    const bySeverity = { error: [], warning: [], info: [] };
    const byFile = {};

    issues.forEach(issue => {
        // Group by type
        if (!byType[issue.type]) byType[issue.type] = [];
        byType[issue.type].push(issue);

        // Group by severity
        bySeverity[issue.severity].push(issue);

        // Group by file
        if (!byFile[issue.file]) byFile[issue.file] = [];
        byFile[issue.file].push(issue);
    });

    let report = `# Code Quality Review Report

**Generated:** ${new Date().toISOString()}
**Files Scanned:** ${reviewResults.filesScanned}
**Total Issues:** ${issues.length}

---

## Summary

| Severity | Count |
|----------|-------|
| 🔴 Errors | ${bySeverity.error.length} |
| 🟡 Warnings | ${bySeverity.warning.length} |
| ℹ️ Info | ${bySeverity.info.length} |

---

## Issues by Type

| Type | Count |
|------|-------|
| Dead Code | ${byType['dead-code']?.length || 0} |
| Tech Debt | ${byType['tech-debt']?.length || 0} |
| Code Smell | ${byType['code-smell']?.length || 0} |
| Naming | ${byType['naming']?.length || 0} |
| Security | ${byType['security']?.length || 0} |
| Duplicate | ${byType['duplicate']?.length || 0} |

---

## 🔴 Critical Issues

`;

    if (bySeverity.error.length === 0) {
        report += `✅ No critical issues found!\n\n`;
    } else {
        bySeverity.error.forEach(issue => {
            report += `### ${issue.file}\n`;
            report += `- **Line ${issue.line}:** ${issue.issue}\n\n`;
        });
    }

    report += `---

## 🟡 Warnings

`;

    const warnings = bySeverity.warning.slice(0, 20);
    if (warnings.length === 0) {
        report += `✅ No warnings!\n\n`;
    } else {
        warnings.forEach(issue => {
            report += `- **${issue.file}** (Line ${issue.line}): ${issue.issue}\n`;
        });
        if (bySeverity.warning.length > 20) {
            report += `\n... and ${bySeverity.warning.length - 20} more warnings\n`;
        }
    }

    report += `

---

## 📁 Files with Most Issues

`;

    const topFiles = Object.entries(byFile)
        .sort(([, a], [, b]) => b.length - a.length)
        .slice(0, 10);

    topFiles.forEach(([file, fileIssues]) => {
        report += `### ${file} (${fileIssues.length} issues)\n`;
        const byTypeFile = {};
        fileIssues.forEach(i => {
            if (!byTypeFile[i.type]) byTypeFile[i.type] = [];
            byTypeFile[i.type].push(i);
        });
        Object.entries(byTypeFile).forEach(([type, typeIssues]) => {
            report += `- ${type}: ${typeIssues.length}\n`;
        });
        report += `\n`;
    });

    report += `---

## Recommendations

1. **Fix all security errors** - Remove eval(), sanitize innerHTML usage
2. **Refactor long functions** - Break functions >50 lines into smaller units
3. **Reduce nesting** - Use early returns and guard clauses
4. **Use descriptive names** - Replace single-char variables
5. **Extract duplicates** - Create reusable functions for repeated patterns
6. **Address tech debt** - Review TODO/FIXME comments

---

## Quality Score

`;

    const errorWeight = 10;
    const warningWeight = 3;
    const infoWeight = 1;
    const totalWeight = (bySeverity.error.length * errorWeight) +
                       (bySeverity.warning.length * warningWeight) +
                       (bySeverity.info.length * infoWeight);

    let score = Math.max(0, 100 - totalWeight);

    if (score >= 90) {
        report += `🟢 **${score}/100** - Excellent\n`;
    } else if (score >= 70) {
        report += `🟡 **${score}/100** - Good\n`;
    } else if (score >= 50) {
        report += `🟠 **${score}/100** - Needs Improvement\n`;
    } else {
        report += `🔴 **${score}/100** - Critical\n`;
    }

    return report;
}

/**
 * Main review function
 */
function runReview() {

    const allFiles = [];
    for (const dir of SCAN_DIRS) {
        const dirPath = path.join(ROOT_DIR, dir);
        if (fs.existsSync(dirPath)) {
            allFiles.push(...getAllFiles(dirPath));
        }
    }

    const allIssues = [];
    for (const file of allFiles) {
        reviewResults.filesScanned++;
        const issues = reviewFile(file);
        allIssues.push(...issues);

        if (reviewResults.filesScanned % 50 === 0) {
            process.stdout.write('.');
        }
    }

    // Generate and save report
    const report = generateReport(allIssues);
    const reportPath = path.join(ROOT_DIR, 'reports', 'dev', 'pr-review', 'code-quality.md');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, report, 'utf8');

    // Save JSON data
    const jsonPath = path.join(ROOT_DIR, 'reports', 'dev', 'pr-review', 'code-quality.json');
    fs.writeFileSync(jsonPath, JSON.stringify(allIssues, null, 2), 'utf8');
}

runReview();

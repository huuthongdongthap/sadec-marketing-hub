#!/usr/bin/env node
/**
 * Sa Đéc Marketing Hub - Dead Code Detector
 * Detects unused functions, unreachable code, and dead code
 *
 * Usage: node scripts/review/dead-code.js
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../..');
const SCAN_DIRS = ['assets/js', 'admin', 'portal', 'affiliate', 'auth'];
const EXCLUDE_PATTERNS = ['node_modules', '.git', 'dist', '.min.', 'test-', 'fixtures'];

const results = {
    filesScanned: 0,
    unusedFunctions: [],
    unreachableCode: [],
    commentedCode: [],
    duplicateFunctions: [],
    summary: {}
};

/**
 * Check if file should be excluded
 */
function shouldExclude(filePath) {
    return EXCLUDE_PATTERNS.some(pattern => filePath.toLowerCase().includes(pattern.toLowerCase()));
}

/**
 * Get all JS files
 */
function getAllJSFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        try {
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                if (!shouldExclude(filePath)) {
                    getAllJSFiles(filePath, fileList);
                }
            } else if (file.endsWith('.js') && !shouldExclude(filePath)) {
                fileList.push(filePath);
            }
        } catch (err) {
        }
    }
    return fileList;
}

/**
 * Extract function declarations
 */
function extractFunctions(content, filePath) {
    const functions = [];
    const funcPattern = /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\([^)]*\)/g;
    const arrowPattern = /(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/g;

    let match;
    while ((match = funcPattern.exec(content)) !== null) {
        functions.push({ name: match[1], type: 'function' });
    }

    while ((match = arrowPattern.exec(content)) !== null) {
        functions.push({ name: match[1], type: 'arrow' });
    }

    return functions;
}

/**
 * Check if function is used elsewhere
 */
function isFunctionUsed(funcName, content, funcLine) {
    // Count occurrences
    const usagePattern = new RegExp(`\\b${funcName}\\s*\\(`, 'g');
    const matches = content.match(usagePattern);
    const count = matches ? matches.length : 0;

    // If only appears once (declaration), likely unused
    // Also check for exports
    const isExported = content.includes(`export`) &&
                      (content.includes(`export { ${funcName} }`) ||
                       content.includes(`export ${funcName}`) ||
                       content.includes(`export const ${funcName}`) ||
                       content.includes(`export function ${funcName}`) ||
                       content.includes(`export async function ${funcName}`));

    const isEventHandler = content.includes(`onclick="${funcName}"`) ||
                          content.includes(`onchange="${funcName}"`);

    return count > 1 || isExported || isEventHandler;
}

/**
 * Check for commented code blocks
 */
function checkCommentedCode(content, filePath) {
    const issues = [];
    const relativePath = path.relative(ROOT_DIR, filePath);

    // Large comment blocks
    const commentBlocks = content.match(/\/\*[\s\S]*?\*\//g) || [];
    commentBlocks.forEach(block => {
        const lines = block.split('\n').length;
        if (lines > 15) {
            issues.push({
                file: relativePath,
                type: 'commented-code',
                severity: 'warning',
                issue: `Large comment block (${lines} lines) - consider removing or documenting`,
                line: content.substring(0, content.indexOf(block)).split('\n').length
            });
        }
    });

    return issues;
}

/**
 * Check for unreachable code after return
 */
function checkUnreachableCode(content, filePath) {
    const issues = [];
    const relativePath = path.relative(ROOT_DIR, filePath);
    const lines = content.split('\n');

    let inFunction = false;
    let foundReturn = false;

    lines.forEach((line, idx) => {
        if (line.includes('function') || line.includes('=>')) {
            inFunction = true;
            foundReturn = false;
        }

        if (inFunction && line.trim().startsWith('return') && !line.trim().endsWith('{')) {
            foundReturn = true;
        }

        if (foundReturn && line.trim().length > 0 && !line.trim().startsWith('}') &&
            !line.trim().startsWith('//') && !line.trim().startsWith('*')) {
            // Check if it's not just closing braces or another return
            if (!line.trim().match(/^[\}\)]*\.?\s*$/) && !line.trim().startsWith('return')) {
                issues.push({
                    file: relativePath,
                    type: 'unreachable',
                    severity: 'warning',
                    issue: 'Code after return statement',
                    line: idx + 1
                });
                foundReturn = false; // Reset to avoid duplicate reports
            }
        }

        if (line.includes('}')) {
            inFunction = false;
            foundReturn = false;
        }
    });

    return issues;
}

/**
 * Check for duplicate function implementations
 */
function checkDuplicateFunctions(allFunctions) {
    const issues = [];
    const funcMap = new Map();

    allFunctions.forEach(({ name, content, file }) => {
        // Normalize function body for comparison
        const normalized = content
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 100); // First 100 chars

        const key = `${name}:${normalized}`;
        if (funcMap.has(key)) {
            const existing = funcMap.get(key);
            if (existing.file !== file) {
                issues.push({
                    file: file,
                    type: 'duplicate',
                    severity: 'info',
                    issue: `Function '${name}' also defined in ${existing.file}`,
                    line: 1
                });
            }
        } else {
            funcMap.set(key, { file, content });
        }
    });

    return issues;
}

/**
 * Analyze a single file
 */
function analyzeFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const relativePath = path.relative(ROOT_DIR, filePath);
        const issues = [];

        // Extract functions
        const functions = extractFunctions(content, filePath);

        // Check if each function is used
        functions.forEach(func => {
            if (!isFunctionUsed(func.name, content, 0)) {
                // Skip if it's a likely event handler or lifecycle method
                const skipPatterns = ['init', 'render', 'handle', 'on', 'component', 'mount'];
                if (!skipPatterns.some(p => func.name.toLowerCase().includes(p))) {
                    issues.push({
                        file: relativePath,
                        type: 'unused-function',
                        severity: 'warning',
                        issue: `Function '${func.name}' appears unused`,
                        line: content.split('\n').findIndex(l => l.includes(`function ${func.name}`) || l.includes(`${func.name} =`)) + 1
                    });
                }
            }
        });

        // Check commented code
        issues.push(...checkCommentedCode(content, filePath));

        // Check unreachable code
        issues.push(...checkUnreachableCode(content, filePath));

        return issues;
    } catch (error) {
        return [{
            file: path.relative(ROOT_DIR, filePath),
            type: 'error',
            severity: 'error',
            issue: `Error analyzing file: ${error.message}`,
            line: 1
        }];
    }
}

/**
 * Generate report
 */
function generateReport(issues) {
    const byType = {};
    const byFile = {};

    issues.forEach(issue => {
        if (!byType[issue.type]) byType[issue.type] = [];
        byType[issue.type].push(issue);

        if (!byFile[issue.file]) byFile[issue.file] = [];
        byFile[issue.file].push(issue);
    });

    let report = `# Dead Code Detection Report

**Generated:** ${new Date().toISOString()}
**Files Scanned:** ${results.filesScanned}
**Total Issues:** ${issues.length}

---

## Summary

| Type | Count |
|------|-------|
| Unused Functions | ${byType['unused-function']?.length || 0} |
| Commented Code | ${byType['commented-code']?.length || 0} |
| Unreachable Code | ${byType['unreachable']?.length || 0} |
| Duplicate | ${byType['duplicate']?.length || 0} |

---

## 📁 Files with Dead Code

`;

    const filesWithIssues = Object.entries(byFile)
        .filter(([, fileIssues]) => fileIssues.length > 0)
        .sort(([, a], [, b]) => b.length - a.length)
        .slice(0, 20);

    if (filesWithIssues.length === 0) {
        report += `✅ No dead code detected!\n\n`;
    } else {
        filesWithIssues.forEach(([file, fileIssues]) => {
            report += `### ${file} (${fileIssues.length} issues)\n\n`;
            fileIssues.slice(0, 5).forEach(issue => {
                report += `- **Line ${issue.line}:** ${issue.issue}\n`;
            });
            if (fileIssues.length > 5) {
                report += `\n... and ${fileIssues.length - 5} more\n`;
            }
            report += `\n`;
        });
    }

    report += `
---

## Recommendations

1. **Remove unused functions** - Delete or use if needed
2. **Clean up commented code** - Remove large comment blocks
3. **Fix unreachable code** - Review code after return statements
4. **Consolidate duplicates** - Merge duplicate function implementations

---

## Quality Score

`;

    const issueWeight = { 'unused-function': 3, 'commented-code': 1, 'unreachable': 2, 'duplicate': 1 };
    let totalPenalty = 0;

    issues.forEach(issue => {
        totalPenalty += issueWeight[issue.type] || 1;
    });

    let score = Math.max(0, 100 - totalPenalty);

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
 * Main function
 */
function runDetection() {

    const allFiles = [];
    for (const dir of SCAN_DIRS) {
        const dirPath = path.join(ROOT_DIR, dir);
        if (fs.existsSync(dirPath)) {
            allFiles.push(...getAllJSFiles(dirPath));
        }
    }

    const allIssues = [];
    const allFunctions = [];

    for (const file of allFiles) {
        results.filesScanned++;
        try {
            const content = fs.readFileSync(file, 'utf8');
            const issues = analyzeFile(file);
            allIssues.push(...issues);

            // Collect functions for duplicate detection
            const functions = extractFunctions(content, file);
            functions.forEach(func => {
                allFunctions.push({
                    name: func.name,
                    content: content.substring(content.indexOf(`function ${func.name}`),
                                              content.indexOf(`function ${func.name}`) + 500),
                    file: path.relative(ROOT_DIR, file)
                });
            });

            if (results.filesScanned % 50 === 0) {
                process.stdout.write('.');
            }
        } catch (error) {
        }
    }

    // Generate and save report
    const report = generateReport(allIssues);
    const reportPath = path.join(ROOT_DIR, 'reports', 'dev', 'pr-review', 'dead-code.md');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, report, 'utf8');

    // Save JSON
    const jsonPath = path.join(ROOT_DIR, 'reports', 'dev', 'pr-review', 'dead-code.json');
    fs.writeFileSync(jsonPath, JSON.stringify(allIssues, null, 2), 'utf8');

}

runDetection();

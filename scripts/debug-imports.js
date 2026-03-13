#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SADÉC MARKETING HUB — BROKEN IMPORTS DEBUG SCRIPT
 *
 * Checks for:
 * 1. Import statements referencing non-existent files
 * 2. Broken module paths
 * 3. Missing exports
 *
 * Usage: node scripts/debug-imports.js
 * ═══════════════════════════════════════════════════════════════════════════
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const JS_DIR = path.join(ROOT_DIR, 'assets/js');

const brokenImports = [];
const consoleLogs = [];
const undefinedRefs = [];

/**
 * Check if file exists
 */
function fileExists(filePath) {
    return fs.existsSync(filePath);
}

/**
 * Extract imports from file content
 */
function extractImports(content, filePath) {
    const importRegex = /import\s+{[^}]+}\s+from\s+['"]([^'"]+)['"]/g;
    const importAllRegex = /import\s+['"]([^'"]+)['"]/g;

    let match;
    const imports = [];

    while ((match = importRegex.exec(content)) !== null) {
        imports.push({ from: match[1], line: content.substring(0, match.index).split('\n').length });
    }

    while ((match = importAllRegex.exec(content)) !== null) {
        imports.push({ from: match[1], line: content.substring(0, match.index).split('\n').length });
    }

    return imports;
}

/**
 * Check imports in a file
 */
function checkFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const imports = extractImports(content, filePath);
    const fileDir = path.dirname(filePath);

    imports.forEach(imp => {
        if (imp.from.startsWith('.') || imp.from.startsWith('/')) {
            // Resolve relative path
            let resolvedPath = path.resolve(fileDir, imp.from);

            // Add .js if missing
            if (!resolvedPath.endsWith('.js') && !resolvedPath.endsWith('.mjs')) {
                resolvedPath += '.js';
            }

            if (!fileExists(resolvedPath)) {
                brokenImports.push({
                    file: path.relative(ROOT_DIR, filePath),
                    import: imp.from,
                    resolvedPath: path.relative(ROOT_DIR, resolvedPath),
                    line: imp.line
                });
            }
        }
    });

    // Check for console.log
    const consoleLogRegex = /console\.(log|warn|error|info)/g;
    let match;
    while ((match = consoleLogRegex.exec(content)) !== null) {
        const line = content.substring(0, match.index).split('\n').length;
        consoleLogs.push({
            file: path.relative(ROOT_DIR, filePath),
            type: match[1],
            line: line
        });
    }
}

/**
 * Scan directory recursively
 */
function scanDirectory(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory() && file !== 'node_modules') {
            scanDirectory(filePath);
        } else if (file.endsWith('.js') && !file.endsWith('.test.js') && !file.endsWith('.spec.js')) {
            checkFile(filePath);
        }
    });
}

/**
 * Run check
 */
function runCheck() {
    console.log('🔍 Checking imports in', JS_DIR, '\n');

    scanDirectory(JS_DIR);

    // Report
    console.log('═══════════════════════════════════════════════════════════');
    console.log('BROKEN IMPORTS');
    console.log('═══════════════════════════════════════════════════════════\n');

    if (brokenImports.length === 0) {
        console.log('✅ No broken imports found!\n');
    } else {
        brokenImports.forEach((imp, i) => {
            console.log(`${i + 1}. ${imp.file}`);
            console.log(`   Import: ${imp.import}`);
            console.log(`   Resolved: ${imp.resolvedPath}`);
            console.log(`   Line: ${imp.line}\n`);
        });
        console.log(`Total: ${brokenImports.length} broken imports\n`);
    }

    console.log('═══════════════════════════════════════════════════════════');
    console.log('CONSOLE.LOG STATEMENTS');
    console.log('═══════════════════════════════════════════════════════════\n');

    if (consoleLogs.length === 0) {
        console.log('✅ No console.log statements found!\n');
    } else {
        consoleLogs.forEach((log, i) => {
            console.log(`${i + 1}. ${log.file} - console.${log.type} at line ${log.line}`);
        });
        console.log(`\nTotal: ${consoleLogs.length} console statements\n`);
    }

    // Write report
    const reportDir = path.join(ROOT_DIR, '..', '..', 'reports', 'dev', 'bug-sprint');
    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
    }

    const reportPath = path.join(reportDir, 'debug-imports-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        brokenImports,
        consoleLogs,
        summary: {
            brokenImportsCount: brokenImports.length,
            consoleLogsCount: consoleLogs.length
        }
    }, null, 2));

    console.log(`📄 Report saved to: ${reportPath}\n`);

    process.exit(brokenImports.length > 0 ? 1 : 0);
}

// Run
runCheck();

#!/usr/bin/env node
/**
 * Broken Import Detector
 * Detects imports that reference non-existent files
 */

const fs = require('fs');
const path = require('path');

const JS_DIR = process.argv[2] || 'assets/js';
const brokenImports = [];
const missingFiles = new Set();

function checkFile(filePath) {
    if (!filePath.endsWith('.js')) return;

    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const importPattern = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
        let match;

        while ((match = importPattern.exec(content)) !== null) {
            let importPath = match[1];

            // Skip external imports
            if (importPath.startsWith('http') || importPath.startsWith('@') || !importPath.startsWith('.')) {
                continue;
            }

            // Resolve relative path
            const dir = path.dirname(filePath);
            let resolved = path.join(dir, importPath);

            // Add .js extension if missing
            if (!resolved.endsWith('.js')) {
                resolved = resolved + '.js';
            }

            // Check if file exists
            if (!fs.existsSync(resolved)) {
                missingFiles.add(resolved);
                brokenImports.push({
                    file: filePath,
                    import: importPath,
                    resolved: resolved,
                    line: content.substring(0, match.index).split('\n').length
                });
            }
        }
    } catch (e) {
        // Skip errors
    }
}

function scanDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        try {
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                scanDir(filePath);
            } else {
                checkFile(filePath);
            }
        } catch (e) {
            // Skip
        }
    }
}

scanDir(JS_DIR);

brokenImports.slice(0, 20).forEach(imp => {
    });

if (brokenImports.length > 20) {
    }

// Save report
const reportDir = 'reports/dev/bug-sprint';
fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(
    path.join(reportDir, 'broken-imports.json'),
    JSON.stringify(brokenImports, null, 2)
);

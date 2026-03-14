/**
 * Check for Broken Imports
 * Quét các file JS/TS để tìm broken imports
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..', '..');

const CONFIG = {
    excludeDirs: ['node_modules', '.git', 'dist', 'build', 'tests'],
    fileExtensions: ['.js', '.ts', '.mjs']
};

function getAllFiles(dir, files = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (!CONFIG.excludeDirs.includes(entry.name) && !entry.name.startsWith('.')) {
                getAllFiles(fullPath, files);
            }
        } else if (entry.isFile() && CONFIG.fileExtensions.includes(path.extname(entry.name))) {
            const relPath = path.relative(rootDir, fullPath);
            files.push({ path: fullPath, relPath });
        }
    }
    return files;
}

function checkImports(filePath, relPath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];

    // Match import statements
    const importMatches = content.matchAll(/(?:import|from)\s+['"]([^'"]+)['"]/gi);
    for (const match of importMatches) {
        const importPath = match[1];
        
        // Skip external packages and protocol imports
        if (importPath.startsWith('http') || importPath.startsWith('https:') || 
            importPath.startsWith('deno.land') || importPath.startsWith('esm.sh') ||
            !importPath.startsWith('.')) {
            continue;
        }

        // Resolve relative path
        const fileDir = path.dirname(filePath);
        let resolvedPath = path.resolve(fileDir, importPath);
        
        // Try adding extensions
        if (!fs.existsSync(resolvedPath)) {
            if (!resolvedPath.endsWith('.js') && !resolvedPath.endsWith('.ts')) {
                resolvedPath += '.js';
            }
        }

        if (!fs.existsSync(resolvedPath)) {
            issues.push({
                file: relPath,
                import: importPath,
                resolved: resolvedPath,
                line: content.substring(0, match.index).split('\n').length
            });
        }
    }

    return issues;
}

// Main
const jsFiles = getAllFiles(rootDir);
const allIssues = [];
for (const { path: filePath, relPath } of jsFiles) {
    try {
        const issues = checkImports(filePath, relPath);
        if (issues.length > 0) {
            allIssues.push(...issues);
            }
    } catch (error) {
        console.error(`❌ ${relPath}: ${error.message}`);
    }
}

if (allIssues.length > 0) {
    for (const issue of allIssues.slice(0, 20)) {
        }
}

// Save report
const reportDir = path.join(rootDir, 'reports', 'dev', 'bug-sprint');
fs.mkdirSync(reportDir, { recursive: true });
const reportPath = path.join(reportDir, `broken-imports-${new Date().toISOString().split('T')[0]}.json`);
fs.writeFileSync(reportPath, JSON.stringify(allIssues, null, 2));

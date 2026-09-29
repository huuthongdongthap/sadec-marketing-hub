/**
 * Scan Console Errors in Frontend Code
 * Tìm console.log/error/warn trong production frontend code
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..', '..');

const CONFIG = {
    scanDirs: ['assets/js', 'admin', 'portal', 'affiliate', 'auth'],
    excludeFiles: ['tests', 'node_modules', '.git'],
    // Allowed console usage (error logging in production is OK)
    allowedPatterns: [
        /console\.error.*error/i, // Error logging is OK
        /console\.warn.*warn/i,   // Warning logging is OK
    ]
};

function getAllFiles(dir, files = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (!CONFIG.excludeFiles.includes(entry.name) && !entry.name.startsWith('.')) {
                getAllFiles(fullPath, files);
            }
        } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.ts'))) {
            const relPath = path.relative(rootDir, fullPath);
            if (!CONFIG.excludeFiles.some(ex => relPath.includes(ex))) {
                files.push({ path: fullPath, relPath });
            }
        }
    }
    return files;
}

function scanConsoleUsage(filePath, relPath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];

    // Find all console usage
    const consoleMatches = content.matchAll(/console\.(log|error|warn|debug|info|trace)/gi);
    
    for (const match of consoleMatches) {
        const type = match[1].toLowerCase();
        const line = content.substring(0, match.index).split('\n').length;
        const context = content.substring(match.index, Math.min(match.index + 200, content.length)).split('\n')[0];

        // Check if this is in an allowed pattern
        const isAllowed = CONFIG.allowedPatterns.some(pattern => pattern.test(context));

        // Only report console.log and console.debug in production code
        if ((type === 'log' || type === 'debug' || type === 'trace') && !isAllowed) {
            issues.push({
                file: relPath,
                type: type,
                line: line,
                context: context.trim()
            });
        }
    }

    return issues;
}

// Main
const allIssues = [];
const filesToScan = [];

for (const dir of CONFIG.scanDirs) {
    const dirPath = path.join(rootDir, dir);
    if (fs.existsSync(dirPath)) {
        filesToScan.push(...getAllFiles(dirPath));
    }
}

for (const { path: filePath, relPath } of filesToScan) {
    try {
        const issues = scanConsoleUsage(filePath, relPath);
        if (issues.length > 0) {
            allIssues.push(...issues);
        }
    } catch (error) {
        console.error(`❌ ${relPath}: ${error.message}`);
    }
}

if (allIssues.length > 0) {
    // Group by file
    const byFile = {};
    for (const issue of allIssues) {
        if (!byFile[issue.file]) byFile[issue.file] = [];
        byFile[issue.file].push(issue);
    }

    for (const [file, issues] of Object.entries(byFile)) {
        :`);
        for (const issue of issues.slice(0, 5)) {
            }
        if (issues.length > 5) {
            }
    }
}

// Save report
const reportDir = path.join(rootDir, 'reports', 'dev', 'bug-sprint');
fs.mkdirSync(reportDir, { recursive: true });
const reportPath = path.join(reportDir, `console-errors-${new Date().toISOString().split('T')[0]}.json`);
fs.writeFileSync(reportPath, JSON.stringify(allIssues, null, 2));
// Summary

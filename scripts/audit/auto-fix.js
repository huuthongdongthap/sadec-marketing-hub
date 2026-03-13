/**
 * Auto-Fix Audit Issues
 * Tự động fix các issues: charset, viewport, lang, skip links, main landmarks
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..', '..');

const CONFIG = {
    excludeDirs: ['node_modules', '.git', 'dist', 'build'],
    fileExtensions: ['.html']
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

function autoFix(content, filePath) {
    const changes = [];
    let modified = content;

    // Fix charset
    if (!/<meta charset=["']?UTF-8["']?/i.test(modified)) {
        modified = modified.replace(/<head>/i, '<head>\n  <meta charset="UTF-8">');
        changes.push('Added charset');
    }

    // Fix viewport
    if (!/<meta name=["']?viewport["']/i.test(modified)) {
        modified = modified.replace(/<head>/i, '<head>\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">');
        changes.push('Added viewport');
    }

    // Fix html lang
    if (!/<html[^>]*lang=["']/i.test(modified)) {
        modified = modified.replace(/<html/i, '<html lang="vi"');
        changes.push('Added html lang');
    }

    // Fix skip link
    if (!/<a[^>]*href=["']#main["']/i.test(modified)) {
        modified = modified.replace(/<body>/i, '<body>\n  <a href="#main" class="skip-link" style="position:absolute;left:-9999px;">Skip to content</a>');
        changes.push('Added skip link');
    }

    // Fix main landmark
    if (!/<main[^>]*id=["']main["']/i.test(modified)) {
        const patterns = [
            /(<div class="main-content"[^>]*>)/i,
            /(<div class="container"[^>]*>)/i,
            /(<div id="app"[^>]*>)/i
        ];
        let fixed = false;
        for (const pattern of patterns) {
            if (pattern.test(modified)) {
                modified = modified.replace(pattern, '$1\n  <main id="main" role="main">');
                modified = modified.replace(/(<\/div>\s*<\/body>)/i, '  </main>\n$1');
                changes.push('Added main landmark');
                fixed = true;
                break;
            }
        }
        if (!fixed) {
            modified = modified.replace(/(<body[^>]*>)/i, '$1\n<main id="main" role="main">');
            modified = modified.replace(/(<\/body>)/i, '</main>\n$1');
            changes.push('Added main landmark (wrapper)');
        }
    }

    return { modified, changes };
}

// Main
console.log('🔧 Starting Auto-Fix...\n');
const htmlFiles = getAllFiles(rootDir);
let modifiedCount = 0;
const modifiedFiles = [];

for (const { path: filePath, relPath } of htmlFiles) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const { modified, changes } = autoFix(content, relPath);
        if (changes.length > 0) {
            fs.writeFileSync(filePath, modified, 'utf8');
            modifiedCount++;
            modifiedFiles.push({ relPath, changes });
            console.log(`✅ ${relPath}: ${changes.length} changes`);
        }
    } catch (error) {
        console.error(`❌ ${relPath}: ${error.message}`);
    }
}

console.log(`\n📊 Auto-Fix Complete!`);
console.log(`📝 Files modified: ${modifiedCount}`);

// Report
const reportDir = path.join(rootDir, 'reports', 'audit');
fs.mkdirSync(reportDir, { recursive: true });
const report = `# Auto-Fix Report

**Date:** ${new Date().toISOString().split('T')[0]}
**Files Modified:** ${modifiedCount}

## Modified Files

${modifiedFiles.map(f => `### ${f.relPath}\n\nChanges:\n${f.changes.map(c => `- ${c}`).join('\n')}\n`).join('\n')}
`;
fs.writeFileSync(path.join(reportDir, `auto-fix-${new Date().toISOString().split('T')[0]}.md`), report);
console.log(`📄 Report: reports/audit/auto-fix-${new Date().toISOString().split('T')[0]}.md`);

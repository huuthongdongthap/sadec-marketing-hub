#!/usr/bin/env node
/**
 * Fix CommonJS exports to ES modules
 * Usage: node scripts/fix-commonjs.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const JS_DIRS = ['assets/js', 'assets/js/components', 'assets/js/services', 'assets/js/utils', 'assets/js/features'];

// Patterns to replace
const REPLACEMENTS = [
    {
        // Pattern: if (typeof module !== 'undefined' && module.exports) { module.exports = X; }
        pattern: /if \(typeof module !== 'undefined' && module\.exports\) \{\s*module\.exports = ([^;]+);\s*\}/g,
        replacement: '// Export for ES modules\nexport default $1;',
        name: 'CommonJS default export'
    },
    {
        // Pattern: if (typeof module !== 'undefined' && module.exports) { module.exports = { X, Y }; }
        pattern: /if \(typeof module !== 'undefined' && module\.exports\) \{\s*module\.exports = \{([^\}]+)\};\s*\}/g,
        replacement: 'export {$1};',
        name: 'CommonJS named export'
    },
    {
        // Pattern: if (typeof module !== 'undefined' && module.exports) { module.exports = X; } with newlines
        pattern: /\/\/ Export for module usage\s*\nif \(typeof module !== 'undefined' && module\.exports\) \{\s*module\.exports = ([^;]+);\s*\}/g,
        replacement: '// Export for ES modules\nexport default $1;',
        name: 'CommonJS with comment'
    },
    {
        // Pattern: if (typeof module !== 'undefined' && module.exports) { module.exports = { X, Y }; } with newlines
        pattern: /\/\/ Export for [^\n]*\nif \(typeof module !== 'undefined' && module\.exports\) \{\s*module\.exports = \{([^\}]+)\};\s*\}/g,
        replacement: 'export {$1};',
        name: 'CommonJS named with comment'
    },
    {
        // Pattern: if (typeof window !== 'undefined') { window.X = X; } followed by CommonJS
        pattern: /\/\/ Export for Node\.js\s*\nif \(typeof module !== 'undefined' && module\.exports\) \{\s*module\.exports = \{([^\}]+)\};\s*\}/g,
        replacement: 'export {$1};',
        name: 'Node.js export'
    }
];

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;
    let changed = false;

    for (const { pattern, replacement, name } of REPLACEMENTS) {
        if (pattern.test(content)) {
            content = content.replace(pattern, replacement);
            changed = true;
            console.log(`   ✓ ${path.relative(ROOT_DIR, filePath)}: Fixed ${name}`);
        }
    }

    if (changed && content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        return true;
    }
    return false;
}

function scanDirectory(dirPath) {
    let fixed = 0;
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            fixed += scanDirectory(filePath);
        } else if (file.endsWith('.js') && !file.endsWith('.min.js')) {
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                if (content.includes('module.exports') || content.includes('require(')) {
                    if (fixFile(filePath)) {
                        fixed++;
                    }
                }
            } catch (error) {
                // Skip files that can't be read
            }
        }
    }

    return fixed;
}

function main() {
    console.log('🔧 Fixing CommonJS exports to ES modules...\n');

    let totalFixed = 0;

    for (const dir of JS_DIRS) {
        const dirPath = path.join(ROOT_DIR, dir);
        if (fs.existsSync(dirPath)) {
            totalFixed += scanDirectory(dirPath);
        }
    }

    console.log(`\n✅ Fixed ${totalFixed} files\n`);
}

main();

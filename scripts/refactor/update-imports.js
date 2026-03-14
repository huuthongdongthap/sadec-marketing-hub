#!/usr/bin/env node
/**
 * Refactor Script: Update imports to use core-utils.js
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../..');
const JS_DIR = path.join(ROOT_DIR, 'assets/js');

// Mapping of old imports to new imports
const IMPORT_MAPPINGS = {
    "from '../shared/format-utils.js'": "from '../services/core-utils.js'",
    "from '../../shared/format-utils.js'": "from '../../services/core-utils.js'",
    "from '../../../shared/format-utils.js'": "from '../../../services/core-utils.js'",
    "from '../services/enhanced-utils.js'": "from '../services/core-utils.js'",
    "from '../../services/enhanced-utils.js'": "from '../../services/core-utils.js'",
    "from '../../../services/enhanced-utils.js'": "from '../../../services/core-utils.js'",
    "from '../utils/api.js'": "from '../services/core-utils.js'",
    "from '../../utils/api.js'": "from '../../services/core-utils.js'",
};

const SKIP_FILES = ['services/core-utils.js', 'services/enhanced-utils.js', 'shared/format-utils.js', 'utils/api.js', 'services/index.js'];

function updateFile(filePath) {
    const relativePath = path.relative(JS_DIR, filePath);
    if (SKIP_FILES.some(skip => relativePath.includes(skip))) return false;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    for (const [oldPattern, newPattern] of Object.entries(IMPORT_MAPPINGS)) {
        if (content.includes(oldPattern)) {
            content = content.replace(new RegExp(oldPattern, 'g'), newPattern);
            updated = true;
        }
    }
    
    if (updated) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`  ✓ ${relativePath}`);
        return true;
    }
    return false;
}

function walkDir(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    const results = [];
    for (const file of files) {
        const filePath = path.join(dir, file.name);
        if (file.isDirectory()) {
            results.push(...walkDir(filePath));
        } else if (file.name.endsWith('.js')) {
            results.push(filePath);
        }
    }
    return results;
}

function main() {
    console.log('🔧 Refactor: Update imports to use core-utils.js\n');
    const files = walkDir(JS_DIR);
    let updatedCount = 0;
    for (const file of files) {
        if (updateFile(file)) updatedCount++;
    }
    console.log(`\n📊 Summary: Updated ${updatedCount}/${files.length} files\n✅ Complete!`);
}

main();

#!/usr/bin/env node
/**
 * ID Scanner — Detect duplicate IDs
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

/**
 * Check for duplicate IDs in a document
 */
function checkIDs(document, filePath, rootDir) {
    const duplicates = [];
    const relativePath = path.relative(rootDir, filePath);

    const allElements = document.querySelectorAll('*[id]');
    const idCounts = {};
    const idElements = {};

    for (const el of allElements) {
        const id = el.getAttribute('id');
        idCounts[id] = (idCounts[id] || 0) + 1;

        if (!idElements[id]) {
            idElements[id] = [];
        }
        idElements[id].push(el.outerHTML.substring(0, 100));
    }

    for (const [id, count] of Object.entries(idCounts)) {
        if (count > 1) {
            duplicates.push({
                file: relativePath,
                id,
                count,
                severity: 'error',
                message: `Duplicate ID "${id}" found ${count} times.`,
                suggestion: `Ensure ID "${id}" is unique on the page`,
                examples: idElements[id]
            });
        }
    }

    return { duplicates, totalIDs: allElements.length, uniqueIDs: Object.keys(idCounts).length };
}

/**
 * Scan files for duplicate IDs
 */
async function scanIDs(htmlFiles, rootDir) {
    const results = {
        files: [],
        duplicates: [],
        summary: {
            totalFiles: htmlFiles.length,
            filesWithDuplicates: 0,
            totalDuplicates: 0,
            totalIDs: 0
        }
    };

    for (const filePath of htmlFiles) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const dom = new JSDOM(content);
        const document = dom.window.document;

        const { duplicates, totalIDs } = checkIDs(document, filePath, rootDir);

        results.summary.totalIDs += totalIDs;

        if (duplicates.length > 0) {
            results.files.push({
                file: path.relative(rootDir, filePath),
                duplicates
            });
            results.duplicates.push(...duplicates);
            results.summary.filesWithDuplicates++;
            results.summary.totalDuplicates += duplicates.length;
        }
    }

    return results;
}

/**
 * Auto-fix duplicate IDs (best effort - adds suffixes)
 */
async function fixIDs(results) {
    let fixed = 0;

    for (const fileResult of results.files) {
        const fullPath = path.join(process.cwd(), fileResult.file);
        let content = fs.readFileSync(fullPath, 'utf-8');

        const idCounts = {};

        for (const dup of fileResult.duplicates) {
            idCounts[dup.id] = 0;
        }

        // Replace duplicate IDs with unique ones
        for (const dup of fileResult.duplicates) {
            const regex = new RegExp(`id="${dup.id}"`, 'g');
            content = content.replace(regex, (match) => {
                idCounts[dup.id]++;
                if (idCounts[dup.id] > 1) {
                    fixed++;
                    return `id="${dup.id}-${idCounts[dup.id]}"`;
                }
                return match;
            });
        }

        if (fixed > 0) {
            fs.writeFileSync(fullPath, content);
        }
    }

    return fixed;
}

module.exports = { scanIDs, fixIDs, checkIDs };

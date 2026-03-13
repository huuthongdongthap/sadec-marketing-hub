#!/usr/bin/env node
/**
 * Sa Đéc Marketing Hub - Duplicate Code Detector
 * Finds and reports duplicate code patterns for refactoring
 *
 * Usage: node scripts/audit/detect-duplicates.js
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../..');
const SCAN_DIRS = ['assets/js', 'admin', 'portal', 'affiliate'];
const EXCLUDE_PATTERNS = ['node_modules', '.git', 'dist', '.min.', 'test-', 'fixtures'];

// Similarity threshold (0-100)
const SIMILARITY_THRESHOLD = 85;

const results = {
    filesScanned: 0,
    totalFiles: 0,
    duplicateClusters: [],
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
            console.warn(`Warning: Cannot access ${filePath}`);
        }
    }
    return fileList;
}

/**
 * Normalize code for comparison
 */
function normalizeCode(code) {
    return code
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
        .replace(/\/\/.*$/gm, '') // Remove single-line comments
        .replace(/\s+/g, ' ') // Normalize whitespace
        .replace(/\b(?:var|let|const)\b/g, 'VT') // Normalize declarations
        .replace(/\b(?:function|async)\b/g, 'FN') // Normalize keywords
        .replace(/"[^"]*"/g, 'STR') // Normalize strings
        .replace(/'[^']*'/g, 'STR')
        .replace(/\b\d+\b/g, 'NUM') // Normalize numbers
        .trim();
}

/**
 * Extract code blocks (functions, methods, etc.)
 */
function extractCodeBlocks(content, filePath) {
    const blocks = [];
    const relativePath = path.relative(ROOT_DIR, filePath);

    // Match function declarations
    const funcPattern = /((?:export\s+)?(?:async\s+)?function\s+\w+\s*\([^)]*\)\s*\{[\s\S]*?\n\})/g;
    let match;

    while ((match = funcPattern.exec(content)) !== null) {
        const code = match[1];
        const normalized = normalizeCode(code);
        const lines = code.split('\n').length;

        // Only consider blocks with 5+ lines
        if (lines >= 5) {
            blocks.push({
                file: relativePath,
                code: code.substring(0, 200), // First 200 chars
                normalized: normalized,
                lines: lines,
                startLine: content.substring(0, match.index).split('\n').length
            });
        }
    }

    // Match arrow functions assigned to variables
    const arrowPattern = /((?:export\s+)?(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?\([^)]*\)\s*=>\s*\{[\s\S]*?\n\})/g;

    while ((match = arrowPattern.exec(content)) !== null) {
        const code = match[1];
        const normalized = normalizeCode(code);
        const lines = code.split('\n').length;

        if (lines >= 5) {
            blocks.push({
                file: relativePath,
                code: code.substring(0, 200),
                normalized: normalized,
                lines: lines,
                startLine: content.substring(0, match.index).split('\n').length
            });
        }
    }

    return blocks;
}

/**
 * Calculate similarity between two normalized strings
 */
function calculateSimilarity(str1, str2) {
    const tokens1 = str1.split(/\s+/).filter(t => t.length > 2);
    const tokens2 = str2.split(/\s+/).filter(t => t.length > 2);

    if (tokens1.length === 0 || tokens2.length === 0) return 0;

    const common = tokens1.filter(t => tokens2.includes(t));
    const union = new Set([...tokens1, ...tokens2]).size;

    return union > 0 ? (common.length / union) * 100 : 0;
}

/**
 * Find duplicate clusters
 */
function findDuplicates(allBlocks) {
    const clusters = [];
    const used = new Set();
    let lastSimilarity = 0;

    for (let i = 0; i < allBlocks.length; i++) {
        if (used.has(i)) continue;

        const cluster = [allBlocks[i]];
        used.add(i);
        lastSimilarity = 0;

        for (let j = i + 1; j < allBlocks.length; j++) {
            if (used.has(j)) continue;

            const sim = calculateSimilarity(
                allBlocks[i].normalized,
                allBlocks[j].normalized
            );

            if (sim >= SIMILARITY_THRESHOLD) {
                cluster.push(allBlocks[j]);
                used.add(j);
                lastSimilarity = sim;
            }
        }

        // Only report clusters with 2+ blocks from different files
        const uniqueFiles = new Set(cluster.map(b => b.file));
        if (cluster.length >= 2 && uniqueFiles.size >= 2) {
            clusters.push({
                similarity: lastSimilarity,
                blocks: cluster,
                files: [...uniqueFiles]
            });
        }
    }

    return clusters;
}

/**
 * Detect specific duplicate patterns
 */
function detectSpecificPatterns(allFiles) {
    const patterns = [];

    // Common patterns to detect
    const patternChecks = [
        {
            name: 'Format Currency Wrapper',
            pattern: /function\s+formatCurrency\s*\([^)]*\)[\s\S]{50,200}/g,
            description: 'Currency formatting function'
        },
        {
            name: 'Format Number Wrapper',
            pattern: /function\s+formatNumber\s*\([^)]*\)[\s\S]{50,200}/g,
            description: 'Number formatting function'
        },
        {
            name: 'Date Formatting',
            pattern: /function\s+formatDate\s*\([^)]*\)[\s\S]{50,200}/g,
            description: 'Date formatting function'
        },
        {
            name: 'Event Handler Pattern',
            pattern: /function\s+handle\w+\s*\([^)]*\)[\s\S]{100,300}/g,
            description: 'Event handler functions'
        },
        {
            name: 'API Fetch Pattern',
            pattern: /(?:async\s+)?function\s+(?:fetch|get|post)\w*\s*\([^)]*\)[\s\S]{100,400}/g,
            description: 'API fetch functions'
        },
        {
            name: 'Modal Open/Close',
            pattern: /function\s+(?:open|close|show|hide)\w*\s*\([^)]*\)[\s\S]{50,200}/g,
            description: 'Modal control functions'
        }
    ];

    allFiles.forEach(file => {
        try {
            const content = fs.readFileSync(file, 'utf8');
            const relativePath = path.relative(ROOT_DIR, file);

            patternChecks.forEach(check => {
                const matches = content.match(check.pattern);
                if (matches && matches.length > 0) {
                    patterns.push({
                        type: check.name,
                        description: check.description,
                        file: relativePath,
                        count: matches.length
                    });
                }
            });
        } catch (error) {
            // Skip files that can't be read
        }
    });

    return patterns;
}

/**
 * Generate report
 */
function generateReport(duplicateClusters, specificPatterns) {
    const byType = {};
    specificPatterns.forEach(p => {
        if (!byType[p.type]) byType[p.type] = [];
        byType[p.type].push(p);
    });

    let report = `# Duplicate Code Detection Report

**Generated:** ${new Date().toISOString()}
**Files Scanned:** ${results.filesScanned}
**Duplicate Clusters:** ${duplicateClusters.length}

---

## Executive Summary

| Metric | Value |
|--------|-------|
| Total JS Files | ${results.totalFiles} |
| Code Blocks Analyzed | ${results.filesScanned} |
| Duplicate Clusters Found | ${duplicateClusters.length} |
| Estimated Redundant Lines | ${duplicateClusters.reduce((sum, c) => sum + c.blocks.reduce((s, b) => s + b.lines, 0), 0)} |

---

## 🔁 Duplicate Code Clusters

`;

    if (duplicateClusters.length === 0) {
        report += `✅ No duplicate code clusters detected!\n\n`;
    } else {
        duplicateClusters.slice(0, 15).forEach((cluster, idx) => {
            report += `### Cluster #${idx + 1} (${cluster.blocks.length} similar blocks)\n\n`;
            report += `**Files:** ${cluster.files.join(', ')}\n\n`;

            cluster.blocks.forEach((block, bIdx) => {
                report += `#### ${block.file}:${block.startLine}\n`;
                report += `\`\`\`javascript\n${block.code}\n\`\`\`\n\n`;
            });

            report += `**Recommendation:** Extract into shared utility function\n\n---\n\n`;
        });

        if (duplicateClusters.length > 15) {
            report += `... and ${duplicateClusters.length - 15} more clusters\n\n`;
        }
    }

    report += `
---

## 📊 Specific Duplicate Patterns

| Pattern Type | Occurrences | Files Affected |
|--------------|-------------|----------------|
| Format Currency | ${byType['Format Currency Wrapper']?.length || 0} | ${[...new Set(byType['Format Currency Wrapper']?.map(p => p.file) || [])].length} |
| Format Number | ${byType['Format Number Wrapper']?.length || 0} | ${[...new Set(byType['Format Number Wrapper']?.map(p => p.file) || [])].length} |
| Format Date | ${byType['Format Date Wrapper']?.length || 0} | ${[...new Set(byType['Format Date Wrapper']?.map(p => p.file) || [])].length} |
| Event Handlers | ${byType['Event Handler Pattern']?.length || 0} | ${[...new Set(byType['Event Handler Pattern']?.map(p => p.file) || [])].length} |
| API Fetch | ${byType['API Fetch Pattern']?.length || 0} | ${[...new Set(byType['API Fetch Pattern']?.map(p => p.file) || [])].length} |
| Modal Control | ${byType['Modal Open/Close']?.length || 0} | ${[...new Set(byType['Modal Open/Close']?.map(p => p.file) || [])].length} |

---

## 🎯 Refactoring Recommendations

### High Priority (Shared Utilities)

1. **Consolidate format functions**
   - Create \`assets/js/shared/format-utils.js\`
   - Export: formatCurrency, formatNumber, formatDate, formatPercentage
   - Update all imports to use shared module

2. **Consolidate API helpers**
   - Create \`assets/js/shared/api-utils.js\`
   - Export: fetchWithAuth, postJSON, getJSON, handleResponse
   - Use Supabase client for authenticated requests

3. **Consolidate modal utilities**
   - Create \`assets/js/shared/modal-utils.js\`
   - Export: openModal, closeModal, createModal
   - Standardize modal behavior across app

### Medium Priority (Code Structure)

4. **Extract common event handlers**
   - Create \`assets/js/shared/event-handlers.js\`
   - Standardize preventDefault, loading states, error handling

5. **Create base component class**
   - Extend for similar UI components
   - Share lifecycle methods

### Low Priority (Cleanup)

6. **Remove dead code**
   - Delete unused duplicate functions
   - Keep only the canonical implementation

---

## 📈 Impact Estimate

| Refactoring | Effort | Lines Saved | Complexity Reduction |
|-------------|--------|-------------|---------------------|
| Format Utilities | 2h | ~200 | High |
| API Helpers | 3h | ~300 | High |
| Modal Utils | 1h | ~100 | Medium |
| Event Handlers | 2h | ~150 | Medium |
| **Total** | **8h** | **~750** | **Significant** |

---

## Quality Score

`;

    const baseScore = 100;
    const penalty = duplicateClusters.length * 2 + specificPatterns.length * 0.5;
    let score = Math.max(0, baseScore - penalty);

    if (score >= 90) {
        report += `🟢 **${score}/100** - Excellent (minimal duplication)\n`;
    } else if (score >= 70) {
        report += `🟡 **${score}/100** - Good (some duplication)\n`;
    } else if (score >= 50) {
        report += `🟠 **${score}/100** - Needs Improvement (significant duplication)\n`;
    } else {
        report += `🔴 **${score}/100** - Critical (major refactoring needed)\n`;
    }

    return report;
}

/**
 * Main detection function
 */
function runDetection() {
    console.log('🔍 Sa Đéc Marketing Hub - Duplicate Code Detection\n');

    // Collect all JS files
    const allFiles = [];
    for (const dir of SCAN_DIRS) {
        const dirPath = path.join(ROOT_DIR, dir);
        if (fs.existsSync(dirPath)) {
            allFiles.push(...getAllJSFiles(dirPath));
        }
    }

    results.totalFiles = allFiles.length;
    console.log(`Found ${allFiles.length} JS files to analyze\n`);

    // Extract all code blocks
    const allBlocks = [];
    for (const file of allFiles) {
        results.filesScanned++;
        try {
            const content = fs.readFileSync(file, 'utf8');
            const blocks = extractCodeBlocks(content, file);
            allBlocks.push(...blocks);

            if (results.filesScanned % 50 === 0) {
                process.stdout.write('.');
            }
        } catch (error) {
            console.error(`Error analyzing ${file}:`, error.message);
        }
    }

    console.log(`\n\nExtracted ${allBlocks.length} code blocks`);

    // Find duplicates
    console.log('Finding duplicate clusters...\n');
    const duplicateClusters = findDuplicates(allBlocks);

    // Detect specific patterns
    const specificPatterns = detectSpecificPatterns(allFiles);

    // Generate report
    const report = generateReport(duplicateClusters, specificPatterns);
    const reportPath = path.join(ROOT_DIR, 'reports', 'dev', 'tech-debt', 'duplicates.md');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, report, 'utf8');

    // Save JSON data
    const jsonPath = path.join(ROOT_DIR, 'reports', 'dev', 'tech-debt', 'duplicates.json');
    fs.writeFileSync(jsonPath, JSON.stringify({ duplicateClusters, specificPatterns }, null, 2), 'utf8');

    console.log(`📄 Report saved to: ${reportPath}`);
    console.log(`\n📊 Summary:`);
    console.log(`   Duplicate Clusters: ${duplicateClusters.length}`);
    console.log(`   Pattern Occurrences: ${specificPatterns.length}`);
}

runDetection();

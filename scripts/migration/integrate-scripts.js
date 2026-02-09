#!/usr/bin/env node
/**
 * Script Integration Utility
 * Manages data-sync scripts in admin pages
 * 
 * Usage:
 *   node integrate-scripts.js [options]
 * 
 * Options:
 *   --dry-run   Preview changes without writing files
 *   --verbose   Show detailed output
 *   --force     Re-add scripts even if already present
 *   --clean     Remove existing data-sync scripts before adding (prevents duplicates)
 */

const fs = require('fs').promises;
const path = require('path');

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
    adminDir: path.join(__dirname, 'admin'),
    scripts: [
        { src: '../assets/js/mekong-store.js', comment: 'Central State Management' },
        { src: '../assets/js/realtime-dashboard.js', comment: 'Realtime Updates' },
        { src: '../assets/js/data-sync-init.js', comment: 'Data Sync Integration' },
        { src: '../assets/js/mobile-menu.js', comment: 'Mobile Menu' }
    ],
    // Scripts to clean (all data-sync related)
    cleanPatterns: [
        /\s*<!--\s*Central State Management\s*-->\s*\n\s*<script src="[^"]*mekong-store\.js"><\/script>\s*/g,
        /\s*<!--\s*Realtime Updates\s*-->\s*\n\s*<script src="[^"]*realtime-dashboard\.js"><\/script>\s*/g,
        /\s*<!--\s*Data Sync Integration\s*-->\s*\n\s*<script src="[^"]*data-sync-init\.js"><\/script>\s*/g,
        /\s*<!--\s*Mobile Menu\s*-->\s*\n\s*<script src="[^"]*mobile-menu\.js"><\/script>\s*/g,
        // Also clean standalone script tags without comments
        /\s*<script src="\.\.\/assets\/js\/mekong-store\.js"><\/script>\s*/g,
        /\s*<script src="\.\.\/assets\/js\/data-sync-init\.js"><\/script>\s*/g
    ],
    // CLI flags
    dryRun: process.argv.includes('--dry-run'),
    verbose: process.argv.includes('--verbose'),
    force: process.argv.includes('--force'),
    clean: process.argv.includes('--clean')
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate HTML script tags from config
 */
function generateScriptTags(scripts) {
    return scripts
        .map(s => `    <!-- ${s.comment} -->\n    <script src="${s.src}"></script>`)
        .join('\n');
}

/**
 * Remove existing data-sync scripts from content
 */
function cleanExistingScripts(content) {
    let cleaned = content;
    for (const pattern of CONFIG.cleanPatterns) {
        cleaned = cleaned.replace(pattern, '\n');
    }
    // Clean up multiple consecutive newlines
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    return cleaned;
}

/**
 * Get all HTML files from directory
 */
async function getHtmlFiles(dir) {
    const files = await fs.readdir(dir);
    return files.filter(f => f.endsWith('.html'));
}

/**
 * Process a single HTML file
 * @returns {Object} Result with status and message
 */
async function processFile(filename) {
    const filepath = path.join(CONFIG.adminDir, filename);

    try {
        let content = await fs.readFile(filepath, 'utf8');

        // Clean existing scripts if --clean flag
        if (CONFIG.clean || CONFIG.force) {
            const originalLength = content.length;
            content = cleanExistingScripts(content);
            const cleaned = originalLength !== content.length;
            if (cleaned && CONFIG.verbose) {
                console.log(`  🧹 Cleaned existing scripts from ${filename}`);
            }
        }

        // Check if scripts already exist (after cleaning)
        const hasScripts = content.includes('mekong-store.js') &&
            content.includes('data-sync-init.js');

        if (hasScripts && !CONFIG.force && !CONFIG.clean) {
            return { file: filename, status: 'skipped', reason: 'already has scripts' };
        }

        // Validate file has </body>
        if (!content.includes('</body>')) {
            return { file: filename, status: 'skipped', reason: 'no </body> tag found' };
        }

        // Generate new content
        const scriptTags = generateScriptTags(CONFIG.scripts);
        const newContent = content.replace('</body>', `${scriptTags}\n</body>`);

        // Write file (unless dry-run)
        if (!CONFIG.dryRun) {
            await fs.writeFile(filepath, newContent);
        }

        return {
            file: filename,
            status: 'updated',
            note: CONFIG.dryRun ? '(dry-run)' : ''
        };

    } catch (err) {
        return { file: filename, status: 'error', reason: err.message };
    }
}

// ============================================================================
// Main Entry Point
// ============================================================================

async function main() {
    console.log('🔌 Script Integration Utility\n');

    if (CONFIG.dryRun) {
        console.log('⚡ DRY-RUN MODE - No files will be modified\n');
    }
    if (CONFIG.clean) {
        console.log('🧹 CLEAN MODE - Removing existing scripts before adding\n');
    }

    // Get all HTML files
    const files = await getHtmlFiles(CONFIG.adminDir);
    console.log(`📁 Found ${files.length} HTML files in admin/\n`);

    // Process all files in parallel
    const results = await Promise.all(files.map(processFile));

    // Categorize results
    const updated = results.filter(r => r.status === 'updated');
    const skipped = results.filter(r => r.status === 'skipped');
    const errors = results.filter(r => r.status === 'error');

    // Output results
    if (CONFIG.verbose || errors.length > 0) {
        results.forEach(r => {
            const icon = r.status === 'updated' ? '✅' : r.status === 'error' ? '❌' : '⏭️';
            const detail = r.reason || r.note || '';
            console.log(`${icon} ${r.file} ${detail}`);
        });
        console.log('');
    }

    // Summary
    console.log('═'.repeat(50));
    console.log(`✅ Updated: ${updated.length}${CONFIG.dryRun ? ' (dry-run)' : ''}`);
    console.log(`⏭️  Skipped: ${skipped.length}`);
    if (errors.length > 0) {
        console.log(`❌ Errors:  ${errors.length}`);
    }
    console.log('═'.repeat(50));

    // Exit with error code if any errors
    if (errors.length > 0) {
        process.exit(1);
    }
}

main().catch(err => {
    console.error('❌ Fatal error:', err.message);
    process.exit(1);
});


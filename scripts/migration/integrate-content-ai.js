#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * INTEGRATE CONTENT AI
 * Sa Đéc Marketing Hub
 *
 * Scans admin directory and injects Content AI script into HTML files.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const fs = require('fs').promises;
const { existsSync } = require('fs');
const path = require('path');

const ADMIN_DIR = path.join(__dirname, 'admin');

const SCRIPT_TO_ADD = `
    <!-- Content AI -->
    <script src="../assets/js/content-ai.js"></script>
</body>`;

async function integrate() {

    if (!existsSync(ADMIN_DIR)) {
        return;
    }

    // Get all HTML files
    const files = await fs.readdir(ADMIN_DIR);
    const htmlFiles = files.filter(f => f.endsWith('.html'));

    let updated = 0;
    let skipped = 0;

    // Process files in parallel
    await Promise.all(htmlFiles.map(async (filename) => {
        const filepath = path.join(ADMIN_DIR, filename);
        let content = await fs.readFile(filepath, 'utf8');

        if (content.includes('content-ai.js')) {
            skipped++;
            return;
        }

        if (content.includes('</body>')) {
            content = content.replace('</body>', SCRIPT_TO_ADD);
            await fs.writeFile(filepath, content);
            updated++;
        }
    }));

}

integrate().catch(err => {
    process.exit(1);
});

#!/usr/bin/env node
/**
 * Integrate Content AI into admin pages
 */

const fs = require('fs');
const path = require('path');

const ADMIN_DIR = path.join(__dirname, 'admin');

const SCRIPT_TO_ADD = `
    <!-- Content AI -->
    <script src="../assets/js/content-ai.js"></script>
</body>`;

function integrate() {
    console.log('🤖 Integrating Content AI into admin pages...\n');

    const adminFiles = fs.readdirSync(ADMIN_DIR).filter(f => f.endsWith('.html'));
    let updated = 0;

    adminFiles.forEach(filename => {
        const filepath = path.join(ADMIN_DIR, filename);
        let content = fs.readFileSync(filepath, 'utf8');

        if (content.includes('content-ai.js')) {
            console.log(`⏭️  ${filename} - already has Content AI`);
            return;
        }

        if (content.includes('</body>')) {
            content = content.replace('</body>', SCRIPT_TO_ADD);
            fs.writeFileSync(filepath, content);
            console.log(`✅ ${filename} - Content AI added`);
            updated++;
        }
    });

    console.log(`\n✅ Updated: ${updated} pages`);
}

integrate();

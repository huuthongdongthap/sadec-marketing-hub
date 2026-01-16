#!/usr/bin/env node
/**
 * Script Integration
 * Adds realtime-dashboard.js and mobile-menu.js to all admin pages
 */

const fs = require('fs');
const path = require('path');

const ADMIN_DIR = path.join(__dirname, 'admin');

const SCRIPTS_TO_ADD = `
    <!-- Realtime Updates -->
    <script src="../assets/js/realtime-dashboard.js"></script>
    <!-- Mobile Menu -->
    <script src="../assets/js/mobile-menu.js"></script>
</body>`;

function integrateScripts() {
    console.log('🔌 Integrating new scripts into admin pages...\n');

    const adminFiles = fs.readdirSync(ADMIN_DIR).filter(f => f.endsWith('.html'));
    let updated = 0;
    let skipped = 0;

    adminFiles.forEach(filename => {
        const filepath = path.join(ADMIN_DIR, filename);
        let content = fs.readFileSync(filepath, 'utf8');

        // Skip if already has realtime-dashboard.js
        if (content.includes('realtime-dashboard.js')) {
            console.log(`⏭️  ${filename} - already has scripts`);
            skipped++;
            return;
        }

        // Replace </body> with scripts + </body>
        if (content.includes('</body>')) {
            content = content.replace('</body>', SCRIPTS_TO_ADD);
            fs.writeFileSync(filepath, content);
            console.log(`✅ ${filename} - scripts added`);
            updated++;
        } else {
            console.log(`⚠️  ${filename} - no </body> found`);
            skipped++;
        }
    });

    console.log('\n' + '═'.repeat(50));
    console.log(`✅ Updated: ${updated}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log('═'.repeat(50));
}

integrateScripts();

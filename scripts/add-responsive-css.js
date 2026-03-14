#!/usr/bin/env node
/**
 * Add responsive-portal-admin.css to all admin and portal pages
 */
const fs = require('fs');
const path = require('path');

const ROOT_DIR = process.cwd();
const CSS_LINK = '<link rel="stylesheet" href="/assets/css/responsive-portal-admin.css?v=mmp5r1rf">';

function addResponsiveCss(dir) {
    const files = fs.readdirSync(dir);
    let count = 0;
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        try {
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                count += addResponsiveCss(filePath);
            } else if (file.endsWith('.html') && !file.includes('node_modules')) {
                let content = fs.readFileSync(filePath, 'utf8');
                
                // Check if already has responsive-portal-admin.css
                if (content.includes('responsive-portal-admin.css')) {
                    continue;
                }
                
                // Find responsive-2026-complete.css and add after it
                const targetPattern = /(<link rel="stylesheet" href="\/assets\/css\/responsive-2026-complete\.css[^>]*>)/;
                if (targetPattern.test(content)) {
                    content = content.replace(targetPattern, `$1\n    ${CSS_LINK}`);
                    fs.writeFileSync(filePath, content, 'utf8');
                    count++;
                    console.log(`Added responsive CSS: ${filePath}`);
                } else {
                    // Fallback: add before </head>
                    const headPattern = /(<\/head>)/;
                    if (headPattern.test(content)) {
                        content = content.replace(headPattern, `    ${CSS_LINK}\n$1`);
                        fs.writeFileSync(filePath, content, 'utf8');
                        count++;
                        console.log(`Added responsive CSS (fallback): ${filePath}`);
                    }
                }
            }
        } catch (err) {
            // Skip errors
        }
    }
    
    return count;
}

console.log('Adding responsive-portal-admin.css to admin pages...');
const adminCount = addResponsiveCss(path.join(ROOT_DIR, 'admin'));

console.log('\nAdding responsive-portal-admin.css to portal pages...');
const portalCount = addResponsiveCss(path.join(ROOT_DIR, 'portal'));

console.log(`\nDone! Added responsive CSS to ${adminCount + portalCount} files.`);
console.log(`- Admin: ${adminCount} files`);
console.log(`- Portal: ${portalCount} files`);

#!/usr/bin/env node
/**
 * Add UI Enhancements Bundle to all HTML files
 * Adds micro-animations, loading states, hover effects CSS/JS
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.join(__dirname, '../..');
const CSS_bundle = '<link rel="stylesheet" href="/assets/css/ui-enhancements-bundle.css">';
const JS_bundle = '<script type="module" src="/assets/js/ui-enhancements-controller.js"></script>';

// Directories to scan
const dirs = ['', 'admin/', 'portal/', 'affiliate/', 'auth/'];

let filesModified = 0;
let filesSkipped = 0;

dirs.forEach(dir => {
    const fullPath = path.join(ROOT_DIR, dir);
    if (!fs.existsSync(fullPath)) return;

    const files = fs.readdirSync(fullPath)
        .filter(f => f.endsWith('.html') && !f.endsWith('.min.html'));

    files.forEach(file => {
        const filePath = path.join(fullPath, file);
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // Skip if already has UI enhancements
        if (content.includes('ui-enhancements-bundle.css')) {
            filesSkipped++;
            return;
        }

        // Add CSS bundle before closing </head>
        if (content.includes('</head>')) {
            content = content.replace('</head>', `    ${CSS_bundle}\n  </head>`);
            modified = true;
        }

        // Add JS bundle before closing </body>
        if (content.includes('</body>')) {
            content = content.replace('</body>', `    ${JS_bundle}\n  </body>`);
            modified = true;
        }

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            filesModified++;
            }
    });
});

`);

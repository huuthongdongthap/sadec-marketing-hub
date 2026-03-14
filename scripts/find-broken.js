#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT_DIR = path.resolve(__dirname, '..');
const htmlFiles = [];

function getAllHTMLFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        try {
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                if (!filePath.includes('node_modules') && !filePath.includes('.git') && !filePath.includes('dist')) {
                    getAllHTMLFiles(filePath);
                }
            } else if (file.endsWith('.html')) {
                htmlFiles.push(filePath);
            }
        } catch(e) {}
    }
}

getAllHTMLFiles(ROOT_DIR);

const broken = [];
for (const filePath of htmlFiles) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const dom = new JSDOM(content);
    const links = dom.window.document.querySelectorAll('a[href]');

    for (const link of links) {
        const href = link.getAttribute('href');
        if (!href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:') && !href.startsWith('#') && href !== '') {
            let fullPath;
            if (href.startsWith('/')) {
                fullPath = path.join(ROOT_DIR, href.substring(1));
            } else {
                fullPath = path.join(path.dirname(filePath), href);
            }
            if (!fs.existsSync(fullPath)) {
                const relPath = path.relative(ROOT_DIR, filePath);
                broken.push({ file: relPath, href, resolved: fullPath });
            }
        }
    }
}

console.log(`\n📊 Broken Links: ${broken.length}\n`);
broken.forEach(b => {
    console.log(`  File: ${b.file}`);
    console.log(`  Link: ${b.href}`);
    console.log(`  Resolved: ${b.resolved}`);
    console.log('');
});

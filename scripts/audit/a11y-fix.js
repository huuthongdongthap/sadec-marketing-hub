#!/usr/bin/env node
/**
 * Sa Đéc Marketing Hub - Accessibility Auto-Fix
 * Adds aria-labels to inputs missing labels
 *
 * Usage: node scripts/audit/a11y-fix.js
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT_DIR = path.resolve(__dirname, '../..');
const SCAN_DIRS = ['admin', 'portal', 'affiliate', 'auth', ''];
let filesModified = 0;
let issuesFixed = 0;

/**
 * Get all HTML files
 */
function getAllHTMLFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        try {
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                getAllHTMLFiles(filePath, fileList);
            } else if (file.endsWith('.html') && !file.includes('.min.')) {
                fileList.push(filePath);
            }
        } catch (err) {
        }
    }
    return fileList;
}

/**
 * Generate aria-label from placeholder or id
 */
function generateAriaLabel(input) {
    const placeholder = input.getAttribute('placeholder');
    if (placeholder) return placeholder;

    const id = input.getAttribute('id');
    if (id) {
        return id.replace(/-/g, ' ').replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();
    }

    const type = input.getAttribute('type') || 'text';
    return `Enter ${type} value`;
}

/**
 * Fix accessibility issues in HTML file
 */
function fixAccessibility(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const dom = new JSDOM(content);
    const document = dom.window.document;
    let modified = false;

    // Fix inputs without labels
    const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"])');

    inputs.forEach(input => {
        const id = input.getAttribute('id');
        const hasLabel = id && document.querySelector(`label[for="${id}"]`);
        const hasAriaLabel = input.hasAttribute('aria-label');

        if (!hasLabel && !hasAriaLabel) {
            const ariaLabel = generateAriaLabel(input);
            input.setAttribute('aria-label', ariaLabel);
            modified = true;
            issuesFixed++;
        }
    });

    // Fix checkboxes/radios without labels
    const checkboxes = document.querySelectorAll('input[type="checkbox"], input[type="radio"]');

    checkboxes.forEach(input => {
        const id = input.getAttribute('id');
        const hasLabel = id && document.querySelector(`label[for="${id}"]`);
        const hasAriaLabel = input.hasAttribute('aria-label');

        if (!hasLabel && !hasAriaLabel) {
            input.setAttribute('aria-label', input.getAttribute('type') === 'checkbox' ? 'Toggle option' : 'Select option');
            modified = true;
            issuesFixed++;
        }
    });

    // Fix buttons without accessible text
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
        const hasText = btn.textContent.trim().length > 0;
        const hasAriaLabel = btn.hasAttribute('aria-label');

        if (!hasText && !hasAriaLabel) {
            btn.setAttribute('aria-label', 'Button');
            modified = true;
            issuesFixed++;
        }
    });

    // Add role="img" to decorative images without alt
    const images = document.querySelectorAll('img[alt=""]');
    images.forEach(img => {
        if (!img.hasAttribute('role')) {
            img.setAttribute('role', 'presentation');
            modified = true;
        }
    });

    if (modified) {
        const html = dom.serialize();
        fs.writeFileSync(filePath, html, 'utf8');
        filesModified++;
    }

    return modified;
}

/**
 * Main function
 */
function main() {

    const allFiles = [];
    for (const dir of SCAN_DIRS) {
        const dirPath = path.join(ROOT_DIR, dir);
        if (fs.existsSync(dirPath)) {
            allFiles.push(...getAllHTMLFiles(dirPath));
        }
    }

    for (const file of allFiles) {
        try {
            fixAccessibility(file);
        } catch (error) {
        }
    }

}

main();

#!/usr/bin/env node
/**
 * Accessibility Scanner — Detect WCAG accessibility issues
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

/**
 * Check accessibility issues in a document
 */
function checkA11y(document, filePath, rootDir) {
    const issues = [];
    const relativePath = path.relative(rootDir, filePath);

    // Check 1: Inputs without labels
    const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"])');
    for (const input of inputs) {
        const id = input.getAttribute('id');
        const hasLabel = id && document.querySelector(`label[for="${id}"]`);
        const hasAriaLabel = input.hasAttribute('aria-label');
        const hasAriaLabelledBy = input.hasAttribute('aria-labelledby');
        const hasTitle = input.hasAttribute('title');

        if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy && !hasTitle) {
            issues.push({
                file: relativePath,
                type: 'input-no-label',
                severity: 'error',
                element: `<input${id ? ` id="${id}"` : ''} type="${input.getAttribute('type') || 'text'}">`,
                message: 'Form input without label. Add aria-label or associated <label> element.',
                suggestion: `Add aria-label="${input.getAttribute('placeholder') || 'Input field'}"`
            });
        }
    }

    // Check 2: Buttons without accessible text
    const buttons = document.querySelectorAll('button, a[role="button"]');
    for (const button of buttons) {
        const hasText = button.textContent.trim() !== '';
        const hasAriaLabel = button.hasAttribute('aria-label');
        const hasTitle = button.hasAttribute('title');
        const hasIcon = button.querySelector('.material-symbols, .material-symbols-outlined, i');

        if (!hasText && !hasAriaLabel && !hasTitle) {
            issues.push({
                file: relativePath,
                type: 'button-no-text',
                severity: 'error',
                element: `<button>${button.innerHTML.substring(0, 50)}...</button>`,
                message: 'Button without accessible text. Add aria-label for icon buttons.',
                suggestion: 'Add aria-label="Button action description"'
            });
        }
    }

    // Check 3: Images without alt text
    const images = document.querySelectorAll('img');
    for (const img of images) {
        const hasAlt = img.hasAttribute('alt');
        const hasRole = img.hasAttribute('role');

        if (!hasAlt && !hasRole) {
            issues.push({
                file: relativePath,
                type: 'img-no-alt',
                severity: 'error',
                element: `<img src="${img.getAttribute('src')}">`,
                message: 'Image without alt attribute.',
                suggestion: 'Add alt="Image description" or role="presentation" for decorative images'
            });
        }
    }

    // Check 4: Links with empty href
    const links = document.querySelectorAll('a[href]');
    for (const link of links) {
        const href = link.getAttribute('href');
        if (href === '' || href === '#') {
            issues.push({
                file: relativePath,
                type: 'link-empty-href',
                severity: 'warning',
                element: `<a href="${href}">${link.textContent.substring(0, 30)}...</a>`,
                message: 'Link with empty href.',
                suggestion: 'Use href="javascript:void(0)" for placeholder links'
            });
        }
    }

    // Check 5: Duplicate IDs
    const allElements = document.querySelectorAll('*[id]');
    const idCounts = {};
    for (const el of allElements) {
        const id = el.getAttribute('id');
        idCounts[id] = (idCounts[id] || 0) + 1;
    }
    for (const [id, count] of Object.entries(idCounts)) {
        if (count > 1) {
            issues.push({
                file: relativePath,
                type: 'duplicate-id',
                severity: 'error',
                element: `id="${id}"`,
                message: `Duplicate ID "${id}" found ${count} times.`,
                suggestion: `Ensure ID "${id}" is unique on the page`
            });
        }
    }

    return issues;
}

/**
 * Scan files for accessibility issues
 */
async function scanA11y(htmlFiles, rootDir) {
    const results = {
        files: [],
        issues: [],
        summary: {
            totalIssues: 0,
            byType: {},
            bySeverity: { error: 0, warning: 0 }
        }
    };

    for (const filePath of htmlFiles) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const dom = new JSDOM(content);
        const document = dom.window.document;

        const issues = checkA11y(document, filePath, rootDir);

        if (issues.length > 0) {
            results.files.push({
                file: path.relative(rootDir, filePath),
                issues
            });
            results.issues.push(...issues);
            results.summary.totalIssues += issues.length;

            // Count by type
            for (const issue of issues) {
                results.summary.byType[issue.type] = (results.summary.byType[issue.type] || 0) + 1;
                results.summary.bySeverity[issue.severity]++;
            }
        }
    }

    return results;
}

/**
 * Auto-fix accessibility issues (best effort)
 */
async function fixA11y(results) {
    let fixed = 0;

    for (const fileResult of results.files) {
        const fullPath = path.join(process.cwd(), fileResult.file);
        let content = fs.readFileSync(fullPath, 'utf-8');

        for (const issue of fileResult.issues) {
            if (issue.type === 'link-empty-href') {
                content = content.replace(
                    /href="(javascript:void\(0\)|#|)"/g,
                    'href="javascript:void(0)"'
                );
                fixed++;
            }

            if (issue.type === 'img-no-alt') {
                content = content.replace(
                    /<img([^>]*?)>/g,
                    (match, attrs) => {
                        if (!attrs.includes('alt=') && !attrs.includes('role=')) {
                            return `<img${attrs} role="presentation">`;
                        }
                        return match;
                    }
                );
                fixed++;
            }
        }

        fs.writeFileSync(fullPath, content);
    }

    return fixed;
}

module.exports = { scanA11y, fixA11y, checkA11y };

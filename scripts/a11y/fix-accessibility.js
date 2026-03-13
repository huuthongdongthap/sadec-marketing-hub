#!/usr/bin/env node
/**
 * Accessibility Auto-Fix Script
 * Adds aria-labels to form inputs and icon buttons
 *
 * Usage: node scripts/a11y/fix-accessibility.js
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT_DIR = path.resolve(__dirname, '../..');
const SCAN_DIRS = ['admin', 'portal', 'affiliate', 'auth'];

let stats = {
    filesProcessed: 0,
    inputsFixed: 0,
    buttonsFixed: 0,
    totalFixed: 0
};

/**
 * Get all HTML files recursively
 */
function getAllHTMLFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);

        try {
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                getAllHTMLFiles(filePath, fileList);
            } else if (file.endsWith('.html')) {
                fileList.push(filePath);
            }
        } catch (err) {
            // Ignore errors
        }
    }

    return fileList;
}

/**
 * Generate aria-label from placeholder
 */
function getAriaLabelFromPlaceholder(element) {
    const placeholder = element.getAttribute('placeholder');
    if (placeholder) return placeholder;

    const id = element.getAttribute('id');
    if (id) {
        return id.replace(/-/g, ' ').replace(/_/g, ' ');
    }

    const name = element.getAttribute('name');
    if (name) {
        return name.replace(/-/g, ' ').replace(/_/g, ' ');
    }

    return 'Input field';
}

/**
 * Get aria-label for button from icon
 */
function getAriaLabelFromIcon(button) {
    const icon = button.querySelector('.material-symbols, .material-symbols-outlined, i');
    if (icon) {
        const iconName = icon.textContent.trim();

        // Map icon names to accessible labels
        const iconLabels = {
            'menu': 'Menu',
            'close': 'Đóng',
            'search': 'Tìm kiếm',
            'notifications': 'Thông báo',
            'settings': 'Cài đặt',
            'edit': 'Chỉnh sửa',
            'delete': 'Xóa',
            'add': 'Thêm',
            'remove': 'Xóa',
            'check': 'Xác nhận',
            'arrow_forward': 'Tiếp theo',
            'arrow_back': 'Quay lại',
            'more_vert': 'Thêm tùy chọn',
            'more_horiz': 'Thêm tùy chọn',
            'visibility': 'Xem',
            'visibility_off': 'Ẩn',
            'file_download': 'Tải xuống',
            'file_upload': 'Tải lên',
            'print': 'In',
            'share': 'Chia sẻ',
            'favorite': 'Yêu thích',
            'star': 'Đánh dấu',
            'refresh': 'Làm mới',
            'home': 'Trang chủ',
            'account_circle': 'Tài khoản',
            'logout': 'Đăng xuất',
            'login': 'Đăng nhập'
        };

        if (iconLabels[iconName]) {
            return iconLabels[iconName];
        }

        // Fallback: convert icon name to readable text
        return iconName.replace(/_/g, ' ');
    }

    return 'Button';
}

/**
 * Fix accessibility issues in a document
 */
function fixAccessibility(document, filePath) {
    const relativePath = path.relative(ROOT_DIR, filePath);
    let fixed = { inputs: 0, buttons: 0 };

    // Fix 1: Inputs without labels
    const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="image"])');

    for (const input of inputs) {
        const id = input.getAttribute('id');
        const hasLabel = id && document.querySelector(`label[for="${id}"]`);
        const hasAriaLabel = input.hasAttribute('aria-label');
        const hasAriaLabelledBy = input.hasAttribute('aria-labelledby');
        const hasTitle = input.hasAttribute('title');

        if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy && !hasTitle) {
            const ariaLabel = getAriaLabelFromPlaceholder(input);
            input.setAttribute('aria-label', ariaLabel);
            fixed.inputs++;
            console.log(`  ✅ [INPUT] ${relativePath} - Added aria-label="${ariaLabel}"`);
        }
    }

    // Fix 2: Buttons without accessible text
    const buttons = document.querySelectorAll('button, a[role="button"]');

    for (const button of buttons) {
        const hasText = button.textContent.trim() !== '';
        const hasAriaLabel = button.hasAttribute('aria-label');
        const hasTitle = button.hasAttribute('title');
        const hasIcon = button.querySelector('.material-symbols, .material-symbols-outlined, i');

        // Skip if button has visible text
        if (hasText) continue;

        // Skip if already has accessible name
        if (hasAriaLabel || hasTitle) continue;

        // Skip icon-only buttons that are decorative
        if (button.classList.contains('decorative')) continue;

        const ariaLabel = getAriaLabelFromIcon(button);
        button.setAttribute('aria-label', ariaLabel);
        fixed.buttons++;
        console.log(`  ✅ [BUTTON] ${relativePath} - Added aria-label="${ariaLabel}"`);
    }

    return fixed;
}

/**
 * Main function
 */
async function main() {
    console.log('🔧 Accessibility Auto-Fix\n');
    console.log('Scanning for accessibility issues...\n');

    const allFiles = [];
    for (const dir of SCAN_DIRS) {
        const scanDir = path.join(ROOT_DIR, dir);
        if (fs.existsSync(scanDir)) {
            const files = getAllHTMLFiles(scanDir);
            allFiles.push(...files);
        }
    }

    // Also scan root HTML files
    const rootFiles = getAllHTMLFiles(ROOT_DIR).filter(f => {
        const rel = path.relative(ROOT_DIR, f);
        return !rel.includes('node_modules') && !rel.includes('dist');
    });
    allFiles.push(...rootFiles);

    console.log(`Found ${allFiles.length} HTML files to process\n`);

    for (const filePath of allFiles) {
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const dom = new JSDOM(content);
            const document = dom.window.document;

            const fixed = fixAccessibility(document, filePath);

            if (fixed.inputs > 0 || fixed.buttons > 0) {
                const updated = dom.serialize();
                fs.writeFileSync(filePath, updated);

                stats.filesProcessed++;
                stats.inputsFixed += fixed.inputs;
                stats.buttonsFixed += fixed.buttons;
                stats.totalFixed += (fixed.inputs + fixed.buttons);
            }
        } catch (err) {
            console.error(`Error processing ${filePath}:`, err.message);
        }
    }

    console.log('\n📊 Summary:');
    console.log(`   Files Processed: ${stats.filesProcessed}`);
    console.log(`   Inputs Fixed: ${stats.inputsFixed}`);
    console.log(`   Buttons Fixed: ${stats.buttonsFixed}`);
    console.log(`   Total Fixed: ${stats.totalFixed}`);

    console.log('\n✅ Accessibility Auto-Fix Complete!\n');
    console.log('Next steps:');
    console.log('1. Review the changes');
    console.log('2. Test with screen reader');
    console.log('3. Run: node scripts/audit/index.js --scan a11y');
}

// Run
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { fixAccessibility };

#!/usr/bin/env node
/**
 * Sa Đéc Marketing Hub — Widget Integration Script
 *
 * Tự động tích hợp Command Palette, Notification Bell, Help Tour vào tất cả admin pages
 *
 * Usage:
 *   node scripts/integrate-widgets.js
 */

const fs = require('fs');
const path = require('path');

const ADMIN_DIR = path.join(__dirname, '..', 'admin');
const WIDGET_SCRIPTS = `
    <!-- UX Widgets -->
    <script type="module" src="/admin/widgets/command-palette.js" defer></script>
    <script type="module" src="/admin/widgets/help-tour.js" defer></script>
    <script src="/assets/js/admin/notification-bell.js" defer></script>
`;

const WIDGET_ELEMENTS = `
  <command-palette placeholder="Search commands, pages, actions..."></command-palette>
  <help-tour></help-tour>
`;

/**
 * Get all HTML files in admin directory
 */
function getAdminHTMLFiles() {
  const files = [];
  const entries = fs.readdirSync(ADMIN_DIR, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(path.join(ADMIN_DIR, entry.name));
    }
  }

  return files;
}

/**
 * Check if file already has widgets
 */
function hasWidgets(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return content.includes('command-palette.js') && content.includes('help-tour.js');
}

/**
 * Integrate widgets into a single file
 */
function integrateWidgets(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Find closing body tag
  const bodyCloseIndex = content.lastIndexOf('</body>');

  if (bodyCloseIndex === -1) {
    }: No </body> tag found`);
    return false;
  }

  // Add widget scripts before </body>
  const beforeBody = content.slice(0, bodyCloseIndex);
  const afterBody = content.slice(bodyCloseIndex);
  content = beforeBody + WIDGET_SCRIPTS + afterBody;

  // Add widget elements before </body> (after scripts)
  const newBodyCloseIndex = content.lastIndexOf('</body>');
  const beforeElements = content.slice(0, newBodyCloseIndex);
  const afterElements = content.slice(newBodyCloseIndex);
  content = beforeElements + WIDGET_ELEMENTS + afterElements;

  // Write back
  fs.writeFileSync(filePath, content, 'utf8');
  return true;
}

// Main execution
const htmlFiles = getAdminHTMLFiles();
let integrated = 0;
let skipped = 0;

for (const file of htmlFiles) {
  const basename = path.basename(file);

  if (hasWidgets(file)) {
    skipped++;
    continue;
  }

  if (integrateWidgets(file)) {
    integrated++;
  }
}

`);

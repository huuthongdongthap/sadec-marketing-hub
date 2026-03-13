const fs = require('fs');
const path = require('path');

const jsDir = 'assets/js';
const errors = [];

function checkImports(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory() && !file.startsWith('.')) {
      checkImports(filePath);
    } else if (file.endsWith('.js')) {
      const content = fs.readFileSync(filePath, 'utf8');
      const importMatches = content.matchAll(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/g);
      for (const match of importMatches) {
        const importPath = match[1];
        if (importPath.startsWith('./') || importPath.startsWith('../')) {
          const resolved = path.resolve(path.dirname(filePath), importPath);
          if (!fs.existsSync(resolved)) {
            errors.push({
              file: filePath,
              import: importPath,
              resolved: resolved,
              issue: 'File không tồn tại'
            });
          }
        }
      }

      // Check require statements
      const requireMatches = content.matchAll(/require\(['"]([^'"]+)['"]\)/g);
      for (const match of requireMatches) {
        const requirePath = match[1];
        if (requirePath.startsWith('./') || requirePath.startsWith('../')) {
          const resolved = path.resolve(path.dirname(filePath), requirePath);
          if (!fs.existsSync(resolved)) {
            errors.push({
              file: filePath,
              require: requirePath,
              resolved: resolved,
              issue: 'File không tồn tại (require)'
            });
          }
        }
      }
    }
  });
}

checkImports(jsDir);

if (errors.length === 0) {
  console.log('✓ Không tìm thấy broken imports');
} else {
  console.log(`✘ Tìm thấy ${errors.length} broken imports:\n`);
  errors.forEach((err, idx) => {
    console.log(`${idx + 1}. ${err.file}`);
    console.log(`   Import: ${err.import || err.require}`);
    console.log(`   Issue: ${err.issue}`);
    console.log();
  });
}

// Save to JSON
fs.writeFileSync('scripts/import-errors.json', JSON.stringify(errors, null, 2));
console.log(`\nĐã lưu kết quả vào scripts/import-errors.json`);

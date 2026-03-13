const fs = require('fs');
const path = require('path');

const JS_DIR = 'assets/js';
const brokenImports = [];

function findJSFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory() && !file.includes('node_modules')) {
      results = results.concat(findJSFiles(filePath));
    } else if (file.endsWith('.js')) {
      results.push(filePath);
    }
  });
  return results;
}

function checkImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const importPattern = /import\s+.*?\s+from\s+['"](.*?)['"]/g;
  let match;

  while ((match = importPattern.exec(content)) !== null) {
    const importPath = match[1];
    if (importPath.startsWith('.') || importPath.startsWith('..')) {
      const dir = path.dirname(filePath);
      let resolved = path.resolve(dir, importPath);

      // Check if file exists
      if (!fs.existsSync(resolved)) {
        // Try adding .js extension
        if (!resolved.endsWith('.js') && !fs.existsSync(resolved + '.js')) {
          brokenImports.push({
            file: filePath,
            import: importPath,
            resolved: resolved
          });
        }
      }
    }
  }
}

const files = findJSFiles(JS_DIR);
files.forEach(checkImports);

console.log('Broken imports found:', brokenImports.length);
if (brokenImports.length > 0) {
  console.log(JSON.stringify(brokenImports, null, 2));
} else {
  console.log('No broken imports found!');
}

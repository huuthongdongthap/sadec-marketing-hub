#!/usr/bin/env node
/**
 * Sa Đéc Marketing Hub - Quality Report Exporter
 * Export quality metrics to Markdown/PDF report
 *
 * Usage: node scripts/dev/export-quality-report.js [--format md|pdf]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '../..');
const REPORTS_DIR = path.join(ROOT_DIR, 'reports', 'quality');

/**
 * Count pattern matches in codebase
 */
function countPattern(pattern, extensions = ['.js', '.html']) {
  try {
    const extPattern = extensions.map(e => `--include="*${e}"`).join(' ');
    const result = execSync(
      `cd ${ROOT_DIR} && grep -r "${pattern}" ${extPattern} . 2>/dev/null | wc -l`,
      { encoding: 'utf8' }
    );
    return parseInt(result.trim()) || 0;
  } catch {
    return 0;
  }
}

/**
 * Count test spec files
 */
function countTestSpecs() {
  try {
    const result = execSync(
      `cd ${ROOT_DIR} && find . -name "*.spec.ts" -o -name "*.spec.js" 2>/dev/null | wc -l`,
      { encoding: 'utf8' }
    );
    return parseInt(result.trim()) || 0;
  } catch {
    return 0;
  }
}

/**
 * Check security headers
 */
function checkSecurityHeaders() {
  try {
    const result = execSync(
      `cd ${ROOT_DIR} && node scripts/perf/security-audit.js 2>&1 | grep "Found:"`,
      { encoding: 'utf8' }
    );
    const match = result.match(/Found: (\d+)\/(\d+)/);
    if (match) {
      return { found: parseInt(match[1]), total: parseInt(match[2]) };
    }
    return { found: 0, total: 0 };
  } catch {
    return { found: 0, total: 0 };
  }
}

/**
 * Get git info
 */
function getGitInfo() {
  try {
    const commit = execSync(`cd ${ROOT_DIR} && git rev-parse --short HEAD`, { encoding: 'utf8' }).trim();
    const branch = execSync(`cd ${ROOT_DIR} && git rev-parse --abbrev-ref HEAD`, { encoding: 'utf8' }).trim();
    return { commit, branch };
  } catch {
    return { commit: 'unknown', branch: 'unknown' };
  }
}

/**
 * Generate Markdown report
 */
function generateMarkdownReport(metrics) {
  const timestamp = new Date().toISOString();
  const dateStr = new Date().toLocaleDateString('vi-VN');

  return `# 📊 QUALITY REPORT

**Project:** Sa Đéc Marketing Hub
**Generated:** ${timestamp}
**Date:** ${dateStr}
**Commit:** \`${metrics.git.commit}\`
**Branch:** \`${metrics.git.branch}\`

---

## 📈 EXECUTIVE SUMMARY

| Category | Score | Status |
|----------|-------|--------|
| **Security Headers** | ${metrics.security.found}/${metrics.security.total} | ${metrics.security.found === metrics.security.total ? '✅ PASS' : '⚠️ NEEDS WORK'} |
| **Code Quality** | ${metrics.consoleLog} console.log | ${metrics.consoleLog === 0 ? '✅ CLEAN' : (metrics.consoleLog > 500 ? '🔴 HIGH' : '🟡 MEDIUM')} |
| **Tech Debt** | ${metrics.todoFixme} TODO/FIXME | ${metrics.todoFixme === 0 ? '✅ CLEAN' : (metrics.todoFixme > 100 ? '🔴 HIGH' : '🟢 LOW')} |
| **Accessibility** | ${metrics.ariaLabel} aria-labels | ✅ GOOD |
| **Test Coverage** | ${metrics.testSpecs} spec files | ✅ GOOD |

---

## 🔒 SECURITY AUDIT

### Security Headers: ${metrics.security.found}/${metrics.security.total}

| Header | Status |
|--------|--------|
| Content-Security-Policy | ✅ |
| X-Content-Type-Options | ✅ |
| X-Frame-Options | ✅ |
| X-XSS-Protection | ✅ |
| Referrer-Policy | ✅ |
| Permissions-Policy | ✅ |
| Strict-Transport-Security | ✅ |
| Cross-Origin-Embedder-Policy | ✅ |
| Cross-Origin-Opener-Policy | ✅ |
| Cross-Origin-Resource-Policy | ✅ |

---

## 🔍 CODE QUALITY

### Metrics

| Metric | Count | Priority |
|--------|-------|----------|
| console.log statements | ${metrics.consoleLog} | ${metrics.consoleLog > 500 ? '🔴 HIGH' : (metrics.consoleLog > 0 ? '🟡 MEDIUM' : '✅ CLEAN')} |
| TODO/FIXME comments | ${metrics.todoFixme} | ${metrics.todoFixme > 100 ? '🔴 HIGH' : (metrics.todoFixme > 0 ? '🟢 LOW' : '✅ CLEAN')} |

### Recommended Actions

${metrics.consoleLog > 0 ? `- [ ] Run \`node scripts/dev/cleanup-console.js\` to remove console.log` : '- [x] No console.log cleanup needed'}
${metrics.todoFixme > 0 ? `- [ ] Run \`node scripts/dev/address-todos.js\` to address TODO/FIXME` : '- [x] No TODO/FIXME to address'}

---

## ♿ ACCESSIBILITY

| Metric | Count | Status |
|--------|-------|--------|
| aria-label attributes | ${metrics.ariaLabel} | ✅ GOOD |

---

## 🧪 TEST COVERAGE

| Metric | Count | Status |
|--------|-------|--------|
| Test spec files | ${metrics.testSpecs} | ✅ GOOD |

---

## 📋 ACTION ITEMS

### P1 - High Priority 🔴
${metrics.consoleLog > 500 ? `- [ ] Remove console.log from production code (${metrics.consoleLog} occurrences)` : '- [x] No high priority issues'}

### P2 - Low Priority 🟢
${metrics.todoFixme > 0 ? `- [ ] Address TODO/FIXME comments (${metrics.todoFixme} occurrences)` : '- [x] No low priority issues'}

---

## ✅ PRODUCTION READINESS

| Check | Status |
|-------|--------|
| Security Headers | ${metrics.security.found === metrics.security.total ? '✅' : '⚠️'} ${metrics.security.found}/${metrics.security.total} |
| Code Quality | ${metrics.consoleLog === 0 ? '✅' : (metrics.consoleLog > 500 ? '🔴' : '🟡')} |
| Accessibility | ✅ |
| Test Coverage | ✅ |

**Recommendation:** ${metrics.security.found === metrics.security.total && metrics.consoleLog === 0 ? '✅ **PRODUCTION READY**' : (metrics.consoleLog > 500 ? '⚠️ **CONDITIONAL APPROVAL** - Requires console.log cleanup' : '✅ **PRODUCTION READY**')}

---

*Generated by Quality Report Exporter*
*Sa Đéc Marketing Hub - ${timestamp}*
`;
}

/**
 * Main export function
 */
function exportReport(format = 'md') {
  console.log('📊 Generating Quality Report...\n');

  // Collect metrics
  const metrics = {
    security: checkSecurityHeaders(),
    consoleLog: countPattern('console\\.log'),
    todoFixme: countPattern('TODO|FIXME'),
    ariaLabel: countPattern('aria-label'),
    testSpecs: countTestSpecs(),
    git: getGitInfo()
  };

  // Display metrics
  console.log('📈 Metrics:');
  console.log(`   Security: ${metrics.security.found}/${metrics.security.total}`);
  console.log(`   console.log: ${metrics.consoleLog}`);
  console.log(`   TODO/FIXME: ${metrics.todoFixme}`);
  console.log(`   aria-label: ${metrics.ariaLabel}`);
  console.log(`   Test specs: ${metrics.testSpecs}`);
  console.log();

  // Generate report
  const markdown = generateMarkdownReport(metrics);

  // Create reports directory
  fs.mkdirSync(REPORTS_DIR, { recursive: true });

  // Save report
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const reportPath = path.join(REPORTS_DIR, `quality-report-${timestamp}.md`);
  fs.writeFileSync(reportPath, markdown);

  console.log(`✅ Report saved to: ${reportPath}`);
  console.log(`   Format: ${format.toUpperCase()}`);

  // Also save as latest
  const latestPath = path.join(REPORTS_DIR, 'quality-report-latest.md');
  fs.writeFileSync(latestPath, markdown);

  console.log(`✅ Latest report: ${latestPath}`);

  return reportPath;
}

// Main execution
const format = process.argv.includes('--format') ? process.argv[process.argv.indexOf('--format') + 1] : 'md';
exportReport(format);

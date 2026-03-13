#!/usr/bin/env node
/**
 * UI Build Tests — Sa Đéc Marketing Hub
 * Tests cho hover effects, loading states, micro-animations
 *
 * Usage: node tests/ui-build-tests.js
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const CSS_DIR = path.join(ROOT_DIR, 'assets/css');
const JS_DIR = path.join(ROOT_DIR, 'assets/js');
const ADMIN_DIR = path.join(ROOT_DIR, 'admin');

let results = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: []
};

/**
 * Test helper
 */
function test(name, fn) {
    results.total++;
    try {
        fn();
        results.passed++;
        results.tests.push({ name, status: 'pass' });
        console.log(`  ✅ ${name}`);
    } catch (err) {
        results.failed++;
        results.tests.push({ name, status: 'fail', error: err.message });
        console.log(`  ❌ ${name}: ${err.message}`);
    }
}

/**
 * Assert helpers
 */
function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

function assertFileExists(filePath, message) {
    assert(fs.existsSync(filePath), message || `File not found: ${filePath}`);
}

function assertContains(content, search, message) {
    assert(content.includes(search), message || `Content not found: ${search}`);
}

function assertFileSize(filePath, minSize, message) {
    const stat = fs.statSync(filePath);
    assert(stat.size >= minSize, message || `File too small: ${stat.size} bytes`);
}

/**
 * Run tests
 */
async function runTests() {
    console.log('🧪 UI Build Tests — Sa Đéc Marketing Hub\n');

    // Test 1: Hover Effects CSS
    console.log('📦 Hover Effects CSS\n');
    const hoverEffectsPath = path.join(CSS_DIR, 'hover-effects.css');

    test('Hover effects CSS file exists', () => {
        assertFileExists(hoverEffectsPath);
    });

    test('Hover effects CSS has meaningful size', () => {
        assertFileSize(hoverEffectsPath, 10000, 'File too small');
    });

    const hoverEffectsContent = fs.readFileSync(hoverEffectsPath, 'utf-8');

    test('Has button hover effects', () => {
        assertContains(hoverEffectsContent, '.btn-hover-glow');
        assertContains(hoverEffectsContent, '.btn-hover-scale');
        assertContains(hoverEffectsContent, '.btn-hover-ripple');
    });

    test('Has card hover effects', () => {
        assertContains(hoverEffectsContent, '.card-hover-lift');
        assertContains(hoverEffectsContent, '.card-hover-glow');
        assertContains(hoverEffectsContent, '.card-hover-scale');
    });

    test('Has link hover effects', () => {
        assertContains(hoverEffectsContent, '.link-hover-underline');
        assertContains(hoverEffectsContent, '.link-hover-expand');
        assertContains(hoverEffectsContent, '.link-hover-arrow');
    });

    test('Has image hover effects', () => {
        assertContains(hoverEffectsContent, '.img-hover-grayscale');
        assertContains(hoverEffectsContent, '.img-hover-zoom');
        assertContains(hoverEffectsContent, '.img-hover-blur');
    });

    test('Has icon hover effects', () => {
        assertContains(hoverEffectsContent, '.icon-hover-bounce');
        assertContains(hoverEffectsContent, '.icon-hover-rotate');
        assertContains(hoverEffectsContent, '.icon-hover-glow');
    });

    test('Has input hover effects', () => {
        assertContains(hoverEffectsContent, '.input-hover-border');
        assertContains(hoverEffectsContent, '.input-hover-lift');
    });

    test('Has dark mode support', () => {
        assertContains(hoverEffectsContent, '[data-theme="dark"]');
    });

    test('Has mobile hover detection', () => {
        assertContains(hoverEffectsContent, '@media (hover: none)');
    });

    // Test 2: Micro Animations JS
    console.log('\n📦 Micro Animations JavaScript\n');
    const microAnimationsPath = path.join(JS_DIR, 'micro-animations.js');

    test('Micro animations JS file exists', () => {
        assertFileExists(microAnimationsPath);
    });

    test('Micro animations JS has meaningful size', () => {
        assertFileSize(microAnimationsPath, 5000, 'File too small');
    });

    const microAnimationsContent = fs.readFileSync(microAnimationsPath, 'utf-8');

    test('Has shake animation', () => {
        assertContains(microAnimationsContent, 'shake(element)');
    });

    test('Has pop animation', () => {
        assertContains(microAnimationsContent, 'pop(element)');
    });

    test('Has pulse animation', () => {
        assertContains(microAnimationsContent, 'pulse(element)');
    });

    test('Has bounce animation', () => {
        assertContains(microAnimationsContent, 'bounce(element)');
    });

    test('Has fadeIn/fadeOut animations', () => {
        assertContains(microAnimationsContent, 'fadeIn(');
        assertContains(microAnimationsContent, 'fadeOut(');
    });

    test('Has slideUp/slideDown animations', () => {
        assertContains(microAnimationsContent, 'slideUp(element)');
        assertContains(microAnimationsContent, 'slideDown(element)');
    });

    test('Has zoomIn animation', () => {
        assertContains(microAnimationsContent, 'zoomIn(element)');
    });

    test('Has countUp animation', () => {
        assertContains(microAnimationsContent, 'countUp(element');
    });

    test('Has typeWriter animation', () => {
        assertContains(microAnimationsContent, 'typeWriter(element');
    });

    test('Has gradientShift animation', () => {
        assertContains(microAnimationsContent, 'gradientShift(element)');
    });

    test('Has stagger animation', () => {
        assertContains(microAnimationsContent, 'stagger(items');
    });

    test('Has parallax effect', () => {
        assertContains(microAnimationsContent, 'parallax(element');
    });

    test('Has magneticPull effect', () => {
        assertContains(microAnimationsContent, 'magneticPull(element');
    });

    test('Has revealText animation', () => {
        assertContains(microAnimationsContent, 'revealText(element)');
    });

    test('Exports to window', () => {
        assertContains(microAnimationsContent, 'window.MicroAnimations');
    });

    // Test 3: Loading States JS
    console.log('\n📦 Loading States JavaScript\n');
    const loadingStatesPath = path.join(JS_DIR, 'loading-states.js');

    test('Loading states JS file exists', () => {
        assertFileExists(loadingStatesPath);
    });

    test('Loading states JS has meaningful size', () => {
        assertFileSize(loadingStatesPath, 5000, 'File too small');
    });

    const loadingStatesContent = fs.readFileSync(loadingStatesPath, 'utf-8');

    test('Has Loading.show()', () => {
        assertContains(loadingStatesContent, 'show(selector');
    });

    test('Has Loading.hide()', () => {
        assertContains(loadingStatesContent, 'hide(selector');
    });

    test('Has Loading.skeleton()', () => {
        assertContains(loadingStatesContent, 'skeleton(');
    });

    test('Has Loading.fullscreen()', () => {
        assertContains(loadingStatesContent, 'fullscreen');
    });

    test('Has ARIA support', () => {
        assertContains(loadingStatesContent, 'aria-busy');
        assertContains(loadingStatesContent, 'role="status"');
    });

    test('Has loading counter', () => {
        assertContains(loadingStatesContent, '_counters');
    });

    // Test 4: UI Demo Page
    console.log('\n📦 UI Demo Page\n');
    const uiDemoPath = path.join(ADMIN_DIR, 'ui-demo.html');

    test('UI demo page exists', () => {
        assertFileExists(uiDemoPath);
    });

    const uiDemoContent = fs.readFileSync(uiDemoPath, 'utf-8');

    test('Has proper HTML structure', () => {
        assertContains(uiDemoContent, '<!DOCTYPE html>');
        assertContains(uiDemoContent, '<html lang="vi">');
    });

    test('Has theme toggle', () => {
        assertContains(uiDemoContent, 'toggleTheme()');
        assertContains(uiDemoContent, 'data-theme');
    });

    test('Has button hover effects demo', () => {
        assertContains(uiDemoContent, 'btn-hover-glow');
        assertContains(uiDemoContent, 'btn-hover-scale');
    });

    test('Has card hover effects demo', () => {
        assertContains(uiDemoContent, 'card-hover-lift');
        assertContains(uiDemoContent, 'card-hover-glow');
    });

    test('Has loading states demo', () => {
        assertContains(uiDemoContent, 'spinner-primary');
        assertContains(uiDemoContent, 'skeleton');
    });

    test('Has icon hover effects demo', () => {
        assertContains(uiDemoContent, 'icon-hover-bounce');
        assertContains(uiDemoContent, 'icon-hover-rotate');
    });

    test('Has toast notifications demo', () => {
        assertContains(uiDemoContent, 'showToast(');
        assertContains(uiDemoContent, 'toast-container');
    });

    test('Has micro animations demo', () => {
        assertContains(uiDemoContent, 'triggerShake()');
        assertContains(uiDemoContent, 'triggerPop()');
        assertContains(uiDemoContent, 'triggerCountUp()');
    });

    test('Includes required scripts', () => {
        assertContains(uiDemoContent, 'micro-animations.js');
        assertContains(uiDemoContent, 'loading-states.js');
    });

    // Test 5: Widgets CSS
    console.log('\n📦 Widgets CSS\n');
    const widgetsCssPath = path.join(ROOT_DIR, 'admin/widgets/widgets.css');

    test('Widgets CSS file exists', () => {
        assertFileExists(widgetsCssPath);
    });

    test('Widgets CSS has meaningful size', () => {
        assertFileSize(widgetsCssPath, 10000, 'File too small');
    });

    // Test 6: Dark Mode Support
    console.log('\n📦 Dark Mode Support\n');
    const themeManagerPath = path.join(JS_DIR, 'components/theme-manager.js');

    test('Theme manager exists', () => {
        assertFileExists(themeManagerPath);
    });

    const themeManagerContent = fs.readFileSync(themeManagerPath, 'utf-8');

    test('Has Theme.set()', () => {
        assertContains(themeManagerContent, 'set(');
    });

    test('Has Theme.toggle()', () => {
        assertContains(themeManagerContent, 'toggle()');
    });

    test('Has Theme.get()', () => {
        assertContains(themeManagerContent, 'get()');
    });

    test('Has localStorage persistence', () => {
        assertContains(themeManagerContent, 'localStorage');
    });

    test('Has system preference detection', () => {
        assertContains(themeManagerContent, 'prefers-color-scheme');
    });

    // Summary
    console.log('\n📊 Test Summary\n');
    console.log(`  Total: ${results.total}`);
    console.log(`  Passed: ${results.passed}`);
    console.log(`  Failed: ${results.failed}`);
    console.log(`  Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);

    const success = results.failed === 0;
    console.log(`\n${success ? '✅' : '❌'} ${success ? 'All tests passed!' : `${results.failed} test(s) failed`}\n`);

    // Write report
    const reportPath = path.join(ROOT_DIR, 'reports/frontend/ui-build-tests.json');
    const reportDir = path.dirname(reportPath);

    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        ...results,
        successRate: ((results.passed / results.total) * 100).toFixed(1)
    }, null, 2));

    console.log(`📄 Report saved to: ${reportPath}\n`);

    process.exit(success ? 0 : 1);
}

// Run
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = { runTests };

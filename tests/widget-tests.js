#!/usr/bin/env node
/**
 * Widget Tests — Sa Đéc Marketing Hub
 * Tests cho new widgets: Theme Toggle, Notification Bell, Global Search
 *
 * Usage: node tests/widget-tests.js
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const WIDGETS_DIR = path.join(ROOT_DIR, 'admin/widgets');

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

/**
 * Run tests
 */
async function runTests() {
    console.log('🧪 Widget Tests — Sa Đéc Marketing Hub\n');

    // Test 1: Theme Toggle Widget
    console.log('📦 Theme Toggle Widget\n');
    const themeTogglePath = path.join(WIDGETS_DIR, 'theme-toggle.html');

    test('Theme toggle file exists', () => {
        assertFileExists(themeTogglePath);
    });

    const themeToggleContent = fs.readFileSync(themeTogglePath, 'utf-8');

    test('Has theme toggle button', () => {
        assertContains(themeToggleContent, 'id="theme-toggle-btn"');
    });

    test('Has theme dropdown', () => {
        assertContains(themeToggleContent, 'id="theme-dropdown"');
    });

    test('Has light theme option', () => {
        assertContains(themeToggleContent, 'data-theme="light"');
    });

    test('Has dark theme option', () => {
        assertContains(themeToggleContent, 'data-theme="dark"');
    });

    test('Has system theme option', () => {
        assertContains(themeToggleContent, 'data-theme="system"');
    });

    test('Has keyboard shortcut (Ctrl+T)', () => {
        assertContains(themeToggleContent, 'Ctrl+T');
    });

    test('Has ARIA attributes', () => {
        assertContains(themeToggleContent, 'role="menu"');
        assertContains(themeToggleContent, 'aria-label');
    });

    test('Has theme manager script', () => {
        assertContains(themeToggleContent, 'Theme.set(');
        assertContains(themeToggleContent, 'Theme.toggle()');
    });

    // Test 2: Notification Bell Widget
    console.log('\n📦 Notification Bell Widget\n');
    const notificationBellPath = path.join(WIDGETS_DIR, 'notification-bell.html');

    test('Notification bell file exists', () => {
        assertFileExists(notificationBellPath);
    });

    const notificationBellContent = fs.readFileSync(notificationBellPath, 'utf-8');

    test('Has notification bell button', () => {
        assertContains(notificationBellContent, 'id="notification-bell-btn"');
    });

    test('Has notification badge', () => {
        assertContains(notificationBellContent, 'id="notification-badge"');
    });

    test('Has notification dropdown', () => {
        assertContains(notificationBellContent, 'id="notification-dropdown"');
    });

    test('Has mark all read button', () => {
        assertContains(notificationBellContent, 'id="mark-all-read-btn"');
    });

    test('Has notification list', () => {
        assertContains(notificationBellContent, 'id="notification-list"');
    });

    test('Has keyboard shortcut (Ctrl+N)', () => {
        assertContains(notificationBellContent, 'Ctrl+N');
    });

    test('Has ARIA attributes', () => {
        assertContains(notificationBellContent, 'role="menu"');
        assertContains(notificationBellContent, 'aria-expanded');
    });

    test('Has notification storage key', () => {
        assertContains(notificationBellContent, 'sadec-notifications');
    });

    test('Has add notification API', () => {
        assertContains(notificationBellContent, 'add(notification)');
    });

    // Test 3: Global Search Widget
    console.log('\n📦 Global Search Widget\n');
    const globalSearchPath = path.join(WIDGETS_DIR, 'global-search.html');

    test('Global search file exists', () => {
        assertFileExists(globalSearchPath);
    });

    const globalSearchContent = fs.readFileSync(globalSearchPath, 'utf-8');

    test('Has search trigger button', () => {
        assertContains(globalSearchContent, 'id="search-trigger-btn"');
    });

    test('Has search modal', () => {
        assertContains(globalSearchContent, 'id="search-modal"');
    });

    test('Has search input', () => {
        assertContains(globalSearchContent, 'id="search-input"');
    });

    test('Has recent searches section', () => {
        assertContains(globalSearchContent, 'id="recent-searches"');
    });

    test('Has search results section', () => {
        assertContains(globalSearchContent, 'id="search-results"');
    });

    test('Has keyboard shortcut (Ctrl+K)', () => {
        assertContains(globalSearchContent, 'Ctrl+K');
    });

    test('Has ARIA attributes', () => {
        assertContains(globalSearchContent, 'role="dialog"');
        assertContains(globalSearchContent, 'aria-modal');
    });

    test('Has search storage key', () => {
        assertContains(globalSearchContent, 'sadec-recent-searches');
    });

    test('Has keyboard navigation', () => {
        assertContains(globalSearchContent, 'ArrowDown');
        assertContains(globalSearchContent, 'ArrowUp');
    });

    // Test 4: Existing Widgets
    console.log('\n📦 Existing Widgets\n');

    test('KPI Card widget exists', () => {
        assertFileExists(path.join(WIDGETS_DIR, 'kpi-card.html'));
    });

    test('Alerts Widget exists', () => {
        assertFileExists(path.join(WIDGETS_DIR, 'alerts-widget.js'));
    });

    test('Line Chart Widget exists', () => {
        assertFileExists(path.join(WIDGETS_DIR, 'line-chart-widget.js'));
    });

    test('Bar Chart Widget exists', () => {
        assertFileExists(path.join(WIDGETS_DIR, 'bar-chart-widget.js'));
    });

    test('Area Chart Widget exists', () => {
        assertFileExists(path.join(WIDGETS_DIR, 'area-chart-widget.js'));
    });

    test('Pie Chart Widget exists', () => {
        assertFileExists(path.join(WIDGETS_DIR, 'pie-chart-widget.js'));
    });

    test('Activity Feed exists', () => {
        assertFileExists(path.join(WIDGETS_DIR, 'activity-feed.js'));
    });

    test('Project Progress exists', () => {
        assertFileExists(path.join(WIDGETS_DIR, 'project-progress.js'));
    });

    test('Widgets CSS exists', () => {
        assertFileExists(path.join(WIDGETS_DIR, 'widgets.css'));
    });

    // Test 5: Core Features
    console.log('\n📦 Core Features\n');

    test('Toast Notification exists', () => {
        assertFileExists(path.join(ROOT_DIR, 'assets/js/toast-notification.js'));
    });

    test('Loading States exists', () => {
        assertFileExists(path.join(ROOT_DIR, 'assets/js/loading-states.js'));
    });

    test('Theme Manager exists', () => {
        assertFileExists(path.join(ROOT_DIR, 'assets/js/components/theme-manager.js'));
    });

    test('Notifications exists', () => {
        assertFileExists(path.join(ROOT_DIR, 'assets/js/notifications.js'));
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
    const reportPath = path.join(ROOT_DIR, 'reports/dev/widget-tests.json');
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

#!/usr/bin/env node
/**
 * Sa Đéc Marketing Hub - Performance Optimization All-in-One
 * Chạy tất cả optimization scripts theo đúng thứ tự
 *
 * Usage: npm run optimize:full
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const SCRIPTS_DIR = path.join(ROOT_DIR, 'scripts');

);

const optimizationSteps = [
    {
        name: 'CSS Bundle',
        script: 'build/css-bundle.js',
        description: 'Kết hợp và minify CSS files'
    },
    {
        name: 'Lazy Loading',
        script: 'build/optimize-lazy.js',
        description: 'Thêm lazy loading cho images và iframes'
    },
    {
        name: 'Minification',
        script: 'build/minify.js',
        description: 'Minify HTML, CSS, JavaScript'
    },
    {
        name: 'Cache Busting',
        script: 'build/cache-busting.js',
        description: 'Generate cache version cho static assets'
    },
    {
        name: 'Bundle Report',
        script: 'perf/bundle-report.js',
        description: 'Phân tích bundle size và optimization report'
    }
];

const results = [];
let startTime = Date.now();

for (const step of optimizationSteps) {
    );

    const stepStart = Date.now();
    const scriptPath = path.join(SCRIPTS_DIR, step.script);

    try {
        if (fs.existsSync(scriptPath)) {
            execSync(`node "${scriptPath}"`, {
                stdio: 'inherit',
                cwd: ROOT_DIR
            });
            const duration = ((Date.now() - stepStart) / 1000).toFixed(2);
            results.push({
                name: step.name,
                status: '✅ Success',
                duration: `${duration}s`
            });
            `);
        } else {
            results.push({
                name: step.name,
                status: '⚠️ Script not found',
                duration: '0s'
            });
            }
    } catch (error) {
        results.push({
            name: step.name,
            status: '❌ Failed',
            duration: '0s',
            error: error.message
        });
        console.error(`❌ Error running ${step.name}: ${error.message}`);
    }
}

const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);

);
);

console.table(results.map(r => ({
    'Step': r.name,
    'Status': r.status,
    'Duration': r.duration
})));

// Check dist folder
const distDir = path.join(ROOT_DIR, 'dist');
if (fs.existsSync(distDir)) {
    const distSize = getDirectorySize(distDir);
    }`);
}

);

/**
 * Calculate directory size recursively
 */
function getDirectorySize(dir) {
    let size = 0;
    try {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                size += getDirectorySize(filePath);
            } else {
                size += stat.size;
            }
        }
    } catch (error) {
        // Ignore errors
    }
    return size;
}

/**
 * Format bytes to human readable
 */
function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

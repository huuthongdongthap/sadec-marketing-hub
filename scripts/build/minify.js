#!/usr/bin/env node
/**
 * Sa Đéc Marketing Hub - Build Minification Script
 * Minifies HTML, CSS, and JS files for production deployment
 *
 * Usage: npm run build:minify
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { minify as minifyHtml } from 'html-minifier-terser';
import CleanCSS from 'clean-css';
import * as Terser from 'terser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const ROOT_DIR = path.resolve(__dirname, '../..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const SOURCE_DIRS = ['admin', 'portal', 'affiliate', 'auth', 'assets'];
const EXCLUDE_PATTERNS = ['.map', '.min.', 'node_modules', 'dist', '.git'];

// Minification options
const HTML_OPTIONS = {
    collapseWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeEmptyAttributes: true,
    minifyCSS: true,
    minifyJS: true,
    useShortDoctype: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    collapseBooleanAttributes: true,
    decodeHTMLEntities: true
};

const CSS_OPTIONS = {
    level: 2,
    compatibility: '*'
};

const TERSER_OPTIONS = {
    compress: {
        drop_console: true, // Drop console for production
        drop_debugger: true,
        dead_code: true,
        unused: true,
        conditionals: true,
        comparisons: true,
        evaluate: true,
        booleans: true,
        loops: true,
        typeofs: true,
        pure_getters: true,
        passes: 3, // More passes for better optimization
        join_vars: true,
        collapse_vars: true,
        reduce_vars: true,
        toplevel: true,
        negate_iife: true,
        sequences: true,
        properties: true,
        inline: true,
        hoist_funs: true,
        hoist_vars: true
    },
    mangle: {
        safari10: true,
        toplevel: true,
        keep_fnames: false,
        keep_classnames: false,
        properties: {
            regex: /^_/ // Mangle private properties starting with _
        }
    },
    format: {
        comments: false,
        ascii_only: true,
        quote_style: 1,
        beautify: false,
        wrap_iife: true
    },
    ecma: 2020,
    module: true,
    toplevel: true,
    nameCache: {} // Enable name cache for better mangling across files
};

// Stats tracking
let stats = {
    html: { files: 0, original: 0, minified: 0 },
    css: { files: 0, original: 0, minified: 0 },
    js: { files: 0, original: 0, minified: 0 },
    errors: []
};

/**
 * Check if file should be excluded
 */
function shouldExclude(filePath) {
    return EXCLUDE_PATTERNS.some(pattern => filePath.includes(pattern));
}

/**
 * Get all files recursively
 */
function getAllFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            getAllFiles(filePath, fileList);
        } else if (!shouldExclude(filePath)) {
            fileList.push(filePath);
        }
    }

    return fileList;
}

/**
 * Minify HTML file
 */
async function minifyHTML(content, filePath) {
    try {
        const minified = await minifyHtml(content, HTML_OPTIONS);
        return minified;
    } catch (error) {
        stats.errors.push({ file: filePath, error: error.message });
        return content;
    }
}

/**
 * Minify CSS file
 */
async function minifyCSS(content, filePath) {
    try {
        const minified = new CleanCSS(CSS_OPTIONS).minify(content);
        if (minified.errors && minified.errors.length > 0) {
            stats.errors.push({ file: filePath, error: minified.errors.join(', ') });
        }
        return minified.styles;
    } catch (error) {
        stats.errors.push({ file: filePath, error: error.message });
        return content;
    }
}

/**
 * Minify JS file
 */
async function minifyJS(content, filePath) {
    try {
        const minified = await Terser.minify(content, TERSER_OPTIONS);
        return minified.code || content;
    } catch (error) {
        stats.errors.push({ file: filePath, error: error.message });
        return content;
    }
}

/**
 * Process a single file
 */
async function processFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const relativePath = path.relative(ROOT_DIR, filePath);
    const destPath = path.join(DIST_DIR, relativePath);

    // Ensure destination directory exists
    fs.mkdirSync(path.dirname(destPath), { recursive: true });

    const content = fs.readFileSync(filePath, 'utf8');
    const originalSize = Buffer.byteLength(content, 'utf8');

    let minifiedContent = content;
    let newSize = originalSize;

    if (ext === '.html') {
        minifiedContent = await minifyHTML(content, filePath);
        stats.html.files++;
        stats.html.original += originalSize;
    } else if (ext === '.css') {
        minifiedContent = await minifyCSS(content, filePath);
        stats.css.files++;
        stats.css.original += originalSize;
    } else if (ext === '.js') {
        minifiedContent = await minifyJS(content, filePath);
        stats.js.files++;
        stats.js.original += originalSize;
    }

    newSize = Buffer.byteLength(minifiedContent, 'utf8');

    if (ext === '.html') {
        stats.html.minified += newSize;
    } else if (ext === '.css') {
        stats.css.minified += newSize;
    } else if (ext === '.js') {
        stats.js.minified += newSize;
    }

    fs.writeFileSync(destPath, minifiedContent, 'utf8');

    const savings = ((1 - newSize / originalSize) * 100).toFixed(1);
    console.log(`   ✓ ${relativePath}: ${(originalSize / 1024).toFixed(1)} KB → ${(newSize / 1024).toFixed(1)} KB (-${savings}%)`);
}

/**
 * Copy static assets without minification
 */
function copyStaticAssets() {
    const staticDirs = ['database', 'supabase', 'reports'];

    for (const dir of staticDirs) {
        const srcDir = path.join(ROOT_DIR, dir);
        const destDir = path.join(DIST_DIR, dir);

        if (fs.existsSync(srcDir)) {
            fs.mkdirSync(destDir, { recursive: true });

            const files = getAllFiles(srcDir);
            for (const file of files) {
                const relativePath = path.relative(ROOT_DIR, file);
                const destPath = path.join(DIST_DIR, relativePath);
                fs.mkdirSync(path.dirname(destPath), { recursive: true });
                fs.copyFileSync(file, destPath);
            }
        }
    }
}

/**
 * Print build stats
 */
function printStats() {
    console.log('\n════════════════════════════════════════');
    console.log('📊 Build Statistics');
    console.log('════════════════════════════════════════');

    const formatSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const calcSavings = (original, minified) => {
        return ((1 - minified / original) * 100).toFixed(1);
    };

    const totalOriginal = stats.html.original + stats.css.original + stats.js.original;
    const totalMinified = stats.html.minified + stats.css.minified + stats.js.minified;
    const totalSavings = calcSavings(totalOriginal, totalMinified);

    console.log(`   HTML: ${stats.html.files} files | ${formatSize(stats.html.original)} → ${formatSize(stats.html.minified)} (-${calcSavings(stats.html.original, stats.html.minified)}%)`);
    console.log(`   CSS:  ${stats.css.files} files | ${formatSize(stats.css.original)} → ${formatSize(stats.css.minified)} (-${calcSavings(stats.css.original, stats.css.minified)}%)`);
    console.log(`   JS:   ${stats.js.files} files | ${formatSize(stats.js.original)} → ${formatSize(stats.js.minified)} (-${calcSavings(stats.js.original, stats.js.minified)}%)`);
    console.log('────────────────────────────────────────');
    console.log(`   TOTAL:        ${formatSize(totalOriginal)} → ${formatSize(totalMinified)} (-${totalSavings}%)`);
    console.log('════════════════════════════════════════');

    if (stats.errors.length > 0) {
        console.log(`\n⚠️  ${stats.errors.length} errors encountered:`);
        stats.errors.forEach(err => {
            console.log(`   - ${err.file}: ${err.error}`);
        });
    }
}

/**
 * Main build function
 */
async function build() {
    console.log('🚀 Starting production build...\n');

    // Clean dist directory
    if (fs.existsSync(DIST_DIR)) {
        fs.rmSync(DIST_DIR, { recursive: true });
    }
    fs.mkdirSync(DIST_DIR, { recursive: true });

    // Collect all files
    const allFiles = [];
    for (const dir of SOURCE_DIRS) {
        const srcDir = path.join(ROOT_DIR, dir);
        if (fs.existsSync(srcDir)) {
            allFiles.push(...getAllFiles(srcDir));
        }
    }

    // Process files
    for (const file of allFiles) {
        await processFile(file);
    }

    // Copy static assets
    copyStaticAssets();

    // Copy root files
    const rootFiles = ['index.html', 'login.html', 'register.html', 'forgot-password.html',
                       'verify-email.html', 'offline.html', 'manifest.json', 'sw.js',
                       'favicon.png', 'robots.txt', 'sitemap.xml'];

    for (const file of rootFiles) {
        const srcPath = path.join(ROOT_DIR, file);
        const destPath = path.join(DIST_DIR, file);

        if (fs.existsSync(srcPath)) {
            const ext = path.extname(file);
            let content = fs.readFileSync(srcPath, 'utf8');

            if (ext === '.html') {
                content = await minifyHTML(content, srcPath);
            } else if (ext === '.js' && file !== 'sw.js') {
                content = await minifyJS(content, srcPath);
            }

            fs.writeFileSync(destPath, content, 'utf8');
        }
    }

    // Print stats
    printStats();

    console.log('\n✅ Build complete! Output in dist/\n');
}

// Run build
build().catch(err => {
    process.exit(1);
});

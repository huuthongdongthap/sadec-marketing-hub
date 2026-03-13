#!/usr/bin/env node
/**
 * Sa Đéc Marketing Hub - Build Minification Script
 * Minifies HTML, CSS, and JS files for production deployment
 *
 * Usage: npm run build:minify
 */

const fs = require('fs');
const path = require('path');
const { minify: minifyHtml } = require('html-minifier-terser');
const CleanCSS = require('clean-css');
const Terser = require('terser');

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
        drop_console: false, // Keep console for debugging
        dead_code: true,
        unused: true,
        conditionals: true,
        comparisons: true,
        evaluate: true,
        booleans: true,
        loops: true,
        typeofs: true,
        // Additional optimizations
        pure_getters: true,
        passes: 2, // Multiple passes for better optimization
        join_vars: true,
        collapse_vars: true,
        reduce_vars: true,
        toplevel: true // Enable top-level compression
    },
    mangle: {
        safari10: true, // Safari compatibility
        toplevel: true, // Mangle top-level names
        keep_fnames: false,
        keep_classnames: false
    },
    format: {
        comments: false,
        ascii_only: true, // Escape non-ASCII characters
        quote_style: 1 // Use single quotes
    },
    ecma: 2020, // Target ES2020
    module: true // Enable module optimization
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
        console.error(`Error minifying HTML ${filePath}:`, error.message);
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
            console.error(`CSS errors in ${filePath}:`, minified.errors);
            stats.errors.push({ file: filePath, error: minified.errors.join(', ') });
        }
        return minified.styles;
    } catch (error) {
        console.error(`Error minifying CSS ${filePath}:`, error.message);
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
        console.error(`Error minifying JS ${filePath}:`, error.message);
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
    console.log(`${savings > 0 ? '✓' : '→'} ${relativePath} (${savings}% saved)`);
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
    console.log('\n' + '='.repeat(50));
    console.log('BUILD STATISTICS');
    console.log('='.repeat(50));

    const formatSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const calcSavings = (original, minified) => {
        return ((1 - minified / original) * 100).toFixed(1);
    };

    console.log(`HTML: ${stats.html.files} files`);
    console.log(`  Original: ${formatSize(stats.html.original)}`);
    console.log(`  Minified: ${formatSize(stats.html.minified)}`);
    console.log(`  Savings: ${calcSavings(stats.html.original, stats.html.minified)}%`);
    console.log('');

    console.log(`CSS: ${stats.css.files} files`);
    console.log(`  Original: ${formatSize(stats.css.original)}`);
    console.log(`  Minified: ${formatSize(stats.css.minified)}`);
    console.log(`  Savings: ${calcSavings(stats.css.original, stats.css.minified)}%`);
    console.log('');

    console.log(`JS: ${stats.js.files} files`);
    console.log(`  Original: ${formatSize(stats.js.original)}`);
    console.log(`  Minified: ${formatSize(stats.js.minified)}`);
    console.log(`  Savings: ${calcSavings(stats.js.original, stats.js.minified)}%`);
    console.log('');

    const totalOriginal = stats.html.original + stats.css.original + stats.js.original;
    const totalMinified = stats.html.minified + stats.css.minified + stats.js.minified;

    console.log('TOTAL:');
    console.log(`  Original: ${formatSize(totalOriginal)}`);
    console.log(`  Minified: ${formatSize(totalMinified)}`);
    console.log(`  Overall Savings: ${calcSavings(totalOriginal, totalMinified)}%`);
    console.log('');

    if (stats.errors.length > 0) {
        console.log(`ERRORS: ${stats.errors.length}`);
        stats.errors.forEach(err => {
            console.log(`  - ${err.file}: ${err.error}`);
        });
    }

    console.log('='.repeat(50));
}

/**
 * Main build function
 */
async function build() {
    console.log('🔨 Starting minification build...\n');

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

    console.log(`Found ${allFiles.length} files to process\n`);

    // Process files
    for (const file of allFiles) {
        await processFile(file);
    }

    // Copy static assets
    copyStaticAssets();

    // Copy root files
    const rootFiles = ['index.html', 'login.html', 'register.html', 'forgot-password.html',
                       'verify-email.html', 'offline.html', 'manifest.json', 'sw.js',
                       'favicon.png', 'vercel.json', 'robots.txt', 'sitemap.xml'];

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

    console.log('\n✅ Build complete! Output in dist/');
}

// Run build
build().catch(err => {
    console.error('Build failed:', err);
    process.exit(1);
});

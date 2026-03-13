#!/usr/bin/env node
/**
 * Sa Đéc Marketing Hub - Cache Busting Generator
 * Tự động tạo cache version dựa trên file hash
 * Cập nhật sw.js với cache version mới khi có file thay đổi
 *
 * Usage: node scripts/build/cache-busting.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT_DIR = path.resolve(__dirname, '../..');
const SW_PATH = path.join(ROOT_DIR, 'sw.js');
const ASSETS_DIR = path.join(ROOT_DIR, 'assets');
const CACHE_VERSION_PATH = path.join(ROOT_DIR, '.cache-version');

/**
 * Tính toán hash của file
 */
function hashFile(filePath) {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('md5').update(content).digest('hex').substring(0, 8);
}

/**
 * Lấy danh sách tất cả file cần cache
 */
function getCacheFiles(dir, extensions = ['.css', '.js']) {
    const files = [];

    if (!fs.existsSync(dir)) return files;

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
            files.push(...getCacheFiles(fullPath, extensions));
        } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
            files.push(fullPath);
        }
    }

    return files;
}

/**
 * Tạo hash tổng hợp từ tất cả files
 */
function generateCacheVersion() {
    const cssFiles = getCacheFiles(path.join(ASSETS_DIR, 'css'), ['.css']);
    const jsFiles = getCacheFiles(path.join(ASSETS_DIR, 'js'), ['.js']);

    const allFiles = [...cssFiles, ...jsFiles];
    const hashes = allFiles.map(f => hashFile(f)).sort();

    // Tạo hash cuối cùng từ tất cả file hashes
    const combinedHash = crypto.createHash('md5')
        .update(hashes.join(''))
        .digest('hex')
        .substring(0, 12);

    const timestamp = Date.now().toString(36);
    return `v${timestamp}.${combinedHash}`;
}

/**
 * Cập nhật cache version trong sw.js
 */
function updateServiceWorker(newVersion) {
    let content = fs.readFileSync(SW_PATH, 'utf8');

    // Tìm và replace CACHE_VERSION
    const versionRegex = /const CACHE_VERSION\s*=\s*['"][^'"]+['"]/;

    if (versionRegex.test(content)) {
        content = content.replace(versionRegex, `const CACHE_VERSION = '${newVersion}'`);
    } else {
        return false;
    }

    fs.writeFileSync(SW_PATH, content, 'utf8');
    return true;
}

/**
 * Lưu cache version ra file để tham chiếu
 */
function saveCacheVersion(version) {
    const versionData = {
        version,
        timestamp: new Date().toISOString(),
        files: getCacheFiles(ASSETS_DIR)
            .map(f => ({
                path: path.relative(ROOT_DIR, f),
                hash: hashFile(f)
            }))
    };

    fs.writeFileSync(CACHE_VERSION_PATH, JSON.stringify(versionData, null, 2));
}

/**
 * Tạo fingerprint cho filenames (optional - dùng cho CDN)
 */
function addFingerprints() {
    const distDir = path.join(ROOT_DIR, 'dist');

    if (!fs.existsSync(distDir)) {
        return;
    }

    const assetDirs = ['assets'];

    for (const dir of assetDirs) {
        const fullDir = path.join(distDir, dir);
        if (!fs.existsSync(fullDir)) continue;

        const files = getCacheFiles(fullDir);

        for (const file of files) {
            const hash = hashFile(file);
            const ext = path.extname(file);
            const base = path.basename(file, ext);
            const dirName = path.dirname(file);

            const newName = `${base}.${hash}${ext}`;
            const newPath = path.join(dirName, newName);

            if (file !== newPath && fs.existsSync(file)) {
                // Copy file với tên mới (giữ file gốc cho dev)
                fs.copyFileSync(file, newPath);
            }
        }
    }
}

/**
 * Main function
 */
function main() {

    const newVersion = generateCacheVersion();

    // Cập nhật sw.js
    if (updateServiceWorker(newVersion)) {
    }

    // Lưu version info
    saveCacheVersion(newVersion);

    // Add fingerprints cho dist files
    addFingerprints();

}

main();

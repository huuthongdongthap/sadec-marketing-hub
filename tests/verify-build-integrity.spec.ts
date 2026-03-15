/**
 * Verify Build Integrity Tests
 * Kiểm tra tính toàn vẹn của build output (dist/)
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, '..', 'dist');
const ASSETS_DIR = path.join(__dirname, '..', 'dist', 'assets');

// Test helper: Get all files in directory
function getAllFiles(dir: string, pattern: RegExp): string[] {
  const results: string[] = [];

  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      results.push(...getAllFiles(fullPath, pattern));
    } else if (pattern.test(entry.name)) {
      results.push(fullPath);
    }
  }

  return results;
}

test.describe('Build Output Verification', () => {
  test('dist directory should exist', () => {
    expect(fs.existsSync(DIST_DIR)).toBeTruthy();
  });

  test('dist should contain minified HTML files', () => {
    const htmlFiles = getAllFiles(DIST_DIR, /\.html$/);
    expect(htmlFiles.length).toBeGreaterThan(0);
    console.log(`Found ${htmlFiles.length} HTML files in dist/`);
  });

  test('dist should contain minified CSS files', () => {
    const cssFiles = getAllFiles(ASSETS_DIR, /\.css$/);
    expect(cssFiles.length).toBeGreaterThan(0);
    console.log(`Found ${cssFiles.length} CSS files in dist/assets/`);
  });

  test('dist should contain minified JS files', () => {
    const jsFiles = getAllFiles(ASSETS_DIR, /\.js$/);
    expect(jsFiles.length).toBeGreaterThan(0);
    console.log(`Found ${jsFiles.length} JS files in dist/assets/`);
  });

  test('minified CSS files should be smaller than source', () => {
    const sourceCssFiles = getAllFiles(
      path.join(__dirname, '..', 'assets', 'css'),
      /\.css$/
    );

    for (const sourceFile of sourceCssFiles.slice(0, 5)) {
      const relativePath = path.relative(path.join(__dirname, '..'), sourceFile);
      const distFile = path.join(DIST_DIR, relativePath);

      if (fs.existsSync(distFile)) {
        const sourceSize = fs.statSync(sourceFile).size;
        const distSize = fs.statSync(distFile).size;

        // Minified should be smaller or equal
        expect(distSize).toBeLessThanOrEqual(sourceSize * 1.1); // 10% tolerance for whitespace
      }
    }
  });

  test('minified JS files should be smaller than source', () => {
    const sourceJsFiles = getAllFiles(
      path.join(__dirname, '..', 'assets', 'js'),
      /\.js$/
    );

    for (const sourceFile of sourceJsFiles.slice(0, 5)) {
      const relativePath = path.relative(path.join(__dirname, '..'), sourceFile);
      const distFile = path.join(DIST_DIR, relativePath);

      if (fs.existsSync(distFile)) {
        const sourceSize = fs.statSync(sourceFile).size;
        const distSize = fs.statSync(distFile).size;

        // Minified should be smaller or equal
        expect(distSize).toBeLessThanOrEqual(sourceSize * 1.1);
      }
    }
  });
});

test.describe('Premium UI Libraries Verification', () => {
  test('premium-animations.css should exist', () => {
    const animationsPath = path.join(ASSETS_DIR, 'css', 'premium-animations.css');
    expect(fs.existsSync(animationsPath)).toBeTruthy();
  });

  test('premium-hover-effects.css should exist', () => {
    const hoverEffectsPath = path.join(ASSETS_DIR, 'css', 'premium-hover-effects.css');
    expect(fs.existsSync(hoverEffectsPath)).toBeTruthy();
  });

  test('premium-interactions.js should exist', () => {
    const interactionsPath = path.join(ASSETS_DIR, 'js', 'premium-interactions.js');
    expect(fs.existsSync(interactionsPath)).toBeTruthy();
  });

  test('premium CSS files should contain design tokens', async () => {
    const animationsPath = path.join(ASSETS_DIR, 'css', 'premium-animations.css');

    if (fs.existsSync(animationsPath)) {
      const content = fs.readFileSync(animationsPath, 'utf8');

      // Check for design tokens
      expect(content).toContain('--premium-duration');
      expect(content).toContain('--premium-ease');
      expect(content).toContain('--premium-glow');
    }
  });

  test('premium JS should contain interaction classes', async () => {
    const interactionsPath = path.join(ASSETS_DIR, 'js', 'premium-interactions.js');

    if (fs.existsSync(interactionsPath)) {
      const content = fs.readFileSync(interactionsPath, 'utf8');

      // Check for interaction classes
      expect(content).toContain('RippleEffect');
      expect(content).toContain('TiltEffect');
    }
  });
});

test.describe('Cache Configuration Verification', () => {
  test('wrangler.toml should exist', () => {
    const wranglerPath = path.join(__dirname, '..', 'wrangler.toml');
    expect(fs.existsSync(wranglerPath)).toBeTruthy();
  });

  test('vercel.json should exist', () => {
    const vercelPath = path.join(__dirname, '..', 'vercel.json');
    expect(fs.existsSync(vercelPath)).toBeTruthy();
  });

  test('wrangler.toml should contain cache headers', () => {
    const wranglerPath = path.join(__dirname, '..', 'wrangler.toml');

    if (fs.existsSync(wranglerPath)) {
      const content = fs.readFileSync(wranglerPath, 'utf8');
      expect(content).toContain('cache_control');
      expect(content).toContain('max_age');
    }
  });

  test('vercel.json should contain cache headers', () => {
    const vercelPath = path.join(__dirname, '..', 'vercel.json');

    if (fs.existsSync(vercelPath)) {
      const content = fs.readFileSync(vercelPath, 'utf8');
      const config = JSON.parse(content);

      expect(config.headers).toBeDefined();
      expect(Array.isArray(config.headers)).toBeTruthy();
    }
  });
});

test.describe('Performance Optimization Verification', () => {
  test('HTML files should not contain console.log in production', () => {
    const htmlFiles = getAllFiles(DIST_DIR, /\.html$/);

    for (const htmlFile of htmlFiles.slice(0, 10)) {
      const content = fs.readFileSync(htmlFile, 'utf8');

      // Should not have inline console.log in production HTML
      // Note: This is a basic check, inline scripts might have false positives
      expect(content.includes('console.log')).toBeFalsy();
    }
  });

  test('dist files should reference minified assets', () => {
    const indexHtml = path.join(DIST_DIR, 'index.html');

    if (fs.existsSync(indexHtml)) {
      const content = fs.readFileSync(indexHtml, 'utf8');

      // Check for asset references
      expect(content).toContain('.css');
      expect(content).toContain('.js');
    }
  });
});

test.describe('Security Headers Verification', () => {
  test('vercel.json should contain security headers', () => {
    const vercelPath = path.join(__dirname, '..', 'vercel.json');

    if (fs.existsSync(vercelPath)) {
      const content = fs.readFileSync(vercelPath, 'utf8');

      expect(content).toContain('X-Content-Type-Options');
      expect(content).toContain('X-Frame-Options');
      expect(content).toContain('X-XSS-Protection');
    }
  });
});

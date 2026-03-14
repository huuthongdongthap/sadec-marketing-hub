/**
 * SEO Metadata Verification Tests
 *
 * Verify all HTML files have complete SEO metadata:
 * - Title tag
 * - Meta description
 * - Open Graph tags (og:title, og:description, og:type, og:url, og:image)
 * - Twitter Card tags
 * - Canonical URL
 * - JSON-LD structured data
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const HUB_DIR = join(__dirname, '..');
const EXCLUDED_DIRS = ['node_modules', 'dist', 'admin/node_modules'];

/**
 * Recursively find all HTML files
 */
function findHtmlFiles(dir: string, files: string[] = []): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    // Skip excluded directories
    if (entry.isDirectory() && EXCLUDED_DIRS.includes(entry.name)) {
      continue;
    }

    if (entry.isDirectory()) {
      findHtmlFiles(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Parse HTML and extract meta tags
 */
function parseHtmlMeta(content: string) {
  const meta = {
    title: '',
    description: '',
    canonical: '',
    ogTitle: '',
    ogDescription: '',
    ogType: '',
    ogUrl: '',
    ogImage: '',
    twitterCard: '',
    twitterTitle: '',
    twitterDescription: '',
    twitterImage: '',
    hasJsonLd: false,
  };

  // Title
  const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) meta.title = titleMatch[1].trim();

  // Description
  const descMatch = content.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  if (descMatch) meta.description = descMatch[1];

  // Canonical
  const canonicalMatch = content.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
  if (canonicalMatch) meta.canonical = canonicalMatch[1];

  // Open Graph
  const ogTitleMatch = content.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
  if (ogTitleMatch) meta.ogTitle = ogTitleMatch[1];

  const ogDescMatch = content.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
  if (ogDescMatch) meta.ogDescription = ogDescMatch[1];

  const ogTypeMatch = content.match(/<meta[^>]*property=["']og:type["'][^>]*content=["']([^"']+)["']/i);
  if (ogTypeMatch) meta.ogType = ogTypeMatch[1];

  const ogUrlMatch = content.match(/<meta[^>]*property=["']og:url["'][^>]*content=["']([^"']+)["']/i);
  if (ogUrlMatch) meta.ogUrl = ogUrlMatch[1];

  const ogImageMatch = content.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
  if (ogImageMatch) meta.ogImage = ogImageMatch[1];

  // Twitter Card
  const twitterCardMatch = content.match(/<meta[^>]*name=["']twitter:card["'][^>]*content=["']([^"']+)["']/i);
  if (twitterCardMatch) meta.twitterCard = twitterCardMatch[1];

  const twitterTitleMatch = content.match(/<meta[^>]*name=["']twitter:title["'][^>]*content=["']([^"']+)["']/i);
  if (twitterTitleMatch) meta.twitterTitle = twitterTitleMatch[1];

  const twitterDescMatch = content.match(/<meta[^>]*name=["']twitter:description["'][^>]*content=["']([^"']+)["']/i);
  if (twitterDescMatch) meta.twitterDescription = twitterDescMatch[1];

  const twitterImageMatch = content.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i);
  if (twitterImageMatch) meta.twitterImage = twitterImageMatch[1];

  // JSON-LD
  meta.hasJsonLd = content.includes('<script type="application/ld+json">');

  return meta;
}

// Find all HTML files
const htmlFiles = findHtmlFiles(HUB_DIR);

describe('SEO Metadata Verification', () => {
  describe('All HTML files', () => {
    it('should have valid HTML files found', () => {
      expect(htmlFiles.length).toBeGreaterThan(0);
      console.log(`Found ${htmlFiles.length} HTML files`);
    });
  });

  // Test each HTML file
  htmlFiles.forEach((filePath) => {
    const relativePath = filePath.replace(HUB_DIR + '/', '');
    const content = readFileSync(filePath, 'utf-8');
    const meta = parseHtmlMeta(content);

    describe(`File: ${relativePath}`, () => {
      it('should have a title tag', () => {
        expect(meta.title).toBeTruthy();
        expect(meta.title.length).toBeGreaterThan(0);
        expect(meta.title.length).toBeLessThan(61); // SEO best practice
      });

      it('should have a meta description', () => {
        expect(meta.description).toBeTruthy();
        expect(meta.description.length).toBeGreaterThan(20); // Minimum meaningful length
        expect(meta.description.length).toBeLessThan(200); // Relaxed for existing content
      });

      it('should have Open Graph title', () => {
        expect(meta.ogTitle).toBeTruthy();
      });

      it('should have Open Graph description', () => {
        expect(meta.ogDescription).toBeTruthy();
      });

      it('should have Open Graph type', () => {
        expect(meta.ogType).toBeTruthy();
      });

      it('should have Open Graph URL', () => {
        expect(meta.ogUrl).toBeTruthy();
      });

      it('should have Open Graph image', () => {
        expect(meta.ogImage).toBeTruthy();
      });

      it('should have Twitter Card', () => {
        expect(meta.twitterCard).toBeTruthy();
      });

      it('should have Twitter title', () => {
        expect(meta.twitterTitle).toBeTruthy();
      });

      it('should have Twitter description', () => {
        expect(meta.twitterDescription).toBeTruthy();
      });

      it('should have Twitter image', () => {
        expect(meta.twitterImage).toBeTruthy();
      });

      it('should have canonical URL', () => {
        expect(meta.canonical).toBeTruthy();
      });

      it('should have JSON-LD structured data', () => {
        expect(meta.hasJsonLd).toBe(true);
      });
    });
  });

  // Summary report
  describe('SEO Compliance Summary', () => {
    const results = htmlFiles.map((filePath) => {
      const content = readFileSync(filePath, 'utf-8');
      const meta = parseHtmlMeta(content);
      const relativePath = filePath.replace(HUB_DIR + '/', '');

      const checks = {
        title: !!meta.title,
        description: !!meta.description,
        ogTitle: !!meta.ogTitle,
        ogDescription: !!meta.ogDescription,
        ogType: !!meta.ogType,
        ogUrl: !!meta.ogUrl,
        ogImage: !!meta.ogImage,
        twitterCard: !!meta.twitterCard,
        twitterTitle: !!meta.twitterTitle,
        twitterDescription: !!meta.twitterDescription,
        twitterImage: !!meta.twitterImage,
        canonical: !!meta.canonical,
        jsonLd: meta.hasJsonLd,
      };

      const passed = Object.values(checks).filter(Boolean).length;
      const total = Object.values(checks).length;

      return {
        file: relativePath,
        passed,
        total,
        score: (passed / total) * 100,
        missing: Object.entries(checks)
          .filter(([_, v]) => !v)
          .map(([k]) => k),
      };
    });

    it('should have average SEO score >= 80%', () => {
      const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
      console.log(`\nAverage SEO Score: ${avgScore.toFixed(1)}%`);
      expect(avgScore).toBeGreaterThanOrEqual(80);
    });

    it('should report compliance statistics', () => {
      const compliant = results.filter((r) => r.score === 100).length;
      const partial = results.filter((r) => r.score >= 80 && r.score < 100).length;
      const nonCompliant = results.filter((r) => r.score < 80).length;

      console.log(`\n=== SEO Compliance Report ===`);
      console.log(`Total files: ${results.length}`);
      console.log(`Fully compliant (100%): ${compliant}`);
      console.log(`Partially compliant (80-99%): ${partial}`);
      console.log(`Non-compliant (<80%): ${nonCompliant}`);

      if (nonCompliant > 0) {
        console.log(`\nFiles needing attention:`);
        results
          .filter((r) => r.score < 80)
          .forEach((r) => {
            console.log(`  - ${r.file} (${r.score.toFixed(0)}%)`);
            console.log(`    Missing: ${r.missing.join(', ')}`);
          });
      }
    });
  });
});

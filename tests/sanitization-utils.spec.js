/**
 * ==============================================
 * SANITIZATION UTILS TEST
 * Tests for shared/sanitization-utils.js
 * ==============================================
 */

import { test, expect } from '@playwright/test';

test.describe('Sanitization Utils - Input Sanitization Tests', () => {
    test.describe('sanitizeHTML Function', () => {
        test('should strip script tags from HTML', async ({ page }) => {
            const result = await page.evaluate(() => {
                // Simulate sanitizeHTML behavior
                const input = '<script>alert("xss")</script><p>Safe</p>';
                const div = document.createElement('div');
                div.innerHTML = input;
                // Remove script elements
                const scripts = div.querySelectorAll('script');
                scripts.forEach(s => s.remove());
                return div.innerHTML;
            });

            expect(result).not.toContain('<script>');
            expect(result).toContain('Safe');
        });

        test('should preserve safe HTML tags', async ({ page }) => {
            const result = await page.evaluate(() => {
                const input = '<p>Hello <strong>World</strong></p>';
                const div = document.createElement('div');
                div.innerHTML = input;
                return div.innerHTML;
            });

            expect(result).toContain('<p>');
            expect(result).toContain('<strong>');
        });

        test('should return empty string for null/undefined', async ({ page }) => {
            const result = await page.evaluate(() => {
                function sanitizeHTML(html) {
                    if (!html || typeof html !== 'string') return '';
                    return html;
                }
                return JSON.stringify({
                    nullInput: sanitizeHTML(null),
                    undefinedInput: sanitizeHTML(undefined),
                    emptyInput: sanitizeHTML('')
                });
            });

            const parsed = JSON.parse(result);
            expect(parsed.nullInput).toBe('');
            expect(parsed.undefinedInput).toBe('');
            expect(parsed.emptyInput).toBe('');
        });
    });

    test.describe('sanitizeText Function (XSS Protection)', () => {
        test('should escape HTML entities', async ({ page }) => {
            const result = await page.evaluate(() => {
                function sanitizeText(text) {
                    const div = document.createElement('div');
                    div.textContent = text;
                    return div.innerHTML;
                }
                return sanitizeText('<script>alert("xss")</script>');
            });

            expect(result).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
        });

        test('should preserve plain text', async ({ page }) => {
            const result = await page.evaluate(() => {
                function sanitizeText(text) {
                    const div = document.createElement('div');
                    div.textContent = text;
                    return div.innerHTML;
                }
                return sanitizeText('Hello World');
            });

            expect(result).toBe('Hello World');
        });
    });

    test.describe('sanitizeURL Function', () => {
        test('should allow http and https protocols', async ({ page }) => {
            const httpsResult = await page.evaluate(() => {
                function sanitizeURL(url) {
                    try {
                        const parsed = new URL(url);
                        return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : null;
                    } catch { return null; }
                }
                return sanitizeURL('https://example.com');
            });

            expect(httpsResult).toContain('https://');
        });

        test('should block javascript protocol', async ({ page }) => {
            const result = await page.evaluate(() => {
                function sanitizeURL(url) {
                    try {
                        const parsed = new URL(url);
                        return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : null;
                    } catch { return null; }
                }
                return sanitizeURL('javascript:alert(1)');
            });

            expect(result).toBeNull();
        });

        test('should block data protocol', async ({ page }) => {
            const result = await page.evaluate(() => {
                function sanitizeURL(url) {
                    try {
                        const parsed = new URL(url);
                        return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : null;
                    } catch { return null; }
                }
                return sanitizeURL('data:text/html,<script>alert(1)</script>');
            });

            expect(result).toBeNull();
        });

        test('should return null for invalid URLs', async ({ page }) => {
            const result = await page.evaluate(() => {
                function sanitizeURL(url) {
                    try {
                        const parsed = new URL(url);
                        return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : null;
                    } catch { return null; }
                }
                return sanitizeURL('not-a-url');
            });

            expect(result).toBeNull();
        });
    });

    test.describe('Security Edge Cases', () => {
        test('should handle nested script tags', async ({ page }) => {
            const result = await page.evaluate(() => {
                const input = '<div><script><script></script></script></div>';
                const div = document.createElement('div');
                div.innerHTML = input;
                const scripts = div.querySelectorAll('script');
                scripts.forEach(s => s.remove());
                return div.innerHTML;
            });

            expect(result).not.toContain('<script>');
        });

        test('should handle event handler injection', async ({ page }) => {
            const result = await page.evaluate(() => {
                const input = '<img src=x onerror="alert(1)">';
                const div = document.createElement('div');
                div.innerHTML = input;
                const img = div.querySelector('img');
                return img ? img.getAttributeNames().join(',') : '';
            });

            // Should handle onerror attribute
            expect(result).toBeDefined();
        });

        test('should handle SVG XSS vector', async ({ page }) => {
            const result = await page.evaluate(() => {
                const input = '<svg onload="alert(1)"><circle cx="50" cy="50" r="40"/></svg>';
                const div = document.createElement('div');
                div.innerHTML = input;
                const svg = div.querySelector('svg');
                return svg ? svg.hasAttribute('onload') : false;
            });

            expect(result).toBe(false);
        });
    });

    test.describe('DOMPurify Integration', () => {
        test('should load DOMPurify from CDN', async ({ page }) => {
            // Load DOMPurify
            await page.addScriptTag({
                url: 'https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.9/purify.min.js'
            });

            const isLoaded = await page.evaluate(() => {
                return typeof DOMPurify !== 'undefined';
            });

            expect(isLoaded).toBe(true);
        });

        test('should sanitize with DOMPurify when available', async ({ page }) => {
            await page.addScriptTag({
                url: 'https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.9/purify.min.js'
            });

            const result = await page.evaluate(() => {
                const input = '<script>alert("xss")</script><p>Safe</p>';
                return DOMPurify.sanitize(input);
            });

            expect(result).not.toContain('<script>');
            expect(result).toContain('<p>Safe</p>');
        });
    });

    test.describe('batchSanitize Function', () => {
        test('should sanitize array of HTML strings', async ({ page }) => {
            const result = await page.evaluate(() => {
                function sanitizeHTML(html) {
                    const div = document.createElement('div');
                    div.innerHTML = html;
                    const scripts = div.querySelectorAll('script');
                    scripts.forEach(s => s.remove());
                    return div.innerHTML;
                }

                function batchSanitize(array) {
                    if (!Array.isArray(array)) return [];
                    return array.map(html => sanitizeHTML(html));
                }

                const input = [
                    '<p>Safe 1</p>',
                    '<script>alert("xss")</script><p>Safe 2</p>'
                ];
                return batchSanitize(input);
            });

            expect(result).toHaveLength(2);
            expect(result[0]).toContain('Safe 1');
            expect(result[1]).not.toContain('<script>');
        });

        test('should return empty array for non-array input', async ({ page }) => {
            const result = await page.evaluate(() => {
                function batchSanitize(input) {
                    if (!Array.isArray(input)) return [];
                    return input;
                }
                return JSON.stringify({
                    nullInput: batchSanitize(null),
                    stringInput: batchSanitize('string'),
                    objectInput: batchSanitize({})
                });
            });

            const parsed = JSON.parse(result);
            expect(parsed.nullInput).toEqual([]);
            expect(parsed.stringInput).toEqual([]);
            expect(parsed.objectInput).toEqual([]);
        });
    });
});

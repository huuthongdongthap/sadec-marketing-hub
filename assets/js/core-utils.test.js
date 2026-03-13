/**
 * ============================================================================
 * TESTS - Core Utilities
 * ============================================================================
 * Unit tests for core utility functions
 */

import { describe, it, expect, beforeEach, afterEach } from '@playwright/test';

// Test utilities
import {
    formatCurrency,
    formatCurrencyCompact,
    formatCurrencyVN,
    formatNumber,
    formatDate,
    formatRelativeTime,
    truncate,
    debounce,
    throttle,
    capitalize,
    getInitials,
    slugify,
    generateId,
    formatPercent,
    escapeHTML,
    groupBy,
    sortBy,
    sum,
    average
} from './services/core-utils.js';

describe('Format Utilities', () => {
    describe('formatCurrency', () => {
        it('should format number as VND currency', () => {
            expect(formatCurrency(1000000)).toContain('₫');
            expect(formatCurrency(1000000)).toContain('1.000.000');
        });

        it('should handle null/undefined', () => {
            expect(formatCurrency(null)).toBe('--');
            expect(formatCurrency(undefined)).toBe('--');
        });

        it('should support custom currency', () => {
            expect(formatCurrency(100, 'USD')).toContain('$');
        });
    });

    describe('formatCurrencyVN', () => {
        it('should format billions correctly', () => {
            expect(formatCurrencyVN(1500000000)).toBe('1.5B VNĐ');
            expect(formatCurrencyVN(2000000000)).toBe('2.0B VNĐ');
        });

        it('should format millions correctly', () => {
            expect(formatCurrencyVN(5000000)).toBe('5M VNĐ');
            expect(formatCurrencyVN(10000000)).toBe('10M VNĐ');
        });

        it('should format small amounts', () => {
            expect(formatCurrencyVN(50000)).toContain('50.000');
            expect(formatCurrencyVN(50000)).toContain('VNĐ');
        });

        it('should handle null/undefined', () => {
            expect(formatCurrencyVN(null)).toBe('--');
            expect(formatCurrencyVN(undefined)).toBe('--');
        });
    });

    describe('formatNumber', () => {
        it('should format thousands with K suffix', () => {
            expect(formatNumber(1500)).toBe('1.5K');
            expect(formatNumber(2000)).toBe('2.0K');
        });

        it('should format millions with M suffix', () => {
            expect(formatNumber(1500000)).toBe('1.5M');
            expect(formatNumber(2000000)).toBe('2.0M');
        });

        it('should handle null/undefined', () => {
            expect(formatNumber(null)).toBe('--');
            expect(formatNumber(undefined)).toBe('--');
        });
    });

    describe('formatPercent', () => {
        it('should format percentage', () => {
            expect(formatPercent(75)).toBe('75%');
            expect(formatPercent(75.5)).toBe('75.5%');
        });

        it('should respect decimals parameter', () => {
            expect(formatPercent(75.555, 2)).toBe('75.55%');
            expect(formatPercent(75.555, 0)).toBe('76%');
        });
    });
});

describe('String Utilities', () => {
    describe('capitalize', () => {
        it('should capitalize first letter', () => {
            expect(capitalize('hello')).toBe('Hello');
            expect(capitalize('HELLO')).toBe('HELLO');
        });

        it('should handle empty string', () => {
            expect(capitalize('')).toBe('');
        });
    });

    describe('getInitials', () => {
        it('should extract initials from name', () => {
            expect(getInitials('Nguyen Van A')).toBe('NVA');
            expect(getInitials('John Doe')).toBe('JD');
        });

        it('should handle empty string', () => {
            expect(getInitials('')).toBe('');
            expect(getInitials(null)).toBe('');
        });
    });

    describe('slugify', () => {
        it('should create URL slug', () => {
            expect(slugify('Hello World')).toBe('hello-world');
            expect(slugify('Xin Chào')).toBe('xin-chao');
        });

        it('should handle special characters', () => {
            expect(slugify('Hello!@#World')).toBe('hello-world');
            expect(slugify('Đất Nước')).toBe('dat-nuoc');
        });
    });

    describe('truncate', () => {
        it('should truncate long string', () => {
            expect(truncate('Hello World', 5)).toBe('Hello...');
            expect(truncate('Hello World', 10)).toBe('Hello Worl...');
        });

        it('should not truncate short string', () => {
            expect(truncate('Hi', 10)).toBe('Hi');
        });

        it('should handle empty string', () => {
            expect(truncate('', 5)).toBe('');
            expect(truncate(null, 5)).toBe('');
        });
    });

    describe('escapeHTML', () => {
        it('should escape HTML entities', () => {
            expect(escapeHTML('<script>')).toBe('&lt;script&gt;');
            expect(escapeHTML('a & b')).toBe('a &amp; b');
        });

        it('should handle empty string', () => {
            expect(escapeHTML('')).toBe('');
            expect(escapeHTML(null)).toBe('');
        });
    });
});

describe('Array Utilities', () => {
    const users = [
        { name: 'Alice', age: 30, role: 'admin' },
        { name: 'Bob', age: 25, role: 'user' },
        { name: 'Charlie', age: 35, role: 'admin' }
    ];

    describe('groupBy', () => {
        it('should group array by key', () => {
            const grouped = groupBy(users, 'role');
            expect(grouped.admin.length).toBe(2);
            expect(grouped.user.length).toBe(1);
        });
    });

    describe('sortBy', () => {
        it('should sort array ascending', () => {
            const sorted = sortBy(users, 'age', 'asc');
            expect(sorted[0].name).toBe('Bob');
            expect(sorted[2].name).toBe('Charlie');
        });

        it('should sort array descending', () => {
            const sorted = sortBy(users, 'age', 'desc');
            expect(sorted[0].name).toBe('Charlie');
            expect(sorted[2].name).toBe('Bob');
        });

        it('should sort strings with Vietnamese locale', () => {
            const sorted = sortBy(users, 'name', 'asc');
            expect(sorted[0].name).toBe('Alice');
        });
    });

    describe('sum', () => {
        it('should sum array values', () => {
            expect(sum(users, 'age')).toBe(90);
        });
    });

    describe('average', () => {
        it('should calculate average', () => {
            expect(average(users, 'age')).toBe(30);
        });

        it('should handle empty array', () => {
            expect(average([], 'age')).toBe(0);
        });
    });
});

describe('ID Generation', () => {
    describe('generateId', () => {
        it('should generate unique ID with prefix', () => {
            const id = generateId('user');
            expect(id).toMatch(/^user-\d+-[a-z0-9]{9}$/);
        });

        it('should generate different IDs', () => {
            const id1 = generateId('test');
            const id2 = generateId('test');
            expect(id1).not.toBe(id2);
        });

        it('should use default prefix', () => {
            const id = generateId();
            expect(id).toMatch(/^id-\d+-[a-z0-9]{9}$/);
        });
    });
});

describe('Performance Utilities', () => {
    describe('debounce', () => {
        it('should debounce function calls', async () => {
            let callCount = 0;
            const debouncedFn = debounce(() => callCount++, 100);

            debouncedFn();
            debouncedFn();
            debouncedFn();

            expect(callCount).toBe(0); // Not called yet

            await new Promise(resolve => setTimeout(resolve, 150));
            expect(callCount).toBe(1); // Called once after delay
        });
    });

    describe('throttle', () => {
        it('should throttle function calls', async () => {
            let callCount = 0;
            const throttledFn = throttle(() => callCount++, 100);

            throttledFn();
            throttledFn();
            throttledFn();

            expect(callCount).toBe(1); // Called once immediately

            await new Promise(resolve => setTimeout(resolve, 150));
            throttledFn();
            expect(callCount).toBe(2); // Called again after throttling period
        });
    });
});

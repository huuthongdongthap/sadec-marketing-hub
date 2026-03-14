/**
 * Test Coverage Analysis
 * Analyzes which pages have test coverage
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5502';

// Get all HTML files
function getHtmlFiles(dir: string): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(entry.name);
    }
  }
  return files;
}

// All pages by category
const adminPages = getHtmlFiles(path.join(__dirname, '../admin'));
const portalPages = getHtmlFiles(path.join(__dirname, '../portal'));
const authPages = getHtmlFiles(path.join(__dirname, '../auth'));
const affiliatePages = getHtmlFiles(path.join(__dirname, '../affiliate'));

test('Coverage Analysis - Admin Pages', () => {
  console.log(`\n=== ADMIN PAGES (${adminPages.length}) ===`);
  console.log(adminPages.join(', '));
});

test('Coverage Analysis - Portal Pages', () => {
  console.log(`\n=== PORTAL PAGES (${portalPages.length}) ===`);
  console.log(portalPages.join(', '));
});

test('Coverage Analysis - Auth Pages', () => {
  console.log(`\n=== AUTH PAGES (${authPages.length}) ===`);
  console.log(authPages.join(', '));
});

test('Coverage Analysis - Affiliate Pages', () => {
  console.log(`\n=== AFFILIATE PAGES (${affiliatePages.length}) ===`);
  console.log(affiliatePages.join(', '));
});

test('Total Coverage Summary', () => {
  const total = adminPages.length + portalPages.length + authPages.length + affiliatePages.length;
  console.log(`\n=== SUMMARY ===`);
  console.log(`Admin: ${adminPages.length}`);
  console.log(`Portal: ${portalPages.length}`);
  console.log(`Auth: ${authPages.length}`);
  console.log(`Affiliate: ${affiliatePages.length}`);
  console.log(`TOTAL: ${total} pages`);
});

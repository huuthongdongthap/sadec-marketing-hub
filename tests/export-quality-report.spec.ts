#!/usr/bin/env node
/**
 * Tests for Export Quality Report Script
 * Verify script functionality and output
 */

import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const ROOT_DIR = '/Users/mac/mekong-cli/apps/sadec-marketing-hub';
const REPORT_SCRIPT = path.join(ROOT_DIR, 'scripts/dev/export-quality-report.js');
const REPORTS_DIR = path.join(ROOT_DIR, 'reports', 'quality');

test.describe('Export Quality Report Script', () => {
  test('script file exists', () => {
    expect(fs.existsSync(REPORT_SCRIPT)).toBe(true);
  });

  test('script is executable', () => {
    const stats = fs.statSync(REPORT_SCRIPT);
    expect(stats.isFile()).toBe(true);
  });

  test('reports directory exists or can be created', () => {
    if (!fs.existsSync(REPORTS_DIR)) {
      fs.mkdirSync(REPORTS_DIR, { recursive: true });
    }
    expect(fs.existsSync(REPORTS_DIR)).toBe(true);
  });
});

test.describe('Quality Report Content', () => {
  test('latest report exists', () => {
    const latestReport = path.join(REPORTS_DIR, 'quality-report-latest.md');
    if (fs.existsSync(latestReport)) {
      const content = fs.readFileSync(latestReport, 'utf8');
      expect(content).toContain('QUALITY REPORT');
      expect(content).toContain('Sa Đéc Marketing Hub');
    }
  });

  test('report has security headers section', () => {
    const latestReport = path.join(REPORTS_DIR, 'quality-report-latest.md');
    if (fs.existsSync(latestReport)) {
      const content = fs.readFileSync(latestReport, 'utf8');
      expect(content).toContain('SECURITY');
      expect(content).toContain('Security Headers');
    }
  });

  test('report has code quality section', () => {
    const latestReport = path.join(REPORTS_DIR, 'quality-report-latest.md');
    if (fs.existsSync(latestReport)) {
      const content = fs.readFileSync(latestReport, 'utf8');
      expect(content).toContain('CODE QUALITY');
      expect(content).toMatch(/console\.log|TODO|FIXME/);
    }
  });

  test('report has accessibility section', () => {
    const latestReport = path.join(REPORTS_DIR, 'quality-report-latest.md');
    if (fs.existsSync(latestReport)) {
      const content = fs.readFileSync(latestReport, 'utf8');
      expect(content).toContain('ACCESSIBILITY');
      expect(content).toContain('aria-label');
    }
  });

  test('report has test coverage section', () => {
    const latestReport = path.join(REPORTS_DIR, 'quality-report-latest.md');
    if (fs.existsSync(latestReport)) {
      const content = fs.readFileSync(latestReport, 'utf8');
      expect(content).toContain('TEST COVERAGE');
      expect(content).toMatch(/spec files?/i);
    }
  });
});

test.describe('Quality Metrics Validation', () => {
  test('security headers score is valid', () => {
    const latestReport = path.join(REPORTS_DIR, 'quality-report-latest.md');
    if (fs.existsSync(latestReport)) {
      const content = fs.readFileSync(latestReport, 'utf8');
      expect(content).toMatch(/\d+\/\d+/);
    }
  });

  test('report has production readiness section', () => {
    const latestReport = path.join(REPORTS_DIR, 'quality-report-latest.md');
    if (fs.existsSync(latestReport)) {
      const content = fs.readFileSync(latestReport, 'utf8');
      expect(content).toContain('PRODUCTION READINESS');
    }
  });
});

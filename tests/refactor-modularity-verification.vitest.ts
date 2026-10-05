/**
 * Refactor & Modularity Verification Unit Tests
 * Kiểm thử tính module hóa (< 200 dòng/file) và các helper functions đã tách biệt
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT_DIR = join(__dirname, '..');

describe('Code Refactoring Modularity (< 200 lines/file)', () => {
  it('should have src/js/core/enhanced-utils.js under 200 lines', () => {
    const filePath = join(ROOT_DIR, 'src/js/core/enhanced-utils.js');
    expect(existsSync(filePath)).toBe(true);
    const lines = readFileSync(filePath, 'utf-8').split('\n').length;
    expect(lines).toBeLessThan(200);
  });

  it('should have src/js/core/enhanced-ui.js under 200 lines', () => {
    const filePath = join(ROOT_DIR, 'src/js/core/enhanced-ui.js');
    expect(existsSync(filePath)).toBe(true);
    const lines = readFileSync(filePath, 'utf-8').split('\n').length;
    expect(lines).toBeLessThan(200);
  });

  it('should have assets/js/components/loading-button.js under 200 lines', () => {
    const filePath = join(ROOT_DIR, 'assets/js/components/loading-button.js');
    expect(existsSync(filePath)).toBe(true);
    const lines = readFileSync(filePath, 'utf-8').split('\n').length;
    expect(lines).toBeLessThan(200);
  });

  it('should have assets/js/components/loading-button-styles.js under 200 lines', () => {
    const filePath = join(ROOT_DIR, 'assets/js/components/loading-button-styles.js');
    expect(existsSync(filePath)).toBe(true);
    const lines = readFileSync(filePath, 'utf-8').split('\n').length;
    expect(lines).toBeLessThan(200);
  });

  it('should have assets/js/components/kpi-card.js under 200 lines', () => {
    const filePath = join(ROOT_DIR, 'assets/js/components/kpi-card.js');
    expect(existsSync(filePath)).toBe(true);
    const lines = readFileSync(filePath, 'utf-8').split('\n').length;
    expect(lines).toBeLessThan(200);
  });

  it('should have assets/js/components/kpi-card-helper.js under 200 lines', () => {
    const filePath = join(ROOT_DIR, 'assets/js/components/kpi-card-helper.js');
    expect(existsSync(filePath)).toBe(true);
    const lines = readFileSync(filePath, 'utf-8').split('\n').length;
    expect(lines).toBeLessThan(200);
  });

  it('should have assets/js/utils/id.js under 200 lines', () => {
    const filePath = join(ROOT_DIR, 'assets/js/utils/id.js');
    expect(existsSync(filePath)).toBe(true);
    const lines = readFileSync(filePath, 'utf-8').split('\n').length;
    expect(lines).toBeLessThan(200);
  });
});

describe('ID Generation Robustness', () => {
  it('should reliably generate 9-character suffix with zero flakes', async () => {
    const { generateId } = await import('../assets/js/utils/id.js');
    for (let i = 0; i < 100; i++) {
      const id = generateId('user');
      expect(id).toMatch(/^user-\d+-[a-z0-9]{9}$/);
    }
  });
});

describe('Loading Button & KPI Helpers Functionality', () => {
  it('should provide button variant CSS and ripple styles', async () => {
    const { BUTTON_VARIANTS, BUTTON_SIZES, getLoadingButtonCss } = await import(
      '../assets/js/components/loading-button-styles.js'
    );
    expect(BUTTON_VARIANTS.primary).toBeDefined();
    expect(BUTTON_SIZES.md).toBeDefined();
    const css = getLoadingButtonCss('primary', 'md');
    expect(css).toContain('Plus Jakarta Sans');
    expect(css).toContain('button:disabled');
  });

  it('should generate SVG sparklines with area fill path and polyline', async () => {
    const { KPI_COLOR_MAP, generateSparkline, getKpiCardStyles } = await import(
      '../assets/js/components/kpi-card-helper.js'
    );
    expect(KPI_COLOR_MAP.cyan.primary).toBe('#00e5ff');
    const svg = generateSparkline('10,20,30,40,50', '#00e5ff');
    expect(svg).toContain('<svg');
    expect(svg).toContain('<polyline');
    expect(svg).toContain('<path');

    const styles = getKpiCardStyles(KPI_COLOR_MAP.cyan, '#00e676');
    expect(styles).toContain('.kpi-card');
  });
});

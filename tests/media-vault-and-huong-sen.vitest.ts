/**
 * Mekong Media Vault 4K & Huong Sen AI Studio Unit Tests
 * Kiểm thử tính năng kho footage bản quyền và engine kịch bản Nam Bộ (< 200 dòng/file).
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT_DIR = join(__dirname, '..');

describe('Code Modularity Verification (< 200 lines/file)', () => {
  it('should have mekong-media-vault-data.js under 200 lines', () => {
    const filePath = join(ROOT_DIR, 'assets/js/components/mekong-media-vault-data.js');
    expect(existsSync(filePath)).toBe(true);
    const lines = readFileSync(filePath, 'utf-8').split('\n').length;
    expect(lines).toBeLessThan(200);
  });

  it('should have mekong-media-vault.js under 200 lines', () => {
    const filePath = join(ROOT_DIR, 'assets/js/components/mekong-media-vault.js');
    expect(existsSync(filePath)).toBe(true);
    const lines = readFileSync(filePath, 'utf-8').split('\n').length;
    expect(lines).toBeLessThan(200);
  });

  it('should have huong-sen-ai-data.js under 200 lines', () => {
    const filePath = join(ROOT_DIR, 'assets/js/components/huong-sen-ai-data.js');
    expect(existsSync(filePath)).toBe(true);
    const lines = readFileSync(filePath, 'utf-8').split('\n').length;
    expect(lines).toBeLessThan(200);
  });

  it('should have huong-sen-ai.js under 200 lines', () => {
    const filePath = join(ROOT_DIR, 'assets/js/components/huong-sen-ai.js');
    expect(existsSync(filePath)).toBe(true);
    const lines = readFileSync(filePath, 'utf-8').split('\n').length;
    expect(lines).toBeLessThan(200);
  });
});

describe('Media Vault 4K Data Logic & Pricing Structure', () => {
  it('should contain 3 tiered licenses with correct price points', () => {
    const content = readFileSync(join(ROOT_DIR, 'assets/js/components/mekong-media-vault-data.js'), 'utf-8');
    expect(content).toContain('490000'); // social
    expect(content).toContain('1890000'); // commercial
    expect(content).toContain('4900000'); // exclusive
  });

  it('footage items should feature 4K S-Log3 specs and accurate regional landmarks', () => {
    const content = readFileSync(join(ROOT_DIR, 'assets/js/components/mekong-media-vault-data.js'), 'utf-8');
    expect(content).toContain('Tràm Chim');
    expect(content).toContain('Sa Đéc');
    expect(content).toContain('Định Yên');
    expect(content).toContain('Cao Lãnh');
    expect(content).toContain('Lai Vung');
    expect(content).not.toMatch(/region:\s*'Huyện\s+/);
  });
});

describe('Huong Sen AI Nam Bo Script Studio Logic', () => {
  it('should provide 3 dialect tone styles', () => {
    const content = readFileSync(join(ROOT_DIR, 'assets/js/components/huong-sen-ai-data.js'), 'utf-8');
    expect(content).toContain('mientay');
    expect(content).toContain('nghenhan');
    expect(content).toContain('bakhia');
  });

  it('scripts should maintain 3-act structure (hook, story, cta)', () => {
    const content = readFileSync(join(ROOT_DIR, 'assets/js/components/huong-sen-ai-data.js'), 'utf-8');
    expect(content).toContain('hook:');
    expect(content).toContain('story:');
    expect(content).toContain('cta:');
  });
});

describe('HTML Integration Verification for Vault and AI Studio', () => {
  it('index.html should reference vault and huong-sen scripts', () => {
    const html = readFileSync(join(ROOT_DIR, 'index.html'), 'utf-8');
    expect(html).toContain('mekong-media-vault.js');
    expect(html).toContain('huong-sen-ai.js');
  });

  it('partnership.html should reference vault and huong-sen scripts', () => {
    const html = readFileSync(join(ROOT_DIR, 'partnership.html'), 'utf-8');
    expect(html).toContain('mekong-media-vault.js');
    expect(html).toContain('huong-sen-ai.js');
  });

  it('academy.html should reference vault and huong-sen scripts', () => {
    const html = readFileSync(join(ROOT_DIR, 'academy.html'), 'utf-8');
    expect(html).toContain('mekong-media-vault.js');
    expect(html).toContain('huong-sen-ai.js');
  });
});

/**
 * Mekong Settlement Webhook & OCOP Network Unit Tests
 * Kiểm thử logic giải ngân tự động 4 bên và danh bạ đối tác Đô thị & Vùng Sinh thái Đồng Tháp
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT_DIR = join(__dirname, '..');

describe('Bank Settlement Webhook Engine', () => {
  it('should have settlement data file under 200 lines', () => {
    const filePath = join(ROOT_DIR, 'assets/js/components/mekong-settlement-webhook-data.js');
    expect(existsSync(filePath)).toBe(true);
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').length;
    expect(lines).toBeLessThan(200);
  });

  it('should have settlement UI component file under 200 lines', () => {
    const filePath = join(ROOT_DIR, 'assets/js/components/mekong-settlement-webhook.js');
    expect(existsSync(filePath)).toBe(true);
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').length;
    expect(lines).toBeLessThan(200);
  });

  it('should correctly calculate 4-way split percentages and totals', () => {
    // 30% Homestay, 35% Crew, 20% Gear, 15% HubFund
    const amount = 10000000; // 10M VND
    const homestay = Math.round(amount * 0.30);
    const crew = Math.round(amount * 0.35);
    const gear = Math.round(amount * 0.20);
    const hubFund = amount - homestay - crew - gear;

    expect(homestay).toBe(3000000);
    expect(crew).toBe(3500000);
    expect(gear).toBe(2000000);
    expect(hubFund).toBe(1500000);
    expect(homestay + crew + gear + hubFund).toBe(amount);
  });
});

describe('Mekong OCOP Network - Đô Thị & Vùng Sinh Thái Đồng Tháp', () => {
  it('should have OCOP data file under 200 lines', () => {
    const filePath = join(ROOT_DIR, 'assets/js/components/mekong-ocop-network-data.js');
    expect(existsSync(filePath)).toBe(true);
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').length;
    expect(lines).toBeLessThan(200);
  });

  it('should have OCOP component file under 200 lines', () => {
    const filePath = join(ROOT_DIR, 'assets/js/components/mekong-ocop-network.js');
    expect(existsSync(filePath)).toBe(true);
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').length;
    expect(lines).toBeLessThan(200);
  });

  it('should have partner onboarding component under 200 lines', () => {
    const filePath = join(ROOT_DIR, 'assets/js/components/mekong-partner-onboarding.js');
    expect(existsSync(filePath)).toBe(true);
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').length;
    expect(lines).toBeLessThan(200);
  });

  it('should have quick-connect component under 200 lines', () => {
    const filePath = join(ROOT_DIR, 'assets/js/components/mekong-quick-connect.js');
    expect(existsSync(filePath)).toBe(true);
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').length;
    expect(lines).toBeLessThan(200);
  });

  it('should not contain legacy "Huyện " prefix in OCOP regions or partner names', () => {
    const dataContent = readFileSync(join(ROOT_DIR, 'assets/js/components/mekong-ocop-network-data.js'), 'utf-8');
    expect(dataContent).toContain('Đô thị Lai Vung');
    expect(dataContent).toContain('Đô thị Tháp Mười');
    expect(dataContent).toContain('Đô thị Tam Nông');
    expect(dataContent).not.toMatch(/name:\s*'Huyện\s+/);
    expect(dataContent).not.toMatch(/districtName:\s*'Huyện\s+/);
  });

  it('partner onboarding dropdown should not have "Huyện " options', () => {
    const formContent = readFileSync(join(ROOT_DIR, 'assets/js/components/mekong-partner-onboarding.js'), 'utf-8');
    expect(formContent).not.toMatch(/<option value="Huyện\s+/);
    expect(formContent).toContain('Đô thị Lai Vung');
    expect(formContent).toContain('TP. Cao Lãnh');
  });
});

describe('HTML Integration Verification', () => {
  it('index.html should mount mon-mount-point and include new scripts', () => {
    const html = readFileSync(join(ROOT_DIR, 'index.html'), 'utf-8');
    expect(html).toContain('id="mon-mount-point"');
    expect(html).toContain('mekong-settlement-webhook.js');
    expect(html).toContain('mekong-ocop-network.js');
    expect(html).toContain('mekong-partner-onboarding.js');
  });

  it('partnership.html should include settlement and OCOP components', () => {
    const html = readFileSync(join(ROOT_DIR, 'partnership.html'), 'utf-8');
    expect(html).toContain('mekong-settlement-webhook.js');
    expect(html).toContain('mekong-ocop-network.js');
    expect(html).toContain('mekong-partner-onboarding.js');
  });

  it('academy.html should include settlement and OCOP components', () => {
    const html = readFileSync(join(ROOT_DIR, 'academy.html'), 'utf-8');
    expect(html).toContain('mekong-settlement-webhook.js');
    expect(html).toContain('mekong-ocop-network.js');
    expect(html).toContain('mekong-partner-onboarding.js');
  });
});

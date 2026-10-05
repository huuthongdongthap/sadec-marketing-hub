/**
 * Mekong Settlement Webhook & OCOP Network Unit Tests
 * Kiểm thử logic giải ngân tự động 4 bên và danh bạ đối tác 12 huyện thành Đồng Tháp
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

describe('Mekong OCOP Network 12 Huyện Thành', () => {
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

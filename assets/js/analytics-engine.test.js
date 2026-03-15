/**
 * ============================================================================
 * TESTS - Analytics Engine
 * ============================================================================
 * Unit tests for marketing metrics calculation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AnalyticsEngine } from './core/analytics-engine.js';

describe('AnalyticsEngine', () => {
    let engine;

    beforeEach(() => {
        engine = new AnalyticsEngine();
    });

    describe('ROI Calculation', () => {
        it('should calculate ROI correctly', () => {
            expect(engine.calculateROI(150000000, 100000000)).toBe(50);
            expect(engine.calculateROI(200000000, 100000000)).toBe(100);
        });

        it('should handle zero cost', () => {
            expect(engine.calculateROI(100000000, 0)).toBe(0);
        });

        it('should handle negative ROI', () => {
            expect(engine.calculateROI(50000000, 100000000)).toBe(-50);
        });
    });

    describe('CPL Calculation', () => {
        it('should calculate CPL correctly', () => {
            expect(engine.calculateCPL(50000000, 500)).toBe(100000);
            expect(engine.calculateCPL(30000000, 300)).toBe(100000);
        });

        it('should handle zero leads', () => {
            expect(engine.calculateCPL(50000000, 0)).toBe(0);
        });
    });

    describe('CTR Calculation', () => {
        it('should calculate CTR correctly', () => {
            expect(engine.calculateCTR(1500, 50000)).toBe(3);
            expect(engine.calculateCTR(2500, 100000)).toBe(2.5);
        });

        it('should handle zero impressions', () => {
            expect(engine.calculateCTR(1000, 0)).toBe(0);
        });
    });

    describe('CR Calculation', () => {
        it('should calculate CR correctly', () => {
            expect(engine.calculateCR(75, 1500)).toBe(5);
            expect(engine.calculateCR(100, 2000)).toBe(5);
        });

        it('should handle zero clicks', () => {
            expect(engine.calculateCR(50, 0)).toBe(0);
        });
    });

    describe('ROAS Calculation', () => {
        it('should calculate ROAS correctly', () => {
            expect(engine.calculateROAS(200000000, 50000000)).toBe(4);
            expect(engine.calculateROAS(150000000, 50000000)).toBe(3);
        });

        it('should handle zero ad spend', () => {
            expect(engine.calculateROAS(100000000, 0)).toBe(0);
        });
    });

    describe('CPA Calculation', () => {
        it('should calculate CPA correctly', () => {
            expect(engine.calculateCPA(50000000, 100)).toBe(500000);
            expect(engine.calculateCPA(30000000, 60)).toBe(500000);
        });

        it('should handle zero conversions', () => {
            expect(engine.calculateCPA(50000000, 0)).toBe(0);
        });
    });

    describe('CPC Calculation', () => {
        it('should calculate CPC correctly', () => {
            expect(engine.calculateCPC(50000000, 10000)).toBe(5000);
            expect(engine.calculateCPC(30000000, 6000)).toBe(5000);
        });

        it('should handle zero clicks', () => {
            expect(engine.calculateCPC(50000000, 0)).toBe(0);
        });
    });

    describe('CPM Calculation', () => {
        it('should calculate CPM correctly', () => {
            expect(engine.calculateCPM(50000000, 1000000)).toBe(50000);
            expect(engine.calculateCPM(30000000, 500000)).toBe(60000);
        });

        it('should handle zero impressions', () => {
            expect(engine.calculateCPM(50000000, 0)).toBe(0);
        });
    });

    describe('calculateCampaignMetrics', () => {
        it('should calculate all metrics for a campaign', () => {
            const campaign = {
                revenue: 200000000,
                cost: 50000000,
                impressions: 1000000,
                clicks: 25000,
                leads: 400,
                conversions: 125
            };

            const metrics = engine.calculateCampaignMetrics(campaign);

            expect(metrics.revenue).toBe(200000000);
            expect(metrics.cost).toBe(50000000);
            expect(metrics.profit).toBe(150000000);
            expect(metrics.roi).toBe(300);
            expect(metrics.roas).toBe(4);
            expect(metrics.ctr).toBe(2.5);
            expect(metrics.cr).toBe(0.5);
            expect(metrics.cpl).toBe(125000);
            expect(metrics.cpa).toBe(400000);
            expect(metrics.cpc).toBe(2000);
            expect(metrics.cpm).toBe(50000);
        });

        it('should handle missing values with defaults', () => {
            const metrics = engine.calculateCampaignMetrics({});
            expect(metrics.revenue).toBe(0);
            expect(metrics.cost).toBe(0);
            expect(metrics.roi).toBe(0);
        });
    });

    describe('compareCampaigns', () => {
        it('should compare multiple campaigns', () => {
            const campaigns = [
                { id: 1, name: 'Campaign A', revenue: 200000000, cost: 50000000, impressions: 1000000, clicks: 25000, leads: 400, conversions: 125 },
                { id: 2, name: 'Campaign B', revenue: 150000000, cost: 30000000, impressions: 500000, clicks: 15000, leads: 300, conversions: 90 }
            ];

            const result = engine.compareCampaigns(campaigns);

            expect(result.metrics.length).toBe(2);
            expect(result.rankings.byROI).toBeDefined();
            expect(result.rankings.byROAS).toBeDefined();
            expect(result.averages.roi).toBeDefined();
            expect(result.totalCampaigns).toBe(2);
        });

        it('should handle empty campaigns array', () => {
            const result = engine.compareCampaigns([]);
            expect(result.error).toBe('No campaigns provided');
        });
    });

    describe('scorePerformance', () => {
        it('should score campaign performance', () => {
            const metrics = {
                roi: 50,
                roas: 4,
                ctr: 3,
                cr: 5,
                cpl: 80000
            };

            const result = engine.scorePerformance(metrics);

            expect(result.overallScore).toBeDefined();
            expect(result.rating).toBeDefined();
            expect(result.scores).toBeDefined();
            expect(result.benchmarks).toBeDefined();
        });

        it('should use custom benchmarks', () => {
            const metrics = { roi: 30, roas: 5, ctr: 4, cr: 6, cpl: 50000 };
            const customBenchmarks = { roi: 10, roas: 2, ctr: 1, cr: 2, cpl: 200000 };

            const result = engine.scorePerformance(metrics, customBenchmarks);

            expect(result.benchmarks.roi).toBe(10);
            expect(result.benchmarks.roas).toBe(2);
        });
    });

    describe('formatCurrency', () => {
        it('should format currency as VND', () => {
            const formatted = engine.formatCurrency(1000000);
            expect(formatted).toContain('₫');
            expect(formatted).toContain('1.000.000');
        });
    });

    describe('formatPercentage', () => {
        it('should format percentage', () => {
            expect(engine.formatPercentage(75.5)).toBe('75.5%');
            expect(engine.formatPercentage(50)).toBe('50%');
        });
    });
});

describe('Standalone Functions', () => {
    it('should export standalone functions', () => {
        const {
            calculateROI,
            calculateCPL,
            calculateCTR,
            calculateCR,
            calculateROAS,
            calculateCampaignMetrics,
            formatCurrency,
            formatPercentage
        } = await import('./core/analytics-engine.js');

        expect(calculateROI(150000000, 100000000)).toBe(50);
        expect(calculateCPL(50000000, 500)).toBe(100000);
        expect(calculateCTR(1500, 50000)).toBe(3);
        expect(calculateCR(75, 1500)).toBe(5);
        expect(calculateROAS(200000000, 50000000)).toBe(4);
    });
});

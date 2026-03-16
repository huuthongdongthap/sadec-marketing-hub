/**
 * ============================================================================
 * SA ĐÉC MARKETING HUB — ANALYTICS ENGINE TESTS
 * ============================================================================
 * Unit tests for marketing metrics calculation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
    AnalyticsEngine,
    calculateROI,
    calculateCPL,
    calculateCTR,
    calculateCR,
    calculateROAS,
    calculateCPA,
    calculateCPC,
    calculateCPM,
    calculateCampaignMetrics,
    formatCurrency,
    formatPercentage
} from './analytics-engine.js';

describe('AnalyticsEngine Class', () => {
    let engine;

    beforeEach(() => {
        engine = new AnalyticsEngine();
    });

    describe('calculateROI', () => {
        it('should calculate ROI correctly', () => {
            expect(engine.calculateROI(15000000, 10000000)).toBe(50);
            expect(engine.calculateROI(20000000, 10000000)).toBe(100);
        });

        it('should handle zero cost', () => {
            expect(engine.calculateROI(10000000, 0)).toBe(0);
        });

        it('should handle negative ROI', () => {
            expect(engine.calculateROI(5000000, 10000000)).toBe(-50);
        });
    });

    describe('calculateCPL', () => {
        it('should calculate CPL correctly', () => {
            expect(engine.calculateCPL(5000000, 100)).toBe(50000);
            expect(engine.calculateCPL(10000000, 200)).toBe(50000);
        });

        it('should handle zero leads', () => {
            expect(engine.calculateCPL(5000000, 0)).toBe(0);
        });
    });

    describe('calculateCTR', () => {
        it('should calculate CTR correctly', () => {
            expect(engine.calculateCTR(500, 10000)).toBe(5);
            expect(engine.calculateCTR(1000, 50000)).toBe(2);
        });

        it('should handle zero impressions', () => {
            expect(engine.calculateCTR(100, 0)).toBe(0);
        });
    });

    describe('calculateCR', () => {
        it('should calculate conversion rate correctly', () => {
            expect(engine.calculateCR(50, 1000)).toBe(5);
            expect(engine.calculateCR(100, 5000)).toBe(2);
        });

        it('should handle zero clicks', () => {
            expect(engine.calculateCR(10, 0)).toBe(0);
        });
    });

    describe('calculateROAS', () => {
        it('should calculate ROAS correctly', () => {
            expect(engine.calculateROAS(30000000, 10000000)).toBe(3);
            expect(engine.calculateROAS(50000000, 10000000)).toBe(5);
        });

        it('should handle zero ad spend', () => {
            expect(engine.calculateROAS(10000000, 0)).toBe(0);
        });
    });

    describe('calculateCPA', () => {
        it('should calculate CPA correctly', () => {
            expect(engine.calculateCPA(5000000, 100)).toBe(50000);
            expect(engine.calculateCPA(10000000, 200)).toBe(50000);
        });

        it('should handle zero conversions', () => {
            expect(engine.calculateCPA(5000000, 0)).toBe(0);
        });
    });

    describe('calculateCPC', () => {
        it('should calculate CPC correctly', () => {
            expect(engine.calculateCPC(5000000, 1000)).toBe(5000);
            expect(engine.calculateCPC(10000000, 2000)).toBe(5000);
        });

        it('should handle zero clicks', () => {
            expect(engine.calculateCPC(5000000, 0)).toBe(0);
        });
    });

    describe('calculateCPM', () => {
        it('should calculate CPM correctly', () => {
            expect(engine.calculateCPM(5000000, 1000000)).toBe(5000);
            expect(engine.calculateCPM(10000000, 2000000)).toBe(5000);
        });

        it('should handle zero impressions', () => {
            expect(engine.calculateCPM(5000000, 0)).toBe(0);
        });
    });
});

describe('calculateCampaignMetrics', () => {
    let engine;

    beforeEach(() => {
        engine = new AnalyticsEngine();
    });

    it('should calculate all metrics for a campaign', () => {
        const campaign = {
            revenue: 30000000,
            cost: 10000000,
            impressions: 100000,
            clicks: 5000,
            leads: 200,
            conversions: 100
        };

        const metrics = engine.calculateCampaignMetrics(campaign);

        expect(metrics.revenue).toBe(30000000);
        expect(metrics.cost).toBe(10000000);
        expect(metrics.profit).toBe(20000000);
        expect(metrics.roi).toBe(200);
        expect(metrics.roas).toBe(3);
        expect(metrics.ctr).toBe(5);
        expect(metrics.cr).toBe(2);
        expect(metrics.cpl).toBe(50000);
        expect(metrics.cpa).toBe(100000);
        expect(metrics.cpc).toBe(2000);
        expect(metrics.cpm).toBe(100000);
    });

    it('should handle empty campaign object', () => {
        const metrics = engine.calculateCampaignMetrics({});

        expect(metrics.revenue).toBe(0);
        expect(metrics.cost).toBe(0);
        expect(metrics.profit).toBe(0);
        expect(metrics.roi).toBe(0);
    });

    it('should handle partial data', () => {
        const campaign = {
            revenue: 10000000,
            cost: 5000000
        };

        const metrics = engine.calculateCampaignMetrics(campaign);

        expect(metrics.revenue).toBe(10000000);
        expect(metrics.cost).toBe(5000000);
        expect(metrics.profit).toBe(5000000);
        expect(metrics.roi).toBe(100);
    });
});

describe('compareCampaigns', () => {
    let engine;

    beforeEach(() => {
        engine = new AnalyticsEngine();
    });

    it('should compare multiple campaigns', () => {
        const campaigns = [
            {
                id: 1,
                name: 'Campaign A',
                revenue: 30000000,
                cost: 10000000,
                impressions: 100000,
                clicks: 5000,
                leads: 200,
                conversions: 100
            },
            {
                id: 2,
                name: 'Campaign B',
                revenue: 50000000,
                cost: 20000000,
                impressions: 200000,
                clicks: 10000,
                leads: 400,
                conversions: 200
            }
        ];

        const result = engine.compareCampaigns(campaigns);

        expect(result.metrics.length).toBe(2);
        expect(result.rankings.byROI).toBeDefined();
        expect(result.rankings.byROAS).toBeDefined();
        expect(result.rankings.byCTR).toBeDefined();
        expect(result.rankings.byCR).toBeDefined();
        expect(result.averages).toBeDefined();
        expect(result.totalCampaigns).toBe(2);
    });

    it('should handle empty campaigns array', () => {
        const result = engine.compareCampaigns([]);
        expect(result.error).toBe('No campaigns provided');
    });

    it('should handle campaigns without id/name', () => {
        const campaigns = [
            { revenue: 10000000, cost: 5000000, impressions: 50000, clicks: 2500, leads: 100, conversions: 50 }
        ];

        const result = engine.compareCampaigns(campaigns);
        expect(result.metrics[0].id).toBe(0);
        expect(result.metrics[0].name).toBe('Campaign 1');
    });
});

describe('scorePerformance', () => {
    let engine;

    beforeEach(() => {
        engine = new AnalyticsEngine();
    });

    it('should score performance with default benchmarks', () => {
        const metrics = {
            roi: 40,
            roas: 6,
            ctr: 4,
            cr: 6,
            cpl: 50000
        };

        const result = engine.scorePerformance(metrics);

        expect(result.overallScore).toBeDefined();
        expect(result.rating).toBeDefined();
        expect(result.scores).toBeDefined();
        expect(result.benchmarks).toBeDefined();
    });

    it('should use custom benchmarks', () => {
        const metrics = {
            roi: 30,
            roas: 4,
            ctr: 3,
            cr: 4,
            cpl: 80000
        };

        const customBenchmarks = {
            roi: 30,
            roas: 4,
            ctr: 3,
            cr: 4,
            cpl: 80000
        };

        const result = engine.scorePerformance(metrics, customBenchmarks);

        expect(result.overallScore).toBeDefined();
        expect(result.benchmarks.roi).toBe(30);
    });

    it('should return correct rating based on score', () => {
        const excellentMetrics = { roi: 100, roas: 10, ctr: 10, cr: 10, cpl: 10000 };
        const poorMetrics = { roi: 5, roas: 1, ctr: 0.5, cr: 0.5, cpl: 500000 };

        expect(engine.scorePerformance(excellentMetrics).rating).toBe('excellent');
        expect(engine.scorePerformance(poorMetrics).rating).toBe('critical');
    });
});

describe('Formatting Utilities', () => {
    let engine;

    beforeEach(() => {
        engine = new AnalyticsEngine();
    });

    describe('formatCurrency', () => {
        it('should format as VND currency', () => {
            const formatted = engine.formatCurrency(10000000);
            expect(formatted).toContain('₫');
            expect(formatted).toContain('10.000.000');
        });

        it('should format millions', () => {
            const formatted = engine.formatCurrency(50000000);
            expect(formatted).toContain('50.000.000');
        });
    });

    describe('formatPercentage', () => {
        it('should format as percentage', () => {
            expect(engine.formatPercentage(5.5)).toBe('5.5%');
            expect(engine.formatPercentage(10)).toBe('10%');
        });
    });

    describe('formatNumber', () => {
        it('should format with locale', () => {
            expect(engine.formatNumber(1000000)).toContain('1.000.000');
        });

        it('should support decimals', () => {
            expect(engine.formatNumber(1000.5, 2)).toContain('1.000,50');
        });
    });
});

describe('Standalone Functions', () => {
    describe('calculateROI', () => {
        it('should calculate ROI', () => {
            expect(calculateROI(15000000, 10000000)).toBe(50);
        });
    });

    describe('calculateCPL', () => {
        it('should calculate CPL', () => {
            expect(calculateCPL(5000000, 100)).toBe(50000);
        });
    });

    describe('calculateCTR', () => {
        it('should calculate CTR', () => {
            expect(calculateCTR(500, 10000)).toBe(5);
        });
    });

    describe('calculateCR', () => {
        it('should calculate conversion rate', () => {
            expect(calculateCR(50, 1000)).toBe(5);
        });
    });

    describe('calculateROAS', () => {
        it('should calculate ROAS', () => {
            expect(calculateROAS(30000000, 10000000)).toBe(3);
        });
    });

    describe('calculateCampaignMetrics', () => {
        it('should calculate campaign metrics', () => {
            const metrics = calculateCampaignMetrics({
                revenue: 20000000,
                cost: 10000000,
                impressions: 100000,
                clicks: 5000,
                leads: 200,
                conversions: 100
            });

            expect(metrics.roi).toBe(100);
            expect(metrics.roas).toBe(2);
        });
    });

    describe('formatCurrency', () => {
        it('should format currency', () => {
            const formatted = formatCurrency(10000000);
            expect(formatted).toContain('₫');
        });
    });

    describe('formatPercentage', () => {
        it('should format percentage', () => {
            expect(formatPercentage(7.5)).toBe('7.5%');
        });
    });
});

describe('Edge Cases', () => {
    let engine;

    beforeEach(() => {
        engine = new AnalyticsEngine();
    });

    it('should handle NaN values', () => {
        expect(engine.calculateROI(NaN, 10000)).toBe(0);
        expect(engine.calculateCPL(10000, NaN)).toBe(0);
    });

    it('should handle very large numbers', () => {
        const largeCampaign = {
            revenue: 1000000000000,
            cost: 500000000000,
            impressions: 1000000000,
            clicks: 50000000,
            leads: 1000000,
            conversions: 500000
        };

        const metrics = engine.calculateCampaignMetrics(largeCampaign);
        expect(metrics.roi).toBe(100);
        expect(metrics.roas).toBe(2);
    });

    it('should round to 2 decimal places', () => {
        const result = engine.calculateROI(10001000, 10000000);
        expect(result).toBe(0.01);
    });
});

/**
 * ============================================================================
 * SA ĐÉC MARKETING HUB — ANALYTICS ENGINE
 * ============================================================================
 * Module tính toán các metrics marketing cho chiến dịch
 *
 * USAGE:
 *   import { AnalyticsEngine } from './analytics-engine.js';
 *
 *   const engine = new AnalyticsEngine();
 *   const metrics = engine.calculateCampaignMetrics(campaign);
 *
 * @version 1.0.0
 * @module analytics-engine
 */

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const METRICS_CONFIG = {
    DECIMAL_PLACES: 2,
    PERCENTAGE_MULTIPLIER: 100,
    CURRENCY: 'VND',
    LOCALE: 'vi-VN'
};

// ============================================================================
// ANALYTICS ENGINE CLASS
// ============================================================================

export class AnalyticsEngine {
    constructor(config = {}) {
        this.config = { ...METRICS_CONFIG, ...config };
    }

    // ========================================================================
    // CORE METRICS CALCULATION
    // ========================================================================

    /**
     * Tính toán ROI (Return on Investment)
     * Formula: ((Revenue - Cost) / Cost) * 100
     */
    calculateROI(revenue, cost) {
        if (!cost || cost <= 0) return 0;
        const roi = ((revenue - cost) / cost) * this.config.PERCENTAGE_MULTIPLIER;
        return this._round(roi);
    }

    /**
     * Tính toán CPL (Cost Per Lead)
     * Formula: Total Cost / Total Leads
     */
    calculateCPL(totalCost, totalLeads) {
        if (!totalLeads || totalLeads <= 0) return 0;
        return this._round(totalCost / totalLeads);
    }

    /**
     * Tính toán CTR (Click-Through Rate)
     * Formula: (Clicks / Impressions) * 100
     */
    calculateCTR(clicks, impressions) {
        if (!impressions || impressions <= 0) return 0;
        const ctr = (clicks / impressions) * this.config.PERCENTAGE_MULTIPLIER;
        return this._round(ctr);
    }

    /**
     * Tính toán CR (Conversion Rate)
     * Formula: (Conversions / Clicks) * 100
     */
    calculateCR(conversions, clicks) {
        if (!clicks || clicks <= 0) return 0;
        const cr = (conversions / clicks) * this.config.PERCENTAGE_MULTIPLIER;
        return this._round(cr);
    }

    /**
     * Tính toán ROAS (Return on Ad Spend)
     * Formula: Revenue / Ad Spend
     */
    calculateROAS(revenue, adSpend) {
        if (!adSpend || adSpend <= 0) return 0;
        return this._round(revenue / adSpend);
    }

    /**
     * Tính toán CPA (Cost Per Acquisition)
     * Formula: Total Cost / Total Conversions
     */
    calculateCPA(totalCost, totalConversions) {
        if (!totalConversions || totalConversions <= 0) return 0;
        return this._round(totalCost / totalConversions);
    }

    /**
     * Tính toán CPC (Cost Per Click)
     * Formula: Total Cost / Total Clicks
     */
    calculateCPC(totalCost, totalClicks) {
        if (!totalClicks || totalClicks <= 0) return 0;
        return this._round(totalCost / totalClicks);
    }

    /**
     * Tính toán CPM (Cost Per Mille)
     * Formula: (Total Cost / Total Impressions) * 1000
     */
    calculateCPM(totalCost, totalImpressions) {
        if (!totalImpressions || totalImpressions <= 0) return 0;
        return this._round((totalCost / totalImpressions) * 1000);
    }

    // ========================================================================
    // CAMPAIGN METRICS AGGREGATION
    // ========================================================================

    calculateCampaignMetrics(campaign) {
        const { revenue = 0, cost = 0, impressions = 0, clicks = 0, leads = 0, conversions = 0 } = campaign;

        return {
            revenue: this._round(revenue),
            cost: this._round(cost),
            profit: this._round(revenue - cost),
            roi: this.calculateROI(revenue, cost),
            roas: this.calculateROAS(revenue, cost),
            ctr: this.calculateCTR(clicks, impressions),
            cr: this.calculateCR(conversions, clicks),
            cpl: this.calculateCPL(cost, leads),
            cpa: this.calculateCPA(cost, conversions),
            cpc: this.calculateCPC(cost, clicks),
            cpm: this.calculateCPM(cost, impressions),
            impressions,
            clicks,
            leads,
            conversions
        };
    }

    /**
     * So sánh hiệu suất giữa nhiều chiến dịch
     */
    compareCampaigns(campaigns) {
        if (!Array.isArray(campaigns) || campaigns.length === 0) {
            return { error: 'No campaigns provided' };
        }

        const metrics = campaigns.map((campaign, index) => ({
            id: campaign.id || index,
            name: campaign.name || `Campaign ${index + 1}`,
            ...this.calculateCampaignMetrics(campaign)
        }));

        const rankings = {
            byROI: [...metrics].sort((a, b) => b.roi - a.roi),
            byROAS: [...metrics].sort((a, b) => b.roas - a.roas),
            byCTR: [...metrics].sort((a, b) => b.ctr - a.ctr),
            byCR: [...metrics].sort((a, b) => b.cr - a.cr),
            byCPL: [...metrics].sort((a, b) => a.cpl - b.cpl),
            byCPA: [...metrics].sort((a, b) => a.cpa - b.cpa)
        };

        const averages = {
            roi: this._avg(metrics.map(m => m.roi)),
            roas: this._avg(metrics.map(m => m.roas)),
            ctr: this._avg(metrics.map(m => m.ctr)),
            cr: this._avg(metrics.map(m => m.cr)),
            cpl: this._avg(metrics.map(m => m.cpl)),
            cpa: this._avg(metrics.map(m => m.cpa))
        };

        return {
            metrics,
            rankings,
            averages,
            totalCampaigns: campaigns.length
        };
    }

    // ========================================================================
    // PERFORMANCE SCORING
    // ========================================================================

    scorePerformance(metrics, benchmarks = {}) {
        const defaultBenchmarks = {
            roi: 20,
            roas: 3,
            ctr: 2,
            cr: 3,
            cpl: 100000
        };

        const bench = { ...defaultBenchmarks, ...benchmarks };

        const scores = {
            roi: Math.min(100, (metrics.roi / bench.roi) * 50),
            roas: Math.min(100, (metrics.roas / bench.roas) * 50),
            ctr: Math.min(100, (metrics.ctr / bench.ctr) * 50),
            cr: Math.min(100, (metrics.cr / bench.cr) * 50),
            cpl: Math.max(0, 100 - ((metrics.cpl / bench.cpl) * 50))
        };

        const weights = { roi: 0.3, roas: 0.25, ctr: 0.15, cr: 0.15, cpl: 0.15 };
        const overallScore = Object.keys(scores).reduce((sum, key) => {
            return sum + (scores[key] * weights[key]);
        }, 0);

        const rating = overallScore >= 80 ? 'excellent'
            : overallScore >= 60 ? 'good'
                : overallScore >= 40 ? 'average'
                    : overallScore >= 20 ? 'poor' : 'critical';

        return {
            overallScore: this._round(overallScore),
            rating,
            scores,
            benchmarks: bench
        };
    }

    // ========================================================================
    // FORMATTING UTILITIES
    // ========================================================================

    formatCurrency(value) {
        return new Intl.NumberFormat(this.config.LOCALE, {
            style: 'currency',
            currency: this.config.CURRENCY,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }

    formatPercentage(value) {
        return `${this._round(value)}%`;
    }

    formatNumber(value, decimals = 0) {
        return new Intl.NumberFormat(this.config.LOCALE, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(value);
    }

    // ========================================================================
    // PRIVATE HELPER METHODS
    // ========================================================================

    _round(value) {
        if (typeof value !== 'number' || isNaN(value)) return 0;
        const multiplier = Math.pow(10, this.config.DECIMAL_PLACES);
        return Math.round(value * multiplier) / multiplier;
    }

    _avg(array) {
        if (!Array.isArray(array) || array.length === 0) return 0;
        const sum = array.reduce((acc, val) => acc + val, 0);
        return this._round(sum / array.length);
    }
}

// ============================================================================
// STANDALONE FUNCTIONS
// ============================================================================

export function calculateROI(revenue, cost) {
    return new AnalyticsEngine().calculateROI(revenue, cost);
}

export function calculateCPL(totalCost, totalLeads) {
    return new AnalyticsEngine().calculateCPL(totalCost, totalLeads);
}

export function calculateCTR(clicks, impressions) {
    return new AnalyticsEngine().calculateCTR(clicks, impressions);
}

export function calculateCR(conversions, clicks) {
    return new AnalyticsEngine().calculateCR(conversions, clicks);
}

export function calculateROAS(revenue, adSpend) {
    return new AnalyticsEngine().calculateROAS(revenue, adSpend);
}

export function calculateCampaignMetrics(campaign) {
    return new AnalyticsEngine().calculateCampaignMetrics(campaign);
}

export function formatCurrency(value) {
    return new AnalyticsEngine().formatCurrency(value);
}

export function formatPercentage(value) {
    return new AnalyticsEngine().formatPercentage(value);
}

export default AnalyticsEngine;

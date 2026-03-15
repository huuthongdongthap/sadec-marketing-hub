/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SA ĐÉC MARKETING HUB — ANALYTICS ENGINE
 *
 * Module tính toán các metrics marketing cho chiến dịch
 * - ROI (Return on Investment)
 * - CPL (Cost Per Lead)
 * - CTR (Click-Through Rate)
 * - CR (Conversion Rate)
 * - ROAS (Return on Ad Spend)
 *
 * USAGE:
 *   import { AnalyticsEngine } from './core/analytics-engine.js';
 *
 *   const engine = new AnalyticsEngine();
 *   const metrics = engine.calculateCampaignMetrics(campaign);
 *
 * @version 1.0.0 | 2026-03-15
 * @module analytics-engine
 * ═══════════════════════════════════════════════════════════════════════════
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
    /**
     * Analytics Engine constructor
     * @param {Object} config - Configuration options
     */
    constructor(config = {}) {
        this.config = { ...METRICS_CONFIG, ...config };
    }

    // ========================================================================
    // CORE METRICS CALCULATION
    // ========================================================================

    /**
     * Tính toán ROI (Return on Investment)
     * Formula: ((Revenue - Cost) / Cost) * 100
     *
     * @param {number} revenue - Doanh thu
     * @param {number} cost - Chi phí
     * @returns {number} ROI percentage
     *
     * @example
     * calculateROI(150000000, 100000000) // Returns: 50
     */
    calculateROI(revenue, cost) {
        if (!cost || cost <= 0) return 0;
        const roi = ((revenue - cost) / cost) * this.config.PERCENTAGE_MULTIPLIER;
        return this._round(roi);
    }

    /**
     * Tính toán CPL (Cost Per Lead)
     * Formula: Total Cost / Total Leads
     *
     * @param {number} totalCost - Tổng chi phí
     * @param {number} totalLeads - Tổng số leads
     * @returns {number} Cost per lead
     *
     * @example
     * calculateCPL(50000000, 500) // Returns: 100000
     */
    calculateCPL(totalCost, totalLeads) {
        if (!totalLeads || totalLeads <= 0) return 0;
        return this._round(totalCost / totalLeads);
    }

    /**
     * Tính toán CTR (Click-Through Rate)
     * Formula: (Clicks / Impressions) * 100
     *
     * @param {number} clicks - Số lượt click
     * @param {number} impressions - Số lượt hiển thị
     * @returns {number} CTR percentage
     *
     * @example
     * calculateCTR(1500, 50000) // Returns: 3
     */
    calculateCTR(clicks, impressions) {
        if (!impressions || impressions <= 0) return 0;
        const ctr = (clicks / impressions) * this.config.PERCENTAGE_MULTIPLIER;
        return this._round(ctr);
    }

    /**
     * Tính toán CR (Conversion Rate)
     * Formula: (Conversions / Clicks) * 100
     *
     * @param {number} conversions - Số lượt chuyển đổi
     * @param {number} clicks - Số lượt click
     * @returns {number} Conversion rate percentage
     *
     * @example
     * calculateCR(75, 1500) // Returns: 5
     */
    calculateCR(conversions, clicks) {
        if (!clicks || clicks <= 0) return 0;
        const cr = (conversions / clicks) * this.config.PERCENTAGE_MULTIPLIER;
        return this._round(cr);
    }

    /**
     * Tính toán ROAS (Return on Ad Spend)
     * Formula: Revenue / Ad Spend
     *
     * @param {number} revenue - Doanh thu
     * @param {number} adSpend - Chi phí quảng cáo
     * @returns {number} ROAS ratio
     *
     * @example
     * calculateROAS(200000000, 50000000) // Returns: 4
     */
    calculateROAS(revenue, adSpend) {
        if (!adSpend || adSpend <= 0) return 0;
        return this._round(revenue / adSpend);
    }

    /**
     * Tính toán CPA (Cost Per Acquisition)
     * Formula: Total Cost / Total Conversions
     *
     * @param {number} totalCost - Tổng chi phí
     * @param {number} totalConversions - Số lượt chuyển đổi
     * @returns {number} Cost per acquisition
     *
     * @example
     * calculateCPA(50000000, 100) // Returns: 500000
     */
    calculateCPA(totalCost, totalConversions) {
        if (!totalConversions || totalConversions <= 0) return 0;
        return this._round(totalCost / totalConversions);
    }

    /**
     * Tính toán CPC (Cost Per Click)
     * Formula: Total Cost / Total Clicks
     *
     * @param {number} totalCost - Tổng chi phí
     * @param {number} totalClicks - Tổng số click
     * @returns {number} Cost per click
     *
     * @example
     * calculateCPC(50000000, 10000) // Returns: 5000
     */
    calculateCPC(totalCost, totalClicks) {
        if (!totalClicks || totalClicks <= 0) return 0;
        return this._round(totalCost / totalClicks);
    }

    /**
     * Tính toán CPM (Cost Per Mille - Cost per 1000 impressions)
     * Formula: (Total Cost / Total Impressions) * 1000
     *
     * @param {number} totalCost - Tổng chi phí
     * @param {number} totalImpressions - Tổng số hiển thị
     * @returns {number} Cost per 1000 impressions
     *
     * @example
     * calculateCPM(50000000, 1000000) // Returns: 50000
     */
    calculateCPM(totalCost, totalImpressions) {
        if (!totalImpressions || totalImpressions <= 0) return 0;
        return this._round((totalCost / totalImpressions) * 1000);
    }

    // ========================================================================
    // CAMPAIGN METRICS AGGREGATION
    // ========================================================================

    /**
     * Tính toán tất cả metrics cho một chiến dịch
     *
     * @param {Object} campaign - Campaign data object
     * @param {number} campaign.revenue - Doanh thu
     * @param {number} campaign.cost - Chi phí
     * @param {number} campaign.impressions - Số hiển thị
     * @param {number} campaign.clicks - Số click
     * @param {number} campaign.leads - Số leads
     * @param {number} campaign.conversions - Số conversions
     * @returns {Object} All calculated metrics
     */
    calculateCampaignMetrics(campaign) {
        const { revenue = 0, cost = 0, impressions = 0, clicks = 0, leads = 0, conversions = 0 } = campaign;

        return {
            // Core metrics
            revenue: this._round(revenue),
            cost: this._round(cost),
            profit: this._round(revenue - cost),

            // Rates
            roi: this.calculateROI(revenue, cost),
            roas: this.calculateROAS(revenue, cost),
            ctr: this.calculateCTR(clicks, impressions),
            cr: this.calculateCR(conversions, clicks),

            // Cost metrics
            cpl: this.calculateCPL(cost, leads),
            cpa: this.calculateCPA(cost, conversions),
            cpc: this.calculateCPC(cost, clicks),
            cpm: this.calculateCPM(cost, impressions),

            // Raw data
            impressions,
            clicks,
            leads,
            conversions
        };
    }

    /**
     * So sánh hiệu suất giữa nhiều chiến dịch
     *
     * @param {Array<Object>} campaigns - Array of campaign data
     * @returns {Object} Aggregated metrics and rankings
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

        // Rank by different metrics
        const rankings = {
            byROI: [...metrics].sort((a, b) => b.roi - a.roi),
            byROAS: [...metrics].sort((a, b) => b.roas - a.roas),
            byCTR: [...metrics].sort((a, b) => b.ctr - a.ctr),
            byCR: [...metrics].sort((a, b) => b.cr - a.cr),
            byCPL: [...metrics].sort((a, b) => a.cpl - b.cpl), // Lower is better
            byCPA: [...metrics].sort((a, b) => a.cpa - b.cpa)  // Lower is better
        };

        // Calculate averages
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
    // TREND ANALYSIS
    // ============================================================================

    /**
     * Phân tích xu hướng hiệu suất qua thời gian
     *
     * @param {Array<Object>} timeSeriesData - Array of {date, revenue, cost, ...} objects
     * @param {string} metric - Metric to analyze (roi, ctr, cr, etc.)
     * @returns {Object} Trend analysis results
     */
    analyzeTrend(timeSeriesData, metric = 'roi') {
        if (!Array.isArray(timeSeriesData) || timeSeriesData.length < 2) {
            return { error: 'Need at least 2 data points for trend analysis' };
        }

        const values = timeSeriesData.map(d => {
            if (d[metric] !== undefined) return d[metric];
            const metrics = this.calculateCampaignMetrics(d);
            return metrics[metric] || 0;
        });

        const firstValue = values[0];
        const lastValue = values[values.length - 1];
        const trend = lastValue - firstValue;
        const trendPercentage = firstValue > 0 ? ((trend / firstValue) * 100) : 0;

        // Calculate moving average (7-day)
        const movingAverage = this._calculateMovingAverage(values, 7);

        // Determine trend direction
        const direction = trend > 0 ? 'up' : trend < 0 ? 'down' : 'stable';

        return {
            metric,
            dataPoints: values.length,
            firstValue: this._round(firstValue),
            lastValue: this._round(lastValue),
            trend: this._round(trend),
            trendPercentage: this._round(trendPercentage),
            direction,
            movingAverage: movingAverage.map(v => this._round(v)),
            average: this._avg(values)
        };
    }

    // ========================================================================
    // PERFORMANCE SCORING
    // ============================================================================

    /**
     * Chấm điểm hiệu suất chiến dịch (0-100)
     *
     * @param {Object} metrics - Campaign metrics from calculateCampaignMetrics
     * @param {Object} benchmarks - Industry benchmarks for comparison
     * @returns {Object} Performance score and breakdown
     */
    scorePerformance(metrics, benchmarks = {}) {
        const defaultBenchmarks = {
            roi: 20,        // 20% ROI
            roas: 3,        // 3x ROAS
            ctr: 2,         // 2% CTR
            cr: 3,          // 3% CR
            cpl: 100000     // 100k VND per lead
        };

        const bench = { ...defaultBenchmarks, ...benchmarks };

        // Score each metric (0-100 scale)
        const scores = {
            roi: Math.min(100, (metrics.roi / bench.roi) * 50),
            roas: Math.min(100, (metrics.roas / bench.roas) * 50),
            ctr: Math.min(100, (metrics.ctr / bench.ctr) * 50),
            cr: Math.min(100, (metrics.cr / bench.cr) * 50),
            cpl: Math.max(0, 100 - ((metrics.cpl / bench.cpl) * 50)) // Lower CPL = higher score
        };

        // Calculate weighted average score
        const weights = { roi: 0.3, roas: 0.25, ctr: 0.15, cr: 0.15, cpl: 0.15 };
        const overallScore = Object.keys(scores).reduce((sum, key) => {
            return sum + (scores[key] * weights[key]);
        }, 0);

        // Determine rating
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
    // ============================================================================

    /**
     * Format currency value
     *
     * @param {number} value - Value to format
     * @returns {string} Formatted currency string
     */
    formatCurrency(value) {
        return new Intl.NumberFormat(this.config.LOCALE, {
            style: 'currency',
            currency: this.config.CURRENCY,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }

    /**
     * Format percentage value
     *
     * @param {number} value - Value to format
     * @returns {string} Formatted percentage string
     */
    formatPercentage(value) {
        return `${this._round(value)}%`;
    }

    /**
     * Format number with locale
     *
     * @param {number} value - Value to format
     * @param {number} decimals - Decimal places
     * @returns {string} Formatted number string
     */
    formatNumber(value, decimals = 0) {
        return new Intl.NumberFormat(this.config.LOCALE, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(value);
    }

    // ========================================================================
    // PRIVATE HELPER METHODS
    // ============================================================================

    /**
     * Round to configured decimal places
     * @private
     */
    _round(value) {
        if (typeof value !== 'number' || isNaN(value)) return 0;
        const multiplier = Math.pow(10, this.config.DECIMAL_PLACES);
        return Math.round(value * multiplier) / multiplier;
    }

    /**
     * Calculate average of array
     * @private
     */
    _avg(array) {
        if (!Array.isArray(array) || array.length === 0) return 0;
        const sum = array.reduce((acc, val) => acc + val, 0);
        return this._round(sum / array.length);
    }

    /**
     * Calculate moving average
     * @private
     */
    _calculateMovingAverage(values, windowSize) {
        const result = [];
        for (let i = 0; i < values.length; i++) {
            const start = Math.max(0, i - windowSize + 1);
            const window = values.slice(start, i + 1);
            result.push(this._avg(window));
        }
        return result;
    }
}

// ============================================================================
// STANDALONE FUNCTIONS (for simple imports)
// ============================================================================

/**
 * Quick ROI calculation
 * @param {number} revenue - Revenue
 * @param {number} cost - Cost
 * @returns {number} ROI percentage
 */
export function calculateROI(revenue, cost) {
    return new AnalyticsEngine().calculateROI(revenue, cost);
}

/**
 * Quick CPL calculation
 * @param {number} totalCost - Total cost
 * @param {number} totalLeads - Total leads
 * @returns {number} Cost per lead
 */
export function calculateCPL(totalCost, totalLeads) {
    return new AnalyticsEngine().calculateCPL(totalCost, totalLeads);
}

/**
 * Quick CTR calculation
 * @param {number} clicks - Clicks
 * @param {number} impressions - Impressions
 * @returns {number} CTR percentage
 */
export function calculateCTR(clicks, impressions) {
    return new AnalyticsEngine().calculateCTR(clicks, impressions);
}

/**
 * Quick CR calculation
 * @param {number} conversions - Conversions
 * @param {number} clicks - Clicks
 * @returns {number} Conversion rate percentage
 */
export function calculateCR(conversions, clicks) {
    return new AnalyticsEngine().calculateCR(conversions, clicks);
}

/**
 * Quick ROAS calculation
 * @param {number} revenue - Revenue
 * @param {number} adSpend - Ad spend
 * @returns {number} ROAS ratio
 */
export function calculateROAS(revenue, adSpend) {
    return new AnalyticsEngine().calculateROAS(revenue, adSpend);
}

/**
 * Calculate all metrics for a campaign
 * @param {Object} campaign - Campaign data
 * @returns {Object} All calculated metrics
 */
export function calculateCampaignMetrics(campaign) {
    return new AnalyticsEngine().calculateCampaignMetrics(campaign);
}

/**
 * Format currency
 * @param {number} value - Value to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value) {
    return new AnalyticsEngine().formatCurrency(value);
}

/**
 * Format percentage
 * @param {number} value - Value to format
 * @returns {string} Formatted percentage string
 */
export function formatPercentage(value) {
    return new AnalyticsEngine().formatPercentage(value);
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default AnalyticsEngine;

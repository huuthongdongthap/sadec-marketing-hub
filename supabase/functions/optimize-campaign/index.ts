// Supabase Edge Function: Campaign Optimizer
// AI-powered budget allocation and optimization recommendations
// Sa Đéc Marketing Hub - V4 Phase 1

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

interface Campaign {
    id?: string;
    name: string;
    platform: 'facebook' | 'google' | 'tiktok' | 'zalo' | 'instagram';
    budget: number;
    spent: number;
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    startDate?: string;
    endDate?: string;
    status?: string;
}

interface OptimizationResult {
    campaignId?: string;
    metrics: {
        ctr: number;          // Click-through rate
        cpc: number;          // Cost per click
        cpa: number;          // Cost per acquisition
        roas: number;         // Return on ad spend
        conversionRate: number;
    };
    score: number;            // 0-100 performance score
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    recommendations: Recommendation[];
    budgetSuggestion: BudgetSuggestion;
}

interface Recommendation {
    type: 'increase_budget' | 'decrease_budget' | 'pause' | 'optimize_creative' | 'adjust_targeting' | 'extend' | 'scale';
    priority: 'high' | 'medium' | 'low';
    message: string;
    expectedImpact: string;
}

interface BudgetSuggestion {
    current: number;
    suggested: number;
    change: number;
    changePercent: number;
    reason: string;
}

// Platform benchmarks for Vietnam market
const BENCHMARKS = {
    facebook: { ctr: 0.9, cpc: 3000, cpa: 150000, roas: 3.0 },
    google: { ctr: 2.0, cpc: 5000, cpa: 200000, roas: 4.0 },
    tiktok: { ctr: 1.5, cpc: 2000, cpa: 100000, roas: 2.5 },
    zalo: { ctr: 0.8, cpc: 2500, cpa: 120000, roas: 2.0 },
    instagram: { ctr: 1.2, cpc: 3500, cpa: 180000, roas: 3.5 }
};

function calculateMetrics(campaign: Campaign) {
    const ctr = campaign.impressions > 0
        ? (campaign.clicks / campaign.impressions) * 100
        : 0;

    const cpc = campaign.clicks > 0
        ? campaign.spent / campaign.clicks
        : 0;

    const cpa = campaign.conversions > 0
        ? campaign.spent / campaign.conversions
        : 0;

    const roas = campaign.spent > 0
        ? campaign.revenue / campaign.spent
        : 0;

    const conversionRate = campaign.clicks > 0
        ? (campaign.conversions / campaign.clicks) * 100
        : 0;

    return { ctr, cpc, cpa, roas, conversionRate };
}

function calculateScore(metrics: ReturnType<typeof calculateMetrics>, platform: Campaign['platform']): number {
    const benchmark = BENCHMARKS[platform];
    let score = 50; // Base score

    // CTR scoring (max 20 points)
    if (metrics.ctr >= benchmark.ctr * 1.5) score += 20;
    else if (metrics.ctr >= benchmark.ctr) score += 15;
    else if (metrics.ctr >= benchmark.ctr * 0.5) score += 10;
    else score += 5;

    // CPC scoring (max 20 points) - lower is better
    if (metrics.cpc > 0) {
        if (metrics.cpc <= benchmark.cpc * 0.5) score += 20;
        else if (metrics.cpc <= benchmark.cpc) score += 15;
        else if (metrics.cpc <= benchmark.cpc * 1.5) score += 10;
        else score += 0;
    }

    // ROAS scoring (max 30 points)
    if (metrics.roas >= benchmark.roas * 2) score += 30;
    else if (metrics.roas >= benchmark.roas) score += 20;
    else if (metrics.roas >= benchmark.roas * 0.5) score += 10;
    else if (metrics.roas > 1) score += 5;
    else score -= 10;

    return Math.max(0, Math.min(100, score));
}

function getGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 85) return 'A';
    if (score >= 70) return 'B';
    if (score >= 55) return 'C';
    if (score >= 40) return 'D';
    return 'F';
}

function generateRecommendations(
    metrics: ReturnType<typeof calculateMetrics>,
    campaign: Campaign,
    score: number
): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const benchmark = BENCHMARKS[campaign.platform];

    // High performer - scale up
    if (score >= 80 && metrics.roas >= benchmark.roas * 1.5) {
        recommendations.push({
            type: 'scale',
            priority: 'high',
            message: `🚀 Campaign đang hoạt động xuất sắc! Tăng ngân sách 50-100%`,
            expectedImpact: `+${Math.round(campaign.revenue * 0.5 / 1000000)}M doanh thu/tháng`
        });
    }

    // Good ROAS - increase budget
    if (metrics.roas >= benchmark.roas && score >= 60) {
        recommendations.push({
            type: 'increase_budget',
            priority: 'medium',
            message: `ROAS ${metrics.roas.toFixed(1)}x tốt hơn benchmark. Cân nhắc tăng ngân sách.`,
            expectedImpact: `Duy trì ROAS, tăng volume`
        });
    }

    // Low CTR - optimize creative
    if (metrics.ctr < benchmark.ctr * 0.7) {
        recommendations.push({
            type: 'optimize_creative',
            priority: 'high',
            message: `CTR ${metrics.ctr.toFixed(2)}% thấp hơn benchmark ${benchmark.ctr}%. Cần đổi creative.`,
            expectedImpact: `+${Math.round((benchmark.ctr - metrics.ctr) / benchmark.ctr * 100)}% clicks`
        });
    }

    // High CPC - adjust targeting
    if (metrics.cpc > benchmark.cpc * 1.3) {
        recommendations.push({
            type: 'adjust_targeting',
            priority: 'medium',
            message: `CPC ₫${Math.round(metrics.cpc).toLocaleString()} cao. Thu hẹp targeting.`,
            expectedImpact: `-${Math.round((metrics.cpc - benchmark.cpc) / metrics.cpc * 100)}% chi phí/click`
        });
    }

    // Poor performer - pause
    if (score < 30 && metrics.roas < 1) {
        recommendations.push({
            type: 'pause',
            priority: 'high',
            message: `⚠️ Campaign đang lỗ (ROAS ${metrics.roas.toFixed(2)}x). Cân nhắc tạm dừng.`,
            expectedImpact: `Tiết kiệm ₫${Math.round(campaign.budget * 0.8).toLocaleString()}/tháng`
        });
    }

    // Budget underspent
    const spendRate = campaign.spent / campaign.budget;
    if (spendRate < 0.5 && score >= 50) {
        recommendations.push({
            type: 'adjust_targeting',
            priority: 'low',
            message: `Chỉ chi tiêu ${Math.round(spendRate * 100)}% ngân sách. Mở rộng audience.`,
            expectedImpact: `Tăng reach, sử dụng hết ngân sách`
        });
    }

    return recommendations.slice(0, 5); // Max 5 recommendations
}

function suggestBudget(
    metrics: ReturnType<typeof calculateMetrics>,
    campaign: Campaign,
    score: number
): BudgetSuggestion {
    let suggestedMultiplier = 1;
    let reason = '';

    if (score >= 85 && metrics.roas >= 3) {
        suggestedMultiplier = 2.0;
        reason = 'Performance xuất sắc, nhân đôi ngân sách để scale';
    } else if (score >= 70 && metrics.roas >= 2) {
        suggestedMultiplier = 1.5;
        reason = 'Performance tốt, tăng 50% để tối ưu';
    } else if (score >= 55 && metrics.roas >= 1.5) {
        suggestedMultiplier = 1.2;
        reason = 'Performance ổn, tăng nhẹ 20%';
    } else if (score >= 40 && metrics.roas >= 1) {
        suggestedMultiplier = 1.0;
        reason = 'Giữ nguyên ngân sách, tối ưu creative/targeting';
    } else if (metrics.roas < 1) {
        suggestedMultiplier = 0.5;
        reason = 'Campaign đang lỗ, giảm 50% và optimize';
    } else {
        suggestedMultiplier = 0.7;
        reason = 'Performance dưới benchmark, giảm 30%';
    }

    const suggested = Math.round(campaign.budget * suggestedMultiplier);

    return {
        current: campaign.budget,
        suggested,
        change: suggested - campaign.budget,
        changePercent: Math.round((suggestedMultiplier - 1) * 100),
        reason
    };
}

function optimizeCampaign(campaign: Campaign): OptimizationResult {
    const metrics = calculateMetrics(campaign);
    const score = calculateScore(metrics, campaign.platform);
    const grade = getGrade(score);
    const recommendations = generateRecommendations(metrics, campaign, score);
    const budgetSuggestion = suggestBudget(metrics, campaign, score);

    return {
        campaignId: campaign.id,
        metrics,
        score,
        grade,
        recommendations,
        budgetSuggestion
    };
}

serve(async (req: Request) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers });
    }

    try {
        if (req.method !== 'POST') {
            return new Response(
                JSON.stringify({ error: 'Method not allowed' }),
                { status: 405, headers }
            );
        }

        const body = await req.json();
        const campaigns: Campaign[] = Array.isArray(body) ? body : [body];
        const results = campaigns.map(optimizeCampaign);

        return new Response(
            JSON.stringify(Array.isArray(body) ? results : results[0]),
            { status: 200, headers }
        );

    } catch (error) {
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers }
        );
    }
});

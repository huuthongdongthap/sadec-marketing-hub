// Supabase Edge Function: Lead Scoring
// AI-powered lead quality prediction
// Sa Đéc Marketing Hub - V4 Phase 1

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

interface Lead {
    id?: string;
    name: string;
    phone?: string;
    email?: string;
    business_name?: string;
    source?: string;
    message?: string;
    created_at?: string;
    interactions?: number;
    budget_mentioned?: boolean;
    urgency_level?: string;
}

interface ScoreResult {
    score: number;           // 0-100
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    label: string;           // Hot, Warm, Cool, Cold
    confidence: number;      // 0-1
    factors: ScoreFactor[];
    recommendation: string;
    autoAssign?: boolean;
}

interface ScoreFactor {
    name: string;
    points: number;
    max: number;
    reason: string;
}

// Scoring criteria weights
const SCORING_RULES = {
    // Contact completeness (max 25 points)
    hasPhone: { points: 10, reason: 'Có số điện thoại' },
    hasEmail: { points: 8, reason: 'Có email' },
    hasBusinessName: { points: 7, reason: 'Có tên doanh nghiệp' },

    // Source quality (max 20 points)
    source: {
        referral: { points: 20, reason: 'Lead từ giới thiệu' },
        organic: { points: 15, reason: 'Lead organic (SEO)' },
        facebook: { points: 12, reason: 'Lead từ Facebook' },
        google_ads: { points: 10, reason: 'Lead từ Google Ads' },
        website: { points: 8, reason: 'Lead từ website' },
        other: { points: 5, reason: 'Nguồn khác' }
    },

    // Engagement signals (max 30 points)
    hasMessage: { points: 10, reason: 'Có để lại tin nhắn' },
    messageLengthBonus: { pointsPer50Chars: 2, max: 10, reason: 'Tin nhắn chi tiết' },
    budgetMentioned: { points: 10, reason: 'Đề cập ngân sách' },

    // Urgency signals (max 15 points)
    urgency: {
        high: { points: 15, reason: 'Cần gấp' },
        medium: { points: 10, reason: 'Có deadline' },
        low: { points: 5, reason: 'Tìm hiểu' }
    },

    // Recency (max 10 points)
    recency: {
        today: { points: 10, reason: 'Lead hôm nay' },
        thisWeek: { points: 8, reason: 'Lead tuần này' },
        thisMonth: { points: 5, reason: 'Lead tháng này' },
        older: { points: 2, reason: 'Lead cũ' }
    }
};

function calculateScore(lead: Lead): ScoreResult {
    const factors: ScoreFactor[] = [];
    let totalScore = 0;

    // Contact completeness
    if (lead.phone) {
        factors.push({ name: 'phone', points: SCORING_RULES.hasPhone.points, max: 10, reason: SCORING_RULES.hasPhone.reason });
        totalScore += SCORING_RULES.hasPhone.points;
    }
    if (lead.email) {
        factors.push({ name: 'email', points: SCORING_RULES.hasEmail.points, max: 8, reason: SCORING_RULES.hasEmail.reason });
        totalScore += SCORING_RULES.hasEmail.points;
    }
    if (lead.business_name) {
        factors.push({ name: 'business', points: SCORING_RULES.hasBusinessName.points, max: 7, reason: SCORING_RULES.hasBusinessName.reason });
        totalScore += SCORING_RULES.hasBusinessName.points;
    }

    // Source quality
    const sourceKey = (lead.source || 'other').toLowerCase().replace('-', '_');
    const sourceRule = SCORING_RULES.source[sourceKey] || SCORING_RULES.source.other;
    factors.push({ name: 'source', points: sourceRule.points, max: 20, reason: sourceRule.reason });
    totalScore += sourceRule.points;

    // Message engagement
    if (lead.message) {
        factors.push({ name: 'message', points: SCORING_RULES.hasMessage.points, max: 10, reason: SCORING_RULES.hasMessage.reason });
        totalScore += SCORING_RULES.hasMessage.points;

        // Length bonus
        const lengthBonus = Math.min(
            Math.floor(lead.message.length / 50) * SCORING_RULES.messageLengthBonus.pointsPer50Chars,
            SCORING_RULES.messageLengthBonus.max
        );
        if (lengthBonus > 0) {
            factors.push({ name: 'messageLength', points: lengthBonus, max: 10, reason: SCORING_RULES.messageLengthBonus.reason });
            totalScore += lengthBonus;
        }

        // Budget detection
        const budgetKeywords = ['ngân sách', 'budget', 'triệu', 'tỷ', 'giá', 'chi phí', 'đầu tư'];
        if (budgetKeywords.some(kw => lead.message.toLowerCase().includes(kw))) {
            factors.push({ name: 'budget', points: SCORING_RULES.budgetMentioned.points, max: 10, reason: SCORING_RULES.budgetMentioned.reason });
            totalScore += SCORING_RULES.budgetMentioned.points;
        }

        // Urgency detection  
        const urgentKeywords = ['gấp', 'ngay', 'khẩn', 'sớm', 'urgent', 'asap'];
        const mediumKeywords = ['deadline', 'tuần', 'tháng', 'quý'];

        if (urgentKeywords.some(kw => lead.message.toLowerCase().includes(kw))) {
            factors.push({ name: 'urgency', points: SCORING_RULES.urgency.high.points, max: 15, reason: SCORING_RULES.urgency.high.reason });
            totalScore += SCORING_RULES.urgency.high.points;
        } else if (mediumKeywords.some(kw => lead.message.toLowerCase().includes(kw))) {
            factors.push({ name: 'urgency', points: SCORING_RULES.urgency.medium.points, max: 15, reason: SCORING_RULES.urgency.medium.reason });
            totalScore += SCORING_RULES.urgency.medium.points;
        }
    }

    // Recency scoring
    if (lead.created_at) {
        const created = new Date(lead.created_at);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));

        let recencyRule;
        if (daysDiff === 0) recencyRule = SCORING_RULES.recency.today;
        else if (daysDiff <= 7) recencyRule = SCORING_RULES.recency.thisWeek;
        else if (daysDiff <= 30) recencyRule = SCORING_RULES.recency.thisMonth;
        else recencyRule = SCORING_RULES.recency.older;

        factors.push({ name: 'recency', points: recencyRule.points, max: 10, reason: recencyRule.reason });
        totalScore += recencyRule.points;
    }

    // Calculate grade and label
    const score = Math.min(totalScore, 100);
    let grade: 'A' | 'B' | 'C' | 'D' | 'F';
    let label: string;
    let recommendation: string;
    let autoAssign = false;

    if (score >= 80) {
        grade = 'A';
        label = '🔥 Hot Lead';
        recommendation = 'Liên hệ ngay trong vòng 1 giờ!';
        autoAssign = true;
    } else if (score >= 60) {
        grade = 'B';
        label = '⭐ Warm Lead';
        recommendation = 'Liên hệ trong 24 giờ';
        autoAssign = true;
    } else if (score >= 40) {
        grade = 'C';
        label = '👀 Cool Lead';
        recommendation = 'Theo dõi và nurture';
    } else if (score >= 20) {
        grade = 'D';
        label = '❄️ Cold Lead';
        recommendation = 'Thêm vào email nurture campaign';
    } else {
        grade = 'F';
        label = '💤 Very Cold';
        recommendation = 'Lưu trữ, không ưu tiên';
    }

    return {
        score,
        grade,
        label,
        confidence: factors.length / 8, // Max 8 factors
        factors,
        recommendation,
        autoAssign
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

        // Support single lead or array of leads
        const leads: Lead[] = Array.isArray(body) ? body : [body];
        const results = leads.map(lead => ({
            id: lead.id,
            ...calculateScore(lead)
        }));

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

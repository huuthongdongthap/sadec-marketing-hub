// Supabase Edge Function: Calculate Commission
// Secure server-side commission calculation for affiliate system

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// Commission tiers (secure - not exposed to client)
const COMMISSION_TIERS = {
    bronze: { rate: 0.05, minSales: 0, label: 'Bronze' },
    silver: { rate: 0.08, minSales: 10000000, label: 'Silver' },
    gold: { rate: 0.12, minSales: 50000000, label: 'Gold' },
    platinum: { rate: 0.15, minSales: 100000000, label: 'Platinum' },
    diamond: { rate: 0.20, minSales: 500000000, label: 'Diamond' }
};

// Bonus multipliers
const BONUS_RULES = {
    newClient: 1.5,       // 50% bonus for first-time client
    repeatClient: 1.2,   // 20% bonus for repeat clients
    bulkOrder: 1.1       // 10% bonus for orders > 50M
};

interface CommissionRequest {
    sales: number;
    tier?: string;
    isNewClient?: boolean;
    isRepeatClient?: boolean;
}

interface CommissionResponse {
    commission: number;
    rate: number;
    tier: string;
    tierLabel: string;
    bonusApplied: string[];
    breakdown: {
        baseSales: number;
        baseRate: number;
        baseCommission: number;
        bonusMultiplier: number;
        finalCommission: number;
    };
}

function determineTier(totalSales: number): keyof typeof COMMISSION_TIERS {
    if (totalSales >= COMMISSION_TIERS.diamond.minSales) return 'diamond';
    if (totalSales >= COMMISSION_TIERS.platinum.minSales) return 'platinum';
    if (totalSales >= COMMISSION_TIERS.gold.minSales) return 'gold';
    if (totalSales >= COMMISSION_TIERS.silver.minSales) return 'silver';
    return 'bronze';
}

function calculateCommission(req: CommissionRequest): CommissionResponse {
    const sales = req.sales || 0;
    const tier = req.tier || determineTier(sales);
    const tierConfig = COMMISSION_TIERS[tier as keyof typeof COMMISSION_TIERS] || COMMISSION_TIERS.bronze;

    // Base calculation
    const baseRate = tierConfig.rate;
    const baseCommission = sales * baseRate;

    // Apply bonuses
    let bonusMultiplier = 1;
    const bonusApplied: string[] = [];

    if (req.isNewClient) {
        bonusMultiplier *= BONUS_RULES.newClient;
        bonusApplied.push('New Client +50%');
    }

    if (req.isRepeatClient && !req.isNewClient) {
        bonusMultiplier *= BONUS_RULES.repeatClient;
        bonusApplied.push('Repeat Client +20%');
    }

    if (sales >= 50000000) {
        bonusMultiplier *= BONUS_RULES.bulkOrder;
        bonusApplied.push('Bulk Order +10%');
    }

    const finalCommission = Math.round(baseCommission * bonusMultiplier);

    return {
        commission: finalCommission,
        rate: baseRate * bonusMultiplier,
        tier: tier,
        tierLabel: tierConfig.label,
        bonusApplied,
        breakdown: {
            baseSales: sales,
            baseRate,
            baseCommission,
            bonusMultiplier,
            finalCommission
        }
    };
}

serve(async (req: Request) => {
    // CORS headers
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    // Handle CORS preflight
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

        const body: CommissionRequest = await req.json();

        if (typeof body.sales !== 'number' || body.sales < 0) {
            return new Response(
                JSON.stringify({ error: 'Invalid sales amount' }),
                { status: 400, headers }
            );
        }

        const result = calculateCommission(body);

        return new Response(
            JSON.stringify(result),
            { status: 200, headers }
        );

    } catch (error) {
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers }
        );
    }
});

/**
 * Affiliate API Client
 * Wrapper for calling Supabase Edge Functions
 * Sa Đéc Marketing Hub
 */

const AffiliateAPI = {
    // Edge Function URL - update with your Supabase project URL
    EDGE_URL: `${window.__ENV__?.SUPABASE_URL || 'https://pzcgvfhppglzfjavxuid.supabase.co'}/functions/v1`,

    /**
     * Calculate commission via Edge Function
     * @param {number} sales - Sales amount in VND
     * @param {Object} options - Optional parameters
     * @returns {Promise<Object>} Commission calculation result
     */
    async calculateCommission(sales, options = {}) {
        try {
            const response = await fetch(`${this.EDGE_URL}/calculate-commission`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.__ENV__?.SUPABASE_ANON_KEY || ''}`
                },
                body: JSON.stringify({
                    sales,
                    tier: options.tier,
                    isNewClient: options.isNewClient || false,
                    isRepeatClient: options.isRepeatClient || false
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Commission calculation failed:', error);
            // Fallback to client-side calculation if Edge Function fails
            return this.fallbackCalculation(sales, options);
        }
    },

    /**
     * Fallback client-side calculation (less secure, used only if Edge Function unavailable)
     */
    fallbackCalculation(sales, options = {}) {
        const tiers = {
            bronze: 0.05,
            silver: 0.08,
            gold: 0.12,
            platinum: 0.15,
            diamond: 0.20
        };

        let tier = 'bronze';
        if (sales >= 500000000) tier = 'diamond';
        else if (sales >= 100000000) tier = 'platinum';
        else if (sales >= 50000000) tier = 'gold';
        else if (sales >= 10000000) tier = 'silver';

        const rate = tiers[tier];
        const commission = Math.round(sales * rate);

        return {
            commission,
            rate,
            tier,
            tierLabel: tier.charAt(0).toUpperCase() + tier.slice(1),
            bonusApplied: [],
            breakdown: {
                baseSales: sales,
                baseRate: rate,
                baseCommission: commission,
                bonusMultiplier: 1,
                finalCommission: commission
            },
            _fallback: true // Indicates fallback was used
        };
    },

    /**
     * Format commission for display
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    },

    /**
     * Format percentage
     */
    formatPercent(rate) {
        return `${(rate * 100).toFixed(1)}%`;
    }
};

// Export for use in other scripts
window.AffiliateAPI = AffiliateAPI;

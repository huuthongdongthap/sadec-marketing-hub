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
            console.warn('Edge Function failed, using fallback calculation');
            return this.fallbackCalculation(sales, options);
        }
    },

    /**
     * Fallback client-side calculation (less secure, used only if Edge Function unavailable)
     * SECURITY NOTE: This logic should match the Edge Function but is exposed to client manipulation.
     * Commission payouts MUST be verified on server before processing.
     */
    fallbackCalculation(sales, options = {}) {
        const tiers = {
            bronze: { rate: 0.05, min: 0, label: 'Bronze' },
            silver: { rate: 0.08, min: 10000000, label: 'Silver' },
            gold: { rate: 0.12, min: 50000000, label: 'Gold' },
            platinum: { rate: 0.15, min: 100000000, label: 'Platinum' },
            diamond: { rate: 0.20, min: 500000000, label: 'Diamond' }
        };

        // Determine Tier
        let tier = 'bronze';
        if (sales >= 500000000) tier = 'diamond';
        else if (sales >= 100000000) tier = 'platinum';
        else if (sales >= 50000000) tier = 'gold';
        else if (sales >= 10000000) tier = 'silver';

        const tierConfig = tiers[tier];
        const baseRate = tierConfig.rate;
        const baseCommission = Math.round(sales * baseRate);

        // Bonus Logic
        let bonusMultiplier = 1;
        const bonusApplied = [];

        if (options.isNewClient) {
            bonusMultiplier += 0.5; // +50%
            bonusApplied.push('New Client +50%');
        }

        if (options.isRepeatClient && !options.isNewClient) {
            bonusMultiplier += 0.2; // +20%
            bonusApplied.push('Repeat Client +20%');
        }

        if (sales >= 50000000) {
            bonusMultiplier += 0.1; // +10%
            bonusApplied.push('Bulk Order +10%');
        }

        // Correct bonus calculation: Base * Multiplier
        // Note: The Edge Function implementation (multiplier logic) might differ slightly.
        // Syncing fallback to match Edge Function logic:
        // Edge Function: baseCommission * bonusMultiplier
        const finalCommission = Math.round(baseCommission * bonusMultiplier);
        const finalRate = baseRate * bonusMultiplier;

        return {
            commission: finalCommission,
            rate: finalRate,
            tier,
            tierLabel: tierConfig.label,
            bonusApplied,
            breakdown: {
                baseSales: sales,
                baseRate: baseRate,
                baseCommission: baseCommission,
                bonusMultiplier: bonusMultiplier,
                finalCommission: finalCommission
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

/**
 * Campaign Optimizer Client
 * Connects to Supabase Edge Function to analyze and optimize campaigns
 */

const CampaignOptimizer = {
    // Edge Function URL
    EDGE_URL: `${window.__ENV__?.SUPABASE_URL || 'https://pzcgvfhppglzfjavxuid.supabase.co'}/functions/v1/optimize-campaign`,
    ANON_KEY: window.__ENV__?.SUPABASE_ANON_KEY || '',

    /**
     * Analyze a single campaign
     * @param {Object} campaign - Campaign data object
     */
    async analyze(campaign) {
        try {
            this.showLoading(true);

            // If no real API key, use mock data locally to save Edge Function invocations during demo
            if (!this.ANON_KEY || this.ANON_KEY.includes('YOUR_')) {
                console.warn('Using local optimization logic (Mock Mode)');
                await new Promise(r => setTimeout(r, 1500));
                return this.localOptimize(campaign);
            }

            const response = await fetch(this.EDGE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.ANON_KEY}`
                },
                body: JSON.stringify(campaign)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Optimization failed');
            }

            const result = await response.json();
            return result;

        } catch (error) {
            console.error('Optimizer Error:', error);
            // Fallback to local optimization on error
            return this.localOptimize(campaign);
        } finally {
            this.showLoading(false);
        }
    },

    /**
     * Local fallback optimization logic (mirrors Edge Function logic partially)
     */
    localOptimize(campaign) {
        // Simple logic for demo purposes
        const roas = campaign.spent > 0 ? campaign.revenue / campaign.spent : 0;
        let score = 50;
        let grade = 'C';
        let recommendations = [];

        if (roas > 4) { score = 90; grade = 'A'; }
        else if (roas > 2.5) { score = 75; grade = 'B'; }
        else if (roas > 1.5) { score = 60; grade = 'C'; }
        else { score = 40; grade = 'D'; }

        if (score >= 80) {
            recommendations.push({
                type: 'scale',
                priority: 'high',
                message: 'Hiệu quả xuất sắc! Tăng ngân sách 50% để scale.',
                expectedImpact: '+30% doanh thu'
            });
        } else if (score < 50) {
            recommendations.push({
                type: 'pause',
                priority: 'high',
                message: 'Hiệu quả thấp. Tạm dừng để tối ưu lại content.',
                expectedImpact: 'Cắt giảm lỗ'
            });
        } else {
            recommendations.push({
                type: 'optimize',
                priority: 'medium',
                message: 'Duy trì ngân sách. Tối ưu lại targeting.',
                expectedImpact: '+10% ROI'
            });
        }

        return {
            campaignId: campaign.id,
            metrics: { roas, ctr: 1.5, cpc: 5000 },
            score,
            grade,
            recommendations,
            budgetSuggestion: {
                current: campaign.budget,
                suggested: score > 70 ? campaign.budget * 1.2 : campaign.budget,
                reason: score > 70 ? 'Scale up' : 'Maintain'
            }
        };
    },

    /**
     * Show Analysis Modal
     */
    showResultModal(result, campaignName) {
        // Remove existing modal
        const existing = document.querySelector('.optimizer-modal');
        if (existing) existing.remove();

        const gradeColor = {
            'A': '#4CAF50', 'B': '#8BC34A', 'C': '#FFC107', 'D': '#FF9800', 'F': '#F44336'
        }[result.grade] || '#9E9E9E';

        const modal = document.createElement('div');
        modal.className = 'optimizer-modal';
        modal.innerHTML = `
            <div class="optimizer-content glass-card">
                <div class="optimizer-header">
                    <div>
                        <h3>⚡ AI Optimization Report</h3>
                        <div class="opt-campaign-name">${campaignName}</div>
                    </div>
                    <button class="opt-close">&times;</button>
                </div>

                <div class="opt-score-section">
                    <div class="opt-grade" style="color: ${gradeColor}; border-color: ${gradeColor}">${result.grade}</div>
                    <div class="opt-score-details">
                        <div class="opt-score-val">Score: ${result.score}/100</div>
                        <div class="opt-metrics">
                            <span>ROAS: ${result.metrics.roas.toFixed(2)}x</span> •
                            <span>CTR: ${result.metrics.ctr.toFixed(2)}%</span>
                        </div>
                    </div>
                </div>

                <div class="opt-recommendations">
                    <h4>Recommendations</h4>
                    ${result.recommendations.map(rec => `
                        <div class="opt-rec-item ${rec.priority}">
                            <div class="opt-rec-icon">
                                <span class="material-symbols-outlined">
                                    ${rec.type === 'scale' ? 'trending_up' : rec.type === 'pause' ? 'pause_circle' : 'tune'}
                                </span>
                            </div>
                            <div class="opt-rec-text">
                                <div class="opt-rec-msg">${rec.message}</div>
                                <div class="opt-rec-impact">Impact: ${rec.expectedImpact}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="opt-budget-action">
                    <div class="opt-budget-info">
                        <div>Ngân sách hiện tại: <strong>${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(result.budgetSuggestion.current)}</strong></div>
                        <div>Đề xuất: <strong style="color: #006A60">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(result.budgetSuggestion.suggested)}</strong></div>
                    </div>
                    <button class="btn btn-filled" onclick="alert('Đã cập nhật ngân sách!')">
                        Áp dụng thay đổi
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add styles dynamically if not present
        if (!document.getElementById('optimizer-styles')) {
            const style = document.createElement('style');
            style.id = 'optimizer-styles';
            style.textContent = `
                .optimizer-modal {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    backdrop-filter: blur(4px);
                    animation: fadeIn 0.3s ease;
                }
                .optimizer-content {
                    width: 90%;
                    max-width: 500px;
                    background: white;
                    border-radius: 16px;
                    padding: 24px;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.2);
                }
                .optimizer-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 20px;
                }
                .optimizer-header h3 { margin: 0; color: #006A60; display: flex; align-items: center; gap: 8px; }
                .opt-campaign-name { font-size: 14px; color: #666; margin-top: 4px; }
                .opt-close { background: none; border: none; font-size: 24px; cursor: pointer; color: #999; }

                .opt-score-section {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    padding: 20px;
                    background: #F5F7F7;
                    border-radius: 12px;
                    margin-bottom: 24px;
                }
                .opt-grade {
                    font-size: 36px;
                    font-weight: 800;
                    width: 60px;
                    height: 60px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 3px solid;
                    border-radius: 50%;
                    background: white;
                }
                .opt-score-val { font-weight: 700; font-size: 18px; color: #333; }
                .opt-metrics { font-size: 13px; color: #666; margin-top: 4px; }

                .opt-recommendations h4 { margin: 0 0 12px 0; color: #333; }
                .opt-rec-item {
                    display: flex;
                    gap: 12px;
                    padding: 12px;
                    border: 1px solid #eee;
                    border-radius: 8px;
                    margin-bottom: 8px;
                }
                .opt-rec-item.high { border-left: 3px solid #F44336; background: #FFEBEE; }
                .opt-rec-item.medium { border-left: 3px solid #FF9800; background: #FFF3E0; }
                .opt-rec-item.low { border-left: 3px solid #4CAF50; background: #E8F5E9; }

                .opt-rec-msg { font-weight: 500; font-size: 14px; color: #333; }
                .opt-rec-impact { font-size: 12px; color: #666; margin-top: 2px; }

                .opt-budget-action {
                    margin-top: 24px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .opt-budget-info { font-size: 13px; }

                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `;
            document.head.appendChild(style);
        }

        // Bind events
        modal.querySelector('.opt-close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    },

    showLoading(show) {
        if (show) {
            const loader = document.createElement('div');
            loader.className = 'optimizer-loader';
            loader.innerHTML = '<div class="spinner"></div><div style="margin-top:10px;color:white;font-weight:500;">AI Analyzing...</div>';
            loader.style.cssText = `
                position: fixed; top:0; left:0; right:0; bottom:0;
                background: rgba(0,0,0,0.7);
                display: flex; flex-direction: column;
                align-items: center; justify-content: center;
                z-index: 10001; backdrop-filter: blur(2px);
            `;
            document.body.appendChild(loader);
        } else {
            const loader = document.querySelector('.optimizer-loader');
            if (loader) loader.remove();
        }
    }
};

window.CampaignOptimizer = CampaignOptimizer;

/**
 * ==============================================
 * MEKONG AGENCY - BINH PHÁP ANALYSIS
 * AgencyOS Strategic Analysis Workflow
 * ==============================================
 */

const BinhPhapPrinciples = [
    { id: 'know_enemy', name: 'Biết địch biết ta', category: 'Intelligence', icon: '🔍' },
    { id: 'terrain', name: 'Địa hình', category: 'Market Position', icon: '🗺️' },
    { id: 'timing', name: 'Thời cơ', category: 'Timing', icon: '⏱️' },
    { id: 'deception', name: 'Xuất kỳ bất ý', category: 'Surprise', icon: '🎭' },
    { id: 'alliance', name: 'Liên minh', category: 'Partnerships', icon: '🤝' }
];

class Competitor {
    constructor(config) {
        this.id = config.id || `comp-${Date.now()}`;
        this.name = config.name;
        this.type = config.type || 'direct'; // direct, indirect, potential
        this.strengths = config.strengths || [];
        this.weaknesses = config.weaknesses || [];
        this.marketShare = config.marketShare || 0;
        this.pricing = config.pricing || 'unknown';
        this.threatLevel = config.threatLevel || 'medium';
        this.intel = [];
    }

    addIntel(info) {
        this.intel.push({ info, date: new Date().toISOString() });
        return this;
    }
}

class MarketAnalysis {
    constructor() {
        this.competitors = new Map();
        this.opportunities = [];
        this.threats = [];
        this.swot = { strengths: [], weaknesses: [], opportunities: [], threats: [] };
    }

    addCompetitor(config) {
        const comp = new Competitor(config);
        this.competitors.set(comp.id, comp);
        return comp;
    }

    getCompetitor(id) { return this.competitors.get(id); }
    getAllCompetitors() { return Array.from(this.competitors.values()); }

    addSWOT(category, item) {
        if (this.swot[category]) {
            this.swot[category].push({ text: item, addedAt: new Date().toISOString() });
        }
        return this;
    }

    analyzePosition() {
        const comps = this.getAllCompetitors();
        const totalMarketShare = comps.reduce((sum, c) => sum + c.marketShare, 0);
        const ourShare = 100 - totalMarketShare;

        return {
            competitorCount: comps.length,
            ourMarketShare: ourShare,
            topThreat: comps.find(c => c.threatLevel === 'high')?.name || 'None',
            opportunities: this.opportunities.length,
            threats: this.threats.length
        };
    }

    generateStrategy() {
        const position = this.analyzePosition();
        const strategies = [];

        if (position.ourMarketShare < 20) strategies.push('Focus on niche differentiation');
        if (position.competitorCount > 5) strategies.push('Compete on service quality, not price');
        if (position.opportunities > position.threats) strategies.push('Aggressive expansion recommended');
        else strategies.push('Defensive positioning - strengthen current clients');

        return strategies;
    }
}

function createDemoAnalysis(analysis) {
    analysis.addCompetitor({ name: 'Agency Alpha', type: 'direct', marketShare: 25, threatLevel: 'high', strengths: ['Brand recognition', 'Large team'], weaknesses: ['High prices', 'Slow delivery'] });
    analysis.addCompetitor({ name: 'Digital Beta', type: 'direct', marketShare: 15, threatLevel: 'medium', strengths: ['Low prices'], weaknesses: ['Quality issues'] });
    analysis.addCompetitor({ name: 'Creative Gamma', type: 'indirect', marketShare: 10, threatLevel: 'low', strengths: ['Design focus'], weaknesses: ['No tech capability'] });

    analysis.addSWOT('strengths', 'Local market expertise');
    analysis.addSWOT('strengths', 'Agile team');
    analysis.addSWOT('weaknesses', 'Limited brand awareness');
    analysis.addSWOT('opportunities', 'SME digital transformation');
    analysis.addSWOT('threats', 'Economic uncertainty');

    return analysis;
}

const marketAnalysis = new MarketAnalysis();
if (typeof module !== 'undefined') module.exports = { MarketAnalysis, Competitor, BinhPhapPrinciples, marketAnalysis, createDemoAnalysis };

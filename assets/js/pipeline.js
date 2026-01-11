/**
 * ==============================================
 * MEKONG AGENCY - SALES PIPELINE
 * AgencyOS Sales Pipeline Workflow
 * ==============================================
 */

const PipelineStages = [
    { id: 'lead', name: 'Lead', color: '#6b7280', probability: 10 },
    { id: 'qualified', name: 'Qualified', color: '#3b82f6', probability: 25 },
    { id: 'proposal', name: 'Proposal', color: '#8b5cf6', probability: 50 },
    { id: 'negotiation', name: 'Negotiation', color: '#f59e0b', probability: 75 },
    { id: 'closed', name: 'Closed Won', color: '#10b981', probability: 100 },
    { id: 'lost', name: 'Lost', color: '#ef4444', probability: 0 }
];

class Deal {
    constructor(config) {
        this.id = config.id || `deal-${Date.now()}`;
        this.name = config.name;
        this.company = config.company || '';
        this.value = config.value || 0;
        this.stage = config.stage || 'lead';
        this.probability = PipelineStages.find(s => s.id === this.stage)?.probability || 0;
        this.owner = config.owner || 'Unassigned';
        this.source = config.source || 'Direct';
        this.expectedClose = config.expectedClose || null;
        this.activities = [];
        this.createdAt = new Date().toISOString();
        this.lastActivity = new Date().toISOString();
    }

    moveStage(stageId) {
        const stage = PipelineStages.find(s => s.id === stageId);
        if (stage) {
            this.stage = stageId;
            this.probability = stage.probability;
            this.activities.push({ type: 'stage_change', stage: stageId, timestamp: new Date().toISOString() });
        }
        return this;
    }

    getWeightedValue() {
        return Math.round(this.value * (this.probability / 100));
    }
}

class PipelineManager {
    constructor() {
        this.deals = new Map();
    }

    addDeal(config) {
        const deal = new Deal(config);
        this.deals.set(deal.id, deal);
        return deal;
    }

    getDeal(id) { return this.deals.get(id); }

    getAllDeals() { return Array.from(this.deals.values()); }

    getDealsByStage(stageId) {
        return this.getAllDeals().filter(d => d.stage === stageId);
    }

    getMetrics() {
        const deals = this.getAllDeals();
        const openDeals = deals.filter(d => !['closed', 'lost'].includes(d.stage));
        return {
            totalDeals: deals.length,
            openDeals: openDeals.length,
            totalValue: openDeals.reduce((sum, d) => sum + d.value, 0),
            weightedValue: openDeals.reduce((sum, d) => sum + d.getWeightedValue(), 0),
            wonValue: deals.filter(d => d.stage === 'closed').reduce((sum, d) => sum + d.value, 0),
            winRate: deals.length > 0 ? Math.round((deals.filter(d => d.stage === 'closed').length / deals.filter(d => ['closed', 'lost'].includes(d.stage)).length) * 100) || 0 : 0
        };
    }

    getForecast() {
        const deals = this.getAllDeals().filter(d => !['closed', 'lost'].includes(d.stage));
        return PipelineStages.slice(0, -2).map(stage => ({
            stage: stage.name,
            deals: deals.filter(d => d.stage === stage.id).length,
            value: deals.filter(d => d.stage === stage.id).reduce((sum, d) => sum + d.value, 0),
            weighted: deals.filter(d => d.stage === stage.id).reduce((sum, d) => sum + d.getWeightedValue(), 0)
        }));
    }
}

function createDemoPipeline(manager) {
    manager.addDeal({ name: 'Website Redesign', company: 'ABC Corp', value: 50000000, stage: 'proposal' });
    manager.addDeal({ name: 'Social Media Package', company: 'XYZ Shop', value: 15000000, stage: 'qualified' });
    manager.addDeal({ name: 'SEO Campaign', company: 'Tech Co', value: 30000000, stage: 'negotiation' });
    manager.addDeal({ name: 'Brand Identity', company: 'Startup Inc', value: 25000000, stage: 'lead' });
    manager.addDeal({ name: 'Google Ads Setup', company: 'Local Cafe', value: 10000000, stage: 'closed' });
    return manager.getAllDeals();
}

const pipelineManager = new PipelineManager();
if (typeof module !== 'undefined') module.exports = { PipelineManager, Deal, PipelineStages, pipelineManager, createDemoPipeline };

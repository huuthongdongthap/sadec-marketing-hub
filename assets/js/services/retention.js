/**
 * ==============================================
 * MEKONG AGENCY - RETENTION PLAYS
 * AgencyOS Retention Plays Workflow
 * ==============================================
 */

const RetentionPlays = {
    qbr: { id: 'qbr', name: 'Quarterly Business Review', trigger: 'every 90 days', impact: 'high' },
    nps: { id: 'nps', name: 'NPS Survey', trigger: 'every 30 days', impact: 'medium' },
    anniversary: { id: 'anniversary', name: 'Anniversary Gift', trigger: 'yearly', impact: 'high' },
    upsell: { id: 'upsell', name: 'Upsell Opportunity', trigger: 'usage threshold', impact: 'high' },
    rescue: { id: 'rescue', name: 'At-Risk Rescue', trigger: 'churn signal', impact: 'critical' }
};

const ChurnSignals = [
    { id: 'low_usage', name: 'Low Usage', weight: 30, threshold: 'usage < 20%' },
    { id: 'support_tickets', name: 'High Support Tickets', weight: 25, threshold: '> 5/month' },
    { id: 'late_payment', name: 'Late Payment', weight: 20, threshold: '> 30 days' },
    { id: 'no_contact', name: 'No Contact', weight: 15, threshold: '> 60 days' },
    { id: 'negative_feedback', name: 'Negative Feedback', weight: 10, threshold: 'NPS < 6' }
];

class RetentionClient {
    constructor(config) {
        this.id = config.id || `ret-${Date.now()}`;
        this.name = config.name;
        this.company = config.company;
        this.mrr = config.mrr || 0;
        this.startDate = config.startDate || new Date().toISOString();
        this.npsScore = config.npsScore ?? 8;
        this.usageRate = config.usageRate ?? 70;
        this.lastContact = config.lastContact || new Date().toISOString();
        this.ltv = config.ltv || this.mrr * 12;
        this.churnRisk = 0;
        this.plays = [];
        this.calculateChurnRisk();
    }

    calculateChurnRisk() {
        let risk = 0;
        if (this.usageRate < 20) risk += 30;
        else if (this.usageRate < 50) risk += 15;
        if (this.npsScore < 6) risk += 25;
        else if (this.npsScore < 7) risk += 10;
        const daysSinceContact = Math.floor((new Date() - new Date(this.lastContact)) / (1000 * 60 * 60 * 24));
        if (daysSinceContact > 60) risk += 20;
        else if (daysSinceContact > 30) risk += 10;
        this.churnRisk = Math.min(100, risk);
        return this;
    }

    getRiskLevel() {
        if (this.churnRisk >= 50) return 'high';
        if (this.churnRisk >= 25) return 'medium';
        return 'low';
    }

    addPlay(playId) {
        this.plays.push({ playId, triggeredAt: new Date().toISOString(), status: 'pending' });
        return this;
    }
}

class RetentionManager {
    constructor() {
        this.clients = new Map();
    }

    addClient(config) {
        const client = new RetentionClient(config);
        this.clients.set(client.id, client);
        return client;
    }

    getClient(id) { return this.clients.get(id); }
    getAllClients() { return Array.from(this.clients.values()); }

    getAtRiskClients() {
        return this.getAllClients().filter(c => c.churnRisk >= 25).sort((a, b) => b.churnRisk - a.churnRisk);
    }

    getMetrics() {
        const clients = this.getAllClients();
        const atRisk = clients.filter(c => c.churnRisk >= 50);
        return {
            totalClients: clients.length,
            atRiskCount: atRisk.length,
            atRiskMRR: atRisk.reduce((sum, c) => sum + c.mrr, 0),
            avgNPS: clients.length > 0 ? Math.round(clients.reduce((sum, c) => sum + c.npsScore, 0) / clients.length * 10) / 10 : 0,
            avgUsage: clients.length > 0 ? Math.round(clients.reduce((sum, c) => sum + c.usageRate, 0) / clients.length) : 0,
            totalLTV: clients.reduce((sum, c) => sum + c.ltv, 0)
        };
    }
}

function createDemoRetention(manager) {
    manager.addClient({ name: 'ABC Corp', company: 'ABC', mrr: 15000000, npsScore: 9, usageRate: 85 });
    manager.addClient({ name: 'XYZ Shop', company: 'XYZ', mrr: 8000000, npsScore: 7, usageRate: 60 });
    manager.addClient({ name: 'At-Risk Co', company: 'Risk', mrr: 12000000, npsScore: 5, usageRate: 15 });
    manager.addClient({ name: 'Tech Startup', company: 'Tech', mrr: 5000000, npsScore: 8, usageRate: 75 });
    return manager.getAllClients();
}

const retentionManager = new RetentionManager();
if (typeof module !== 'undefined') module.exports = { RetentionManager, RetentionClient, RetentionPlays, ChurnSignals, retentionManager, createDemoRetention };

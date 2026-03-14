/**
 * ==============================================
 * MEKONG AGENCY - PROPOSALS
 * AgencyOS Proposal to Close Workflow
 * ==============================================
 */

const ProposalTemplates = {
    website: { id: 'website', name: 'Website Development', basePrice: 30000000, items: ['Design', 'Development', 'Testing', 'Launch'] },
    marketing: { id: 'marketing', name: 'Digital Marketing', basePrice: 15000000, items: ['Strategy', 'Content', 'Ads', 'Analytics'] },
    branding: { id: 'branding', name: 'Brand Identity', basePrice: 25000000, items: ['Logo', 'Guidelines', 'Collateral', 'Assets'] },
    seo: { id: 'seo', name: 'SEO Campaign', basePrice: 10000000, items: ['Audit', 'On-page', 'Off-page', 'Reporting'] }
};

class Proposal {
    constructor(config) {
        this.id = config.id || `prop-${Date.now()}`;
        this.clientName = config.clientName;
        this.clientEmail = config.clientEmail;
        this.template = config.template || 'website';
        this.items = config.items || ProposalTemplates[this.template]?.items || [];
        this.basePrice = ProposalTemplates[this.template]?.basePrice || 0;
        this.discount = config.discount || 0;
        this.finalPrice = this.basePrice * (1 - this.discount / 100);
        this.status = 'draft'; // draft, sent, viewed, accepted, rejected
        this.validUntil = this.calculateValidDate();
        this.createdAt = new Date().toISOString();
        this.sentAt = null;
        this.viewedAt = null;
        this.decidedAt = null;
    }

    calculateValidDate() {
        const d = new Date();
        d.setDate(d.getDate() + 14);
        return d.toISOString();
    }

    send() {
        this.status = 'sent';
        this.sentAt = new Date().toISOString();
        return this;
    }

    markViewed() {
        if (!this.viewedAt) this.viewedAt = new Date().toISOString();
        this.status = 'viewed';
        return this;
    }

    accept() {
        this.status = 'accepted';
        this.decidedAt = new Date().toISOString();
        return this;
    }

    reject(reason) {
        this.status = 'rejected';
        this.rejectReason = reason;
        this.decidedAt = new Date().toISOString();
        return this;
    }

    isExpired() {
        return new Date() > new Date(this.validUntil) && !['accepted', 'rejected'].includes(this.status);
    }
}

class ProposalManager {
    constructor() {
        this.proposals = new Map();
    }

    create(config) {
        const proposal = new Proposal(config);
        this.proposals.set(proposal.id, proposal);
        return proposal;
    }

    get(id) { return this.proposals.get(id); }
    getAll() { return Array.from(this.proposals.values()); }

    getMetrics() {
        const all = this.getAll();
        const decided = all.filter(p => ['accepted', 'rejected'].includes(p.status));
        return {
            total: all.length,
            sent: all.filter(p => p.status === 'sent').length,
            accepted: all.filter(p => p.status === 'accepted').length,
            rejected: all.filter(p => p.status === 'rejected').length,
            winRate: decided.length > 0 ? Math.round((all.filter(p => p.status === 'accepted').length / decided.length) * 100) : 0,
            totalValue: all.filter(p => p.status === 'accepted').reduce((sum, p) => sum + p.finalPrice, 0)
        };
    }
}

function createDemoProposals(manager) {
    const p1 = manager.create({ clientName: 'ABC Corp', clientEmail: 'abc@email.com', template: 'website', discount: 10 });
    p1.send(); p1.markViewed(); p1.accept();

    const p2 = manager.create({ clientName: 'XYZ Shop', clientEmail: 'xyz@email.com', template: 'marketing' });
    p2.send(); p2.markViewed();

    manager.create({ clientName: 'Tech Co', clientEmail: 'tech@email.com', template: 'branding' });
    return manager.getAll();
}

const proposalManager = new ProposalManager();
if (typeof module !== 'undefined') module.exports = { ProposalManager, Proposal, ProposalTemplates, proposalManager, createDemoProposals };

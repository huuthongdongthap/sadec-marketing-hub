/**
 * ==============================================
 * MEKONG AGENCY - LEGAL CONTRACTS
 * AgencyOS Legal Contracts Workflow
 * ==============================================
 */

const ContractTypes = {
    service: { id: 'service', name: 'Service Agreement', duration: 12, autoRenew: true },
    nda: { id: 'nda', name: 'NDA', duration: 24, autoRenew: false },
    employment: { id: 'employment', name: 'Employment Contract', duration: 0, autoRenew: false },
    partnership: { id: 'partnership', name: 'Partnership Agreement', duration: 12, autoRenew: true }
};

const ContractStatus = {
    draft: { id: 'draft', name: 'Draft', color: '#6b7280' },
    review: { id: 'review', name: 'In Review', color: '#f59e0b' },
    pending: { id: 'pending', name: 'Pending Signature', color: '#3b82f6' },
    active: { id: 'active', name: 'Active', color: '#10b981' },
    expired: { id: 'expired', name: 'Expired', color: '#ef4444' },
    terminated: { id: 'terminated', name: 'Terminated', color: '#991b1b' }
};

class Contract {
    constructor(config) {
        this.id = config.id || `contract-${Date.now()}`;
        this.type = config.type || 'service';
        this.title = config.title;
        this.party = config.party;
        this.value = config.value || 0;
        this.status = 'draft';
        this.startDate = config.startDate || null;
        this.endDate = config.endDate || null;
        this.autoRenew = ContractTypes[config.type]?.autoRenew || false;
        this.signatures = [];
        this.amendments = [];
        this.createdAt = new Date().toISOString();
    }

    sendForReview() {
        this.status = 'review';
        return this;
    }

    sendForSignature() {
        this.status = 'pending';
        return this;
    }

    sign(party) {
        this.signatures.push({ party, signedAt: new Date().toISOString() });
        if (this.signatures.length >= 2) {
            this.status = 'active';
            this.startDate = new Date().toISOString();
            const duration = ContractTypes[this.type]?.duration || 12;
            if (duration > 0) {
                const end = new Date();
                end.setMonth(end.getMonth() + duration);
                this.endDate = end.toISOString();
            }
        }
        return this;
    }

    terminate(reason) {
        this.status = 'terminated';
        this.terminatedAt = new Date().toISOString();
        this.terminationReason = reason;
        return this;
    }

    isExpiringSoon() {
        if (!this.endDate) return false;
        const daysUntilExpiry = Math.ceil((new Date(this.endDate) - new Date()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    }

    addAmendment(amendment) {
        this.amendments.push({
            id: `amend-${Date.now()}`,
            text: amendment,
            addedAt: new Date().toISOString()
        });
        return this;
    }
}

class LegalManager {
    constructor() {
        this.contracts = new Map();
    }

    createContract(config) {
        const contract = new Contract(config);
        this.contracts.set(contract.id, contract);
        return contract;
    }

    getContract(id) { return this.contracts.get(id); }
    getAllContracts() { return Array.from(this.contracts.values()); }

    getContractsByStatus(status) {
        return this.getAllContracts().filter(c => c.status === status);
    }

    getExpiringContracts() {
        return this.getAllContracts().filter(c => c.isExpiringSoon());
    }

    getMetrics() {
        const contracts = this.getAllContracts();
        return {
            total: contracts.length,
            active: contracts.filter(c => c.status === 'active').length,
            pending: contracts.filter(c => c.status === 'pending').length,
            expiringSoon: contracts.filter(c => c.isExpiringSoon()).length,
            totalValue: contracts.filter(c => c.status === 'active').reduce((sum, c) => sum + c.value, 0)
        };
    }
}

function createDemoLegal(manager) {
    const c1 = manager.createContract({ type: 'service', title: 'Marketing Services Agreement', party: 'ABC Corp', value: 120000000 });
    c1.sendForReview(); c1.sendForSignature(); c1.sign('ABC Corp'); c1.sign('Mekong Agency');

    const c2 = manager.createContract({ type: 'nda', title: 'Confidentiality Agreement', party: 'Tech Startup', value: 0 });
    c2.sendForSignature();

    manager.createContract({ type: 'partnership', title: 'Strategic Partnership', party: 'Partner Co', value: 50000000 });

    return manager.getAllContracts();
}

const legalManager = new LegalManager();
if (typeof module !== 'undefined') module.exports = { LegalManager, Contract, ContractTypes, ContractStatus, legalManager, createDemoLegal };

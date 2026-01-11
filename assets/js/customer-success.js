/**
 * ==============================================
 * MEKONG AGENCY - CUSTOMER SUCCESS SYSTEM
 * AgencyOS Customer Success Workflow (27/27)
 * ==============================================
 */

// ===== EVENT BUS =====
class CSEventBus {
    constructor() { this.listeners = new Map(); }
    on(event, cb) {
        if (!this.listeners.has(event)) this.listeners.set(event, []);
        this.listeners.get(event).push(cb);
    }
    emit(event, data) {
        if (this.listeners.has(event)) this.listeners.get(event).forEach(cb => cb(data));
    }
}

const csBus = new CSEventBus();

// ===== HEALTH FACTORS =====
const HealthFactors = {
    usage: { id: 'usage', name: 'Usage', weight: 30, icon: 'trending_up' },
    engagement: { id: 'engagement', name: 'Engagement', weight: 20, icon: 'groups' },
    support: { id: 'support', name: 'Support', weight: 15, icon: 'support_agent' },
    nps: { id: 'nps', name: 'NPS', weight: 15, icon: 'sentiment_satisfied' },
    billing: { id: 'billing', name: 'Billing', weight: 20, icon: 'payments' }
};

// ===== PLAYBOOKS =====
const Playbooks = {
    green: {
        id: 'green',
        name: 'Green',
        color: '#10b981',
        minScore: 80,
        maxScore: 100,
        action: 'expansion',
        tasks: ['Upsell opportunity call', 'Case study request', 'Referral ask']
    },
    yellow: {
        id: 'yellow',
        name: 'Yellow',
        color: '#f59e0b',
        minScore: 50,
        maxScore: 79,
        action: 'checkin',
        tasks: ['Check-in call', 'Value review meeting', 'Feature training']
    },
    red: {
        id: 'red',
        name: 'Red',
        color: '#ef4444',
        minScore: 0,
        maxScore: 49,
        action: 'save',
        tasks: ['Emergency call', 'Executive escalation', 'Rescue plan']
    }
};

// ===== CUSTOMER =====
class Customer {
    constructor(config) {
        this.id = config.id || `customer-${Date.now()}`;
        this.name = config.name;
        this.company = config.company || '';
        this.email = config.email;
        this.plan = config.plan || 'standard';
        this.mrr = config.mrr || 0;
        this.startDate = config.startDate || new Date().toISOString();
        this.csm = config.csm || 'Unassigned';

        // Health scores
        this.scores = {
            usage: config.usage ?? 70,
            engagement: config.engagement ?? 70,
            support: config.support ?? 80,
            nps: config.nps ?? 70,
            billing: config.billing ?? 90
        };

        this.healthScore = 0;
        this.status = 'green';
        this.activities = [];
        this.calculateHealth();
    }

    calculateHealth() {
        let total = 0;
        for (const [factor, data] of Object.entries(HealthFactors)) {
            total += (this.scores[factor] || 0) * (data.weight / 100);
        }
        this.healthScore = Math.round(total);

        // Determine status
        if (this.healthScore >= 80) this.status = 'green';
        else if (this.healthScore >= 50) this.status = 'yellow';
        else this.status = 'red';

        return this;
    }

    updateScore(factor, value) {
        if (factor in this.scores) {
            this.scores[factor] = Math.max(0, Math.min(100, value));
            this.calculateHealth();

            this.activities.push({
                type: 'score_update',
                factor,
                value,
                timestamp: new Date().toISOString()
            });

            csBus.emit('customer:score-updated', { customer: this, factor, value });
        }
        return this;
    }

    getPlaybook() {
        return Playbooks[this.status];
    }

    getChurnRisk() {
        if (this.status === 'red') return 'High';
        if (this.status === 'yellow') return 'Medium';
        return 'Low';
    }

    getExpansionPotential() {
        if (this.healthScore >= 85 && this.scores.engagement >= 80) return 'High';
        if (this.healthScore >= 70) return 'Medium';
        return 'Low';
    }
}

// ===== CS MANAGER =====
class CustomerSuccessManager {
    constructor() {
        this.customers = new Map();
        this.actionQueue = [];
    }

    // ===== CUSTOMER MANAGEMENT =====
    addCustomer(config) {
        const customer = new Customer(config);
        this.customers.set(customer.id, customer);
        csBus.emit('customer:added', { customer });
        return customer;
    }

    getCustomer(id) {
        return this.customers.get(id);
    }

    getAllCustomers() {
        return Array.from(this.customers.values());
    }

    getCustomersByStatus(status) {
        return this.getAllCustomers().filter(c => c.status === status);
    }

    // ===== HEALTH CHECK =====
    runHealthCheck() {
        const customers = this.getAllCustomers();
        customers.forEach(c => c.calculateHealth());

        const report = this.generateHealthReport();
        csBus.emit('health:check-complete', report);
        return report;
    }

    generateHealthReport() {
        const customers = this.getAllCustomers();
        const total = customers.length;

        if (total === 0) {
            return { green: 0, yellow: 0, red: 0, nrr: 100, avgHealth: 0, total: 0 };
        }

        const greenCount = customers.filter(c => c.status === 'green').length;
        const yellowCount = customers.filter(c => c.status === 'yellow').length;
        const redCount = customers.filter(c => c.status === 'red').length;

        const avgHealth = Math.round(customers.reduce((sum, c) => sum + c.healthScore, 0) / total);
        const totalMRR = customers.reduce((sum, c) => sum + c.mrr, 0);

        // NRR calculation (simulated expansion for green, churn risk for red)
        const greenMRR = customers.filter(c => c.status === 'green').reduce((sum, c) => sum + c.mrr, 0);
        const redMRR = customers.filter(c => c.status === 'red').reduce((sum, c) => sum + c.mrr, 0);
        const expansionRate = 0.15; // 15% expansion from green customers
        const churnRate = 0.30; // 30% churn risk from red customers

        const projectedMRR = totalMRR + (greenMRR * expansionRate) - (redMRR * churnRate);
        const nrr = Math.round((projectedMRR / totalMRR) * 100);

        return {
            total,
            green: Math.round((greenCount / total) * 100),
            yellow: Math.round((yellowCount / total) * 100),
            red: Math.round((redCount / total) * 100),
            greenCount,
            yellowCount,
            redCount,
            avgHealth,
            totalMRR,
            nrr,
            grossRetention: 100 - (redCount / total * 5) // Simplified
        };
    }

    // ===== ACTIONS =====
    generateActions() {
        this.actionQueue = [];

        this.getAllCustomers().forEach(customer => {
            const playbook = customer.getPlaybook();
            playbook.tasks.forEach((task, index) => {
                this.actionQueue.push({
                    id: `action-${customer.id}-${index}`,
                    customerId: customer.id,
                    customerName: customer.name,
                    status: customer.status,
                    priority: customer.status === 'red' ? 'high' : customer.status === 'yellow' ? 'medium' : 'low',
                    task,
                    playbook: playbook.id,
                    createdAt: new Date().toISOString(),
                    completed: false
                });
            });
        });

        // Sort by priority
        this.actionQueue.sort((a, b) => {
            const priority = { high: 0, medium: 1, low: 2 };
            return priority[a.priority] - priority[b.priority];
        });

        return this.actionQueue;
    }

    completeAction(actionId) {
        const action = this.actionQueue.find(a => a.id === actionId);
        if (action) {
            action.completed = true;
            action.completedAt = new Date().toISOString();
            csBus.emit('action:completed', { action });
        }
        return action;
    }

    getPendingActions() {
        return this.actionQueue.filter(a => !a.completed);
    }

    // ===== METRICS =====
    getMetrics() {
        const report = this.generateHealthReport();
        const actions = this.getPendingActions();

        return {
            ...report,
            pendingActions: actions.length,
            highPriority: actions.filter(a => a.priority === 'high').length
        };
    }
}

// ===== DEMO DATA =====
function createDemoCustomers(manager) {
    const customers = [
        { name: 'Công ty ABC', company: 'ABC Corp', email: 'abc@email.com', plan: 'premium', mrr: 15000000, usage: 90, engagement: 85, support: 95, nps: 90, billing: 100 },
        { name: 'Cửa hàng XYZ', company: 'XYZ Shop', email: 'xyz@email.com', plan: 'standard', mrr: 5000000, usage: 85, engagement: 80, support: 90, nps: 85, billing: 100 },
        { name: 'Nhà hàng 123', company: '123 Restaurant', email: '123@email.com', plan: 'standard', mrr: 3000000, usage: 70, engagement: 65, support: 80, nps: 70, billing: 95 },
        { name: 'Spa Beauty', company: 'Beauty Spa', email: 'beauty@email.com', plan: 'basic', mrr: 2000000, usage: 60, engagement: 55, support: 70, nps: 60, billing: 90 },
        { name: 'Tech Solutions', company: 'Tech Co', email: 'tech@email.com', plan: 'premium', mrr: 20000000, usage: 95, engagement: 90, support: 85, nps: 95, billing: 100 },
        { name: 'Local Cafe', company: 'Cafe Corner', email: 'cafe@email.com', plan: 'basic', mrr: 1500000, usage: 40, engagement: 35, support: 50, nps: 40, billing: 80 },
        { name: 'Fashion Store', company: 'Style Hub', email: 'style@email.com', plan: 'standard', mrr: 7000000, usage: 75, engagement: 70, support: 85, nps: 75, billing: 95 }
    ];

    customers.forEach(c => manager.addCustomer(c));
    manager.generateActions();

    return manager.getAllCustomers();
}

// ===== FORMATTERS =====
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// ===== GLOBAL INSTANCE =====
const csManager = new CustomerSuccessManager();

// ===== EXPORTS =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CustomerSuccessManager,
        Customer,
        HealthFactors,
        Playbooks,
        csManager,
        csBus,
        createDemoCustomers,
        formatCurrency
    };
}

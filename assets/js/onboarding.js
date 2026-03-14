/**
 * ==============================================
 * MEKONG AGENCY - CLIENT ONBOARDING
 * AgencyOS Client Onboarding Workflow
 * ==============================================
 */

const OnboardingSteps = [
    { id: 'welcome', name: 'Welcome Call', duration: 1, required: true },
    { id: 'discovery', name: 'Discovery Session', duration: 2, required: true },
    { id: 'access', name: 'Access Setup', duration: 1, required: true },
    { id: 'kickoff', name: 'Project Kickoff', duration: 1, required: true },
    { id: 'training', name: 'Client Training', duration: 2, required: false },
    { id: 'handoff', name: 'Team Handoff', duration: 1, required: true }
];

class OnboardingClient {
    constructor(config) {
        this.id = config.id || `client-${Date.now()}`;
        this.name = config.name;
        this.company = config.company;
        this.email = config.email;
        this.projectType = config.projectType || 'standard';
        this.value = config.value || 0;
        this.currentStep = 0;
        this.steps = OnboardingSteps.map(s => ({ ...s, status: 'pending', completedAt: null }));
        this.startDate = new Date().toISOString();
        this.targetDate = this.calculateTargetDate();
        this.notes = [];
    }

    calculateTargetDate() {
        const days = OnboardingSteps.reduce((sum, s) => sum + s.duration, 0);
        const target = new Date();
        target.setDate(target.getDate() + days);
        return target.toISOString();
    }

    completeStep(stepId) {
        const step = this.steps.find(s => s.id === stepId);
        if (step) {
            step.status = 'completed';
            step.completedAt = new Date().toISOString();
            this.currentStep = this.steps.filter(s => s.status === 'completed').length;
        }
        return this;
    }

    getProgress() {
        const completed = this.steps.filter(s => s.status === 'completed').length;
        return Math.round((completed / this.steps.length) * 100);
    }

    isComplete() {
        return this.steps.filter(s => s.required).every(s => s.status === 'completed');
    }
}

class OnboardingManager {
    constructor() {
        this.clients = new Map();
    }

    addClient(config) {
        const client = new OnboardingClient(config);
        this.clients.set(client.id, client);
        return client;
    }

    getClient(id) { return this.clients.get(id); }
    getAllClients() { return Array.from(this.clients.values()); }

    getMetrics() {
        const clients = this.getAllClients();
        return {
            total: clients.length,
            inProgress: clients.filter(c => !c.isComplete()).length,
            completed: clients.filter(c => c.isComplete()).length,
            avgProgress: clients.length > 0 ? Math.round(clients.reduce((sum, c) => sum + c.getProgress(), 0) / clients.length) : 0
        };
    }
}

function createDemoOnboarding(manager) {
    const c1 = manager.addClient({ name: 'Nguyễn Văn A', company: 'ABC Corp', email: 'a@abc.com', value: 50000000 });
    c1.completeStep('welcome'); c1.completeStep('discovery'); c1.completeStep('access');

    const c2 = manager.addClient({ name: 'Trần Thị B', company: 'XYZ Shop', email: 'b@xyz.com', value: 20000000 });
    c2.completeStep('welcome');

    manager.addClient({ name: 'Lê Văn C', company: 'Tech Co', email: 'c@tech.com', value: 35000000 });
    return manager.getAllClients();
}

const onboardingManager = new OnboardingManager();
if (typeof module !== 'undefined') module.exports = { OnboardingManager, OnboardingClient, OnboardingSteps, onboardingManager, createDemoOnboarding };

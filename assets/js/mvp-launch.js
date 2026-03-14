/**
 * ==============================================
 * MEKONG AGENCY - MVP LAUNCH
 * AgencyOS MVP Launch Workflow
 * ==============================================
 */

const LaunchPhases = [
    { id: 'planning', name: 'Planning', duration: 7, tasks: ['Define MVP scope', 'Set success metrics', 'Create timeline'] },
    { id: 'development', name: 'Development', duration: 21, tasks: ['Build core features', 'Internal testing', 'Bug fixes'] },
    { id: 'beta', name: 'Beta', duration: 14, tasks: ['Beta user recruitment', 'Feedback collection', 'Iteration'] },
    { id: 'launch', name: 'Launch', duration: 7, tasks: ['Marketing prep', 'Launch day', 'Post-launch monitoring'] }
];

const FeatureFlags = {
    core: { id: 'core', name: 'Core Features', priority: 'must-have', status: 'enabled' },
    analytics: { id: 'analytics', name: 'Analytics', priority: 'should-have', status: 'enabled' },
    integrations: { id: 'integrations', name: 'Integrations', priority: 'nice-to-have', status: 'disabled' },
    advanced: { id: 'advanced', name: 'Advanced Features', priority: 'future', status: 'disabled' }
};

class MVPProject {
    constructor(config) {
        this.id = config.id || `mvp-${Date.now()}`;
        this.name = config.name;
        this.description = config.description || '';
        this.currentPhase = 0;
        this.phases = LaunchPhases.map(p => ({ ...p, status: 'pending', startedAt: null, completedAt: null }));
        this.features = { ...FeatureFlags };
        this.metrics = { signups: 0, activeUsers: 0, revenue: 0, nps: 0 };
        this.feedback = [];
        this.startDate = new Date().toISOString();
        this.launchDate = null;
    }

    startPhase(phaseIndex) {
        if (this.phases[phaseIndex]) {
            this.phases[phaseIndex].status = 'in-progress';
            this.phases[phaseIndex].startedAt = new Date().toISOString();
            this.currentPhase = phaseIndex;
        }
        return this;
    }

    completePhase(phaseIndex) {
        if (this.phases[phaseIndex]) {
            this.phases[phaseIndex].status = 'completed';
            this.phases[phaseIndex].completedAt = new Date().toISOString();
            if (phaseIndex === this.phases.length - 1) {
                this.launchDate = new Date().toISOString();
            }
        }
        return this;
    }

    toggleFeature(featureId, enabled) {
        if (this.features[featureId]) {
            this.features[featureId].status = enabled ? 'enabled' : 'disabled';
        }
        return this;
    }

    addFeedback(feedback) {
        this.feedback.push({
            id: `fb-${Date.now()}`,
            text: feedback.text,
            rating: feedback.rating || 0,
            user: feedback.user || 'Anonymous',
            createdAt: new Date().toISOString()
        });
        return this;
    }

    updateMetrics(metrics) {
        Object.assign(this.metrics, metrics);
        return this;
    }

    getProgress() {
        const completed = this.phases.filter(p => p.status === 'completed').length;
        return Math.round((completed / this.phases.length) * 100);
    }

    getPhaseStatus() {
        return this.phases[this.currentPhase]?.name || 'Not Started';
    }

    isLaunched() {
        return this.launchDate !== null;
    }
}

class MVPManager {
    constructor() {
        this.projects = new Map();
    }

    createProject(config) {
        const project = new MVPProject(config);
        this.projects.set(project.id, project);
        return project;
    }

    getProject(id) { return this.projects.get(id); }
    getAllProjects() { return Array.from(this.projects.values()); }

    getMetrics() {
        const projects = this.getAllProjects();
        return {
            totalProjects: projects.length,
            launched: projects.filter(p => p.isLaunched()).length,
            inProgress: projects.filter(p => !p.isLaunched()).length,
            avgProgress: projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + p.getProgress(), 0) / projects.length) : 0
        };
    }
}

function createDemoMVP(manager) {
    const project = manager.createProject({ name: 'Mekong SaaS Platform', description: 'All-in-one agency management platform' });
    project.startPhase(0);
    project.completePhase(0);
    project.startPhase(1);
    project.completePhase(1);
    project.startPhase(2);
    project.updateMetrics({ signups: 50, activeUsers: 35, revenue: 5000000, nps: 45 });
    project.addFeedback({ text: 'Love the dashboard!', rating: 5, user: 'Beta User 1' });
    project.addFeedback({ text: 'Need more integrations', rating: 4, user: 'Beta User 2' });
    return project;
}

const mvpManager = new MVPManager();
if (typeof module !== 'undefined') module.exports = { MVPManager, MVPProject, LaunchPhases, FeatureFlags, mvpManager, createDemoMVP };

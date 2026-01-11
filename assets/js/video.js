/**
 * ==============================================
 * MEKONG AGENCY - VIDEO WORKFLOW
 * AgencyOS Video Workflow
 * ==============================================
 */

const VideoStages = [
    { id: 'concept', name: 'Concept', duration: 1 },
    { id: 'script', name: 'Script', duration: 2 },
    { id: 'storyboard', name: 'Storyboard', duration: 2 },
    { id: 'production', name: 'Production', duration: 3 },
    { id: 'editing', name: 'Editing', duration: 3 },
    { id: 'review', name: 'Review', duration: 1 },
    { id: 'publish', name: 'Published', duration: 0 }
];

const VideoTypes = {
    promo: { id: 'promo', name: 'Promotional', duration: '30-60s' },
    tutorial: { id: 'tutorial', name: 'Tutorial', duration: '5-10min' },
    testimonial: { id: 'testimonial', name: 'Testimonial', duration: '2-3min' },
    social: { id: 'social', name: 'Social Media', duration: '15-30s' }
};

class VideoProject {
    constructor(config) {
        this.id = config.id || `video-${Date.now()}`;
        this.title = config.title;
        this.type = config.type || 'promo';
        this.client = config.client || 'Internal';
        this.currentStage = 0;
        this.stages = VideoStages.map(s => ({ ...s, status: 'pending', completedAt: null }));
        this.script = config.script || '';
        this.duration = config.duration || 60;
        this.platforms = config.platforms || ['youtube'];
        this.assets = [];
        this.feedback = [];
        this.createdAt = new Date().toISOString();
        this.publishedAt = null;
    }

    advanceStage() {
        if (this.currentStage < this.stages.length - 1) {
            this.stages[this.currentStage].status = 'completed';
            this.stages[this.currentStage].completedAt = new Date().toISOString();
            this.currentStage++;
            this.stages[this.currentStage].status = 'in-progress';

            if (this.currentStage === this.stages.length - 1) {
                this.publishedAt = new Date().toISOString();
            }
        }
        return this;
    }

    addAsset(asset) {
        this.assets.push({
            id: `asset-${Date.now()}`,
            name: asset.name,
            type: asset.type,
            url: asset.url || '',
            addedAt: new Date().toISOString()
        });
        return this;
    }

    addFeedback(feedback) {
        this.feedback.push({
            id: `fb-${Date.now()}`,
            text: feedback.text,
            from: feedback.from || 'Client',
            timestamp: feedback.timestamp || '',
            resolved: false,
            addedAt: new Date().toISOString()
        });
        return this;
    }

    getProgress() {
        const completed = this.stages.filter(s => s.status === 'completed').length;
        return Math.round((completed / (this.stages.length - 1)) * 100);
    }

    getCurrentStageName() {
        return this.stages[this.currentStage]?.name || 'Not Started';
    }

    isPublished() {
        return this.publishedAt !== null;
    }
}

class VideoManager {
    constructor() {
        this.projects = new Map();
    }

    createProject(config) {
        const project = new VideoProject(config);
        this.projects.set(project.id, project);
        return project;
    }

    getProject(id) { return this.projects.get(id); }
    getAllProjects() { return Array.from(this.projects.values()); }

    getByStage(stageIndex) {
        return this.getAllProjects().filter(p => p.currentStage === stageIndex);
    }

    getMetrics() {
        const projects = this.getAllProjects();
        return {
            total: projects.length,
            inProduction: projects.filter(p => !p.isPublished()).length,
            published: projects.filter(p => p.isPublished()).length,
            avgProgress: projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + p.getProgress(), 0) / projects.length) : 0
        };
    }
}

function createDemoVideo(manager) {
    const v1 = manager.createProject({ title: 'Agency Promo Video', type: 'promo', client: 'Internal', duration: 60 });
    v1.advanceStage(); v1.advanceStage(); v1.advanceStage(); // At production stage

    const v2 = manager.createProject({ title: 'Client Testimonial', type: 'testimonial', client: 'ABC Corp', duration: 180 });
    v2.advanceStage(); v2.advanceStage(); v2.advanceStage(); v2.advanceStage(); v2.advanceStage(); v2.advanceStage(); // Published

    const v3 = manager.createProject({ title: 'Product Tutorial', type: 'tutorial', client: 'XYZ Shop', duration: 300 });
    v3.advanceStage(); // Script stage

    return manager.getAllProjects();
}

const videoManager = new VideoManager();
if (typeof module !== 'undefined') module.exports = { VideoManager, VideoProject, VideoStages, VideoTypes, videoManager, createDemoVideo };

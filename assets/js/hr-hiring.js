/**
 * ==============================================
 * MEKONG AGENCY - HR HIRING
 * AgencyOS HR Hiring Workflow
 * ==============================================
 */

const HiringStages = [
    { id: 'applied', name: 'Applied', color: '#6b7280' },
    { id: 'screening', name: 'Screening', color: '#3b82f6' },
    { id: 'interview', name: 'Interview', color: '#8b5cf6' },
    { id: 'assessment', name: 'Assessment', color: '#f59e0b' },
    { id: 'offer', name: 'Offer', color: '#10b981' },
    { id: 'hired', name: 'Hired', color: '#059669' },
    { id: 'rejected', name: 'Rejected', color: '#ef4444' }
];

const JobPositions = {
    developer: { id: 'developer', name: 'Developer', department: 'Tech', salaryRange: [15000000, 35000000] },
    designer: { id: 'designer', name: 'Designer', department: 'Creative', salaryRange: [12000000, 28000000] },
    marketer: { id: 'marketer', name: 'Marketer', department: 'Marketing', salaryRange: [10000000, 25000000] },
    pm: { id: 'pm', name: 'Project Manager', department: 'Operations', salaryRange: [18000000, 40000000] }
};

class Candidate {
    constructor(config) {
        this.id = config.id || `cand-${Date.now()}`;
        this.name = config.name;
        this.email = config.email;
        this.phone = config.phone || '';
        this.position = config.position;
        this.stage = 'applied';
        this.score = 0;
        this.notes = [];
        this.interviews = [];
        this.appliedAt = new Date().toISOString();
        this.source = config.source || 'Direct';
    }

    moveStage(stageId) {
        this.stage = stageId;
        return this;
    }

    addScore(category, points) {
        this.score += points;
        this.notes.push({ type: 'score', category, points, date: new Date().toISOString() });
        return this;
    }

    scheduleInterview(config) {
        this.interviews.push({
            id: `int-${Date.now()}`,
            type: config.type || 'phone',
            date: config.date,
            interviewer: config.interviewer,
            status: 'scheduled'
        });
        return this;
    }

    addNote(note) {
        this.notes.push({ type: 'note', text: note, date: new Date().toISOString() });
        return this;
    }
}

class HRManager {
    constructor() {
        this.candidates = new Map();
        this.jobs = new Map();
    }

    addCandidate(config) {
        const candidate = new Candidate(config);
        this.candidates.set(candidate.id, candidate);
        return candidate;
    }

    getCandidate(id) { return this.candidates.get(id); }
    getAllCandidates() { return Array.from(this.candidates.values()); }

    getCandidatesByStage(stageId) {
        return this.getAllCandidates().filter(c => c.stage === stageId);
    }

    getCandidatesByPosition(positionId) {
        return this.getAllCandidates().filter(c => c.position === positionId);
    }

    getMetrics() {
        const candidates = this.getAllCandidates();
        const hired = candidates.filter(c => c.stage === 'hired').length;
        const rejected = candidates.filter(c => c.stage === 'rejected').length;

        return {
            totalCandidates: candidates.length,
            inPipeline: candidates.filter(c => !['hired', 'rejected'].includes(c.stage)).length,
            hired,
            rejected,
            hiringRate: (hired + rejected) > 0 ? Math.round((hired / (hired + rejected)) * 100) : 0,
            avgTimeToHire: 14 // days (simulated)
        };
    }

    getPipelineByPosition() {
        const result = {};
        Object.keys(JobPositions).forEach(pos => {
            result[pos] = this.getCandidatesByPosition(pos).length;
        });
        return result;
    }
}

function createDemoHR(manager) {
    const c1 = manager.addCandidate({ name: 'Nguyễn Văn A', email: 'a@email.com', position: 'developer', source: 'LinkedIn' });
    c1.moveStage('interview'); c1.addScore('technical', 85); c1.addScore('culture', 80);

    const c2 = manager.addCandidate({ name: 'Trần Thị B', email: 'b@email.com', position: 'designer', source: 'Referral' });
    c2.moveStage('assessment'); c2.addScore('portfolio', 90);

    const c3 = manager.addCandidate({ name: 'Lê Văn C', email: 'c@email.com', position: 'marketer', source: 'Indeed' });
    c3.moveStage('screening');

    const c4 = manager.addCandidate({ name: 'Phạm Thị D', email: 'd@email.com', position: 'developer', source: 'Direct' });
    c4.moveStage('hired'); c4.addScore('technical', 95); c4.addScore('culture', 88);

    return manager.getAllCandidates();
}

const hrManager = new HRManager();
if (typeof module !== 'undefined') module.exports = { HRManager, Candidate, HiringStages, JobPositions, hrManager, createDemoHR };

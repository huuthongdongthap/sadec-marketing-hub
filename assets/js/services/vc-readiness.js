/**
 * ==============================================
 * MEKONG AGENCY - VC READINESS
 * AgencyOS VC Readiness Workflow
 * ==============================================
 */

const VCMetrics = {
    arr: { id: 'arr', name: 'ARR', target: 1000000000, unit: 'VND', description: 'Annual Recurring Revenue' },
    mrr: { id: 'mrr', name: 'MRR', target: 85000000, unit: 'VND', description: 'Monthly Recurring Revenue' },
    growth: { id: 'growth', name: 'MoM Growth', target: 15, unit: '%', description: 'Month-over-Month Growth' },
    nrr: { id: 'nrr', name: 'Net Revenue Retention', target: 120, unit: '%', description: 'NRR' },
    ltv: { id: 'ltv', name: 'LTV:CAC Ratio', target: 3, unit: 'x', description: 'Lifetime Value to CAC' },
    runway: { id: 'runway', name: 'Runway', target: 18, unit: 'months', description: 'Months of runway' }
};

const ReadinessChecklist = [
    { id: 'financials', name: 'Clean Financials', category: 'Finance', required: true },
    { id: 'metrics', name: 'Key Metrics Dashboard', category: 'Finance', required: true },
    { id: 'pitch', name: 'Pitch Deck', category: 'Materials', required: true },
    { id: 'dataroom', name: 'Data Room', category: 'Materials', required: true },
    { id: 'team', name: 'Team Bios', category: 'Team', required: true },
    { id: 'legal', name: 'Legal Documents', category: 'Legal', required: true },
    { id: 'cap_table', name: 'Cap Table', category: 'Legal', required: true },
    { id: 'references', name: 'Customer References', category: 'Social Proof', required: false }
];

class VCReadinessTracker {
    constructor() {
        this.metrics = {};
        this.checklist = ReadinessChecklist.map(item => ({ ...item, completed: false }));
        this.pitchDeck = null;
        this.investors = [];
    }

    updateMetric(metricId, value) {
        this.metrics[metricId] = { value, updatedAt: new Date().toISOString() };
        return this;
    }

    completeChecklistItem(itemId) {
        const item = this.checklist.find(i => i.id === itemId);
        if (item) item.completed = true;
        return this;
    }

    getReadinessScore() {
        const requiredItems = this.checklist.filter(i => i.required);
        const completedRequired = requiredItems.filter(i => i.completed).length;
        return Math.round((completedRequired / requiredItems.length) * 100);
    }

    getMetricScore(metricId) {
        const metric = VCMetrics[metricId];
        const current = this.metrics[metricId]?.value || 0;
        if (!metric) return 0;
        return Math.min(100, Math.round((current / metric.target) * 100));
    }

    getOverallScore() {
        const checklistScore = this.getReadinessScore();
        const metricScores = Object.keys(VCMetrics).map(k => this.getMetricScore(k));
        const avgMetricScore = metricScores.length > 0 ? metricScores.reduce((a, b) => a + b, 0) / metricScores.length : 0;
        return Math.round((checklistScore + avgMetricScore) / 2);
    }

    addInvestor(investor) {
        this.investors.push({
            id: `inv-${Date.now()}`,
            name: investor.name,
            firm: investor.firm,
            stage: investor.stage || 'identified', // identified, contacted, meeting, due_diligence, term_sheet
            addedAt: new Date().toISOString()
        });
        return this;
    }

    getSummary() {
        return {
            readinessScore: this.getOverallScore(),
            checklistProgress: this.getReadinessScore(),
            metricsTracked: Object.keys(this.metrics).length,
            investorsPipeline: this.investors.length,
            nextSteps: this.getNextSteps()
        };
    }

    getNextSteps() {
        const steps = [];
        const incomplete = this.checklist.filter(i => i.required && !i.completed);
        if (incomplete.length > 0) steps.push(`Complete: ${incomplete[0].name}`);
        const missingMetrics = Object.keys(VCMetrics).filter(k => !this.metrics[k]);
        if (missingMetrics.length > 0) steps.push(`Track: ${VCMetrics[missingMetrics[0]].name}`);
        return steps;
    }
}

function createDemoVCReadiness(tracker) {
    tracker.updateMetric('arr', 800000000);
    tracker.updateMetric('mrr', 70000000);
    tracker.updateMetric('growth', 12);
    tracker.updateMetric('nrr', 115);
    tracker.updateMetric('ltv', 2.5);
    tracker.updateMetric('runway', 14);

    tracker.completeChecklistItem('financials');
    tracker.completeChecklistItem('metrics');
    tracker.completeChecklistItem('pitch');
    tracker.completeChecklistItem('team');

    tracker.addInvestor({ name: 'Nguyen VC', firm: 'Vietnam Ventures', stage: 'meeting' });
    tracker.addInvestor({ name: 'SEA Capital', firm: 'SEA Partners', stage: 'contacted' });

    return tracker;
}

const vcTracker = new VCReadinessTracker();
if (typeof module !== 'undefined') module.exports = { VCReadinessTracker, VCMetrics, ReadinessChecklist, vcTracker, createDemoVCReadiness };

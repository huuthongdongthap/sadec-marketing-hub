/**
 * ==============================================
 * MEKONG AGENCY - HUMAN-IN-LOOP APPROVAL SYSTEM
 * AgencyOS Human-in-Loop Pattern Implementation
 * ==============================================
 */

// ===== APPROVAL EVENT BUS =====
class ApprovalEventBus {
    constructor() {
        this.listeners = new Map();
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => callback(data));
        }
    }
}

const approvalBus = new ApprovalEventBus();

// ===== APPROVAL RULES =====
const approvalRules = [
    {
        id: 'proposal-rule',
        type: 'proposal',
        name: 'Proposal Approval',
        description: 'Proposals over 10M VND require manager approval',
        threshold: 10000000,
        currency: 'VND',
        approver: 'manager',
        approverName: 'Manager',
        autoApproveBelow: true
    },
    {
        id: 'contract-rule',
        type: 'contract',
        name: 'Contract Approval',
        description: 'All contracts require legal review',
        threshold: 0,
        approver: 'legal',
        approverName: 'Legal Team',
        autoApproveBelow: false
    },
    {
        id: 'expense-rule',
        type: 'expense',
        name: 'Expense Approval',
        description: 'Expenses over 500K VND require finance approval',
        threshold: 500000,
        currency: 'VND',
        approver: 'finance',
        approverName: 'Finance Team',
        autoApproveBelow: true
    },
    {
        id: 'content-rule',
        type: 'content',
        name: 'Content Approval',
        description: 'Published content requires editor review',
        threshold: 0,
        approver: 'editor',
        approverName: 'Editor',
        autoApproveBelow: false
    }
];

// ===== APPROVAL REQUEST =====
class ApprovalRequest {
    constructor(config) {
        this.id = config.id || `apr-${Date.now()}`;
        this.type = config.type;
        this.title = config.title;
        this.description = config.description || '';
        this.amount = config.amount || 0;
        this.data = config.data || {};
        this.requestedBy = config.requestedBy || 'System';
        this.requestedAt = new Date().toISOString();
        this.status = 'pending'; // pending, approved, rejected, expired
        this.approver = config.approver || null;
        this.approverName = config.approverName || null;
        this.decidedBy = null;
        this.decidedAt = null;
        this.decision = null;
        this.comments = '';
        this.workflowId = config.workflowId || null;
        this.executionId = config.executionId || null;
        this.onResume = config.onResume || null;
    }

    approve(decidedBy, comments = '') {
        this.status = 'approved';
        this.decision = 'approved';
        this.decidedBy = decidedBy;
        this.decidedAt = new Date().toISOString();
        this.comments = comments;

        approvalBus.emit('approval:approved', {
            request: this,
            timestamp: this.decidedAt
        });

        return this;
    }

    reject(decidedBy, comments = '') {
        this.status = 'rejected';
        this.decision = 'rejected';
        this.decidedBy = decidedBy;
        this.decidedAt = new Date().toISOString();
        this.comments = comments;

        approvalBus.emit('approval:rejected', {
            request: this,
            timestamp: this.decidedAt
        });

        return this;
    }

    toJSON() {
        return {
            id: this.id,
            type: this.type,
            title: this.title,
            description: this.description,
            amount: this.amount,
            status: this.status,
            requestedBy: this.requestedBy,
            requestedAt: this.requestedAt,
            approver: this.approver,
            approverName: this.approverName,
            decidedBy: this.decidedBy,
            decidedAt: this.decidedAt,
            decision: this.decision,
            comments: this.comments
        };
    }
}

// ===== APPROVAL MANAGER =====
class ApprovalManager {
    constructor() {
        this.pendingApprovals = new Map();
        this.approvalHistory = [];
        this.rules = approvalRules;
    }

    getRule(type) {
        return this.rules.find(r => r.type === type);
    }

    needsApproval(type, amount = 0) {
        const rule = this.getRule(type);
        if (!rule) return false;

        if (rule.autoApproveBelow && amount < rule.threshold) {
            return false;
        }

        return true;
    }

    createRequest(config) {
        const rule = this.getRule(config.type);

        const request = new ApprovalRequest({
            ...config,
            approver: rule?.approver || 'admin',
            approverName: rule?.approverName || 'Admin'
        });

        this.pendingApprovals.set(request.id, request);

        approvalBus.emit('approval:requested', {
            request,
            rule,
            timestamp: request.requestedAt
        });

        return request;
    }

    getRequest(id) {
        return this.pendingApprovals.get(id);
    }

    getPendingApprovals(approverRole = null) {
        const approvals = Array.from(this.pendingApprovals.values())
            .filter(a => a.status === 'pending');

        if (approverRole) {
            return approvals.filter(a => a.approver === approverRole);
        }

        return approvals;
    }

    async approve(requestId, decidedBy, comments = '') {
        const request = this.pendingApprovals.get(requestId);
        if (!request) {
            throw new Error(`Approval request not found: ${requestId}`);
        }

        request.approve(decidedBy, comments);

        // Move to history
        this.approvalHistory.push(request);
        this.pendingApprovals.delete(requestId);

        // Resume workflow if exists
        if (request.onResume) {
            await request.onResume({ approved: true, request });
        }

        return request;
    }

    async reject(requestId, decidedBy, comments = '') {
        const request = this.pendingApprovals.get(requestId);
        if (!request) {
            throw new Error(`Approval request not found: ${requestId}`);
        }

        request.reject(decidedBy, comments);

        // Move to history
        this.approvalHistory.push(request);
        this.pendingApprovals.delete(requestId);

        // Resume workflow if exists
        if (request.onResume) {
            await request.onResume({ approved: false, request });
        }

        return request;
    }

    getHistory(limit = 50) {
        return this.approvalHistory.slice(-limit).reverse();
    }

    getMetrics() {
        const total = this.approvalHistory.length;
        const approved = this.approvalHistory.filter(a => a.status === 'approved').length;
        const rejected = this.approvalHistory.filter(a => a.status === 'rejected').length;
        const pending = this.pendingApprovals.size;

        return {
            total,
            approved,
            rejected,
            pending,
            approvalRate: total > 0 ? Math.round((approved / total) * 100) : 0
        };
    }
}

// ===== APPROVAL WORKFLOW STEP =====
// This extends the workflow system with human-in-loop capability

function requiresApproval(config) {
    return {
        id: config.id || 'approval-step',
        name: config.name || 'Awaiting Approval',
        description: config.description || '',
        isApprovalStep: true,
        approvalType: config.type,

        execute: async ({ data, execution }) => {
            const amount = config.getAmount ? config.getAmount(data) : 0;
            const title = config.getTitle ? config.getTitle(data) : 'Approval Required';
            const description = config.getDescription ? config.getDescription(data) : '';

            // Check if approval is needed
            if (!approvalManager.needsApproval(config.type, amount)) {
                return {
                    approvalSkipped: true,
                    reason: 'Below threshold',
                    autoApproved: true
                };
            }

            // Create approval request and suspend
            return new Promise((resolve, reject) => {
                const request = approvalManager.createRequest({
                    type: config.type,
                    title,
                    description,
                    amount,
                    data,
                    workflowId: execution?.workflowId,
                    executionId: execution?.id,
                    onResume: async (result) => {
                        if (result.approved) {
                            resolve({
                                approvalId: request.id,
                                approved: true,
                                approvedBy: result.request.decidedBy,
                                approvedAt: result.request.decidedAt,
                                comments: result.request.comments
                            });
                        } else {
                            reject(new Error(`Approval rejected: ${result.request.comments || 'No reason provided'}`));
                        }
                    }
                });

                approvalBus.emit('workflow:suspended', {
                    workflowId: execution?.workflowId,
                    executionId: execution?.id,
                    approvalRequest: request,
                    timestamp: new Date().toISOString()
                });
            });
        }
    };
}

// ===== DEMO WORKFLOWS WITH APPROVAL =====

// Proposal workflow with approval
const proposalWithApproval = {
    id: 'proposal-approval',
    name: 'Proposal with Approval',
    description: 'Submit proposal with manager approval for high-value deals',
    steps: [
        {
            id: 'prepare-proposal',
            name: 'Chuẩn bị Proposal',
            execute: async ({ data }) => {
                await simulateWork(800);
                return {
                    proposalId: `prop-${Date.now()}`,
                    clientName: data.clientName || 'Client',
                    amount: data.amount || 5000000,
                    preparedAt: new Date().toISOString()
                };
            }
        },
        requiresApproval({
            id: 'manager-approval',
            name: 'Manager Approval',
            type: 'proposal',
            getAmount: (data) => data.amount,
            getTitle: (data) => `Proposal for ${data.clientName}`,
            getDescription: (data) => `Proposal value: ${formatCurrency(data.amount)}`
        }),
        {
            id: 'send-proposal',
            name: 'Gửi Proposal',
            execute: async ({ data }) => {
                await simulateWork(600);
                return {
                    sent: true,
                    sentTo: data.clientName,
                    sentAt: new Date().toISOString()
                };
            }
        }
    ]
};

// Expense workflow with approval
const expenseWithApproval = {
    id: 'expense-approval',
    name: 'Expense with Approval',
    description: 'Submit expense claim with finance approval',
    steps: [
        {
            id: 'submit-expense',
            name: 'Nộp chi phí',
            execute: async ({ data }) => {
                await simulateWork(500);
                return {
                    expenseId: `exp-${Date.now()}`,
                    category: data.category || 'Marketing',
                    amount: data.amount || 300000,
                    submittedAt: new Date().toISOString()
                };
            }
        },
        requiresApproval({
            id: 'finance-approval',
            name: 'Finance Approval',
            type: 'expense',
            getAmount: (data) => data.amount,
            getTitle: (data) => `${data.category} Expense`,
            getDescription: (data) => `Amount: ${formatCurrency(data.amount)}`
        }),
        {
            id: 'process-payment',
            name: 'Xử lý thanh toán',
            execute: async ({ data }) => {
                await simulateWork(700);
                return {
                    processed: true,
                    processedAt: new Date().toISOString()
                };
            }
        }
    ]
};

// ===== HELPER FUNCTIONS =====
function simulateWork(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

// ===== GLOBAL INSTANCE =====
const approvalManager = new ApprovalManager();

// ===== EXPORTS =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ApprovalManager,
        ApprovalRequest,
        approvalManager,
        approvalBus,
        approvalRules,
        requiresApproval,
        proposalWithApproval,
        expenseWithApproval,
        formatCurrency
    };
}

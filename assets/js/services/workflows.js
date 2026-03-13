/**
 * ==============================================
 * MEKONG AGENCY - WORKFLOW CHAIN SYSTEM
 * AgencyOS Workflow Chain Pattern Implementation
 * ==============================================
 */

// ===== WORKFLOW EVENT BUS =====
class WorkflowEventBus {
    constructor() {
        this.listeners = new Map();
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) callbacks.splice(index, 1);
        }
    }

    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => callback(data));
        }
    }
}

const workflowBus = new WorkflowEventBus();

// ===== WORKFLOW STEP =====
class WorkflowStep {
    constructor(config) {
        this.id = config.id;
        this.name = config.name || config.id;
        this.description = config.description || '';
        this.execute = config.execute;
        this.rollback = config.rollback || null;
        this.timeout = config.timeout || 30000;
        this.retries = config.retries || 0;
    }
}

// ===== WORKFLOW CHAIN =====
class WorkflowChain {
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.description = config.description || '';
        this.steps = [];
        this.executions = [];
    }

    andThen(stepConfig) {
        this.steps.push(new WorkflowStep(stepConfig));
        return this; // Enable chaining
    }

    async run(initialData = {}) {
        const execution = {
            id: `exec-${Date.now()}`,
            workflowId: this.id,
            workflowName: this.name,
            startTime: new Date().toISOString(),
            endTime: null,
            status: 'running',
            currentStep: 0,
            steps: this.steps.map(s => ({
                id: s.id,
                name: s.name,
                status: 'pending',
                startTime: null,
                endTime: null,
                output: null,
                error: null
            })),
            data: { ...initialData },
            error: null
        };

        this.executions.push(execution);

        workflowBus.emit('workflow:started', {
            executionId: execution.id,
            workflowId: this.id,
            workflowName: this.name,
            timestamp: execution.startTime
        });

        let currentData = { ...initialData };
        const completedSteps = [];

        try {
            for (let i = 0; i < this.steps.length; i++) {
                const step = this.steps[i];
                execution.currentStep = i;
                execution.steps[i].status = 'running';
                execution.steps[i].startTime = new Date().toISOString();

                workflowBus.emit('step:started', {
                    executionId: execution.id,
                    stepId: step.id,
                    stepName: step.name,
                    stepIndex: i,
                    totalSteps: this.steps.length,
                    timestamp: execution.steps[i].startTime
                });

                try {
                    // Execute step with timeout
                    const result = await this.executeWithTimeout(
                        step.execute({ data: currentData, execution }),
                        step.timeout
                    );

                    currentData = { ...currentData, ...result };
                    execution.steps[i].status = 'completed';
                    execution.steps[i].endTime = new Date().toISOString();
                    execution.steps[i].output = result;
                    execution.data = currentData;

                    completedSteps.push({ step, output: result });

                    workflowBus.emit('step:completed', {
                        executionId: execution.id,
                        stepId: step.id,
                        stepName: step.name,
                        stepIndex: i,
                        output: result,
                        timestamp: execution.steps[i].endTime
                    });

                } catch (stepError) {
                    execution.steps[i].status = 'failed';
                    execution.steps[i].endTime = new Date().toISOString();
                    execution.steps[i].error = stepError.message;

                    workflowBus.emit('step:failed', {
                        executionId: execution.id,
                        stepId: step.id,
                        stepName: step.name,
                        stepIndex: i,
                        error: stepError.message,
                        timestamp: execution.steps[i].endTime
                    });

                    throw stepError;
                }
            }

            execution.status = 'completed';
            execution.endTime = new Date().toISOString();

            workflowBus.emit('workflow:completed', {
                executionId: execution.id,
                workflowId: this.id,
                workflowName: this.name,
                duration: this.calculateDuration(execution.startTime, execution.endTime),
                finalData: currentData,
                timestamp: execution.endTime
            });

            return { success: true, data: currentData, execution };

        } catch (error) {
            execution.status = 'failed';
            execution.endTime = new Date().toISOString();
            execution.error = error.message;

            // Attempt rollback
            if (completedSteps.length > 0) {
                await this.rollback(completedSteps, execution);
            }

            workflowBus.emit('workflow:failed', {
                executionId: execution.id,
                workflowId: this.id,
                workflowName: this.name,
                error: error.message,
                failedStep: execution.currentStep,
                timestamp: execution.endTime
            });

            return { success: false, error: error.message, execution };
        }
    }

    async executeWithTimeout(promise, timeout) {
        return Promise.race([
            promise,
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Step timeout')), timeout)
            )
        ]);
    }

    async rollback(completedSteps, execution) {
        workflowBus.emit('workflow:rollback-started', {
            executionId: execution.id,
            stepsToRollback: completedSteps.length
        });

        for (let i = completedSteps.length - 1; i >= 0; i--) {
            const { step, output } = completedSteps[i];
            if (step.rollback) {
                try {
                    await step.rollback({ output, execution });
                    workflowBus.emit('step:rolledback', {
                        executionId: execution.id,
                        stepId: step.id
                    });
                } catch (rollbackError) {
                    workflowBus.emit('step:rollback-failed', {
                        executionId: execution.id,
                        stepId: step.id,
                        error: rollbackError.message
                    });
                }
            }
        }
    }

    calculateDuration(start, end) {
        const startTime = new Date(start).getTime();
        const endTime = new Date(end).getTime();
        return `${((endTime - startTime) / 1000).toFixed(2)}s`;
    }

    getStatus() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            stepCount: this.steps.length,
            steps: this.steps.map(s => ({ id: s.id, name: s.name })),
            executions: this.executions.length,
            lastExecution: this.executions[this.executions.length - 1] || null
        };
    }

    getMetrics() {
        const completed = this.executions.filter(e => e.status === 'completed');
        const failed = this.executions.filter(e => e.status === 'failed');

        return {
            totalExecutions: this.executions.length,
            completedCount: completed.length,
            failedCount: failed.length,
            successRate: this.executions.length > 0
                ? Math.round((completed.length / this.executions.length) * 100)
                : 0
        };
    }
}

// ===== WORKFLOW FACTORY =====
function createWorkflowChain(config) {
    return new WorkflowChain(config);
}

// ===== WORKFLOW REGISTRY =====
class WorkflowRegistry {
    constructor() {
        this.workflows = new Map();
    }

    register(workflow) {
        this.workflows.set(workflow.id, workflow);
        workflowBus.emit('workflow:registered', {
            workflowId: workflow.id,
            workflowName: workflow.name,
            timestamp: new Date().toISOString()
        });
        return workflow;
    }

    get(id) {
        return this.workflows.get(id);
    }

    getAll() {
        return Array.from(this.workflows.values());
    }

    async run(workflowId, data) {
        const workflow = this.get(workflowId);
        if (!workflow) {
            throw new Error(`Workflow not found: ${workflowId}`);
        }
        return await workflow.run(data);
    }
}

const workflowRegistry = new WorkflowRegistry();

// ===== PRE-BUILT WORKFLOWS =====

// 1. Client Onboarding Workflow
const clientOnboarding = createWorkflowChain({
    id: 'client-onboarding',
    name: 'Client Onboarding',
    description: 'Automate new client setup process'
})
    .andThen({
        id: 'collect-info',
        name: 'Thu thập thông tin',
        description: 'Collect client information',
        execute: async ({ data }) => {
            await simulateWork(1000);
            return {
                clientId: `client-${Date.now()}`,
                clientName: data.clientName || 'New Client',
                email: data.email || 'client@example.com',
                collectedAt: new Date().toISOString()
            };
        }
    })
    .andThen({
        id: 'create-workspace',
        name: 'Tạo workspace',
        description: 'Create client workspace and project folders',
        execute: async ({ data }) => {
            await simulateWork(1500);
            return {
                workspaceId: `ws-${Date.now()}`,
                folders: ['campaigns', 'assets', 'reports'],
                createdAt: new Date().toISOString()
            };
        }
    })
    .andThen({
        id: 'send-welcome',
        name: 'Gửi email chào mừng',
        description: 'Send welcome email with credentials',
        execute: async ({ data }) => {
            await simulateWork(800);
            return {
                emailSent: true,
                sentTo: data.email,
                sentAt: new Date().toISOString()
            };
        }
    })
    .andThen({
        id: 'schedule-kickoff',
        name: 'Lên lịch kickoff meeting',
        description: 'Schedule initial meeting with client',
        execute: async ({ data }) => {
            await simulateWork(600);
            const kickoffDate = new Date();
            kickoffDate.setDate(kickoffDate.getDate() + 3);
            return {
                meetingScheduled: true,
                meetingDate: kickoffDate.toISOString(),
                meetingLink: 'https://meet.google.com/abc-xyz-123'
            };
        }
    });

// 2. Content Publishing Workflow
const contentPublishing = createWorkflowChain({
    id: 'content-publishing',
    name: 'Content Publishing',
    description: 'End-to-end content creation and publishing'
})
    .andThen({
        id: 'research',
        name: 'Nghiên cứu chủ đề',
        description: 'Research topic and gather sources',
        execute: async ({ data }) => {
            await simulateWork(1200);
            return {
                topic: data.topic || 'Marketing Tips',
                sources: ['Industry reports', 'Case studies', 'Expert interviews'],
                keywords: ['marketing', 'digital', 'sme'],
                researchedAt: new Date().toISOString()
            };
        }
    })
    .andThen({
        id: 'draft',
        name: 'Viết bản thảo',
        description: 'Write initial draft',
        execute: async ({ data }) => {
            await simulateWork(2000);
            return {
                draftId: `draft-${Date.now()}`,
                wordCount: Math.floor(Math.random() * 500) + 800,
                draftedAt: new Date().toISOString()
            };
        }
    })
    .andThen({
        id: 'review',
        name: 'Review & chỉnh sửa',
        description: 'Review and edit content',
        execute: async ({ data }) => {
            await simulateWork(1000);
            return {
                reviewed: true,
                corrections: Math.floor(Math.random() * 10) + 5,
                reviewedAt: new Date().toISOString()
            };
        }
    })
    .andThen({
        id: 'seo-optimize',
        name: 'Tối ưu SEO',
        description: 'Apply SEO optimizations',
        execute: async ({ data }) => {
            await simulateWork(800);
            return {
                seoScore: Math.floor(Math.random() * 15) + 85,
                metaTitle: `${data.topic} - Mekong Agency`,
                metaDescription: `Learn about ${data.topic} from Mekong Agency experts`,
                optimizedAt: new Date().toISOString()
            };
        }
    })
    .andThen({
        id: 'publish',
        name: 'Đăng bài',
        description: 'Publish to platforms',
        execute: async ({ data }) => {
            await simulateWork(600);
            return {
                published: true,
                platforms: ['Blog', 'Facebook', 'LinkedIn'],
                url: `https://blog.mekong.agency/${data.topic.toLowerCase().replace(/\s+/g, '-')}`,
                publishedAt: new Date().toISOString()
            };
        }
    });

// 3. Lead Nurturing Workflow
const leadNurturing = createWorkflowChain({
    id: 'lead-nurturing',
    name: 'Lead Nurturing',
    description: 'Automated lead follow-up sequence'
})
    .andThen({
        id: 'qualify-lead',
        name: 'Đánh giá lead',
        description: 'Score and qualify the lead',
        execute: async ({ data }) => {
            await simulateWork(800);
            const score = Math.floor(Math.random() * 40) + 60;
            return {
                leadId: data.leadId || `lead-${Date.now()}`,
                leadName: data.leadName || 'New Lead',
                score,
                qualified: score >= 70,
                qualifiedAt: new Date().toISOString()
            };
        }
    })
    .andThen({
        id: 'send-followup',
        name: 'Gửi email follow-up',
        description: 'Send personalized follow-up email',
        execute: async ({ data }) => {
            await simulateWork(600);
            const template = data.qualified ? 'hot-lead' : 'nurture-sequence';
            return {
                emailTemplate: template,
                sent: true,
                sentAt: new Date().toISOString()
            };
        }
    })
    .andThen({
        id: 'schedule-task',
        name: 'Tạo task CRM',
        description: 'Create follow-up task in CRM',
        execute: async ({ data }) => {
            await simulateWork(500);
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + (data.qualified ? 1 : 7));
            return {
                taskId: `task-${Date.now()}`,
                taskType: data.qualified ? 'Call' : 'Email',
                dueDate: dueDate.toISOString(),
                assigned: 'Sales Team'
            };
        }
    });

// Register all workflows
workflowRegistry.register(clientOnboarding);
workflowRegistry.register(contentPublishing);
workflowRegistry.register(leadNurturing);

// ===== HELPER FUNCTIONS =====
function simulateWork(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ===== EXPORTS =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        WorkflowChain,
        WorkflowStep,
        createWorkflowChain,
        workflowRegistry,
        workflowBus,
        clientOnboarding,
        contentPublishing,
        leadNurturing
    };
}

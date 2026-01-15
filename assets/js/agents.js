/**
 * ==============================================
 * MEKONG AGENCY - MULTI-AGENT SYSTEM
 * Supervisor Pattern Implementation
 * AgencyOS Workflow
 * ==============================================
 */

// ===== AGENT EVENT SYSTEM =====
class AgentEventBus {
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

// Global event bus for agent communication
const agentBus = new AgentEventBus();

// ===== AGENT STATES =====
const AgentState = {
    IDLE: 'idle',
    WORKING: 'working',
    COMPLETED: 'completed',
    ERROR: 'error'
};

// ===== BASE AGENT CLASS =====
class Agent {
    constructor(config) {
        this.id = config.id || this.generateId();
        this.name = config.name;
        this.purpose = config.purpose || '';
        this.instructions = config.instructions || '';
        this.state = AgentState.IDLE;
        this.taskQueue = [];
        this.currentTask = null;
        this.logs = [];
        this.capabilities = config.capabilities || [];
    }

    generateId() {
        if (typeof MekongUtils !== 'undefined' && MekongUtils.generateId) {
            return MekongUtils.generateId('agent');
        }
        return `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    log(message, type = 'info') {
        const entry = {
            timestamp: new Date().toISOString(),
            agent: this.name,
            type,
            message
        };
        this.logs.push(entry);
        agentBus.emit('agent:log', entry);

    }

    setState(newState) {
        const oldState = this.state;
        this.state = newState;
        agentBus.emit('agent:state-change', {
            agent: this.name,
            oldState,
            newState,
            timestamp: new Date().toISOString()
        });
    }

    async receiveTask(task) {
        this.log(`Received task: ${task.description}`, 'task');
        this.taskQueue.push(task);

        if (this.state === AgentState.IDLE) {
            await this.processNextTask();
        }
    }

    async processNextTask() {
        if (this.taskQueue.length === 0) {
            this.setState(AgentState.IDLE);
            return null;
        }

        this.currentTask = this.taskQueue.shift();
        this.setState(AgentState.WORKING);
        this.log(`Processing: ${this.currentTask.description}`, 'working');

        try {
            const result = await this.executeTask(this.currentTask);
            this.setState(AgentState.COMPLETED);
            this.log(`Completed: ${this.currentTask.description}`, 'success');

            agentBus.emit('task:completed', {
                agent: this.name,
                task: this.currentTask,
                result,
                timestamp: new Date().toISOString()
            });

            // Process next task if available
            setTimeout(() => this.processNextTask(), 500);

            return result;
        } catch (error) {
            this.setState(AgentState.ERROR);
            this.log(`Error: ${error.message}`, 'error');

            agentBus.emit('task:error', {
                agent: this.name,
                task: this.currentTask,
                error: error.message,
                timestamp: new Date().toISOString()
            });

            return null;
        }
    }

    async executeTask(task) {
        // Simulate work with delay
        await this.simulateWork(1500 + Math.random() * 1000);
        return { status: 'completed', output: `${this.name} processed: ${task.description}` };
    }

    simulateWork(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getStatus() {
        return {
            id: this.id,
            name: this.name,
            purpose: this.purpose,
            state: this.state,
            queueLength: this.taskQueue.length,
            currentTask: this.currentTask?.description || null,
            capabilities: this.capabilities
        };
    }
}

// ===== SUPERVISOR AGENT =====
class SupervisorAgent extends Agent {
    constructor(config) {
        super({
            ...config,
            name: config.name || 'Supervisor',
            purpose: 'Route tasks to specialized agents',
            instructions: 'Analyze incoming tasks and delegate to the appropriate sub-agent'
        });

        this.subAgents = new Map();
        this.taskHistory = [];
        this.routingRules = config.routingRules || this.defaultRoutingRules();
    }

    defaultRoutingRules() {
        return [
            { keywords: ['research', 'tìm', 'nghiên cứu', 'phân tích', 'competitor', 'market'], agent: 'scout' },
            { keywords: ['viết', 'content', 'bài viết', 'blog', 'copy', 'edit', 'seo'], agent: 'editor' },
            { keywords: ['video', 'script', 'kịch bản', 'quay', 'dựng', 'media'], agent: 'director' }
        ];
    }

    registerSubAgent(agent) {
        this.subAgents.set(agent.name.toLowerCase(), agent);
        this.log(`Registered sub-agent: ${agent.name}`, 'system');

        agentBus.emit('supervisor:agent-registered', {
            supervisor: this.name,
            agent: agent.name,
            timestamp: new Date().toISOString()
        });
    }

    unregisterSubAgent(agentName) {
        this.subAgents.delete(agentName.toLowerCase());
        this.log(`Unregistered sub-agent: ${agentName}`, 'system');
    }

    analyzeTask(taskDescription) {
        const lowerDesc = taskDescription.toLowerCase();

        for (const rule of this.routingRules) {
            for (const keyword of rule.keywords) {
                if (lowerDesc.includes(keyword)) {
                    return rule.agent;
                }
            }
        }

        // Default to scout for unknown tasks
        return 'scout';
    }

    async routeTask(taskDescription, priority = 'normal') {
        this.log(`Analyzing task: "${taskDescription}"`, 'routing');

        const targetAgentName = this.analyzeTask(taskDescription);
        const targetAgent = this.subAgents.get(targetAgentName);

        if (!targetAgent) {
            this.log(`No agent found for: ${targetAgentName}`, 'error');
            return null;
        }

        const task = {
            id: `task-${Date.now()}`,
            description: taskDescription,
            priority,
            assignedTo: targetAgentName,
            assignedBy: this.name,
            createdAt: new Date().toISOString()
        };

        this.taskHistory.push(task);

        this.log(`Routing to ${targetAgent.name}: "${taskDescription}"`, 'routing');

        agentBus.emit('task:routed', {
            supervisor: this.name,
            task,
            targetAgent: targetAgent.name,
            timestamp: new Date().toISOString()
        });

        await targetAgent.receiveTask(task);

        return task;
    }

    getSubAgentStatuses() {
        const statuses = {};
        this.subAgents.forEach((agent, name) => {
            statuses[name] = agent.getStatus();
        });
        return statuses;
    }

    getTaskHistory() {
        return this.taskHistory;
    }
}

// ===== SCOUT AGENT (Research) =====
class ScoutAgent extends Agent {
    constructor(config = {}) {
        super({
            ...config,
            name: 'Scout',
            purpose: 'Research & Information Gathering',
            instructions: 'Search, analyze, and compile research data',
            capabilities: [
                'Web research',
                'Competitor analysis',
                'Market research',
                'Data gathering',
                'Trend analysis'
            ]
        });
    }

    async executeTask(task) {
        this.log('Starting research process...', 'working');
        await this.simulateWork(1000);

        this.log('Gathering data from sources...', 'working');
        await this.simulateWork(1500);

        this.log('Analyzing findings...', 'working');
        await this.simulateWork(1000);

        // Simulated research output
        const output = {
            status: 'completed',
            type: 'research',
            findings: [
                'Key insight 1: Market shows growth potential',
                'Key insight 2: Competitors focusing on digital',
                'Key insight 3: Customer preferences shifting'
            ],
            sources: ['Industry reports', 'Market analysis', 'Competitor websites'],
            summary: `Research completed for: ${task.description}`
        };

        return output;
    }
}

// ===== EDITOR AGENT (Content) =====
class EditorAgent extends Agent {
    constructor(config = {}) {
        super({
            ...config,
            name: 'Editor',
            purpose: 'Content Creation & Editing',
            instructions: 'Write, edit, and optimize content',
            capabilities: [
                'Blog writing',
                'Copy editing',
                'SEO optimization',
                'Content strategy',
                'Proofreading'
            ]
        });
    }

    async executeTask(task) {
        this.log('Analyzing content requirements...', 'working');
        await this.simulateWork(800);

        this.log('Drafting content...', 'working');
        await this.simulateWork(2000);

        this.log('Optimizing for SEO...', 'working');
        await this.simulateWork(1000);

        this.log('Final review...', 'working');
        await this.simulateWork(500);

        const output = {
            status: 'completed',
            type: 'content',
            draft: {
                title: `Content for: ${task.description}`,
                wordCount: Math.floor(Math.random() * 500) + 500,
                readingTime: '3-5 mins',
                seoScore: Math.floor(Math.random() * 20) + 80
            },
            suggestions: [
                'Add more internal links',
                'Include relevant images',
                'Optimize meta description'
            ],
            summary: `Content created for: ${task.description}`
        };

        return output;
    }
}

// ===== DIRECTOR AGENT (Video) =====
class DirectorAgent extends Agent {
    constructor(config = {}) {
        super({
            ...config,
            name: 'Director',
            purpose: 'Video & Media Production',
            instructions: 'Plan and coordinate video content',
            capabilities: [
                'Script writing',
                'Storyboarding',
                'Shot planning',
                'Production notes',
                'Post-production guidance'
            ]
        });
    }

    async executeTask(task) {
        this.log('Conceptualizing video...', 'working');
        await this.simulateWork(1000);

        this.log('Writing script...', 'working');
        await this.simulateWork(1500);

        this.log('Creating storyboard...', 'working');
        await this.simulateWork(1200);

        this.log('Preparing production notes...', 'working');
        await this.simulateWork(800);

        const output = {
            status: 'completed',
            type: 'video',
            production: {
                title: `Video for: ${task.description}`,
                duration: `${Math.floor(Math.random() * 3) + 2}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
                scenes: Math.floor(Math.random() * 5) + 5,
                style: 'Professional / Modern'
            },
            deliverables: [
                'Script document',
                'Storyboard frames',
                'Shot list',
                'Production timeline'
            ],
            summary: `Video production planned for: ${task.description}`
        };

        return output;
    }
}

// ===== AGENT SYSTEM MANAGER =====
class AgentSystem {
    constructor() {
        this.supervisor = null;
        this.agents = new Map();
        this.initialized = false;
    }

    initialize() {
        // Create supervisor
        this.supervisor = new SupervisorAgent({ id: 'supervisor-main' });

        // Create sub-agents
        const scout = new ScoutAgent({ id: 'scout-main' });
        const editor = new EditorAgent({ id: 'editor-main' });
        const director = new DirectorAgent({ id: 'director-main' });

        // Register sub-agents with supervisor
        this.supervisor.registerSubAgent(scout);
        this.supervisor.registerSubAgent(editor);
        this.supervisor.registerSubAgent(director);

        // Store references
        this.agents.set('supervisor', this.supervisor);
        this.agents.set('scout', scout);
        this.agents.set('editor', editor);
        this.agents.set('director', director);

        this.initialized = true;

        agentBus.emit('system:initialized', {
            timestamp: new Date().toISOString(),
            agents: Array.from(this.agents.keys())
        });

        return this;
    }

    async submitTask(description, priority = 'normal') {
        if (!this.initialized) {
            throw new Error('Agent system not initialized');
        }

        return await this.supervisor.routeTask(description, priority);
    }

    getSystemStatus() {
        if (!this.initialized) {
            return { initialized: false };
        }

        return {
            initialized: true,
            supervisor: this.supervisor.getStatus(),
            subAgents: this.supervisor.getSubAgentStatuses(),
            taskHistory: this.supervisor.getTaskHistory()
        };
    }

    getAgent(name) {
        return this.agents.get(name.toLowerCase());
    }

    getAllAgents() {
        return Array.from(this.agents.values());
    }
}

// ===== GLOBAL INSTANCE =====
const mekongAgents = new AgentSystem();

// Export for ES modules
export {
    AgentSystem,
    SupervisorAgent,
    ScoutAgent,
    EditorAgent,
    DirectorAgent,
    Agent,
    AgentState,
    agentBus,
    mekongAgents
};

// Export for CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AgentSystem,
        SupervisorAgent,
        ScoutAgent,
        EditorAgent,
        DirectorAgent,
        Agent,
        AgentState,
        agentBus,
        mekongAgents
    };
}

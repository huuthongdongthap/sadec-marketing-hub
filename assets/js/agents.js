/**
 * ==============================================
 * MEKONG AGENCY - MULTI-AGENT SYSTEM
 * Hybrid Architecture: Client-side Agents + Supabase Backend
 * ==============================================
 */

import { supabase, agents as agentsApi } from './supabase.js';

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

    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => callback(data));
        }
    }
}

const agentBus = new AgentEventBus();

// ===== BASE AGENT CLASS =====
class Agent {
    constructor(config) {
        this.name = config.name;
        this.role = config.role || 'worker';
        this.capabilities = config.capabilities || [];
        this.state = 'idle';
    }

    log(message, type = 'info') {
        agentBus.emit('agent:log', {
            agent: this.name,
            type,
            message,
            timestamp: new Date().toISOString()
        });
    }

    async processTask(task) {
        this.state = 'working';
        agentBus.emit('agent:state-change', { agent: this.name, newState: 'working' });

        try {
            this.log(`Processing task: ${task.title}`, 'working');
            const result = await this.execute(task);

            this.state = 'completed';
            agentBus.emit('agent:state-change', { agent: this.name, newState: 'completed' });

            return result;
        } catch (error) {
            console.error(`${this.name} error:`, error);
            this.state = 'error';
            this.log(`Error: ${error.message}`, 'error');
            agentBus.emit('agent:state-change', { agent: this.name, newState: 'error' });
            throw error;
        } finally {
            // Reset to idle after a delay
            setTimeout(() => {
                this.state = 'idle';
                agentBus.emit('agent:state-change', { agent: this.name, newState: 'idle' });
            }, 3000);
        }
    }

    async execute(task) {
        // Base implementation simulates work
        await new Promise(r => setTimeout(r, 2000));
        return { message: 'Task completed' };
    }
}

// ===== EDITOR AGENT (Content) =====
class EditorAgent extends Agent {
    constructor() {
        super({
            name: 'Editor',
            capabilities: ['Content Creation', 'Copywriting', 'SEO']
        });
    }

    async execute(task) {
        this.log('Drafting content with AI...', 'working');

        // Call generate-content Edge Function
        const { data, error } = await supabase.functions.invoke('generate-content', {
            body: {
                taskId: task.id,
                prompt: task.description,
                context: { agent: 'Editor' }
            }
        });

        if (error) throw error;

        this.log('Content generated and saved.', 'success');
        return data;
    }
}

// ===== SCOUT AGENT (Research) =====
class ScoutAgent extends Agent {
    constructor() {
        super({
            name: 'Scout',
            capabilities: ['Market Research', 'Competitor Analysis']
        });
    }

    async execute(task) {
        this.log('Searching for information...', 'working');
        // Placeholder for research-agent Edge Function
        await new Promise(r => setTimeout(r, 2000));
        this.log('Research completed.', 'success');
        return { success: true };
    }
}

// ===== DIRECTOR AGENT (Video) =====
class DirectorAgent extends Agent {
    constructor() {
        super({
            name: 'Director',
            capabilities: ['Video Scripting', 'Storyboard']
        });
    }

    async execute(task) {
        this.log('Planning video content...', 'working');
        // Placeholder for director-agent Edge Function
        await new Promise(r => setTimeout(r, 2000));
        this.log('Video plan created.', 'success');
        return { success: true };
    }
}

// ===== AGENT SYSTEM MANAGER =====
class AgentSystem {
    constructor() {
        this.agents = new Map();
        this.initialized = false;
        this.pollingInterval = null;
        this.processedTaskIds = new Set();
    }

    async initialize() {
        if (this.initialized) return;

        // Register Agents
        this.agents.set('Editor', new EditorAgent());
        this.agents.set('Scout', new ScoutAgent());
        this.agents.set('Director', new DirectorAgent());

        this.initialized = true;

        agentBus.emit('system:initialized', {
            timestamp: new Date().toISOString(),
            agents: Array.from(this.agents.keys())
        });

        this.startPolling();
        return this;
    }

    async submitTask(description) {
        if (!this.initialized) await this.initialize();

        try {
            // 1. Create Task in DB
            const { data: task, error: createError } = await agentsApi.createTask({
                title: description.substring(0, 50) + (description.length > 50 ? '...' : ''),
                description: description,
                status: 'pending'
            });

            if (createError) throw createError;

            agentBus.emit('agent:log', {
                agent: 'System',
                type: 'info',
                message: `Task submitted: ${task.title}`,
                timestamp: new Date().toISOString()
            });

            // 2. Trigger Supervisor (Edge Function) to delegate
            const { data: result, error: funcError } = await supabase.functions.invoke('agent-supervisor', {
                body: { taskId: task.id, action: 'delegate' }
            });

            if (funcError) throw funcError;

            agentBus.emit('agent:log', {
                agent: 'Supervisor',
                type: 'routing',
                message: result.message,
                timestamp: new Date().toISOString()
            });

            // Local simulation of "routing" event for UI
            agentBus.emit('task:routed', {
                targetAgent: result.assignedTo
            });

            return task;

        } catch (error) {
            console.error('Task submission failed:', error);
            agentBus.emit('agent:log', {
                agent: 'System',
                type: 'error',
                message: `Error: ${error.message}`,
                timestamp: new Date().toISOString()
            });
            throw error;
        }
    }

    startPolling() {
        if (this.pollingInterval) clearInterval(this.pollingInterval);

        this.pollingInterval = setInterval(async () => {
            // Poll for tasks that are "in_progress" (assigned) but not yet completed
            // And match our local agents
            const { data: tasks } = await supabase
                .from('agent_tasks')
                .select('*, agent:agents(name)')
                .eq('status', 'in_progress')
                .order('updated_at', { ascending: true });

            if (tasks) {
                for (const task of tasks) {
                    if (this.processedTaskIds.has(task.id)) continue;

                    const agentName = task.agent?.name;
                    const agent = this.agents.get(agentName);

                    if (agent && agent.state === 'idle') {
                        this.processedTaskIds.add(task.id);
                        // Execute locally (Client acts as worker)
                        agent.processTask(task).catch(() => {
                            this.processedTaskIds.delete(task.id); // Retry on error
                        });
                    }
                }
            }
        }, 3000);
    }

    getAllAgents() {
        // Return array format expected by UI
        return Array.from(this.agents.values()).map(agent => ({
            name: agent.name,
            state: agent.state,
            capabilities: agent.capabilities,
            purpose: agent.name + ' Agent'
        }));
    }

    getSystemStatus() {
        const subAgents = {};
        this.agents.forEach((agent, name) => {
            subAgents[name] = { state: agent.state };
        });
        return { initialized: this.initialized, subAgents };
    }
}

const mekongAgents = new AgentSystem();

export {
    AgentSystem,
    agentBus,
    mekongAgents
};

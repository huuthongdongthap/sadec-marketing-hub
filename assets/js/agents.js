/**
 * ==============================================
 * MEKONG AGENCY - MULTI-AGENT SYSTEM
 * Real Backend Implementation
 * Connected to Supabase DB & Edge Functions
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

// ===== AGENT SYSTEM MANAGER =====
class AgentSystem {
    constructor() {
        this.agents = [];
        this.initialized = false;
        this.pollingInterval = null;
    }

    async initialize() {
        if (this.initialized) return;

        try {
            // Fetch agents from DB
            const { data, error } = await agentsApi.getAll();
            if (error) throw error;

            this.agents = data;
            this.initialized = true;

            agentBus.emit('system:initialized', {
                timestamp: new Date().toISOString(),
                agents: this.agents.map(a => a.name)
            });

            // Start polling for updates (Realtime subscription could be better, but polling is robust for now)
            this.startPolling();

        } catch (error) {
            console.error('Failed to initialize agent system:', error);
            agentBus.emit('system:error', { error: error.message });
        }

        return this;
    }

    async submitTask(description, priority = 'normal') {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            // 1. Create Task in DB
            const { data: task, error: createError } = await agentsApi.createTask({
                title: description.substring(0, 50) + (description.length > 50 ? '...' : ''),
                description: description,
                status: 'pending'
            });

            if (createError) throw createError;

            agentBus.emit('task:submitted', { task });

            // 2. Trigger Supervisor via Edge Function
            // We invoke the function directly to start the delegation process
            const { data: result, error: funcError } = await supabase.functions.invoke('agent-supervisor', {
                body: { taskId: task.id, action: 'delegate' }
            });

            if (funcError) throw funcError;

            agentBus.emit('task:routed', {
                supervisor: 'Supervisor',
                task,
                targetAgent: result.assignedTo,
                timestamp: new Date().toISOString()
            });

            return task;

        } catch (error) {
            console.error('Task submission failed:', error);
            agentBus.emit('agent:log', {
                agent: 'System',
                type: 'error',
                message: `Failed to submit task: ${error.message}`,
                timestamp: new Date().toISOString()
            });
            throw error;
        }
    }

    getAllAgents() {
        return this.agents;
    }

    getSystemStatus() {
        // Transform DB agent list to the format expected by the UI
        const subAgents = {};
        this.agents.forEach(agent => {
            subAgents[agent.name] = {
                state: agent.status,
                // Add other props if needed
            };
        });

        return {
            initialized: this.initialized,
            subAgents
        };
    }

    startPolling() {
        if (this.pollingInterval) clearInterval(this.pollingInterval);

        this.pollingInterval = setInterval(async () => {
            // Refresh agent status
            const { data } = await agentsApi.getAll();
            if (data) {
                // Detect changes
                data.forEach(newAgent => {
                    const oldAgent = this.agents.find(a => a.id === newAgent.id);
                    if (oldAgent && oldAgent.status !== newAgent.status) {
                        agentBus.emit('agent:state-change', {
                            agent: newAgent.name,
                            oldState: oldAgent.status,
                            newState: newAgent.status,
                            timestamp: new Date().toISOString()
                        });
                    }
                });
                this.agents = data;
            }
        }, 2000); // Poll every 2 seconds
    }
}

// ===== GLOBAL INSTANCE =====
const mekongAgents = new AgentSystem();

export {
    AgentSystem,
    agentBus,
    mekongAgents
};

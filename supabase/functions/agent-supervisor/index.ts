// Supabase Edge Function: Agent Supervisor
// Acts as the central orchestrator for the AI Agent System.
// Receives tasks, analyzes them, and delegates to specific worker agents.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface AgentTask {
    id: string;
    title: string;
    description: string;
}

serve(async (req: Request) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers });
    }

    try {
        const { taskId, action } = await req.json();

        if (action === 'delegate') {
            // 1. Fetch Task Details
            const { data: task, error: taskError } = await supabase
                .from('agent_tasks')
                .select('*')
                .eq('id', taskId)
                .single();

            if (taskError || !task) {
                throw new Error('Task not found');
            }

            // 2. Determine suitable agent (Simple keyword matching for Phase 2)
            // In Phase 3, this would use an LLM to classify intent
            let targetRole = 'Scout'; // Default
            const lowerDesc = (task.title + ' ' + task.description).toLowerCase();

            if (lowerDesc.includes('write') || lowerDesc.includes('blog') || lowerDesc.includes('content') || lowerDesc.includes('post')) {
                targetRole = 'Editor';
            } else if (lowerDesc.includes('video') || lowerDesc.includes('youtube') || lowerDesc.includes('script')) {
                targetRole = 'Director';
            } else if (lowerDesc.includes('research') || lowerDesc.includes('find') || lowerDesc.includes('analyze')) {
                targetRole = 'Scout';
            }

            // 3. Find Agent ID
            const { data: agent } = await supabase
                .from('agents')
                .select('id, name')
                .eq('name', targetRole)
                .single();

            if (!agent) {
                throw new Error(`Agent ${targetRole} not found`);
            }

            // 4. Assign Task
            await supabase
                .from('agent_tasks')
                .update({
                    agent_id: agent.id,
                    status: 'in_progress',
                    updated_at: new Date().toISOString()
                })
                .eq('id', taskId);

            // 5. Update Agent Status
            await supabase
                .from('agents')
                .update({ status: 'working' })
                .eq('id', agent.id);

            // 6. Simulate Work (Trigger worker function - mocked here by updating task after delay)
            // In a real event-driven architecture, the assignment would trigger a database webhook
            // or we would call another Edge Function asynchronously.

            // For demo purposes, we return the decision immediately
            return new Response(
                JSON.stringify({
                    success: true,
                    message: `Delegated to ${targetRole}`,
                    assignedTo: agent.name
                }),
                { status: 200, headers }
            );
        }

        return new Response(
            JSON.stringify({ error: 'Invalid action' }),
            { status: 400, headers }
        );

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers }
        );
    }
});

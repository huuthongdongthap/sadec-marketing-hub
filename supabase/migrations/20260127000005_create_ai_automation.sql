-- Agents Table
CREATE TABLE IF NOT EXISTS public.agents (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL UNIQUE, -- 'Supervisor', 'Scout', 'Editor', etc.
    role text NOT NULL, -- 'supervisor', 'worker'
    description text,
    capabilities text[], -- ['research', 'writing', 'review']
    status text DEFAULT 'idle', -- 'idle', 'working', 'offline'
    config jsonb DEFAULT '{}'::jsonb, -- Model config, prompts, etc.
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Agent Tasks Table
CREATE TABLE IF NOT EXISTS public.agent_tasks (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text,
    agent_id uuid REFERENCES public.agents(id),
    status text DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'failed'
    input_data jsonb DEFAULT '{}'::jsonb,
    output_data jsonb DEFAULT '{}'::jsonb,
    error text,
    parent_task_id uuid REFERENCES public.agent_tasks(id), -- For subtasks
    created_by uuid REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    completed_at timestamptz
);

-- Enhance Workflows Table (if already exists from Phase 1, strictly adding columns or ensuring structure)
-- Assuming workflows table exists from previous phase (or creating if not)
CREATE TABLE IF NOT EXISTS public.workflows (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text,
    steps jsonb NOT NULL DEFAULT '[]'::jsonb, -- Array of step definitions
    trigger_type text DEFAULT 'manual', -- 'manual', 'schedule', 'event'
    trigger_config jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true,
    last_run_at timestamptz,
    created_by uuid REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Workflow Executions Table
CREATE TABLE IF NOT EXISTS public.workflow_executions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    workflow_id uuid REFERENCES public.workflows(id),
    status text DEFAULT 'running', -- 'running', 'completed', 'failed'
    current_step_index integer DEFAULT 0,
    context jsonb DEFAULT '{}'::jsonb, -- Data passed between steps
    logs jsonb DEFAULT '[]'::jsonb,
    started_at timestamptz DEFAULT now(),
    completed_at timestamptz,
    error text
);

-- RLS Policies

-- Agents: Read-only for most, Admin write (simulated by authenticated for now)
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view agents" ON public.agents FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can manage agents" ON public.agents FOR ALL USING (auth.role() = 'authenticated'); -- Refine in prod

-- Agent Tasks
ALTER TABLE public.agent_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view tasks" ON public.agent_tasks FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can create tasks" ON public.agent_tasks FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Staff can update tasks" ON public.agent_tasks FOR UPDATE USING (auth.role() = 'authenticated');

-- Workflows (Re-applying policies just in case)
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view workflows" ON public.workflows FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can manage workflows" ON public.workflows FOR ALL USING (auth.role() = 'authenticated');

-- Workflow Executions
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view executions" ON public.workflow_executions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can create executions" ON public.workflow_executions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Staff can update executions" ON public.workflow_executions FOR UPDATE USING (auth.role() = 'authenticated');

-- Initial Agents Seed Data
INSERT INTO public.agents (name, role, description, capabilities, status) VALUES
('Supervisor', 'supervisor', 'Orchestrates tasks and delegates to other agents', ARRAY['planning', 'delegation'], 'idle'),
('Scout', 'worker', 'Researches information and gathers data', ARRAY['search', 'analysis'], 'idle'),
('Editor', 'worker', 'Writes and refines content', ARRAY['writing', 'editing'], 'idle'),
('Director', 'worker', 'Manages multimedia and video tasks', ARRAY['video', 'scripting'], 'idle')
ON CONFLICT (name) DO NOTHING;

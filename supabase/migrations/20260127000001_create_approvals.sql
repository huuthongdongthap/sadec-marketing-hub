-- Create content_approvals table
CREATE TABLE IF NOT EXISTS public.content_approvals (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid REFERENCES public.projects(id),
    title text NOT NULL,
    description text,
    type text NOT NULL, -- 'image', 'video', 'text', 'other'
    preview_url text, -- URL for image/video or null for text
    content_body text, -- Actual text content if type is text
    status text DEFAULT 'pending', -- 'pending', 'approved', 'revision'
    designer_id uuid REFERENCES auth.users(id),
    metadata jsonb DEFAULT '{}'::jsonb, -- Store extra info like dimensions, duration
    feedback text, -- Client feedback
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.content_approvals ENABLE ROW LEVEL SECURITY;

-- Create policies

-- Clients can view approvals for their projects
CREATE POLICY "Clients can view their project approvals" ON public.content_approvals
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = content_approvals.project_id
            AND projects.client_id IN (
                SELECT id FROM public.clients WHERE user_id = auth.uid()
            )
        )
    );

-- Clients can update status (approve/reject) for their project approvals
CREATE POLICY "Clients can update their project approvals" ON public.content_approvals
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = content_approvals.project_id
            AND projects.client_id IN (
                SELECT id FROM public.clients WHERE user_id = auth.uid()
            )
        )
    );

-- Agency members (service role or specific agency group) can do everything
-- For simplicity, allowing all authenticated users to insert/view (internal team)
-- In production, this should be restricted to agency staff roles
CREATE POLICY "Staff can view all approvals" ON public.content_approvals
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Staff can insert approvals" ON public.content_approvals
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Staff can update approvals" ON public.content_approvals
    FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_content_approvals_project_id ON public.content_approvals(project_id);
CREATE INDEX IF NOT EXISTS idx_content_approvals_status ON public.content_approvals(status);

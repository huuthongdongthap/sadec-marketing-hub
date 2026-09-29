-- Create assets table
CREATE TABLE IF NOT EXISTS public.assets (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id uuid REFERENCES public.clients(id),
    project_id uuid REFERENCES public.projects(id),
    name text NOT NULL,
    type text NOT NULL, -- 'image', 'video', 'document', 'other'
    extension text, -- 'png', 'pdf', etc.
    url text NOT NULL,
    size bigint DEFAULT 0,
    folder text DEFAULT 'all', -- logical folder: 'logos', 'banners', 'docs', 'videos'
    metadata jsonb DEFAULT '{}'::jsonb,
    uploaded_by uuid REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- Policies for Assets
CREATE POLICY "Clients can view their assets" ON public.assets
    FOR SELECT
    USING (
        client_id IN (
            SELECT id FROM public.clients WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Clients can upload assets" ON public.assets
    FOR INSERT
    WITH CHECK (
        client_id IN (
            SELECT id FROM public.clients WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Clients can update their assets" ON public.assets
    FOR UPDATE
    USING (
        client_id IN (
            SELECT id FROM public.clients WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Staff can manage all assets" ON public.assets
    FOR ALL
    USING (auth.role() = 'authenticated');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_assets_client_id ON public.assets(client_id);
CREATE INDEX IF NOT EXISTS idx_assets_project_id ON public.assets(project_id);
CREATE INDEX IF NOT EXISTS idx_assets_folder ON public.assets(folder);

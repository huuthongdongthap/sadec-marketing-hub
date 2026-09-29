-- Create campaigns table if it doesn't exist (or ensure structure)
CREATE TABLE IF NOT EXISTS public.campaigns (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid REFERENCES public.projects(id),
    name text NOT NULL,
    platform text NOT NULL, -- 'facebook', 'google', 'tiktok', 'zalo', etc.
    status text DEFAULT 'active', -- 'active', 'paused', 'completed', 'planning'
    budget numeric DEFAULT 0,
    spent numeric DEFAULT 0,
    start_date date,
    end_date date,
    metrics jsonb DEFAULT '{}'::jsonb, -- Store snapshot metrics like total_reach, total_clicks
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create campaign_analytics table for daily/time-series data
CREATE TABLE IF NOT EXISTS public.campaign_analytics (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id uuid REFERENCES public.campaigns(id),
    date date NOT NULL,
    impressions integer DEFAULT 0,
    reach integer DEFAULT 0,
    clicks integer DEFAULT 0,
    conversions integer DEFAULT 0,
    cost numeric DEFAULT 0,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    UNIQUE(campaign_id, date)
);

-- Enable RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_analytics ENABLE ROW LEVEL SECURITY;

-- Policies for Campaigns
CREATE POLICY "Clients can view their campaigns" ON public.campaigns
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = campaigns.project_id
            AND projects.client_id IN (
                SELECT id FROM public.clients WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Staff can manage campaigns" ON public.campaigns
    FOR ALL
    USING (auth.role() = 'authenticated');

-- Policies for Analytics
CREATE POLICY "Clients can view their campaign analytics" ON public.campaign_analytics
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.campaigns
            JOIN public.projects ON projects.id = campaigns.project_id
            WHERE campaigns.id = campaign_analytics.campaign_id
            AND projects.client_id IN (
                SELECT id FROM public.clients WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Staff can manage analytics" ON public.campaign_analytics
    FOR ALL
    USING (auth.role() = 'authenticated');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_project_id ON public.campaigns(project_id);
CREATE INDEX IF NOT EXISTS idx_analytics_campaign_id ON public.campaign_analytics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON public.campaign_analytics(date);

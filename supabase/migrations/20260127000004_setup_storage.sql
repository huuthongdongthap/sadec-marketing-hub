-- Create storage bucket for client assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('client-assets', 'client-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Give clients access to their own folder (or root for simplicity in this phase)
-- We will organize files by client_id/{filename}

CREATE POLICY "Clients can view their own assets" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'client-assets' AND auth.role() = 'authenticated');
    -- Refinement: In production, check path against client_id

CREATE POLICY "Clients can upload assets" ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'client-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Clients can update their own assets" ON storage.objects
    FOR UPDATE
    USING (bucket_id = 'client-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Clients can delete their own assets" ON storage.objects
    FOR DELETE
    USING (bucket_id = 'client-assets' AND auth.role() = 'authenticated');

-- ================================================
-- LANDING PAGES (CMS)
-- ================================================

CREATE TABLE landing_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,

  -- Content stored as JSON blocks or raw HTML
  content JSONB DEFAULT '[]', -- Array of blocks: { type: "hero", data: {...} }
  styles JSONB DEFAULT '{}', -- Custom colors, fonts

  -- Meta tags for SEO
  seo_title TEXT,
  seo_description TEXT,
  seo_image TEXT,

  -- Publishing status
  status TEXT CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  published_at TIMESTAMPTZ,

  -- Analytics
  views INTEGER DEFAULT 0,
  leads_count INTEGER DEFAULT 0,

  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Constraints
  UNIQUE(tenant_id, slug)
);

-- RLS
ALTER TABLE landing_pages ENABLE ROW LEVEL SECURITY;

-- Tenant isolation
CREATE POLICY "Tenant isolation for landing_pages" ON landing_pages
  FOR ALL USING (tenant_id IN (
    SELECT tenant_id FROM users WHERE id = auth.uid()
  ));

-- Public access for published pages (for the renderer)
-- Note: In a real app, we might use a separate anonymous role or function
-- Here we allow public read if we use a service key or specific public API approach.
-- For standard RLS with anon key:
CREATE POLICY "Public can view published pages" ON landing_pages
  FOR SELECT USING (status = 'published');

-- Indexes
CREATE INDEX idx_lp_tenant ON landing_pages(tenant_id);
CREATE INDEX idx_lp_slug ON landing_pages(slug);
CREATE INDEX idx_lp_status ON landing_pages(status);

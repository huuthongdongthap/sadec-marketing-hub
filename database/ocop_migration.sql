-- ═══════════════════════════════════════════
-- OCOP Export Agent — Database Migration
-- Tables: ocop_products, ocop_exports
-- Run after raas_migration.sql
-- ═══════════════════════════════════════════

-- Products table
CREATE TABLE IF NOT EXISTS public.ocop_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('fruits','seafood','rice','spices','snacks','drinks','crafts','other')),
    description TEXT,
    origin TEXT DEFAULT 'Sa Đéc, Đồng Tháp',
    price_vnd INTEGER DEFAULT 0,
    photos TEXT[] DEFAULT '{}',
    ocop_rating INTEGER CHECK (ocop_rating BETWEEN 1 AND 5),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Exports table (AI-generated results)
CREATE TABLE IF NOT EXISTS public.ocop_exports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES public.ocop_products(id) ON DELETE CASCADE NOT NULL,
    mission_id UUID REFERENCES public.raas_missions(id),
    alibaba_listing JSONB DEFAULT '{}',
    b2b_email JSONB DEFAULT '{}',
    compliance JSONB DEFAULT '{}',
    target_market TEXT DEFAULT 'International',
    status TEXT DEFAULT 'generated' CHECK (status IN ('generated','published','archived')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ocop_products_user ON public.ocop_products(user_id);
CREATE INDEX IF NOT EXISTS idx_ocop_products_category ON public.ocop_products(category);
CREATE INDEX IF NOT EXISTS idx_ocop_exports_product ON public.ocop_exports(product_id);

-- RLS
ALTER TABLE public.ocop_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocop_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own products" ON public.ocop_products
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users view own exports" ON public.ocop_exports
    FOR ALL USING (
        product_id IN (SELECT id FROM public.ocop_products WHERE user_id = auth.uid())
    );

-- Service role full access
CREATE POLICY "Service role full access products" ON public.ocop_products
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access exports" ON public.ocop_exports
    FOR ALL USING (auth.role() = 'service_role');

-- Credit deduction function (if not exists)
CREATE OR REPLACE FUNCTION deduct_credits(p_user_id UUID, p_amount INTEGER)
RETURNS void AS $$
BEGIN
    UPDATE public.raas_credits
    SET balance = balance - p_amount, updated_at = now()
    WHERE user_id = p_user_id AND balance >= p_amount;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Insufficient credits';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

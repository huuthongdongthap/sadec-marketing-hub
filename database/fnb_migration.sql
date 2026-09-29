-- =============================================
-- F&B Container Coffee Hub - Database Migration
-- Sa Đéc Marketing Hub ERP Extension
-- =============================================

-- Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    emoji TEXT DEFAULT '🍽️',
    category TEXT CHECK (category IN ('coffee','tea','blended','snacks','seasonal')),
    price NUMERIC NOT NULL DEFAULT 0,
    cost NUMERIC DEFAULT 0,
    recipe TEXT,
    is_available BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number SERIAL,
    items JSONB NOT NULL DEFAULT '[]',
    subtotal NUMERIC NOT NULL DEFAULT 0,
    discount NUMERIC DEFAULT 0,
    total NUMERIC NOT NULL DEFAULT 0,
    payment_method TEXT CHECK (payment_method IN ('cash','transfer','momo','vnpay')),
    payment_status TEXT DEFAULT 'completed',
    served_by UUID REFERENCES auth.users(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Inventory
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_name TEXT NOT NULL,
    unit TEXT DEFAULT 'kg',
    quantity NUMERIC NOT NULL DEFAULT 0,
    min_threshold NUMERIC DEFAULT 5,
    supplier TEXT,
    cost_per_unit NUMERIC DEFAULT 0,
    last_restocked TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Staff & Shifts
CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT CHECK (role IN ('barista','cashier','manager','part-time')),
    phone TEXT,
    salary NUMERIC DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID REFERENCES staff(id),
    shift_date DATE NOT NULL,
    shift_type TEXT CHECK (shift_type IN ('morning','afternoon','full')),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status TEXT DEFAULT 'scheduled',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Quality Checks
CREATE TABLE IF NOT EXISTS quality_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    check_type TEXT CHECK (check_type IN ('hourly','daily','weekly','monthly')),
    checklist JSONB DEFAULT '[]',
    score NUMERIC DEFAULT 0,
    checked_by TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Suppliers
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    rating INT DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID REFERENCES suppliers(id),
    items JSONB NOT NULL DEFAULT '[]',
    total NUMERIC NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','delivered','cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Loyalty Members
CREATE TABLE IF NOT EXISTS loyalty_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT UNIQUE,
    points INT DEFAULT 0,
    tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze','silver','gold')),
    total_spent NUMERIC DEFAULT 0,
    visit_count INT DEFAULT 0,
    last_visit TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS loyalty_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES loyalty_members(id),
    reward_type TEXT,
    points_used INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_payment ON orders(payment_method);
CREATE INDEX IF NOT EXISTS idx_inventory_threshold ON inventory(quantity, min_threshold);
CREATE INDEX IF NOT EXISTS idx_shifts_date ON shifts(shift_date);
CREATE INDEX IF NOT EXISTS idx_quality_type ON quality_checks(check_type);
CREATE INDEX IF NOT EXISTS idx_loyalty_phone ON loyalty_members(phone);
CREATE INDEX IF NOT EXISTS idx_po_supplier ON purchase_orders(supplier_id);

-- RLS Policies
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_rewards ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access (admin portal)
CREATE POLICY "Admin full access" ON menu_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access" ON orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access" ON inventory FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access" ON staff FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access" ON shifts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access" ON quality_checks FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access" ON suppliers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access" ON purchase_orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access" ON loyalty_members FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access" ON loyalty_rewards FOR ALL USING (auth.role() = 'authenticated');

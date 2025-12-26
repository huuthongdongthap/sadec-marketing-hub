-- ============================================================================
-- SUPABASE DATABASE SCHEMA - SA ĐÉC MARKETING HUB
-- Chạy trong Supabase Dashboard → SQL Editor
-- ============================================================================

-- 1. CONTACTS TABLE (Lưu form liên hệ)
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  business_name TEXT,
  service TEXT,
  message TEXT,
  status TEXT DEFAULT 'new', -- new, contacted, converted
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TESTIMONIALS TABLE (Đánh giá khách hàng)
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author TEXT NOT NULL,
  business TEXT,
  avatar_url TEXT,
  content TEXT NOT NULL,
  rating INT DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SERVICES TABLE (Dịch vụ & Bảng giá)
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  price DECIMAL(10,2),
  price_note TEXT, -- "/ tháng", "/ dự án", etc.
  description TEXT,
  features JSONB DEFAULT '[]',
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BLOG POSTS TABLE (Bài viết)
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  cover_image TEXT,
  category TEXT,
  tags JSONB DEFAULT '[]',
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ANALYTICS EVENTS TABLE (Tracking)
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  page_url TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) - Bảo mật
-- ============================================================================

-- Enable RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Policies cho CONTACTS: chỉ insert (anonymous users có thể gửi form)
CREATE POLICY "Allow anonymous insert" ON contacts
  FOR INSERT WITH CHECK (true);

-- Policies cho TESTIMONIALS: ai cũng đọc được featured
CREATE POLICY "Allow public read featured" ON testimonials
  FOR SELECT USING (is_featured = true);

-- Policies cho SERVICES: ai cũng đọc được active services
CREATE POLICY "Allow public read active" ON services
  FOR SELECT USING (is_active = true);

-- Policies cho BLOG_POSTS: ai cũng đọc được published posts
CREATE POLICY "Allow public read published" ON blog_posts
  FOR SELECT USING (is_published = true);

-- Policies cho ANALYTICS: cho phép insert
CREATE POLICY "Allow anonymous insert" ON analytics_events
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- SAMPLE DATA (Optional - để test)
-- ============================================================================

-- Sample Testimonials
INSERT INTO testimonials (author, business, content, rating, is_featured) VALUES
('Chị Hương', 'Bánh Tráng Cô Hương', 'Từ khi có Marketing Hub hỗ trợ, đơn hàng online tăng 300%. Giờ bà con ở Sài Gòn cũng đặt bánh tráng mỗi tuần!', 5, true),
('Anh Minh', 'Cơ Khí Minh Phát', 'Fanpage chạy quảng cáo có người gọi hỏi thăm liên tục. Thợ làm không kịp việc!', 5, true),
('Cô Năm', 'Mắm Cá Lóc Cô Năm', 'Chưa biết gì về marketing mà giờ có người đặt hàng từ Mỹ về. Cảm ơn Sa Đéc Marketing Hub nhiều lắm!', 5, true);

-- Sample Services  
INSERT INTO services (name, slug, price, price_note, description, features, is_popular, sort_order) VALUES
('Gói Khởi Nghiệp', 'starter', 2000000, '/ tháng', 'Phù hợp cho hộ kinh doanh mới bắt đầu online', '["Quản lý Fanpage", "4 bài viết/tháng", "Tư vấn cơ bản"]', false, 1),
('Gói Tăng Trưởng', 'growth', 5000000, '/ tháng', 'Dành cho doanh nghiệp muốn mở rộng', '["Quản lý Fanpage", "12 bài viết/tháng", "Chạy quảng cáo", "Thiết kế hình ảnh", "Báo cáo hàng tuần"]', true, 2),
('Gói Chuyên Nghiệp', 'pro', 10000000, '/ tháng', 'Giải pháp marketing toàn diện', '["Tất cả gói Tăng Trưởng", "Video marketing", "SEO website", "Tư vấn chiến lược", "Hỗ trợ 24/7"]', false, 3);

-- ============================================================================
-- INDEXES (Tối ưu performance)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON testimonials(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(is_published, published_at DESC);

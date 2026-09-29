-- ============================================================================
-- MEKONG AGENCY - SEED DATA V2 (BINH PHÁP SYNC)
-- Migrated from legacy 'clients' table to 'customers' table
-- Compatible with Phase 8 schema (audit_log, soft delete, etc.)
-- Run AFTER phase8_ultimate.sql and rls_unified.sql
-- ============================================================================

-- ============================================================================
-- DEMO LEADS (8 leads with various statuses)
-- ============================================================================
INSERT INTO leads (tenant_id, name, email, phone, company, position, source, status, score, temperature, notes, created_at, last_contacted_at)
SELECT
  t.id,
  l.name,
  l.email,
  l.phone,
  l.company,
  l.position,
  l.source::text,
  l.status::text,
  l.score,
  l.temperature::text,
  l.notes,
  l.created_at::timestamptz,
  l.last_contacted_at::timestamptz
FROM tenants t
CROSS JOIN (VALUES
  ('Trần Thanh Lan', 'lan@huongsen.vn', '0909 123 456', 'Cửa hàng hoa Hương Sen', 'Chủ cửa hàng', 'facebook', 'new', 85, 'hot', 'Quan tâm đến quảng cáo Facebook cho mùa Tết', '2026-01-05 10:30:00+07', NULL),
  ('Nguyễn Văn Minh', 'minh@mekongrest.vn', '0918 765 432', 'Nhà hàng Mekong', 'Quản lý', 'website', 'contacted', 65, 'warm', 'Đã gọi điện, hẹn gặp tuần sau', '2026-01-03 14:00:00+07', '2026-01-05 09:00:00+07'),
  ('Phạm Hoàng', 'hoang@fitnesspro.vn', '0977 111 222', 'Gym Fitness Pro', 'Giám đốc', 'zalo', 'new', 35, 'cold', 'Chưa rõ ngân sách', '2026-01-04 16:45:00+07', NULL),
  ('Lê Thị Hoa', 'hoa@spacenter.vn', '0933 444 555', 'Spa & Beauty Center', 'Chủ spa', 'referral', 'contacted', 90, 'hot', 'Được giới thiệu từ Sa Đéc Flower, rất quan tâm', '2026-01-02 11:00:00+07', '2026-01-05 14:30:00+07'),
  ('Võ Minh Tuấn', 'tuan@hanhphuc.vn', '0966 777 888', 'Tiệm bánh Hạnh Phúc', 'Chủ tiệm', 'facebook', 'contacted', 70, 'warm', 'Muốn chạy quảng cáo cho mùa Valentine', '2026-01-01 09:15:00+07', '2026-01-04 10:00:00+07'),
  ('Đặng Văn Long', 'long@riverside.vn', '0988 999 000', 'Khách sạn Riverside', 'Marketing Manager', 'google', 'qualified', 95, 'hot', 'Đã gửi báo giá 50M, chờ phản hồi', '2025-12-28 08:00:00+07', '2026-01-05 16:00:00+07'),
  ('Huỳnh Thanh Mai', 'mai@xyz.vn', '0911 222 333', 'Thời trang XYZ', 'Owner', 'website', 'qualified', 75, 'warm', 'Báo giá 20M cho chiến dịch 3 tháng', '2025-12-25 13:30:00+07', '2026-01-03 11:00:00+07'),
  ('Trương Công Danh', 'danh@abc.vn', '0922 333 444', 'Công ty TNHH ABC', 'CEO', 'referral', 'won', 100, 'hot', 'Đã ký hợp đồng 100M/năm', '2025-12-20 10:00:00+07', '2026-01-02 09:00:00+07')
) AS l(name, email, phone, company, position, source, status, score, temperature, notes, created_at, last_contacted_at)
WHERE t.slug = 'sadec-hub'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- DEMO CUSTOMERS (Migrated from clients table)
-- Primary customer data - used by AdminAPI
-- ============================================================================
INSERT INTO customers (name, phone, email, business_name, source, status, notes, avatar_emoji, value, created_at)
VALUES
  ('Nguyễn Văn Hoa', '0909 111 222', 'hoa@sadecflower.vn', 'Sa Đéc Flower Shop', 'referral', 'active', 'Khách hàng VIP, làm việc từ 2025', '🌸', 25000000, '2025-06-01 10:00:00+07'),
  ('Trần Bình Du', '0918 333 444', 'du@mekongtravel.vn', 'Mekong Travel', 'facebook', 'active', 'Tour du lịch, cần SEO và Ads', '✈️', 35000000, '2025-07-15 14:00:00+07'),
  ('Lê Minh Ẩm', '0977 555 666', 'am@canthofoods.vn', 'Cần Thơ Foods', 'website', 'active', 'F&B, đang chạy Zalo OA', '🍜', 18000000, '2025-08-20 11:00:00+07'),
  ('Phạm Thị Thời', '0933 777 888', 'thoi@lxboutique.vn', 'Long Xuyên Boutique', 'google', 'active', 'Thời trang, TikTok campaign', '👗', 22000000, '2025-09-10 09:00:00+07'),
  ('Đặng Văn Long', '0988 999 000', 'long@riverside.vn', 'Khách sạn Riverside', 'referral', 'active', 'Khách sạn 4 sao, ngân sách cao', '🏨', 50000000, '2025-10-05 16:00:00+07'),
  ('Nguyễn Thị Hương', '0944 123 789', 'huong@spabeauty.vn', 'Spa Beauty Center', 'facebook', 'new', 'Spa mới, cần full service', '💆', 15000000, '2026-01-10 09:30:00+07'),
  ('Trần Văn Tài', '0955 456 123', 'tai@mekongtech.vn', 'Mekong Tech Solutions', 'website', 'active', 'IT Services, B2B marketing', '💻', 40000000, '2025-11-15 14:00:00+07'),
  ('Lý Thanh Tâm', '0966 789 456', 'tam@dongthaprice.vn', 'Đồng Tháp Rice Export', 'google', 'active', 'Xuất khẩu gạo, cần website + branding', '🌾', 60000000, '2025-12-01 10:00:00+07')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- DEMO DEALS (Sales Pipeline - Binh Pháp WIN³ Data)
-- ============================================================================
INSERT INTO deals (tenant_id, name, value, stage, probability, expected_close, notes, created_at)
SELECT
  t.id,
  d.name,
  d.value,
  d.stage::text,
  d.probability,
  d.expected_close::date,
  d.notes,
  NOW()
FROM tenants t
CROSS JOIN (VALUES
  ('Website Redesign - Spa Beauty', 25000000, 'proposal', 60, '2026-02-01', 'Đã gửi proposal, chờ feedback'),
  ('Chiến dịch Tết 2026 - Riverside Hotel', 50000000, 'negotiation', 75, '2026-01-25', 'Đang thương lượng giá cuối'),
  ('SEO Package 6 tháng - Mekong Tech', 30000000, 'discovery', 30, '2026-02-15', 'Mới contact, cần demo'),
  ('Social Media 2026 - Long Xuyên Boutique', 24000000, 'won', 100, '2026-01-15', 'Đã ký hợp đồng 12 tháng'),
  ('Google Ads Campaign - Đồng Tháp Rice', 40000000, 'proposal', 50, '2026-02-28', 'Đã gửi 2 options pricing'),
  ('Branding Package - Cần Thơ Foods', 35000000, 'negotiation', 80, '2026-01-30', 'Gần chốt deal'),
  ('TikTok Campaign Q1 - XYZ Fashion', 18000000, 'discovery', 25, '2026-03-01', 'Đang tìm hiểu về service'),
  ('Full Digital Package - ABC Corp', 100000000, 'won', 100, '2026-01-10', 'Đã ký HĐ 100M/năm - TOP client')
) AS d(name, value, stage, probability, expected_close, notes)
WHERE t.slug = 'sadec-hub'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- DEMO CONTENT CALENDAR (Social Media Schedule)
-- ============================================================================
INSERT INTO content_calendar (tenant_id, title, content, platform, status, scheduled_at, hashtags, metrics, created_at)
SELECT
  t.id,
  c.title,
  c.content,
  c.platform::text,
  c.status::text,
  c.scheduled_at::timestamptz,
  c.hashtags::text[],
  c.metrics::jsonb,
  NOW()
FROM tenants t
CROSS JOIN (VALUES
  ('Chúc mừng năm mới 2026! 🎉', 'Chúc Quý khách hàng và đối tác năm mới nhiều sức khỏe, thành công!', 'facebook', 'published', '2026-01-01 00:00:00+07', ARRAY['HappyNewYear', 'SaDecMarketing', '2026'], '{"likes": 234, "comments": 45, "shares": 23, "views": 3500}'),
  ('5 xu hướng Marketing 2026 cho SME', 'Khám phá 5 xu hướng marketing digital giúp doanh nghiệp nhỏ tăng trưởng...', 'facebook', 'published', '2026-01-05 10:00:00+07', ARRAY['MarketingTips', 'SMEVietnam', 'DigitalMarketing'], '{"likes": 156, "comments": 28, "shares": 45, "views": 2800}'),
  ('Case Study: Tăng 300% đơn hàng trong 30 ngày', 'Cách Sa Đéc Flower Shop tăng doanh số nhờ Facebook Ads...', 'facebook', 'scheduled', '2026-01-20 09:00:00+07', ARRAY['CaseStudy', 'FacebookAds', 'Success'], '{"likes": 0, "comments": 0, "shares": 0, "views": 0}'),
  ('Mẹo chạy Zalo OA hiệu quả', 'Video hướng dẫn setup và tối ưu Zalo Official Account...', 'zalo', 'scheduled', '2026-01-22 14:00:00+07', ARRAY['ZaloOA', 'Tutorial'], '{"likes": 0, "comments": 0, "shares": 0, "views": 0}'),
  ('TikTok Trends tháng 1/2026', 'Điểm qua những trend hot nhất trên TikTok cho brands...', 'tiktok', 'draft', '2026-01-25 18:00:00+07', ARRAY['TikTokTrends', 'Viral', '2026'], '{"likes": 0, "comments": 0, "shares": 0, "views": 0}'),
  ('Valentine Marketing Ideas', 'Thu hút khách hàng mùa Valentine với 10 ý tưởng sáng tạo...', 'instagram', 'draft', '2026-02-10 10:00:00+07', ARRAY['Valentine2026', 'MarketingIdeas'], '{"likes": 0, "comments": 0, "shares": 0, "views": 0}')
) AS c(title, content, platform, status, scheduled_at, hashtags, metrics)
WHERE t.slug = 'sadec-hub'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- DEMO PROJECTS (Linked to customers)
-- ============================================================================
INSERT INTO projects (tenant_id, client_id, name, description, type, status, progress, budget, spent, start_date, end_date, created_at)
SELECT
  t.id,
  c.id,
  p.name,
  p.description,
  p.type::text,
  p.status::text,
  p.progress,
  p.budget,
  p.spent,
  p.start_date::date,
  p.end_date::date,
  NOW()
FROM tenants t
CROSS JOIN customers c
CROSS JOIN LATERAL (VALUES
  ('Chiến dịch Facebook Ads Q1', 'Quảng cáo Facebook cho sản phẩm hoa tươi, target 25-45 tuổi', 'ads', 'active', 75, 15000000, 11250000, '2026-01-01', '2026-03-31'),
  ('SEO Website 2026', 'Tối ưu SEO local cho website shop hoa', 'seo', 'active', 40, 5000000, 2000000, '2026-01-01', '2026-12-31')
) AS p(name, description, type, status, progress, budget, spent, start_date, end_date)
WHERE t.slug = 'sadec-hub'
  AND c.business_name = 'Sa Đéc Flower Shop'
ON CONFLICT DO NOTHING;

INSERT INTO projects (tenant_id, client_id, name, description, type, status, progress, budget, spent, start_date, end_date, created_at)
SELECT
  t.id,
  c.id,
  'Google Ads - Travel Campaign',
  'Chiến dịch Google Ads cho tour du lịch Mekong',
  'ads',
  'active',
  60,
  20000000,
  14000000,
  '2026-01-01'::date,
  '2026-02-28'::date,
  NOW()
FROM tenants t
CROSS JOIN customers c
WHERE t.slug = 'sadec-hub'
  AND c.business_name = 'Mekong Travel'
ON CONFLICT DO NOTHING;

INSERT INTO projects (tenant_id, client_id, name, description, type, status, progress, budget, spent, start_date, end_date, created_at)
SELECT
  t.id,
  c.id,
  'Social Media Management',
  'Quản lý Fanpage và nội dung social media',
  'social',
  'active',
  25,
  3000000,
  750000,
  '2026-01-01'::date,
  '2026-01-31'::date,
  NOW()
FROM tenants t
CROSS JOIN customers c
WHERE t.slug = 'sadec-hub'
  AND c.business_name = 'Cần Thơ Foods'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- DEMO CAMPAIGNS (Marketing Campaigns)
-- ============================================================================
INSERT INTO campaigns (tenant_id, client_id, name, platform, type, status, budget, spent, start_date, end_date, metrics, created_at)
SELECT
  t.id,
  c.id,
  cm.name,
  cm.platform::text,
  cm.type::text,
  cm.status::text,
  cm.budget,
  cm.spent,
  cm.start_date::date,
  cm.end_date::date,
  cm.metrics::jsonb,
  NOW()
FROM tenants t
CROSS JOIN customers c
CROSS JOIN LATERAL (VALUES
  ('Facebook Ads - Q1 2026', 'facebook', 'conversions', 'active', 15000000, 11250000, '2026-01-01', '2026-03-31', '{"impressions": 125000, "clicks": 4500, "leads": 234, "conversions": 89, "roi": 12.5}'),
  ('Zalo OA Marketing', 'zalo', 'engagement', 'active', 8000000, 5440000, '2026-01-01', '2026-01-31', '{"impressions": 45000, "clicks": 2100, "leads": 89, "conversions": 34, "roi": 6.8}')
) AS cm(name, platform, type, status, budget, spent, start_date, end_date, metrics)
WHERE t.slug = 'sadec-hub'
  AND c.business_name = 'Sa Đéc Flower Shop'
ON CONFLICT DO NOTHING;

INSERT INTO campaigns (tenant_id, client_id, name, platform, type, status, budget, spent, start_date, end_date, metrics, created_at)
SELECT
  t.id,
  c.id,
  'Google Ads - Search',
  'google',
  'leads',
  'active',
  20000000,
  14000000,
  '2026-01-01'::date,
  '2026-02-28'::date,
  '{"impressions": 89000, "clicks": 3200, "leads": 156, "conversions": 67, "roi": 8.2}'::jsonb,
  NOW()
FROM tenants t
CROSS JOIN customers c
WHERE t.slug = 'sadec-hub'
  AND c.business_name = 'Mekong Travel'
ON CONFLICT DO NOTHING;

INSERT INTO campaigns (tenant_id, client_id, name, platform, type, status, budget, spent, start_date, end_date, metrics, created_at)
SELECT
  t.id,
  c.id,
  'TikTok Awareness Campaign',
  'tiktok',
  'awareness',
  'active',
  12000000,
  6500000,
  '2026-01-05'::date,
  '2026-02-05'::date,
  '{"impressions": 230000, "clicks": 8900, "leads": 67, "conversions": 23, "roi": 5.4}'::jsonb,
  NOW()
FROM tenants t
CROSS JOIN customers c
WHERE t.slug = 'sadec-hub'
  AND c.business_name = 'Long Xuyên Boutique'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- DEMO INVOICES
-- ============================================================================
INSERT INTO invoices (tenant_id, client_id, invoice_number, amount, tax, total, status, issue_date, due_date, items, created_at)
SELECT
  t.id,
  c.id,
  'INV-2026-001',
  15000000,
  0,
  15000000,
  'sent',
  '2026-01-01'::date,
  '2026-01-15'::date,
  '[{"description": "Quảng cáo Facebook Q1 2026", "quantity": 1, "price": 15000000}]'::jsonb,
  NOW()
FROM tenants t
CROSS JOIN customers c
WHERE t.slug = 'sadec-hub'
  AND c.business_name = 'Sa Đéc Flower Shop'
ON CONFLICT DO NOTHING;

INSERT INTO invoices (tenant_id, client_id, invoice_number, amount, tax, total, status, issue_date, due_date, paid_at, items, created_at)
SELECT
  t.id,
  c.id,
  'INV-2025-056',
  8000000,
  0,
  8000000,
  'paid',
  '2025-12-01'::date,
  '2025-12-15'::date,
  '2025-12-14 10:30:00+07'::timestamptz,
  '[{"description": "Thiết kế logo", "quantity": 1, "price": 5000000}, {"description": "Bộ nhận diện thương hiệu", "quantity": 1, "price": 3000000}]'::jsonb,
  NOW()
FROM tenants t
CROSS JOIN customers c
WHERE t.slug = 'sadec-hub'
  AND c.business_name = 'Sa Đéc Flower Shop'
ON CONFLICT DO NOTHING;

INSERT INTO invoices (tenant_id, client_id, invoice_number, amount, tax, total, status, issue_date, due_date, paid_at, items, created_at)
SELECT
  t.id,
  c.id,
  'INV-2026-002',
  50000000,
  0,
  50000000,
  'sent',
  '2026-01-10'::date,
  '2026-01-25'::date,
  NULL,
  '[{"description": "Chiến dịch Tết 2026 - Full Package", "quantity": 1, "price": 50000000}]'::jsonb,
  NOW()
FROM tenants t
CROSS JOIN customers c
WHERE t.slug = 'sadec-hub'
  AND c.business_name = 'Khách sạn Riverside'
ON CONFLICT DO NOTHING;

INSERT INTO invoices (tenant_id, client_id, invoice_number, amount, tax, total, status, issue_date, due_date, paid_at, items, created_at)
SELECT
  t.id,
  c.id,
  'INV-2026-003',
  100000000,
  0,
  100000000,
  'paid',
  '2026-01-05'::date,
  '2026-01-20'::date,
  '2026-01-12 09:00:00+07'::timestamptz,
  '[{"description": "Full Digital Package 2026", "quantity": 1, "price": 100000000}]'::jsonb,
  NOW()
FROM tenants t
CROSS JOIN customers c
WHERE t.slug = 'sadec-hub'
  AND c.business_name = 'Đồng Tháp Rice Export'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- DEMO CONTACTS (Lead Form Submissions)
-- ============================================================================
INSERT INTO contacts (name, phone, email, business_name, service, message, status, created_at)
VALUES
  ('Trần Văn An', '0901 234 567', 'an@newbiz.vn', 'Công ty ABC', 'website', 'Cần tư vấn thiết kế website mới', 'new', '2026-01-15 08:30:00+07'),
  ('Nguyễn Thị Bình', '0912 345 678', 'binh@xyz.vn', 'Cửa hàng XYZ', 'ads', 'Quan tâm Facebook Ads', 'contacted', '2026-01-14 14:00:00+07'),
  ('Lê Công Cường', '0923 456 789', 'cuong@delta.vn', 'Delta Tech', 'seo', 'Cần SEO cho website hiện tại', 'qualified', '2026-01-13 09:15:00+07'),
  ('Phạm Hồng Đào', '0934 567 890', 'dao@fashion.vn', 'Đào Fashion', 'social', 'Quản lý social media', 'new', '2026-01-12 16:45:00+07'),
  ('Võ Thu Em', '0945 678 901', 'em@coffeeshop.vn', 'Em Coffee', 'branding', 'Thiết kế logo và branding', 'converted', '2026-01-10 11:00:00+07')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- REFRESH MATERIALIZED VIEWS
-- ============================================================================
SELECT refresh_dashboard_stats();

-- ============================================================================
-- SUMMARY
-- ============================================================================
SELECT '🚀 Seed Data V2 (Binh Pháp Sync) Complete!' AS status,
  (SELECT COUNT(*) FROM leads) as leads,
  (SELECT COUNT(*) FROM customers) as customers,
  (SELECT COUNT(*) FROM deals) as deals,
  (SELECT COUNT(*) FROM projects) as projects,
  (SELECT COUNT(*) FROM campaigns) as campaigns,
  (SELECT COUNT(*) FROM invoices) as invoices,
  (SELECT COUNT(*) FROM content_calendar) as content_items,
  (SELECT COUNT(*) FROM contacts) as contacts;

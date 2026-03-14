-- ================================================
-- MEKONG AGENCY - DEMO DATA SEED
-- Run this after schema.sql to populate test data
-- ================================================

-- ================================================
-- DEMO LEADS (8 leads with various statuses)
-- ================================================
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
WHERE t.slug = 'sadec-hub';

-- ================================================
-- DEMO CLIENTS (5 active clients)
-- ================================================
INSERT INTO clients (tenant_id, company_name, contact_name, email, phone, industry, status, created_at)
SELECT 
  t.id,
  c.company_name,
  c.contact_name,
  c.email,
  c.phone,
  c.industry,
  'active'::text,
  c.created_at::timestamptz
FROM tenants t
CROSS JOIN (VALUES
  ('Sa Đéc Flower Shop', 'Nguyễn Văn Hoa', 'hoa@sadecflower.vn', '0909 111 222', 'Bán lẻ', '2025-06-01 10:00:00+07'),
  ('Mekong Travel', 'Trần Bình Du', 'du@mekongtravel.vn', '0918 333 444', 'Du lịch', '2025-07-15 14:00:00+07'),
  ('Cần Thơ Foods', 'Lê Minh Ẩm', 'am@canthoofoods.vn', '0977 555 666', 'F&B', '2025-08-20 11:00:00+07'),
  ('Long Xuyên Boutique', 'Phạm Thị Thời', 'thoi@lxboutique.vn', '0933 777 888', 'Thời trang', '2025-09-10 09:00:00+07'),
  ('Khách sạn Riverside', 'Đặng Văn Long', 'long@riverside.vn', '0988 999 000', 'Khách sạn', '2025-10-05 16:00:00+07')
) AS c(company_name, contact_name, email, phone, industry, created_at)
WHERE t.slug = 'sadec-hub';

-- ================================================
-- DEMO PROJECTS (For each client)
-- ================================================
INSERT INTO projects (tenant_id, client_id, name, description, type, status, progress, budget, spent, start_date, end_date, created_at)
SELECT 
  c.tenant_id,
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
  now()
FROM clients c
JOIN tenants t ON c.tenant_id = t.id
CROSS JOIN LATERAL (VALUES
  ('Chiến dịch Facebook Ads Q1', 'Quảng cáo Facebook cho sản phẩm hoa tươi, target khách hàng 25-45 tuổi', 'ads', 'active', 75, 15000000, 11250000, '2026-01-01', '2026-03-31'),
  ('SEO Website 2026', 'Tối ưu SEO local cho website shop hoa', 'seo', 'active', 40, 5000000, 2000000, '2026-01-01', '2026-12-31')
) AS p(name, description, type, status, progress, budget, spent, start_date, end_date)
WHERE c.company_name = 'Sa Đéc Flower Shop';

-- Add more projects for other clients
INSERT INTO projects (tenant_id, client_id, name, description, type, status, progress, budget, spent, start_date, end_date, created_at)
SELECT 
  c.tenant_id,
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
  now()
FROM clients c WHERE c.company_name = 'Mekong Travel';

INSERT INTO projects (tenant_id, client_id, name, description, type, status, progress, budget, spent, start_date, end_date, created_at)
SELECT 
  c.tenant_id,
  c.id,
  'Social Media Management',
  'Quản lý Fanpage và nội dung social',
  'social',
  'active',
  25,
  3000000,
  750000,
  '2026-01-01'::date,
  '2026-01-31'::date,
  now()
FROM clients c WHERE c.company_name = 'Cần Thơ Foods';

-- ================================================
-- DEMO CAMPAIGNS (Linked to projects)
-- ================================================
INSERT INTO campaigns (tenant_id, client_id, project_id, name, platform, type, status, budget, spent, start_date, end_date, metrics, created_at)
SELECT 
  p.tenant_id,
  p.client_id,
  p.id,
  'Facebook Ads - Q1 2026',
  'facebook',
  'conversions',
  'active',
  15000000,
  11250000,
  '2026-01-01'::date,
  '2026-03-31'::date,
  '{"impressions": 125000, "clicks": 4500, "leads": 234, "conversions": 89, "roi": 12.5}'::jsonb,
  now()
FROM projects p WHERE p.name = 'Chiến dịch Facebook Ads Q1';

INSERT INTO campaigns (tenant_id, client_id, project_id, name, platform, type, status, budget, spent, start_date, end_date, metrics, created_at)
SELECT 
  p.tenant_id,
  p.client_id,
  p.id,
  'Google Ads - Search',
  'google',
  'leads',
  'active',
  20000000,
  14000000,
  '2026-01-01'::date,
  '2026-02-28'::date,
  '{"impressions": 89000, "clicks": 3200, "leads": 156, "conversions": 67, "roi": 8.2}'::jsonb,
  now()
FROM projects p WHERE p.name = 'Google Ads - Travel Campaign';

INSERT INTO campaigns (tenant_id, client_id, name, platform, type, status, budget, spent, start_date, end_date, metrics, created_at)
SELECT 
  t.id,
  c.id,
  'Zalo OA Marketing',
  'zalo',
  'engagement',
  'active',
  8000000,
  5440000,
  '2026-01-01'::date,
  '2026-01-31'::date,
  '{"impressions": 45000, "clicks": 2100, "leads": 89, "conversions": 34, "roi": 6.8}'::jsonb,
  now()
FROM clients c
JOIN tenants t ON c.tenant_id = t.id
WHERE c.company_name = 'Cần Thơ Foods';

INSERT INTO campaigns (tenant_id, client_id, name, platform, type, status, budget, spent, start_date, end_date, metrics, created_at)
SELECT 
  t.id,
  c.id,
  'TikTok Awareness',
  'tiktok',
  'awareness',
  'active',
  12000000,
  6500000,
  '2026-01-05'::date,
  '2026-02-05'::date,
  '{"impressions": 230000, "clicks": 8900, "leads": 67, "conversions": 23, "roi": 5.4}'::jsonb,
  now()
FROM clients c
JOIN tenants t ON c.tenant_id = t.id
WHERE c.company_name = 'Long Xuyên Boutique';

-- ================================================
-- DEMO INVOICES
-- ================================================
INSERT INTO invoices (tenant_id, client_id, project_id, invoice_number, amount, tax, total, status, issue_date, due_date, items, created_at)
SELECT 
  p.tenant_id,
  p.client_id,
  p.id,
  'INV-2026-001',
  15000000,
  0,
  15000000,
  'sent',
  '2026-01-01'::date,
  '2026-01-15'::date,
  '[{"description": "Quảng cáo Facebook Q1 2026", "quantity": 1, "price": 15000000}]'::jsonb,
  now()
FROM projects p WHERE p.name = 'Chiến dịch Facebook Ads Q1';

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
  now()
FROM clients c
JOIN tenants t ON c.tenant_id = t.id
WHERE c.company_name = 'Sa Đéc Flower Shop';

INSERT INTO invoices (tenant_id, client_id, invoice_number, amount, tax, total, status, issue_date, due_date, paid_at, items, created_at)
SELECT 
  t.id,
  c.id,
  'INV-2025-055',
  5000000,
  0,
  5000000,
  'paid',
  '2025-12-01'::date,
  '2025-12-15'::date,
  '2025-12-10 14:00:00+07'::timestamptz,
  '[{"description": "SEO Website tháng 12/2025", "quantity": 1, "price": 5000000}]'::jsonb,
  now()
FROM clients c
JOIN tenants t ON c.tenant_id = t.id
WHERE c.company_name = 'Sa Đéc Flower Shop';

-- ================================================
-- DEMO ACTIVITIES (Recent activity log)
-- ================================================
INSERT INTO activities (tenant_id, entity_type, entity_id, action, description, created_at)
SELECT 
  t.id,
  'lead',
  l.id,
  'created',
  'Lead mới từ Facebook: ' || l.name,
  l.created_at
FROM leads l
JOIN tenants t ON l.tenant_id = t.id
LIMIT 5;

INSERT INTO activities (tenant_id, entity_type, entity_id, action, description, created_at)
SELECT 
  t.id,
  'campaign',
  c.id,
  'updated',
  'Chiến dịch Facebook đạt 1000 leads',
  now() - interval '2 hours'
FROM tenants t 
JOIN campaigns c ON c.tenant_id = t.id
WHERE t.slug = 'sadec-hub'
LIMIT 1;

INSERT INTO activities (tenant_id, entity_type, entity_id, action, description, created_at)
SELECT 
  t.id,
  'invoice',
  i.id,
  'paid',
  'Hóa đơn INV-2025-056 đã thanh toán',
  now() - interval '1 day'
FROM tenants t 
JOIN invoices i ON i.tenant_id = t.id
WHERE t.slug = 'sadec-hub'
LIMIT 1;

-- ================================================
-- SUMMARY
-- ================================================
-- Data created:
-- • 8 Leads (various statuses: new, contacted, qualified, won)
-- • 5 Clients (active businesses in Mekong region)
-- • 4 Projects (ads, seo, social campaigns)
-- • 4 Campaigns (Facebook, Google, Zalo, TikTok)
-- • 3 Invoices (sent, paid statuses)
-- • 7 Activity logs

SELECT 
  'Demo data created successfully!' as message,
  (SELECT count(*) FROM leads) as leads,
  (SELECT count(*) FROM clients) as clients,
  (SELECT count(*) FROM projects) as projects,
  (SELECT count(*) FROM campaigns) as campaigns,
  (SELECT count(*) FROM invoices) as invoices;
